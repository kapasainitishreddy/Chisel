# AI Development Handoff

## Jawline tracker, trainer and face scan polish — 2026-10-05

Continue `fix/tracker-trainer-scan-polish-20261005`, tested application **e2f1501ce3bc529aef9c2910c468740252718071**, from published StoreReady source 1d3f069b. [Polish report](FEATURE_POLISH_REPORT.md) and [evidence](evidence/feature-polish-20261005/source-and-results.json) record the current behavior and limits. Jawline progress now shows actual Precision baseline/current uncertainty and honest comparison states; quick photo comparison is keyboard accessible. Trainer score/guided labels, observed hold progress, pause and corrections are repaired. Scans use fresh frames, consistent live/final gates, fail-closed missing metrics, cancellation cleanup, and readable preparation/recovery.

329/329 tests, ten new regressions, clean-source frozen install/build, 33 feature-browser + 17 private-tools + two privacy-browser checks PASS. Android debug/release source compilation and manifest processing PASS (220 Gradle tasks). Actual StoreReady assurance rerun remains BLOCKED (3 PASS / 5 BLOCKED / 5 ACTION_REQUIRED / 9 PLATFORM_REQUIRED / 40 AUTOMATION_PENDING). Browser camera/model/account replies are explicit fixtures; no current signed APK/AAB, native-device or empirical accuracy/efficacy validation is implied. Existing billing-off/privacy/account/provider/Play blockers remain. No deployment, purchase, key creation, console change, merge or force push. Non-default publication only, following secret scanning.

## StoreReady Play audit and fixes — 2026-10-04

Continue `fix/storeready-play-readiness-20261004`, application/test SHA **c87f20b8239c9e41b62ec33b72e0e02081054057**. The later retained task source was recovered: work efebe818 / application bf826193, nine commits ahead of remote main. All 13 remote branches and nine PRs were compared. Read [Play readiness report](PLAY_READINESS_REPORT.md) and [durable evidence](evidence/play-readiness-20261004/source-and-tool-version.json).

Actual StoreReady 2.1.0 at 16e71ad3 ran before/after and remains **BLOCKED**. Verified fixes: Billing 8/compatible Capacitor 7 and Java 21/Kotlin 2 migration; active-entitlement purchase/restore checks; explicit backup/transfer exclusions; current bundled privacy and notification disclosure; distribution-only signing guard; npm advisories 9→0. Release flags remain billingEnabled=false/cloudPhotoRendersEnabled=true, API 36/min API 23.

319/319 Node tests, clean-source frozen install/build, 17/17 completion browser checks and 2/2 external-network-denied policy navigation checks PASS. Debug and release source compilation/resources and release-manifest merge PASS; 221 Gradle tasks. Merged release target 36/Billing 8.0.0; 61 downloaded AARs have no .so. bundleRelease --dry-run correctly rejects absent upload credentials. No signing key or current installable artifact created; prior debug APK is historical bf826193 evidence. Unpublished 10-commit range Gitleaks: no leaks; worktree public/reference-key candidates individually triaged.

Final signed AAB, real Android/16 KB/permission/lifecycle/accessibility/performance acceptance, real billing/OTP/deletion, undeployed lifecycle/scheduler/provider-retention acceptance, exact-artifact Data Safety/privacy/health/listing and account testing/identity gates remain blocked or not run. Browser auth/billing/deletion replies are fixtures. No console change, purchase, deployment, merge or force push; authorized publication is only the non-default fix branch.

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
