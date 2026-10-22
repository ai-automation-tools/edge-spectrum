# Edge Spectrum V9 -- Complete Data Set (180 Points)

**Version:** 9.0
**Date:** March 27, 2026
**Data Points:** 180
**Categories:** 12

---

## V9 Changes

- **New 7-horizon time model** replacing the previous 5-horizon model
- Investing (Compound) horizons: 1 Trade, 1 Day, 1 Week, 1 Month, 1 Year, 5 Years, 10 Years
- Gambling (Linear) horizons: 1 Bet, 1 Day, 1 Week, 1 Month, 1 Year, 5 Years, 10 Years
- Compound formula: `((1 + annual/100)^years - 1) * 100`
  - 1 Trade / 1 Day: years = 1/252
  - 1 Week: years = 1/52
  - 1 Month: years = 1/12
  - 1 Year: years = 1
  - 5 Years: years = 5
  - 10 Years: years = 10
- Linear formula: `N * 0.10 * edge_per_bet`
  - 1 Bet: N=1, 1 Day: N=2, 1 Week: N=12, 1 Month: N=52, 1 Year: N=625, 5 Years: N=3125, 10 Years: N=6250
- 180 total data points across 12 categories
- All values rounded to 2 decimal places

---

## 1. Stock Market (Compound)

| # | Name | Edge (a%) | Layer | 1 Trade | 1 Day | 1 Week | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|-----------|-------|---------|-------|--------|---------|--------|---------|----------|
| 1 | NASDAQ 100 (QQQ) | 12.5 | raw | 0.05 | 0.05 | 0.23 | 0.99 | 12.50 | 80.20 | 224.73 |
| 2 | S&P 500 Growth (IVW) | 12.0 | raw | 0.04 | 0.04 | 0.22 | 0.95 | 12.00 | 76.23 | 210.58 |
| 3 | Small-Cap Value (VBR) | 11.5 | raw | 0.04 | 0.04 | 0.21 | 0.91 | 11.50 | 72.34 | 196.99 |
| 4 | S&P MidCap 400 (MDY) | 11.0 | raw | 0.04 | 0.04 | 0.20 | 0.87 | 11.00 | 68.51 | 183.94 |
| 5 | Dividend Aristocrats (NOBL) | 10.5 | raw | 0.04 | 0.04 | 0.19 | 0.84 | 10.50 | 64.74 | 171.41 |
| 6 | Total US Stock Market (VTI) | 10.2 | raw | 0.04 | 0.04 | 0.19 | 0.81 | 10.20 | 62.52 | 164.13 |
| 7 | S&P 500 Index (SPY/VOO) | 10.0 | raw | 0.04 | 0.04 | 0.18 | 0.80 | 10.00 | 61.05 | 159.37 |
| 8 | S&P 500 Equal Weight (RSP) | 10.0 | raw | 0.04 | 0.04 | 0.18 | 0.80 | 10.00 | 61.05 | 159.37 |
| 9 | Dow Jones Industrial (DIA) | 9.5 | raw | 0.04 | 0.04 | 0.17 | 0.76 | 9.50 | 57.42 | 147.82 |
| 10 | S&P 500 Value (IVE) | 9.5 | raw | 0.04 | 0.04 | 0.17 | 0.76 | 9.50 | 57.42 | 147.82 |
| 11 | Russell 2000 Small Cap (IWM) | 8.5 | raw | 0.03 | 0.03 | 0.16 | 0.68 | 8.50 | 50.37 | 126.10 |
| 12 | REIT Index ETF (VNQ) | 8.0 | raw | 0.03 | 0.03 | 0.15 | 0.64 | 8.00 | 46.93 | 115.89 |
| 13 | S&P 500 High Dividend (SPYD) | 8.0 | raw | 0.03 | 0.03 | 0.15 | 0.64 | 8.00 | 46.93 | 115.89 |
| 14 | DAX Germany Index | 7.5 | raw | 0.03 | 0.03 | 0.14 | 0.60 | 7.50 | 43.56 | 106.10 |
| 15 | Nikkei 225 Japan Index | 7.0 | raw | 0.03 | 0.03 | 0.13 | 0.57 | 7.00 | 40.26 | 96.72 |
| 16 | MSCI EAFE Intl Developed (EFA) | 5.5 | raw | 0.02 | 0.02 | 0.10 | 0.45 | 5.50 | 30.70 | 70.81 |
| 17 | FTSE 100 UK Index | 5.0 | raw | 0.02 | 0.02 | 0.09 | 0.41 | 5.00 | 27.63 | 62.89 |
| 18 | MSCI Emerging Markets (EEM) | 4.0 | raw | 0.02 | 0.02 | 0.08 | 0.33 | 4.00 | 21.67 | 48.02 |
| 19 | Gold / Precious Metals (GLD) | 2.0 | raw | 0.01 | 0.01 | 0.04 | 0.17 | 2.00 | 10.41 | 21.90 |
| 20 | Commodity Index (DJP) | 1.0 | raw | 0.00 | 0.00 | 0.02 | 0.08 | 1.00 | 5.10 | 10.46 |
| 21 | Individual Stock Picking (Retail) | -2.0 | raw | -0.01 | -0.01 | -0.04 | -0.17 | -2.00 | -9.61 | -18.29 |
| 22 | Penny Stocks (Retail Avg) | -30.0 | raw | -0.14 | -0.14 | -0.68 | -2.93 | -30.00 | -83.19 | -97.18 |
| 23 | S&P 500 After 0.03% Index Fee | 9.97 | fee | 0.04 | 0.04 | 0.18 | 0.80 | 9.97 | 60.83 | 158.67 |
| 24 | S&P 500 After 0.35% Robo-Advisor | 9.65 | fee | 0.04 | 0.04 | 0.18 | 0.77 | 9.65 | 58.51 | 151.24 |
| 25 | S&P 500 After 0.60% Target-Date Fund | 9.4 | fee | 0.04 | 0.04 | 0.17 | 0.75 | 9.40 | 56.71 | 145.57 |
| 26 | S&P 500 After 1% Advisory Fee | 9.0 | fee | 0.03 | 0.03 | 0.17 | 0.72 | 9.00 | 53.86 | 136.74 |
| 27 | S&P 500 After 1.5% Active Mutual Fund | 8.5 | fee | 0.03 | 0.03 | 0.16 | 0.68 | 8.50 | 50.37 | 126.10 |
| 28 | S&P 500 After 2-and-20 Hedge Fund | 6.4 | fee | 0.02 | 0.02 | 0.12 | 0.52 | 6.40 | 36.37 | 85.96 |
| 29 | S&P 500 After 2-and-20 (Underperforming) | 4.0 | fee | 0.02 | 0.02 | 0.08 | 0.33 | 4.00 | 21.67 | 48.02 |
| 30 | S&P 500 After LTCG Tax (20%) | 8.0 | tax | 0.03 | 0.03 | 0.15 | 0.64 | 8.00 | 46.93 | 115.89 |
| 31 | S&P 500 After STCG Tax (37%) | 6.3 | tax | 0.02 | 0.02 | 0.12 | 0.51 | 6.30 | 35.73 | 84.22 |
| 32 | S&P 500 After 1% Fee + LTCG Tax | 7.2 | tax | 0.03 | 0.03 | 0.13 | 0.58 | 7.20 | 41.57 | 100.42 |
| 33 | Qualified Dividends (SPYD) After 15% Tax | 6.8 | tax | 0.03 | 0.03 | 0.13 | 0.55 | 6.80 | 38.95 | 93.07 |

