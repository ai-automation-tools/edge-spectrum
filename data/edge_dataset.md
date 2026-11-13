# Edge Spectrum — Canonical Dataset 📊

> [!NOTE]
> **Generated file — do not edit.** Produced by `npm run gen:edges` (from `site/`) out of
> `site/src/data/edges.ts`, the single source of truth for this dataset. Edit that file and regenerate;
> CI runs `npm run gen:edges -- --check` and fails the build on drift.

**Records:** 240 · **Categories:** 15 · **Layers:** 212 raw · 9 fee · 19 tax

## What is here, and what is deliberately not

These tables list the dataset **inputs** — the annual return of a held asset, or the edge,
decisions per day and capital exposed per decision of a game. They do not list projected
returns at each horizon. The earlier hand-maintained versions did, and those columns went
stale the moment the projection math changed: the horizon numbers in
[`edge_analysis12.md`](edge_analysis12.md) were computed under the single-axis model that
roadmap Action 2.1 replaced on 2026-08-31, and nothing recomputed them.

Projections belong to the code that draws them — `site/public/spectrum/index.html` — and are
held there by `npm run check:spectrum`, which runs the page’s own functions over this same
data. One place computes them, one guard checks them.

## Provenance coverage

`basis` says what kind of evidence a figure needs: `math` follows from the rules and payouts,
`published` is a rate, price, index or takeout someone publishes, `estimate` is a typical
outcome no one publishes as one figure. **Cited** means the record names a `source`.
`npm run check:edges` holds each category's cited count, and no record may be added while a
category cites under 50% of its rows (bold below). **The dataset is frozen:** 8 of 15 categories are under it.

| Category | Records | Cited | Share | math | published | estimate |
|----------|--------:|------:|------:|-----:|----------:|---------:|
| Stock Market | 32 | 29 | 91% | 0 | 29 | 3 |
| Cash & Savings | 17 | 15 | 88% | 0 | 17 | 0 |
| Bonds | 17 | 17 | 100% | 0 | 17 | 0 |
| Real Estate | 12 | 0 | **0%** | 0 | 6 | 6 |
| Cryptocurrency | 13 | 0 | **0%** | 0 | 7 | 6 |
| Collectibles | 10 | 0 | **0%** | 0 | 0 | 10 |
| Precious Metals | 12 | 11 | 92% | 0 | 11 | 1 |
| Insurance & Annuities | 11 | 0 | **0%** | 0 | 2 | 9 |
| Trading & Derivatives | 10 | 2 | **20%** | 0 | 5 | 5 |
| Sports Betting | 22 | 12 | 55% | 12 | 0 | 10 |
| Horse Racing & Pari-Mutuel | 6 | 3 | 50% | 0 | 6 | 0 |
| Casino Gambling | 44 | 43 | 98% | 42 | 1 | 1 |
| Poker & Skill-Based | 9 | 0 | **0%** | 0 | 0 | 9 |
| Prediction Markets | 12 | 0 | **0%** | 0 | 0 | 12 |
| Lottery | 13 | 5 | **38%** | 5 | 7 | 1 |

## Model reference

| Mode | Applies to | Measure |
|------|------------|---------|
| `i` — compound | Held assets | `returnOnCapital` compounds the annual return over the horizon. |
| `g` — linear | Games | `returnOnCapital` accrues the flat-stake loss and **stops at −100%**; `expectedTurnoverCost` is the same loss left unbounded. |

See [`../docs/methodology.md`](../docs/methodology.md) for the DU/CED framework and the ruin
formulas, and [`../docs/ideas/hub_improvement_plan.md`](../docs/ideas/hub_improvement_plan.md)
section 8 for why the two measures are no longer plotted on one axis.

---

## 1. Stock Market

**Records:** 32

### Held assets — compound model

