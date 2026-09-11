/**
 * Self-check for src/odds.ts — conversions round-trip, de-vig outputs sum to
 * one, and each method behaves the way its theory says it should.
 * Run: npm run check:odds
 */
import assert from 'node:assert/strict';
import {
  americanToDecimal, decimalToAmerican, decimalToFractional,
  parseOdds, formatOdds, devig,
} from '../src/odds';

const near = (a: number, b: number, eps = 1e-6) =>
  assert.ok(Math.abs(a - b) < eps, `expected ${a} ≈ ${b}`);

// ── Conversions ──
near(americanToDecimal(-110), 1 + 100 / 110);
near(americanToDecimal(+150), 2.5);
near(decimalToAmerican(2.5), 150);
near(decimalToAmerican(1.5), -200);
assert.deepEqual(decimalToFractional(1 + 100 / 110), [10, 11]);
assert.deepEqual(decimalToFractional(2.5), [3, 2]);
assert.deepEqual(decimalToFractional(2), [1, 1]);

for (const a of [-110, -250, +100, +425]) // -100 canonicalizes to +100
  near(decimalToAmerican(americanToDecimal(a)), a);

assert.equal(parseOdds('-110', 'american'), americanToDecimal(-110));
assert.equal(parseOdds('+150', 'american'), 2.5);
assert.equal(parseOdds('-50', 'american'), null);
assert.equal(parseOdds('1.909', 'decimal'), 1.909);
assert.equal(parseOdds('1', 'decimal'), null);
assert.equal(parseOdds('10/11', 'fractional'), 1 + 10 / 11);
assert.equal(parseOdds('evens', 'fractional'), null);
near(parseOdds('52.38%', 'implied')!, 100 / 52.38);
near(parseOdds('0.5238', 'implied')!, 1 / 0.5238);
assert.equal(parseOdds('100', 'implied'), null);
assert.equal(parseOdds('', 'american'), null);

assert.equal(formatOdds(2.5, 'american'), '+150');
assert.equal(formatOdds(1.5, 'american'), '-200');
assert.equal(formatOdds(2.5, 'fractional'), '3/2');
assert.equal(formatOdds(2, 'implied'), '50.00%');

// ── De-vig ──
const std = [americanToDecimal(-110), americanToDecimal(-110)];
for (const m of ['multiplicative', 'power', 'shin'] as const) {
  const r = devig(std, m);
  near(r.fair.reduce((a, b) => a + b, 0), 1);
  near(r.fair[0], 0.5); // symmetric market → 50/50 under every method
  near(r.overround, 1 / 21); // 2 × (110/210) − 1
  near(r.hold, 1 - 1 / (22 / 21));
}

// Longshot-aware methods take more margin from the dog than multiplicative does.
const skew = [americanToDecimal(-400), americanToDecimal(+300)];
const mult = devig(skew, 'multiplicative');
const pow = devig(skew, 'power');
const shin = devig(skew, 'shin');
for (const r of [mult, pow, shin]) near(r.fair.reduce((a, b) => a + b, 0), 1);
assert.ok(pow.fair[1] < mult.fair[1], 'power gives the longshot a lower fair prob');
assert.ok(shin.fair[1] < mult.fair[1], 'shin gives the longshot a lower fair prob');
assert.ok(pow.param! > 1 && shin.param! > 0 && shin.param! < 1);

// 3-way market and a no-vig market.
const threeWay = devig([2.1, 3.4, 3.6], 'shin');
near(threeWay.fair.reduce((a, b) => a + b, 0), 1);
const fairAlready = devig([2, 2], 'power');
near(fairAlready.overround, 0);
near(fairAlready.fair[0], 0.5);

assert.throws(() => devig([2], 'shin'));

console.log('odds.ts: all checks passed');

// ── Parlay ──
import { parlay } from '../src/odds';
const coin = { decimal: americanToDecimal(-110), fair: 0.5 };
const p2 = parlay([coin, coin]);
near(p2.jointProb, 0.25);
near(p2.fairDecimal, 4);
near(p2.bookDecimal, (21 / 11) ** 2);
near(p2.hold, 1 - 0.25 * (21 / 11) ** 2); // ≈ 8.9%, roughly double the single-leg hold
assert.ok(p2.hold > 2 * (1 / 22) - 0.01 && p2.hold < 2 * (1 / 22) + 0.01, 'two-leg hold ≈ 2× single hold');
const p4 = parlay(Array(4).fill(coin));
assert.ok(p4.hold > p2.hold, 'hold compounds with more legs');
near(parlay([coin, coin], 4).hold, 0); // quoted at fair price → no hold
near(parlay([coin], undefined).hold, 1 / 22); // single leg = plain -110 hold
near(p2.legHolds[0], 1 / (21 / 11) - 0.5);
assert.throws(() => parlay([]));

console.log('parlay: all checks passed');
