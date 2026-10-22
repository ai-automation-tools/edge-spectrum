# Edge Analysis V12 -- Combined Dataset (DU/CED Framework)

> [!WARNING]
> **Frozen archive — not the dataset.** This file is a snapshot of the V12 catalog as it stood on
> 30 March 2026, kept for its rationale and its history. It is **21 records behind** the canonical
> dataset: it predates the whole **Precious Metals** and **Insurance & Annuities** categories, and
> it still lists a `Gold / Precious Metals (GLD)` row under Stock Market that was later renamed
> `Gold Bullion (Physical / GLD)` and moved. Its horizon columns are also computed under the
> single-axis model that roadmap Action 2.1 replaced on 2026-08-31, and nothing recomputed them.
>
> The current dataset is [`edge_dataset.md`](edge_dataset.md), generated from
> `site/src/data/edges.ts`. Edit that; this file stays as it is.

**Version:** 12.0
**Date:** March 30, 2026
**Data Points:** 166
**Categories:** 11

---

## V12 Changes

- **Combined V10 + V11** into a single, complete reference document
- Retains the DU/CED framework from V10 with all data tables fully expanded
- Excludes **Options & Derivatives** and **Active Trading** per V11 rationale (outlier noise, not typical investor/gambler audience)
- Sections renumbered 1-10 sequentially

### Model Reference

**Compound Model** (Investing categories)
- Formula: `((1 + a/100)^years - 1) * 100`
- Years mapping: 1 DU = 1/252, 1 Day = 1/252, 1 Week = 1/52, 1 Month = 1/12, 1 Year = 1, 5 Years = 5, 10 Years = 10
- DU/day = 1, CED = 100% (fully invested, continuous compounding implicit)
- Used by: Stock Market, Cash & Savings, Bonds, Real Estate, Cryptocurrency, Collectibles

**Linear Model** (Gambling/Betting categories)
- Formula: `DU_period * (CED/100) * edge`
- DU_period: 1 DU = 1, 1 Day = DU/day x 1, 1 Week = DU/day x 7, 1 Month = DU/day x 30, 1 Year = DU/day x 365, 5 Years = DU/day x 1825, 10 Years = DU/day x 3650
- DU/day and CED vary per activity based on realistic frequency and sizing
- Used by: Sports Betting, Casino Gambling, Poker & Skill-Based, Prediction Markets, Lottery

---

## 1. Stock Market (Compound)

