/**
 * Regression guard for the canonical edge dataset (site/src/data/edges.ts).
 *
 * Roadmap Action 2.3. Asserts the record count, that every category has at
 * least one record and no record carries an unlisted one, that names are
 * unique, and that each record's numbers are physically sane. Also enforces
 * a provenance citation ratchet: coverage recorded in provenance-baseline.json
 * may only go up, never regress.
 *
 *   npm run check:edges                  verify (CI)
 *   npm run check:edges -- --write-baseline   record newly-added citations
 */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { EDGES, EDGE_CATEGORIES } from '../src/data/edges.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const BASELINE_PATH = resolve(HERE, '../src/data/provenance-baseline.json');

// ── Record count & category coverage ──
const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8')) as {
  totalRecords: number;
  withSource: number;
};
assert.equal(
  EDGES.length,
  baseline.totalRecords,
  `edges.ts has ${EDGES.length} records but the baseline expects ${baseline.totalRecords} — ` +
    'update provenance-baseline.json (run with --write-baseline) if this is intentional',
);

const byCategory = new Map<string, number>();
for (const r of EDGES) byCategory.set(r.cat, (byCategory.get(r.cat) ?? 0) + 1);
for (const cat of EDGE_CATEGORIES) assert.ok(byCategory.has(cat), `category "${cat}" has no records`);
assert.equal(byCategory.size, EDGE_CATEGORIES.length, 'a record carries a category outside EDGE_CATEGORIES');

// ── Uniqueness ──
const names = new Set<string>();
for (const r of EDGES) {
  assert.ok(!names.has(r.n), `duplicate record name "${r.n}"`);
  names.add(r.n);
}

// ── Mathematical invariants ──
for (const r of EDGES) {
  if (r.m === 'i') {
    assert.ok(Number.isFinite(r.a), `${r.n}: annual return "a" must be finite`);
    assert.ok(r.a > -100, `${r.n}: annual return "a" cannot wipe out more than 100%/yr`);
  } else {
    assert.ok(Number.isFinite(r.e), `${r.n}: edge "e" must be finite`);
    assert.ok(r.du > 0, `${r.n}: decisions/day "du" must be positive`);
    assert.ok(r.ced > 0 && r.ced <= 100, `${r.n}: capital exposure "ced" must be in (0, 100]`);
  }
}

// ── Provenance citation ratchet ──
const withSource = EDGES.filter((r) => r.source).length;

if (process.argv.includes('--write-baseline')) {
  writeFileSync(BASELINE_PATH, JSON.stringify({ totalRecords: EDGES.length, withSource }, null, 2) + '\n');
  console.log(`provenance-baseline.json updated: ${withSource}/${EDGES.length} records cite a source.`);
} else {
  assert.ok(
    withSource >= baseline.withSource,
    `provenance coverage regressed: ${withSource} records cite a source, baseline requires at least ${baseline.withSource}`,
  );
}

console.log(
  `edges.ts: ${EDGES.length} records across ${byCategory.size} categories, ` +
    `${withSource} cite a source (baseline ${baseline.withSource}).`,
);
console.log('edges.ts: all checks passed');
