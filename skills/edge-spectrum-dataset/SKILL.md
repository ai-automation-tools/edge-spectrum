---
name: edge-spectrum-dataset
description: >-
  Change, audit or debug the Edge Spectrum dataset — the canonical edge records in
  site/src/data/edges.ts, the five artifacts `npm run gen:edges` writes from it (the inlined RAW
  block in public/spectrum/index.html, edges.json, the published edges.csv and its datapackage.json,
  data/edge_dataset.md),
  and the guards that hold them: check:edges (count, categories, basis, the per-category citation
  ratchet and the dataset freeze) and
  check:spectrum (the three measures, read live out of the HTML). Use for "add/edit an edge record",
  "add a category", "update a return figure", "cite a source", "the dataset is frozen", "gen:edges --check failed in CI",
  "the artifact reverted my edit", "record count mismatch", "check:spectrum is failing", "ruin
  point", "return on capital vs expected turnover cost", "the chart is squashed flat", and any
  question about where this data actually lives.
---

# The dataset and its artifacts

**`site/src/data/edges.ts` is the only place these records are authored. Everything else that
holds them is generated.**

Editing an artifact by hand is reverted by the next `npm run gen:edges` and fails CI in the
meantime. That is the whole design: three hand-maintained copies used to drift, and the markdown
ended up 21 records behind — missing the entire Precious Metals and Insurance & Annuities
categories — because nothing compared them.

All commands run from **`site/`**.

---

## 1. The flow

```
site/src/data/edges.ts          ← the ONLY file you edit
        │  npm run gen:edges
        ├─→ site/public/spectrum/index.html   (the inlined `const RAW = [ … ]` block)
        ├─→ site/public/spectrum/edges.json   (the page's short keys, for the eventual React port)
        ├─→ site/public/spectrum/edges.csv    (the published dataset, CC BY 4.0)
        ├─→ site/public/spectrum/datapackage.json (its schema, version, sha256 and licence)
        └─→ data/edge_dataset.md              (the human-readable tables)
```

`edges.csv` is the public, stable shape: its columns are listed in `COLUMNS` in
`site/scripts/generate-edge-artifacts.ts`, and the data package's schema is built from the same
list, so a new `EdgeRecord` field that should be published is one entry there. Renaming or
dropping a column breaks people who download it; add, don't rename. Each `dataset-<version>`
GitHub release attaches the three public files; the version is the newest `asOf` plus the CSV's
short hash (`2026-11-12+1b93619d`).

`npm run gen:edges -- --check` is the CI form — it rewrites nothing and exits 1 listing every
drifted file. **Edit `edges.ts`, run `gen:edges`, commit every changed file together.**

`data/edge_analysis12.md`, the V12 catalog, is a **frozen archive, not an input** (the older ones were deleted on
2026-11-13; git history keeps them). Its horizon columns were computed
under the single-axis model retired on 2026-08-31 and nothing recomputes them. Do not sync it.

## 2. The record shape

Two variants, discriminated on `m`:

| | `m: 'i'` — held asset, **compounds** | `m: 'g'` — repeated wager, **linear** |
|:---|:---|:---|
| Carries | `a` — annual return, percent | `e` — edge per decision, percent (negative for every game here) |
| | | `du` — decisions per day at typical play |
| | | `ced` — capital exposed per decision, percent of bankroll |
| Both | `n` (unique name), `cat` (must be in `EDGE_CATEGORIES`), `ly` (`'raw' \| 'fee' \| 'tax'`), `basis`, optional citation | |

**Keep one unit per column.** `e` on a game row is the house edge **per bet made**, not per roll — five multi-roll craps bets once carried per-roll figures, so Place 5/9 read better than Pass Line.

**Only fields that carry information live here.** `type` is a pure function of `m`, so
`toSpectrumRow()` adds it for the visualizer rather than storing it on every record. If you find
yourself adding a field that is derivable, derive it in `toSpectrumRow` instead, and only if the
page reads it.

**`basis` is required:** `'math'` (follows from the rules and payouts: a −110 line, a roulette
wheel, a fixed prize table), `'published'` (a rate, price, index or takeout someone publishes) or
`'estimate'` (a typical outcome no one publishes as one figure: retail day trading, collectibles).

**A `math` row must cite** a `source` for its rules and a `methodology` that shows the derivation;
`check:edges` fails otherwise. A `math` row with a methodology is never badged **verify** on the
Spectrum page however old its `asOf`, because a figure that follows from the rules does not age
(`isStale` in the page, held by `check:spectrum`). When the source disagrees with the figure,
change the figure, not the citation, and say so in the changelog: on 2026-11-12, 13 of 59 did.

The citation (`source`, `asOf`, `window`, `methodology`) is optional and **ratcheted per
category**: `provenance-baseline.json` holds each category's `records` and `cited` counts, and
`check:edges` fails if a category's cited count goes *down*. Adding citations is always safe.
`--write-baseline` will not lower it; removing a citation means editing the baseline by hand and
saying why in the PR.

**The dataset freeze** (audit PROD-08): while any category cites a `source` for fewer than
`MIN_CITED_SHARE` (in `edges.ts`) of its rows, `--write-baseline` refuses a new record in **any**
category. `check:edges` ends by saying "growth frozen" or "growth open"; the coverage table in
`data/edge_dataset.md` shows which categories are short. While frozen, cite existing rows instead
(the coverage table shows which categories are short; a fund or index cites its issuer's NAV total return
since inception, with the window on the row). Never edit the baseline to get a row past it. Removing
a row that cannot be sourced is allowed.

