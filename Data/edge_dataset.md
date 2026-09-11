# Edge Spectrum — Canonical Dataset 📊

> [!NOTE]
> **Generated file — do not edit.** Produced by `npm run gen:edges` (from `site/`) out of
> `site/src/data/edges.ts`, the single source of truth for this dataset. Edit that file and regenerate;
> CI runs `npm run gen:edges -- --check` and fails the build on drift.

**Records:** 187 · **Categories:** 13 · **Layers:** 160 raw · 8 fee · 19 tax

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

## Model reference

| Mode | Applies to | Measure |
|------|------------|---------|
| `i` — compound | Held assets | `returnOnCapital` compounds the annual return over the horizon. |
| `g` — linear | Games | `returnOnCapital` accrues the flat-stake loss and **stops at −100%**; `expectedTurnoverCost` is the same loss left unbounded. |

See [`../Docs/methodology.md`](../Docs/methodology.md) for the DU/CED framework and the ruin
formulas, and [`../Docs/Ideas/hub_improvement_plan.md`](../Docs/Ideas/hub_improvement_plan.md)
section 8 for why the two measures are no longer plotted on one axis.

---

## 1. Stock Market

**Records:** 32

### Held assets — compound model

| # | Name | Annual return | Layer |
|---|------|--------------:|-------|
| 1 | NASDAQ 100 (QQQ) | 12.5% | raw |
| 2 | S&P 500 Growth (IVW) | 12.0% | raw |
| 3 | Small-Cap Value (VBR) | 11.5% | raw |
| 4 | S&P MidCap 400 (MDY) | 11.0% | raw |
| 5 | Dividend Aristocrats (NOBL) | 10.5% | raw |
| 6 | Total US Stock Market (VTI) | 10.2% | raw |
| 7 | S&P 500 Index (SPY/VOO) | 10.0% | raw |
| 8 | S&P 500 Equal Weight (RSP) | 10.0% | raw |
| 9 | Dow Jones Industrial (DIA) | 9.5% | raw |
| 10 | S&P 500 Value (IVE) | 9.5% | raw |
| 11 | Russell 2000 Small Cap (IWM) | 8.5% | raw |
| 12 | REIT Index ETF (VNQ) | 8.0% | raw |
| 13 | S&P 500 High Dividend (SPYD) | 8.0% | raw |
| 14 | DAX Germany Index | 7.5% | raw |
| 15 | Nikkei 225 Japan Index | 7.0% | raw |
| 16 | MSCI EAFE Intl Developed (EFA) | 5.5% | raw |
| 17 | FTSE 100 UK Index | 5.0% | raw |
| 18 | MSCI Emerging Markets (EEM) | 4.0% | raw |
| 19 | Commodity Index (DJP) | 1.0% | raw |
| 20 | Individual Stock Picking (Retail) | -2.0% | raw |
| 21 | Penny Stocks (Retail Avg) | -30.0% | raw |
| 22 | S&P 500 After 0.03% Index Fee | 9.97% | fee |
| 23 | S&P 500 After 0.35% Robo-Advisor | 9.65% | fee |
| 24 | S&P 500 After 0.60% Target-Date Fund | 9.4% | fee |
| 25 | S&P 500 After 1% Advisory Fee | 9.0% | fee |
| 26 | S&P 500 After 1.5% Active Mutual Fund | 8.5% | fee |
| 27 | S&P 500 After 2-and-20 Hedge Fund | 6.4% | fee |
| 28 | S&P 500 After 2-and-20 (Underperforming) | 4.0% | fee |
| 29 | S&P 500 After LTCG Tax (20%) | 8.0% | tax |
| 30 | S&P 500 After STCG Tax (37%) | 6.3% | tax |
| 31 | S&P 500 After 1% Fee + LTCG Tax | 7.2% | tax |
| 32 | Qualified Dividends (SPYD) After 15% Tax | 6.8% | tax |

## 2. Cash & Savings

**Records:** 17

### Held assets — compound model

| # | Name | Annual return | Layer |
|---|------|--------------:|-------|
| 1 | Money Market Fund (SPAXX/VMFXX) | 4.8% | raw |
| 2 | High-Yield Savings Account (Online) | 4.5% | raw |
| 3 | 1-Year CD (Top Rate) | 4.5% | raw |
| 4 | 6-Month CD | 4.3% | raw |
| 5 | High-Yield Money Market Account | 4.3% | raw |
| 6 | Cash Management Account (SoFi/Wealthfront) | 4.0% | raw |
| 7 | No-Penalty CD | 4.0% | raw |
| 8 | 3-Month CD | 4.0% | raw |
| 9 | 2-Year CD | 3.8% | raw |
| 10 | 5-Year CD | 3.5% | raw |
| 11 | Bank Money Market (Traditional) | 1.5% | raw |
| 12 | Credit Union Savings | 0.5% | raw |
| 13 | National Average Savings Rate | 0.45% | raw |
| 14 | Big Bank Savings (Chase/BofA) | 0.01% | raw |
| 15 | Regular Checking Account | 0.01% | raw |
| 16 | HYSA After Income Tax (24%) | 3.42% | tax |
| 17 | HYSA After Income Tax (37%) | 2.84% | tax |

