/**
 * Request schema for the backtest engine.
 *
 * Presence used to be the only check: `{ startYear: 1900, endYear: 3000 }`
 * asked the generator for ~1,100 seasons inside a serverless function, which
 * is a timeout at best and a denial-of-wallet at worst. Everything the engine
 * reads off a `Strategy` is bounded here instead.
 *
 * Lives in `src/server/` alongside the other shared request logic, so the
 * Express dev route and the Vercel function enforce one set of rules. The
 * bounds themselves are in `../strategyBounds.ts`, which the strategy form
 * also imports — the form clamps to the same numbers, so it cannot build a
 * request this schema would reject.
 */
import { z } from 'zod';
import type { BetType, SideSelectionType, SportType, Strategy } from '../types.js';
import {
  MAX_AMERICAN_ODDS, MAX_SEASON, MAX_SPREAD_POINTS, MAX_STARTING_BANKROLL,
  MAX_TOTAL_POINTS, MAX_UNIT_SIZE, MIN_SEASON,
} from '../strategyBounds.js';

// Re-exported so server-side callers have a single import for the schema and
// the numbers behind it; the client imports `strategyBounds` directly.
export * from '../strategyBounds.js';

/**
 * `never` unless the two unions have exactly the same members. Used below so
 * that adding a sport or a selection to `types.ts` without adding it here is a
 * `tsc --noEmit` failure rather than a request the UI can build and the API
 * then rejects.
 */
type SameMembers<Union extends string, Listed extends string> =
  [Union] extends [Listed] ? ([Listed] extends [Union] ? true : never) : never;

const SPORTS = ['NFL', 'NBA', 'MLB', 'NHL'] as const;
const BET_TYPES = ['moneyline', 'spread', 'totals'] as const;
const TOTALS_SIDES = ['over', 'under'] as const;
const SIDE_SELECTIONS = [
  'favorites', 'underdogs', 'home', 'away',
  'home_favorites', 'away_favorites', 'home_underdogs', 'away_underdogs',
  'after_win', 'after_loss', 'hot_streak', 'cold_streak',
  'rest_advantage', 'rest_disadvantage',
  ...TOTALS_SIDES,
] as const;
const STREAK_FILTERS = ['any', 'after_win', 'after_loss', 'hot_streak_3plus', 'cold_streak_3plus'] as const;
const STREAK_TARGETS = ['bet_team', 'opponent'] as const;
const STAR_PLAYER_FILTERS = ['any', 'healthy_only', 'star_injured'] as const;

const _sportsCovered: SameMembers<SportType, typeof SPORTS[number]> = true;
const _betTypesCovered: SameMembers<BetType, typeof BET_TYPES[number]> = true;
const _sidesCovered: SameMembers<SideSelectionType, typeof SIDE_SELECTIONS[number]> = true;
const _streakFiltersCovered: SameMembers<Strategy['streakFilter'], typeof STREAK_FILTERS[number]> = true;
const _streakTargetsCovered: SameMembers<Strategy['streakTarget'], typeof STREAK_TARGETS[number]> = true;
const _starFiltersCovered: SameMembers<Strategy['starPlayerFilter'], typeof STAR_PLAYER_FILTERS[number]> = true;
void [_sportsCovered, _betTypesCovered, _sidesCovered,
      _streakFiltersCovered, _streakTargetsCovered, _starFiltersCovered];

const season = z.number().int().min(MIN_SEASON).max(MAX_SEASON);
const americanOdds = z.number().finite().min(-MAX_AMERICAN_ODDS).max(MAX_AMERICAN_ODDS);
const points = (max: number) => z.number().finite().min(0).max(max);
const money = (max: number) => z.number().finite().positive().max(max);

/** A min/max pair is only a filter if the min is not above the max. */
function requireOrdered(
  ctx: z.RefinementCtx,
  min: number | undefined,
  max: number | undefined,
  maxField: string,
  label: string,
) {
  if (min !== undefined && max !== undefined && min > max) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [maxField],
      message: `${label} maximum must be greater than or equal to the minimum`,
    });
  }
}

