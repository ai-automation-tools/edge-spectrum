# Edge Analysis V2: Standardized Time Horizons

**Date:** March 25, 2026
**Purpose:** What does $100 become across standardized time horizons for every bet, trade, and investment?

---

## Methodology

### Metric: "$100 Becomes..."
Every row answers the same question: **If you start with $100, what is your expected balance at each time horizon?**

### Time Horizons
| Column | Gambling | Investing |
|--------|----------|-----------|
| **1 Event** | 1 bet / spin / hand | 1 month of market exposure |
| **25 Events (1 Day)** | 25 bets in a session | ~2 years equivalent |
| **1 Year (625 Events)** | 25 sessions x 25 bets/session | 1 calendar year |
| **5 Years (3,125 Events)** | 5 years of regular play | 5 calendar years |
| **10 Years (6,250 Events)** | 10 years of regular play | 10 calendar years |

### Assumptions
- **Gambling/Betting:** $100 starting bankroll, wagering 10% of current bankroll per event. Multiplicative model: Balance = $100 x (1 + 0.10 x edge)^N. Once balance drops below $0.01, shown as **$0 (Bust)**.
- **Investing:** $100 initial investment, compound annual returns. Monthly return derived from annual: (1 + annual)^(1/12) - 1.
- **Sports Betting:** Same 10% proportional model as casino gambling.
- **Options/Derivatives:** Edge expressed as annualized return on capital; compounded like investments.
- **Active Trading:** Edge expressed as annualized return on capital; compounded like investments.

### Naming Convention
**Category - Subcategory (Conditions)**
- Category: The domain (Casino, Sports, Stock Market, etc.)
- Subcategory: The specific game, instrument, or strategy
- Conditions: Rules, skill level, and/or time horizon that affect the edge

---

## Casino Gambling

Edge = house advantage per dollar wagered. Player bets 10% of bankroll per hand/spin/roll.

| # | Category - Subcategory (Conditions) | Edge/Bet | 1 Event | 25 Events | 625 Events (1 Yr) | 3,125 Events (5 Yr) | 6,250 Events (10 Yr) |
|---|--------------------------------------|----------|---------|-----------|--------------------|-----------------------|------------------------|
| 1 | Casino - Blackjack (1 Hand, Card Counting Hi-Lo) | +1.00% | $100.10 | $102.53 | $186.77 | $2,290 | $52,450 |
| 2 | Casino - Video Poker 9/6 JoB (1 Hand, Perfect Strategy) | -0.46% | $99.95 | $98.86 | $75.02 | $23.63 | $5.58 |
| 3 | Casino - Blackjack 3:2 (1 Hand, Basic Strategy) | -0.50% | $99.95 | $98.76 | $73.17 | $20.98 | $4.40 |
| 4 | Casino - Baccarat Banker (1 Hand, 5% Commission) | -1.06% | $99.89 | $97.38 | $51.49 | $3.65 | $0.13 |
| 5 | Casino - Baccarat Player (1 Hand) | -1.24% | $99.88 | $96.94 | $45.92 | $2.11 | $0.04 |
| 6 | Casino - Craps Don't Pass (1 Roll) | -1.36% | $99.86 | $96.65 | $42.73 | $1.49 | $0.02 |
| 7 | Casino - Craps Pass Line (1 Roll) | -1.41% | $99.86 | $96.53 | $41.52 | $1.32 | $0.02 |
| 8 | Casino - Blackjack 6:5 (1 Hand, Basic Strategy) | -2.00% | $99.80 | $95.12 | $28.63 | $0.24 | $0.00 |
| 9 | Casino - Pai Gow Poker (1 Hand) | -2.50% | $99.75 | $93.94 | $20.85 | $0.04 | $0.00 |
| 10 | Casino - Roulette Single Zero (1 Spin, Even Money) | -2.70% | $99.73 | $93.47 | $18.33 | $0.02 | $0.00 |
| 11 | Casino - Three Card Poker (1 Hand, Ante/Play) | -3.40% | $99.66 | $91.83 | $12.12 | $0.00 | $0.00 |
| 12 | Casino - Let It Ride (1 Hand) | -3.50% | $99.65 | $91.60 | $11.28 | $0.00 | $0.00 |
| 13 | Casino - Slots Loose (1 Spin, 95% RTP) | -5.00% | $99.50 | $88.22 | $4.45 | $0.00 | $0.00 |
| 14 | Casino - Caribbean Stud Poker (1 Hand) | -5.20% | $99.48 | $87.81 | $3.94 | $0.00 | $0.00 |
| 15 | Casino - Roulette Double Zero (1 Spin, Even Money) | -5.26% | $99.47 | $87.67 | $3.79 | $0.00 | $0.00 |
| 16 | Casino - Slots Average (1 Spin, 92% RTP) | -8.00% | $99.20 | $81.85 | $0.66 | $0.00 | $0.00 |
| 17 | Casino - Slots Tight (1 Spin, 85% RTP) | -15.00% | $98.50 | $68.53 | $0.00 | $0.00 | $0.00 |
| 18 | Casino - Big Six Wheel (1 Spin) | -16.00% | $98.40 | $66.83 | $0.00 | $0.00 | $0.00 |
| 19 | Casino - Keno 4-Spot (1 Draw) | -28.00% | $97.20 | $48.82 | $0.00 | $0.00 | $0.00 |
| 20 | Casino - Keno 10-Spot (1 Draw) | -35.00% | $96.50 | $40.98 | $0.00 | $0.00 | $0.00 |

