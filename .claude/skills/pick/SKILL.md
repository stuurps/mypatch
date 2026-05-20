---
name: pick
description: Pick the next task from the Patch backlog
argument-hint: [backlog-id]
allowed-tools: [Read, Bash, Edit]
---

Read BACKLOG.md, TASKS.md, and patch-project-context.md.

If an argument was passed (e.g. `/pick B2`), go straight to that item. Otherwise:

Show the current backlog — Now tier first, then Next, then Later. For each item: ID, feature name, size, one-line rationale. Mark any that already have a Task number in TASKS.md.

Ask which item to work on.

Once chosen:
- **Already scoped in TASKS.md** (e.g. Task 18): confirm the spec and ask if ready to build.
- **Needs speccing** (e.g. B4): draft a full task entry in the style of existing tasks — design decisions, numbered checklist, DB changes if needed, Done when condition. Show the draft and ask for approval before adding it to TASKS.md.

When drafting a spec, verify it against the four product words: **quiet · personal · everyday · over time**. Call out which principle(s) the feature serves, and flag anything in the spec that would conflict with them (gamification, social comparison, features that only pay off after 12 months of data, anything that makes the app feel busier).

Do not start building until explicitly asked to proceed.
Do not add the task to TASKS.md until the spec is approved.
