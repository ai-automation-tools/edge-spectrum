/**
 * Generates every downstream copy of the Edge Spectrum dataset from the one
 * canonical source, `site/src/data/edges.ts`.
 *
 * Roadmap Action 2.2. Before this script there were three hand-maintained
 * copies of the same rows — the inlined `RAW` array in the Spectrum page, the
 * `RAW` list in the Streamlit port (since removed), and the tables under `data/` — and they
 * had drifted: the markdown was 21 records behind, missing the whole Precious
 * Metals and Insurance & Annuities categories, and still carried a
 * "Gold / Precious Metals (GLD)" row the canonical set had renamed and moved.
 * Nothing caught it, because nothing compared them.
 *
 *   npm run gen:edges              rewrite the artifacts
 *   npm run gen:edges -- --check   fail if any artifact has drifted (CI)
 *
 * The Spectrum page stays self-contained: its data is still inlined, this
 * script just owns the block. That keeps `npm run check:spectrum`, which lifts
 * `RAW` straight out of the HTML, testing the page that actually ships.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { EDGES, EDGE_CATEGORIES, MIN_CITED_SHARE, toSpectrumRow, type EdgeRecord, type GameEdge } from '../src/data/edges.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '../..');
const at = (p: string) => resolve(REPO, p);
const SOURCE = 'site/src/data/edges.ts';

/** Annual returns and edges read as percentages; keep the decimal point on whole numbers. */
const pct = (n: number) => (Number.isInteger(n) ? n.toFixed(1) : String(n));
const cited = (r: EdgeRecord) => (r.source ? '✓' : '');

/** The banner that opens each category, in whichever comment syntax the target uses. */
const MODES = new Map<string, Set<string>>();
for (const r of EDGES) MODES.set(r.cat, (MODES.get(r.cat) ?? new Set()).add(r.m));
const banner = (r: EdgeRecord, mark: string) => {
  const modes = MODES.get(r.cat)!;
  const model = modes.size > 1 ? 'Mixed' : r.m === 'i' ? 'Compound' : 'Linear';
  return `${mark} --- ${r.cat.toUpperCase()} (${model}) ---`;
};

// ── The Spectrum visualizer's inlined RAW array ──────────────────────────────
function spectrumBlock(): string {
  let out = 'const RAW = [\n';
  let prev: string | null = null;
  for (const r of EDGES) {
    if (r.cat !== prev) {
      if (prev !== null) out += '\n';
      out += `  ${banner(r, '//')}\n`;
      prev = r.cat;
    }
    // `a` and `e` are percentages and keep their decimal point; `du` and `ced` are counts.
    const fields = Object.entries(toSpectrumRow(r)).map(([k, v]) =>
      typeof v === 'string' ? `${k}:${JSON.stringify(v)}` : `${k}:${k === 'a' || k === 'e' ? pct(v) : v}`,
    );
    out += `  {${fields.join(',')}},\n`;
  }
  return out + '];\n';
}

/**
 * Read a file with its line endings normalised to LF. `core.autocrlf` is on in this
 * repo, so the working tree is CRLF on Windows and LF on CI — comparing raw bytes
 * would make `--check` fail on one platform and pass on the other.
 */
const readLF = (file: string) => readFileSync(at(file), 'utf8').replace(/\r\n/g, '\n');

/** Swap the region between `open` and `close` (exclusive; `null` = to end of file). */
function splice(file: string, open: string, close: string | null, block: string): string {
  const src = readLF(file);
  const a = src.indexOf(open);
  const b = close === null ? src.length : src.indexOf(close, a);
  if (a < 0 || b < 0) throw new Error(`gen:edges — ${file} no longer contains "${open}" ... "${close}"`);
  return src.slice(0, a) + block + src.slice(b);
}

// ── The machine-readable copy, for the eventual React port (Action 4.6) ──────
function edgesJson(): string {
  return `[\n${EDGES.map((r) => `  ${JSON.stringify(toSpectrumRow(r))}`).join(',\n')}\n]\n`;
}

