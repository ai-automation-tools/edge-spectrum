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
 * Only the fields that carry information live here. `type` is a pure function
 * of `m`, so `toSpectrumRow()` adds it for the visualizer. The `g`, `vol`, `wp`
 * and `sk` it once added too were never read and are gone (audit ARCH-07).
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
 * What kind of evidence a figure needs (audit PROD-07). `math` follows from the rules and
 * payouts (a −110 line, a roulette wheel, a fixed prize table); `published` is a rate, price,
 * index or takeout someone publishes; `estimate` is a typical outcome no one publishes as a
 * single figure (retail day trading, collectibles, poker win rates).
 */
export type Basis = 'math' | 'published' | 'estimate';

/**
 * The share of a category's records that must cite a `source` before the dataset may grow
 * (audit PROD-08). While any category is below it, `check:edges -- --write-baseline` refuses
 * to record a new row anywhere: cite the existing rows first. A category's cited count may
 * never fall either way.
 */
export const MIN_CITED_SHARE = 0.5;

/**
 * A record's basis and optional citation. Roadmap Action 2.3 — `npm run check:edges`
 * ratchets cited coverage per category, so it can only improve, never silently regress.
 */
export type Provenance = {
  basis: Basis;
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
  /** Edge per decision, percent. Negative for most rows; a few skilled-play rows are positive on purpose. */
  e: number;
  /** Decisions per day at typical play. */
  du: number;
  /** Capital exposed per decision, percent of bankroll. */
  ced: number;
  /**
   * Average net win per unit staked on a winning decision (a 5.7 means a cash returns the
   * stake plus 5.7×). Absent = even money. Only the positive-edge risk figures read it:
   * the win rate follows from `e` and this, so it is not stored separately.
   */
  payout?: number;
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
    // A math figure follows from the rules, so the page never ages it into "verify" (audit PROD-07).
    ...(r.basis === 'math' ? { b: 'math' } : {}),
  };
  return r.m === 'i'
    ? { n: r.n, cat: r.cat, m: r.m, a: r.a, ly: r.ly, type: 'Asset', ...cite }
    : { n: r.n, cat: r.cat, m: r.m, e: r.e, du: r.du, ced: r.ced, ...(r.payout ? { pay: r.payout } : {}), ly: r.ly, type: 'Game', ...cite };
}

