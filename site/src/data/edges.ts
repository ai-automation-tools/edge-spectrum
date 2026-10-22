/**
 * The canonical Edge Spectrum dataset — the single source of truth for every
 * asset and game the hub reasons about.
 *
 * Roadmap Action 2.2. Three copies of this data used to exist and drift:
 * the inlined `RAW` array in `site/public/spectrum/index.html`, the
 * `RAW` list in the Streamlit port (since removed), and the tables in `data/`.
 * The remaining copies all come from here — run `npm run gen:edges` after editing this
 * file, and CI runs `npm run gen:edges -- --check` to fail on drift.
 *
 * Only the fields that carry information live here. `g`, `type`, `vol`,
 * `wp` and `sk` are pure functions of `cat` and `m`, so
 * `toSpectrumRow()` re-expands them for the visualizer rather than storing
 * hundreds of copies of the string "Varies".
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
  "Trading & Derivatives",
  "Sports Betting",
  "Horse Racing & Pari-Mutuel",
  "Casino Gambling",
  "Poker & Skill-Based",
  "Prediction Markets",
  "Lottery",
] as const;

export type EdgeCategory = (typeof EDGE_CATEGORIES)[number];

/**
 * Optional citation for a record's figures. Roadmap Action 2.3 — `npm run check:edges`
 * ratchets coverage upward as records are cited, so it can only improve, never
 * silently regress.
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
  // Provenance rides along under short keys so the page can cite it; absent fields are omitted.
  const cite = {
    ...(r.source ? { src: r.source } : {}),
    ...(r.asOf ? { asOf: r.asOf } : {}),
    ...(r.window ? { win: r.window } : {}),
    ...(r.methodology ? { how: r.methodology } : {}),
  };
  return r.m === 'i'
    ? { n: r.n, cat: r.cat, g: r.cat, m: r.m, a: r.a, ly: r.ly, type: 'Asset', vol: 'Varies', wp: 'Market Rate', sk: 'Passive', ...cite }
    : { n: r.n, cat: r.cat, g: r.cat, m: r.m, e: r.e, du: r.du, ced: r.ced, ly: r.ly, type: 'Game', vol: 'Varies', wp: 'EV Calculated', sk: 'Varies', ...cite };
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
  { n: "Private Credit / BDC Index (BIZD)", cat: "Bonds", m: 'i', ly: 'raw', a: 9.0, asOf: "2026-10-12", methodology: "Representative long-run total return of listed business development companies; high distribution yield offset by NAV erosion and credit losses. Approximate." },
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
  { n: "Staked Ethereum (ETH + Staking Yield)", cat: "Cryptocurrency", m: 'i', ly: 'raw', a: 13.0, asOf: "2026-10-12", methodology: "Ethereum spot figure plus a ~3% native staking yield; ignores slashing and liquidity risk. Approximate." },
  { n: "Leveraged Perpetual Futures (Retail Avg)", cat: "Cryptocurrency", m: 'i', ly: 'raw', a: -60.0, asOf: "2026-10-12", methodology: "Representative annual outcome for retail accounts trading 10x-plus perpetual swaps: funding costs plus liquidation losses. Approximate." },
  { n: "Bitcoin Spot ETF After 0.25% Fee (IBIT)", cat: "Cryptocurrency", m: 'i', ly: 'fee', a: 44.75, asOf: "2026-10-12", methodology: "Bitcoin spot figure less the 0.25% sponsor fee of the largest US spot ETF." },
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

  // --- TRADING & DERIVATIVES (Mixed) ---
  // Re-admitted 2026-10-12. V11 cut these as "outlier noise" because a −60%/yr row squashed the
  // old single shared axis; return on capital is floored at −100% now, so that reason is gone.
  { n: "Covered Call ETF (JEPI/QYLD)", cat: "Trading & Derivatives", m: 'i', ly: 'raw', a: 7.0, asOf: "2026-10-12", methodology: "Representative total return of option-overwriting equity income ETFs: high distributions, capped upside. Approximate." },
  { n: "Systematic Put Writing (PUTW)", cat: "Trading & Derivatives", m: 'i', ly: 'raw', a: 6.0, asOf: "2026-10-12", methodology: "Long-run total return of a rules-based cash-secured S&P 500 put-writing index. Approximate." },
  { n: "Managed Futures / Trend Following (DBMF)", cat: "Trading & Derivatives", m: 'i', ly: 'raw', a: 5.0, asOf: "2026-10-12", methodology: "Representative long-run return of diversified trend-following CTAs net of fees. Approximate." },
  { n: "3x Leveraged Nasdaq Held (TQQQ)", cat: "Trading & Derivatives", m: 'i', ly: 'raw', a: 15.0, asOf: "2026-10-12", methodology: "Path-dependent: daily 3x rebalancing carries volatility decay, so the realised figure swings from strongly positive in a bull run to deeply negative across a drawdown. Rough bull-market average." },
  { n: "Retail Day Trading (Avg)", cat: "Trading & Derivatives", m: 'i', ly: 'raw', a: -15.0, source: "Barber, Lee, Liu & Odean, 'Do Day Traders Rationally Learn About Their Ability?' (2014); Chague, De-Losso & Giovannetti, 'Day Trading for a Living?' (2020)", asOf: "2026-10-12", methodology: "The large majority of retail day traders lose money net of costs in every market studied; the figure is a round representative annual loss, not a measured index." },
  { n: "Retail Options Buying (Avg)", cat: "Trading & Derivatives", m: 'i', ly: 'raw', a: -20.0, asOf: "2026-10-12", methodology: "Short-dated call and put buying by retail accounts shows persistent aggregate losses after bid-ask spreads and time decay. Approximate." },
  { n: "Retail Forex / CFD Trading (Avg)", cat: "Trading & Derivatives", m: 'i', ly: 'raw', a: -25.0, source: "ESMA retail CFD intervention measures; mandated broker risk warnings (74-89% of retail CFD accounts lose money)", asOf: "2026-10-12", methodology: "Representative annual loss consistent with the loss-rate disclosures regulators require brokers to publish. Approximate." },
  { n: "0DTE Options Buying (Retail)", cat: "Trading & Derivatives", m: 'i', ly: 'raw', a: -40.0, asOf: "2026-10-12", methodology: "Same-day-expiry contracts bought outright: time decay and spread make the expected hold-to-expiry outcome sharply negative. Approximate." },
  { n: "Inverse / Short ETF Held (SQQQ)", cat: "Trading & Derivatives", m: 'i', ly: 'raw', a: -60.0, asOf: "2026-10-12", methodology: "A −3x daily index fund held through a rising market: leverage decay plus the index's own drift. Approximate long-run realised figure." },
  { n: "Binary Options (Offshore)", cat: "Trading & Derivatives", m: 'g', ly: 'raw', e: -10.0, du: 10, ced: 2, asOf: "2026-10-12", methodology: "A typical offshore binary pays 70-85% on a win and loses 100% on a loss; at a 50% strike the expected loss per contract is 8-15% of stake." },

  // --- SPORTS BETTING (Linear) ---
  { n: "Sharp Bettor (+2% Closing Line Value)", cat: "Sports Betting", m: 'g', ly: 'raw', e: 2.0, du: 3, ced: 2, asOf: "2026-10-12", methodology: "A bettor who consistently beats the closing line by 2% after the vig; the small minority of accounts books limit. Representative, not an index." },
  { n: "Betting Exchange (2% Commission)", cat: "Sports Betting", m: 'g', ly: 'raw', e: -1.0, du: 2, ced: 3, source: "Betfair Exchange market base rate (2% of net winnings per market)", asOf: "2026-10-12", methodology: "Commission is charged on net winnings only, so at even money the expected cost is about half the rate, i.e. 1% of stake." },
  { n: "Reduced Juice Line (-105)", cat: "Sports Betting", m: 'g', ly: 'raw', e: -2.38, du: 2, ced: 3, asOf: "2026-10-12", methodology: "Two-way market priced at -105 each side: 2 × 51.22% = 102.44% implied; hold on handle = 2.44 / 102.44 = 2.38%." },
  { n: "Single Game Spread (-110)", cat: "Sports Betting", m: 'g', ly: 'raw', e: -4.55, du: 2, ced: 3 },
  { n: "Single Game O/U (-110)", cat: "Sports Betting", m: 'g', ly: 'raw', e: -4.55, du: 2, ced: 3 },
  { n: "Moneyline (Standard Juice)", cat: "Sports Betting", m: 'g', ly: 'raw', e: -4.55, du: 2, ced: 3 },
  { n: "Teaser 2-Team 6pt", cat: "Sports Betting", m: 'g', ly: 'raw', e: -5.0, du: 1, ced: 3 },
  { n: "Live / In-Game Bet", cat: "Sports Betting", m: 'g', ly: 'raw', e: -6.5, du: 5, ced: 3 },
  { n: "Player Prop Bet", cat: "Sports Betting", m: 'g', ly: 'raw', e: -7.0, du: 3, ced: 2 },
  { n: "Micro-Bet (Next Play / Next Pitch)", cat: "Sports Betting", m: 'g', ly: 'raw', e: -9.0, du: 20, ced: 1, asOf: "2026-10-12", methodology: "In-play micro markets are typically priced with an 8-10% hold, roughly double a standard -110 two-way line. Approximate." },
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

  // --- HORSE RACING & PARI-MUTUEL (Linear) ---
  // Pari-mutuel pools return the pool minus the track's takeout, so for a bettor with no edge the
  // takeout rate IS the expected loss per dollar wagered.
  { n: "Horse Racing with 8% ADW Rebate", cat: "Horse Racing & Pari-Mutuel", m: 'g', ly: 'raw', e: -12.0, du: 3, ced: 2, asOf: "2026-10-12", methodology: "A ~20% exotic takeout less an 8% advance-deposit-wagering volume rebate; rebates of 5-10% are common for high-volume players." },
  { n: "Horse Racing Win / Place / Show", cat: "Horse Racing & Pari-Mutuel", m: 'g', ly: 'raw', e: -17.0, du: 3, ced: 2, source: "Horseplayers Association of North America (HANA) track takeout ratings", asOf: "2026-10-12", methodology: "Typical US win/place/show pool takeout is 15-20%; the midpoint is used." },
  { n: "Horse Racing Exacta / Daily Double", cat: "Horse Racing & Pari-Mutuel", m: 'g', ly: 'raw', e: -20.0, du: 2, ced: 2, source: "Horseplayers Association of North America (HANA) track takeout ratings", asOf: "2026-10-12", methodology: "Typical US two-horse exotic pool takeout is 18-22%; the midpoint is used." },
  { n: "Greyhound Racing", cat: "Horse Racing & Pari-Mutuel", m: 'g', ly: 'raw', e: -20.0, du: 3, ced: 2, asOf: "2026-10-12", methodology: "Pari-mutuel takeout at the remaining US and UK dog tracks, 18-25% across pools. Approximate." },
  { n: "Horse Racing Trifecta / Superfecta", cat: "Horse Racing & Pari-Mutuel", m: 'g', ly: 'raw', e: -25.0, du: 2, ced: 1, source: "Horseplayers Association of North America (HANA) track takeout ratings", asOf: "2026-10-12", methodology: "Typical US multi-horse exotic pool takeout is 22-26%." },
  { n: "Horse Racing Pick 4 / Pick 6", cat: "Horse Racing & Pari-Mutuel", m: 'g', ly: 'raw', e: -25.0, du: 0.5, ced: 1, asOf: "2026-10-12", methodology: "Multi-race pools carry the same 22-26% takeout as the exotics; occasional carryovers lower it. Approximate." },

  // --- CASINO GAMBLING (Linear) ---
  { n: "Blackjack Card Counting (Skilled)", cat: "Casino Gambling", m: 'g', ly: 'raw', e: 1.0, du: 60, ced: 2, source: "Wizard of Odds, Card counting (wizardofodds.com/games/blackjack/card-counting/); Thorp, Beat the Dealer (1962)", asOf: "2026-10-12", methodology: "Typical long-run advantage of a competent Hi-Lo counter with a 1-8 bet spread on a 6-deck shoe, +0.5% to +1.5%; the midpoint is used." },
  { n: "Spanish 21 (Dealer Stands Soft 17)", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -0.4, du: 60, ced: 2, source: "Wizard of Odds, Spanish 21 (wizardofodds.com/games/spanish-21/)", asOf: "2026-10-12", methodology: "House edge with the dealer standing on soft 17 under optimal strategy." },
  { n: "Video Poker 9/6 JoB", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -0.46, du: 80, ced: 1 },
  { n: "Blackjack 3:2 Basic Strategy", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -0.5, du: 60, ced: 2 },
  { n: "Craps Place 6 / Place 8", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -0.46, du: 40, ced: 2, source: "Wizard of Odds, Craps house edge table (wizardofodds.com/games/craps/appendix/2/)", asOf: "2026-10-21", methodology: "Pays 7 to 6 on a 6 or 8 before a 7; house edge per bet made." },
  { n: "Baccarat Banker", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -1.06, du: 50, ced: 3 },
  { n: "Crypto Dice (1% House Edge)", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -1.0, du: 1000, ced: 0.5, asOf: "2026-10-12", methodology: "Provably-fair dice sites advertise a 1% edge; auto-bet modes run hundreds of rolls an hour, which is what makes the time to ruin so short." },
  { n: "Baccarat Player", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -1.24, du: 50, ced: 3 },
  { n: "Roulette Single Zero La Partage", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -1.35, du: 40, ced: 3, source: "Wizard of Odds, Roulette basics (wizardofodds.com/games/roulette/basics/)", asOf: "2026-10-14", methodology: "Even-money bets on a single-zero wheel with half the stake returned when the ball lands on zero: expected value -1/74, a 1.35% house edge." },
  { n: "Craps Hard 6 / Hard 8", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -2.78, du: 40, ced: 1, source: "Wizard of Odds, Craps house edge table (wizardofodds.com/games/craps/appendix/2/)", asOf: "2026-10-14", methodology: "US payout of 9 to 1 on a double-3 or double-4 before a 7 or the easy way; house edge per bet made." },
  { n: "Three Card Poker Pair Plus", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -7.28, du: 40, ced: 3, source: "Wizard of Odds, Three Card Poker (wizardofodds.com/games/three-card-poker/)", asOf: "2026-10-21", methodology: "Pair Plus side bet on pay table 1 (straight flush 40, three of a kind 30, straight 6, flush 3, pair 1): house edge 7.276%." },
  { n: "Craps Any Craps", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -11.11, du: 40, ced: 1, source: "Wizard of Odds, Craps house edge table (wizardofodds.com/games/craps/appendix/2/)", asOf: "2026-10-21", methodology: "One-roll bet that pays 7 to 1 on a 2, 3 or 12; house edge per bet made." },
  { n: "Roulette Five-Number Bet (0-00-1-2-3)", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -7.89, du: 40, ced: 3, source: "Wizard of Odds, Roulette basics (wizardofodds.com/games/roulette/basics/)", asOf: "2026-10-14", methodology: "Pays 6 to 1 on 5 of 38 pockets, against 5.26% on every other American roulette bet." },
  { n: "Craps Don't Pass", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -1.36, du: 40, ced: 2 },
  { n: "Craps Pass Line", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -1.41, du: 40, ced: 2 },
  { n: "Blackjack 6:5", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -2.0, du: 60, ced: 2 },
  { n: "Ultimate Texas Hold'em", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -2.19, du: 30, ced: 3, source: "Wizard of Odds, Ultimate Texas Hold'em (wizardofodds.com/games/ultimate-texas-hold-em/)", asOf: "2026-10-12", methodology: "House edge relative to the Ante bet under optimal strategy." },
  { n: "Craps Field (3:1 on 12)", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -2.78, du: 40, ced: 2, source: "Wizard of Odds, Craps house edge table (wizardofodds.com/games/craps/appendix/2/)", asOf: "2026-10-07", methodology: "Exact single-roll expectation; 2 pays 2:1 and 12 pays 3:1, per bet made." },
  { n: "Pai Gow Poker", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -2.5, du: 30, ced: 3 },
  { n: "Roulette Single Zero", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -2.7, du: 40, ced: 3 },
  { n: "Sic Bo Big / Small", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -2.78, du: 40, ced: 2, source: "Wizard of Odds, Sic Bo (wizardofodds.com/games/sic-bo/)", asOf: "2026-10-12", methodology: "Exact single-roll expectation: Big and Small pay even money and lose to any triple, 105 wins against 111 losses of 216 outcomes." },
  { n: "Casino War", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -2.88, du: 50, ced: 2, source: "Wizard of Odds, Casino War (wizardofodds.com/games/casino-war/)", asOf: "2026-10-12", methodology: "Six decks, always going to war on a tie, no tie side bet." },
  { n: "Three Card Poker", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -3.4, du: 40, ced: 3 },
  { n: "Let It Ride", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -3.5, du: 30, ced: 3 },
  { n: "Online Slots 96% RTP", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -4.0, du: 600, ced: 0.5, asOf: "2026-10-12", methodology: "Published return-to-player of a typical regulated online slot is 94-97%; online spin rates run higher than a casino floor." },
  { n: "Slots Loose 95%", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -5.0, du: 500, ced: 0.5 },
  { n: "Caribbean Stud", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -5.2, du: 30, ced: 3 },
  { n: "Roulette Double Zero", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -5.26, du: 40, ced: 3 },
  { n: "Slots Average 92%", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -8.0, du: 500, ced: 0.5 },
  { n: "Slots Tight 85%", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -15.0, du: 500, ced: 0.5 },
  { n: "Baccarat Tie (8:1)", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -14.36, du: 50, ced: 3, source: "Wizard of Odds, Baccarat basics (wizardofodds.com/games/baccarat/basics/)", asOf: "2026-10-07", methodology: "Exact combinatorial analysis of an 8-deck shoe; Tie pays 8 to 1." },
  { n: "Big Six Wheel", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -16.0, du: 20, ced: 2 },
  { n: "Craps Any Seven", cat: "Casino Gambling", m: 'g', ly: 'raw', e: -16.67, du: 40, ced: 2, source: "Wizard of Odds, Craps house edge table (wizardofodds.com/games/craps/appendix/2/)", asOf: "2026-10-07", methodology: "Exact single-roll expectation; pays 4 to 1, per bet made." },
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
  { n: "Pull-Tab Tickets", cat: "Lottery", m: 'g', ly: 'raw', e: -20.0, du: 1, ced: 0.3, asOf: "2026-10-12", methodology: "Charitable pull-tab deals are manufactured to a fixed 75-85% payout; the midpoint is used." },
  { n: "$1 Scratch-Off Best Odds", cat: "Lottery", m: 'g', ly: 'raw', e: -25.0, du: 1, ced: 0.5 },
  { n: "Bingo Hall Session", cat: "Lottery", m: 'g', ly: 'raw', e: -25.0, du: 0.5, ced: 1, asOf: "2026-10-12", methodology: "Commercial and charity bingo halls return roughly 70-80% of card sales as prizes. Approximate." },
  { n: "Premium Scratch-Off $20+", cat: "Lottery", m: 'g', ly: 'raw', e: -30.0, du: 0.5, ced: 1 },
  { n: "Scratch-Off Tickets Avg", cat: "Lottery", m: 'g', ly: 'raw', e: -35.0, du: 0.5, ced: 0.5 },
  { n: "Keno State-Run", cat: "Lottery", m: 'g', ly: 'raw', e: -40.0, du: 2, ced: 0.5 },
  { n: "Daily Numbers Game", cat: "Lottery", m: 'g', ly: 'raw', e: -42.0, du: 1, ced: 0.5 },
  { n: "State Pick 6 / Lotto", cat: "Lottery", m: 'g', ly: 'raw', e: -45.0, du: 0.15, ced: 0.1 },
  { n: "State Lottery Pick 3/4", cat: "Lottery", m: 'g', ly: 'raw', e: -50.0, du: 0.5, ced: 0.3 },
  { n: "EuroMillions", cat: "Lottery", m: 'g', ly: 'raw', e: -50.0, du: 0.1, ced: 0.1, source: "EuroMillions game procedures: 50% of ticket revenue is allocated to the prize fund", asOf: "2026-10-12", methodology: "Expected return equals the prize-fund share of sales, ignoring unclaimed prizes." },
  { n: "Charity 50/50 Raffle", cat: "Lottery", m: 'g', ly: 'raw', e: -50.0, du: 0.05, ced: 0.5, asOf: "2026-10-12", methodology: "By construction half the pot goes to the single winner and half to the cause." },
  { n: "Powerball / Mega Millions", cat: "Lottery", m: 'g', ly: 'raw', e: -52.0, du: 0.1, ced: 0.1 },
  { n: "Multi-State Cash4Life", cat: "Lottery", m: 'g', ly: 'raw', e: -55.0, du: 0.1, ced: 0.1 },
];