| # | Name | Edge | Layer | DU/day | CED | 1 DU | 1 Day | 1 Week | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|------|-------|--------|-----|------|-------|--------|---------|--------|---------|----------|
| 1 | NASDAQ 100 (QQQ) | 12.5 | raw | 1 | 100% | 0.05 | 0.05 | 0.23 | 0.99 | 12.50 | 80.20 | 224.73 |
| 2 | S&P 500 Growth (IVW) | 12.0 | raw | 1 | 100% | 0.04 | 0.04 | 0.22 | 0.95 | 12.00 | 76.23 | 210.58 |
| 3 | Small-Cap Value (VBR) | 11.5 | raw | 1 | 100% | 0.04 | 0.04 | 0.21 | 0.91 | 11.50 | 72.34 | 196.99 |
| 4 | S&P MidCap 400 (MDY) | 11.0 | raw | 1 | 100% | 0.04 | 0.04 | 0.20 | 0.87 | 11.00 | 68.51 | 183.94 |
| 5 | Dividend Aristocrats (NOBL) | 10.5 | raw | 1 | 100% | 0.04 | 0.04 | 0.19 | 0.84 | 10.50 | 64.74 | 171.41 |
| 6 | Total US Stock Market (VTI) | 10.2 | raw | 1 | 100% | 0.04 | 0.04 | 0.19 | 0.81 | 10.20 | 62.52 | 164.13 |
| 7 | S&P 500 Index (SPY/VOO) | 10.0 | raw | 1 | 100% | 0.04 | 0.04 | 0.18 | 0.80 | 10.00 | 61.05 | 159.37 |
| 8 | S&P 500 Equal Weight (RSP) | 10.0 | raw | 1 | 100% | 0.04 | 0.04 | 0.18 | 0.80 | 10.00 | 61.05 | 159.37 |
| 9 | Dow Jones Industrial (DIA) | 9.5 | raw | 1 | 100% | 0.04 | 0.04 | 0.17 | 0.76 | 9.50 | 57.42 | 147.82 |
| 10 | S&P 500 Value (IVE) | 9.5 | raw | 1 | 100% | 0.04 | 0.04 | 0.17 | 0.76 | 9.50 | 57.42 | 147.82 |
| 11 | Russell 2000 Small Cap (IWM) | 8.5 | raw | 1 | 100% | 0.03 | 0.03 | 0.16 | 0.68 | 8.50 | 50.37 | 126.10 |
| 12 | REIT Index ETF (VNQ) | 8.0 | raw | 1 | 100% | 0.03 | 0.03 | 0.15 | 0.64 | 8.00 | 46.93 | 115.89 |
| 13 | S&P 500 High Dividend (SPYD) | 8.0 | raw | 1 | 100% | 0.03 | 0.03 | 0.15 | 0.64 | 8.00 | 46.93 | 115.89 |
| 14 | DAX Germany Index | 7.5 | raw | 1 | 100% | 0.03 | 0.03 | 0.14 | 0.60 | 7.50 | 43.56 | 106.10 |
| 15 | Nikkei 225 Japan Index | 7.0 | raw | 1 | 100% | 0.03 | 0.03 | 0.13 | 0.57 | 7.00 | 40.26 | 96.72 |
| 16 | MSCI EAFE Intl Developed (EFA) | 5.5 | raw | 1 | 100% | 0.02 | 0.02 | 0.10 | 0.45 | 5.50 | 30.70 | 70.81 |
| 17 | FTSE 100 UK Index | 5.0 | raw | 1 | 100% | 0.02 | 0.02 | 0.09 | 0.41 | 5.00 | 27.63 | 62.89 |
| 18 | MSCI Emerging Markets (EEM) | 4.0 | raw | 1 | 100% | 0.02 | 0.02 | 0.08 | 0.33 | 4.00 | 21.67 | 48.02 |
| 19 | Gold / Precious Metals (GLD) | 2.0 | raw | 1 | 100% | 0.01 | 0.01 | 0.04 | 0.17 | 2.00 | 10.41 | 21.90 |
| 20 | Commodity Index (DJP) | 1.0 | raw | 1 | 100% | 0.00 | 0.00 | 0.02 | 0.08 | 1.00 | 5.10 | 10.46 |
| 21 | Individual Stock Picking (Retail) | -2.0 | raw | 1 | 100% | -0.01 | -0.01 | -0.04 | -0.17 | -2.00 | -9.61 | -18.29 |
| 22 | Penny Stocks (Retail Avg) | -30.0 | raw | 1 | 100% | -0.14 | -0.14 | -0.68 | -2.93 | -30.00 | -83.19 | -97.18 |
| 23 | S&P 500 After 0.03% Index Fee | 9.97 | fee | 1 | 100% | 0.04 | 0.04 | 0.18 | 0.80 | 9.97 | 60.83 | 158.67 |
| 24 | S&P 500 After 0.35% Robo-Advisor | 9.65 | fee | 1 | 100% | 0.04 | 0.04 | 0.18 | 0.77 | 9.65 | 58.51 | 151.24 |
| 25 | S&P 500 After 0.60% Target-Date Fund | 9.4 | fee | 1 | 100% | 0.04 | 0.04 | 0.17 | 0.75 | 9.40 | 56.71 | 145.57 |
| 26 | S&P 500 After 1% Advisory Fee | 9.0 | fee | 1 | 100% | 0.03 | 0.03 | 0.17 | 0.72 | 9.00 | 53.86 | 136.74 |
| 27 | S&P 500 After 1.5% Active Mutual Fund | 8.5 | fee | 1 | 100% | 0.03 | 0.03 | 0.16 | 0.68 | 8.50 | 50.37 | 126.10 |
| 28 | S&P 500 After 2-and-20 Hedge Fund | 6.4 | fee | 1 | 100% | 0.02 | 0.02 | 0.12 | 0.52 | 6.40 | 36.37 | 85.96 |
| 29 | S&P 500 After 2-and-20 (Underperforming) | 4.0 | fee | 1 | 100% | 0.02 | 0.02 | 0.08 | 0.33 | 4.00 | 21.67 | 48.02 |
| 30 | S&P 500 After LTCG Tax (20%) | 8.0 | tax | 1 | 100% | 0.03 | 0.03 | 0.15 | 0.64 | 8.00 | 46.93 | 115.89 |
| 31 | S&P 500 After STCG Tax (37%) | 6.3 | tax | 1 | 100% | 0.02 | 0.02 | 0.12 | 0.51 | 6.30 | 35.73 | 84.22 |
| 32 | S&P 500 After 1% Fee + LTCG Tax | 7.2 | tax | 1 | 100% | 0.03 | 0.03 | 0.13 | 0.58 | 7.20 | 41.57 | 100.42 |
| 33 | Qualified Dividends (SPYD) After 15% Tax | 6.8 | tax | 1 | 100% | 0.03 | 0.03 | 0.13 | 0.55 | 6.80 | 38.95 | 93.07 |

## 2. Cash & Savings (Compound)

