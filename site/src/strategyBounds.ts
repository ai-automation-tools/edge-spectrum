/**
 * The numeric bounds a strategy must satisfy.
 *
 * Split out from `server/strategySchema.ts`, which turns these into the Zod
 * schema the endpoint enforces, so that the strategy form can share the exact
 * same numbers without pulling Zod into the client bundle — that bundle is
 * already one 776 KB chunk and shrinking it is a tracked roadmap item.
 *
 * The schema is the authority; these are what the form clamps to so it cannot
 * build a request the endpoint would reject.
 */

/** The generator only has era ratings for these seasons. */
export const MIN_SEASON = 2000;
export const MAX_SEASON = 2025;

/** Money caps. Well past any plausible input, tight enough to keep the
 *  arithmetic in a range where `toFixed` still returns a readable number. */
export const MAX_UNIT_SIZE = 1_000_000;
export const MAX_STARTING_BANKROLL = 1_000_000_000;

/** Screening-filter bounds. These are comparison thresholds, not quotes, so
 *  they are deliberately loose — they only have to exclude nonsense. */
export const MAX_AMERICAN_ODDS = 100_000;
export const MAX_SPREAD_POINTS = 100;
export const MAX_TOTAL_POINTS = 500;

/** The enum values the schema accepts. Here rather than in the schema so the
 *  share-link parser (`strategyUrl.ts`) can check a query string against the
 *  same lists without Zod; the schema asserts they still match `types.ts`. */
export const SPORTS = ['NFL', 'NBA', 'MLB', 'NHL'] as const;
export const BET_TYPES = ['moneyline', 'spread', 'totals'] as const;
export const TOTALS_SIDES = ['over', 'under'] as const;
export const SIDE_SELECTIONS = [
  'favorites', 'underdogs', 'home', 'away',
  'home_favorites', 'away_favorites', 'home_underdogs', 'away_underdogs',
  'after_win', 'after_loss', 'hot_streak', 'cold_streak',
  'rest_advantage', 'rest_disadvantage',
  ...TOTALS_SIDES,
] as const;
export const STREAK_FILTERS = ['any', 'after_win', 'after_loss', 'hot_streak_3plus', 'cold_streak_3plus'] as const;
