# API reference

*The four HTTP endpoints, five method and path pairs, that the site's pages call.*
[← Docs](README.md)

Every endpoint is served twice: by a Vercel function in `site/api/` in production, and by the
Express server in `site/server.ts` in local dev. Both are thin adapters over one function in
`site/src/server/`, which is where the behaviour below lives. Every response is JSON, and every
error body is `{ "error": string }`, plus `details` where noted.

| Method | Path | Shared logic | Auth |
|:---|:---|:---|:---|
| `POST` | `/api/backtest` | `backtestRoute` in `src/server/backtest.ts` | none |
| `GET` | `/api/espn-scoreboard` | `espnScoreboardRoute` in `src/server/espn.ts` | none |
| `GET` | `/api/advisor-auth` | `sessionStatus` in `src/server/auth.ts` | none |
| `POST` | `/api/advisor-auth` | `attemptUnlock` / `logout` in `src/server/auth.ts` | full mode only |
| `POST` | `/api/strategy-advisor` | `advisorRoute` in `src/server/advisor.ts` | full mode and a session cookie |

On Vercel each function answers **405** to any other method. Locally, Express sends a method it
has no route for to the SPA instead, and answers malformed JSON with its own 400 page rather than
the JSON error below.

---

## `POST /api/backtest`

Runs one strategy over the simulated seasons. Nothing leaves the server.

**Body:** a strategy, validated by `strategySchema` in `src/server/strategySchema.ts` (bounds and
lists in `src/strategyBounds.ts`):

| Field | Type | Rule |
|:---|:---|:---|
| `sport` | string | `NFL`, `NBA`, `MLB` or `NHL` |
| `startYear`, `endYear` | integer | 2000 to 2025, `endYear` not before `startYear` |
| `betType` | string | `moneyline`, `spread` or `totals` |
| `sideSelection` | string | one of `SIDE_SELECTIONS`; `over` and `under` only with `totals`, and only they |
| `streakFilter` | string | `any` (default), `after_win`, `after_loss`, `hot_streak_3plus`, `cold_streak_3plus`; must be `any` for `totals` |
| `unitSize` | number | above 0, at most 1,000,000 |
| `startingBankroll` | number | above 0, at most 1,000,000,000 |
| `oddsMin`, `oddsMax` | number, optional | American odds within ±100,000 |
| `spreadMin`, `spreadMax` | number, optional | 0 to 100 points |
| `totalMin`, `totalMax` | number, optional | 0 to 500 points |
| `id` | string, optional | at most 128 characters |

A min above its max is rejected (`rangeIssues`).

**200:** `BacktestResponse` (`src/types.ts`): `summary` (bets, win rate, ROI, drawdown, Kelly,
breakeven, Wilson interval, p-value, and `bustedAtBet` / `bustedOn` when the bankroll ran out),
`profitHistory` (thinned to at most 1,500 points), `gamesPreview` (the last `previewLimit` wagers)
and `totalGames`.

| Status | When |
|:---|:---|
| 400 | Body is not valid JSON, or fails the schema. `details` lists each issue |
| 500 | The engine failed |

## `GET /api/espn-scoreboard`

A proxy for ESPN's unofficial public scoreboard. See the ESPN rows in [`UPSTREAMS.md`](UPSTREAMS.md).

**Query:** `sport` (`NFL` default, `NBA`, `MLB`, `NHL`; case-insensitive), `date` (optional,
`YYYYMMDD` or `YYYYMMDD-YYYYMMDD`). Each may appear once.

**200:** `{ sport, date, games[] }`; each game carries ids, teams, scores, status and the book's
spread, total and moneylines where ESPN sends them. On Vercel the 200 carries
`Cache-Control: s-maxage=30, stale-while-revalidate=120`.

| Status | When |
|:---|:---|
| 400 | Unknown sport, malformed date, or a parameter given twice |
| 504 | ESPN did not answer within 8 seconds |
| 500 | ESPN answered with an error or something unreadable |

## `GET /api/advisor-auth`

Reports the advisor's state so the page knows what to show. Never an error.

**200:** `{ mode: "demo" | "full", configured: boolean, authed: boolean }`. `configured` is true
when both `ADVISOR_PASSCODE` and `ADVISOR_SECRET` are set. Sent with `Cache-Control: no-store`.

## `POST /api/advisor-auth`

**Body:** `{ "passcode": string }` to open a session, or `{ "action": "logout" }` to close it.

**200:** `{ authed: true }` with a `Set-Cookie` for the 7-day session (`HttpOnly`, `SameSite=Lax`,
`Secure` in production), or `{ authed: false }` with a clearing cookie on logout. Sent with
`Cache-Control: no-store`.

| Status | When |
|:---|:---|
| 401 | Wrong passcode |
| 403 | Demo mode (`EDGE_SPECTRUM_MODE` is not exactly `full`) |
| 429 | Too many failed attempts; try again in a few minutes |
| 503 | Full mode without `ADVISOR_PASSCODE` or `ADVISOR_SECRET` |

## `POST /api/strategy-advisor`

Asks Gemini about a strategy, or about the Edge Spectrum dataset. This is the only endpoint that spends
money, so it fails closed. A question whose words match activity names or categories carries those rows
(figure, basis, source, check date) into the prompt, at most 12, and the model is told to answer from them
and name their sources (`src/server/edgeContext.ts`, audit PROD-15). Demo mode never calls the model, so it
is unchanged.

**Body:** `{ "prompt": string, "currentStrategy"?: Strategy, "lastRun"?: BacktestSummary }`. The prompt is
required and at most 1,000 characters. `lastRun` is the run on screen; only its finite numbers reach the
model, rounded (`runContext`).

**200:** `{ analysis: string, suggestedTemplates: StrategyTemplate[] }`, validated by `parseAdvice`
before it is sent; a template the backtest schema would reject is dropped.

| Status | When |
|:---|:---|
| 400 | Body is not valid JSON, the prompt is missing or empty, or it is over 1,000 characters |
| 401 | No valid session cookie |
| 403 | Demo mode |
| 429 | Over 10 calls in an hour for this session or this address |
| 502 | The model's reply was empty, not JSON, or not the asked-for shape |
| 503 | Not configured (as above), or the day's `ADVISOR_DAILY_LIMIT` is spent |
| 504 | The model did not answer in time |
| 500 | The model could not be reached (key or model id wrong) |

The limits are held in process memory, so each server instance counts on its own.

---

`npm run check:deployment` holds the gate, the limits and the 400 / 404 / 504 answers of these
handlers with no network call. A change to any status code above belongs in that script too.
