/**
 * Self-check for src/calcUrl.ts — the calculators' pre-fill links parse what
 * they should, drop what they should, and never throw on garbage.
 * Run: npm run check:calc-url
 */
import assert from 'node:assert/strict';
import { oddsFromQuery, parlayFromQuery } from '../src/calcUrl';
import { parseOdds } from '../src/odds';

// ── /odds ──
let o = oddsFromQuery('?odds=-110&legs=-110,-110&method=shin');
assert.equal(o.odds, '-110');
assert.deepEqual(o.legs, ['-110', '-110']);
assert.equal(o.method, 'shin');
assert.equal(o.format, 'american');

o = oddsFromQuery('?format=decimal&odds=1.909&legs=1.909,1.909,8.5');
assert.equal(o.format, 'decimal');
assert.equal(o.odds, '1.909');
assert.equal(o.legs?.length, 3);

o = oddsFromQuery('?odds=-50&legs=-110&method=bogus&format=roman');
assert.equal(o.odds, null, 'an American price under 100 is dropped');
assert.equal(o.legs, null, 'a one-outcome market is dropped');
assert.equal(o.method, 'multiplicative');
assert.equal(o.format, 'american');

o = oddsFromQuery('?legs=-110,abc');
assert.equal(o.legs, null, 'one bad leg drops the whole market');

assert.equal(oddsFromQuery('').odds, null);

// ── /parlay ──
let p = parlayFromQuery('?n=4');
assert.equal(p.legs?.length, 4);
assert.equal(p.legs?.[0].side, '-110');
assert.equal(p.legs?.[0].other, '-110');

p = parlayFromQuery('?n=3&format=decimal');
assert.equal(p.legs?.[0].side, '1.909', 'standard leg is rendered in the chosen format');

// A literal '+' is a space in a query string, so plus prices travel as %2B.
p = parlayFromQuery('?legs=-110/-110,%2B150/-180&quoted=%2B600');
assert.deepEqual(p.legs, [{ side: '-110', other: '-110' }, { side: '+150', other: '-180' }]);
assert.equal(p.quoted, '+600');

p = parlayFromQuery('?legs=-120,-105');
assert.deepEqual(p.legs, [{ side: '-120', other: '-120' }, { side: '-105', other: '-105' }], 'a lone price is used for both sides');

p = parlayFromQuery('?legs=-110/zzz&n=2');
assert.equal(p.legs?.length, 2, 'a bad legs list falls back to n');

p = parlayFromQuery('?n=0&quoted=-50');
assert.equal(p.legs, null);
assert.equal(p.quoted, '');

assert.equal(parlayFromQuery('?n=999').legs, null, 'leg count is capped');

// ── Fuzz: no query string throws, and whatever survives parses ──
const alphabet = '-+/,.0123456789abn=&%ze ';
let seed = 7;
const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
for (let i = 0; i < 5000; i++) {
  let s = '?';
  const len = Math.floor(rnd() * 40);
  for (let k = 0; k < len; k++) s += alphabet[Math.floor(rnd() * alphabet.length)];
  const a = oddsFromQuery(s);
  if (a.odds !== null) assert.ok(parseOdds(a.odds, a.format) !== null, s);
  for (const l of a.legs ?? []) assert.ok(parseOdds(l, a.format) !== null, s);
  const b = parlayFromQuery(s);
  if (b.quoted) assert.ok(parseOdds(b.quoted, b.format) !== null, s);
  for (const l of b.legs ?? []) {
    assert.ok(parseOdds(l.side, b.format) !== null && parseOdds(l.other, b.format) !== null, s);
  }
  assert.ok((b.legs?.length ?? 0) <= 15, s);
}

console.log('check:calc-url — pre-fill links parse, degrade and survive 5,000 fuzzed queries OK');
