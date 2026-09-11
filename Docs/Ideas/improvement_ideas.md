# Edge Analysis Chart - Improvement Ideas

**Date:** March 25, 2026 (Updated March 27, 2026)
**Purpose:** Ideas to make the betting/investment edge analysis more entertaining, valuable, and interesting
**Status Key:** ✅ Implemented | 🔶 Partially Done | ⬜ Not Started

---

## Visual Enhancements

### 1. ✅ Color Gradient Bar Chart — *Implemented in V1*
Green (player edge) → Yellow (break-even) → Red (house edge) gradient applied to all bars. Category-colored outlines added in later versions. Gradient legend shown in the header bar.

### 2. ✅ Interactive Version — *Implemented in V1, enhanced through V7*
Built as a standalone HTML app using Plotly.js 2.32.0. Rich hover tooltips show: activity name, return badge, category, edge per event, type, volatility, win probability, skill factor, all-horizon breakdown, and grouped peer comparison within subcategories. Dark theme with full-viewport flex layout.

### 3. 🔶 Risk-Adjusted Overlay (Dual Axis) — *Partially implemented*
Volatility data is included in the tooltip for each activity but not yet shown as a visual overlay or second axis on the chart. The grouped peer comparison in tooltips (V6+) provides some relative context. A true dual-axis variance overlay or scatter plot view remains unbuilt.

### 4. ✅ "How Long Until You're Broke?" Metric — *Implemented in V18, lost in V19, restored and promoted in V20*
For negative-edge activities, show how many bets/spins/hands until the bankroll is expected to reach $0. Gambling uses the DU/CED framework: decisions to ruin = 100 / (CED% × |edge|%), then converts to time via DU/day. Investing uses compound decay: years to lose 90% = ln(0.1) / ln(1 + edge/100). Tooltip shows: decision count, time estimate, stake per wager, expected loss per wager, an urgency meter, and an explanatory summary. Positive-edge activities show "No ruin point".

**V19 regression:** the rewrite dropped the implementation — `showRuin` was still assigned but read nowhere and the `.tt-ruin-box` styles sat unused, so the "Ruin Probability" toggle did nothing. **V20** restored it, renamed the toggle to **Ruin Point Overlay**, turned it **on by default**, and promoted the marker out of the tooltip and onto the primary chart: a dotted −100% floor line labelled `RUIN — TOTAL CAPITAL LOSS`, an ✕ per ruined activity, and a **Ruined By Horizon** stat card.

### 5. ⬜ Confidence Intervals (Box-and-Whisker)
Instead of a single bar, show a range. S&P 500 1-month has +0.8% expected but could be -10% to +10%. A single blackjack hand is -0.5% expected but is -100% to +150%. Shows that edge and variance are two different things.

### 6. ✅ Animated Transitions / Smooth Updates — *Implemented in V4+*
Category filter and time horizon switches animate bar transitions smoothly via Plotly's built-in animation support.

### 7. ✅ Metrics Summary Bar — *Implemented in V4+*
Live metrics bar shows: activity count, best performer, worst performer, and point spread. Updates dynamically when filters or time horizons change.

### 8. ✅ Compact Header & Legend — *Implemented in V2+*
Compact header with gradient title text, subtitle, and a visual green-to-red legend bar. Full-viewport flex layout eliminates scrolling.

### 9. ✅ Enhanced Tooltips with Peer Comparison — *Implemented in V6+*
Tooltips now include grouped comparisons showing where the hovered activity ranks within its subcategory. Highlighted current item with scrollable peer list. Multi-section tooltip layout: title, focus metrics, all-horizon breakdown, and group comparison.

---

## Content Additions

### 10. ⬜ "What Most People Think vs. Reality" Column
Show the perceived edge next to the actual edge in a two-column format. People think parlays are fun low-risk bets; they don't realize they're paying 20%+ vig. People think day trading is a path to wealth; the data says it's worse than roulette.

### 11. ✅ Compounding Over Repetitions — *Implemented in V4+ via Time Horizons, corrected in V20*
The 7-horizon time selector (Single Event → 10 Years) shows exactly how returns compound or erode over repetitions. Compound model for investing, flat-stake linear model for gambling — both demonstrating the law of large numbers. The animated transition between horizons visually shows the divergence. A dedicated "two curves diverging" animated comparison view could still enhance this further.

**V20 correction:** the two models were never comparable on one axis and had been sharing one since V3, when the −100% floor on gambling was removed. The linear gambling number is now named for what it is (**Expected Turnover Cost**, its own axis, deliberately unbounded), and the shared chart plots **Return on Capital**, floored at −100% for both models. See §8 of [hub_improvement_plan.md](hub_improvement_plan.md).

### 12. ✅ Fee-Adjusted Investment Returns — *Implemented in V9*
Layer toggle shows 8 fee-adjusted entries: S&P 500 after 0.03% index fee, 0.35% robo-advisor, 0.60% target-date, 1% advisor, 1.5% active fund, 2-and-20 hedge fund, 2-and-20 underperforming, and bond fund after 1% fee. Green-outlined bars appear alongside raw data. Reveals that a 2-and-20 hedge fund turns a +10% return into +6.4%.