## 2. Bonds (Compound)

| # | Name | Edge (a%) | Layer | 1 Trade | 1 Day | 1 Week | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|-----------|-------|---------|-------|--------|---------|--------|---------|----------|
| 1 | High-Yield Corporate (HYG/JNK) | 5.5 | raw | 0.02 | 0.02 | 0.10 | 0.45 | 5.50 | 30.70 | 70.81 |
| 2 | Convertible Bond ETF (CWB) | 5.0 | raw | 0.02 | 0.02 | 0.09 | 0.41 | 5.00 | 27.63 | 62.89 |
| 3 | Investment Grade Corporate (LQD) | 4.5 | raw | 0.02 | 0.02 | 0.08 | 0.37 | 4.50 | 24.62 | 55.30 |
| 4 | US Treasury Bills (BIL) | 4.3 | raw | 0.02 | 0.02 | 0.08 | 0.35 | 4.30 | 23.43 | 52.35 |
| 5 | Long-Term Treasury 20+ Yr (TLT) | 4.0 | raw | 0.02 | 0.02 | 0.08 | 0.33 | 4.00 | 21.67 | 48.02 |
| 6 | US Treasury 10-Year | 3.8 | raw | 0.01 | 0.01 | 0.07 | 0.31 | 3.80 | 20.50 | 45.20 |
| 7 | Total US Bond Market (BND/AGG) | 3.5 | raw | 0.01 | 0.01 | 0.07 | 0.29 | 3.50 | 18.77 | 41.06 |
| 8 | Municipal Bond Index (MUB) | 3.5 | raw | 0.01 | 0.01 | 0.07 | 0.29 | 3.50 | 18.77 | 41.06 |
| 9 | Aggregate Bond ETF (AGG) | 3.0 | raw | 0.01 | 0.01 | 0.06 | 0.25 | 3.00 | 15.93 | 34.39 |
| 10 | International Bond (BNDX) | 2.5 | raw | 0.01 | 0.01 | 0.05 | 0.21 | 2.50 | 13.14 | 28.01 |
| 11 | Short-Term Treasury (SHY) | 2.5 | raw | 0.01 | 0.01 | 0.05 | 0.21 | 2.50 | 13.14 | 28.01 |
| 12 | TIPS Inflation-Protected (TIP) | 1.5 | raw | 0.01 | 0.01 | 0.03 | 0.12 | 1.50 | 7.73 | 16.05 |
| 13 | Bond Fund After 1% Advisory Fee | 2.5 | fee | 0.01 | 0.01 | 0.05 | 0.21 | 2.50 | 13.14 | 28.01 |
| 14 | Bond Interest After Income Tax (37%) | 2.21 | tax | 0.01 | 0.01 | 0.04 | 0.18 | 2.21 | 11.55 | 24.43 |
| 15 | Muni Bonds Tax-Exempt (Effective) | 3.5 | tax | 0.01 | 0.01 | 0.07 | 0.29 | 3.50 | 18.77 | 41.06 |
| 16 | Treasury Interest After Federal Tax (24%) | 2.89 | tax | 0.01 | 0.01 | 0.05 | 0.24 | 2.89 | 15.31 | 32.96 |

