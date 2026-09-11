/**
 * Regression guard for the simulated market.
 *
 * Every naive strategy must lose roughly the book's hold. The band is wider
 * than the 4.55% overround because discretising scores and posting lines on
 * the half point leaves a point or so of slack; what it will not tolerate is a
 * naive strategy drifting toward profit, which is the failure this exists to
 * catch.
 */
import { marketDiagnostics, MARKET_OVERROUND } from '../src/dataGenerator';

const HOLD = ((MARKET_OVERROUND - 1) / MARKET_OVERROUND) * 100;
const MAX_ROI = -2.5; // nothing may approach break-even
const MIN_ROI = -7.0; // nor may the book gouge far past its stated hold

const results = marketDiagnostics();
const failures = results.filter((r) => r.roi > MAX_ROI || r.roi < MIN_ROI);

console.log(`Simulated hold: ${HOLD.toFixed(2)}%  |  accepted band: ${MIN_ROI}% to ${MAX_ROI}%\n`);
for (const r of results) {
  const label = `${r.sport} ${r.betType}/${r.sideSelection}`.padEnd(30);
  const bad = r.roi > MAX_ROI || r.roi < MIN_ROI;
  console.log(
    `${bad ? 'FAIL' : ' ok '}  ${label} bets=${String(r.bets).padStart(6)}` +
      ` win%=${r.winRate.toFixed(1).padStart(5)} roi=${r.roi.toFixed(2).padStart(7)}%`,
  );
}

const rois = results.map((r) => r.roi);
console.log(
  `\n${results.length} naive strategies | worst ${Math.min(...rois).toFixed(2)}%` +
    ` | best ${Math.max(...rois).toFixed(2)}%`,
);

if (failures.length > 0) {
  console.error(`\n${failures.length} strategy/strategies outside the band — the market is leaking edge.`);
  process.exit(1);
}
console.log('\nMarket check passed: the hold is the only edge in the data.');
