# Change Requests

How to use: a request stays under **Pending** until it is implemented **in the
actual app** and verified. Only then move it to **Implemented and Verified** with
evidence (files changed, verification, commit). If the user edits source directly,
detect the diff (`git diff`), preserve it, verify it, and record it here.

---

## Pending
_None._

## In Progress
_None._

## Implemented and Verified

- **CR-001 — Camera prominent disclosure** (Play compliance). Added a one-time
  consent screen shown before the first camera use.
  - Affected features: FM-33, FM-02/13/15/17/19.
  - Files: `chisel-android/www/index.html` (`ensureCameraConsent`, `#camConsent`, `cameraConsent` store key).
  - Verification: Node syntax + sandbox (functions define; consent gate wraps `openCam`). 2026-07-26. Commit: session checkpoint.

- **CR-002 — In-app data deletion** (Play compliance). "Clear my data" control on
  the Connect screen wipes all `chisel:` localStorage keys after confirmation.
  - Affected features: FM-34, privacy model.
  - Files: `chisel-android/www/index.html` (`wipeAllData`, `#wipeData`).
  - Verification: Node syntax + sandbox. 2026-07-26. Commit: session checkpoint.

- **CR-003 — Release-build hardening.** `webContentsDebuggingEnabled` set to `false`.
  - Files: `chisel-android/capacitor.config.json`.
  - Verification: JSON parses; value confirmed. 2026-07-26. Commit: session checkpoint.

- **CR-004 — Paywall backend entitlement check (source).** Implemented `rcUserId`
  lookup, `entitlements` gating, `free_limit_reached`/`showPaywall`, and 2/day free
  cap in the render function source.
  - Affected features: FM-30.
  - Files: `supabase/functions/render-lookmax/index.ts`.
  - Verification: manual review only (no Deno runtime here). **Deployment pending** (external blocker) — this CR is source-complete, NOT live.

> Earlier session change requests (facial analysis modules, try-on, makeup studio,
> identity system, growth features, Play-prep, paywall UI) are recorded in Git
> history (`git log`) and reflected in `docs/FEATURE_MATRIX.md`.

- **CR-005 — Accessibility & spacing polish.** Added visible keyboard focus
  (`:focus-visible` gold ring), removed tap-highlight flash, text-overflow guards
  on headings, tighter mobile button spacing, and `role`/`aria-label` on the
  icon-only camera controls (flip/capture).
  - Affected features: all screens (a11y), FM-13/15/17 camera controls.
  - Files: `chisel-android/www/index.html` (CSS focus block; camFlip/camShot attrs).
  - Verification: Node syntax — PASS; `:focus-visible` + aria present (grep). 2026-07-26.


- **CR-006 -- Native plugin sync + Android asset parity.** Installed and synced
  missing declared native plugins (`@capacitor/local-notifications`,
  `@revenuecat/purchases-capacitor`) and re-synced Android assets to match
  `www/index.html`.
  - Affected features: reminders, paywall wiring, and native packaging integrity.
  - Files: `chisel-android/package-lock.json`,
    `chisel-android/android/capacitor.settings.gradle`,
    `chisel-android/android/app/capacitor.build.gradle`,
    `chisel-android/android/app/src/main/assets/public/index.html`.
  - Verification: `npm install`, `npx cap sync android`, `npm test` (**39/39**),
    `./gradlew.bat assembleDebug`. 2026-08-09.

- **CR-007 -- Precision scan unblocks UI on stale/failed capture.** Added scan
  recovery so camera permission failures auto-close camera UX, quick-scan/deep-scan
  modes get a fail-safe timeout, and scan timeouts clear on results/rescan.
  - Affected features: precision scan flow reliability (quick/deep capture).
  - Files: `chisel-android/www/index.html`,
    `chisel-android/android/app/src/main/assets/public/index.html`.
  - Verification: `npx cap sync android`, `npm test` (**39/39**), `./gradlew.bat
    assembleDebug` (PASS). 2026-08-09.

- **CR-008 -- Precision UI hard stop on route/lifecycle transitions.** Added a
  hard-stop camera teardown path so lingering scan overlays cannot stay on top when
  leaving camera mode (route switches, visibility loss, backgrounding). This now
  clears camera state, overlay nodes, and in-flight timeouts consistently.
  - Affected features: precision scan overlay behavior in all screens (home/analyze/affirm/meditate/groom/connect).
  - Files: `chisel-android/www/index.html`,
    `chisel-android/android/app/src/main/assets/public/index.html`.
  - Verification: `npx cap sync android`, `npm test` (**39/39**), `./gradlew.bat
    assembleDebug` (PASS), APK installed and launched on device (`R3CW10Y67TT`) for
    manual verification. 2026-08-09.

