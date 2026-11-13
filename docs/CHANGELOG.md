# Edge Spectrum — Change Log

---

## November 12, 2026 — CI on the current GitHub Actions majors

Roadmap Action 2.14b. Dependabot's first majors PR (#85) moved both workflows from `actions/checkout`
and `actions/setup-node` v4.4.0 to v7.0.1 and v7.1.0, still pinned by commit SHA. It was rebased onto
current `main` first, and CI's `check` job passed on the new versions. The Vercel preview could not
build that day (the Hobby plan's daily deploy limit); the PR changes no site file.

## November 12, 2026 — Opt-in page counts

From the 2026-11-11 project audit's long-term list (PROD-14), which says to learn whether the "Where
do I sit?" form is used before building the multi-activity audit (Action 6.4).

- **Nothing is counted unless the visitor accepts the org banner.** `site/public/counting.js` loads
  Vercel Web Analytics (cookieless, served from this site) only from `AILConsent.whenGranted`. A
  decline, Global Privacy Control, Do Not Track or no answer loads nothing, and withdrawing stops
  sending at once, without a reload.
- **Only the path leaves the browser.** Every URL is cut to its path first: the Spectrum page keeps a
  reader's bankroll, stake and edge in its query string.
- **Two steps are counted on the Spectrum page:** opening the form (`/spectrum/where-do-i-sit`) and
  placing a row (`/spectrum/where-do-i-sit/placed`), sent as page views because custom events need a
  paid Vercel plan.
- The Spectrum page now loads the consent banner and has a **Cookie settings** link in its footer. An
  embed (`?embed=1`) loads neither: a banner has no place inside someone else's page.
- Forks are unaffected: the consent script is dropped from a fork's build, so the counter never loads.
- `check:deployment` holds the gate: nothing before consent, no query string, nothing after a withdrawal.
- **Web Analytics was enabled on the Vercel project the same day.** Counting starts with the first
  production deploy after that; until then the script it loads answers 404 and nothing is sent.
- The home page's "no telemetry" line now says "page counts only if you opt in" (audit INT-11).

## November 12, 2026 — Historical line licences recorded

From the 2026-11-11 project audit's long-term list (PROD-12). Before any real historical lines go into
the backtester, the licences of 16 candidate datasets were read and recorded in `docs/UPSTREAMS.md`.
Only nflverse's NFL schedules (CC BY 4.0) could be committed and served, and even that has an open
question about where its lines come from. Every multi-season NBA, MLB and NHL set is either
personal-use only or scraped from sites that forbid it, whatever its label says. The owner decided
to keep every sport simulated, so Roadmap 7.1 is closed and no historical lines will be committed.

## November 12, 2026 — Ask the advisor about the dataset

From the 2026-11-11 project audit's long-term list (PROD-15).

- In full mode the advisor answers questions about the Edge Spectrum dataset ("how bad is roulette
  compared with keno?"). The question's words are matched against activity names and categories, by
  whole-word prefix so "NFL" does not find "Inflation", and up to 12 rows go into the prompt with their
  figure, basis, source and check date. The model is told to answer from them, name the sources, flag
  uncited estimates, and not state figures for activities that are not listed. A strategy question
  usually matches nothing and is asked as before.
- Demo mode is unchanged: it never calls the model.
- `check:deployment` asserts the rows and sources reach the model and that a strategy question
  carries none. One live call answered from the rows with their sources.

## November 12, 2026 — A second line source: The Odds API, with your own key

From the 2026-11-11 project audit's long-term list (INT-06).

- `npm run capture:lines -- --provider odds-api` reads lines from The Odds API with `ODDS_API_KEY`
  from `site/.env` (`--book draftkings` by default) and writes the same records as the ESPN collector,
  through the same phase rule and append-only files. `site/scripts/odds-api.ts` shapes its odds and
  scores like ESPN's parsed games; its multi-day board is filed by each game's Eastern date.
- The default is unchanged: ESPN, no key. The Cronsole templates still run the default.
- Its terms, read before writing this: storing the data for your own analysis is allowed;
  redistributing it as a raw data product is not. `docs/UPSTREAMS.md` has the row; `.env.example`
  documents the key; `check:lines` covers the mapping, the identical record shape, and that an error
  never prints the key.

## November 12, 2026 — The dataset version carries a content hash

The data package's `version` was the newest check date alone, so the second dataset change of
2026-11-12 shipped under the same version as the first. It is now that date plus the first 8
characters of the CSV's sha256 (`2026-11-12+1b93619d`), and the `dataset-2026-11-12` release carries
the current files.

## November 12, 2026 — 20 more rows sourced; prediction markets priced with measured spreads

From the 2026-11-11 project audit (PROD-07, INT-10). 218 of 239 records now cite a source (was 198);
27 figures moved.

- **20 `estimate` rows found a published figure** and are `published` now:
  - **Stock market:** stock picking 8.22 (the S&P 500 less Barber & Odean's 1.8-point gap; was −2,
    which read as an absolute loss the study does not show), penny stocks −30 → −3.7 (Ang, Shtauber &
    Tetlock), the S&P 500 after 2-and-20 4.0 → 6.42.
  - **Real estate and coins:** single-family portfolio 8.6 (Nareit), raw land 2.0 → 3.7 (USDA), house
    flipping −5 → −9.8 (ATTOM, at the midpoint of its quoted costs), timeshare −12 → −10 (ARDA), rental
    income after tax 4.73 → 3.36 (Jordà et al.), numismatic coins 1.5 → 1.4 (PCGS3000).
  - **Crypto:** stablecoin yield 5.0 → 4.47 (DefiLlama).
  - **Sports betting:** 2-team teaser −5 → −14 (Wizard of Odds), live betting −6.5 → −7.9, season win
    totals −8 → −4.32 and championship futures −12 → −17.6 (DraftKings boards), SGP −15 → −14
    (Colorado, all parlays), first touchdown −18 → −38.5 (Action Network), correct score −20 → −10.7
    (Reade et al.); the +2% CLV bettor (Buchdahl) and offshore binary options (ESMA) keep their figures.
  - **Bingo:** −25 → −23.88 (Minnesota).
- **Prediction markets now include the spread.** `npm run sample:spreads` measured each row's markets
  near 50c, weighted by 24-hour volume. Kalshi rows were fee-only and become −4.28 (weather) to −9.79
  (GDP); Polymarket rows swap the one published spread for their own category's: elections −3.03,
  geopolitics −1.59, Oscars −5.01. SCOTUS keeps the published spread: only two of its markets traded.
- **Still estimates (21):** rows where nothing publishes a figure that means the same thing: player
  props, micro-bets, the DeFi LP pairs, altcoins, meme coins, perps, options buying, short-term rentals,
  four poker rows, four collectibles, three insurance rows and two others. Each is listed in the
  coverage table of `data/edge_dataset.md`.

## November 12, 2026 — How much was luck: a fan chart and a season split

From the 2026-11-11 project audit's long-term list (PROD-13), roadmap Actions 4.2 and 4.3.

- **A Monte Carlo fan under the equity curve.** The engine draws the run's own wagers 1,000 times in
  random order (with replacement, seeded by the strategy so a run always draws the same fan) and
  returns the 5th, 25th, 50th, 75th and 95th percentile paths and the share of paths that run out of
  bankroll. The backtester's new **How much was luck** panel shades the 90% and 50% bands, draws the
  median, and says in a sentence where nine in ten outcomes land.
- **A walk-forward split.** Every run of two or more seasons is split by season, the first ~60% in
  sample and the rest out of sample, with bets, win rate and ROI for each and a line saying whether
  the ROI kept its sign.
- The panel is its own `lazy()` chunk, so the backtester stays under the 500 kB chunk budget. The
  largest run's response is 267 kB, under the 300 kB budget, and takes about 350 ms to compute.

## November 12, 2026 — Grade your bets against the close; sample prediction-market spreads

From the 2026-11-11 project audit's long-term list (PROD-10, INT-10).

- **`npm run grade:lines`** grades a CSV of your own bets against your own line archive: each game's
  `close` capture, the same one the daily digest uses. It reports how many bets beat the closing line,
  the EV of a moneyline (or a spread taken at the closing number) at the de-vigged closing price, the
  points gained on spreads and totals, and each result from the final. A game with no close capture
  is listed, never graded against a pre-game line. Local only (audit GOV-01): it reads your archive and
  writes a markdown report next to the CSV. `check:lines` holds it. Roadmap 5.4's site feature waits
  until the script is used.
- **`npm run sample:spreads`** samples the public Kalshi and Polymarket order books once, by hand, for
  the median half-spread of each prediction-market row's markets near 50c, weighted by 24-hour volume
  so idle 1c / 99c books do not swamp it. No feed and no key; the rows cite its output and date.

## November 12, 2026 — motion 14, lucide-react 1, dotenv 18

The last of roadmap Action 2.14's majors.

- **lucide-react 0.x → 1** dropped brand icons, `Github` among them, so the "View source" bar inlines
  the GitHub octicon, as the org's static sites do.
- **motion 12 → 14** added about 4 kB gzip to the first load, putting it at 148 of the 150 kB
  budget. `LazyMotion` now loads its animation features as their own chunk (motion's documented
  async form), so the home page's first-load JS is **132.2 kB**, down from 142.9 before this batch.
- **dotenv 17 → 18** needed nothing: `import 'dotenv/config'` in `server.ts` still exists; 18 drops
  the vault and `-r` preloading, which the repo never used.
- Roadmap Action 2.14 is done: every framework major is current, listed in `docs/UPSTREAMS.md`.

## November 12, 2026 — @google/genai 3

Roadmap Action 2.14, fourth of the batch: `@google/genai` 2 → 3. The breaking change that reaches
this repo is the default API version: the Gemini Developer API is now called at `v1`, not `v1beta`.
No code changed. One live advisor call on `v1` with the repo's system instruction and JSON response
schema returned a full analysis and two templates in 2.6 s; `check:deployment`'s stubbed Gemini
replies pass unchanged. 3.0 also needs Node 22, which CI and `engines` already require.

## November 12, 2026 — Express 5

Roadmap Action 2.14, third of the batch: Express 4 → 5 (and `@types/express` 5) for `site/server.ts`,
the local and self-hosted server; Vercel never runs it. The one change: the SPA fallback is
`app.get('/{*splat}')`, because Express 5's router no longer accepts a bare `*`. Checked in both
modes: dev (Vite middleware) and production (`npm run build && npm start`), where `/`, `/kelly`,
`/kelly/` and `/backtester` are 200, an unknown path is the 404 shell, static files and a missing
asset behave as before, and all four API routes answer as they did.

## November 12, 2026 — TypeScript 7

Roadmap Action 2.14, second of the batch: TypeScript 5.9 → 7.0, the native compiler. `npm run
lint` (`tsc --noEmit`) runs on it; the one new error was the `index.css` side-effect import, which
TypeScript now checks, so `src/vite-env.d.ts` declares `*.css` modules. Vercel's functions and Vite
do not use the project's TypeScript, and all four functions answered on the preview deployment.

## November 12, 2026 — Vite 8

Roadmap Action 2.14 (audit: toolchain majors), first of the batch: Vite 6 → 8 and
`@vitejs/plugin-react` 5 → 6. Vite 8 bundles with Rolldown; the build, every check and the dev
server (Vite in middleware mode under `server.ts`) pass unchanged. `vite.config.ts` imports
`./src/projectLinks.ts` with its extension, which the native config loader Vite plans to make the
default needs. The home page's JS fell from 147.1 to 142.9 kB gzip.

## November 12, 2026 — Embeds anywhere, a backtest CSV, a Kelly calculator, a shorter roadmap

From the 2026-11-11 project audit (INT-01, PROD-06, PROD-11, PROD-22).

- **The Spectrum embed can sit on other sites.** `?embed=1` on the Spectrum page no longer sends
  `X-Frame-Options: SAMEORIGIN` or `frame-ancestors 'self'`; every other route still does,
  `/backtester?embed=1` included. `check:deployment` replays `vercel.json`'s header rules.
- **The game log downloads every wager as CSV**, with the bankroll after each. The API still ships
  only the last 250, so the browser replays the same seeded run and refuses to download if its row
  count disagrees with the summary. `check:engine` and `check:spectrum-browser` hold it.
- **`/kelly`, the Kelly & Bankroll Sizing Calculator** (roadmap 6.3): one bet, or up to eight
  independent bets settled together, at full, half, quarter or tenth Kelly; growth per bet, bets to
  double, and Thorp's odds of the bankroll ever falling to 75%, 50% or 25%. The math is
  `site/src/kelly.ts`, held by `check:odds`.
- **Roadmap pruned:** the React port of the Spectrum page (4.6) and user accounts (7.2) are dropped,
  the export bundle (3.2) is shrunk to the CSV plus a `strategy.json`, and the quiz, share cards and
  regional variants (6.5, 6.7, 6.8) wait for the provenance programme.

## November 12, 2026 — The estimate rows sourced, and the dataset published

From the 2026-11-11 project audit (PROD-07, PROD-08, INT-07, GOV-03, PROD-16).

- **28 `estimate` rows found a published figure** and are `published` now; 198 of 239 records are
  cited (was 170) and no category is under 50%, so new records are allowed again.
  - **Prediction markets** use each venue's fee schedule at a 50c price: Kalshi −3.5, Polymarket −2.0
    to −5.5 (fee plus half the published median spread), PredictIt −10 → −5 (its 5% withdrawal fee is gone).
  - **Collectibles** use Knight Frank's luxury index and CKGSB's art index: fine art 5.0 → 1.9, wine
    4.0 → 2.98, classic cars 3.5 → 2.76, watches 3.0 → 9.06 (to 2023), NFTs −50 → −39.9.
  - **Insurance**: variable annuity 5.0 → 7.49 (S&P 500 less a 2.3% cost), FIA 3.5 → 3.23 (LIMRA),
    UL 3.0 → 4.19 (a gross crediting rate), whole life 3.5 → 4.5, and via policy loans 3.5 → 1.9.
  - **Poker and DFS**: skilled tournament players +2 → +9.8 (Levitt & Miles), DFS average −12 →
    −14.31 (Massachusetts Gaming Commission), DFS casual −20 → −51 (McKinsey), sit & go −15 → −7.
  - 11 estimates had no published figure and stay estimates, among them IUL, VUL, mid-stakes poker
    and sneaker reselling.
- **Metaculus Scientific is cut.** Metaculus is a forecasting site with no stakes, so a return per
  dollar staked doesn't exist.
- **The dataset is published.** `gen:edges` writes `site/public/spectrum/edges.csv` and a Frictionless
  `datapackage.json` with the schema, a version (the newest check date), sha256 hashes and the licence,
  CC BY 4.0. `gen:edges -- --check` covers both, the Spectrum footer links them, and each
  `dataset-<version>` GitHub release attaches them.
- `check:spectrum-browser` picks its undated example row from the data instead of naming one.

## November 12, 2026 — Every published row cited

From the 2026-11-11 project audit (PROD-07). The last 33 `published` rows cite a source read on
2026-11-12, so every `math` and `published` row is cited: 170 of 240 (was 137); 32 figures moved. Real Estate,
Cryptocurrency, Trading & Derivatives, Horse Racing and Lottery are over the 50% line; Collectibles,
Insurance & Annuities, Poker and Prediction Markets are not, because their uncited rows are estimates.

- **Real estate uses Nareit sector returns, 1994-2025**, as a listed proxy for direct ownership:
  Apartments 9.83, Industrial 10.12, Office 7.13, Shopping Centers 7.78. Single Family Home is the US
  housing total return from Jordà et al. (8.52); Home Sale After LTCG is Case-Shiller's price-only
  4.30, since an owner-occupier earns no rent and the exclusion covers a typical gain.
- **Crypto uses FRED's Coinbase prices over the 10 years to today**: Bitcoin 45.0 → 58.58, Ethereum
  10.0 → 70.02, Staked Ethereum adds Lido's 2.33%. The fee and tax rows follow.
- **Trading rows use issuer NAV since inception**: JEPI 7.0 → 11.18, DBMF 5.0 → 9.79, TQQQ 15.0 →
  41.02, SQQQ −60 → −52.21. PUTW became a different fund in 2025, so its row cites the Cboe
  PutWrite index (7.1).
- **Annuities and CDs**: the top 5-year MYGA as a compound rate (6.30), a SPIA quote's IRR over SSA
  life expectancy (4.92), 3-Month CD 4.30, No-Penalty CD 4.46.
- **Gambling rows use regulators and lottery reports**: Nevada statewide slot win 7.13 (was 8.0),
  Minnesota pull-tabs −13.96 (was −20), Michigan scratch-offs ($1 −40, $50 −20, average −23.93;
  were −25, −30, −35), New Hampshire keno −30.84 (was −40), Florida Fantasy 5 −43.23 and Lotto
  −50, NYRA takeout for the ADW-rebate (−10.5) and Pick 4 (−24) rows.
- Two row names now read oddly against their figures: "$1 Scratch-Off Best Odds" is the worst-paying
  scratch-off, and "Slots Average 92%" is 92.9%. They are kept because names are the keys in shared
  `?cmp=` links.

## November 12, 2026 — Stock, bond, cash and metals rows cited

From the 2026-11-11 project audit (PROD-07). 52 `published` rows in four categories now cite a
source read on 2026-11-12; 137 of 240 records are cited (was 85). Stock Market, Cash & Savings,
Bonds and Precious Metals are all over the 50% line now.

- **Funds and indexes use the issuer's NAV total return since inception**, with the window on each
  row. Windows differ by fund, so rows that start near the 2000 peak read low; the methodology gives
  the 10-year figure where it differs sharply.
- **35 figures changed** to match their source. The largest moves: Convertible Bonds 5.0 → 11.44,
  Emerging Markets 4.0 → 9.94, Nasdaq 100 12.5 → 10.57, S&P 500 Growth 12.0 → 8.92, Private Credit /
  BDC 9.0 → 6.38, US Treasury Bills 4.3 → 1.40 (since 2007; the old figure was today's yield),
  TIPS 1.5 → 3.34, Silver 4.5 → 7.64, Platinum 2.0 → 0.01, and the 2- and 5-year CDs 3.8 / 3.5 →
  4.80 / 5.00 (today's top rates). The DAX, Nikkei 225 and FTSE 100 are in local currency.
- **Fee and tax rows follow their base row**: the bond fee and tax rows, muni, Treasury after tax,
  gold miners after tax. "Qualified Dividends (SPYD) After 15% Tax" now taxes only the
  distribution (8.81 − 0.15 × 4.12 = 8.19%) instead of the whole return.
- Two rows stay uncited: 3-Month CD (no current top-rate page) and No-Penalty CD (the page dates its
  rates two ways).

## November 12, 2026 — One command for every check, an API reference, and contributor files

From the 2026-11-11 project audit (DOC-15, DOC-16, DOC-17).

- **`npm run verify`** runs every check CI runs, in CI's order, and CI now calls it: the ordered list
  lives only in `site/package.json`. What each check holds is listed once, in `docs/README.md`;
  `README.md` and `AGENTS.md` point there instead of keeping their own lists.
- **`docs/api.md`** documents the five method and path pairs under `/api/`: body, response, status
  codes, auth and cache headers.
- **`CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`**, a pull-request template, and bug-report and
  dataset-correction issue forms. A correction needs a source.
- The docs index no longer says the diagram is drift-checked in CI (that step went in the previous entry).

## November 12, 2026 — A registry skill, and job prompts that match the repo

From the 2026-11-11 project audit (AI-07, AI-09, AI-10, AI-15).

- A fourth project skill, `edge-spectrum-registry`, covers the Cronsole templates, the line
  capture and digest scripts, and the registry-drift check; `AGENTS.md` lists it. The other three
  skills now describe the code after the audit fixes (agent-skills #104).
- The weekly roadmap, content and upstream jobs verify by running every `npm run` step in
  `.github/workflows/ci.yml` instead of a shorter list, read the project skill their work touches,
  and no longer cite PR #46, a `Versions/` folder or CDN Plotly. The roadmap job no longer
  installs packages into the shared `site/node_modules`.

## November 12, 2026 — Every math row cited, and none of them ages

From the 2026-11-11 project audit (PROD-07 steps 2 and 3, OPS-04, OPS-08).

- All 59 `math` records now cite the rules they follow from and say how the figure is derived;
  35 had no source. 85 of 240 records cite a source (was 50).
- **Thirteen figures changed** to match their source. Parlays are now priced at true odds from
  −110 legs, as online books and the `/parlay` calculator price them: 2 to 10 legs read −8.88,
  −13.03, −16.98, −20.75, −24.36, −31.08 and −37.20% (the old values mixed fixed parlay-card
  payouts with true odds). Blackjack 3:2 −0.43 and 6:5 −1.82 (Atlantic City rules), Pai Gow Poker
  −2.51, Three Card Poker −3.37, Let It Ride −3.51, Caribbean Stud −5.22, Big Six −11.11 (the
  $1 symbol), Keno 4-spot −25.94 and 10-spot −27.71 (Tropicana Atlantic City tables),
  Powerball / Mega Millions −50 and Cash4Life −45 (prize-fund share of sales; Cash4Life ended
  2026-02-21).
- "Moneyline (Standard Juice)" is now "Pick'em Moneyline (−110)": only a pick'em is priced at −110
  on both sides.
- The Spectrum page no longer badges a `math` row **verify** once it carries a methodology: a
  rule-derived figure does not age. `check:edges` requires a source and a methodology on every
  `math` row, and `check:spectrum` fails if the page would badge one.
- `docs/UPSTREAMS.md` quotes framework majors beside the registry's latest instead of patch ranges
  Dependabot moved weekly (it still said zod 3).
- CI drops the *Diagram drift* warning step: weekly data edits kept it warning on nearly every run.
  The weekly `--check` and the org upkeep re-pin remain.

## November 12, 2026 — A per-category citation ratchet, and a dataset freeze

From the 2026-11-11 project audit (PROD-07, PROD-08).

- Every record in `site/src/data/edges.ts` declares a `basis`: `math` (follows from the rules and
  payouts), `published` (a rate, price, index or takeout someone publishes) or `estimate`.
  59, 108 and 73 records today.
- `provenance-baseline.json` now holds each category's record and cited counts, and
  `check:edges` fails if any category's cited count falls. The one global count it replaces let
  new cited casino rows hide uncited rows elsewhere.
- **The dataset is frozen:** `check:edges -- --write-baseline` refuses a new record while any
  category cites under half its rows (`MIN_CITED_SHARE`). 13 of 15 categories are under it.
- `data/edge_dataset.md` gains a coverage table and a basis and cited column on every row.
- The weekly content job cites existing rows instead of adding new ones while the freeze holds.

## November 12, 2026 — The record count lives in one place

From the 2026-11-11 project audit (AI-08).

- `check:spectrum` and `check:spectrum-browser` read `totalRecords` from
  `src/data/provenance-baseline.json` instead of each pinning 240. The Spectrum tool's blurb in
  `src/tools.ts` counts `EDGES` and `EDGE_CATEGORIES` itself.
- Adding a record now touches `edges.ts`, the files `gen:edges` writes, and the baseline that
  `npm run check:edges -- --write-baseline` records; no check script.
- The Edge Spectrum skills in agent-skills drop their pinned "234 records" and bundle size
  (agent-skills #102).

## November 12, 2026 — A fork's build no longer points at the original site

From the 2026-11-11 project audit (PROD-04).

- **Which repo is building.** `site/vite.config.ts` reads it from Vercel's build env, or from
  `git remote` elsewhere. The original's site and org URLs, now kept in `src/projectLinks.ts`, apply
  only to `ai-automation-tools/edge-spectrum`.
- **A fork's build** has no canonical URL, `og:url`, share image or sitemap entries naming the
  original, no org consent script, and no org, cookie-notice or Cronsole-gallery links in the footer,
  the palette or the home page. `EDGE_SPECTRUM_SITE_URL` points the canonical URL, sitemap,
  `robots.txt` and share image at the fork's own address.
- **The original** builds exactly as before.
- **Guide.** `docs/self-hosting.md` has an *After you fork* list of the files a fork edits itself.
- **Check.** `npm run check:fork`, in CI, builds as a fork twice: once with no address, where no output
  file may name the org domain, and once with its own. All ten of its cases failed on the old code.

## November 12, 2026 — Cleanup: unused dependencies, AI Studio leftovers and dead code removed

From the 2026-11-11 project audit (ARCH-04, ARCH-05, ARCH-07). No change in what the tools compute.

- **Dependencies (ARCH-04).** `d3`, `@types/d3` and `autoprefixer` had no importer and are
  uninstalled; `vite` is listed once, under `dependencies`. The `clean` script (`rm -rf`, and a
  `server.js` that no longer exists) is gone.
- **Leftovers (ARCH-05).** `vite.config.ts` loses the `DISABLE_HMR` switch, its garbled comment and
  the unused `@/` alias; `tsconfig.json` loses the decorator flags and the alias.
- **Dead code (ARCH-07).** The generator's `isPlayoff`, `starHomeInjured` and `starAwayInjured`
  fields (never read), its copy of the American-to-decimal conversion (it now uses `odds.ts`) and
  23 unused imports are removed, and `tsconfig.json` sets `noUnusedLocals` and `noUnusedParameters`
  so they stay out. The calculators keep their row counter per page instead of in a module
  variable. The game log's filter gains the Push button its state already allowed.
- **Spectrum data.** The rows lose `g`, `vol`, `wp` and `sk`, which the page never read: the page
  drops from 148,722 to 132,106 bytes and `edges.json` shrinks with it.

## November 12, 2026 — Accessibility: the palette, the game log, states, charts, calculator errors and the help-line notice

From the 2026-11-11 project audit (UX-05, UX-06, UX-11, UX-12, UX-13, UX-16, UX-19).

- **Command palette (UX-05).** A native modal `<dialog>`: Tab stays inside, Escape or a click
  outside closes it, focus goes back to whatever opened it, and the page behind does not scroll.
  The search box is a combobox over a listbox, so arrowing announces the option.
- **Game log (UX-06).** 25 rows a page with Previous and Next, newest first. Date, Net Return and
  Status sort and say so with `aria-sort`. On a phone the advisor now comes before the chart and
  the log instead of 17,000px down.
- **States (UX-11).** The game-log filter and the scoreboard's sport buttons are pressed buttons;
  the workspace tabs follow the tab pattern (arrow keys, a labelled panel); the topbar marks the
  current page.
- **Announcements (UX-12).** A finished backtest is read out in one sentence; the scoreboard's
  loading state is a status and its error an alert.
- **Charts (UX-13).** The equity curve has a written summary under it (where it ends, its low and
  high). The hero strip and both Spectrum charts are named images that describe the current view
  and point to the list, search and CSV that carry the numbers.
- **Calculators (UX-16).** A bad price says why under its field, tied with `aria-describedby`, and
  a line says why the results are missing. A typographic minus (−110) is a minus, and prices past
  +1,000,000 are refused, which stops a typo setting a −124,999,999,912% parlay hold.
- **Help-line notice (UX-19).** "18+ (21+ where you live)" and two help lines sit under the
  heading of the backtester, both calculators and the Spectrum page. Help-line links are
  underlined everywhere, and the footer notice is larger and brighter.
- **Checks.** `check:spectrum-browser` section 10 drives each of these; `check:odds` holds the
  minus, the cap and the messages.

## November 12, 2026 — Roadmap: Spectrum form fixes recorded, next item named

Docs only.

- The *Audit follow-ups* section counts seven shipped items of the audit's 60-day list, now including
  the Spectrum form and label fixes (#92), and names the next one: accessibility depth.

## November 12, 2026 — Spectrum: the "Where do I sit?" form keeps its values, and a row name is text

From the 2026-11-11 project audit (BUG-25, BUG-33).

- **Form (BUG-25).** Hovering a bar, a Play tick, a search or a filter redrew the inspector and
  rebuilt the open form, wiping what the reader had typed. An open form is now left alone until it
  is submitted or cancelled. Arrow keys in its "Start from a game" list no longer step the horizon.
- **Row name (BUG-33).** The name a reader gives their row, which a shared link carries, went into
  the chart's bar label as Plotly markup, so `<a href=…>` made a link. It is escaped now and shows as
  written. `esc` now writes a double quote as `&#34;`: Plotly decodes numeric entities but not `&quot;`.
- **Check** `check:spectrum-browser` fills the form, hovers a bar, plays one tick and presses an
  arrow in the list, then loads a link whose name is a link tag. All five cases failed on the old page.

## November 12, 2026 — Roadmap: audit follow-ups brought up to date

Docs only.

- The *Audit follow-ups* section of the roadmap says what has shipped: the first six items of the
  audit's 60-day list, in pull requests #87 to #90.
- **Code scanning (SEC-11)** ticked: the list has no open alerts now that the fixes are on `main`.
- **New item:** late finals in the line archive, the half of BUG-32 that still needs two days of real
  captures to confirm.

## November 12, 2026 — Nine small bugs: the backtester form, the odds parser, line capture

From the 2026-11-11 project audit (BUG-06, BUG-16, BUG-20, BUG-21, BUG-22, BUG-23, BUG-24, BUG-32, BUG-34).

- **Backtester form**
  - *Streak filter on totals (BUG-06).* A total backs no team, so the filter did nothing and the run
    came back unfiltered under a filtered label. The API now answers 400 for that combination, the
    form hides the control on a totals bet, and a share link or an advisor template carrying one is
    reset to "any".
  - *Min above max (BUG-16).* The form says which range is inverted, marks the field and does not send
    the request; Execute is disabled until it is fixed. The form and the schema share one rule,
    `rangeIssues`, so they cannot drift.
  - *Stale result (BUG-20).* A failed run takes the previous numbers off the screen instead of leaving
    them under the error.
- **Odds calculators**
  - *Parser (BUG-21).* Only a plain number is a price. `0/5`, `0x64`, `1e3` and `1+1+0` used to
    parse (the last as +110); they are now rejected. One leading `+` and, for a percentage, one
    trailing `%` are still accepted.
  - *Power de-vig (BUG-22).* The search for the exponent had a fixed upper bound of 50, so two sides
    at 1.01 came back summing to 1.216. The bound is now found, and every method sums to 1 on a grid
    of markets from 1.01 to 1001.
- **Line capture and digest** (`capture:lines`, `digest:lines`)
  - *One opener per game (BUG-32).* "Seen" is keyed by event across the sport's last 8 day files. ESPN
    lists an NFL week under a new date each day, so a game used to get a fresh `open` record, and a
    stale final a fresh copy, in every day's file. The digest follows a day's games into the files
    around it, so it still finds the opener and the final. **Existing archives:** games already in
    earlier files get no new `open` from now on; old duplicate openers stay as written.
  - *Damaged files (BUG-23).* A line that does not parse is skipped and counted in a warning, in both
    scripts. The next append starts on a new line instead of joining the broken one.
  - *Undated games (BUG-24).* A game with no usable start time is skipped with a warning, never
    written with a null `minutesToStart`.
  - *File name (BUG-34).* The day in the file name is ESPN's only when it is a date; anything else
    falls back to the capture date.
- **Not settled** Whether a game that ends after ESPN's board has moved to the next day is still
  listed there, and so gets its final captured, needs two consecutive days of real captures to
  confirm (the rest of BUG-32).
- **Checks** `check:lines`, `check:odds` and `check:strategy-url` have a case for each of the above;
  `check:spectrum-browser` now also drives the backtester form for the three that only show in a
  browser.

## November 12, 2026 — The backtest engine picks a side once, and spread favourites lay points

From the 2026-11-11 project audit (ARCH-02, BUG-26).

- **Backtest numbers change for favourite and underdog selections.** A spread favourite is now the side
  with the negative line. It was the side with the shorter moneyline, which on a near pick'em could be
  the team getting points: a "favourites" spread run could include a bet at +0.5. A moneyline bet still
  reads the prices, and a game with level prices has no favourite: favourite and underdog selections
  skip it, where they used to treat the away team as the favourite. Home, away, streak, rest and totals
  selections are unchanged.
- **Engine structure** `runBacktest` no longer has one branch per selection per bet type. `selectSide`
  returns the side, `priceAndGrade` prices and settles it in one place, and `passesFilters` applies the
  ranges. The side is no longer recovered from the bet's display text. `dataGenerator.ts` is 81 lines
  shorter.
- **How it was checked** Before the favourite change, the refactored engine's full response was
  byte-identical to the old one on 276 strategies (every sport, bet type and selection, plus the streak,
  odds and line filters). After it, only favourite and underdog selections differ.
- **Checks** `check:engine` reads 8,000 ledger rows back and fails if a favourite spread bet is not
  laying points or a moneyline favourite is not the shorter price. It fails on the old engine.

## November 12, 2026 — TypeScript `strict`

From the 2026-11-11 project audit (ARCH-01).

- **`strict: true`** in `site/tsconfig.json`. It surfaced 15 errors at five sites, all fixed; none was a
  runtime bug.
- **Workarounds removed** `validateStrategy` uses `safeParse` and returns a discriminated union, so the
  `parse`/`catch` and the `as Strategy` cast are gone and the schema's output is now checked against
  `Strategy` by the compiler.
- **`react-dom/client`** had no types (the build never noticed without `strict`). A five-line
  declaration covers the one call the app makes; no dependency was added.

## November 12, 2026 — The ESPN scoreboard panel grades what it says it grades

From the 2026-11-11 project audit (BUG-17, BUG-31, BUG-15, BUG-28, BUG-35).

- **Grading** moved out of the component into one pure function, `site/src/liveGrading.ts`. Spread bets
  on home, away and the four home/away favourite/underdog combinations are now graded (only
  favourites and underdogs were). The spread, total and odds ranges are applied where the scoreboard
  has the number.
- **Not evaluated, and it says so** Streak and rest selections, the streak filter, and an odds range on
  a total used to show *No Trigger*. They now show *Not evaluated* with the reason: the scoreboard
  carries no streaks, rest days or total prices.
- **Favourite** comes from the sign of the home spread, then the moneyline. It used to be a substring
  match on team abbreviations, which called `SA` the favourite on a `SAC -3.5` line.
- **Finished** means ESPN's `completed` flag, so an overtime final is graded and a postponed game is
  not. A score ESPN does not send is `null` and shows as a dash; it used to become 0 or `NaN`.
- **Date label** is built in local time: it was a day early for anyone west of Greenwich. The day
  arrows have accessible names.
- **Stale responses** A slow answer for an earlier sport or day is aborted and can no longer replace a
  newer one. The panel shows the proxy's own error message.
- **Copy** The panel no longer claims real-time forward testing; it states what is graded and that the
  line shown may not be the closing line.
- **Checks** New `npm run check:live-grading`, in CI.

## November 12, 2026 — Audit fixes, second batch: speed, advisor limits, accessibility, hardening

From the 2026-11-11 project audit (30-day items).

- **Speed** The home page loads 138 kB gzip of JavaScript instead of 324 kB: each tool page and the
  markdown parser are separate chunks and the fade-in uses the slim motion build. The largest backtest
  response drops from 2.98 MB to about 250 kB: the equity curve ships at most 1,500 points, keeping
  each slice's low and high. Fonts load from a `<link>`, not a CSS `@import`.
- **Advisor** `ADVISOR_SECRET` is now **required** in full mode; without it the advisor answers 503
  (self-hosters who set only a passcode must add it). 10 calls an hour per session and per address,
  `ADVISOR_DAILY_LIMIT` (default 200) a day, a 20 s model timeout, an output cap and a 7-day session.
  The model's reply is validated on the server: an unreadable reply is a 502 with a plain message, and
  a suggested template the backtester would reject is dropped. Limits live in process memory.
- **Lockout** Failed passcodes also count across all clients, and forwarding headers are trusted only on
  Vercel or with `TRUST_PROXY=1`, so a new `X-Forwarded-For` per guess no longer dodges it.
- **Accessibility** No text under 4.5:1 in either theme on any page (muted greys lightened, the primary
  button and the Spectrum page's pressed buttons and footer fixed, an 11px floor on the Spectrum page).
  Nothing scrolls sideways at 320 px. Each route has its own title and description and moves focus to
  its heading. A render error shows a message instead of a blank page.
- **Site** Unknown paths are a real 404 with a not-found page (they used to return the home page with
  a 200). Added `robots.txt`, `sitemap.xml`, a share image and metadata for the Spectrum page.
- **Hardening** `Permissions-Policy`, and a full Content-Security-Policy in **report-only** mode: zero
  violations across every page and theme locally. Enforcing it is a later, one-line change.
- **Operations** The daily workflow also runs after each production deploy and checks the live site:
  routes, 404s, the dataset, a backtest, and that the public demo is still in demo mode. Rollback steps
  are in `docs/self-hosting.md`; `AGENTS.md` names merge-to-main as the only deploy path.
- **ESPN** README, both Cronsole templates and `UPSTREAMS.md` state that the ESPN endpoint is unofficial,
  that the collector is for personal low-volume use, and that this project does not publish captured lines.
- **Checks** New `check:bundle`; `check:engine` holds the response budget; `check:deployment` covers the
  advisor limits, the lockout and reply validation through the real handler with a stubbed model.
- **Code scanning** The four open alerts on `main` go away in code: the session-signing key is no
  longer derived from the passcode, the passcode is compared in constant time without hashing it, and
  the Node server reads the page shell once instead of on every request.
- **Roadmap** Actions 2.7 and 4.5 are ticked, the CSP and SEO items carry what is left, and a new
  *Audit follow-ups* group lists the audit's remaining work as checkable items.

## November 12, 2026 — Audit fixes, first batch: engine, form, API input, docs

From the 2026-11-11 project audit (immediate and 7-day items).

- **Engine** Seasons are generated in date order, so rest days are never negative and a team's streak
  describes the games it has already played; a team plays at most once a day. A win after losses
  starts a streak at +1 and a loss after wins at −1 (it used to drift toward zero). **Backtest
  numbers change**: the rest and streak selections and the streak filter now test what they say.
- **Engine** A run stops when the bankroll cannot cover the next stake. The summary carries
  `bustedAtBet` and `bustedOn`, and the dashboard says so. Final bankroll is never negative and
  drawdown never passes 100%; drawdown % is measured against the peak in force at the time.
- **Form** Bankroll and unit size can be cleared and retyped (typing 250 no longer gives 1250), with a
  hint when a value is out of range. Presets replace the strategy instead of merging onto the last
  one. Every field on `/backtester`, `/odds` and `/parlay` has an accessible name. The spread and
  totals note no longer claims flat −110 pricing.
- **API** `/api/espn-scoreboard` answers 400 for a malformed date, a repeated parameter or an unknown
  sport (which used to return NFL data under the caller's label) and 504 when ESPN stalls past 8 s.
  `/api/backtest` answers 400 for malformed JSON. Both routes' input handling moved into
  `src/server/` (`backtestRoute`, `espnScoreboardRoute`).
- **Advisor** The model id is `GEMINI_MODEL`, defaulting to `gemini-3.5-flash-lite`: Google routes
  `gemini-2.5-flash` there from 2026-12-01 (deprecations page read 2026-11-12). The five invented
  progress lines are one neutral line, the prompts no longer ask for "profitable" strategies, and the
  leftover `aistudio-build` User-Agent is gone. Not exercised against a live key.
- **Checks** New `npm run check:engine` (in CI): date order, rest, streak replay, bust and drawdown.
  `check:deployment` covers the 400s, the 405 and the ESPN timeout.
- **CI** Actions are pinned to commit SHAs; Dependabot now raises Actions majors.
- **Docs** 15 categories, 26 seasons, four functions, Node 22 or 24 (also in the Cronsole templates),
  no hard-coded record counts in `data-architecture.md`, and its `check:edges` section lists what the
  script asserts. The README's Dollar Cost bullet described a control the page does not have.

## November 11, 2026 — Three more casino rows (237 → 240 records)

- **Data** Added **Craps Lay 4 / Lay 10 (Commission on Win)** (−1.67%), **Craps Hard 4 / Hard 10** (−11.11%) and **Pai Gow Poker Emperor's Challenge** (−4.17%), all in Casino Gambling. Sources: Wizard of Odds' craps house edge table (`/games/craps/appendix/2/`, per bet resolved) and its Pai Gow Poker side-bet appendix (`/games/pai-gow-poker/appendix/3/`), both read 2026-11-11. Record count and cited count in the baseline move to 240 and 50.

## November 11, 2026 — Roadmap rechecked against the org's 2026-11 requirements

- **Roadmap** `docs/ROADMAP.md` rechecked against the org's 2026-11 requirements. The intro names the job that works it (`edge-spectrum-roadmap`) instead of a disabled task and its day. Action 2.7 is split: the code half stays (now also requiring `ADVISOR_SECRET`), and the Gemini quota and the Vercel secret are Action 2.7b (🔒 Needs owner). The CI action-pin step of 2.14 is its own owner line, 2.14b. Action 5.3's done-when names its Cronsole template. New *Site upkeep* group: a build stamp, ROADMAP in the Read on card, a full CSP, and trimming the topics (🔒).

## November 9, 2026 — Payoff shape for positive-edge rows (Action 2.13)

- **Data** `GameEdge` gains an optional `payout`, the average net win per unit staked (`pay` on the page). **Poker Skilled Tournaments** takes `5.7`: tournaments pay about the top 15% of the field (2023 WSOP Main Event, 1,507 of 10,043), so a cash averages about 6.7× the buy-in. Every other row stays at even money.
- **Math** `ruinRisk` solves the general flat-stake ruin equation `p·z^(b+1) − z + q = 0` instead of assuming even money, and `kellyMultiple` is `ced·b/e`. The tournament row's chance of going broke moves from 67.0% to **93.3%** and its stake from 5× to **28.5×** Kelly; the even-money rows are unchanged.
- **Inspector** The ruin box shows the Kelly stake as `e/b` and says which payoff it assumed, and that an average cash understates the real spread of prizes.
- **Checks** `check:spectrum` asserts the ruin root solves the payoff equation, `b = 1` reproduces the closed form, and a longer payoff carries more risk; `check:edges` asserts the implied win rate is a probability. Formulas in `docs/methodology.md` Metric D.
## November 10, 2026 — Daily line-movement digest

- **Digest** `site/scripts/digest-lines.ts` (`npm run digest:lines -- --archive <folder> [--date <day>]`)
  reads one day of the line archive and writes `<archive>/digests/<day>.md`: per game, the opening and
  closing spread, total and home moneyline, the final score, and the gaps (no opening, no close, no
  pre-game capture, no final yet, no odds posted), plus the five biggest spread moves. A game with no
  `close` capture shows its last pre-game line marked `*` and is never counted as a move. A day with no
  capture file for any sport exits 1 (`LINE_DIGEST_EMPTY`): the capture did not run.
- **Cronsole catalog** New template `edge-spectrum-line-digest` (daily, 12:30 UTC). The pack is renamed
  *Edge Spectrum: Line Archive* and holds both templates; the home page's *Schedule it* section lists the
  new one automatically.
- **Checks** `npm run check:lines` also checks the digest on a hand-built day: the nearer of two closes
  wins, a missing close is a gap and not a move, and each gap is named.

---

## November 10, 2026 — ESPN line capture, schedulable from Cronsole

- **Collector** `site/scripts/capture-lines.ts` (`npm run capture:lines -- --out <folder>`) snapshots ESPN's
  public scoreboard for NFL, NBA, MLB and NHL and appends one JSON line per game to
  `<folder>/<SPORT>/<day>.jsonl`: spread and its prices, total, moneyline, scores, and a `linePhase` of
  `open`, `midday` or `close` (`null` once a game has started). Append-only, no keys. Roadmap Actions
  5.1 (local JSONL as the store) and 5.2.
- **ESPN parser** `parseEspnScoreboard` is split out of `fetchEspnScoreboard` so the collector reads ESPN
  the same way the live feed does, and the feed's games now also carry `state`, the bookmaker, both
  moneylines and both spread prices. A pick'em spread now reads `0` instead of `null`.
- **Cronsole catalog** `npm run build:registry` generates a Registry v1 template
  (`edge-spectrum-line-capture`, every 3 hours) and pack (`edge-spectrum`) into `site/public/registry/`,
  served at `/registry/` with `Access-Control-Allow-Origin: *` so the
  [Cronsole gallery](https://cronsole.ai-automation-tools.dev/#/t/edge-spectrum-line-capture) can list it.
  CI runs `check:lines` and `build:registry -- --check`; a daily *Registry drift* workflow checks the
  served copy against `main`.
- **Home page** A *Schedule it* section lists the templates, read live from `/registry/index.json` so it
  cannot drift from the gallery. Each card has *Get it for Cronsole* (the template in the gallery) and
  *Template JSON*; the note links the whole `edge-spectrum` collection.

---

## November 4, 2026 — Three more casino table games

- **Dataset** `Four Card Poker Ante` (−2.79%), `Four Card Poker Aces Up` (−3.89%) and `Mississippi Stud` (−4.91%),
  cited to the Wizard of Odds game pages; all figures are house edge on the Ante (or the side bet) under optimal
  strategy. Dataset is now 237 records, 47 cited.

---
## November 10, 2026 — Hub data-flow diagram re-pinned

- **Docs** `docs/diagrams/hub-data-flow.json` re-read against `site/src/data/edges.ts`, `site/src/tools.ts` and `site/public/spectrum/index.html` after the three casino table-game records. The `edges.ts` node now says 237 edge records (was 234), the Spectrum page node's related-tools range is 1168-1187, and the diagram is rebuilt with `--pin-head` (org upkeep).

## November 7, 2026 — Hub data-flow diagram re-pinned

- **Docs** `docs/diagrams/hub-data-flow.json` re-read against `site/src/data/edges.ts`, `site/src/tools.ts` and `site/public/spectrum/index.html` after the craps and Plotly changes. The `edges.ts` node now says 234 edge records (was 231), the Spectrum page node's related-tools range moved to lines 1168-1179, and the diagram is rebuilt with `--pin-head` (org upkeep).

## November 3, 2026 — Craps rows on one convention: house edge per bet made

- **Data** Five multi-roll craps bets carried Wizard of Odds **per-roll** figures under a "house edge per bet made" methodology, so Place 5/9 (−1.11%) read better than Pass Line (−1.41%). They now use the per-bet-made figures, like Pass Line and Don't Pass: Place 6/8 −0.46% → **−1.52%**, Place 5/9 −1.11% → **−4.00%**, Place 4/10 −1.67% → **−6.67%**, Big 6/8 −2.78% → **−9.09%**, Hard 6/8 −2.78% → **−9.09%**. Field, Any Craps and Any Seven settle in one roll, so per roll and per bet are the same and they are unchanged. Regenerated `edges.json`, the Spectrum page and `data/edge_dataset.md` with `npm run gen:edges`. Flagged by the org PR sweep on #67.

## November 2, 2026 — Spectrum page on Plotly 4.2.0

- **Spectrum** `site/public/spectrum/index.html` loads `plotly-basic-4.2.0.min.js` (npm `plotly.js-basic-dist-min@4.2.0`)
  instead of the 2.32.0 build, two majors behind. No page code changed: the 3.0 and 4.0 breaking changes (colour
  parsing, string titles, Chart Studio config, the modebar's new cloud button) touch nothing the page uses (roadmap Action 2.8).
- **Verified** by rendering both builds in both themes across both measures, category colouring, real returns and
  the compare chart: same bars, ticks and fills, no console errors, and a pixel diff that only moves dark-mode text by 1–3 px.

---

## October 31, 2026 — Roadmap sweep: Zod noted

- **Roadmap** Action 2.14 records that Zod 3 → 4 already landed on 2026-10-27 (Dependabot #63, `site` on `zod ^4.6.6`, CI green). The item stays open for Vite, TypeScript, Express, motion, dotenv and lucide-react.

## October 31, 2026 — Hub data-flow diagram re-pinned

- **Diagram** `docs/diagrams/hub-data-flow.json` re-read against `espn.ts` (date check), `advisor.ts` (clipped strategy fields) and the Spectrum page (local Plotly); ranges and the server and advisor cards updated, re-pinned to HEAD.

## October 28, 2026 — Three more craps bets

- **Dataset** `Craps Place 5 / Place 9` (−1.11%), `Craps Place 4 / Place 10` (−1.67%) and `Craps Big 6 / Big 8`
  (−2.78%), cited to the Wizard of Odds craps house-edge table. Dataset is now 234 records, 44 cited.

---

## October 27, 2026 — Security sweep: the refreshed diagram lock

- **`.gitleaksignore`** suppresses the same false positive at the diagram lock's new commit (`56ea039`): the
  lock holds git blob hashes, which trip the generic API-key rule each time the diagram is refreshed.

---

## October 26, 2026 — Plotly served from the site, not its CDN

- **Spectrum** `site/public/spectrum/index.html` loads `plotly-basic-2.32.0.min.js` from its own folder instead of
  `cdn.plot.ly/plotly-2.32.0.min.js`, so a Plotly CDN outage no longer takes the page down. The basic build (bar,
  scatter, pie) is everything the page draws: 1.0 MB instead of 3.6 MB. Same version, same chart (roadmap Action 2.11).
- **Check** `npm run check:spectrum-browser` fails if the page requests anything from `plot.ly`.

---

## October 26, 2026 — Security sweep: headers and API input limits

- **Headers** `site/vercel.json` now sends `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`,
  `frame-ancestors 'self'` and a `Referrer-Policy` on every path. The home page's own diagram iframe still loads.
- **Advisor** `generateAdvice` clips each `currentStrategy` field, so the request body can't carry text past the
  prompt's 1000-character cap into the Gemini call.
- **Scoreboard** `fetchEspnScoreboard` refuses a `date` that isn't `YYYYMMDD[-YYYYMMDD]`. `check:deployment` covers it.
- **`.gitleaksignore`** suppresses one false positive (git blob hashes in the diagram's source lock).

---

## October 26, 2026 — `/api/backtest` loads on Vercel again

- **Fix** `site/src/dataGenerator.ts` imported `./stats` and `./types` with no extension. Vercel runs `api/*.ts` as
  unbundled Node ESM, which can't resolve that, so every backtest since September 28 returned 500
  `FUNCTION_INVOCATION_FAILED` (site checks, 2026-10-26). Both imports now end in `.js`, like the rest of the API graph.
- **Check** `npm run check:deployment` walks every file reachable from `api/` and fails on a relative import without `.js`.

---

## October 26, 2026 — Canonical URL on the homepage

- **Site** `site/index.html` declares `<link rel="canonical" href="https://edge-spectrum.ai-automation-tools.dev/">`,
  so preview and alias URLs on Vercel don't compete with the homepage in search. Flagged by Org Upkeep.

---

## October 22, 2026 — Org folder layout: `AGENTS.md`, lowercase folders, `Versions/` dropped

- **Docs** `CLAUDE.md` is now `AGENTS.md`, the file every coding agent reads. The new `CLAUDE.md`
  imports it with `@AGENTS.md` and keeps only the Claude Code note on installing the project skills
  into `.claude/skills/`.
- **Docs** `Data/` → `data/`, `Images/` → `images/`, `docs/Ideas/` → `docs/ideas/`, per the org layout
  standard (lowercase-kebab folders; GitHub paths are case-sensitive). The README banner image, the
  README and AGENTS.md layout trees, the docs hub and roadmap links, `docs/data-architecture.md`, the
  comment in `site/src/server/auth.ts` and the generated `data/edge_dataset.md` footer all point at the
  new names.
- **Data** `Versions/` (17 old copies, including the Streamlit port) is no longer tracked; git
  history is the archive. `npm run gen:edges` now writes three artifacts instead of four (the
  Streamlit `data.py` target is gone), and `check:spectrum` checks the category colour and risk maps
  on the Spectrum page only, since the Streamlit copies it also compared went with the folder.
  Older entries below still say `Data/`, `Images/`, `Versions/` and `Ideas/`, as they were written.

---

## October 22, 2026 — `Docs/` renamed to `docs/`

- **Docs** the top-level docs folder is now lowercase `docs/`, the org's layout standard. GitHub
  paths are case-sensitive, so `docs/...` links into this repo from elsewhere returned 404. Every
  in-repo reference moved with it: the README and CLAUDE.md, `.gitignore`, `.gitattributes`, the CI
  and Dependabot comments, `scripts/build-diagram.mjs` and the diagram's delivery file, and the GitHub
  links the hub builds (command palette, home page, setup-guide URL) plus the generated
  `Data/edge_dataset.md` footer. `Data/`, `Images/` and `Versions/` keep their names. Older entries
  below still say `Docs/`, as they were written.

---

## October 21, 2026 — Three more casino bets (228 → 231 records)

- **Data** Casino Gambling gains **Craps Place 6 / Place 8** (−0.46%) and **Craps Any Craps**
  (−11.11%), both from the Wizard of Odds craps house-edge table, and **Three Card Poker Pair Plus**
  (−7.28%, pay table 1) from the Wizard of Odds Three Card Poker page. They fill the gaps between the
  Pass Line and the one-roll proposition bets already in the set. Each carries source and as-of date;
  the provenance baseline moves to 231 records, 41 cited (the 38 from the October 19 sourcing pass plus these three).

---

## October 21, 2026 — Dev server reachable through a proxy hostname

- **Dev** Vite's DNS-rebinding guard answers `403 Blocked request` to any Host but localhost, and it
  runs in middleware mode too, so a proxy such as `tailscale serve` (which forwards the browser's
  Host unchanged) could not reach the local server. `site/vite.config.ts` now sets
  `server.allowedHosts` from `ALLOWED_HOSTS` in `site/.env` (comma-separated; documented in
  `.env.example`). Unset, Vite's default is unchanged, and any host not on the list is still refused.

---

## October 21, 2026 — Dev server's HMR socket pinned to 24679

- **Dev** `server.ts` runs Vite in middleware mode, which opens its hot-reload WebSocket on a port
  of its own, `24678` by default. my-prompt-library does the same, so whichever started second lost
  HMR (`WebSocket server error: Port 24678 is already in use`). `site/vite.config.ts` now pins it to
  `24679`; `DISABLE_HMR=true` still turns it off. The app's own port is unchanged.

---

## October 19, 2026 — Sources on the headline figures, and a "verify" badge

- **Cited** 20 rows: the S&P 500 and nine fee/tax rows built on it, gold and its collectibles-tax
  row, and the money-market, savings and deposit-average rows. Coverage is 38 of 228 (was 18) and
  the `check:edges` ratchet now holds at 38.
- **Corrected while checking** money market fund 4.8% → 3.7% (Crane 100 Money Fund Index, 3.71% on
  2026-10-19), online HYSA 4.5% → 4.2% (Bankrate's picks top out at 4.27%; the 24% / 37% tax rows
  are now 3.19% / 2.65%), traditional bank money market 1.5% → 0.63% and national average savings
  0.45% → 0.38% (FDIC national rates, 2026-10-19), credit-union savings 0.5% → 0.19% (NCUA, Q4
  2025), gold 7.5% → 7.1% (Damodaran, 1976–2025; the collectibles-tax row is now 5.11%). The S&P
  500's 10.0% held: Damodaran's 1928–2025 compound return is 10.02%.
- **Verify badge** the Spectrum inspector shows an amber **verify** badge on any row whose `asOf` is
  missing or over a year old (167 rows today, including Bitcoin, Ethereum and the CD rows). The
  rule is `isStale` in the page's math block, held by `check:spectrum` and
  `check:spectrum-browser` with a pinned clock so an ageing citation never fails CI.

---

## October 19, 2026 — Hub data-flow diagram on the homepage

- **Docs** [`Docs/diagrams/`](diagrams/README.md) holds an Archify diagram of how the hub fits
  together: `edges.ts` generated into the Spectrum page, the `tools.ts` registry drawing every tile
  and route, and the Backtest Simulator calling the backtest, ESPN proxy and passcode-gated Gemini
  advisor functions. Every node cites its code at a pinned commit.
- **Homepage** a new *How it works* section embeds it live (same-origin iframe, Live motion, follows
  the Light | Dark switch). `node scripts/build-diagram.mjs` builds it and copies the HTML and PNG
  into `site/public/diagram/`; `--check` reports drift, and CI warns (never fails) when cited code
  changes.

---

## October 19, 2026 — Roadmap on the lab's roadmap standard

- **Docs** `Docs/roadmap.md` is now `Docs/ROADMAP.md` and this file `Docs/CHANGELOG.md` (was
  `change_log.md`), with every link updated, including the hub's command palette and home page and
  the generated `Data/edge_dataset.md` footer. The roadmap takes the lab's standard shape: centred
  header and badges, a markers line, every item a `- [ ]` / `- [x]` line (the numbered lists became
  bullets, done notes read `— done YYYY-MM-DD`), Phases 1 and 2 above a ticked `🚦 Public release`
  gate list, and Phases 3 to 7 as groups under `## After public release`. No items added or dropped.

---

## October 14, 2026 — Three casino records (225 → 228)

- **Roulette Single Zero La Partage** (−1.35%) — half the stake back on zero; source: Wizard of Odds,
  Roulette basics.
- **Roulette Five-Number Bet (0-00-1-2-3)** (−7.89%) — the one American-wheel bet worse than 5.26%;
  source: Wizard of Odds, Roulette basics.
- **Craps Hard 6 / Hard 8** (−2.78%) — 9-to-1 hard ways, per bet made; source: Wizard of Odds, craps
  house edge table.
- All three carry `source` and `asOf`; the citation baseline moves from 15 to 18.

---

## October 13, 2026 — Phone polish (desktop unchanged)

- **No iOS focus zoom** — form fields render at 16px below 640px (backtester, calculators, Spectrum
  search / presets / "where do I sit?" form); they were 11.5–14px.
- **Calculator tables** — on phones the No-Vig and Parlay leg tables keep their inputs at full width and
  scroll inside their card; before, the label and price inputs were crushed to ~26px.
- **Tap targets** — theme switch, remove-row buttons, the Advanced Screening toggle and the Spectrum
  page's segmented controls, quick filters and category chips grow to 32–36px on phones.

---

## October 13, 2026 — Spectrum page: touch scrolling, comparisons, embed mode

- **Touch fix** — on touch screens the chart no longer captures swipes as drag-zoom, so the page scrolls
  past it; a touch that moves more than 10px no longer pins or unpins a bar. The chart hint reads "tap a
  bar to pin" there instead of promising a zoom.
- **Comma search** — the name filter ORs comma-separated terms, so `slots, S&P 500 Index` puts those
  records side by side across categories. Cap raised from 60 to 120 characters.
- **Compare mode (Action 4.7)** — up to three pinned activities as return-on-capital lines by horizon,
  with the ruin horizon marked; `cmp=` in the URL.
- **Embed mode (Action 6.6)** — `?embed=1` shows only the chart and a caption with the helpline and an
  "open the full tool" link, sized to the iframe.
- **Browser smoke test (Action 2.9)** — `check:spectrum-browser` drives the built page in headless
  Chromium in CI; adds `playwright` as a dev dependency.
- **Category-map guard (Action 2.12)** — `check:spectrum` fails if a category is missing from the page's
  `CC` / `AR_DEFAULT` or the Streamlit archive's `ALL_CATS` / `CC` / `AR_DEFAULT`.

---

## October 12, 2026 — Spectrum page V21: redesigned UI, interactive chart, 35 new records (190 → 225)

### Dataset

Two new categories and gaps filled in five existing ones; the citation baseline moves from 3 to 15.

- **Trading & Derivatives** (new, 10, mixed-mode) — Covered Call ETF, Systematic Put Writing, Managed
  Futures, 3x Leveraged Nasdaq held, Retail Day Trading, Retail Options Buying, Retail Forex / CFD,
  0DTE Options Buying, Inverse / Short ETF held, Binary Options (a repeated wager). V11 had cut these
  as outlier noise because a −60%/yr row squashed the old single axis; the −100% floor (Action 2.1)
  removed that reason. Sources: Barber/Lee/Liu/Odean (2014), Chague et al. (2020), ESMA loss-rate
  disclosures.
- **Horse Racing & Pari-Mutuel** (new, 6) — Win/Place/Show, Exacta / Daily Double, Trifecta /
  Superfecta, Pick 4 / Pick 6, Greyhounds, and an 8% ADW-rebate row. Takeout rates from HANA.
- **Casino Gambling** (+7) — Blackjack Card Counting (+1%), Spanish 21, Ultimate Texas Hold'em, Sic Bo
  Big/Small, Casino War, Online Slots 96% RTP, Crypto Dice. Wizard of Odds for the exact figures.
- **Sports Betting** (+4) — Sharp Bettor (+2% CLV), Betting Exchange (2% commission), Reduced Juice
  (−105), Micro-Bets.
- **Lottery** (+4) — EuroMillions, Charity 50/50 Raffle, Bingo Hall Session, Pull-Tabs.
- **Bonds** (+1) Private Credit / BDC Index; **Cryptocurrency** (+3) Staked Ethereum, Leveraged
  Perpetual Futures, Bitcoin Spot ETF after fee (`fee` layer).
- `toSpectrumRow()` now carries provenance (`src`, `asOf`, `win`, `how`) into the page rows and
  `edges.json`, so the page can cite it. The generator's category banner reads `(Mixed)` when a category
  holds both models. `check-edges.ts --write-baseline` no longer trips over its own count assertion.
- Count statements updated in `CLAUDE.md`, `README.md`, `Docs/README.md`, `Docs/data-architecture.md`
  (category table rewritten for 15), `check-spectrum.ts`, the hub tile, and the Streamlit archive's
  `ALL_CATS` / `CC` / `AR_DEFAULT`.

### Page (`site/public/spectrum/index.html`)

The sidebar layout is replaced by a controls bar, a row of coloured category chips, and a chart with
a side inspector. The `MATH & CONSTANTS` block is unchanged apart from dropping the unused `DCA_AMT`
and moving `ALL_CATS` to be read off `RAW`; `check:spectrum` passes unchanged.

- **Inspector** replaces the floating tooltip: hover reads a bar into it, click pins it (bar outlined,
  others dimmed), with return by horizon (each cell switches the chart), ruin point, inputs, risk tier
  and provenance. Unpinned it lists the view's leaders and laggards.
- **Controls**: measure, horizon (with a ▶ play-through and ← → keys), layer, colour by gain/loss or
  category, sort by value / category (tinted bands with names) / name, ruin-mark and value-label
  toggles, and a name filter (`/`). Chips toggle categories; Alt-click solos one; All / None / Held
  assets / Wagers quick picks.
- **Chart**: native Plotly hover label, drag-zoom / double-click reset, value labels when ≤ 40 bars,
  empty state.
- **Share / export**: the view is encoded in the URL (`?h=10yr&m=turn&c=cat&s=category&cats=…&pin=…`);
  Share copies it; CSV exports the activities in view across all horizons with provenance; PNG
  downloads the chart on the theme's ground.
- Dead controls removed: the Dollar-Cost toggle never did anything, and the Addiction-Modeling toggle
  only revealed a row that is now always in the inspector.
- Plotly stays pinned at 2.32.0 (Action 2.8 remains open). Fonts corrected to JetBrains Mono.

### Model and use cases (same day, second pass)

- **Positive-edge rows now carry risk.** `ruinRisk` (gambler's-ruin probability at flat stakes,
  `((1−e)/(1+e))^(100/ced)`) and `kellyMultiple` (`ced / e`) join the `MATH & CONSTANTS` block; the
  inspector's ruin box for a winning game shows both, a verdict (at / above / more than twice the
  growth-optimal stake) and a note that the linear return assumes unlimited action. `check:spectrum`
  asserts every positive-edge row reports `0 < risk < 1` and that losing rows never do. The return
  itself is unchanged: a geometric alternative was tried and explodes past the axis guard at ten years.
- **"Where do I sit?"** — a form in the inspector places the reader's own habit (start from any game
  or a custom edge, bankroll, stake, wagers per week) or holding (annual return, amount) on the chart as
  a highlighted "You" bar that ignores the filters. The inspector then shows the figures in dollars
  (start, expected after the horizon, expected change per week, per wager). Stored only in the URL
  (`yn`, `ym`, `ye`, `ydu`, `yced`, `ya`, `yb`), so Share keeps it. Edit / Remove on the pinned row.
- **Real $ overlay** — `INFLATION = 3.0`; `realReturn` deflates return on capital over the horizon's
  calendar time, floor preserved. A toggle in Overlays; `check:spectrum` asserts real ≤ nominal.
- **Preset views** — a select in the header swaps the whole view (everything, ten years by category,
  casino floor, every parlay, fees and tax on the S&P, cash and bonds in real terms, turnover at one
  month, the positive-edge wagers) without a reload.
- **Related tools, pre-filled.** `site/src/calcUrl.ts` (held by `npm run check:calc-url`, now in CI)
  reads `/odds?odds=&legs=&method=&format=` and `/parlay?n=&legs=&quoted=&method=&format=` once on
  mount; anything that does not parse under the chosen format is dropped field by field, the leg count
  is capped at 15, and a literal `+` must travel as `%2B`. The Spectrum inspector links a two-way row to
  the odds converter at the symmetric line its edge implies (−4.55% → −110 / −110, a 17% takeout →
  −141 / −141), an N-team parlay to the parlay calculator with N legs at −110, and spread / totals /
  moneyline rows to the backtester with that bet type. Props, futures and parlays get no backtester
  link because the simulator does not price them.
- `Docs/methodology.md` gains Metric D (ruin risk, Kelly multiple) and the real-terms note.
- **Chart height follows the plotted span** (third pass). `chartHeight()` scales the base height (58% of
  the viewport, 420-760 px) by `1 + log10(span / 50)`, clamped to 1x-3x: about 580 px at one day,
  1,190 px at one year and 1,720 px (the cap) at ten years, so the bars between +50% and +500% are
  readable beside a +4,600% one instead of being a flat line.

---

## October 7, 2026 — Three casino bets (187 → 190 records)

Added to Casino Gambling, the first records in the dataset to carry provenance (`source`, `asOf`,
`methodology`); the citation baseline moves from 0 to 3.

- **Baccarat Tie (8:1)** — −14.36%, 8-deck shoe. Source: Wizard of Odds, Baccarat basics.
- **Craps Any Seven** — −16.67%. Source: Wizard of Odds, craps house edge table.
- **Craps Field (3:1 on 12)** — −2.78%. Source: Wizard of Odds, craps house edge table.

DU/CED follow the neighbouring baccarat (50 / 3%) and craps (40 / 2%) records. `gen:edges` regenerated
all four artifacts; the count statements in `CLAUDE.md`, `README.md`, `Docs/README.md`,
`check-spectrum.ts` and the hub tile now read 190.

---

## October 7, 2026 — Upstream check

First pass over `Docs/UPSTREAMS.md`. ESPN's four scoreboards still return every key `espn.ts` reads;
`gemini-2.5-flash` has no shutdown date. The Gemini row said `^2.4.0` while `package.json` declares
`^2.26.0`; the row is corrected. Plotly 4.x is queued as roadmap Action 2.8. No code changed.

---

## October 5, 2026 — Responsible-gambling notice (Roadmap Action 3.5)

The Spectrum page's footer gains a second row: education only, not investment, financial or betting
advice; gambling is for adults (18+ or 21+); and tap-to-call help lines — US 1-800-GAMBLER, UK
0808 8020 133, AU 1800 858 858 — with GamblingTherapy.org for everywhere else. `.footer` now wraps
(`flex-wrap`) so the row sits under the existing two. The same wording is built into the hub's shared
`SiteFooter.tsx`, so every React route carries it too. The `MATH & CONSTANTS`, `RAW` and
`DATA INJECTION` blocks are untouched.
## October 5, 2026 — Light / dark theme switch

A Sun / Moon switch now sits at the right end of the hub topbar (every route) and of the Spectrum
page's nav. The choice is stored in `localStorage` under `edge-spectrum.theme` (`light` | `dark`) and
shared by both pages. Dark stays the default; the OS preference is not followed.

- **Mechanism**: `site/src/theme.ts` (`useTheme` / `setTheme`) stamps `light` or `dark` on `<html>`;
  pre-paint scripts in `site/index.html` and `public/spectrum/index.html` apply the stored choice
  before first paint. All three hard-code the same dark fallback.
- **Light palette** in `site/src/index.css`: `html.light` swaps the tokens, mirrors the Tailwind zinc
  scale and drops the accents to their 700 shades (sky `#0369a1` 5.5:1, body ink `#18181b` 16.4:1,
  secondary `#52525b` 7.2:1 on `#f6f6f7`). A `light:` variant covers the few spots the remap can't.
  Registry accents are now `var(--a-*)` tokens (`ACCENT_HEX` → `ACCENT_COLOR`).
- **Charts**: the equity curve (Recharts), the home `SpectrumStrip` canvas and the Spectrum page's
  Plotly layout each carry a light colour set and redraw on switch.
- Dark output is unchanged. The Spectrum page's `MATH & CONSTANTS`, `RAW` and `DATA INJECTION` blocks
  are untouched.

## October 5, 2026 — Hub redesign in the org design vocabulary

The hub was rebuilt to match the 2026-10-05 redesign of `ai-automation-tools.dev` and the Edge-Radar
pages that followed it: `#060606` ground with a dot grid, one hero glow, zinc surfaces, Inter +
JetBrains Mono, spotlight cards with a cursor-tracked ring in each tool's accent, a sticky topbar with a
sliding route indicator, a `⌘K` jump palette, and `prefers-reduced-motion` fallbacks for every
animation (`motion` was already a dependency; it now does the reveals and the metric count-ups).

- **Tokens** live in `site/src/index.css` (`:root` custom properties plus the Tailwind `@theme` fonts).
  Space Grotesk and Geist Mono are gone; the only fonts are Inter and JetBrains Mono.
- **Shared primitives** in `site/src/components/ui.tsx`: `Card` (spotlight surface), `Reveal`,
  `Eyebrow`, `SectionHead`, `PageHead`, `ACCENT_HEX` (the hex behind each registry accent — the literal
  `ACCENT` class map in `Home.tsx` is no longer needed, cards receive the colour as `--c`).
- **Shell**: `Topbar.tsx` (one link per registry tool plus Setup, GitHub, mobile sheet),
  `CommandPalette.tsx`, `SiteFooter.tsx` (with the shared consent hooks). The source bar in
  `deployment.tsx` now matches the org spec exactly (34px, full-bleed, in flow above the topbar).
- **Home**: a data-driven hero, `SpectrumStrip.tsx`, draws all 187 `EDGES` records on two separate
  lanes — held assets by annual return, repeated wagers by edge per decision — because the two are
  different quantities and never share an axis (the Action 2.1 rule). Hover reads a record; click opens
  the visualizer. Counts on the page (records, seasons, de-vig methods) are read from `edges.ts`,
  `strategyBounds.ts` and `odds.ts`, not typed.
- **Tool pages**: calculators and Setup use `PageHead` and `Card`; the backtester's `Header` is a page
  head in flow (the hub topbar is the sticky chrome now), `ResultsDashboard` metrics count up and carry
  the spotlight, the workspace tabs use the shared tab style, and the remaining panels share `.panel`.
  No calculation, schema or endpoint changed.
- **Spectrum page** (`public/spectrum/index.html`): tokens, fonts and the hub nav only. The `MATH &
  CONSTANTS`, `RAW` and `DATA INJECTION` blocks are byte-for-byte unchanged, so `check:spectrum` and
  `gen:edges --check` still test the same page.


## September 29, 2026 — Upstreams worklist

- **`Docs/UPSTREAMS.md`**: every external service Edge Spectrum depends on (ESPN scoreboard API,
  Gemini via `@google/genai`, the Plotly and Google Fonts CDNs, Vercel, Node, the framework
  majors), what the code assumes about each, and where to check it. It is the worklist for the
  biweekly **Edge-Spectrum Upstream Check** routine (`upstream/auto-*` PRs).

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

Roadmap [Action 2.1](ROADMAP.md) — metric semantics and dual-axis correction. Evidence and
measurements in [§8 of hub_improvement_plan.md](ideas/hub_improvement_plan.md).

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
