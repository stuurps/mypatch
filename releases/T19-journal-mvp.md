# T19 — Journal MVP
_Shipped: 2026-05-20_

## What shipped
- Journal tab: reverse-chronological list of entries with date header (amber, small caps) + first line preview
- Compose screen: single multiline text area, no title field, date auto-set, no save button
- Edit screen: pre-filled, editable inline, long-press to delete with confirmation
- Auto-save on back (non-empty body → insert/update; empty → discard silently)
- Empty state: "Your first entry is waiting."
- All entries scoped to active patch via `patch_id`
- DB helpers: `insertJournalEntry`, `getJournalEntries`, `updateJournalEntry`, `deleteJournalEntry`

## Key decisions
- **No title field** — the date IS the title. Entries are identified by when they were written. Adding a title field turns it into a notes app; removing it keeps it as a field notebook.
- **Auto-save on back, not an explicit Save button** — consistent with Day One, Bear, Apple Notes. Explicit save belongs on the log form (logging a sighting is a deliberate act); journalling is a flow, not a transaction.
- **Prose only — no species fields, no conditions picker** — the log tab is the data path; the journal is the story path. Adding structured fields to the journal makes it a duplicate of the log form. The two screens serve different modes of the same activity.
- **One entry = one session** — not per bird or per hour. The entry is about being somewhere, not about any individual sighting.

## Deferred / shelved
- **Birds tagged within a journal entry** — the deeper integration where species are tagged in prose rather than logged separately. This is the right end state but requires a major rethink of both UIs and the data model. Added to BACKLOG.md as B10.
- **Journal appearing in species detail** — journal entries mentioning a species surfaced on the species detail page. No clear implementation path yet without tagging.

## Files changed
- `app/(tabs)/journal.tsx` — replaced coming-soon placeholder with full list UI
- `app/(tabs)/journal-compose.tsx` — activated from dormant state
- `app/(tabs)/journal-edit.tsx` — activated from dormant state
- `db/database.ts` — added 4 journal helpers