---

## Sports Betting

Same proportional model: 10% of bankroll per wager.

| # | Category - Subcategory (Conditions) | Edge/Bet | 1 Event | 25 Events | 625 Events (1 Yr) | 3,125 Events (5 Yr) | 6,250 Events (10 Yr) |
|---|--------------------------------------|----------|---------|-----------|--------------------|-----------------------|------------------------|
| 1 | Sports - Single Game Spread (1 Bet, Standard -110) | -4.55% | $99.55 | $89.26 | $6.67 | $0.00 | $0.00 |
| 2 | Sports - Single Game Over/Under (1 Bet, Standard -110) | -4.55% | $99.55 | $89.26 | $6.67 | $0.00 | $0.00 |
| 3 | Sports - Moneyline (1 Bet, Standard Juice) | -4.55% | $99.55 | $89.26 | $6.67 | $0.00 | $0.00 |
| 4 | Sports - Teaser 2-Team 6pt (1 Bet) | -5.00% | $99.50 | $88.22 | $4.45 | $0.00 | $0.00 |
| 5 | Sports - Live / In-Game Bet (1 Bet) | -6.50% | $99.35 | $84.94 | $1.81 | $0.00 | $0.00 |
| 6 | Sports - Player Prop Bet (1 Bet) | -7.00% | $99.30 | $83.90 | $1.31 | $0.00 | $0.00 |
| 7 | Sports - Season Win Total Future (1 Bet) | -8.00% | $99.20 | $81.85 | $0.66 | $0.00 | $0.00 |
| 8 | Sports - 2-Team Parlay (1 Bet) | -10.00% | $99.00 | $77.78 | $0.18 | $0.00 | $0.00 |
| 9 | Sports - Championship Future (1 Bet) | -12.00% | $98.80 | $73.97 | $0.05 | $0.00 | $0.00 |
| 10 | Sports - 3-Team Parlay (1 Bet) | -12.50% | $98.75 | $72.99 | $0.04 | $0.00 | $0.00 |
| 11 | Sports - 4-Team Parlay (1 Bet) | -15.00% | $98.50 | $68.53 | $0.00 | $0.00 | $0.00 |
| 12 | Sports - Same-Game Parlay / SGP (1 Bet) | -15.00% | $98.50 | $68.53 | $0.00 | $0.00 | $0.00 |
| 13 | Sports - First Touchdown Scorer (1 Bet) | -18.00% | $98.20 | $63.52 | $0.00 | $0.00 | $0.00 |
| 14 | Sports - 5-Team Parlay (1 Bet) | -20.00% | $98.00 | $60.35 | $0.00 | $0.00 | $0.00 |
| 15 | Sports - Correct Score Soccer (1 Bet) | -20.00% | $98.00 | $60.35 | $0.00 | $0.00 | $0.00 |
| 16 | Sports - 6-Team Parlay (1 Bet) | -25.00% | $97.50 | $52.99 | $0.00 | $0.00 | $0.00 |
| 17 | Sports - 8-Team Parlay (1 Bet) | -30.00% | $97.00 | $46.76 | $0.00 | $0.00 | $0.00 |
| 18 | Sports - 10-Team Parlay (1 Bet) | -35.00% | $96.50 | $40.98 | $0.00 | $0.00 | $0.00 |

