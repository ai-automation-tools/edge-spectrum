/**
 * Regression guard for the Spectrum visualizer's three measures.
 *
 * The failure this exists to catch is the one Action 2.1 fixed: a compounded return
 * on capital and a linear turnover cost sharing one axis labelled "Expected Return",
 * so that a −136,875% slot bar squashed every investment on the board into a flat
 * line at zero.
 *
 * `site/public/spectrum/index.html` is self-contained by design — its data and its
 * math are inlined and it has no build step to hook. So this script lifts the page's
 * own `MATH & CONSTANTS` block and its `RAW` dataset out of the file and runs the
 * real functions. It is the page that is under test, not a copy of it: delete the
 * floor from `returnOnCapital` and this fails.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { EDGE_CATEGORIES } from '../src/data/edges';

const HERE = dirname(fileURLToPath(import.meta.url));
const PAGE = resolve(HERE, '../public/spectrum/index.html');
const html = readFileSync(PAGE, 'utf8');

/** The source between two of the page's section banners, exclusive of the second. */
function section(from: string, to: string): string {
  const a = html.indexOf(from);
  const b = html.indexOf(to, a);
  if (a < 0 || b < 0) throw new Error(`check:spectrum — ${PAGE} no longer contains "${from}" … "${to}"`);
  return html.slice(a, b);
}

type Row = {
  n: string; cat: string; m: 'i' | 'g';
  a?: number; e?: number; du?: number; ced?: number; pay?: number; src?: string; asOf?: string; how?: string; b?: 'math';
};
type Page = {
  RAW: Row[];
  HZ: string[];
  RUIN_FLOOR: number;
  decisionCount: (du: number, h: string) => number;
  expectedTurnoverCost: (edge: number, du: number, ced: number, h: string) => number;
  returnOnCapital: (r: Row, h: string) => number;
  ruinDecisions: (r: Row) => number | null;
  decayYears90: (r: Row) => number | null;
  rowHzLabel: (r: Row, h: string) => string;
  INFLATION: number;
  ruinRisk: (r: Row) => number | null;
  kellyMultiple: (r: Row) => number | null;
  realReturn: (nominal: number, h: string) => number;
  isStale: (r: Row, now: number) => boolean;
  CC: Record<string, string>;
};

// eslint-disable-next-line no-eval
const page = eval(
  `(() => {\n${section('// MATH & CONSTANTS', '// DATA INJECTION')}\n` +
    `${section('const RAW = [', '\nconst AR_DEFAULT')}\n` +
    'return { RAW, HZ, RUIN_FLOOR, INFLATION, decisionCount, expectedTurnoverCost, returnOnCapital, ruinDecisions, decayYears90, rowHzLabel, ruinRisk, kellyMultiple, realReturn, isStale, CC };\n})()',
) as Page;

const { RAW, HZ, RUIN_FLOOR, INFLATION, decisionCount, expectedTurnoverCost, returnOnCapital, ruinDecisions, decayYears90, rowHzLabel, ruinRisk, kellyMultiple, realReturn, isStale, CC } = page;

const failures: string[] = [];
const fail = (msg: string) => failures.push(msg);

// ── 1. The page still carries the dataset the docs describe ──────────────────
// The one record count, in the baseline `check:edges -- --write-baseline` writes (audit AI-08).
const EXPECTED_RECORDS: number = JSON.parse(readFileSync(resolve(HERE, '../src/data/provenance-baseline.json'), 'utf8')).totalRecords;
if (RAW.length !== EXPECTED_RECORDS) {
  fail(`record count is ${RAW.length}, expected ${EXPECTED_RECORDS} (if intended, run npm run check:edges -- --write-baseline)`);
}
if (RUIN_FLOOR !== -100) fail(`RUIN_FLOOR is ${RUIN_FLOOR}; total capital loss is −100% by definition`);

// ── 1b. Every category has a colour and a risk level (Action 2.12) ────────────
// The page's CC / AR_DEFAULT are hand-kept; a category missing from one falls back
// to grey or "LOW" silently. (The Streamlit archive's copies went with `Versions/`.)
const AR_DEFAULT = JSON.parse(section('const AR_DEFAULT = ', ';').slice('const AR_DEFAULT = '.length)) as Record<string, number>;
const maps: [string, Set<string>][] = [
  ['page CC', new Set(Object.keys(CC))], ['page AR_DEFAULT', new Set(Object.keys(AR_DEFAULT))],
];
for (const cat of new Set([...EDGE_CATEGORIES, ...RAW.map((r) => r.cat)])) {
  for (const [name, keys] of maps) if (!keys.has(cat)) fail(`category "${cat}" is missing from ${name}`);
}

