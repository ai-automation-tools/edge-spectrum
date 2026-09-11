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
  a?: number; e?: number; du?: number; ced?: number;
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
};

// eslint-disable-next-line no-eval
const page = eval(
  `(() => {\n${section('// MATH & CONSTANTS', '// DATA INJECTION')}\n` +
    `${section('const RAW = [', '\nconst AR_DEFAULT')}\n` +
    'return { RAW, HZ, RUIN_FLOOR, decisionCount, expectedTurnoverCost, returnOnCapital, ruinDecisions, decayYears90, rowHzLabel };\n})()',
) as Page;

const { RAW, HZ, RUIN_FLOOR, decisionCount, expectedTurnoverCost, returnOnCapital, ruinDecisions, decayYears90, rowHzLabel } = page;

const failures: string[] = [];
const fail = (msg: string) => failures.push(msg);

// ── 1. The page still carries the dataset the docs describe ──────────────────
const EXPECTED_RECORDS = 187;
if (RAW.length !== EXPECTED_RECORDS) {
  fail(`record count is ${RAW.length}, expected ${EXPECTED_RECORDS} (update Docs/roadmap.md if intentional)`);
}
if (RUIN_FLOOR !== -100) fail(`RUIN_FLOOR is ${RUIN_FLOOR}; total capital loss is −100% by definition`);

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

console.log(`Spectrum check — ${RAW.length} records, ${HZ.length} horizons, read live from the page`);
console.log(`  return on capital       worst ${worstROC.toFixed(2)}%  (floor ${RUIN_FLOOR}%)`);
console.log(`  expected turnover cost  worst ${worstTurnover.toFixed(0)}%  (deliberately unfloored)`);
console.log(`  floor / ruin-point disagreements: ${mismatches}`);
console.log(`  best investment spans ${share.toFixed(2)}% of the 10-year axis (was 2.83%)`);
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
