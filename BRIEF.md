# Patch — Developer Brief
> Tracer bullet build. Three screens, core loop, real device.

Read `patch-project-context.md` first. This brief covers implementation only.

Anything not covered here — deferred ideas, future improvements, or tasks that arise mid-build — goes in `TODO.md`. Do not add them inline to code or to this brief.

---

## Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React Native + Expo (SDK 55) | Zero-config, runs on device fast |
| Navigation | Expo Router (file-based) | Clean, minimal boilerplate |
| Storage | Expo SQLite | Offline-first, no backend needed |
| State | React Context + useReducer | No external library needed at this scale |
| Styling | StyleSheet API only | No Tailwind, no styled-components |

```bash
npx create-expo-app patch --template blank-typescript
cd patch
npx expo install expo-router expo-sqlite react-native-safe-area-context react-native-screens expo-linking expo-constants react-native-svg expo-linear-gradient
```

---

## Design tokens

Apply these everywhere. Never hardcode a colour or font size outside this set.

```ts
// tokens.ts
export const colors = {
  // Parchment body
  parchment:     '#f5efe6',
  parchmentBorder:'#d9cdb8',
  parchmentMid:  '#c8b89a',

  // Text
  inkDark:       '#3b3025',
  inkMid:        '#9e8e72',
  inkLight:      '#7a6e58',
  inkFaint:      '#c8b89a',

  // Accent — used ONCE per screen on the single most important element
  amber:         '#c87d3a',

  // Sky / hero backgrounds
  skyDeepNight:  '#0d0b18',
  skyNight:      '#1a1208',
  skyForest:     '#2d3b2a',

  // Greens (treeline)
  tree1:         '#1a3818',
  tree2:         '#0f2210',
  tree3:         '#0c2209',

  // Ground
  groundWarm:    '#b86830',
};

export const type = {
  // Stat numbers — the thing that matters
  statLarge:  { fontSize: 26, fontWeight: '500' as const, color: colors.inkDark },
  // Screen titles
  headline:   { fontSize: 22, fontWeight: '500' as const, color: colors.inkDark },
  // Section labels
  label:      { fontSize: 10, color: colors.inkMid, textTransform: 'uppercase' as const, letterSpacing: 1.2 },
  // Body / hints
  body:       { fontSize: 14, color: colors.inkMid, lineHeight: 22 },
  // Species names in list
  speciesName:{ fontSize: 14, fontWeight: '500' as const, color: colors.inkDark },
  // Meta (date, location)
  meta:       { fontSize: 11, color: colors.inkMid },
};

export const radius = {
  card:   12,
  button: 14,
  pill:   20,
};

export const space = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
};
```

---

## Sky bands — the Firewatch hero

Every key screen has a painted sky at the top. Draw it with a Canvas or a stack of `View` elements. Use these exact band sequences — they've been visually approved.

Each band is 40px tall. 12 bands = 480px sky. Treeline sits at 72% of screen height.

```ts
// skies.ts — approved colour sequences, 12 bands × 40px each
// Note: TREE1 and TREE2 live in tokens.ts (not skies.ts) — Task 2 spec takes precedence.

export const SKY_SUNRISE = [
  '#1a0e04','#2e1608','#4a200a','#6e2c0c',
  '#963a10','#c05018','#d86828','#e88038',
  '#f09848','#f8b058','#fcc468','#e8a850',
];

export const SKY_DAY = [
  '#0c1624','#102030','#162c40','#1e3a54',
  '#264a6a','#305c82','#3a6e9a','#4480b0',
  '#5092c4','#5ca4d8','#68b4e8','#74c0f0',
];

export const SKY_SUNSET = [
  '#0e0a1a','#1a1030','#2e1840','#4a2248',
  '#6a2c40','#8e3830','#b85020','#d46828',
  '#e88030','#f09840','#f8ae4a','#e89840',
];

// Treeline points — identical across all screens (normalised 0–1)
export const TREE1 = [
  [0,0],[.04,32],[.10,54],[.16,36],[.22,64],[.28,46],
  [.34,74],[.40,52],[.46,80],[.52,58],[.58,82],[.64,60],
  [.70,72],[.76,48],[.82,66],[.88,40],[.94,58],[1,32],[1,0]
];
export const TREE2 = [
  [0,0],[.06,22],[.14,36],[.22,26],[.30,40],[.38,30],
  [.46,42],[.54,32],[.62,42],[.70,30],[.78,36],[.86,26],
  [.94,32],[1,20],[1,0]
];
```

Build a reusable `<SkyHero>` component that accepts a sky array and renders the bands + treeline + ground + scrim overlay.

