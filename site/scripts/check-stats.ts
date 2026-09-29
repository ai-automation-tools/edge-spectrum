/**
 * Self-check for src/stats.ts and the significance fields runBacktest() puts
 * on the summary. Run: npm run check:stats
 */
import assert from 'node:assert/strict';
import { breakevenRate, wilsonInterval, binomialUpperTail } from '../src/stats';
import { americanToDecimal } from '../src/odds';
import { runBacktest } from '../src/dataGenerator';
import type { Strategy } from '../src/types';

const near = (a: number, b: number, eps = 1e-6) =>
  assert.ok(Math.abs(a - b) < eps, `expected ${a} ≈ ${b}`);

// ── Breakeven ── -110 both ways is the textbook 52.38%.
const m110 = americanToDecimal(-110);
near(breakevenRate([m110, m110]), 110 / 210);
near(breakevenRate([2, 2, 2]), 0.5);
assert.equal(breakevenRate([]), 0);

// ── Wilson ──
const [lo, hi] = wilsonInterval(50, 100);
near(lo, 0.40383, 1e-4);
near(hi, 0.59617, 1e-4);
assert.deepEqual(wilsonInterval(0, 0), [0, 1]);
assert.equal(wilsonInterval(0, 10)[0], 0);
assert.ok(wilsonInterval(10, 10)[1] <= 1);

// ── Exact binomial tail ──
near(binomialUpperTail(8, 10, 0.5), 56 / 1024, 1e-12); // C(10,8)+C(10,9)+C(10,10)
assert.equal(binomialUpperTail(0, 10, 0.3), 1);
assert.equal(binomialUpperTail(11, 10, 0.3), 0);
near(binomialUpperTail(10, 20, 0.5) + binomialUpperTail(11, 20, 0.5), 1, 1e-12); // P(X≥11) = P(X≤9)
// Large n stays finite and agrees with the normal approximation.
const big = binomialUpperTail(5300, 10000, 0.5238);
assert.ok(big > 0.08 && big < 0.12, `n=10000 tail ${big}`); // z ≈ 1.24 → ~0.107
assert.ok(binomialUpperTail(6000, 10000, 0.5238) < 1e-40);
// The case §4 of the improvement plan names: 54% over 300 bets at -110 is noise.
assert.ok(binomialUpperTail(162, 300, 110 / 210) > 0.05);

// ── Engine wiring ── the verdict must agree with the money.
const base: Strategy = {
  sport: 'NFL', startYear: 2020, endYear: 2024, betType: 'spread', sideSelection: 'home',
  streakFilter: 'any', unitSize: 100, startingBankroll: 10000,
};
const cases: Strategy[] = [
  base,
  { ...base, streakFilter: 'hot_streak_3plus' }, // the +5.52% / 85-bet fixture from Actions 2.4 and 3.1
  { ...base, sport: 'NBA', betType: 'moneyline', sideSelection: 'underdogs', startYear: 2000, endYear: 2025 },
  { ...base, sport: 'MLB', betType: 'totals', sideSelection: 'over' },
];
for (const strategy of cases) {
  const s = runBacktest(strategy).summary;
  const label = `${s.sport} ${strategy.betType}/${strategy.sideSelection}/${strategy.streakFilter}`;
  assert.ok(s.roi !== 0, `${label}: zero ROI, pick another fixture`);
  assert.equal(s.winRate > s.breakevenWinRate, s.roi > 0, `${label}: win rate vs breakeven disagrees with ROI sign`);
  assert.ok(s.winRateLow <= s.winRate && s.winRate <= s.winRateHigh, `${label}: CI excludes the point estimate`);
  assert.ok(s.pValue >= 0 && s.pValue <= 1, `${label}: p-value out of range`);
  assert.equal(s.pValue < 0.5, s.roi > 0, `${label}: p-value on the wrong side of 0.5`);
  console.log(
    `${label.padEnd(40)} n=${String(s.totalBets).padStart(5)}  win ${s.winRate.toFixed(2)}%  ` +
    `be ${s.breakevenWinRate.toFixed(2)}%  CI ${s.winRateLow.toFixed(2)}–${s.winRateHigh.toFixed(2)}%  ` +
    `roi ${s.roi.toFixed(2)}%  p=${s.pValue.toPrecision(3)}`,
  );
}

console.log('check:stats OK');
