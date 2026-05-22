# T24 — Settings screen
_Shipped: 2026-05-21_

## What shipped
- Gear icon top-right of the home hero — entry point to Settings, no tab bar slot used
- Settings screen: four sections — Profile (edit name), Your patch (edit patch), Help (guide), Feedback (mailto)
- Edit name flow: `your-name.tsx` extended with `editing=true` param — pre-fills current name, hides step dots, CTA reads "Save", saves and navigates back
- Guide screen: four in-app sections covering logging, editing/deleting, journal, and renaming a patch
- `GearIcon` SVG component added (Material Design settings path, react-native-svg)

## Key decisions
- No tab bar slot — Settings is utility, not a destination users return to; gear icon in hero keeps the tab bar at three items (Sightings · + · Journal)
- Edit name reuses `your-name.tsx` rather than a new screen — same onboarding-style UI, same `setSetting` + `dispatch` save path; no duplicated form code
- Guide lives in-app as a separate screen, not a webview or external link — "feels native and personal" was the explicit brief requirement
- Feedback is a `mailto:` link to `hello@patch.app` (placeholder) — no backend, no form, nothing social
- Gear icon uses the Material Design settings SVG path via react-native-svg rather than a Unicode character or an icon library — consistent with the project's existing custom SVG icon pattern

## Deferred / shelved
- Nothing cut from scope
- Feedback email address is a placeholder (`hello@patch.app`) — replace before release

## Files changed
- `app/onboarding/your-name.tsx` — added edit mode
- `app/(tabs)/settings.tsx` — new file
- `app/(tabs)/settings-guide.tsx` — new file
- `app/(tabs)/index.tsx` — added gear icon + `GearIcon` import + `top` inset
- `app/(tabs)/_layout.tsx` — registered `settings` and `settings-guide`
- `components/GearIcon.tsx` — new file
