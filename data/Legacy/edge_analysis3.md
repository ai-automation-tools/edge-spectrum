# Edge Analysis V3: Pure Percentage Returns — No Caps, No Floors

**Date:** March 25, 2026
**Purpose:** Show the true cumulative expected return (%) at every time horizon, letting negative returns blow past -100% to reveal the real cost of repeated negative-edge bets.

---

## Methodology

### Metric: Cumulative Expected Return (%)
Every value answers: **"What is my total expected gain or loss as a percentage of my starting capital?"**

- **+10%** means you expect to be up 10% of your starting capital.
- **-328%** means you expect to lose 3.28x your starting capital over that period (i.e., you'd need to reload your bankroll ~3 times to keep playing).
- No caps. No floors. Pure math.

### Models
- **Gambling/Betting (linear model):** Assumes $10 bet per event on $100 starting capital (10% per bet). Expected cumulative return = N × 0.10 × edge_per_bet. This scales linearly because the house edge is constant per dollar wagered, and losses can exceed starting capital.
- **Investing (compound model):** Return = ((1 + annual_return)^years - 1) × 100. Compounds naturally. Negative-return investments approach -100% asymptotically — you can't lose more than you invested (unless leveraged).

### Time Horizons
| Column | Gambling | Investing |
|--------|----------|-----------|
| **1 Event** | 1 bet/spin/hand | 1 month |
| **25 Events (1 Day)** | 25 bets in a session | ~2 years |
| **1 Year (625 Events)** | 25 sessions × 25 bets | 1 year |
| **5 Years (3,125 Events)** | 5 years of regular play | 5 years |
| **10 Years (6,250 Events)** | 10 years of regular play | 10 years |

### Why No Cap at -100%?
In real life, a gambler who keeps playing doesn't stop at -100%. They reload. They borrow. They come back tomorrow. The linear model captures the true cumulative expected cost of continued play — not just one bankroll, but the total expected damage. A -500% return means "if you keep this up, you'll lose 5x what you started with." This is the number the casino is banking on.

---

## Casino Gambling

**Model:** Linear — N × 0.10 × edge. Edge = house advantage per dollar wagered.

| # | Name | Edge/Bet | 1 Event | 25 Events (1 Day) | 1 Year (625) | 5 Years (3,125) | 10 Years (6,250) |
|---|------|----------|---------|--------------------|--------------|--------------------|---------------------|
| 1 | Casino - Blackjack (Card Counting Hi-Lo) | +1.00% | +0.10% | +2.50% | +62.50% | +312.50% | +625.00% |
| 2 | Casino - Video Poker 9/6 JoB (Perfect Strategy) | -0.46% | -0.05% | -1.15% | -28.75% | -143.75% | -287.50% |
| 3 | Casino - Blackjack 3:2 (Basic Strategy) | -0.50% | -0.05% | -1.25% | -31.25% | -156.25% | -312.50% |
| 4 | Casino - Baccarat Banker (5% Commission) | -1.06% | -0.11% | -2.65% | -66.25% | -331.25% | -662.50% |
| 5 | Casino - Baccarat Player | -1.24% | -0.12% | -3.10% | -77.50% | -387.50% | -775.00% |
| 6 | Casino - Craps Don't Pass | -1.36% | -0.14% | -3.40% | -85.00% | -425.00% | -850.00% |
| 7 | Casino - Craps Pass Line | -1.41% | -0.14% | -3.53% | -88.13% | -440.63% | -881.25% |
| 8 | Casino - Blackjack 6:5 (Basic Strategy) | -2.00% | -0.20% | -5.00% | -125.00% | -625.00% | -1,250.00% |
| 9 | Casino - Pai Gow Poker | -2.50% | -0.25% | -6.25% | -156.25% | -781.25% | -1,562.50% |
| 10 | Casino - Roulette Single Zero (Even Money) | -2.70% | -0.27% | -6.75% | -168.75% | -843.75% | -1,687.50% |
| 11 | Casino - Three Card Poker (Ante/Play) | -3.40% | -0.34% | -8.50% | -212.50% | -1,062.50% | -2,125.00% |
| 12 | Casino - Let It Ride | -3.50% | -0.35% | -8.75% | -218.75% | -1,093.75% | -2,187.50% |
| 13 | Casino - Slots Loose (95% RTP) | -5.00% | -0.50% | -12.50% | -312.50% | -1,562.50% | -3,125.00% |
| 14 | Casino - Caribbean Stud Poker | -5.20% | -0.52% | -13.00% | -325.00% | -1,625.00% | -3,250.00% |
| 15 | Casino - Roulette Double Zero (Even Money) | -5.26% | -0.53% | -13.15% | -328.75% | -1,643.75% | -3,287.50% |
| 16 | Casino - Slots Average (92% RTP) | -8.00% | -0.80% | -20.00% | -500.00% | -2,500.00% | -5,000.00% |
| 17 | Casino - Slots Tight (85% RTP) | -15.00% | -1.50% | -37.50% | -937.50% | -4,687.50% | -9,375.00% |
| 18 | Casino - Big Six Wheel | -16.00% | -1.60% | -40.00% | -1,000.00% | -5,000.00% | -10,000.00% |
| 19 | Casino - Keno 4-Spot | -28.00% | -2.80% | -70.00% | -1,750.00% | -8,750.00% | -17,500.00% |
| 20 | Casino - Keno 10-Spot | -35.00% | -3.50% | -87.50% | -2,187.50% | -10,937.50% | -21,875.00% |

---

## Sports Betting

**Model:** Linear — N × 0.10 × edge.

| # | Name | Edge/Bet | 1 Event | 25 Events (1 Day) | 1 Year (625) | 5 Years (3,125) | 10 Years (6,250) |
|---|------|----------|---------|--------------------|--------------|--------------------|---------------------|
| 1 | Sports - Single Game Spread (Standard -110) | -4.55% | -0.46% | -11.38% | -284.38% | -1,421.88% | -2,843.75% |
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

## Prediction Markets

**Model:** Linear — N × 0.10 × edge.

| # | Name | Edge/Bet | 1 Event | 25 Events (1 Day) | 1 Year (625) | 5 Years (3,125) | 10 Years (6,250) |
|---|------|----------|---------|--------------------|--------------|--------------------|---------------------|
| 1 | Prediction - Polymarket Elections/Politics | -3.00% | -0.30% | -7.50% | -187.50% | -937.50% | -1,875.00% |
| 2 | Prediction - Polymarket SCOTUS / Major Events | -3.00% | -0.30% | -7.50% | -187.50% | -937.50% | -1,875.00% |
| 3 | Prediction - Polymarket Oscars / Culture | -4.00% | -0.40% | -10.00% | -250.00% | -1,250.00% | -2,500.00% |
| 4 | Prediction - Kalshi Economic Events | -5.50% | -0.55% | -13.75% | -343.75% | -1,718.75% | -3,437.50% |
| 5 | Prediction - Kalshi Fed Rate Decision | -5.50% | -0.55% | -13.75% | -343.75% | -1,718.75% | -3,437.50% |
| 6 | Prediction - Kalshi GDP Forecast | -6.00% | -0.60% | -15.00% | -375.00% | -1,875.00% | -3,750.00% |
| 7 | Prediction - PredictIt US Politics (5%+5% Fees) | -10.00% | -1.00% | -25.00% | -625.00% | -3,125.00% | -6,250.00% |

---

## Poker & Skill-Based

**Model:** Linear — N × 0.10 × edge.

| # | Name | Edge/Bet | 1 Event | 25 Events (1 Day) | 1 Year (625) | 5 Years (3,125) | 10 Years (6,250) |
|---|------|----------|---------|--------------------|--------------|--------------------|---------------------|
| 1 | Poker - Skilled Player (Live Cash, Top 30%) | +5.00% | +0.50% | +12.50% | +312.50% | +1,562.50% | +3,125.00% |
| 2 | DFS - Top 5% Player | +5.00% | +0.50% | +12.50% | +312.50% | +1,562.50% | +3,125.00% |
| 3 | Poker - Skilled Player (Online) | +3.00% | +0.30% | +7.50% | +187.50% | +937.50% | +1,875.00% |
| 4 | Poker - Skilled Player (Tournaments) | +2.00% | +0.20% | +5.00% | +125.00% | +625.00% | +1,250.00% |
| 5 | Poker - Average Player (Live Cash) | -5.00% | -0.50% | -12.50% | -312.50% | -1,562.50% | -3,125.00% |
| 6 | Poker - Average Player (Online) | -8.00% | -0.80% | -20.00% | -500.00% | -2,500.00% | -5,000.00% |
| 7 | DFS - Average Player | -12.00% | -1.20% | -30.00% | -750.00% | -3,750.00% | -7,500.00% |
| 8 | DFS - Casual Player | -20.00% | -2.00% | -50.00% | -1,250.00% | -6,250.00% | -12,500.00% |

---

## Options & Derivatives — Buying (Gamble Model)

**Model:** Linear — N × 0.10 × edge.

| # | Name | Edge/Trade | 1 Event | 25 Events | 1 Year (625) | 5 Years (3,125) | 10 Years (6,250) |
|---|------|------------|---------|-----------|--------------|--------------------|--------------------|
| 1 | Options - Commodity Futures (Retail Speculation) | -8.00% | -0.80% | -20.00% | -500.00% | -2,500.00% | -5,000.00% |
| 2 | Options - Buying ATM Calls/Puts (30-Day) | -15.00% | -1.50% | -37.50% | -937.50% | -4,687.50% | -9,375.00% |
| 3 | Options - Leveraged Futures Day Trading | -25.00% | -2.50% | -62.50% | -1,562.50% | -7,812.50% | -15,625.00% |
| 4 | Options - Buying OTM Calls/Puts (30-Day) | -35.00% | -3.50% | -87.50% | -2,187.50% | -10,937.50% | -21,875.00% |
| 5 | Options - 0DTE Options (Retail Average) | -50.00% | -5.00% | -125.00% | -3,125.00% | -15,625.00% | -31,250.00% |
| 6 | Options - Deep OTM Weekly Options | -60.00% | -6.00% | -150.00% | -3,750.00% | -18,750.00% | -37,500.00% |

---

## Lottery & Scratch-Offs

**Model:** Linear — N × 0.10 × edge.

| # | Name | Edge/Bet | 1 Event | 25 Events | 1 Year (625) | 5 Years (3,125) | 10 Years (6,250) |
|---|------|----------|---------|-----------|--------------|--------------------|--------------------|
| 1 | Lottery - Scratch-Off Tickets (Average State) | -35.00% | -3.50% | -87.50% | -2,187.50% | -10,937.50% | -21,875.00% |
| 2 | Lottery - Keno State-Run | -40.00% | -4.00% | -100.00% | -2,500.00% | -12,500.00% | -25,000.00% |
| 3 | Lottery - State Pick 3 / Pick 4 | -50.00% | -5.00% | -125.00% | -3,125.00% | -15,625.00% | -31,250.00% |
| 4 | Lottery - Powerball / Mega Millions | -52.00% | -5.20% | -130.00% | -3,250.00% | -16,250.00% | -32,500.00% |

---

## Stock Market (Compound Returns)

**Model:** Compound — ((1 + annual)^years - 1) × 100.

| # | Name | Annual | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|--------|---------|--------|---------|----------|
| 1 | Stocks - NASDAQ 100 Index (Buy & Hold) | +12.50% | +0.99% | +12.50% | +80.20% | +224.73% |
| 2 | Stocks - Small-Cap Value ETF (Buy & Hold) | +12.00% | +0.95% | +12.00% | +76.23% | +210.58% |
| 3 | Stocks - S&P 500 Index (Buy & Hold) | +10.00% | +0.80% | +10.00% | +61.05% | +159.37% |
| 4 | Stocks - Dow Jones Industrial Avg (Buy & Hold) | +9.50% | +0.76% | +9.50% | +57.42% | +147.82% |
| 5 | Stocks - REIT Index ETF (Buy & Hold) | +8.00% | +0.64% | +8.00% | +46.93% | +115.89% |
| 6 | Stocks - Rental Property (Net of Expenses) | +6.00% | +0.49% | +6.00% | +33.82% | +79.08% |
| 7 | Stocks - International Developed ETF (Buy & Hold) | +5.00% | +0.41% | +5.00% | +27.63% | +62.89% |
| 8 | Stocks - Emerging Markets ETF (Buy & Hold) | +4.00% | +0.33% | +4.00% | +21.67% | +48.02% |
| 9 | Stocks - Gold / Precious Metals (Buy & Hold) | +2.00% | +0.17% | +2.00% | +10.41% | +21.90% |
| 10 | Stocks - Commodity Index (Buy & Hold) | +1.00% | +0.08% | +1.00% | +5.10% | +10.46% |
| 11 | Stocks - Individual Stock Picking (Retail Avg) | -2.00% | -0.17% | -2.00% | -9.61% | -18.29% |
| 12 | Stocks - Penny Stocks (Retail Average) | -30.00% | -2.93% | -30.00% | -83.19% | -97.18% |

---

## Bond Market (Compound Returns)

| # | Name | Annual | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|--------|---------|--------|---------|----------|
| 1 | Bonds - High-Yield Corporate (Fund) | +5.50% | +0.45% | +5.50% | +30.70% | +70.81% |
| 2 | Bonds - US Treasury Bills (Current Rate) | +4.30% | +0.35% | +4.30% | +23.36% | +52.18% |
| 3 | Bonds - Total US Bond Market (Index) | +3.50% | +0.29% | +3.50% | +18.77% | +41.06% |
| 4 | Bonds - Aggregate Bond ETF | +3.00% | +0.25% | +3.00% | +15.93% | +34.39% |
| 5 | Bonds - TIPS Inflation-Protected (Real Return) | +1.50% | +0.12% | +1.50% | +7.73% | +16.05% |

---

## Cryptocurrency (Compound Returns)

| # | Name | Annual | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|--------|---------|--------|---------|----------|
| 1 | Crypto - Bitcoin Spot (Buy & Hold, Historical) | +45.00% | +3.13% | +45.00% | +547.10% | +4,087.40% |
| 2 | Crypto - Ethereum Spot (Buy & Hold) | +10.00% | +0.80% | +10.00% | +61.05% | +159.37% |
| 3 | Crypto - Stablecoin Yield Farming (DeFi) | +5.00% | +0.41% | +5.00% | +27.63% | +62.89% |
| 4 | Crypto - DeFi LP Major Pairs | +2.00% | +0.17% | +2.00% | +10.41% | +21.90% |
| 5 | Crypto - DeFi LP Volatile Pairs | -10.00% | -0.87% | -10.00% | -40.95% | -65.13% |
| 6 | Crypto - Altcoin Portfolio (Retail Avg) | -15.00% | -1.35% | -15.00% | -55.63% | -80.31% |
| 7 | Crypto - Meme Coins (Retail Average) | -70.00% | -9.71% | -70.00% | -99.76% | -99.99% |

---

## Options & Derivatives — Selling (Compound Returns)

| # | Name | Annual | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|--------|---------|--------|---------|----------|
| 1 | Options - Iron Condor Selling (Monthly) | +10.00% | +0.80% | +10.00% | +61.05% | +159.37% |
| 2 | Options - Cash-Secured Put Selling (Monthly) | +8.00% | +0.64% | +8.00% | +46.93% | +115.89% |
| 3 | Options - Covered Call Writing (Monthly) | +7.00% | +0.57% | +7.00% | +40.26% | +96.72% |
| 4 | Options - Managed Futures / CTA Fund | +3.00% | +0.25% | +3.00% | +15.93% | +34.39% |

---

## Active Trading (Compound Returns)

| # | Name | Annual | 1 Month | 1 Year | 5 Years | 10 Years |
|---|------|--------|---------|--------|---------|----------|
| 1 | Trading - Swing Trading (Retail Average) | -5.00% | -0.43% | -5.00% | -22.62% | -40.13% |
| 2 | Trading - Retail Forex (Leveraged) | -25.00% | -2.37% | -25.00% | -76.27% | -94.37% |
| 3 | Trading - Retail Day Trading | -30.00% | -2.93% | -30.00% | -83.19% | -97.18% |
| 4 | Trading - Crypto Day Trading (Retail) | -35.00% | -3.53% | -35.00% | -88.40% | -98.65% |

---

## Master Ranking: 1-Year Returns (All Activities)

Sorted from best to worst. Gambling items show 625-event linear return. Investment items show 1-year compound return.

| Rank | Name | Model | 1-Year Return |
|------|------|-------|---------------|
| 1 | Poker - Skilled (Live Cash) | Gamble | +312.50% |
| 2 | DFS - Top 5% Player | Gamble | +312.50% |
| 3 | Poker - Skilled (Online) | Gamble | +187.50% |
| 4 | Poker - Skilled (Tournaments) | Gamble | +125.00% |
| 5 | Casino - Blackjack (Card Counting) | Gamble | +62.50% |
| 6 | Crypto - Bitcoin Spot (Buy & Hold) | Invest | +45.00% |
| 7 | Stocks - NASDAQ 100 Index | Invest | +12.50% |
| 8 | Stocks - Small-Cap Value ETF | Invest | +12.00% |
| 9 | Stocks - S&P 500 Index | Invest | +10.00% |
| 10 | Options - Iron Condor Selling | Invest | +10.00% |
| 11 | Crypto - Ethereum Spot | Invest | +10.00% |
| 12 | Stocks - Dow Jones Industrial Avg | Invest | +9.50% |
| 13 | Stocks - REIT Index ETF | Invest | +8.00% |
| 14 | Options - Cash-Secured Put Selling | Invest | +8.00% |
| 15 | Options - Covered Call Writing | Invest | +7.00% |
| 16 | Stocks - Rental Property (Net) | Invest | +6.00% |
| 17 | Bonds - High-Yield Corporate | Invest | +5.50% |
| 18 | Stocks - International Developed ETF | Invest | +5.00% |
| 19 | Crypto - Stablecoin Yield Farming | Invest | +5.00% |
| 20 | Bonds - US Treasury Bills | Invest | +4.30% |
| 21 | Stocks - Emerging Markets ETF | Invest | +4.00% |
| 22 | Bonds - Total US Bond Market | Invest | +3.50% |
| 23 | Bonds - Aggregate Bond ETF | Invest | +3.00% |
| 24 | Options - Managed Futures / CTA | Invest | +3.00% |
| 25 | Stocks - Gold / Precious Metals | Invest | +2.00% |
| 26 | Crypto - DeFi LP Major Pairs | Invest | +2.00% |
| 27 | Bonds - TIPS (Real Return) | Invest | +1.50% |
| 28 | Stocks - Commodity Index | Invest | +1.00% |
| --- | **=== BREAK EVEN ===** | | **0.00%** |
| 29 | Stocks - Individual Stock Picking (Retail) | Invest | -2.00% |
| 30 | Trading - Swing Trading (Retail) | Invest | -5.00% |
| 31 | Crypto - DeFi LP Volatile Pairs | Invest | -10.00% |
| 32 | Crypto - Altcoin Portfolio (Retail) | Invest | -15.00% |
| 33 | Trading - Retail Forex | Invest | -25.00% |
| 34 | Casino - Video Poker 9/6 JoB | Gamble | -28.75% |
| 35 | Trading - Retail Day Trading | Invest | -30.00% |
| 36 | Stocks - Penny Stocks (Retail) | Invest | -30.00% |
| 37 | Casino - Blackjack 3:2 (Basic Strategy) | Gamble | -31.25% |
| 38 | Trading - Crypto Day Trading | Invest | -35.00% |
| 39 | Casino - Baccarat Banker | Gamble | -66.25% |
| 40 | Crypto - Meme Coins (Retail) | Invest | -70.00% |
| 41 | Casino - Baccarat Player | Gamble | -77.50% |
| 42 | Casino - Craps Don't Pass | Gamble | -85.00% |
| 43 | Casino - Craps Pass Line | Gamble | -88.13% |
| 44 | Casino - Blackjack 6:5 (Basic Strategy) | Gamble | -125.00% |
| 45 | Casino - Pai Gow Poker | Gamble | -156.25% |
| 46 | Casino - Roulette Single Zero | Gamble | -168.75% |
| 47 | Prediction - Polymarket Elections | Gamble | -187.50% |
| 48 | Casino - Three Card Poker | Gamble | -212.50% |
| 49 | Casino - Let It Ride | Gamble | -218.75% |
| 50 | Prediction - Polymarket Oscars | Gamble | -250.00% |
| 51 | Sports - Single Game Spread (-110) | Gamble | -284.38% |
| 52 | Sports - Single Game O/U (-110) | Gamble | -284.38% |
| 53 | Sports - Moneyline (Standard) | Gamble | -284.38% |
| 54 | Casino - Slots Loose (95% RTP) | Gamble | -312.50% |
| 55 | Poker - Average (Live Cash) | Gamble | -312.50% |
| 56 | Sports - Teaser 2-Team | Gamble | -312.50% |
| 57 | Casino - Caribbean Stud | Gamble | -325.00% |
| 58 | Casino - Roulette Double Zero | Gamble | -328.75% |
| 59 | Prediction - Kalshi Economic Events | Gamble | -343.75% |
| 60 | Prediction - Kalshi Fed Rate | Gamble | -343.75% |
| 61 | Prediction - Kalshi GDP Forecast | Gamble | -375.00% |
| 62 | Sports - Live / In-Game Betting | Gamble | -406.25% |
| 63 | Sports - Player Prop Bet | Gamble | -437.50% |
| 64 | Casino - Slots Average (92% RTP) | Gamble | -500.00% |
| 65 | Poker - Average (Online) | Gamble | -500.00% |
| 66 | Sports - Season Win Total Future | Gamble | -500.00% |
| 67 | Options - Commodity Futures (Retail) | Gamble | -500.00% |
| 68 | Sports - 2-Team Parlay | Gamble | -625.00% |
| 69 | Prediction - PredictIt (5%+5% Fees) | Gamble | -625.00% |
| 70 | DFS - Average Player | Gamble | -750.00% |
| 71 | Sports - Championship Future | Gamble | -750.00% |
| 72 | Sports - 3-Team Parlay | Gamble | -781.25% |
| 73 | Options - ATM Options Buying (30-Day) | Gamble | -937.50% |
| 74 | Sports - 4-Team Parlay | Gamble | -937.50% |
| 75 | Sports - Same-Game Parlay (SGP) | Gamble | -937.50% |
| 76 | Casino - Slots Tight (85% RTP) | Gamble | -937.50% |
| 77 | Casino - Big Six Wheel | Gamble | -1,000.00% |
| 78 | Sports - First Touchdown Scorer | Gamble | -1,125.00% |
| 79 | DFS - Casual Player | Gamble | -1,250.00% |
| 80 | Sports - 5-Team Parlay | Gamble | -1,250.00% |
| 81 | Sports - Correct Score (Soccer) | Gamble | -1,250.00% |
| 82 | Sports - 6-Team Parlay | Gamble | -1,562.50% |
| 83 | Options - Leveraged Futures Day Trading | Gamble | -1,562.50% |
| 84 | Casino - Keno 4-Spot | Gamble | -1,750.00% |
| 85 | Sports - 8-Team Parlay | Gamble | -1,875.00% |
| 86 | Casino - Keno 10-Spot | Gamble | -2,187.50% |
| 87 | Lottery - Scratch-Off Tickets | Gamble | -2,187.50% |
| 88 | Options - OTM Options Buying (30-Day) | Gamble | -2,187.50% |
| 89 | Sports - 10-Team Parlay | Gamble | -2,187.50% |
| 90 | Lottery - Keno State-Run | Gamble | -2,500.00% |
| 91 | Options - 0DTE Options (Retail Avg) | Gamble | -3,125.00% |
| 92 | Lottery - State Pick 3 / Pick 4 | Gamble | -3,125.00% |
| 93 | Lottery - Powerball / Mega Millions | Gamble | -3,250.00% |
| 94 | Options - Deep OTM Weekly Options | Gamble | -3,750.00% |

---

## The Scale of Destruction

At the 1-year mark (625 events), here's the range:

| What | 1-Year Return | Plain English |
|------|---------------|---------------|
| Skilled Poker Player | +312.50% | You tripled your money |
| S&P 500 Buy & Hold | +10.00% | You gained a tenth |
| Single Roulette Spin | -0.53% | Barely felt it |
| 1 Year of Blackjack 3:2 | -31.25% | Lost a third of your starting stake |
| 1 Year of Roulette (DZ) | -328.75% | Lost 3.3x your starting capital |
| 1 Year of 2-Team Parlays | -625.00% | Lost 6.25x your starting capital |
| 1 Year of Slots (Average) | -500.00% | Lost 5x your starting capital |
| 1 Year of 5-Team Parlays | -1,250.00% | Lost 12.5x your starting capital |
| 1 Year of 0DTE Options | -3,125.00% | Lost 31.25x your starting capital |
| 1 Year of Powerball | -3,250.00% | Lost 32.5x your starting capital |
| 1 Year of Deep OTM Weeklies | -3,750.00% | Lost 37.5x your starting capital |

The S&P 500 goes +10%. Deep OTM options go -3,750%. That's a 3,760 percentage point spread. One is building wealth. The other is setting money on fire at industrial scale.
