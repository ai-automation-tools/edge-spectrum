# Edge Analysis V5: Expanded Active Trading, Poker & Lottery

**Date:** March 27, 2026
**Purpose:** Pure percentage cumulative returns. Added new data points to Active Trading, Poker & Skill-Based, and Lottery & Scratch-Offs categories for denser chart coverage.

---

## Methodology

Same as V4:
- **Gambling/Betting:** Linear model — N × 0.10 × edge_per_bet. No floor. Losses blow past -100%.
- **Investing:** Compound model — ((1 + annual)^years - 1) × 100.
- **Time Horizons:** 1 Event, 25 Events, 1 Year (625 Events), 5 Years (3,125 Events), 10 Years (6,250 Events).

### Changes from V4
- **Active Trading:** Added 5 entries — Systematic Trend Following, Social/Copy Trading, Momentum Trading, CFD Trading, Binary Options
- **Poker & Skill-Based:** Added 5 entries — Elite Professional, Mid-Stakes Reg, Backgammon Tournament, Recreational Live Cash, Sit & Go Average
- **Lottery & Scratch-Offs:** Added 5 entries — $1 Best Odds Scratch-Off, Premium Scratch-Off, Daily Numbers, State Pick 6, Multi-State Cash4Life

---

## Stock Market (Compound Returns)

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
| 12 | Stocks - S&P 500 High Dividend (SPYD) | +8.00% | +0.64% | +8.00% | +46.93% | +115.89% |
| 13 | Stocks - REIT Index ETF (VNQ) | +8.00% | +0.64% | +8.00% | +46.93% | +115.89% |
| 14 | Stocks - MSCI EAFE Intl Developed (EFA) | +5.50% | +0.45% | +5.50% | +30.70% | +70.81% |
| 15 | Stocks - FTSE 100 UK Index | +5.00% | +0.41% | +5.00% | +27.63% | +62.89% |
| 16 | Stocks - DAX Germany Index | +7.50% | +0.60% | +7.50% | +43.56% | +106.10% |
| 17 | Stocks - Nikkei 225 Japan Index | +7.00% | +0.57% | +7.00% | +40.26% | +96.72% |
| 18 | Stocks - MSCI Emerging Markets (EEM) | +4.00% | +0.33% | +4.00% | +21.67% | +48.02% |
| 19 | Stocks - Rental Property (Net of Expenses) | +6.00% | +0.49% | +6.00% | +33.82% | +79.08% |
| 20 | Stocks - Gold / Precious Metals (GLD) | +2.00% | +0.17% | +2.00% | +10.41% | +21.90% |
| 21 | Stocks - Commodity Index (DJP) | +1.00% | +0.08% | +1.00% | +5.10% | +10.46% |
| 22 | Stocks - Individual Stock Picking (Retail Avg) | -2.00% | -0.17% | -2.00% | -9.61% | -18.29% |
| 23 | Stocks - Penny Stocks (Retail Avg) | -30.00% | -2.93% | -30.00% | -83.19% | -97.18% |

---

## Bond Market (Compound Returns)

| # | Name | Annual | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|--------|---------|--------|---------|----------|
| 1 | Bonds - High-Yield Corporate (HYG/JNK) | +5.50% | +0.45% | +5.50% | +30.70% | +70.81% |
| 2 | Bonds - Convertible Bond ETF (CWB) | +5.00% | +0.41% | +5.00% | +27.63% | +62.89% |
| 3 | Bonds - Investment Grade Corporate (LQD) | +4.50% | +0.37% | +4.50% | +24.62% | +55.30% |
| 4 | Bonds - US Treasury Bills (BIL) | +4.30% | +0.35% | +4.30% | +23.36% | +52.18% |
| 5 | Bonds - US Treasury 10-Year | +3.80% | +0.31% | +3.80% | +20.53% | +45.27% |
| 6 | Bonds - Total US Bond Market (BND/AGG) | +3.50% | +0.29% | +3.50% | +18.77% | +41.06% |
| 7 | Bonds - Municipal Bond Index (MUB) | +3.50% | +0.29% | +3.50% | +18.77% | +41.06% |
| 8 | Bonds - Aggregate Bond ETF (AGG) | +3.00% | +0.25% | +3.00% | +15.93% | +34.39% |
| 9 | Bonds - International Bond (BNDX) | +2.50% | +0.21% | +2.50% | +13.14% | +28.01% |
| 10 | Bonds - Short-Term Treasury (SHY) | +2.50% | +0.21% | +2.50% | +13.14% | +28.01% |
| 11 | Bonds - TIPS Inflation-Protected (TIP) | +1.50% | +0.12% | +1.50% | +7.73% | +16.05% |
| 12 | Bonds - Long-Term Treasury 20+ Year (TLT) | +4.00% | +0.33% | +4.00% | +21.67% | +48.02% |

