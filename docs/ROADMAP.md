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

The Edge-Spectrum Weekly Roadmap routine (Monday 23:00) works this file: it takes the first open item
it can finish and verify, lower phase first and higher priority first within a phase, and opens a
`roadmap/auto-<date>` PR that the org PR sweep reviews. It is the single sequenced backlog; the
findings from the codebase audits are synthesised here. **Every item above `## After public release`
is a go-live gate.** Phase 2 is the project's own release gate (below), so its open items sit above
the line even though the repo has been public since 2026-09-11. Ticking an item adds its line to the
[changelog](CHANGELOG.md) and updates any doc it made stale, in the same commit.

Markers: `- [ ]` open, `- [-]` claimed by a run in progress (a dated note says by what, e.g. a PR
number), `- [x]` done, `- [!]` blocked (the reason follows on the line). `small` marks an item a check
verifies; `🔒 Needs Mike` marks one only Mike can do. Each item carries a priority: 🔴 Critical
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
Phase 6: Calculators 🟡 ◄── Phase 5: Collection ⚪ ◄── Phase 4: Client Engine ⚪
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

1. **Truth before expansion:** Mathematical errors distort the core thesis of the platform. The headline example — comparing unbounded turnover cost against bounded capital returns on one axis — was fixed on 2026-08-31 and is held by `npm run check:spectrum`; the dataset now has one source of truth held by `npm run gen:edges -- --check`. The dead strategy controls were purged on 2026-09-14; what remains unheld is provenance (no record cites a source). Phase 2 must complete before building report exports or public features. Self-contained calculators are the one exception (see the gate scope note above): 6.1 and 6.2 shipped 2026-09-03 with their own regression check and touch neither the dataset nor the simulator.
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

- [ ] 🟠 **Action 2.7 — AI Advisor Rate Limiting & Spend Caps**
   - **Problem:** Passcode authentication protects against unauthenticated users but does not limit total requests or cost from authenticated sessions.
   - **Implementation:**
     - Add IP/session rate limiting (e.g. 10 requests per hour per session).
     - Implement a hard daily spend ceiling with a fallback 503 response.

- [ ] 🔵 **Action 2.8 — Move the Spectrum page off Plotly 2.32.0 (upstream check, 2026-10-07)** *(V21 redesign of 2026-10-12 kept the pin; the page now uses `Plotly.react`, `hovertext`, `marker.opacity` arrays and category-axis shapes, so test those under 4.x.)*
   - **What:** Bump the pinned `cdn.plot.ly/plotly-2.32.0.min.js` in `site/public/spectrum/index.html` to a current release and fix whatever the 4.0 breaking changes touch in the page's traces and layout (4.0 switched colour parsing from TinyColor to culori and changed some subplot defaults).
   - **Why:** plotly.js is at 4.1.2 (4.0.0 shipped 2026-08-24); the pin is two majors behind. Source: https://github.com/plotly/plotly.js/releases. No advisory affects the 2.32.0 pin as read; this is drift, not an emergency.
   - **Where:** `site/public/spectrum/index.html` (script tag and the theme-aware layout colours); not the `RAW` block.
   - **Done when:** the page renders in both themes, `npm run check:spectrum` and `npm run build` pass, and the three measures plot as before.

- [x] 🟠 **Action 2.9 — Browser Smoke Test for the Spectrum Page (V21 review, 2026-10-12)** — done 2026-10-13: `npm run check:spectrum-browser`, a plain `tsx` script on `playwright` (no test runner), runs last in CI against `vite preview` of `dist/`. Covers the roadmap's list — 225 bars with no console errors, a real bar click pins and the pin survives a reload, the theme switch redraws, "Where do I sit?" adds a bar — plus the comma search, compare mode, embed mode and touch-screen `dragmode: false`. Verified failing on a removed `.li` reset and a reverted touch fix.
   - **Problem:** `check:spectrum` tests the page's math; nothing tests the page. Every defect found during the V21 rebuild (a squeezed plot, washed-out toggles on light, a pinned custom row dropped by `update()`) was caught by hand in a browser, not by CI.
   - **Implementation:** One Playwright run in CI against `vite preview`: the page loads with 225 bars and no console errors, a click pins and the URL round-trips, the theme switch redraws, and the "Where do I sit?" form places a bar. Pair it with Action 2.8 so the Plotly bump has a net under it.
   - **Done when:** the test is a CI step and fails on a deliberate regression (e.g. removing the `.li` button reset).

