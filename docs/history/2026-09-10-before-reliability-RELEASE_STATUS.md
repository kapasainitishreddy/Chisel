# Chisel Release Status

_Last updated: 2026-08-11_

## Current verdict

**Android release candidate.** Chisel's automated product suite is green and the Android build is synchronized. The canonical UI and AR jaw + cheek coach have been installed and exercised with the real camera on a physical handset, with the legacy native Labs/Precision/Premium injector disabled. Camera-derived measurement correctness still requires representative repeatability validation before stronger empirical accuracy claims are made.

## Identity

- Package/application ID: `com.chisel.lookmax` (do not change after first Play upload)
- App name: Chisel
- Version name: `1.0.0`
- Version code: `1` (increment after the first Play upload)

## Android build stack

- Minimum SDK: 23
- Compile SDK: 36
- Target SDK: 36
- Android Gradle Plugin: 8.10.0
- Gradle: 8.11.1
- Java: 17
- Capacitor Android: 6.1.2

Primary files:

- `chisel-android/android/variables.gradle`
- `chisel-android/android/build.gradle`
- `chisel-android/android/gradle/wrapper/gradle-wrapper.properties`
- `.github/workflows/android-mobile-build.yml`

## Verification

### Automated tests

Latest verified synchronized product suite: **57/57 passing**.

Latest native-sync/build verification: `npm install` + `npx cap sync android` + `npm test` + `./gradlew.bat assembleDebug` were run successfully.

Coverage includes:

- enhancement core/UI
- native integration and Android asset synchronization
- Precision consensus/outlier behavior
- actionable capture-failure guidance
- uncertainty-aware change detection
- condition/method/view/distance matching
- Precision result trust language
- local-only Precision image processing checks
- premium mobile UX expectations
- AR jaw/cheek exercise safety and catalog behavior
- form-gated AR hold/rep state behavior
- AR picker/HUD mobile layout and bundled-engine integration

### Android CI

A verified API-36 mobile run completed these gates successfully:

1. Node 22 + Java 17 setup
2. Android 36 platform/build-tools installation
3. dependency install
4. `npx cap sync android`
5. synchronized app-shell verification
6. automated tests
7. `assembleDebug`
8. `bundleRelease`
9. build-artifact upload

The verified CI artifact contained approximately:

- debug APK: 8.8 MB
- release AAB: 6.5 MB

The CI release AAB is a compile/release-bundle verification artifact. It is **not the final signed Play upload** because the private upload keystore is intentionally not stored in GitHub.

## Release signing

Release signing is wired in `chisel-android/android/app/build.gradle` and reads developer-owned values from gitignored `android/keystore.properties`.

Still required before Play upload:

1. Create/back up `chisel-upload.jks`.
2. Create the gitignored `keystore.properties`.
3. Build the signed release AAB locally or in a secret-backed release workflow.
4. Keep the upload key/passwords outside the repository and backed up securely.

See `PLAY_STORE.md` for exact commands.

## Android privacy hardening

The current manifest:

- requests only Internet + Camera for the core shell
- marks camera hardware optional for install filtering
- sets `android:allowBackup="false"`
- sets `android:usesCleartextTraffic="false"`
- uses a non-exported FileProvider

Core Precision image processing remains local-only in the checked implementation; optional photoreal rendering is a separate opt-in cloud path and must be disclosed/configured accordingly.

## Product status

See `FEATURE_MATRIX.md` for the detailed feature truth. In summary:

- Premium Onyx mobile shell: implemented
- Quick/Deep scanning: implemented; representative device/accuracy QA still required
- Precision Face/Skin: implemented with multi-photo consensus, outlier rejection and within-batch uncertainty
- Precision Body/Posture: implemented with front/side fusion and segmentation gates
- Actionable capture correction: implemented/tested
- Condition Match / uncertainty-aware progress: implemented/tested
- Chisel Labs modules: implemented; device validation required
- Grooming/routine/programs: implemented
- AR jaw + cheek coach: implemented, automated tested, debug-built and live-camera checked on a physical handset
- Local try-ons: implemented; device validation required
- Progress/photo/share/export tools: implemented; Android share QA required
- Local reminders: dependency/configuration + device permission QA required
- Photoreal cloud render: implementation seam exists; production provider/server configuration + live QA required
- Paywall purchase/restore seam: implemented; production Google Play/RevenueCat configuration required
- iOS: deferred

## Premium production status

The approved Free/Pro boundary is documented in `PREMIUM_FEATURES.md`.

Production paid access is **not yet considered live** until all of these are completed:

- Google Play subscription/base-plan creation
- RevenueCat `premium` entitlement/product mapping
- public Android RevenueCat SDK key configuration
- live purchase/restore/grace/expiry testing on a Play test track
- server entitlement/webhook deployment and secret configuration where used
- cloud-render quota/cost validation

Chisel may safely ship free-first while paid infrastructure is completed, provided the UI does not imply unavailable paid functions are already active.

## 2026-08-11 mobile corrective build

- Canonical web assets are synced into Android and guarded by checksum tests.
- Debug APK builds and installs successfully on `R3CW10Y67TT`.
- Five primary tabs fit directly above Samsung system navigation; Settings no longer
  competes as a sixth primary destination.
- Analyze is jaw-first, keeps Quick Scan and AR Coach visible, and avoids harmony/
  attractiveness ranking language.
- Live AR jaw/cheek guides are high contrast and were verified with MediaPipe on-device.
- Facial-hair rendering is deterministic/inclusive, and the phone try-on tray uses
  fitted three-column controls ending at the system-navigation boundary.
- Automated status: **57/57 tests pass**; `assembleDebug` passes.

This validates software behavior and one-device layout. It does not establish
population-level facial measurement accuracy; APP-P2-007 remains the empirical gate.

## Play Store work still outside source control

- Host and verify the privacy-policy URL.
- Capture final real-device screenshots and feature graphic.
- Complete Data Safety, content rating, target audience, health/wellness, ads and app-access declarations accurately.
- Create the app in Play Console with package `com.chisel.lookmax`.
- Upload the signed AAB to Internal testing first.
- Run any closed-testing requirement that applies to the developer account.
- Test camera permission, denial/recovery, scans, offline core behavior, share/export, purchase/restore (if enabled), notifications (if enabled), process restart and data deletion.
- Use staged rollout for production.

## Empirical accuracy gate

Software tests prove implementation behavior; they do not prove that camera measurements equal ground truth. Before marketing Chisel as highly accurate, validate repeated same-condition scans and reference measurements across representative Android devices, camera distances, lighting, skin tones, facial hair, glasses, face shapes and body-framing conditions.

Chisel should continue to reject weak captures and describe uncertain deltas as within normal variation or not comparable instead of forcing a number.
