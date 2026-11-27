---
name: edge-spectrum-registry
description: >-
  Add, change or debug Edge Spectrum's Cronsole templates and the line-archive scripts they run —
  the TEMPLATES and PACKS in site/scripts/build-registry.mjs, the generated catalog in
  site/public/registry/, the ESPN line collector (capture-lines.ts), the daily digest
  (digest-lines.ts), the Tiingo market-close collector (capture-closes.ts), and the daily
  registry-drift check. These files are held for the owner because
  a merge turns them into commands on other people's machines. Use for "add or change a Cronsole
  template", "build:registry --check failed", "registry drift failed", "the gallery doesn't show
  our template", "check:lines failed", "a game has no closing line in the digest", and any edit to
  build-registry.mjs, capture-lines.ts, digest-lines.ts, capture-closes.ts, site/public/registry/ or
  .github/workflows/registry-drift.yml.
---

# Cronsole templates and the line archive

**A template is a command that runs on a stranger's machine.** Edge Spectrum publishes a Cronsole
catalog at `https://edge-spectrum.ai-automation-tools.dev/registry/`; the Cronsole gallery reads it
and people import the templates into their own schedulers. Every rule below follows from that.

All commands run from **`site/`**.

---

## 1. Owner-held files

Treat a change to any of these as needing the owner's review. The org PR sweep holds a PR that touches
them, and `.github/CODEOWNERS` names the owner on the registry and its builder:

- `site/scripts/build-registry.mjs` and everything under `site/public/registry/`
- `site/scripts/capture-lines.ts`, `site/scripts/digest-lines.ts` and `site/scripts/capture-closes.ts`, the
  scripts the templates run
- `.github/workflows/*`, including `registry-drift.yml`

An unattended run may still edit them; it must say so under **Hold paths touched** in the PR body
and never merge.

## 2. The template contract

Edit `TEMPLATES` and `PACKS` in `build-registry.mjs`. **Never edit `site/public/registry/`**; it is
generated, deterministic, LF, and Cronsole verifies each file's sha256 over its exact bytes.

`validate()` enforces, and fails the build on:

| Rule | Why |
|:---|:---|
| `id` matches `edge-spectrum-<name>` | cannot collide with Cronsole's own ids |
| `commandTemplate` matches `COMMAND_SHAPE` | the only allowed command is `node "{{repoPath}}/site/node_modules/tsx/dist/cli.mjs" "{{repoPath}}/site/scripts/<name>.ts"` then `--flag {{param}}` pairs (audit AI-01) |
| every `{{placeholder}}` is a parameter | an unbound placeholder reaches the shell literally |
| a 5-field `schedule` trigger, known `compatibleTargets`, string defaults | Cronsole Registry v1, mirrored from `cronsole backend/src/catalog/schema.ts` |
| every template is linked from the root `README.md` as `https://cronsole.ai-automation-tools.dev/#/t/<id>` | the README is the human index of the gallery |

Rules it does **not** enforce, so you must:

- **Quote every path parameter** (`--out "{{outputDir}}"`). Parameter values are interpolated into
  the command; an unquoted path with a space splits.
- **Bump `version`** on any change to `commandTemplate`, `parameters` or `trigger`. Nothing checks
  it yet (audit OPS-12); an importer can't tell a changed template from the old one without it.
- **Keep `ESPN_NOTICE` and the README notice in step** (audit GOV-01). Change both or neither.
- **No new network target, no secret parameter.** The templates run the collector's default, ESPN,
  which needs no key; keep it that way. `--provider odds-api` (The Odds API, `ODDS_API_KEY` in
  `site/.env`) is a manual opt-in for self-hosters and never goes into a template.

Then:

```bash
npm run build:registry            # writes site/public/registry/
npm run build:registry -- --check # what CI runs: fails on stale output, a missing README link,
                                  # or a changed commandTemplate whose version didn't move (OPS-12)
```

## 3. The scripts the templates run

