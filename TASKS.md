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

## Prompt template

Use this to start each Claude Code session:

```
Read BRIEF.md and patch-project-context.md.
Complete task [N] from TASKS.md.
Do not build anything outside the scope of that task.
When done, confirm which checklist items are complete.
```

---

*Tasks version: 1.0 — May 2026*
*Read alongside: BRIEF.md and patch-project-context.md*