## 3. Bonds

**Records:** 16

### Held assets — compound model

| # | Name | Annual return | Layer |
|---|------|--------------:|-------|
| 1 | High-Yield Corporate (HYG/JNK) | 5.5% | raw |
| 2 | Convertible Bond ETF (CWB) | 5.0% | raw |
| 3 | Investment Grade Corporate (LQD) | 4.5% | raw |
| 4 | US Treasury Bills (BIL) | 4.3% | raw |
| 5 | Long-Term Treasury 20+ Yr (TLT) | 4.0% | raw |
| 6 | US Treasury 10-Year | 3.8% | raw |
| 7 | Total US Bond Market (BND/AGG) | 3.5% | raw |
| 8 | Municipal Bond Index (MUB) | 3.5% | raw |
| 9 | Aggregate Bond ETF (AGG) | 3.0% | raw |
| 10 | International Bond (BNDX) | 2.5% | raw |
| 11 | Short-Term Treasury (SHY) | 2.5% | raw |
| 12 | TIPS Inflation-Protected (TIP) | 1.5% | raw |
| 13 | Bond Fund After 1% Advisory Fee | 2.5% | fee |
| 14 | Bond Interest After Income Tax (37%) | 2.21% | tax |
| 15 | Muni Bonds Tax-Exempt (Effective) | 3.5% | tax |
| 16 | Treasury Interest After Federal Tax (24%) | 2.89% | tax |

## 4. Real Estate

**Records:** 12

### Held assets — compound model

| # | Name | Annual return | Layer |
|---|------|--------------:|-------|
| 1 | Multi-Unit Apartments (5+ Units) | 10.0% | raw |
| 2 | Industrial / Warehouse | 9.0% | raw |
| 3 | Multi Single Family Portfolio | 8.5% | raw |
| 4 | Single Family Home (Buy & Hold) | 7.5% | raw |
| 5 | Commercial Office Space | 6.5% | raw |
| 6 | Retail / Strip Mall | 5.5% | raw |
| 7 | Vacation / Short-Term Rental | 4.0% | raw |
| 8 | Raw Land (Speculative) | 2.0% | raw |
| 9 | House Flipping (Retail Avg) | -5.0% | raw |
| 10 | Timeshare | -12.0% | raw |
| 11 | Rental Income After Ordinary Tax (37%) | 4.73% | tax |
| 12 | Home Sale After LTCG (w/ $250K Exclusion) | 6.75% | tax |

## 5. Cryptocurrency

**Records:** 10

### Held assets — compound model

| # | Name | Annual return | Layer |
|---|------|--------------:|-------|
| 1 | Bitcoin Spot (Buy & Hold) | 45.0% | raw |
| 2 | Ethereum Spot (Buy & Hold) | 10.0% | raw |
| 3 | Stablecoin Yield Farming | 5.0% | raw |
| 4 | DeFi LP Major Pairs | 2.0% | raw |
| 5 | DeFi LP Volatile Pairs | -10.0% | raw |
| 6 | Altcoin Portfolio (Retail) | -15.0% | raw |
| 7 | Meme Coins (Retail Avg) | -70.0% | raw |
| 8 | Bitcoin After LTCG Tax (20%) | 36.0% | tax |
| 9 | Bitcoin After STCG Tax (37%) | 28.35% | tax |
| 10 | Ethereum After LTCG Tax (20%) | 8.0% | tax |

## 6. Collectibles

**Records:** 10

### Held assets — compound model

| # | Name | Annual return | Layer |
|---|------|--------------:|-------|
| 1 | Vintage Sports Cards (PSA 10) | 6.0% | raw |
| 2 | Fine Art (Blue Chip / Old Masters) | 5.0% | raw |
| 3 | Fine Wine (Investment Grade) | 4.0% | raw |
| 4 | Classic Cars (Pre-1970) | 3.5% | raw |
| 5 | Luxury Watches (Rolex/Patek) | 3.0% | raw |
| 6 | Sneaker Reselling (Retail Avg) | -5.0% | raw |
| 7 | Modern Art Speculation | -10.0% | raw |
| 8 | Non-Vintage Trading Cards | -15.0% | raw |
| 9 | NFT Art & Digital Collectibles | -50.0% | raw |
| 10 | Collectibles After 28% Tax Rate | 4.32% | tax |