## 3. Real Estate (Compound)

| # | Name | Edge (a%) | Layer | 1 Trade | 1 Day | 1 Week | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|-----------|-------|---------|-------|--------|---------|--------|---------|----------|
| 1 | Multi-Unit Apartments (5+ Units) | 10.0 | raw | 0.04 | 0.04 | 0.18 | 0.80 | 10.00 | 61.05 | 159.37 |
| 2 | Industrial / Warehouse | 9.0 | raw | 0.03 | 0.03 | 0.17 | 0.72 | 9.00 | 53.86 | 136.74 |
| 3 | Multi Single Family Portfolio | 8.5 | raw | 0.03 | 0.03 | 0.16 | 0.68 | 8.50 | 50.37 | 126.10 |
| 4 | Single Family Home (Buy & Hold) | 7.5 | raw | 0.03 | 0.03 | 0.14 | 0.60 | 7.50 | 43.56 | 106.10 |
| 5 | Commercial Office Space | 6.5 | raw | 0.02 | 0.02 | 0.12 | 0.53 | 6.50 | 37.01 | 87.71 |
| 6 | Retail / Strip Mall | 5.5 | raw | 0.02 | 0.02 | 0.10 | 0.45 | 5.50 | 30.70 | 70.81 |
| 7 | Vacation / Short-Term Rental | 4.0 | raw | 0.02 | 0.02 | 0.08 | 0.33 | 4.00 | 21.67 | 48.02 |
| 8 | Raw Land (Speculative) | 2.0 | raw | 0.01 | 0.01 | 0.04 | 0.17 | 2.00 | 10.41 | 21.90 |
| 9 | House Flipping (Retail Avg) | -5.0 | raw | -0.02 | -0.02 | -0.10 | -0.43 | -5.00 | -22.62 | -40.13 |
| 10 | Timeshare | -12.0 | raw | -0.05 | -0.05 | -0.25 | -1.06 | -12.00 | -47.23 | -72.15 |
| 11 | Rental Income After Ordinary Tax (37%) | 4.73 | tax | 0.02 | 0.02 | 0.09 | 0.39 | 4.73 | 26.00 | 58.75 |
| 12 | Home Sale After LTCG (w/ $250K Exclusion) | 6.75 | tax | 0.03 | 0.03 | 0.13 | 0.55 | 6.75 | 38.62 | 92.17 |

## 4. Cryptocurrency (Compound)

| # | Name | Edge (a%) | Layer | 1 Trade | 1 Day | 1 Week | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|-----------|-------|---------|-------|--------|---------|--------|---------|----------|
| 1 | Bitcoin Spot (Buy & Hold) | 45.0 | raw | 0.15 | 0.15 | 0.72 | 3.14 | 45.00 | 540.97 | 4,008.47 |
| 2 | Ethereum Spot (Buy & Hold) | 10.0 | raw | 0.04 | 0.04 | 0.18 | 0.80 | 10.00 | 61.05 | 159.37 |
| 3 | Stablecoin Yield Farming | 5.0 | raw | 0.02 | 0.02 | 0.09 | 0.41 | 5.00 | 27.63 | 62.89 |
| 4 | DeFi LP Major Pairs | 2.0 | raw | 0.01 | 0.01 | 0.04 | 0.17 | 2.00 | 10.41 | 21.90 |
| 5 | DeFi LP Volatile Pairs | -10.0 | raw | -0.04 | -0.04 | -0.20 | -0.87 | -10.00 | -40.95 | -65.13 |
| 6 | Altcoin Portfolio (Retail) | -15.0 | raw | -0.06 | -0.06 | -0.31 | -1.35 | -15.00 | -55.63 | -80.31 |
| 7 | Meme Coins (Retail Avg) | -70.0 | raw | -0.48 | -0.48 | -2.29 | -9.55 | -70.00 | -99.76 | -100.00 |
| 8 | Bitcoin After LTCG Tax (20%) | 36.0 | tax | 0.12 | 0.12 | 0.59 | 2.60 | 36.00 | 365.26 | 2,064.66 |
| 9 | Bitcoin After STCG Tax (37%) | 28.35 | tax | 0.10 | 0.10 | 0.48 | 2.10 | 28.35 | 248.32 | 1,113.27 |
| 10 | Ethereum After LTCG Tax (20%) | 8.0 | tax | 0.03 | 0.03 | 0.15 | 0.64 | 8.00 | 46.93 | 115.89 |

