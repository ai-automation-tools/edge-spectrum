---
name: edge-spectrum-endpoint
description: >-
  Add, change or debug an Edge Spectrum API endpoint across its two entry points — the local
  Express server (site/server.ts) and the Vercel serverless functions (site/api/*) — which must
  both be thin adapters over shared logic in site/src/server/. Covers Zod validation at the trust
  boundary, the strategySchema / strategyBounds split that keeps Zod out of the client bundle, and
  the demo-mode + passcode gate that makes the Gemini advisor fail closed. Use for "add an API
  route", "the endpoint works locally but 404s/500s on Vercel", "validate this request body",
  "the advisor returns 503 / 403 / 401", "ADVISOR_PASSCODE", "EDGE_SPECTRUM_MODE", "demo mode",
  "check:deployment failed", and any work under site/api/, site/server.ts or site/src/server/.
---

# Endpoints

**Every endpoint exists twice and must behave once.** `site/server.ts` (Express: local dev and self-hosted builds)
and `site/api/*.ts` (Vercel serverless, production) are two adapters over the same logic in
`site/src/server/`. Anything that can differ between them, will.

All commands run from **`site/`**.

---

## 1. The shape

```
site/src/server/<feature>.ts   ← the logic. Framework-agnostic. Both callers import it.
site/server.ts                 ← Express route: parse req → call → map result to res
site/api/<feature>.ts          ← default-export handler: same three lines
```

`src/server/auth.ts` says it outright: *"framework-agnostic route logic — the Express routes and the
Vercel handlers are thin adapters over these, so the two deployment paths cannot drift apart."*
`auth.ts` is the model — `sessionStatus`, `attemptUnlock`, `logout` and `guardAdvisorRequest` each
return a `GateResult` of `{ status, body, setCookie? }`, and both adapters just spread it onto their
own response object.

**The rule: if a line of an adapter makes a decision, it is in the wrong file.** Method check and
error-to-status mapping are adaptation; anything else is logic.

Four endpoints exist today — `/api/backtest`, `/api/espn-scoreboard`, `/api/advisor-auth`
(GET + POST), `/api/strategy-advisor`.

### Two mechanical traps

- **`api/*.ts` imports carry a `.js` extension** (`'../src/server/backtest.js'`); `server.ts`
  imports do not. That is the Vercel Node ESM resolver, not a typo. Copy the neighbouring file.
  It applies to everything an `api/*` handler reaches, not just the handler's own imports —
  `src/server/backtest.ts` imports `'../dataGenerator.js'`, and the missing `.js` there crashed
  `/api/backtest` on Vercel while dev passed.
- **The Vercel runtime types are hand-rolled** in `src/server/httpTypes.ts` (`ApiRequest` /
  `ApiResponse`) rather than installed, deliberately. Use those; do not add `@vercel/node`.

## 2. Validation at the boundary

Untrusted bodies get a **Zod schema in `site/src/server/`**, applied inside the shared module —
not re-checked in each adapter. `runValidatedBacktest(req.body)` validates and runs; both callers
just catch `BadRequestError` → 400 and everything else → 500.

The reason is on the record: presence was once the only check, so
`{ startYear: 1900, endYear: 3000 }` asked the generator for ~1,100 seasons inside a serverless
function — a timeout at best, a denial-of-wallet at worst.

**The bounds/schema split matters.** The numbers live in `site/src/strategyBounds.ts` (no imports),
and `src/server/strategySchema.ts` turns them into Zod. The strategy form imports `strategyBounds`
directly, so the UI clamps to exactly the numbers the API enforces **without pulling Zod into the
client bundle**, whose size `npm run check:bundle` holds. Adding a
bound means: constant in `strategyBounds.ts` → schema rule in `strategySchema.ts` → form clamp.

`strategySchema.ts` also carries a `SameMembers<…>` type trick so that adding a sport or side
selection to `types.ts` without listing it in the schema is a **`tsc --noEmit` failure**, not a
request the UI can build and the API then rejects. Keep those `_xCovered` assertions (sports, bet
types, sides, streak filters) when editing the unions. `_schemaFieldsMatch` does the same for the
`Strategy` fields themselves: adding or dropping one in `types.ts` without the schema fails `tsc`.

> [!NOTE]
> `tsconfig.json` sets neither `strict` nor `strictNullChecks`, so **Zod infers every output field
> as optional** and narrowing a discriminated union on a boolean (`if (r.ok) …`) does not narrow.
> Do not rely on either.

## 3. The advisor gate — it fails closed

`/api/strategy-advisor` spends a metered Gemini key, so it is gated twice. Full state table in
[`references/gate.md`](references/gate.md); the summary:

| Condition | Result |
|:---|:---|
| `EDGE_SPECTRUM_MODE` is anything but the exact string `full` | **403**, demo restriction. The advisor panel renders unavailable. |
| `full` but `ADVISOR_PASSCODE` or `ADVISOR_SECRET` unset | **503** — *fails closed.* An unset env var must never expose the key. |
| `full` + passcode set, no valid session cookie | **401** |
| Empty prompt, or over `MAX_PROMPT_CHARS` (1000) | **400** |
| Over 10 calls an hour for the session or the address | **429** |
| The day's `ADVISOR_DAILY_LIMIT` reached | **503** |
| The model's reply is empty, not JSON, or not the asked-for shape | **502** (`parseAdvice` validates it; it is never forwarded raw) |

`ADVISOR_SECRET` signs session tokens and is **required**: it is no longer derived from the
passcode (audit SEC-04). Rotating it invalidates every session. The model id is `GEMINI_MODEL`,
defaulting to `DEFAULT_GEMINI_MODEL` in `advisor.ts`; the call carries an output-token cap and a
timeout. The hourly and daily limits live in process memory, so they reset per instance.

A question that names dataset activities or categories carries up to 12 matching rows, with figures
and sources, into the prompt (`src/server/edgeContext.ts`, audit PROD-15); the model is told to answer
from them. Matching is whole-word prefix, so a strategy question usually carries none.

Only the advisor is gated. Every other tool works in demo mode, and **the public deployment stays in
demo mode and must not hold Gemini credentials.**

## 4. `npm run check:deployment` is the guard

It exercises `auth.ts`, `advisor.ts` and both API handlers across every mode — including
`EDGE_SPECTRUM_MODE` unset, `'demo'`, `'FULL'` (wrong case, must still be demo) and `'typo'` —
and **asserts zero network calls** by replacing `globalThis.fetch` with a thrower. It restores
every env var it touched in a `finally`.

Extend it whenever you touch the gate. If a new endpoint spends money or reads a secret, it gets a
row in that script before it gets merged.

## 5. Adding an endpoint

1. Write the logic in `site/src/server/<feature>.ts`, framework-agnostic, returning a plain
   `{ status, body }` (or throwing a typed error the adapters map).
2. Zod-validate any untrusted body **there**, with bounds in a no-import constants module if the
   client also needs them.
3. Add the Express route in `server.ts` — parse, call, map.
4. Add `site/api/<feature>.ts` — `export default function handler(req: ApiRequest, res: ApiResponse)`,
   method check, same call, same mapping. **`.js` on the import.**
5. If it spends money or touches a secret, gate it and extend `scripts/check-deployment.ts`.
6. `npm run verify` (every check CI runs), then `npm run dev` and hit it.
7. **Verify on the PR's Vercel preview URL.** `server.ts` never runs in production — a local pass
   proves the logic, not the deployment.

## 6. Anti-patterns

- **Adding a route to `server.ts` only.** It is dev-only; production never loads it.
- **Logic in an adapter.** The two copies diverge, and only one is under CI.
- **Omitting `.js` from an `api/*.ts` import.** Resolves locally, fails on Vercel.
- **Re-validating in each adapter** instead of inside the shared module.
- **Importing Zod, or `strategySchema`, from client code.** Import `strategyBounds`.
- **Treating `EDGE_SPECTRUM_MODE` as truthy-checked.** Only the exact `'full'` counts; `'FULL'` is
  demo, and `check:deployment` asserts it.
- **Failing open when a secret is missing.** Unset → 503, always.
- **Adding `@vercel/node`.** `httpTypes.ts` exists so the build runtime stays out of the tree.
- **Committing `site/.env`.** Gitignored; production values go in the Vercel project.
- **Declaring it working because `npm run dev` worked.** Check the preview deploy.

---

## Related

| For | See |
|:---|:---|
| The full gate state table, env matrix and cookie mechanics | [`references/gate.md`](references/gate.md) |
| Self-hosting and the demo/full split, for users | the repo's `docs/self-hosting.md` |
| Wiring a new tool page to a new endpoint | the `edge-spectrum-hub-tool` skill |
| Branch flow and the Vercel preview gate | the repo's `AGENTS.md` |
