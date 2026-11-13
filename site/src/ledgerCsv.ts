import type { SimulatedBetGame } from './types';

/** Column name, then how to read it off a wager. */
const COLUMNS: Array<[string, (g: SimulatedBetGame) => string | number]> = [
  ['date', (g) => g.date],
  ['season', (g) => g.season],
  ['sport', (g) => g.sport],
  ['matchup', (g) => g.matchup],
  ['home_score', (g) => g.homeScore],
  ['away_score', (g) => g.awayScore],
  ['home_spread', (g) => g.homeSpread],
  ['over_under', (g) => g.overUnder],
  ['home_moneyline', (g) => g.homeMoneyline],
  ['away_moneyline', (g) => g.awayMoneyline],
  ['bet', (g) => g.betPlaced],
  ['odds_decimal', (g) => g.oddsDecimal],
  ['stake', (g) => g.stake],
  ['return', (g) => g.returnVal],
  ['net', (g) => g.netResult],
  ['status', (g) => g.status],
  ['bankroll', (g) => g.bankroll],
];

const cell = (v: string | number) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));

/** One row per wager, oldest first, with the bankroll after each (audit PROD-06). */
export function ledgerCsv(games: readonly SimulatedBetGame[]): string {
  return [COLUMNS.map(([name]) => name).join(','), ...games.map((g) => COLUMNS.map(([, get]) => cell(get(g))).join(','))].join('\n') + '\n';
}
