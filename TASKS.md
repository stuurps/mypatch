# Patch — Tracer Bullet Build Tasks

Work through these in order. Each session is a single completable unit.
Start every session with: "Read BRIEF.md and complete task [N] from TASKS.md."

---

## Task 1 — Foundation ✅

- [x] Set up Expo Router file-based navigation structure
- [x] Create `tokens.ts` with all design tokens (colours, type, spacing, radius)
- [x] Create `data/species.ts` with full UK species list
- [x] Create `data/phenology.ts` with seasonal species data and `currentSeason()` helper
- [x] Create `db/database.ts` — SQLite init, schema creation, helper functions
- [x] Schema: `patches` and `sightings` tables with correct indexes
- [x] `PatchProvider` context with `useReducer` — wraps the root layout
- [x] On launch: check SQLite for existing patch. If none → redirect to `/onboarding`. If exists → go to `/(tabs)`.

**Done when:** App launches, redirects correctly, no crashes.

---

## Task 2 — SkyHero component ✅

- [x] Build `components/SkyHero.tsx`
- [x] Props: `bands: string[]`, `height: number`, `children?: ReactNode`
- [x] Renders 12 stacked band Views, each 40px tall
- [x] SVG treeline using `TREE1` and `TREE2` point arrays from `tokens.ts`
- [x] Ground fill below treeline
- [x] Bottom scrim gradient overlay (transparent → near-opaque dark)
- [x] Top scrim (subtle, for status bar legibility)
- [x] Children render above scrim at absolute bottom

**Done when:** SkyHero renders correctly with `SKY_SUNRISE`, `SKY_DAY`, and `SKY_SUNSET` bands in isolation.

---

## Task 3 — Onboarding ✅

- [x] `app/onboarding/index.tsx` — Step 1: Welcome
  - Sky: `SKY_SUNRISE`, full screen SkyHero
  - Welcome tag, headline, subline, `Get started` CTA (always active)
  - No back button
- [x] `app/onboarding/name.tsx` — Step 2: Name your patch
  - Sky: `SKY_DAY`
  - Back button (circular, semi-transparent, top left)
  - Text input, auto-focused on mount
  - `Continue` CTA disabled until input has content
- [x] `app/onboarding/size.tsx` — Step 3: Patch size
  - Sky: `SKY_SUNSET`
  - Back button
  - Patch name carried forward into headline via route param
  - Three radius pills: 1km / 5km / 10km — default 5km selected
  - `Start watching` CTA (always active)
  - On confirm: write patch to SQLite → navigate to `/(tabs)`
- [x] Step indicator dots centred in top bar across all 3 steps
  - Active dot: amber, wider pill shape
  - Inactive dots: white at low opacity

**Done when:** Full onboarding flow completes, patch written to SQLite, redirects to home.

---

## Task 4 — Patch home ✅

- [x] `app/(tabs)/index.tsx` — Patch home screen
- [x] SkyHero header (`SKY_SUNRISE`), patch name in small caps amber, no stats in hero
- [x] Stats row below hero (parchment background)
  - Two boxes: `This year` count + `All time` count
  - Read from SQLite — count distinct species per year / all time
  - Big number, muted label beneath
- [x] `Keep an eye out` section
  - 3 species from `phenology.ts` for current season
  - Each row: species name + hint text + amber dot
  - Full opacity dot = imminent, low opacity = possible
  - Always show for now (v2 logic: hide after 12 months of data)
- [x] `Recent sightings` section
  - Most recent first from SQLite
  - Each row: species name + date/notes meta + count
  - Count hidden if 1
  - Scrollable list
- [x] FAB — amber circle `+`, absolute bottom centre
  - Navigates to log screen
- [x] Toast component
  - Appears above FAB
  - `[Species] logged` — dark background
  - `[Species] — new for your patch` — amber-tinted background
  - `[Species] — first of the year` — amber-tinted background
  - Auto-dismiss after 2.4s
- [x] Empty state — no sightings yet, quiet prompt to log first sighting