---

## Prediction Markets

| # | Category - Subcategory (Conditions) | Edge/Bet | 1 Event | 25 Events | 625 Events (1 Yr) | 3,125 Events (5 Yr) | 6,250 Events (10 Yr) |
|---|--------------------------------------|----------|---------|-----------|--------------------|-----------------------|------------------------|
| 1 | Prediction - Polymarket Election/Politics (1 Contract) | -3.00% | $99.70 | $92.76 | $15.19 | $0.01 | $0.00 |
| 2 | Prediction - Polymarket SCOTUS Retirement (1 Contract) | -3.00% | $99.70 | $92.76 | $15.19 | $0.01 | $0.00 |
| 3 | Prediction - Polymarket Oscar Best Picture (1 Contract) | -4.00% | $99.60 | $90.41 | $8.36 | $0.00 | $0.00 |
| 4 | Prediction - Kalshi Economic Events (1 Contract) | -5.50% | $99.45 | $87.13 | $3.06 | $0.00 | $0.00 |
| 5 | Prediction - Kalshi Fed Rate Cut (1 Contract) | -5.50% | $99.45 | $87.13 | $3.06 | $0.00 | $0.00 |
| 6 | Prediction - Kalshi US GDP > 3% (1 Contract) | -6.00% | $99.40 | $86.09 | $2.39 | $0.00 | $0.00 |
| 7 | Prediction - PredictIt US Politics (1 Contract, 5%+5% Fees) | -10.00% | $99.00 | $77.78 | $0.18 | $0.00 | $0.00 |

---

## Poker & Skill-Based Games

Results vary dramatically by skill level. Same proportional betting model.

| # | Category - Subcategory (Conditions) | Edge/Bet | 1 Event | 25 Events | 625 Events (1 Yr) | 3,125 Events (5 Yr) | 6,250 Events (10 Yr) |
|---|--------------------------------------|----------|---------|-----------|--------------------|-----------------------|------------------------|
| 1 | Poker - Live Cash Game (1 Session, Top 30% Skilled) | +5.00% | $100.50 | $113.28 | $2,298 | $6.1M* | Astronomical* |
| 2 | Poker - Online Cash Game (1 Session, Top 20% Skilled) | +3.00% | $100.30 | $107.78 | $651 | $289K* | Astronomical* |
| 3 | Poker - Tournament (1 Event, Top 20% Skilled) | +2.00% | $100.20 | $105.12 | $349 | $43K* | Astronomical* |
| 4 | Poker - Live Cash Game (1 Session, Average Player) | -5.00% | $99.50 | $88.22 | $4.45 | $0.00 | $0.00 |
| 5 | Poker - Online Cash Game (1 Session, Average Player) | -8.00% | $99.20 | $81.85 | $0.66 | $0.00 | $0.00 |
| 6 | DFS - Daily Fantasy (1 Contest, Top 5% Player) | +5.00% | $100.50 | $113.28 | $2,298 | $6.1M* | Astronomical* |
| 7 | DFS - Daily Fantasy (1 Contest, Average Player) | -12.00% | $98.80 | $73.97 | $0.05 | $0.00 | $0.00 |
| 8 | DFS - Daily Fantasy (1 Contest, Casual Player) | -20.00% | $98.00 | $60.35 | $0.00 | $0.00 | $0.00 |

*Theoretical maximums assuming consistent edge and unlimited games. In practice, game availability, stakes, rake increases, and skill erosion cap real-world returns well below these figures.*

---

## Lottery & Scratch-Offs