| # | Name | Edge | Layer | DU/day | CED | 1 DU | 1 Day | 1 Week | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|------|-------|--------|-----|------|-------|--------|---------|--------|---------|----------|
| 1 | Money Market Fund (SPAXX/VMFXX) | 4.8 | raw | 1 | 100% | 0.02 | 0.02 | 0.09 | 0.39 | 4.80 | 26.40 | 59.71 |
| 2 | High-Yield Savings Account (Online) | 4.5 | raw | 1 | 100% | 0.02 | 0.02 | 0.08 | 0.37 | 4.50 | 24.62 | 55.30 |
| 3 | 1-Year CD (Top Rate) | 4.5 | raw | 1 | 100% | 0.02 | 0.02 | 0.08 | 0.37 | 4.50 | 24.62 | 55.30 |
| 4 | 6-Month CD | 4.3 | raw | 1 | 100% | 0.02 | 0.02 | 0.08 | 0.35 | 4.30 | 23.43 | 52.35 |
| 5 | High-Yield Money Market Account | 4.3 | raw | 1 | 100% | 0.02 | 0.02 | 0.08 | 0.35 | 4.30 | 23.43 | 52.35 |
| 6 | Cash Management Account (SoFi/Wealthfront) | 4.0 | raw | 1 | 100% | 0.02 | 0.02 | 0.08 | 0.33 | 4.00 | 21.67 | 48.02 |
| 7 | No-Penalty CD | 4.0 | raw | 1 | 100% | 0.02 | 0.02 | 0.08 | 0.33 | 4.00 | 21.67 | 48.02 |
| 8 | 3-Month CD | 4.0 | raw | 1 | 100% | 0.02 | 0.02 | 0.08 | 0.33 | 4.00 | 21.67 | 48.02 |
| 9 | 2-Year CD | 3.8 | raw | 1 | 100% | 0.01 | 0.01 | 0.07 | 0.31 | 3.80 | 20.50 | 45.20 |
| 10 | 5-Year CD | 3.5 | raw | 1 | 100% | 0.01 | 0.01 | 0.07 | 0.29 | 3.50 | 18.77 | 41.06 |
| 11 | Bank Money Market (Traditional) | 1.5 | raw | 1 | 100% | 0.01 | 0.01 | 0.03 | 0.12 | 1.50 | 7.73 | 16.05 |
| 12 | Credit Union Savings | 0.5 | raw | 1 | 100% | 0.00 | 0.00 | 0.01 | 0.04 | 0.50 | 2.53 | 5.11 |
| 13 | National Average Savings Rate | 0.45 | raw | 1 | 100% | 0.00 | 0.00 | 0.01 | 0.04 | 0.45 | 2.27 | 4.60 |
| 14 | Big Bank Savings (Chase/BofA) | 0.01 | raw | 1 | 100% | 0.00 | 0.00 | 0.00 | 0.00 | 0.01 | 0.05 | 0.10 |
| 15 | Regular Checking Account | 0.01 | raw | 1 | 100% | 0.00 | 0.00 | 0.00 | 0.00 | 0.01 | 0.05 | 0.10 |
| 16 | HYSA After Income Tax (24%) | 3.42 | tax | 1 | 100% | 0.01 | 0.01 | 0.06 | 0.28 | 3.42 | 18.32 | 39.99 |
| 17 | HYSA After Income Tax (37%) | 2.84 | tax | 1 | 100% | 0.01 | 0.01 | 0.05 | 0.23 | 2.84 | 15.03 | 32.32 |

## 3. Bonds (Compound)

| # | Name | Edge | Layer | DU/day | CED | 1 DU | 1 Day | 1 Week | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|------|-------|--------|-----|------|-------|--------|---------|--------|---------|----------|
| 1 | High-Yield Corporate (HYG/JNK) | 5.5 | raw | 1 | 100% | 0.02 | 0.02 | 0.10 | 0.45 | 5.50 | 30.70 | 70.81 |
| 2 | Convertible Bond ETF (CWB) | 5.0 | raw | 1 | 100% | 0.02 | 0.02 | 0.09 | 0.41 | 5.00 | 27.63 | 62.89 |
| 3 | Investment Grade Corporate (LQD) | 4.5 | raw | 1 | 100% | 0.02 | 0.02 | 0.08 | 0.37 | 4.50 | 24.62 | 55.30 |
| 4 | US Treasury Bills (BIL) | 4.3 | raw | 1 | 100% | 0.02 | 0.02 | 0.08 | 0.35 | 4.30 | 23.43 | 52.35 |
| 5 | Long-Term Treasury 20+ Yr (TLT) | 4.0 | raw | 1 | 100% | 0.02 | 0.02 | 0.08 | 0.33 | 4.00 | 21.67 | 48.02 |
| 6 | US Treasury 10-Year | 3.8 | raw | 1 | 100% | 0.01 | 0.01 | 0.07 | 0.31 | 3.80 | 20.50 | 45.20 |
| 7 | Total US Bond Market (BND/AGG) | 3.5 | raw | 1 | 100% | 0.01 | 0.01 | 0.07 | 0.29 | 3.50 | 18.77 | 41.06 |
| 8 | Municipal Bond Index (MUB) | 3.5 | raw | 1 | 100% | 0.01 | 0.01 | 0.07 | 0.29 | 3.50 | 18.77 | 41.06 |
| 9 | Aggregate Bond ETF (AGG) | 3.0 | raw | 1 | 100% | 0.01 | 0.01 | 0.06 | 0.25 | 3.00 | 15.93 | 34.39 |
| 10 | International Bond (BNDX) | 2.5 | raw | 1 | 100% | 0.01 | 0.01 | 0.05 | 0.21 | 2.50 | 13.14 | 28.01 |
| 11 | Short-Term Treasury (SHY) | 2.5 | raw | 1 | 100% | 0.01 | 0.01 | 0.05 | 0.21 | 2.50 | 13.14 | 28.01 |
| 12 | TIPS Inflation-Protected (TIP) | 1.5 | raw | 1 | 100% | 0.01 | 0.01 | 0.03 | 0.12 | 1.50 | 7.73 | 16.05 |
| 13 | Bond Fund After 1% Advisory Fee | 2.5 | fee | 1 | 100% | 0.01 | 0.01 | 0.05 | 0.21 | 2.50 | 13.14 | 28.01 |
| 14 | Bond Interest After Income Tax (37%) | 2.21 | tax | 1 | 100% | 0.01 | 0.01 | 0.04 | 0.18 | 2.21 | 11.55 | 24.43 |
| 15 | Muni Bonds Tax-Exempt (Effective) | 3.5 | tax | 1 | 100% | 0.01 | 0.01 | 0.07 | 0.29 | 3.50 | 18.77 | 41.06 |
| 16 | Treasury Interest After Federal Tax (24%) | 2.89 | tax | 1 | 100% | 0.01 | 0.01 | 0.05 | 0.24 | 2.89 | 15.31 | 32.96 |

