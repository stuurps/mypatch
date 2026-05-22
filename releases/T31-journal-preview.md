# T31 — Journal entry preview quality
_Shipped: 2026-05-22_

## What shipped
- Journal entry list previews now skip short opener lines (< 25 chars) if a longer line follows
- Previews can now display up to 2 lines, filling the available preview space instead of stopping after a short first line

## Key decisions
- 25-character threshold: roughly "Cold morning walk." — shorter lines are treated as openers
- Skip logic only applies if a subsequent non-empty line exists — single-line entries (short or long) are shown as-is
- Lines are joined with a space to fill the `numberOfLines={2}` display area
- No new component, no DB change — pure text presentation fix

## Files changed
- `app/(tabs)/journal.tsx` — added `journalPreview()` helper, updated `renderItem` to use it
