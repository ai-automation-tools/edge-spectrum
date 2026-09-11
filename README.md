<a id="readme-top"></a>

# Edge Spectrum 🟢

<p align="center">
  <a href="https://edge-spectrum.ai-automation-tools.dev">
    <img src="Images/Betting-Spectrum-Images/logos/dark/landscape-01-edge-gradient.svg" alt="Edge Spectrum - Expected Returns & Backtesting" width="720">
  </a>
</p>

<p align="center">
  <em>A unified multi-tool hub for sports betting, investing, gambling, and odds analysis.<br>Compare expected returns across time horizons, backtest sports wagering strategies over 26 simulated seasons, and analyze mathematical edges.</em>
</p>

<p align="center">
  <a href="Docs/README.md"><strong>Explore the docs »</strong></a>
</p>

<p align="center">
  <a href="https://edge-spectrum.ai-automation-tools.dev">Try the Public Demo</a>
  ·
  <a href="https://github.com/ai-automation-tools/edge-spectrum/issues">Report Bug</a>
  ·
  <a href="https://github.com/ai-automation-tools/edge-spectrum/issues">Request Feature</a>
</p>

<p align="center">
  <a href="https://edge-spectrum.ai-automation-tools.dev"><img src="https://img.shields.io/badge/Live_Deployment-edge--spectrum.ai--automation--tools.dev-0284c7?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Deployment"></a>
  <img src="https://img.shields.io/badge/status-active-2ea44f?style=for-the-badge" alt="Status: Active">
  <a href="Docs/roadmap.md"><img src="https://img.shields.io/badge/plan-ROADMAP-8B5CF6?style=for-the-badge" alt="Roadmap"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0-61dafb?style=flat-square&logo=react&logoColor=black" alt="React 19">
  <img src="https://img.shields.io/badge/Vite-6.2-646cff?style=flat-square&logo=vite&logoColor=white" alt="Vite 6">
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4.0-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind v4">
  <img src="https://img.shields.io/badge/Gemini_AI-API_v2-f59e0b?style=flat-square&logo=google&logoColor=white" alt="Gemini AI">
</p>

---

## 🚀 Overview

**Edge Spectrum** is an interactive playground for exploring mathematical edges. It brings together four analytical applications:

1. **The Edge Spectrum Expected-Return Visualizer** (`/spectrum/`): Compares **187 financial, investing, trading, and gambling activities** over **7 time horizons** (Single Event to 10 Years), standardized using the **DU/CED framework**. Return on capital is the primary axis and is floored at −100%; the unbounded turnover cost gets its own axis so the two are never compared as if they were the same quantity.
2. **The Backtest Simulator** (`/backtester`): Backtests sports wagering strategies across **26 simulated seasons of MLB, NFL, NHL, and NBA games** (2000–2025), providing ROI diagnostics, equity curves, live ESPN scores, and an **AI Strategy Advisor** powered by Gemini.
3. **Odds Converter & No-Vig Calculator** (`/odds`): Converts American, decimal, fractional and implied odds, and strips bookmaker margin from any multi-way market via **multiplicative, power, or Shin** de-vigging.
4. **Parlay & SGP Hold Calculator** (`/parlay`): De-vigs each leg, multiplies out the true joint probability, and compares it with the book's parlay payout to expose how the margin compounds per leg.

---

## 🛠️ Applications & Features

### 1. The Edge Spectrum Expected-Return Visualizer
Served as a static page at `/spectrum/index.html` (internally routes to `public/spectrum/index.html`).

- **13 Asset/Bet Categories:** Stocks, Bonds, Real Estate, Crypto, Precious Metals, Collectibles, Insurance/Annuities, Sports Betting, Casino, Poker, Prediction Markets, and Lottery.
- **Universal DU/CED Framework:** Standardized expected returns via:
  $$\text{Expected Turnover Cost} = \text{Decision Units (DU)} \times \text{Capital Exposure per Decision (CED)} \times \text{Edge}$$