## 5. Options & Derivatives (Mixed)

### Compound Entries

| # | Name | Edge (a%) | Layer | 1 Trade | 1 Day | 1 Week | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|-----------|-------|---------|-------|--------|---------|--------|---------|----------|
| 1 | Iron Condor Selling | 10.0 | raw | 0.04 | 0.04 | 0.18 | 0.80 | 10.00 | 61.05 | 159.37 |
| 2 | Cash-Secured Put Selling | 8.0 | raw | 0.03 | 0.03 | 0.15 | 0.64 | 8.00 | 46.93 | 115.89 |
| 3 | Covered Call Writing | 7.0 | raw | 0.03 | 0.03 | 0.13 | 0.57 | 7.00 | 40.26 | 96.72 |
| 4 | Managed Futures / CTA | 3.0 | raw | 0.01 | 0.01 | 0.06 | 0.25 | 3.00 | 15.93 | 34.39 |
| 11 | Iron Condor After STCG Tax (37%) | 6.3 | tax | 0.02 | 0.02 | 0.12 | 0.51 | 6.30 | 35.73 | 84.22 |
| 12 | Cash-Secured Put After STCG Tax (37%) | 5.04 | tax | 0.02 | 0.02 | 0.09 | 0.41 | 5.04 | 27.87 | 63.51 |
| 13 | Covered Call After STCG Tax (37%) | 4.41 | tax | 0.02 | 0.02 | 0.08 | 0.36 | 4.41 | 24.08 | 53.96 |
| 14 | Managed Futures After 60/40 Tax (26.8%) | 2.2 | tax | 0.01 | 0.01 | 0.04 | 0.18 | 2.20 | 11.49 | 24.31 |

### Linear Entries

| # | Name | Edge (e%) | Layer | 1 Bet | 1 Day | 1 Week | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|-----------|-------|-------|-------|--------|---------|--------|---------|----------|
| 5 | Commodity Futures (Retail) | -8.0 | raw | -0.80 | -1.60 | -9.60 | -41.60 | -500.00 | -2,500.00 | -5,000.00 |
| 6 | ATM Options Buying (30-Day) | -15.0 | raw | -1.50 | -3.00 | -18.00 | -78.00 | -937.50 | -4,687.50 | -9,375.00 |
| 7 | Leveraged Futures Day Trading | -25.0 | raw | -2.50 | -5.00 | -30.00 | -130.00 | -1,562.50 | -7,812.50 | -15,625.00 |
| 8 | OTM Options Buying (30-Day) | -35.0 | raw | -3.50 | -7.00 | -42.00 | -182.00 | -2,187.50 | -10,937.50 | -21,875.00 |
| 9 | 0DTE Options (Retail Avg) | -50.0 | raw | -5.00 | -10.00 | -60.00 | -260.00 | -3,125.00 | -15,625.00 | -31,250.00 |
| 10 | Deep OTM Weekly Options | -60.0 | raw | -6.00 | -12.00 | -72.00 | -312.00 | -3,750.00 | -18,750.00 | -37,500.00 |

## 6. Active Trading (Compound)

