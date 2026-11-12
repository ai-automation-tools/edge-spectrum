import { createHmac, randomBytes, timingSafeEqual, randomUUID } from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import { deploymentMode, demoRestriction } from './deployment.js';

/**
 * Passcode gate for the Gemini-backed strategy advisor.
 *
 * The advisor calls a *paid* API with a server-side key, so the endpoint has to
 * be protected server-side — a client-only lock screen would be trivially
 * bypassed by calling `/api/strategy-advisor` directly. Shared by the local
 * Express dev server (`server.ts`) and the Vercel serverless functions
 * (`api/advisor-auth.ts`, `api/strategy-advisor.ts`) so the two cannot drift.
 *
 * Flow: POST the passcode to `/api/advisor-auth` → receive an HttpOnly cookie
 * holding an HMAC-signed `exp.signature` token → every advisor call verifies it.
 *
 * This is deliberately a single shared passcode, not per-user accounts. It
 * exists to stop strangers burning the API quota, not to identify anyone.
 */

export const SESSION_COOKIE = 'es_advisor';

/** How long an unlocked session stays valid. */
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

/** Hard cap on advisor prompt length — the same abuse vector as an open endpoint. */
export const MAX_PROMPT_CHARS = 1000;

/** The configured passcode, or null when the gate has not been set up. */
function passcode(): string | null {
  const value = process.env.ADVISOR_PASSCODE;
  return value && value.length > 0 ? value : null;
}

/**
 * Whether the gate is configured. When this is false the advisor endpoints fail
 * *closed* (503) rather than open — an unset env var must never expose the key.
 */
export function isAuthConfigured(): boolean {
  return deploymentMode() === 'full' && passcode() !== null && signingSecret() !== null;
}

/**
 * Secret used to sign session tokens. Required: it used to fall back to a hash
 * of the passcode, which let anyone holding a cookie test passcode guesses
 * offline. Without it the gate counts as unconfigured and fails closed.
 */
function signingSecret(): string | null {
  const value = process.env.ADVISOR_SECRET;
  return value && value.length > 0 ? value : null;
}

const NOT_CONFIGURED: GateResult = {
  status: 503,
  body: {
    error:
      'The AI advisor is not configured on this deployment. Set ADVISOR_PASSCODE and ADVISOR_SECRET to enable it.',
  },
};

/**
 * Constant-time string compare that doesn't leak length via early return. Both
 * sides go through an HMAC under a key that exists only in this process, so
 * the digests are equal-length and say nothing about the inputs: this is a
 * comparison, not a stored password hash.
 */
const COMPARE_KEY = randomBytes(32);
function safeEqual(a: string, b: string): boolean {
  const digest = (v: string) => createHmac('sha256', COMPARE_KEY).update(v).digest();
  return timingSafeEqual(digest(a), digest(b));
}

/** Check a user-supplied passcode against the configured one. */
export function verifyPasscode(input: unknown): boolean {
  const expected = passcode();
  if (!expected) return false;
  if (typeof input !== 'string' || input.length === 0) return false;
  return safeEqual(input, expected);
}

function sign(payload: string): string {
  return createHmac('sha256', signingSecret() ?? '').update(payload).digest('hex');
}

/** Mint a session token of the form `<expiry>.<nonce>.<hmac>`. */
export function issueToken(): { token: string; maxAge: number } {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const nonce = randomUUID();
  const payload = `${exp}.${nonce}`;
  return { token: `${payload}.${sign(payload)}`, maxAge: SESSION_TTL_SECONDS };
}

/** Verify a session token's signature and expiry. */
export function verifyToken(token: string | undefined | null): boolean {
  if (!token || !isAuthConfigured()) return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [expRaw, nonce, signature] = parts;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return false;

  return safeEqual(signature, sign(`${expRaw}.${nonce}`));
}

/** Minimal cookie-header parser — avoids pulling in a dependency for one field. */
export function parseCookies(header: string | undefined | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    if (key) {
      try { out[key] = decodeURIComponent(part.slice(eq + 1).trim()); }
      catch { /* Ignore malformed cookies rather than failing the endpoint. */ }
    }
  }
  return out;
}

