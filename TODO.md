# Patch — To Do

Anything not in the current build scope, deferred ideas, and future improvements live here.

---

## Home sky

- [ ] Replace random sky selection with time-of-day logic
  - Sunrise (`SKY_SUNRISE`): 05:00–10:00
  - Day (`SKY_DAY`): 10:00–17:00
  - Sunset (`SKY_SUNSET`): 17:00–21:00
  - Night: 21:00–05:00 (needs a `SKY_NIGHT` palette — deep indigo/near-black)

## Update sightings

- [ ] Ability to remove or edit sightings. If you remove include a 'are you sure this will permanently remove' confirmation — covered in Task 8.

## User name in onboarding

Ask for the user's first name as a new onboarding step — builds a personal connection and opens up name-based personalisation throughout the app (e.g. `Good morning, Stuart` in the hero, personalised empty states).

**Where it fits:**
- New step between Welcome (step 1) and Name your patch (step 2) — shifts size selection to step 4
- Sky: `SKY_DAY` (same as Name your patch, or give it its own)
- Prompt: short, warm — e.g. `What should we call you?`
- Single text input, auto-focused, `Continue` disabled until non-empty
- Store `user_name` on the `patches` table (add column) or as a separate `settings` key-value table
- Step indicator dots update to show 4 steps

**Uses once stored:**
- Home hero subtext: `Good morning, [name]` or `[name]'s patch`
- Contextual empty state copy: `Nothing logged yet, [name]`
- Keep quiet about it otherwise — one use per screen, amber rule still applies