---

## Cryptocurrency (Compound Returns)

| # | Name | Annual | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|--------|---------|--------|---------|----------|
| 1 | Crypto - Bitcoin Spot (Buy & Hold) | +45.00% | +3.13% | +45.00% | +547.10% | +4,087.40% |
| 2 | Crypto - Ethereum Spot (Buy & Hold) | +10.00% | +0.80% | +10.00% | +61.05% | +159.37% |
| 3 | Crypto - Stablecoin Yield Farming (DeFi) | +5.00% | +0.41% | +5.00% | +27.63% | +62.89% |
| 4 | Crypto - DeFi LP Major Pairs | +2.00% | +0.17% | +2.00% | +10.41% | +21.90% |
| 5 | Crypto - DeFi LP Volatile Pairs | -10.00% | -0.87% | -10.00% | -40.95% | -65.13% |
| 6 | Crypto - Altcoin Portfolio (Retail Avg) | -15.00% | -1.35% | -15.00% | -55.63% | -80.31% |
| 7 | Crypto - Meme Coins (Retail Avg) | -70.00% | -9.71% | -70.00% | -99.76% | -99.99% |

---

## Options & Derivatives (Mixed Models)

Selling strategies = compound annual returns. Buying strategies = linear gamble model.

### Selling (Compound)

| # | Name | Annual | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|--------|---------|--------|---------|----------|
| 1 | Options - Iron Condor Selling (Monthly) | +10.00% | +0.80% | +10.00% | +61.05% | +159.37% |
| 2 | Options - Cash-Secured Put Selling | +8.00% | +0.64% | +8.00% | +46.93% | +115.89% |
| 3 | Options - Covered Call Writing | +7.00% | +0.57% | +7.00% | +40.26% | +96.72% |
| 4 | Options - Managed Futures / CTA Fund | +3.00% | +0.25% | +3.00% | +15.93% | +34.39% |

### Buying (Linear Gamble Model)

| # | Name | Edge/Trade | 1 Event | 25 Events | 1 Year (625) | 5 Years (3,125) | 10 Years (6,250) |
|---|------|------------|---------|-----------|--------------|--------------------|--------------------|
| 1 | Options - Commodity Futures (Retail) | -8.00% | -0.80% | -20.00% | -500.00% | -2,500.00% | -5,000.00% |
| 2 | Options - Buying ATM Calls/Puts (30-Day) | -15.00% | -1.50% | -37.50% | -937.50% | -4,687.50% | -9,375.00% |
| 3 | Options - Leveraged Futures Day Trading | -25.00% | -2.50% | -62.50% | -1,562.50% | -7,812.50% | -15,625.00% |
| 4 | Options - Buying OTM Calls/Puts (30-Day) | -35.00% | -3.50% | -87.50% | -2,187.50% | -10,937.50% | -21,875.00% |
| 5 | Options - 0DTE Options (Retail Avg) | -50.00% | -5.00% | -125.00% | -3,125.00% | -15,625.00% | -31,250.00% |
| 6 | Options - Deep OTM Weekly Options | -60.00% | -6.00% | -150.00% | -3,750.00% | -18,750.00% | -37,500.00% |

---

## Active Trading (Compound Returns)