/** True when the request carries a valid advisor session. */
export function hasValidSession(cookieHeader: string | undefined | null): boolean {
  return verifyToken(parseCookies(cookieHeader)[SESSION_COOKIE]);
}

function cookieAttributes(maxAge: number): string {
  const attrs = [
    `Path=/`,
    `Max-Age=${maxAge}`,
    'HttpOnly',
    'SameSite=Lax',
  ];
  // Secure would break local dev over a plain-http LAN address.
  if (process.env.NODE_ENV === 'production') attrs.push('Secure');
  return attrs.join('; ');
}

/** `Set-Cookie` value that starts a session. */
export function buildSessionCookie(token: string, maxAge: number): string {
  return `${SESSION_COOKIE}=${token}; ${cookieAttributes(maxAge)}`;
}

/** `Set-Cookie` value that clears the session. */
export function buildClearCookie(): string {
  return `${SESSION_COOKIE}=; ${cookieAttributes(0)}`;
}

/**
 * Fixed-window counters, in process memory.
 *
 * ponytail: per-instance memory. On serverless each warm instance counts on
 * its own and a cold start forgets, so these slow abuse rather than cap it;
 * the hard ceiling is the quota on the Gemini key (roadmap Action 2.7b). Swap
 * the Map for a shared key-value store when one is chosen.
 */
class WindowCounter {
  private entries = new Map<string, { count: number; first: number }>();
  constructor(private windowMs: number) {}

  /** Drop expired entries, so the map only ever holds live windows. */
  private sweep(): void {
    const cutoff = Date.now() - this.windowMs;
    for (const [key, entry] of this.entries) if (entry.first <= cutoff) this.entries.delete(key);
  }
  count(key: string): number { this.sweep(); return this.entries.get(key)?.count ?? 0; }
  total(): number { this.sweep(); let n = 0; for (const e of this.entries.values()) n += e.count; return n; }
  add(key: string): void {
    this.sweep();
    const entry = this.entries.get(key);
    if (entry) entry.count += 1;
    else this.entries.set(key, { count: 1, first: Date.now() });
  }
  delete(key: string): void { this.entries.delete(key); }
  get size(): number { this.sweep(); return this.entries.size; }
  clear(): void { this.entries.clear(); }
}

/**
 * Brute-force damper on the passcode: per client, and across all clients, so
 * spreading guesses over many addresses hits the second limit. That ceiling
 * also bounds the map, since nothing is recorded once it is reached.
 */
const FAILURE_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 8;
const MAX_FAILURES_ALL_CLIENTS = 40;
const failures = new WindowCounter(FAILURE_WINDOW_MS);

export function isLockedOut(ip: string): boolean {
  return failures.count(ip) >= MAX_FAILURES || failures.total() >= MAX_FAILURES_ALL_CLIENTS;
}
export function recordFailure(ip: string): void { failures.add(ip); }
export function clearFailures(ip: string): void { failures.delete(ip); }

/** Advisor spend controls (roadmap Action 2.7): each call below costs money. */
const ADVISOR_WINDOW_MS = 60 * 60 * 1000;
export const ADVISOR_REQUESTS_PER_HOUR = 10;
const DAY_MS = 24 * 60 * 60 * 1000;
const advisorCalls = new WindowCounter(ADVISOR_WINDOW_MS);
const advisorDay = new WindowCounter(DAY_MS);
/** Calls allowed per day across everyone; `ADVISOR_DAILY_LIMIT` overrides the default. */
export function advisorDailyLimit(): number {
  const n = Number(process.env.ADVISOR_DAILY_LIMIT);
  return Number.isInteger(n) && n > 0 ? n : 200;
}

/** For the checks only: forget every counter. */
export function resetLimiters(): void { failures.clear(); advisorCalls.clear(); advisorDay.clear(); }
/** For the checks only: live entries in the failed-passcode map. */
export const failureEntries = () => failures.size;

