# Upstreams

Every external service, SDK, and platform Edge Spectrum depends on, what the code assumes
about each, and where to check whether that assumption still holds. The biweekly **Edge-Spectrum
Upstream Check** routine (`upstream/auto-*` PRs) works from this file. Keep it current by hand
too: a new API call is a new row.

All code paths are under `site/`, the Vercel Root Directory. The backtester's MLB/NFL/NHL/NBA
data is generated locally (`site/src/dataGenerator.ts`) and has no upstream.

**Last checked** is filled in by the routine, and only with a date it actually read the
source. `—` means never checked.

## Data and AI

| Upstream | What the code assumes | Code | Check at | Last checked |
|:---|:---|:---|:---|:---|
| **ESPN site API** *(unofficial, undocumented, no key)* | Server-side `GET site.api.espn.com/apis/site/v2/sports/{sport}/{league}/scoreboard?limit=100[&dates=YYYYMMDD]` for football/nfl, basketball/nba, baseball/mlb, hockey/nhl. Reads `events[].id/date/shortName/name`, `status.type.name/detail`, `competitions[0].competitors[]` (`homeAway`, `team.displayName/abbreviation/logo`, `score`, `winner`), `competitions[0].odds[0]` (`details`, `overUnder`, `spread`), `day.date` | `site/src/server/espn.ts`, `site/api/espn-scoreboard.ts`, `site/src/components/EspnFeed.tsx` | No official docs. One live unauthenticated GET per league, compared against the keys above | 2026-10-21 |
| **ESPN terms of use** | The endpoint above is unofficial and Disney's terms restrict automated collection. The project's position: server-side proxy for the live scoreboard, a collector users run themselves at low volume for personal use, a notice in the README and both Cronsole templates, and no captured lines published by this repo or its site (roadmap Action 5.4 grades locally). Not legal advice; the owner reads the terms at the source | `README.md`, `site/scripts/build-registry.mjs` | disneytermsofuse.com (Terms of Use, section 2) | 2026-11-11 (audit, summarised reading) |
| **Gemini API via `@google/genai`** | major 3, Gemini Developer API `v1` (the SDK default since 3.0); `new GoogleGenAI({ apiKey })` → `models.generateContent({ model, contents, config: { systemInstruction, responseMimeType: 'application/json', responseSchema } })` with `Type.*` schema builders; model id `gemini-3.5-flash-lite` by default, overridable with `GEMINI_MODEL` (no shutdown date announced; `gemini-2.5-flash`, used until 2026-11-12, is routed to it from 2026-12-01). The call sends no `temperature`, `top_p`, `top_k`, `candidate_count` or thinking budget, the parameters the 3.x migration guide changes | `site/src/server/advisor.ts`, `site/api/strategy-advisor.ts` | github.com/googleapis/js-genai/releases; ai.google.dev/gemini-api/docs/changelog; ai.google.dev/gemini-api/docs/deprecations | 2026-11-12 |

## Static page CDN assets

| Upstream | What the code assumes | Code | Check at | Last checked |
|:---|:---|:---|:---|:---|
| **Plotly.js** | Self-hosted `plotly-basic-4.2.0.min.js` (npm `plotly.js-basic-dist-min@4.2.0`), version in the filename | `site/public/spectrum/index.html`, `site/public/spectrum/plotly-basic-4.2.0.min.js` | github.com/plotly/plotly.js/releases (pinned 4.2.0, current as of 2026-11-02; roadmap Action 2.8) | 2026-11-02 |
| **Google Fonts** | `fonts.googleapis.com/css2?family=…` (Inter + JetBrains Mono on both the hub and the Spectrum page since the 2026-10-05 redesign) | `site/public/spectrum/index.html`, `site/src/index.css` | developers.google.com/fonts/docs/css2 | 2026-10-21 |

## Hosting and runtime

| Upstream | What the code assumes | Where | Check at | Last checked |
|:---|:---|:---|:---|:---|
| **Vercel** | `framework: "vite"`, `outputDirectory: "dist"`, SPA rewrite `/((?!api/).*)`; four Node functions in `site/api/` on default runtime settings | `site/vercel.json`, `site/api/*.ts` | vercel.com/changelog; vercel.com/docs/functions/runtimes/node-js/node-js-versions (supports 24.x default and 22.x) | 2026-10-21 |
| **Node.js** | `engines.node: ">=22 <25"` picks the Vercel runtime; CI pins 22 | `site/package.json`, `.github/workflows/ci.yml` | nodejs.org/en/about/previous-releases (EOL dates); raw.githubusercontent.com/nodejs/Release/main/schedule.json | 2026-10-21 |
| **GitHub Actions** | `actions/checkout` and `actions/setup-node`, both pinned to the v4.4.0 commit SHA; Dependabot raises new versions, majors included | `.github/workflows/ci.yml` | github.com/actions/setup-node/releases | 2026-10-21 |

## Framework majors

Majors only: a patch or minor bump is Dependabot's job and never makes this table wrong. The
exact ranges are in `site/package.json`. *Latest* is the npm registry's on the *Last checked* date.

| Upstream | Major in `site/package.json` | Latest | Check at | Last checked |
|:---|:---|:---|:---|:---|
| React / react-dom | 19 | 19 | react.dev/blog | 2026-11-12 |
| react-router-dom | 7 | 7 | github.com/remix-run/react-router/releases | 2026-11-12 |
| Vite, @vitejs/plugin-react | 8, 6 | 8, 6 | github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md | 2026-11-12 |
| Tailwind CSS, @tailwindcss/vite | 4, 4 | 4, 4 | github.com/tailwindlabs/tailwindcss/releases | 2026-11-12 |
| TypeScript | 7.0 (`~`, minor pinned) | 7 | devblogs.microsoft.com/typescript | 2026-11-12 |
| @google/genai | 3 | 3 | github.com/googleapis/js-genai/releases | 2026-11-12 |
| motion | 12 | 14 (roadmap Action 2.14) | github.com/motiondivision/motion/releases | 2026-11-12 |
| express (local dev server only) | 5 | 5 | github.com/expressjs/express/releases | 2026-11-12 |
| zod, recharts, react-markdown | 4, 3, 10 | 4, 3, 10 | each package's GitHub releases | 2026-11-12 |

Flag breaking majors, EOL runtimes, and security advisories only. Routine bumps are
Dependabot's job.
