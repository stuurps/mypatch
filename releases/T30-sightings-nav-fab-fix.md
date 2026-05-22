# T30 — Sightings navigation fix + FAB visual bug
_Shipped: 2026-05-22_

## What shipped
- Tapping a sighting row on the home screen now navigates to the species detail page instead of the edit screen
- Sighting rows on the species detail page are now tappable — tap any record to edit it
- The circular + FAB in the tab bar no longer shows a rectangular press artifact — press highlight clips to the circle on iOS; circular ripple on Android

## Key decisions
- **Tap → species detail, not edit**: the primary intent when tapping a sighting row is curiosity about the bird, not immediate editing. Edit is a deliberate secondary action; it belongs one level deeper in the species history where you can see which specific record you want to change.
- **Edit access via species detail**: each sighting in the per-species list is now a Pressable → edit. `useFocusEffect` was already in place so the list reloads correctly after returning from edit.
- **Long-press left unbound on home rows**: reserved for B14 (quick re-log) when it ships.
- **FAB fix — separate shadow from clip**: `overflow: 'hidden'` and `elevation` on the same View is a known Android issue. Fix: wrapper `View` carries shadow/elevation only; inner `Pressable` carries `overflow: 'hidden'` (clips iOS press state to circle) and `android_ripple={{ borderless: false }}` (contained circular ripple on Android). Shadow is preserved; press artifact is gone.

## Files changed
- `app/(tabs)/index.tsx` — `renderSightingRow` onPress target changed
- `app/(tabs)/species.tsx` — sighting rows changed from `View` to `Pressable`
- `components/PatchTabBar.tsx` — FAB wrapped in shadow View; overflow + ripple added to Pressable
