# AI Development Handoff

## Main-delivered Capacitor 7 and appearance checkpoint, 2026-10-28

Main implementation source `64581407f87c5cee360c34935c6c9d4a011a92b4` and
test follow-up `dd8189408859cd2c4b9cd33bd425a9c54b5f3947`, based on recovery
source `768629d413f5e78eaa4d576e9bd0b545117831ec`. The app retains the local
archive/photo/gallery failure recovery and safe deletion code while aligning
Capacitor Core, Android, CLI and plugins to 7.x (7.6.9 platform/core/CLI) and
adding explicit Android cloud/device-transfer backup exclusions. Settings now
offer system, light and dark themes, with bundled Public Sans and SIL OFL
notice. The local privacy page is linked from Settings. Billing remains off.

Fresh checks: dependency audit 0 vulnerabilities, `npm run build` 47 modules,
`npm test` 351/351 serially, `npm run test:browser` 4/4 serially, source syntax,
obvious-secret scan and `git diff --check` passed. Test follow-up commit
`dd8189408859cd2c4b9cd33bd425a9c54b5f3947` is on main. GitHub source workflow
40783501396 passes. Two earlier main workflow runs exposed browser-test
races—identity dialog reappearance and a retry-button render race—which were
made deterministic and passed on the follow-up run. Independent review found a
cloud-photo disclosure gap; Settings, render/retry controls, and the privacy
policy now distinguish the free camera-frame Replicate path from the separate
selected-photo studio path. Settings also say paid accounts and credit-backed
photo edits are disabled in this release. A new test verifies the Android
appearance assets after Capacitor sync. One concurrent test run
previously produced a flaky gallery-open timeout; serial scripts now make the
run deterministic, and serial full/browser reruns pass.

This candidate has not been compiled for Android or tested on a device. The
official Capacitor 7 Android requirements include JDK 21. The pinned Gradle
8.11.1 download had been refused; do not retry or bypass it. The archive and
backup exclusions do not encrypt live WebView records; Keystore vault, native
photo migration, power-loss/device deletion and TalkBack remain open. No
provider call, real photo, purchase, billing activation, deployment or
publication was performed. Keep legal/store applicability and release gates
open. See [TEST_STATUS.md](TEST_STATUS.md) and [RELEASE_STATUS.md](RELEASE_STATUS.md).

## Current local saved-look gallery checkpoint, 2026-10-28

Working branch `recovery/chisel-cloud-build-20261004-efebe81`; implementation
source `8ed59b6e2f1e41ca4d2ab41a25f53d860524d45f`. Gallery saves now write a
look and prune the eight-item cap in one IndexedDB transaction. Records are
validated before use; unreadable records are shown with a retryable, targeted
cleanup action, including rows with numeric IndexedDB keys. A denied IndexedDB
open can retry after storage access returns. Studio save snapshots its source
and result and checks for changes after hashing so a photo deletion cannot be
undone by a delayed save.

Rendered Chromium journey covers synthetic source/result creation, save-failure
transaction abort, keyboard comparison and neutral-split undo, second style
save, corrupt-record failure/retry and repair, persistence across reload,
single-look removal, and source-photo deletion during a delayed save. Full suite
335/335, browser suite 3/3, build validation 46 modules, independent review no
must-fix. Details and screenshot are in [TEST_STATUS.md](TEST_STATUS.md).

This is local WebView and synthetic browser evidence only. Native storage
encryption, device interruption/deletion, TalkBack and Android runtime remain
open. Live WebView stores and the saved gallery are not encrypted by Chisel.
Provider, billing, signed release and legal/applicability gates are unchanged.

## Next task

Obtain supported Android build/device tooling without bypassing the refused
Gradle download, then implement and verify the separate Keystore-backed vault
and native gallery deletion contract. Until then keep the native/device gate
open; do not claim the gallery or app is complete.

## Current archive recovery continuation, 2026-10-28

Working branch `recovery/chisel-cloud-build-20261004-efebe81` now has source
checkpoint `e75241e27d0e775de128c1607d1850f0d3b9ef33`. The existing archive
entry was reachable from the home tools dialog; Settings now opens it directly.
Archive restore uses a local prepared/committed journal, restores old values
before app startup after an interrupted write, and blocks app use if recovery
is still unavailable. The UI names supported and excluded data, explains that
live records and the temporary journal are unencrypted, and warns users to
close other browser tabs before restoring. Independent read-only review found
no must-fix. Full suite 334/334, browser suite 2/2 and build validation (46
modules) pass; details and screenshots are in [TEST_STATUS.md](TEST_STATUS.md).

This does not add unsupported archive data or a native encrypted vault.
Concurrent multi-tab restore, power-loss durability, physical device behavior,
TalkBack, and formal security acceptance remain unverified. Keep release,
billing, provider, and native gates open.

## Current follow-up, 2026-10-28

At implementation SHA `5e1f9fdaa6dae4d712db55caa8db39ab27df395f`, the ranked
home photo chooser was replaced with input-order local capture notes. The
follow-up adds an accessible dialog close button, Escape handling, focus
restoration, and a real Playwright/Chromium journey with fake camera/model
fixtures. Local import/remove/reselect, comparison interruption and failure,
keyboard style restore, reduced motion, 200% text sizing, local clear and
blocked-delete retry are exercised. The full suite is now **323/323 PASS**
including that browser run; `npm run build` validates 46 modules. See
`FEATURE_LEDGER.csv` for per-feature state and `COMPETITOR_EXPERIMENT.md` for
the dated, small-sample desk research.