## 7. Precious Metals

**Records:** 12

### Held assets — compound model

| # | Name | Annual return | Layer |
|---|------|--------------:|-------|
| 1 | Gold Bullion (Physical / GLD) | 7.5% | raw |
| 2 | Rhodium (Physical) | 6.0% | raw |
| 3 | Gold Mining Stocks (GDX) | 5.0% | raw |
| 4 | Silver Bullion (Physical / SLV) | 4.5% | raw |
| 5 | Copper Futures (CPER) | 4.0% | raw |
| 6 | Palladium Bullion (PALL) | 3.5% | raw |
| 7 | Silver Mining Stocks (SIL) | 3.0% | raw |
| 8 | Platinum Bullion (PPLT) | 2.0% | raw |
| 9 | Precious Coins (Numismatic) | 1.5% | raw |
| 10 | Junior Mining Stocks (GDXJ) | 1.0% | raw |
| 11 | Gold After Collectibles Tax (28%) | 5.4% | tax |
| 12 | Gold Mining After LTCG Tax (20%) | 4.0% | tax |

## 8. Insurance & Annuities

**Records:** 11

### Held assets — compound model

| # | Name | Annual return | Layer |
|---|------|--------------:|-------|
| 1 | Variable Annuity (Equity Sub-Accounts) | 5.0% | raw |
| 2 | Indexed Universal Life (IUL) | 4.5% | raw |
| 3 | Fixed Annuity (MYGA 5-Year) | 4.2% | raw |
| 4 | Single Premium Immediate Annuity (SPIA) | 4.0% | raw |
| 5 | Whole Life — Top Mutual Co. (NWM/MassMutual) | 3.5% | raw |
| 6 | Fixed Indexed Annuity (FIA) | 3.5% | raw |
| 7 | Universal Life (Current Rate) | 3.0% | raw |
| 8 | Variable Universal Life (VUL After Fees) | 3.0% | raw |
| 9 | Whole Life — Average Company | 2.0% | raw |
| 10 | Annuity Gains After Ordinary Income Tax (37%) | 2.65% | tax |
| 11 | Whole Life Cash Value (Tax-Free via Policy Loans) | 3.5% | tax |

## 9. Sports Betting

**Records:** 18

### Games — linear model

| # | Name | Edge | DU/day | CED | Layer |
|---|------|-----:|-------:|----:|-------|
| 1 | Single Game Spread (-110) | -4.55% | 2 | 3% | raw |
| 2 | Single Game O/U (-110) | -4.55% | 2 | 3% | raw |
| 3 | Moneyline (Standard Juice) | -4.55% | 2 | 3% | raw |
| 4 | Teaser 2-Team 6pt | -5.0% | 1 | 3% | raw |
| 5 | Live / In-Game Bet | -6.5% | 5 | 3% | raw |
| 6 | Player Prop Bet | -7.0% | 3 | 2% | raw |
| 7 | Season Win Total Future | -8.0% | 0.05 | 5% | raw |
| 8 | 2-Team Parlay | -10.0% | 2 | 2% | raw |
| 9 | Championship Future | -12.0% | 0.03 | 5% | raw |
| 10 | 3-Team Parlay | -12.5% | 1 | 2% | raw |
| 11 | 4-Team Parlay | -15.0% | 1 | 1% | raw |
| 12 | Same-Game Parlay (SGP) | -15.0% | 2 | 2% | raw |
| 13 | First Touchdown Scorer | -18.0% | 1 | 1% | raw |
| 14 | 5-Team Parlay | -20.0% | 0.5 | 1% | raw |
| 15 | Correct Score (Soccer) | -20.0% | 0.5 | 1% | raw |
| 16 | 6-Team Parlay | -25.0% | 0.3 | 1% | raw |
| 17 | 8-Team Parlay | -30.0% | 0.2 | 1% | raw |
| 18 | 10-Team Parlay | -35.0% | 0.1 | 0.5% | raw |

## 10. Casino Gambling

**Records:** 19

### Games — linear model