| # | Name | Annual return | Layer | Basis | Cited |
|---|------|--------------:|-------|-------|:-----:|
| 1 | NASDAQ 100 (QQQ) | 10.57% | raw | published | ✓ |
| 2 | S&P 500 Growth (IVW) | 8.92% | raw | published | ✓ |
| 3 | Small-Cap Value (VBR) | 9.18% | raw | published | ✓ |
| 4 | S&P MidCap 400 (MDY) | 11.11% | raw | published | ✓ |
| 5 | Dividend Aristocrats (NOBL) | 10.22% | raw | published | ✓ |
| 6 | Total US Stock Market (VTI) | 9.44% | raw | published | ✓ |
| 7 | S&P 500 Index (SPY/VOO) | 10.0% | raw | published | ✓ |
| 8 | S&P 500 Equal Weight (RSP) | 11.3% | raw | published | ✓ |
| 9 | Dow Jones Industrial (DIA) | 9.02% | raw | published | ✓ |
| 10 | S&P 500 Value (IVE) | 7.49% | raw | published | ✓ |
| 11 | Russell 2000 Small Cap (IWM) | 8.35% | raw | published | ✓ |
| 12 | REIT Index ETF (VNQ) | 7.25% | raw | published | ✓ |
| 13 | S&P 500 High Dividend (SPYD) | 8.81% | raw | published | ✓ |
| 14 | DAX Germany Index | 5.28% | raw | published | ✓ |
| 15 | Nikkei 225 Japan Index | 8.34% | raw | published | ✓ |
| 16 | MSCI EAFE Intl Developed (EFA) | 6.41% | raw | published | ✓ |
| 17 | FTSE 100 UK Index | 5.53% | raw | published | ✓ |
| 18 | MSCI Emerging Markets (EEM) | 9.94% | raw | published | ✓ |
| 19 | Commodity Index (DJP) | -0.18% | raw | published | ✓ |
| 20 | Individual Stock Picking (Retail) | -2.0% | raw | estimate |  |
| 21 | Penny Stocks (Retail Avg) | -30.0% | raw | estimate |  |
| 22 | S&P 500 After 0.03% Index Fee | 9.97% | fee | published | ✓ |
| 23 | S&P 500 After 0.35% Robo-Advisor | 9.65% | fee | published | ✓ |
| 24 | S&P 500 After 0.60% Target-Date Fund | 9.4% | fee | published | ✓ |
| 25 | S&P 500 After 1% Advisory Fee | 9.0% | fee | published | ✓ |
| 26 | S&P 500 After 1.5% Active Mutual Fund | 8.5% | fee | published | ✓ |
| 27 | S&P 500 After 2-and-20 Hedge Fund | 6.4% | fee | published | ✓ |
| 28 | S&P 500 After 2-and-20 (Underperforming) | 4.0% | fee | estimate |  |
| 29 | S&P 500 After LTCG Tax (20%) | 8.0% | tax | published | ✓ |
| 30 | S&P 500 After STCG Tax (37%) | 6.3% | tax | published | ✓ |
| 31 | S&P 500 After 1% Fee + LTCG Tax | 7.2% | tax | published | ✓ |
| 32 | Qualified Dividends (SPYD) After 15% Tax | 8.19% | tax | published | ✓ |

## 2. Cash & Savings

**Records:** 17

### Held assets — compound model

