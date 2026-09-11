# CLAUDE.md — Edge Spectrum (hub)

> Repository-specific guidance for Edge Spectrum.

## What this is

**Edge Spectrum** — `edge-spectrum.ai-automation-tools.dev` 🟢 Live — a **multi-tool hub** for sports,
betting, investing, odds, and gambling analysis. Started (2026-07-10) by merging the standalone
**Sports-Betting-Backtester** app into the original **Betting_Spectrum** repo; built so each new
tool is roughly *one registry entry + one page*.

## Stack & hosting

- **Vite + React 19 + TS**, Tailwind v4 (`@tailwindcss/vite`), Recharts + D3, `@google/genai` (Gemini),
  `zod` (request validation, server-side only — keep it out of the client bundle).
- **The entire web app lives in `site/`.** The repo root holds only docs/archives (`README.md`,
  `CLAUDE.md`, `Data/`, `Docs/`, `Images/`, `Versions/`) — nothing app-related. Run all app commands
  (`npm install`, `npm run dev`, `npm run build`, `vercel …`) from **inside `site/`**.
- **Host: Vercel** (project `edge-spectrum`). The Vercel project's **Root Directory is set to `site`**
  (dashboard → Settings → Build & Deployment → Root Directory), so `vercel.json` and `api/` inside
  `site/` are picked up as-is. Working branch **`mike_desktop`**, deploy branch **`main`**.
  Deploy via CLI: `vercel deploy --prod` **from `site/`** (the `.vercel/` link folder lives there).
  (Git-connected; production branch may also be set to `main` in the dashboard for push-to-deploy.)
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
    pages/OddsConverter.tsx, pages/ParlayCalculator.tsx   # Phase 6 standalone calculators
    odds.ts           # pure odds/de-vig/parlay math behind the calculators; no imports — held by
                      #   scripts/check-odds.ts. Reuse it; do not re-derive conversions elsewhere
    components/CalcUi.tsx  # Panel / Select / Stat shared by the calculator pages
    BacktesterApp.tsx # the Backtest Simulator (mounted at /backtester)
    components/        # Backtester UI (Header, StrategyBuilder, ResultsDashboard, …)
    server/            # backtest / espn / advisor logic + strategySchema.ts (Zod request
                       #   validation) — imported by BOTH server.ts and api/
    strategyBounds.ts  # the numeric limits the schema enforces; no imports, so the strategy
                       #   form can clamp to them without pulling Zod into the client bundle
    data/edges.ts      # THE DATASET — the canonical 187 edge records. Everything else that
                       #   holds this data is generated from it; see "Generated data" below
    dataGenerator.ts, types.ts
  scripts/            # not shipped: check-market.ts, check-spectrum.ts, check-odds.ts, check-edges.ts, generate-edge-artifacts.ts
  api/                # Vercel serverless: backtest.ts, espn-scoreboard.ts, strategy-advisor.ts
  public/spectrum/    # the original Edge Spectrum Plotly viz, served static at /spectrum/index.html
                      #   index.html's RAW block and edges.json are GENERATED — do not hand-edit
  index.html, server.ts, package.json, vite.config.ts, vercel.json, tsconfig.json
