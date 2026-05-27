# T33 — Stat drill-down + last visit anchor

## What shipped

**Stat drill-down (B26):** The three stat boxes on the home screen (This month / This year / All time) are now tappable. Each one opens the species poster filtered to that period. The numbers were already meaningful — now they're destinations.

**Last visit anchor (B27):** A quiet line below the stats row shows when you last visited the patch and how many species you logged. "Last visit: Tuesday · 6 species." It only appears when prior visit data exists and always refers to a previous day — not the current session.

**Poster filter expansion:** The poster now has three filter pills — This month / This year / All time — matching the home stat boxes exactly. "This month" is a new filter mode backed by a new `getMonthSpeciesList` DB query.

## Design decisions

- Last visit excludes today: the query uses `date(seen_at) < date('now', 'localtime')` so the line is always about a prior visit, never the current one.
- `formatLastVisit` uses local date parsing (year/month/day components) to avoid UTC midnight offset issues on British timezone. Returns "Yesterday", weekday name within 6 days, or "1 June" format for older dates.
- Poster filter pill order (This month · This year · All time) mirrors left-to-right stat box order on home — the same tap target in two places shows the same filtered view.
- "All time" stat box and "Your list" link both navigate to the poster; this is intentional duplication — different entry points for different mental models.

## Files changed

- `db/database.ts` — `getMonthSpeciesList`, `getLastVisit`
- `app/(tabs)/poster.tsx` — month filter mode, URL param sync, three filter pills
- `app/(tabs)/index.tsx` — tappable stat boxes, last visit state + row, `formatLastVisit` helper
