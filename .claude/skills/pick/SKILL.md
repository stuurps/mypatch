---
name: pick
description: Pick the next task from the Patch backlog
argument-hint: [backlog-id]
allowed-tools: [Read, Bash]
---

Read BACKLOG.md and TASKS.md.

If an argument was passed (e.g. `/pick B2`), go straight to that item. Otherwise:

Show the current backlog — Now tier first, then Next, then Later. For each item: ID, feature name, size, one-line rationale. Mark any that already have a Task number in TASKS.md.

Ask which item to work on.

Once chosen:
- **Already scoped in TASKS.md** (e.g. Task 18): confirm the spec and ask if ready to build.
- **Needs speccing** (e.g. B4): draft a full task entry in the style of existing tasks — design decisions, numbered checklist, DB changes if needed, Done when condition. Show the draft and ask for approval before adding it to TASKS.md.

Do not start building until explicitly asked to proceed.
