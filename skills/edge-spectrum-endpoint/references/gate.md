# The advisor gate

`site/src/server/auth.ts` + `site/src/server/deployment.ts`. Read this before changing anything
that decides whether the Gemini key gets spent.

---

## 1. Why it is server-side at all

A client-only lock screen is bypassed by calling `/api/strategy-advisor` directly with curl. The
gate protects a **paid API key held server-side**, so it lives server-side. It is deliberately a
single shared passcode, not per-user accounts — it exists to stop strangers burning the quota, not
to identify anyone.

## 2. The state table

`deploymentMode()` is the first check on every path:

```ts
process.env.EDGE_SPECTRUM_MODE === 'full' ? 'full' : 'demo'
```

Exact string. `'FULL'`, `'true'`, `'1'` and unset are all **demo**, and `check-deployment.ts`
asserts three of those explicitly.

| Mode | `ADVISOR_PASSCODE` and `ADVISOR_SECRET` | Session cookie | `GET /api/advisor-auth` | `POST /api/advisor-auth` | `POST /api/strategy-advisor` |
|:---|:---|:---|:---|:---|:---|
| demo | — | — | `200 {mode:'demo', configured:false, authed:false}` | **403** demo restriction | **403** demo restriction |
| full | either unset | — | `200 {configured:false}` | **503** not configured | **503** not configured |
| full | both set | none / invalid / expired | `200 {authed:false}` | 401 on wrong passcode, 200 + `Set-Cookie` on right | **401** locked |
| full | set | valid | `200 {authed:true}` | 200 | proceeds → 400 on empty or >1000-char prompt |
| full | set | any | — | **429** after 8 failures from one IP in 15 min | — |

`generateAdvice()` itself also rejects in demo mode (`/disabled in demo mode/`), so the key cannot
be spent even if a caller reaches past the guard. Two layers, on purpose.

`GET /api/advisor-auth` is the endpoint the UI polls to decide what to render; it sets
`Cache-Control: no-store` in the Express adapter. It never 4xxs — it reports state.

## 3. The env vars

| Var | Required | Effect |
|:---|:---|:---|
| `EDGE_SPECTRUM_MODE` | no, defaults `demo` | only the exact `'full'` enables live AI |
| `ADVISOR_PASSCODE` | **yes, for the advisor** | unset → the endpoint 503s and the panel renders unavailable. Every other tool is unaffected. |
| `ADVISOR_SECRET` | **yes, for the advisor** | signs session tokens. Unset → the endpoint 503s like a missing passcode; it is never derived from the passcode (audit SEC-04). Rotating it invalidates every session. |
| `GEMINI_MODEL` | no | overrides `DEFAULT_GEMINI_MODEL` in `advisor.ts` |
| `ADVISOR_DAILY_LIMIT` | no | calls a day across everyone; over it the advisor 503s |
| `TRUST_PROXY` | no | `1` trusts forwarding headers off Vercel; otherwise the socket address counts |
| `GEMINI_API_KEY` | for `full` | server-side only. Never move it client-side. |

Locally they load from `site/.env` via `dotenv/config` in `server.ts`. **`.env*` is gitignored
(except `.env.example`).** Production values live in the Vercel project's env vars.

**The public demo must stay in demo mode and must not hold Gemini credentials.**

## 4. Token mechanics

- Token is `<expiry>.<nonce>.<hmac>` — exactly three dot-separated parts, HMAC-SHA256 over
  `exp.nonce`.
- TTL 7 days (`SESSION_TTL_SECONDS`).
- Cookie `es_advisor`, `Path=/`, `HttpOnly`, `SameSite=Lax`, and `Secure` **only when
  `NODE_ENV === 'production'`** — Secure would break local dev over a plain-http LAN address.
- Comparisons go through `safeEqual`, which hashes both sides before `timingSafeEqual` so it does
  not leak length via an early return.
- `parseCookies` swallows malformed percent-encoding rather than throwing — a junk cookie must
  read as "not authed", never as a 500. `check-deployment` asserts this with `es_advisor=%ZZ`.

## 5. The rate limiter is best-effort and says so

`failures` is an in-process `Map` keyed by IP: 8 failures per 15-minute window. Serverless instances
are short-lived, so this is a damper against online guessing, not a hard limit. Durable rate
limiting (Upstash / Vercel KV) is tracked in `docs/ideas/hub_improvement_plan.md`. **Do not describe
it as a rate limit in user-facing copy**, and do not rely on it as the only thing between the key
and the internet — a decent passcode is.

`clientIp()` reads `x-forwarded-for` (first entry) then `x-real-ip`, falling back to `'unknown'`.
Behind a proxy that does not set either, every caller shares one bucket.

## 6. Changing the gate

1. Change `auth.ts` / `deployment.ts` — never an adapter.
2. Add the case to `scripts/check-deployment.ts`. It already loops every mode and asserts
   **zero network calls**; a new branch belongs in that loop.
3. `npm run check:deployment`.
4. If it changes what users see, update `docs/self-hosting.md` and `src/pages/Setup.tsx`.

The one rule that is not negotiable: **a missing or misconfigured secret produces 503, never a
working endpoint.**
