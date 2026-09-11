import { createHmac, createHash, timingSafeEqual, randomUUID } from 'node:crypto';
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
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

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
  return deploymentMode() === 'full' && passcode() !== null;
}

/**
 * Secret used to sign session tokens. Prefers an explicit ADVISOR_SECRET; falls
 * back to a hash of the passcode, which conveniently means rotating the
 * passcode invalidates every session that was issued under the old one.
 */
function signingSecret(): string {
  const explicit = process.env.ADVISOR_SECRET;
  if (explicit && explicit.length > 0) return explicit;
  return createHash('sha256').update(`es-advisor:${passcode() ?? ''}`).digest('hex');
}

/** Constant-time string compare that doesn't leak length via early return. */
function safeEqual(a: string, b: string): boolean {
  const aHash = createHash('sha256').update(a).digest();
  const bHash = createHash('sha256').update(b).digest();
  return timingSafeEqual(aHash, bHash);
}

/** Check a user-supplied passcode against the configured one. */
export function verifyPasscode(input: unknown): boolean {
  const expected = passcode();
  if (!expected) return false;
  if (typeof input !== 'string' || input.length === 0) return false;
  return safeEqual(input, expected);
}

function sign(payload: string): string {
  return createHmac('sha256', signingSecret()).update(payload).digest('hex');
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
 * Best-effort brute-force damper, keyed by IP. Serverless instances are
 * short-lived so this is not a hard limit — it just makes online guessing
 * expensive enough to be pointless against a decent passcode. Durable
 * rate limiting (Upstash/Vercel KV) is tracked in Docs/Ideas/hub_improvement_plan.md.
 */
const FAILURE_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 8;
const failures = new Map<string, { count: number; first: number }>();

export function isLockedOut(ip: string): boolean {
  const entry = failures.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.first > FAILURE_WINDOW_MS) {
    failures.delete(ip);
    return false;
  }
  return entry.count >= MAX_FAILURES;
}

export function recordFailure(ip: string): void {
  const entry = failures.get(ip);
  if (!entry || Date.now() - entry.first > FAILURE_WINDOW_MS) {
    failures.set(ip, { count: 1, first: Date.now() });
    return;
  }
  entry.count += 1;
}

export function clearFailures(ip: string): void {
  failures.delete(ip);
}

/** Pull a caller IP out of the usual proxy headers, for the damper above. */
export function clientIp(
  headers: Record<string, string | string[] | undefined>,
  fallback = 'unknown',
): string {
  const forwarded = headers['x-forwarded-for'];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (raw) return raw.split(',')[0].trim();
  const real = headers['x-real-ip'];
  const realRaw = Array.isArray(real) ? real[0] : real;
  return realRaw || fallback;
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
  if (!isAuthConfigured()) {
    return {
      status: 503,
      body: {
        error:
          'The AI advisor is not configured on this deployment. Set ADVISOR_PASSCODE to enable it.',
      },
    };
  }

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
): GateResult | null {
  if (deploymentMode() === 'demo') return demoRestriction();
  if (!isAuthConfigured()) {
    return {
      status: 503,
      body: {
        error:
          'The AI advisor is not configured on this deployment. Set ADVISOR_PASSCODE to enable it.',
      },
    };
  }

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

  return null;
}
