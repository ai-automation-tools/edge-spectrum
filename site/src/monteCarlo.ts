/**
 * Path variance and an out-of-sample check for a backtest (roadmap Actions 4.2 and 4.3, audit
 * PROD-13). Pure functions over a run's wagers; the engine calls them and `check:engine` holds them.
 */

export interface FanPoint { index: number; p5: number; p25: number; p50: number; p75: number; p95: number }
export interface Fan { paths: number; points: FanPoint[]; bustShare: number }

/**
 * Bootstrap the run: draw `paths` sequences of the same length from the wagers' net results, with
 * replacement, and report the 5th to 95th percentile of cumulative profit at `points` checkpoints.
 * A path stops, as the engine does, once the bankroll can no longer cover a stake.
 */
export function fanChart(nets: readonly number[], bankroll: number, stake: number, rng: () => number, paths = 1000, points = 100): Fan {
  const n = nets.length;
  if (n === 0) return { paths: 0, points: [], bustShare: 0 };
  const marks = [...new Set(Array.from({ length: Math.min(points, n) }, (_, k) => Math.round(((k + 1) * n) / Math.min(points, n))))];
  const at = marks.map(() => new Float64Array(paths));
  let busts = 0;
  for (let p = 0; p < paths; p++) {
    let profit = 0, m = 0, bust = false;
    for (let i = 1; i <= n; i++) {
      if (!bust) {
        profit += nets[Math.floor(rng() * n)];
        if (bankroll + profit < stake) bust = true;
      }
      if (i === marks[m]) at[m++][p] = profit;
    }
    if (bust) busts++;
  }
  const q = (xs: Float64Array, f: number) => xs[Math.min(xs.length - 1, Math.floor(f * xs.length))];
  return {
    paths,
    bustShare: busts / paths,
    points: marks.map((index, k) => {
      const s = at[k].sort();
      const r = (x: number) => Math.round(x * 100) / 100;
      return { index, p5: r(q(s, 0.05)), p25: r(q(s, 0.25)), p50: r(q(s, 0.5)), p75: r(q(s, 0.75)), p95: r(q(s, 0.95)) };
    }),
  };
}

export interface SplitHalf { fromYear: number; toYear: number; bets: number; roi: number; winRate: number }
export interface WalkForward { inSample: SplitHalf; outOfSample: SplitHalf; holds: boolean }

/**
 * Split the run by season: the first ~60% of seasons in sample, the rest out of sample. A fixed rule
 * that only worked by luck tends to lose its edge out of sample; `holds` says whether the sign of the
 * ROI survived. Null when the run spans fewer than two seasons or one half placed no bet.
 */
export function walkForward(
  wagers: readonly { season: number; stake: number; netResult: number; status: 'win' | 'loss' | 'push' }[],
  startYear: number, endYear: number,
): WalkForward | null {
  if (endYear <= startYear) return null;
  const cut = startYear + Math.max(1, Math.floor(0.6 * (endYear - startYear + 1))); // first out-of-sample season
  const half = (from: number, to: number): SplitHalf | null => {
    const ws = wagers.filter((w) => w.season >= from && w.season <= to);
    if (!ws.length) return null;
    const staked = ws.reduce((s, w) => s + w.stake, 0);
    const net = ws.reduce((s, w) => s + w.netResult, 0);
    const decided = ws.filter((w) => w.status !== 'push');
    const won = decided.filter((w) => w.status === 'win').length;
    const pct = (x: number) => Math.round(x * 10000) / 100;
    return { fromYear: from, toYear: to, bets: ws.length, roi: staked ? pct(net / staked) : 0, winRate: decided.length ? pct(won / decided.length) : 0 };
  };
  const inSample = half(startYear, cut - 1), outOfSample = half(cut, endYear);
  if (!inSample || !outOfSample) return null;
  return { inSample, outOfSample, holds: Math.sign(inSample.roi) === Math.sign(outOfSample.roi) };
}
