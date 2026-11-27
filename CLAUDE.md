@AGENTS.md

# CLAUDE.md — Edge Spectrum (Claude-only notes)

Everything about the repo lives in `AGENTS.md` (imported above). This file holds only what is specific
to Claude Code.

## Project skills

The four project skills listed in `AGENTS.md` live in `skills/`. Claude Code loads them from
`.claude/skills/`, which is **gitignored here**, so link each one once per clone (a junction, so an
edit in `skills/` is live at once):

```powershell
Get-ChildItem skills -Directory | ForEach-Object { New-Item -ItemType Junction -Path ".claude/skills/$($_.Name)" -Target $_.FullName -Force }
```
