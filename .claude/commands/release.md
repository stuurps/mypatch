---
description: Bump version and trigger a full EAS APK rebuild for beta testers
model: claude-haiku-4-5-20251001
allowed-tools: Bash, Read, Edit
---

Bump the app version and trigger a full EAS build. Use this when native changes have been made (new Expo module, app.json config changes) that require a new APK — not for regular JS feature updates (use /beta for those).

Steps:

1. Read `app.json` to get the current `version` and `android.versionCode`.

2. Increment `android.versionCode` by 1.

3. Ask: should the `version` string also be bumped (e.g. 1.0.0 → 1.1.0)? Bump it if this is a significant feature release, leave it if it's a patch/fix rebuild. Use semantic versioning: minor bump (1.0.x → 1.1.0) for new features, patch (1.0.0 → 1.0.1) for fixes.

4. Write the updated values back to `app.json`.

5. Commit: `git add app.json && git commit -m "Bump version to [version] (build [versionCode])"`

6. Push: `git push origin main`

7. Trigger the build:
   ```
   eas build --platform android --profile preview --non-interactive --no-wait
   ```

8. Report: the new version/versionCode, confirm the push and build were triggered. Remind the user:
   - The build takes ~15 min — check progress at https://expo.dev
   - Once done, share the new APK link with testers (the old APK won't receive OTA updates for this new version until testers install the new build)
   - GitHub Actions will also fire and push an OTA update, but existing installs on the old version won't get it until they upgrade
