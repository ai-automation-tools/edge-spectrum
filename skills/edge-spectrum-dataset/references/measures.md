# The three measures, and the guard that holds them

`site/scripts/check-spectrum.ts` is 162 lines and every block in it exists because something broke.
This is what each one is defending.

---

## 1. Why there are three

A held asset and a repeated wager do not have a common "return". Compounding 7% a year and losing
0.5% of bankroll 500 times a day are different quantities, and putting them on one axis labelled
"Expected Return" is what roadmap Action 2.1 was opened to fix.

| Measure | Applies to | Floored | Reads as |
|:---|:---|:---|:---|
| `returnOnCapital` | every row | **yes, at −100%** | what happened to the money you put in |
| `expectedTurnoverCost` | game rows only (`m: 'g'`) | **no, on purpose** | total expected loss across all turnover, unbounded |
| ruin point (`ruinDecisions`) / `decayYears90` | losing rows | n/a | *when* it ends, as a count or a horizon |

`returnOnCapital` is the primary axis. `expectedTurnoverCost` is a second, separate view.
The ruin markers annotate the first.

## 2. The invariants, in the order the script checks them

1. **`RAW.length` equals `totalRecords`** in `src/data/provenance-baseline.json`, and
   **`RUIN_FLOOR === -100`**. A record-count change only rewrites the baseline
   (`npm run check:edges -- --write-baseline`).
2. **Every row is well-formed for the measure its mode selects.** `m: 'i'` needs a finite `a`;
   `m: 'g'` needs finite `e`, `du`, `ced` with `du > 0` and `ced > 0` — *ruin is undefined
   otherwise*, which is why the bound is strict rather than `>= 0`.
3. **`returnOnCapital` never breaches −100%,** at any row, at any horizon. Delete the floor and
   this fails. This is the fix itself, under test.
4. **Some `expectedTurnoverCost` does pass −100%.** Stated as a failure when *none* does: if every
   turnover cost sits above the floor, someone floored it and erased the distinction.
5. **The floor and the ruin point agree, everywhere.** For each game row at each horizon,
   `returnOnCapital(r, h) <= RUIN_FLOOR` must equal `ruinDecisions(r) <= decisionCount(r.du, h)`.
   Any mismatch is reported per row — a chart and its annotations disagreeing is worse than either
   being wrong alone.
6. **Every losing row can say how it ends** — a ruin point or a 90% decay horizon, not neither.
7. **`"1du"` does not label a wager and a trading day identically.** The Audit D1 conflation: one
   decision unit is one hand for a game row and one trading day for an asset, and
   `rowHzLabel` must say so differently.
8. **Investing stays legible on the primary axis** — at the 10-year horizon the best investment
   must span **≥ 25%** of the plotted range. Under the old shared axis it was **2.83%**. This is
   the regression test for the squashed chart, and it is the one a well-meaning "let's use one
   scale" change trips.

## 3. The banner contract

The page has no build step, so the guard reaches into the HTML with `indexOf` and `eval`s what it
finds. Two section slices, in this exact form:

| Slice | From | To (exclusive) |
|:---|:---|:---|
| the math | `// MATH & CONSTANTS` | `// DATA INJECTION` |
| the data | `const RAW = [` | `\nconst AR_DEFAULT` |

`scripts/generate-edge-artifacts.ts` splices the data block on **the same two markers**. So those
four strings are a shared interface between two scripts and one HTML file that has no compiler
watching it.

Then it destructures, by name:

```
RAW, HZ, RUIN_FLOOR, decisionCount, expectedTurnoverCost,
returnOnCapital, ruinDecisions, decayYears90, rowHzLabel
```

Rename one of those in the page and the guard throws at load, before any assertion runs. Rename a
banner and it throws `no longer contains "…"`. **Neither failure looks like a data problem**, so
when `check:spectrum` dies before printing its record count, suspect a rename first.

## 4. Reading the output

A passing run prints the worst value of each measure, the number of floor/ruin disagreements
(must be 0), the 10-year investing share against its historical 2.83%, and a ruined-by-horizon
count per horizon. Those last two are the useful ones to eyeball after a data change — a jump in
"ruined by horizon" at a short horizon usually means a `du` or `ced` got an order of magnitude wrong.

## 5. If you are tempted to change a threshold

`EXPECTED_RECORDS`, `RUIN_FLOOR` and `MIN_INVESTING_SHARE` are the three constants. Only the first
should ever move, and only alongside the dataset. Lowering `MIN_INVESTING_SHARE` to make a build
pass is reverting Action 2.1 one percentage point at a time.