// ── 2. Every row is well-formed for the measure its mode selects ─────────────
for (const r of RAW) {
  if (r.m === 'i') {
    if (!Number.isFinite(r.a)) fail(`${r.n}: investing row without a finite annual return`);
  } else if (r.m === 'g') {
    if (!Number.isFinite(r.e) || !Number.isFinite(r.du) || !Number.isFinite(r.ced)) {
      fail(`${r.n}: gambling row missing edge / decisions-per-day / capital-exposed`);
    } else if (r.du! <= 0 || r.ced! <= 0) {
      fail(`${r.n}: du=${r.du} ced=${r.ced} — both must be positive or ruin is undefined`);
    }
  } else {
    fail(`${r.n}: unknown mode ${JSON.stringify(r.m)}`);
  }
}

// ── 3. The primary measure is floored. This is the whole point of the fix. ───
let worstROC = 0;
for (const h of HZ) {
  for (const r of RAW) {
    const v = returnOnCapital(r, h);
    if (!Number.isFinite(v)) fail(`${r.n} @ ${h}: return on capital is not finite`);
    else if (v < RUIN_FLOOR - 1e-9) fail(`${r.n} @ ${h}: return on capital ${v.toFixed(2)}% breaches the ${RUIN_FLOOR}% floor`);
    worstROC = Math.min(worstROC, v);
  }
}

// ── 4. Turnover cost exists only where there is turnover, and stays unfloored ─
let worstTurnover = 0;
for (const r of RAW.filter((x) => x.m === 'g')) {
  for (const h of HZ) worstTurnover = Math.min(worstTurnover, expectedTurnoverCost(r.e!, r.du!, r.ced!, h));
}
if (worstTurnover >= RUIN_FLOOR) {
  fail('no turnover cost passes −100% — it has been floored, which erases the distinction this fix draws');
}

// ── 5. The two measures diverge exactly at the ruin point ────────────────────
// If this fails, the floored chart and the ruin markers are telling different stories
// and one of them is lying to the reader.
let mismatches = 0;
for (const h of HZ) {
  for (const r of RAW.filter((x) => x.m === 'g')) {
    const atFloor = returnOnCapital(r, h) <= RUIN_FLOOR + 1e-9;
    const rp = ruinDecisions(r);
    const past = rp !== null && rp <= decisionCount(r.du!, h) + 1e-9;
    if (atFloor !== past) {
      mismatches++;
      fail(`${r.n} @ ${h}: at floor=${atFloor} but ruin point reached=${past}`);
    }
  }
}

// ── 6. Every losing row can say how it ends ──────────────────────────────────
for (const r of RAW) {
  const losing = r.m === 'g' ? r.e! < 0 : r.a! < 0;
  if (losing && ruinDecisions(r) === null && decayYears90(r) === null) {
    fail(`${r.n}: loses capital but reports neither a ruin point nor a decay horizon`);
  }
}

// ── 6b. A positive edge still carries risk, and says so ──────────────────────
// Expected ruin is null for a winning game, but flat stakes can still go broke; the
// page must report that probability (strictly between 0 and 1) and the Kelly multiple.
for (const r of RAW.filter((x) => x.m === 'g' && x.e! > 0)) {
  const rr = ruinRisk(r), km = kellyMultiple(r);
  if (rr === null || !(rr > 0 && rr < 1)) fail(`${r.n}: positive edge but ruin risk is ${rr}`);
  if (km === null || !(km > 0)) fail(`${r.n}: positive edge but Kelly multiple is ${km}`);
}
for (const r of RAW.filter((x) => x.m === 'g' && x.e! <= 0)) {
  if (ruinRisk(r) !== null) fail(`${r.n}: losing game should report expected ruin, not a ruin probability`);
}

// ── 6b'. The payoff shape is honoured (Action 2.13) ──────────────────────────
// Even money must still give the closed form ((1-e)/(1+e))^units; a `pay` row must give
// Kelly e/b, a ruin root that solves p·z^(b+1) - z + q = 0, and MORE risk than the same
// edge at even money — a long payoff is a higher-variance way to earn the same edge.
const payRows = RAW.filter((x) => x.m === 'g' && x.e! > 0 && x.pay !== undefined);
if (payRows.length === 0) fail('no positive-edge row carries a payout; the top-heavy path is untested');
for (const r of RAW.filter((x) => x.m === 'g' && x.e! > 0)) {
  const e = r.e! / 100, units = 100 / r.ced!, b = r.pay ?? 1;
  const rr = ruinRisk(r)!, km = kellyMultiple(r)!;
  if (Math.abs(km - r.ced! / (r.e! / b)) > 1e-9) fail(`${r.n}: Kelly multiple ${km} is not ced / (e/b)`);
  const z = Math.pow(rr, 1 / units), p = (1 + e) / (1 + b);
  if (Math.abs(p * Math.pow(z, b + 1) - z + (1 - p)) > 1e-9) fail(`${r.n}: ruin root ${z} does not solve the payoff equation`);
  const even = ruinRisk({ ...r, pay: undefined })!;
  if (b === 1 && Math.abs(rr - Math.pow((1 - e) / (1 + e), units)) > 1e-12) fail(`${r.n}: even-money ruin risk drifted from the closed form`);
  if (b > 1 && !(rr > even)) fail(`${r.n}: a ${b}x payoff should carry more ruin risk (${rr}) than even money (${even})`);
}

