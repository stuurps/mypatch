---
name: ship
description: Close a completed task — verify checklist, write release note, update backlog
argument-hint: [task-number]
allowed-tools: [Read, Write, Edit, Bash]
disable-model-invocation: true
model: haiku
---

Read TASKS.md. If a task number was passed (e.g. `/ship 19`), use that. Otherwise find the most recently in-progress task.

Work through this in order:

1. **Verify the checklist** — list each item and whether it's done. Flag anything incomplete.
2. **Check the Done when condition** — does it pass? If not, say so and stop.
3. **Ask about deferred items** — anything scoped but cut during the build?
4. **Write the release note** to `releases/T[N]-[slug].md`:

```
# T[N] — [Feature Name]
_Shipped: [today's date]_

## What shipped
- [Concrete bullet per shipped item]

## Key decisions
- [Non-obvious choices: rejected alternatives, tradeoffs, workarounds]

## Deferred / shelved
- [Anything cut from scope, with reason]

## Files changed
- [List of modified or created files]
```

5. **Update BACKLOG.md** — if anything was deferred, add it to the appropriate tier with a one-line rationale.
6. **Update memory/project-patch.md** — mark the task done in the task progress list.

Do not summarise what the code does. Summarise what was decided and why.
