# T20 — Sightings Summary Redesign
_Shipped: 2026-05-20_

## What shipped
- Hero block: SkyHero (SKY_SUNRISE, no trees, 220px height) with large species count (52px, white, weight 600), patch name (amber small caps), `SPECIES` label, and a stats line showing total records + "since [Month Year]"
- Back chevron moved into hero as absolute top-left (semi-transparent white, 40×40 tap target)
- Filter pills moved below hero into a parchment utility bar — removed from poster content area
- Per-tile record count: all-time count in bottom-right corner of every tile (10px, inkFaint, absolute)
- Tile min-height increased 52 → 66 to give count room
- Root background: parchment (removed full-screen sky bands)
- Stats line uses first sighting date (not patch created_at) — more honest about when the patch started producing data
- New DB helper: `getPatchSpeciesWithCounts` — returns species + all-time record count in one query
- New util: `formatSince(dateStr)` → `"Oct 2023"` format

## Key decisions
- **Stats line uses first sighting date, not patch creation date** — a patch created in January but not logged until March should say "since March." The number reflects real engagement, not the moment you named the place.
- **Per-tile count is always all-time, regardless of year filter** — the count reflects how established that species is at the patch. Filtering it by year would show meaningless numbers (e.g. "1" for every species in the year filter). The amber tint already handles the year signal.
- **Filter pills demoted to utility bar** — they're a query control, not poster content. The poster is the species count + the grid. Moving pills below the hero makes the hero unambiguous: this is the shareable artifact.
- **FlatList with ListHeaderComponent** — avoids nested scroll conflicts and means the hero scrolls naturally with the grid on smaller screens.

## Deferred / shelved
- **Milestone callouts** — on reaching 10, 25, 50 species: a quiet one-time callout in the hero. Right idea, but scope was already large. Added to BACKLOG.md as B5.
- **Share export** — formal image export with metadata. Screenshot remains the mechanism. Not worth native share sheet complexity in v1.

## Files changed
- `app/(tabs)/poster.tsx` — major restructure
- `db/database.ts` — added `getPatchSpeciesWithCounts`; added `getFirstSightingDate`
- `utils/format.ts` — added `formatSince`
