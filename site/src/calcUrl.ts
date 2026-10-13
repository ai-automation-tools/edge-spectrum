/**
 * Query string → initial state for the two calculators, so another page (the
 * Spectrum inspector, a blog post) can open them pre-filled:
 *
 *   /odds?odds=-110                    the converter's price
 *   /odds?legs=-110,-110&method=shin   the no-vig market, one price per outcome
 *   /parlay?n=4                        four legs at -110 / -110
 *   /parlay?legs=-110/-110,%2B150/-180 your side / other side per leg (a literal '+'
 *                                      is a space in a query string, so encode it)
 *   /parlay?legs=-110,-110&quoted=+600 one price per leg (other side assumed equal)
 *
 * `format` and `method` name an odds format and a de-vig method. A URL is
 * untrusted input: anything that does not parse under the chosen format is
 * dropped and the page opens on its usual defaults, field by field. Held by
 * `npm run check:calc-url`. Only `odds.ts` is imported, so this stays in the
 * client bundle without pulling anything else in.
 */
import {
  type OddsFormat, type DevigMethod, FORMAT_LABEL, METHOD_LABEL,
  americanToDecimal, formatOdds, parseOdds,
} from './odds';

const MAX_LEGS = 15;

const pick = <T extends string>(v: string | null, allowed: Record<T, string>, fallback: T): T =>
  v !== null && Object.prototype.hasOwnProperty.call(allowed, v) ? (v as T) : fallback;

const toQuery = (search: string | URLSearchParams) =>
  typeof search === 'string' ? new URLSearchParams(search) : search;

/** A price string the page can show as typed, or null if it does not parse under `format`. */
const valid = (text: string | null, format: OddsFormat): string | null =>
  text !== null && text.trim() !== '' && parseOdds(text, format) !== null ? text.trim() : null;

const splitList = (text: string | null): string[] =>
  text === null ? [] : text.split(',').map((s) => s.trim()).filter(Boolean).slice(0, MAX_LEGS);

export interface OddsPageQuery {
  format: OddsFormat;
  method: DevigMethod;
  /** Converter price, or null to leave the page's default. */
  odds: string | null;
  /** No-vig outcome prices (at least two), or null to leave the page's defaults. */
  legs: string[] | null;
}

export function oddsFromQuery(search: string | URLSearchParams): OddsPageQuery {
  const q = toQuery(search);
  const format = pick<OddsFormat>(q.get('format'), FORMAT_LABEL, 'american');
  const method = pick<DevigMethod>(q.get('method'), METHOD_LABEL, 'multiplicative');
  const legs = splitList(q.get('legs')).map((s) => valid(s, format));
  return {
    format,
    method,
    odds: valid(q.get('odds'), format),
    legs: legs.length >= 2 && legs.every((l): l is string => l !== null) ? legs : null,
  };
}

export interface ParlayPageQuery {
  format: OddsFormat;
  method: DevigMethod;
  /** The book's quoted parlay price, or '' for the page's empty default. */
  quoted: string;
  /** Legs as the page shows them, or null to leave the page's defaults. */
  legs: { side: string; other: string }[] | null;
}

export function parlayFromQuery(search: string | URLSearchParams): ParlayPageQuery {
  const q = toQuery(search);
  const format = pick<OddsFormat>(q.get('format'), FORMAT_LABEL, 'american');
  const method = pick<DevigMethod>(q.get('method'), METHOD_LABEL, 'multiplicative');
  const quoted = valid(q.get('quoted'), format) ?? '';

  // `legs` wins over `n`; `n` is a count of standard -110 legs in whatever format is chosen.
  const pairs = splitList(q.get('legs')).map((item) => {
    const [a, b] = item.split('/');
    const side = valid(a ?? null, format);
    const other = b === undefined ? side : valid(b, format);
    return side !== null && other !== null ? { side, other } : null;
  });
  if (pairs.length >= 1 && pairs.every((p): p is { side: string; other: string } => p !== null)) {
    return { format, method, quoted, legs: pairs };
  }

  const n = Number(q.get('n'));
  if (Number.isInteger(n) && n >= 1 && n <= MAX_LEGS) {
    const std = formatOdds(americanToDecimal(-110), format);
    return { format, method, quoted, legs: Array.from({ length: n }, () => ({ side: std, other: std })) };
  }
  return { format, method, quoted, legs: null };
}
