# Edge Spectrum — Hub Improvement Plan 🛠️

**Date:** 2026-08-18
**Scope:** Full review of the `edge-spectrum` repo, the `site/` app, and the two live tools
(The Edge Spectrum viz + the Backtest Simulator).
**Companion docs:** [roadmap.md](../roadmap.md) (phased milestones) ·
[improvement_ideas.md](improvement_ideas.md) (Spectrum viz feature backlog)

**Status Key:** 🔴 Critical · 🟠 High · 🟡 Medium · ✨ Feature · ✅ Done

---

## ✅ 1. The Backtest Simulator had a large built-in bias — fixed 2026-08-18

**Was the highest-priority item in the repo.** Resolved; the results below are kept as the record
of what was wrong and the band the regression now holds the model to.

### What was wrong

`site/src/dataGenerator.ts` derived both the betting line *and* the game score from the same
power ratings, but with **mismatched coefficients**. For NFL:

- Line: `expectedSpread = powerDiff * 0.35`
- Score: `homeScore - awayScore ≈ 2 + powerDiff * 0.4`

The home side was therefore underpriced by roughly `2 + 0.05 × powerDiff` points **by
construction**. The same mismatch existed in every sport, and was worst in NBA.

### Measured impact (before the fix)

Running the engine directly over 2000–2025:

| Strategy (ATS) | Bets | Win % | ROI |
|---|---:|---:|---:|
| NBA — bet home | 15,600 | **72.3%** | **+37.32%** |
| NFL — bet home | 7,072 | 60.8% | +15.73% |
| NFL — bet favorites | 7,072 | 59.9% | +13.97% |
| NHL — bet home | 15,600 | 55.7% | +6.20% |
| MLB — bet home | 20,800 | 53.9% | +2.84% |
| NFL — bet under | 7,072 | 59.1% | +12.15% |

A new user's first few clicks taught them that blind home-ATS betting returns 15–37% forever —
the exact opposite of the lesson Edge Spectrum exists to deliver. NBA at 72.3% was not subtle;
any quantitative visitor would have spotted it and discounted the whole hub.

### Fix (shipped)

1. One `expectedMargin` / `expectedTotal` per game now drives **both** the posted lines and the
   score draw — `SPORT_MODEL` in `site/src/dataGenerator.ts`.