| # | Name | Annual return | Layer | Basis | Cited |
|---|------|--------------:|-------|-------|:-----:|
| 1 | Money Market Fund (SPAXX/VMFXX) | 3.7% | raw | published | ✓ |
| 2 | High-Yield Savings Account (Online) | 4.2% | raw | published | ✓ |
| 3 | 1-Year CD (Top Rate) | 4.65% | raw | published | ✓ |
| 4 | 6-Month CD | 4.4% | raw | published | ✓ |
| 5 | High-Yield Money Market Account | 4.05% | raw | published | ✓ |
| 6 | Cash Management Account (SoFi/Wealthfront) | 3.55% | raw | published | ✓ |
| 7 | No-Penalty CD | 4.0% | raw | published |  |
| 8 | 3-Month CD | 4.0% | raw | published |  |
| 9 | 2-Year CD | 4.8% | raw | published | ✓ |
| 10 | 5-Year CD | 5.0% | raw | published | ✓ |
| 11 | Bank Money Market (Traditional) | 0.63% | raw | published | ✓ |
| 12 | Credit Union Savings | 0.19% | raw | published | ✓ |
| 13 | National Average Savings Rate | 0.38% | raw | published | ✓ |
| 14 | Big Bank Savings (Chase/BofA) | 0.01% | raw | published | ✓ |
| 15 | Regular Checking Account | 0.07% | raw | published | ✓ |
| 16 | HYSA After Income Tax (24%) | 3.19% | tax | published | ✓ |
| 17 | HYSA After Income Tax (37%) | 2.65% | tax | published | ✓ |

## 3. Bonds

**Records:** 17

### Held assets — compound model

| # | Name | Annual return | Layer | Basis | Cited |
|---|------|--------------:|-------|-------|:-----:|
| 1 | High-Yield Corporate (HYG/JNK) | 4.89% | raw | published | ✓ |
| 2 | Convertible Bond ETF (CWB) | 11.44% | raw | published | ✓ |
| 3 | Investment Grade Corporate (LQD) | 4.47% | raw | published | ✓ |
| 4 | US Treasury Bills (BIL) | 1.4% | raw | published | ✓ |
| 5 | Long-Term Treasury 20+ Yr (TLT) | 3.24% | raw | published | ✓ |
| 6 | US Treasury 10-Year | 4.54% | raw | published | ✓ |
| 7 | Total US Bond Market (BND/AGG) | 2.86% | raw | published | ✓ |
| 8 | Municipal Bond Index (MUB) | 2.84% | raw | published | ✓ |
| 9 | Aggregate Bond ETF (AGG) | 2.95% | raw | published | ✓ |
| 10 | International Bond (BNDX) | 2.2% | raw | published | ✓ |
| 11 | Short-Term Treasury (SHY) | 1.94% | raw | published | ✓ |
| 12 | TIPS Inflation-Protected (TIP) | 3.34% | raw | published | ✓ |
| 13 | Private Credit / BDC Index (BIZD) | 6.38% | raw | published | ✓ |
| 14 | Bond Fund After 1% Advisory Fee | 1.86% | fee | published | ✓ |
| 15 | Bond Interest After Income Tax (37%) | 1.8% | tax | published | ✓ |
| 16 | Muni Bonds Tax-Exempt (Effective) | 2.84% | tax | published | ✓ |
| 17 | Treasury Interest After Federal Tax (24%) | 3.45% | tax | published | ✓ |

## 4. Real Estate

**Records:** 12

### Held assets — compound model

| # | Name | Annual return | Layer | Basis | Cited |
|---|------|--------------:|-------|-------|:-----:|
| 1 | Multi-Unit Apartments (5+ Units) | 10.0% | raw | published |  |
| 2 | Industrial / Warehouse | 9.0% | raw | published |  |
| 3 | Multi Single Family Portfolio | 8.5% | raw | estimate |  |
| 4 | Single Family Home (Buy & Hold) | 7.5% | raw | published |  |
| 5 | Commercial Office Space | 6.5% | raw | published |  |
| 6 | Retail / Strip Mall | 5.5% | raw | published |  |
| 7 | Vacation / Short-Term Rental | 4.0% | raw | estimate |  |
| 8 | Raw Land (Speculative) | 2.0% | raw | estimate |  |
| 9 | House Flipping (Retail Avg) | -5.0% | raw | estimate |  |
| 10 | Timeshare | -12.0% | raw | estimate |  |
| 11 | Rental Income After Ordinary Tax (37%) | 4.73% | tax | estimate |  |
| 12 | Home Sale After LTCG (w/ $250K Exclusion) | 6.75% | tax | published |  |

