/**
 * Kelly sizing (roadmap Action 6.3, audit PROD-11). Pure functions, no React, so the
 * calculator page and any later simulator grid size bets with the same arithmetic.
 *
 * A bet is a win probability `p` and a decimal price `d`; `b = d - 1` is the net win per unit.
 * Held by `npm run check:odds`.
 */

export interface Bet { p: number; d: number }

/** Full-Kelly fraction of bankroll, `(b p - q) / b`; 0 when the bet has no edge. */
export function kellyFraction({ p, d }: Bet): number {
  const b = d - 1;
  if (!(b > 0) || !(p > 0 && p < 1)) return 0;
  return Math.max(0, (b * p - (1 - p)) / b);
}

/** Expected return per unit staked: `p d - 1`. */
export const edge = ({ p, d }: Bet) => p * d - 1;

/** Expected log growth of the bankroll per bet when staking fraction `f`. */
export function growthRate({ p, d }: Bet, f: number): number {
  if (f >= 1) return -Infinity;
  return p * Math.log1p(f * (d - 1)) + (1 - p) * Math.log1p(-f);
}

/**
 * Chance the bankroll ever falls to `level` (e.g. 0.5 = halved) when staking `multiple` of full
 * Kelly: `level^(2/multiple - 1)`. The continuous-time result (Thorp); it is close for small edges
 * and a guide, not exact, for large ones. Proportional staking never reaches zero, so this, not
 * ruin, is the risk to read. Overbetting at 2x Kelly or more makes every drawdown certain.
 */
export function drawdownChance(level: number, multiple: number): number {
  if (!(level > 0 && level < 1) || !(multiple > 0)) throw new Error('level in (0, 1), multiple > 0');
  const exponent = 2 / multiple - 1;
  return exponent <= 0 ? 1 : level ** exponent;
}

/** Most bets the simultaneous solver takes: it enumerates all 2^n outcomes. */
export const MAX_SIMULTANEOUS = 8;

/**
 * Kelly fractions for independent bets settled at the same time: the stakes that maximise the
 * expected log of the bankroll across every win/lose combination. Projected gradient ascent with
 * step halving; each fraction stays >= 0 and the total stays below the bankroll.
 */
export function simultaneousKelly(bets: Bet[]): number[] {
  const n = bets.length;
  if (n === 0) return [];
  if (n > MAX_SIMULTANEOUS) throw new Error(`at most ${MAX_SIMULTANEOUS} simultaneous bets`);
  // Each outcome: its probability and each bet's net return per unit in it.
  const outcomes = Array.from({ length: 2 ** n }, (_, mask) => {
    let prob = 1;
    const r = bets.map(({ p, d }, i) => {
      const won = (mask >> i) & 1;
      prob *= won ? p : 1 - p;
      return won ? d - 1 : -1;
    });
    return { prob, r };
  });
  const growth = (f: number[]) => {
    let g = 0;
    for (const { prob, r } of outcomes) {
      const w = 1 + r.reduce((s, ri, i) => s + ri * f[i], 0);
      if (w <= 0) return -Infinity;
      if (prob > 0) g += prob * Math.log(w);
    }
    return g;
  };
  let f = bets.map(() => 0);
  let g = growth(f);
  let step = 0.5;
  for (let iter = 0; iter < 5000 && step > 1e-12; iter++) {
    const grad = bets.map((_, i) => outcomes.reduce((s, { prob, r }) => s + (prob * r[i]) / (1 + r.reduce((t, rj, j) => t + rj * f[j], 0)), 0));
    const next = f.map((fi, i) => Math.max(0, fi + step * grad[i]));
    const gNext = growth(next);
    if (gNext > g) { f = next; g = gNext; step *= 1.2; } else step /= 2;
  }
  return f;
}
