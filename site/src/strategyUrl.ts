/**
 * Strategy ⇄ query string, so a backtest can be bookmarked or sent as a link:
 * `/backtester?sport=NBA&betType=spread&side=home&from=2015&to=2024&…`.
 *
 * A URL is untrusted input, but it only ever reaches the endpoint as a POST
 * body that `server/strategySchema.ts` validates regardless. This parser's job
 * is narrower: turn *any* query string into a strategy that schema accepts, so
 * a hand-edited or stale link degrades to defaults field by field instead of
 * opening on an error banner. `npm run check:strategy-url` holds it to that.
 *
 * Checks against the lists and bounds in `strategyBounds.ts`, not Zod — this
 * runs in the client bundle.
 */
import type { Strategy } from './types';
import {
  BET_TYPES, MAX_AMERICAN_ODDS, MAX_SEASON, MAX_SPREAD_POINTS, MAX_STARTING_BANKROLL,
  MAX_TOTAL_POINTS, MAX_UNIT_SIZE, MIN_SEASON, SIDE_SELECTIONS, SPORTS, STREAK_FILTERS,
  TOTALS_SIDES,
} from './strategyBounds';

export const DEFAULT_STRATEGY: Strategy = {
  sport: 'NFL',
  startYear: 2020,
  endYear: 2024,
  betType: 'moneyline',
  sideSelection: 'favorites',
  streakFilter: 'any',
  unitSize: 100,
  startingBankroll: 10000,
};

// Strategy field → query key. Short keys where the field name is long.
const KEYS = {
  sport: 'sport', betType: 'betType', sideSelection: 'side', streakFilter: 'streak',
  startYear: 'from', endYear: 'to', unitSize: 'unit', startingBankroll: 'bankroll',
  oddsMin: 'oddsMin', oddsMax: 'oddsMax', spreadMin: 'spreadMin', spreadMax: 'spreadMax',
  totalMin: 'totalMin', totalMax: 'totalMax',
} as const satisfies Partial<Record<keyof Strategy, string>>;

/** Serialize every field the engine reads; optional filters only when set. */
export function strategyToQuery(s: Strategy): string {
  const q = new URLSearchParams();
  for (const [field, key] of Object.entries(KEYS) as [keyof typeof KEYS, string][]) {
    const v = s[field];
    if (v !== undefined && v !== null) q.set(key, String(v));
  }
  return q.toString();
}

function pick<T extends string>(raw: string | null, allowed: readonly T[]): T | undefined {
  return allowed.find((a) => a.toLowerCase() === raw?.toLowerCase());
}

function num(raw: string | null, min: number, max: number, int = false): number | undefined {
  if (raw === null || raw.trim() === '') return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < min || n > max || (int && !Number.isInteger(n))) return undefined;
  return n;
}

/** A min/max filter pair survives only if it is ordered; otherwise both go. */
function pair(min: number | undefined, max: number | undefined): [number?, number?] {
  return min !== undefined && max !== undefined && min > max ? [] : [min, max];
}

/**
 * Parse a query string into a schema-valid strategy. Unknown keys are ignored;
 * any field that is missing or out of bounds falls back to `DEFAULT_STRATEGY`.
 */
export function strategyFromQuery(search: string | URLSearchParams): Strategy {
  const q = typeof search === 'string' ? new URLSearchParams(search) : search;
  const d = DEFAULT_STRATEGY;
  const get = (field: keyof typeof KEYS) => q.get(KEYS[field]);

  const betType = pick(get('betType'), BET_TYPES) ?? d.betType;
  const totalsSides: readonly string[] = TOTALS_SIDES;
  let sideSelection = pick(get('sideSelection'), SIDE_SELECTIONS);
  // The schema rejects a side that does not belong to the bet type.
  if (!sideSelection || (betType === 'totals') !== totalsSides.includes(sideSelection)) {
    sideSelection = betType === 'totals' ? 'over' : d.sideSelection;
  }

  const startYear = num(get('startYear'), MIN_SEASON, MAX_SEASON, true) ?? d.startYear;
  let endYear = num(get('endYear'), MIN_SEASON, MAX_SEASON, true) ?? d.endYear;
  if (endYear < startYear) endYear = startYear;

  const [oddsMin, oddsMax] = pair(
    num(get('oddsMin'), -MAX_AMERICAN_ODDS, MAX_AMERICAN_ODDS),
    num(get('oddsMax'), -MAX_AMERICAN_ODDS, MAX_AMERICAN_ODDS),
  );
  const [spreadMin, spreadMax] = pair(
    num(get('spreadMin'), 0, MAX_SPREAD_POINTS),
    num(get('spreadMax'), 0, MAX_SPREAD_POINTS),
  );
  const [totalMin, totalMax] = pair(
    num(get('totalMin'), 0, MAX_TOTAL_POINTS),
    num(get('totalMax'), 0, MAX_TOTAL_POINTS),
  );

  // Money must be strictly positive; `num` allows 0, so bound from a hair above.
  const unitSize = num(get('unitSize'), Number.MIN_VALUE, MAX_UNIT_SIZE) ?? d.unitSize;
  const startingBankroll =
    num(get('startingBankroll'), Number.MIN_VALUE, MAX_STARTING_BANKROLL) ?? d.startingBankroll;

  return {
    sport: pick(get('sport'), SPORTS) ?? d.sport,
    startYear, endYear, betType, sideSelection,
    streakFilter: pick(get('streakFilter'), STREAK_FILTERS) ?? d.streakFilter,
    unitSize, startingBankroll,
    oddsMin, oddsMax, spreadMin, spreadMax, totalMin, totalMax,
  };
}