2. Scores are drawn around exactly that expectation. NFL and NBA use a normal draw floored at
   zero (with the floor's effect on the mean *and* variance carried into the prices); MLB and NHL
   use Poisson, which suits count scores and never needs a floor.
3. **Every market is priced from its own realised distribution**, not assumed to be −110. This
   turned out to be essential: run and goal distributions are right-skewed, so their mean sits
   above their median and a line placed at the mean is not a coin flip. `Game` gained
   `homeSpreadOdds` / `awaySpreadOdds` / `overOdds` / `underOdds`, and the engine reads the posted
   price for whichever side a strategy took.
4. A level score is broken with one extra point, so that probability mass is redistributed
   *before* pricing. Skipping this was worth ~0.6% ROI to the home side on its own: a tie counts as
   an away cover beforehand, but half of it flips to home afterwards.
5. Team **defense ratings now count** — strength blends offense and defense, and totals move on
   offense minus opposing defense, so the dynasty defenses in `getTeamHistoricalRating` finally
   matter.
6. Vig is one constant, `MARKET_OVERROUND = 1.0476` (a 4.54% hold, matching −110/−110), applied so
   it can never price a side below fair value. No bet is +EV by construction.

### Result

All 40 naive strategies (4 sports × 10 selections, 2000–2025) now land between **−3.06% and
−5.81%** ROI. None is profitable; the spread around the 4.54% hold is discretisation slack from
integer scores and half-point lines.

| Strategy (ATS) | Was | Now |
|---|---:|---:|
| NBA — bet home | +37.32% | −4.60% |
| NFL — bet home | +15.73% | −3.53% |
| NFL — bet favorites | +13.97% | −3.26% |
| NHL — bet home | +6.20% | −5.56% |
| MLB — bet home | +2.84% | −3.99% |
| NFL — bet under | +12.15% | −5.30% |

The default landing view (NFL / moneyline / favorites / 2020–24) went from **+15.92% ROI and
+$21,650** to **−1.39% and −$1,884** over the same 1,360 bets.

### Regression guard

`npm run check:market` (from `site/`) runs `marketDiagnostics()` over all 40 naive strategies and
exits non-zero if any lands outside −7%…−2.5%. Verified to fail as intended by reintroducing a
1.2-point mispricing. **Wire this into CI** alongside the typecheck (section 3).

### Related: framing (shipped)

The footer disclosed simulation, but other surfaces contradicted it. All now corrected:

- ✅ Header badge **"Live Data Engine"** → **"Simulated Data"**.
- ✅ `tools.ts` blurb and the header subtitle now say "26 simulated seasons".
- ✅ **"Simulated Vig Hold: 4.5%"** → **"Book Hold: 4.54%"**, read live off `MARKET_OVERROUND`
  instead of asserted; **"Optimal Fraction Kelly Model Enabled"** → **"Quarter-Kelly Sizing"**,
  which is what the code actually does.
- ✅ The backtester footer and the AI advisor (both its welcome copy and its system prompt) now
  state that the data is simulated and that the hold is the only edge in it — the advisor is
  explicitly told not to imply a good backtest means a real-world edge.
- ⬜ Still to do: a `/methodology` page explaining the generator, the DU/CED framework, and the
  Spectrum's data sources. Honest framing is an asset here, not a weakness.

---

## 🟠 2. Cost, safety & correctness

### 2a. `/api/strategy-advisor` was an open proxy to a paid Gemini key ✅

No auth, no rate limit, no prompt cap, no origin check — anyone could loop `curl` against it and
drain the quota. **Resolved 2026-08-18** with a passcode session gate (see the auth gate section below).

Still outstanding on the same endpoint:

- Per-IP / per-session rate limiting (Upstash or Vercel KV) — the passcode stops strangers, not
  a shared passcode being over-used.
- A daily spend ceiling / kill switch.

### 2b. No input validation on `/api/backtest` ✅ — fixed 2026-08-20

`runValidatedBacktest` checked only that five fields were *present*, not that they were sane.

**Measured, not estimated.** Running the engine directly over the range the endpoint would have
accepted:

| Seasons requested | Wall clock | Peak heap | Bets |
|---|---:|---:|---:|
| 26 (the largest legal range) | 0.18 s | 30 MB | 20,800 |
| 100 | 0.54 s | 110 MB | 80,000 |
| 300 | 1.88 s | 264 MB | 240,000 |
| **1,101** (`1900`–`3000`) | **7.58 s** | **925 MB** | 880,800 |

A 1 GB serverless function does not survive the last row, and the request costs the sender
nothing — a denial-of-wallet with a two-field body.

**Fix (shipped).** A Zod schema, `site/src/server/strategySchema.ts`, reached through the same
`runValidatedBacktest` both entry points already call:

- Seasons bounded to 2000–2025 (the only years `getTeamHistoricalRating` has era ratings for),
  integers, and `endYear >= startYear`.
- All six enums — sport, bet type, side selection, streak filter, streak target, star-player
  filter — checked against the unions in `types.ts`. A `SameMembers` type assertion fails
  `tsc --noEmit` if a union gains a member and the schema does not, so the two cannot drift.
- `unitSize` and `startingBankroll` required, finite, positive, capped at $1M / $1B.
- Odds, spread and total filters bounded, and each min/max pair required to be ordered.
- `betType: 'totals'` must pair with `over`/`under` and nothing else may — that mismatch used to
  return a silent zero-bet run rather than an error.
- Unknown keys stripped, so the object handed to the engine is exactly the known shape.

The 1900–3000 payload is now a `400` in **~5 ms**, with one message per bad field; the client
renders those verbatim instead of "Simulation server returned an error response."

**Bounds are shared, Zod is not.** The numbers live in `site/src/strategyBounds.ts`, which has no
imports, and `StrategyBuilder` clamps every control to them — so the form cannot build a request
the endpoint would reject, and the year dropdown is generated from `MIN_SEASON`/`MAX_SEASON`
rather than a hardcoded 26. Importing the schema itself into the client was tried first and cost
**+57 KB (+14 KB gzipped)** on the single chunk section 3 wants to shrink, for a check the server
already reports identically; the split keeps the client cost at +0.34 KB.

### 2c. No cache headers on `/api/espn-scoreboard` 🟠

Every visitor hits ESPN's undocumented endpoint directly — rate-limit risk and needless latency.

**Fix:** `Cache-Control: s-maxage=30, stale-while-revalidate=120`. One line.
(Already listed as Phase 2 in the roadmap.)

### 2d. Race conditions in the backtester ✅ — fixed 2026-08-25

`BacktesterApp.tsx` refired the backtest on **every keystroke** in `unitSize` / `startingBankroll`,
with no debounce and no `AbortController` — a slow earlier response could overwrite a newer one.

**Measured, in the browser, against the dev server** (Playwright driving `/backtester`, `fetch`
wrapped to count `/api/backtest` calls):

| Scenario | Before | After |
|---|---|---|
| Type a 3-digit unit size (6 keystrokes, 40 ms apart) | **6 requests**, each a full multi-season sim | **1 request** |
| Initial page load under `<StrictMode>` (double-mounts effects) | 1 request | 1 request |
| Switch sport to MLB, first response stalled 2 s, switch to NHL 700 ms later | ledger renders **MLB** — the stale result lands last and wins, while the selector reads NHL | ledger renders **NHL**; the late MLB response is discarded |

The middle row is why the debounce timer is armed rather than the fetch: StrictMode's second
effect invocation clears the pending timer before it fires, so the double-mount costs nothing.

**Fix (shipped):** the auto-rerun effect debounces `RERUN_DEBOUNCE_MS` (300 ms) and each run owns
an `AbortController` held in a ref; starting a run aborts the previous one. The
`controller.signal.aborted` check is repeated *after* `await response.json()`, because a response
can finish parsing after it has been superseded — that is the path that produced the MLB/NHL
mismatch, and an abort on the socket alone does not close it. A superseded run also skips
`setIsLoading(false)` and `setError(...)`, so the spinner stays with whichever run now owns the UI
and an abort never surfaces to the user as "Error executing backtest". The manual **Execute
Backtest** button calls `runBacktest` directly and is deliberately not debounced.

### 2e. Silent truncation of the bet ledger 🟡

`dataGenerator.ts` returns `simulatedGames.slice(-250)`. A 7,000-bet run silently shows only the
last 250, with no indication in the UI.

**Fix:** label it ("showing last 250 of 7,072 bets") and add CSV export of the full ledger.

---

## 🟡 3. Platform hygiene

| Item | Detail |
|---|---|
| **Bundle size** | 771 KB single JS chunk. The landing page ships Recharts + D3 + react-markdown to render two tiles. Fix with `React.lazy` routes + `manualChunks`. (Roadmap Phase 2.) |
| **No tests** | The engine is pure functions — ideal for Vitest: odds conversion, push handling, ROI / drawdown / Kelly math, and the section 1 bias regression. |
| **No CI** | Add a GitHub Action running `tsc --noEmit` + tests + build on every PR. Pairs naturally with the existing `mike_desktop` → PR → `main` flow. |
| **No linting** | No ESLint or Prettier config anywhere. |
| **No shareable state** | Strategy lives only in React state — a backtest cannot be bookmarked or sent to anyone. Serialize it to the query string. Cheapest growth feature on the list. |
| **No SEO / social** | No OG or Twitter meta, no sitemap, no robots.txt, no analytics. Use `@vercel/og` for per-tool cards and per-backtest equity-curve cards. |
| **Duplicate sticky headers** | `HubNav` (z-50) and the Backtester `Header` (z-40) stack on `/backtester`. Collapse to one shell nav. |

---

## ✨ 4. Make the backtester statistically honest

Today it answers *"did this win?"* It should answer **"is this real?"** — nobody in the hobby
space does this well, and it is the strongest available differentiator.

1. **Significance panel** — 95% CI on win rate, t-stat and p-value vs. the breakeven rate, and
   required sample size. A 54% hit rate over 300 bets should be labelled *statistically
   indistinguishable from noise*.
2. **Monte Carlo fan chart** — resample the bet stream 1,000× and plot the distribution of equity
   paths. The single equity curve is the most misleading object in the app; the fan chart is the
   antidote. (This is idea #24 in `improvement_ideas.md` — it belongs here, not only in the viz.)
3. **Walk-forward split** — fit on 2000–2015, verify on 2016–2025. The anti-overfitting guard.
4. **Overfitting warning** — when filters cut the sample below ~200 bets, say so loudly.
5. **Vig sensitivity slider** — watch a "profitable" strategy die when −110 becomes −115.
6. **Staking method grid** — flat / %-bankroll / Kelly / Martingale over the *same* bet stream,
   with risk-of-ruin per method. (Already roadmap Phase 3.)
7. **Multi-strategy compare** — 2–4 equity curves overlaid.
8. **Splits heatmap** — ROI by season, month, day-of-week, favourite size.

---

## ✨ 5. New tools

Each is roughly one `tools.ts` entry plus one page — the architecture already supports this well.

### Tier 1 — small, high-traffic, build first

- **Odds converter and no-vig calculator** — American ↔ decimal ↔ fractional ↔ implied, with vig
  stripped out. Already roadmap Phase 4; it is the best SEO hook available and a half-day build.
- **Parlay / SGP true-odds calculator** — fair price vs. book price, exposing the 15–25% hold.
  Directly serves idea #14 ("The Parlay Illusion").
- **Kelly and bankroll sizing calculator** — with risk-of-ruin. Standalone, and feeds the backtester.

### Tier 2 — the retention product

- **CLV bet tracker.** Log bets, auto-fetch the closing line, grade the user on **closing line
  value** rather than on wins. CLV is the only metric that actually predicts long-term betting
  skill, and no consumer tool presents it well. This is the reason someone returns weekly — and
  the feature that justifies accounts and a database.
- **Personal Edge Audit** (idea #29) — user enters real activities and amounts; returns a blended
  edge and an annual expected cost. The natural bridge between the Spectrum viz and the betting tools.

### Tier 3 — reach

- **"Guess the Edge" quiz** (roadmap Phase 3) — the viral loop, with a shareable score card.
- **Portfolio blender** (roadmap Phase 3).
- **EV / arb / middle finder** — gated on a real odds feed.

---

## ✨ 6. The data question

Everything above is worth more with real numbers. **The Odds API** carries historical closing
lines; even **one sport × 10 seasons** of real closing lines would move the backtester from a toy
to a credible instrument. Store it as static JSON/Parquet in the repo or Vercel Blob so it stays
free to serve, and put a "verified data" badge on that tool's tile.

Sequence: fix the section 1 bias → ship the Tier 1 calculators → then add real data for one sport.

---

## 🟡 7. Compliance and trust

Given the subject matter and the freemium plans in roadmap Phase 4:

- Responsible-gambling footer with 1-800-GAMBLER and international equivalents.
- An age note.
- A "not financial advice" line on AI advisor output.

Cheap to add, and it matters the moment this takes payments.

---

## ✅ 8. The Spectrum viz plotted two incompatible measures on one axis — fixed 2026-08-31

Roadmap Action 2.1 (Audit D1). The flagship visualization had the same class of defect section 1
found in the backtester: a number that looked authoritative and was not comparable to the number
next to it.

### What was wrong

`site/public/spectrum/index.html` computed two things and drew them on one y-axis labelled
**"Cumulative Expected Return (%)"**:

- `invRet(ann, yr) = ((1 + ann/100)^yr − 1) × 100` — a **compounded return on capital**, naturally
  bounded below at −100%.
- `gambRet(edge, du, ced, days) = du × days × (ced/100) × edge` — a **linear turnover cost** at flat
  stakes off a fixed bankroll, with no floor at all.

A bankroll cannot lose more than itself. `gambRet` was never a return on capital; it was the total
you lose *if you keep reloading*. Plotting it as one was the error.

Separately, the `1du` horizon button read **"1 DECISION"** for every row, while
`I_Y['1du'] = 1/252` — so a held asset's number under that button was one **trading day**, and a
game's was one **wager**. The same button, two units. `I_Y['1du']` and `I_Y['1day']` were also
identical, so held assets printed the same value twice under two different names.

### Measured impact (before the fix)

Worst plotted value and how much of the axis was left for everything else, over all 187 records:

| Horizon | Worst bar | Rows past −100% | Best investment's share of the plotted span |
|---|---:|---:|---:|
| 1 week | −262% | 2 | 0.26% |
| 1 month | −1,125% | 12 | 0.27% |
| 1 year | −13,688% | 32 | 0.32% |
| 5 years | −68,438% | 58 | 0.76% |
| **10 years** | **−136,875%** | **58** | **2.83%** |

The worst bar throughout is *Slots Tight 85%* (−15% edge, 500 decisions/day, 0.5% of bankroll per
decision). At every horizon past a week, the entire investing half of the chart — the comparison
the page exists to make — rendered as a flat line at zero. (The roadmap's original note cited
−45,625%; the measured figure on the current 187-record dataset is −136,875%.)

This was a deliberate decision once: V3's change log reads *"Removed −100% floor on gambling
losses — losses can now blow past −100%."* It makes a rhetorical point and destroys the axis.

### Fix (shipped)

Three named measures, one coherent model, and the pairing between them is exact:

| Measure | Definition | Bounded? |
|---|---|---|
| `returnOnCapital` | What happens to the one bankroll you brought. Assets compound; games accrue the same flat-stake loss but **stop at −100%**. | Yes, at −100% |
| `expectedTurnoverCost` | Cumulative expected P&L as a % of the starting bankroll at constant turnover — what you lose in total if you keep reloading. **Games only**; a held asset has no turnover. | No, by design |
| `ruinPoint` | `100 / ((ced/100) × |edge|)` decisions until the flat-stake bankroll is expected to be gone. For a losing held asset, the analogue is years to lose 90%. | — |

`returnOnCapital` reaches its floor for a game **precisely** when the horizon contains `ruinPoint`
decisions — verified across all 187 records × 7 horizons with **0 disagreements**. That is the
invariant that makes the floored bar and the ruin marker the same statement.

Turnover cost moved to its own axis behind a **Measure** toggle in the sidebar, where it is
labelled "% of starting bankroll" and captioned as unbounded. Nothing was deleted; the −136,875%
number is still there, now on an axis where it means something.

### Result

| Horizon | Best investment's share of the axis — was | now |
|---|---:|---:|
| 1 year | 0.32% | **8.09%** |
| 5 years | 0.76% | **22.72%** |
| 10 years | 2.83% | **85.97%** |

Also shipped with it:

- **Ruin left the tooltip and reached the chart.** A dotted −100% floor line labelled
  `RUIN — TOTAL CAPITAL LOSS`, an ✕ marker per ruined activity, and a **Ruined By Horizon** stat
  card (58 of 160 at ten years with every category enabled). The floor line and the axis pin only
  appear once a bar actually reaches −100%, so the short horizons still fit their own data.
- **The ruin calculator works again.** Idea #4 in `improvement_ideas.md` was shipped in V18 and
  silently lost in the V19 rewrite — `showRuin` was still assigned but read nowhere, and the
  `.tt-ruin-box` CSS sat unused. Restored, with decisions-to-$0, time-to-ruin, stake per wager and
  the urgency meter, and **on by default**.
- **Horizon units are per row.** `1du` is now `1 WAGER` on a game and `1 TRADING DAY` on a held
  asset, the tooltip carries an explicit "Horizon basis" line (`14,600 wagers` / `1.00 years
  held`), and the duplicate `1du` row is dropped for held assets.

### Regression guard

`npm run check:spectrum` (from `site/`) lifts the page's own `MATH & CONSTANTS` block and `RAW`
dataset out of the HTML and runs the **real** functions — it is the page under test, not a copy.
It asserts the record count, that no `returnOnCapital` breaches −100%, that some
`expectedTurnoverCost` still passes −100% (a floored one would erase the distinction), the
floor/ruin-point agreement, that every losing row can say how it ends, that `1du` never labels a
wager and a trading day identically, and that the best investment holds ≥25% of the 10-year axis.
Verified to fail as intended by deleting the `Math.max(RUIN_FLOOR, …)` from the page (13 breaches,
exit 1) and by widening `RUIN_FLOOR` to −1000 (exit 1). Wired into `.github/workflows/ci.yml`
alongside `check:market`.

**Known, out of scope, still broken:** the `showDCA` toggle ("Dollar Cost $100/wk", idea #17,
shipped in V11) is the *other* casualty of the V19 rewrite — still assigned, still read nowhere.
Left alone rather than fixed in passing; it needs its own item.

---

## ✅ 9. Three copies of the dataset, and nothing comparing them — fixed 2026-08-31

Roadmap Action 2.2 (Audit D2). Section 8 fixed how the Spectrum page *plots* its numbers. This is
about where those numbers live: the same 187 rows were maintained by hand in three places.

### What was wrong

| Copy | Records | Role |
|---|---:|---|
| `site/public/spectrum/index.html` — inlined `RAW` | 187 | what production actually serves |
| `Versions/Streamlit/data.py` — `RAW` | 187 | the deployable Streamlit port |
| `Data/edge_analysis12.md` — markdown tables | 166 | the human-readable catalog |

**Measured.** Comparing all three field by field:

- The HTML and the Streamlit port were **identical** — 187 rows, 0 differences across all 11
  fields. The drift was not where the roadmap assumed ("in both directions"); it was one-way.
- `edge_analysis12.md` was **21 records behind**. It predates the entire **Precious Metals** (12
  records) and **Insurance & Annuities** (11) categories, and still lists a
  `Gold / Precious Metals (GLD)` row under Stock Market that the other two renamed to
  `Gold Bullion (Physical / GLD)` and moved. 166 + 22 − 1 = 187.
- Its horizon columns were computed under the pre-section-8 single-axis model, so every projected
  number in it had been wrong since 2026-08-31 with nothing to notice.

The failure mode is not that a copy was stale — it is that a copy could be stale for five months
and no check would say so.

### Fix (shipped)

`site/src/data/edges.ts` is the single typed `readonly EdgeRecord[]`. It stores only fields that
carry information: `g`, `type`, `vol`, `wp` and `sk` are pure functions of `cat` and `m`, so
`toSpectrumRow()` re-expands them rather than the dataset holding 187 copies of the string
`"Varies"`. `site/scripts/generate-edge-artifacts.ts` emits four artifacts from it:

| Artifact | Why |
|---|---|
| `site/public/spectrum/index.html` (`RAW` block) | the page stays self-contained; the generator just owns the block |
| `Versions/Streamlit/data.py` (`RAW` list) | the port can no longer diverge |
| `site/public/spectrum/edges.json` | machine-readable, for the React port (Action 4.6) |
| `Data/edge_dataset.md` | replaces the stale catalog |

The generated markdown deliberately lists **inputs only** — annual return, edge, DU/day, CED — and
no horizon projections. Projections belong to the code that draws them, where `check:spectrum`
holds them; a second copy of them in markdown is exactly what went stale before.
`edge_analysis12.md` is kept, banner-marked as a frozen 30 March 2026 archive.

The Spectrum page keeps its data **inlined** rather than fetching `edges.json`. That is what lets
`check:spectrum` lift the page's own `RAW` and math out of the HTML and test the file that
actually deploys — swapping to a runtime fetch would have made the guard test a copy.

### Result

The generator reproduces the shipped `index.html` `RAW` block and the Streamlit `RAW` list
**byte-for-byte**. Nothing about what deploys changed; the dataset simply now has one author.

### Regression guard

`npm run gen:edges -- --check` regenerates all four artifacts in memory and exits non-zero listing
any that drifted. Wired into `.github/workflows/ci.yml` after `lint`. Verified to fail as intended
by changing one value in `edges.ts` (`a: 12.5` → `13.5` on QQQ): all four artifacts flagged, exit
1; restored, exit 0. Comparison is line-ending normalised, because `core.autocrlf` is on and the
working tree is CRLF on Windows and LF on CI.

**Action 2.3 — fixed 2026-09-07.** `EdgeRecord` now carries optional `source` / `asOf` / `window` /
`methodology` fields (purely additive — `gen:edges -- --check` still reproduces every artifact
byte-for-byte). `npm run check:edges` asserts the 187-record count, all 13 categories present, no
duplicate names, and per-record numeric sanity, and holds a provenance citation ratchet against
`site/src/data/provenance-baseline.json` — coverage (currently 0/187, since no record cites a
source yet) can only go up. Wired into CI after `check:market`. Still open: nobody has gone back
and actually cited a source for any of the 187 numbers — the fields and the ratchet just make that
fixable in one place instead of impossible to notice.

---

## 🔐 Auth gate (implemented 2026-08-18)

Interim protection for the Gemini key, ahead of the broader rate-limiting work in section 2a.

**Design** — a shared passcode unlocks an HMAC-signed, HttpOnly session cookie. The check is
enforced **server-side** on every advisor call; the client lock screen is only cosmetic, because
the endpoint is the thing being abused.

| File | Role |
|---|---|
| `site/src/server/auth.ts` | Shared logic — passcode compare, HMAC token sign/verify, cookie build/parse |
| `site/api/advisor-auth.ts` | Vercel: `GET` session status, `POST` unlock / logout |
| `site/api/strategy-advisor.ts` | Rejects with `401` when the session cookie is missing or invalid |
| `site/server.ts` | The same two routes for local Express dev, so the paths cannot drift |
| `site/src/components/AiAdvisor.tsx` | Lock screen, passcode entry, re-lock button, `401` re-lock handling |

**Behaviour**

- `ADVISOR_PASSCODE` unset → the endpoint **fails closed** with `503`. It never fails open.
- The HMAC secret is `ADVISOR_SECRET` if set, otherwise derived from the passcode — so **changing
  the passcode invalidates every existing session**.
- Session TTL 30 days; the cookie is `HttpOnly`, `SameSite=Lax`, and `Secure` in production.
- Prompt length capped at 1,000 characters (the same abuse vector).
- Timing-safe comparison on both the passcode and the token.

**Setup** — set `ADVISOR_PASSCODE` in `site/.env` locally and in the Vercel project's environment
variables for production. Optionally set `ADVISOR_SECRET` to a long random string.

**Still to do:** per-IP rate limiting and a daily spend ceiling (section 2a).

---

## Suggested order of work

| Phase | Work |
|---|---|
| **Now** | ✅ Auth gate on the advisor · ✅ section 1 generator bias + regression guard · ✅ "Live Data Engine" → "Simulated Data" · ✅ Zod-validate `/api/backtest` · ✅ ESPN cache headers · ✅ `check:market` wired into CI · ✅ debounce + abort the backtester (2d) · ✅ section 8 Spectrum metric split + `check:spectrum` in CI · ✅ section 9 canonical dataset + `gen:edges --check` in CI · ✅ dataset provenance fields + citation ratchet + `check:edges` in CI (section 9, Action 2.3) · purge the dead strategy controls (Action 2.4) · label the truncated ledger (2e) · rate-limit the advisor (2a) |
| **Next** | Client-side sim in a Web Worker (removes the API round-trip entirely) · lazy routes · URL-serialised strategy + share cards · Vitest |
| **Then** | Significance panel + Monte Carlo fan chart + staking grid · odds / vig / parlay calculators |
| **After** | CLV tracker (needs a DB) · real historical odds for one sport · Edge Audit · quiz |

---

## Assessment

The architecture is genuinely good — the `tools.ts` registry with shared `src/server/` modules
bridging Express and Vercel is clean, and adding a tool really is one entry plus one page. The
bottleneck was not structure; it was that the flagship tool's numbers were wrong. With section 1
fixed, the hub is ready to grow.
