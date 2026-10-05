# Release Status

## Brand, RevenueCat and customer experience — 2026-10-05

Continue `fix/brand-revenuecat-customer-experience-20261005`, tested application **3ace5b5c845c2d3beadf77b492f8f8e41626b62d**, from remotely verified 67486b7. [CX report](CUSTOMER_EXPERIENCE_REPORT.md), [growth strategy](GROWTH_STRATEGY.md), [brand](BRAND.md) and [evidence](evidence/brand-cx-20261005/source-and-results.json) supersede the prior task's latest pointers while retaining its implementation.

New actual branding, optional inline onboarding, native-dialog focus, phone fit, serialized Premium purchase/restore, actual price/renewal disclosures, blocked unsupported complex offers, cancellation links, honest unavailable credit prices and separate credit recovery are implemented. Billing remains OFF; public legacy SDK key is empty. RevenueCat dashboard/live offerings/receipts are not verified. Growth experiments are prepared hypotheses; no analytics SDK, marketing send, ad spend or sales activation occurred.

333/333 tests and clean-source frozen install/build PASS; four new regressions fail on original source and pass after. 21 CX + 33 feature + 17 completion + two privacy browser checks PASS. Android source/resources/release-manifest tasks PASS (220); no signed APK/AAB, instrumented/device or accuracy validation. Actual StoreReady remains BLOCKED (3 PASS / 5 BLOCKED / 5 ACTION_REQUIRED / 9 PLATFORM_REQUIRED / 40 AUTOMATION_PENDING), version/invocation recorded in evidence. Existing policy, account/provider, device/16 KB, billing and empirical validation gates remain. Code/doc branch publication only after secret scanning; no deploy, purchase, credential/key, console, merge or force push.

## Jawline tracker, trainer and face scan polish — 2026-10-05

Continue `fix/tracker-trainer-scan-polish-20261005`, tested application **e2f1501ce3bc529aef9c2910c468740252718071**, from published StoreReady source 1d3f069b. [Polish report](FEATURE_POLISH_REPORT.md) and [evidence](evidence/feature-polish-20261005/source-and-results.json) record the current behavior and limits. Jawline progress now shows actual Precision baseline/current uncertainty and honest comparison states; quick photo comparison is keyboard accessible. Trainer score/guided labels, observed hold progress, pause and corrections are repaired. Scans use fresh frames, consistent live/final gates, fail-closed missing metrics, cancellation cleanup, and readable preparation/recovery.

329/329 tests, ten new regressions, clean-source frozen install/build, 33 feature-browser + 17 private-tools + two privacy-browser checks PASS. Android debug/release source compilation and manifest processing PASS (220 Gradle tasks). Actual StoreReady assurance rerun remains BLOCKED (3 PASS / 5 BLOCKED / 5 ACTION_REQUIRED / 9 PLATFORM_REQUIRED / 40 AUTOMATION_PENDING). Browser camera/model/account replies are explicit fixtures; no current signed APK/AAB, native-device or empirical accuracy/efficacy validation is implied. Existing billing-off/privacy/account/provider/Play blockers remain. No deployment, purchase, key creation, console change, merge or force push. Non-default publication only, following secret scanning.

## StoreReady Play audit and fixes — 2026-10-04

Continue `fix/storeready-play-readiness-20261004`, application/test SHA **c87f20b8239c9e41b62ec33b72e0e02081054057**. The later retained task source was recovered: work efebe818 / application bf826193, nine commits ahead of remote main. All 13 remote branches and nine PRs were compared. Read [Play readiness report](PLAY_READINESS_REPORT.md) and [durable evidence](evidence/play-readiness-20261004/source-and-tool-version.json).

Actual StoreReady 2.1.0 at 16e71ad3 ran before/after and remains **BLOCKED**. Verified fixes: Billing 8/compatible Capacitor 7 and Java 21/Kotlin 2 migration; active-entitlement purchase/restore checks; explicit backup/transfer exclusions; current bundled privacy and notification disclosure; distribution-only signing guard; npm advisories 9→0. Release flags remain billingEnabled=false/cloudPhotoRendersEnabled=true, API 36/min API 23.

