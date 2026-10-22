<h1 align="center">🗄️ Data Architecture & Provenance</h1>

<p align="center">
  <em>Data schemas, canonical source-of-truth structures, automated CI validation, and forward collection pipelines.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/records-228_canonical-8B5CF6?style=for-the-badge" alt="Records: 228">
  <a href="README.md"><img src="https://img.shields.io/badge/↩-Docs_Home-6B7280?style=for-the-badge" alt="Docs Home"></a>
</p>

---

## 🏛️ 1. Canonical Dataset Architecture

**Shipped 2026-08-31** (roadmap Action 2.2). Every edge and return parameter derives from a single
typed TypeScript source; the three former hand-maintained copies are now generated artifacts:

```
site/src/data/edges.ts (Typed canonical dataset: 228 records)  ← edit only this
          │
          │  npm run gen:edges          (site/scripts/generate-edge-artifacts.ts)
          │
          ├──► site/public/spectrum/index.html  — the inlined `RAW` block the live page ships
          ├──► site/public/spectrum/edges.json  — machine-readable copy for the React port (4.6)
          └──► data/edge_dataset.md             — human-readable catalog of the inputs
```

`npm run gen:edges -- --check` regenerates all three in memory and exits non-zero if any has
drifted from the source. It runs in CI on every pull request, so an artifact edited by hand fails
the build instead of silently becoming a fourth version of the truth.

The Spectrum page keeps its data **inlined** rather than fetching `edges.json` — it is
self-contained by design (Plotly and fonts by CDN, no build step), and inlining is what lets
`npm run check:spectrum` lift the page's own `RAW` and math out of the HTML and test the file that
actually deploys. The generator owns that block; the page still ships it.

### TypeScript Schema (`EdgeRecord`)

Only fields that carry information are stored. The visualizer's `g`, `type`, `vol`, `wp` and `sk`
fields are pure functions of `cat` and `m`, so `toSpectrumRow()` re-expands them rather than the
dataset holding 228 copies of the string `"Varies"`. Addiction risk is likewise per-category
(`AR_DEFAULT`), not per-record.

```typescript
export type EdgeLayer = 'raw' | 'fee' | 'tax';   // gross · after fees · after tax
export type EdgeCategory = (typeof EDGE_CATEGORIES)[number];  // the 15 categories below

/** A held asset. Compounds; `a` is the annual return in percent. */
export type InvestmentEdge = {
  n: string; cat: EdgeCategory; m: 'i'; ly: EdgeLayer;
  a: number;              // Annual return, percent
};

/** A repeated wager. `e` is the edge per decision, in percent. */
export type GameEdge = {
  n: string; cat: EdgeCategory; m: 'g'; ly: EdgeLayer;
  e: number;              // Edge per decision, percent
  du: number;             // Decision Units per day (frequency)
  ced: number;            // Capital Exposure per Decision, percent of bankroll
};

export type EdgeRecord = InvestmentEdge | GameEdge;
export const EDGES: readonly EdgeRecord[];
```

### Planned: provenance fields (roadmap Action 2.3, not yet built)

No record currently carries a citation or an as-of date. Action 2.3 adds these optional fields and
the ratchet that stops citation coverage from regressing:

```typescript
export interface ProvenanceInfo {
  source?: string;       // e.g. "S&P Dow Jones Indices", "Wizard of Odds", "UNLV Center for Gaming Research"
  asOf?: string;         // ISO date or year, e.g. "2026-01"
  window?: string;       // e.g. "1926-2025 (100-year annualized)"
  confidence?: 'high' | 'medium' | 'estimated';
  methodologyUrl?: string;
}
```

---

## 📊 2. The 15 Asset & Wagering Categories

The canonical dataset spans 228 records across 15 categories. Category names below are the exact
`cat` values in `edges.ts`; counts are generated into [`data/edge_dataset.md`](../data/edge_dataset.md)
and asserted by `npm run check:edges` / `npm run check:spectrum`.

