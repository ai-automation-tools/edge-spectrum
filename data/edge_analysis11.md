# Edge Analysis V11 — Streamlined for Typical Investors & Gamblers

**Date:** March 27, 2026
**Data Points:** 156 (was 180)
**Categories:** 10 (was 12)

---

## Changes from V10

### Removed Categories
- **Options & Derivatives** (14 entries removed: 10 raw + 4 tax) — specialized instruments not used by typical investors/gamblers; extreme outliers (0DTE at -50% edge, leveraged futures at -25% edge with 20% CED) dominated the chart scale
- **Active Trading** (10 entries removed: 8 raw + 2 tax) — niche activity category; returns overlapped with existing Stock Market entries (individual stock picking, penny stocks) and were extreme outliers (-40% binary options, -35% crypto day trading)

### Why
- Reduces noise for the target audience (everyday investors and recreational gamblers)
- Removes the biggest chart-scale outliers that were squishing mid-range data into invisibility
- Options and active trading are better served by dedicated analysis tools than a comparative spectrum

### Chart Improvements
- **Percentile-based Y-axis scaling** — uses 5th–95th percentile of visible data with 15% padding instead of absolute min/max. Outlier bars extend beyond the visible range, but the bulk of data is always clearly visible and fills the screen.

---

## Remaining Categories (10)

| Category | Model | Raw | Fee | Tax | Total |
|----------|-------|-----|-----|-----|-------|
| Stock Market | Compound | 22 | 7 | 4 | 33 |
| Bonds | Compound | 12 | 1 | 3 | 16 |
| Real Estate | Compound | 10 | 0 | 2 | 12 |
| Cryptocurrency | Compound | 7 | 0 | 3 | 10 |
| Collectibles | Compound | 10 | 0 | 1 | 11 |
| Sports Betting | Linear (DU/CED) | 18 | 0 | 0 | 18 |
| Casino Gambling | Linear (DU/CED) | 20 | 0 | 1 | 21 |
| Poker & Skill-Based | Linear (DU/CED) | 13 | 0 | 1 | 14 |
| Prediction Markets | Linear (DU/CED) | 12 | 0 | 0 | 12 |
| Lottery | Linear (DU/CED) | 9 | 0 | 0 | 9 |
| **Total** | | **133** | **8** | **15** | **156** |

---

## Data

All 156 entries use the DU/CED framework from edge_analysis10.md with the Options and Active Trading sections removed. No other data was changed.