- [ ] 🟠 **Action 2.10 — Provenance on the Headline Figures & a Stale-Figure Flag**
   - **Problem:** 15 of 225 records cite a source and none of them are the ones visitors argue about: S&P 500 at 10%, Bitcoin at 45%, HYSA at 4.5%, the 1-year CD. Those are also the rate-sensitive ones.
   - **Implementation:** Add `source` / `asOf` / `window` to the top twenty rows by visibility (every `raw` Cash & Savings row, the index ETFs, Bitcoin, Ethereum, gold); have the Spectrum inspector flag any figure whose `asOf` is older than twelve months or missing. The ratchet in `check:edges` already holds the count.
   - **Done when:** coverage is above 35 and the inspector shows a "verify" badge on stale rows.

- [ ] 🟡 **Action 2.11 — Self-Host Plotly**
   - **Problem:** `cdn.plot.ly` is a single point of failure for the whole tool and a third-party request on every visit.
   - **Implementation:** Ship `plotly.js-basic-dist-min` (bar + scatter is all the page uses; roughly a third of the full bundle) from `site/public/spectrum/`, with the version in the filename so the upstream check in `docs/UPSTREAMS.md` still has something to compare. Fold into Action 2.8.

- [x] 🟡 **Action 2.12 — Guard the Hand-Maintained Category Maps** — done 2026-10-13: took the ten-line route — `check:spectrum` now fails if any `EDGE_CATEGORIES` entry or `RAW` category is missing from the page's `CC` / `AR_DEFAULT` or the Streamlit archive's `ALL_CATS` / `CC` / `AR_DEFAULT`; verified by deleting `Lottery` from the page's `AR_DEFAULT`.
    - **Problem:** `CC` and `AR_DEFAULT` on the Spectrum page and `ALL_CATS` / `CC` / `AR_DEFAULT` in the Streamlit archive are hand-synced with `EDGE_CATEGORIES`. A new category that misses one falls back to grey and "LOW" silently (`catColor` and `AR_DEFAULT[r.cat] || 2`).
    - **Implementation:** Either `gen:edges` emits those maps from a single colour/risk table in `edges.ts`, or `check:spectrum` asserts every category in `RAW` has an entry in both. The first is cleaner; the second is ten lines.

- [ ] 🔵 **Action 2.13 — Payoff Shape for Positive-Edge Rows**
    - **Problem:** `ruinRisk` and `kellyMultiple` (shipped 2026-10-12) assume an even-money payoff for every row. Tournament poker and DFS pay top-heavy, so the true Kelly fraction is smaller and the ruin risk larger than shown; the inspector says "approximation" but cannot say by how much.
    - **Implementation:** Optional `payout` (average win multiple) and `winRate` fields on `GameEdge`; when present, compute Kelly as `(p·b − q)/b` and ruin risk by the general formula. Rows without them keep the even-money approximation.

