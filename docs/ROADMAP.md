<h1 align="center">🗺️ Roadmap</h1>

<p align="center">
  <em>From a public hub whose numbers now hold up, to reproducible reports, a client-side engine, real line data and a launch.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/now-phase_2:_truth_&_safety-F59E0B?style=for-the-badge" alt="Now: Phase 2, truth and safety">
  <img src="https://img.shields.io/badge/stage-public_since_2026--09--11-2ea44f?style=for-the-badge" alt="Stage: public since 2026-09-11">
  <a href="README.md"><img src="https://img.shields.io/badge/↩-docs_home-6B7280?style=for-the-badge" alt="Back to docs"></a>
</p>

---

The Edge-Spectrum roadmap routine (job `edge-spectrum-roadmap`) works this file top to bottom, one
item per run, as `roadmap/auto-` PRs that the org PR sweep reviews: it takes the first open item it
can finish and verify, lower phase first and higher priority first within a phase. It is the single sequenced backlog; the
findings from the codebase audits are synthesised here. **Every item above `## After public release`
is a go-live gate.** Phase 2 is the project's own release gate (below), so its open items sit above
the line even though the repo has been public since 2026-09-11. Ticking an item adds its line to the
[changelog](CHANGELOG.md) and updates any doc it made stale, in the same commit.

Markers: `- [ ]` open, `- [-]` claimed by a run in progress (a dated note says by what, e.g. a PR
number), `- [x]` done, `- [!]` blocked (the reason follows on the line). `small` marks an item a check
verifies; `🔒 Needs owner` marks one only the owner can do. Each item carries a priority: 🔴 Critical
(release-blocking) · 🟠 High · 🟡 Medium · 🔵 Low / polish. A phase heading ends in its status:
🟢 complete · 🟡 in progress · ⚪ planned.

> **Companion docs:**
> - [README.md](README.md) — Documentation hub and navigation directory.
> - [methodology.md](methodology.md) — Mathematical foundations of the DU/CED framework, metric semantics, and ruin formulas.
> - [data-architecture.md](data-architecture.md) — Canonical dataset schema, provenance tracking, CI verification, and collection strategy.
> - [ideas/README.md](ideas/README.md) — Research archive, complexity audit, and feature backlog.

## 🧮 Release gate and execution order

```
Phase 1: Consolidation 🟢 ──► Phase 2: Truth & Safety 🟡 ──► Phase 3: Reporting & Inference 🟡
                                       │ (Release Gate)
                                       ▼
Phase 6: Calculators 🟡 ◄── Phase 5: Collection 🟡 ◄── Phase 4: Client Engine ⚪
        │
        ▼
Phase 7: Public Launch ⚪
```

> [!IMPORTANT]
> **Track A / Phase 2 Release Gate:** No features in Phases 3 through 7 ship to users until all Phase 2 integrity items (metric semantics, canonical dataset, false controls cleanup, and automated checks) have landed. Generating export bundles or training models on distorted metrics bakes invalid math into portable files.
>
> **Gate scope (clarified 2026-09-03):** the gate protects anything that *consumes* the edge dataset or the simulator's output. Phase 6 calculators that are pure client-side math with no dependency on either — 6.1 and 6.2, both held by `npm run check:odds` — are outside it and shipped ahead of Phase 2 closing. 6.3 (Kelly) qualifies the same way; 6.4 and 6.5 read `edges.ts` and stay behind the gate.
>
> **Gate status (clarified 2026-09-21):** all four enumerated integrity items — metric semantics (2026-08-31), canonical dataset (2026-08-31), false-controls cleanup (2026-09-14) and the automated checks now in CI — have landed. The one Phase 2 item still open, **Action 2.7 (advisor rate limiting)**, is a spend control on a metered endpoint, not a truth control on the numbers, so it does not hold the gate shut for work that reports the simulator's output honestly. Action 3.1 was taken under that reading: it *removes* a distortion (a truncated array presented as the whole ledger) rather than building on one. Anything that packages or publishes those numbers — 3.2's export bundle, 7.x — should still wait on 2.7 landing.

### 🔗 Sequencing rationale

1. **Truth before expansion:** Mathematical errors distort the core thesis of the platform. The headline example — comparing unbounded turnover cost against bounded capital returns on one axis — was fixed on 2026-08-31 and is held by `npm run check:spectrum`; the dataset now has one source of truth held by `npm run gen:edges -- --check`. The dead strategy controls were purged on 2026-09-14. Provenance is now held too: the headline S&P 500, cash and gold rows cite a source (Action 2.10, 2026-10-19), the page badges every undated or year-old figure "verify", and `check:edges` holds each category's cited count (the table is in [`data/edge_dataset.md`](../data/edge_dataset.md)). **Dataset freeze (2026-11-12, audit PROD-08):** no record is added anywhere while any category cites a source for fewer than half its rows (`MIN_CITED_SHARE` in `site/src/data/edges.ts`); `npm run check:edges -- --write-baseline` refuses one. Cite existing rows until every category clears it. Removing a row that cannot be sourced is allowed. Phase 2 must complete before building report exports or public features. Self-contained calculators are the one exception (see the gate scope note above): 6.1 and 6.2 shipped 2026-09-03 with their own regression check and touch neither the dataset nor the simulator.
2. **Deterministic reporting before heavy client compute:** Establishing the export contract and statistical inference (Phase 3) provides the validation fixtures needed when porting the simulation engine to Web Workers (Phase 4). The first piece landed 2026-09-21: Action 3.1 made the backtest response say out loud which part of the ledger it is sending (`gamesPreview` / `previewLimit` / `totalGames`), which is the precondition for 3.2's bundle — an export cannot claim to be reproducible while the API it reads from is quietly truncating. Action 3.3 followed on 2026-09-28: the summary now carries its own breakeven, confidence interval and p-value, so 3.2's report has inference to publish rather than a bare win rate. Action 3.4 landed the same day: a strategy is now a URL, which is also what 3.2's `strategy.json` and 7.3's share cards can key off.
3. **Forward line capture begins early:** Forward collection of closing lines (Phase 5) takes time to build longitudinal history; launching the snapshot cron as early as possible maximizes available data for the CLV engine.
4. **Calculators as organic acquisition:** Standalone calculators (Phase 6) are low-maintenance, high-utility entry points that introduce new users to the broader Edge Spectrum analysis framework. Because they do not depend on the gated work, they can be built in parallel with Phase 2 — which is why 6.1 and 6.2 are already live. Their math lives in `site/src/odds.ts` (pure, no imports) so Phases 3 and 4 reuse it instead of re-implementing odds conversion, de-vigging, or Kelly.

## 🧱 Phase 1: Repo Consolidation & Standardization (done, before 2026-08-18)
*Merged standalone applications and aligned base mathematical models.*

- [x] **Merge Repositories:** Merged standalone `Sports-Betting-Backtester` codebase directly into the `edge-spectrum` Vite React shell under `/backtester`.
- [x] **Serverless Integration:** Bridged dev-server Express routes and production Vercel serverless functions (`api/*`) to prevent routing drift.
- [x] **Mathematical Standardization:** Standardized raw return calculations using the universal **DU/CED Framework** ($\text{Frequency} \times \text{Exposure} \times \text{Edge}$).
- [x] **Repo Restructuring:** Reorganized directory layout, updated global hosting inventory references, and established initial root documentation.

## 🛡️ Phase 2: Truth, Mathematical Integrity & Safety 🟡
*Eliminates metric distortions, establishes a single source of truth for all data, removes dead controls, and protects metered endpoints. This phase is the release gate.*