**Done when:** Home loads patch name, counts, keep an eye out panel, and recent sightings from SQLite.

---

## Task 5 — Log a sighting ✅

- [x] `app/(tabs)/log.tsx` — Log a sighting (modal)
- [x] Header: dark forest green (`#2d3b2a`), back chevron, `Log a sighting` title
- [x] Species autocomplete
  - Text input, placeholder `Start typing…`
  - Filters `SPECIES` from 2 characters
  - Max 6 results shown
  - Each result: species name + hint
    - `on your patch` — muted grey (species logged before)
    - `new for your patch` — amber (never logged on this patch)
    - `expected soon` — amber (phenology species for current season)
  - Tap to select, collapses dropdown
- [x] Count stepper
  - `−` and `+` circular amber buttons
  - Min count: 1
- [x] Notes field (optional)
  - 2-row textarea, placeholder `e.g. riverside hide, singing male…`
  - Below the fold — doesn't demand attention
- [x] `Add to patch` CTA
  - Disabled at 35% opacity until species selected
  - On confirm: write sighting to SQLite
  - Pop back to home
  - Trigger appropriate toast

**Done when:** Full log flow works. Sighting written to SQLite. Home screen counts update. Toast fires correctly.

---

## Task 6 — Polish & definition of done ✅

Work through the full checklist from `BRIEF.md`:

- [x] Onboarding completes and writes patch to SQLite
- [x] Home loads patch name, year count, all-time count from SQLite
- [x] Keep an eye out shows 3 contextually appropriate species
- [x] Recent sightings loads from SQLite, most recent first
- [x] FAB opens log screen
- [x] Species autocomplete filters correctly from 2 chars
- [x] Logging a sighting writes to SQLite and returns to home
- [x] Year/all-time counts update correctly after log
- [x] Toast appears and auto-dismisses after 2.4s
- [x] New species toast is visually distinct from repeat sighting toast
- [x] App works fully offline
- [ ] App feels like 10 seconds to log on a real device — requires device test
- [x] No hardcoded colours outside `tokens.ts`
- [x] No features built that aren't in the brief

**Done when:** Every item above is checked off and tested on a real device.

---

## Task 7 — Patch photo (team photo) ✅

The cornerstone screen. A visual record of every species logged at the patch — something worth looking at and worth sharing. Not a progress tracker, not a completionist tool. Just everyone who showed up, together in one frame.

**Design decisions (agreed):**
- Equal tile grid — every species gets the same tile regardless of how many times logged
- Only show species that have actually been logged — no ghost/absent species, no implied incompleteness
- 5 tiles is as complete as 80 tiles
- Amber tint on tiles for species logged this year — shows recency, not rank
- Year filter: `All time` / current year — switches which species render with amber tint vs flat
- Header: patch name · year · species count (quiet, not a score)
- Share via long-press save to camera roll — screenshot quality, no special export

**Screen:**
- [x] `app/(tabs)/poster.tsx` — replace placeholder with Patch photo screen
- [x] DB query: `SELECT DISTINCT species FROM sightings WHERE patch_id = ? ORDER BY species ASC` for all-time
- [x] DB query: year-filtered variant using `strftime('%Y', seen_at)`
- [x] Add `getPatchSpecies(db, patchId, year?: number)` helper to `db/database.ts`

**Header:**
- [x] Patch name in small caps amber
- [x] Species count — `47 species` — `inkMid`, no label
- [x] Year filter pill toggle: `All time` + current year — amber pill for active state

**Grid:**
- [x] 3-column tile grid, parchment background
- [x] Each tile: species name centred, `inkDark`, `fontSize: 13`, `fontWeight: '500'`
- [x] Tile background: `parchment` with `parchmentBorder` border, `radius.card`
- [x] Species logged this year: tile background tinted amber (`rgba(200,125,58,0.10)`), border `rgba(200,125,58,0.35)`
- [x] Tiles sorted: this-year species first (amber), then remaining alphabetically
- [x] Empty state: quiet prompt — no sightings logged yet