- **CR-009 -- Additional scan-overlay hardening on mode entry.** Added defensive
  overlay clearing (`scanGuide`, `camSheet`, `styleBar`, `devReadout`,
  `photorealSheet`, `affirmOverlay`) in the shared camera-mode reset path so a
  completed/aborted scan UI cannot visually remain on top when entering style,
  coach, posture, affirm, or test modes.
  - Affected features: Precision scan UI state transitions and camera mode UX.
  - Files: `chisel-android/www/index.html`,
    `chisel-android/android/app/src/main/assets/public/index.html`.
  - Verification: `npx cap sync android`, `npm test` (**39/39**), debug APK
    reinstalled on device (`R3CW10Y67TT`) and launched. 2026-08-09.

- **CR-010 -- Native Precision overlay injection disabled in app shell.** Removed
  legacy Precision auto-injection from `MainActivity` so the old launcher/precision
  shell no longer appears over the app UI on startup.
  - Affected features: UI interaction integrity, camera UX reachability.
  - Files: `chisel-android/android/app/src/main/java/com/chisel/lookmax/MainActivity.java`,
    `chisel-android/tests/precision-native.test.cjs`.
  - Verification: `node --test tests/precision-native.test.cjs`, `./gradlew.bat
    assembleDebug`, uninstall/reinstall fresh debug APK on `R3CW10Y67TT`, and startup
    logcat check confirming no `chisel-precision*.js/.css` fetches.
    2026-08-09.

- **CR-011 -- Canonical mobile UI only; Labs overlay and cramped tabs removed.**
  Removed every native post-load shell injector so the Android activity renders
  only `www/index.html`. Reworked the six phone tabs to use compact geometric
  glyphs with readable labels and safe-area-aware height.
  - Affected features: UI interaction integrity and mobile navigation.
  - Files: `chisel-android/android/app/src/main/java/com/chisel/lookmax/MainActivity.java`,
    `chisel-android/www/index.html`, native/mobile regression tests.
  - Verification: `npx cap sync android`, `npm test` (**40/40**),
    `./gradlew.bat assembleDebug`; freshly installed on `R3CW10Y67TT` and
    validated Home → Analyze with screenshots, UI tree, and logcat. No Labs,
    legacy Premium, or injected Precision shell appeared. 2026-08-09.

- **CR-012 -- Removed developer USB setup from customer UI.** Replaced the
  Connect-screen USB debugging, Android Studio and APK-install instructions with
  customer-facing device, camera-control and privacy information.
  - Affected features: Connect tab trust and usability.
  - Files: `chisel-android/www/index.html`,
    `chisel-android/tests/native-integration.test.cjs`.
  - Verification: `npx cap sync android`, `npm test` (**41/41**),
    `./gradlew.bat assembleDebug`, debug APK installed on `R3CW10Y67TT`.
    2026-08-09.

- **CR-013 -- AR-only jaw and cheek coach.** Replaced the old guided jaw trainer
  with three on-device AR sessions (Jawline posture, Cheek lift, Full face),
  face-anchored contour/cheek/center guides, form-gated holds, large mobile-safe
  controls, local completion tracking, and explicit safety/evidence limits.
  Forceful jaw-jut and clench coaching was removed.
  - Affected features: FM-27, Analyze camera experience, jaw/cheek guidance.
  - Files: `chisel-android/www/chisel-ar-coach-core.js`,
    `chisel-android/www/index.html`, `chisel-android/tests/ar-coach-core.test.cjs`,
    `chisel-android/tests/ar-coach-ui.test.cjs`, synchronized Android assets.
  - Verification: TDD core/UI checks, `npm test` (**50/50**), `npx cap sync
    android`, `gradlew.bat assembleDebug`, APK installed on `R3CW10Y67TT`, live
    Cheek lift camera/landmark/HUD check, empty crash buffer. 2026-08-11.

## Rejected or Superseded

- **CR-R01 — Beauty / makeup "rater" (0–10 score).** Rejected after research
  (bias, body-image harm, Play-policy risk) and because it contradicts Chisel's
  anti-rating positioning. Superseded by the non-numeric **makeup coach** (FM-17)
  and **controllable-potential** figure (FM-07). Do not reintroduce a rating.
