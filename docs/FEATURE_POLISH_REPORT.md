# Jawline tracker, trainer and face scan polish

Verified application source: **e2f1501ce3bc529aef9c2910c468740252718071**. Starting source: **1d3f069b99499e7c6fd9c4e5e28af93592debcd2** on the published StoreReady fix branch. Work continues the recovered newerChisel source; main was not substituted. Remote fetch confirmed the published source and unchanged main at 1c08c6ef. Earlier all-branch/PR provenance comparison remains in [Play readiness report](PLAY_READINESS_REPORT.md). Unrelated branches and work were preserved.

Branch: `fix/tracker-trainer-scan-polish-20261005`. This is code and documentation work; no public deployment, purchase, signing key, console change, merge or force push.

## Changes

- **Jawline tracker:** an Analyze entry opens the existing Precision batch flow. The report shows real baseline/current ratios and jaw angles, within-batch uncertainty, numerical differences, and Baseline only / Within normal variation / Not comparable / Not measured states. Small nonzero uncertainty remains visible. Original quick scans remain photo history; identical decorative bars were removed. Photo comparison has an accessible range control, keyboard support, and pointer capture instead of accumulating global listeners.
- **Training:** current form signals alone determine the displayed label; null is not turned into a zero score. Guided setup and unavailable hand guidance stay explicit. Holds/progress use observed hold time. Pause resets the hold and stays visible through the camera wrapper; correction messages are preserved when the pose is already frontal. Close, pause, next and stop remain reachable in tested phone/landscape/wide browser layouts. A stale hand-model reply cannot attach to a later session.
- **Face scanning:** preparation and permission/engine recovery copy are clearer. New sessions discard old samples and timers. Late permission replies stop their tracks after cancellation. Camera switching retains the active mode. Live countdown and the final gate use the same framing/exposure requirements; missing/nonfinite metrics fail closed. Frozen frames cannot fill a burst; stale manual captures are rejected. Result trust badges reset, retakes have a fresh timeout, and camera controls are real keyboard-operable buttons.

## Verification

| Gate | Result | Evidence |
|---|---|---|
| Retained baseline | PASS, 319 tests | [baseline](evidence/feature-polish-20261005/baseline-tests-confirmed.log) |
| New regressions | PASS, 10 checks | [after](evidence/feature-polish-20261005/regressions-after.log); [nine baseline failures](evidence/feature-polish-20261005/regressions-before-confirmed.log); [small uncertainty before formatting correction](evidence/feature-polish-20261005/small-uncertainty-before.json) |
| Full suite | PASS, 329 tests, zero failures/skips | [test log](evidence/feature-polish-20261005/final-tests.log) |
| Clean tracked-source install/test/build | PASS, frozen npm install, 329 tests, 46 modules | [clean tests](evidence/feature-polish-20261005/clean-tests.log), [build](evidence/feature-polish-20261005/clean-build.log) |
| Feature browser | PASS, 33 checks | [report](evidence/feature-polish-20261005/browser/report.json) |
| Existing private-tools browser | PASS, 17 checks | [report](evidence/feature-polish-20261005/completion-browser/report.json) |
| Local privacy navigation | PASS, 2 checks | [report](evidence/feature-polish-20261005/privacy-browser/report.json) |
| Android debug/release sources and manifest | PASS, 220 Gradle tasks | [native log](evidence/feature-polish-20261005/native-compile.log) |
| Current StoreReady assurance | BLOCKED | [actual raw report](evidence/feature-polish-20261005/storeready/report.json), [master checklist](evidence/feature-polish-20261005/storeready/02_MASTER_CHECKLIST.md) |
| Signed final APK/AAB, native runtime, physical-device/16 KB, empirical accuracy/efficacy | NOT RUN / BLOCKED | Missing signing/device/empirical acceptance; prior historical APK is not this build |
| Live store/OTP/account deletion/provider operations | NOT RUN | Existing release blockers remain; billing stays disabled |

Commands from `chisel-android`: `npm test`, `npm run build`, `node tests/feature-polish.test.cjs`, `node tests/feature-polish-browser.mjs`, `node tests/completion-browser.mjs`, `node tests/play-privacy-browser.mjs`. Browser QA uses the existing local Chromium and QA-only puppeteer-core installation. The new browser runner is committed; camera/model signals and progress records are explicit fixtures. It exercises actual controls/storage/gates, not real camera accuracy. Existing account/store replies in the completion runner are explicit fixtures; no emails or purchases were made.

Clean-source validation used `git archive` of the application SHA, `npm ci --ignore-scripts`, `npm test`, and `npm run build`. Android used the retained Java 21/Gradle toolchain with `:app:compileDebugSources :app:compileReleaseSources :app:processReleaseManifest`, without distribution/signing tasks. Canonical web files were synchronized through the existing npm pretest hook. The initial sandbox-only test runner could not spawn its children correctly; its 57 file-level results were excluded. The confirmed 319/329 counts came from successful full executions.

Actual StoreReady SHA 16e71ad3, root 2.1.0 / CLI 1.0.0, ran with the invocation in [source/results](evidence/feature-polish-20261005/source-and-results.json). Raw outcome: PASS 3, BLOCKED 5, ACTION_REQUIRED 5, PLATFORM_REQUIRED 9, AUTOMATION_PENDING 40. Public/reference-key heuristics and privacy operational/legal evidence still need the earlier report's review; no claim of Play approval. This run did not add the prior audit's optional external-tool PATH/artifact evidence, so its counts are not a matched comparison with that enhanced run.

## Limits and deliverables

The polish improves verified software behavior. Jawline measurements have not been validated across real faces/cameras/light conditions, and exercise effectiveness has not been established. Within-batch variation is not validated accuracy, and a photographic difference does not prove a routine's effect. Current-source MediaPipe accuracy, actual Android camera/picker/lifecycle/permission performance and real billing/account/provider acceptance were not tested here.

Screenshots contain explicit local fixture records and the existing illustration, not a real person's progress. [Jawline report, phone](evidence/feature-polish-20261005/browser/jawline-360.png), [wide](evidence/feature-polish-20261005/browser/jawline-1280.png), [routine preview](evidence/feature-polish-20261005/browser/trainer-preview-360.png), [paused trainer](evidence/feature-polish-20261005/browser/training-360.png), [landscape](evidence/feature-polish-20261005/browser/training-800.png).

The final publication SHA and remote verification are recorded in `/workspace/chisel-feature-polish-report.md` and `/workspace/chisel-feature-polish-evidence/publication-receipt.json` after the documentation commit. This repository report identifies the tested application SHA; its later publication commit changes documentation/evidence only.
