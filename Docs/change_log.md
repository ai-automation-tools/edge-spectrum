# Edge Spectrum — Change Log

---

## September 3, 2026 — Phase 6 Calculators (Roadmap Actions 6.1 & 6.2)

Two standalone, client-side calculators added to the hub. Neither touches the edge dataset or the
simulator; both sit on one pure math module, `site/src/odds.ts`, guarded by `npm run check:odds` in CI.

- **`/odds` — Odds Converter & No-Vig Fair Price.** Type into any of American / decimal /
  fractional / implied and the rest update. Enter every side of a market to strip the margin with
  the multiplicative, power, or Shin method; shows fair probability and price per outcome,
  per-leg vig, overround, hold, and the solved exponent *k* or insider share *z*.
- **`/parlay` — Parlay & SGP Hold.** Each leg is de-vigged from both sides of its market,
  multiplied into a true joint probability, and compared with the book's payout (product of legs,
  or a pasted quoted SGP price). Reports fair vs. book price, EV, hold, a margin multiplier vs. a
  single straight bet, and a ladder showing the hold compounding leg by leg. Legs are treated as
  independent; the page says so.
- Shared calculator UI extracted to `site/src/components/CalcUi.tsx`.

---

## V20 — August 31, 2026

Roadmap [Action 2.1](roadmap.md) — metric semantics and dual-axis correction. Evidence and
measurements in [§8 of hub_improvement_plan.md](Ideas/hub_improvement_plan.md).

