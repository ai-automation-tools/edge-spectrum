<!-- One logical change per PR. See CONTRIBUTING.md. -->

## What and why

<!-- What does this change, and why? Link the roadmap item or issue. -->

## Checklist

- [ ] `npm run verify` passes in `site/`.
- [ ] A behaviour change has a case in the matching `check:*` script that fails on the old code.
- [ ] Dataset edits are in `site/src/data/edges.ts` only, with `npm run gen:edges` run, and every new or changed figure cites a source I read.
- [ ] No secrets, `.env` files or personal paths are committed.
- [ ] Docs that this change made untrue are updated (README, `docs/`, `AGENTS.md`), and `docs/CHANGELOG.md` has an entry.

## How I verified

<!-- What you ran or clicked, and anything you could not check. -->