**Navigation:**
- [x] Accessible from home screen via `Patch photo →` row (between stats and Keep an eye out)
- [x] Tab bar hidden (already set globally) — no visible tab UI

**Done when:** Grid loads all logged species from SQLite, year filter works, amber tint correctly marks this-year species, empty state renders, screen looks good enough to screenshot and share.

---

## Task 8 — Edit & delete sightings ✅

Mistakes happen in the field. This task closes the only gap in the core loop: the inability to fix or remove a sighting after it's been logged.

**Design decisions:**
- Tap any sighting row on home → pushes to an edit screen (same modal presentation as Log)
- Edit screen is pre-filled with existing species, count, and notes, and date
- Species is editable via the same autocomplete component used in Log
- Count stepper pre-filled, min 1
- Notes field pre-filled
- Delete is a destructive secondary action — red label, confirmation prompt before executing
- Confirmation copy: `Remove this sighting? This can't be undone.` with `Remove` and `Cancel` options
- After save or delete: pop back to home, reload all data (counts + recent list)
- No toast on edit (quiet save). Toast only on delete: `[Species] removed` — plain dark background
- Stats recalculate from SQLite after any change — do not diff manually

**DB helpers to add in `db/database.ts`:**
- [x] `updateSighting(db, id, species, count, notes, seenAt)` — UPDATE sightings SET ...
- [x] `deleteSighting(db, id)` — DELETE FROM sightings WHERE id = ?

**Screen:**
- [x] `app/(tabs)/edit.tsx` — Edit sighting screen
- [x] Header: same dark forest green as Log, back chevron, `Edit sighting` title
- [x] Species autocomplete pre-filled with existing species, same hints as Log
- [x] Count stepper pre-filled
- [x] Notes field pre-filled
- [x] Date pre-filled via native wheel picker (`DateTimePicker display="spinner"`) — same component as Log
- [x] `Save changes` CTA — disabled if species empty
- [x] `Remove sighting` below CTA — `colors.red` (added `red: '#c0392b'` to tokens), no amber
- [x] Confirmation modal (Alert) before delete executes
- [x] On save: `updateSighting` → pop → reload home
- [x] On delete: `deleteSighting` → pop → reload home → toast `[Species] removed`

**Home screen changes:**
- [x] Sighting rows become `Pressable` — `onPress` navigates to `/(tabs)/edit?id=[sighting_id]`
- [x] Pass sighting id; edit screen fetches full sighting from SQLite on mount
- [x] `useFocusEffect` added — reloads data whenever home comes back into focus

**Tab bar:**
- [x] FAB removed; `+` moved into tab bar centre as a real tab using `tabBarLabel`
- [x] Log screen resets form fields on every focus via `useFocusEffect`
- [x] `edit` tab hidden from tab bar via `href: null`

**Polish:**
- [x] All font sizes audited against token set — no hardcoded sizes outside `{10, 11, 14, 22, 26}`
- [x] Date wheel picker scaled to 80% (`transform: scale + marginVertical`) for visual proportion

**Done when:** Tapping a sighting opens the pre-filled edit screen. Saving changes updates SQLite and home counts/list. Deleting removes the sighting with confirmation, updates home, and shows a plain toast.

---

## Task 9 — Time of day

Two features sharing one concept: enriching the record with when a sighting was made, and reflecting that time of day in the home sky.

**Design decisions:**
- Four periods matching existing sky palettes: Dawn (05–09), Day (09–17), Dusk (17–21), Night (21–05)
- Firewatch-style filled silhouette SVG icons — one per period
- Log screen: pre-filled from current time (zero friction in the moment), overridable via tap for retrospective logging
- Edit screen: pre-filled from stored `time_of_day`, or derived from `seen_at` if null (existing records)
- Home sighting rows: small icon + period label + date — e.g. `[Dawn icon] Dawn · 13 May`
- Home sky: matches current time of day (replaces random selection)
- Schema: nullable `time_of_day TEXT` column on sightings — existing rows get NULL, display derives from `seen_at`

