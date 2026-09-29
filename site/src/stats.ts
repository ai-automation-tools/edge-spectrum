/**
 * Hit-rate inference for a backtest: "is this edge real, or noise?"
 * Pure functions, no imports — the engine calls them server-side and
 * `npm run check:stats` holds them.
 *
 * Every figure is over *decided* wagers (wins + losses); pushes return the
 * stake and carry no information about the hit rate, matching `winRate`.
 */

/** Below this many wagers the panel warns that the sample is too small to read. */
export const MIN_RELIABLE_SAMPLE = 250;

const Z95 = 1.959963984540054;

/**
 * The hit rate at which a flat-staked run breaks even at its realised prices.
 * With every bet winning at the same rate p, EV = p·Σd − n = 0, so p = n / Σd —
 * i.e. 1 / (mean decimal odds). -110 both ways gives the familiar 52.38%.
 */
export function breakevenRate(decimals: number[]): number {
  const sum = decimals.reduce((a, d) => a + d, 0);
  return sum > 0 ? decimals.length / sum : 0;
}

/** Wilson score 95% interval for k successes in n trials — well-behaved near 0, 1 and small n. */
export function wilsonInterval(k: number, n: number, z = Z95): [number, number] {
  if (n <= 0) return [0, 1];
  const p = k / n;
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const centre = (p + z2 / (2 * n)) / denom;
  const half = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / denom;
  return [Math.max(0, centre - half), Math.min(1, centre + half)];
}

/**
 * Exact one-tailed binomial p-value for H0: hit rate ≤ p0, i.e. P(X ≥ k) with
 * X ~ Bin(n, p0). Summed in log space so n in the tens of thousands neither
 * underflows nor needs an approximation. O(n).
 */
export function binomialUpperTail(k: number, n: number, p0: number): number {
  if (k <= 0) return 1;
  if (k > n) return 0;
  if (p0 <= 0) return 0;
  if (p0 >= 1) return 1;
  const logOdds = Math.log(p0 / (1 - p0));
  const step = (i: number) => Math.log((n - i) / (i + 1)) + logOdds; // log pmf(i+1) − log pmf(i)
  let logPmf = n * Math.log1p(-p0); // log P(X = 0)
  for (let i = 0; i < k; i++) logPmf += step(i);
  let logTail = -Infinity;
  for (let i = k; i <= n; i++) {
    const hi = Math.max(logTail, logPmf);
    logTail = hi + Math.log1p(Math.exp(Math.min(logTail, logPmf) - hi));
    if (i < n) logPmf += step(i);
  }
  return Math.min(1, Math.max(0, Math.exp(logTail)));
}
