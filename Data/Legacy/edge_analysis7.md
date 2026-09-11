# Edge Analysis V7: Fee-Adjusted Returns & Tax Impact Layer

**Date:** March 27, 2026
**Purpose:** Pure percentage cumulative returns. Added fee-adjusted investment variants and after-tax return entries to show how fees and taxes erode real investor edge.

---

## Methodology

Same as V6:
- **Gambling/Betting:** Linear model — N × 0.10 × edge_per_bet. No floor. Losses blow past -100%.
- **Investing:** Compound model — ((1 + annual)^years - 1) × 100.
- **Time Horizons:** 1 Event, 25 Events, 1 Year (625 Events), 5 Years (3,125 Events), 10 Years (6,250 Events).

### Changes from V6
- **Fee-Adjusted Returns (8 entries):** Shows how advisory fees, fund expense ratios, and hedge fund structures erode S&P 500 and bond returns. Entries placed in Stock Market and Bonds categories with "Fee Impact" grouping.
- **Tax Impact Layer (12 entries):** Shows after-tax returns across asset classes. Covers long-term capital gains (20%), short-term/ordinary income (37%), qualified dividends (15%), and tax-exempt munis. Entries placed in original categories with "Tax Impact" grouping. Gambling tax entries use linear model since winnings from negative-edge games are taxed at ordinary income rates.
- **Net change:** +20 data points → ~171 total

### Fee-Adjusted Logic
All fee-adjusted entries use the S&P 500 baseline of +10.0% annual or bond baseline of +3.5% annual:
- **Index fund (0.03% ER):** 10.0% - 0.03% = 9.97% (nearly free)
- **Robo-advisor (0.25% + fund fees):** 10.0% - 0.35% = 9.65%
- **Target-date fund (0.60% ER):** 10.0% - 0.60% = 9.40%
- **1% financial advisor:** 10.0% - 1.0% = 9.00%
- **1.5% active mutual fund:** 10.0% - 1.5% = 8.50%
- **2-and-20 hedge fund (matching market):** 10.0% - 2.0% - (20% × 8.0%) = 6.40%
- **2-and-20 hedge fund (underperforming):** 7.0% - 2.0% - (20% × 5.0%) = 4.00%
- **Bonds after 1% advisory fee:** 3.5% - 1.0% = 2.50%

### Tax Impact Logic
Tax-adjusted entries apply federal tax rates to pre-tax returns. State taxes excluded for simplicity.
- **Long-term capital gains (held 1+ year):** 20% rate → multiply return by 0.80
- **Short-term capital gains / Ordinary income:** 37% rate → multiply return by 0.63
- **Qualified dividends:** 15% rate → multiply return by 0.85
- **Tax-exempt (municipal bonds):** 0% → return unchanged
- **Gambling net winnings:** Taxed as ordinary income (37%). Applied to the raw edge. For negative-edge activities, net losses are deductible only up to $3K/year — taxes don't help much.

---

## Stock Market (Compound Returns)

*Unchanged from V6 — 22 entries*

