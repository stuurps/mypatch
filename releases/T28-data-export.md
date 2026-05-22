# T28 — Data export
_Shipped: 2026-05-22_

## What shipped
- "Export your data" row in Settings under a new "Data" section header — produces a full JSON backup and delivers it via the native share sheet
- Export format: `{ exported_at, patches, sightings, journal }` — all patches, all sightings, all journal entries regardless of which patch is active
- File name: `patch-export-YYYY-MM-DD.json`, written to `FileSystem.cacheDirectory` then shared via `Sharing.shareAsync`
- Row shows "Exporting…" and hides the chevron during the async operation; resets via `try/finally` so it always recovers even on error
- "Send feedback" link changed from `mailto:hello@patch.app` placeholder to the real GitHub issues URL

## Key decisions
- **Full backup over per-patch export**: exports all patches together. The purpose is "don't lose your data on reinstall" — exporting only the active patch would be a false sense of security.
- **No confirmation dialog**: export is non-destructive and the loading state communicates progress clearly enough.
- **"Data" section header added after build**: "Export your data" immediately after "Send feedback" felt like the same group. A separate section header makes the purpose — data ownership — distinct from feedback/contact.
- **`expo-file-system` + `expo-sharing` added**: not pre-installed despite being standard Expo SDK modules. Both resolved to SDK 55-compatible versions via `npx expo install`.
- **`try/finally` over `.catch`**: ensures `exporting` state always resets even if `Sharing.shareAsync` throws (e.g. user cancels the share sheet on some Android versions).

## Deferred / shelved
- Nothing cut from scope.

## Files changed
- `db/database.ts`
- `app/(tabs)/settings.tsx`
- `package.json` (expo-file-system, expo-sharing added)
