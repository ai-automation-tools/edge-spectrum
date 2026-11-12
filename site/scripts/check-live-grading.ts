/**
 * Self-check for src/liveGrading.ts: selection x outcome for the ESPN
 * scoreboard panel, the favourite read from numbers and not from team names,
 * and the day label under several time zones.
 * Run: npm run check:live-grading
 */
import assert from 'node:assert/strict';
import { gradeBet, favouriteSide, scoreboardDate, toScoreboardDay, type LiveGame } from '../src/liveGrading';
import { parseEspnScoreboard } from '../src/server/espn';
import { DEFAULT_STRATEGY } from '../src/strategyUrl';
import type { Strategy } from '../src/types';

const strat = (over: Partial<Strategy>): Strategy =>
  ({ ...DEFAULT_STRATEGY, oddsMin: undefined, oddsMax: undefined, spreadMin: undefined, spreadMax: undefined,
     totalMin: undefined, totalMax: undefined, streakFilter: 'any', ...over });

/** Home is SA, away is SAC: the old substring match called SA the favourite on "SAC -3.5". */
const game = (homeScore: number | null, awayScore: number | null, homeSpread: number | null, over: Partial<LiveGame> = {}): LiveGame => ({
  completed: true,
  homeTeam: { abbrev: 'SA', score: homeScore },
  awayTeam: { abbrev: 'SAC', score: awayScore },
  odds: {
    overUnder: 220.5, spread: homeSpread,
    spreadOdds: { home: -110, away: -110 },
    moneyline: homeSpread === null ? { home: null, away: null } : homeSpread < 0 ? { home: -160, away: 135 } : { home: 135, away: -160 },
  },
  ...over,
});

// ── Favourite comes from the home spread's sign, then the moneyline ──
assert.equal(favouriteSide(game(0, 0, 3.5).odds), 'away'); // "SAC -3.5": away, not SA
assert.equal(favouriteSide(game(0, 0, -3.5).odds), 'home');
assert.equal(favouriteSide({ overUnder: null, spread: 0, moneyline: { home: -120, away: 100 } }), 'home');
assert.equal(favouriteSide({ overUnder: null, spread: null, moneyline: { home: null, away: null } }), null);
assert.equal(favouriteSide({ overUnder: null, spread: 0, moneyline: { home: -110, away: -110 } }), null);

// ── Selection x outcome. Away (SAC) is a 3.5-point favourite. ──
type Row = [Strategy['betType'], Strategy['sideSelection'], number, number, string, string];
const rows: Row[] = [
  // betType, selection, home, away, status, bet
  ['moneyline', 'home', 110, 100, 'win', 'SA ML'],
  ['moneyline', 'home', 100, 110, 'loss', 'SA ML'],
  ['moneyline', 'away', 100, 110, 'win', 'SAC ML'],
  ['moneyline', 'favorites', 100, 110, 'win', 'SAC ML'],
  ['moneyline', 'favorites', 110, 100, 'loss', 'SAC ML'],
  ['moneyline', 'underdogs', 110, 100, 'win', 'SA ML'],
  ['moneyline', 'home_underdogs', 110, 100, 'win', 'SA ML'],
  ['moneyline', 'away_favorites', 110, 100, 'loss', 'SAC ML'],
  ['moneyline', 'home_favorites', 110, 100, 'no_bet', ''],
  ['moneyline', 'away_underdogs', 110, 100, 'no_bet', ''],
  ['moneyline', 'home', 100, 100, 'push', 'SA ML'],
  ['spread', 'home', 100, 103, 'win', 'SA +3.5'],   // loses by 3, gets 3.5
  ['spread', 'home', 100, 104, 'loss', 'SA +3.5'],
  ['spread', 'away', 100, 104, 'win', 'SAC -3.5'],
  ['spread', 'away', 100, 103, 'loss', 'SAC -3.5'],
  ['spread', 'favorites', 100, 104, 'win', 'SAC -3.5'],
  ['spread', 'underdogs', 100, 103, 'win', 'SA +3.5'],
  ['spread', 'home_underdogs', 100, 104, 'loss', 'SA +3.5'],
  ['spread', 'away_favorites', 100, 110, 'win', 'SAC -3.5'],
  ['spread', 'home_favorites', 100, 110, 'no_bet', ''],
  ['spread', 'away_underdogs', 100, 110, 'no_bet', ''],
  ['totals', 'over', 111, 110, 'win', 'Over 220.5'],
  ['totals', 'over', 110, 110, 'loss', 'Over 220.5'],
  ['totals', 'under', 110, 110, 'win', 'Under 220.5'],
  ['totals', 'under', 111, 110, 'loss', 'Under 220.5'],
  ['totals', 'home', 111, 110, 'no_bet', ''],
  ['spread', 'over', 111, 110, 'no_bet', ''],
];
for (const [betType, sideSelection, home, away, status, bet] of rows) {
  const g = gradeBet(strat({ betType, sideSelection }), game(home, away, 3.5));
  assert.equal(g.status, status, `${betType}/${sideSelection} ${home}-${away}: ${g.detail}`);
  assert.equal(g.betPlaced, bet, `${betType}/${sideSelection} label`);
}

