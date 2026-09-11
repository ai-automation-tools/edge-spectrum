<a id="docs-top"></a>

<h1 align="center">📚 Edge Spectrum Documentation</h1>

<p align="center">
  <em>System architecture, mathematical models, data schemas, and development roadmaps for Edge Spectrum.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-active-2ea44f?style=for-the-badge" alt="Status: Active">
  <a href="roadmap.md"><img src="https://img.shields.io/badge/plan-ROADMAP-8B5CF6?style=for-the-badge" alt="Roadmap"></a>
  <a href="../README.md"><img src="https://img.shields.io/badge/↩-repository_root-6B7280?style=for-the-badge" alt="Repo Root"></a>
</p>

---

## 🗺️ Documentation Directory

| Section / Document | Purpose | Scope |
| :--- | :--- | :--- |
| [**Run your own site**](self-hosting.md) | Demo versus full mode, Vercel deployment, environment variables, and local setup. | Getting Started |
| [**🗺️ Product Roadmap**](roadmap.md) | Sequenced action items, milestone tracking, release gates, and feature pipelines. | All Hub Tools |
| [**📐 Mathematical Methodology**](methodology.md) | The DU/CED framework, metric semantics (return on capital vs. turnover cost vs. ruin), and Kelly sizing. | Core Analysis |
| [**🗄️ Data Architecture**](data-architecture.md) | Canonical dataset schema (`EdgeRecord`), 13 asset/wagering categories, CI provenance ratchet, and collection pipelines. | Data Layer |
| [**💡 Planning & Ideas**](Ideas/README.md) | Over-engineering audits, hub improvement records, and visualizer feature backlogs. | Research & Audits |
| [**📋 Change Log**](change_log.md) | Historical version notes and feature evolution from standalone Plotly versions to the Vite hub. | Project History |

---

## 🏗️ Core Architecture Overview

Edge Spectrum operates as a multi-tool web application hosted on **Vercel** with the root directory set to `site/`:

1. **The Registry (`site/src/tools.ts`)** — Single source of truth for tool metadata, icons, routing targets, status flags, and accent styles.
2. **The Dataset (`site/src/data/edges.ts`)** — Single source of truth for the 187 edge records. The Spectrum page's inlined `RAW`, `edges.json`, the Streamlit port and `Data/edge_dataset.md` are all generated from it by `npm run gen:edges`.
3. **Backtest Simulation Engine (`site/src/dataGenerator.ts` & `site/src/server/backtest.ts`)** — Simulates 26 seasons of MLB, NFL, NHL, and NBA games based on power ratings with unbiased market pricing derived from empirical score distributions.
4. **Edge Spectrum Visualizer (`site/public/spectrum/index.html`)** — Interactive multi-horizon comparison across 187 financial, investing, trading, and wagering activities.
5. **AI Strategy Advisor (`site/src/server/advisor.ts`)** — Server-side Gemini integration providing strategy feedback behind HMAC-signed session gates.
6. **Odds & Market Math (`site/src/odds.ts`)** — Pure, import-free module behind the standalone calculators (`/odds`, `/parlay`): odds-format conversion, multiplicative / power / Shin de-vigging, and parlay true-odds vs. book payout. Later phases reuse it rather than re-deriving conversions.

---

## 🧪 Testing & Validation Invariants

- **`npm run check:deployment`** — Verifies demo mode rejects live AI and full-mode sessions, while full mode retains passcode authentication.

- **`npm run check:market`** — Runs all 40 naive wagering strategies across 26 simulated seasons, verifying that realized ROI falls strictly within the realistic bookmaker hold band (−7.0% to −2.5%).
- **`npm run check:spectrum`** — Evaluates the Spectrum visualizer's own math block and dataset directly out of `site/public/spectrum/index.html` and asserts its metric invariants: `returnOnCapital` never breaches its −100% floor, `expectedTurnoverCost` stays unfloored, the two agree on where ruin falls across all 187 records × 7 horizons, and the `1du` horizon never labels a wager and a trading day identically.
- **`npm run gen:edges -- --check`** — Regenerates every downstream copy of the dataset from `site/src/data/edges.ts` and fails if any has drifted: the Spectrum page's inlined `RAW`, `site/public/spectrum/edges.json`, `Versions/Streamlit/data.py`, and `Data/edge_dataset.md`. Drop the `-- --check` to write them.
- **`npm run check:odds`** — Asserts the calculator math in `site/src/odds.ts`: conversion round-trips, every de-vig method sums to one and treats a symmetric market as 50/50, the longshot-aware methods (power, Shin) take more margin from the dog than multiplicative, and parlay hold compounds with leg count and vanishes when the book quotes the fair price.
- **`npm run check:edges`** *(Phase 2, Action 2.3 — not built yet)* — Will assert bounds, category counts, and non-regressing provenance citations across all 187 canonical edge records.
- **`npm run lint`** — TypeScript compilation check (`tsc --noEmit`).
- **`npm run build`** — Production bundle generation via Vite.

---

<p align="right"><a href="#docs-top">back to top</a></p>

---

<p align="center">
  <a href="../README.md">← Repository Root</a> ·
  <a href="roadmap.md">Roadmap</a> ·
  <a href="methodology.md">Methodology</a> ·
  <a href="data-architecture.md">Data Architecture</a>
</p>
