# Contributing to Edge Spectrum

Thanks for helping. Edge Spectrum is a small, stateless education site: a dataset of expected
returns, a simulated sports backtester and a few calculators. Changes that keep it honest and small
are the ones that land.

## Before you start

Read [`AGENTS.md`](AGENTS.md) (how the repo is laid out and the rules that bite) and
[`docs/README.md`](docs/README.md) (the docs map and what every check holds). The open work is in
[`docs/ROADMAP.md`](docs/ROADMAP.md); an item there is a good place to start.

## Ground rules

- **Run everything from `site/`.** The whole web app lives there; the repo root holds only docs and data.
- **One logical change per pull request**, against `main`. `main` deploys to production, so CI must
  be green before anything merges.
- **Match the stack:** React 19, strict TypeScript, Tailwind v4, Vite. No new framework or
  dependency without a reason in the PR.
- **No secrets.** `.env*` is gitignored; [`site/.env.example`](site/.env.example) names every
  variable. The public demo runs in demo mode with no Gemini key, and must stay that way.
- **Don't claim what isn't built.** UI copy and docs describe what ships today.

## Changing the dataset

Every record lives in [`site/src/data/edges.ts`](site/src/data/edges.ts). Never edit the copies it
generates (the `RAW` block in `site/public/spectrum/index.html`, `site/public/spectrum/edges.json`,
`data/edge_dataset.md`); run `npm run gen:edges` instead.

- **Cite a source you read.** A record carries `source`, `asOf` (the date you checked it) and, where
  they apply, `window` and `methodology`. A `math` row must show its derivation.
- **Corrections are welcome.** If a figure disagrees with its source, change the figure, cite the
  source, and say so in [`docs/CHANGELOG.md`](docs/CHANGELOG.md). The
  [dataset correction](.github/ISSUE_TEMPLATE/dataset_correction.md) issue form works too.
- **New rows wait for coverage.** While a category cites a source for under half its rows,
  `npm run check:edges -- --write-baseline` refuses any new record. Citing existing rows is the
  contribution that lifts it. [`docs/data-architecture.md`](docs/data-architecture.md) has the details.

## Checks

```sh
cd site
npm ci
npx playwright install chromium   # once, for the browser check
npm run verify                    # every check CI runs, in order
```

There is no unit-test framework: the `check:*` scripts are the tests. A behaviour change gets a
case in the matching script that fails on the old code. What each check holds is listed in
[`docs/README.md`](docs/README.md#-testing--validation-invariants).

## Reviewed by the maintainer

Some paths turn into code that runs elsewhere: the Cronsole templates
(`site/scripts/build-registry.mjs`, `site/public/registry/`), the line scripts they run,
`.github/`, `site/vercel.json` and the server side (`site/api/`, `site/src/server/`).
[`.github/CODEOWNERS`](.github/CODEOWNERS) names the reviewer. Expect questions on these.

## Conduct

This project follows the [Code of Conduct](CODE_OF_CONDUCT.md).
