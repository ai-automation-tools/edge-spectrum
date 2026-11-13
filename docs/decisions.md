# Edge Spectrum — Decisions

*The choices that still hold, in one table, so nobody has to dig them out of the roadmap.* ·
[Docs home](README.md) · [Roadmap](ROADMAP.md) · [Change log](CHANGELOG.md)

One row per standing decision: when it was made, what it is, why, and where it's enforced or written up.
Change a decision by editing its row in the same PR as the change, with the new date. This is a table,
not an ADR process (audit DOC-18).

| Date | Decision | Why | Where |
|:---|:---|:---|:---|
| 2026-09-03 | The Phase 2 release gate holds back only work that consumes the edge dataset or the simulator's output. Calculators that are pure client-side math ship ahead of it. | The gate exists so exports and public features don't bake in wrong numbers; a calculator with no dependency on either can't. | [ROADMAP.md](ROADMAP.md#-release-gate-and-execution-order), gate scope and gate status notes |
| 2026-09-11 | A deploy runs in **demo mode** unless `EDGE_SPECTRUM_MODE` is exactly `full`. The public demo holds no Gemini credentials. | A fork or the public site must never spend a key by accident. The server enforces it, not the browser. | [self-hosting.md](self-hosting.md), `site/src/server/deployment.ts`, `check:deployment` |
| 2026-09-11 | The Spectrum page's data and math are **inlined** in `site/public/spectrum/index.html`, not fetched. | `check:spectrum` lifts them out of the deployed file and runs them, so the test covers what ships. | [AGENTS.md](../AGENTS.md), `site/scripts/check-spectrum.ts` |
| 2026-09-29 | Dependabot ignores **npm majors**. Minor and patch bumps arrive grouped weekly; Actions majors still come through. | A major needs reading, not a bot merge. The biweekly upstream check flags one that matters, and security alerts fire for any version. | `.github/dependabot.yml`, [UPSTREAMS.md](UPSTREAMS.md) |
| 2026-11-10 | The line archive is **local append-only JSONL**, one file per sport per scoreboard day, with no database. | No account, cost or secrets. A hosted store can ingest the files later if lines ever go on the site (Action 5.4). | [ROADMAP.md](ROADMAP.md) Action 5.1, [data-architecture.md](data-architecture.md#a-append-only-scoreboard-line-snapshots) |
| 2026-11-12 | **Dataset freeze:** no record is added while any category cites a source for fewer than half its rows. | Coverage was falling behind growth (audit PROD-08). Citing existing rows comes first. | `MIN_CITED_SHARE` in `site/src/data/edges.ts`, `check:edges` |
| 2026-11-12 | **Every sport stays simulated.** No historical line data is committed or served. | Of 16 historical-line datasets checked, none can be served: the one with an open licence doesn't say where its lines come from (audit PROD-12, owner's decision). | [ROADMAP.md](ROADMAP.md) Action 7.1, [UPSTREAMS.md](UPSTREAMS.md) |
| 2026-11-12 | **No accounts.** Every tool keeps its state in the URL. | Accounts meant a database, auth and personal data for no feature that needs them (audit PROD-22). | [ROADMAP.md](ROADMAP.md) Phase 7 |
| 2026-11-12 | The dataset is published as **static files** (`edges.csv`, `edges.json`, `datapackage.json`) and dataset releases, not an `/api/edges` endpoint. | Static files are free to serve, cacheable and versioned by release (audit INT-07). | [ROADMAP.md](ROADMAP.md) Action 7.4, `site/public/spectrum/` |
| 2026-11-12 | **Page counts are opt-in**: nothing is counted unless the visitor accepts the org's consent banner. | Privacy by default; the embed and forks load no counting script. | `site/public/counting.js`, [CHANGELOG.md](CHANGELOG.md) (November 12, opt-in page counts) |
| 2026-11-13 | **Market closes come from Tiingo**, with each user's own free key. | Stooq puts a bot check in front of its data and Yahoo's terms forbid automated access; Tiingo's free plan allows personal use. | `site/scripts/capture-closes.ts`, [README.md](../README.md#3-espn-line-capture-scheduled-local), [UPSTREAMS.md](UPSTREAMS.md) |
| 2026-11-13 | The Content-Security-Policy is **enforced**, and the `/spectrum/` and `/diagram/` policy carries no `frame-ancestors`. | `?embed=1` has to stay frameable by other sites; `X-Frame-Options` and the app policy keep every other route same-origin. | `site/vercel.json`, `check:deployment` |
| 2026-11-13 | A first visit opens in **dark**; the OS light/dark setting is not followed. | The org's web house style defaults to dark, and the switch remembers a reader's choice (audit UX-21, closed). | `site/src/theme.ts` |
| 2026-11-13 | **No MCP server.** Agents and scripts read the two public JSON files instead. | Both are static, open to any origin and versioned with the site; a server would add hosting for nothing they can't already do (audit AI-12). | [README.md](../README.md#for-agents-and-scripts) |
