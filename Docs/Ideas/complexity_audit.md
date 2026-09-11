# Edge Spectrum — Complexity Audit 🪒

**Date:** 2026-08-24
**Scope:** The `site/` application tree — `src/`, `api/`, `scripts/`, `server.ts`, `vite.config.ts`,
`package.json`. Excludes `site/public/spectrum/`, which CLAUDE.md marks as self-contained and
left as-is.
**Lens:** Over-engineering only — duplication, dead code, unused dependencies, and config nobody
sets. Correctness, security, and performance were explicitly out of scope for this pass and are
tracked in [hub_improvement_plan.md](hub_improvement_plan.md) and [../roadmap.md](../roadmap.md).
**Companion docs:** [roadmap.md](../roadmap.md) (phased milestones) ·
[hub_improvement_plan.md](hub_improvement_plan.md) (Phase 2 evidence) ·
[improvement_ideas.md](improvement_ideas.md) (Spectrum viz backlog)

**Status Key:** 🔴 Large cut · 🟠 Medium cut · 🟡 Small cut · ✅ Done

> **Headline:** roughly **410 lines and 4 dependencies** are removable without changing a single
> observable behaviour — except the two form controls in finding 4, which currently do nothing at
> all and should either be wired up or removed.

---

## Findings, largest cut first

### 🔴 1. `runBacktest` writes the same 14 selections twice

`site/src/dataGenerator.ts` (~lines 665–840) enumerates all fourteen `sideSelection` cases for
`betType === 'moneyline'`, then enumerates the same fourteen again for `'spread'`. Each branch
inlines its own team pick, its own label string, and its own grade, so a change to (say) how
`rest_advantage` breaks a tie has to be made in two places that are 90 lines apart.

**Replacement:** one `pickSide(selection, game) → 'home' | 'away' | null`, then one grader per bet
type reading the posted price for whichever side came back.

**Cut:** ~200 lines → ~65. **Net −135.**

---

### 🔴 2. The ESPN feed re-implements the grading engine

`site/src/components/EspnFeed.tsx` (~lines 118–283) grades a real ESPN game against the current
strategy using its own second copy of the selection and cover logic. It has already drifted from
the engine: on spreads it handles only `favorites` and `underdogs`, silently returning "No Bet" for
the eight situational and streak selections the backtester supports.

**Replacement:** call the shared `pickSide` / grader from finding 1, with the ESPN payload adapted
to the same shape.

**Cut:** ~180 lines → ~70. **Net −110.**

---

### 🟠 3. Six copy-pasted KPI cards

`site/src/components/ResultsDashboard.tsx` is six near-identical card blocks that differ only in
label, value, sub-line, icon, and colour.

**Replacement:** one `<Kpi>` component driven by a six-entry array.

**Cut:** 122 lines → ~55. **Net −65.**

---

### 🟠 4. `streakTarget` and `starPlayerFilter` are wired everywhere and read nowhere

Both fields are threaded through the `Strategy` type, the `StrategyTemplate` type, the Zod schema
(including their `SameMembers` coverage asserts), all four `PRESETS`, the `useEffect` dependency
array, the Gemini tool schema's `required` list, and a dropdown each in the Advanced Screening
panel — but **`runBacktest` never reads either one**. Changing either control re-runs the backtest
and returns identical results.

Sites: `src/types.ts:63-64`, `src/server/strategySchema.ts:53-54,99-100`,
`src/components/StrategyBuilder.tsx:436-450`, `src/BacktesterApp.tsx:21-22,75-76,95-96`,
`src/server/advisor.ts:91-100`.

**Decision needed:** implement the filters in the engine, or remove both. Leaving two live controls
that do nothing is the worst of the three options.

**Cut if removed:** ~45 lines across 8 files.

---

### 🟠 5. Four dependencies with zero imports

