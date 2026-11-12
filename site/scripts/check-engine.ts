/**
 * Semantic guard for the backtest engine. `check:market` only holds the ROI
 * band, which the defects below all passed: rest days and streaks computed out
 * of date order, an asymmetric streak rule, betting past a busted bankroll and
 * a drawdown measured against the wrong peak (audit BUG-01 to BUG-04).
 */
import assert from 'node:assert/strict';
import { generateGamesDatabase, nextStreak, runBacktest } from '../src/dataGenerator';
import { MAX_SEASON, MIN_SEASON, SPORTS } from '../src/strategyBounds';
import type { Strategy } from '../src/types';

// Streak rule: a result against the run starts a new run.
const run = (results: string) => [...results].reduce((s, r) => nextStreak(s, r === 'W'), 0);
assert.equal(run('LLW'), 1);
assert.equal(run('WWL'), -1);
assert.equal(run('WWW'), 3);
assert.equal(run('LLL'), -3);

// Every season: dates in order, no negative rest, one game per team per day,
// and the stored streak equal to a replay of that team's earlier results.
let games = 0;
for (const sport of SPORTS) {
  for (let year = MIN_SEASON; year <= MAX_SEASON; year++) {
    const streak: Record<string, number> = {};
    const lastDate: Record<string, string> = {};
    let previous = '';
    for (const g of generateGamesDatabase(sport, year)) {
      const where = `${g.id} ${g.date}`;
      assert.ok(g.date >= previous, `${where}: out of date order`);
      previous = g.date;
      assert.ok(g.homeRestDays >= 0 && g.awayRestDays >= 0, `${where}: negative rest`);
      for (const [team, stored] of [[g.homeTeam, g.homeWinStreak], [g.awayTeam, g.awayWinStreak]] as const) {
        assert.notEqual(lastDate[team], g.date, `${where}: ${team} plays twice`);
        assert.equal(stored, streak[team] ?? 0, `${where}: ${team} streak`);
        lastDate[team] = g.date;
      }
      const homeWon = g.homeScore > g.awayScore;
      streak[g.homeTeam] = nextStreak(streak[g.homeTeam] ?? 0, homeWon);
      streak[g.awayTeam] = nextStreak(streak[g.awayTeam] ?? 0, !homeWon);
      games++;
    }
  }
}

const base: Strategy = {
  sport: 'NFL', startYear: MIN_SEASON, endYear: MAX_SEASON, betType: 'moneyline',
  sideSelection: 'underdogs', streakFilter: 'any', unitSize: 100, startingBankroll: 1000,
};

// A run that goes bust stops there.
const bust = runBacktest(base).summary;
assert.ok(bust.bustedAtBet !== undefined && bust.bustedOn, 'a 10-unit bankroll on NFL underdogs busts');
assert.equal(bust.totalBets, bust.bustedAtBet);
assert.ok(bust.finalBankroll >= 0 && bust.finalBankroll < base.unitSize);
assert.ok(bust.maxDrawdownPercent <= 100);

// A run that survives reports no bust, and its drawdown % matches a replay of
// the equity curve against the peak in force at each bet.
for (const sideSelection of ['favorites', 'underdogs'] as const) {
  const { summary, profitHistory } = runBacktest({
    ...base, betType: 'spread', sideSelection, startYear: 2005, endYear: 2009, startingBankroll: 10000,
  });
  assert.equal(summary.bustedAtBet, undefined);
  let peak = 10000;
  let worst = 0;
  for (const p of profitHistory) {
    peak = Math.max(peak, p.currentBankroll);
    worst = Math.max(worst, (peak - p.currentBankroll) / peak);
  }
  assert.ok(Math.abs(summary.maxDrawdownPercent - worst * 100) < 0.01, `drawdown ${summary.maxDrawdownPercent} vs replay ${worst * 100}`);
}

console.log(`Engine check passed: ${games} games in date order with replayable streaks; bust and drawdown hold.`);
