# AGENTS.md — Edge Spectrum (hub)

> Repository-specific guidance for Edge Spectrum, for every coding agent. Claude-only notes live in
> `CLAUDE.md`, which imports this file.

## What this is

**Edge Spectrum** — `edge-spectrum.ai-automation-tools.dev` 🟢 Live — a **multi-tool hub** for sports,
betting, investing, odds, and gambling analysis. Started (2026-07-10) by merging the standalone
**Sports-Betting-Backtester** app into the original **Betting_Spectrum** repo; built so each new
tool is roughly *one registry entry + one page*.

## Stack & hosting

- **Vite + React 19 + TS**, Tailwind v4 (`@tailwindcss/vite`), Recharts, `@google/genai` (Gemini),
  `zod` (request validation, server-side only — keep it out of the client bundle).
- **The entire web app lives in `site/`.** The repo root holds only docs/archives (`README.md`,
  `AGENTS.md`, `CLAUDE.md`, `data/`, `docs/`, `images/`, plus `scripts/build-diagram.mjs` for the docs diagram) — nothing app-related. Run all app commands
  (`npm install`, `npm run dev`, `npm run build`, `vercel …`) from **inside `site/`**.
- **Host: Vercel** (project `edge-spectrum`). The Vercel project's **Root Directory is set to `site`**
  (dashboard → Settings → Build & Deployment → Root Directory), so `vercel.json` and `api/` inside
  `site/` are picked up as-is. Working branch **`mike_desktop`**, deploy branch **`main`**.
  **A merge to `main` is the only deploy path**: the project is Git-connected with `main` as its
  production branch (GitHub's deployment log shows every production deploy at a `main` merge commit),
  and each PR gets a preview. Do not run `vercel deploy --prod` by hand; it would ship code that skipped
  the PR and CI. Rolling back is in `docs/self-hosting.md`.
- `site/server.ts` (Express + Vite middleware) is **local dev only**; on Vercel the SPA is served from
  `site/dist/` and `site/api/*` run as serverless functions. `vercel.json` has an SPA rewrite so client
  routes deep-link.

## Layout

```
site/                 # ← the whole web app (Vercel Root Directory = site)
  src/
    tools.ts          # THE REGISTRY — single source of truth for every tool
    App.tsx           # BrowserRouter shell + slim HubNav; routes derived from the tools
    pages/Home.tsx    # hub landing = tile grid, maps over tools.ts
    pages/OddsConverter.tsx, pages/ParlayCalculator.tsx, pages/KellyCalculator.tsx   # Phase 6 calculators
    kelly.ts          # pure Kelly sizing: single, fractional, simultaneous, drawdown odds — held by
                      #   scripts/check-odds.ts
    ledgerCsv.ts      # the backtest game log's CSV download (every wager, bankroll after each)
    odds.ts           # pure odds/de-vig/parlay math behind the calculators; no imports — held by
                      #   scripts/check-odds.ts. Reuse it; do not re-derive conversions elsewhere
    stats.ts          # pure hit-rate inference (breakeven, Wilson CI, exact binomial p-value) the
                      #   backtest summary carries; no imports — held by scripts/check-stats.ts
    calcUrl.ts        # query string → pre-filled /odds and /parlay state (the Spectrum inspector
                      #   links into them); imports only odds.ts — held by scripts/check-calc-url.ts
    strategyUrl.ts    # Strategy ⇄ /backtester query string (share links); checks against the
                      #   strategyBounds.ts lists, not Zod — held by scripts/check-strategy-url.ts
    components/CalcUi.tsx  # Panel / Select / Stat shared by the calculator pages
    BacktesterApp.tsx # the Backtest Simulator (mounted at /backtester)
    components/        # Backtester UI (Header, StrategyBuilder, ResultsDashboard, …)
    server/            # backtest / espn / advisor logic + strategySchema.ts (Zod request
                       #   validation) — imported by BOTH server.ts and api/
    strategyBounds.ts  # the numeric limits and enum lists the schema enforces; no imports, so the strategy
                       #   form can clamp to them without pulling Zod into the client bundle
    data/edges.ts      # THE DATASET — the canonical edge records. Everything else that
                       #   holds this data is generated from it; see "Generated data" below
    dataGenerator.ts, types.ts
  scripts/            # not shipped: check-bundle.mjs (after build), check-live.mjs (the deployed site, run by the
                      #   Registry drift workflow daily and after each production deploy), check-market.ts, check-engine.ts, check-spectrum.ts, check-odds.ts, check-stats.ts, check-strategy-url.ts, check-calc-url.ts, check-edges.ts, check-spectrum-browser.ts, generate-edge-artifacts.ts
                      #   capture-lines.ts: the ESPN line collector (Actions 5.1/5.2), held by check-lines.ts
                      #   capture-closes.ts: the Tiingo market-close collector (Action 5.3), held by check-lines.ts
                      #   build-registry.mjs: GENERATES public/registry/ (the Cronsole catalog) — edit the
                      #   templates there, never the output; --check in CI. check-registry-published.mjs
                      #   is the daily drift check of the served copy
  api/                # Vercel serverless: backtest.ts, espn-scoreboard.ts, strategy-advisor.ts, advisor-auth.ts
  public/spectrum/    # the original Edge Spectrum Plotly viz, served static at /spectrum/index.html
                      #   index.html's RAW block and edges.json are GENERATED — do not hand-edit
  index.html, server.ts, package.json, vite.config.ts, vercel.json, tsconfig.json
data/ docs/ images/   # dataset doc, one frozen catalog, docs, the README logo (repo root, not deployed)
docs/diagrams/        # code-pinned Archify diagram; hub-data-flow.json is the only file to edit
scripts/build-diagram.mjs  # builds it and copies HTML+PNG into site/public/diagram/ (never edit
                      #   those copies); --check = drift. Re-pin with --pin-head after cited code changes
```

## Adding a new tool (the whole recipe)

1. Add one entry to `TOOLS` in `site/src/tools.ts` (`slug`, `title`, `blurb`, `icon`, `href`, `kind`, `status`, `accent`).
2. Then, by `kind`:
   - `route` → build the page component and add it to `site/src/App.tsx` as a `lazy()` import with its `<Route>`.
     A new route is also listed in three more places,
     or it is a 404 in production while it works in dev: 
     the rewrite in `site/vercel.json`, `CLIENT_ROUTES` in `site/server.ts` and `site/public/sitemap.xml`.
   - `static` → drop the page under `site/public/<slug>/` and point `href` at `/<slug>/index.html`
     (Vite dev does **not** auto-serve a `public/` directory index — always link the explicit file).
   - `external` → just the URL; opens in a new tab.
3. New accent colors must be added to the literal `ACCENT` map in `site/src/pages/Home.tsx` (Tailwind JIT needs the literal classes).

## Env / secrets

- `EDGE_SPECTRUM_MODE` defaults to `demo`. Only the exact value `full` enables live AI. The public
  demo must stay in demo mode and must not hold Gemini credentials. See `docs/self-hosting.md`.
- `GEMINI_MODEL` (optional) overrides the advisor's model id; the default is `DEFAULT_GEMINI_MODEL`
  in `site/src/server/advisor.ts`. When Google retires a model, change the default there and the
  Gemini row in `docs/UPSTREAMS.md` together.
- `GEMINI_API_KEY` (Gemini advisor). Loaded from `site/.env` locally (gitignored), and set
  in the Vercel project's env vars for production. **Never commit `.env`** — advisor stays server-side; do
  not move the key client-side.
- `ADVISOR_PASSCODE` — **required for the AI advisor to work.** The advisor spends a metered key, so
  `/api/strategy-advisor` sits behind a shared-passcode session gate (`site/src/server/auth.ts`). If the var
  is unset the endpoint **fails closed** with `503` and the advisor panel renders as unavailable; every other
  tool is unaffected. `ADVISOR_SECRET` signs session cookies and is **also required** (since 2026-11-12):
  without it the gate counts as unconfigured and answers `503`.
- Advisor limits live in `auth.ts`: 10 calls an hour per session and per address, and
  `ADVISOR_DAILY_LIMIT` (default 200) across everyone. They are in process memory, so on serverless
  they slow abuse rather than cap it; the quota on the Gemini key is the ceiling (roadmap 2.7b).
  Caller addresses come from forwarding headers only on Vercel or with `TRUST_PROXY=1`.

## Conventions

- Strict TS (`"strict": true` in `site/tsconfig.json` since 2026-11-12; `npm run lint` holds it);
  functional components + hooks; Tailwind; match existing `site/src/` style. `react-dom/client` is typed
  by `site/src/react-dom-client.d.ts`, because `@types/react-dom` is not installed.
- **A bet is selected, then graded, in two places only.** In `site/src/dataGenerator.ts`, `selectSide`
  returns the side a strategy backs (or null), `priceAndGrade` is the one place a bet is priced and
  settled, and `passesFilters` applies the ranges and the streak filter. A new selection is one `case` in
  `selectSide`; never read the side back out of the ledger text. `favouriteSide` reads the line for a
  spread bet and the prices for a moneyline bet, and is null on level prices.
- **A min/max rule lives in `rangeIssues`** (`site/src/strategyBounds.ts`). The schema, the strategy
  form and the advisor's template check all call it, so the form blocks exactly what the endpoint
  rejects. A totals bet takes no streak filter: the schema rejects it, and the form, the share-link
  parser and the advisor each reset it to `any`.
- **Line capture reads the archive tolerantly.** `readRecords` (`site/scripts/capture-lines.ts`) skips
  and counts a line that does not parse; never `JSON.parse` a day file directly. A game is "seen"
  across the sport's recent day files, not per file, so it has one `open` record.
- **The backtest engine runs in date order.** `generateGamesDatabase` sorts the schedule's dates
  before it draws a game, because rest days, streaks and the prices set from them are carried from
  one game to the next. A run stops when the bankroll cannot cover a stake (`bustedAtBet`).
  `npm run check:engine` holds both; `check:market` only holds the ROI band.
- Route input handling lives in `src/server/` (`backtestRoute`, `espnScoreboardRoute`), which return
  `{ status, body }`. `server.ts` and `api/*.ts` only pass the request through and send the result.
- **Client routes are listed in four places**: `PAGE_META` and the `<Route>`s in `site/src/App.tsx`, the
  rewrite in `site/vercel.json`, `CLIENT_ROUTES` in `site/server.ts`, and `site/public/sitemap.xml`. A
  route missing from the rewrite is a 404 in production while working in dev. Tool pages are `lazy()`
  chunks; `npm run check:bundle` (after `build`) holds the home page's JS under 150 kB gzip.
- **Content-Security-Policy is enforced** (`site/vercel.json`, report-only 2026-11-12, enforced 2026-11-13):
  a strict policy for the app and a looser one for `/spectrum/` and `/diagram/`, whose scripts are inline.
  The looser one has no `frame-ancestors`, so `/spectrum/?embed` stays frameable; the separate
  `X-Frame-Options` / `frame-ancestors` rules keep every other route same-origin, and `check:deployment`
  replays the rules to prove both. The app's inline theme script is allowed by hash and `check:bundle`
  fails if the two drift. A new third-party origin goes in the policy in the same PR, or the browser blocks it.
- Muted text uses `text-zinc-500` / `text-zinc-600`, which `index.css` lightens on dark so they clear
  4.5:1. Do not reach for a dimmer colour for body-size text.
- Untrusted request bodies get a Zod schema in `site/src/server/`, reached through the shared
  `src/server/` module both entry points already call — not re-checked in each route handler.
- The static `site/public/spectrum/` page is self-contained for serving (Plotly self-hosted as
  `plotly-basic-<version>.min.js` beside it, fonts via CDN);
  however, its mathematical models, DU/CED metrics, and dataset are subject to code, math, and data audits.
  A future task may port it into a React route. Because it has no build step to hook,
  **`npm run check:spectrum` reads its inlined `MATH & CONSTANTS` block and `RAW` dataset straight
  out of the HTML and runs the real functions** — so renaming those section banners, or the exported
  names the script destructures, breaks the guard. Its three measures are not interchangeable:
  `returnOnCapital` is floored at −100%, `expectedTurnoverCost` is deliberately not, and they must
  keep agreeing on `ruinPoint`. Never plot them on one axis again — that was roadmap Action 2.1.
- **Generated data.** `site/src/data/edges.ts` is the only place the edge records are authored.
  `npm run gen:edges` regenerates every copy from it — the `RAW` block inside
  `site/public/spectrum/index.html`, `site/public/spectrum/edges.json`
  and `data/edge_dataset.md`. Edit `edges.ts`, run the script, commit the result; editing an
  artifact by hand is reverted by the next run and fails CI (`npm run gen:edges -- --check`).
  The page's data stays **inlined** rather than fetched, deliberately — that is what keeps
  `check:spectrum` testing the file that actually deploys. `data/edge_analysis12.md` is a frozen
  archive, not an input.
- Local dev (from `site/`): `npm run dev` (binds `PORT`, default 3001). `npm run build` = `vite build` + esbuild-bundle `server.ts`.
  CI (`.github/workflows/ci.yml`) runs `npm run verify` on every PR. That script in `site/package.json` is the
  one ordered list of checks; [`docs/README.md`](docs/README.md#-testing--validation-invariants) says what each holds.
  `check:spectrum-browser` is a Playwright smoke test of the *built* Spectrum page and the backtester
  form (`vite preview` on `dist/`, with `/api/backtest` answered by a real engine run), so run `npm run build` before it locally; first use needs `npx playwright install chromium`.
  If CI stops appearing on PRs while `npm`-equivalent manual runs still work, suspect the repository-level
  Actions master switch rather than the workflow file: `gh api repos/.../actions/permissions` reports
  `enabled: true` and Settings → Actions shows "Allow all actions" selected even when it is off, and
  `workflow_dispatch` keeps working. The only honest signal is the banner on the repo's **Actions tab**
  while logged in — "Workflows aren't being run on this repository", with an **Enable Actions** button.

## Project skills

Four repo-specific skills live in the org's skills repo, not here — `agent-skills` under
[`skills/projects/edge-spectrum/`](../../Tools/agent-skills/skills/projects/edge-spectrum/README.md)
([GitHub](https://github.com/ai-automation-tools/agent-skills/tree/main/skills/projects/edge-spectrum)).
That repo is canonical: **edit them there, never in `.claude/skills/`.**

| Skill | Reach for it when |
|:---|:---|
| `edge-spectrum-hub-tool` | Adding/changing a tool tile or page — `tools.ts`, `App.tsx`, `Home.tsx`, `pages/` |
| `edge-spectrum-dataset` | Touching the records in `edges.ts`, `gen:edges`, or the Spectrum page's measures |
| `edge-spectrum-endpoint` | Anything under `site/api/`, `site/server.ts`, `site/src/server/` |
| `edge-spectrum-registry` | The Cronsole templates (`build-registry.mjs`, `site/public/registry/`), `capture-lines.ts`, `digest-lines.ts`, `capture-closes.ts`, the registry-drift workflow. Owner-held files |

Any agent can read a skill's `SKILL.md` there directly; the three scheduled jobs do, by path. Installing them for Claude Code is covered in
`CLAUDE.md`.

## Branch workflow (PR flow)

Do **not** push directly to `main`. Work on `mike_desktop`, then open a **PR → `main`** (`gh pr create --base main --head mike_desktop`). Vercel builds a **preview deployment** for each PR — check that URL before merging. Merging to `main` deploys to production (`edge-spectrum.ai-automation-tools.dev`). Keep `mike_desktop` and `main` in sync after each merge (`git checkout mike_desktop && git merge main`).

## Commit identity

Use the repository-local neutral commit identity (`Edge Spectrum Maintainers`,
`noreply@github.com`). Do not reintroduce pre-cleanup history by merging old clones
or branches; start from a fresh clone or transplant reviewed file changes.

History was rewritten again on 2026-11-13 (audit SEC-01): every commit hash before #119's merge
changed. A clone, worktree or branch made before that date carries the old history; never push or
merge from one. Re-clone instead.
