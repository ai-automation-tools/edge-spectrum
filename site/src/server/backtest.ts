import { runBacktest } from '../dataGenerator.js';
import { validateStrategy } from './strategySchema.js';

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