export const EDGES: readonly EdgeRecord[] = [
  // --- STOCK MARKET (Compound) ---
  { n: "NASDAQ 100 (QQQ)", cat: "Stock Market", m: 'i', ly: 'raw', basis: 'published', a: 10.57, source: "Invesco, Invesco QQQ Trust, average annual performance (fund NAV since inception, as of 2026-10-31)", asOf: "2026-11-12", window: "1999-03-10 to 2026-10-31", methodology: "NAV total return since inception, annualized, distributions reinvested." },
  { n: "S&P 500 Growth (IVW)", cat: "Stock Market", m: 'i', ly: 'raw', basis: 'published', a: 8.92, source: "iShares (BlackRock), iShares S&P 500 Growth ETF, average annual returns (NAV since inception, as of 2026-09-30)", asOf: "2026-11-12", window: "2000-05-22 to 2026-09-30", methodology: "NAV total return since inception, annualized, distributions reinvested. Starts near the 2000 peak; the 10-year figure is 17.78%." },
  { n: "Small-Cap Value (VBR)", cat: "Stock Market", m: 'i', ly: 'raw', basis: 'published', a: 9.18, source: "Vanguard, Small-Cap Value ETF, quarter-end average annual returns (NAV since inception, as of 2026-09-30)", asOf: "2026-11-12", window: "2004-01-26 to 2026-09-30", methodology: "NAV total return since inception, annualized, distributions reinvested." },
  { n: "S&P MidCap 400 (MDY)", cat: "Stock Market", m: 'i', ly: 'raw', basis: 'published', a: 11.11, source: "State Street (SPDR), SPDR S&P MidCap 400 ETF Trust, fund performance (NAV since inception, as of 2026-09-30)", asOf: "2026-11-12", window: "1995-05-04 to 2026-09-30", methodology: "NAV total return since inception, annualized, distributions reinvested." },
  { n: "Dividend Aristocrats (NOBL)", cat: "Stock Market", m: 'i', ly: 'raw', basis: 'published', a: 10.22, source: "ProShares, ProShares S&P 500 Dividend Aristocrats ETF, quarter-end total returns (NAV since inception, as of 2026-09-30)", asOf: "2026-11-12", window: "2013-10-09 to 2026-09-30", methodology: "NAV total return since inception, annualized, distributions reinvested." },
  { n: "Total US Stock Market (VTI)", cat: "Stock Market", m: 'i', ly: 'raw', basis: 'published', a: 9.44, source: "Vanguard, Total Stock Market ETF, quarter-end average annual returns (NAV since inception, as of 2026-09-30)", asOf: "2026-11-12", window: "2001-05-24 to 2026-09-30", methodology: "NAV total return since inception, annualized, distributions reinvested." },
  { n: "S&P 500 Index (SPY/VOO)", cat: "Stock Market", m: 'i', ly: 'raw', basis: 'published', a: 10.0, source: "Damodaran (NYU Stern), Historical Returns on Stocks, Bonds and Bills, S&P 500 including dividends", asOf: "2026-10-19", window: "1928-2025", methodology: "Compound annual growth of the S&P 500 with dividends reinvested: 10.02% across 98 years. Index-fund fees are the separate fee rows." },
  { n: "S&P 500 Equal Weight (RSP)", cat: "Stock Market", m: 'i', ly: 'raw', basis: 'published', a: 11.3, source: "Invesco, Invesco S&P 500 Equal Weight ETF, average annual performance (fund NAV since inception, as of 2026-10-31)", asOf: "2026-11-12", window: "2003-04-24 to 2026-10-31", methodology: "NAV total return since inception, annualized, distributions reinvested." },
  { n: "Dow Jones Industrial (DIA)", cat: "Stock Market", m: 'i', ly: 'raw', basis: 'published', a: 9.02, source: "State Street (SPDR), SPDR Dow Jones Industrial Average ETF Trust, fund performance (NAV since inception, as of 2026-09-30)", asOf: "2026-11-12", window: "1998-01-14 to 2026-09-30", methodology: "NAV total return since inception, annualized, distributions reinvested." },
  { n: "S&P 500 Value (IVE)", cat: "Stock Market", m: 'i', ly: 'raw', basis: 'published', a: 7.49, source: "iShares (BlackRock), iShares S&P 500 Value ETF, average annual returns (NAV since inception, as of 2026-09-30)", asOf: "2026-11-12", window: "2000-05-22 to 2026-09-30", methodology: "NAV total return since inception, annualized, distributions reinvested. Starts near the 2000 peak; the 10-year figure is 11.51%." },
  { n: "Russell 2000 Small Cap (IWM)", cat: "Stock Market", m: 'i', ly: 'raw', basis: 'published', a: 8.35, source: "iShares (BlackRock), iShares Russell 2000 ETF, average annual returns (NAV since inception, as of 2026-09-30)", asOf: "2026-11-12", window: "2000-05-22 to 2026-09-30", methodology: "NAV total return since inception, annualized, distributions reinvested." },
  { n: "REIT Index ETF (VNQ)", cat: "Stock Market", m: 'i', ly: 'raw', basis: 'published', a: 7.25, source: "Vanguard, Real Estate ETF, quarter-end average annual returns (NAV since inception, as of 2026-09-30)", asOf: "2026-11-12", window: "2004-09-23 to 2026-09-30", methodology: "NAV total return since inception, annualized, distributions reinvested." },
  { n: "S&P 500 High Dividend (SPYD)", cat: "Stock Market", m: 'i', ly: 'raw', basis: 'published', a: 8.81, source: "State Street (SPDR), SPDR Portfolio S&P 500 High Dividend ETF, fund performance (NAV since inception, as of 2026-09-30)", asOf: "2026-11-12", window: "2015-10-21 to 2026-09-30", methodology: "NAV total return since inception, annualized, distributions reinvested." },
  { n: "DAX Germany Index", cat: "Stock Market", m: 'i', ly: 'raw', basis: 'published', a: 5.28, source: "iShares (BlackRock), iShares Core DAX UCITS ETF (DE), annualised performance (NAV since launch, EUR, as of 2026-10-31)", asOf: "2026-11-12", window: "2000-12-27 to 2026-10-31", methodology: "NAV total return of a fund tracking the DAX, in euros, so currency moves are not included." },
  { n: "Nikkei 225 Japan Index", cat: "Stock Market", m: 'i', ly: 'raw', basis: 'published', a: 8.34, source: "iShares (BlackRock), iShares Nikkei 225 UCITS ETF (DE), annualised performance (NAV since launch, JPY, as of 2026-10-31)", asOf: "2026-11-12", window: "2006-07-05 to 2026-10-31", methodology: "NAV total return of a fund tracking the Nikkei 225, in yen, so currency moves are not included." },
  { n: "MSCI EAFE Intl Developed (EFA)", cat: "Stock Market", m: 'i', ly: 'raw', basis: 'published', a: 6.41, source: "iShares (BlackRock), iShares MSCI EAFE ETF, average annual returns (NAV since inception, as of 2026-09-30)", asOf: "2026-11-12", window: "2001-08-14 to 2026-09-30", methodology: "NAV total return since inception, annualized, distributions reinvested. In US dollars." },
  { n: "FTSE 100 UK Index", cat: "Stock Market", m: 'i', ly: 'raw', basis: 'published', a: 5.53, source: "iShares (BlackRock), iShares Core FTSE 100 UCITS ETF, annualised performance (NAV since launch, GBP, as of 2026-10-31)", asOf: "2026-11-12", window: "2000-04-27 to 2026-10-31", methodology: "NAV total return of a fund tracking the FTSE 100, in pounds, so currency moves are not included." },
  { n: "MSCI Emerging Markets (EEM)", cat: "Stock Market", m: 'i', ly: 'raw', basis: 'published', a: 9.94, source: "iShares (BlackRock), iShares MSCI Emerging Markets ETF, average annual returns (NAV since inception, as of 2026-09-30)", asOf: "2026-11-12", window: "2003-04-07 to 2026-09-30", methodology: "NAV total return since inception, annualized, distributions reinvested. In US dollars." },
  { n: "Commodity Index (DJP)", cat: "Stock Market", m: 'i', ly: 'raw', basis: 'published', a: -0.18, source: "Total Real Returns, DJP total return chart (nominal annualized total return, as of 2026-11-11)", asOf: "2026-11-12", window: "2006-06-07 to 2026-11-11", methodology: "Market-price total return from an aggregator; the issuer's own figure could not be read." },
  { n: "Individual Stock Picking (Retail)", cat: "Stock Market", m: 'i', ly: 'raw', basis: 'estimate', a: -2.0 },
  { n: "Penny Stocks (Retail Avg)", cat: "Stock Market", m: 'i', ly: 'raw', basis: 'estimate', a: -30.0 },
  { n: "S&P 500 After 0.03% Index Fee", cat: "Stock Market", m: 'i', ly: 'fee', basis: 'published', a: 9.97, source: "Damodaran (NYU Stern), Historical Returns on Stocks, Bonds and Bills, S&P 500 including dividends", asOf: "2026-10-19", window: "1928-2025", methodology: "The S&P 500 row (10.0%) less a 0.03% index-fund expense ratio." },
  { n: "S&P 500 After 0.35% Robo-Advisor", cat: "Stock Market", m: 'i', ly: 'fee', basis: 'published', a: 9.65, source: "Damodaran (NYU Stern), Historical Returns on Stocks, Bonds and Bills, S&P 500 including dividends", asOf: "2026-10-19", window: "1928-2025", methodology: "The S&P 500 row (10.0%) less a 0.35% robo-advisor fee." },
  { n: "S&P 500 After 0.60% Target-Date Fund", cat: "Stock Market", m: 'i', ly: 'fee', basis: 'published', a: 9.4, source: "Damodaran (NYU Stern), Historical Returns on Stocks, Bonds and Bills, S&P 500 including dividends", asOf: "2026-10-19", window: "1928-2025", methodology: "The S&P 500 row (10.0%) less a 0.60% target-date fund expense ratio." },
  { n: "S&P 500 After 1% Advisory Fee", cat: "Stock Market", m: 'i', ly: 'fee', basis: 'published', a: 9.0, source: "Damodaran (NYU Stern), Historical Returns on Stocks, Bonds and Bills, S&P 500 including dividends", asOf: "2026-10-19", window: "1928-2025", methodology: "The S&P 500 row (10.0%) less a 1% assets-under-management advisory fee." },
  { n: "S&P 500 After 1.5% Active Mutual Fund", cat: "Stock Market", m: 'i', ly: 'fee', basis: 'published', a: 8.5, source: "Damodaran (NYU Stern), Historical Returns on Stocks, Bonds and Bills, S&P 500 including dividends", asOf: "2026-10-19", window: "1928-2025", methodology: "The S&P 500 row (10.0%) less a 1.5% active-fund expense ratio, assuming the fund matches the index before fees." },
  { n: "S&P 500 After 2-and-20 Hedge Fund", cat: "Stock Market", m: 'i', ly: 'fee', basis: 'published', a: 6.4, source: "Damodaran (NYU Stern), Historical Returns on Stocks, Bonds and Bills, S&P 500 including dividends", asOf: "2026-10-19", window: "1928-2025", methodology: "The S&P 500 row (10.0%) less a 2% management fee, then 20% of the remaining 8% as performance fee." },
  { n: "S&P 500 After 2-and-20 (Underperforming)", cat: "Stock Market", m: 'i', ly: 'fee', basis: 'estimate', a: 4.0 },
  { n: "S&P 500 After LTCG Tax (20%)", cat: "Stock Market", m: 'i', ly: 'tax', basis: 'published', a: 8.0, source: "Damodaran (NYU Stern), Historical Returns on Stocks, Bonds and Bills, S&P 500 including dividends", asOf: "2026-10-19", window: "1928-2025", methodology: "The S&P 500 row (10.0%) with 20% of each year's return taxed away. A simplification: real long-term gains are taxed only on sale, so a buy-and-hold investor does better." },
  { n: "S&P 500 After STCG Tax (37%)", cat: "Stock Market", m: 'i', ly: 'tax', basis: 'published', a: 6.3, source: "Damodaran (NYU Stern), Historical Returns on Stocks, Bonds and Bills, S&P 500 including dividends", asOf: "2026-10-19", window: "1928-2025", methodology: "The S&P 500 row (10.0%) with 37% of each year's return taxed as short-term gains, as for a position turned over inside a year." },
  { n: "S&P 500 After 1% Fee + LTCG Tax", cat: "Stock Market", m: 'i', ly: 'tax', basis: 'published', a: 7.2, source: "Damodaran (NYU Stern), Historical Returns on Stocks, Bonds and Bills, S&P 500 including dividends", asOf: "2026-10-19", window: "1928-2025", methodology: "The S&P 500 row less a 1% advisory fee (9.0%), then 20% of that taxed." },
  { n: "Qualified Dividends (SPYD) After 15% Tax", cat: "Stock Market", m: 'i', ly: 'tax', basis: 'published', a: 8.19, source: "State Street (SPDR), SPDR Portfolio S&P 500 High Dividend ETF, fund performance and distribution yield (as of 2026-09-30 and 2026-11-11)", asOf: "2026-11-12", window: "2015-10-21 to 2026-09-30", methodology: "The SPYD row (8.81%) less 15% of its 4.12% distribution yield: 8.81 - 0.62 = 8.19%. About a quarter of the fund is REITs, whose dividends are mostly not qualified, so this flatters it." },

  // --- CASH & SAVINGS (Compound) ---
  { n: "Money Market Fund (SPAXX/VMFXX)", cat: "Cash & Savings", m: 'i', ly: 'raw', basis: 'published', a: 3.7, source: "Crane Data, Crane 100 Money Fund Index (annualized 7-day current yield, 3.71% as of 2026-10-19)", asOf: "2026-10-19", methodology: "The average yield of the 100 largest taxable money market funds, which the big brokerage sweep funds track closely. Moves with the Fed funds rate." },
  { n: "High-Yield Savings Account (Online)", cat: "Cash & Savings", m: 'i', ly: 'raw', basis: 'published', a: 4.2, source: "Bankrate, Best high-yield savings accounts (editorial picks dated 2026-10-13 to 2026-10-20)", asOf: "2026-10-19", methodology: "A top online savings rate: Bankrate's picks ranged 3.75% to 4.27%, with several banks at 4.20%. Promotional and balance-capped rates excluded. Variable; moves with the Fed funds rate." },
  { n: "1-Year CD (Top Rate)", cat: "Cash & Savings", m: 'i', ly: 'raw', basis: 'published', a: 4.65, source: "Bankrate, Best 1-year CD rates of November 2026 (top APY, rates updated 2026-11-05 to 2026-11-11)", asOf: "2026-11-12", methodology: "The highest APY among Bankrate's picks." },
  { n: "6-Month CD", cat: "Cash & Savings", m: 'i', ly: 'raw', basis: 'published', a: 4.4, source: "Bankrate, Best 6-month CD rates for November 2026 (top APY, rates updated 2026-11-05 to 2026-11-11)", asOf: "2026-11-12", methodology: "The highest APY among Bankrate's picks; the FDIC national average is 1.39%." },
  { n: "High-Yield Money Market Account", cat: "Cash & Savings", m: 'i', ly: 'raw', basis: 'published', a: 4.05, source: "Bankrate, Best money market accounts of November 2026 (top editorial-pick APY as of 2026-11-12)", asOf: "2026-11-12", methodology: "The highest APY among Bankrate's editorial picks, sponsored listings left out." },
  { n: "Cash Management Account (SoFi/Wealthfront)", cat: "Cash & Savings", m: 'i', ly: 'raw', basis: 'published', a: 3.55, source: "Wealthfront, Cash Account (base APY as of 2026-10-01)", asOf: "2026-11-12", methodology: "Base rate without promotional boosts; SoFi's savings rate with direct deposit is 3.30% (2026-10-20)." },
  { n: "No-Penalty CD", cat: "Cash & Savings", m: 'i', ly: 'raw', basis: 'published', a: 4.0 },
  { n: "3-Month CD", cat: "Cash & Savings", m: 'i', ly: 'raw', basis: 'published', a: 4.0 },
  { n: "2-Year CD", cat: "Cash & Savings", m: 'i', ly: 'raw', basis: 'published', a: 4.8, source: "Bankrate, Best 2-year CD rates for November 2026 (top APY, rates updated 2026-11-05 to 2026-11-11)", asOf: "2026-11-12", methodology: "The highest APY among Bankrate's picks; the FDIC national average is 1.55%." },
  { n: "5-Year CD", cat: "Cash & Savings", m: 'i', ly: 'raw', basis: 'published', a: 5.0, source: "Bankrate, Best 5-year CD rates for November 2026 (top APY, rates updated 2026-11-05 to 2026-11-11)", asOf: "2026-11-12", methodology: "The highest APY among Bankrate's picks; the FDIC national average is 1.41%." },
  { n: "Bank Money Market (Traditional)", cat: "Cash & Savings", m: 'i', ly: 'raw', basis: 'published', a: 0.63, source: "FDIC National Rates and Rate Caps (national deposit rates published 2026-10-19)", asOf: "2026-10-19", methodology: "FDIC national average money market deposit rate." },
  { n: "Credit Union Savings", cat: "Cash & Savings", m: 'i', ly: 'raw', basis: 'published', a: 0.19, source: "NCUA, Comparison of Average Savings, Deposits and Loan Rates at Credit Unions and Banks (Q4 2025)", asOf: "2026-10-19", window: "2025-12-26", methodology: "National average credit union rate on a regular savings account with a $2,500 balance; NCUA's latest quarterly table." },
  { n: "National Average Savings Rate", cat: "Cash & Savings", m: 'i', ly: 'raw', basis: 'published', a: 0.38, source: "FDIC National Rates and Rate Caps (national deposit rates published 2026-10-19)", asOf: "2026-10-19", methodology: "FDIC national average savings deposit rate." },
  { n: "Big Bank Savings (Chase/BofA)", cat: "Cash & Savings", m: 'i', ly: 'raw', basis: 'published', a: 0.01, source: "Bankrate big-bank comparison (Chase Savings 0.01%, Bank of America Savings 0.04%, as of 2026-10-20)", asOf: "2026-10-19", methodology: "Standard savings rate at the largest US banks; relationship tiers can add a few basis points." },
  { n: "Regular Checking Account", cat: "Cash & Savings", m: 'i', ly: 'raw', basis: 'published', a: 0.07, source: "FDIC National Rates and Rate Caps (national interest checking rate published 2026-10-19)", asOf: "2026-11-12", methodology: "FDIC national average rate on interest-bearing checking." },
  { n: "HYSA After Income Tax (24%)", cat: "Cash & Savings", m: 'i', ly: 'tax', basis: 'published', a: 3.19, source: "Bankrate, Best high-yield savings accounts (editorial picks dated 2026-10-13 to 2026-10-20)", asOf: "2026-10-19", methodology: "The high-yield savings row (4.2%) with interest taxed as ordinary income at 24%." },
  { n: "HYSA After Income Tax (37%)", cat: "Cash & Savings", m: 'i', ly: 'tax', basis: 'published', a: 2.65, source: "Bankrate, Best high-yield savings accounts (editorial picks dated 2026-10-13 to 2026-10-20)", asOf: "2026-10-19", methodology: "The high-yield savings row (4.2%) with interest taxed as ordinary income at 37%." },

  // --- BONDS (Compound) ---
  { n: "High-Yield Corporate (HYG/JNK)", cat: "Bonds", m: 'i', ly: 'raw', basis: 'published', a: 4.89, source: "iShares (BlackRock), iShares iBoxx $ High Yield Corporate Bond ETF fact sheet (NAV since inception, as of 2026-09-30)", asOf: "2026-11-12", window: "2007-04-11 to 2026-09-30", methodology: "NAV total return since inception, annualized, distributions reinvested. JNK's figure is 4.87%." },
  { n: "Convertible Bond ETF (CWB)", cat: "Bonds", m: 'i', ly: 'raw', basis: 'published', a: 11.44, source: "State Street (SPDR), SPDR Bloomberg Convertible Securities ETF, fund performance (NAV since inception, as of 2026-09-30)", asOf: "2026-11-12", window: "2009-04-14 to 2026-09-30", methodology: "NAV total return since inception, annualized, distributions reinvested. Convertibles carry equity upside, which is most of this return." },
  { n: "Investment Grade Corporate (LQD)", cat: "Bonds", m: 'i', ly: 'raw', basis: 'published', a: 4.47, source: "iShares (BlackRock), iShares iBoxx $ Investment Grade Corporate Bond ETF fact sheet (NAV since inception, as of 2026-06-30)", asOf: "2026-11-12", window: "2002-07-22 to 2026-06-30", methodology: "NAV total return since inception, annualized, distributions reinvested." },
  { n: "US Treasury Bills (BIL)", cat: "Bonds", m: 'i', ly: 'raw', basis: 'published', a: 1.4, source: "State Street (SPDR), SPDR Bloomberg 1-3 Month T-Bill ETF, fund performance (NAV since inception, as of 2026-09-30)", asOf: "2026-11-12", window: "2007-05-25 to 2026-09-30", methodology: "NAV total return since inception, annualized, distributions reinvested. A long run of near-zero rates; the 3-month bill yields 4.12% today (FRED DTB3, 2026-11-10)." },
  { n: "Long-Term Treasury 20+ Yr (TLT)", cat: "Bonds", m: 'i', ly: 'raw', basis: 'published', a: 3.24, source: "iShares (BlackRock), iShares 20+ Year Treasury Bond ETF fact sheet (NAV since inception, as of 2026-09-30)", asOf: "2026-11-12", window: "2002-07-22 to 2026-09-30", methodology: "NAV total return since inception, annualized, distributions reinvested. The 10-year figure is -2.78%." },
  { n: "US Treasury 10-Year", cat: "Bonds", m: 'i', ly: 'raw', basis: 'published', a: 4.54, source: "Damodaran (NYU Stern), Historical Returns on Stocks, Bonds and Bills, US T. Bond (10-year)", asOf: "2026-11-12", window: "1928-2025", methodology: "Geometric annual total return computed from the table's value-of-$100 column: (7,752.88 / 100)^(1/98) - 1." },
  { n: "Total US Bond Market (BND/AGG)", cat: "Bonds", m: 'i', ly: 'raw', basis: 'published', a: 2.86, source: "Vanguard, Total Bond Market ETF fact sheet (NAV since inception, as of 2026-09-30)", asOf: "2026-11-12", window: "2007-04-03 to 2026-09-30", methodology: "NAV total return since inception, annualized, distributions reinvested. BND; AGG's figure is 2.95% since 2003." },
  { n: "Municipal Bond Index (MUB)", cat: "Bonds", m: 'i', ly: 'raw', basis: 'published', a: 2.84, source: "iShares (BlackRock), iShares National Muni Bond ETF fact sheet (NAV since inception, as of 2026-09-30)", asOf: "2026-11-12", window: "2007-09-07 to 2026-09-30", methodology: "NAV total return since inception, annualized, distributions reinvested." },
  { n: "Aggregate Bond ETF (AGG)", cat: "Bonds", m: 'i', ly: 'raw', basis: 'published', a: 2.95, source: "iShares (BlackRock), iShares Core U.S. Aggregate Bond ETF fact sheet (NAV since inception, as of 2026-09-30)", asOf: "2026-11-12", window: "2003-09-22 to 2026-09-30", methodology: "NAV total return since inception, annualized, distributions reinvested." },
  { n: "International Bond (BNDX)", cat: "Bonds", m: 'i', ly: 'raw', basis: 'published', a: 2.2, source: "Vanguard, Total International Bond ETF fact sheet (NAV since inception, as of 2026-09-30)", asOf: "2026-11-12", window: "2013-05-31 to 2026-09-30", methodology: "NAV total return since inception, annualized, distributions reinvested. Currency-hedged to US dollars." },
  { n: "Short-Term Treasury (SHY)", cat: "Bonds", m: 'i', ly: 'raw', basis: 'published', a: 1.94, source: "iShares (BlackRock), iShares 1-3 Year Treasury Bond ETF fact sheet (NAV since inception, as of 2026-09-30)", asOf: "2026-11-12", window: "2002-07-22 to 2026-09-30", methodology: "NAV total return since inception, annualized, distributions reinvested." },
  { n: "TIPS Inflation-Protected (TIP)", cat: "Bonds", m: 'i', ly: 'raw', basis: 'published', a: 3.34, source: "iShares (BlackRock), iShares TIPS Bond ETF fact sheet (NAV since inception, as of 2026-09-30)", asOf: "2026-11-12", window: "2003-12-04 to 2026-09-30", methodology: "NAV total return since inception, annualized, distributions reinvested. Nominal; the 10-year figure is 1.98%." },
  { n: "Private Credit / BDC Index (BIZD)", cat: "Bonds", m: 'i', ly: 'raw', basis: 'published', a: 6.38, source: "VanEck, BDC Income ETF fact sheet (NAV since inception, as of 2026-09-30)", asOf: "2026-11-12", window: "2013-02-11 to 2026-09-30", methodology: "NAV total return since inception, annualized, distributions reinvested. A high distribution yield, partly offset by NAV erosion and credit losses." },
  { n: "Bond Fund After 1% Advisory Fee", cat: "Bonds", m: 'i', ly: 'fee', basis: 'published', a: 1.86, source: "Vanguard, Total Bond Market ETF fact sheet (NAV since inception, as of 2026-09-30)", asOf: "2026-11-12", window: "2007-04-03 to 2026-09-30", methodology: "The Total US Bond Market row (2.86%) less a 1% advisory fee." },
  { n: "Bond Interest After Income Tax (37%)", cat: "Bonds", m: 'i', ly: 'tax', basis: 'published', a: 1.8, source: "Vanguard, Total Bond Market ETF fact sheet (NAV since inception, as of 2026-09-30)", asOf: "2026-11-12", window: "2007-04-03 to 2026-09-30", methodology: "The Total US Bond Market row (2.86%) taxed as ordinary income at 37%: 2.86 x 0.63." },
  { n: "Muni Bonds Tax-Exempt (Effective)", cat: "Bonds", m: 'i', ly: 'tax', basis: 'published', a: 2.84, source: "iShares (BlackRock), iShares National Muni Bond ETF fact sheet (NAV since inception, as of 2026-09-30)", asOf: "2026-11-12", window: "2007-09-07 to 2026-09-30", methodology: "The Municipal Bond Index row unchanged: muni interest is exempt from federal income tax." },
  { n: "Treasury Interest After Federal Tax (24%)", cat: "Bonds", m: 'i', ly: 'tax', basis: 'published', a: 3.45, source: "Damodaran (NYU Stern), Historical Returns on Stocks, Bonds and Bills, US T. Bond (10-year)", asOf: "2026-11-12", window: "1928-2025", methodology: "The US Treasury 10-Year row (4.54%) taxed at a 24% federal rate: 4.54 x 0.76. Treasury interest is exempt from state tax." },

  // --- REAL ESTATE (Compound) ---
  { n: "Multi-Unit Apartments (5+ Units)", cat: "Real Estate", m: 'i', ly: 'raw', basis: 'published', a: 10.0 },
  { n: "Industrial / Warehouse", cat: "Real Estate", m: 'i', ly: 'raw', basis: 'published', a: 9.0 },
  { n: "Multi Single Family Portfolio", cat: "Real Estate", m: 'i', ly: 'raw', basis: 'estimate', a: 8.5 },
  { n: "Single Family Home (Buy & Hold)", cat: "Real Estate", m: 'i', ly: 'raw', basis: 'published', a: 7.5 },
  { n: "Commercial Office Space", cat: "Real Estate", m: 'i', ly: 'raw', basis: 'published', a: 6.5 },
  { n: "Retail / Strip Mall", cat: "Real Estate", m: 'i', ly: 'raw', basis: 'published', a: 5.5 },
  { n: "Vacation / Short-Term Rental", cat: "Real Estate", m: 'i', ly: 'raw', basis: 'estimate', a: 4.0 },
  { n: "Raw Land (Speculative)", cat: "Real Estate", m: 'i', ly: 'raw', basis: 'estimate', a: 2.0 },
  { n: "House Flipping (Retail Avg)", cat: "Real Estate", m: 'i', ly: 'raw', basis: 'estimate', a: -5.0 },
  { n: "Timeshare", cat: "Real Estate", m: 'i', ly: 'raw', basis: 'estimate', a: -12.0 },
  { n: "Rental Income After Ordinary Tax (37%)", cat: "Real Estate", m: 'i', ly: 'tax', basis: 'estimate', a: 4.73 },
  { n: "Home Sale After LTCG (w/ $250K Exclusion)", cat: "Real Estate", m: 'i', ly: 'tax', basis: 'published', a: 6.75 },

  // --- CRYPTOCURRENCY (Compound) ---
  { n: "Bitcoin Spot (Buy & Hold)", cat: "Cryptocurrency", m: 'i', ly: 'raw', basis: 'published', a: 45.0 },
  { n: "Ethereum Spot (Buy & Hold)", cat: "Cryptocurrency", m: 'i', ly: 'raw', basis: 'published', a: 10.0 },
  { n: "Stablecoin Yield Farming", cat: "Cryptocurrency", m: 'i', ly: 'raw', basis: 'estimate', a: 5.0 },
  { n: "DeFi LP Major Pairs", cat: "Cryptocurrency", m: 'i', ly: 'raw', basis: 'estimate', a: 2.0 },
  { n: "DeFi LP Volatile Pairs", cat: "Cryptocurrency", m: 'i', ly: 'raw', basis: 'estimate', a: -10.0 },
  { n: "Altcoin Portfolio (Retail)", cat: "Cryptocurrency", m: 'i', ly: 'raw', basis: 'estimate', a: -15.0 },
  { n: "Meme Coins (Retail Avg)", cat: "Cryptocurrency", m: 'i', ly: 'raw', basis: 'estimate', a: -70.0 },
  { n: "Staked Ethereum (ETH + Staking Yield)", cat: "Cryptocurrency", m: 'i', ly: 'raw', basis: 'published', a: 13.0, asOf: "2026-10-12", methodology: "Ethereum spot figure plus a ~3% native staking yield; ignores slashing and liquidity risk. Approximate." },
  { n: "Leveraged Perpetual Futures (Retail Avg)", cat: "Cryptocurrency", m: 'i', ly: 'raw', basis: 'estimate', a: -60.0, asOf: "2026-10-12", methodology: "Representative annual outcome for retail accounts trading 10x-plus perpetual swaps: funding costs plus liquidation losses. Approximate." },
  { n: "Bitcoin Spot ETF After 0.25% Fee (IBIT)", cat: "Cryptocurrency", m: 'i', ly: 'fee', basis: 'published', a: 44.75, asOf: "2026-10-12", methodology: "Bitcoin spot figure less the 0.25% sponsor fee of the largest US spot ETF." },
  { n: "Bitcoin After LTCG Tax (20%)", cat: "Cryptocurrency", m: 'i', ly: 'tax', basis: 'published', a: 36.0 },
  { n: "Bitcoin After STCG Tax (37%)", cat: "Cryptocurrency", m: 'i', ly: 'tax', basis: 'published', a: 28.35 },
  { n: "Ethereum After LTCG Tax (20%)", cat: "Cryptocurrency", m: 'i', ly: 'tax', basis: 'published', a: 8.0 },

  // --- COLLECTIBLES (Compound) ---
  { n: "Vintage Sports Cards (PSA 10)", cat: "Collectibles", m: 'i', ly: 'raw', basis: 'estimate', a: 6.0 },
  { n: "Fine Art (Blue Chip / Old Masters)", cat: "Collectibles", m: 'i', ly: 'raw', basis: 'estimate', a: 5.0 },
  { n: "Fine Wine (Investment Grade)", cat: "Collectibles", m: 'i', ly: 'raw', basis: 'estimate', a: 4.0 },
  { n: "Classic Cars (Pre-1970)", cat: "Collectibles", m: 'i', ly: 'raw', basis: 'estimate', a: 3.5 },
  { n: "Luxury Watches (Rolex/Patek)", cat: "Collectibles", m: 'i', ly: 'raw', basis: 'estimate', a: 3.0 },
  { n: "Sneaker Reselling (Retail Avg)", cat: "Collectibles", m: 'i', ly: 'raw', basis: 'estimate', a: -5.0 },
  { n: "Modern Art Speculation", cat: "Collectibles", m: 'i', ly: 'raw', basis: 'estimate', a: -10.0 },
  { n: "Non-Vintage Trading Cards", cat: "Collectibles", m: 'i', ly: 'raw', basis: 'estimate', a: -15.0 },
  { n: "NFT Art & Digital Collectibles", cat: "Collectibles", m: 'i', ly: 'raw', basis: 'estimate', a: -50.0 },
  { n: "Collectibles After 28% Tax Rate", cat: "Collectibles", m: 'i', ly: 'tax', basis: 'estimate', a: 4.32 },

  // --- PRECIOUS METALS (Compound) ---
  { n: "Gold Bullion (Physical / GLD)", cat: "Precious Metals", m: 'i', ly: 'raw', basis: 'published', a: 7.1, source: "Damodaran (NYU Stern), Historical Returns on Stocks, Bonds and Bills, gold column", asOf: "2026-10-19", window: "1976-2025", methodology: "Compound annual growth of the gold price over the last 50 years: 7.11%. The series runs from 1928, but gold's price was fixed until 1971, so the full span understates a free market. Physical or GLD holding costs come off this." },
  { n: "Rhodium (Physical)", cat: "Precious Metals", m: 'i', ly: 'raw', basis: 'published', a: 4.35, source: "Johnson Matthey, PGM prices (rhodium base price, as of 2026-11-12)", asOf: "2026-11-12", window: "1992-10-06 to 2026-11-12", methodology: "Price change only, no storage or dealer costs: (9,300 / 2,175)^(1/34.1) - 1. Very sensitive to the window: 2000-2025 gives 6.16%." },
  { n: "Gold Mining Stocks (GDX)", cat: "Precious Metals", m: 'i', ly: 'raw', basis: 'published', a: 4.12, source: "VanEck, Gold Miners ETF fact sheet (NAV since inception, as of 2026-10-31)", asOf: "2026-11-12", window: "2006-05-16 to 2026-10-31", methodology: "NAV total return since inception, annualized, distributions reinvested." },
  { n: "Silver Bullion (Physical / SLV)", cat: "Precious Metals", m: 'i', ly: 'raw', basis: 'published', a: 7.64, source: "iShares (BlackRock), iShares Silver Trust fact sheet (NAV since inception, as of 2026-09-30)", asOf: "2026-11-12", window: "2006-04-21 to 2026-09-30", methodology: "NAV return of a physically backed trust, after its fee. Silver fell sharply in October and November 2026, so the next fact sheet will be lower." },
  { n: "Copper Futures (CPER)", cat: "Precious Metals", m: 'i', ly: 'raw', basis: 'published', a: 3.16, source: "USCF, United States Copper Index Fund, performance (NAV since inception, as of 2026-09-30)", asOf: "2026-11-12", window: "2011-11-15 to 2026-09-30", methodology: "NAV total return since inception, annualized, distributions reinvested." },
  { n: "Palladium Bullion (PALL)", cat: "Precious Metals", m: 'i', ly: 'raw', basis: 'published', a: 5.86, source: "abrdn, Physical Palladium Shares ETF performance data (NAV since inception, as of 2026-09-30)", asOf: "2026-11-12", window: "2010-01-08 to 2026-09-30", methodology: "NAV return of a physically backed fund, after its fee." },
  { n: "Silver Mining Stocks (SIL)", cat: "Precious Metals", m: 'i', ly: 'raw', basis: 'published', a: 4.13, source: "Global X, Silver Miners ETF (NAV since inception, as of 2026-10-31)", asOf: "2026-11-12", window: "2010-04-19 to 2026-10-31", methodology: "NAV total return since inception, annualized, distributions reinvested." },
  { n: "Platinum Bullion (PPLT)", cat: "Precious Metals", m: 'i', ly: 'raw', basis: 'published', a: 0.01, source: "abrdn, Physical Platinum Shares ETF performance data (NAV since inception, as of 2026-09-30)", asOf: "2026-11-12", window: "2010-01-08 to 2026-09-30", methodology: "NAV return of a physically backed fund, after its fee; the 10-year figure is 4.55%." },
  { n: "Precious Coins (Numismatic)", cat: "Precious Metals", m: 'i', ly: 'raw', basis: 'estimate', a: 1.5 },
  { n: "Junior Mining Stocks (GDXJ)", cat: "Precious Metals", m: 'i', ly: 'raw', basis: 'published', a: 1.82, source: "VanEck, Junior Gold Miners ETF fact sheet (NAV since inception, as of 2026-10-31)", asOf: "2026-11-12", window: "2009-11-10 to 2026-10-31", methodology: "NAV total return since inception, annualized, distributions reinvested." },
  { n: "Gold After Collectibles Tax (28%)", cat: "Precious Metals", m: 'i', ly: 'tax', basis: 'published', a: 5.11, source: "Damodaran (NYU Stern), Historical Returns on Stocks, Bonds and Bills, gold column", asOf: "2026-10-19", window: "1976-2025", methodology: "The gold row (7.1%) with 28% of each year's return taxed at the US collectibles rate." },
  { n: "Gold Mining After LTCG Tax (20%)", cat: "Precious Metals", m: 'i', ly: 'tax', basis: 'published', a: 3.3, source: "VanEck, Gold Miners ETF fact sheet (NAV since inception, as of 2026-10-31)", asOf: "2026-11-12", window: "2006-05-16 to 2026-10-31", methodology: "The Gold Mining Stocks row (4.12%) less 20% long-term capital gains tax: 4.12 x 0.8, the same method as the other after-tax rows." },

  // --- INSURANCE & ANNUITIES (Compound) ---
  { n: "Variable Annuity (Equity Sub-Accounts)", cat: "Insurance & Annuities", m: 'i', ly: 'raw', basis: 'estimate', a: 5.0 },
  { n: "Indexed Universal Life (IUL)", cat: "Insurance & Annuities", m: 'i', ly: 'raw', basis: 'estimate', a: 4.5 },
  { n: "Fixed Annuity (MYGA 5-Year)", cat: "Insurance & Annuities", m: 'i', ly: 'raw', basis: 'published', a: 4.2 },
  { n: "Single Premium Immediate Annuity (SPIA)", cat: "Insurance & Annuities", m: 'i', ly: 'raw', basis: 'published', a: 4.0 },
  { n: "Whole Life — Top Mutual Co. (NWM/MassMutual)", cat: "Insurance & Annuities", m: 'i', ly: 'raw', basis: 'estimate', a: 3.5 },
  { n: "Fixed Indexed Annuity (FIA)", cat: "Insurance & Annuities", m: 'i', ly: 'raw', basis: 'estimate', a: 3.5 },
  { n: "Universal Life (Current Rate)", cat: "Insurance & Annuities", m: 'i', ly: 'raw', basis: 'estimate', a: 3.0 },
  { n: "Variable Universal Life (VUL After Fees)", cat: "Insurance & Annuities", m: 'i', ly: 'raw', basis: 'estimate', a: 3.0 },
  { n: "Whole Life — Average Company", cat: "Insurance & Annuities", m: 'i', ly: 'raw', basis: 'estimate', a: 2.0 },
  { n: "Annuity Gains After Ordinary Income Tax (37%)", cat: "Insurance & Annuities", m: 'i', ly: 'tax', basis: 'estimate', a: 2.65 },
  { n: "Whole Life Cash Value (Tax-Free via Policy Loans)", cat: "Insurance & Annuities", m: 'i', ly: 'tax', basis: 'estimate', a: 3.5 },

  // --- TRADING & DERIVATIVES (Mixed) ---
  // Re-admitted 2026-10-12. V11 cut these as "outlier noise" because a −60%/yr row squashed the
  // old single shared axis; return on capital is floored at −100% now, so that reason is gone.
  { n: "Covered Call ETF (JEPI/QYLD)", cat: "Trading & Derivatives", m: 'i', ly: 'raw', basis: 'published', a: 7.0, asOf: "2026-10-12", methodology: "Representative total return of option-overwriting equity income ETFs: high distributions, capped upside. Approximate." },
  { n: "Systematic Put Writing (PUTW)", cat: "Trading & Derivatives", m: 'i', ly: 'raw', basis: 'published', a: 6.0, asOf: "2026-10-12", methodology: "Long-run total return of a rules-based cash-secured S&P 500 put-writing index. Approximate." },
  { n: "Managed Futures / Trend Following (DBMF)", cat: "Trading & Derivatives", m: 'i', ly: 'raw', basis: 'published', a: 5.0, asOf: "2026-10-12", methodology: "Representative long-run return of diversified trend-following CTAs net of fees. Approximate." },
  { n: "3x Leveraged Nasdaq Held (TQQQ)", cat: "Trading & Derivatives", m: 'i', ly: 'raw', basis: 'published', a: 15.0, asOf: "2026-10-12", methodology: "Path-dependent: daily 3x rebalancing carries volatility decay, so the realised figure swings from strongly positive in a bull run to deeply negative across a drawdown. Rough bull-market average." },
  { n: "Retail Day Trading (Avg)", cat: "Trading & Derivatives", m: 'i', ly: 'raw', basis: 'estimate', a: -15.0, source: "Barber, Lee, Liu & Odean, 'Do Day Traders Rationally Learn About Their Ability?' (2014); Chague, De-Losso & Giovannetti, 'Day Trading for a Living?' (2020)", asOf: "2026-10-12", methodology: "The large majority of retail day traders lose money net of costs in every market studied; the figure is a round representative annual loss, not a measured index." },
  { n: "Retail Options Buying (Avg)", cat: "Trading & Derivatives", m: 'i', ly: 'raw', basis: 'estimate', a: -20.0, asOf: "2026-10-12", methodology: "Short-dated call and put buying by retail accounts shows persistent aggregate losses after bid-ask spreads and time decay. Approximate." },
  { n: "Retail Forex / CFD Trading (Avg)", cat: "Trading & Derivatives", m: 'i', ly: 'raw', basis: 'estimate', a: -25.0, source: "ESMA retail CFD intervention measures; mandated broker risk warnings (74-89% of retail CFD accounts lose money)", asOf: "2026-10-12", methodology: "Representative annual loss consistent with the loss-rate disclosures regulators require brokers to publish. Approximate." },
  { n: "0DTE Options Buying (Retail)", cat: "Trading & Derivatives", m: 'i', ly: 'raw', basis: 'estimate', a: -40.0, asOf: "2026-10-12", methodology: "Same-day-expiry contracts bought outright: time decay and spread make the expected hold-to-expiry outcome sharply negative. Approximate." },
  { n: "Inverse / Short ETF Held (SQQQ)", cat: "Trading & Derivatives", m: 'i', ly: 'raw', basis: 'published', a: -60.0, asOf: "2026-10-12", methodology: "A −3x daily index fund held through a rising market: leverage decay plus the index's own drift. Approximate long-run realised figure." },
  { n: "Binary Options (Offshore)", cat: "Trading & Derivatives", m: 'g', ly: 'raw', basis: 'estimate', e: -10.0, du: 10, ced: 2, asOf: "2026-10-12", methodology: "A typical offshore binary pays 70-85% on a win and loses 100% on a loss; at a 50% strike the expected loss per contract is 8-15% of stake." },

  // --- SPORTS BETTING (Linear) ---
  { n: "Sharp Bettor (+2% Closing Line Value)", cat: "Sports Betting", m: 'g', ly: 'raw', basis: 'estimate', e: 2.0, du: 3, ced: 2, asOf: "2026-10-12", methodology: "A bettor who consistently beats the closing line by 2% after the vig; the small minority of accounts books limit. Representative, not an index." },
  { n: "Betting Exchange (2% Commission)", cat: "Sports Betting", m: 'g', ly: 'raw', basis: 'math', e: -1.0, du: 2, ced: 3, source: "Betfair Exchange market base rate (2% of net winnings per market)", asOf: "2026-10-12", methodology: "Commission is charged on net winnings only, so at even money the expected cost is about half the rate, i.e. 1% of stake." },
  { n: "Reduced Juice Line (-105)", cat: "Sports Betting", m: 'g', ly: 'raw', basis: 'math', e: -2.38, du: 2, ced: 3, source: "BettingUSA, Reduced juice (bettingusa.com/sports/bonuses/reduced-juice/)", asOf: "2026-11-12", methodology: "Two-way market priced at -105 each side: 2 × 51.22% = 102.44% implied; hold on handle = 2.44 / 102.44 = 2.38%." },
  { n: "Single Game Spread (-110)", cat: "Sports Betting", m: 'g', ly: 'raw', basis: 'math', e: -4.55, du: 2, ced: 3, source: "Wizard of Odds, Sports betting (wizardofodds.com/games/sports-betting/)", asOf: "2026-11-12", methodology: "Risk 110 to win 100 on a 50% chance: 0.5 x 100/110 - 0.5 = -4.55% of stake." },
  { n: "Single Game O/U (-110)", cat: "Sports Betting", m: 'g', ly: 'raw', basis: 'math', e: -4.55, du: 2, ced: 3, source: "Wizard of Odds, Sports betting (wizardofodds.com/games/sports-betting/)", asOf: "2026-11-12", methodology: "Totals are priced like spreads, risk 110 to win 100 on a 50% chance: 0.5 x 100/110 - 0.5 = -4.55% of stake." },
  { n: "Pick'em Moneyline (-110)", cat: "Sports Betting", m: 'g', ly: 'raw', basis: 'math', e: -4.55, du: 2, ced: 3, source: "Wizard of Odds, Sports betting (wizardofodds.com/games/sports-betting/)", asOf: "2026-11-12", methodology: "Both sides at -110, which only a pick'em game is priced at: 0.5 x 100/110 - 0.5 = -4.55%. A favourite/underdog moneyline holds more; +300/-450 balanced is 6.38% (Wizard of Odds, straight bet calculator)." },
  { n: "Teaser 2-Team 6pt", cat: "Sports Betting", m: 'g', ly: 'raw', basis: 'estimate', e: -5.0, du: 1, ced: 3 },
  { n: "Live / In-Game Bet", cat: "Sports Betting", m: 'g', ly: 'raw', basis: 'estimate', e: -6.5, du: 5, ced: 3 },
  { n: "Player Prop Bet", cat: "Sports Betting", m: 'g', ly: 'raw', basis: 'estimate', e: -7.0, du: 3, ced: 2 },
  { n: "Micro-Bet (Next Play / Next Pitch)", cat: "Sports Betting", m: 'g', ly: 'raw', basis: 'estimate', e: -9.0, du: 20, ced: 1, asOf: "2026-10-12", methodology: "In-play micro markets are typically priced with an 8-10% hold, roughly double a standard -110 two-way line. Approximate." },
  { n: "Season Win Total Future", cat: "Sports Betting", m: 'g', ly: 'raw', basis: 'estimate', e: -8.0, du: 0.05, ced: 5 },
  { n: "2-Team Parlay", cat: "Sports Betting", m: 'g', ly: 'raw', basis: 'math', e: -8.88, du: 2, ced: 2, source: "Wizard of Odds, Sports betting (wizardofodds.com/games/sports-betting/)", asOf: "2026-11-12", methodology: "Priced at true odds from -110 legs, as online books price parlays: each leg returns 21/11 on a 50% chance, so EV = (21/22)^2 - 1 = -8.88%. Fixed parlay cards pay differently (Wizard of Odds, NFL parlay cards)." },
  { n: "Championship Future", cat: "Sports Betting", m: 'g', ly: 'raw', basis: 'estimate', e: -12.0, du: 0.03, ced: 5 },
  { n: "3-Team Parlay", cat: "Sports Betting", m: 'g', ly: 'raw', basis: 'math', e: -13.03, du: 1, ced: 2, source: "Wizard of Odds, Sports betting (wizardofodds.com/games/sports-betting/)", asOf: "2026-11-12", methodology: "Priced at true odds from -110 legs, as online books price parlays: each leg returns 21/11 on a 50% chance, so EV = (21/22)^3 - 1 = -13.03%. Fixed parlay cards pay differently (Wizard of Odds, NFL parlay cards)." },
  { n: "4-Team Parlay", cat: "Sports Betting", m: 'g', ly: 'raw', basis: 'math', e: -16.98, du: 1, ced: 1, source: "Wizard of Odds, Sports betting (wizardofodds.com/games/sports-betting/)", asOf: "2026-11-12", methodology: "Priced at true odds from -110 legs, as online books price parlays: each leg returns 21/11 on a 50% chance, so EV = (21/22)^4 - 1 = -16.98%. Fixed parlay cards pay differently (Wizard of Odds, NFL parlay cards)." },
  { n: "Same-Game Parlay (SGP)", cat: "Sports Betting", m: 'g', ly: 'raw', basis: 'estimate', e: -15.0, du: 2, ced: 2 },
  { n: "First Touchdown Scorer", cat: "Sports Betting", m: 'g', ly: 'raw', basis: 'estimate', e: -18.0, du: 1, ced: 1 },
  { n: "5-Team Parlay", cat: "Sports Betting", m: 'g', ly: 'raw', basis: 'math', e: -20.75, du: 0.5, ced: 1, source: "Wizard of Odds, Sports betting (wizardofodds.com/games/sports-betting/)", asOf: "2026-11-12", methodology: "Priced at true odds from -110 legs, as online books price parlays: each leg returns 21/11 on a 50% chance, so EV = (21/22)^5 - 1 = -20.75%. Fixed parlay cards pay differently (Wizard of Odds, NFL parlay cards)." },
  { n: "Correct Score (Soccer)", cat: "Sports Betting", m: 'g', ly: 'raw', basis: 'estimate', e: -20.0, du: 0.5, ced: 1 },
  { n: "6-Team Parlay", cat: "Sports Betting", m: 'g', ly: 'raw', basis: 'math', e: -24.36, du: 0.3, ced: 1, source: "Wizard of Odds, Sports betting (wizardofodds.com/games/sports-betting/)", asOf: "2026-11-12", methodology: "Priced at true odds from -110 legs, as online books price parlays: each leg returns 21/11 on a 50% chance, so EV = (21/22)^6 - 1 = -24.36%. Fixed parlay cards pay differently (Wizard of Odds, NFL parlay cards)." },
  { n: "8-Team Parlay", cat: "Sports Betting", m: 'g', ly: 'raw', basis: 'math', e: -31.08, du: 0.2, ced: 1, source: "Wizard of Odds, Sports betting (wizardofodds.com/games/sports-betting/)", asOf: "2026-11-12", methodology: "Priced at true odds from -110 legs, as online books price parlays: each leg returns 21/11 on a 50% chance, so EV = (21/22)^8 - 1 = -31.08%. Fixed parlay cards pay differently (Wizard of Odds, NFL parlay cards)." },
  { n: "10-Team Parlay", cat: "Sports Betting", m: 'g', ly: 'raw', basis: 'math', e: -37.2, du: 0.1, ced: 0.5, source: "Wizard of Odds, Sports betting (wizardofodds.com/games/sports-betting/)", asOf: "2026-11-12", methodology: "Priced at true odds from -110 legs, as online books price parlays: each leg returns 21/11 on a 50% chance, so EV = (21/22)^10 - 1 = -37.2%. Fixed parlay cards pay differently (Wizard of Odds, NFL parlay cards)." },

  // --- HORSE RACING & PARI-MUTUEL (Linear) ---
  // Pari-mutuel pools return the pool minus the track's takeout, so for a bettor with no edge the
  // takeout rate IS the expected loss per dollar wagered.
  { n: "Horse Racing with 8% ADW Rebate", cat: "Horse Racing & Pari-Mutuel", m: 'g', ly: 'raw', basis: 'published', e: -12.0, du: 3, ced: 2, asOf: "2026-10-12", methodology: "A ~20% exotic takeout less an 8% advance-deposit-wagering volume rebate; rebates of 5-10% are common for high-volume players." },
  { n: "Horse Racing Win / Place / Show", cat: "Horse Racing & Pari-Mutuel", m: 'g', ly: 'raw', basis: 'published', e: -17.0, du: 3, ced: 2, source: "Horseplayers Association of North America (HANA) track takeout ratings", asOf: "2026-10-12", methodology: "Typical US win/place/show pool takeout is 15-20%; the midpoint is used." },
  { n: "Horse Racing Exacta / Daily Double", cat: "Horse Racing & Pari-Mutuel", m: 'g', ly: 'raw', basis: 'published', e: -20.0, du: 2, ced: 2, source: "Horseplayers Association of North America (HANA) track takeout ratings", asOf: "2026-10-12", methodology: "Typical US two-horse exotic pool takeout is 18-22%; the midpoint is used." },
  { n: "Greyhound Racing", cat: "Horse Racing & Pari-Mutuel", m: 'g', ly: 'raw', basis: 'published', e: -20.0, du: 3, ced: 2, asOf: "2026-10-12", methodology: "Pari-mutuel takeout at the remaining US and UK dog tracks, 18-25% across pools. Approximate." },
  { n: "Horse Racing Trifecta / Superfecta", cat: "Horse Racing & Pari-Mutuel", m: 'g', ly: 'raw', basis: 'published', e: -25.0, du: 2, ced: 1, source: "Horseplayers Association of North America (HANA) track takeout ratings", asOf: "2026-10-12", methodology: "Typical US multi-horse exotic pool takeout is 22-26%." },
  { n: "Horse Racing Pick 4 / Pick 6", cat: "Horse Racing & Pari-Mutuel", m: 'g', ly: 'raw', basis: 'published', e: -25.0, du: 0.5, ced: 1, asOf: "2026-10-12", methodology: "Multi-race pools carry the same 22-26% takeout as the exotics; occasional carryovers lower it. Approximate." },

  // --- CASINO GAMBLING (Linear) ---
  { n: "Blackjack Card Counting (Skilled)", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'estimate', e: 1.0, du: 60, ced: 2, source: "Wizard of Odds, Card counting (wizardofodds.com/games/blackjack/card-counting/); Thorp, Beat the Dealer (1962)", asOf: "2026-10-12", methodology: "Typical long-run advantage of a competent Hi-Lo counter with a 1-8 bet spread on a 6-deck shoe, +0.5% to +1.5%; the midpoint is used." },
  { n: "Spanish 21 (Dealer Stands Soft 17)", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -0.4, du: 60, ced: 2, source: "Wizard of Odds, Spanish 21 (wizardofodds.com/games/spanish-21/)", asOf: "2026-10-12", methodology: "House edge with the dealer standing on soft 17 under optimal strategy." },
  { n: "Video Poker 9/6 JoB", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -0.46, du: 80, ced: 1, source: "Wizard of Odds, Jacks or Better pay tables (wizardofodds.com/games/video-poker/tables/jacks-or-better/)", asOf: "2026-11-12", methodology: "Full-pay 9/6 table (royal 800) under optimal strategy returns 99.54%." },
  { n: "Blackjack 3:2 Basic Strategy", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -0.43, du: 60, ced: 2, source: "Wizard of Odds, Blackjack basics (wizardofodds.com/games/blackjack/basics/)", asOf: "2026-11-12", methodology: "Atlantic City rules (8 decks, dealer stands on soft 17, double after split, split to 4 hands) under basic strategy." },
  { n: "Craps Place 6 / Place 8", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -1.52, du: 40, ced: 2, source: "Wizard of Odds, Craps house edge table (wizardofodds.com/games/craps/appendix/2/)", asOf: "2026-10-21", methodology: "Pays 7 to 6 on a 6 or 8 before a 7; house edge per bet made." },
  { n: "Craps Place 5 / Place 9", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -4.0, du: 40, ced: 2, source: "Wizard of Odds, Craps house edge table (wizardofodds.com/games/craps/appendix/2/)", asOf: "2026-10-28", methodology: "Pays 7 to 5 on a 5 or 9 before a 7; house edge per bet made." },
  { n: "Craps Place 4 / Place 10", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -6.67, du: 40, ced: 2, source: "Wizard of Odds, Craps house edge table (wizardofodds.com/games/craps/appendix/2/)", asOf: "2026-10-28", methodology: "Pays 9 to 5 on a 4 or 10 before a 7; house edge per bet made." },
  { n: "Baccarat Banker", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -1.06, du: 50, ced: 3, source: "Wizard of Odds, House edge of casino games (wizardofodds.com/gambling/house-edge/)", asOf: "2026-11-12", methodology: "Banker bet with 5% commission on wins, ties counted as pushes." },
  { n: "Crypto Dice (1% House Edge)", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -1.0, du: 1000, ced: 0.5, source: "Wizard of Odds, Cryptocurrency dice (wizardofodds.com/games/dice-cryptocurrency/)", asOf: "2026-11-12", methodology: "Provably-fair dice sites advertise a 1% edge; auto-bet modes run hundreds of rolls an hour, which is what makes the time to ruin so short." },
  { n: "Baccarat Player", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -1.24, du: 50, ced: 3, source: "Wizard of Odds, House edge of casino games (wizardofodds.com/gambling/house-edge/)", asOf: "2026-11-12", methodology: "Player bet paying even money, ties counted as pushes." },
  { n: "Roulette Single Zero La Partage", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -1.35, du: 40, ced: 3, source: "Wizard of Odds, Roulette basics (wizardofodds.com/games/roulette/basics/)", asOf: "2026-10-14", methodology: "Even-money bets on a single-zero wheel with half the stake returned when the ball lands on zero: expected value -1/74, a 1.35% house edge." },
  { n: "Craps Big 6 / Big 8", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -9.09, du: 40, ced: 1, source: "Wizard of Odds, Craps house edge table (wizardofodds.com/games/craps/appendix/2/)", asOf: "2026-10-28", methodology: "Pays even money on a 6 or 8 before a 7, against 7 to 6 on the equivalent Place bet; house edge per bet made." },
  { n: "Craps Hard 6 / Hard 8", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -9.09, du: 40, ced: 1, source: "Wizard of Odds, Craps house edge table (wizardofodds.com/games/craps/appendix/2/)", asOf: "2026-10-14", methodology: "US payout of 9 to 1 on a double-3 or double-4 before a 7 or the easy way; house edge per bet made." },
  { n: "Three Card Poker Pair Plus", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -7.28, du: 40, ced: 3, source: "Wizard of Odds, Three Card Poker (wizardofodds.com/games/three-card-poker/)", asOf: "2026-10-21", methodology: "Pair Plus side bet on pay table 1 (straight flush 40, three of a kind 30, straight 6, flush 3, pair 1): house edge 7.276%." },
  { n: "Craps Any Craps", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -11.11, du: 40, ced: 1, source: "Wizard of Odds, Craps house edge table (wizardofodds.com/games/craps/appendix/2/)", asOf: "2026-10-21", methodology: "One-roll bet that pays 7 to 1 on a 2, 3 or 12; house edge per bet made." },
  { n: "Roulette Five-Number Bet (0-00-1-2-3)", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -7.89, du: 40, ced: 3, source: "Wizard of Odds, Roulette basics (wizardofodds.com/games/roulette/basics/)", asOf: "2026-10-14", methodology: "Pays 6 to 1 on 5 of 38 pockets, against 5.26% on every other American roulette bet." },
  { n: "Craps Don't Pass", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -1.36, du: 40, ced: 2, source: "Wizard of Odds, House edge of casino games (wizardofodds.com/gambling/house-edge/)", asOf: "2026-11-12", methodology: "Don't Pass with 12 barred, ties counted as pushes." },
  { n: "Craps Pass Line", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -1.41, du: 40, ced: 2, source: "Wizard of Odds, House edge of casino games (wizardofodds.com/gambling/house-edge/)", asOf: "2026-11-12", methodology: "Pass Line without odds: 244 wins against 251 losses in 495, per bet resolved." },
  { n: "Blackjack 6:5", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -1.82, du: 60, ced: 2, source: "Wizard of Odds, Blackjack rule variations (wizardofodds.com/games/blackjack/rule-variations/)", asOf: "2026-11-12", methodology: "The 0.43% Atlantic City baseline plus the 1.39% that paying 6:5 on a blackjack adds (8 decks, S17, DAS). The source lists the penalty, not the sum." },
  { n: "Ultimate Texas Hold'em", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -2.19, du: 30, ced: 3, source: "Wizard of Odds, Ultimate Texas Hold'em (wizardofodds.com/games/ultimate-texas-hold-em/)", asOf: "2026-10-12", methodology: "House edge relative to the Ante bet under optimal strategy." },
  { n: "Craps Field (3:1 on 12)", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -2.78, du: 40, ced: 2, source: "Wizard of Odds, Craps house edge table (wizardofodds.com/games/craps/appendix/2/)", asOf: "2026-10-07", methodology: "Exact single-roll expectation; 2 pays 2:1 and 12 pays 3:1, per bet made." },
  { n: "Craps Lay 4 / Lay 10 (Commission on Win)", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -1.67, du: 40, ced: 2, source: "Wizard of Odds, Craps house edge table (wizardofodds.com/games/craps/appendix/2/)", asOf: "2026-11-11", methodology: "Bet against the 4 or 10 rolling before a 7; pays 19 to 40 with the commission charged only on a win: house edge 1.67% per bet resolved." },
  { n: "Pai Gow Poker Emperor's Challenge", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -4.17, du: 30, ced: 1, source: "Wizard of Odds, Pai Gow Poker side bets (wizardofodds.com/games/pai-gow-poker/appendix/3/)", asOf: "2026-11-11", methodology: "Side bet paying on 7-card straight flushes, five aces, royal flush, straight flush and 9-, 10- and J-high pai gow hands (top pay 5,000 to 1): house edge 4.171%." },
  { n: "Craps Hard 4 / Hard 10", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -11.11, du: 40, ced: 1, source: "Wizard of Odds, Craps house edge table (wizardofodds.com/games/craps/appendix/2/)", asOf: "2026-11-11", methodology: "US payout of 7 to 1 on a double-2 or double-5 before a 7 or the easy way; house edge 11.11% per bet resolved." },
  { n: "Pai Gow Poker", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -2.51, du: 30, ced: 3, source: "Wizard of Odds, Pai Gow Poker (wizardofodds.com/games/pai-gow-poker/)", asOf: "2026-11-12", methodology: "Player never banking, 5% commission, 53-card deck, optimal strategy: 2.51% per hand, pushes included (2.72% playing the House Way)." },
  { n: "Roulette Single Zero", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -2.7, du: 40, ced: 3, source: "Wizard of Odds, House edge of casino games (wizardofodds.com/gambling/house-edge/)", asOf: "2026-11-12", methodology: "One zero among 37 pockets, paying as if there were 36: -1/37 = -2.70%." },
  { n: "Sic Bo Big / Small", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -2.78, du: 40, ced: 2, source: "Wizard of Odds, Sic Bo (wizardofodds.com/games/sic-bo/)", asOf: "2026-10-12", methodology: "Exact single-roll expectation: Big and Small pay even money and lose to any triple, 105 wins against 111 losses of 216 outcomes." },
  { n: "Four Card Poker Ante", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -2.79, du: 30, ced: 3, source: "Wizard of Odds, Four Card Poker (wizardofodds.com/games/four-card-poker/)", asOf: "2026-11-04", methodology: "Ante bet under optimal raise/fold play on the 2-20-25 Ante Bonus pay table: house edge 2.788% of the Ante." },
  { n: "Casino War", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -2.88, du: 50, ced: 2, source: "Wizard of Odds, Casino War (wizardofodds.com/games/casino-war/)", asOf: "2026-10-12", methodology: "Six decks, always going to war on a tie, no tie side bet." },
  { n: "Three Card Poker", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -3.37, du: 40, ced: 3, source: "Wizard of Odds, Three Card Poker (wizardofodds.com/games/three-card-poker/)", asOf: "2026-11-12", methodology: "Ante and Play on the 1-4-5 ante bonus table under optimal play: 3.37% of the ante; element of risk 2.01%." },
  { n: "Let It Ride", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -3.51, du: 30, ced: 3, source: "Wizard of Odds, Let It Ride (wizardofodds.com/games/let-it-ride/)", asOf: "2026-11-12", methodology: "Optimal strategy: 3.51% of one base bet; element of risk 2.85%." },
  { n: "Four Card Poker Aces Up", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -3.89, du: 30, ced: 1, source: "Wizard of Odds, Four Card Poker (wizardofodds.com/games/four-card-poker/)", asOf: "2026-11-04", methodology: "Aces Up side bet on pay table 5 (four of a kind 50, straight flush 40, three of a kind 8, flush 5, straight 4, two pair 3, pair of aces or better 1): house edge 3.892%." },
  { n: "Online Slots 96% RTP", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -4.0, du: 600, ced: 0.5, source: "Wizard of Odds, Best payout slots by software (wizardofodds.com/best-payout-slots-by-software/)", asOf: "2026-11-12", methodology: "Published return-to-player of a typical regulated online slot is 94-97%; online spin rates run higher than a casino floor." },
  { n: "Mississippi Stud", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -4.91, du: 30, ced: 3, source: "Wizard of Odds, Mississippi Stud (wizardofodds.com/games/mississippi-stud/)", asOf: "2026-11-04", methodology: "Main pay table (royal flush 500, straight flush 100, four of a kind 40, full house 10, flush 6, straight 4, three of a kind 3, two pair 2, jacks or better 1) under optimal strategy: house edge 4.91% of the Ante; element of risk 1.37%." },
  { n: "Slots Loose 95%", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -5.0, du: 500, ced: 0.5, source: "Wizard of Odds, Slots basics (wizardofodds.com/games/slots/basics/)", asOf: "2026-11-12", methodology: "A 95% return is a label inside the published range: Clark County casinos kept 5.51-5.64% of $1 and $5 slot play in 2012, 6.58% across all slots." },
  { n: "Caribbean Stud", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -5.22, du: 30, ced: 3, source: "Wizard of Odds, Caribbean Stud Poker (wizardofodds.com/games/caribbean-stud-poker/)", asOf: "2026-11-12", methodology: "U.S. pay table under optimal strategy: 5.224% per ante; element of risk 2.555%." },
  { n: "Roulette Double Zero", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -5.26, du: 40, ced: 3, source: "Wizard of Odds, House edge of casino games (wizardofodds.com/gambling/house-edge/)", asOf: "2026-11-12", methodology: "Two zeros among 38 pockets, paying as if there were 36: -2/38 = -5.26%." },
  { n: "Slots Average 92%", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'published', e: -8.0, du: 500, ced: 0.5 },
  { n: "Slots Tight 85%", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -15.0, du: 500, ced: 0.5, source: "Wizard of Odds, Slots basics (wizardofodds.com/games/slots/basics/)", asOf: "2026-11-12", methodology: "An 85% return is the top of the published 2-15% slot house-edge range; penny video slots run 6-15%." },
  { n: "Baccarat Tie (8:1)", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -14.36, du: 50, ced: 3, source: "Wizard of Odds, Baccarat basics (wizardofodds.com/games/baccarat/basics/)", asOf: "2026-10-07", methodology: "Exact combinatorial analysis of an 8-deck shoe; Tie pays 8 to 1." },
  { n: "Big Six Wheel", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -11.11, du: 20, ced: 2, source: "Wizard of Odds, Big Six (wizardofodds.com/games/big-six/)", asOf: "2026-11-12", methodology: "The $1 symbol on the Las Vegas 54-stop wheel; the other symbols hold 16.67% to 24.07%." },
  { n: "Craps Any Seven", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -16.67, du: 40, ced: 2, source: "Wizard of Odds, Craps house edge table (wizardofodds.com/games/craps/appendix/2/)", asOf: "2026-10-07", methodology: "Exact single-roll expectation; pays 4 to 1, per bet made." },
  { n: "Keno 4-Spot", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -25.94, du: 10, ced: 1, source: "Wizard of Odds, Keno pay tables (wizardofodds.com/games/keno/appendix/3/)", asOf: "2026-11-12", methodology: "Tropicana Atlantic City 4-spot table (2 catch 1, 3 catch 3, 4 catch 130) returns 74.06%." },
  { n: "Keno 10-Spot", cat: "Casino Gambling", m: 'g', ly: 'raw', basis: 'math', e: -27.71, du: 10, ced: 1, source: "Wizard of Odds, Keno pay tables (wizardofodds.com/games/keno/appendix/3/)", asOf: "2026-11-12", methodology: "Tropicana Atlantic City 10-spot table (top prize 100,000) returns 72.29%; live keno ranges 20-35%." },

  // --- POKER & SKILL-BASED (Linear) ---
  { n: "DFS Top 5%", cat: "Poker & Skill-Based", m: 'g', ly: 'raw', basis: 'estimate', e: 5.0, du: 5, ced: 5 },
  { n: "Poker Skilled Tournaments", cat: "Poker & Skill-Based", m: 'g', ly: 'raw', basis: 'estimate', e: 2.0, du: 5, ced: 10, payout: 5.7, methodology: "Payoff shape only: a tournament pays roughly the top 15% of the field (2023 WSOP Main Event: 1,507 of 10,043 entries), so a cash averages about 6.7x the buy-in, 5.7x net. The 2% ROI itself is uncited." },
  { n: "Poker Mid-Stakes Reg", cat: "Poker & Skill-Based", m: 'g', ly: 'raw', basis: 'estimate', e: 1.5, du: 40, ced: 2 },
  { n: "Poker Average Live Cash", cat: "Poker & Skill-Based", m: 'g', ly: 'raw', basis: 'estimate', e: -5.0, du: 25, ced: 3 },
  { n: "Poker Average Online", cat: "Poker & Skill-Based", m: 'g', ly: 'raw', basis: 'estimate', e: -8.0, du: 40, ced: 2 },
  { n: "Poker Recreational Live", cat: "Poker & Skill-Based", m: 'g', ly: 'raw', basis: 'estimate', e: -10.0, du: 25, ced: 3 },
  { n: "DFS Average", cat: "Poker & Skill-Based", m: 'g', ly: 'raw', basis: 'estimate', e: -12.0, du: 5, ced: 5 },
  { n: "Poker Sit & Go Average", cat: "Poker & Skill-Based", m: 'g', ly: 'raw', basis: 'estimate', e: -15.0, du: 5, ced: 5 },
  { n: "DFS Casual", cat: "Poker & Skill-Based", m: 'g', ly: 'raw', basis: 'estimate', e: -20.0, du: 3, ced: 5 },

  // --- PREDICTION MARKETS (Linear) ---
  { n: "Polymarket Elections", cat: "Prediction Markets", m: 'g', ly: 'raw', basis: 'estimate', e: -3.0, du: 1, ced: 5 },
  { n: "Polymarket SCOTUS", cat: "Prediction Markets", m: 'g', ly: 'raw', basis: 'estimate', e: -3.0, du: 0.5, ced: 5 },
  { n: "Metaculus Scientific", cat: "Prediction Markets", m: 'g', ly: 'raw', basis: 'estimate', e: -3.5, du: 1, ced: 3 },
  { n: "Polymarket Oscars", cat: "Prediction Markets", m: 'g', ly: 'raw', basis: 'estimate', e: -4.0, du: 0.5, ced: 3 },
  { n: "Polymarket Geopolitics", cat: "Prediction Markets", m: 'g', ly: 'raw', basis: 'estimate', e: -4.0, du: 0.5, ced: 3 },
  { n: "Polymarket Sports/Entertainment", cat: "Prediction Markets", m: 'g', ly: 'raw', basis: 'estimate', e: -4.5, du: 1, ced: 3 },
  { n: "Polymarket Crypto Prices", cat: "Prediction Markets", m: 'g', ly: 'raw', basis: 'estimate', e: -5.0, du: 2, ced: 3 },
  { n: "Kalshi Economic", cat: "Prediction Markets", m: 'g', ly: 'raw', basis: 'estimate', e: -5.5, du: 0.5, ced: 3 },
  { n: "Kalshi Fed Rate", cat: "Prediction Markets", m: 'g', ly: 'raw', basis: 'estimate', e: -5.5, du: 0.2, ced: 5 },
  { n: "Kalshi GDP", cat: "Prediction Markets", m: 'g', ly: 'raw', basis: 'estimate', e: -6.0, du: 0.2, ced: 5 },
  { n: "Kalshi Weather", cat: "Prediction Markets", m: 'g', ly: 'raw', basis: 'estimate', e: -7.0, du: 0.5, ced: 2 },
  { n: "PredictIt US Politics", cat: "Prediction Markets", m: 'g', ly: 'raw', basis: 'estimate', e: -10.0, du: 1, ced: 5 },

  // --- LOTTERY (Linear) ---
  { n: "Pull-Tab Tickets", cat: "Lottery", m: 'g', ly: 'raw', basis: 'published', e: -20.0, du: 1, ced: 0.3, asOf: "2026-10-12", methodology: "Charitable pull-tab deals are manufactured to a fixed 75-85% payout; the midpoint is used." },
  { n: "$1 Scratch-Off Best Odds", cat: "Lottery", m: 'g', ly: 'raw', basis: 'published', e: -25.0, du: 1, ced: 0.5 },
  { n: "Bingo Hall Session", cat: "Lottery", m: 'g', ly: 'raw', basis: 'estimate', e: -25.0, du: 0.5, ced: 1, asOf: "2026-10-12", methodology: "Commercial and charity bingo halls return roughly 70-80% of card sales as prizes. Approximate." },
  { n: "Premium Scratch-Off $20+", cat: "Lottery", m: 'g', ly: 'raw', basis: 'published', e: -30.0, du: 0.5, ced: 1 },
  { n: "Scratch-Off Tickets Avg", cat: "Lottery", m: 'g', ly: 'raw', basis: 'published', e: -35.0, du: 0.5, ced: 0.5 },
  { n: "Keno State-Run", cat: "Lottery", m: 'g', ly: 'raw', basis: 'published', e: -40.0, du: 2, ced: 0.5 },
  { n: "Daily Numbers Game", cat: "Lottery", m: 'g', ly: 'raw', basis: 'published', e: -42.0, du: 1, ced: 0.5 },
  { n: "State Pick 6 / Lotto", cat: "Lottery", m: 'g', ly: 'raw', basis: 'published', e: -45.0, du: 0.15, ced: 0.1 },
  { n: "State Lottery Pick 3/4", cat: "Lottery", m: 'g', ly: 'raw', basis: 'math', e: -50.0, du: 0.5, ced: 0.3, source: "Pennsylvania Lottery, Pick 3 and Pick 4 prizes and odds (palottery.pa.gov/Games/PICK-3/Prizes-Odds.aspx)", asOf: "2026-11-12", methodology: "A $1 straight pays $500 at 1 in 1,000 (Pick 3) and $5,000 at 1 in 10,000 (Pick 4): 500/1000 - 1 = -50%." },
  { n: "EuroMillions", cat: "Lottery", m: 'g', ly: 'raw', basis: 'math', e: -50.0, du: 0.1, ced: 0.1, source: "EuroMillions game procedures: 50% of ticket revenue is allocated to the prize fund", asOf: "2026-10-12", methodology: "Expected return equals the prize-fund share of sales, ignoring unclaimed prizes." },
  { n: "Charity 50/50 Raffle", cat: "Lottery", m: 'g', ly: 'raw', basis: 'math', e: -50.0, du: 0.05, ced: 0.5, source: "Kansas City Chiefs, official 50/50 raffle rules (chiefs.com/fans/5050rules)", asOf: "2026-11-12", methodology: "By construction half the pot goes to the single winner and half to the cause." },
  { n: "Powerball / Mega Millions", cat: "Lottery", m: 'g', ly: 'raw', basis: 'math', e: -50.0, du: 0.1, ced: 0.1, source: "Massachusetts Powerball rules, 961 CMR 2.63(4)(a) (law.cornell.edu/regulations/massachusetts/961-CMR-2-63)", asOf: "2026-11-12", methodology: "The prize pool is 50% of each drawing period's sales. Mega Millions rules allow up to 55%, so its edge is no better than -45%." },
  { n: "Multi-State Cash4Life", cat: "Lottery", m: 'g', ly: 'raw', basis: 'math', e: -45.0, du: 0.1, ced: 0.1, source: "Florida Cash4Life rule 53ER20-43, section 6 (law.cornell.edu/regulations/florida/Fla-Admin-Code-Ann-R-53ER20-43)", asOf: "2026-11-12", methodology: "The prize fund is 55% of each drawing period's sales. The game ended on 2026-02-21, replaced by Millionaire for Life." },
];
