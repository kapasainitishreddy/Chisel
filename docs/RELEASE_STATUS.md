# Release Status

_Last updated: 2026-07-26 (Claude Code)_

## Identity
- **Package / application ID:** `com.chisel.lookmax` (fixed after first Play upload — do not change)
- **App name:** Chisel
- **Version name:** `1.0.0`
- **Version code:** `1` (increment for every upload after the first)

## SDK / build config
- **Minimum SDK:** 23
- **Target SDK:** 35
- **Compile SDK:** 35
- **Android Gradle Plugin:** 8.6.0
- **Gradle:** 8.7
- **Files:** `chisel-android/android/variables.gradle`, `chisel-android/android/build.gradle`, `chisel-android/android/gradle/wrapper/gradle-wrapper.properties`
- **Note:** API **36** becomes mandatory 2026-08-31 (APP-P2-004).

## Permissions (AndroidManifest)
- `android.permission.INTERNET`
- `android.permission.CAMERA` (feature `camera`/`camera.front` marked `required=false`)
- `POST_NOTIFICATIONS` — **not yet present**; will be added when
  `@capacitor/local-notifications` is installed and `cap sync` runs (APP-P0-001 / APP-P2-005).

## Signing
- **Status:** Release `signingConfig` wired in `app/build.gradle`, reading a
  gitignored `keystore.properties` via `rootProject.file(...)`. Build is unsigned
  until that file + keystore exist.
- **Keystore status:** **Not created** (developer action). `keystore.properties`,
  `*.jks`, `*.keystore` are gitignored; template at
  `chisel-android/android/keystore.properties.example`. No secrets in the repo.

## Build status
- **Debug build:** not run this session (needs JDK 17 + SDK 35).
- **Release build:** not run (needs keystore + JDK/SDK).
- **AAB status:** **not generated.**
- **AAB path (when built):** `chisel-android/android/app/build/outputs/bundle/release/app-release.aab`
- **AAB file size:** n/a (not built)
- **AAB checksum:** n/a (not built)

> ⚠️ **Before building:** `chisel-android/android/app/src/main/assets/public/index.html`
> is **stale** (≠ `chisel-android/www/index.html`). Run `npm install` + `npx cap sync android`
> first or the AAB ships an outdated app (APP-P0-001).

## Play Store assets & policy
- **Store graphics:** feature graphic + 5 screenshots drafted as brand-accurate
  representations (delivered as a Claude artifact, not in the repo). Replace with
  real device captures (APP-P3-004).
- **Privacy policy:** `docs/privacy-policy.html` written and accurate. Status:
  **needs hosting** (GitHub Pages → `https://kapasainitishreddy.github.io/Chisel/privacy-policy.html`) and linking in Console.
- **Data safety:** answers documented in `PLAY_STORE.md` (Photos = collected/shared-ephemeral for photoreal; Device ID = collected/not-shared; encrypted in transit; deletion on request). Not yet submitted.
- **Content rating:** questionnaire not completed. Suggested 17+.
- **Health declaration:** required (wellness wording); app already states "cosmetic & educational — not medical advice."

## Monetization
- Paywall UI wired in client (inert until `RC_API_KEY` set + plugin synced).
- `render-lookmax` entitlement enforcement: **source updated, deploy pending** (APP-P1-001).
- Google Play subscription product + RevenueCat entitlement `premium`: **not configured** (APP-P1-004).

## Remaining manual Play Console work
1. Create app record (package `com.chisel.lookmax`), pricing (free), countries.
2. Host + link privacy policy; complete Data safety, content rating, target audience, health declaration, camera-permission declaration.
3. Upload signed AAB to Internal testing; run closed test (12 testers/14 days if dev account created after 2023-11-13).
4. (Optional now) configure the subscription + RevenueCat for billing.
5. Production release with staged rollout.

See `PLAY_STORE.md` for the full step-by-step.
