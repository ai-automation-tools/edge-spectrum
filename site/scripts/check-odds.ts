/**
 * Self-check for src/odds.ts — conversions round-trip, de-vig outputs sum to
 * one, and each method behaves the way its theory says it should.
 * Run: npm run check:odds
 */
import assert from 'node:assert/strict';
import {
  americanToDecimal, decimalToAmerican, decimalToFractional,
  parseOdds, formatOdds, devig, oddsError, FORMAT_HINT, MAX_DECIMAL,
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
// Only a plain number is a price (audit BUG-21): Number() alone reads hex and exponents, and
// stripping every "+" turned "1+1+0" into 110.
for (const [text, format] of [
  ['0/5', 'fractional'], ['0x64', 'american'], ['1+1+0', 'american'], ['1e3', 'american'],
  ['++150', 'american'], ['-110%', 'american'], ['1.9.1', 'decimal'], ['50%%', 'implied'], ['-', 'american'],
] as const) assert.equal(parseOdds(text, format), null, `${text} is not ${format} odds`);
assert.equal(parseOdds(' +150 ', 'american'), 2.5);
// Audit UX-16: a copied typographic minus is a minus; a price past +1,000,000 is a typo.
assert.equal(parseOdds('−110', 'american'), americanToDecimal(-110));
assert.equal(parseOdds('+1000000', 'american'), MAX_DECIMAL);
for (const [text, format] of [
  ['+1000001', 'american'], ['1000000000000', 'american'], ['10002', 'decimal'], ['10001/1', 'fractional'], ['0.00009', 'implied'],
] as const) assert.equal(parseOdds(text, format), null, `${text} is past the ${format} cap`);
assert.equal(oddsError('-110', 'american'), null);
assert.equal(oddsError(' ', 'american'), 'Enter a price.');
assert.equal(oddsError('abc', 'decimal'), FORMAT_HINT.decimal);
assert.equal(parseOdds('+5/2', 'fractional'), 3.5);
assert.equal(parseOdds('.5', 'implied'), 2);
near(parseOdds('52.38 %', 'implied')!, 100 / 52.38);

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

// Every method sums to 1 on every market with vig, extreme ones included (audit BUG-22):
// two sides at 1.01 need a power exponent near 70, past the old fixed bound of 50.
const prices = [1.01, 1.05, 1.5, 1.909, 3, 12, 101, 1001];
const markets = [...prices.flatMap((a) => prices.map((b) => [a, b])), [1.01, 1.01, 1.01], [1.2, 9, 15, 34]];
for (const market of markets) {
  if (market.reduce((sum, d) => sum + 1 / d, 0) <= 1) continue;
  for (const m of ['multiplicative', 'power', 'shin'] as const) {
    const { fair } = devig(market, m);
    near(fair.reduce((a, b) => a + b, 0), 1, 1e-9);
    assert.ok(fair.every((p) => p > 0 && p < 1), `${m} on ${market}: ${fair}`);
  }
}
near(devig([1.01, 1.01], 'power').param!, Math.log(0.5) / Math.log(1 / 1.01), 1e-6);
// A price of 1.0 is a certainty no exponent can discount: the answer is still a distribution.
near(devig([1, 1.5], 'power').fair.reduce((a, b) => a + b, 0), 1, 1e-9);

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

// ── Kelly sizing (Action 6.3, audit PROD-11) ──
import { kellyFraction, growthRate, drawdownChance, simultaneousKelly, edge } from '../src/kelly';

const fav = { p: 0.55, d: 2 };
near(kellyFraction(fav), 0.1); // (1 x 0.55 - 0.45) / 1
near(edge(fav), 0.1);
near(kellyFraction({ p: 0.5, d: 2 }), 0); // no edge, no bet
near(kellyFraction({ p: 0.4, d: 2 }), 0); // negative edge is not a short
near(kellyFraction({ p: 0.25, d: 5 }), (4 * 0.25 - 0.75) / 4);
// Full Kelly maximises growth; twice Kelly grows at about zero.
const k = kellyFraction(fav);
assert.ok(growthRate(fav, k) > growthRate(fav, 0.9 * k) && growthRate(fav, k) > growthRate(fav, 1.1 * k));
assert.ok(Math.abs(growthRate(fav, 2 * k)) < 0.001);
// Thorp's drawdown odds: halving at full Kelly 50%, at half Kelly 12.5%; 2x Kelly certain.
near(drawdownChance(0.5, 1), 0.5);
near(drawdownChance(0.5, 0.5), 0.125);
near(drawdownChance(0.5, 2), 1);
assert.throws(() => drawdownChance(0, 1));
// Simultaneous: one bet is plain Kelly; two independent copies each get less, together more.
assert.ok(Math.abs(simultaneousKelly([fav])[0] - k) < 1e-6);
const two = simultaneousKelly([fav, fav]);
assert.ok(Math.abs(two[0] - two[1]) < 1e-6 && two[0] < k && two[0] + two[1] > k, `two bets: ${two}`);
assert.deepEqual(simultaneousKelly([{ p: 0.5, d: 2 }, fav]).map((f) => Number(f.toFixed(4))), [0, Number(k.toFixed(4))]);
console.log('kelly: all checks passed');