## 5. Cryptocurrency

**Records:** 13

### Held assets — compound model

| # | Name | Annual return | Layer | Basis | Cited |
|---|------|--------------:|-------|-------|:-----:|
| 1 | Bitcoin Spot (Buy & Hold) | 45.0% | raw | published |  |
| 2 | Ethereum Spot (Buy & Hold) | 10.0% | raw | published |  |
| 3 | Stablecoin Yield Farming | 5.0% | raw | estimate |  |
| 4 | DeFi LP Major Pairs | 2.0% | raw | estimate |  |
| 5 | DeFi LP Volatile Pairs | -10.0% | raw | estimate |  |
| 6 | Altcoin Portfolio (Retail) | -15.0% | raw | estimate |  |
| 7 | Meme Coins (Retail Avg) | -70.0% | raw | estimate |  |
| 8 | Staked Ethereum (ETH + Staking Yield) | 13.0% | raw | published |  |
| 9 | Leveraged Perpetual Futures (Retail Avg) | -60.0% | raw | estimate |  |
| 10 | Bitcoin Spot ETF After 0.25% Fee (IBIT) | 44.75% | fee | published |  |
| 11 | Bitcoin After LTCG Tax (20%) | 36.0% | tax | published |  |
| 12 | Bitcoin After STCG Tax (37%) | 28.35% | tax | published |  |
| 13 | Ethereum After LTCG Tax (20%) | 8.0% | tax | published |  |

## 6. Collectibles

**Records:** 10

### Held assets — compound model

| # | Name | Annual return | Layer | Basis | Cited |
|---|------|--------------:|-------|-------|:-----:|
| 1 | Vintage Sports Cards (PSA 10) | 6.0% | raw | estimate |  |
| 2 | Fine Art (Blue Chip / Old Masters) | 5.0% | raw | estimate |  |
| 3 | Fine Wine (Investment Grade) | 4.0% | raw | estimate |  |
| 4 | Classic Cars (Pre-1970) | 3.5% | raw | estimate |  |
| 5 | Luxury Watches (Rolex/Patek) | 3.0% | raw | estimate |  |
| 6 | Sneaker Reselling (Retail Avg) | -5.0% | raw | estimate |  |
| 7 | Modern Art Speculation | -10.0% | raw | estimate |  |
| 8 | Non-Vintage Trading Cards | -15.0% | raw | estimate |  |
| 9 | NFT Art & Digital Collectibles | -50.0% | raw | estimate |  |
| 10 | Collectibles After 28% Tax Rate | 4.32% | tax | estimate |  |

## 7. Precious Metals

**Records:** 12

### Held assets — compound model

| # | Name | Annual return | Layer | Basis | Cited |
|---|------|--------------:|-------|-------|:-----:|
| 1 | Gold Bullion (Physical / GLD) | 7.1% | raw | published | ✓ |
| 2 | Rhodium (Physical) | 4.35% | raw | published | ✓ |
| 3 | Gold Mining Stocks (GDX) | 4.12% | raw | published | ✓ |
| 4 | Silver Bullion (Physical / SLV) | 7.64% | raw | published | ✓ |
| 5 | Copper Futures (CPER) | 3.16% | raw | published | ✓ |
| 6 | Palladium Bullion (PALL) | 5.86% | raw | published | ✓ |
| 7 | Silver Mining Stocks (SIL) | 4.13% | raw | published | ✓ |
| 8 | Platinum Bullion (PPLT) | 0.01% | raw | published | ✓ |
| 9 | Precious Coins (Numismatic) | 1.5% | raw | estimate |  |
| 10 | Junior Mining Stocks (GDXJ) | 1.82% | raw | published | ✓ |
| 11 | Gold After Collectibles Tax (28%) | 5.11% | tax | published | ✓ |
| 12 | Gold Mining After LTCG Tax (20%) | 3.3% | tax | published | ✓ |

