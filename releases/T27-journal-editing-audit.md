# T27 — Journal editing audit
_Shipped: 2026-05-22_

## What shipped
- `beforeRemove` navigation listener added to both compose and edit screens — saves on iOS swipe-back, Android hardware back, and back button tap via a single unified code path
- Delete button added to edit screen header right (red, `colors.red`) — delete is now always visible and reachable
- Long-press `Pressable` wrapper removed from the edit screen's `ScrollView` — was unreliable and conflicted with scroll gestures
- Tab bar FAB is now context-aware: filled amber on Sightings tab (→ log), outlined amber on Journal tab (→ journal-compose). Redundant `+` button removed from the journal list header.
- "Keep an eye out" section removed from the home screen. Generic seasonal phenology data (same 3 species for every user, changed 4×/year) was taking significant vertical space without adding patch-specific value. Sighting history now sits directly below the stats row.

## Key decisions
- **All save logic moved into `beforeRemove`** rather than keeping it split between `handleBack` and a gesture handler. The listener intercepts every back action regardless of source, calls `e.preventDefault()`, runs the save, then dispatches the original action with `navigation.dispatch(e.data.action)`. The back button now just calls `router.back()` which triggers the same listener.
- **`savingRef` retained** as a guard against the edge case where a button press and a gesture fire in the same cycle. When `beforeRemove` fires after `savingRef` is already true (e.g., the programmatic navigation from `router.back()` re-triggers it), the handler returns early without preventing — navigation proceeds.
- **`body` in `useEffect` dependency array** — listener is re-registered on each keystroke so the closure always captures current content. The alternative (bodyRef) was considered but adds complexity without meaningful benefit here.
- **Empty body on edit back**: preserves the original entry. Silent delete would be worse than preserving stale content.
- **Long-press delete removed** from the scroll area. It was undiscoverable and scroll interference made it unreliable. Delete is now header-only.
- **Context-aware FAB over a second compose button**: the tab bar FAB already exists in the same visual position on both tabs. Making it route-aware (outlined on Journal, filled on Sightings) was one change vs. adding a separate floating button to the journal screen. The outlined style signals "same type of action, different mode" — the distinction intentional per the product decision that sightings are frequent/fast and journal entries are slow/deliberate.
- **"Keep an eye out" removed rather than collapsed or personalised**: three options were considered — remove, collapse to one line, or replace with patch-aware prompts ("you haven't logged a Swift yet this year"). The personal version is the right idea but requires patch history to avoid being identical to the generic version. Removed now; the better version is logged as B18 in the Later tier for when there's history to draw on.

## Deferred / shelved
- Nothing cut from scope.

## Files changed
- `app/(tabs)/journal-compose.tsx`
- `app/(tabs)/journal-edit.tsx`
- `app/(tabs)/journal.tsx`
- `app/(tabs)/index.tsx`
- `components/PatchTabBar.tsx`