Since 2026-11-12 every `math` and `published` row is cited, so the uncited rows are all `estimate`.
Citing one means finding a figure someone publishes for it, then changing its `basis` to
`published` along with the citation. An `estimate` row with only a loose supporting reference stays
`estimate`.

## 3. What the guards actually assert

| Guard | Holds |
|:---|:---|
| `npm run gen:edges -- --check` | all five artifacts byte-match a fresh generation (LF-normalised, so CRLF working trees pass) |
| `npm run check:market` | guards `dataGenerator.ts`'s simulated market hold — runs between `gen:edges --check` and `check:edges` in CI, but doesn't test the edge dataset itself |
| `npm run check:edges` | record count matches `provenance-baseline.json`; every category has ≥1 record and no record has an unlisted one; names unique; `a > -100`; `du > 0`; `0 < ced ≤ 100`; a valid `basis`; a `source` and `methodology` on every `math` row; per category, record count matches and cited count never falls; with `--write-baseline`, the freeze |
| `npm run check:spectrum` | the three measures — see [`references/measures.md`](references/measures.md) |

**The record count lives in one place:** `totalRecords` in `src/data/provenance-baseline.json`.
`check:edges`, `check:spectrum` and `check:spectrum-browser` all read it, and the `spectrum` tool's
blurb in `src/tools.ts` is built from `EDGES.length`. Never write the count as a literal in code or
in a skill.

## 4. Changing the record count

1. Edit `EDGES` in `site/src/data/edges.ts`. Adding a record only works while growth is open
   (see the freeze above); removing an uncited one always works.
2. `npm run gen:edges` — rewrites all five artifacts.
3. `npm run check:edges -- --write-baseline` — records the new `totalRecords` and per-category
   counts, which every check reads.
4. Update the count wherever prose states it, if anywhere (`README.md`, `AGENTS.md`).
5. `npm run check:edges && npm run check:spectrum` — then `npm run lint`.

A new **category** additionally needs the string added to `EDGE_CATEGORIES`, and at least one
record using it — an empty category fails `check:edges`.

## 5. The three measures are not interchangeable

This is the one piece of domain logic in the dataset, and it has already been got wrong once:

- **`returnOnCapital`** is the primary measure and is **floored at −100%**. Total capital loss is
  −100% by definition; `RUIN_FLOOR = -100` and `check:spectrum` fails if it moves.
- **`expectedTurnoverCost`** is the same loss left **deliberately unfloored** — it runs to
  −136,875% for slots, and that is the point. `check:spectrum` fails if *nothing* passes −100%,
  because that means someone floored it.
- **They must keep agreeing on `ruinPoint`.** For every game row at every horizon, "at the floor"
  and "past the ruin point" must be the same boolean. A disagreement means the chart and the ruin
  markers are telling different stories and one is lying.

> [!WARNING]
> **Never plot them on one axis.** That was roadmap Action 2.1: a −136,875% slot bar squashed every
> investment on the board to a flat line, the best investment occupying 2.83% of the 10-year span.
> `check:spectrum` now fails below a 25% share. If a change makes the chart "look better by using
> one scale", it is re-introducing the bug the guard exists for.

## 6. Editing the Spectrum page itself

`site/public/spectrum/index.html` is self-contained — Plotly is self-hosted beside it (`plotly-basic-4.2.0.min.js`), fonts come over CDN, math and data
inlined, **no build step.** So `check:spectrum` gets at it by string-slicing the file and `eval`ing
the result. That creates a contract in an unusual place:

- The banners **`// MATH & CONSTANTS`**, **`// DATA INJECTION`**, **`const RAW = [`** and
  **`const AR_DEFAULT`** are load-bearing. Renaming or reordering one breaks the guard with
  `no longer contains "…"`. `gen:edges` splices on the same two markers.
- The names the script destructures are equally load-bearing: `RAW`, `HZ`, `RUIN_FLOOR`,
  `decisionCount`, `expectedTurnoverCost`, `returnOnCapital`, `ruinDecisions`, `decayYears90`,
  `rowHzLabel`. Renaming any of them is a rename in two files.
- **The data stays inlined, on purpose.** Fetching `edges.json` instead would leave `check:spectrum`
  testing a file that no longer ships. `edges.json` exists for the future React port, not for the
  page.

## 7. Anti-patterns

- **Hand-editing `RAW`, `edges.json`, `edges.csv`, `datapackage.json` or `data/edge_dataset.md`.** Reverted by the next
  `gen:edges`; fails CI before that.
- **Committing `edges.ts` without the regenerated artifacts.** The PR goes red on `--check`.
- **Writing the record count as a literal.** It lives in `provenance-baseline.json`; everything else reads it.
- **Flooring `expectedTurnoverCost`,** or plotting it against `returnOnCapital` on one axis.
- **Renaming a section banner in `index.html`** while "tidying up".
- **Storing a derivable field on a record.** Derive it in `toSpectrumRow`.
- **Syncing `data/edge_analysis12.md`.** A frozen archive, computed under a retired model.
- **Dropping a `source` to "clean up" a record.** The ratchet only goes one way.

---

## Related

| For | See |
|:---|:---|
| The three measures, ruin point, and the banner contract in full | [`references/measures.md`](references/measures.md) |
| The DU/CED framework and ruin formulas | the repo's `docs/methodology.md` |
| Why the two measures are no longer on one axis | `docs/ideas/hub_improvement_plan.md` §8 |
| The `/spectrum` tile and hub registry | the `edge-spectrum-hub-tool` skill |
