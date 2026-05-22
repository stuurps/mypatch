# T29 — Milestone callouts on poster
_Shipped: 2026-05-22_

## What shipped
- Amber milestone line in the poster hero at 10, 25, and 50 all-time species
- Copy: "10 species. A real patch list." / "25 species. You know this place." / "50 species. Your patch is alive."
- Tap to dismiss permanently — written to the settings table, never shown again for that patch
- Only the highest un-dismissed threshold shows at any time

## Key decisions
- **Highest threshold first**: milestones checked [50, 25, 10]. If a user hits 25 species without ever having seen the 10-species callout (e.g. imported or logged quickly), they see the 25 message — not the outdated 10. The 10 is silently skipped.
- **Sequential getSetting loop over parallel**: milestone check runs after species data loads, walking thresholds until the first unseen one. At most 3 tiny queries. Parallel would require knowing the count upfront, adding complexity for negligible perf gain.
- **Settings key scoped per patch** (`milestone_shown_[patchId]_[threshold]`): two patches, two independent milestone sequences. Correct for Task 18 (second patch) when it ships.
- **No animation, no auto-dismiss**: the line sits in the hero until noticed. Auto-dismiss creates urgency — the opposite of the product tone. The user is in the poster looking at their list; this is the right moment.
- **Amber over white**: milestone text in `colors.amber` rather than the white used for stats. Gives it warmth and distinctness without being a badge or alert colour.

## Deferred / shelved
- Nothing cut from scope.

## Files changed
- `app/(tabs)/poster.tsx`
