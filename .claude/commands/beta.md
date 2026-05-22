---
description: Push current changes to the beta app via EAS Update
model: claude-haiku-4-5-20251001
allowed-tools: Bash
---

Push the current state of the app to beta testers via `eas update`.

Follow these steps:

1. Run `git status` to check for uncommitted changes.

2. If there are uncommitted changes:
   - Run `git diff --stat` to summarise what changed
   - Commit all modified/untracked app files (exclude node_modules, .expo, dist) with a short descriptive message reflecting what changed
   - Use `git add` on specific files — never `git add -A` or `git add .`

3. Run `git log --oneline -3` to get the most recent commit messages.

4. Derive a short, human-readable update message from the recent commits — one sentence, plain English, no "fix:" prefixes. For example: "Added month stats to home screen" or "Journal auto-save improvements".

5. Run:
   ```
   eas update --branch preview --message "<your derived message>" --non-interactive
   ```

6. Report: what was committed (if anything), the update message used, and confirm the EAS update succeeded.

If `eas` is not found, tell the user to run `npm install -g eas-cli` first.
