"""Edge Spectrum — raw dataset and constants, ported from V19 (Dark-Sidebar-Theme/V1.html).

Schema per row:
  n      display name
  cat    category (one of ALL_CATS)
  g      group (currently mirrors cat)
  m      math mode: 'i' = compound investment, 'g' = linear gambling
  ly     projection layer: 'raw' | 'fee' | 'tax'
  type   'Asset' | 'Game'
  vol    volatility label
  wp     win-probability label
  sk     skill label
  a      annual return % (investment rows only)
  e      edge % (gambling rows only)
  du     decisions per day (gambling rows only)
  ced    % of bankroll per decision (gambling rows only)
"""

ALL_CATS = [
    "Cash & Savings", "Stock Market", "Bonds", "Real Estate", "Cryptocurrency",
    "Collectibles", "Precious Metals", "Insurance & Annuities",
    "Sports Betting", "Casino Gambling", "Poker & Skill-Based",
    "Prediction Markets", "Lottery",
]

CC = {
    "Cash & Savings": "#34d399", "Stock Market": "#3b82f6", "Bonds": "#06b6d4",
    "Real Estate": "#8b5cf6", "Cryptocurrency": "#f59e0b", "Collectibles": "#d97706",
    "Precious Metals": "#fbbf24", "Insurance & Annuities": "#ec4899",
    "Sports Betting": "#22c55e", "Casino Gambling": "#a855f7",
    "Poker & Skill-Based": "#14b8a6", "Prediction Markets": "#6366f1",
    "Lottery": "#f43f5e",
}

HZ = ["1du", "1day", "1wk", "1mo", "1yr", "5yr", "10yr"]
HZ_LBL = {"1du": "1 DECISION", "1day": "1 DAY", "1wk": "1 WEEK", "1mo": "1 MONTH",
          "1yr": "1 YEAR", "5yr": "5 YEARS", "10yr": "10 YEARS"}
HZ_DAYS = {"1du": 0, "1day": 1, "1wk": 7, "1mo": 30, "1yr": 365, "5yr": 1825, "10yr": 3650}
I_Y = {"1du": 1/252, "1day": 1/252, "1wk": 1/52, "1mo": 1/12, "1yr": 1, "5yr": 5, "10yr": 10}
DCA_AMT = {"1du": 100, "1day": 100, "1wk": 100, "1mo": 430,
           "1yr": 5200, "5yr": 26000, "10yr": 52000}

AR_DEFAULT = {
    "Cash & Savings": 1, "Stock Market": 1, "Bonds": 1, "Real Estate": 1,
    "Cryptocurrency": 3, "Collectibles": 1, "Precious Metals": 1,
    "Insurance & Annuities": 1, "Sports Betting": 4, "Casino Gambling": 3,
    "Poker & Skill-Based": 3, "Prediction Markets": 2, "Lottery": 3,
}
AR_CLR = {1: "#22c55e", 2: "#84cc16", 3: "#eab308", 4: "#f97316", 5: "#ef4444"}
AR_LBL = {1: "MINIMAL", 2: "LOW", 3: "MEDIUM", 4: "HIGH", 5: "EXTREME"}


def _inv(n, cat, a, ly="raw"):
    return {"n": n, "cat": cat, "g": cat, "m": "i", "a": a, "ly": ly,
            "type": "Asset", "vol": "Varies", "wp": "Market Rate", "sk": "Passive"}

def _gam(n, cat, e, du, ced, ly="raw"):
    return {"n": n, "cat": cat, "g": cat, "m": "g", "e": e, "du": du, "ced": ced, "ly": ly,
            "type": "Game", "vol": "Varies", "wp": "EV Calculated", "sk": "Varies"}