## 4. Real Estate (Compound)

| # | Name | Edge | Layer | DU/day | CED | 1 DU | 1 Day | 1 Week | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|------|-------|--------|-----|------|-------|--------|---------|--------|---------|----------|
| 1 | Multi-Unit Apartments (5+ Units) | 10.0 | raw | 1 | 100% | 0.04 | 0.04 | 0.18 | 0.80 | 10.00 | 61.05 | 159.37 |
| 2 | Industrial / Warehouse | 9.0 | raw | 1 | 100% | 0.03 | 0.03 | 0.17 | 0.72 | 9.00 | 53.86 | 136.74 |
| 3 | Multi Single Family Portfolio | 8.5 | raw | 1 | 100% | 0.03 | 0.03 | 0.16 | 0.68 | 8.50 | 50.37 | 126.10 |
| 4 | Single Family Home (Buy & Hold) | 7.5 | raw | 1 | 100% | 0.03 | 0.03 | 0.14 | 0.60 | 7.50 | 43.56 | 106.10 |
| 5 | Commercial Office Space | 6.5 | raw | 1 | 100% | 0.02 | 0.02 | 0.12 | 0.53 | 6.50 | 37.01 | 87.71 |
| 6 | Retail / Strip Mall | 5.5 | raw | 1 | 100% | 0.02 | 0.02 | 0.10 | 0.45 | 5.50 | 30.70 | 70.81 |
| 7 | Vacation / Short-Term Rental | 4.0 | raw | 1 | 100% | 0.02 | 0.02 | 0.08 | 0.33 | 4.00 | 21.67 | 48.02 |
| 8 | Raw Land (Speculative) | 2.0 | raw | 1 | 100% | 0.01 | 0.01 | 0.04 | 0.17 | 2.00 | 10.41 | 21.90 |
| 9 | House Flipping (Retail Avg) | -5.0 | raw | 1 | 100% | -0.02 | -0.02 | -0.10 | -0.43 | -5.00 | -22.62 | -40.13 |
| 10 | Timeshare | -12.0 | raw | 1 | 100% | -0.05 | -0.05 | -0.25 | -1.06 | -12.00 | -47.23 | -72.15 |
| 11 | Rental Income After Ordinary Tax (37%) | 4.73 | tax | 1 | 100% | 0.02 | 0.02 | 0.09 | 0.39 | 4.73 | 26.00 | 58.75 |
| 12 | Home Sale After LTCG (w/ $250K Exclusion) | 6.75 | tax | 1 | 100% | 0.03 | 0.03 | 0.13 | 0.55 | 6.75 | 38.62 | 92.17 |

## 5. Cryptocurrency (Compound)