// Whole-number lines push.
assert.equal(gradeBet(strat({ betType: 'spread', sideSelection: 'home' }), game(100, 103, 3)).status, 'push');
assert.equal(gradeBet(strat({ betType: 'totals', sideSelection: 'over' }), game(110, 110, 3, {
  odds: { overUnder: 220, spread: 3 },
})).status, 'push');

// ── What the scoreboard cannot answer says so, instead of "no trigger" ──
for (const sideSelection of ['after_win', 'after_loss', 'hot_streak', 'cold_streak', 'rest_advantage', 'rest_disadvantage'] as const) {
  assert.equal(gradeBet(strat({ betType: 'moneyline', sideSelection }), game(110, 100, 3.5)).status, 'not_evaluated', sideSelection);
}
assert.equal(gradeBet(strat({ betType: 'moneyline', sideSelection: 'home', streakFilter: 'after_win' }), game(110, 100, 3.5)).status, 'not_evaluated');
assert.equal(gradeBet(strat({ betType: 'moneyline', sideSelection: 'home' }), game(null, 100, 3.5)).status, 'not_evaluated');
assert.equal(gradeBet(strat({ betType: 'totals', sideSelection: 'over', oddsMin: -120 }), game(111, 110, 3.5)).status, 'not_evaluated');
assert.equal(gradeBet(strat({ betType: 'moneyline', sideSelection: 'home', oddsMin: 100 }), game(110, 100, null)).status, 'not_evaluated');

// ── Filters the scoreboard can answer ──
const dog = { betType: 'moneyline', sideSelection: 'underdogs' } as const; // SA at +135
assert.equal(gradeBet(strat({ ...dog, oddsMin: 120, oddsMax: 350 }), game(110, 100, 3.5)).status, 'win');
assert.equal(gradeBet(strat({ ...dog, oddsMin: 150 }), game(110, 100, 3.5)).status, 'no_bet');
assert.equal(gradeBet(strat({ betType: 'spread', sideSelection: 'home', spreadMin: 4 }), game(100, 103, 3.5)).status, 'no_bet');
assert.equal(gradeBet(strat({ betType: 'spread', sideSelection: 'home', spreadMax: 4 }), game(100, 103, 3.5)).status, 'win');
assert.equal(gradeBet(strat({ betType: 'totals', sideSelection: 'over', totalMax: 200 }), game(111, 110, 3.5)).status, 'no_bet');
assert.equal(gradeBet(strat({ betType: 'spread', sideSelection: 'home' }), game(100, 103, null)).status, 'no_bet');
assert.equal(gradeBet(strat({ betType: 'moneyline', sideSelection: 'favorites' }), game(100, 103, null)).status, 'no_bet');

// ── Finished means ESPN says completed, whatever the status is called ──
const home = strat({ betType: 'moneyline', sideSelection: 'home' });
assert.equal(gradeBet(home, game(110, 100, 3.5, { completed: false })).status, 'pending');
assert.equal(gradeBet(home, game(110, 100, 3.5, { completed: true, status: 'STATUS_FINAL_OT' })).status, 'win');
assert.equal(gradeBet(home, game(110, 100, 3.5, { completed: undefined, status: 'STATUS_FINAL' })).status, 'win'); // older payload

// ── Through the real parser: unreadable scores are null, postponed is not finished ──
const event = (id: string, type: object, homeScore: unknown, awayScore: unknown) => ({
  id, date: '2026-11-11T00:00Z', status: { type },
  competitions: [{
    competitors: [
      { homeAway: 'home', score: homeScore, team: { abbreviation: 'SA', displayName: 'Spurs' } },
      { homeAway: 'away', score: awayScore, team: { abbreviation: 'SAC', displayName: 'Kings' } },
    ],
    odds: [{ details: 'SAC -3.5', spread: 3.5, overUnder: 220.5 }],
  }],
});
const parsed = parseEspnScoreboard({ events: [
  event('1', { name: 'STATUS_FINAL', state: 'post', completed: true }, '100', '104'),
  event('2', { name: 'STATUS_POSTPONED', state: 'post', completed: false }, '0', '0'),
  event('3', { name: 'STATUS_FINAL', state: 'post', completed: true }, 'x', undefined),
] }, 'NBA').games;
assert.equal(gradeBet(strat({ betType: 'spread', sideSelection: 'favorites' }), parsed[0]).status, 'win');
assert.equal(gradeBet(home, parsed[1]).status, 'pending');
assert.deepEqual([parsed[2].homeTeam.score, parsed[2].awayTeam.score], [null, null]);
assert.equal(gradeBet(home, parsed[2]).status, 'not_evaluated');

// ── The day label is the requested day in every zone ──
for (const tz of ['America/Los_Angeles', 'UTC', 'Asia/Tokyo', 'Australia/Brisbane']) {
  process.env.TZ = tz;
  const d = scoreboardDate('20261111')!;
  assert.deepEqual([d.getFullYear(), d.getMonth(), d.getDate()], [2026, 10, 11], tz);
  assert.equal(toScoreboardDay(d), '20261111', tz);
  d.setDate(d.getDate() + 1);
  assert.equal(toScoreboardDay(d), '20261112', tz);
}
assert.equal(scoreboardDate(''), null);
assert.equal(scoreboardDate('2026-11-11'), null);

console.log(`Live grading check passed: ${rows.length} selection x outcome rows, filters, parser and time zones.`);