/**
 * The caller's address, for the counters above. Forwarding headers are only
 * believed where a proxy we trust sets them: Vercel overwrites them on every
 * request, and a self-hosted Express instance behind its own proxy opts in
 * with TRUST_PROXY=1. Anywhere else a client could send a new
 * `X-Forwarded-For` with each guess and never be locked out, so the socket
 * address is used instead.
 */
export function clientIp(req: Pick<IncomingMessage, 'headers' | 'socket'>): string {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  if (process.env.VERCEL || process.env.TRUST_PROXY === '1') {
    const forwarded = one(req.headers['x-real-ip']) || one(req.headers['x-forwarded-for'])?.split(',')[0].trim();
    if (forwarded) return forwarded;
  }
  return req.socket?.remoteAddress || 'unknown';
}

/* ------------------------------------------------------------------ *
 * Framework-agnostic route logic.
 * The Express routes and the Vercel handlers are thin adapters over
 * these, so the two deployment paths cannot drift apart.
 * ------------------------------------------------------------------ */

export interface GateResult {
  status: number;
  body: Record<string, unknown>;
  setCookie?: string;
}

/** GET /api/advisor-auth — does this caller already hold a session? */
export function sessionStatus(cookieHeader: string | undefined | null): GateResult {
  return {
    status: 200,
    body: {
      mode: deploymentMode(),
      configured: isAuthConfigured(),
      authed: hasValidSession(cookieHeader),
    },
  };
}

/** POST /api/advisor-auth — exchange the passcode for a session cookie. */
export function attemptUnlock(input: unknown, ip: string): GateResult {
  if (deploymentMode() === 'demo') return demoRestriction();
  if (!isAuthConfigured()) return NOT_CONFIGURED;

  if (isLockedOut(ip)) {
    return {
      status: 429,
      body: { error: 'Too many failed attempts. Try again in a few minutes.' },
    };
  }

  if (!verifyPasscode(input)) {
    recordFailure(ip);
    return { status: 401, body: { error: 'Incorrect passcode.' } };
  }

  clearFailures(ip);
  const { token, maxAge } = issueToken();
  return {
    status: 200,
    body: { authed: true },
    setCookie: buildSessionCookie(token, maxAge),
  };
}

/** POST /api/advisor-auth { action: 'logout' } — drop the session. */
export function logout(): GateResult {
  return { status: 200, body: { authed: false }, setCookie: buildClearCookie() };
}

/**
 * Guard for the advisor endpoint itself. Returns null when the request may
 * proceed, or the response to send back when it may not.
 */
export function guardAdvisorRequest(
  cookieHeader: string | undefined | null,
  prompt: unknown,
  ip = 'unknown',
): GateResult | null {
  if (deploymentMode() === 'demo') return demoRestriction();
  if (!isAuthConfigured()) return NOT_CONFIGURED;

  if (!hasValidSession(cookieHeader)) {
    return { status: 401, body: { error: 'Advisor locked. Enter the passcode to continue.' } };
  }

  if (typeof prompt !== 'string' || prompt.trim().length === 0) {
    return { status: 400, body: { error: 'A prompt is required.' } };
  }

  if (prompt.length > MAX_PROMPT_CHARS) {
    return {
      status: 400,
      body: { error: `Prompt is too long (max ${MAX_PROMPT_CHARS} characters).` },
    };
  }

  // Counted last, so only a request that would reach the model spends allowance.
  // Keyed by session and by address: a shared passcode means one session per
  // visitor, and a visitor who re-unlocks for a fresh session keeps the address.
  const session = parseCookies(cookieHeader)[SESSION_COOKIE];
  if (advisorDay.total() >= advisorDailyLimit()) {
    return { status: 503, body: { error: 'The advisor has reached its daily limit. Try again tomorrow.' } };
  }
  if (advisorCalls.count(session) >= ADVISOR_REQUESTS_PER_HOUR || advisorCalls.count(`ip:${ip}`) >= ADVISOR_REQUESTS_PER_HOUR) {
    return { status: 429, body: { error: `Limit reached: ${ADVISOR_REQUESTS_PER_HOUR} advisor requests an hour. Try again later.` } };
  }
  advisorCalls.add(session);
  advisorCalls.add(`ip:${ip}`);
  advisorDay.add('all');

  return null;
}