| # | Name | Edge | Layer | DU/day | CED | 1 DU | 1 Day | 1 Week | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|------|-------|--------|-----|------|-------|--------|---------|--------|---------|----------|
| 1 | Bitcoin Spot (Buy & Hold) | 45.0 | raw | 1 | 100% | 0.15 | 0.15 | 0.72 | 3.14 | 45.00 | 540.97 | 4,008.47 |
| 2 | Ethereum Spot (Buy & Hold) | 10.0 | raw | 1 | 100% | 0.04 | 0.04 | 0.18 | 0.80 | 10.00 | 61.05 | 159.37 |
| 3 | Stablecoin Yield Farming | 5.0 | raw | 1 | 100% | 0.02 | 0.02 | 0.09 | 0.41 | 5.00 | 27.63 | 62.89 |
| 4 | DeFi LP Major Pairs | 2.0 | raw | 1 | 100% | 0.01 | 0.01 | 0.04 | 0.17 | 2.00 | 10.41 | 21.90 |
| 5 | DeFi LP Volatile Pairs | -10.0 | raw | 1 | 100% | -0.04 | -0.04 | -0.20 | -0.87 | -10.00 | -40.95 | -65.13 |
| 6 | Altcoin Portfolio (Retail) | -15.0 | raw | 1 | 100% | -0.06 | -0.06 | -0.31 | -1.35 | -15.00 | -55.63 | -80.31 |
| 7 | Meme Coins (Retail Avg) | -70.0 | raw | 1 | 100% | -0.48 | -0.48 | -2.29 | -9.55 | -70.00 | -99.76 | -100.00 |
| 8 | Bitcoin After LTCG Tax (20%) | 36.0 | tax | 1 | 100% | 0.12 | 0.12 | 0.59 | 2.60 | 36.00 | 365.26 | 2,064.66 |
| 9 | Bitcoin After STCG Tax (37%) | 28.35 | tax | 1 | 100% | 0.10 | 0.10 | 0.48 | 2.10 | 28.35 | 248.32 | 1,113.27 |
| 10 | Ethereum After LTCG Tax (20%) | 8.0 | tax | 1 | 100% | 0.03 | 0.03 | 0.15 | 0.64 | 8.00 | 46.93 | 115.89 |

## 6. Collectibles (Compound)

| # | Name | Edge | Layer | DU/day | CED | 1 DU | 1 Day | 1 Week | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|------|-------|--------|-----|------|-------|--------|---------|--------|---------|----------|
| 1 | Vintage Sports Cards (PSA 10) | 6.0 | raw | 1 | 100% | 0.02 | 0.02 | 0.11 | 0.49 | 6.00 | 33.82 | 79.08 |
| 2 | Fine Art (Blue Chip / Old Masters) | 5.0 | raw | 1 | 100% | 0.02 | 0.02 | 0.09 | 0.41 | 5.00 | 27.63 | 62.89 |
| 3 | Fine Wine (Investment Grade) | 4.0 | raw | 1 | 100% | 0.02 | 0.02 | 0.08 | 0.33 | 4.00 | 21.67 | 48.02 |
| 4 | Classic Cars (Pre-1970) | 3.5 | raw | 1 | 100% | 0.01 | 0.01 | 0.07 | 0.29 | 3.50 | 18.77 | 41.06 |
| 5 | Luxury Watches (Rolex/Patek) | 3.0 | raw | 1 | 100% | 0.01 | 0.01 | 0.06 | 0.25 | 3.00 | 15.93 | 34.39 |
| 6 | Precious Coins (Numismatic) | 1.5 | raw | 1 | 100% | 0.01 | 0.01 | 0.03 | 0.12 | 1.50 | 7.73 | 16.05 |
| 7 | Sneaker Reselling (Retail Avg) | -5.0 | raw | 1 | 100% | -0.02 | -0.02 | -0.10 | -0.43 | -5.00 | -22.62 | -40.13 |
| 8 | Modern Art Speculation | -10.0 | raw | 1 | 100% | -0.04 | -0.04 | -0.20 | -0.87 | -10.00 | -40.95 | -65.13 |
| 9 | Non-Vintage Trading Cards | -15.0 | raw | 1 | 100% | -0.06 | -0.06 | -0.31 | -1.35 | -15.00 | -55.63 | -80.31 |
| 10 | NFT Art & Digital Collectibles | -50.0 | raw | 1 | 100% | -0.27 | -0.27 | -1.32 | -5.61 | -50.00 | -96.88 | -99.90 |
| 11 | Collectibles After 28% Tax Rate | 4.32 | tax | 1 | 100% | 0.02 | 0.02 | 0.08 | 0.35 | 4.32 | 23.55 | 52.64 |

## 7. Sports Betting (Linear)