| # | Name | Annual | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|--------|---------|--------|---------|----------|
| 1 | Trading - Systematic Trend Following (Managed) | +5.00% | +0.41% | +5.00% | +27.63% | +62.89% |
| 2 | Trading - Social/Copy Trading (Retail) | -12.00% | -1.06% | -12.00% | -47.23% | -72.15% |
| 3 | Trading - Momentum Trading (Retail) | -18.00% | -1.64% | -18.00% | -62.93% | -86.26% |
| 4 | Trading - Retail Forex (Leveraged) | -25.00% | -2.37% | -25.00% | -76.27% | -94.37% |
| 5 | Trading - CFD Trading (Retail, Leveraged) | -28.00% | -2.70% | -28.00% | -80.65% | -96.26% |
| 6 | Trading - Retail Day Trading | -30.00% | -2.93% | -30.00% | -83.19% | -97.18% |
| 7 | Trading - Crypto Day Trading (Retail) | -35.00% | -3.53% | -35.00% | -88.40% | -98.65% |
| 8 | Trading - Binary Options (Retail) | -40.00% | -4.17% | -40.00% | -92.22% | -99.40% |

---

## Sports Betting (Linear Gamble Model)

| # | Name | Edge/Bet | 1 Event | 25 Events | 1 Year (625) | 5 Years (3,125) | 10 Years (6,250) |
|---|------|----------|---------|-----------|--------------|--------------------|--------------------|
| 1 | Sports - Single Game Spread (-110) | -4.55% | -0.46% | -11.38% | -284.38% | -1,421.88% | -2,843.75% |
| 2 | Sports - Single Game Over/Under (-110) | -4.55% | -0.46% | -11.38% | -284.38% | -1,421.88% | -2,843.75% |
| 3 | Sports - Moneyline (Standard Juice) | -4.55% | -0.46% | -11.38% | -284.38% | -1,421.88% | -2,843.75% |
| 4 | Sports - Teaser 2-Team 6pt | -5.00% | -0.50% | -12.50% | -312.50% | -1,562.50% | -3,125.00% |
| 5 | Sports - Live / In-Game Betting | -6.50% | -0.65% | -16.25% | -406.25% | -2,031.25% | -4,062.50% |
| 6 | Sports - Player Prop Bet | -7.00% | -0.70% | -17.50% | -437.50% | -2,187.50% | -4,375.00% |
| 7 | Sports - Season Win Total Future | -8.00% | -0.80% | -20.00% | -500.00% | -2,500.00% | -5,000.00% |
| 8 | Sports - 2-Team Parlay | -10.00% | -1.00% | -25.00% | -625.00% | -3,125.00% | -6,250.00% |
| 9 | Sports - Championship Future | -12.00% | -1.20% | -30.00% | -750.00% | -3,750.00% | -7,500.00% |
| 10 | Sports - 3-Team Parlay | -12.50% | -1.25% | -31.25% | -781.25% | -3,906.25% | -7,812.50% |
| 11 | Sports - 4-Team Parlay | -15.00% | -1.50% | -37.50% | -937.50% | -4,687.50% | -9,375.00% |
| 12 | Sports - Same-Game Parlay (SGP) | -15.00% | -1.50% | -37.50% | -937.50% | -4,687.50% | -9,375.00% |
| 13 | Sports - First Touchdown Scorer | -18.00% | -1.80% | -45.00% | -1,125.00% | -5,625.00% | -11,250.00% |
| 14 | Sports - 5-Team Parlay | -20.00% | -2.00% | -50.00% | -1,250.00% | -6,250.00% | -12,500.00% |
| 15 | Sports - Correct Score (Soccer) | -20.00% | -2.00% | -50.00% | -1,250.00% | -6,250.00% | -12,500.00% |
| 16 | Sports - 6-Team Parlay | -25.00% | -2.50% | -62.50% | -1,562.50% | -7,812.50% | -15,625.00% |
| 17 | Sports - 8-Team Parlay | -30.00% | -3.00% | -75.00% | -1,875.00% | -9,375.00% | -18,750.00% |
| 18 | Sports - 10-Team Parlay | -35.00% | -3.50% | -87.50% | -2,187.50% | -10,937.50% | -21,875.00% |

---

## Casino Gambling (Linear Gamble Model)

