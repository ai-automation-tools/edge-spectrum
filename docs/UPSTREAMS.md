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
| **The Odds API v4** *(opt-in, the self-hoster's own key)* | `GET api.the-odds-api.com/v4/sports/{americanfootball_nfl,basketball_nba,baseball_mlb,icehockey_nhl}/odds?regions=us&markets=h2h,spreads,totals&oddsFormat=american&bookmakers={book}` (3 credits) and `/scores?daysFrom=1` (2 credits). Reads `id`, `commence_time`, `home_team`, `away_team`, `bookmakers[].markets[].outcomes[]` (`name`, `price`, `point`), `completed`, `scores[]`. Terms (read 2026-11-12): storing and own analysis allowed; no resale or redistribution as a raw data product (API, feed, downloadable files). So the archive stays local and nothing from it is committed | `site/scripts/odds-api.ts`, `site/scripts/capture-lines.ts --provider odds-api` | the-odds-api.com/liveapi/guides/v4/ ; the-odds-api.com/terms-and-conditions.html | 2026-11-12 |
| **Gemini API via `@google/genai`** | major 3, Gemini Developer API `v1` (the SDK default since 3.0); `new GoogleGenAI({ apiKey })` → `models.generateContent({ model, contents, config: { systemInstruction, responseMimeType: 'application/json', responseSchema } })` with `Type.*` schema builders; model id `gemini-3.5-flash-lite` by default, overridable with `GEMINI_MODEL` (no shutdown date announced; `gemini-2.5-flash`, used until 2026-11-12, is routed to it from 2026-12-01). The call sends no `temperature`, `top_p`, `top_k`, `candidate_count` or thinking budget, the parameters the 3.x migration guide changes | `site/src/server/advisor.ts`, `site/api/strategy-advisor.ts` | github.com/googleapis/js-genai/releases; ai.google.dev/gemini-api/docs/changelog; ai.google.dev/gemini-api/docs/deprecations | 2026-11-12 |

## Historical line data: licences (audit PROD-12)

Read 2026-11-12, before any historical line data is committed or served. The backtester's seasons stay
simulated until the owner decides; this table is what the decision rests on. A licence label is only
as good as the publisher's right to grant it, so the source of the data counts as much as the label.

| Dataset | Coverage | Licence or terms | Verdict |
|:---|:---|:---|:---|
| nflverse schedules (`github.com/nflverse/nflverse-data`, release `schedules`) | NFL 1999-2026: spread and total from 1999, moneylines and prices from 2006, final scores | CC BY 4.0 (`LICENSE.md`). The upstream `nflverse/nfldata` states no licence, and neither repo says where the lines come from | The only candidate that can be committed and served, with attribution. Ask nflverse about the lines' source first |
| sportsbookreviewsonline.com archives | NFL, NBA, NHL 2007-2023; MLB 2010-2021 | "You may not use or reproduce any content ... without our express written consent" | Cannot be used |
| aussportsbetting.com historical data | NFL from 2006 | "Personal use only. Do not make the data available elsewhere" | A user's own local file only |
| Sports-Reference | Lines shown on pages | Licences "preclude any redistribution"; no tools built on scraped data | Cannot be used |
| The Odds API historical endpoint | Mid-2020 on | No redistribution as a raw data product | A user's own key, at runtime only |
| Kaggle spreadspoke (NFL) | NFL lines from 1979 | CC BY-NC-SA 4.0, and sourced partly from aussportsbetting | Cannot be used |
| Kaggle and GitHub sets labelled CC0 / MIT / CC BY (NBA 2007-2026, MLB 2018-2026, NFL 2000-2019 and others) | Various | Labelled open, but scraped from SBRO, OddsPortal, covers.com or Yahoo, whose terms forbid it | Cannot be used: the label is not the publisher's to give |
| Harvard Dataverse NHL sportsbook efficiency (doi:10.7910/DVN/39ZFRO) | NHL 2018-2022 | CC BY-NC 4.0 | Non-commercial, local only |

Nothing openly licensed and lawfully sourced was found for NBA, MLB or NHL. Real lines for those would
need a paid licence that permits public redistribution, and none of the paid sources read offers one.

## Static page CDN assets

| Upstream | What the code assumes | Code | Check at | Last checked |
|:---|:---|:---|:---|:---|
| **Plotly.js** | Self-hosted `plotly-basic-4.2.0.min.js` (npm `plotly.js-basic-dist-min@4.2.0`), version in the filename | `site/public/spectrum/index.html`, `site/public/spectrum/plotly-basic-4.2.0.min.js` | github.com/plotly/plotly.js/releases (pinned 4.2.0, current as of 2026-11-02; roadmap Action 2.8) | 2026-11-02 |
| **Google Fonts** | `fonts.googleapis.com/css2?family=…` (Inter + JetBrains Mono on both the hub and the Spectrum page since the 2026-10-05 redesign) | `site/public/spectrum/index.html`, `site/src/index.css` | developers.google.com/fonts/docs/css2 | 2026-10-21 |

## Hosting and runtime

| Upstream | What the code assumes | Where | Check at | Last checked |
|:---|:---|:---|:---|:---|
| **Vercel** | `framework: "vite"`, `outputDirectory: "dist"`, SPA rewrite `/((?!api/).*)`; four Node functions in `site/api/` on default runtime settings | `site/vercel.json`, `site/api/*.ts` | vercel.com/changelog; vercel.com/docs/functions/runtimes/node-js/node-js-versions (supports 24.x default and 22.x) | 2026-10-21 |
| **Vercel Web Analytics** *(opt-in, audit PROD-14)* | `/_vercel/insights/script.js`, enabled on the project's Analytics tab (404 until it is). `window.va` queue before the script loads; `va('beforeSend', fn)` sees `{ type, url }` and may return `null` to drop or a copy with a new `url`; `va('pageview', { route, path })` sends a view of a path. Pageviews are free on Hobby; custom events need Pro. Headless and webdriver browsers are not counted | `site/public/counting.js` | vercel.com/docs/analytics/quickstart ; vercel.com/docs/analytics/limits-and-pricing | 2026-11-12 |
| **Org consent script** (`ai-automation-tools.dev/consent.js`) | `window.AILConsent` with `granted()` and `whenGranted(fn)` (runs now if granted, else on each later grant); absent off the public hosts and in a fork's build. `data-ail-consent="manage"` reopens the banner | `site/index.html`, `site/public/spectrum/index.html`, `site/public/counting.js` | The org landing repo's `consent.js` and `consent.test.mjs` | 2026-11-12 |
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
| motion | 14 | 14 | github.com/motiondivision/motion/releases | 2026-11-12 |
| lucide-react, dotenv | 1, 18 | 1, 18 | github.com/lucide-icons/lucide/releases, github.com/motdotla/dotenv/releases | 2026-11-12 |
| express (local dev server only) | 5 | 5 | github.com/expressjs/express/releases | 2026-11-12 |
| zod, recharts, react-markdown | 4, 3, 10 | 4, 3, 10 | each package's GitHub releases | 2026-11-12 |

Flag breaking majors, EOL runtimes, and security advisories only. Routine bumps are
Dependabot's job.