| # | Category - Subcategory (Conditions) | Edge/Bet | 1 Event | 25 Events | 625 Events (1 Yr) | 3,125 Events (5 Yr) | 6,250 Events (10 Yr) |
|---|--------------------------------------|----------|---------|-----------|--------------------|-----------------------|------------------------|
| 1 | Lottery - Scratch-Off Tickets (1 Ticket, Average State) | -35.00% | $96.50 | $40.98 | $0.00 | $0.00 | $0.00 |
| 2 | Lottery - Keno State-Run (1 Draw) | -40.00% | $96.00 | $36.04 | $0.00 | $0.00 | $0.00 |
| 3 | Lottery - State Pick 3 / Pick 4 (1 Draw) | -50.00% | $95.00 | $27.74 | $0.00 | $0.00 | $0.00 |
| 4 | Lottery - Powerball / Mega Millions (1 Ticket) | -52.00% | $94.80 | $26.53 | $0.00 | $0.00 | $0.00 |

---

## Stock Market (Compound Returns on $100 Invested)

Returns compound annually. "1 Event" = 1 month. "25 Events" column not applicable (N/A) for long-term investments — shown as ~2 year equivalent where possible.

| # | Category - Subcategory (Conditions) | Annual Return | 1 Month | 1 Year | 5 Years | 10 Years |
|---|--------------------------------------|---------------|---------|--------|---------|----------|
| 1 | Stocks - NASDAQ 100 Index (Buy & Hold) | +12.50% | $100.99 | $112.50 | $180.20 | $324.73 |
| 2 | Stocks - Small-Cap Value ETF (Buy & Hold) | +12.00% | $100.95 | $112.00 | $176.23 | $310.58 |
| 3 | Stocks - S&P 500 Index (Buy & Hold) | +10.00% | $100.80 | $110.00 | $161.05 | $259.37 |
| 4 | Stocks - Dow Jones Industrial Avg (Buy & Hold) | +9.50% | $100.76 | $109.50 | $157.42 | $247.82 |
| 5 | Stocks - REIT Index ETF (Buy & Hold) | +8.00% | $100.64 | $108.00 | $146.93 | $215.89 |
| 6 | Stocks - Rental Property (Net of Expenses) | +6.00% | $100.49 | $106.00 | $133.82 | $179.08 |
| 7 | Stocks - International Developed ETF (Buy & Hold) | +5.00% | $100.41 | $105.00 | $127.63 | $162.89 |
| 8 | Stocks - Emerging Markets ETF (Buy & Hold) | +4.00% | $100.33 | $104.00 | $121.67 | $148.02 |
| 9 | Stocks - Gold / Precious Metals (Buy & Hold) | +2.00% | $100.17 | $102.00 | $110.41 | $121.90 |
| 10 | Stocks - Commodity Index (Buy & Hold) | +1.00% | $100.08 | $101.00 | $105.10 | $110.46 |
| 11 | Stocks - Individual Stock Picking (Retail Average) | -2.00% | $99.83 | $98.00 | $90.39 | $81.71 |
| 12 | Stocks - Penny Stocks (Retail Average) | -30.00% | $97.08 | $70.00 | $16.81 | $2.82 |

---

## Bond Market (Compound Returns on $100 Invested)

| # | Category - Subcategory (Conditions) | Annual Return | 1 Month | 1 Year | 5 Years | 10 Years |
|---|--------------------------------------|---------------|---------|--------|---------|----------|
| 1 | Bonds - High-Yield Corporate (Annual, Fund) | +5.50% | $100.45 | $105.50 | $130.70 | $170.81 |
| 2 | Bonds - US Treasury Bills (Annual, Current Rate) | +4.30% | $100.35 | $104.30 | $123.36 | $152.18 |
| 3 | Bonds - Total US Bond Market (Annual, Index) | +3.50% | $100.29 | $103.50 | $118.77 | $141.06 |
| 4 | Bonds - Aggregate Bond ETF (Annual) | +3.00% | $100.25 | $103.00 | $115.93 | $134.39 |
| 5 | Bonds - TIPS Inflation-Protected (Annual, Real Return) | +1.50% | $100.12 | $101.50 | $107.73 | $116.05 |

---

## Cryptocurrency (Compound Returns on $100 Invested)

*Crypto returns are based on historical averages and are highly volatile. Past performance does not predict future results. These figures would be dramatically different depending on entry/exit timing.*