**`capture-lines.ts`** appends one JSON line per game to `<out>/<SPORT>/<YYYY-MM-DD>.jsonl`. It is
append-only: a run never rewrites or reorders a line. `linePhase` is decided at capture time and
never revised (`open`, `midday`, `close`, or `null` once the game has started); a game is "seen"
across the last 8 day files, so it gets one opener and one final. It exits 1 naming a sport whose
fetch failed; a sport with no games is a success. A line that does not parse and a game with no
usable start time are skipped with a warning. The day in the file name is ESPN's only when it is a
date; nothing else reaches a file name.

**`digest-lines.ts`** is read-only over the archive and writes `<archive>/digests/<day>.md`. It
follows a game into the neighbouring day files, reports a missing close as a gap rather than
showing the last pre-game line as a close, and exits 1 when the day has no capture file for any
sport, because that means the capture task did not run.

**`odds-api.ts`** (audit INT-06) shapes The Odds API's odds and scores like ESPN's parsed games, so
`capture-lines.ts --provider odds-api` writes identical records through the same phase rule. Its terms
allow storing the data for your own analysis, not redistributing it: nothing it captures is committed.

**`capture-closes.ts`** (`npm run capture:closes`, roadmap 5.3, audit INT-08) appends end-of-day prices
for named tickers from Tiingo to `<out>/<TICKER>.jsonl`, one line per trading day, written once. It needs
the self-hoster's own free key (`TIINGO_API_KEY` in `site/.env`), sent in an `Authorization` header and
never in a URL or a message, and rejects a ticker that is not a symbol before it reaches a request. Tiingo's
free plan is for personal use: nothing it captures is committed or published.

**`grade-lines.ts`** (`npm run grade:lines`, audit PROD-10) grades a CSV of the user's bets against
their archive, using the same `close` capture as the digest: EV at the de-vigged close, points gained,
results. A game with no close capture is never graded against a pre-game line. Local only.

**`npm run check:lines`** runs all five against recorded shapes with no network. A behaviour
change gets a case there; it must fail on the old code.

ESPN's endpoint is unofficial. Low volume, personal use, no republishing of captured lines by this
repo or its site (`docs/UPSTREAMS.md`, ESPN terms row).

## 4. When the drift check fails

`.github/workflows/registry-drift.yml` runs daily and after each production deploy. Its first
step, `node scripts/check-registry-published.mjs`, fetches the hosted `index.json`, compares every
path and sha256 with the committed one, hashes every served file, and checks
`Access-Control-Allow-Origin: *` (the gallery reads cross-origin; `site/vercel.json` sets it for
`/registry/`).

| It says | Means | Do |
|:---|:---|:---|
| `missing from the host` / `different sha256` | `main` changed the catalog and the deploy didn't land | redeploy `main` on Vercel (owner) |
| `served bytes don't match` | the host altered the files | check the Vercel headers and build output |
| `without Access-Control-Allow-Origin` | the header rule in `vercel.json` broke | fix the rule; it is a hold path |
| `not JSON (HTTP 404)` | the registry isn't deployed at all | redeploy |

Never "fix" drift by editing the committed catalog to match the host.

---

## 5. Checklist

1. Edit `TEMPLATES` / `PACKS` only; quote path parameters; bump `version` (the build refuses a changed `commandTemplate` without one).
2. README links every template id; the ESPN notice matches.
3. `npm run build:registry`, then `npm run build:registry -- --check`.
4. Script change → a case in `check:lines` that fails on the old code; `npm run check:lines`.
5. `npm run verify`: every check CI runs, in order.
6. PR body lists the hold paths touched. Do not merge.

## 6. Anti-patterns

- **Editing `site/public/registry/` by hand.** The sha256 in `index.json` stops matching.
- **A command that is not this repo's tsx running a script under `site/scripts/`.** `validate()`
  rejects it; don't loosen `COMMAND_SHAPE` to get past it.
- **Rewriting or re-sorting an archive file.** The archive is an honest log; append only.
- **Retrying the capture.** `execution.retries` is 0 on purpose: a retry logs a second capture.
- **Publishing captured lines** from this repo or its site.

---

## Related

| For | See |
|:---|:---|
| The ESPN fetch and parser both scripts call | `site/src/server/espn.ts`, and the `edge-spectrum-endpoint` skill |
| The live scoreboard tile on the hub | the `edge-spectrum-hub-tool` skill |
| Upstream terms and versions | the repo's `docs/UPSTREAMS.md` |
