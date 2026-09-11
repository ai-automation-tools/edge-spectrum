/**
 * Generates every downstream copy of the Edge Spectrum dataset from the one
 * canonical source, `site/src/data/edges.ts`.
 *
 * Roadmap Action 2.2. Before this script there were three hand-maintained
 * copies of the same rows — the inlined `RAW` array in the Spectrum page, the
 * `RAW` list in the Streamlit port, and the tables under `Data/` — and they
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
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { EDGES, EDGE_CATEGORIES, toSpectrumRow, type EdgeRecord, type GameEdge } from '../src/data/edges.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '../..');
const at = (p: string) => resolve(REPO, p);
const SOURCE = 'site/src/data/edges.ts';

/** Annual returns and edges read as percentages; keep the decimal point on whole numbers. */
const pct = (n: number) => (Number.isInteger(n) ? n.toFixed(1) : String(n));

/** The banner that opens each category, in whichever comment syntax the target uses. */
const banner = (r: EdgeRecord, mark: string) =>
  `${mark} --- ${r.cat.toUpperCase()} (${r.m === 'i' ? 'Compound' : 'Linear'}) ---`;

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

// ── The Streamlit port's RAW list ────────────────────────────────────────────
function streamlitBlock(): string {
  let out = 'RAW = [\n';
  let prev: string | null = null;
  for (const r of EDGES) {
    if (r.cat !== prev) {
      if (prev !== null) out += '\n';
      out += `    ${banner(r, '#')}\n`;
      prev = r.cat;
    }
    const args = r.m === 'i' ? [pct(r.a)] : [pct(r.e), String(r.du), String(r.ced)];
    if (r.ly !== 'raw') args.push(JSON.stringify(r.ly));
    out += `    _${r.m === 'i' ? 'inv' : 'gam'}(${JSON.stringify(r.n)}, ${JSON.stringify(r.cat)}, ${args.join(', ')}),\n`;
  }
  return out + ']\n';
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

// ── The human-readable tables under Data/ ────────────────────────────────────
function datasetMarkdown(): string {
  const layers = { raw: 0, fee: 0, tax: 0 };
  for (const r of EDGES) layers[r.ly]++;

  const assetTable = (rows: EdgeRecord[]) =>
    [
      '| # | Name | Annual return | Layer |',
      '|---|------|--------------:|-------|',
      ...rows.map((r, i) => `| ${i + 1} | ${r.n} | ${pct((r as Extract<EdgeRecord, { m: 'i' }>).a)}% | ${r.ly} |`),
    ].join('\n');

  const gameTable = (rows: GameEdge[]) =>
    [
      '| # | Name | Edge | DU/day | CED | Layer |',
      '|---|------|-----:|-------:|----:|-------|',
      ...rows.map((r, i) => `| ${i + 1} | ${r.n} | ${pct(r.e)}% | ${r.du} | ${r.ced}% | ${r.ly} |`),
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
    '## Model reference',
    '',
    '| Mode | Applies to | Measure |',
    '|------|------------|---------|',
    '| `i` — compound | Held assets | `returnOnCapital` compounds the annual return over the horizon. |',
    '| `g` — linear | Games | `returnOnCapital` accrues the flat-stake loss and **stops at −100%**; `expectedTurnoverCost` is the same loss left unbounded. |',
    '',
    'See [`../Docs/methodology.md`](../Docs/methodology.md) for the DU/CED framework and the ruin',
    'formulas, and [`../Docs/Ideas/hub_improvement_plan.md`](../Docs/Ideas/hub_improvement_plan.md)',
    'section 8 for why the two measures are no longer plotted on one axis.',
    '',
    '---',
    '',
    ...sections,
    '<p align="center">',
    '  <a href="../Docs/roadmap.md">Roadmap</a> ·',
    '  <a href="../Docs/data-architecture.md">Data Architecture</a> ·',
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
  ['Versions/Streamlit/data.py', splice('Versions/Streamlit/data.py', 'RAW = [\n', null, streamlitBlock())],
  ['site/public/spectrum/edges.json', edgesJson()],
  ['Data/edge_dataset.md', datasetMarkdown()],
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