```tsx
// components/SkyHero.tsx
// Props: bands: string[], height: number, children?: ReactNode
// Renders: stacked band Views + SVG treeline + bottom scrim gradient + children overlay
```

---

## Data model (SQLite)

```sql
-- patches
CREATE TABLE patches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  radius_km INTEGER DEFAULT 5,
  created_at TEXT NOT NULL
);

-- sightings
CREATE TABLE sightings (
  id TEXT PRIMARY KEY,
  patch_id TEXT NOT NULL,
  species TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  notes TEXT,
  seen_at TEXT NOT NULL,       -- ISO date string
  created_at TEXT NOT NULL
);
```

Indexes: `sightings(patch_id)`, `sightings(seen_at)`, `sightings(species)`.

---

## Species list

Bundle as a static JSON file. Do not fetch. 97 UK species, sorted taxonomically.

```ts
// data/species.ts
export const SPECIES: string[] = [
  'Mute Swan','Canada Goose','Barnacle Goose','Shelduck','Wigeon','Gadwall',
  'Teal','Mallard','Pintail','Shoveler','Pochard','Tufted Duck','Goosander',
  'Great Crested Grebe','Grey Partridge','Cormorant','Bittern',
  'Grey Heron','Little Egret','Marsh Harrier','Sparrowhawk','Buzzard',
  'Red Kite','Kestrel','Hobby','Peregrine','Barn Owl','Little Owl',
  'Moorhen','Coot','Oystercatcher','Lapwing','Dunlin','Snipe','Woodcock',
  'Curlew','Redshank','Greenshank','Turnstone','Common Sandpiper',
  'Black-headed Gull','Common Tern','Wood Pigeon','Collared Dove',
  'Swift','Kingfisher','Great Spotted Woodpecker','Green Woodpecker',
  'Sand Martin','Swallow','House Martin','Jay','Magpie','Jackdaw',
  'Long-tailed Tit','Coal Tit','Blue Tit','Great Tit','Nuthatch',
  'Treecreeper','Chiffchaff','Willow Warbler','Blackcap','Garden Warbler',
  'Lesser Whitethroat','Whitethroat','Sedge Warbler','Reed Warbler',
  'Bearded Tit','Spotted Flycatcher','Robin','Stonechat','Wheatear',
  'Blackbird','Song Thrush','Mistle Thrush','Redwing','Fieldfare',
  'House Sparrow','Tree Sparrow','Dunnock','Grey Wagtail','Pied Wagtail',
  'Yellow Wagtail','Meadow Pipit','Skylark','Chaffinch','Greenfinch',
  'Goldfinch','Siskin','Linnet','Bullfinch','Reed Bunting','Yellowhammer',
  'Wren','Starling',
];
```

---

## Screen specs

### 1. Onboarding (3 steps)

**Step 1 — Welcome**
- Sky: `SKY_SUNRISE`
- Full screen hero with bottom scrim
- No back button
- Content: `Welcome to Patch` tag, headline, subline, `Get started` CTA
- CTA always active

**Step 2 — Name your patch**
- Sky: `SKY_DAY`
- Back button (top left, circular, semi-transparent)
- Content: eyebrow, headline, text input, hint, `Continue` CTA
- CTA disabled until input has content
- Auto-focus input on mount

**Step 3 — Patch size**
- Sky: `SKY_SUNSET`
- Back button
- Headline carries forward patch name from step 2
- Three radius pills: 1km (Garden), 5km (Local walk), 10km (Full patch)
- Default selected: 5km
- CTA: `Start watching` — always active
- On confirm: write patch to SQLite, navigate to home

Step indicator dots centred in top bar across all three steps. Active dot is amber, wider pill shape.

---

### 2. Patch home

**Header (SkyHero)**
- Sky: `SKY_SUNRISE`
- Patch name (small caps, amber, top)
- No stats in hero

**Stats row** (below hero, parchment background)
- Two boxes side by side, `1px` separator
- Left: `This year` / year species count
- Right: `All time` / all-time species count
- Big number, muted label beneath

**Keep an eye out** (parchment section)
- Section label: `Keep an eye out`
- 3 species from regional phenology data for current month
- Each row: species name + hint text + amber dot (full opacity = imminent, low opacity = possible)
- When user logs one of these species: fade row out, toast `[Species] — first of the year`
- This section disappears entirely once user has 12+ months of their own data (placeholder for v2 logic — just always show for now)

**Recent sightings** (parchment section)
- Section label: `Recent sightings`
- List of sightings, most recent first
- Each row: species name + date/notes meta + count (grey, right-aligned)
- No count shown if count = 1 (implied)
- Infinite scroll from SQLite