| # | Category - Subcategory (Conditions) | Annual Return | 1 Month | 1 Year | 5 Years | 10 Years |
|---|--------------------------------------|---------------|---------|--------|---------|----------|
| 1 | Crypto - Bitcoin Spot (Buy & Hold, Historical Avg) | +45.00% | $103.13 | $145.00 | $647.10 | $4,187.40 |
| 2 | Crypto - Ethereum Spot (Buy & Hold, Historical Avg) | +10.00% | $100.80 | $110.00 | $161.05 | $259.37 |
| 3 | Crypto - Stablecoin Yield Farming (DeFi, Major Protocols) | +5.00% | $100.41 | $105.00 | $127.63 | $162.89 |
| 4 | Crypto - DeFi Liquidity Provision Major Pairs (Annual) | +2.00% | $100.17 | $102.00 | $110.41 | $121.90 |
| 5 | Crypto - DeFi Liquidity Provision Volatile Pairs (Annual) | -10.00% | $99.12 | $90.00 | $59.05 | $34.87 |
| 6 | Crypto - Altcoin Portfolio Diversified (Retail Average) | -15.00% | $98.65 | $85.00 | $44.37 | $19.69 |
| 7 | Crypto - Meme Coins (Retail Average Per Cycle) | -70.00% | $90.29 | $30.00 | $0.24 | $0.00 |

---

## Options & Derivatives

Selling strategies shown as annualized returns on capital (compound). Buying strategies use the gambling model (10% bankroll per trade).

### Options Selling (Compound Annual Returns on $100 Capital)

| # | Category - Subcategory (Conditions) | Annual Return | 1 Month | 1 Year | 5 Years | 10 Years |
|---|--------------------------------------|---------------|---------|--------|---------|----------|
| 1 | Options - Iron Condor Selling (Monthly, Defined Risk) | +10.00% | $100.80 | $110.00 | $161.05 | $259.37 |
| 2 | Options - Cash-Secured Put Selling (Monthly) | +8.00% | $100.64 | $108.00 | $146.93 | $215.89 |
| 3 | Options - Covered Call Writing (Monthly, on ETF) | +7.00% | $100.57 | $107.00 | $140.26 | $196.72 |
| 4 | Options - Managed Futures / CTA Fund (Annual) | +3.00% | $100.25 | $103.00 | $115.93 | $134.39 |

### Options Buying (Gambling Model, 10% Bankroll Per Trade)

| # | Category - Subcategory (Conditions) | Edge/Trade | 1 Event | 25 Events | 625 Events (1 Yr) | 3,125 Events (5 Yr) | 6,250 Events (10 Yr) |
|---|--------------------------------------|------------|---------|-----------|--------------------|-----------------------|------------------------|
| 1 | Options - Retail Commodity Futures (1 Trade) | -8.00% | $99.20 | $81.85 | $0.66 | $0.00 | $0.00 |
| 2 | Options - Buying ATM Calls/Puts 30-Day (1 Trade) | -15.00% | $98.50 | $68.53 | $0.00 | $0.00 | $0.00 |
| 3 | Options - Leveraged Futures Day Trading (1 Trade) | -25.00% | $97.50 | $52.99 | $0.00 | $0.00 | $0.00 |
| 4 | Options - Buying OTM Calls/Puts 30-Day (1 Trade) | -35.00% | $96.50 | $40.98 | $0.00 | $0.00 | $0.00 |
| 5 | Options - 0DTE Options (1 Trade, Retail Average) | -50.00% | $95.00 | $27.74 | $0.00 | $0.00 | $0.00 |
| 6 | Options - Deep OTM Weekly Options (1 Trade) | -60.00% | $94.00 | $21.51 | $0.00 | $0.00 | $0.00 |

---

## Active Trading (Compound Annual Returns on $100 Capital)

| # | Category - Subcategory (Conditions) | Annual Return | 1 Month | 1 Year | 5 Years | 10 Years |
|---|--------------------------------------|---------------|---------|--------|---------|----------|
| 1 | Trading - Swing Trading (Retail Average, Annual) | -5.00% | $99.57 | $95.00 | $77.38 | $59.87 |
| 2 | Trading - Retail Forex (Leveraged, Annual) | -25.00% | $97.63 | $75.00 | $23.73 | $5.63 |
| 3 | Trading - Retail Day Trading (Annual Average) | -30.00% | $97.08 | $70.00 | $16.81 | $2.82 |
| 4 | Trading - Crypto Day Trading (Retail Average) | -35.00% | $96.44 | $65.00 | $11.60 | $1.35 |

---

## Master Ranking: 1-Year Comparison

