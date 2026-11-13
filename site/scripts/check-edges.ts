/**
 * Regression guard for the canonical edge dataset (site/src/data/edges.ts).
 *
 * Roadmap Action 2.3. Asserts the record count, that every category has at
 * least one record and no record carries an unlisted one, that names are
 * unique, that each record's numbers are physically sane and that each declares
 * its basis. Also enforces a per-category citation ratchet (audit PROD-07): the
 * cited count recorded in provenance-baseline.json may only go up, never regress,
 * and a dataset freeze (PROD-08): no new record while any category cites fewer
 * than MIN_CITED_SHARE of its rows.
 *
 *   npm run check:edges                  verify (CI)
 *   npm run check:edges -- --write-baseline   record new counts and citations
 */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { EDGES, EDGE_CATEGORIES, MIN_CITED_SHARE } from '../src/data/edges.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const BASELINE_PATH = resolve(HERE, '../src/data/provenance-baseline.json');

// ── Record count & category coverage ──
type Coverage = { records: number; cited: number };
const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8')) as {
  totalRecords: number;
  categories: Record<string, Coverage>;
};
const writeBaseline = process.argv.includes('--write-baseline');
// `--write-baseline` exists to record a new count, so the count assertion must not block it.
if (!writeBaseline) {
  assert.equal(
    EDGES.length,
    baseline.totalRecords,
    `edges.ts has ${EDGES.length} records but the baseline expects ${baseline.totalRecords} — ` +
      'update provenance-baseline.json (run with --write-baseline) if this is intentional',
  );
}

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
    if (r.payout !== undefined) {
      // The win rate it implies, (1+e)/(1+payout), must be a probability.
      assert.ok(r.payout > 0 && r.e / 100 < r.payout, `${r.n}: payout must be positive and above the edge`);
    }
  }
}

// ── Basis, and the per-category citation ratchet and freeze ──
for (const r of EDGES) {
  assert.ok(['math', 'published', 'estimate'].includes(r.basis), `${r.n}: basis must be math, published or estimate`);
}
const now: Record<string, Coverage> = {};
for (const c of EDGE_CATEGORIES) {
  const rows = EDGES.filter((r) => r.cat === c);
  now[c] = { records: rows.length, cited: rows.filter((r) => r.source).length };
}
const was = (c: string): Coverage => baseline.categories[c] ?? { records: 0, cited: 0 };
const pct = (k: Coverage) => `${k.cited}/${k.records} (${Math.round((100 * k.cited) / k.records)}%)`;
const thin = EDGE_CATEGORIES.filter((c) => now[c].cited < MIN_CITED_SHARE * now[c].records);

for (const c of EDGE_CATEGORIES) {
  assert.ok(
    now[c].cited >= was(c).cited,
    `${c}: ${now[c].cited} records cite a source, the baseline requires at least ${was(c).cited}`,
  );
  if (writeBaseline) {
    // The freeze. Without it the weekly content job adds rows to whichever category is easy to
    // cite and the uncited rows elsewhere never get looked at.
    assert.ok(
      now[c].records <= was(c).records || thin.length === 0,
      `${c} gained a record, but the dataset is frozen until every category cites at least ` +
        `${MIN_CITED_SHARE * 100}% of its rows. Below that: ${thin.map((t) => `${t} ${pct(now[t])}`).join(', ')}. ` +
        'Cite existing rows instead.',
    );
  } else {
    assert.equal(now[c].records, was(c).records, `${c}: the record count changed; run with --write-baseline if intended`);
  }
}
const withSource = EDGES.filter((r) => r.source).length;

if (writeBaseline) {
  writeFileSync(BASELINE_PATH, JSON.stringify({ totalRecords: EDGES.length, categories: now }, null, 2) + '\n');
  console.log(`provenance-baseline.json updated: ${withSource}/${EDGES.length} records cite a source.`);
}

console.log(
  `edges.ts: ${EDGES.length} records across ${byCategory.size} categories, ${withSource} cite a source; ` +
    (thin.length ? `growth frozen, ${thin.length} categories below ${MIN_CITED_SHARE * 100}% cited.` : 'growth open.'),
);
console.log('edges.ts: all checks passed');