### Shipped (August 2026 onward)
- [x] 🔴 **Fix Simulator Scoring Bias (Shipped 2026-08-18):** Eliminated coefficient mismatch in `site/src/dataGenerator.ts` that underpriced home teams (which had produced artificial +37.3% NBA home-ATS returns). Market pricing now derives from realised score distributions. All 40 naive strategies now land between −3.06% and −5.81% ROI.
- [x] 🔴 **Market Regression Check (Shipped 2026-08-18):** Created `npm run check:market` running all 40 baseline strategies to verify that returns stay within the expected −7.0% to −2.5% band.
- [x] 🔴 **AI Advisor Passcode Gate (Shipped 2026-08-18):** Gated `/api/strategy-advisor` behind HMAC-signed session cookies (`site/src/server/auth.ts`) to prevent unauthenticated spend of Gemini API quotas.
- [x] 🔴 **Request Payload Validation (Shipped 2026-08-20):** Added server-side Zod validation in `site/src/server/strategySchema.ts` and client bounds in `site/src/strategyBounds.ts`, preventing expensive out-of-bounds simulation requests.
- [x] 🟠 **Scoreboard CDN Caching (Shipped 2026-08-24):** Added `Cache-Control: s-maxage=30, stale-while-revalidate=120` to `/api/espn-scoreboard` to cache external API requests.
- [x] 🟠 **CI Workflow (Shipped 2026-08-24):** Configured `.github/workflows/ci.yml` to run TypeScript typecheck, `npm run check:market`, and Vite build on every pull request. *(Now also runs `gen:edges -- --check`, `check:edges`, `check:spectrum`, `check:odds`, `check:stats`, `check:strategy-url` and `check:deployment` — see the CI line in `AGENTS.md` for the current order.)*
- [x] 🔴 **Metric Semantics & Dual-Axis Correction (Shipped 2026-08-31):** `site/public/spectrum/index.html` plotted a compounded return on capital against an unfloored linear turnover cost on one axis labelled "Expected Return". Measured: at the 10-year horizon the worst bar read **−136,875%** (Slots Tight 85%), which squashed the best investment on the board into **2.83%** of the plotted span — every asset rendered as a flat line at zero. Split into three named measures — `returnOnCapital` (floored at −100%), `expectedTurnoverCost` (games only, deliberately unbounded, on its own axis behind a **Measure** toggle) and `ruinPoint` (decisions to $0). The best investment now spans **85.97%** of the 10-year axis. The ruin marker moved out of the tooltip onto the primary chart as a dotted −100% floor line, an ✕ per ruined activity, and a "Ruined By Horizon" stat card (58 of 160 at 10 years). The `1du` horizon no longer calls one wager and one trading day both "1 DECISION" — it is labelled per row. Guarded by `npm run check:spectrum`, which evaluates the page's own math and asserts the floor holds, turnover cost stays unfloored, and the two agree on ruin across all 187 records × 7 horizons.
- [x] 🔴 **Canonical Dataset Single Source of Truth (Shipped 2026-08-31):** Three hand-maintained copies of the same dataset existed with nothing comparing them. Measured: `site/public/spectrum/index.html` and `Versions/Streamlit/data.py` were in fact **identical** across all 187 records and all 11 fields — but `Data/edge_analysis12.md` was **21 records behind**, missing the entire **Precious Metals** (12) and **Insurance & Annuities** (11) categories and still carrying a `Gold / Precious Metals (GLD)` row the others had renamed and moved, with horizon columns computed under the pre-Action-2.1 single-axis model. `site/src/data/edges.ts` is now the single typed `readonly EdgeRecord[]`, storing only the fields that carry information — `g`, `type`, `vol`, `wp` and `sk` are pure functions of `cat` and `m`, so `toSpectrumRow()` re-expands them instead of the dataset holding 187 copies of `"Varies"`. `site/scripts/generate-edge-artifacts.ts` (`npm run gen:edges`) emits all four downstream artifacts, and reproduces the shipped `index.html` `RAW` block and the Streamlit `RAW` list **byte-for-byte** — the extraction changed no deployed behaviour. `npm run gen:edges -- --check` runs in CI and fails the build on drift; verified by editing one value in `edges.ts` (all 4 artifacts flagged, exit 1) and restoring it (exit 0). The Spectrum page keeps its data inlined on purpose, so `check:spectrum` still tests the file that deploys.

### Sequenced action items (in order of execution)

- [x] 🔴 **Action 2.3 — Automated Dataset Validation & Provenance Ratchet (Audit D3, E4 · A3)** — done 2026-09-07
   - **Implementation:** Added optional `source` / `asOf` / `window` / `methodology` provenance fields to the shared `Provenance` type intersected into `InvestmentEdge` and `GameEdge` in `site/src/data/edges.ts` — purely additive, so `npm run gen:edges -- --check` still reproduces every artifact byte-for-byte. `site/scripts/check-edges.ts` (`npm run check:edges`) asserts the record count against `site/src/data/provenance-baseline.json` (187), that all 13 `EDGE_CATEGORIES` are present with no stray category, that every record name is unique, and that each record's numbers are physically sane (`a > -100`, `du > 0`, `0 < ced <= 100`). It also holds a citation coverage ratchet: `provenance-baseline.json` records how many of the 187 carry a `source` (currently 0, since none do yet) and the check fails if coverage ever drops below that baseline; `--write-baseline` re-records it as citations get added. Wired into `.github/workflows/ci.yml` immediately after `check:market`.

- [x] 🔴 **Action 2.4 — Purge Inoperative Strategy Controls (Audit D4 · A4)** — done 2026-09-14
   - **Implementation:** `streakTarget` and `starPlayerFilter` were live controls in `StrategyBuilder`'s **Advanced Screening** panel, fields on `Strategy` and `StrategyTemplate`, enums in `strategySchema.ts`, values in all four presets, and properties in the Gemini `responseSchema` — with `starPlayerFilter` in `required`, so the advisor had to emit a value and justify a filter with no effect. `runBacktest()` reads `streakFilter` and nothing else; there is no per-team streak side in the wager loop and the synthetic seasons carry no injury data. Measured against the dev server: NFL spread/home 2020–2024 with `streakFilter: 'hot_streak_3plus'` returns **85 bets / +5.52% ROI** with or without `streakTarget: 'opponent'` and `starPlayerFilter: 'star_injured'` in the body — bit-identical — while the one live filter does move it (`streakFilter: 'any'` → **1,360 bets**). Both fields removed from `types.ts`, `server/strategySchema.ts`, `StrategyBuilder.tsx` (selects, presets, and the panel label, now "Advanced Screening — Odds · Streaks"), `BacktesterApp.tsx`, `DemoAdvisor.tsx`, the `marketDiagnostics()` fixture in `dataGenerator.ts`, and `server/advisor.ts`. No shim needed — the schema strips unknown keys, so a stale client still sending the old names is accepted and the values dropped; `_schemaFieldsMatch` makes re-adding a field to only one side a `tsc --noEmit` failure. All 40 naive strategies still land in the −5.81% … −3.06% band.

- [x] 🟠 **Action 2.5 — Public Framing & Audit Scope Alignment (Audit D6, D8 · A5)** — done 2026-09-03, verified: no "Historical Odds" claim remains in `README.md`, `CLAUDE.md`, or `site/`; `CLAUDE.md` marks `site/public/spectrum/` as audit-scope. Residual: `README.md` says "25 Simulated Historical Seasons" while `tools.ts` and `check:market` say 26 — 2000–2025 inclusive is 26; align the README copy.
   - **Problem:** Root `README.md` claimed "25 Years of Historical Odds & Results" for power-rating generated seasons, and `CLAUDE.md` marked `site/public/spectrum/` as "leave as-is", causing audits to skip the visualizer.
   - **Implementation:**
     - Correct root `README.md` and app copy to state "25 Years of Simulated Historical Seasons" matching `tools.ts`.
     - Update `CLAUDE.md` to clarify that `site/public/spectrum/` is self-contained for serving but subject to mathematical and dataset audits.

