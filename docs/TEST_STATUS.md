# Test Status

_Last updated: 2026-08-16_

## Test framework

Chisel uses the **Node built-in test runner** plus GitHub Actions visual QA and
an Android build workflow. The static Capacitor web layer has no Jest/Vitest
framework or bundler.

## Current automated coverage

Run from `chisel-android/`:

```bash
npm test
```

This executes `node --test tests/*.test.cjs` and currently covers the app shell,
asset synchronization, AR coach, scan guards, precision logic, try-on behavior,
mobile regressions, premium/product polish, and supporting runtimes.

The `Chisel Tests` workflow also runs `node --check` on all late-loaded runtime
files and browser-driven generated-portrait / try-on visual QA for male and
female fixtures.

The `Chisel Mobile Build` workflow installs dependencies, runs Capacitor sync,
verifies synchronized assets, runs the full Node suite, builds a debug APK and
builds a release AAB.

## Latest verified execution — 2026-08-16

### Product-polish TDD pass

- Focused `product-polish.test.cjs`: **11/11 passing** after implementation.
- New coverage verifies:
  - local, calendar-day-scoped `chisel:cxpDaily` completion state;
  - explicit user completion rather than automatic completion;
  - Home `Measure → Act → Compare` hierarchy and live status text;
  - honest Pro presentation with no fake scarcity;
  - canonical / Android product-polish asset parity.

### Full Node suite

GitHub Actions on source commit
`5cd298161841f35bb9e7f19d45b6b6e037949014`:

- JavaScript syntax gate: **PASS**.
- `npm test`: **114/114 passing, 0 failures, 0 skipped**.

### Android package/build

`Chisel Mobile Build` run 119 on the same source commit: **PASS**.

Successful steps include:

1. Node 22 + Java 17 + Android SDK setup.
2. Dependency install.
3. `npx cap sync android`.
4. Synchronized app-shell verification.
5. Full automated test suite.
6. Debug APK build.
7. Release AAB build.
8. Artifact upload.

This verifies that the changed product-polish runtime is packageable in the
Android application. It does not prove clinical or population-level measurement
accuracy.

### Browser visual QA

On the original four-minute workflow budget, male generated-portrait and try-on
jobs completed successfully while both female jobs were terminated at the job
runtime ceiling. The individual commands have their own 120–150 second guards,
so the workflow-level budget was raised from 4 to 7 minutes in commit
`db4dd407839f46e0250b16dbb080186ee5e54db5` to let cleanup/artifact upload finish.
A fresh CI run is the verification gate for that workflow-only correction.

## Existing physical-device evidence

Physical Android QA from 2026-08-11 remains valid for the underlying camera and
mobile shell on device `R3CW10Y67TT`:

- five primary tabs fit above Samsung system navigation;
- Settings is separate from the primary tab bar;
- Analyze keeps Quick Scan + AR Coach reachable;
- live front-camera MediaPipe AR jaw/cheek guidance rendered and responded;
- no crash-buffer entry was observed during that focused run;
- try-on controls remained scrollable above the system navigation area.

The 2026-08-16 work changes the late-loaded Home/product/paywall presentation and
does not replace the need for a final release-candidate device smoke test.

## Untested / external critical flows

- Representative Quick/Deep scan repeatability against reference measurements
  across phones, lighting, skin tones, facial hair, eyewear and face shapes.
- Production photoreal provider round-trip and cost/quota behavior.
- Live Google Play + RevenueCat purchase/restore/grace/expiry behavior.
- Production server entitlement enforcement after deployment/configuration.
- Notification permission + delivery on representative Android versions.
- Final Web Share / export behavior on the release candidate.
- Fresh-install, permission-denial/recovery, process-restart and offline smoke
  tests on the final signed/test-track build.

## Release-testing blockers

The software build is automated. The remaining high-value gates are empirical
scan repeatability, production billing/server configuration, final signed-AAB
internal testing, and a short real-device regression pass on the release candidate.
