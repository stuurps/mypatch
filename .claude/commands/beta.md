---
description: Commit and push to main — GitHub Actions handles the EAS update to beta
model: claude-haiku-4-5-20251001
allowed-tools: Bash
---

Commit any pending changes and push to main. GitHub Actions will automatically run TypeScript checks and push an OTA update to beta testers.

Steps:

1. Run `git status` to check for uncommitted changes.

2. If there are uncommitted changes:
   - Run `git diff --stat` to summarise what changed
   - Stage relevant app files (never `git add -A` or `git add .` — add specific files)
   - Commit with a short descriptive message in plain English (no "fix:" prefixes)

3. Run `git push origin main`.

4. Report: what was committed (if anything), and confirm the push succeeded. Remind the user that GitHub Actions will now run the TypeScript check and push the OTA update to beta — they can watch progress at https://github.com/stuurps/mypatch/actions