- [ ] 🔵 **Action 2.14 — Catch up on the framework majors Dependabot ignores (upstream check, 2026-10-21)**
    - **What:** Take the toolchain majors one at a time, each with the full CI order green: Vite 6 → 8 with `@vitejs/plugin-react` 5 → 6, TypeScript 5.9 → 7, Zod 3 → 4 (`site/src/server/strategySchema.ts` and anything reading `.issues` / error shapes), Express 4 → 5 (`site/server.ts`, dev only), motion 12 → 14, dotenv 17 → 18, lucide-react 0.x → 1.x. Skip any whose changelog shows nothing the repo uses.
    - **Why:** `.github/dependabot.yml` ignores every major, so nothing tracks them; the npm registry's `latest` on 2026-10-21 was vite 8.3.5, @vitejs/plugin-react 6.1.2, typescript 7.0.2, zod 4.6.7, express 5.3.0, motion 14.5.0, dotenv 18.0.8, lucide-react 1.61.0. Source: https://registry.npmjs.org/<package>/latest. This is drift, not a known break; read each package's release notes before bumping.
    - **Where:** `site/package.json`, `site/package-lock.json`, and the call sites above. `.github/workflows/ci.yml` pins `actions/checkout@v4` / `actions/setup-node@v4` (latest tags v7.0.1 / v7.1.0 per api.github.com/repos/actions/*/releases/latest): a workflow edit, so it needs Mike.
    - **Done when:** `npm run lint`, every `check:*`, and `npm run build` pass on the new versions, and `docs/UPSTREAMS.md` lists the new declared versions.

## 🚦 Public release

- [x] Public repo in the `ai-automation-tools` org under Apache-2.0 (`LICENSE`), with CI running on every PR — done 2026-09-11: `d2b59bd`
- [x] Live at `https://edge-spectrum.ai-automation-tools.dev`, deployed by Vercel from `main` — done 2026-09-11: `6114cd6`

## After public release

Nothing below blocks go-live. Phases 3 to 7 keep their numbers; the Phase 2 gate note above says
which of them may ship before Phase 2 closes.

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

- [ ] 🟠 **Action 4.5 — Bundle Optimization & Code Splitting**
   - **Feature:** Lazy-load secondary routes (`/backtester`, `/odds`, `/parlay`, and each later calculator) with `React.lazy` and split vendor chunks (`recharts`, `react-markdown`) to reduce initial JS payload to <150 kB. Measured 2026-09-03: a single **799 kB** chunk (was ~776 kB before the two calculators; the calculators themselves are small — the weight is the backtester's `recharts` + `react-markdown` + `dataGenerator`, which the hub landing and the calculators never use). Each new Phase 6 tool that lands before this makes the case for it stronger.

- [ ] 🟡 **Action 4.6 — Native React Port of Spectrum Visualizer**
   - **Feature:** Migrate `site/public/spectrum/index.html` into a native React page (`site/src/pages/Spectrum.tsx`), unifying navigation, theme state, and data loading. *(V21, 2026-10-12, rebuilt the page in place rather than porting it; the inspector, controls bar, URL state and "You" row are the component boundaries a port would keep.)*

- [x] 🟡 **Action 4.7 — Compare Mode on the Spectrum Page** — done 2026-10-13: a pinned bar's **Compare +** adds it to a set of up to three, kept in the URL as `cmp=` (names joined by `|`); the inspector then plots return on capital by horizon as one line each, with a ✕ at the first horizon each bankroll is gone, honours the Real $ toggle, and outlines the compared bars on the main chart. The single-event horizon is left off the x-axis so a wager and a trading day are not drawn as one unit. Linear y-axis: a 10-year crypto line still flattens the rest.
   - **Feature:** Pin up to three activities and show return on capital by horizon as lines in the inspector, with the ruin horizon marked on each. The per-horizon values are already precomputed (`v`, `vr`, `t` on every row); this is one Plotly line chart and a multi-pin URL key.

- [ ] 🟡 **Action 4.8 — Ranges Instead of Point Estimates**
   - **Feature:** Optional `lo` / `hi` on each record (e.g. a 10th–90th percentile of the annual return, or the takeout range across tracks) rendered as Plotly `error_y` bars and shown in the inspector. Cheap on the page; the work is in the dataset, and it answers "says who?" better than a citation does.

- [ ] 🔵 **Action 4.9 — Edit Any Row's Assumptions**
   - **Feature:** The "Where do I sit?" form (2026-10-12) lets a reader place their own row; this extends it so the pinned record's `du` and `ced` can be overridden in place ("I play two hours a week at $25") and the ruin point recomputes live, without creating a second row. The frequency assumption is the most contestable input in the dataset and the one readers most want to argue with.

### 📥 Phase 5: Forward Data Collection & Persistence ⚪
*Establishes storage and scheduled collectors to capture real closing lines and market data over time.*

- [ ] 🔴 **Action 5.1 — Persistence Architecture Selection (Audit D9 · Track C)**
   - **Architecture:** Choose and initialize a lightweight persistence layer (e.g. Vercel KV, Supabase, Neon Postgres, or SQLite on storage) for append-only line capture.

- [ ] 🟠 **Action 5.2 — Scheduled ESPN Scoreboard Line Capture (Audit C1 · Track C)**
   - **Feature:** Run a scheduled cron job (every 2–4 hours) snapshotting `/api/espn-scoreboard` data.
   - **Record Structure:** Append-only log storing `eventId`, `sport`, `eventDate`, `capturedAt`, `teams`, `spread`, `total`, `moneyline`, and `linePhase: 'open' | 'midday' | 'close'`.
   - **Framing:** Documented strictly as public scoreboard captures for educational CLV analysis.

- [ ] 🟡 **Action 5.3 — Market-Close Ingestion for Named Tickers (Audit C2 · Track C)**
   - **Feature:** Ingest trailing adjusted closes for stable investment instruments (`SPY`, `QQQ`, `GLD`, `HYG`) from keyless market data sources to supply timestamped as-of returns for investing rows.

- [ ] 🟠 **Action 5.4 — Closing Line Value (CLV) Skill Grading Engine**
   - **Feature:** Allow users to log hypothetical or placed wagers, fetch the true closing line from captured data, and calculate CLV beat rate (the primary mathematical indicator of betting edge).

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

- [ ] 🟡 **Action 7.3 — SEO, Social Meta Cards & Growth Loop**
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
