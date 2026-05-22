# T26 — Empty states + first sighting prompt
_Shipped: 2026-05-22_

## What shipped
- Home empty state: "Over to you, [name]." (fallback: "Over to you.") + "Tap + to log your first bird at [patchName]."
- Poster empty state: "No species yet." + "Every bird you log appears here."
- Journal empty state: kept "Your first entry is waiting." — added "Tap + to write about your visit."

## Key decisions
- B13 (first sighting prompt as a separate persistent element) was dropped — the improved home empty state IS the activation prompt. It occupies the same screen position, serves the same purpose, and disappears naturally after first log. No settings table storage, no dismissed state needed.
- Home uses both `userName` and `patch.name` — the two personal facts the app collected in onboarding. Putting both in the activation moment makes the handoff feel earned rather than generic.
- "Over to you" framing: the onboarding has done its job (named you, named your patch), now the app steps back. The phrasing implies the relationship has been established; the next move is the user's.
- Poster copy reframes emptiness as a beginning: "Every bird you log appears here" describes what the screen becomes, not what's missing.
- Journal's existing first line was already the strongest of the three — kept it, added a second line only for structural consistency.

## Deferred / shelved
- Nothing cut

## Files changed
- `app/(tabs)/index.tsx` — empty state copy
- `app/(tabs)/poster.tsx` — empty state copy
- `app/(tabs)/journal.tsx` — empty state copy + `emptyHint` style added