All activities normalized to 1-year equivalent. **"$100 Becomes..."** after 1 year of regular participation.

| Rank | Category - Subcategory (Conditions) | $100 Becomes | Return |
|------|--------------------------------------|--------------|--------|
| 1 | Crypto - Bitcoin Spot (Buy & Hold) | $145.00 | +45.0% |
| 2 | Stocks - NASDAQ 100 Index (Buy & Hold) | $112.50 | +12.5% |
| 3 | Stocks - Small-Cap Value ETF (Buy & Hold) | $112.00 | +12.0% |
| 4 | Stocks - S&P 500 Index (Buy & Hold) | $110.00 | +10.0% |
| 5 | Crypto - Ethereum Spot (Buy & Hold) | $110.00 | +10.0% |
| 6 | Options - Iron Condor Selling (Monthly) | $110.00 | +10.0% |
| 7 | Stocks - Dow Jones Industrial Avg (Buy & Hold) | $109.50 | +9.5% |
| 8 | Stocks - REIT Index ETF (Buy & Hold) | $108.00 | +8.0% |
| 9 | Options - Cash-Secured Put Selling (Monthly) | $108.00 | +8.0% |
| 10 | Options - Covered Call Writing (Monthly) | $107.00 | +7.0% |
| 11 | Stocks - Rental Property (Net of Expenses) | $106.00 | +6.0% |
| 12 | Bonds - High-Yield Corporate (Fund) | $105.50 | +5.5% |
| 13 | Stocks - International Developed ETF (Buy & Hold) | $105.00 | +5.0% |
| 14 | Crypto - Stablecoin Yield Farming (DeFi) | $105.00 | +5.0% |
| 15 | Bonds - US Treasury Bills (Current Rate) | $104.30 | +4.3% |
| 16 | Stocks - Emerging Markets ETF (Buy & Hold) | $104.00 | +4.0% |
| 17 | Bonds - Total US Bond Market (Index) | $103.50 | +3.5% |
| 18 | Bonds - Aggregate Bond ETF | $103.00 | +3.0% |
| 19 | Options - Managed Futures / CTA Fund | $103.00 | +3.0% |
| 20 | Stocks - Gold / Precious Metals (Buy & Hold) | $102.00 | +2.0% |
| 21 | Crypto - DeFi LP Major Pairs | $102.00 | +2.0% |
| 22 | Bonds - TIPS (Real Return) | $101.50 | +1.5% |
| 23 | Stocks - Commodity Index (Buy & Hold) | $101.00 | +1.0% |
| --- | **=== BREAK EVEN LINE ===** | **$100.00** | **0.0%** |
| 24 | Stocks - Individual Stock Picking (Retail Avg) | $98.00 | -2.0% |
| 25 | Trading - Swing Trading (Retail Average) | $95.00 | -5.0% |
| 26 | Crypto - DeFi LP Volatile Pairs | $90.00 | -10.0% |
| 27 | Crypto - Altcoin Portfolio (Retail Average) | $85.00 | -15.0% |
| 28 | Casino - Blackjack 3:2 (625 Hands, Basic Strategy) | $73.17 | -26.8% |
| 29 | Casino - Video Poker 9/6 JoB (625 Hands, Perfect Play) | $75.02 | -25.0% |
| 30 | Trading - Retail Forex (Leveraged) | $75.00 | -25.0% |
| 31 | Trading - Retail Day Trading | $70.00 | -30.0% |
| 32 | Stocks - Penny Stocks (Retail Average) | $70.00 | -30.0% |
| 33 | Crypto - Meme Coins (Retail Average) | $30.00 | -70.0% |
| 34 | Trading - Crypto Day Trading (Retail Average) | $65.00 | -35.0% |
| 35 | Casino - Baccarat Banker (625 Hands) | $51.49 | -48.5% |
| 36 | Casino - Craps Pass Line (625 Rolls) | $41.52 | -58.5% |
| 37 | Casino - Roulette Single Zero (625 Spins) | $18.33 | -81.7% |
| 38 | Casino - Blackjack 6:5 (625 Hands, Basic Strategy) | $28.63 | -71.4% |
| 39 | Prediction - Polymarket Elections (625 Contracts) | $15.19 | -84.8% |
| 40 | Casino - Three Card Poker (625 Hands) | $12.12 | -87.9% |
| 41 | Casino - Let It Ride (625 Hands) | $11.28 | -88.7% |
| 42 | Sports - Single Game Spread (625 Bets, -110) | $6.67 | -93.3% |
| 43 | Casino - Slots Loose 95% RTP (625 Spins) | $4.45 | -95.6% |
| 44 | Casino - Roulette Double Zero (625 Spins) | $3.79 | -96.2% |
| 45 | Prediction - Kalshi Economic Events (625 Contracts) | $3.06 | -96.9% |
| 46 | Casino - Slots Average 92% RTP (625 Spins) | $0.66 | -99.3% |
| 47 | Options - Retail Commodity Futures (625 Trades) | $0.66 | -99.3% |
| 48 | Sports - 2-Team Parlay (625 Bets) | $0.18 | -99.8% |
| 49 | Prediction - PredictIt US Politics (625 Contracts) | $0.18 | -99.8% |
| 50 | Sports - 3-Team Parlay (625 Bets) | $0.04 | -100.0% |
| 51 | Sports - 4-Team Parlay (625 Bets) | $0.00 | -100.0% |
| 52 | Sports - Same-Game Parlay (625 Bets) | $0.00 | -100.0% |
| 53 | Sports - 5-Team Parlay (625 Bets) | $0.00 | -100.0% |
| 54 | Sports - 6-Team Parlay (625 Bets) | $0.00 | -100.0% |
| 55 | Sports - 8-Team Parlay (625 Bets) | $0.00 | -100.0% |
| 56 | Sports - 10-Team Parlay (625 Bets) | $0.00 | -100.0% |
| 57 | Casino - Slots Tight 85% RTP (625 Spins) | $0.00 | -100.0% |
| 58 | Casino - Keno 4-Spot (625 Draws) | $0.00 | -100.0% |
| 59 | Casino - Keno 10-Spot (625 Draws) | $0.00 | -100.0% |
| 60 | Options - ATM Options Buying (625 Trades) | $0.00 | -100.0% |
| 61 | Options - OTM Options Buying (625 Trades) | $0.00 | -100.0% |
| 62 | Options - 0DTE Options (625 Trades) | $0.00 | -100.0% |
| 63 | Options - Deep OTM Weeklies (625 Trades) | $0.00 | -100.0% |
| 64 | Lottery - Scratch-Off Tickets (625 Tickets) | $0.00 | -100.0% |
| 65 | Lottery - Keno State-Run (625 Draws) | $0.00 | -100.0% |
| 66 | Lottery - State Pick 3/4 (625 Draws) | $0.00 | -100.0% |
| 67 | Lottery - Powerball / Mega Millions (625 Tickets) | $0.00 | -100.0% |

