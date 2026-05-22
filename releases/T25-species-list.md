# T25 — Species list completeness + free-text fallback
_Shipped: 2026-05-22_

## What shipped
- Species list expanded from 87 → 194 regularly occurring UK birds
- Notable additions: Tawny Owl, Cuckoo, Goldcrest, Rook, Carrion Crow, Pheasant, all common gulls (Common, Herring, Lesser Black-backed, Great Black-backed, Mediterranean, Little, Yellow-legged), Avocet, Golden Plover, Knot, Sanderling, Waxwing, Dipper, Grasshopper Warbler, Cetti's Warbler, Dartford Warbler, Wood Warbler, Yellow-browed Warbler, Brambling, Common Crossbill, Hawfinch, Twite, Lapland Bunting, Snow Bunting, Goshawk, Osprey, White-tailed Eagle, Merlin, Hen Harrier, Bewick's Swan, Whooper Swan, Garganey, Smew, Goldeneye, Spoonbill, Hoopoe, and more
- Free-text fallback: typing any species not in the list shows a "Use '[name]'" row at the bottom of the autocomplete dropdown; selecting it logs that species name as-is
- Free-text hint reads "not in list" in neutral inkMid — no amber, no special treatment
- Applied to both log and edit screens

## Key decisions
- 194 is a deliberate ceiling — covers all regular UK patch species without becoming a national rarity checklist. Seabirds (auks, shearwaters, gannets), genuine vagrants, and subspecies excluded.
- Free-text shown whenever there is no exact match, regardless of how many list results exist — this means it's always reachable without having to clear the input, which matters when a user suspects their sighting isn't in the list
- Free-text species are stored and treated identically to list species post-logging: all hint logic (on your patch / new / expected soon), species detail page, poster — all work without any special casing
- Goshawk ended up in the new list, so the "Done when" example in the task spec was updated to use "Yellow Warbler" as the test case instead

## Deferred / shelved
- Subspecies entries (e.g. "White Wagtail" as distinct from "Pied Wagtail") — would add complexity to the list for marginal benefit; can be added as free-text for now
- Coastal specialists (Puffin, Guillemot, Gannet, etc.) — excluded by design; a coastal patch user can use free-text

## Files changed
- `data/species.ts` — complete rewrite of SPECIES array
- `app/(tabs)/log.tsx` — showFreeText logic + dropdown row
- `app/(tabs)/edit.tsx` — showFreeText logic + dropdown row