> **Log gap:** V18 and V19 were never recorded here. V18 shipped the Ruin Calculator (idea #4);
> V19 was a layout and tooltip rewrite that silently dropped both it and the V11 Dollar Cost
> overlay (idea #17), leaving two toggles in the UI that did nothing.

### Metric Split: One "Expected Return" Axis Became Three Named Measures
- `invRet` and `gambRet` were plotting a compounded return on capital and an unfloored linear
  turnover cost on one shared y-axis. Replaced with:
  - **`returnOnCapital`** — primary comparison, floored at −100%. Held assets compound; games
    accrue their flat-stake loss and stop when the bankroll is gone.
  - **`expectedTurnoverCost`** — games only, deliberately unbounded, on its own axis.
  - **`ruinPoint`** — `100 / (CED% × |edge|%)` decisions to $0; years to −90% for a losing asset.
- The two measures agree by construction: a game's return on capital hits the floor exactly when
  the horizon contains its ruin point. Verified across 187 records × 7 horizons, 0 disagreements.

### New Control: Measure Toggle
- Sidebar **MEASURE** section — `ON CAPITAL` (default) / `TURNOVER COST`, each with its own axis,
  title, caption, and stat-card labels.
- Selecting Turnover Cost shows wagering activities only; a held asset has no turnover.

### Ruin Moved Onto the Chart
- Dotted −100% floor line annotated `RUIN — TOTAL CAPITAL LOSS`, drawn only once a bar reaches it.
- An ✕ marker per ruined activity, and a **Ruined By Horizon** stat card replacing Variance Spread.
- "Ruin Probability" toggle renamed **Ruin Point Overlay**, reimplemented, and **on by default**.
- Tooltip Ruin Point box restored: decisions to $0, time to ruin, stake per wager, expected loss
  per wager, urgency meter.

### Horizon Labels: Wagers and Trading Days Are No Longer the Same Unit
- `1 DECISION` → **`SINGLE EVENT`** in the sidebar; per row it reads `1 WAGER` on a game and
  `1 TRADING DAY` on a held asset.
- Tooltips gained a **Horizon basis** line (`14,600 wagers` / `1.00 years held`).
- The duplicate `1du` row is dropped for held assets, where it repeated `1 DAY` exactly.

### Axis Scaling
- The axis fits its data at short horizons and pins to the floor only when something reaches it,
  so a +4,000% ten-year outlier no longer dictates the empty space below zero.

### Regression Guard
- **`npm run check:spectrum`** evaluates the page's own math block and dataset out of the HTML and
  asserts the floor, the unfloored turnover cost, the floor/ruin agreement, per-row `1du` labels,
  and that the best investment holds ≥25% of the 10-year axis. Wired into CI.

### Measured Effect
| Horizon | Best investment's share of the plotted axis — was | now |
|---------|---:|---:|
| 1 year | 0.32% | 8.09% |
| 5 years | 0.76% | 22.72% |
| 10 years | 2.83% | 85.97% |

Worst plotted bar at 10 years was **−136,875%** (Slots Tight 85%); it is now **−100%** on the
primary measure and still −136,875% on the turnover axis where it belongs.

---

## V17 — March 28, 2026

### New Category: Precious Metals (10 raw + 2 tax-adjusted)
- Added **Precious Metals** as the 11th category (gold `#fbbf24` color, on by default)
- **Gold:** Gold Bullion / GLD (+7.5%), Gold Mining Stocks / GDX (+5.0%), Junior Mining Stocks / GDXJ (+1.0%)
- **Silver:** Silver Bullion / SLV (+4.5%), Silver Mining Stocks / SIL (+3.0%)
- **Platinum Group:** Rhodium Physical (+6.0%), Palladium Bullion / PALL (+3.5%), Platinum Bullion / PPLT (+2.0%)
- **Industrial Metals:** Copper Futures / CPER (+4.0%)
- **Numismatics:** Precious Coins Numismatic (+1.5%)
- **Tax-Adjusted:** Gold After Collectibles Tax 28% (+5.4%), Gold Mining After LTCG Tax 20% (+4.0%)

### Moved from Other Categories
- **Gold / Precious Metals (GLD)** removed from Stock Market → replaced by expanded gold entries in Precious Metals
- **Precious Coins (Numismatic)** moved from Collectibles → Precious Metals

### Category & UI Updates
- 11 categories total, 9 on by default (Casino + Poker still off)
- Dropdown shows "Metals" label with gold dot
- Addiction risk: category default = 1 (Minimal), overrides for Junior Mining (2) and Rhodium (2)
- Default button label updated to "9 Categories"

### Totals
- **~167 data points** across **11 categories**

---

## V16 / edge_analysis11.md — March 27, 2026

### Streamlined Dataset (180 → 155 entries)
- **Removed Options & Derivatives** (14 entries) — specialized instruments with extreme outliers not relevant to typical investors/gamblers
- **Removed Active Trading** (10 entries) — niche category with extreme negative returns that overlapped with existing stock market entries
- **Removed Poker Elite Pro** (1 entry) — unrealistic returns at 8% edge / 30 DU/day / 5% CED
- **10 categories** remain: Stocks, Bonds, Real Estate, Crypto, Collectibles, Sports, Casino, Poker/DFS, Predictions, Lottery

### Default Category Selection
- **8 categories on by default:** Stocks, Bonds, Real Estate, Crypto, Collectibles, Sports, Predictions, Lottery
- **Casino and Poker/DFS off by default** — available via dropdown toggle but excluded initially to avoid extreme outliers dominating the chart
- "All Categories" toggle in dropdown still selects/deselects everything

### Adaptive Y-Axis Scaling
- Replaced absolute min/max range with **5th–95th percentile** range + 15% padding
- Mid-range data (near 0%) is always visible and fills the screen
- Outlier bars extend beyond the visible area instead of squishing everything else flat
- Minimum guaranteed range of -5% to +5% so the chart never collapses on narrow data

### Adaptive Tick Formatting
- Y-axis tick interval and decimal places now scale with data range
- Short horizons (1 Decision, 1 Day): 0.1% ticks with 2 decimal places — makes tiny differences between bars clearly visible
- Medium horizons (1 Week, 1 Month): 0.2–1% ticks with 1 decimal place
- Long horizons (1 Year+): 5–20% ticks with integer formatting
- Chart fills the screen at every time horizon

---

## V15 / edge_analysis10.md — March 27, 2026

### Standardized DU/CED Framework
- **Replaced hardcoded gambling model** (`N × 0.10 × edge`) with per-activity **DU/CED framework** (`DU_period × CED × edge`)
- **DU/day** (Decision Units per day) — realistic frequency for each activity (e.g., slots=500, sports spread=2, Powerball=0.1)
- **CED** (Capital Exposure per Decision) — % of bankroll risked per decision (e.g., slots=0.5%, blackjack=2%, poker pro=5%)
- Activities are now differentiated by behavior: high-frequency/small-bet (slots) vs low-frequency/large-bet (futures)
- **Compound model unchanged** — investing categories still use `((1+a/100)^years - 1) × 100` with DU/day=1, CED=100%
- Tooltip now shows DU/day and CED for gambling entries
- New data file: `Data/edge_analysis10.md` with all 180 entries computed under the DU/CED framework

---

## V14 / edge_analysis8.md — March 27, 2026

### Time Horizon Overhaul (5 → 7 Horizons)
- **Fixed misaligned mappings:** Old model mapped "1 Bet" to "1 Month" of investing and "25 Bets / 1 Day" to "2 Years" — these made no sense
- **7 calendar-anchored horizons:** 1 Bet, 1 Day, 1 Week, 1 Month, 1 Year, 5 Years, 10 Years
- **Added 1 Week and 1 Month** — fills the gap between single event and full year
- **Investing model:** Compound returns over calendar time (1 trade = 1/252 yr, 1 day = 1/252, 1 wk = 1/52, 1 mo = 1/12, 1 yr = 1, 5 yr = 5, 10 yr = 10)
- **Gambling model:** Events pro-rated from 625/year baseline — 1 bet = 1, 1 day = 2, 1 wk = 12, 1 mo = 52, 1 yr = 625, 5 yr = 3,125, 10 yr = 6,250
- All event counts are **monotonically increasing** across horizons
- Compact button labels: "1 Bet", "1 Day", "1 Week", "1 Month", "1 Year", "5 Years", "10 Years"
- DCA amounts updated for 7 horizons ($100 for short periods, scaling to $52K at 10 years)

### New Data File
- `Data/edge_analysis8.md` — Documents the time horizon overhaul with old-vs-new comparison tables

---

## V13 / edge_analysis7.md — March 27, 2026

### Mobile Responsive Design
- Full responsive layout via `@media (max-width: 768px)` and `@media (max-width: 380px)` — no separate mobile version
- **Header:** Stacks vertically, subtitle hidden, legend floats right
- **Controls bar:** Multi-row wrap layout; separators hidden; labels span full width as section headers; time buttons in horizontal scroll container
- **Metric bar:** Compact spacing, long values truncated with ellipsis, verbose label hidden on mobile
- **Tooltip → bottom drawer:** Fixed to bottom of screen with rounded top corners, full width, scrollable content, drag-handle pill at top. Uses `pointer-events:auto` so users can scroll within. Dismissed by tapping outside
- **Chart:** Fixed height (55vh / 50vh on very small screens) instead of flex, tighter margins, hidden annotations and y-axis title
- **Interaction model:** `plotly_click` on mobile (tap a bar to see details) vs `plotly_hover` on desktop. Click anywhere outside drawer to dismiss
- **Extra-small screens (< 380px):** Further reduced button/font sizes, smaller chart viewport
- **Footer:** Smaller text, extra padding for readability

---

## V12 / edge_analysis7.md — March 27, 2026

### Design Refresh: Modern Zinc-Based Dark Theme
- **New color palette:** Shifted from navy-blue base (#080c14) to neutral zinc (#09090b) for a cleaner, more modern look
- **Border treatment:** Replaced hard hex borders with `rgba(255,255,255,...)` at varying opacities — subtle and cohesive
- **Typography:** Added Inter font preference, tighter letter-spacing on headings, refined font weight hierarchy
- **Controls:** Softer button styles using translucent white fills/borders; active states use tinted color washes instead of solid backgrounds
- **Tooltip:** Frosted glass effect (`backdrop-filter:blur(20px)`), refined spacing (18px padding), indigo accent on active horizon
- **Chart:** Grid lines and zero line use rgba for consistency; softer annotation colors
- **Metric bar:** Lighter treatment with updated zinc-scale text colors

### Favicon
- Inline SVG favicon: four bars (green → yellow → red) crossing a center line — represents the edge spectrum concept
- Self-contained as a data URI, no external file dependency

### Multi-Select Categories (from V11 fix)
- Category dropdown now supports **multi-select** — toggle any combination of categories
- "All Categories" acts as select-all / deselect-all toggle
- Button label shows: "All Categories", up to 2 names, or "N Categories" count
- Dropdown stays open for multiple selections

---

## V11 / edge_analysis7.md — March 27, 2026

### UI Overhaul: Single Control Bar
- Collapsed 3 control rows into a **single compact toolbar** with separators
- **Category filter → dropdown** — replaces 13 pill buttons with a searchable dropdown menu with category color dots
- Time and Layer buttons remain as compact pills with shortened labels
- Layer section (separator + label + buttons) **auto-hides entirely** when selected category has no fee/tax entries
- Subtle glassmorphism styling: `backdrop-filter: blur(12px)`, refined border treatment
- Cleaner metric bar with thinner separators

### New Feature: Insights Dropdown
- New **Insights** dropdown in the control bar with toggleable engagement features
- Blue dot indicator on the button when any insight is active
- Multiple insights can be active simultaneously

### New Feature: Dollar Cost Comparison ($100/week)
- Toggle via Insights dropdown
- Adds a **Dollar Cost** section to every tooltip showing:
  - Total invested (scales with time horizon: $400 at 1 Mo → $52K at 10 Yr)
  - Portfolio value after applying cumulative return
  - Gain/loss in dollar terms with color coding
- Makes abstract percentages tangible: "S&P 500 at 1 Year: $5,200 invested → $5,720 (+$520)"

### New Feature: Addiction Risk Score
- Toggle via Insights dropdown
- Every activity rated **1–5** based on feedback loop speed, variable reward patterns, and documented problem-behavior association
- Scores: 1=Minimal (index funds, bonds) → 5=Extreme (slots, 0DTE options, live betting)
- When active:
  - Bar outlines switch to risk-colored borders (green→yellow→orange→red)
  - Tooltip shows filled block meter (■■■■□) with risk label and description
- Category defaults with 50+ activity-specific overrides for accuracy

### Options Tax Entries (from V10)
- +4 tax-adjusted entries for Options:
  - Iron Condor After STCG Tax 37% (+6.30%)
  - Cash-Secured Put After STCG Tax 37% (+5.04%)
  - Covered Call After STCG Tax 37% (+4.41%)
  - Managed Futures After 60/40 Tax 26.8% (+2.20%) — Section 1256 blended rate

### Totals
- **180 data points** across **12 categories** (151 raw + 8 fee + 21 tax)
- All 180 entries have addiction risk scores assigned

---

## V10 / edge_analysis7.md — March 27, 2026

### Layer Button Auto-Hide
- Fee-Adjusted, After-Tax, and Show All layer buttons now **hide** when the selected category has no entries of that type
- If the user was on a hidden layer, automatically resets to Raw Returns
- Added `.lbtn.hidden { display: none }` CSS class

### Options Tax Entries (+4)
- Iron Condor After STCG Tax (37%): +6.30%
- Cash-Secured Put After STCG Tax (37%): +5.04%
- Covered Call After STCG Tax (37%): +4.41%
- Managed Futures After 60/40 Tax (26.8%): +2.20% — Section 1256 blended rate

### Totals
- **180 data points** (176 + 4 options tax entries)

---

## V9 / edge_analysis7.md — March 27, 2026

### New Feature: Layer Toggle (Fee-Adjusted / After-Tax / Show All)
- Third control row added: **Raw Returns** (default) | **Fee-Adjusted** | **After-Tax** | **Show All**
- Raw Returns: Shows the 151 base entries (same as V8)
- Fee-Adjusted: Overlays 8 fee-impact entries alongside raw data
- After-Tax: Overlays 17 tax-impact entries alongside raw data
- Show All: Displays all 176 entries simultaneously
- Fee/tax bars are visually distinct: green outline (fees), amber outline (tax), with semi-transparent fill
- Tooltip shows FEE-ADJ or AFTER-TAX badge for overlay entries

### Fee-Adjusted Returns (8 entries)
- S&P 500 After 0.03% Index Fee (+9.97%)
- S&P 500 After 0.35% Robo-Advisor (+9.65%)
- S&P 500 After 0.60% Target-Date Fund (+9.40%)
- S&P 500 After 1% Advisory Fee (+9.00%)
- S&P 500 After 1.5% Active Mutual Fund (+8.50%)
- S&P 500 After 2-and-20 Hedge Fund (+6.40%)
- S&P 500 After 2-and-20 Underperforming (+4.00%)
- Bond Fund After 1% Advisory Fee (+2.50%)

### Tax Impact Layer (17 entries)
**Stocks:**
- S&P 500 After LTCG Tax 20% (+8.00%)
- S&P 500 After STCG Tax 37% (+6.30%)
- S&P 500 After 1% Fee + LTCG Tax (+7.20%)
- Qualified Dividends (SPYD) After 15% Tax (+6.80%)

**Bonds:**
- Bond Interest After Income Tax 37% (+2.21%)
- Muni Bonds Tax-Exempt Effective (+3.50%)
- Treasury Interest After Federal Tax 24% (+2.89%)

**Real Estate:**
- Rental Income After Ordinary Tax 37% (+4.73%)
- Home Sale After LTCG w/ $250K Exclusion (+6.75%)

**Crypto:**
- Bitcoin After LTCG Tax 20% (+36.00%)
- Bitcoin After STCG Tax 37% (+28.35%)
- Ethereum After LTCG Tax 20% (+8.00%)

**Trading:**
- Trend Following After STCG Tax 37% (+3.15%)
- Day Trading After Income Tax 37% (-30.00% — losses capped at $3K/yr deduction)

**Collectibles:**
- Collectibles After 28% Tax Rate (+4.32% — IRS special rate, not 20% LTCG)

**Casino:**
- Card Counting After Income Tax 37% (+0.63% — gambling winnings taxed as ordinary income)

**Poker:**
- Poker Pro After Income Tax 37% (+5.04%)

### Totals
- **176 data points** across **12 categories** (151 raw + 8 fee + 17 tax)

---

## V8 / edge_analysis6.md — March 27, 2026

### Real Estate Category Overhaul
- Removed old Real Estate button (was just VNQ + Rental Property)
- Moved REIT Index ETF (VNQ) back to **Stock Market** category (it's an ETF)
- Created new **Real Estate** category with 10 physical property investment types:
  - Multi-Unit Apartments 5+ Units (+10%)
  - Industrial / Warehouse (+9%)
  - Multi Single Family Portfolio (+8.5%)
  - Single Family Home Buy & Hold (+7.5%)
  - Commercial Office Space (+6.5%)
  - Retail / Strip Mall (+5.5%)
  - Vacation / Short-Term Rental (+4%)
  - Raw Land Speculative (+2%)
  - House Flipping Retail Avg (-5%)
  - Timeshare (-12%)

### New Category: Collectibles & Alternatives (10 entries)
- Vintage Sports Cards PSA 10 (+6%)
- Fine Art Blue Chip / Old Masters (+5%)
- Fine Wine Investment Grade (+4%)
- Classic Cars Pre-1970 (+3.5%)
- Luxury Watches Rolex/Patek (+3%)
- Precious Coins Numismatic (+1.5%)
- Sneaker Reselling Retail Avg (-5%)
- Modern Art Speculation (-10%)
- Non-Vintage Trading Cards (-15%)
- NFT Art & Digital Collectibles (-50%)

### Prediction Markets Expanded (+5 entries, 7 → 12 total)
- Metaculus Scientific Questions (-3.5%)
- Polymarket Geopolitics / World (-4%)
- Polymarket Sports / Entertainment (-4.5%)
- Polymarket Crypto Prices (-5%)
- Kalshi Weather Events (-7%)

### Totals
- **151 data points** across **12 categories** (was 124 across 11)
- Net: +10 real estate, +10 collectibles, +5 predictions, -2 old real estate, +1 VNQ recategorized = +27 new entries

---

## V7 / edge_analysis5.md — March 27, 2026

### Active Trading Expanded (+5 entries)
- Systematic Trend Following Managed (+5%)
- Social/Copy Trading Retail (-12%)
- Momentum Trading Retail (-18%)
- CFD Trading Retail Leveraged (-28%)
- Binary Options Retail (-40%)

### Poker & Skill-Based Expanded (+5 entries)
- Elite Professional High Stakes Live (+8%)
- Mid-Stakes Reg Online 6-max (+1.5%)
- Backgammon Skilled Tournament (+3%)
- Recreational Player Live Cash (-10%)
- Sit & Go Average Player (-15%)

### Lottery & Scratch-Offs Expanded (+5 entries)
- $1 Scratch-Off Best Odds (-25%)
- Premium Scratch-Off $20+ (-30%)
- Daily Numbers Game (-42%)
- State Pick 6 / Lotto (-45%)
- Multi-State Cash4Life (-55%)

### Totals
- **124 data points** across **11 categories** (was ~110)

---

## V6 / edge_analysis5.md — March 27, 2026
- Enhanced tooltips with grouped peer comparisons within subcategories
- Multi-section tooltip layout: title, focus metrics, all-horizon breakdown, group comparison
- UX polish and hover behavior improvements

---

## V5 / edge_analysis4.md — March 26, 2026
- Internal code refactor — shorter CSS class names (.fbtn, .tbtn, .ctrl-row, etc.)
- No functional changes from V4

---

## V4 / edge_analysis4.md — March 26, 2026

### Major Feature: Time Horizon Selector
- 5 time buttons: 1 Bet/Month, 25 Bets/Day, 1 Year/625 Bets, 5 Years/3,125 Bets, 10 Years/6,250 Bets
- Animated bar transitions when switching horizons
- Dual control rows (category + time)

### Major Feature: Live Metrics Bar
- Shows: count of visible activities, best performer, worst performer, point spread
- Updates dynamically with filter and time changes

### Data Expansion: Stock & Bond Indexes (+35 entries)
- **+23 stock entries:** QQQ, IVW, VBR, MDY, NOBL, VTI, SPY/VOO, RSP, DIA, IVE, IWM, SPYD, VNQ, EFA, FTSE 100, DAX, Nikkei 225, EEM, GLD, DJP, retail stock picking, penny stocks
- **+12 bond entries:** HYG/JNK, CWB, LQD, BIL, 10-Year Treasury, BND/AGG, MUB, AGG, BNDX, SHY, TIP, TLT
- Merged options selling/buying into single "Options" category
- Removed swing trading

### Totals
- **~110 data points** across **11 categories**

---

## V3 / edge_analysis3.md — March 25, 2026

### Major Feature: Category Filter Buttons
- 12 filter buttons: All, Stocks, Bonds, Real Estate, Crypto, Options, Trading, Sports, Casino, Poker/DFS, Predictions, Lottery
- Click to isolate any category; active button highlighted

### Data: No-Floor Returns
- **94 data points** with pure percentage returns
- Removed -100% floor on gambling losses — losses can now blow past -100%
- Added "Scale of Destruction" section

---

## V2 / edge_analysis2.md — March 25, 2026
- Compact header with gradient title text and subtitle
- Visual green-to-red legend bar in header
- Full-viewport flex layout (no scrolling)
- **67 data points** with "$100 Becomes..." time horizon metric
- Split into compound (investing) and linear (gambling) models

---

## V1 / edge_analysis.md — March 25, 2026
- Initial implementation
- Dark theme with green-to-red color gradient bars
- Basic hover tooltips
- **99 activities** across 9 categories
- Built with Plotly.js 2.32.0, standalone HTML