### 13. ✅ Tax Impact Layer — *Implemented in V9*
Layer toggle shows 17 after-tax entries across 7 categories: LTCG (20%), STCG (37%), qualified dividends (15%), ordinary income, tax-exempt munis, IRS 28% collectibles rate, and gambling winnings at ordinary income rates. Amber-outlined bars. Key insight: card counting drops from +1.0% to +0.63% after tax; Bitcoin drops from +45% to +36% (LTCG) or +28.35% (STCG).

### 14. ⬜ "The Parlay Illusion" Deep Dive
Dedicated section showing how sportsbooks profit most from parlays and SGPs. Include:
- Actual hold percentages (parlays: 15-25% vs. straight bets: 4.5%)
- Why apps push parlays so aggressively (highest margin product)
- The math behind "correlated parlays" and why SGPs are even worse

### 15. ✅ Expanded Data Coverage — *Built across V1–V7*
Data grew from 99 activities (V1) to 124 data points (V7) across 11 categories:
- **V4:** +23 stock indexes (QQQ, IVW, VBR, MDY, NOBL, etc.) and +12 bond indexes (HYG, LQD, BND, TLT, etc.)
- **V5:** +5 active trading (Trend Following, Copy Trading, CFD, Binary Options), +5 poker/skill (Elite Pro, Backgammon, Recreational), +5 lottery (Scratch-offs, Daily Numbers, Pick 6, Cash4Life)
- Categories now include: Stock Market, Bonds, Real Estate, Crypto, Options, Active Trading, Sports Betting, Casino, Poker/Skill-Based, Prediction Markets, Lottery

---

## Engagement Features

### 16. ⬜ "Guess the Edge" Quiz Format
Present each activity one at a time. User guesses the edge before it's revealed. Track how far off they are. People are consistently shocked that:
- Day trading is worse than roulette
- A 10-team parlay has a 35% house edge
- Meme coins are the worst "investment" on the board

### 17. ✅ Dollar Cost Comparison — *Implemented in V11*
"If you bet/invested $100/week for a year in each of these, here's where you'd end up." Toggle via Insights dropdown adds a Dollar Cost section to every tooltip showing total invested (scales with time horizon), portfolio value, and gain/loss in dollar terms. Makes the abstract percentages tangible and personal.

### 18. ⬜ Time-to-Double / Time-to-Zero Calculator
- Positive edge: Rule of 72 applied. S&P 500 at +10% doubles in ~7.2 years.
- Negative edge: How long to lose it all. Roulette at -5.26% with $1K bankroll and $25 bets = ~12 hours.
- Interactive slider for bet size and starting bankroll.

### 19. ⬜ Celebrity & Famous Bets Overlay
Historical examples of famous wins and losses in each category:
- Warren Buffett's S&P 500 bet vs. hedge funds
- Billy Walters' sports betting empire
- The MIT blackjack team
- Long-Term Capital Management's collapse
- The WallStreetBets GameStop saga

### 20. ✅ Addiction Risk Score — *Implemented in V11*
Overlay showing which activities are most associated with problem gambling/trading behavior. Toggle via Insights dropdown. Every activity rated 1–5 based on feedback loop speed, variable reward patterns, and documented problem-behavior association. When active, bar outlines switch to risk-colored borders and tooltips show a filled block meter with risk label and description. Category defaults with 50+ activity-specific overrides.
- **Extreme (5)**: Slots, 0DTE options, crypto day trading, live betting, SGP, binary options
- **High (4)**: Player props, parlays, scratch-offs, penny stocks, meme coins, online poker avg
- **Medium (3)**: Table games, options buying, DeFi volatile, prediction markets
- **Low (2)**: Buy & hold crypto, skilled poker, card counting, trend following
- **Minimal (1)**: Index funds, bonds, real estate, stablecoin yield, collectibles

### 21. ⬜ Side-by-Side "Twin" Comparison
Two identical people start with $10,000 on the same day. One does activity X (negative edge), one does activity Y (positive edge). Animated chart showing the divergence over 1, 5, 10 years. The visual gap between the two paths is powerful storytelling.

### 22. ⬜ Breakeven Skill Percentile
For skill-based activities, show what percentile of skill you need to reach just to break even:
- **Poker (live cash)**: Top 30% (rake is manageable)
- **Sports betting**: Top 3% (need to beat the vig consistently)
- **DFS**: Top 5% (high rake + shark-filled pools)
- **Day trading**: Top 5-10% (commissions + slippage + psychology)
- **Options selling**: Top 25% (need risk management discipline)

Most people overestimate their skill percentile. Include the Dunning-Kruger angle.

### 23. ⬜ "The Vig is the Price" Annual Cost Reframe
Show the house edge as an annual entertainment cost based on realistic activity levels:

| Activity | Frequency | Bet Size | Annual Cost |
|----------|-----------|----------|-------------|
| Blackjack (3:2) | 2x/week, 100 hands | $25/hand | $1,300 |
| Sports betting | 5 bets/week | $50/bet | $591 |
| Powerball | 2 tickets/week | $2/ticket | $108 |
| Slot machines | 1x/week, 500 spins | $1/spin | $2,080 |
| 5-team parlays | 2x/week | $20/bet | $416 |

Compare to: Netflix ($180/yr), golf ($3,000/yr), concert tickets ($500/yr). Reframes gambling as entertainment with a known price tag.

---

## Advanced / Bonus Ideas

### 24. ⬜ Monte Carlo Simulation Visualizer
Run 1,000 simulated paths for each activity and show the full distribution of outcomes. Some activities cluster tightly around the expected value (low variance); others have wild spreads. Shows why "expected edge" alone doesn't tell the full story.

### 25. ⬜ "The Kelly Criterion" Sizing Guide
For positive-edge activities, show the mathematically optimal bet/investment size using the Kelly Criterion. Most people over-bet (full Kelly is already aggressive; half-Kelly is usually better). Shows that even with an edge, poor sizing can ruin you.

### 26. ✅ Category Toggle / Filter — *Implemented in V3+*
12 category filter buttons: All, Stocks, Bonds, Real Estate, Crypto, Options, Trading, Sports, Casino, Poker/DFS, Predictions, Lottery. Click to isolate any category. Active button is visually highlighted. Combined with time horizon selector (V4+) for two-dimensional filtering.

### 27. ⬜ "What Would Warren Buffett Say?" Commentary
Add a pithy quote or perspective from a famous investor/gambler for each tier of the chart. Buffett on index funds, Ed Thorp on blackjack, Billy Walters on sports betting, etc.

### 28. ⬜ Social Sharing Snippets
Auto-generate shareable images: "Did you know a 5-team parlay has a 20% house edge? That's 4x worse than roulette." Designed for Twitter/X, Instagram stories, etc.

### 29. ⬜ Personal "Edge Audit"
User inputs their actual betting/investing activities and amounts. The tool calculates their blended edge across all activities and annual expected gain/loss. "Your portfolio of activities has a blended edge of -8.2%, costing you approximately $4,300/year."

---

## Implementation Summary

| Status | Count | Items |
|--------|-------|-------|
| ✅ Implemented | 15 | #1, #2, #4, #6, #7, #8, #9, #11, #12, #13, #15, #17, #20, #26 + partial #3 |
| 🔶 Partial | 1 | #3 (volatility in tooltips, no visual overlay) |
| ⬜ Not Started | 13 | #5, #10, #14, #16, #18, #19, #21–25, #27–29 |

### Version Changelog (Features Implemented)
| Version | Ideas Addressed |
|---------|----------------|
| V1 | #1 (color gradient), #2 (interactive Plotly chart) |
| V2 | #8 (compact header/legend) |
| V3 | #26 (category filter buttons) |
| V4 | #6 (animated transitions), #7 (metrics bar), #11 (time horizons / compounding) |
| V5 | Internal refactor (shorter CSS classes) |
| V6 | #9 (enhanced tooltips with peer comparison) |
| V7 | #15 (124 data points — trading, poker, lottery expansions) |
| V8 | #15 (151 data points — real estate, collectibles, prediction markets) |
| V9 | #12 (fee-adjusted returns), #13 (tax impact layer) — new Layer toggle row |
| V10 | Layer button auto-hide for categories without fee/tax data, +4 Options tax entries |
| V11 | UI overhaul (single control bar, category dropdown), #17 (Dollar Cost Comparison), #20 (Addiction Risk Score), Insights dropdown |
| V12 | Design refresh (zinc palette, favicon, translucent controls, frosted tooltip), multi-select category dropdown |
| V13 | Mobile responsive (bottom-drawer tooltip, tap interaction, compact stacked controls, scroll time buttons) |
| V14 | Time horizon overhaul: 7 calendar-anchored horizons (1 Bet → 10 Years), fixed misaligned mappings, edge_analysis8.md |
| V15 | DU/CED standardized model: per-activity frequency + position sizing replaces hardcoded 10%, edge_analysis10.md |
| V16 | Streamlined to 155 entries (removed Options, Trading, Poker Elite Pro), Casino+Poker off by default, adaptive Y-axis + tick formatting, edge_analysis11.md |
| V17 | Combined dataset (V10+V11), 166 data points, Precious Metals category, edge_analysis12.md |
| V18 | #4 (Ruin Calculator) — "How Long Until You're Broke?" Insights toggle with $1K bankroll, decision count, time-to-ruin, urgency meter |
| V19 | Layout/tooltip rewrite. Undocumented at the time, and it silently dropped the working implementations of #4 (Ruin Calculator) and #17 (Dollar Cost) — both toggles remained in the UI doing nothing |
| V20 | Roadmap Action 2.1 — metric split into Return on Capital (floored at −100%), Expected Turnover Cost (own axis, unbounded) and Ruin Point; #4 restored and promoted onto the primary chart; per-row horizon units; `npm run check:spectrum` regression guard. #17 remains broken |
