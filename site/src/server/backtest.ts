import { runBacktest } from '../dataGenerator.js';
import { validateStrategy } from './strategySchema.js';
import type { RouteResult } from './httpTypes.js';

/** Thrown when a backtest request is not a legal strategy. */
export class BadRequestError extends Error {
  /** One entry per failed field, for the client to show verbatim. */
  readonly details: string[];

  constructor(message: string, details: string[] = []) {
    super(message);
    this.details = details;
  }
}

/**
 * Validate an untrusted strategy body and run the backtest engine.
 * Shared by the local Express dev server (`server.ts`) and the Vercel
 * serverless function (`api/backtest.ts`).
 *
 * The bounds live in `strategySchema.ts` and matter: unbounded years let a
 * caller ask for a thousand simulated seasons inside a serverless function.
 */
export function runValidatedBacktest(body: unknown) {
  const result = validateStrategy(body);
  if (!result.ok) {
    throw new BadRequestError('Invalid strategy parameters', result.errors);
  }
  return runBacktest(result.strategy);
}

/** POST /api/backtest, minus the framework: both adapters send its result as-is. */
export function backtestRoute(body: unknown): RouteResult {
  try {
    return { status: 200, body: runValidatedBacktest(body) };
  } catch (error) {
    if (error instanceof BadRequestError) {
      return { status: 400, body: { error: error.message, details: error.details } };
    }
    console.error('Error running backtest:', error);
    return { status: 500, body: { error: 'Internal Backtest Engine Error' } };
  }
}
