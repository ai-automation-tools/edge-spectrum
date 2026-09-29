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
| **ESPN site API** *(unofficial, undocumented, no key)* | Server-side `GET site.api.espn.com/apis/site/v2/sports/{sport}/{league}/scoreboard?limit=100[&dates=YYYYMMDD]` for football/nfl, basketball/nba, baseball/mlb, hockey/nhl. Reads `events[].id/date/shortName/name`, `status.type.name/detail`, `competitions[0].competitors[]` (`homeAway`, `team.displayName/abbreviation/logo`, `score`, `winner`), `competitions[0].odds[0]` (`details`, `overUnder`, `spread`), `day.date` | `site/src/server/espn.ts`, `site/api/espn-scoreboard.ts`, `site/src/components/EspnFeed.tsx` | No official docs. One live unauthenticated GET per league, compared against the keys above | — |
| **Gemini API via `@google/genai`** | `^2.4.0`; `new GoogleGenAI({ apiKey })` → `models.generateContent({ model, contents, config: { systemInstruction, responseMimeType: 'application/json', responseSchema } })` with `Type.*` schema builders; model id `gemini-2.5-flash` | `site/src/server/advisor.ts`, `site/api/strategy-advisor.ts` | github.com/googleapis/js-genai/releases; ai.google.dev/gemini-api/docs/changelog; ai.google.dev/gemini-api/docs/deprecations | — |

## Static page CDN assets

| Upstream | What the code assumes | Code | Check at | Last checked |
|:---|:---|:---|:---|:---|
| **Plotly.js** | `cdn.plot.ly/plotly-2.32.0.min.js`, version pinned in the URL | `site/public/spectrum/index.html` | github.com/plotly/plotly.js/releases | — |
| **Google Fonts** | `fonts.googleapis.com/css2?family=…` (Geist on the Spectrum page, Space in `index.css`) | `site/public/spectrum/index.html`, `site/src/index.css` | developers.google.com/fonts/docs/css2 | — |

## Hosting and runtime

| Upstream | What the code assumes | Where | Check at | Last checked |
|:---|:---|:---|:---|:---|
| **Vercel** | `framework: "vite"`, `outputDirectory: "dist"`, SPA rewrite `/((?!api/).*)`; four Node functions in `site/api/` on default runtime settings | `site/vercel.json`, `site/api/*.ts` | vercel.com/changelog; vercel.com/docs/functions/runtimes/node-js/node-js-versions | — |
| **Node.js** | `engines.node: ">=22 <25"` picks the Vercel runtime; CI pins 22 | `site/package.json`, `.github/workflows/ci.yml` | nodejs.org/en/about/previous-releases (EOL dates) | — |
| **GitHub Actions** | `actions/checkout@v4`, `actions/setup-node@v4` | `.github/workflows/ci.yml` | github.com/actions/setup-node/releases | — |

## Framework majors

| Upstream | Declared in `site/package.json` | Check at | Last checked |
|:---|:---|:---|:---|
| React / react-dom | `^19.0.1` | react.dev/blog | — |
| react-router-dom | `^7.9.1` | github.com/remix-run/react-router/releases | — |
| Vite, @vitejs/plugin-react | `^6.2.3`, `^5.0.4` | github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md | — |
| Tailwind CSS v4 | `^4.1.14` | github.com/tailwindlabs/tailwindcss/releases | — |
| TypeScript | `~5.8.2` | devblogs.microsoft.com/typescript | — |
| zod, recharts, d3, motion, react-markdown, express (dev only) | see `package.json` | each package's GitHub releases | — |

Flag breaking majors, EOL runtimes, and security advisories only. Routine bumps are
Dependabot's job.