**`skies.ts` additions:**
- [x] Add `SKY_NIGHT` — deep indigo/near-black, 12 bands × 40px
- [x] Export `TimeOfDay` type: `'dawn' | 'day' | 'dusk' | 'night'`
- [x] Add `timeOfDayFromHour(hour: number): TimeOfDay` — 05–08 dawn, 09–16 day, 17–20 dusk, 21–04 night
- [x] Add `skyForSighting(): string[]` — returns correct sky for `new Date().getHours()`

**`db/database.ts` changes:**
- [x] Add `time_of_day?: string` to `Sighting` type
- [x] Migration in `initDatabase`: `ALTER TABLE sightings ADD COLUMN time_of_day TEXT` (wrapped in try/catch — safe, existing rows get NULL)
- [x] `insertSighting` — add `time_of_day` to INSERT
- [x] `updateSighting` — add `time_of_day` to UPDATE

**New `components/TimeOfDayIcon.tsx`:**
- [x] Props: `period: TimeOfDay`, `size?: number`, `color?: string`
- [x] Filled silhouette SVG icons via react-native-svg:
  - Dawn: horizon line, sun half-risen, rays fanning up
  - Day: full circle sun with rays
  - Dusk: horizon line, sun half-set, glow below
  - Night: crescent moon + one star dot
- [x] Default color: `colors.inkFaint`; amber when selected

**New `components/TimeOfDayPicker.tsx`:**
- [x] Props: `value: TimeOfDay`, `onChange: (p: TimeOfDay) => void`
- [x] Horizontal row of 4 icon + label chips
- [x] Selected chip: amber icon + amber label. Unselected: inkFaint icon + inkFaint label
- [x] Chip has no border/background — just icon + text, spaced evenly

**`app/(tabs)/log.tsx`:**
- [x] Add `timeOfDay` state, initialised from `timeOfDayFromHour(new Date().getHours())`
- [x] Reset `timeOfDay` in `useFocusEffect`
- [x] Add `TimeOfDayPicker` below notes field, above CTA
- [x] Pass `time_of_day: timeOfDay` into sighting before `insertSighting`

**`app/(tabs)/edit.tsx`:**
- [x] Add `timeOfDay` state
- [x] Pre-fill from `sighting.time_of_day ?? timeOfDayFromHour(new Date(sighting.seen_at).getHours())`
- [x] Add `TimeOfDayPicker` below notes field
- [x] Pass `time_of_day` to `updateSighting`

**`app/(tabs)/index.tsx`:**
- [x] Replace `SKIES` array + `Math.random()` with `skyForSighting()`
- [x] Add helper `timeOfDayLabel(s: Sighting): { period: TimeOfDay; label: string }` — reads `time_of_day` or derives from `seen_at`
- [x] Sighting rows: prepend `<TimeOfDayIcon>` + period label before date

**Done when:** Time-of-day picker appears in log and edit screens, pre-filled correctly. Sighting rows show the icon and period. Home sky matches current time of day. Night sky renders correctly.

---

## Prompt template

Use this to start each Claude Code session:

```
Read BRIEF.md and patch-project-context.md.
Complete task [N] from TASKS.md.
Do not build anything outside the scope of that task.
When done, confirm which checklist items are complete.
```

---

## Task 10 — Conditions + one-page log form

Add weather conditions to sightings and compress the log/edit form so all fields are visible without scrolling.

**Design decisions:**
- Conditions: `clear | overcast | rain | mist` — nullable, no default, tap to select/deselect
- Firewatch silhouette icons: Clear (solid circle sun), Overcast (cloud), Rain (cloud + drops), Mist (3 horizontal bars)
- Date picker: `display="compact"` on iOS (small native pill, ~34px), pressable + dialog on Android
- Count + Date combined into one row — saves a section gap and a label row
- Section gap tightened: `space.lg` (24) → `space.md` (16) throughout
- Stepper buttons: 40px → 36px circles
- Notes: `minHeight` 72 → 56

**Schema:**
- [x] `ALTER TABLE sightings ADD COLUMN conditions TEXT` (try/catch migration)
- [x] `conditions?: string | null` added to `Sighting` type
- [x] `insertSighting` and `updateSighting` include `conditions`

