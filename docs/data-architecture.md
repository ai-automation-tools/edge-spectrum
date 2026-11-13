<h1 align="center">🗄️ Data Architecture & Provenance</h1>

<p align="center">
  <em>Data schemas, canonical source-of-truth structures, automated CI validation, and forward collection pipelines.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/dataset-one_canonical_source-8B5CF6?style=for-the-badge" alt="Dataset: one canonical source">
  <a href="README.md"><img src="https://img.shields.io/badge/↩-Docs_Home-6B7280?style=for-the-badge" alt="Docs Home"></a>
</p>

---

## 🏛️ 1. Canonical Dataset Architecture

**Shipped 2026-08-31** (roadmap Action 2.2). Every edge and return parameter derives from a single
typed TypeScript source; the three former hand-maintained copies are now generated artifacts:

```
site/src/data/edges.ts (Typed canonical dataset)  ← edit only this
          │
          │  npm run gen:edges          (site/scripts/generate-edge-artifacts.ts)
          │
          ├──► site/public/spectrum/index.html  — the inlined `RAW` block the live page ships
          ├──► site/public/spectrum/edges.json  — the page's short-key rows
          ├──► site/public/spectrum/edges.csv   — the published dataset
          ├──► site/public/spectrum/datapackage.json — its schema, version and licence
          └──► data/edge_dataset.md             — human-readable catalog of the inputs
```

`npm run gen:edges -- --check` regenerates all five in memory and exits non-zero if any has
drifted from the source. It runs in CI on every pull request, so an artifact edited by hand fails
the build instead of silently becoming a fourth version of the truth.

The Spectrum page keeps its data **inlined** rather than fetching `edges.json` — it is
self-contained by design (Plotly self-hosted beside it, fonts by CDN, no build step), and inlining is what lets
`npm run check:spectrum` lift the page's own `RAW` and math out of the HTML and test the file that
actually deploys. The generator owns that block; the page still ships it.

### The published dataset (audit INT-07, GOV-03; 2026-11-12)

`edges.csv` and `datapackage.json` are served beside the Spectrum page, at
`/spectrum/edges.csv` and `/spectrum/datapackage.json`, with `Access-Control-Allow-Origin: *`, and
the page's footer links them. `datapackage.json` is a [Frictionless Data Package](https://datapackage.org/):

- **Schema:** one field per CSV column, with its type, description and allowed values. The columns
  are `EdgeRecord` with readable names (`annual_return_pct`, `edge_pct`, `decisions_per_day`, ...).
  `edges.json` keeps the page's short keys and may change with the page; `edges.csv` is the stable
  shape.
- **Version:** the newest `asOf` in the data plus the first 8 characters of the CSV's sha256 (`2026-11-12+1a2b3c4d`), so two changes on one day are two versions.
  Each resource carries a `sha256` hash.
- **Licence:** CC BY 4.0 for the compilation. Every figure is a fact credited to the publisher in
  its `source`; no publisher's table is reproduced. The code stays Apache-2.0.

Each `dataset-<version>` release on GitHub attaches the three files (audit PROD-16). There is no
`/api/edges`: the static files cover it (audit INT-07).

### TypeScript Schema (`EdgeRecord`)

Only fields that carry information are stored. The visualizer's `g`, `type`, `vol`, `wp` and `sk`
fields are pure functions of `cat` and `m`, so `toSpectrumRow()` re-expands them rather than the
dataset holding one copy per record of the string `"Varies"`. Addiction risk is likewise per-category
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
  payout?: number;        // Average net win per unit staked on a win; absent = even money.
                          // Feeds only the positive-edge ruin risk and Kelly (Action 2.13)
};