- **Three named measures, never mixed on one axis:**
  - **Return on Capital** *(primary)* — what happens to the one bankroll you brought. Held assets compound; wagering activities accrue their flat-stake loss and stop at **−100%**, because a bankroll cannot lose more than itself.
  - **Expected Turnover Cost** *(secondary axis, wagering activities only)* — the DU/CED product above: cumulative expected loss as a multiple of the starting bankroll, deliberately **unbounded**, because it assumes you keep reloading.
  - **Ruin Point** — decisions until the bankroll is expected to reach $0 (years to −90% for a losing held asset).
- **Interactive Controls:** Toggle any combination of categories, switch measure (On Capital / Turnover Cost), adjust time horizons (Single Event to 10 Years), switch overlays (Raw Returns, Fee-Adjusted, After-Tax).
- **Ruin Point Overlay** *(on by default)*: a dotted −100% floor line on the primary chart, an ✕ per activity whose bankroll is gone before the horizon ends, a **Ruined By Horizon** counter, and per-activity decisions-to-$0 and time-to-ruin in the tooltip.
- **Addiction Risk Scoring:** Color-coded border alerts based on feedback loops and documentation of problem behavior.
- **Dollar Cost Comparison** *(toggle present but non-functional — regressed in V19, see [change_log.md](Docs/change_log.md))*: intended to translate percentages into dollar outcomes at $100/week.

### 2. The Sports Wagering Backtester
Served inside the SPA React shell at `/backtester`.

- **26 Synthetic Seasons:** Calibrated power-rating simulation for MLB, NFL, NHL, and NBA (2000–2025) with empirical distribution-based market pricing.
- **Custom Strategy Builder:** Define wager filters based on home/away status, bookmaker odds (favorites/underdogs), and custom edge margins.
- **Position Sizing Models:** Standard flat betting vs. Kelly Criterion sizing (Full/Fractional).
- **Interactive Reports:** Analyze cumulative profit curves, win rates, ROI, Kelly diagnostics, and drawdowns.
- **Live Scoreboard integration:** Pulls real-time ESPN scoreboard updates.
- **Gemini AI Strategy Advisor (your full instance):** Iterates on backtest results to suggest portfolio optimizations, staking alterations, or parameter tuning.

---

## 🏗️ Repository Architecture

```
edge-spectrum/
├── site/                  # ← THE WEB APP (Vercel Root Directory = site)
│   ├── api/               # Vercel serverless functions (backtest, ESPN, Gemini advisor)
│   ├── public/
│   │   ├── favicon.svg    # The served app icon
│   │   └── spectrum/      # The Edge Spectrum static Plotly visualization page
│   ├── src/
│   │   ├── components/    # Backtester UI components (AiAdvisor, StrategyBuilder, ProfitChart, etc.)
│   │   ├── pages/
│   │   │   └── Home.tsx   # Landing page (dashboard tile grid mapping over tools.ts)
│   │   ├── server/        # Shared backend engines (backtest, ESPN score, Gemini prompt engines)
│   │   ├── data/edges.ts  # The Dataset — SINGLE SOURCE OF TRUTH for all 187 edge records
│   │   ├── App.tsx        # Main router shell & top-nav bar
│   │   ├── main.tsx       # React bootstrap
│   │   └── tools.ts       # The Registry — SINGLE SOURCE OF TRUTH for all tools
│   ├── scripts/           # Guards & generators (check:market, check:edges, check:spectrum, check:odds, gen:edges)
│   ├── server.ts          # Express local dev server (proxies/runs Vite + serverless local engines)
│   ├── package.json       # Scripts & node dependencies
│   └── vercel.json        # Vercel configuration (SPA routing overrides & API serverless mappings)
├── Docs/                  # In-depth logs, standardized analysis, and future ideas
├── Data/                  # edge_dataset.md (generated from edges.ts) + frozen legacy catalogs
├── Images/                # Logos, icons, screenshots, and favicon.svg (archived copy of the app icon)
└── Versions/              # Legacy and alternate versions (Streamlit port, original themes)
```

> **Note:** everything the site needs lives under `site/`; the repo root holds only docs and archives.
> Run all app commands (`npm …`, `vercel …`) from inside `site/`.

