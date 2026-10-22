# Edge Analysis V8 — Time Horizon Overhaul

**Date:** March 27, 2026
**Change:** Replaced 5 misaligned time horizons with 7 calendar-anchored horizons
**Data:** Same 180 data points as edge_analysis7.md (151 raw + 8 fee + 21 tax)

---

## Problem with V7 Horizons

The V7 time horizons had inconsistent mappings between gambling events and investing time:

| Old Key | Old Label | Gambling Events | Investing Time | Issue |
|---------|-----------|----------------|----------------|-------|
| 1ev | 1 Bet / 1 Month | 1 bet | 1 month | 1 bet ≠ 1 month of investing |
| 25ev | 25 Bets / 1 Day | 25 bets | 2 years | 25 bets ≠ 2 years of investing |
| 1yr | 1 Year / 625 Bets | 625 bets | 1 year | OK |
| 5yr | 5 Years / 3,125 Bets | 3,125 bets | 5 years | OK |
| 10yr | 10 Years / 6,250 Bets | 6,250 bets | 10 years | OK |

Key issues:
- "1 Bet" mapped to "1 Month" of investing — a single trade isn't a month
- "25 Bets / 1 Day" mapped to "2 Years" of investing — a day of gambling isn't 2 years
- Missing standard calendar periods (1 Day, 1 Week, 1 Month)
- Only 5 horizons — too few to show the full curve from single event to decade

---

## V8 Time Horizon Model (7 Horizons)

All horizons are anchored to **calendar time**. Both models answer: "What is the expected cumulative return over this time period?"

### Investing Model (Compound)
Formula: `((1 + annual_return/100) ^ years - 1) × 100`

| Horizon | Years |
|---------|-------|
| 1 Trade | 1/252 (one trading day) |
| 1 Day | 1/252 |
| 1 Week | 1/52 |
| 1 Month | 1/12 |
| 1 Year | 1 |
| 5 Years | 5 |
| 10 Years | 10 |

Note: 1 Trade and 1 Day produce identical results for investments — a single trade IS effectively one trading day of exposure.

### Gambling Model (Linear)
Formula: `N_events × 0.10 × edge_per_bet`

Gambling events are pro-rated from the baseline: **625 bets per year** (≈ 25 sessions/year × 25 bets/session — a casual/recreational gambler).

| Horizon | Events | Derivation |
|---------|--------|------------|
| 1 Bet | 1 | Single event |
| 1 Day | 2 | 625 ÷ 365 ≈ 1.7, rounded to 2 |
| 1 Week | 12 | 625 ÷ 52 ≈ 12 |
| 1 Month | 52 | 625 ÷ 12 ≈ 52 |
| 1 Year | 625 | Baseline |
| 5 Years | 3,125 | 625 × 5 |
| 10 Years | 6,250 | 625 × 10 |

All event counts are monotonically increasing across horizons.

### Dollar Cost Comparison ($100/week)

| Horizon | Amount Invested |
|---------|----------------|
| 1 Bet / Trade | $100 (single stake) |
| 1 Day | $100 |
| 1 Week | $100 |
| 1 Month | $430 |
| 1 Year | $5,200 |
| 5 Years | $26,000 |
| 10 Years | $52,000 |

---

## Summary Table: Old vs New

| # | Old Horizon | New Horizon | Change |
|---|-------------|-------------|--------|
| 1 | 1 Bet / 1 Month | **1 Bet / Trade** | Fixed: single event, not 1 month |
| 2 | 25 Bets / 1 Day (→ 2yr invest) | **1 Day** | Fixed: 1 calendar day, 2 bets |
| 3 | — | **1 Week** | NEW |
| 4 | — | **1 Month** | NEW |
| 5 | 1 Year / 625 Bets | **1 Year** | Same (625 bets) |
| 6 | 5 Years / 3,125 Bets | **5 Years** | Same (3,125 bets) |
| 7 | 10 Years / 6,250 Bets | **10 Years** | Same (6,250 bets) |

---

## Data Points

All 180 data points are unchanged from edge_analysis7.md:
- **151 raw** entries across 12 categories
- **8 fee-adjusted** entries (Stock Market, Bonds)
- **21 tax-adjusted** entries (Stocks, Bonds, Real Estate, Crypto, Options, Active Trading, Collectibles, Casino, Poker)