| # | Name | Edge (a%) | Layer | 1 Trade | 1 Day | 1 Week | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|-----------|-------|---------|-------|--------|---------|--------|---------|----------|
| 1 | Systematic Trend Following | 5.0 | raw | 0.02 | 0.02 | 0.09 | 0.41 | 5.00 | 27.63 | 62.89 |
| 2 | Social/Copy Trading (Retail) | -12.0 | raw | -0.05 | -0.05 | -0.25 | -1.06 | -12.00 | -47.23 | -72.15 |
| 3 | Momentum Trading (Retail) | -18.0 | raw | -0.08 | -0.08 | -0.38 | -1.64 | -18.00 | -62.93 | -86.26 |
| 4 | Retail Forex Trading | -25.0 | raw | -0.11 | -0.11 | -0.55 | -2.37 | -25.00 | -76.27 | -94.37 |
| 5 | CFD Trading (Retail, Leveraged) | -28.0 | raw | -0.13 | -0.13 | -0.63 | -2.70 | -28.00 | -80.65 | -96.26 |
| 6 | Retail Day Trading | -30.0 | raw | -0.14 | -0.14 | -0.68 | -2.93 | -30.00 | -83.19 | -97.18 |
| 7 | Crypto Day Trading (Retail) | -35.0 | raw | -0.17 | -0.17 | -0.83 | -3.53 | -35.00 | -88.40 | -98.65 |
| 8 | Binary Options (Retail) | -40.0 | raw | -0.20 | -0.20 | -0.98 | -4.17 | -40.00 | -92.22 | -99.40 |
| 9 | Trend Following After STCG Tax (37%) | 3.15 | tax | 0.01 | 0.01 | 0.06 | 0.26 | 3.15 | 16.77 | 36.36 |
| 10 | Day Trading After Income Tax (37%) | -30.0 | tax | -0.14 | -0.14 | -0.68 | -2.93 | -30.00 | -83.19 | -97.18 |

## 7. Collectibles (Compound)

| # | Name | Edge (a%) | Layer | 1 Trade | 1 Day | 1 Week | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|-----------|-------|---------|-------|--------|---------|--------|---------|----------|
| 1 | Vintage Sports Cards (PSA 10) | 6.0 | raw | 0.02 | 0.02 | 0.11 | 0.49 | 6.00 | 33.82 | 79.08 |
| 2 | Fine Art (Blue Chip / Old Masters) | 5.0 | raw | 0.02 | 0.02 | 0.09 | 0.41 | 5.00 | 27.63 | 62.89 |
| 3 | Fine Wine (Investment Grade) | 4.0 | raw | 0.02 | 0.02 | 0.08 | 0.33 | 4.00 | 21.67 | 48.02 |
| 4 | Classic Cars (Pre-1970) | 3.5 | raw | 0.01 | 0.01 | 0.07 | 0.29 | 3.50 | 18.77 | 41.06 |
| 5 | Luxury Watches (Rolex/Patek) | 3.0 | raw | 0.01 | 0.01 | 0.06 | 0.25 | 3.00 | 15.93 | 34.39 |
| 6 | Precious Coins (Numismatic) | 1.5 | raw | 0.01 | 0.01 | 0.03 | 0.12 | 1.50 | 7.73 | 16.05 |
| 7 | Sneaker Reselling (Retail Avg) | -5.0 | raw | -0.02 | -0.02 | -0.10 | -0.43 | -5.00 | -22.62 | -40.13 |
| 8 | Modern Art Speculation | -10.0 | raw | -0.04 | -0.04 | -0.20 | -0.87 | -10.00 | -40.95 | -65.13 |
| 9 | Non-Vintage Trading Cards | -15.0 | raw | -0.06 | -0.06 | -0.31 | -1.35 | -15.00 | -55.63 | -80.31 |
| 10 | NFT Art & Digital Collectibles | -50.0 | raw | -0.27 | -0.27 | -1.32 | -5.61 | -50.00 | -96.88 | -99.90 |
| 11 | Collectibles After 28% Tax Rate | 4.32 | tax | 0.02 | 0.02 | 0.08 | 0.35 | 4.32 | 23.55 | 52.64 |

## 8. Sports Betting (Linear)

