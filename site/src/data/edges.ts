/**
 * The canonical Edge Spectrum dataset — the single source of truth for every
 * asset and game the hub reasons about.
 *
 * Roadmap Action 2.2. Three copies of this data used to exist and drift:
 * the inlined `RAW` array in `site/public/spectrum/index.html`, the
 * `RAW` list in `Versions/Streamlit/data.py`, and the tables in `Data/`.
 * They now all come from here — run `npm run gen:edges` after editing this
 * file, and CI runs `npm run gen:edges -- --check` to fail on drift.
 *
 * Only the fields that carry information live here. `g`, `type`, `vol`,
 * `wp` and `sk` are pure functions of `cat` and `m`, so
 * `toSpectrumRow()` re-expands them for the visualizer rather than storing
 * 187 copies of the string "Varies".
 */

/** Projection layer: gross, after fees, or after tax. */
export type EdgeLayer = 'raw' | 'fee' | 'tax';

export const EDGE_CATEGORIES = [
  "Stock Market",
  "Cash & Savings",
  "Bonds",
  "Real Estate",
  "Cryptocurrency",
  "Collectibles",
  "Precious Metals",
  "Insurance & Annuities",
  "Sports Betting",
  "Casino Gambling",
  "Poker & Skill-Based",
  "Prediction Markets",
  "Lottery",
] as const;

export type EdgeCategory = (typeof EDGE_CATEGORIES)[number];

/**
 * Optional citation for a record's figures. Roadmap Action 2.3 — none of the
 * 187 records carry one yet; `npm run check:edges` ratchets coverage upward
 * as they're filled in, so it can only improve, never silently regress.
 */
export type Provenance = {
  /** Where the figure comes from, e.g. a data provider or publication. */
  source?: string;
  /** ISO date the figure was last verified against that source. */
  asOf?: string;
  /** The period the figure was computed over, e.g. "2015-2025". */
  window?: string;
  /** How the figure was derived, in a sentence. */
  methodology?: string;
};

/** A held asset. Compounds; `a` is the annual return in percent. */
export type InvestmentEdge = Provenance & {
  n: string;
  cat: EdgeCategory;
  m: 'i';
  ly: EdgeLayer;
  /** Annual return, percent. */
  a: number;
};

/** A repeated wager. `e` is the edge per decision, in percent. */
export type GameEdge = Provenance & {
  n: string;
  cat: EdgeCategory;
  m: 'g';
  ly: EdgeLayer;
  /** Edge per decision, percent. Negative for every game in this dataset. */
  e: number;
  /** Decisions per day at typical play. */
  du: number;
  /** Capital exposed per decision, percent of bankroll. */
  ced: number;
};

export type EdgeRecord = InvestmentEdge | GameEdge;

/**
 * The presentation fields the Spectrum visualizer expects, derived rather than
 * stored. Kept next to the data so the React port (Action 4.6) reuses it.
 */
export function toSpectrumRow(r: EdgeRecord) {
  return r.m === 'i'
    ? { n: r.n, cat: r.cat, g: r.cat, m: r.m, a: r.a, ly: r.ly, type: 'Asset', vol: 'Varies', wp: 'Market Rate', sk: 'Passive' }
    : { n: r.n, cat: r.cat, g: r.cat, m: r.m, e: r.e, du: r.du, ced: r.ced, ly: r.ly, type: 'Game', vol: 'Varies', wp: 'EV Calculated', sk: 'Varies' };
}

