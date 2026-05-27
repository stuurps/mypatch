# T32 — Log Screen Overhaul
_Shipped: 2026-05-27_

## What shipped
- Species input auto-focuses on screen open — no extra tap to start logging
- Selecting a species from the dropdown dismisses the keyboard, revealing count stepper and CTA immediately on screen
- After adding a sighting, app auto-navigates home after 1.8s
- "Log another" amber link appears during that 1.8s window — tapping it enters session mode
- Session mode: tally at top, Done button in header, no auto-nav after subsequent adds
- Secondary fields (date, time of day, conditions, notes) collapsed behind a "Details ›" toggle
- Details summary line shows current values ("Day · Clear") so nothing is invisible
- Species input enlarged to 18px; count stepper centered with 32px count number
- Dropdown capped at 5 results

## Key decisions
- **Auto-navigate vs Finished button:** The old sticky footer "Finished" was perpetually hidden by the keyboard because auto-focus-after-add kept the keyboard up. Rather than just removing the auto-focus, the whole single-bird flow was redesigned around auto-nav — the app does the right thing without asking.
- **"Log another" not "Stay":** Framed as an explicit choice to continue, not a default. Users who want one bird don't have to dismiss anything.
- **Details collapsed by default:** Time of day and conditions are still recorded (last-used conditions still persist in memory). The summary line ensures the user knows what's being logged. Power users open Details; field loggers never need to.
- **CTA only appears when species is selected:** Removed the disabled/dimmed CTA. The screen has a clear next step at every moment — no visual noise.
- **Session tally moves to top:** In session mode, the tally sits above the species input so it's always visible without scrolling, regardless of keyboard state.
- **1.8s not 1.0s:** Long enough to read the header confirmation ("✓ Robin") and decide to log another. Short enough to feel instant for the common case.

## Deferred / shelved
- Edit screen not redesigned — it's a deliberate/secondary flow (accessed from species detail) and doesn't have the same speed requirements.
- Animation for count stepper / details panel appearance — not needed; the clean layout reads immediately.

## Files changed
- `app/(tabs)/log.tsx` — complete redesign
- `TASKS.md` — Task 32 added