// ── The published dataset: CSV plus a Frictionless Data Package (audit INT-07, GOV-03) ──
// The records are compiled facts, each crediting its own source; the compilation is CC BY 4.0.
const LICENCE = { name: 'CC-BY-4.0', title: 'Creative Commons Attribution 4.0 International', path: 'https://creativecommons.org/licenses/by/4.0/' };
type Cell = string | number | undefined;
const COLUMNS: Array<{ name: string; type: string; description: string; get: (r: EdgeRecord) => Cell; constraints?: object }> = [
  { name: 'name', type: 'string', description: 'The activity. Unique.', get: (r) => r.n, constraints: { required: true, unique: true } },
  { name: 'category', type: 'string', description: 'The category it is grouped under.', get: (r) => r.cat, constraints: { required: true, enum: [...EDGE_CATEGORIES] } },
  { name: 'model', type: 'string', description: '"i": a held asset whose return compounds. "g": a repeated wager whose edge accrues per decision.', get: (r) => r.m, constraints: { required: true, enum: ['i', 'g'] } },
  { name: 'layer', type: 'string', description: '"raw", or the same activity after a "fee" or "tax".', get: (r) => r.ly, constraints: { required: true, enum: ['raw', 'fee', 'tax'] } },
  { name: 'basis', type: 'string', description: '"math": follows from the rules and payouts. "published": a rate, price, index or takeout someone publishes. "estimate": a typical outcome no one publishes as one figure.', get: (r) => r.basis, constraints: { required: true, enum: ['math', 'published', 'estimate'] } },
  { name: 'annual_return_pct', type: 'number', description: 'Model "i" only: annual return, percent.', get: (r) => (r.m === 'i' ? r.a : undefined) },
  { name: 'edge_pct', type: 'number', description: 'Model "g" only: expected return per decision, percent of the stake. Negative for the player on most rows.', get: (r) => (r.m === 'g' ? r.e : undefined) },
  { name: 'decisions_per_day', type: 'number', description: 'Model "g" only: decisions per day at typical play.', get: (r) => (r.m === 'g' ? r.du : undefined) },
  { name: 'capital_exposed_pct', type: 'number', description: 'Model "g" only: capital exposed per decision, percent of bankroll.', get: (r) => (r.m === 'g' ? r.ced : undefined) },
  { name: 'payout', type: 'number', description: 'Model "g", positive-edge rows only: average net win per unit staked on a winning decision. Empty means even money.', get: (r) => (r.m === 'g' ? r.payout : undefined) },
  { name: 'source', type: 'string', description: 'Where the figure comes from. Empty means uncited.', get: (r) => r.source },
  { name: 'as_of', type: 'date', description: 'The date the figure was last checked against its source.', get: (r) => r.asOf },
  { name: 'window', type: 'string', description: 'The period the figure covers.', get: (r) => r.window },
  { name: 'methodology', type: 'string', description: 'How the figure was derived.', get: (r) => r.methodology },
];

