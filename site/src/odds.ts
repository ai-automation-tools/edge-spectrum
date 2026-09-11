/**
 * Odds conversion + market de-vigging. Pure functions, no imports, so the
 * calculator page (and the check script) can use it without dragging anything
 * else into the bundle.
 *
 * Internally every price is a decimal multiplier (total return per 1 unit
 * staked, e.g. -110 → 1.909). Implied probability is simply 1/decimal.
 */

export type OddsFormat = 'american' | 'decimal' | 'fractional' | 'implied';

export const FORMAT_LABEL: Record<OddsFormat, string> = {
  american: 'American',
  decimal: 'Decimal',
  fractional: 'Fractional',
  implied: 'Implied %',
};

// ── Conversions ─────────────────────────────────────────────────────────

export function americanToDecimal(a: number): number {
  return a > 0 ? 1 + a / 100 : 1 + 100 / -a;
}

export function decimalToAmerican(d: number): number {
  return d >= 2 ? (d - 1) * 100 : -100 / (d - 1);
}

/** Decimal → reduced fraction of the profit (e.g. 1.909 → 10/11). */
export function decimalToFractional(d: number, maxDen = 1000): [number, number] {
  return toFraction(d - 1, maxDen);
}

/** Best rational approximation via continued fractions, bounded denominator. */
function toFraction(x: number, maxDen: number): [number, number] {
  let [h0, h1, k0, k1] = [0, 1, 1, 0];
  let r = x;
  for (let i = 0; i < 64; i++) {
    const a = Math.floor(r);
    const h2 = a * h1 + h0;
    const k2 = a * k1 + k0;
    if (k2 > maxDen) break;
    [h0, h1, k0, k1] = [h1, h2, k1, k2];
    const frac = r - a;
    if (frac < 1e-9 || Math.abs(h1 / k1 - x) < 1e-9) break;
    r = 1 / frac;
  }
  return [h1, k1];
}

/**
 * Parse user text in the given format into decimal odds. Returns null for
 * anything unusable (empty, non-numeric, out of range, zero-probability).
 */
export function parseOdds(text: string, format: OddsFormat): number | null {
  const s = text.trim().replace(/[%+\s]/g, '');
  if (!s) return null;
  switch (format) {
    case 'american': {
      const a = Number(s);
      // |a| < 100 is not a valid American price (-100 and +100 both = 2.0).
      return Number.isFinite(a) && Math.abs(a) >= 100 ? americanToDecimal(a) : null;
    }
    case 'decimal': {
      const d = Number(s);
      return Number.isFinite(d) && d > 1 ? d : null;
    }
    case 'fractional': {
      const m = s.match(/^(\d+(?:\.\d+)?)[/-](\d+(?:\.\d+)?)$/);
      if (!m) return null;
      const num = Number(m[1]);
      const den = Number(m[2]);
      return den > 0 && num >= 0 ? 1 + num / den : null;
    }
    case 'implied': {
      // Accept 52.4 or 0.524; anything ≤ 1 is treated as a fraction.
      const raw = Number(s);
      if (!Number.isFinite(raw) || raw <= 0) return null;
      const p = raw > 1 ? raw / 100 : raw;
      return p > 0 && p < 1 ? 1 / p : null;
    }
  }
}

export function formatOdds(d: number, format: OddsFormat): string {
  switch (format) {
    case 'american': {
      const a = decimalToAmerican(d);
      const r = Math.round(a);
      return r > 0 ? `+${r}` : `${r}`;
    }
    case 'decimal':
      return d.toFixed(3);
    case 'fractional': {
      const [n, k] = decimalToFractional(d);
      return `${n}/${k}`;
    }
    case 'implied':
      return `${(100 / d).toFixed(2)}%`;
  }
}

// ── De-vigging ──────────────────────────────────────────────────────────

export type DevigMethod = 'multiplicative' | 'power' | 'shin';

export const METHOD_LABEL: Record<DevigMethod, string> = {
  multiplicative: 'Multiplicative',
  power: 'Power',
  shin: 'Shin',
};

export const METHOD_BLURB: Record<DevigMethod, string> = {
  multiplicative:
    'Scales every implied probability by the same factor so they sum to 1. Assumes the book applies margin proportionally — the classic "normalize" step.',
  power:
    'Raises each implied probability to a common exponent k so they sum to 1. Removes more margin from longshots than favorites, matching the favorite–longshot bias.',
  shin:
    'Shin (1993) models the margin as protection against insiders holding a share z of the handle. Solves for z, then backs out the true probabilities. Also longshot-aware.',
};

