# Patch — Product Backlog

> Pick a feature. Start a session. Ship it. Write the release note.
> See `WORKFLOW.md` for the exact process.

---

## Product position

**USP in three sentences:**

Patch is the only birding app about one specific place, not one specific species. Where eBird asks "what was seen here?" and Merlin asks "what is this?", Patch asks "what does your patch feel like today, and how has it changed since you started watching?" The journal is the core differentiator — the narrative layer no citizen science tool will ever want.

**The four words that never change:** quiet · personal · everyday · over time

---

## Competitive landscape

| App | What it does | Why people keep using Patch instead |
|---|---|---|
| eBird | Global citizen science database — sightings, maps, species counts | Pure data, no personality, no sense of place, no story |
| Merlin | Instant species ID from photo or sound | One-shot; logs nothing; forgets everything |
| BirdTrack (BTO) | Science-grade transect and garden recording | Formal, complex, designed for monitoring not memory |
| Bird Journal | Simple life list and patch list | Species-first; no narrative; no place-based intimacy |
| iNaturalist | Multi-taxa community ID + records | Crowdsourced, evidence-based; not about your patch |

**Where Patch lives:** The gap between Merlin (I don't know what this is) and eBird (I want to submit a scientific record). The space where birding is personal, reflective, and not public. The app for people who know their local footpath better than any field guide does.

---

## Customer signals

**Wave 1 — May 2026 (7 participants):**
- Users were logging duplicate species because they couldn't see what they'd already logged today → fixed in Task 16
- Conditions picker should remember last selection within a session → fixed in Task 11
- Species detail page was the most requested unbuilt feature — "I want to know the full story of a bird at my patch" → built in Task 15
- Common phrase: "I use Merlin to identify, I want Patch to remember." This is the positioning in users' own words.
- Several users said the app "feels more honest" than eBird — they log in Patch for themselves, not to contribute to a database

**Wave 2 — May 2026 (4 simulated personas):**
- 2 of 4 named the journal as the most anticipated unbuilt feature — specifically the absence of structure ("no forms, just write")
- 2 of 4 wanted a second patch (home garden + regular walking route)
- All 4: tension between fast field log and reflective journal entry — they want both, but distinctly separated
- The poster/species grid was cited as "the thing I'd show someone" — the shareable moment

**Recurring signals across both waves:**
- Milestone moments matter, but must not feel like achievement badges or gamification
- Users want the app to accumulate quietly and reward them with a sense of richness, not urgency
- "First 12 months" is the critical design target — don't build features that only pay off after a full annual cycle

---

## Backlog

### Now — scoped, ready to build

These have enough spec to start a task session immediately.

| ID | Feature | Task | Size | Why now |
|---|---|---|---|---|
| B2 | User name in onboarding | Task 21 ✅ | S | "Personal above all" — opens warm personalisation throughout app |
| B3 | Month stats on home | Task 23 | S | "X species this month" — small count, immediate value, quick win |

---

### Next — clear direction, needs one scoping pass

These have a strong idea and user signal but need a task spec before building.

| ID | Feature | Size | Direction |
|---|---|---|---|
| B4 | Session summary — Task 22 ✅ | M | After logging one or more sightings: a quiet closing moment before leaving the log screen. Not a report card — a punctuation mark. "Today at Fowlmere: Robin · Kingfisher · 2 Coots." Warm and brief. Clears on next visit. |
| B5 | Milestone callouts on poster — Task 29 ✅ | S | On reaching 10, 25, 50 species at a patch: a quiet one-time callout in the hero — not a badge, not a streak. Something worth marking, said once. Uses the settings table (already exists) to ensure it fires once only. |
| B6 | Sighting history browse by month | M | "Show me what I logged in October." Month picker → sightings for that period. Temporal memory — the thing that makes a year feel like a story, not a list. This is the core of the "over time" USP; without it, users have no way to navigate their history except scrolling. |
| B11 | Settings screen — Task 24 ✅ | M | Profile settings (edit display name, edit patch name) + a user guide covering how to log, edit, and delete sightings + a "Contact us" section for feature requests and feedback. The guide should live inside the app — not a link out — so it feels native and personal. Contact route is email or a simple form, nothing social. |
| B12 | Empty states + first sighting prompt — Task 26 ✅ | S | Two sides of the same activation problem. (1) Empty states: home, poster, and journal all need warmer copy before a user's first log — the current "Nothing logged yet" is functional but cold after a four-screen onboarding. (2) First sighting prompt: a quiet one-time nudge on home — "Your patch is set. What's out there today?" — visible until first log, then gone permanently. Not a modal, not a banner. Store seen state in the settings table. Together these bridge the gap between onboarding completion and the first logged bird. |
| B14 | Quick re-log | M | Regular patch visitors see the same birds daily. "Log again" shortcut from species detail or recent sightings list — reduces the daily logging habit to two taps. Entry point: button on species detail page + long-press on a sighting row. |
| B15 | Journal editing audit — Task 27 ✅ | S | Verify the auto-save-on-back flow works reliably end to end. Confirm edit, delete, and compose all handle edge cases (empty body, accidental back, etc.). Fix any gaps. |
| B16 | Data export — Task 28 ✅ | S | Users who log for months shouldn't risk losing everything on reinstall or new phone. Add "Export your data" to Settings — produces a JSON file (sightings + journal entries) shared via the native share sheet. Users can save to Files or email to themselves. iCloud sync is the proper v2 solution; this buys trust in the meantime. |
| B17 | Species list — gaps + free-text fallback — Task 25 ✅ | S | Current list (87 species) is missing Tawny Owl, Herring Gull, Common Gull, Marsh Tit, Lesser Redpoll — all regular UK patch birds. Add them to the array. Also add a free-text fallback so users can log any species not in the list ("Other — type a name") without being blocked. A birder who tries to log "Tawny Owl" and can't find it will lose trust immediately. |

---

### Later — right idea, not yet ripe

These need either more data to be meaningful, a stronger format idea, or post-v1 infrastructure.

| ID | Feature | Size | Why later |
|---|---|---|---|
| B1 | Second patch (max 2) | L | Structural gap; 2/4 Wave 2 personas; spec'd in TASKS.md. Deprioritised May 2026 — activation problem takes precedence. |
| B7 | "On this day" contextual moments | M | Surfaces historical moments on home — "You first heard a Cuckoo here two years ago today." Requires 1y+ of data to feel magical rather than empty. Should degrade gracefully for new users. |
| B8 | Annual recap — "A year at [patch]" | L | End-of-year summary screen — the full story of 12 months in one view. Beautiful but only payable once a full cycle has passed. Design target: the thing someone screenshots and shares on 31 Dec. |
| B9 | iOS widget — species count | L | Ambient count on the home screen — today's species, this year's total. Requires native iOS target. Build post-stabilisation. |
| B10 | Journal × sightings integration | XL | Birds tagged within a journal entry instead of as separate sighting records. The deeper version of "one session = one entry." Major rethink of the data model and both UIs. Not v1. |
| B18 | Personalised phenology prompt | M | Replace the removed "Keep an eye out" section with a patch-aware prompt: "You haven't logged a Swift yet this year — it's peak season." Generic seasonal suggestions (the v1 version) were removed May 2026: same 3 species shown to every user, changed only 4×/year, pushed sighting history further down the screen. The right version uses your own patch history — "you logged your first Swallow on 14 April last year" — and degrades gracefully for new users via seasonal data alone. Needs at least one season of data to feel personal rather than generic. |

---

### Shelved — actively decided against

| Feature | Decision | Reason |
|---|---|---|
| Keep an eye out (generic) | Removed May 2026 | Static seasonal list, same for every user, changed 4×/year. Pushed sighting history down the screen without adding patch-specific value. Replaced by nothing for now; the right version (B18) is personalised to your own history. |
| Firsts screen | Shelved May 2026 | Too similar to species list with a date. Right concept, wrong format. Revisit only if a clearly distinct presentation emerges. |
| Seasons tab | Deprioritised May 2026 | Only meaningful after a full year of data. Doesn't degrade gracefully for month-1 users. |
| Species photo / ID hint | Out of scope | Send users to Merlin. Adding ID features changes what Patch is. |
| Auto-save patch photo monthly | Out of scope | Manual screenshot is sufficient and already in use. |
| Family / multi-user | Different product | Requires different architecture and product surface. |
| Leaderboards / streaks / push notifications | Never | Antithetical to product principles. |
| eBird import | V2 | Right direction; wrong timing. Frame as "bring your history" on onboarding when it ships. |

---

*Backlog version: 1.3 — May 2026*
*Read alongside: WORKFLOW.md, TASKS.md, patch-project-context.md*