const csvCell = (v: Cell) => (v === undefined ? '' : /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
// LF line endings, so `--check` (which reads LF-normalised) can compare it; the dialect says so.
function edgesCsv(): string {
  return [COLUMNS.map((c) => c.name).join(','), ...EDGES.map((r) => COLUMNS.map((c) => csvCell(c.get(r))).join(','))].join('\n') + '\n';
}

const sha256 = (s: string) => `sha256:${createHash('sha256').update(s, 'utf8').digest('hex')}`;
function dataPackage(csv: string, json: string): string {
  // The version is the newest check date, so it moves whenever a figure is re-checked or changed.
  const version = EDGES.map((r) => r.asOf ?? '').sort().at(-1);
  const pkg = {
    $schema: 'https://datapackage.org/profiles/2.0/datapackage.json',
    name: 'edge-spectrum',
    title: 'Edge Spectrum: returns and house edges across investing and gambling',
    description:
      `${EDGES.length} activities, from index funds to keno, each with an annual return (held assets) or an edge per decision ` +
      '(wagers), the evidence behind it, and where cited, its source, check date, window and method. Education only, not advice.',
    version,
    licenses: [LICENCE],
    sources: [{ title: 'The publishers named in each record\'s source field' }],
    resources: [
      {
        name: 'edges',
        path: 'edges.csv',
        format: 'csv',
        mediatype: 'text/csv',
        encoding: 'utf-8',
        hash: sha256(csv),
        dialect: { delimiter: ',', lineTerminator: '\n', header: true },
        schema: {
          fields: COLUMNS.map(({ name, type, description, constraints }) => ({ name, type, description, ...(constraints ? { constraints } : {}) })),
          primaryKey: ['name'],
        },
      },
      {
        name: 'edges-spectrum',
        path: 'edges.json',
        format: 'json',
        mediatype: 'application/json',
        encoding: 'utf-8',
        hash: sha256(json),
        description:
          'The same records in the short-key shape the Spectrum page uses: n, cat, m, a (or e, du, ced, pay), ly, type, ' +
          'src, asOf, win, how, and b on math rows. Prefer edges.csv; this shape may change with the page.',
      },
    ],
  };
  return JSON.stringify(pkg, null, 2) + '\n';
}

// ── The human-readable tables under data/ ────────────────────────────────────
function datasetMarkdown(): string {
  const layers = { raw: 0, fee: 0, tax: 0 };
  for (const r of EDGES) layers[r.ly]++;

  const assetTable = (rows: EdgeRecord[]) =>
    [
      '| # | Name | Annual return | Layer | Basis | Cited |',
      '|---|------|--------------:|-------|-------|:-----:|',
      ...rows.map((r, i) => `| ${i + 1} | ${r.n} | ${pct((r as Extract<EdgeRecord, { m: 'i' }>).a)}% | ${r.ly} | ${r.basis} | ${cited(r)} |`),
    ].join('\n');

  const gameTable = (rows: GameEdge[]) =>
    [
      '| # | Name | Edge | DU/day | CED | Layer | Basis | Cited |',
      '|---|------|-----:|-------:|----:|-------|-------|:-----:|',
      ...rows.map((r, i) => `| ${i + 1} | ${r.n} | ${pct(r.e)}% | ${r.du} | ${r.ced}% | ${r.ly} | ${r.basis} | ${cited(r)} |`),
    ].join('\n');

  // The provenance burn-down (audit PROD-07): how much of each category cites a source.
  const share = (rows: EdgeRecord[]) => rows.filter((r) => r.source).length / rows.length;
  const thin = EDGE_CATEGORIES.filter((c) => share(EDGES.filter((r) => r.cat === c)) < MIN_CITED_SHARE);
  const coverage = [
    '| Category | Records | Cited | Share | math | published | estimate |',
    '|----------|--------:|------:|------:|-----:|----------:|---------:|',
    ...EDGE_CATEGORIES.map((c) => {
      const rows = EDGES.filter((r) => r.cat === c);
      const n = (b: string) => rows.filter((r) => r.basis === b).length;
      const s = share(rows);
      return `| ${c} | ${rows.length} | ${rows.filter((r) => r.source).length} | ${s < MIN_CITED_SHARE ? '**' : ''}${Math.round(100 * s)}%${s < MIN_CITED_SHARE ? '**' : ''} | ${n('math')} | ${n('published')} | ${n('estimate')} |`;
    }),
  ].join('\n');

  const sections = EDGE_CATEGORIES.map((c, n) => {
    const rows = EDGES.filter((r) => r.cat === c);
    const assets = rows.filter((r) => r.m === 'i');
    const games = rows.filter((r): r is GameEdge => r.m === 'g');
    const parts = [`## ${n + 1}. ${c}`, '', `**Records:** ${rows.length}`, ''];
    if (assets.length > 0) parts.push('### Held assets — compound model', '', assetTable(assets), '');
    if (games.length > 0) parts.push('### Games — linear model', '', gameTable(games), '');
    return parts.join('\n');
  });

  return [
    '# Edge Spectrum — Canonical Dataset 📊',
    '',
    '> [!NOTE]',
    '> **Generated file — do not edit.** Produced by `npm run gen:edges` (from `site/`) out of',
    `> \`${SOURCE}\`, the single source of truth for this dataset. Edit that file and regenerate;`,
    '> CI runs `npm run gen:edges -- --check` and fails the build on drift.',
    '',
    `**Records:** ${EDGES.length} · **Categories:** ${EDGE_CATEGORIES.length} · ` +
      `**Layers:** ${layers.raw} raw · ${layers.fee} fee · ${layers.tax} tax`,
    '',
    `**Licence:** [${LICENCE.title}](${LICENCE.path}) (\`${LICENCE.name}\`). Credit "Edge Spectrum" and keep each`,
    "record's `source`: the figures are facts compiled from the publishers named there. The code is Apache-2.0.",
    '**Download:** [`edges.csv`](../site/public/spectrum/edges.csv), with its schema, version and licence in',
    '[`datapackage.json`](../site/public/spectrum/datapackage.json); both are served beside the Spectrum page and',
    'attached to each `dataset-*` release on GitHub.',
    '',
    '## What is here, and what is deliberately not',
    '',
    'These tables list the dataset **inputs** — the annual return of a held asset, or the edge,',
    'decisions per day and capital exposed per decision of a game. They do not list projected',
    'returns at each horizon. The earlier hand-maintained versions did, and those columns went',
    'stale the moment the projection math changed: the horizon numbers in',
    '[`edge_analysis12.md`](edge_analysis12.md) were computed under the single-axis model that',
    'roadmap Action 2.1 replaced on 2026-08-31, and nothing recomputed them.',
    '',
    'Projections belong to the code that draws them — `site/public/spectrum/index.html` — and are',
    'held there by `npm run check:spectrum`, which runs the page’s own functions over this same',
    'data. One place computes them, one guard checks them.',
    '',
    '## Provenance coverage',
    '',
    '`basis` says what kind of evidence a figure needs: `math` follows from the rules and payouts,',
    '`published` is a rate, price, index or takeout someone publishes, `estimate` is a typical',
    'outcome no one publishes as one figure. **Cited** means the record names a `source`.',
    `\`npm run check:edges\` holds each category's cited count, and no record may be added while a`,
    `category cites under ${MIN_CITED_SHARE * 100}% of its rows (bold below). ` +
      (thin.length ? `**The dataset is frozen:** ${thin.length} of ${EDGE_CATEGORIES.length} categories are under it.` : 'No category is under it.'),
    '',
    coverage,
    '',
    '## Model reference',
    '',
    '| Mode | Applies to | Measure |',
    '|------|------------|---------|',
    '| `i` — compound | Held assets | `returnOnCapital` compounds the annual return over the horizon. |',
    '| `g` — linear | Games | `returnOnCapital` accrues the flat-stake loss and **stops at −100%**; `expectedTurnoverCost` is the same loss left unbounded. |',
    '',
    'See [`../docs/methodology.md`](../docs/methodology.md) for the DU/CED framework and the ruin',
    'formulas, and [`../docs/ideas/hub_improvement_plan.md`](../docs/ideas/hub_improvement_plan.md)',
    'section 8 for why the two measures are no longer plotted on one axis.',
    '',
    '---',
    '',
    ...sections,
    '<p align="center">',
    '  <a href="../docs/ROADMAP.md">Roadmap</a> ·',
    '  <a href="../docs/data-architecture.md">Data Architecture</a> ·',
    '  <a href="edge_analysis12.md">V12 archive</a>',
    '</p>',
    '',
  ].join('\n');
}

// ── Emit ─────────────────────────────────────────────────────────────────────
const artifacts: Array<[string, string]> = [
  [
    'site/public/spectrum/index.html',
    splice('site/public/spectrum/index.html', 'const RAW = [', '\nconst AR_DEFAULT', spectrumBlock()),
  ],
  ['site/public/spectrum/edges.json', edgesJson()],
  ['site/public/spectrum/edges.csv', edgesCsv()],
  ['site/public/spectrum/datapackage.json', dataPackage(edgesCsv(), edgesJson())],
  ['data/edge_dataset.md', datasetMarkdown()],
];

const check = process.argv.includes('--check');
const drifted: string[] = [];

for (const [file, content] of artifacts) {
  let current: string | null = null;
  try {
    current = readLF(file);
  } catch {
    current = null;
  }
  if (current === content) {
    if (!check) console.log(`  unchanged  ${file}`);
    continue;
  }
  if (check) drifted.push(file);
  else {
    writeFileSync(at(file), content, 'utf8');
    console.log(`  ${current === null ? 'created' : 'rewrote'}    ${file}`);
  }
}

if (check) {
  if (drifted.length > 0) {
    console.error(`gen:edges — ${drifted.length} artifact(s) no longer match ${SOURCE}:`);
    for (const f of drifted) console.error(`  - ${f}`);
    console.error('\nRun `npm run gen:edges` from site/ and commit the result.');
    process.exit(1);
  }
  console.log(`gen:edges — ${EDGES.length} records, ${artifacts.length} artifacts all in sync with ${SOURCE}`);
} else {
  console.log(`gen:edges — ${EDGES.length} records from ${SOURCE} into ${artifacts.length} artifacts`);
}