export type EdgeRecord = InvestmentEdge | GameEdge;
export const EDGES: readonly EdgeRecord[];
```

### Provenance fields (Action 2.3, built 2026-09-07; headline rows cited 2026-10-19)

Every record declares its `basis` and may carry a citation. The coverage table in
[`data/edge_dataset.md`](../data/edge_dataset.md) has the counts. Every `math` and `published` row
cites a source (November 2026); the uncited rows are `estimate` rows, and every category cites at
least half its rows, so the dataset is not frozen. The Spectrum inspector shows the citation under **Provenance** and puts a **verify** badge on any
row whose `asOf` is missing or more than a year old, except a `math` row with a methodology: a
figure that follows from the rules does not age. Every `math` row is cited (2026-11-12).

```typescript
export type Provenance = {
  basis: 'math' | 'published' | 'estimate'; // what evidence the figure needs (2026-11-12)
  source?: string;       // where the figure comes from, e.g. "FDIC National Rates and Rate Caps"
  asOf?: string;         // ISO date the figure was last checked against that source
  window?: string;       // the period it was computed over, e.g. "1928-2025"
  methodology?: string;  // how it was derived, in a sentence
};
```

---

## 📊 2. The 15 Asset & Wagering Categories

The canonical dataset spans 15 categories. Category names below are the exact
`cat` values in `edges.ts`; record counts are not repeated here, they are generated into [`data/edge_dataset.md`](../data/edge_dataset.md)
and asserted by `npm run check:edges` / `npm run check:spectrum`.

| Category | Model | Representative Items |
| :--- | :--- | :--- |
| **📈 Stock Market** | `i` compound | NASDAQ 100 (QQQ), S&P 500 (SPY/VOO), Penny Stocks, and the fee/tax ladder on SPY |
| **💵 Cash & Savings** | `i` compound | Money Market Fund (SPAXX/VMFXX), High-Yield Savings, T-Bills, Checking |
| **🏛️ Bonds** | `i` compound | High-Yield Corporate (HYG/JNK), Private Credit / BDCs, Treasuries, Munis |
| **🏢 Real Estate** | `i` compound | Multi-Unit Apartments (5+), Industrial / Warehouse, Single Family Rental, Timeshares |
| **🪙 Cryptocurrency** | `i` compound | Bitcoin Spot and the IBIT fee layer, Staked Ethereum, Leveraged Perps, Meme Coins |
| **🎨 Collectibles** | `i` compound | Vintage Sports Cards (PSA 10), Blue-Chip Fine Art, Watches, NFTs |
| **🥇 Precious Metals** | `i` compound | Gold Bullion (GLD), Silver (SLV), Platinum (PPLT), Mining Equities (GDX/GDXJ) |
| **🛡️ Insurance & Annuities** | `i` compound | Variable Annuity, Indexed Universal Life, Whole Life Cash Value, MYGA |
| **📉 Trading & Derivatives** | mixed | Covered Call ETFs, Put Writing, Managed Futures, TQQQ / SQQQ held, Retail Day Trading, Forex / CFDs, 0DTE, Binary Options |
| **🏈 Sports Betting** | `g` linear | Spread (−110), Reduced Juice (−105), Betting Exchange, Sharp Bettor (+2% CLV), Micro-Bets, up to 10-Team Parlay |
| **🐎 Horse Racing & Pari-Mutuel** | `g` linear | Win/Place/Show, Exacta, Trifecta / Superfecta, Pick 4 / Pick 6, ADW Rebate, Greyhounds |
| **🎰 Casino Gambling** | `g` linear | Card Counting (+1%), Spanish 21, 9/6 Video Poker, Ultimate Texas Hold'em, Sic Bo, Casino War, Online Slots, Crypto Dice, Keno |
| **♠️ Poker & Skill-Based** | `g` linear | DFS Top 5%, Skilled Tournaments, Recreational Live, DFS Casual |
| **🔮 Prediction Markets** | `g` linear | Polymarket Elections, Kalshi Economic, Kalshi Weather, PredictIt |
| **🎟️ Lottery** | `g` linear | Powerball / Mega Millions, EuroMillions, Scratch-Offs, Pull-Tabs, Bingo, 50/50 Raffle |

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
2. **`npm run check:spectrum`** — asserts the record count, that every row is well-formed for
   its model, and the mathematical invariants of the three measures over every record × 7 horizons.

**Built — roadmap Action 2.3, 2026-09-07.** `site/scripts/check-edges.ts` (`npm run check:edges`, in CI)
asserts:

1. **Count, categories and names:** the record count equals the committed baseline, every declared
   category has at least one record, no record carries an undeclared category, and names are unique.
2. **Numeric sanity:** an investing row's annual return is finite and above −100%/yr. A wagering row
   has a finite edge, positive decisions per day, capital exposure in (0, 100], and, where a payout
   is given, a positive payout above the edge. The sign of the edge is not asserted: a few
   skilled-play rows (card counting, a sharp bettor) are positive on purpose.
3. **The Provenance Ratchet (per category since 2026-11-12):**
   - Every record declares a `basis`: `math`, `published` or `estimate`.
   - `site/src/data/provenance-baseline.json` holds each category's record count and how many of them cite a `source`.
     A category's cited count can never fall below it.
   - `--write-baseline` records new counts, and refuses a new record anywhere while any category cites under
     `MIN_CITED_SHARE` (50%) of its rows: the dataset freeze. Cite existing rows instead.

---

## 📡 4. Forward Data Ingestion Strategy

To transition from synthetic simulations to observed historical tracking, forward collection operates via scheduled lightweight ingestion:

### A. Append-Only Scoreboard Line Snapshots

**Built — roadmap Actions 5.1 and 5.2, 2026-11-10.**

- **Store (5.1):** local append-only JSONL files, one per sport per scoreboard day:
  `<out>/<SPORT>/<YYYY-MM-DD>.jsonl`. Chosen over a hosted database because it needs no account,
  no cost and no secrets, and the collector runs on the reader's own machine. A hosted store can
  ingest these files later, when the site itself needs the lines (Action 5.4, CLV grading).
- **Collector (5.2):** `site/scripts/capture-lines.ts` (`npm run capture:lines -- --out <folder>`),
  reading ESPN through the same `parseEspnScoreboard` (`site/src/server/espn.ts`) the live feed
  uses, for NFL, NBA, MLB and NHL. A run never rewrites a line; a sport whose fetch fails is named
  and the run exits 1; a sport with no games is a success. A line that does not parse (a run killed
  mid-write) and a game with no usable start time are skipped with a warning and a count. The day in
  the file name is ESPN's only when it is a date; otherwise the capture date is used.
- **Schedule:** every 3 hours, as the Cronsole template
  [`edge-spectrum-line-capture`](https://cronsole.ai-automation-tools.dev/#/t/edge-spectrum-line-capture)
  (or any scheduler running the same command).
- **Record:** `eventId`, `sport`, `eventDate`, `capturedAt`, `state` (`pre` / `in` / `post`),
  `linePhase`, `minutesToStart`, `homeTeam`, `awayTeam`, `homeScore`, `awayScore`, `provider`,
  `spread` (home), `spreadOdds` `{home, away}`, `overUnder`, `moneyline` `{home, away}`. A number
  ESPN does not publish is `null`, never `0`; a pick'em spread is `0`.
- **`linePhase`, decided at capture and never revised:** `open` is the first capture of a
  not-yet-started game across the sport's last 8 day files (ESPN lists an NFL week under a new
  date each day, so one game appears in several files); `close` is a later capture within one collection interval
  (`--interval-hours`, default 3) of the start, which on that schedule is the last look before the
  game; `midday` is any other pre-game capture; `null` means the game has started, so the line is
  no longer pre-game, though the score is kept for grading. If the job runs more often than the
  interval says, two captures can both read `close`: take the one with the smallest
  `minutesToStart`. A final game is logged once, in the file of the day it was first seen final.
- **Held by:** `npm run check:lines` (in CI), which runs a recorded ESPN response through the real
  parser and asserts the fields, the phase rule, that a second run only appends, that a game has one opener
  across two day files, and that a broken line, an undated game and a non-date day are handled.
- **Closing-line grading:** `site/scripts/grade-lines.ts` (`npm run grade:lines -- --archive <folder> --bets <csv>`,
  audit PROD-10) grades a CSV of the user's bets against the same `close` capture the digest uses:
  EV at the de-vigged closing price for a moneyline (and for a spread taken at the closing number),
  points gained for spreads and totals, and the result from the final. A game with no `close` capture
  is listed and not graded. Local only: it reads the user's archive and writes a markdown report next
  to the CSV. Held by `npm run check:lines`.
- **Daily digest:** `site/scripts/digest-lines.ts` (`npm run digest:lines -- --archive <folder>`),
  scheduled daily at 12:30 UTC as the Cronsole template
  [`edge-spectrum-line-digest`](https://cronsole.ai-automation-tools.dev/#/t/edge-spectrum-line-digest).
  Read-only over the archive; writes `<archive>/digests/<day>.md`. It lists the games in the day's
  file and follows each into the earlier files and the next one, where its opener or final may sit.
  Opening is a game's `open`
  capture, closing its `close` capture with the smallest `minutesToStart`; a game with no `close`
  shows its last pre-game line marked `*` and is listed as a gap, never reported as a move. A day
  with no capture file for any sport exits 1 (`LINE_DIGEST_EMPTY`). Held by `npm run check:lines`.
- **Application:** Builds a historical closing-line archive used to calculate user **Closing Line Value (CLV)** without recurring commercial data feed costs.

### B. Financial Instrument As-Of Updates
- Ingest trailing 10-year and 20-year CAGRs for core benchmark tickers (`SPY`, `QQQ`, `GLD`, `HYG`) from keyless market data APIs to maintain timestamped, verified return benchmarks.

---

<p align="center">
  <a href="README.md">← Documentation Home</a> ·
  <a href="ROADMAP.md">Roadmap</a> ·
  <a href="methodology.md">Methodology</a>
</p>