| # | Name | Edge | DU/day | CED | Layer |
|---|------|-----:|-------:|----:|-------|
| 1 | Video Poker 9/6 JoB | -0.46% | 80 | 1% | raw |
| 2 | Blackjack 3:2 Basic Strategy | -0.5% | 60 | 2% | raw |
| 3 | Baccarat Banker | -1.06% | 50 | 3% | raw |
| 4 | Baccarat Player | -1.24% | 50 | 3% | raw |
| 5 | Craps Don't Pass | -1.36% | 40 | 2% | raw |
| 6 | Craps Pass Line | -1.41% | 40 | 2% | raw |
| 7 | Blackjack 6:5 | -2.0% | 60 | 2% | raw |
| 8 | Pai Gow Poker | -2.5% | 30 | 3% | raw |
| 9 | Roulette Single Zero | -2.7% | 40 | 3% | raw |
| 10 | Three Card Poker | -3.4% | 40 | 3% | raw |
| 11 | Let It Ride | -3.5% | 30 | 3% | raw |
| 12 | Slots Loose 95% | -5.0% | 500 | 0.5% | raw |
| 13 | Caribbean Stud | -5.2% | 30 | 3% | raw |
| 14 | Roulette Double Zero | -5.26% | 40 | 3% | raw |
| 15 | Slots Average 92% | -8.0% | 500 | 0.5% | raw |
| 16 | Slots Tight 85% | -15.0% | 500 | 0.5% | raw |
| 17 | Big Six Wheel | -16.0% | 20 | 2% | raw |
| 18 | Keno 4-Spot | -28.0% | 10 | 1% | raw |
| 19 | Keno 10-Spot | -35.0% | 10 | 1% | raw |

## 11. Poker & Skill-Based

**Records:** 9

### Games — linear model

| # | Name | Edge | DU/day | CED | Layer |
|---|------|-----:|-------:|----:|-------|
| 1 | DFS Top 5% | 5.0% | 5 | 5% | raw |
| 2 | Poker Skilled Tournaments | 2.0% | 5 | 10% | raw |
| 3 | Poker Mid-Stakes Reg | 1.5% | 40 | 2% | raw |
| 4 | Poker Average Live Cash | -5.0% | 25 | 3% | raw |
| 5 | Poker Average Online | -8.0% | 40 | 2% | raw |
| 6 | Poker Recreational Live | -10.0% | 25 | 3% | raw |
| 7 | DFS Average | -12.0% | 5 | 5% | raw |
| 8 | Poker Sit & Go Average | -15.0% | 5 | 5% | raw |
| 9 | DFS Casual | -20.0% | 3 | 5% | raw |

## 12. Prediction Markets

**Records:** 12

### Games — linear model

| # | Name | Edge | DU/day | CED | Layer |
|---|------|-----:|-------:|----:|-------|
| 1 | Polymarket Elections | -3.0% | 1 | 5% | raw |
| 2 | Polymarket SCOTUS | -3.0% | 0.5 | 5% | raw |
| 3 | Metaculus Scientific | -3.5% | 1 | 3% | raw |
| 4 | Polymarket Oscars | -4.0% | 0.5 | 3% | raw |
| 5 | Polymarket Geopolitics | -4.0% | 0.5 | 3% | raw |
| 6 | Polymarket Sports/Entertainment | -4.5% | 1 | 3% | raw |
| 7 | Polymarket Crypto Prices | -5.0% | 2 | 3% | raw |
| 8 | Kalshi Economic | -5.5% | 0.5 | 3% | raw |
| 9 | Kalshi Fed Rate | -5.5% | 0.2 | 5% | raw |
| 10 | Kalshi GDP | -6.0% | 0.2 | 5% | raw |
| 11 | Kalshi Weather | -7.0% | 0.5 | 2% | raw |
| 12 | PredictIt US Politics | -10.0% | 1 | 5% | raw |

## 13. Lottery

**Records:** 9

### Games — linear model

| # | Name | Edge | DU/day | CED | Layer |
|---|------|-----:|-------:|----:|-------|
| 1 | $1 Scratch-Off Best Odds | -25.0% | 1 | 0.5% | raw |
| 2 | Premium Scratch-Off $20+ | -30.0% | 0.5 | 1% | raw |
| 3 | Scratch-Off Tickets Avg | -35.0% | 0.5 | 0.5% | raw |
| 4 | Keno State-Run | -40.0% | 2 | 0.5% | raw |
| 5 | Daily Numbers Game | -42.0% | 1 | 0.5% | raw |
| 6 | State Pick 6 / Lotto | -45.0% | 0.15 | 0.1% | raw |
| 7 | State Lottery Pick 3/4 | -50.0% | 0.5 | 0.3% | raw |
| 8 | Powerball / Mega Millions | -52.0% | 0.1 | 0.1% | raw |
| 9 | Multi-State Cash4Life | -55.0% | 0.1 | 0.1% | raw |

<p align="center">
  <a href="../Docs/roadmap.md">Roadmap</a> ·
  <a href="../Docs/data-architecture.md">Data Architecture</a> ·
  <a href="edge_analysis12.md">V12 archive</a>
</p>