## 8. Insurance & Annuities

**Records:** 11

### Held assets — compound model

| # | Name | Annual return | Layer | Basis | Cited |
|---|------|--------------:|-------|-------|:-----:|
| 1 | Variable Annuity (Equity Sub-Accounts) | 5.0% | raw | estimate |  |
| 2 | Indexed Universal Life (IUL) | 4.5% | raw | estimate |  |
| 3 | Fixed Annuity (MYGA 5-Year) | 4.2% | raw | published |  |
| 4 | Single Premium Immediate Annuity (SPIA) | 4.0% | raw | published |  |
| 5 | Whole Life — Top Mutual Co. (NWM/MassMutual) | 3.5% | raw | estimate |  |
| 6 | Fixed Indexed Annuity (FIA) | 3.5% | raw | estimate |  |
| 7 | Universal Life (Current Rate) | 3.0% | raw | estimate |  |
| 8 | Variable Universal Life (VUL After Fees) | 3.0% | raw | estimate |  |
| 9 | Whole Life — Average Company | 2.0% | raw | estimate |  |
| 10 | Annuity Gains After Ordinary Income Tax (37%) | 2.65% | tax | estimate |  |
| 11 | Whole Life Cash Value (Tax-Free via Policy Loans) | 3.5% | tax | estimate |  |

## 9. Trading & Derivatives

**Records:** 10

### Held assets — compound model

| # | Name | Annual return | Layer | Basis | Cited |
|---|------|--------------:|-------|-------|:-----:|
| 1 | Covered Call ETF (JEPI/QYLD) | 7.0% | raw | published |  |
| 2 | Systematic Put Writing (PUTW) | 6.0% | raw | published |  |
| 3 | Managed Futures / Trend Following (DBMF) | 5.0% | raw | published |  |
| 4 | 3x Leveraged Nasdaq Held (TQQQ) | 15.0% | raw | published |  |
| 5 | Retail Day Trading (Avg) | -15.0% | raw | estimate | ✓ |
| 6 | Retail Options Buying (Avg) | -20.0% | raw | estimate |  |
| 7 | Retail Forex / CFD Trading (Avg) | -25.0% | raw | estimate | ✓ |
| 8 | 0DTE Options Buying (Retail) | -40.0% | raw | estimate |  |
| 9 | Inverse / Short ETF Held (SQQQ) | -60.0% | raw | published |  |

### Games — linear model

| # | Name | Edge | DU/day | CED | Layer | Basis | Cited |
|---|------|-----:|-------:|----:|-------|-------|:-----:|
| 1 | Binary Options (Offshore) | -10.0% | 10 | 2% | raw | estimate |  |

## 10. Sports Betting

**Records:** 22

### Games — linear model

