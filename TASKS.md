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

*Tasks version: 1.2 — May 2026*
*Read alongside: BRIEF.md and patch-project-context.md*
