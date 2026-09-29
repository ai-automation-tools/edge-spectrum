/**
 * Self-check for src/strategyUrl.ts: a share link round-trips, and no query
 * string — however mangled — parses to a strategy the endpoint's schema
 * rejects. Run: npm run check:strategy-url
 */
import assert from 'node:assert/strict';
import { DEFAULT_STRATEGY, strategyFromQuery, strategyToQuery } from '../src/strategyUrl';
import { validateStrategy } from '../src/server/strategySchema';
import type { Strategy } from '../src/types';

const accepted = (s: Strategy, label: string) => {
  const v = validateStrategy(s);
  assert.ok(v.ok, `${label}: schema rejected ${JSON.stringify(s)} — ${v.errors.join('; ')}`);
};

// ── Round trip ── every field, including the optional filters.
const full: Strategy = {
  sport: 'NBA', startYear: 2011, endYear: 2019, betType: 'spread', sideSelection: 'home_underdogs',
  streakFilter: 'hot_streak_3plus', unitSize: 250, startingBankroll: 50000,
  oddsMin: -150, oddsMax: 130, spreadMin: 1.5, spreadMax: 7, totalMin: 200, totalMax: 230,
};
const back = strategyFromQuery(strategyToQuery(full));
assert.equal(strategyToQuery(back), strategyToQuery(full));
for (const k of Object.keys(full) as (keyof Strategy)[]) assert.equal(back[k], full[k], k);
accepted(back, 'round trip');

// An unset filter stays unset, not 0.
const bare = strategyFromQuery(strategyToQuery(DEFAULT_STRATEGY));
assert.equal(bare.oddsMin, undefined);
assert.ok(!strategyToQuery(DEFAULT_STRATEGY).includes('odds'));
assert.equal(strategyToQuery(strategyFromQuery('')), strategyToQuery(DEFAULT_STRATEGY));

// ── Hostile / stale links degrade field by field ──
const s1 = strategyFromQuery('sport=nba&betType=totals&side=favorites&from=1990&to=3000&unit=-5&bankroll=abc');
assert.equal(s1.sport, 'NBA');                         // case-insensitive
assert.equal(s1.sideSelection, 'over');                // side must match the bet type
assert.equal(s1.startYear, DEFAULT_STRATEGY.startYear);
assert.equal(s1.endYear, DEFAULT_STRATEGY.endYear);
assert.equal(s1.unitSize, DEFAULT_STRATEGY.unitSize);
assert.equal(s1.startingBankroll, DEFAULT_STRATEGY.startingBankroll);

const s2 = strategyFromQuery('betType=spread&side=under&from=2024&to=2010&oddsMin=200&oddsMax=-200&spreadMin=3');
assert.equal(s2.sideSelection, DEFAULT_STRATEGY.sideSelection);
assert.equal(s2.endYear, 2024);                        // clamped up to startYear
assert.equal(s2.oddsMin, undefined);                   // inverted pair dropped
assert.equal(s2.oddsMax, undefined);
assert.equal(s2.spreadMin, 3);                         // one-sided filter kept

assert.equal(strategyFromQuery('from=2015.5').startYear, DEFAULT_STRATEGY.startYear);
assert.equal(strategyFromQuery('unit=0').unitSize, DEFAULT_STRATEGY.unitSize);
assert.equal(strategyFromQuery('unit=Infinity').unitSize, DEFAULT_STRATEGY.unitSize);

// ── Fuzz ── whatever comes in, the schema accepts what comes out.
const junk = ['', 'x', '-1', '0', '1e999', 'NaN', '2000', '2025', '-100001', '100001', '-150', '7',
  '501', 'NFL', 'mlb', 'totals', 'over', 'under', 'home', 'any', 'cold_streak_3plus'];
const keys = ['sport', 'betType', 'side', 'streak', 'from', 'to', 'unit', 'bankroll',
  'oddsMin', 'oddsMax', 'spreadMin', 'spreadMax', 'totalMin', 'totalMax'];
let seed = 42;
const rand = (n: number) => ((seed = (seed * 1103515245 + 12345) % 2 ** 31), seed % n);
for (let i = 0; i < 5000; i++) {
  const q = new URLSearchParams();
  for (const k of keys) if (rand(2)) q.set(k, junk[rand(junk.length)]);
  accepted(strategyFromQuery(q), q.toString());
}

console.log('check:strategy-url — round trip, degradation and 5,000 fuzzed links OK');