| # | Name | Annual | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|--------|---------|--------|---------|----------|
| 1 | Stocks - NASDAQ 100 Index (QQQ) | +12.50% | +0.99% | +12.50% | +80.20% | +224.73% |
| 2 | Stocks - S&P 500 Growth (IVW) | +12.00% | +0.95% | +12.00% | +76.23% | +210.58% |
| 3 | Stocks - Small-Cap Value ETF (VBR) | +11.50% | +0.91% | +11.50% | +72.33% | +197.55% |
| 4 | Stocks - S&P MidCap 400 (MDY) | +11.00% | +0.87% | +11.00% | +68.51% | +184.94% |
| 5 | Stocks - Dividend Aristocrats (NOBL) | +10.50% | +0.84% | +10.50% | +64.74% | +172.76% |
| 6 | Stocks - Total US Stock Market (VTI) | +10.20% | +0.81% | +10.20% | +62.67% | +165.19% |
| 7 | Stocks - S&P 500 Index (SPY/VOO) | +10.00% | +0.80% | +10.00% | +61.05% | +159.37% |
| 8 | Stocks - S&P 500 Equal Weight (RSP) | +10.00% | +0.80% | +10.00% | +61.05% | +159.37% |
| 9 | Stocks - Dow Jones Industrial Avg (DIA) | +9.50% | +0.76% | +9.50% | +57.42% | +147.82% |
| 10 | Stocks - S&P 500 Value (IVE) | +9.50% | +0.76% | +9.50% | +57.42% | +147.82% |
| 11 | Stocks - Russell 2000 Small Cap (IWM) | +8.50% | +0.68% | +8.50% | +50.37% | +126.57% |
| 12 | Stocks - REIT Index ETF (VNQ) | +8.00% | +0.64% | +8.00% | +46.93% | +115.89% |
| 13 | Stocks - S&P 500 High Dividend (SPYD) | +8.00% | +0.64% | +8.00% | +46.93% | +115.89% |
| 14 | Stocks - DAX Germany Index | +7.50% | +0.60% | +7.50% | +43.56% | +106.10% |
| 15 | Stocks - Nikkei 225 Japan Index | +7.00% | +0.57% | +7.00% | +40.26% | +96.72% |
| 16 | Stocks - MSCI EAFE Intl Developed (EFA) | +5.50% | +0.45% | +5.50% | +30.70% | +70.81% |
| 17 | Stocks - FTSE 100 UK Index | +5.00% | +0.41% | +5.00% | +27.63% | +62.89% |
| 18 | Stocks - MSCI Emerging Markets (EEM) | +4.00% | +0.33% | +4.00% | +21.67% | +48.02% |
| 19 | Stocks - Gold / Precious Metals (GLD) | +2.00% | +0.17% | +2.00% | +10.41% | +21.90% |
| 20 | Stocks - Commodity Index (DJP) | +1.00% | +0.08% | +1.00% | +5.10% | +10.46% |
| 21 | Stocks - Individual Stock Picking (Retail Avg) | -2.00% | -0.17% | -2.00% | -9.61% | -18.29% |
| 22 | Stocks - Penny Stocks (Retail Avg) | -30.00% | -2.93% | -30.00% | -83.19% | -97.18% |

### Fee-Adjusted Stock Returns (NEW)

| # | Name | Annual | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|--------|---------|--------|---------|----------|
| 23 | Fees - S&P 500 After 0.03% Index Fund Fee | +9.97% | +0.80% | +9.97% | +60.82% | +158.68% |
| 24 | Fees - S&P 500 After 0.35% Robo-Advisor Fee | +9.65% | +0.77% | +9.65% | +58.38% | +152.74% |
| 25 | Fees - S&P 500 After 0.60% Target-Date Fund | +9.40% | +0.75% | +9.40% | +56.44% | +148.02% |
| 26 | Fees - S&P 500 After 1% Advisory Fee | +9.00% | +0.72% | +9.00% | +53.86% | +136.74% |
| 27 | Fees - S&P 500 After 1.5% Active Mutual Fund | +8.50% | +0.68% | +8.50% | +50.37% | +126.57% |
| 28 | Fees - S&P 500 After 2-and-20 Hedge Fund | +6.40% | +0.52% | +6.40% | +36.39% | +86.23% |
| 29 | Fees - S&P 500 After 2-and-20 (Underperforming) | +4.00% | +0.33% | +4.00% | +21.67% | +48.02% |

### Tax-Adjusted Stock Returns (NEW)

| # | Name | Annual | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|--------|---------|--------|---------|----------|
| 30 | Tax - S&P 500 After LTCG Tax (20%) | +8.00% | +0.64% | +8.00% | +46.93% | +115.89% |
| 31 | Tax - S&P 500 After STCG Tax (37%) | +6.30% | +0.51% | +6.30% | +35.66% | +84.47% |
| 32 | Tax - S&P 500 After 1% Fee + LTCG Tax | +7.20% | +0.58% | +7.20% | +41.47% | +100.14% |
| 33 | Tax - Qualified Dividends (SPYD) After 15% Tax | +6.80% | +0.55% | +6.80% | +38.95% | +93.05% |