| # | Name | Edge/Bet | 1 Event | 25 Events | 1 Year (625) | 5 Years (3,125) | 10 Years (6,250) |
|---|------|----------|---------|-----------|--------------|--------------------|--------------------|
| 1 | Casino - Blackjack (Card Counting Hi-Lo) | +1.00% | +0.10% | +2.50% | +62.50% | +312.50% | +625.00% |
| 2 | Casino - Video Poker 9/6 JoB (Perfect Play) | -0.46% | -0.05% | -1.15% | -28.75% | -143.75% | -287.50% |
| 3 | Casino - Blackjack 3:2 (Basic Strategy) | -0.50% | -0.05% | -1.25% | -31.25% | -156.25% | -312.50% |
| 4 | Casino - Baccarat Banker (5% Commission) | -1.06% | -0.11% | -2.65% | -66.25% | -331.25% | -662.50% |
| 5 | Casino - Baccarat Player | -1.24% | -0.12% | -3.10% | -77.50% | -387.50% | -775.00% |
| 6 | Casino - Craps Don't Pass | -1.36% | -0.14% | -3.40% | -85.00% | -425.00% | -850.00% |
| 7 | Casino - Craps Pass Line | -1.41% | -0.14% | -3.53% | -88.13% | -440.63% | -881.25% |
| 8 | Casino - Blackjack 6:5 (Basic Strategy) | -2.00% | -0.20% | -5.00% | -125.00% | -625.00% | -1,250.00% |
| 9 | Casino - Pai Gow Poker | -2.50% | -0.25% | -6.25% | -156.25% | -781.25% | -1,562.50% |
| 10 | Casino - Roulette Single Zero | -2.70% | -0.27% | -6.75% | -168.75% | -843.75% | -1,687.50% |
| 11 | Casino - Three Card Poker | -3.40% | -0.34% | -8.50% | -212.50% | -1,062.50% | -2,125.00% |
| 12 | Casino - Let It Ride | -3.50% | -0.35% | -8.75% | -218.75% | -1,093.75% | -2,187.50% |
| 13 | Casino - Slots Loose (95% RTP) | -5.00% | -0.50% | -12.50% | -312.50% | -1,562.50% | -3,125.00% |
| 14 | Casino - Caribbean Stud Poker | -5.20% | -0.52% | -13.00% | -325.00% | -1,625.00% | -3,250.00% |
| 15 | Casino - Roulette Double Zero | -5.26% | -0.53% | -13.15% | -328.75% | -1,643.75% | -3,287.50% |
| 16 | Casino - Slots Average (92% RTP) | -8.00% | -0.80% | -20.00% | -500.00% | -2,500.00% | -5,000.00% |
| 17 | Casino - Slots Tight (85% RTP) | -15.00% | -1.50% | -37.50% | -937.50% | -4,687.50% | -9,375.00% |
| 18 | Casino - Big Six Wheel | -16.00% | -1.60% | -40.00% | -1,000.00% | -5,000.00% | -10,000.00% |
| 19 | Casino - Keno 4-Spot | -28.00% | -2.80% | -70.00% | -1,750.00% | -8,750.00% | -17,500.00% |
| 20 | Casino - Keno 10-Spot | -35.00% | -3.50% | -87.50% | -2,187.50% | -10,937.50% | -21,875.00% |

---

## Poker & Skill-Based (Linear Gamble Model)

| # | Name | Edge/Bet | 1 Event | 25 Events | 1 Year (625) | 5 Years (3,125) | 10 Years (6,250) |
|---|------|----------|---------|-----------|--------------|--------------------|--------------------|
| 1 | Poker - Elite Professional (High Stakes Live) | +8.00% | +0.80% | +20.00% | +500.00% | +2,500.00% | +5,000.00% |
| 2 | Poker - Skilled Player (Live Cash) | +5.00% | +0.50% | +12.50% | +312.50% | +1,562.50% | +3,125.00% |
| 3 | DFS - Top 5% Player | +5.00% | +0.50% | +12.50% | +312.50% | +1,562.50% | +3,125.00% |
| 4 | Poker - Skilled Player (Online) | +3.00% | +0.30% | +7.50% | +187.50% | +937.50% | +1,875.00% |
| 5 | Backgammon - Skilled Tournament Player | +3.00% | +0.30% | +7.50% | +187.50% | +937.50% | +1,875.00% |
| 6 | Poker - Skilled Player (Tournaments) | +2.00% | +0.20% | +5.00% | +125.00% | +625.00% | +1,250.00% |
| 7 | Poker - Mid-Stakes Reg (Online, 6-max) | +1.50% | +0.15% | +3.75% | +93.75% | +468.75% | +937.50% |
| 8 | Poker - Average Player (Live Cash) | -5.00% | -0.50% | -12.50% | -312.50% | -1,562.50% | -3,125.00% |
| 9 | Poker - Average Player (Online) | -8.00% | -0.80% | -20.00% | -500.00% | -2,500.00% | -5,000.00% |
| 10 | Poker - Recreational Player (Live Cash) | -10.00% | -1.00% | -25.00% | -625.00% | -3,125.00% | -6,250.00% |
| 11 | DFS - Average Player | -12.00% | -1.20% | -30.00% | -750.00% | -3,750.00% | -7,500.00% |
| 12 | Poker - Sit & Go (Average Player) | -15.00% | -1.50% | -37.50% | -937.50% | -4,687.50% | -9,375.00% |
| 13 | DFS - Casual Player | -20.00% | -2.00% | -50.00% | -1,250.00% | -6,250.00% | -12,500.00% |