Versions/ Data/ Docs/ Images/   # preserved Edge Spectrum archives & screenshots (repo root, not deployed)
Images/favicon.svg    # archived copy of the app icon (the served icon is site/public/favicon.svg)
```

## Adding a new tool (the whole recipe)

1. Add one entry to `TOOLS` in `site/src/tools.ts` (`slug`, `title`, `blurb`, `icon`, `href`, `kind`, `status`, `accent`).
2. Then, by `kind`:
   - `route` → build the page component and add its `<Route>` in `site/src/App.tsx`.
   - `static` → drop the page under `site/public/<slug>/` and point `href` at `/<slug>/index.html`
     (Vite dev does **not** auto-serve a `public/` directory index — always link the explicit file).
   - `external` → just the URL; opens in a new tab.
3. New accent colors must be added to the literal `ACCENT` map in `site/src/pages/Home.tsx` (Tailwind JIT needs the literal classes).

## Env / secrets

- `EDGE_SPECTRUM_MODE` defaults to `demo`. Only the exact value `full` enables live AI. The public
  demo must stay in demo mode and must not hold Gemini credentials. See `Docs/self-hosting.md`.
- `GEMINI_API_KEY` (Gemini advisor). Loaded from `site/.env` locally (gitignored), and set
  in the Vercel project's env vars for production. **Never commit `.env`** — advisor stays server-side; do
  not move the key client-side.
- `ADVISOR_PASSCODE` — **required for the AI advisor to work.** The advisor spends a metered key, so
  `/api/strategy-advisor` sits behind a shared-passcode session gate (`site/src/server/auth.ts`). If the var
  is unset the endpoint **fails closed** with `503` and the advisor panel renders as unavailable; every other
  tool is unaffected. Optional `ADVISOR_SECRET` signs session cookies — when unset it is derived from the
  passcode, so rotating the passcode invalidates all sessions.

## Conventions

- Strict TS; functional components + hooks; Tailwind; match existing `site/src/` style.
  Note that `tsconfig.json` does **not** set `strict`/`strictNullChecks`, so some type-level
  idioms silently do not work — notably, narrowing a discriminated union on a boolean field
  (`if (r.ok) …`) does not narrow, and Zod infers every output field as optional.
- Untrusted request bodies get a Zod schema in `site/src/server/`, reached through the shared
  `src/server/` module both entry points already call — not re-checked in each route handler.
- The static `site/public/spectrum/` page is self-contained (Plotly + fonts via CDN) for serving;
  however, its mathematical models, DU/CED metrics, and dataset are subject to code, math, and data audits.
  A future task may port it into a React route. Because it has no build step to hook,
  **`npm run check:spectrum` reads its inlined `MATH & CONSTANTS` block and `RAW` dataset straight
  out of the HTML and runs the real functions** — so renaming those section banners, or the exported
  names the script destructures, breaks the guard. Its three measures are not interchangeable:
  `returnOnCapital` is floored at −100%, `expectedTurnoverCost` is deliberately not, and they must
  keep agreeing on `ruinPoint`. Never plot them on one axis again — that was roadmap Action 2.1.
- **Generated data.** `site/src/data/edges.ts` is the only place the 187 edge records are authored.
  `npm run gen:edges` regenerates every copy from it — the `RAW` block inside
  `site/public/spectrum/index.html`, `site/public/spectrum/edges.json`, `Versions/Streamlit/data.py`
  and `Data/edge_dataset.md`. Edit `edges.ts`, run the script, commit the result; editing an
  artifact by hand is reverted by the next run and fails CI (`npm run gen:edges -- --check`).
  The page's data stays **inlined** rather than fetched, deliberately — that is what keeps
  `check:spectrum` testing the file that actually deploys. `Data/edge_analysis*.md` are frozen
  archives, not inputs.
- Local dev (from `site/`): `npm run dev` (binds `PORT`, default 3001). `npm run build` = `vite build` + esbuild-bundle `server.ts`.
  CI (`.github/workflows/ci.yml`) runs `lint` → `gen:edges --check` → `check:market` → `check:edges` → `check:spectrum` → `check:odds` → `check:deployment` → `build` on every PR.

## Branch workflow (PR flow)

Do **not** push directly to `main`. Work on `mike_desktop`, then open a **PR → `main`** (`gh pr create --base main --head mike_desktop`). Vercel builds a **preview deployment** for each PR — check that URL before merging. Merging to `main` deploys to production (`edge-spectrum.ai-automation-tools.dev`). Keep `mike_desktop` and `main` in sync after each merge (`git checkout mike_desktop && git merge main`).

## Commit identity

Use the repository-local neutral commit identity (`Edge Spectrum Maintainers`,
`noreply@github.com`). Do not reintroduce pre-cleanup history by merging old clones
or branches; start from a fresh clone or transplant reviewed file changes.
