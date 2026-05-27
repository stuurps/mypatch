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

**Wave 3 — May 2026 (4 simulated personas — casual garden birder, regular patch watcher, serious lister, nature journaller):**
- History navigation is the most consistent unmet need across all persona types: data accumulates but there is no discovery layer beyond scrolling. B6 (browse by month) is the structural answer; B25 and B22 are the entry points.
- The log and journal feel like separate tools. Regular patch watchers retyping their sightings list into a journal entry is a real friction point — B20 (today's sightings in compose) addresses this without the B10 data model rethink.
- Journal search was named independently by two personas with no shared context (a serious lister and a nature journaller). Strong signal. B19.
- Crossover users who also submit to eBird feel locked out of their own data by JSON-only export. CSV is the smallest fix. B21.
- The app's quietness is explicitly valued — Birda's social layer and eBird's "form for someone else" feeling were both named as frustrations. Patch's non-competitive positioning is a genuine differentiator, not a gap.

**Wave 4 — May 2026 (4 simulated personas — casual garden birder, regular patch watcher, serious lister, nature journaller):**
- The stat boxes on home are trusted but static — tapping the numbers and having nothing happen is the clearest navigation gap in the app. The numbers want to be destinations. B26.
- "Last visit" is the missing temporal anchor: users know they were at the patch recently but the app doesn't reflect that rhythm back without scrolling. B27.
- Visit count (distinct days) surfaced independently as a distinct commitment measure — different from species count or record count. "I show up" is a real fact worth surfacing quietly. B28.
- Journal and sightings remain two tools cohabiting. B20 (compose) and B30 (read view) together close both halves of that gap without a data model rethink.
- The poster is named for the third consecutive wave as "the thing I'd show someone" — its emotional role as the proud accumulation moment is confirmed across all persona types.

**Recurring signals across all waves:**
- Milestone moments matter, but must not feel like achievement badges or gamification
- Users want the app to accumulate quietly and reward them with a sense of richness, not urgency
- "First 12 months" is the critical design target — don't build features that only pay off after a full annual cycle

---

## Backlog

### Now — scoped, ready to build

Ordered by priority. Build the top item next.

| ID | Feature | Task | Size | Why now |
|---|---|---|---|---|
| B25 | Home sighting row → species detail + FAB visual fix | Task 30 ✅ | XS | Tap home sighting row → species detail (not edit). Edit access moves to species detail sighting rows. FAB rectangular press artifact fixed by splitting shadow (wrapper View) from press clip (Pressable with overflow:hidden + android_ripple). |
| B24 | Journal entry preview quality | Task 31 ✅ | XS | Skip lines under 25 characters, show 2 lines instead of 1. Pure list-row UX — no new screen, no DB change. |
| B2 | User name in onboarding | Task 21 ✅ | S | "Personal above all" — opens warm personalisation throughout app |
| B3 | Month stats on home | Task 23 ✅ | S | "X species this month" — small count, immediate value, quick win |
| B21 | CSV export | shipped ✅ | XS | Shipped in commit a938c94 alongside haptic feedback — "Export as CSV" row in Settings, all sightings as date/species/count/time_of_day/conditions/notes/patch. |
| B26 | Stat drill-down | Task 33 ✅ | XS | Tapping a home screen stat box (This month / This year / All time) navigates to the filtered species list for that period. The numbers are already meaningful — they should be destinations. No new infrastructure; hooks into the existing species list with a period filter. |
| B27 | Last visit anchor | Task 33 ✅ | XS | A quiet line on the home screen showing when you last logged here and how many species. "Last visit: Tuesday · 6 species." Memory framing, not a countdown. One query (most recent sighting date + count for that day). Works from day 1. |

---

### Next — clear direction, needs one scoping pass

Ordered by priority. Top items are closest to being pulled into Now.

| ID | Feature | Size | Direction |
|---|---|---|---|
| B6 | Sighting history browse by month | Task 34 ✅ | M | Month navigator on History screen with left/right arrows. Sightings grouped by calendar day. Right arrow disabled at current month. Tap sighting → species detail. |
| B22 | Species records by month + residency context | M | On the species detail page, add a compact monthly breakdown — 12 months with your record count for each (dash if zero). Alongside this, show a residency label: "summer visitor / winter visitor / resident / passage migrant" derived from a new `residency` field in `data/species.ts`. The label gives context for the monthly pattern — your Swallow records clustering in Apr–Sep make sense immediately when you can see "summer visitor". For new users, even one May sighting gets biological framing. Requires adding `residency` to all 194 species in `data/species.ts` (small data work) and a new month-by-month DB query on species detail. The beginning of personal phenology — your own data against the bird's biology. |
| B19 | Journal keyword search | S | Search bar on the journal tab that filters entries by keyword. Works on prose body only. Entry point: search input above the entry list, collapsed until tapped. Zero config — works on day 1 even with a single entry. Named independently by two Wave 3 personas with no shared context (serious lister and nature journaller). |
| B20 | Today's sightings in journal compose | S | When opening the journal compose screen on a day where sightings have been logged, show a quiet read-only reference strip at the top: "You logged today: Robin · Kingfisher · 2 Coots." Not editable, not part of the saved entry — just context while writing. Prevents the "retyping my list into the journal" friction. No data model change; no tagging. Distinct from B10. |
| B28 | Visit count stat | S | Track and display the number of distinct calendar days with ≥1 sighting — "47 visits" alongside species/record counts. Placement (poster hero vs. home stats row) needs one scoping pass. A different measure of commitment than species count: the one that says "I show up." |
| B29 | Backdated journal entry | S | Date picker in the journal compose screen so you can set the entry date to when you were actually out — not when you're writing. Lets the reflective writer work at their own pace. Main scoping question: how backdating affects the Today/Yesterday section grouping in the entry list. |
| B30 | Sightings strip in journal read view | S | When reading a past journal entry, a quiet strip shows what you logged on the same date: "You logged: Robin · Kingfisher · 2 Coots." Same date-lookup infrastructure as B20. Closes the loop between the data layer and the narrative layer — B20 is the compose half, B30 is the read half. |
| B14 | Quick re-log | M | Regular patch visitors see the same birds daily. "Log again" shortcut from species detail or recent sightings list — reduces the daily logging habit to two taps. Entry point: button on species detail page + long-press on a sighting row. |
| B4 | Session summary | Task 22 ✅ | M | After logging one or more sightings: a quiet closing moment before leaving the log screen. Not a report card — a punctuation mark. "Today at Fowlmere: Robin · Kingfisher · 2 Coots." Warm and brief. |
| B5 | Milestone callouts on poster | Task 29 ✅ | S | On reaching 10, 25, 50 species at a patch: a quiet one-time callout in the hero — not a badge, not a streak. Something worth marking, said once. |
| B11 | Settings screen | Task 24 ✅ | M | Profile settings (edit display name, edit patch name) + a user guide + contact route. |
| B12 | Empty states + first sighting prompt | Task 26 ✅ | S | Warmer empty-state copy on home, poster, and journal. First sighting prompt on home until first log. |
| B15 | Journal editing audit | Task 27 ✅ | S | Auto-save-on-back verified across all back paths including iOS swipe and Android hardware back. |
| B16 | Data export | Task 28 ✅ | S | JSON export of all sightings + journal entries via native share sheet. |
| B17 | Species list — gaps + free-text fallback | Task 25 ✅ | S | 194-species list + free-text "not in list" fallback. |

---

### Later — right idea, not yet ripe

Ordered by pull-forward likelihood — top items are closest to being promoted to Next.

| ID | Feature | Size | Why later |
|---|---|---|---|
| B18 | Personalised phenology prompt | M | The right replacement for the removed "Keep an eye out" section: "You haven't logged a Swift yet this year — it's peak season." The right version uses your own patch history and degrades gracefully for new users via seasonal data alone. Getting riper — some users now have a full season of data. Not quite ready: need a format decision on where it lives on home without pushing sighting history down. |
| B23 | Photo in journal entry | M | Attach one photo per journal entry, shown quietly at the top of the entry view — the Day One model, not a gallery. Real user need (Wave 3 journaller persona). Conflicts with the "prose only" design principle from Task 19. Resolve that tension before building. |
| B1 | Second patch (max 2) | L | Structural gap; 2/4 Wave 2 personas; spec'd in TASKS.md. Deprioritised May 2026 — activation problem takes precedence. |
| B7 | "On this day" contextual moments | M | Surfaces historical moments on home — "You first heard a Cuckoo here two years ago today." Requires 1y+ of data to feel magical rather than empty. |
| B10 | Journal × sightings integration | XL | Birds tagged within a journal entry instead of as separate sighting records. The deeper version of "one session = one entry." Major rethink of the data model and both UIs. Not v1. |
| B8 | Annual recap — "A year at [patch]" | L | End-of-year summary screen — the full story of 12 months in one view. Only payable once a full cycle has passed. Design target: the thing someone screenshots on 31 Dec. |
| B9 | iOS widget — species count | L | Ambient count on the home screen — today's species, this year's total. Requires native iOS target. Build post-stabilisation. |

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

*Backlog version: 1.5 — May 2026*
*Read alongside: WORKFLOW.md, TASKS.md, patch-project-context.md*