| # | Name | Edge | DU/day | CED | Layer | Basis | Cited |
|---|------|-----:|-------:|----:|-------|-------|:-----:|
| 1 | Sharp Bettor (+2% Closing Line Value) | 2.0% | 3 | 2% | raw | estimate |  |
| 2 | Betting Exchange (2% Commission) | -1.0% | 2 | 3% | raw | math | ✓ |
| 3 | Reduced Juice Line (-105) | -2.38% | 2 | 3% | raw | math | ✓ |
| 4 | Single Game Spread (-110) | -4.55% | 2 | 3% | raw | math | ✓ |
| 5 | Single Game O/U (-110) | -4.55% | 2 | 3% | raw | math | ✓ |
| 6 | Pick'em Moneyline (-110) | -4.55% | 2 | 3% | raw | math | ✓ |
| 7 | Teaser 2-Team 6pt | -5.0% | 1 | 3% | raw | estimate |  |
| 8 | Live / In-Game Bet | -6.5% | 5 | 3% | raw | estimate |  |
| 9 | Player Prop Bet | -7.0% | 3 | 2% | raw | estimate |  |
| 10 | Micro-Bet (Next Play / Next Pitch) | -9.0% | 20 | 1% | raw | estimate |  |
| 11 | Season Win Total Future | -8.0% | 0.05 | 5% | raw | estimate |  |
| 12 | 2-Team Parlay | -8.88% | 2 | 2% | raw | math | ✓ |
| 13 | Championship Future | -12.0% | 0.03 | 5% | raw | estimate |  |
| 14 | 3-Team Parlay | -13.03% | 1 | 2% | raw | math | ✓ |
| 15 | 4-Team Parlay | -16.98% | 1 | 1% | raw | math | ✓ |
| 16 | Same-Game Parlay (SGP) | -15.0% | 2 | 2% | raw | estimate |  |
| 17 | First Touchdown Scorer | -18.0% | 1 | 1% | raw | estimate |  |
| 18 | 5-Team Parlay | -20.75% | 0.5 | 1% | raw | math | ✓ |
| 19 | Correct Score (Soccer) | -20.0% | 0.5 | 1% | raw | estimate |  |
| 20 | 6-Team Parlay | -24.36% | 0.3 | 1% | raw | math | ✓ |
| 21 | 8-Team Parlay | -31.08% | 0.2 | 1% | raw | math | ✓ |
| 22 | 10-Team Parlay | -37.2% | 0.1 | 0.5% | raw | math | ✓ |

## 11. Horse Racing & Pari-Mutuel

**Records:** 6

### Games — linear model

| # | Name | Edge | DU/day | CED | Layer | Basis | Cited |
|---|------|-----:|-------:|----:|-------|-------|:-----:|
| 1 | Horse Racing with 8% ADW Rebate | -12.0% | 3 | 2% | raw | published |  |
| 2 | Horse Racing Win / Place / Show | -17.0% | 3 | 2% | raw | published | ✓ |
| 3 | Horse Racing Exacta / Daily Double | -20.0% | 2 | 2% | raw | published | ✓ |
| 4 | Greyhound Racing | -20.0% | 3 | 2% | raw | published |  |
| 5 | Horse Racing Trifecta / Superfecta | -25.0% | 2 | 1% | raw | published | ✓ |
| 6 | Horse Racing Pick 4 / Pick 6 | -25.0% | 0.5 | 1% | raw | published |  |

## 12. Casino Gambling

**Records:** 44

### Games — linear model