**New components:**
- [x] `components/ConditionsIcon.tsx` — `Conditions` type + 4 SVG silhouettes
- [x] `components/ConditionsPicker.tsx` — nullable chip row, tap-to-toggle

**Screen changes:**
- [x] `app/(tabs)/log.tsx` — layout compressed, count+date row, compact date, conditions picker
- [x] `app/(tabs)/edit.tsx` — same layout, conditions pre-filled from sighting
- [x] `app/(tabs)/index.tsx` — conditions icon shown inline in sighting rows when set

**Done when:** All fields visible on one screen without scrolling (iPhone 14 Pro). Conditions saved and displayed correctly. Edit screen pre-fills conditions.

---

---

## Task 11 — Edit patch ✅

Allow users to rename their patch and change its size after initial setup. Also includes a small focus group polish item for the conditions picker.

**Design decisions:**
- Entry point: long-press the patch name on the home screen hero → action sheet with "Edit patch" + "Cancel"
- Reuses onboarding name + size screens with pre-filled values — feels like editing, not starting fresh
- On save: `updatePatch` writes to SQLite, context dispatch updates in-memory state, returns to home
- No sighting data is affected by a patch rename or resize

**`db/database.ts`:**
- [x] Add `updatePatch(db, id, name, radius)` — `UPDATE patches SET name = ?, radius_km = ? WHERE id = ?`

**Onboarding screens:**
- [x] `name.tsx` — accept optional `currentName` route param; pre-fill input if present; eyebrow changes to "Edit your patch" in edit mode; step dots hidden
- [x] `size.tsx` — accept optional `currentRadius` route param; pre-select matching pill if present; CTA copy `Save changes` in edit mode; step dots hidden

**`app/(tabs)/index.tsx`:**
- [x] Patch name rendered in amber small caps over hero (bottom-left, absolute)
- [x] Wrapped in `Pressable` with `onLongPress` (400ms delay)
- [x] On long-press: `Alert` with `Edit patch` and `Cancel`
- [x] On confirm: dispatches `SET_EDITING_PATCH: true`, navigates to name screen with params

**`context/PatchContext.tsx`:**
- [x] `editingPatch: boolean` added to State (default false)
- [x] `SET_EDITING_PATCH` action added to reducer
- [x] Redirect condition updated: `state.patch && inOnboarding && !state.editingPatch`
- [x] `state.editingPatch` added to redirect effect deps so clearing the flag triggers navigation back
- [x] Saving in size.tsx (edit mode) dispatches `UPDATE_PATCH` + `SET_EDITING_PATCH: false` — PatchContext redirect handles navigation, mirroring the create flow
- [x] Back button on name.tsx (edit mode) dispatches `SET_EDITING_PATCH: false` before navigating back

**Polish — conditions memory:**
- [x] Module-level `lastConditions` variable in `log.tsx` persists selected condition within the app session; resets on restart; no SQLite needed

**Done when:** Long-pressing the patch name shows an edit option. Name and size update correctly and persist across restarts. Conditions picker retains last selection within a session. No sighting data lost.

---

## Task 12 — Firsts ~~shelved~~

Built and reverted May 2026. Implemented as a filter on the Your patch tab (alongside All time / year), it rendered as a chronological list of species with date + time of day + notes. Felt too similar to the existing species list — just with a date attached. Doesn't justify its place.

The concept is right (the moment you first met each species on your patch) but needs a presentation that is genuinely distinct from a list. Not to be rebuilt as another list view. Revisit only if a clearly different format emerges — e.g. diary-style with date as the hero, or surfaced contextually ("You first heard a Cuckoo here 2 years ago today") rather than as a browsable screen.

---

## Task 13 — Patch journal ~~deferred~~

Direction pivoted (May 2026). The journal tab exists in the app with a coming soon placeholder — no entry or editing yet.

**Why deferred:** Adding date/time of day/conditions/species to the journal form made it a near-duplicate of the log form. Rather than building two similar forms, we paused to reconsider the journal's purpose.

