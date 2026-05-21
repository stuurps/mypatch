# Patch — Development Workflow

The loop is always the same: **BACKLOG → TASK → BUILD → RELEASE NOTE**

Every shipped task gets a release note. No exceptions.

---

## Step 1 — Pick from the backlog

Open `BACKLOG.md`. Find the feature you want to build. Note its ID (e.g. B2) and its Task number if it already has one (e.g. Task 18).

**If the task is already scoped in TASKS.md** (e.g. Task 18):
Use the build prompt in Step 2 directly.

**If the task needs speccing first** (e.g. B4 Session summary):
Use this prompt:

```
Read BRIEF.md, patch-project-context.md, and BACKLOG.md.
I want to build [B# — Feature name].
Create Task [N] in TASKS.md for this feature, following the format of existing tasks.
Include: design decisions, a numbered checklist, DB changes if needed, and a Done when condition.
Do not start building yet — confirm the spec with me first.
```

---

## Step 2 — Build

Once the task is spec'd and agreed, use this prompt:

```
Read BRIEF.md and patch-project-context.md.
Complete Task [N] from TASKS.md.
Do not build anything outside the scope of that task.
When done, confirm which checklist items are complete.
Then create releases/T[N]-[slug].md using the release note format in WORKFLOW.md.
```

The release note step is **mandatory and part of the build prompt**. It is not a separate session.

---

## Step 3 — Release note

Every completed task gets a release note at `releases/T[N]-[slug].md`.

**Slug format:** lowercase, hyphens, short — e.g. `T19-journal-mvp`, `T20-sightings-summary`

**Release note format:**

```md
# T[N] — [Feature Name]
_Shipped: [YYYY-MM-DD]_

## What shipped
- [Bullet list of what actually shipped — concrete, not vague]

## Key decisions
- [Non-obvious choices made during the task — the kind that would confuse a future reader if not recorded]
- [Include: rejected alternatives, why a simpler/different approach was used, tradeoffs made]

## Deferred / shelved
- [Anything that was in scope but cut, with reason — this is the seed of a future backlog item]

## Files changed
- [List of files modified or created]
```

Do not summarise what the code does. Summarise what was decided and why.

---

## After every session

Before ending a session where a task was completed:

1. Check off all completed items in TASKS.md
2. Run `/simplify` to review changed code for quality
3. Write `releases/T[N]-[slug].md`
4. Update `memory/project-patch.md` task progress if the task status changed

---

## The test

Before marking a task done, ask:

- Does the done-when condition pass on a real device?
- Is the release note written?
- Did anything get deferred that should go back into BACKLOG.md?

---

*Workflow version: 1.0 — May 2026*