| # | Name | Edge (e%) | Layer | 1 Bet | 1 Day | 1 Week | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|-----------|-------|-------|-------|--------|---------|--------|---------|----------|
| 1 | Single Game Spread (-110) | -4.55 | raw | -0.46 | -0.91 | -5.46 | -23.66 | -284.38 | -1,421.88 | -2,843.75 |
| 2 | Single Game O/U (-110) | -4.55 | raw | -0.46 | -0.91 | -5.46 | -23.66 | -284.38 | -1,421.88 | -2,843.75 |
| 3 | Moneyline (Standard Juice) | -4.55 | raw | -0.46 | -0.91 | -5.46 | -23.66 | -284.38 | -1,421.88 | -2,843.75 |
| 4 | Teaser 2-Team 6pt | -5.0 | raw | -0.50 | -1.00 | -6.00 | -26.00 | -312.50 | -1,562.50 | -3,125.00 |
| 5 | Live / In-Game Bet | -6.5 | raw | -0.65 | -1.30 | -7.80 | -33.80 | -406.25 | -2,031.25 | -4,062.50 |
| 6 | Player Prop Bet | -7.0 | raw | -0.70 | -1.40 | -8.40 | -36.40 | -437.50 | -2,187.50 | -4,375.00 |
| 7 | Season Win Total Future | -8.0 | raw | -0.80 | -1.60 | -9.60 | -41.60 | -500.00 | -2,500.00 | -5,000.00 |
| 8 | 2-Team Parlay | -10.0 | raw | -1.00 | -2.00 | -12.00 | -52.00 | -625.00 | -3,125.00 | -6,250.00 |
| 9 | Championship Future | -12.0 | raw | -1.20 | -2.40 | -14.40 | -62.40 | -750.00 | -3,750.00 | -7,500.00 |
| 10 | 3-Team Parlay | -12.5 | raw | -1.25 | -2.50 | -15.00 | -65.00 | -781.25 | -3,906.25 | -7,812.50 |
| 11 | 4-Team Parlay | -15.0 | raw | -1.50 | -3.00 | -18.00 | -78.00 | -937.50 | -4,687.50 | -9,375.00 |
| 12 | Same-Game Parlay (SGP) | -15.0 | raw | -1.50 | -3.00 | -18.00 | -78.00 | -937.50 | -4,687.50 | -9,375.00 |
| 13 | First Touchdown Scorer | -18.0 | raw | -1.80 | -3.60 | -21.60 | -93.60 | -1,125.00 | -5,625.00 | -11,250.00 |
| 14 | 5-Team Parlay | -20.0 | raw | -2.00 | -4.00 | -24.00 | -104.00 | -1,250.00 | -6,250.00 | -12,500.00 |
| 15 | Correct Score (Soccer) | -20.0 | raw | -2.00 | -4.00 | -24.00 | -104.00 | -1,250.00 | -6,250.00 | -12,500.00 |
| 16 | 6-Team Parlay | -25.0 | raw | -2.50 | -5.00 | -30.00 | -130.00 | -1,562.50 | -7,812.50 | -15,625.00 |
| 17 | 8-Team Parlay | -30.0 | raw | -3.00 | -6.00 | -36.00 | -156.00 | -1,875.00 | -9,375.00 | -18,750.00 |
| 18 | 10-Team Parlay | -35.0 | raw | -3.50 | -7.00 | -42.00 | -182.00 | -2,187.50 | -10,937.50 | -21,875.00 |

## 9. Casino Gambling (Linear)

| # | Name | Edge (e%) | Layer | 1 Bet | 1 Day | 1 Week | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|-----------|-------|-------|-------|--------|---------|--------|---------|----------|
| 1 | Blackjack (Card Counting Hi-Lo) | 1.0 | raw | 0.10 | 0.20 | 1.20 | 5.20 | 62.50 | 312.50 | 625.00 |
| 2 | Video Poker 9/6 JoB (Perfect Play) | -0.46 | raw | -0.05 | -0.09 | -0.55 | -2.39 | -28.75 | -143.75 | -287.50 |
| 3 | Blackjack 3:2 (Basic Strategy) | -0.5 | raw | -0.05 | -0.10 | -0.60 | -2.60 | -31.25 | -156.25 | -312.50 |
| 4 | Baccarat Banker (5% Commission) | -1.06 | raw | -0.11 | -0.21 | -1.27 | -5.51 | -66.25 | -331.25 | -662.50 |
| 5 | Baccarat Player | -1.24 | raw | -0.12 | -0.25 | -1.49 | -6.45 | -77.50 | -387.50 | -775.00 |
| 6 | Craps Don't Pass | -1.36 | raw | -0.14 | -0.27 | -1.63 | -7.07 | -85.00 | -425.00 | -850.00 |
| 7 | Craps Pass Line | -1.41 | raw | -0.14 | -0.28 | -1.69 | -7.33 | -88.12 | -440.62 | -881.25 |
| 8 | Blackjack 6:5 (Basic Strategy) | -2.0 | raw | -0.20 | -0.40 | -2.40 | -10.40 | -125.00 | -625.00 | -1,250.00 |
| 9 | Pai Gow Poker | -2.5 | raw | -0.25 | -0.50 | -3.00 | -13.00 | -156.25 | -781.25 | -1,562.50 |
| 10 | Roulette Single Zero | -2.7 | raw | -0.27 | -0.54 | -3.24 | -14.04 | -168.75 | -843.75 | -1,687.50 |
| 11 | Three Card Poker | -3.4 | raw | -0.34 | -0.68 | -4.08 | -17.68 | -212.50 | -1,062.50 | -2,125.00 |
| 12 | Let It Ride | -3.5 | raw | -0.35 | -0.70 | -4.20 | -18.20 | -218.75 | -1,093.75 | -2,187.50 |
| 13 | Slots Loose (95% RTP) | -5.0 | raw | -0.50 | -1.00 | -6.00 | -26.00 | -312.50 | -1,562.50 | -3,125.00 |
| 14 | Caribbean Stud Poker | -5.2 | raw | -0.52 | -1.04 | -6.24 | -27.04 | -325.00 | -1,625.00 | -3,250.00 |
| 15 | Roulette Double Zero | -5.26 | raw | -0.53 | -1.05 | -6.31 | -27.35 | -328.75 | -1,643.75 | -3,287.50 |
| 16 | Slots Average (92% RTP) | -8.0 | raw | -0.80 | -1.60 | -9.60 | -41.60 | -500.00 | -2,500.00 | -5,000.00 |
| 17 | Slots Tight (85% RTP) | -15.0 | raw | -1.50 | -3.00 | -18.00 | -78.00 | -937.50 | -4,687.50 | -9,375.00 |
| 18 | Big Six Wheel | -16.0 | raw | -1.60 | -3.20 | -19.20 | -83.20 | -1,000.00 | -5,000.00 | -10,000.00 |
| 19 | Keno 4-Spot | -28.0 | raw | -2.80 | -5.60 | -33.60 | -145.60 | -1,750.00 | -8,750.00 | -17,500.00 |
| 20 | Keno 10-Spot | -35.0 | raw | -3.50 | -7.00 | -42.00 | -182.00 | -2,187.50 | -10,937.50 | -21,875.00 |
| 21 | Card Counting After Income Tax (37%) | 0.63 | tax | 0.06 | 0.13 | 0.76 | 3.28 | 39.38 | 196.88 | 393.75 |