**Agreed direction for when this ships:**
- The journal is a session-level field notebook — not a longer version of the log form
- It is deliberately distinct from eBird/Merlin (which are pure data tools). Neither has a narrative session layer.
- Journal entries are the story of being somewhere, not structured species records
- Birds will eventually be tagged within a session entry, not logged as separate sighting records
- For now: coming soon screen with SkyHero header and a short description of what it will be

**Placeholder screens in place:**
- `app/(tabs)/journal.tsx` — coming soon banner
- `app/(tabs)/journal-compose.tsx` — dormant (not linked from UI)
- `app/(tabs)/journal-edit.tsx` — dormant (not linked from UI)
- DB schema and helpers for journal exist in `db/database.ts` — ready when needed

---

## Task 14 — Seasons ~~deprioritised~~

Deprioritised May 2026. The feature relies on comparative history ("your last swift was 6 weeks ago") that only becomes meaningful after a full year of logging — but design focus is on the first 12 months experience, not users who have already completed a year. Phenology-only sentences are possible earlier but don't add enough over the existing "Keep an eye out" panel to justify the screen space.

Revisit if a framing emerges that delivers genuine value in month one, not just month thirteen.

---

## Task 15 — Species detail page

Tap any species tile in the patch photo grid to see the full history of that bird at your patch. First sighting, last sighting, total records, and a scrollable list of every time it's been logged. The most requested unbuilt feature from focus group testing — deepens intimacy with individual species rather than just counting them.

**Design decisions:**
- Entry point: tap any species tile in `poster.tsx`
- Header: dark forest green, back chevron, species name as title, `Your patch` as subtitle
- Stats row below header: `First seen [date]` · `Last seen [date]` · `[n] records` — `inkMid`, small caps
- Sighting list: same row style as home — time-of-day icon + period, conditions icon (if set), date, count, notes (one line, truncated)
- Most recent first
- No edit action from this screen — editing is via the existing home → edit flow
- Empty state not needed — only reachable by tapping a logged species tile

**`db/database.ts`:**
- [ ] Add `getSpeciesSightings(db, patchId, species): Promise<Sighting[]>` — `SELECT * FROM sightings WHERE patch_id = ? AND species = ? ORDER BY seen_at DESC`
- [ ] First and last seen derived from result array — no extra query needed

**New screen `app/(tabs)/species.tsx`:**
- [ ] Route params: `species` (URL-encoded string)
- [ ] On mount: call `getSpeciesSightings`, derive first/last seen from result
- [ ] Header: forest green background, back chevron, species name title
- [ ] Stats row: three quiet facts separated by `·` — first seen, last seen, record count
- [ ] Sighting list below — `FlatList`, each row identical in structure to home recent sightings rows
- [ ] `useFocusEffect` reload (in case user edits a sighting and returns)

**`app/(tabs)/poster.tsx`:**
- [ ] Wrap each species tile `View` in a `Pressable`
- [ ] `onPress`: `router.push('/(tabs)/species?species=' + encodeURIComponent(name))`

**Done when:** Tapping a species tile opens the detail screen. Stats and sighting list load correctly from SQLite. Back chevron returns to the photo grid. Screen reloads correctly after editing a sighting.

---

## Task 16 — Today's log grouping

A minimal change to the home screen that makes it clear what you've logged in the current visit. Focus group users were logging duplicates because they couldn't see their today list at a glance. Solution: group today's sightings under a `Today` header at the top of the recent list, and show a quiet species count for the day.

**Design decisions:**
- If any sightings exist for today: render a `Today` section label above them — amber, small caps, same weight as other section labels
- Sightings from previous dates remain below, ungrouped for now (no date headers on older items — that comes in a later history task)
- Add a quiet `[n] species today` line in `inkFaint` below the stats row — only visible when n > 0
- No schema changes — `seen_at` already carries the date

