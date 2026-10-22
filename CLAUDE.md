@AGENTS.md

# CLAUDE.md — Edge Spectrum (Claude-only notes)

Everything about the repo lives in `AGENTS.md` (imported above). This file holds only what is specific
to Claude Code.

## Installed project skills

The three project skills listed in `AGENTS.md` are installed into `.claude/skills/`. `.claude/` is
**gitignored here**, so the installed copies are local to your clone and a fresh clone starts without
them. Re-install after cloning, and after editing them upstream:

```powershell
pwsh <agent-skills>/scripts/install-skills.ps1 -Project edge-spectrum -Destination <clone>/.claude/skills
```