| # | Name | Edge | Layer | DU/day | CED | 1 DU | 1 Day | 1 Week | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|------|-------|--------|-----|------|-------|--------|---------|--------|---------|----------|
| 1 | Single Game Spread (-110) | -4.55 | raw | 2 | 3% | -0.14 | -0.27 | -1.91 | -8.19 | -99.64 | -498.22 | -996.45 |
| 2 | Single Game O/U (-110) | -4.55 | raw | 2 | 3% | -0.14 | -0.27 | -1.91 | -8.19 | -99.64 | -498.22 | -996.45 |
| 3 | Moneyline (Standard Juice) | -4.55 | raw | 2 | 3% | -0.14 | -0.27 | -1.91 | -8.19 | -99.64 | -498.22 | -996.45 |
| 4 | Teaser 2-Team 6pt | -5.0 | raw | 1 | 3% | -0.15 | -0.15 | -1.05 | -4.50 | -54.75 | -273.75 | -547.50 |
| 5 | Live / In-Game Bet | -6.5 | raw | 5 | 3% | -0.20 | -0.97 | -6.83 | -29.25 | -355.88 | -1,779.38 | -3,558.75 |
| 6 | Player Prop Bet | -7.0 | raw | 3 | 2% | -0.14 | -0.42 | -2.94 | -12.60 | -153.30 | -766.50 | -1,533.00 |
| 7 | Season Win Total Future | -8.0 | raw | 0.05 | 5% | -0.40 | -0.02 | -0.14 | -0.60 | -7.30 | -36.50 | -73.00 |
| 8 | 2-Team Parlay | -10.0 | raw | 2 | 2% | -0.20 | -0.40 | -2.80 | -12.00 | -146.00 | -730.00 | -1,460.00 |
| 9 | Championship Future | -12.0 | raw | 0.03 | 5% | -0.60 | -0.02 | -0.13 | -0.54 | -6.57 | -32.85 | -65.70 |
| 10 | 3-Team Parlay | -12.5 | raw | 1 | 2% | -0.25 | -0.25 | -1.75 | -7.50 | -91.25 | -456.25 | -912.50 |
| 11 | 4-Team Parlay | -15.0 | raw | 1 | 1% | -0.15 | -0.15 | -1.05 | -4.50 | -54.75 | -273.75 | -547.50 |
| 12 | Same-Game Parlay (SGP) | -15.0 | raw | 2 | 2% | -0.30 | -0.60 | -4.20 | -18.00 | -219.00 | -1,095.00 | -2,190.00 |
| 13 | First Touchdown Scorer | -18.0 | raw | 1 | 1% | -0.18 | -0.18 | -1.26 | -5.40 | -65.70 | -328.50 | -657.00 |
| 14 | 5-Team Parlay | -20.0 | raw | 0.5 | 1% | -0.20 | -0.10 | -0.70 | -3.00 | -36.50 | -182.50 | -365.00 |
| 15 | Correct Score (Soccer) | -20.0 | raw | 0.5 | 1% | -0.20 | -0.10 | -0.70 | -3.00 | -36.50 | -182.50 | -365.00 |
| 16 | 6-Team Parlay | -25.0 | raw | 0.3 | 1% | -0.25 | -0.07 | -0.53 | -2.25 | -27.38 | -136.88 | -273.75 |
| 17 | 8-Team Parlay | -30.0 | raw | 0.2 | 1% | -0.30 | -0.06 | -0.42 | -1.80 | -21.90 | -109.50 | -219.00 |
| 18 | 10-Team Parlay | -35.0 | raw | 0.1 | 0.5% | -0.18 | -0.02 | -0.12 | -0.53 | -6.39 | -31.94 | -63.88 |

## 8. Casino Gambling (Linear)

| # | Name | Edge | Layer | DU/day | CED | 1 DU | 1 Day | 1 Week | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|------|-------|--------|-----|------|-------|--------|---------|--------|---------|----------|
| 1 | Video Poker 9/6 JoB | -0.46 | raw | 80 | 1% | -0.00 | -0.37 | -2.58 | -11.04 | -134.32 | -671.60 | -1,343.20 |
| 3 | Blackjack 3:2 Basic Strategy | -0.5 | raw | 60 | 2% | -0.01 | -0.60 | -4.20 | -18.00 | -219.00 | -1,095.00 | -2,190.00 |
| 4 | Baccarat Banker | -1.06 | raw | 50 | 3% | -0.03 | -1.59 | -11.13 | -47.70 | -580.35 | -2,901.75 | -5,803.50 |
| 5 | Baccarat Player | -1.24 | raw | 50 | 3% | -0.04 | -1.86 | -13.02 | -55.80 | -678.90 | -3,394.50 | -6,789.00 |
| 6 | Craps Don't Pass | -1.36 | raw | 40 | 2% | -0.03 | -1.09 | -7.62 | -32.64 | -397.12 | -1,985.60 | -3,971.20 |
| 7 | Craps Pass Line | -1.41 | raw | 40 | 2% | -0.03 | -1.13 | -7.90 | -33.84 | -411.72 | -2,058.60 | -4,117.20 |
| 8 | Blackjack 6:5 | -2.0 | raw | 60 | 2% | -0.04 | -2.40 | -16.80 | -72.00 | -876.00 | -4,380.00 | -8,760.00 |
| 9 | Pai Gow Poker | -2.5 | raw | 30 | 3% | -0.07 | -2.25 | -15.75 | -67.50 | -821.25 | -4,106.25 | -8,212.50 |
| 10 | Roulette Single Zero | -2.7 | raw | 40 | 3% | -0.08 | -3.24 | -22.68 | -97.20 | -1,182.60 | -5,913.00 | -11,826.00 |
| 11 | Three Card Poker | -3.4 | raw | 40 | 3% | -0.10 | -4.08 | -28.56 | -122.40 | -1,489.20 | -7,446.00 | -14,892.00 |
| 12 | Let It Ride | -3.5 | raw | 30 | 3% | -0.10 | -3.15 | -22.05 | -94.50 | -1,149.75 | -5,748.75 | -11,497.50 |
| 13 | Slots Loose 95% | -5.0 | raw | 500 | 0.5% | -0.03 | -12.50 | -87.50 | -375.00 | -4,562.50 | -22,812.50 | -45,625.00 |
| 14 | Caribbean Stud | -5.2 | raw | 30 | 3% | -0.16 | -4.68 | -32.76 | -140.40 | -1,708.20 | -8,541.00 | -17,082.00 |
| 15 | Roulette Double Zero | -5.26 | raw | 40 | 3% | -0.16 | -6.31 | -44.18 | -189.36 | -2,303.88 | -11,519.40 | -23,038.80 |
| 16 | Slots Average 92% | -8.0 | raw | 500 | 0.5% | -0.04 | -20.00 | -140.00 | -600.00 | -7,300.00 | -36,500.00 | -73,000.00 |
| 17 | Slots Tight 85% | -15.0 | raw | 500 | 0.5% | -0.07 | -37.50 | -262.50 | -1,125.00 | -13,687.50 | -68,437.50 | -136,875.00 |
| 18 | Big Six Wheel | -16.0 | raw | 20 | 2% | -0.32 | -6.40 | -44.80 | -192.00 | -2,336.00 | -11,680.00 | -23,360.00 |
| 19 | Keno 4-Spot | -28.0 | raw | 10 | 1% | -0.28 | -2.80 | -19.60 | -84.00 | -1,022.00 | -5,110.00 | -10,220.00 |
| 20 | Keno 10-Spot | -35.0 | raw | 10 | 1% | -0.35 | -3.50 | -24.50 | -105.00 | -1,277.50 | -6,387.50 | -12,775.00 |