RAW = [
    # --- STOCK MARKET (Compound) ---
    _inv("NASDAQ 100 (QQQ)", "Stock Market", 12.5),
    _inv("S&P 500 Growth (IVW)", "Stock Market", 12.0),
    _inv("Small-Cap Value (VBR)", "Stock Market", 11.5),
    _inv("S&P MidCap 400 (MDY)", "Stock Market", 11.0),
    _inv("Dividend Aristocrats (NOBL)", "Stock Market", 10.5),
    _inv("Total US Stock Market (VTI)", "Stock Market", 10.2),
    _inv("S&P 500 Index (SPY/VOO)", "Stock Market", 10.0),
    _inv("S&P 500 Equal Weight (RSP)", "Stock Market", 10.0),
    _inv("Dow Jones Industrial (DIA)", "Stock Market", 9.5),
    _inv("S&P 500 Value (IVE)", "Stock Market", 9.5),
    _inv("Russell 2000 Small Cap (IWM)", "Stock Market", 8.5),
    _inv("REIT Index ETF (VNQ)", "Stock Market", 8.0),
    _inv("S&P 500 High Dividend (SPYD)", "Stock Market", 8.0),
    _inv("DAX Germany Index", "Stock Market", 7.5),
    _inv("Nikkei 225 Japan Index", "Stock Market", 7.0),
    _inv("MSCI EAFE Intl Developed (EFA)", "Stock Market", 5.5),
    _inv("FTSE 100 UK Index", "Stock Market", 5.0),
    _inv("MSCI Emerging Markets (EEM)", "Stock Market", 4.0),
    _inv("Commodity Index (DJP)", "Stock Market", 1.0),
    _inv("Individual Stock Picking (Retail)", "Stock Market", -2.0),
    _inv("Penny Stocks (Retail Avg)", "Stock Market", -30.0),
    _inv("S&P 500 After 0.03% Index Fee", "Stock Market", 9.97, "fee"),
    _inv("S&P 500 After 0.35% Robo-Advisor", "Stock Market", 9.65, "fee"),
    _inv("S&P 500 After 0.60% Target-Date Fund", "Stock Market", 9.4, "fee"),
    _inv("S&P 500 After 1% Advisory Fee", "Stock Market", 9.0, "fee"),
    _inv("S&P 500 After 1.5% Active Mutual Fund", "Stock Market", 8.5, "fee"),
    _inv("S&P 500 After 2-and-20 Hedge Fund", "Stock Market", 6.4, "fee"),
    _inv("S&P 500 After 2-and-20 (Underperforming)", "Stock Market", 4.0, "fee"),
    _inv("S&P 500 After LTCG Tax (20%)", "Stock Market", 8.0, "tax"),
    _inv("S&P 500 After STCG Tax (37%)", "Stock Market", 6.3, "tax"),
    _inv("S&P 500 After 1% Fee + LTCG Tax", "Stock Market", 7.2, "tax"),
    _inv("Qualified Dividends (SPYD) After 15% Tax", "Stock Market", 6.8, "tax"),

    # --- CASH & SAVINGS (Compound) ---
    _inv("Money Market Fund (SPAXX/VMFXX)", "Cash & Savings", 4.8),
    _inv("High-Yield Savings Account (Online)", "Cash & Savings", 4.5),
    _inv("1-Year CD (Top Rate)", "Cash & Savings", 4.5),
    _inv("6-Month CD", "Cash & Savings", 4.3),
    _inv("High-Yield Money Market Account", "Cash & Savings", 4.3),
    _inv("Cash Management Account (SoFi/Wealthfront)", "Cash & Savings", 4.0),
    _inv("No-Penalty CD", "Cash & Savings", 4.0),
    _inv("3-Month CD", "Cash & Savings", 4.0),
    _inv("2-Year CD", "Cash & Savings", 3.8),
    _inv("5-Year CD", "Cash & Savings", 3.5),
    _inv("Bank Money Market (Traditional)", "Cash & Savings", 1.5),
    _inv("Credit Union Savings", "Cash & Savings", 0.5),
    _inv("National Average Savings Rate", "Cash & Savings", 0.45),
    _inv("Big Bank Savings (Chase/BofA)", "Cash & Savings", 0.01),
    _inv("Regular Checking Account", "Cash & Savings", 0.01),
    _inv("HYSA After Income Tax (24%)", "Cash & Savings", 3.42, "tax"),
    _inv("HYSA After Income Tax (37%)", "Cash & Savings", 2.84, "tax"),

    # --- BONDS (Compound) ---
    _inv("High-Yield Corporate (HYG/JNK)", "Bonds", 5.5),
    _inv("Convertible Bond ETF (CWB)", "Bonds", 5.0),
    _inv("Investment Grade Corporate (LQD)", "Bonds", 4.5),
    _inv("US Treasury Bills (BIL)", "Bonds", 4.3),
    _inv("Long-Term Treasury 20+ Yr (TLT)", "Bonds", 4.0),
    _inv("US Treasury 10-Year", "Bonds", 3.8),
    _inv("Total US Bond Market (BND/AGG)", "Bonds", 3.5),
    _inv("Municipal Bond Index (MUB)", "Bonds", 3.5),
    _inv("Aggregate Bond ETF (AGG)", "Bonds", 3.0),
    _inv("International Bond (BNDX)", "Bonds", 2.5),
    _inv("Short-Term Treasury (SHY)", "Bonds", 2.5),
    _inv("TIPS Inflation-Protected (TIP)", "Bonds", 1.5),
    _inv("Bond Fund After 1% Advisory Fee", "Bonds", 2.5, "fee"),
    _inv("Bond Interest After Income Tax (37%)", "Bonds", 2.21, "tax"),
    _inv("Muni Bonds Tax-Exempt (Effective)", "Bonds", 3.5, "tax"),
    _inv("Treasury Interest After Federal Tax (24%)", "Bonds", 2.89, "tax"),

    # --- REAL ESTATE (Compound) ---
    _inv("Multi-Unit Apartments (5+ Units)", "Real Estate", 10.0),
    _inv("Industrial / Warehouse", "Real Estate", 9.0),
    _inv("Multi Single Family Portfolio", "Real Estate", 8.5),
    _inv("Single Family Home (Buy & Hold)", "Real Estate", 7.5),
    _inv("Commercial Office Space", "Real Estate", 6.5),
    _inv("Retail / Strip Mall", "Real Estate", 5.5),
    _inv("Vacation / Short-Term Rental", "Real Estate", 4.0),
    _inv("Raw Land (Speculative)", "Real Estate", 2.0),
    _inv("House Flipping (Retail Avg)", "Real Estate", -5.0),
    _inv("Timeshare", "Real Estate", -12.0),
    _inv("Rental Income After Ordinary Tax (37%)", "Real Estate", 4.73, "tax"),
    _inv("Home Sale After LTCG (w/ $250K Exclusion)", "Real Estate", 6.75, "tax"),

    # --- CRYPTOCURRENCY (Compound) ---
    _inv("Bitcoin Spot (Buy & Hold)", "Cryptocurrency", 45.0),
    _inv("Ethereum Spot (Buy & Hold)", "Cryptocurrency", 10.0),
    _inv("Stablecoin Yield Farming", "Cryptocurrency", 5.0),
    _inv("DeFi LP Major Pairs", "Cryptocurrency", 2.0),
    _inv("DeFi LP Volatile Pairs", "Cryptocurrency", -10.0),
    _inv("Altcoin Portfolio (Retail)", "Cryptocurrency", -15.0),
    _inv("Meme Coins (Retail Avg)", "Cryptocurrency", -70.0),
    _inv("Bitcoin After LTCG Tax (20%)", "Cryptocurrency", 36.0, "tax"),
    _inv("Bitcoin After STCG Tax (37%)", "Cryptocurrency", 28.35, "tax"),
    _inv("Ethereum After LTCG Tax (20%)", "Cryptocurrency", 8.0, "tax"),

    # --- COLLECTIBLES (Compound) ---
    _inv("Vintage Sports Cards (PSA 10)", "Collectibles", 6.0),
    _inv("Fine Art (Blue Chip / Old Masters)", "Collectibles", 5.0),
    _inv("Fine Wine (Investment Grade)", "Collectibles", 4.0),
    _inv("Classic Cars (Pre-1970)", "Collectibles", 3.5),
    _inv("Luxury Watches (Rolex/Patek)", "Collectibles", 3.0),
    _inv("Sneaker Reselling (Retail Avg)", "Collectibles", -5.0),
    _inv("Modern Art Speculation", "Collectibles", -10.0),
    _inv("Non-Vintage Trading Cards", "Collectibles", -15.0),
    _inv("NFT Art & Digital Collectibles", "Collectibles", -50.0),
    _inv("Collectibles After 28% Tax Rate", "Collectibles", 4.32, "tax"),

    # --- PRECIOUS METALS (Compound) ---
    _inv("Gold Bullion (Physical / GLD)", "Precious Metals", 7.5),
    _inv("Rhodium (Physical)", "Precious Metals", 6.0),
    _inv("Gold Mining Stocks (GDX)", "Precious Metals", 5.0),
    _inv("Silver Bullion (Physical / SLV)", "Precious Metals", 4.5),
    _inv("Copper Futures (CPER)", "Precious Metals", 4.0),
    _inv("Palladium Bullion (PALL)", "Precious Metals", 3.5),
    _inv("Silver Mining Stocks (SIL)", "Precious Metals", 3.0),
    _inv("Platinum Bullion (PPLT)", "Precious Metals", 2.0),
    _inv("Precious Coins (Numismatic)", "Precious Metals", 1.5),
    _inv("Junior Mining Stocks (GDXJ)", "Precious Metals", 1.0),
    _inv("Gold After Collectibles Tax (28%)", "Precious Metals", 5.4, "tax"),
    _inv("Gold Mining After LTCG Tax (20%)", "Precious Metals", 4.0, "tax"),

    # --- INSURANCE & ANNUITIES (Compound) ---
    _inv("Variable Annuity (Equity Sub-Accounts)", "Insurance & Annuities", 5.0),
    _inv("Indexed Universal Life (IUL)", "Insurance & Annuities", 4.5),
    _inv("Fixed Annuity (MYGA 5-Year)", "Insurance & Annuities", 4.2),
    _inv("Single Premium Immediate Annuity (SPIA)", "Insurance & Annuities", 4.0),
    _inv("Whole Life — Top Mutual Co. (NWM/MassMutual)", "Insurance & Annuities", 3.5),
    _inv("Fixed Indexed Annuity (FIA)", "Insurance & Annuities", 3.5),
    _inv("Universal Life (Current Rate)", "Insurance & Annuities", 3.0),
    _inv("Variable Universal Life (VUL After Fees)", "Insurance & Annuities", 3.0),
    _inv("Whole Life — Average Company", "Insurance & Annuities", 2.0),
    _inv("Annuity Gains After Ordinary Income Tax (37%)", "Insurance & Annuities", 2.65, "tax"),
    _inv("Whole Life Cash Value (Tax-Free via Policy Loans)", "Insurance & Annuities", 3.5, "tax"),

    # --- SPORTS BETTING (Linear) ---
    _gam("Single Game Spread (-110)", "Sports Betting", -4.55, 2, 3),
    _gam("Single Game O/U (-110)", "Sports Betting", -4.55, 2, 3),
    _gam("Moneyline (Standard Juice)", "Sports Betting", -4.55, 2, 3),
    _gam("Teaser 2-Team 6pt", "Sports Betting", -5.0, 1, 3),
    _gam("Live / In-Game Bet", "Sports Betting", -6.5, 5, 3),
    _gam("Player Prop Bet", "Sports Betting", -7.0, 3, 2),
    _gam("Season Win Total Future", "Sports Betting", -8.0, 0.05, 5),
    _gam("2-Team Parlay", "Sports Betting", -10.0, 2, 2),
    _gam("Championship Future", "Sports Betting", -12.0, 0.03, 5),
    _gam("3-Team Parlay", "Sports Betting", -12.5, 1, 2),
    _gam("4-Team Parlay", "Sports Betting", -15.0, 1, 1),
    _gam("Same-Game Parlay (SGP)", "Sports Betting", -15.0, 2, 2),
    _gam("First Touchdown Scorer", "Sports Betting", -18.0, 1, 1),
    _gam("5-Team Parlay", "Sports Betting", -20.0, 0.5, 1),
    _gam("Correct Score (Soccer)", "Sports Betting", -20.0, 0.5, 1),
    _gam("6-Team Parlay", "Sports Betting", -25.0, 0.3, 1),
    _gam("8-Team Parlay", "Sports Betting", -30.0, 0.2, 1),
    _gam("10-Team Parlay", "Sports Betting", -35.0, 0.1, 0.5),

    # --- CASINO GAMBLING (Linear) ---
    _gam("Video Poker 9/6 JoB", "Casino Gambling", -0.46, 80, 1),
    _gam("Blackjack 3:2 Basic Strategy", "Casino Gambling", -0.5, 60, 2),
    _gam("Baccarat Banker", "Casino Gambling", -1.06, 50, 3),
    _gam("Baccarat Player", "Casino Gambling", -1.24, 50, 3),
    _gam("Craps Don't Pass", "Casino Gambling", -1.36, 40, 2),
    _gam("Craps Pass Line", "Casino Gambling", -1.41, 40, 2),
    _gam("Blackjack 6:5", "Casino Gambling", -2.0, 60, 2),
    _gam("Pai Gow Poker", "Casino Gambling", -2.5, 30, 3),
    _gam("Roulette Single Zero", "Casino Gambling", -2.7, 40, 3),
    _gam("Three Card Poker", "Casino Gambling", -3.4, 40, 3),
    _gam("Let It Ride", "Casino Gambling", -3.5, 30, 3),
    _gam("Slots Loose 95%", "Casino Gambling", -5.0, 500, 0.5),
    _gam("Caribbean Stud", "Casino Gambling", -5.2, 30, 3),
    _gam("Roulette Double Zero", "Casino Gambling", -5.26, 40, 3),
    _gam("Slots Average 92%", "Casino Gambling", -8.0, 500, 0.5),
    _gam("Slots Tight 85%", "Casino Gambling", -15.0, 500, 0.5),
    _gam("Big Six Wheel", "Casino Gambling", -16.0, 20, 2),
    _gam("Keno 4-Spot", "Casino Gambling", -28.0, 10, 1),
    _gam("Keno 10-Spot", "Casino Gambling", -35.0, 10, 1),

    # --- POKER & SKILL-BASED (Linear) ---
    _gam("DFS Top 5%", "Poker & Skill-Based", 5.0, 5, 5),
    _gam("Poker Skilled Tournaments", "Poker & Skill-Based", 2.0, 5, 10),
    _gam("Poker Mid-Stakes Reg", "Poker & Skill-Based", 1.5, 40, 2),
    _gam("Poker Average Live Cash", "Poker & Skill-Based", -5.0, 25, 3),
    _gam("Poker Average Online", "Poker & Skill-Based", -8.0, 40, 2),
    _gam("Poker Recreational Live", "Poker & Skill-Based", -10.0, 25, 3),
    _gam("DFS Average", "Poker & Skill-Based", -12.0, 5, 5),
    _gam("Poker Sit & Go Average", "Poker & Skill-Based", -15.0, 5, 5),
    _gam("DFS Casual", "Poker & Skill-Based", -20.0, 3, 5),

    # --- PREDICTION MARKETS (Linear) ---
    _gam("Polymarket Elections", "Prediction Markets", -3.0, 1, 5),
    _gam("Polymarket SCOTUS", "Prediction Markets", -3.0, 0.5, 5),
    _gam("Metaculus Scientific", "Prediction Markets", -3.5, 1, 3),
    _gam("Polymarket Oscars", "Prediction Markets", -4.0, 0.5, 3),
    _gam("Polymarket Geopolitics", "Prediction Markets", -4.0, 0.5, 3),
    _gam("Polymarket Sports/Entertainment", "Prediction Markets", -4.5, 1, 3),
    _gam("Polymarket Crypto Prices", "Prediction Markets", -5.0, 2, 3),
    _gam("Kalshi Economic", "Prediction Markets", -5.5, 0.5, 3),
    _gam("Kalshi Fed Rate", "Prediction Markets", -5.5, 0.2, 5),
    _gam("Kalshi GDP", "Prediction Markets", -6.0, 0.2, 5),
    _gam("Kalshi Weather", "Prediction Markets", -7.0, 0.5, 2),
    _gam("PredictIt US Politics", "Prediction Markets", -10.0, 1, 5),

    # --- LOTTERY (Linear) ---
    _gam("$1 Scratch-Off Best Odds", "Lottery", -25.0, 1, 0.5),
    _gam("Premium Scratch-Off $20+", "Lottery", -30.0, 0.5, 1),
    _gam("Scratch-Off Tickets Avg", "Lottery", -35.0, 0.5, 0.5),
    _gam("Keno State-Run", "Lottery", -40.0, 2, 0.5),
    _gam("Daily Numbers Game", "Lottery", -42.0, 1, 0.5),
    _gam("State Pick 6 / Lotto", "Lottery", -45.0, 0.15, 0.1),
    _gam("State Lottery Pick 3/4", "Lottery", -50.0, 0.5, 0.3),
    _gam("Powerball / Mega Millions", "Lottery", -52.0, 0.1, 0.1),
    _gam("Multi-State Cash4Life", "Lottery", -55.0, 0.1, 0.1),
]
