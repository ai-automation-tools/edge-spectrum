/**
 * Semantic guard for the backtest engine. `check:market` only holds the ROI
 * band, which the defects below all passed: rest days and streaks computed out
 * of date order, an asymmetric streak rule, betting past a busted bankroll and
 * a drawdown measured against the wrong peak (audit BUG-01 to BUG-04).
 */
import assert from 'node:assert/strict';
import { generateGamesDatabase, nextStreak, PROFIT_HISTORY_LIMIT, runBacktest } from '../src/dataGenerator';
import { ledgerCsv } from '../src/ledgerCsv';
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

// The largest run ships a thinned equity curve that still starts and ends on
// the true bankroll, under a response budget (audit PERF-02).
{
  const big = runBacktest({ ...base, sport: 'MLB', sideSelection: 'home', startingBankroll: 10_000_000 });
  const { summary, profitHistory } = big;
  assert.equal(summary.totalBets, 20800);
  assert.ok(profitHistory.length <= PROFIT_HISTORY_LIMIT, `${profitHistory.length} points`);
  assert.equal(profitHistory[0].index, 1);
  assert.equal(profitHistory.at(-1)!.index, summary.totalBets);
  assert.equal(profitHistory.at(-1)!.currentBankroll, summary.finalBankroll);
  const bytes = JSON.stringify(big).length;
  assert.ok(bytes <= 300_000, `largest response is ${bytes} bytes, budget 300,000`);

  // The CSV download: one row per wager, the same run the server summarised, ending on its bankroll (PROD-06).
  const strategy = { ...base, sport: 'MLB', sideSelection: 'home', startingBankroll: 10_000_000 } as Strategy;
  const csv = ledgerCsv(runBacktest(strategy, Infinity).gamesPreview).trimEnd().split('\n');
  assert.equal(csv.length - 1, summary.totalBets, 'CSV rows vs totalBets');
  assert.equal(Number(csv.at(-1)!.split(',').at(-1)), summary.finalBankroll, 'CSV ends on the final bankroll');
}

// A favourite is the favourite of the market being bet: the side laying points
// on a spread, the shorter price on a moneyline, and nobody when the prices are
// level (audit BUG-26). Read back from the ledger the page shows.
let ledgerRows = 0;
for (const sport of SPORTS) {
  for (const sideSelection of ['favorites', 'underdogs', 'home_favorites', 'away_underdogs'] as const) {
    const wantsFav = sideSelection !== 'underdogs' && sideSelection !== 'away_underdogs';
    const ledger = (betType: Strategy['betType']) => runBacktest({
      ...base, sport, betType, sideSelection, startYear: 2019, endYear: 2020, startingBankroll: 1e9,
    }).gamesPreview;
    for (const row of ledger('spread')) {
      const line = Number(/ (-?[\d.]+)(?: \(|$)/.exec(row.betPlaced)?.[1]);
      assert.ok(wantsFav ? line < 0 : line > 0, `${sport} spread ${sideSelection}: ${row.betPlaced}`);
      ledgerRows++;
    }
    for (const row of ledger('moneyline')) {
      const home = row.betPlaced.startsWith(row.homeTeam);
      const [mine, theirs] = home ? [row.homeMoneyline, row.awayMoneyline] : [row.awayMoneyline, row.homeMoneyline];
      assert.ok(wantsFav ? mine < theirs : mine > theirs, `${sport} moneyline ${sideSelection}: ${row.betPlaced} at ${mine} v ${theirs}`);
      ledgerRows++;
    }
  }
}
assert.ok(ledgerRows > 5000, `only ${ledgerRows} ledger rows read`);

console.log(`Engine check passed: ${games} games in date order with replayable streaks; bust and drawdown hold; ${ledgerRows} favourite and underdog bets on the right side; the CSV ledger has one row per wager.`);