// ── 6c. Real returns sit below nominal and keep the floor ────────────────────
if (!(INFLATION > 0)) fail(`INFLATION is ${INFLATION}; the real layer would be a no-op`);
for (const h of HZ) {
  for (const r of RAW) {
    const v = returnOnCapital(r, h), real = realReturn(v, h);
    if (real > v + 1e-9) fail(`${r.n} @ ${h}: real return ${real.toFixed(2)}% exceeds nominal ${v.toFixed(2)}%`);
    if (real < RUIN_FLOOR - 1e-9) fail(`${r.n} @ ${h}: real return breaches the floor`);
  }
}

// ── 7. The single-event horizon never claims one unit for both kinds ─────────
const game = RAW.find((r) => r.m === 'g')!;
const asset = RAW.find((r) => r.m === 'i')!;
if (rowHzLabel(game, '1du') === rowHzLabel(asset, '1du')) {
  fail(`"1du" labels a wager and a trading day identically ("${rowHzLabel(game, '1du')}") — the Audit D1 conflation`);
}

// ── 8. Investing must be legible on the primary axis ─────────────────────────
// The 10-year view is where the old shared axis was worst: the best investment
// occupied 2.83% of the plotted span. Under a quarter means the mixing is back.
const MIN_INVESTING_SHARE = 25;
const tenYear = RAW.map((r) => returnOnCapital(r, '10yr'));
const span = Math.max(...tenYear) - Math.min(...tenYear);
const bestInvesting = Math.max(...RAW.filter((r) => r.m === 'i').map((r) => returnOnCapital(r, '10yr')));
const share = (bestInvesting / span) * 100;
if (share < MIN_INVESTING_SHARE) {
  fail(`at 10 years the best investment spans only ${share.toFixed(2)}% of the axis (min ${MIN_INVESTING_SHARE}%)`);
}

// ── 9. The "verify" badge flags undated and year-old figures (Action 2.10) ───
// Clock pinned, so a citation ageing past a year shows on the page but never fails CI.
const DAY = 864e5, NOW = Date.parse('2026-10-19');
if (!isStale({ n: 'x', cat: 'x', m: 'i' }, NOW)) fail('isStale: a row with no asOf must be flagged');
if (isStale({ n: 'x', cat: 'x', m: 'i', asOf: '2026-10-19' }, NOW)) fail('isStale: a figure verified today was flagged');
if (isStale({ n: 'x', cat: 'x', m: 'i', asOf: '2025-10-19' }, NOW)) fail('isStale: a figure exactly a year old was flagged');
if (!isStale({ n: 'x', cat: 'x', m: 'i', asOf: '2025-10-19' }, NOW + DAY)) fail('isStale: a figure a year and a day old was not flagged');
// A math row with a derivation is never badged, however old its date (audit PROD-07).
const DECADE = NOW + 3650 * DAY;
if (isStale({ n: 'x', cat: 'x', m: 'g', b: 'math', how: 'rule', asOf: '2025-10-19' }, DECADE)) fail('isStale: a math row with a derivation was flagged');
if (!isStale({ n: 'x', cat: 'x', m: 'g', b: 'math' }, NOW)) fail('isStale: a math row with no derivation must still be flagged');
for (const r of RAW.filter((x) => x.b === 'math' && isStale(x, DECADE))) fail(`${r.n}: a math row the page would badge "verify"`);
for (const r of RAW.filter((x) => x.src && !(x.asOf && Number.isFinite(Date.parse(x.asOf))))) {
  fail(`${r.n}: cites a source but has no valid asOf date, so the page would flag it forever`);
}
const staleToday = RAW.filter((r) => isStale(r, Date.now())).length;

console.log(`Spectrum check — ${RAW.length} records, ${HZ.length} horizons, read live from the page`);
console.log(`  return on capital       worst ${worstROC.toFixed(2)}%  (floor ${RUIN_FLOOR}%)`);
console.log(`  expected turnover cost  worst ${worstTurnover.toFixed(0)}%  (deliberately unfloored)`);
console.log(`  floor / ruin-point disagreements: ${mismatches}`);
console.log(`  best investment spans ${share.toFixed(2)}% of the 10-year axis (was 2.83%)`);
console.log(`  rows the page flags "verify" today: ${staleToday}`);
for (const h of HZ) {
  const ruined = RAW.filter((r) => {
    const rp = ruinDecisions(r);
    return rp !== null && rp <= decisionCount(r.du!, h);
  }).length;
  console.log(`  ${h.padEnd(5)} ruined by horizon: ${String(ruined).padStart(3)}`);
}

if (failures.length > 0) {
  console.error(`\n${failures.length} problem(s):`);
  for (const f of failures.slice(0, 25)) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('\nSpectrum check passed: capital returns are floored, turnover cost is not, and the two agree on ruin.');