**FAB**
- Amber circle, `+`, centred at bottom
- Position: `absolute`, `bottom: 24`, horizontally centred
- Navigates to Log sighting screen

**Toast**
- Appears above FAB on successful log
- Dark background, light text
- `[Species] logged` for known species
- `[Species] — new for your patch` for first-ever log of that species (amber-tinted background)
- `[Species] — first of the year` for phenology species
- Auto-dismiss after 2.4s

---

### 3. Log a sighting

**Header**
- Dark forest green (`#2d3b2a`) — same as original home hero base
- Back chevron (left), `Log a sighting` title

**Form (parchment body)**
- Species autocomplete
  - Text input, placeholder `Start typing…`
  - Filter `SPECIES` array from 2 chars
  - Show max 6 results
  - Each result: species name + secondary hint (`on your patch` / `new for your patch` / `expected soon`)
  - `expected soon` hint for phenology species — amber text
  - `new for your patch` — amber text
  - `on your patch` — muted grey
  - Tap to select, collapses list
- Count stepper
  - `−` and `+` circular buttons, amber colour
  - Count display between them, min 1
- Notes (optional)
  - Textarea, 2 rows, placeholder `e.g. riverside hide, singing male…`
- `Add to patch` CTA
  - Disabled (35% opacity) until species selected
  - On confirm: write sighting to SQLite, pop back to home, trigger toast

---

## Seasonal phenology data

Hardcode for now. Map each species to the seasons it typically appears in the UK.
Used for two things: (1) `Keep an eye out` panel on home, (2) `expected soon` hint in autocomplete.

```ts
type Season = 'winter' | 'spring' | 'summer' | 'autumn';

// Current month → season
export function currentSeason(): Season {
  const m = new Date().getMonth(); // 0-indexed
  if (m <= 1 || m === 11) return 'winter';
  if (m <= 4) return 'spring';
  if (m <= 7) return 'summer';
  return 'autumn';
}

// For the Keep an eye out panel:
// Filter species where current season is their ARRIVAL season
// i.e. they appear in spring/summer but not in winter
// Pick 3, prioritise ones not yet logged this year
```

---

## Navigation structure

```
app/
  _layout.tsx          — root layout, SQLite init, PatchProvider
  onboarding/
    index.tsx          — step 1 welcome
    name.tsx           — step 2 name
    size.tsx           — step 3 radius
  (tabs)/
    index.tsx          — patch home
    log.tsx            — log a sighting (presented as full-screen push from home FAB, not a tab item — configured with href: null in tabs layout)
    poster.tsx         — seasonal poster (placeholder for now)
```

On first launch (no patch in SQLite): redirect to `/onboarding`.
On subsequent launches: go straight to `/(tabs)`.

---

## Key behaviours

**Offline-first**
All reads and writes go to SQLite. No network calls in v1. Silent sync is a v2 concern.

**10-second log rule**
The log screen must be operable with one thumb. Species → count → confirm. Notes are optional and below the fold. Test this on a real device.

**No gamification**
- No streak counters
- No badges
- No "you're on a roll" messages
- No push notifications
- The amber accent is never used to celebrate — only to direct

**Repeat sightings**
When a species is logged that already exists in the patch history:
- Year count does NOT change
- All-time count does NOT change
- Sighting is added to recent list quietly
- Toast: `[Species] logged` — plain, no emphasis

**New species**
When a species is logged for the first time ever on this patch:
- Year count +1
- All-time count +1
- Toast: `[Species] — new for your patch` (amber-tinted)

---

## What NOT to build

Do not add anything not listed here. If it's not in this brief or `patch-project-context.md`, it doesn't exist yet.

- No user accounts
- No network requests
- No push notifications
- No analytics
- No share functionality (v2)
- No eBird import
- No map view
- No species photos or illustrations
- No dark mode toggle (the app IS dark/warm — it's not a system mode)

---

## Definition of done for the tracer bullet

- [ ] Onboarding completes and writes patch to SQLite
- [ ] Home screen loads patch name, year count, all-time count from SQLite
- [ ] Keep an eye out shows 3 contextually appropriate species
- [ ] Recent sightings loads from SQLite, most recent first
- [ ] FAB opens log screen
- [ ] Species autocomplete filters correctly from 2 chars
- [ ] Logging a sighting writes to SQLite and returns to home
- [ ] Year/all-time counts update correctly on home screen after log
- [ ] Toast appears and auto-dismisses
- [ ] New species toast is visually distinct from repeat sighting toast
- [ ] App works fully offline
- [ ] App feels like 10 seconds to log on a real device

---

*Brief version: 1.0 — May 2026*
*Read alongside: patch-project-context.md*