| # | Name | Edge | DU/day | CED | Layer | Basis | Cited |
|---|------|-----:|-------:|----:|-------|-------|:-----:|
| 1 | Blackjack Card Counting (Skilled) | 1.0% | 60 | 2% | raw | estimate | ✓ |
| 2 | Spanish 21 (Dealer Stands Soft 17) | -0.4% | 60 | 2% | raw | math | ✓ |
| 3 | Video Poker 9/6 JoB | -0.46% | 80 | 1% | raw | math | ✓ |
| 4 | Blackjack 3:2 Basic Strategy | -0.43% | 60 | 2% | raw | math | ✓ |
| 5 | Craps Place 6 / Place 8 | -1.52% | 40 | 2% | raw | math | ✓ |
| 6 | Craps Place 5 / Place 9 | -4.0% | 40 | 2% | raw | math | ✓ |
| 7 | Craps Place 4 / Place 10 | -6.67% | 40 | 2% | raw | math | ✓ |
| 8 | Baccarat Banker | -1.06% | 50 | 3% | raw | math | ✓ |
| 9 | Crypto Dice (1% House Edge) | -1.0% | 1000 | 0.5% | raw | math | ✓ |
| 10 | Baccarat Player | -1.24% | 50 | 3% | raw | math | ✓ |
| 11 | Roulette Single Zero La Partage | -1.35% | 40 | 3% | raw | math | ✓ |
| 12 | Craps Big 6 / Big 8 | -9.09% | 40 | 1% | raw | math | ✓ |
| 13 | Craps Hard 6 / Hard 8 | -9.09% | 40 | 1% | raw | math | ✓ |
| 14 | Three Card Poker Pair Plus | -7.28% | 40 | 3% | raw | math | ✓ |
| 15 | Craps Any Craps | -11.11% | 40 | 1% | raw | math | ✓ |
| 16 | Roulette Five-Number Bet (0-00-1-2-3) | -7.89% | 40 | 3% | raw | math | ✓ |
| 17 | Craps Don't Pass | -1.36% | 40 | 2% | raw | math | ✓ |
| 18 | Craps Pass Line | -1.41% | 40 | 2% | raw | math | ✓ |
| 19 | Blackjack 6:5 | -1.82% | 60 | 2% | raw | math | ✓ |
| 20 | Ultimate Texas Hold'em | -2.19% | 30 | 3% | raw | math | ✓ |
| 21 | Craps Field (3:1 on 12) | -2.78% | 40 | 2% | raw | math | ✓ |
| 22 | Craps Lay 4 / Lay 10 (Commission on Win) | -1.67% | 40 | 2% | raw | math | ✓ |
| 23 | Pai Gow Poker Emperor's Challenge | -4.17% | 30 | 1% | raw | math | ✓ |
| 24 | Craps Hard 4 / Hard 10 | -11.11% | 40 | 1% | raw | math | ✓ |
| 25 | Pai Gow Poker | -2.51% | 30 | 3% | raw | math | ✓ |
| 26 | Roulette Single Zero | -2.7% | 40 | 3% | raw | math | ✓ |
| 27 | Sic Bo Big / Small | -2.78% | 40 | 2% | raw | math | ✓ |
| 28 | Four Card Poker Ante | -2.79% | 30 | 3% | raw | math | ✓ |
| 29 | Casino War | -2.88% | 50 | 2% | raw | math | ✓ |
| 30 | Three Card Poker | -3.37% | 40 | 3% | raw | math | ✓ |
| 31 | Let It Ride | -3.51% | 30 | 3% | raw | math | ✓ |
| 32 | Four Card Poker Aces Up | -3.89% | 30 | 1% | raw | math | ✓ |
| 33 | Online Slots 96% RTP | -4.0% | 600 | 0.5% | raw | math | ✓ |
| 34 | Mississippi Stud | -4.91% | 30 | 3% | raw | math | ✓ |
| 35 | Slots Loose 95% | -5.0% | 500 | 0.5% | raw | math | ✓ |
| 36 | Caribbean Stud | -5.22% | 30 | 3% | raw | math | ✓ |
| 37 | Roulette Double Zero | -5.26% | 40 | 3% | raw | math | ✓ |
| 38 | Slots Average 92% | -8.0% | 500 | 0.5% | raw | published |  |
| 39 | Slots Tight 85% | -15.0% | 500 | 0.5% | raw | math | ✓ |
| 40 | Baccarat Tie (8:1) | -14.36% | 50 | 3% | raw | math | ✓ |
| 41 | Big Six Wheel | -11.11% | 20 | 2% | raw | math | ✓ |
| 42 | Craps Any Seven | -16.67% | 40 | 2% | raw | math | ✓ |
| 43 | Keno 4-Spot | -25.94% | 10 | 1% | raw | math | ✓ |
| 44 | Keno 10-Spot | -27.71% | 10 | 1% | raw | math | ✓ |

## 13. Poker & Skill-Based

**Records:** 9

### Games — linear model