`d3`, `@types/d3`, `motion`, and `autoprefixer` are not imported anywhere in `src/`, `api/`, or
`server.ts`. (`autoprefixer` is moot regardless — there is no `postcss.config`, and Tailwind v4 runs
through `@tailwindcss/vite`.) Separately, `vite` is listed in **both** `dependencies` and
`devDependencies`.

**Cut:** **−4 dependencies**, `d3` being the heaviest entry in the manifest. Relevant to the Phase 3
bundle-size item.

---

### 🟠 6. A production server path that never runs

`server.ts:82-95` branches on `NODE_ENV === 'production'` to serve `dist/` over `express.static`,
and `package.json` carries an esbuild step bundling `server.cjs` plus a `start` script to run it.
But `vercel.json` sets `buildCommand: "vite build"`, so on Vercel that bundle is never built and
never executed — CLAUDE.md already documents `server.ts` as local-dev-only.

**Cut:** ~15 lines, and `npm run build` collapses back to `vite build`.

---

### 🟡 7. Nineteen unused imports and locals

Confirmed with `tsc --noEmit --noUnusedLocals --noUnusedParameters`: eight `import React from
'react'` statements that nothing references (React 19's JSX transform makes them unnecessary), ten
unused `lucide-react` icons, and one unused local (`isFinished`, `EspnFeed.tsx:379`).

**Cut:** ~10 lines. Adding `noUnusedLocals` to `tsconfig.json` would keep them from coming back —
worth pairing with the Phase 3 ESLint item now that CI runs `tsc` on every PR.

---

### 🟡 8. A 16-entry dependency array

`src/BacktesterApp.tsx:73-80` lists every field of `strategy` individually. `setStrategy` only ever
replaces the whole object, so `[strategy]` is behaviourally identical.

**Cut:** 16 lines → 1.

---

### 🟡 9. AI Studio scaffolding left in the config

- `vite.config.ts:9-13` — a `resolve.alias` for `@` with zero `from '@/…'` imports in the repo.
- `vite.config.ts:14-20` — the `DISABLE_HMR` branch, an AI Studio artifact set nowhere here.
- `src/server/advisor.ts:17-21` — `httpOptions.headers['User-Agent'] = 'aistudio-build'` on the
  Gemini client.

**Cut:** ~17 lines.

---

### 🟡 10. Five fake progress sentences

`src/components/AiAdvisor.tsx:136-157` rotates "Scanning past 25 years of game database
matrices…", "Performing regression analytics on player injury rosters…" and three more on a 1.5 s
`setInterval` while the Gemini call is in flight. None of that work happens. Same class of problem
as the "Live Data Engine" label fixed in Phase 2.

**Cut:** ~12 lines, replaced by one spinner.

---

### 🟡 11. An unreachable filter state

`src/components/GamesTable.tsx:10` types the filter as `'all' | 'win' | 'loss' | 'push'`, but the
button row only maps `['all', 'win', 'loss']`. `'push'` cannot be selected.

**Cut:** 1 line.

---

## Deliberately kept

| Kept | Why |
|---|---|
| `src/server/auth.ts` constant-time compare, fail-closed paths, IP damper | Security. Out of scope for this pass, and never a simplification target. |
| The `SameMembers` asserts in `strategySchema.ts` | They catch the drift direction `satisfies` cannot — a union member added to `types.ts` but missing from the schema. |
| `flooredMoments`, `normalMarket`, `poissonMarket` | Dense, but every line is load-bearing for the unbiased market model. `npm run check:market` is the guard. |
| `BadRequestError` + `runValidatedBacktest` | A thin wrapper, but it genuinely dedupes the Express and Vercel entry points. |

---

## Out of scope, but noticed

`src/components/StrategyBuilder.tsx:355` still tells the user that spreads and totals are
"Priced at standard −110 house lines." The Phase 2 fix made every market price off its own realised
distribution, so that note is now false. Belongs with the honest-framing work in Phase 2.