## 9. Poker & Skill-Based (Linear)

| # | Name | Edge | Layer | DU/day | CED | 1 DU | 1 Day | 1 Week | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|------|-------|--------|-----|------|-------|--------|---------|--------|---------|----------|
| 1 | DFS Top 5% | 5.0 | raw | 5 | 5% | 0.25 | 1.25 | 8.75 | 37.50 | 456.25 | 2,281.25 | 4,562.50 |
| 3 | Poker Skilled Tournaments | 2.0 | raw | 5 | 10% | 0.20 | 1.00 | 7.00 | 30.00 | 365.00 | 1,825.00 | 3,650.00 |
| 4 | Poker Mid-Stakes Reg | 1.5 | raw | 40 | 2% | 0.03 | 1.20 | 8.40 | 36.00 | 438.00 | 2,190.00 | 4,380.00 |
| 5 | Poker Average Live Cash | -5.0 | raw | 25 | 3% | -0.15 | -3.75 | -26.25 | -112.50 | -1,368.75 | -6,843.75 | -13,687.50 |
| 6 | Poker Average Online | -8.0 | raw | 40 | 2% | -0.16 | -6.40 | -44.80 | -192.00 | -2,336.00 | -11,680.00 | -23,360.00 |
| 7 | Poker Recreational Live | -10.0 | raw | 25 | 3% | -0.30 | -7.50 | -52.50 | -225.00 | -2,737.50 | -13,687.50 | -27,375.00 |
| 8 | DFS Average | -12.0 | raw | 5 | 5% | -0.60 | -3.00 | -21.00 | -90.00 | -1,095.00 | -5,475.00 | -10,950.00 |
| 9 | Poker Sit & Go Average | -15.0 | raw | 5 | 5% | -0.75 | -3.75 | -26.25 | -112.50 | -1,368.75 | -6,843.75 | -13,687.50 |
| 10 | DFS Casual | -20.0 | raw | 3 | 5% | -1.00 | -3.00 | -21.00 | -90.00 | -1,095.00 | -5,475.00 | -10,950.00 |

## 10. Prediction Markets (Linear)

| # | Name | Edge | Layer | DU/day | CED | 1 DU | 1 Day | 1 Week | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|------|-------|--------|-----|------|-------|--------|---------|--------|---------|----------|
| 1 | Polymarket Elections | -3.0 | raw | 1 | 5% | -0.15 | -0.15 | -1.05 | -4.50 | -54.75 | -273.75 | -547.50 |
| 2 | Polymarket SCOTUS | -3.0 | raw | 0.5 | 5% | -0.15 | -0.08 | -0.53 | -2.25 | -27.38 | -136.88 | -273.75 |
| 3 | Metaculus Scientific | -3.5 | raw | 1 | 3% | -0.10 | -0.10 | -0.73 | -3.15 | -38.32 | -191.62 | -383.25 |
| 4 | Polymarket Oscars | -4.0 | raw | 0.5 | 3% | -0.12 | -0.06 | -0.42 | -1.80 | -21.90 | -109.50 | -219.00 |
| 5 | Polymarket Geopolitics | -4.0 | raw | 0.5 | 3% | -0.12 | -0.06 | -0.42 | -1.80 | -21.90 | -109.50 | -219.00 |
| 6 | Polymarket Sports/Entertainment | -4.5 | raw | 1 | 3% | -0.14 | -0.14 | -0.94 | -4.05 | -49.27 | -246.38 | -492.75 |
| 7 | Polymarket Crypto Prices | -5.0 | raw | 2 | 3% | -0.15 | -0.30 | -2.10 | -9.00 | -109.50 | -547.50 | -1,095.00 |
| 8 | Kalshi Economic | -5.5 | raw | 0.5 | 3% | -0.16 | -0.08 | -0.58 | -2.47 | -30.11 | -150.56 | -301.12 |
| 9 | Kalshi Fed Rate | -5.5 | raw | 0.2 | 5% | -0.28 | -0.06 | -0.39 | -1.65 | -20.08 | -100.38 | -200.75 |
| 10 | Kalshi GDP | -6.0 | raw | 0.2 | 5% | -0.30 | -0.06 | -0.42 | -1.80 | -21.90 | -109.50 | -219.00 |
| 11 | Kalshi Weather | -7.0 | raw | 0.5 | 2% | -0.14 | -0.07 | -0.49 | -2.10 | -25.55 | -127.75 | -255.50 |
| 12 | PredictIt US Politics | -10.0 | raw | 1 | 5% | -0.50 | -0.50 | -3.50 | -15.00 | -182.50 | -912.50 | -1,825.00 |

