# T34 — Browse sightings by month

_Shipped: 2026-05-27_

## What shipped

- New "History" screen (`/(tabs)/history`) — browse sightings by month with month/year navigation
- "Browse ›" link added to the "Recent sightings" section header on home (amber, quiet entry point)
- Month navigator: left/right arrows navigate backward and forward; right arrow disabled at current month, preventing forward navigation beyond today
- Sightings grouped by calendar day within each month; day headers show "Weekday D Month" in amber
- Each sighting row identical in style to home (species name · time of day icon · conditions icon · notes · count); tap navigates to species detail
- Stats line beneath month label: "N species · N records" (hidden when month has zero sightings)
- Empty state: quiet message "Nothing logged in [Month YYYY]."
- New DB function: `getSightingsByMonth` — queries sightings for a given year/month, ordered DESC

## Key decisions

- **Month navigation bounds:** No artificial lower bound on backward navigation — users can browse to any empty month. Design rationale: forward past current month is prevented (right arrow disabled), but the past is explorable even without data. An empty month shows a quiet message rather than blocking navigation.
- **Time zone handling:** Sightings grouped and queried by UTC `strftime('%Y', '%m')` on `seen_at`, consistent with the entire app's existing date handling (pre-existing UTC/local time handling, not changed by this task).
- **Entry point visibility:** "Browse ›" only appears when `earlierSightings.length > 0` — surfaces the feature once the user has accumulated history. Day-one users with only today's sightings don't see it, reducing noise for new users.
- **Right arrow invisibility at current month:** `opacity: 0` rather than removal — preserves visual balance and keeps the month label centered. The Pressable is also `disabled={true}` to prevent accidental touches.
- **Day grouping:** Using local calendar day (parsed from UTC `seen_at` date component); day headers use local date display. This matches how the home screen groups "Today" vs. earlier sightings.

## Deferred / shelved

- Nothing cut from scope.

## Files changed

- `db/database.ts` — added `getSightingsByMonth`
- `app/(tabs)/history.tsx` — new screen
- `app/(tabs)/_layout.tsx` — registered history screen with `href: null`
- `app/(tabs)/index.tsx` — added "Browse ›" link to "Recent sightings" section header + two new styles (`sectionHeaderRow`, `browseLink`)