319/319 Node tests, clean-source frozen install/build, 17/17 completion browser checks and 2/2 external-network-denied policy navigation checks PASS. Debug and release source compilation/resources and release-manifest merge PASS; 221 Gradle tasks. Merged release target 36/Billing 8.0.0; 61 downloaded AARs have no .so. bundleRelease --dry-run correctly rejects absent upload credentials. No signing key or current installable artifact created; prior debug APK is historical bf826193 evidence. Unpublished 10-commit range Gitleaks: no leaks; worktree public/reference-key candidates individually triaged.

Final signed AAB, real Android/16 KB/permission/lifecycle/accessibility/performance acceptance, real billing/OTP/deletion, undeployed lifecycle/scheduler/provider-retention acceptance, exact-artifact Data Safety/privacy/health/listing and account testing/identity gates remain blocked or not run. Browser auth/billing/deletion replies are fixtures. No console change, purchase, deployment, merge or force push; authorized publication is only the non-default fix branch.

## Current local artifact, 2026-10-04

**Debug build delivered; public release remains BLOCKED.** Branch `work`, application source bf826193988e91c2edc457b3ab405352594857e2. Actual APK `/workspace/chisel-build/chisel-debug.apk`; SHA-256 `8ed470ae883a70b10681aa1be3d83eb8d4222a6b80329958ead8c8ce5f43461d`. 312 tests, 17 completion browser checks, 6 real-model fixture checks and native compilation pass; 58 packaged assets match canonical source.

The previously missing fitting/build modules are repaired. Account-lifecycle and output-recovery source is implemented, but no new migration/function/scheduler was deployed. Account controls have fixture acceptance only. No new live flag/configuration read is claimed. Signed AAB is blocked by the intentionally absent upload key; the release command rejects unsigned distribution. Play/device/store/empirical gates remain open. Full native biometric vault and local visual fidelity roadmap remain incomplete. No push, publish, payment, paid generation or OTP email occurred. See [full report](COMPLETION_REPORT.md) and [release gate](CHISEL_LAUNCH_GATE.md). Historical release statements below apply only to their dates.

2026-09-20. **Current release candidate:** `main` is merged and pushed; API 36
is configured; a previous debug APK was installed on a connected Android
device, and the current compliance-hardened debug APK has been built. The app
remains free-first: paid accounts and credit
purchases are disabled until account deletion, retention, billing and Play
testing are complete. A signed release AAB has not been produced because the
developer-owned upload keystore is intentionally not present in the repository.
Privacy Policy and Terms of Use are committed and linked through public GitHub
file pages, avoiding a GitHub Pages dependency. Play Console declarations still
must match the exact submitted artifact.

2026-09-10. **PR #7 remains draft/unmerged; no new installed APK or Play release.**

The credit-backed source and additive wallet migration are implemented. New credit-studio v1 and credit-purchases v1 Edge Functions were actually deployed to wnzbmmhtdchdqjnskwlo, pinned to server source 98d13b78a4076efbe1da437598cfb6e5c47f725e. Later UI-only source 4a932d41b5af04f2e52317dcb2946cfac8e599c6 does not change those server files. Public readiness and unauthenticated rejection were checked against the real deployed services.

**Sales, rendering and costs_verified are false in SANDBOX and PRODUCTION.** Final DB read: no accounts, purchases, jobs or ledger entries; output bucket private. No API key was supplied through this session and backend key validity was not tested. Secure setup being opened earlier is not a delivered key. No actual OpenAI image edit, payment or user OTP email was performed.

Activation requirements: OpenAI credentials/model access and real-output/cost acceptance; Play consumable product setup and RevenueCat notification/receipt mapping; OTP email template/sender; native purchase/refund/account tests; account-deletion UX, output-retention scheduler and operational recovery; exact-source native APK/AAB and signing; physical Android camera, export/share, accessibility and performance checks; remaining store/privacy/release requirements.

The prior Frame Fitting QA is still failing because its requested modules are absent. The faint hair guide, doubled-glasses issue and skin sampling accuracy are NOT solved by monetization work. Trainer demonstrations are now implemented as lightweight inline SVG guidance, with optional on-device hand-path checks and a Guided fallback; this is not a physical-device accuracy claim and does not measure pressure, muscle activation, circulation or structural change. Do not promote source-level or fixture tests to real rendering/accuracy evidence.

[Current implementation and tests](AI_CREDITS_STATUS.md), [full previous release checklist](history/2026-09-10-before-credits-RELEASE_STATUS.md) and [accuracy requirements](ACCURACY_RELIABILITY.md).