---

## Key Takeaways

### The Power of Compounding Works Both Ways
- **S&P 500:** $100 → $259 in 10 years. The market pays you to wait.
- **Blackjack 3:2 (best table odds):** $100 → $4.40 in 10 years of regular play. Even the "best" casino game grinds you to zero.
- **Double zero roulette:** $100 → $3.79 after just ONE YEAR of regular play (625 spins).

### The Parlay Trap
- A single spread bet at -110 leaves you with $6.67 after a year of betting. Bad, but you survive.
- A 3-team parlay habit? $0.04 after a year. You are guaranteed to go broke.
- Every additional parlay leg is an exponential accelerant toward ruin.

### Time Horizon Flips Everything
- A single blackjack hand (-0.5% edge) looks nearly identical to a single stock trade. The difference is what happens next: the stock investor compounds UP while the gambler compounds DOWN.
- Over 10 years, S&P 500 turns $100 into $259. Blackjack turns $100 into $4.40. Same starting point, opposite trajectories.

### The "Almost Fair" Illusion
- Casino games with edges under 2% (blackjack, baccarat, craps) feel almost fair on any given hand. But 625 hands later, you've lost 27-58% of your bankroll. The grind is invisible in the moment.

### Skill Is the Only Escape Hatch
- Card counting (+1.0%), skilled poker (+5.0%), and options selling (+8-10%) are the only gambling-adjacent activities with genuinely positive expected value.
- But each requires years of study, discipline, and emotional control. The "skill premium" is real — and rare.