## 10. Poker & Skill-Based (Linear)

| # | Name | Edge (e%) | Layer | 1 Bet | 1 Day | 1 Week | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|-----------|-------|-------|-------|--------|---------|--------|---------|----------|
| 1 | Poker Elite Pro (High Stakes) | 8.0 | raw | 0.80 | 1.60 | 9.60 | 41.60 | 500.00 | 2,500.00 | 5,000.00 |
| 2 | Poker Skilled (Live Cash) | 5.0 | raw | 0.50 | 1.00 | 6.00 | 26.00 | 312.50 | 1,562.50 | 3,125.00 |
| 3 | DFS Top 5% Player | 5.0 | raw | 0.50 | 1.00 | 6.00 | 26.00 | 312.50 | 1,562.50 | 3,125.00 |
| 4 | Poker Skilled (Online) | 3.0 | raw | 0.30 | 0.60 | 3.60 | 15.60 | 187.50 | 937.50 | 1,875.00 |
| 5 | Backgammon Tournament (Skilled) | 3.0 | raw | 0.30 | 0.60 | 3.60 | 15.60 | 187.50 | 937.50 | 1,875.00 |
| 6 | Poker Skilled (Tournaments) | 2.0 | raw | 0.20 | 0.40 | 2.40 | 10.40 | 125.00 | 625.00 | 1,250.00 |
| 7 | Poker Mid-Stakes Reg (6-max) | 1.5 | raw | 0.15 | 0.30 | 1.80 | 7.80 | 93.75 | 468.75 | 937.50 |
| 8 | Poker Average (Live Cash) | -5.0 | raw | -0.50 | -1.00 | -6.00 | -26.00 | -312.50 | -1,562.50 | -3,125.00 |
| 9 | Poker Average (Online) | -8.0 | raw | -0.80 | -1.60 | -9.60 | -41.60 | -500.00 | -2,500.00 | -5,000.00 |
| 10 | Poker Recreational (Live Cash) | -10.0 | raw | -1.00 | -2.00 | -12.00 | -52.00 | -625.00 | -3,125.00 | -6,250.00 |
| 11 | DFS Average Player | -12.0 | raw | -1.20 | -2.40 | -14.40 | -62.40 | -750.00 | -3,750.00 | -7,500.00 |
| 12 | Poker Sit & Go (Average) | -15.0 | raw | -1.50 | -3.00 | -18.00 | -78.00 | -937.50 | -4,687.50 | -9,375.00 |
| 13 | DFS Casual Player | -20.0 | raw | -2.00 | -4.00 | -24.00 | -104.00 | -1,250.00 | -6,250.00 | -12,500.00 |
| 14 | Poker Pro After Income Tax (37%) | 5.04 | tax | 0.50 | 1.01 | 6.05 | 26.21 | 315.00 | 1,575.00 | 3,150.00 |

## 11. Prediction Markets (Linear)

