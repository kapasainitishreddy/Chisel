# Chisel Release Status

_Last updated: 2026-08-16_

## Current verdict

**Android release candidate, free-first ready at the software/build layer.** The
canonical mobile shell, camera/AR path, try-on stack, privacy model, daily product
loop and Android packaging are implemented. The latest source build passed the
full 114-test Node suite, Capacitor synchronization, debug APK build and release
AAB build in GitHub Actions.

Production paid access is **not yet live**: Google Play subscription products,
RevenueCat production configuration and the server entitlement deployment still
need to be completed and tested. Camera-derived measurement correctness also
still requires representative repeatability validation before stronger empirical
accuracy claims are appropriate.

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

## 2026-08-16 product / conversion pass

The active late-loaded product-polish layer now makes the app behave like one
coherent daily system instead of a collection of tools:

- Home leads with **Measure → Act → Compare**.
- `Today's Chisel` recommends one useful action based on whether a baseline exists.
- Completion is explicitly marked by the user, stored locally under
  `chisel:cxpDaily`, and scoped to the local calendar day.
- The Home trust layer states that core analysis is local, Chisel has no public
  beauty score, and progress should be compared under repeatable conditions.
- The existing Scan / Try-on Studio / Face Yoga / Routine entry points remain.
- Pro is positioned as extra optional photoreal cloud-rendering capacity; core
  local analysis, privacy/deletion controls and honest results are not paywalled.
- Google Play remains the source of exact price and renewal terms.
- Store positioning now leads with `Measure. Act. Compare yourself to yourself.`
  and uses a conversion-oriented screenshot order in `PLAY_STORE.md`.

## Verification

### Automated product suite

On source commit `5cd298161841f35bb9e7f19d45b6b6e037949014`:

- JavaScript syntax checks: **PASS**.
- Full Node suite: **114/114 passing, 0 failures, 0 skipped**.
- Focused product-polish suite: **11/11 passing**.

### Android CI

`Chisel Mobile Build` run 119: **PASS**.

The workflow successfully completed:

1. Node 22 / Java 17 / Android SDK setup.
2. dependency install;
3. `npx cap sync android`;
4. synchronized asset verification;
5. full automated tests;
6. debug APK build;
7. release AAB build;
8. artifact upload.

This is build/package evidence, not a signed Play-production artifact. The private
upload keystore is intentionally not stored in GitHub.

### Visual QA workflow hardening

Male generated-portrait and try-on visual jobs passed on the first source run.
The two female matrix jobs reached the workflow's former four-minute ceiling,
which cancelled the overall visual workflow even though the build/test gate was
green. The workflow-level timeout is now seven minutes while the individual
browser commands retain their 120–150 second fail-safe limits. A fresh workflow
run validates this CI-only correction.

## Product status

Implemented or verified at the software layer:

- Premium Onyx mobile shell and five-tab phone navigation.
- Quick/Deep scan paths with capture-quality and failure guidance.
- Precision Face/Skin and Body/Posture logic with uncertainty-aware comparisons.
- Jaw/Cheek/Symmetry-first result hierarchy.
- AR jaw + cheek + Face Yoga guidance with safety/evidence limits.
- Hair, facial-hair, eyewear and makeup local try-ons.
- Photo progress, before/after comparison, routines, programs, reminders UI,
  sharing/export seams and local data deletion.
- `Today's Chisel` daily focus and local completion state.
- Optional photoreal cloud-render path and purchase/restore UI seams.
- Privacy-first / anti-public-rating product language.

## Production paid-access status

The Free/Pro boundary is intentionally additive. Paid access must not be presented
as production-live until all of the following are complete:

1. Create the intended Google Play subscription/base plans.
2. Map those products in RevenueCat to the `premium` entitlement.
3. Configure the RevenueCat public Android SDK key in the client.
4. Deploy/configure the server entitlement path and webhook secrets.
5. Validate purchase, restore, grace/expiry and entitlement enforcement on a Play
   test track.
6. Validate photoreal render quota/cost behavior under the intended paid limits.

Chisel can ship free-first while this infrastructure is completed, provided the
UI does not claim unavailable paid functionality is already active.

## Release signing

Release signing is wired to developer-owned, gitignored
`chisel-android/android/keystore.properties` / upload keystore values. Before a
real Play upload:

1. create and securely back up the upload keystore;
2. create the gitignored `keystore.properties`;
3. build the signed release AAB;
4. upload it to Internal testing before production.

## Privacy / trust boundary

- Core analysis remains on-device.
- No account is required for the core app.
- No advertising or analytics SDK is part of the intended product model.
- Optional photoreal rendering is the explicit cloud boundary.
- In-app deletion and privacy controls remain available without Pro.
- Camera-derived numbers remain photographic estimates, not clinical measurements.

## Remaining release gates

- Finish the fresh visual-QA workflow after the timeout-budget correction.
- Run the final release-candidate smoke test on a real Android device/test track.
- Validate representative scan repeatability / reference measurements before
  strengthening accuracy claims.
- Complete production Play + RevenueCat + entitlement configuration if Pro will
  launch with v1.
- Host/verify the privacy-policy URL and complete Play Data Safety/content forms
  against the exact shipped build.
- Capture final real-device store screenshots and feature graphic using the
  sequence/direction in `PLAY_STORE.md`.

## Empirical accuracy gate

Software tests prove implementation behavior; they do not prove that camera
measurements equal ground truth. Keep weak-capture rejection and conservative
`photographic estimate` language until repeated same-condition scans and reference
measurements are validated across representative devices and people.