// Unknown keys are stripped rather than rejected (Zod's default), so what
// reaches the engine is exactly the shape below and nothing a caller appended.
export const strategySchema = z
  .object({
    id: z.string().max(128).optional(),
    sport: z.enum(SPORTS),
    startYear: season,
    endYear: season,
    betType: z.enum(BET_TYPES),
    sideSelection: z.enum(SIDE_SELECTIONS),
    oddsMin: americanOdds.optional(),
    oddsMax: americanOdds.optional(),
    spreadMin: points(MAX_SPREAD_POINTS).optional(),
    spreadMax: points(MAX_SPREAD_POINTS).optional(),
    totalMin: points(MAX_TOTAL_POINTS).optional(),
    totalMax: points(MAX_TOTAL_POINTS).optional(),
    // The engine only reads these when they are set; defaulting keeps a
    // hand-written API call from landing in the "not 'any'" branch as undefined.
    streakFilter: z.enum(STREAK_FILTERS).default('any'),
    streakTarget: z.enum(STREAK_TARGETS).default('bet_team'),
    starPlayerFilter: z.enum(STAR_PLAYER_FILTERS).default('any'),
    unitSize: money(MAX_UNIT_SIZE),
    startingBankroll: money(MAX_STARTING_BANKROLL),
  })
  .superRefine((s, ctx) => {
    if (s.endYear < s.startYear) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endYear'],
        message: 'endYear must be greater than or equal to startYear',
      });
    }

    // The UI cannot build a mismatched pair — the selection dropdown is keyed
    // off the bet type — but a direct caller or an AI-suggested template can,
    // and the engine answers it with a silent zero-bet run.
    const isTotalsSide = (TOTALS_SIDES as readonly string[]).includes(s.sideSelection);
    if (s.betType === 'totals' && !isTotalsSide) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sideSelection'],
        message: `totals bets take one of: ${TOTALS_SIDES.join(', ')}`,
      });
    }
    if (s.betType !== 'totals' && isTotalsSide) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sideSelection'],
        message: `'${s.sideSelection}' is only valid for totals bets`,
      });
    }

    requireOrdered(ctx, s.oddsMin, s.oddsMax, 'oddsMax', 'Odds');
    requireOrdered(ctx, s.spreadMin, s.spreadMax, 'spreadMax', 'Spread');
    requireOrdered(ctx, s.totalMin, s.totalMax, 'totalMax', 'Total');
  });

/**
 * Compile-time check that the schema still describes `Strategy`: a rename or a
 * dropped field in `types.ts` fails here. It is an input-side check because
 * this project's `tsconfig.json` is not in strict mode, and without
 * `strictNullChecks` Zod infers every output field as optional.
 */
const _schemaAcceptsStrategy: z.input<typeof strategySchema> = {} as Strategy;
/** ...and that neither side has gained or lost a field the other lacks. */
const _schemaFieldsMatch: SameMembers<keyof Strategy, keyof z.input<typeof strategySchema>> = true;
void [_schemaAcceptsStrategy, _schemaFieldsMatch];

/** Flatten Zod issues into one line per problem, e.g. `startYear: ...`. */
export function formatIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const field = issue.path.join('.');
    return field ? `${field}: ${issue.message}` : issue.message;
  });
}

export interface StrategyValidation {
  /** True when `strategy` holds a bounded, engine-safe strategy. */
  ok: boolean;
  /** The parsed strategy — unknown keys stripped, defaults applied. */
  strategy: Strategy | null;
  /** One line per failed field; empty when `ok`. */
  errors: string[];
}

/**
 * Validate an untrusted request body. Called by `runValidatedBacktest`, which
 * both entry points go through — the endpoint is the thing being abused, so
 * this runs server-side on every request regardless of what the form did.
 *
 * Uses `parse`/`catch` rather than `safeParse` deliberately: narrowing on a
 * boolean discriminant needs `strictNullChecks`, which this project does not
 * enable, so `safeParse(...).error` does not type-check here.
 */
export function validateStrategy(input: unknown): StrategyValidation {
  try {
    // Cast for the same non-strict-mode reason as `_schemaAcceptsStrategy`
    // above: the schema marks these fields required, Zod's inference cannot
    // say so without `strictNullChecks`.
    const strategy = strategySchema.parse(input) as Strategy;
    return { ok: true, strategy, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false, strategy: null, errors: formatIssues(error) };
    }
    throw error;
  }
}