| # | Name | Edge (e%) | Layer | 1 Bet | 1 Day | 1 Week | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|-----------|-------|-------|-------|--------|---------|--------|---------|----------|
| 1 | Polymarket Elections | -3.0 | raw | -0.30 | -0.60 | -3.60 | -15.60 | -187.50 | -937.50 | -1,875.00 |
| 2 | Polymarket SCOTUS / Events | -3.0 | raw | -0.30 | -0.60 | -3.60 | -15.60 | -187.50 | -937.50 | -1,875.00 |
| 3 | Metaculus Scientific Questions | -3.5 | raw | -0.35 | -0.70 | -4.20 | -18.20 | -218.75 | -1,093.75 | -2,187.50 |
| 4 | Polymarket Oscars / Culture | -4.0 | raw | -0.40 | -0.80 | -4.80 | -20.80 | -250.00 | -1,250.00 | -2,500.00 |
| 5 | Polymarket Geopolitics / World | -4.0 | raw | -0.40 | -0.80 | -4.80 | -20.80 | -250.00 | -1,250.00 | -2,500.00 |
| 6 | Polymarket Sports / Entertainment | -4.5 | raw | -0.45 | -0.90 | -5.40 | -23.40 | -281.25 | -1,406.25 | -2,812.50 |
| 7 | Polymarket Crypto Prices | -5.0 | raw | -0.50 | -1.00 | -6.00 | -26.00 | -312.50 | -1,562.50 | -3,125.00 |
| 8 | Kalshi Economic Events | -5.5 | raw | -0.55 | -1.10 | -6.60 | -28.60 | -343.75 | -1,718.75 | -3,437.50 |
| 9 | Kalshi Fed Rate Decision | -5.5 | raw | -0.55 | -1.10 | -6.60 | -28.60 | -343.75 | -1,718.75 | -3,437.50 |
| 10 | Kalshi GDP Forecast | -6.0 | raw | -0.60 | -1.20 | -7.20 | -31.20 | -375.00 | -1,875.00 | -3,750.00 |
| 11 | Kalshi Weather Events | -7.0 | raw | -0.70 | -1.40 | -8.40 | -36.40 | -437.50 | -2,187.50 | -4,375.00 |
| 12 | PredictIt US Politics (5%+5%) | -10.0 | raw | -1.00 | -2.00 | -12.00 | -52.00 | -625.00 | -3,125.00 | -6,250.00 |

## 12. Lottery (Linear)

| # | Name | Edge (e%) | Layer | 1 Bet | 1 Day | 1 Week | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|-----------|-------|-------|-------|--------|---------|--------|---------|----------|
| 1 | $1 Scratch-Off (Best Odds) | -25.0 | raw | -2.50 | -5.00 | -30.00 | -130.00 | -1,562.50 | -7,812.50 | -15,625.00 |
| 2 | Premium Scratch-Off ($20+) | -30.0 | raw | -3.00 | -6.00 | -36.00 | -156.00 | -1,875.00 | -9,375.00 | -18,750.00 |
| 3 | Scratch-Off Tickets (Avg) | -35.0 | raw | -3.50 | -7.00 | -42.00 | -182.00 | -2,187.50 | -10,937.50 | -21,875.00 |
| 4 | Keno State-Run | -40.0 | raw | -4.00 | -8.00 | -48.00 | -208.00 | -2,500.00 | -12,500.00 | -25,000.00 |
| 5 | Daily Numbers Game | -42.0 | raw | -4.20 | -8.40 | -50.40 | -218.40 | -2,625.00 | -13,125.00 | -26,250.00 |
| 6 | State Pick 6 / Lotto | -45.0 | raw | -4.50 | -9.00 | -54.00 | -234.00 | -2,812.50 | -14,062.50 | -28,125.00 |
| 7 | State Lottery Pick 3/4 | -50.0 | raw | -5.00 | -10.00 | -60.00 | -260.00 | -3,125.00 | -15,625.00 | -31,250.00 |
| 8 | Powerball / Mega Millions | -52.0 | raw | -5.20 | -10.40 | -62.40 | -270.40 | -3,250.00 | -16,250.00 | -32,500.00 |
| 9 | Multi-State Cash4Life | -55.0 | raw | -5.50 | -11.00 | -66.00 | -286.00 | -3,437.50 | -17,187.50 | -34,375.00 |

---

## Summary

| Category | Raw | Fee | Tax | Total |
|----------|-----|-----|-----|-------|
| Stock Market | 22 | 7 | 4 | 33 |
| Bonds | 12 | 1 | 3 | 16 |
| Real Estate | 10 | 0 | 2 | 12 |
| Cryptocurrency | 7 | 0 | 3 | 10 |
| Options & Derivatives | 10 | 0 | 4 | 14 |
| Active Trading | 8 | 0 | 2 | 10 |
| Collectibles | 10 | 0 | 1 | 11 |
| Sports Betting | 18 | 0 | 0 | 18 |
| Casino Gambling | 20 | 0 | 1 | 21 |
| Poker & Skill-Based | 13 | 0 | 1 | 14 |
| Prediction Markets | 12 | 0 | 0 | 12 |
| Lottery | 9 | 0 | 0 | 9 |
| **Total** | **151** | **8** | **21** | **180** |
