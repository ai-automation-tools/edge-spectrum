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