---

## Prediction Markets (Linear Gamble Model)

| # | Name | Edge/Bet | 1 Event | 25 Events | 1 Year (625) | 5 Years (3,125) | 10 Years (6,250) |
|---|------|----------|---------|-----------|--------------|--------------------|--------------------|
| 1 | Prediction - Polymarket Elections | -3.00% | -0.30% | -7.50% | -187.50% | -937.50% | -1,875.00% |
| 2 | Prediction - Polymarket SCOTUS / Events | -3.00% | -0.30% | -7.50% | -187.50% | -937.50% | -1,875.00% |
| 3 | Prediction - Polymarket Oscars / Culture | -4.00% | -0.40% | -10.00% | -250.00% | -1,250.00% | -2,500.00% |
| 4 | Prediction - Kalshi Economic Events | -5.50% | -0.55% | -13.75% | -343.75% | -1,718.75% | -3,437.50% |
| 5 | Prediction - Kalshi Fed Rate Decision | -5.50% | -0.55% | -13.75% | -343.75% | -1,718.75% | -3,437.50% |
| 6 | Prediction - Kalshi GDP Forecast | -6.00% | -0.60% | -15.00% | -375.00% | -1,875.00% | -3,750.00% |
| 7 | Prediction - PredictIt US Politics (5%+5%) | -10.00% | -1.00% | -25.00% | -625.00% | -3,125.00% | -6,250.00% |

---

## Lottery & Scratch-Offs (Linear Gamble Model)

| # | Name | Edge/Bet | 1 Event | 25 Events | 1 Year (625) | 5 Years (3,125) | 10 Years (6,250) |
|---|------|----------|---------|-----------|--------------|--------------------|--------------------|
| 1 | Lottery - $1 Scratch-Off (Best Odds) | -25.00% | -2.50% | -62.50% | -1,562.50% | -7,812.50% | -15,625.00% |
| 2 | Lottery - Premium Scratch-Off ($20+) | -30.00% | -3.00% | -75.00% | -1,875.00% | -9,375.00% | -18,750.00% |
| 3 | Lottery - Scratch-Off Tickets (Avg) | -35.00% | -3.50% | -87.50% | -2,187.50% | -10,937.50% | -21,875.00% |
| 4 | Lottery - Keno State-Run | -40.00% | -4.00% | -100.00% | -2,500.00% | -12,500.00% | -25,000.00% |
| 5 | Lottery - Daily Numbers Game | -42.00% | -4.20% | -105.00% | -2,625.00% | -13,125.00% | -26,250.00% |
| 6 | Lottery - State Pick 6 / Lotto | -45.00% | -4.50% | -112.50% | -2,812.50% | -14,062.50% | -28,125.00% |
| 7 | Lottery - State Pick 3 / Pick 4 | -50.00% | -5.00% | -125.00% | -3,125.00% | -15,625.00% | -31,250.00% |
| 8 | Lottery - Powerball / Mega Millions | -52.00% | -5.20% | -130.00% | -3,250.00% | -16,250.00% | -32,500.00% |
| 9 | Lottery - Multi-State Cash4Life | -55.00% | -5.50% | -137.50% | -3,437.50% | -17,187.50% | -34,375.00% |