| Category | Model | Records | Representative Items |
| :--- | :--- | ---: | :--- |
| **📈 Stock Market** | `i` compound | 32 | NASDAQ 100 (QQQ), S&P 500 (SPY/VOO), Penny Stocks, and the fee/tax ladder on SPY |
| **💵 Cash & Savings** | `i` compound | 17 | Money Market Fund (SPAXX/VMFXX), High-Yield Savings, T-Bills, Checking |
| **🏛️ Bonds** | `i` compound | 17 | High-Yield Corporate (HYG/JNK), Private Credit / BDCs, Treasuries, Munis |
| **🏢 Real Estate** | `i` compound | 12 | Multi-Unit Apartments (5+), Industrial / Warehouse, Single Family Rental, Timeshares |
| **🪙 Cryptocurrency** | `i` compound | 13 | Bitcoin Spot and the IBIT fee layer, Staked Ethereum, Leveraged Perps, Meme Coins |
| **🎨 Collectibles** | `i` compound | 10 | Vintage Sports Cards (PSA 10), Blue-Chip Fine Art, Watches, NFTs |
| **🥇 Precious Metals** | `i` compound | 12 | Gold Bullion (GLD), Silver (SLV), Platinum (PPLT), Mining Equities (GDX/GDXJ) |
| **🛡️ Insurance & Annuities** | `i` compound | 11 | Variable Annuity, Indexed Universal Life, Whole Life Cash Value, MYGA |
| **📉 Trading & Derivatives** | mixed | 10 | Covered Call ETFs, Put Writing, Managed Futures, TQQQ / SQQQ held, Retail Day Trading, Forex / CFDs, 0DTE, Binary Options |
| **🏈 Sports Betting** | `g` linear | 22 | Spread (−110), Reduced Juice (−105), Betting Exchange, Sharp Bettor (+2% CLV), Micro-Bets, up to 10-Team Parlay |
| **🐎 Horse Racing & Pari-Mutuel** | `g` linear | 6 | Win/Place/Show, Exacta, Trifecta / Superfecta, Pick 4 / Pick 6, ADW Rebate, Greyhounds |
| **🎰 Casino Gambling** | `g` linear | 29 | Card Counting (+1%), Spanish 21, 9/6 Video Poker, Ultimate Texas Hold'em, Sic Bo, Casino War, Online Slots, Crypto Dice, Keno |
| **♠️ Poker & Skill-Based** | `g` linear | 9 | DFS Top 5%, Skilled Tournaments, Recreational Live, DFS Casual |
| **🔮 Prediction Markets** | `g` linear | 12 | Polymarket Elections, Kalshi Economic, Metaculus, PredictIt |
| **🎟️ Lottery** | `g` linear | 13 | Powerball / Mega Millions, EuroMillions, Scratch-Offs, Pull-Tabs, Bingo, 50/50 Raffle |

> **Trading & Derivatives** returned on 2026-10-12. V11 had cut **Options & Derivatives** and
> **Active Trading** as "outlier noise" because a −60%/yr row squashed the old single shared axis
> (see [`../data/edge_analysis12.md`](../data/edge_analysis12.md)). Return on capital has been floored
> at −100% since Action 2.1, so that reason no longer holds; the category is mixed-mode (held
> positions compound, binary options are a repeated wager).

---

## 🛡️ 3. Automated Validation & The Provenance Ratchet

**Live today.** Two guards run in CI on every pull request:

1. **`npm run gen:edges -- --check`** — regenerates all three artifacts from `edges.ts` and fails if
   any has drifted. This is what makes "single source of truth" enforceable rather than aspirational.
2. **`npm run check:spectrum`** — asserts the record count (228), that every row is well-formed for
   its model, and the mathematical invariants of the three measures over all 228 records × 7 horizons.

**Planned — roadmap Action 2.3, not yet built.** A dedicated `site/scripts/check-edges.ts`
(`npm run check:edges`) adding:

1. **Category Invariant:** every `cat` is one of the 15 declared categories, with per-category counts.
2. **Mathematical Bounds:** no investing annualized return exceeds realistic bounds, and every
   wagering record has a strictly negative expected value.
3. **The Provenance Ratchet:**
   - Provenance metadata (`source`, `asOf`) tracked against a committed baseline (`site/src/data/provenance-baseline.json`).
   - If a pull request adds or updates records, the total count of cited records cannot drop below the baseline.
   - Any PR adding citations increments the baseline count, preventing future regressions.

---

## 📡 4. Forward Data Ingestion Strategy

To transition from synthetic simulations to observed historical tracking, forward collection operates via scheduled lightweight ingestion:

### A. Append-Only Scoreboard Line Snapshots
- **Endpoint:** `/api/espn-scoreboard` (`site/src/server/espn.ts`)
- **Schedule:** Automated cron executing every 2–4 hours during active game days.
- **Payload Capture:**
  - `eventId`, `sport`, `eventDate`, `capturedAt`
  - `homeTeam`, `awayTeam`, `homeScore`, `awayScore`
  - `spread`, `spreadOdds`, `overUnder`, `moneyline`
  - `linePhase: 'open' | 'midday' | 'close'`
- **Application:** Builds a historical closing-line archive used to calculate user **Closing Line Value (CLV)** without recurring commercial data feed costs.

### B. Financial Instrument As-Of Updates
- Ingest trailing 10-year and 20-year CAGRs for core benchmark tickers (`SPY`, `QQQ`, `GLD`, `HYG`) from keyless market data APIs to maintain timestamped, verified return benchmarks.

---

<p align="center">
  <a href="README.md">← Documentation Home</a> ·
  <a href="ROADMAP.md">Roadmap</a> ·
  <a href="methodology.md">Methodology</a>
</p>