---

## Bond Market (Compound Returns)

*Unchanged from V6 — 12 entries*

| # | Name | Annual | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|--------|---------|--------|---------|----------|
| 1–12 | *(Same as V6)* | | | | | |

### Fee-Adjusted Bond Returns (NEW)

| # | Name | Annual | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|--------|---------|--------|---------|----------|
| 13 | Fees - Bond Fund After 1% Advisory Fee | +2.50% | +0.21% | +2.50% | +13.14% | +28.01% |

### Tax-Adjusted Bond Returns (NEW)

| # | Name | Annual | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|--------|---------|--------|---------|----------|
| 14 | Tax - Bond Interest After Income Tax (37%) | +2.21% | +0.18% | +2.21% | +11.52% | +24.38% |
| 15 | Tax - Muni Bonds Tax-Exempt (Effective) | +3.50% | +0.29% | +3.50% | +18.77% | +41.06% |

---

## Real Estate (Compound Returns)

*Unchanged from V6 — 10 entries*

### Tax-Adjusted Real Estate Returns (NEW)

| # | Name | Annual | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|--------|---------|--------|---------|----------|
| 11 | Tax - Rental Income After Ordinary Tax (37%) | +4.73% | +0.39% | +4.73% | +25.93% | +58.59% |
| 12 | Tax - Home Sale After LTCG (w/ $250K Exclusion) | +6.75% | +0.55% | +6.75% | +38.65% | +92.33% |

---

## Cryptocurrency (Compound Returns)

*Unchanged from V6 — 7 entries*

### Tax-Adjusted Crypto Returns (NEW)

| # | Name | Annual | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|--------|---------|--------|---------|----------|
| 8 | Tax - Bitcoin After LTCG Tax (20%) | +36.00% | +2.60% | +36.00% | +375.67% | +2,149.13% |
| 9 | Tax - Bitcoin After STCG Tax (37%) | +28.35% | +2.09% | +28.35% | +250.65% | +1,279.41% |

---

## Options & Derivatives (Mixed Models)

*Unchanged from V6 — 10 entries*

---

## Active Trading (Compound Returns)

*Unchanged from V6 — 8 entries*

### Tax-Adjusted Trading Returns (NEW)

| # | Name | Annual | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|--------|---------|--------|---------|----------|
| 9 | Tax - Trend Following After STCG Tax (37%) | +3.15% | +0.26% | +3.15% | +16.79% | +36.40% |

---

## Sports Betting (Linear Gamble Model)

*Unchanged from V6 — 18 entries*

---

## Casino Gambling (Linear Gamble Model)

*Unchanged from V6 — 20 entries*

### Tax-Adjusted Casino Returns (NEW — Linear Model)

| # | Name | Edge/Bet | 1 Event | 25 Events | 1 Year (625) | 5 Years (3,125) | 10 Years (6,250) |
|---|------|----------|---------|-----------|--------------|--------------------|--------------------|
| 21 | Tax - Card Counting After Income Tax (37%) | +0.63% | +0.06% | +1.58% | +39.38% | +196.88% | +393.75% |

---

## Poker & Skill-Based (Linear Gamble Model)

*Unchanged from V6 — 13 entries*

### Tax-Adjusted Poker Returns (NEW — Linear Model)

| # | Name | Edge/Bet | 1 Event | 25 Events | 1 Year (625) | 5 Years (3,125) | 10 Years (6,250) |
|---|------|----------|---------|-----------|--------------|--------------------|--------------------|
| 14 | Tax - Poker Pro After Income Tax (37%) | +5.04% | +0.50% | +12.60% | +315.00% | +1,575.00% | +3,150.00% |

---

## Prediction Markets (Linear Gamble Model)

*Unchanged from V6 — 12 entries*

---

## Collectibles & Alternatives (Compound Returns)

*Unchanged from V6 — 10 entries*

---

## Lottery & Scratch-Offs (Linear Gamble Model)

*Unchanged from V6 — 9 entries*
