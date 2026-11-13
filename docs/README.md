<a id="docs-top"></a>

<h1 align="center">📚 Edge Spectrum Documentation</h1>

<p align="center">
  <em>System architecture, mathematical models, data schemas, and development roadmaps for Edge Spectrum.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-active-2ea44f?style=for-the-badge" alt="Status: Active">
  <a href="ROADMAP.md"><img src="https://img.shields.io/badge/plan-ROADMAP-8B5CF6?style=for-the-badge" alt="Roadmap"></a>
  <a href="../README.md"><img src="https://img.shields.io/badge/↩-repository_root-6B7280?style=for-the-badge" alt="Repo Root"></a>
</p>

---

## 🗺️ Documentation Directory

| Section / Document | Purpose | Scope |
| :--- | :--- | :--- |
| [**Run your own site**](self-hosting.md) | Demo versus full mode, Vercel deployment, environment variables, and local setup. | Getting Started |
| [**🗺️ Product Roadmap**](ROADMAP.md) | Sequenced action items, milestone tracking, release gates, and feature pipelines. | All Hub Tools |
| [**📐 Mathematical Methodology**](methodology.md) | The DU/CED framework, metric semantics (return on capital vs. turnover cost vs. ruin), and Kelly sizing. | Core Analysis |
| [**🧭 Diagrams**](diagrams/README.md) | The hub data-flow diagram the [homepage](https://edge-spectrum.ai-automation-tools.dev/#sec-flow) shows: dataset → generated Spectrum page, registry → tiles and routes, simulator → serverless functions → ESPN and Gemini. Interactive, every node linked to its code, and drift-checked weekly. | All Hub Tools |
| [**🔌 API Reference**](api.md) | The five method and path pairs under `/api/`: body, response, status codes, auth and cache headers. | Serverless API |
| [**🤝 Contributing**](../CONTRIBUTING.md) | Ground rules, changing the dataset, the checks, and which paths the maintainer reviews. | All Hub Tools |
| [**🗄️ Data Architecture**](data-architecture.md) | Canonical dataset schema (`EdgeRecord`), 15 asset/wagering categories, CI provenance ratchet, and collection pipelines. | Data Layer |
| [**💡 Planning & Ideas**](ideas/README.md) | Over-engineering audits, hub improvement records, and visualizer feature backlogs. | Research & Audits |
| [**📋 Change Log**](CHANGELOG.md) | Historical version notes and feature evolution from standalone Plotly versions to the Vite hub. | Project History |

---

## 🏗️ Core Architecture Overview

Edge Spectrum operates as a multi-tool web application hosted on **Vercel** with the root directory set to `site/`:

1. **The Registry (`site/src/tools.ts`)** — Single source of truth for tool metadata, icons, routing targets, status flags, and accent styles.
2. **The Dataset (`site/src/data/edges.ts`)** — Single source of truth for the edge records. The Spectrum page's inlined `RAW`, `edges.json`, and `data/edge_dataset.md` are all generated from it by `npm run gen:edges`.
3. **Backtest Simulation Engine (`site/src/dataGenerator.ts` & `site/src/server/backtest.ts`)** — Simulates 26 seasons of MLB, NFL, NHL, and NBA games based on power ratings with unbiased market pricing derived from empirical score distributions.
4. **Edge Spectrum Visualizer (`site/public/spectrum/index.html`)** — Interactive multi-horizon comparison across every financial, investing, trading, and wagering activities.
5. **AI Strategy Advisor (`site/src/server/advisor.ts`)** — Server-side Gemini integration providing strategy feedback behind HMAC-signed session gates.
6. **Odds & Market Math (`site/src/odds.ts`)** — Pure, import-free module behind the standalone calculators (`/odds`, `/parlay`): odds-format conversion, multiplicative / power / Shin de-vigging, and parlay true-odds vs. book payout. Later phases reuse it rather than re-deriving conversions. Kelly sizing for `/kelly` sits beside it in `site/src/kelly.ts`, also pure.

---

## 🧪 Testing & Validation Invariants

`npm run verify` (from `site/`) runs every check below in CI's order; the list it runs is that script in
`site/package.json`, and CI calls it. This is the one place that says what each check holds.

- **`npm run check:deployment`** — Verifies demo mode rejects live AI and full-mode sessions, while full mode retains passcode authentication. Also holds the advisor's limits and lockout, the validation of the model's reply, and the 400 / 404 / 504 answers of the API handlers, all with no network call. It also replays `vercel.json`'s header rules: only `/spectrum/…?embed=…` may be framed by another site. And it holds `counting.js`: nothing loads before consent, no query string is sent, and a withdrawal stops sending.
- **`node site/scripts/check-live.mjs`** — Not in CI: smoke-checks the deployed site daily and after each production deploy.

- **`npm run check:engine`** — Replays every simulated season: games in date order, no negative rest days, each stored streak equal to the team's earlier results, and a busted bankroll stops the run with drawdown at or under 100%. It also replays the largest run for the CSV download and asserts one row per wager, ending on the summary's bankroll. It also holds the Monte Carlo fan (seeded, percentiles in order, centred on the run's own result) and the walk-forward split (halves cover the run; one season has none).
- **`npm run check:bundle`** — After a build: no chunk over 500 kB, the home page's JS under 150 kB gzip, and the CSP in `vercel.json` still allows the inline theme script.
- **`npm run check:fork`** — After a build: the original keeps its canonical URL, sitemap and consent script, and the site built as a fork names the org domain in no output file (audit PROD-04).
- **`npm run check:market`** — Runs every naive wagering strategy across 26 simulated seasons, verifying that realized ROI falls strictly within the realistic bookmaker hold band (−7.0% to −2.5%).
- **`npm run check:spectrum`** — Evaluates the Spectrum visualizer's own math block and dataset directly out of `site/public/spectrum/index.html` and asserts its metric invariants: `returnOnCapital` never breaches its −100% floor, `expectedTurnoverCost` stays unfloored, the two agree on where ruin falls across every record × 7 horizons, and the `1du` horizon never labels a wager and a trading day identically.
- **`npm run gen:edges -- --check`** — Regenerates every downstream copy of the dataset from `site/src/data/edges.ts` and fails if any has drifted: the Spectrum page's inlined `RAW`, `site/public/spectrum/edges.json`, the published `edges.csv` and `datapackage.json`, and `data/edge_dataset.md`. Drop the `-- --check` to write them.
- **`npm run check:odds`** — Asserts the calculator math in `site/src/odds.ts`: conversion round-trips, only a plain number parses as a price (`0/5`, `0x64` and `1+1+0` do not), every de-vig method sums to one on a grid that includes two sides at 1.01, and treats a symmetric market as 50/50, the longshot-aware methods (power, Shin) take more margin from the dog than multiplicative, and parlay hold compounds with leg count and vanishes when the book quotes the fair price. It also holds `site/src/kelly.ts`: the full-Kelly fraction (0.10 at 55% on even money; nothing without an edge), growth peaking at full Kelly, Thorp's drawdown odds, and simultaneous Kelly agreeing with single Kelly on one bet.
- **`npm run check:edges`** — Asserts bounds, category counts, unique names, a `basis` on every record, a per-category citation ratchet, and the dataset freeze.
- **`npm run check:stats`** — Asserts the significance math in `site/src/stats.ts` against closed-form values (−110 breakeven = 52.38%, Wilson on 50/100, exact binomial tails, a 54%-over-300 hit rate at −110 staying non-significant), then runs four real backtests and fails if the panel's verdict disagrees with the money: win rate above breakeven exactly when ROI is positive, p < 0.5 exactly when ROI is positive, and the interval containing the point estimate.
- **`npm run check:calc-url`** — Asserts the calculators' pre-fill links (`/odds?odds=&legs=&method=`, `/parlay?n=&legs=&quoted=`) parse what they should, drop any price that does not parse under the chosen format, cap the leg count, and survive 5,000 fuzzed query strings without throwing.
- **`npm run check:strategy-url`** — Round-trips a fully-populated strategy through the `/backtester` share-link query string, asserts that mangled links (out-of-range seasons, a side that does not match the bet type, an inverted min/max pair, non-positive stakes) degrade field by field to defaults, asserts that the schema rejects a streak filter on a totals bet and that the form's `rangeIssues` matches the schema's min/max errors word for word, and fuzzes 5,000 random links to prove every one parses to a strategy the endpoint's Zod schema accepts.
- **`npm run check:live-grading`** — Table-tests the ESPN scoreboard panel's grading (`site/src/liveGrading.ts`): every selection against win, loss and push, the favourite read from the spread and not from team names, what is reported as not evaluated, and the day label under four time zones.
- **`npm run check:lines`** — Runs a recorded ESPN scoreboard through the real parser and the line collector, asserting every record field, the `open` / `midday` / `close` rule that a second run only appends, that a game keeps one opener across two day files and the digest follows it, and that a cut-off line, an undated game and a non-date day name are handled (Actions 5.1/5.2). It also grades a hand-built set of bets with `grade-lines.ts`: points and EV against the close, a game without a close capture never graded, and a malformed bets CSV rejected.
- **`npm run build:registry -- --check`** — Fails if the generated Cronsole catalog in `site/public/registry/` is stale, or if the README stops linking a template's gallery page. Drop `-- --check` to write it.
- **`npm run lint`** — TypeScript compilation check (`tsc --noEmit`).
- **`npm run build`** — Production bundle generation via Vite.
- **`npm run check:spectrum-browser`** — After a build, a Playwright smoke test of the built Spectrum page and the backtester form (`vite preview` on `dist/`, with `/api/backtest` answered by a real engine run): the inspector, the "Where do I sit?" form, accessibility states and the reader's row name. The first local run needs `npx playwright install chromium`.

---

<p align="right"><a href="#docs-top">back to top</a></p>

---

<p align="center">
  <a href="../README.md">← Repository Root</a> ·
  <a href="ROADMAP.md">Roadmap</a> ·
  <a href="methodology.md">Methodology</a> ·
  <a href="data-architecture.md">Data Architecture</a>
</p>