export const EDGES: readonly EdgeRecord[] = [
  // --- STOCK MARKET (Compound) ---
  { n: "NASDAQ 100 (QQQ)", cat: "Stock Market", m: 'i', ly: 'raw', a: 12.5 },
  { n: "S&P 500 Growth (IVW)", cat: "Stock Market", m: 'i', ly: 'raw', a: 12.0 },
  { n: "Small-Cap Value (VBR)", cat: "Stock Market", m: 'i', ly: 'raw', a: 11.5 },
  { n: "S&P MidCap 400 (MDY)", cat: "Stock Market", m: 'i', ly: 'raw', a: 11.0 },
  { n: "Dividend Aristocrats (NOBL)", cat: "Stock Market", m: 'i', ly: 'raw', a: 10.5 },
  { n: "Total US Stock Market (VTI)", cat: "Stock Market", m: 'i', ly: 'raw', a: 10.2 },
  { n: "S&P 500 Index (SPY/VOO)", cat: "Stock Market", m: 'i', ly: 'raw', a: 10.0 },
  { n: "S&P 500 Equal Weight (RSP)", cat: "Stock Market", m: 'i', ly: 'raw', a: 10.0 },
  { n: "Dow Jones Industrial (DIA)", cat: "Stock Market", m: 'i', ly: 'raw', a: 9.5 },
  { n: "S&P 500 Value (IVE)", cat: "Stock Market", m: 'i', ly: 'raw', a: 9.5 },
  { n: "Russell 2000 Small Cap (IWM)", cat: "Stock Market", m: 'i', ly: 'raw', a: 8.5 },
  { n: "REIT Index ETF (VNQ)", cat: "Stock Market", m: 'i', ly: 'raw', a: 8.0 },
  { n: "S&P 500 High Dividend (SPYD)", cat: "Stock Market", m: 'i', ly: 'raw', a: 8.0 },
  { n: "DAX Germany Index", cat: "Stock Market", m: 'i', ly: 'raw', a: 7.5 },
  { n: "Nikkei 225 Japan Index", cat: "Stock Market", m: 'i', ly: 'raw', a: 7.0 },
  { n: "MSCI EAFE Intl Developed (EFA)", cat: "Stock Market", m: 'i', ly: 'raw', a: 5.5 },
  { n: "FTSE 100 UK Index", cat: "Stock Market", m: 'i', ly: 'raw', a: 5.0 },
  { n: "MSCI Emerging Markets (EEM)", cat: "Stock Market", m: 'i', ly: 'raw', a: 4.0 },
  { n: "Commodity Index (DJP)", cat: "Stock Market", m: 'i', ly: 'raw', a: 1.0 },
  { n: "Individual Stock Picking (Retail)", cat: "Stock Market", m: 'i', ly: 'raw', a: -2.0 },
  { n: "Penny Stocks (Retail Avg)", cat: "Stock Market", m: 'i', ly: 'raw', a: -30.0 },
  { n: "S&P 500 After 0.03% Index Fee", cat: "Stock Market", m: 'i', ly: 'fee', a: 9.97 },
  { n: "S&P 500 After 0.35% Robo-Advisor", cat: "Stock Market", m: 'i', ly: 'fee', a: 9.65 },
  { n: "S&P 500 After 0.60% Target-Date Fund", cat: "Stock Market", m: 'i', ly: 'fee', a: 9.4 },
  { n: "S&P 500 After 1% Advisory Fee", cat: "Stock Market", m: 'i', ly: 'fee', a: 9.0 },
  { n: "S&P 500 After 1.5% Active Mutual Fund", cat: "Stock Market", m: 'i', ly: 'fee', a: 8.5 },
  { n: "S&P 500 After 2-and-20 Hedge Fund", cat: "Stock Market", m: 'i', ly: 'fee', a: 6.4 },
  { n: "S&P 500 After 2-and-20 (Underperforming)", cat: "Stock Market", m: 'i', ly: 'fee', a: 4.0 },
  { n: "S&P 500 After LTCG Tax (20%)", cat: "Stock Market", m: 'i', ly: 'tax', a: 8.0 },
  { n: "S&P 500 After STCG Tax (37%)", cat: "Stock Market", m: 'i', ly: 'tax', a: 6.3 },
  { n: "S&P 500 After 1% Fee + LTCG Tax", cat: "Stock Market", m: 'i', ly: 'tax', a: 7.2 },
  { n: "Qualified Dividends (SPYD) After 15% Tax", cat: "Stock Market", m: 'i', ly: 'tax', a: 6.8 },

  // --- CASH & SAVINGS (Compound) ---
  { n: "Money Market Fund (SPAXX/VMFXX)", cat: "Cash & Savings", m: 'i', ly: 'raw', a: 4.8 },
  { n: "High-Yield Savings Account (Online)", cat: "Cash & Savings", m: 'i', ly: 'raw', a: 4.5 },
  { n: "1-Year CD (Top Rate)", cat: "Cash & Savings", m: 'i', ly: 'raw', a: 4.5 },
  { n: "6-Month CD", cat: "Cash & Savings", m: 'i', ly: 'raw', a: 4.3 },
  { n: "High-Yield Money Market Account", cat: "Cash & Savings", m: 'i', ly: 'raw', a: 4.3 },
  { n: "Cash Management Account (SoFi/Wealthfront)", cat: "Cash & Savings", m: 'i', ly: 'raw', a: 4.0 },
  { n: "No-Penalty CD", cat: "Cash & Savings", m: 'i', ly: 'raw', a: 4.0 },
  { n: "3-Month CD", cat: "Cash & Savings", m: 'i', ly: 'raw', a: 4.0 },
  { n: "2-Year CD", cat: "Cash & Savings", m: 'i', ly: 'raw', a: 3.8 },
  { n: "5-Year CD", cat: "Cash & Savings", m: 'i', ly: 'raw', a: 3.5 },
  { n: "Bank Money Market (Traditional)", cat: "Cash & Savings", m: 'i', ly: 'raw', a: 1.5 },
  { n: "Credit Union Savings", cat: "Cash & Savings", m: 'i', ly: 'raw', a: 0.5 },
  { n: "National Average Savings Rate", cat: "Cash & Savings", m: 'i', ly: 'raw', a: 0.45 },
  { n: "Big Bank Savings (Chase/BofA)", cat: "Cash & Savings", m: 'i', ly: 'raw', a: 0.01 },
  { n: "Regular Checking Account", cat: "Cash & Savings", m: 'i', ly: 'raw', a: 0.01 },
  { n: "HYSA After Income Tax (24%)", cat: "Cash & Savings", m: 'i', ly: 'tax', a: 3.42 },
  { n: "HYSA After Income Tax (37%)", cat: "Cash & Savings", m: 'i', ly: 'tax', a: 2.84 },

  // --- BONDS (Compound) ---
  { n: "High-Yield Corporate (HYG/JNK)", cat: "Bonds", m: 'i', ly: 'raw', a: 5.5 },
  { n: "Convertible Bond ETF (CWB)", cat: "Bonds", m: 'i', ly: 'raw', a: 5.0 },
  { n: "Investment Grade Corporate (LQD)", cat: "Bonds", m: 'i', ly: 'raw', a: 4.5 },
  { n: "US Treasury Bills (BIL)", cat: "Bonds", m: 'i', ly: 'raw', a: 4.3 },
  { n: "Long-Term Treasury 20+ Yr (TLT)", cat: "Bonds", m: 'i', ly: 'raw', a: 4.0 },
  { n: "US Treasury 10-Year", cat: "Bonds", m: 'i', ly: 'raw', a: 3.8 },
  { n: "Total US Bond Market (BND/AGG)", cat: "Bonds", m: 'i', ly: 'raw', a: 3.5 },
  { n: "Municipal Bond Index (MUB)", cat: "Bonds", m: 'i', ly: 'raw', a: 3.5 },
  { n: "Aggregate Bond ETF (AGG)", cat: "Bonds", m: 'i', ly: 'raw', a: 3.0 },
  { n: "International Bond (BNDX)", cat: "Bonds", m: 'i', ly: 'raw', a: 2.5 },
  { n: "Short-Term Treasury (SHY)", cat: "Bonds", m: 'i', ly: 'raw', a: 2.5 },
  { n: "TIPS Inflation-Protected (TIP)", cat: "Bonds", m: 'i', ly: 'raw', a: 1.5 },
  { n: "Bond Fund After 1% Advisory Fee", cat: "Bonds", m: 'i', ly: 'fee', a: 2.5 },
  { n: "Bond Interest After Income Tax (37%)", cat: "Bonds", m: 'i', ly: 'tax', a: 2.21 },
  { n: "Muni Bonds Tax-Exempt (Effective)", cat: "Bonds", m: 'i', ly: 'tax', a: 3.5 },
  { n: "Treasury Interest After Federal Tax (24%)", cat: "Bonds", m: 'i', ly: 'tax', a: 2.89 },

  // --- REAL ESTATE (Compound) ---
  { n: "Multi-Unit Apartments (5+ Units)", cat: "Real Estate", m: 'i', ly: 'raw', a: 10.0 },
  { n: "Industrial / Warehouse", cat: "Real Estate", m: 'i', ly: 'raw', a: 9.0 },
  { n: "Multi Single Family Portfolio", cat: "Real Estate", m: 'i', ly: 'raw', a: 8.5 },
  { n: "Single Family Home (Buy & Hold)", cat: "Real Estate", m: 'i', ly: 'raw', a: 7.5 },
  { n: "Commercial Office Space", cat: "Real Estate", m: 'i', ly: 'raw', a: 6.5 },
  { n: "Retail / Strip Mall", cat: "Real Estate", m: 'i', ly: 'raw', a: 5.5 },
  { n: "Vacation / Short-Term Rental", cat: "Real Estate", m: 'i', ly: 'raw', a: 4.0 },
  { n: "Raw Land (Speculative)", cat: "Real Estate", m: 'i', ly: 'raw', a: 2.0 },
  { n: "House Flipping (Retail Avg)", cat: "Real Estate", m: 'i', ly: 'raw', a: -5.0 },
  { n: "Timeshare", cat: "Real Estate", m: 'i', ly: 'raw', a: -12.0 },
  { n: "Rental Income After Ordinary Tax (37%)", cat: "Real Estate", m: 'i', ly: 'tax', a: 4.73 },
  { n: "Home Sale After LTCG (w/ $250K Exclusion)", cat: "Real Estate", m: 'i', ly: 'tax', a: 6.75 },

  // --- CRYPTOCURRENCY (Compound) ---
  { n: "Bitcoin Spot (Buy & Hold)", cat: "Cryptocurrency", m: 'i', ly: 'raw', a: 45.0 },
  { n: "Ethereum Spot (Buy & Hold)", cat: "Cryptocurrency", m: 'i', ly: 'raw', a: 10.0 },
  { n: "Stablecoin Yield Farming", cat: "Cryptocurrency", m: 'i', ly: 'raw', a: 5.0 },
  { n: "DeFi LP Major Pairs", cat: "Cryptocurrency", m: 'i', ly: 'raw', a: 2.0 },
  { n: "DeFi LP Volatile Pairs", cat: "Cryptocurrency", m: 'i', ly: 'raw', a: -10.0 },
  { n: "Altcoin Portfolio (Retail)", cat: "Cryptocurrency", m: 'i', ly: 'raw', a: -15.0 },
  { n: "Meme Coins (Retail Avg)", cat: "Cryptocurrency", m: 'i', ly: 'raw', a: -70.0 },
  { n: "Bitcoin After LTCG Tax (20%)", cat: "Cryptocurrency", m: 'i', ly: 'tax', a: 36.0 },
  { n: "Bitcoin After STCG Tax (37%)", cat: "Cryptocurrency", m: 'i', ly: 'tax', a: 28.35 },
  { n: "Ethereum After LTCG Tax (20%)", cat: "Cryptocurrency", m: 'i', ly: 'tax', a: 8.0 },

  // --- COLLECTIBLES (Compound) ---
  { n: "Vintage Sports Cards (PSA 10)", cat: "Collectibles", m: 'i', ly: 'raw', a: 6.0 },
  { n: "Fine Art (Blue Chip / Old Masters)", cat: "Collectibles", m: 'i', ly: 'raw', a: 5.0 },
  { n: "Fine Wine (Investment Grade)", cat: "Collectibles", m: 'i', ly: 'raw', a: 4.0 },
  { n: "Classic Cars (Pre-1970)", cat: "Collectibles", m: 'i', ly: 'raw', a: 3.5 },
  { n: "Luxury Watches (Rolex/Patek)", cat: "Collectibles", m: 'i', ly: 'raw', a: 3.0 },
  { n: "Sneaker Reselling (Retail Avg)", cat: "Collectibles", m: 'i', ly: 'raw', a: -5.0 },
  { n: "Modern Art Speculation", cat: "Collectibles", m: 'i', ly: 'raw', a: -10.0 },
  { n: "Non-Vintage Trading Cards", cat: "Collectibles", m: 'i', ly: 'raw', a: -15.0 },
  { n: "NFT Art & Digital Collectibles", cat: "Collectibles", m: 'i', ly: 'raw', a: -50.0 },
  { n: "Collectibles After 28% Tax Rate", cat: "Collectibles", m: 'i', ly: 'tax', a: 4.32 },

  // --- PRECIOUS METALS (Compound) ---
  { n: "Gold Bullion (Physical / GLD)", cat: "Precious Metals", m: 'i', ly: 'raw', a: 7.5 },
  { n: "Rhodium (Physical)", cat: "Precious Metals", m: 'i', ly: 'raw', a: 6.0 },
  { n: "Gold Mining Stocks (GDX)", cat: "Precious Metals", m: 'i', ly: 'raw', a: 5.0 },
  { n: "Silver Bullion (Physical / SLV)", cat: "Precious Metals", m: 'i', ly: 'raw', a: 4.5 },
  { n: "Copper Futures (CPER)", cat: "Precious Metals", m: 'i', ly: 'raw', a: 4.0 },
  { n: "Palladium Bullion (PALL)", cat: "Precious Metals", m: 'i', ly: 'raw', a: 3.5 },
  { n: "Silver Mining Stocks (SIL)", cat: "Precious Metals", m: 'i', ly: 'raw', a: 3.0 },
  { n: "Platinum Bullion (PPLT)", cat: "Precious Metals", m: 'i', ly: 'raw', a: 2.0 },
  { n: "Precious Coins (Numismatic)", cat: "Precious Metals", m: 'i', ly: 'raw', a: 1.5 },
  { n: "Junior Mining Stocks (GDXJ)", cat: "Precious Metals", m: 'i', ly: 'raw', a: 1.0 },
  { n: "Gold After Collectibles Tax (28%)", cat: "Precious Metals", m: 'i', ly: 'tax', a: 5.4 },
  { n: "Gold Mining After LTCG Tax (20%)", cat: "Precious Metals", m: 'i', ly: 'tax', a: 4.0 },

  // --- INSURANCE & ANNUITIES (Compound) ---
  { n: "Variable Annuity (Equity Sub-Accounts)", cat: "Insurance & Annuities", m: 'i', ly: 'raw', a: 5.0 },
  { n: "Indexed Universal Life (IUL)", cat: "Insurance & Annuities", m: 'i', ly: 'raw', a: 4.5 },
  { n: "Fixed Annuity (MYGA 5-Year)", cat: "Insurance & Annuities", m: 'i', ly: 'raw', a: 4.2 },
  { n: "Single Premium Immediate Annuity (SPIA)", cat: "Insurance & Annuities", m: 'i', ly: 'raw', a: 4.0 },
  { n: "Whole Life — Top Mutual Co. (NWM/MassMutual)", cat: "Insurance & Annuities", m: 'i', ly: 'raw', a: 3.5 },
  { n: "Fixed Indexed Annuity (FIA)", cat: "Insurance & Annuities", m: 'i', ly: 'raw', a: 3.5 },
  { n: "Universal Life (Current Rate)", cat: "Insurance & Annuities", m: 'i', ly: 'raw', a: 3.0 },
  { n: "Variable Universal Life (VUL After Fees)", cat: "Insurance & Annuities", m: 'i', ly: 'raw', a: 3.0 },
  { n: "Whole Life — Average Company", cat: "Insurance & Annuities", m: 'i', ly: 'raw', a: 2.0 },
  { n: "Annuity Gains After Ordinary Income Tax (37%)", cat: "Insurance & Annuities", m: 'i', ly: 'tax', a: 2.65 },
  { n: "Whole Life Cash Value (Tax-Free via Policy Loans)", cat: "Insurance & Annuities", m: 'i', ly: 'tax', a: 3.5 },

  // --- SPORTS BETTING (Linear) ---
  { n: "Single Game Spread (-110)", cat: "Sports Betting", m: 'g', ly: 'raw', e: -4.55, du: 2, ced: 3 },
  { n: "Single Game O/U (-110)", cat: "Sports Betting", m: 'g', ly: 'raw', e: -4.55, du: 2, ced: 3 },
  { n: "Moneyline (Standard Juice)", cat: "Sports Betting", m: 'g', ly: 'raw', e: -4.55, du: 2, ced: 3 },
  { n: "Teaser 2-Team 6pt", cat: "Sports Betting", m: 'g', ly: 'raw', e: -5.0, du: 1, ced: 3 },
  { n: "Live / In-Game Bet", cat: "Sports Betting", m: 'g', ly: 'raw', e: -6.5, du: 5, ced: 3 },
  { n: "Player Prop Bet", cat: "Sports Betting", m: 'g', ly: 'raw', e: -7.0, du: 3, ced: 2 },
  { n: "Season Win Total Future", cat: "Sports Betting", m: 'g', ly: 'raw', e: -8.0, du: 0.05, ced: 5 },
  { n: "2-Team Parlay", cat: "Sports Betting", m: 'g', ly: 'raw', e: -10.0, du: 2, ced: 2 },
  { n: "Championship Future", cat: "Sports Betting", m: 'g', ly: 'raw', e: -12.0, du: 0.03, ced: 5 },
  { n: "3-Team Parlay", cat: "Sports Betting", m: 'g', ly: 'raw', e: -12.5, du: 1, ced: 2 },
  { n: "4-Team Parlay", cat: "Sports Betting", m: 'g', ly: 'raw', e: -15.0, du: 1, ced: 1 },
  { n: "Same-Game Parlay (SGP)", cat: "Sports Betting", m: 'g', ly: 'raw', e: -15.0, du: 2, ced: 2 },
  { n: "First Touchdown Scorer", cat: "Sports Betting", m: 'g', ly: 'raw', e: -18.0, du: 1, ced: 1 },
  { n: "5-Team Parlay", cat: "Sports Betting", m: 'g', ly: 'raw', e: -20.0, du: 0.5, ced: 1 },
  { n: "Correct Score (Soccer)", cat: "Sports Betting", m: 'g', ly: 'raw', e: -20.0, du: 0.5, ced: 1 },
  { n: "6-Team Parlay", cat: "Sports Betting", m: 'g', ly: 'raw', e: -25.0, du: 0.3, ced: 1 },
  { n: "8-Team Parlay", cat: "Sports Betting", m: 'g', ly: 'raw', e: -30.0, du: 0.2, ced: 1 },
  { n: "10-Team Parlay", cat: "Sports Betting", m: 'g', ly: 'raw', e: -35.0, du: 0.1, ced: 0.5 },

  // --- CASINO GAMBLING (Linear) ---
  { n: "Video Poker 9/6 JoB", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -0.46, du: 80, ced: 1 },
  { n: "Blackjack 3:2 Basic Strategy", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -0.5, du: 60, ced: 2 },
  { n: "Baccarat Banker", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -1.06, du: 50, ced: 3 },
  { n: "Baccarat Player", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -1.24, du: 50, ced: 3 },
  { n: "Craps Don't Pass", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -1.36, du: 40, ced: 2 },
  { n: "Craps Pass Line", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -1.41, du: 40, ced: 2 },
  { n: "Blackjack 6:5", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -2.0, du: 60, ced: 2 },
  { n: "Pai Gow Poker", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -2.5, du: 30, ced: 3 },
  { n: "Roulette Single Zero", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -2.7, du: 40, ced: 3 },
  { n: "Three Card Poker", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -3.4, du: 40, ced: 3 },
  { n: "Let It Ride", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -3.5, du: 30, ced: 3 },
  { n: "Slots Loose 95%", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -5.0, du: 500, ced: 0.5 },
  { n: "Caribbean Stud", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -5.2, du: 30, ced: 3 },
  { n: "Roulette Double Zero", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -5.26, du: 40, ced: 3 },
  { n: "Slots Average 92%", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -8.0, du: 500, ced: 0.5 },
  { n: "Slots Tight 85%", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -15.0, du: 500, ced: 0.5 },
  { n: "Big Six Wheel", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -16.0, du: 20, ced: 2 },
  { n: "Keno 4-Spot", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -28.0, du: 10, ced: 1 },
  { n: "Keno 10-Spot", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -35.0, du: 10, ced: 1 },

  // --- POKER & SKILL-BASED (Linear) ---
  { n: "DFS Top 5%", cat: "Poker & Skill-Based", m: 'g', ly: 'raw', e: 5.0, du: 5, ced: 5 },
  { n: "Poker Skilled Tournaments", cat: "Poker & Skill-Based", m: 'g', ly: 'raw', e: 2.0, du: 5, ced: 10 },
  { n: "Poker Mid-Stakes Reg", cat: "Poker & Skill-Based", m: 'g', ly: 'raw', e: 1.5, du: 40, ced: 2 },
  { n: "Poker Average Live Cash", cat: "Poker & Skill-Based", m: 'g', ly: 'raw', e: -5.0, du: 25, ced: 3 },
  { n: "Poker Average Online", cat: "Poker & Skill-Based", m: 'g', ly: 'raw', e: -8.0, du: 40, ced: 2 },
  { n: "Poker Recreational Live", cat: "Poker & Skill-Based", m: 'g', ly: 'raw', e: -10.0, du: 25, ced: 3 },
  { n: "DFS Average", cat: "Poker & Skill-Based", m: 'g', ly: 'raw', e: -12.0, du: 5, ced: 5 },
  { n: "Poker Sit & Go Average", cat: "Poker & Skill-Based", m: 'g', ly: 'raw', e: -15.0, du: 5, ced: 5 },
  { n: "DFS Casual", cat: "Poker & Skill-Based", m: 'g', ly: 'raw', e: -20.0, du: 3, ced: 5 },

  // --- PREDICTION MARKETS (Linear) ---
  { n: "Polymarket Elections", cat: "Prediction Markets", m: 'g', ly: 'raw', e: -3.0, du: 1, ced: 5 },
  { n: "Polymarket SCOTUS", cat: "Prediction Markets", m: 'g', ly: 'raw', e: -3.0, du: 0.5, ced: 5 },
  { n: "Metaculus Scientific", cat: "Prediction Markets", m: 'g', ly: 'raw', e: -3.5, du: 1, ced: 3 },
  { n: "Polymarket Oscars", cat: "Prediction Markets", m: 'g', ly: 'raw', e: -4.0, du: 0.5, ced: 3 },
  { n: "Polymarket Geopolitics", cat: "Prediction Markets", m: 'g', ly: 'raw', e: -4.0, du: 0.5, ced: 3 },
  { n: "Polymarket Sports/Entertainment", cat: "Prediction Markets", m: 'g', ly: 'raw', e: -4.5, du: 1, ced: 3 },
  { n: "Polymarket Crypto Prices", cat: "Prediction Markets", m: 'g', ly: 'raw', e: -5.0, du: 2, ced: 3 },
  { n: "Kalshi Economic", cat: "Prediction Markets", m: 'g', ly: 'raw', e: -5.5, du: 0.5, ced: 3 },
  { n: "Kalshi Fed Rate", cat: "Prediction Markets", m: 'g', ly: 'raw', e: -5.5, du: 0.2, ced: 5 },
  { n: "Kalshi GDP", cat: "Prediction Markets", m: 'g', ly: 'raw', e: -6.0, du: 0.2, ced: 5 },
  { n: "Kalshi Weather", cat: "Prediction Markets", m: 'g', ly: 'raw', e: -7.0, du: 0.5, ced: 2 },
  { n: "PredictIt US Politics", cat: "Prediction Markets", m: 'g', ly: 'raw', e: -10.0, du: 1, ced: 5 },

  // --- LOTTERY (Linear) ---
  { n: "$1 Scratch-Off Best Odds", cat: "Lottery", m: 'g', ly: 'raw', e: -25.0, du: 1, ced: 0.5 },
  { n: "Premium Scratch-Off $20+", cat: "Lottery", m: 'g', ly: 'raw', e: -30.0, du: 0.5, ced: 1 },
  { n: "Scratch-Off Tickets Avg", cat: "Lottery", m: 'g', ly: 'raw', e: -35.0, du: 0.5, ced: 0.5 },
  { n: "Keno State-Run", cat: "Lottery", m: 'g', ly: 'raw', e: -40.0, du: 2, ced: 0.5 },
  { n: "Daily Numbers Game", cat: "Lottery", m: 'g', ly: 'raw', e: -42.0, du: 1, ced: 0.5 },
  { n: "State Pick 6 / Lotto", cat: "Lottery", m: 'g', ly: 'raw', e: -45.0, du: 0.15, ced: 0.1 },
  { n: "State Lottery Pick 3/4", cat: "Lottery", m: 'g', ly: 'raw', e: -50.0, du: 0.5, ced: 0.3 },
  { n: "Powerball / Mega Millions", cat: "Lottery", m: 'g', ly: 'raw', e: -52.0, du: 0.1, ced: 0.1 },
  { n: "Multi-State Cash4Life", cat: "Lottery", m: 'g', ly: 'raw', e: -55.0, du: 0.1, ced: 0.1 },
];
