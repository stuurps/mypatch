---
name: research
description: Run a simulated focus group — create UK birder personas, review the app, generate and size new ideas, propose backlog additions
argument-hint: [wave-number]
allowed-tools: [Read, Write, Edit, Bash]
disable-model-invocation: true
---

You are running a product research session for Patch — a quiet, personal birding journal app for iOS (Expo SDK 55, offline-first, SQLite).

**The four product words that never change: quiet · personal · everyday · over time**

**Patch is not:** eBird feature completeness, Merlin species ID, gamification, social features, streaks, badges, or anything that only pays off after 12 months of data.

**The positioning in users' own words:** "I use Merlin to identify, I want Patch to remember."

---

## Step 1 — Read the app

Read these files before doing anything else. Do not skip any.

- `BACKLOG.md` — current backlog, existing customer signals, competitive landscape, shelved decisions
- `TASKS.md` — full task history: what shipped, what was deferred, and why
- Every file matching `releases/T*.md` — actual shipped features and the decisions behind them
- `app/(tabs)/index.tsx` — home screen (greeting, stats, keep an eye out, recent sightings)
- `app/(tabs)/log.tsx` — log a sighting (species autocomplete, count, time of day, conditions, session summary)
- `app/(tabs)/poster.tsx` — species poster / patch photo grid
- `app/(tabs)/journal.tsx` — journal tab

Determine the current wave number: find the highest "Wave N" entry in the Customer signals section of BACKLOG.md and increment by 1. If an argument was passed (e.g. `/research 4`), use that number instead.

---

## Step 2 — Create the focus group

Create 4 UK birder personas. These must be specific individuals, not archetypes. Each needs:

- **Name, age, rough location** (e.g. "near a canal in Leeds", "south London park")
- **Birding style** — how often, what kind of patch, what they track and how seriously
- **Current tools** — which apps or methods they use today (eBird, Merlin, BirdTrack, paper notebook, nothing)
- **What brought them to Patch** — what they hoped it would do
- **One thing that currently frustrates them** about their existing tools

Cover these four types — one persona each:
1. **Casual garden/park birder** — logs occasionally, probably has the RSPB app, values simplicity over depth
2. **Regular patch watcher** — the primary target user; committed to one local spot, goes 2–3× a week, wants something that feels like theirs rather than a database contribution
3. **Serious lister** — proper eBird user, keeps year lists and life lists; skeptical of Patch but genuinely curious about the journal angle
4. **Nature journaller** — writes more than they count; currently uses a physical notebook or nothing; drawn to Patch for the journal, less interested in the species stats

---

## Step 3 — Each persona reviews the app

For each persona, write a **first-person reaction** (4–6 sentences) to using Patch as it currently stands. Be honest and specific — include what delighted them, what confused them, and what was missing. Reference actual screen names and features by name (home greeting, session summary, patch photo, journal, etc.).

Then list exactly **2–3 things** this persona **wishes the app did**.

Keep each wish concrete and behavioural — not "better UX" but "I want to be able to see what I logged on a specific date without scrolling".

---

## Step 4 — Synthesise new ideas

Extract a consolidated list of new product ideas from the persona wishes. For each idea:

1. **Name** — short, feature-style (e.g. "Browse by month", "Quick re-log")
2. **One-line description** — what it does
3. **Persona signal** — which persona(s) surfaced it
4. **Duplicate check** — does it already exist in BACKLOG.md or TASKS.md? If yes, note which item and skip it

After deduplication, evaluate each surviving idea against the four product words:
- Does it deepen the relationship with one specific place?
- Does it serve a month-1 user (not just someone with 12+ months of data)?
- Does it make the app feel **calmer or busier**?

Flag any idea that conflicts with the principles. Include your reasoning — don't silently drop ideas that have tension, explain the tradeoff so the decision is visible.

---

## Step 5 — Size and prioritise

For each new idea, assign:

- **Size:** XS · S · M · L · XL
- **Tier:** Now / Next / Later — using the same criteria as BACKLOG.md:
  - *Now* — scoped and ready to build immediately
  - *Next* — clear direction, needs one scoping pass
  - *Later* — right idea, not yet ripe (needs more data, infrastructure, or a better format)
- **One-line rationale** for the tier placement

---

## Step 6 — Present the proposal

Show the new ideas as a single table in BACKLOG.md format, using the next available B-numbers (check BACKLOG.md for the current highest ID):

| ID | Feature | Size | Direction |
|---|---|---|---|
| B[N] | ... | S | ... |

Below the table, show a brief **Customer signals summary** for this wave — 3–5 bullet points capturing the key themes across all personas. This will be added to BACKLOG.md under a new Wave heading.

Then ask:

> **"Ready to add these to BACKLOG.md? Tell me which items to drop, rename, or reword — or say 'add all' to write them as-is."**

---

## Step 7 — Write to BACKLOG.md (only after explicit approval)

Once the user approves (with any edits):

1. Add a new **Wave N — [Month Year]** customer signals entry to the Customer signals section in BACKLOG.md, using the bullet summary from Step 6
2. Add approved items to the correct tier table (Now / Next / Later) — insert them at the bottom of the relevant section
3. Increment the backlog version line (e.g. `1.2 → 1.3`)

Do not touch BACKLOG.md before the user approves in Step 6. Do not add items to TASKS.md — that happens in /pick.