- [x] 🟡 **Action 2.6 — Debounce & Abort Backtest Race Conditions (Audit D7):**
   - **Implementation:** Added 300 ms debounce timer on the auto-rerun `useEffect` in `BacktesterApp.tsx` and an in-flight `AbortController` ref that aborts superseded runs. Repeated the abort check after `response.json()` to discard late-arriving responses, and suppressed error banners / spinner drops on aborts.

- [x] 🟠 **Action 2.7 — AI Advisor Rate Limiting & Spend Caps** *(Security; the code half, split 2026-11-11: the owner's steps are Action 2.7b)* — done 2026-11-12, in process memory: 10 calls an hour per session and per address, `ADVISOR_DAILY_LIMIT` (default 200) answering 503, a 20 s model timeout, an output cap, a 7-day session, and `ADVISOR_SECRET` required. Not durable across serverless instances; a shared store is the follow-up if 2.7b's key quota proves too coarse.
   - **Problem:** Passcode authentication protects against unauthenticated users but does not limit total requests or cost from authenticated sessions.
   - **Implementation:**
     - Add IP/session rate limiting (e.g. 10 requests per hour per session).
     - Implement a hard daily spend ceiling with a fallback 503 response.
     - Require `ADVISOR_SECRET` in production: `site/src/server/auth.ts` falls back when it is unset (security sweep 2026-11-10, CodeQL #1).

- [ ] 🟠 **Action 2.7b — Quota cap on the Gemini key, `ADVISOR_SECRET` set on Vercel** *(Security)* — a request quota on the key in Google Cloud and the secret in the Vercel project, so the code half has a ceiling behind it. 🔒 Needs owner

- [x] 🔵 **Action 2.8 — Move the Spectrum page off Plotly 2.32.0 (upstream check, 2026-10-07)** — done 2026-11-02: `site/public/spectrum/plotly-basic-4.2.0.min.js` (npm `plotly.js-basic-dist-min@4.2.0`, 1.2 MB) replaces the 2.32.0 build. Nothing in the 3.0 or 4.0 breaking lists reaches the page: every colour it hands Plotly is a valid CSS hex or `rgba()`, no title is a bare string, and the modebar (where 4.0 added an "Upload to Cloud" button) is off on all three plots, so no page code changed. Rendered both builds side by side in headless Chromium, both themes: return on capital, turnover cost, category colouring at 10 years, real returns with all layers, and the compare chart give the same bar count (203 / 98), the same y-axis ticks and fills, and no console errors. A pixel diff of the charts is zero in light mode; in dark the only change is text placement, the floor's "RUIN" label sitting about 3 px further right and the category band labels about 1 px. `check:spectrum`, `check:spectrum-browser` and `build` pass. *(V21 redesign of 2026-10-12 kept the pin; the page now uses `Plotly.react`, `hovertext`, `marker.opacity` arrays and category-axis shapes, so test those under 4.x.)*
   - **What:** Replace the self-hosted `site/public/spectrum/plotly-basic-2.32.0.min.js` (Action 2.11) with the current `plotly.js-basic-dist-min` release, renaming the file and the script tag in `site/public/spectrum/index.html` to the new version, and fix whatever the 4.0 breaking changes touch in the page's traces and layout (4.0 switched colour parsing from TinyColor to culori and changed some subplot defaults).
   - **Why:** plotly.js is at 4.1.2 (4.0.0 shipped 2026-08-24); the pin is two majors behind. Source: https://github.com/plotly/plotly.js/releases. No advisory affects the 2.32.0 pin as read; this is drift, not an emergency.
   - **Where:** `site/public/spectrum/index.html` (script tag and the theme-aware layout colours); not the `RAW` block.
   - **Done when:** the page renders in both themes, `npm run check:spectrum` and `npm run build` pass, and the three measures plot as before.

- [x] 🟠 **Action 2.9 — Browser Smoke Test for the Spectrum Page (V21 review, 2026-10-12)** — done 2026-10-13: `npm run check:spectrum-browser`, a plain `tsx` script on `playwright` (no test runner), runs last in CI against `vite preview` of `dist/`. Covers the roadmap's list — 225 bars with no console errors, a real bar click pins and the pin survives a reload, the theme switch redraws, "Where do I sit?" adds a bar — plus the comma search, compare mode, embed mode and touch-screen `dragmode: false`. Verified failing on a removed `.li` reset and a reverted touch fix.
   - **Problem:** `check:spectrum` tests the page's math; nothing tests the page. Every defect found during the V21 rebuild (a squeezed plot, washed-out toggles on light, a pinned custom row dropped by `update()`) was caught by hand in a browser, not by CI.
   - **Implementation:** One Playwright run in CI against `vite preview`: the page loads with 225 bars and no console errors, a click pins and the URL round-trips, the theme switch redraws, and the "Where do I sit?" form places a bar. Pair it with Action 2.8 so the Plotly bump has a net under it.
   - **Done when:** the test is a CI step and fails on a deliberate regression (e.g. removing the `.li` button reset).

- [x] 🟠 **Action 2.10 — Provenance on the Headline Figures & a Stale-Figure Flag** — done 2026-10-19: 20 rows now cite a source, so coverage is 38 of 228 (was 18). Checking them moved six stale figures: money market 4.8% → 3.7% (Crane 100 index), online HYSA 4.5% → 4.2% (Bankrate picks), traditional bank money market 1.5% → 0.63% and national savings 0.45% → 0.38% (FDIC), credit-union savings 0.5% → 0.19% (NCUA), gold 7.5% → 7.1% (Damodaran, 1976–2025). The tax rows built on HYSA and gold moved with them. The S&P 500's 10.0% held: Damodaran gives 10.02% for 1928–2025. The inspector shows an amber **verify** badge on any row whose `asOf` is missing or more than a year old (167 rows today), via `isStale` in the page's math block. `check:spectrum` and `check:spectrum-browser` test it with a pinned clock. Still uncited and badged: Bitcoin, Ethereum, the CD rows and the index ETFs other than the S&P 500 (no source agreed closely enough to cite).
   - **Problem:** 15 of 225 records cite a source and none of them are the ones visitors argue about: S&P 500 at 10%, Bitcoin at 45%, HYSA at 4.5%, the 1-year CD. Those are also the rate-sensitive ones.
   - **Implementation:** Add `source` / `asOf` / `window` to the top twenty rows by visibility (every `raw` Cash & Savings row, the index ETFs, Bitcoin, Ethereum, gold); have the Spectrum inspector flag any figure whose `asOf` is older than twelve months or missing. The ratchet in `check:edges` already holds the count.
   - **Done when:** coverage is above 35 and the inspector shows a "verify" badge on stale rows.

- [x] 🟡 **Action 2.11 — Self-Host Plotly** — done 2026-10-26: the page loaded the full 3.6 MB `cdn.plot.ly/plotly-2.32.0.min.js` on every visit, so a Plotly CDN outage took the whole tool down. It now loads `site/public/spectrum/plotly-basic-2.32.0.min.js` (1.0 MB, the `plotly.js-basic-dist-min@2.32.0` npm build: bar, scatter, pie and the core, which covers every trace, shape and `downloadImage` call the page makes). Same version, so nothing in the chart changed; the bump stays Action 2.8. `check:spectrum-browser` passes on it and now also fails if the page requests anything from `plot.ly`, verified by putting the CDN tag back into `dist/`. Google Fonts are still a CDN request.
   - **Problem:** `cdn.plot.ly` is a single point of failure for the whole tool and a third-party request on every visit.
   - **Implementation:** Ship `plotly.js-basic-dist-min` (bar + scatter is all the page uses; roughly a third of the full bundle) from `site/public/spectrum/`, with the version in the filename so the upstream check in `docs/UPSTREAMS.md` still has something to compare. Fold into Action 2.8.

- [x] 🟡 **Action 2.12 — Guard the Hand-Maintained Category Maps** — done 2026-10-13: took the ten-line route — `check:spectrum` now fails if any `EDGE_CATEGORIES` entry or `RAW` category is missing from the page's `CC` / `AR_DEFAULT` or the Streamlit archive's `ALL_CATS` / `CC` / `AR_DEFAULT`; verified by deleting `Lottery` from the page's `AR_DEFAULT`.
    - **Problem:** `CC` and `AR_DEFAULT` on the Spectrum page and `ALL_CATS` / `CC` / `AR_DEFAULT` in the Streamlit archive are hand-synced with `EDGE_CATEGORIES`. A new category that misses one falls back to grey and "LOW" silently (`catColor` and `AR_DEFAULT[r.cat] || 2`).
    - **Implementation:** Either `gen:edges` emits those maps from a single colour/risk table in `edges.ts`, or `check:spectrum` asserts every category in `RAW` has an entry in both. The first is cleaner; the second is ten lines.

- [x] 🔵 **Action 2.13 — Payoff Shape for Positive-Edge Rows** — done 2026-11-09: `GameEdge` takes an optional `payout` (average net win per unit staked; emitted to the page as `pay`). `ruinRisk` now solves the general flat-stake ruin equation, `p·z^(b+1) − z + q = 0` with `p = (1+e)/(1+b)`, by bisection (exact, since every loss is one unit; even money still gives `((1−e)/(1+e))^units`), and `kellyMultiple` is `ced·b/e`. Only `winRate` was dropped from the plan: it follows from `e` and `payout`, so storing both could disagree. **Poker Skilled Tournaments** carries `payout: 5.7` (tournaments pay about the top 15% of the field, per the 2023 WSOP Main Event's 1,507 of 10,043), moving its ruin risk from 67.0% to **93.3%** and its stake from 5× to **28.5×** Kelly; the inspector names the payoff it modelled on every positive row. **DFS Top 5%** stays at even money: the row does not say whether it is cash games (near even money) or GPPs, see `docs/OPEN-QUESTIONS.md`. `check:spectrum` asserts the root, the closed form at `b = 1` and more risk at `b > 1`; verified failing on the old `ced/e` Kelly.
    - **Problem:** `ruinRisk` and `kellyMultiple` (shipped 2026-10-12) assume an even-money payoff for every row. Tournament poker and DFS pay top-heavy, so the true Kelly fraction is smaller and the ruin risk larger than shown; the inspector says "approximation" but cannot say by how much.
    - **Implementation:** Optional `payout` (average win multiple) and `winRate` fields on `GameEdge`; when present, compute Kelly as `(p·b − q)/b` and ruin risk by the general formula. Rows without them keep the even-money approximation.

- [ ] 🔵 **Action 2.14 — Catch up on the framework majors Dependabot ignores (upstream check, 2026-10-21)** *(Zod 3 → 4 landed 2026-10-27 via Dependabot #63, `site` now on `zod ^4.6.6` with CI green; the rest of the list is still open.)*
    - **What:** Take the toolchain majors one at a time, each with the full CI order green: Vite 6 → 8 with `@vitejs/plugin-react` 5 → 6, TypeScript 5.9 → 7, Zod 3 → 4 (`site/src/server/strategySchema.ts` and anything reading `.issues` / error shapes), Express 4 → 5 (`site/server.ts`, dev only), motion 12 → 14, dotenv 17 → 18, lucide-react 0.x → 1.x. Skip any whose changelog shows nothing the repo uses.
    - **Why:** `.github/dependabot.yml` ignores every major, so nothing tracks them; the npm registry's `latest` on 2026-10-21 was vite 8.3.5, @vitejs/plugin-react 6.1.2, typescript 7.0.2, zod 4.6.7, express 5.3.0, motion 14.5.0, dotenv 18.0.8, lucide-react 1.61.0. Source: https://registry.npmjs.org/<package>/latest. This is drift, not a known break; read each package's release notes before bumping.
    - **Where:** `site/package.json`, `site/package-lock.json`, and the call sites above. `.github/workflows/ci.yml` pins `actions/checkout@v4` / `actions/setup-node@v4` (latest tags v7.0.1 / v7.1.0 per api.github.com/repos/actions/*/releases/latest): a workflow edit, split out as Action 2.14b.
    - **Done when:** `npm run lint`, every `check:*`, and `npm run build` pass on the new versions, and `docs/UPSTREAMS.md` lists the new declared versions.

- [ ] 🔵 **Action 2.14b — Bump the CI workflow's action pins** — both workflows pin `actions/checkout` and `actions/setup-node` to the v4.4.0 commit SHA (2026-11-12), and Dependabot now raises new versions, majors included. What is left is merging its first majors PR, which the sweep holds because it edits a workflow. **Done when:** CI is green on the current majors. 🔒 Needs owner

## 🚦 Public release

- [x] Public repo in the `ai-automation-tools` org under Apache-2.0 (`LICENSE`), with CI running on every PR — done 2026-09-11: `d2b59bd`
- [x] Live at `https://edge-spectrum.ai-automation-tools.dev`, deployed by Vercel from `main` — done 2026-09-11: `6114cd6`

## After public release

Nothing below blocks go-live. Phases 3 to 7 keep their numbers; the Phase 2 gate note above says
which of them may ship before Phase 2 closes.

### 🧰 Site upkeep (org requirements, 2026-11-11)

- [ ] `small` 🟡 **Stamp the build** *(Site)* — `<meta name="build">` set from `VERCEL_GIT_COMMIT_SHA` at build time. **Done when:** `Get-SurfaceDrift.py` shows edge-spectrum `current`.
- [ ] `small` 🟡 **ROADMAP in the home page's Read on card** *(Site)* — `site/src/pages/Home.tsx` lists Methodology, Data architecture, Change log and the repo; today the roadmap is only reachable from the ⌘K palette. **Done when:** the card links `docs/ROADMAP.md` and `check:spectrum-browser` still passes.
- [ ] 🟡 **Enforce the Content-Security-Policy** *(Security)* — the full policy shipped **report-only** on 2026-11-12 (`site/vercel.json`: strict for the app, looser for `/spectrum/` and `/diagram/`, zero violations in a scripted pass over every page and theme). Rename the two `Content-Security-Policy-Report-Only` headers to `Content-Security-Policy` and fold `frame-ancestors` in, after production has run clean for a week. A `vercel.json` edit, so the sweep holds it. **Done when:** `curl -I` shows an enforced policy with `script-src` and the browser check logs no violation. 🔒 Needs owner
- [ ] **Trim the GitHub topics to four or five** *(Metadata)* — the repo carries eight. 🔒 Needs owner

### 🔎 Audit follow-ups (project audit, 2026-11-11)

The audit's immediate, 7-day and 30-day items shipped on 2026-11-12, and so did twelve items
of its 60-day list, ticked below (changelog entries of that date; pull requests #84, #87 to #90, #92 and #94 to #98).
The unticked items are what is left, in the audit's order; the IDs are the audit's. The durable store for the advisor
limits is deferred by the owner. Next up: **Cite the remaining `published` rows**.

- [ ] 🟠 **Require CI and code-owner review on `main`** *(Security, SEC-02)* — `.github/CODEOWNERS` exists but does nothing until the ruleset requires code-owner review, and the `check` job is still advisory. **Done when:** a PR with a failing `check` cannot be merged. 🔒 Needs owner
- [ ] 🟠 **Remove the personal email from public history** *(Security, SEC-01)* — 30 commits on `main`. A history rewrite and force-push in a quiet window, then re-clone everywhere. **Done when:** `git log --all --format=%ae` lists only noreply addresses. 🔒 Needs owner
- [x] 🟡 **Confirm the code-scanning list is empty** *(Security, SEC-11)* — done 2026-11-12: after the merges the code-scanning list has no open alerts (`gh api repos/ai-automation-tools/edge-spectrum/code-scanning/alerts?state=open` returns none).
- [ ] 🟡 **Read ESPN's terms at the source** *(Compliance, GOV-01)* — the notice in the README and the templates reflects a summarised reading. **Done when:** the ESPN-terms row in `UPSTREAMS.md` carries the date the owner read them. 🔒 Needs owner
- [x] 🟠 **Live scoreboard grading** *(Bugs, BUG-17, BUG-31, BUG-15, BUG-28, BUG-35)* — done 2026-11-12: one pure `gradeBet` in `site/src/liveGrading.ts` grades every home/away and favourite/underdog selection, reads the favourite from the numeric spread, reports streak and rest selections as *not evaluated*, builds the date label in local time and aborts a superseded request. Held by `npm run check:live-grading` (27 selection × outcome rows, `SA`/`SAC` included), in CI.
- [x] `small` 🟡 **TypeScript `strict`** *(Code quality, ARCH-01)* — done 2026-11-12: `site/tsconfig.json` sets `strict: true` and `npm run lint` passes. `validateStrategy` uses `safeParse` with no cast. `react-dom/client` is typed by a local declaration; installing `@types/react-dom` instead is a dependency change for the owner.
- [x] 🟡 **Split `runBacktest`** *(Architecture, ARCH-02, BUG-26)* — done 2026-11-12: `selectSide` returns a side, `priceAndGrade` settles it in one place and `passesFilters` applies the ranges; nothing reads the side from the bet text. Output was byte-identical on 276 strategies before the one intended change: spread favourites come from the line, and level moneylines have no favourite. Held by `check:engine` (ledger read-back) and `check:market`.
- [x] `small` 🟡 **Backtester form leftovers** *(Bugs, BUG-06, BUG-16, BUG-20)* — done 2026-11-12: the schema rejects a streak filter on totals and the form hides it; `rangeIssues` is the one min/max rule for the form and the schema, and an inverted pair is never sent; a failed run clears the old result. Held by `check:strategy-url` and the backtester section of `check:spectrum-browser`.
- [x] `small` 🟡 **Odds parser and de-vig edge cases** *(Bugs, BUG-21, BUG-22)* — done 2026-11-12: only a plain number parses as a price, and the power method finds its upper bound. Held by `check:odds` (the four inputs, and a grid from 1.01 to 1001).
- [x] `small` 🟡 **Line capture robustness** *(Bugs, BUG-23, BUG-24, BUG-32, BUG-34)* — done 2026-11-12: broken lines and undated games are skipped with a warning, the day-file name must be a date, and "seen" is keyed by event across the last 8 day files, with the digest following a game across files. Held by `check:lines`. Still to confirm on two days of real captures: that a game ending after the board date changes gets its final.
- [ ] `small` 🔵 **Late finals in the line archive** *(Bugs, BUG-32)* — a game that ends after ESPN's board has moved to the next day may never get its final captured. Read two consecutive days of real capture files; if a final is missing, have the collector also fetch the previous day's board. **Done when:** every finished game in those two days has a final record, or the gap has a fix held by `check:lines`.
- [x] `small` 🟡 **Spectrum form and label safety** *(Bugs, BUG-25, BUG-33)* — done 2026-11-12: an open "Where do I sit?" form is never rebuilt, so a bar hover, a Play tick or a filter keeps what was typed; arrow keys in a select no longer move the horizon; the reader's row name is escaped in the chart. Held by `check:spectrum-browser` (it fills the form, hovers a bar, plays a tick and reads the values back, and loads a name made of markup).
- [x] 🟡 **Accessibility depth** *(UX-05, UX-06, UX-11, UX-12, UX-13, UX-16, UX-19)* — done 2026-11-12: the ⌘K palette is a native modal dialog with combobox and listbox roles; the game log shows 25 rows a page and sorts by date, net return and status; on a phone the advisor comes before the chart; toggles, tabs and the current page expose their state; a finished backtest and a scoreboard error are announced; the equity curve, the hero strip and the Spectrum charts have text alternatives; a bad calculator price says why under its field; the age and help-line line sits under each tool's heading. Held by `check:spectrum-browser` section 10 and `check:odds`.
- [x] `small` 🟡 **Remove unused dependencies and leftovers** *(ARCH-04, ARCH-05, ARCH-07)* — done 2026-11-12: `d3`, `@types/d3`, `autoprefixer`, the second `vite` entry and the broken `clean` script are gone; so are the `DISABLE_HMR` switch, the decorator flags and the unused `@/` alias; the dead game fields, the duplicate odds helper and 23 unused imports are removed, and `tsconfig.json` now sets `noUnusedLocals` and `noUnusedParameters`; the game log gains its Push filter; the Spectrum rows lose four keys nothing read (the page is 148,722 → 132,106 bytes). Lint, build and every check pass.
- [x] 🟡 **A fork that does not point at the original** *(Product, PROD-04)* — done 2026-11-12: `vite.config.ts` reads which repository it is building and applies the original's site and org URLs (kept in `projectLinks.ts`) only to `ai-automation-tools/edge-spectrum`. A fork's build has no canonical URL, sitemap entries or share image naming the original, no consent script and no org links; `EDGE_SPECTRUM_SITE_URL` gives it its own. The self-hosting guide gained an *After you fork* list; the drift workflow was already guarded. Held by `npm run check:fork` in CI, which builds as a fork and fails if any output file names the org domain.
- [ ] 🟡 **A durable store for the advisor limits** *(Security, SEC-03, SEC-05)* — the 2026-11-12 limits are in process memory. Only worth doing if the Gemini key quota (Action 2.7b) proves too coarse; picking the store is an owner decision. 🔒 Needs owner
- [x] `small` 🔵 **Record count in one place** *(AI-08)* — done 2026-11-12: `check-spectrum.ts` and `check-spectrum-browser.ts` read `totalRecords` from `provenance-baseline.json`, and the Spectrum tool blurb in `tools.ts` is built from `EDGES.length` and `EDGE_CATEGORIES.length`. Adding a probe record changed only `edges.ts`, the generated files and the baseline that `check:edges -- --write-baseline` writes. The three Edge Spectrum skills in agent-skills drop their pinned counts (agent-skills #102).
- [x] 🟠 **Provenance programme and a dataset freeze** *(Product, PROD-07, PROD-08)* — done 2026-11-12: every record declares a `basis` (`math`, `published` or `estimate`; 59, 108 and 73 today), `provenance-baseline.json` holds each category's record and cited counts, and `check:edges` fails if any category's cited count falls. The freeze rule is under *Sequencing rationale* above: `check:edges -- --write-baseline` refuses a new record anywhere while a category cites under `MIN_CITED_SHARE` (50%) of its rows, which today is 13 of 15. The burn-down table is generated into `data/edge_dataset.md`. The weekly content job now cites existing rows instead of adding new ones while the freeze holds.
- [x] 🟠 **Cite the math rows, and stop aging them** *(Product, PROD-07 steps 2, 3)* — done 2026-11-12: all 59 `math` records cite their rules and carry a methodology; 13 figures that disagreed with their source were corrected (parlays now priced at true odds from −110 legs; blackjack, pai gow, three card poker, let it ride, caribbean stud, big six, keno and three lottery rows to the published figure). The page's `isStale` skips a `math` row with a methodology. Held by `check:edges` (source and methodology required on every `math` row) and `check:spectrum` (no `math` row is ever badged).
- [x] `small` 🟡 **Bring `UPSTREAMS.md` current, quiet the diagram warning** *(OPS-04, OPS-08)* — done 2026-11-12: the framework table quotes majors beside the npm registry's latest, so a Dependabot patch can't stale it; CI's diagram-drift warning step is gone and the weekly `--check` remains. The diagram itself is still pinned to `0b3c7583` and waits for the org upkeep re-pin.
- [x] `small` 🟡 **Refresh the project skills and the job prompts** *(AI-07, AI-09, AI-10, AI-15)* — done 2026-11-12: a fourth skill, `edge-spectrum-registry`, covers the Cronsole templates and the line scripts; the other three caught up with the audit fixes (agent-skills #104), and the installed copies in `.claude/skills/` match. The three job prompts lost their stale facts (PR #46, `Versions/`, CDN Plotly), verify by running every `npm run` step in `ci.yml`, read their skill by path, and the roadmap job no longer installs packages (claude-routines).
- [x] `small` 🔵 **One check command, an API reference, contributor files** *(DOC-15, DOC-16, DOC-17)* — done 2026-11-12: `npm run verify` is the one ordered list of checks and CI runs it; `docs/README.md` is the one description of them; `docs/api.md` covers every endpoint; `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, a PR template and two issue forms are in. Private vulnerability reporting is off, so there is no security link in the issue chooser. 🔒 Turning it on is a repo setting.
- [x] 🟠 **Cite the stock, bond, cash and metals rows** *(Product, PROD-07)* — done 2026-11-12: 52 `published` rows cite the issuer's NAV total return since inception, a current Bankrate or FDIC rate, or Damodaran, with the window on each row; 35 figures moved to their source. 137 of 240 records are cited and those four categories are over 50%.
- [x] 🟠 **Cite the remaining `published` rows** *(Product, PROD-07)* — done 2026-11-12: the last 33 cite a source read on the day (Nareit sector returns, FRED, issuer NAV, NYRA and West Virginia takeout, the Nevada Gaming Control Board, and the Minnesota, Michigan, New Hampshire and Florida lottery reports and rules); 32 figures moved. Every `math` and `published` row is cited: 170 of 240.
- [ ] 🟡 **Source or retire the `estimate` rows in the frozen categories** *(Product, PROD-07, PROD-08)* — Collectibles, Poker & Skill-Based, Prediction Markets and Insurance & Annuities still cite under half their rows, so the dataset stays frozen. Each `estimate` row either gets a published source (and becomes `published`) or is cut. **Done when:** `check:edges` reports no category under 50%.

### 📊 Phase 3: Reproducible Reporting & Statistical Diagnostics 🟡
*Enables exporting reproducible analysis bundles and provides honest statistical inference.*

- [x] 🟠 **Action 3.1 — Explicit Ledger Response Contract (Audit E3)** — done 2026-09-21
   - **Implementation:** `/api/backtest` returned a field called `games` that was in fact `simulatedGames.slice(-250)`, alongside a complete `profitHistory` — so the response gave a caller no way to tell a 250-bet run from a 7,072-bet one, and `GamesTable`'s own heading read "250 Matches Analyzed" for both. Measured against the dev server: NFL moneyline/favorites 2000–2025 places **7,072** wagers and returned exactly 250 of them under the name `games`. `BacktestResponse` now carries `gamesPreview`, `previewLimit` (the exported `LEDGER_PREVIEW_LIMIT = 250` in `dataGenerator.ts`) and `totalGames`; the same run now reports `totalGames: 7072`, `previewLimit: 250`, `gamesPreview.length: 250`, with `profitHistory.length` and `summary.totalBets` both 7,072, and the preview verified to be the ledger's tail. The heading reads "Last 250 of 1,360 Wagers" and the footnote names both figures; a run under the cap (NFL spread/home 2020–2024 hot-streak, **85** bets / +5.52% ROI — the same fixture Action 2.4 measured) takes the untruncated branch and says so. No compatibility shim: `result.games` was read in exactly one place, and `tsc --noEmit` catches any other reader. The full unsliced ledger is **not** part of this item — it is Action 3.2's `ledger.csv`, which is where that bullet now lives.

- [ ] 🟠 **Action 3.2 — Reproducible Export Bundle Architecture (Audit Track B)**
   - **Feature:** A complete, downloadable research archive (`site/src/server/report.ts`):
     - `report.md` — Parameters, summary metrics, statistical confidence intervals, methodology notes, and disclaimer headers.
     - `ledger.csv` — Full, unsliced history of every wager placed. *(This is the export path Action 3.1's contract points at: the API deliberately ships only `gamesPreview`, so the bundle is the only place the complete ledger is available.)*
     - `strategy.json` — Exact configuration payload for deterministic reproduction.
     - `manifest.json` — Execution metadata (`generatedAt`, engine version, git commit, and SHA-256 hashes of all bundle files).

- [x] 🟠 **Action 3.3 — First-Tier Statistical Inference (Audit E1 · Track B)** — done 2026-09-28
   - **Implementation:** The backtester reported a win rate with nothing to read it against — no breakeven, no uncertainty — so an 85-bet run returning +5.52% looked like an edge. `site/src/stats.ts` (pure, no imports) adds `breakevenRate()` (n / Σ decimal over decided wagers — exact for flat stakes, 52.38% at −110), `wilsonInterval()` and an exact log-space `binomialUpperTail()`; `runBacktest()` puts `breakevenWinRate`, `winRateLow`/`winRateHigh` and `pValue` on `BacktestSummary`, over decided wagers only, from unrounded prices. A **Statistical Significance** panel under the six summary cards shows all three with a verdict (below breakeven / indistinguishable from noise / significant at 5%), a small-sample badge under 250 wagers, and a multiple-testing caveat. Measured against the dev server: that NFL spread/home 2020–2024 hot-streak fixture reads **55.42% vs 52.45% breakeven, 95% CI 44.73–65.64%, p = 0.333** — noise; NFL moneyline/favorites 2000–2025 reads **56.21% vs 58.05%, p = 0.999** over 7,072 wagers. Held by `npm run check:stats` in CI. The breakeven is `1/mean(decimal)` over the ledger, consistent with `odds.ts`'s `1/decimal` convention. *Not done: "include them in exported reports" — there is no export yet; the fields are on the summary, so Action 3.2's `report.md` reads them rather than recomputing.*
   - **Feature:** Display fundamental statistical significance metrics on backtest results and include them in exported reports:
     - Breakeven win rate calculated from realized average odds. *(Use `parseOdds` / `1/decimal` from `site/src/odds.ts`, shipped with Action 6.1 — do not re-derive the conversion.)*
     - 95% binomial confidence interval on the strategy hit rate.
     - One-tailed p-value testing the hypothesis that the strategy has a positive edge ($H_0: \text{winRate} \le \text{breakeven}$).
     - Sample size warning badge for runs with fewer than 250 wagers.

- [x] 🟡 **Action 3.4 — Strategy URL Query Serialization (Audit Track B)** — done 2026-09-28
   - **Implementation:** The strategy lived only in React state, so no backtest could be bookmarked or sent. `site/src/strategyUrl.ts` (no Zod — it ships to the client) serializes every field the engine reads into `/backtester?sport=…&betType=…&side=…&streak=…&from=…&to=…&unit=…&bankroll=…` plus any set screening filters; `BacktesterApp` seeds its state from the query and writes it back with `replace` inside the existing 300 ms debounce, so the address bar tracks the run without a history entry per keystroke. The builder's action bar gains **Copy link**. The parser validates each field against the lists and bounds in `strategyBounds.ts` — the enum lists moved there from `strategySchema.ts`, which still asserts they match `types.ts` — and falls back to the default per field: a side that does not fit the bet type, an out-of-range season, an inverted min/max pair or a non-positive stake is dropped, not sent. Measured against the dev server: a link reopens the NFL spread/home 2020–2024 hot-streak fixture at **85 wagers**, a link copied from the NBA Cover Favorite preset reproduces **368 wagers** on a fresh load, and a mangled link opens on defaults with no error banner. Held by `npm run check:strategy-url` in CI, which round-trips a fully-populated strategy and fuzzes 5,000 random links against the real Zod schema.
   - **Feature:** Encode active strategy filters into URL query parameters (`/backtester?sport=nba&betType=spread&...`) to enable one-click sharing and bookmarking.

- [x] 🟡 **Action 3.5 — Responsible Gambling & Compliance Layer** — done 2026-10-05
   - **Implementation:** No page carried a helpline, an age note or a "not advice" line — the hub landing had one sentence passed in as a `note`, and the backtester, `/odds`, `/parlay`, `/setup` and the Spectrum page had nothing. The notice now lives inside `site/src/components/SiteFooter.tsx` itself rather than in a prop, so every `route` page that renders the shared footer (all five today) carries it unconditionally and a new tool inherits it: education only / not investment, financial or betting advice, an adults-only (18+ or 21+) age note, and tap-to-call help lines — US 1-800-GAMBLER, UK National Gambling Helpline 0808 8020 133, Australia Gambling Help 1800 858 858 — plus GamblingTherapy.org for everywhere else. The static Spectrum page cannot import the component, so its footer carries the same text by hand (no change to its `MATH & CONSTANTS` or `RAW` blocks; `check:spectrum` and `gen:edges --check` both still pass). *Not done: "exported markdown reports" — there is no export yet; Action 3.2's `report.md` should open with the same wording. Also not done: the per-message "not financial advice" line on AI advisor output that `hub_improvement_plan.md` §7 suggests — the backtester's footer covers the page the advisor sits on.*
   - **Feature:** Add responsible gambling helpline information (1-800-GAMBLER, international resources) and financial disclaimers to application footers and exported markdown reports.
   - **Scope note (2026-09-03):** the standalone calculator pages (`/odds`, `/parlay`, and 6.3 onward) currently have no footer or disclaimer at all. Put the disclaimer in a shared component so every `route` tool picks it up, rather than per page.

### ⚙️ Phase 4: Client-Side Engine & Analytical Depth ⚪
*Transitions heavy simulations to client-side Web Workers and introduces advanced risk modeling.*

- [ ] 🟠 **Action 4.1 — Web Worker Client-Side Simulation Engine**
   - **Feature:** Move `runBacktest()` execution from `/api/backtest` into a client-side Web Worker.
   - **Benefits:** Sub-millisecond iteration, offline execution, zero serverless compute consumption, and immunity to server timeout constraints.

- [ ] 🟠 **Action 4.2 — Monte Carlo Equity Path Fan Chart**
   - **Feature:** Resample the wager sequence 1,000 times using bootstrap shuffling to render 5th, 25th, 50th, 75th, and 95th percentile equity paths.
   - **Purpose:** Illustrates path variance and demonstrates how identical edges can yield vastly different short-term outcomes.

- [ ] 🟡 **Action 4.3 — Walk-Forward Strategy Validation**
   - **Feature:** Provide automatic in-sample / out-of-sample partitioning (e.g. 2000–2015 parameter selection vs. 2016–2025 out-of-sample testing) to detect data mining and curve fitting.

- [ ] 🟡 **Action 4.4 — Staking Strategy Grid & Vig Sensitivity Slider**
   - **Feature:** Compare performance across Flat Staking, Proportional % Sizing, Quarter/Full Kelly, and Martingale (with ruin warnings). Add a vig slider allowing users to test resilience if lines move from −110 to −115.
   - **Reuse note (2026-09-03):** the Kelly sizing math must be the same function Action 6.3 ships (put it in `site/src/odds.ts` or a sibling pure module, no React imports) so the simulator grid and the standalone calculator cannot disagree. The vig slider is a `devig()` / `americanToDecimal()` call from `odds.ts`, not new arithmetic.

- [x] 🟠 **Action 4.5 — Bundle Optimization & Code Splitting** — done 2026-11-12: tool pages and the markdown parser are `lazy()` chunks and the fade uses the slim motion build. The home page loads **138 kB** gzip of JS (was 324 kB in one 1,068 kB chunk); `npm run check:bundle` fails CI over 150 kB or on any chunk over 500 kB. Each new tool page must be a `lazy()` import.
   - **Feature:** Lazy-load secondary routes (`/backtester`, `/odds`, `/parlay`, and each later calculator) with `React.lazy` and split vendor chunks (`recharts`, `react-markdown`) to reduce initial JS payload to <150 kB. Measured 2026-09-03: a single **799 kB** chunk (was ~776 kB before the two calculators; the calculators themselves are small — the weight is the backtester's `recharts` + `react-markdown` + `dataGenerator`, which the hub landing and the calculators never use). Each new Phase 6 tool that lands before this makes the case for it stronger.

- [ ] 🟡 **Action 4.6 — Native React Port of Spectrum Visualizer**
   - **Feature:** Migrate `site/public/spectrum/index.html` into a native React page (`site/src/pages/Spectrum.tsx`), unifying navigation, theme state, and data loading. *(V21, 2026-10-12, rebuilt the page in place rather than porting it; the inspector, controls bar, URL state and "You" row are the component boundaries a port would keep.)*

- [x] 🟡 **Action 4.7 — Compare Mode on the Spectrum Page** — done 2026-10-13: a pinned bar's **Compare +** adds it to a set of up to three, kept in the URL as `cmp=` (names joined by `|`); the inspector then plots return on capital by horizon as one line each, with a ✕ at the first horizon each bankroll is gone, honours the Real $ toggle, and outlines the compared bars on the main chart. The single-event horizon is left off the x-axis so a wager and a trading day are not drawn as one unit. Linear y-axis: a 10-year crypto line still flattens the rest.
   - **Feature:** Pin up to three activities and show return on capital by horizon as lines in the inspector, with the ruin horizon marked on each. The per-horizon values are already precomputed (`v`, `vr`, `t` on every row); this is one Plotly line chart and a multi-pin URL key.

- [ ] 🟡 **Action 4.8 — Ranges Instead of Point Estimates**
   - **Feature:** Optional `lo` / `hi` on each record (e.g. a 10th–90th percentile of the annual return, or the takeout range across tracks) rendered as Plotly `error_y` bars and shown in the inspector. Cheap on the page; the work is in the dataset, and it answers "says who?" better than a citation does.

- [ ] 🔵 **Action 4.9 — Edit Any Row's Assumptions**
   - **Feature:** The "Where do I sit?" form (2026-10-12) lets a reader place their own row; this extends it so the pinned record's `du` and `ced` can be overridden in place ("I play two hours a week at $25") and the ruin point recomputes live, without creating a second row. The frequency assumption is the most contestable input in the dataset and the one readers most want to argue with.

### 📥 Phase 5: Forward Data Collection & Persistence 🟡
*Establishes storage and scheduled collectors to capture real closing lines and market data over time.*

- [x] 🔴 **Action 5.1 — Persistence Architecture Selection (Audit D9 · Track C)** — done 2026-11-10: local append-only JSONL, one file per sport per scoreboard day. No account, no cost and no secrets; a hosted store can ingest the files later, when Action 5.4 needs the lines on the site. See [data-architecture.md](data-architecture.md#a-append-only-scoreboard-line-snapshots).
   - **Architecture:** Choose and initialize a lightweight persistence layer (e.g. Vercel KV, Supabase, Neon Postgres, or SQLite on storage) for append-only line capture.

- [x] 🟠 **Action 5.2 — Scheduled ESPN Scoreboard Line Capture (Audit C1 · Track C)** — done 2026-11-10: `site/scripts/capture-lines.ts` (`npm run capture:lines`), held by `npm run check:lines`, scheduled every 3 hours by the Cronsole template [`edge-spectrum-line-capture`](https://cronsole.ai-automation-tools.dev/#/t/edge-spectrum-line-capture). The catalog is generated by `npm run build:registry` and served at `/registry/`. The record adds `state`, `minutesToStart`, `provider` and `spreadOdds` to the list below, and a game that has started gets `linePhase: null`.
   - **Feature:** Run a scheduled cron job (every 2–4 hours) snapshotting `/api/espn-scoreboard` data.
   - **Record Structure:** Append-only log storing `eventId`, `sport`, `eventDate`, `capturedAt`, `teams`, `spread`, `total`, `moneyline`, and `linePhase: 'open' | 'midday' | 'close'`.
   - **Framing:** Documented strictly as public scoreboard captures for educational CLV analysis.

- [x] 🟢 **Action 5.2a — Daily Line-Movement Digest** — done 2026-11-10: `site/scripts/digest-lines.ts` (`npm run digest:lines`) writes `<archive>/digests/<day>.md` with each game's open → close spread, total and moneyline, the biggest moves and every capture gap; scheduled daily by the Cronsole template [`edge-spectrum-line-digest`](https://cronsole.ai-automation-tools.dev/#/t/edge-spectrum-line-digest). Held by `npm run check:lines`. Its archive reader is what Action 5.4 builds on.

- [ ] 🟡 **Action 5.3 — Market-Close Ingestion for Named Tickers (Audit C2 · Track C)**
   - **Feature:** Ingest trailing adjusted closes for stable investment instruments (`SPY`, `QQQ`, `GLD`, `HYG`) from keyless market data sources to supply timestamped as-of returns for investing rows.
   - **Done when:** the collector runs on a schedule set by the Cronsole template `edge-spectrum-market-close`, in the catalog via `npm run build:registry`, like 5.2 and 5.2a.

- [ ] 🟠 **Action 5.4 — Closing Line Value (CLV) Skill Grading Engine**
   - **Feature:** Allow users to log hypothetical or placed wagers, fetch the true closing line from captured data, and calculate CLV beat rate (the primary mathematical indicator of betting edge).
   - **Constraint (2026-11-12, audit GOV-01):** grading runs on the user's own archive, locally. The site does not host or republish lines captured from ESPN.

### 🧮 Phase 6: Standalone Calculators & Engagement Tools 🟡
*Builds high-utility, SEO-friendly standalone calculators that feed back into the core hub.*

- [x] 🟠 **Action 6.1 — Odds Converter & No-Vig Fair Price Calculator** — done 2026-09-03
   - **Tool:** Bidirectional conversion across American, Decimal, Fractional, and Implied Probabilities with multi-way market hold removal (Power / Multiplicative / Shin methods).
   - **Shipped:** `/odds` — `site/src/odds.ts` (pure math) + `site/src/pages/OddsConverter.tsx`; regression check `npm run check:odds`.

- [x] 🟠 **Action 6.2 — True-Odds Parlay / SGP Hold Calculator** — done 2026-09-03
   - **Tool:** Compares true joint probability against bookmaker parlay payouts to expose compounding bookmaker margin across multi-leg wagers.
   - **Shipped:** `/parlay` — `parlay()` in `site/src/odds.ts` + `site/src/pages/ParlayCalculator.tsx`; legs assumed independent (correlation input deferred). Covered by `npm run check:odds`.

- [ ] 🟡 **Action 6.3 — Standalone Kelly & Bankroll Sizing Calculator**
   - **Tool:** Single and simultaneous multi-event Kelly sizing with risk-of-ruin curves and fractional sizing recommendations.

- [ ] 🟡 **Action 6.4 — Personal Edge Audit Tool** 🟡 *(first step shipped 2026-10-12: the Spectrum page's "Where do I sit?" form places one activity — a wager from any game or a custom edge with bankroll, stake and frequency, or a holding — on the chart as a "You" bar and reports it in dollars, kept in the URL. The blended multi-activity audit remains.)*
   - **Tool:** User enters their personal activities (401k index funds, sports betting volume, poker hours, lottery tickets) and receives a blended annualized return and expected drag calculation.

- [ ] 🟡 **Action 6.5 — "Guess the Edge" Quiz & Portfolio Blender**
   - **Tool:** Interactive game prompting users to estimate mathematical edges on common wagers and investments, followed by a portfolio blender tool combining positive and negative edge assets.

- [x] 🟡 **Action 6.6 — Embed Mode for the Spectrum Page** — done 2026-10-13: `?embed=1` hides everything but the chart and a caption carrying the helpline and an "open the full tool" link to the same view; the chart fills the iframe's height instead of growing past it. Checked at 700×450 with no scroll. Bars carry no name labels, so a reader identifies them by hover — pair an embed with a narrow `q` filter.
   - **Tool:** `?embed=1` hides the hub nav, header, controls and footer and shows the chart plus a one-line caption, so a preset view can sit in an iframe on a blog post or a partner page. The view is already a URL (V21), so this is a CSS class and a "open the full tool" link.

- [ ] 🟡 **Action 6.7 — Share Card per Activity**
   - **Tool:** A PNG per pinned activity (name, category, the return at the chosen horizon, the ruin figure, the helpline line) sized for social, generated client-side from the inspector or via `@vercel/og` alongside Action 7.3. The "Where do I sit?" row is the obvious first card: "my Sunday parlays reach $0 in 13 months".

- [ ] 🔵 **Action 6.8 — Regional Variants**
   - **Tool:** UK and Australian lottery rows (Lotto, EuroMillions is in; Oz Lotto, Powerball AU), European single-zero roulette as the default casino row, bookmaker margins by market (Betfair vs. a UK high-street book), and non-US tax layers (UK ISA, CGT allowances). The helplines are already regional; the dataset is not.

### 💰 Phase 7: Public Launch, Data Licensing & Monetization ⚪
*Expands data coverage through commercial partnerships and adds premium features.*

- [ ] 🟠 **Action 7.1 — Commercial Historical Odds Integration**
   - **Integration:** Integrate verified historical closing lines and injury reports from commercial feeds (The Odds API / Sportradar) stored as static Parquet/JSON files for instant loading.

- [ ] 🟡 **Action 7.2 — User Accounts & Saved Portfolios**
   - **Feature:** Optional user authentication for saving custom backtests, personal edge audits, and tracking CLV records over time.

- [ ] 🟡 **Action 7.3 — SEO, Social Meta Cards & Growth Loop** *(the static half shipped 2026-11-12: `robots.txt`, `sitemap.xml`, one share image, per-route titles and descriptions, real 404s. Per-result cards are what is left.)*
   - **Feature:** Implement `@vercel/og` to generate dynamic social sharing cards for backtest equity curves and calculator results, with automated sitemaps and meta tags.

- [ ] 🟡 **Action 7.4 — Publish the Dataset as an Endpoint**
   - **Feature:** `site/public/spectrum/edges.json` is already generated and served. Document it as a public, CORS-enabled dataset with a stable schema and version header, add `/api/edges` returning the computed horizons (`returnOnCapital`, `expectedTurnoverCost`, `ruinPoint` per row per horizon, from the same functions `check:spectrum` holds), and state the licence. Other people building on the data is the cheapest distribution the project can get, and the provenance ratchet (2.3, 2.10) is what makes it citable.

---

<p align="center">
  <a href="README.md">← Docs home</a> ·
  <a href="methodology.md">Methodology</a> ·
  <a href="data-architecture.md">Data Architecture</a> ·
  <a href="CHANGELOG.md">Changelog →</a>
</p>
