# T21 — User Name in Onboarding
_Shipped: 2026-05-20_

## What shipped
- New onboarding step 2 (`your-name.tsx`): "What should we call you?" — SKY_DAY sky, auto-focused input, Continue disabled until non-empty, saves to `settings` table on confirm
- Onboarding sky arc extended to four screens: SUNRISE (welcome) → DAY (your name) → SUNSET (patch name) → NIGHT (size/finish)
- `SKY_NIGHT` now has stars: 25 fixed white SVG dots across the upper 60% of the hero, varying radius (1–2px) and opacity (0.4–0.9)
- `StepDots` updated to render 4 dots; all existing onboarding screens updated to position 1, 3, 4 of 4
- New `settings` table in SQLite (key-value, `key TEXT PRIMARY KEY`) — first app-global preferences store
- `getSetting` / `setSetting` helpers in `db/database.ts`
- `userName: string | null` added to PatchContext state; loaded from settings on init; settable via `SET_USER_NAME` dispatch
- Home greeting personalised: "Morning, Stuart" (main) + "on Fowlmere" (secondary) when name set; falls back to "Morning on Fowlmere" + rotating phrase for existing users with no stored name
- Journal greeting updated identically
- Home and journal skies changed from hardcoded `SKY_DAY` to `skyForSighting()` — night sky with stars now appears between 21:00–04:00
- `SkyHero` gains `stars?: boolean` prop; stars rendered before the tree layer so they sit in the sky, softened by the top scrim

## Key decisions
- **Name is required, no Skip** — "personal above all" means committing. A user who doesn't want to give a name can enter a single character. Skippable name steps train users to skip.
- **`settings` table over adding a column to `patches`** — user name is per-user, not per-patch. With second-patch (Task 18) coming, attaching it to the patches table would mean the name is either duplicated or owned by a specific patch. A global key-value store is the right shape.
- **Fixed star positions, no `Math.random()`** — random positions re-render differently across screen sizes and re-mounts. Fixed fractions of width/height give consistent results and avoid layout thrash.
- **Stars only on `SKY_NIGHT`, controlled by a prop** — not auto-detected from the band colours. Explicit is safer; the prop makes intent clear at the call site.
- **Day ends on NIGHT for the finish screen** — the arc SUNRISE → DAY → SUNSET → NIGHT tells a complete day's story. Night ending felt cold in isolation; stars fix that. It now reads as "the day is done, you're set up, tomorrow you watch."
- **`skyForSighting()` computed once on mount via `useState`** — calling it inline on every render is fine in practice (the hour won't change mid-session) but `useState` initializer is explicit about the intent: compute once, treat as a session constant.
- **Rotating phrase replaced by "on [patch]" when name is set** — the rotating phrase is warmth-filler for anonymous users. Once the app knows your name, the greeting is already warm; the phrase becomes noise. Two different secondary lines for two different states, not one line that tries to serve both.

## Deferred / shelved
- Nothing cut from scope.

## Files changed
- `components/StepDots.tsx` — 3 → 4 dots; type updated to `1 | 2 | 3 | 4`
- `components/SkyHero.tsx` — `stars` prop + STAR_DATA + Circle rendering
- `db/database.ts` — `settings` table in `initDatabase`; `getSetting`; `setSetting`
- `context/PatchContext.tsx` — `userName` in state; `SET_USER_NAME` action; init loads from settings
- `app/onboarding/_layout.tsx` — `your-name` screen registered
- `app/onboarding/index.tsx` — navigates to `your-name` (was `name`); dots now total 4
- `app/onboarding/your-name.tsx` — new screen
- `app/onboarding/name.tsx` — SKY_SUNSET (was SKY_DAY); dots 3 of 4 (was 2 of 3)
- `app/onboarding/size.tsx` — SKY_NIGHT + stars (was SKY_SUNSET); dots 4 of 4 (was 3 of 3)
- `app/(tabs)/index.tsx` — personalised greeting; `skyForSighting()` + `stars`; useMemo deps updated
- `app/(tabs)/journal.tsx` — personalised greeting; `skyForSighting()` + `stars`