---

## 🚀 Try the demo or create your own site

The [public demo](https://edge-spectrum.ai-automation-tools.dev) includes the interactive Spectrum,
odds and parlay calculators, synthetic backtester, and live scoreboard. Its AI advisor
shows **clearly labeled sample responses**, with no Gemini calls and no visitor API keys.

The full application is included in this repository under [Apache-2.0](LICENSE).
[Create your own site](https://edge-spectrum.ai-automation-tools.dev/setup) to deploy a copy to
Vercel with your own Gemini key, private advisor passcode, and live AI responses.
Use **Use this template** on GitHub to create a complete copy you can customize.

| Capability | Public demo | Your full instance |
| --- | --- | --- |
| Spectrum, odds & parlay tools | Interactive | Full access |
| 26-season synthetic backtester | Interactive | Full access |
| ESPN scoreboard | Live feed | Live feed |
| Gemini advisor | Written samples | Live, passcode protected |
| Source and branding | Browse | Customize |

See the [self-hosting guide](Docs/self-hosting.md) for deployment steps and environment settings.
The server defaults to demo mode; only `EDGE_SPECTRUM_MODE=full` enables live AI.

### Local development

Use Node.js 22 or 24:

```sh
git clone https://github.com/ai-automation-tools/edge-spectrum.git
cd edge-spectrum/site
npm ci
```

Copy `.env.example` to `.env`, then run `npm run dev` and open `http://localhost:3001`.
The default demo needs no API key. For full mode, fill in the four variables documented
in the [setup guide](Docs/self-hosting.md). Never commit your `.env` file.

```sh
npm run lint
npm run check:deployment
npm run build
```

---

## 🔌 Adding a New Tool

To add a new tool to the Edge Spectrum hub, follow the **three-step recipe**:

1. **Register the Tool:** Add an entry to the `TOOLS` array in [tools.ts](site/src/tools.ts):
   ```typescript
   {
     slug: 'my-new-tool',
     title: 'My Custom Tool',
     blurb: 'Brief description of the tool...',
     icon: MyIconName,
     href: '/my-new-tool', // or direct static path
     kind: 'route',        // 'route' | 'static' | 'external'
     status: 'live',       // 'live' | 'wip' | 'soon'
     accent: 'violet',     // Color scheme name
     tag: 'Utility'
   }
   ```
2. **Mount the Code:**
   - **`route` kind:** Build the page component under `site/src/pages/MyNewTool.tsx` and add its `<Route>` path inside [App.tsx](site/src/App.tsx).
   - **`static` kind:** Put your HTML/CSS/JS folder inside `site/public/my-new-tool/` and link its `href` to `/my-new-tool/index.html`.
   - **`external` kind:** Set `href` to the external destination URL (it will open in a new tab).
3. **Accent Setup:** Ensure the selected `accent` name exists inside the Tailwind literal mapping inside [Home.tsx](site/src/pages/Home.tsx) so the JIT compiler generates the appropriate borders and glows.

---

## 🚀 Deployment

The public demo is hosted on **Vercel** (`edge-spectrum.ai-automation-tools.dev`). The Vercel project's **Root Directory is set to `site`**, so it builds from the app subdirectory.

- **Demo mode:** `EDGE_SPECTRUM_MODE=demo`; no Gemini credentials are needed.
- **Production branch:** `main` (automatically deployed on push/merge).
- **Local deployment check:** You can use the Vercel CLI (run from `site/`) to verify preview environments before merging:
  ```bash
  cd site
  vercel deploy
  ```

---

## ⚠️ Disclaimer

Expected returns are modeled averages derived from historical market data, bookmaker averages, and retail-trader statistics. Individual results vary drastically due to short-term variance.

> [!CAUTION]
> **For educational purposes only.** This tool does not constitute investment or gambling advice.

---

<p align="center">
  <sub>Managed by ai-automation-tools · Standalone HTML/CSS/Plotly viz and React/Vite dashboard</sub><br>
  <sub><b>GAMBLING: LINEAR DECAY · INVESTING: COMPOUND APPRECIATION</b></sub>
</p>
