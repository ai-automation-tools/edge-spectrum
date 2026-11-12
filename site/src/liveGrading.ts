/**
 * Grades the current strategy against one game from the ESPN scoreboard
 * proxy. Pure, so `scripts/check-live-grading.ts` can table-test it.
 *
 * The scoreboard carries a line, a total, prices and a score. It carries no
 * streaks and no rest days, so selections and filters that need those are
 * reported as `not_evaluated` rather than as a bet that did not trigger.
 */
import type { Strategy } from './types';

interface LiveTeam {
  abbrev: string;
  score: number | null;
}

export interface LiveGame {
  status?: string;
  /** ESPN's own "this game is over" flag. Postponed games are `post` but not completed. */
  completed?: boolean;
  homeTeam: LiveTeam;
  awayTeam: LiveTeam;
  odds: {
    overUnder: number | null;
    /** The home team's spread: negative means the home team is favoured. */
    spread: number | null;
    spreadOdds?: { home: number | null; away: number | null };
    moneyline?: { home: number | null; away: number | null };
  };
}

export interface Grade {
  status: 'pending' | 'no_bet' | 'not_evaluated' | 'win' | 'loss' | 'push';
  betPlaced: string;
  detail: string;
}

type Side = 'home' | 'away';

const grade = (status: Grade['status'], detail: string, betPlaced = ''): Grade => ({ status, betPlaced, detail });
const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`);
const outcome = (diff: number): Grade['status'] => (diff > 0 ? 'win' : diff < 0 ? 'loss' : 'push');

/** The favoured side from the numbers, never from team names. A pick'em has none. */
export function favouriteSide(odds: LiveGame['odds']): Side | null {
  if (odds.spread) return odds.spread < 0 ? 'home' : 'away';
  const { home, away } = odds.moneyline ?? { home: null, away: null };
  if (home === null || away === null || home === away) return null;
  return home < away ? 'home' : 'away';
}

/** Which team the selection backs, `null` when the game does not qualify. */
function pickSide(selection: Strategy['sideSelection'], fav: Side | null): Side | null {
  const dog: Side | null = fav === null ? null : fav === 'home' ? 'away' : 'home';
  switch (selection) {
    case 'home': return 'home';
    case 'away': return 'away';
    case 'favorites': return fav;
    case 'underdogs': return dog;
    case 'home_favorites': return fav === 'home' ? 'home' : null;
    case 'away_favorites': return fav === 'away' ? 'away' : null;
    case 'home_underdogs': return dog === 'home' ? 'home' : null;
    case 'away_underdogs': return dog === 'away' ? 'away' : null;
    default: return null;
  }
}

const NEEDS_HISTORY = new Set<Strategy['sideSelection']>([
  'after_win', 'after_loss', 'hot_streak', 'cold_streak', 'rest_advantage', 'rest_disadvantage',
]);

export function gradeBet(strategy: Strategy, game: LiveGame): Grade {
  const finished = game.completed ?? game.status === 'STATUS_FINAL';
  if (!finished) return grade('pending', 'Game has not finished');

  const { betType, sideSelection } = strategy;
  if (NEEDS_HISTORY.has(sideSelection)) {
    return grade('not_evaluated', 'This selection needs streak or rest data, which the scoreboard does not carry');
  }
  if (strategy.streakFilter !== 'any') {
    return grade('not_evaluated', 'The streak filter needs data the scoreboard does not carry');
  }

  const home = game.homeTeam.score;
  const away = game.awayTeam.score;
  if (home === null || away === null) return grade('not_evaluated', 'The scoreboard has no score for this game');

  const hasOddsFilter = strategy.oddsMin !== undefined || strategy.oddsMax !== undefined;
  const priceFails = (price: number) =>
    (strategy.oddsMin !== undefined && price < strategy.oddsMin) ||
    (strategy.oddsMax !== undefined && price > strategy.oddsMax);
  const outside = (value: number, min?: number, max?: number) =>
    (min !== undefined && value < min) || (max !== undefined && value > max);

  if (betType === 'totals') {
    if (sideSelection !== 'over' && sideSelection !== 'under') return grade('no_bet', 'A totals bet takes over or under');
    const line = game.odds.overUnder;
    if (line === null) return grade('no_bet', 'No total was posted');
    if (outside(line, strategy.totalMin, strategy.totalMax)) return grade('no_bet', 'The total is outside your range');
    if (hasOddsFilter) return grade('not_evaluated', 'The odds filter needs the price on the total, which is not read here');
    const diff = sideSelection === 'over' ? home + away - line : line - (home + away);
    return grade(outcome(diff), `Combined score ${home + away}`, `${sideSelection === 'over' ? 'Over' : 'Under'} ${line}`);
  }

  if (sideSelection === 'over' || sideSelection === 'under') return grade('no_bet', 'Over and under apply to totals only');
  const side = pickSide(sideSelection, favouriteSide(game.odds));
  if (!side) return grade('no_bet', 'No favourite on the board, or the game does not match your selection');
  const team = side === 'home' ? game.homeTeam.abbrev : game.awayTeam.abbrev;
  const margin = side === 'home' ? home - away : away - home;

  if (betType === 'moneyline') {
    if (hasOddsFilter) {
      const price = game.odds.moneyline?.[side] ?? null;
      if (price === null) return grade('not_evaluated', 'The odds filter needs a moneyline price, and none was posted');
      if (priceFails(price)) return grade('no_bet', 'The price is outside your odds range');
    }
    return grade(outcome(margin), `Final margin ${signed(margin)}`, `${team} ML`);
  }

  const homeSpread = game.odds.spread;
  if (homeSpread === null) return grade('no_bet', 'No spread was posted');
  if (outside(Math.abs(homeSpread), strategy.spreadMin, strategy.spreadMax)) {
    return grade('no_bet', 'The spread is outside your range');
  }
  if (hasOddsFilter) {
    const price = game.odds.spreadOdds?.[side] ?? null;
    if (price === null) return grade('not_evaluated', 'The odds filter needs a spread price, and none was posted');
    if (priceFails(price)) return grade('no_bet', 'The price is outside your odds range');
  }
  const line = side === 'home' ? homeSpread : -homeSpread;
  return grade(outcome(margin + line), `Final margin ${signed(margin)}`, `${team} ${signed(line)}`);
}

/**
 * A scoreboard day (`YYYYMMDD`) as a local date. `new Date('2026-11-11')` is
 * midnight UTC, which is the day before for anyone west of Greenwich.
 */
export function scoreboardDate(raw: string): Date | null {
  const m = /^(\d{4})(\d{2})(\d{2})$/.exec(raw);
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
}

export function toScoreboardDay(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}