| # | Name | Edge | DU/day | CED | Layer | Basis | Cited |
|---|------|-----:|-------:|----:|-------|-------|:-----:|
| 1 | DFS Top 5% | 5.0% | 5 | 5% | raw | estimate |  |
| 2 | Poker Skilled Tournaments | 2.0% | 5 | 10% | raw | estimate |  |
| 3 | Poker Mid-Stakes Reg | 1.5% | 40 | 2% | raw | estimate |  |
| 4 | Poker Average Live Cash | -5.0% | 25 | 3% | raw | estimate |  |
| 5 | Poker Average Online | -8.0% | 40 | 2% | raw | estimate |  |
| 6 | Poker Recreational Live | -10.0% | 25 | 3% | raw | estimate |  |
| 7 | DFS Average | -12.0% | 5 | 5% | raw | estimate |  |
| 8 | Poker Sit & Go Average | -15.0% | 5 | 5% | raw | estimate |  |
| 9 | DFS Casual | -20.0% | 3 | 5% | raw | estimate |  |

## 14. Prediction Markets

**Records:** 12

### Games — linear model

| # | Name | Edge | DU/day | CED | Layer | Basis | Cited |
|---|------|-----:|-------:|----:|-------|-------|:-----:|
| 1 | Polymarket Elections | -3.0% | 1 | 5% | raw | estimate |  |
| 2 | Polymarket SCOTUS | -3.0% | 0.5 | 5% | raw | estimate |  |
| 3 | Metaculus Scientific | -3.5% | 1 | 3% | raw | estimate |  |
| 4 | Polymarket Oscars | -4.0% | 0.5 | 3% | raw | estimate |  |
| 5 | Polymarket Geopolitics | -4.0% | 0.5 | 3% | raw | estimate |  |
| 6 | Polymarket Sports/Entertainment | -4.5% | 1 | 3% | raw | estimate |  |
| 7 | Polymarket Crypto Prices | -5.0% | 2 | 3% | raw | estimate |  |
| 8 | Kalshi Economic | -5.5% | 0.5 | 3% | raw | estimate |  |
| 9 | Kalshi Fed Rate | -5.5% | 0.2 | 5% | raw | estimate |  |
| 10 | Kalshi GDP | -6.0% | 0.2 | 5% | raw | estimate |  |
| 11 | Kalshi Weather | -7.0% | 0.5 | 2% | raw | estimate |  |
| 12 | PredictIt US Politics | -10.0% | 1 | 5% | raw | estimate |  |

## 15. Lottery

**Records:** 13

### Games — linear model

| # | Name | Edge | DU/day | CED | Layer | Basis | Cited |
|---|------|-----:|-------:|----:|-------|-------|:-----:|
| 1 | Pull-Tab Tickets | -20.0% | 1 | 0.3% | raw | published |  |
| 2 | $1 Scratch-Off Best Odds | -25.0% | 1 | 0.5% | raw | published |  |
| 3 | Bingo Hall Session | -25.0% | 0.5 | 1% | raw | estimate |  |
| 4 | Premium Scratch-Off $20+ | -30.0% | 0.5 | 1% | raw | published |  |
| 5 | Scratch-Off Tickets Avg | -35.0% | 0.5 | 0.5% | raw | published |  |
| 6 | Keno State-Run | -40.0% | 2 | 0.5% | raw | published |  |
| 7 | Daily Numbers Game | -42.0% | 1 | 0.5% | raw | published |  |
| 8 | State Pick 6 / Lotto | -45.0% | 0.15 | 0.1% | raw | published |  |
| 9 | State Lottery Pick 3/4 | -50.0% | 0.5 | 0.3% | raw | math | ✓ |
| 10 | EuroMillions | -50.0% | 0.1 | 0.1% | raw | math | ✓ |
| 11 | Charity 50/50 Raffle | -50.0% | 0.05 | 0.5% | raw | math | ✓ |
| 12 | Powerball / Mega Millions | -50.0% | 0.1 | 0.1% | raw | math | ✓ |
| 13 | Multi-State Cash4Life | -45.0% | 0.1 | 0.1% | raw | math | ✓ |

<p align="center">
  <a href="../docs/ROADMAP.md">Roadmap</a> ·
  <a href="../docs/data-architecture.md">Data Architecture</a> ·
  <a href="edge_analysis12.md">V12 archive</a>
</p>