**`app/(tabs)/index.tsx`:**
- [ ] In the sightings render logic, partition the list: `todaySightings` (seen_at date = today) and `earlierSightings`
- [ ] If `todaySightings.length > 0`: render `Today` label (amber, `type.label` size) then today's rows, then earlier rows
- [ ] Below the stats row: if distinct species logged today > 0, render `[n] species today` in `inkFaint`, `type.label` — hidden otherwise
- [ ] Helper: `isToday(dateStr: string): boolean` — compare date portion only, no time

**Done when:** A "Today" header and today's sightings appear at the top of the recent list when the user has logged something today. A quiet today species count shows below the stats row. No regressions when there are no today sightings.

---

## Task 17 — Patch greeting

Replace the quiet amber patch name label on the home screen hero with a prominent, personal greeting that changes based on time of day. The goal is to make the app feel like it knows you and your place — less dashboard, more field companion. This is the first thing you see every time you open Patch.

**Design decisions:**
- The greeting is the centrepiece of the hero, not a footnote — large, warm, white
- Format: `[time phrase] on [patch name]` — e.g. "Morning on Fowlmere", "Evening on the Meadow", "Afternoon on Cley"
- Time phrases: `Morning` (5–11), `Afternoon` (12–16), `Evening` (17–20), `Night` (21–4) — simple and warm, not "Good morning" (formal) or "Dawn" (cold)
- Secondary line below the greeting: a quiet rotating phrase that deepens the relationship — see copy below
- Patch name remains long-press editable (existing Task 11 behaviour, unchanged)
- No date or time shown — this isn't a clock. The greeting IS the timestamp.

**Secondary rotating phrases (shown below the greeting, `inkFaint` or soft white at reduced opacity):**
These rotate on each app open, not on a timer. Pick from a pool, cycle deterministically (not random — avoid repeating twice in a row):
- "Your patch is waiting"
- "What's out there today?"
- "Every visit counts"
- "Quiet eyes, open ears"
- "You know this place"
- "The birds are ahead of you"
- "Log what you find"

**`app/(tabs)/index.tsx`:**
- [ ] Replace patch name amber label + heroOverlay with a new `heroGreeting` block — centred vertically in the lower half of the hero, above the bottom scrim
- [ ] `greetingText(patchName: string): string` — returns `"Morning on Fowlmere"` etc. based on `new Date().getHours()`
- [ ] `rotatingPhrase(): string` — returns a phrase from the pool, cycling via a module-level index incremented on each mount (not random)
- [ ] Greeting: white, large (~28px), weight 500 — prominent but not aggressive
- [ ] Rotating phrase: white at 0.55 opacity, small (~13px), weight 400 — below the greeting, a beat of quiet
- [ ] Long-press remains on the greeting text block (same `onLongPressPatchName` as today)

**Done when:** The hero shows "Morning on [patch name]" (or equivalent for time of day) in large white text. A quiet rotating phrase appears below it. Long-press still opens the edit patch action sheet. The greeting updates correctly when the patch is renamed.

---

## Focus group backlog

Conducted May 2026 — 7 participants. Ranked by demand × product fit × first-12-months value.

| Priority | Feature | Status |
|---|---|---|
| P0 | Edit patch name + size | Task 11 — next up |
| P0 | Conditions picker — remember last selection | Folded into Task 11 |
| P1 | Species detail page | Task 15 — scoped |
| P1 | Today's log grouping on home | Task 16 — scoped |
| P1 | Second patch (max 2) | Not yet scoped |
| P2 | Sighting history browse by month | Month-grouped scroll, not full calendar |
| P2 | Journal — first version | Plain text session entry; direction agreed in context doc |
| P2 | iOS widget — species count | Post-journal; requires native widget target |
| P3 | eBird import | Onboarding v2 only; history-dependent |
| P3 | Species photo / ID hint | Out of scope — send users to Merlin |
| P3 | Auto-save patch photo monthly | Manual screenshot is sufficient |
| P3 | Family / multi-user | Different product surface; not v1 or v2 |

---

*Tasks version: 1.5 — May 2026*
*Read alongside: BRIEF.md and patch-project-context.md*