## 11. Lottery (Linear)

| # | Name | Edge | Layer | DU/day | CED | 1 DU | 1 Day | 1 Week | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|------|-------|--------|-----|------|-------|--------|---------|--------|---------|----------|
| 1 | $1 Scratch-Off Best Odds | -25.0 | raw | 1 | 0.5% | -0.12 | -0.12 | -0.88 | -3.75 | -45.62 | -228.12 | -456.25 |
| 2 | Premium Scratch-Off $20+ | -30.0 | raw | 0.5 | 1% | -0.30 | -0.15 | -1.05 | -4.50 | -54.75 | -273.75 | -547.50 |
| 3 | Scratch-Off Tickets Avg | -35.0 | raw | 0.5 | 0.5% | -0.18 | -0.09 | -0.61 | -2.62 | -31.94 | -159.69 | -319.38 |
| 4 | Keno State-Run | -40.0 | raw | 2 | 0.5% | -0.20 | -0.40 | -2.80 | -12.00 | -146.00 | -730.00 | -1,460.00 |
| 5 | Daily Numbers Game | -42.0 | raw | 1 | 0.5% | -0.21 | -0.21 | -1.47 | -6.30 | -76.65 | -383.25 | -766.50 |
| 6 | State Pick 6 / Lotto | -45.0 | raw | 0.15 | 0.1% | -0.04 | -0.01 | -0.05 | -0.20 | -2.46 | -12.32 | -24.64 |
| 7 | State Lottery Pick 3/4 | -50.0 | raw | 0.5 | 0.3% | -0.15 | -0.07 | -0.53 | -2.25 | -27.38 | -136.88 | -273.75 |
| 8 | Powerball / Mega Millions | -52.0 | raw | 0.1 | 0.1% | -0.05 | -0.01 | -0.04 | -0.16 | -1.90 | -9.49 | -18.98 |
| 9 | Multi-State Cash4Life | -55.0 | raw | 0.1 | 0.1% | -0.06 | -0.01 | -0.04 | -0.17 | -2.01 | -10.04 | -20.07 |

---

## Summary

| Category | Model | Raw | Fee | Tax | Total |
|----------|-------|-----|-----|-----|-------|
| Stock Market | Compound | 22 | 7 | 4 | 33 |
| Cash & Savings | Compound | 15 | 0 | 2 | 17 |
| Bonds | Compound | 12 | 1 | 3 | 16 |
| Real Estate | Compound | 10 | 0 | 2 | 12 |
| Cryptocurrency | Compound | 7 | 0 | 3 | 10 |
| Collectibles | Compound | 10 | 0 | 1 | 11 |
| Sports Betting | Linear (DU/CED) | 18 | 0 | 0 | 18 |
| Casino Gambling | Linear (DU/CED) | 19 | 0 | 0 | 19 |
| Poker & Skill-Based | Linear (DU/CED) | 9 | 0 | 0 | 9 |
| Prediction Markets | Linear (DU/CED) | 12 | 0 | 0 | 12 |
| Lottery | Linear (DU/CED) | 9 | 0 | 0 | 9 |
| **Total** | | **143** | **8** | **15** | **166** |

## DU/CED Reference Table

| Category | Activity Example | DU/day | CED | Rationale |
|----------|-----------------|--------|-----|-----------|
| Stock Market | Index investing | 1 | 100% | Fully invested, continuous |
| Sports Betting | Spread bets | 2 | 3% | Couple bets per day, disciplined sizing |
| Casino Gambling | Blackjack | 60 | 2% | 60 hands/day, standard bet sizing |
| Casino Gambling | Slots | 500 | 0.5% | Very high frequency, tiny per spin |
| Poker | Tournaments | 5 | 10% | Moderate frequency, larger buy-in relative to roll |
| Poker | Online average | 40 | 2% | High volume, smaller stakes per hand |
| Prediction Markets | Polymarket | 1 | 5% | One position per day, moderate sizing |
| Lottery | Powerball | 0.1 | 0.1% | Very infrequent, $2 ticket on large bankroll |
