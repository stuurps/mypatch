# T23 — Month stats on home + journal
_Shipped: 2026-05-21_

## What shipped
- Home stats row now shows three boxes: `This month` · `This year` · `All time` (most immediate to most historical, left to right)
- All three home boxes show distinct species counts (previously year and all-time showed sightings counts)
- Journal stats row updated to match: `This month` · `This year` · `All time`, counting journal entries
- New `getMonthSpeciesCount` DB helper for home (zero-padded month string for SQLite `strftime` compatibility)
- New `getMonthJournalCount` DB helper for journal (same pattern)
- Home "Your list" link species count now driven by the same `allTimeCount` state rather than a separate query

## Key decisions
- Switched home year and all-time from sightings counts to species counts at the same time — internal consistency matters more than preserving existing numbers; species is what birders actually care about
- Journal counts remain entry counts (not species) — the journal measures sessions, not records
- `allTimeSpeciesCount` state removed from home — was a separate query serving only the "Your list" label; `allTimeCount` now serves both roles
- Always visible (even at 0) — consistent across both screens, no conditional hide logic
- Journal change folded into T23 rather than a new task number — it was a direct extension of the same decision, not independent scope

## Deferred / shelved
- Nothing cut from scope

## Files changed
- `db/database.ts` — added `getMonthSpeciesCount`, `getMonthJournalCount`
- `app/(tabs)/index.tsx` — updated imports, states, `loadData`, stats row, `useMemo` deps
- `app/(tabs)/journal.tsx` — updated imports, state, load, stats row; removed stale style entries
