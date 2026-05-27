# T35 — Journal keyword search
_Shipped: 2026-05-27_

## What shipped
- Magnifying glass icon at the right of the "Your entries" header on the journal tab
- Tapping the icon replaces the header row with a full-width TextInput (auto-focused) + × dismiss button
- Typing filters entries client-side in real time — case-insensitive substring match on prose body
- Results show as a flat list (date section headers suppressed during search)
- Zero-match state: "No entries match '[query]'." — personalised with the search string
- Tapping × or navigating away resets search state entirely

## Key decisions
- **Client-side filtering over a DB query:** `getJournalEntries` already loads all entries; a LIKE query would be a round-trip to SQLite for no gain at typical journal sizes. The loaded `entries` array now stored in state alongside `sections`.
- **Inline header transformation instead of a search bar above the list:** Keeps the screen uncluttered when not searching — no persistent input chrome. The icon is the only affordance until tapped.
- **Date section headers suppressed during search:** Showing grouped results when filtering across months would be confusing — a flat list is the right read. Achieved by passing a single untitled section `{ title: '', data: filteredEntries }` and rendering `null` for empty section titles.
- **Reset on blur, not on clear:** Search state is cleared in `useFocusEffect` cleanup so returning to the journal always starts fresh — consistent with how the log screen resets session state.

## Deferred / shelved
- **Date range filtering** — not needed; keyword is the right axis for a prose journal. Could layer on later if search usage data suggests users need it.
- **Highlight matching text in results** — would require text-split rendering; not worth the complexity for v1.

## Files changed
- `app/(tabs)/journal.tsx` — search state, SearchIcon component, header transformation, displaySections logic, SectionList update, empty state handling, new styles
