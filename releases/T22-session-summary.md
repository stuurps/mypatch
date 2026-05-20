# T22 — Session summary
_Shipped: 2026-05-20_

## What shipped
- Log screen stays open after adding a sighting — form resets inline, user can log the next species immediately without leaving the screen
- First CTA reads "Add to [patch name]" (e.g. "Add to Fowlmere") — personalised from the first tap
- After the first add, CTA becomes "Add another sighting" and a second amber "Finished" button appears below it with a gap between them
- Session tally strip appears above the CTAs as species are added: `Robin · Kingfisher · 2 Coots` — count shown only when > 1
- "Finished" with a single species logged: goes straight to home (toast already confirmed the add)
- "Finished" with multiple species logged: shows a full-screen parchment overlay — patch name in amber small caps, species list centred below — auto-dismisses after 1.2s, tap anywhere dismisses sooner, then navigates home
- Back chevron always exits quietly to home with no overlay
- Per-add toast unchanged — fires on every individual add
- `loggedSpeciesSet` updates inline after each add so "new for your patch" / "on your patch" hints stay accurate within a session

## Key decisions
- **Stay-and-accumulate rather than summary-on-home**: the natural alternative was a banner on the home screen. Rejected because it would sit alongside the existing "N species today" count and feel redundant. The closing moment belongs on the log screen.
- **"Finished" below the CTA, not in the header**: initial build put Done in the header right slot but it wrapped to two lines and felt disconnected from the action. Moving it below as a second amber button — with a gap — reframes the two choices clearly: add another or finish.
- **Single-species sessions skip the overlay**: one bird logged and Finished → straight home. The toast already confirmed the add; an overlay naming one species adds no information. The summary is only meaningful as a list.
- **Auto-dismiss at 1.2s not 2s**: matched to the existing toast duration. Long enough to read, short enough not to feel like an interruption.
- **Session = component-local state, cleared on refocus**: no persistence. Returning to the log screen starts a fresh session — no ambiguity about what counts as "the same session."
- **Conditions persist across adds within a session**: existing behaviour preserved. Weather doesn't change between birds; species/count/notes do.
- **Patch name in first CTA**: "Add to Fowlmere" is more personal than "Add to patch" — consistent with the app's name-everything-personally principle.

## Deferred / shelved
- Nothing cut from scope.

## Files changed
- `app/(tabs)/log.tsx` — removed post-add navigation; added session state, tally strip, contextual CTA label, Finished button, overlay render
- `components/SessionSummaryOverlay.tsx` — new component