The native Capacitor 6 shell exists, but no Keystore vault adapter exists.
This environment lacks `javac`, `gradle`, `adb`, and Android SDK paths, and
the wrapper's pinned Gradle distribution download is blocked; the explicit
no-bypass restriction prevents native compilation. Live WebView storage
remains unencrypted; iOS, physical-device, TalkBack, provider retention,
store/legal applicability and billing remain unaccepted. Screenshots from the
synthetic browser run are under `/tmp/chisel-photo-comparison-dialog.png`,
`/tmp/chisel-photo-comparison-200pct.png`, and
`/tmp/chisel-style-keyboard.png` in the execution environment.
No real images, paid services, credentials, deployment, publication, or
external participants were used. Confirm the verified remote working-branch
SHA before treating this checkpoint as available to other environments.

## Current recovery checkpoint, 2026-10-28

Continue branch `recovery/chisel-cloud-build-20261004-efebe81`. The continuation began at the exact verified remote source `efebe81813f6cfa9ef68472f3f5edf7c0b7b21f0`; no competing branch work was present. This bounded privacy/CX slice clarifies live-storage and export/deletion boundaries in Settings, improves touch/keyboard/screen-reader semantics in the legacy style controls, and gives camera permission/device failures concrete recovery steps. Source, Android mirror and current contract are covered by 317/317 Node tests; web build validation passes. See [native private-data contract](NATIVE_VAULT_CONTRACT.md).

The existing encrypted export is **not** a live-store vault: WebView records remain unencrypted while installed, selected portrait and saved AI gallery are excluded from export, local clear is separate from cloud-account deletion, and native PIN/biometric encryption is not delivered. The manifest already disables Android backup; this code does not change that security setting. Android debug build was attempted but the Gradle wrapper could not download Gradle 8.11.1 because network access was refused. Browser-runner acceptance was not run because `puppeteer-core` is absent. No real face, provider credential, paid edit, billing, device, or cloud lifecycle test was used.

Portfolio goal remains unvalidated: free local grooming exploration must deliver a private, understandable and reversible first session; optional paid value is only a clearly previewed, consented image edit. Usage, conversion, willing-to-pay, cost and contribution baselines are unknown. Do not claim revenue or launch readiness. Continue only against this recovery branch and its explicit gates.

## Current: completed local build checkpoint, 2026-10-04

Continue branch `work`, not the historical draft PR referenced below. Application source **bf826193988e91c2edc457b3ab405352594857e2** has 312/312 Node tests, 17/17 completion browser checks, 6/6 real-MediaPipe fixture checks, embedded PostgreSQL lifecycle acceptance and a successful Android debug APK. Clean tracked checkout passes. The missing eyewear modules and cascading loader are repaired. Adaptive programs, conservative progress, encrypted exported backups and discussion reports are wired; account deletion/scheduled recovery source is implemented but not deployed. Seven final review findings were fixed with regressions.

Read [the completion report](COMPLETION_REPORT.md) first for source, APK hash, evidence and remaining scope. APK: `/workspace/chisel-build/chisel-debug.apk`. No push/deployment/purchase/publication occurred. Preserve free local use; no new paid activation. Still required: signed Play artifact, final physical-device and empirical acceptance, cloud lifecycle deployment/live acceptance, provider/billing/retention acceptance and full native private vault. Live stores are not encrypted. Older account-free/framework/test descriptions in AGENTS.md and historical sections are superseded by actual current source and this checkpoint.

## Current: credit-backed studio and local comparison, 2026-09-10

Continue draft PR #7 on feat/chisel-unisex-trainer-skin. The user explicitly approved actual implementation of reasonable AI-credit pricing, OpenAI editing, comparison and stylist export. Do not restart the app, add another theme controller or substitute ChatGPT Image Gen for app tests. The older AGENTS.md account-free/Replicate-only statements now apply only to the free/legacy paths: paid credits use an optional verified email account and an OpenAI backend. Never expose API keys.

Read [current implementation, prices and exact evidence](AI_CREDITS_STATUS.md). Code/test head 4a932d41b5af04f2e52317dcb2946cfac8e599c6 passed 273 Node tests, 33 fixture-backed browser checks and six real endpoint readiness/rejection checks. Nine modified canonical/native assets match. The additive wallet migration and two new Edge Functions were deployed to the existing looksmaxxing project; sales, rendering and verified-cost flags remain OFF in both environments. No user account, receipt, wallet job or ledger entry was created by tests.

The photo-first UI now includes a Credits control, Standard/Detail quote, optional email-code sign-in, real native-store API integration, server balance, saved-look comparison and local printable HTML stylist reference. Browser store/auth/provider replies are explicit fixtures, not live purchases or real transformations. Free local tools remain account-free. Sharing, signing in, account persistence and Android billing still need physical-device acceptance.

Do not claim the entire CI is green: preexisting Frame Fitting QA fails because chisel-eyewear-fit.js is missing; the earlier workflow was committed without the promised fitting/policy/runner modules. Credits changes do not fix that, the faint local hair overlay, skin-only segmentation or exercise demonstrations.

Before enabling money or generation: securely supply/verify OpenAI access, generate real app outputs and measure full costs, configure Play consumables and RevenueCat/OTP, validate purchase/refund delivery, and complete account deletion, output cleanup and operational recovery. Then exact-source native builds and release acceptance. A backend deployment is not an APK or a finished store release.

[Full preceding handoff](history/2026-09-10-before-credits-AI_HANDOFF.md) and all prior photo/layout/accuracy checkpoints are preserved.
