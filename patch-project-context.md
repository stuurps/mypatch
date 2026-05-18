# Patch — project context

> A quiet, personal record of the birds in your everyday life — built up naturally over time.

---

## What is Patch?

Patch is a minimal mobile app for birders who want to build a deep, long-term picture of the wildlife in their local area. It is not a social network, not a species ID tool, and not a gamified life list. It is a personal journal for your patch — the place you know better than anyone.

---

## North star

**A quiet, personal record of the birds in your everyday life — built up naturally over time.**

The four words that matter: quiet, personal, everyday, over time.

---

## Design principles

### 1. Personal above all
Everything in the app is yours — your patch, your counts, your history. There are no averages, no crowd data, no comparisons you didn't ask for. The app reflects you back at yourself.

### 2. Minimal by instinct
If a feature, number, or visual element doesn't directly serve the record — it doesn't ship. The app earns its place in your pocket by never wasting your time or attention.

### 3. Easy in the field
Logging a sighting is always ten seconds or less, one-handed, no signal needed. The moment you see something is the moment the app should get out of your way.

### 4. Calm, always
No nudges, no streaks, no urgency. The app never creates anxiety — it only ever gives you a quiet sense of accumulation. Your list grows at your pace, on your terms.

---

## The test

Ask these before every design or product decision:

- Does this help the user build their personal picture, or does it serve something else?
- Could we remove this and not miss it?
- Does this make the app feel calmer or busier?
- Would a birder mid-walk find this useful right now?

---

## Visual identity

- **Palette:** Warm parchment backgrounds, amber accents, earth tones. Never cool grey or stark white. Inspired by Firewatch — atmospheric, warm, unhurried.
- **Accent colour:** Amber (`#c87d3a`) used once per screen for the single most important element. It never decorates.
- **Typography:** Big confident numbers, quiet muted labels. Stark hierarchy — what matters is large, everything else recedes.
- **Atmosphere:** One landscape silhouette scene per key screen. No gratuitous illustration, no confetti, no decorative icons.
- **Whitespace:** Always generous. The layout matches the pace of birding.

---

## Core decisions

| Topic | Decision |
|---|---|
| Species logging | Fixed taxonomy list, region-filtered smart autocomplete |
| Patch shape | Adjustable radius circle, user sets centre point |
| Default radius | 5km, with labelled presets (local walk, full patch, wide patch) |
| Patch centre | User-defined — not assumed to be home location |
| Max patches | Two (home + one other). Constraint is intentional. |
| Connectivity | Offline-first, silent sync on wifi |
| Key stats | Year count + all-time count, progress bar vs expected |
| Social / friends | Deprioritised — v2 |
| eBird import | Deprioritised — v2 |
| Field recordings | Deprioritised — v2 |

---

## V1 screens

| Screen | Description | Status |
|---|---|---|
| Onboarding | Name patch, set centre, choose radius | To design |
| Patch home | Stats, progress bar, recent sightings, landscape header | Mocked up |
| Log sighting | Autocomplete entry, optional notes | To design |
| Team photo | Species mosaic — all time, filterable by year | To design |
| Phenology | Species-by-season chart from own data | Later |
| Friends | Follow a patch, ambient awareness | Later |

---

## Deliberately out of v1

- Streak counters
- Leaderboards
- Push notifications
- Rare bird alerts
- Species ID (that's Merlin)
- Social feed / likes
- Field recording tools
- eBird import

---

## Open questions (parked for v2)

- **eBird import** — optional on onboarding to populate history on day one, framed as "bring your history" not a migration
- **Social model** — follow friends' patches, ambient not competitive, no likes or leaderboards
- **Field recordings** — attach audio files to sightings only, no in-app recording tools
- **Multiple patches** — second patch allowed (max two), constraint keeps focus

---

*Last updated: May 2026*
