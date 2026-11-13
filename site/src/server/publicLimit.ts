/**
 * Per-client request cap on the two open endpoints, /api/backtest and
 * /api/espn-scoreboard (audit SEC-08). Shared by the Express routes and the
 * Vercel functions, like the rest of src/server.
 *
 * ponytail: one fixed window in process memory, cleared every minute, so the
 * map never outlives its window. On Vercel each warm instance counts on its
 * own: this damps a single client, it doesn't cap the deployment. A Vercel
 * Firewall rate-limit rule on /api/* is the cross-instance layer.
 */
import type { IncomingMessage } from 'node:http';
import { clientIp } from './auth.js';
import type { RouteResult } from './httpTypes.js';

/** Requests a client may make to each open endpoint per minute. The backtester debounces at 300 ms. */
export const PUBLIC_REQUESTS_PER_MINUTE = 60;
const WINDOW_MS = 60_000;

let windowStart = 0;
const hits = new Map<string, number>();

/** A 429 once `req`'s client passes the cap on `route` this minute, else null. */
export function publicLimit(route: string, req: Pick<IncomingMessage, 'headers' | 'socket'>): RouteResult | null {
  const now = Date.now();
  if (now - windowStart >= WINDOW_MS) { hits.clear(); windowStart = now; }
  const key = `${route} ${clientIp(req)}`;
  const n = (hits.get(key) ?? 0) + 1;
  hits.set(key, n);
  if (n <= PUBLIC_REQUESTS_PER_MINUTE) return null;
  return { status: 429, body: { error: `Limit reached: ${PUBLIC_REQUESTS_PER_MINUTE} requests a minute. Try again shortly.` } };
}

/** Seconds a limited client should wait, for the Retry-After header. */
export const retryAfter = () => String(Math.max(1, Math.ceil((windowStart + WINDOW_MS - Date.now()) / 1000)));

/** For the checks only: forget every count. */
export function resetPublicLimit(): void { hits.clear(); windowStart = 0; }