export interface DevigResult {
  /** Bookmaker implied probabilities (sum > 1). */
  implied: number[];
  /** Fair probabilities (sum = 1). */
  fair: number[];
  /** Σ implied − 1, e.g. 0.0476 for a −110/−110 market. */
  overround: number;
  /** Book's expected take per unit handle: 1 − 1/Σ implied. */
  hold: number;
  /** Solved parameter: exponent k (power) or insider share z (shin). */
  param?: number;
}

/** Root of a monotone decreasing f on [lo, hi] by bisection. */
function bisect(f: (x: number) => number, lo: number, hi: number, iters = 100): number {
  for (let i = 0; i < iters; i++) {
    const mid = (lo + hi) / 2;
    if (f(mid) > 0) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Remove the bookmaker's margin from a full market (all mutually exclusive
 * outcomes). `decimals` must be every side of the market, otherwise the
 * "overround" is meaningless. Throws on fewer than 2 outcomes.
 */
export function devig(decimals: number[], method: DevigMethod): DevigResult {
  if (decimals.length < 2) throw new Error('A market needs at least 2 outcomes');
  const implied = decimals.map((d) => 1 / d);
  const sum = implied.reduce((a, b) => a + b, 0);
  const base = { implied, overround: sum - 1, hold: 1 - 1 / sum };

  // A market already at or under 100% has no vig to remove.
  if (sum <= 1) return { ...base, fair: implied.map((q) => q / sum) };

  switch (method) {
    case 'multiplicative':
      return { ...base, fair: implied.map((q) => q / sum) };

    case 'power': {
      // Σ q_i^k is decreasing in k; k = 1 gives sum > 1, so the root is above 1.
      const k = bisect((k) => implied.reduce((a, q) => a + Math.pow(q, k), 0) - 1, 1, 50);
      return { ...base, fair: implied.map((q) => Math.pow(q, k)), param: k };
    }

    case 'shin': {
      const fairAt = (z: number) =>
        implied.map((q) => (Math.sqrt(z * z + 4 * (1 - z) * (q * q) / sum) - z) / (2 * (1 - z)));
      // Σ p_i(z) is decreasing in z on [0, 1); z = 0 reproduces the multiplicative case.
      const z = bisect((z) => fairAt(z).reduce((a, b) => a + b, 0) - 1, 0, 0.999999);
      return { ...base, fair: fairAt(z), param: z };
    }
  }
}

// ── Parlays ─────────────────────────────────────────────────────────────

export interface ParlayLeg {
  /** Book decimal price of the side you are taking. */
  decimal: number;
  /** Fair (de-vigged) win probability of that side. */
  fair: number;
}

export interface ParlayResult {
  /** True joint probability, assuming independent legs: Π fair_i. */
  jointProb: number;
  /** Fair parlay price: 1 / jointProb. */
  fairDecimal: number;
  /** What the book pays: the quoted price, or Π decimal_i when none is given. */
  bookDecimal: number;
  /** Expected profit per unit staked: jointProb × bookDecimal − 1. */
  ev: number;
  /** Book's expected take per unit staked: −ev. */
  hold: number;
  /** Per-leg hold on the side taken: implied − fair (informational). */
  legHolds: number[];
}

/**
 * Compare the true joint odds of a multi-leg wager against what the book pays.
 * `quotedDecimal` is the book's actual parlay/SGP price when it differs from
 * the naive product of the legs (SGPs almost always do).
 *
 * ponytail: legs are treated as independent. Correlated SGP legs make the true
 * joint probability higher (positively correlated) or lower than this — add a
 * correlation input if that ever matters.
 */
export function parlay(legs: ParlayLeg[], quotedDecimal?: number): ParlayResult {
  if (legs.length < 1) throw new Error('A parlay needs at least 1 leg');
  const jointProb = legs.reduce((p, l) => p * l.fair, 1);
  const bookDecimal = quotedDecimal ?? legs.reduce((d, l) => d * l.decimal, 1);
  const ev = jointProb * bookDecimal - 1;
  return {
    jointProb,
    fairDecimal: 1 / jointProb,
    bookDecimal,
    ev,
    hold: -ev,
    legHolds: legs.map((l) => 1 / l.decimal - l.fair),
  };
}
