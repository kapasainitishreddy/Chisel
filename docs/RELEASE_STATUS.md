# Release Status

## Free internal test, 2026-10-12

**Not uploaded.** `cursor/play-internal-readiness-d466` contains `main` through 23 Sep plus `fix/storeready-play-readiness-20261004` and the free-launch prep in PR #10. Paid purchases stay off. The public account-deletion request page is committed and linked. A signed AAB was not produced. Sai still has to create the upload key, run `bundleRelease`, upload only to Internal testing, and fill Data safety from `docs/PLAY_DATA_SAFETY.md` after reading it against that AAB. Account-lifecycle and output cleanup remain undeployed. Do not set `billingEnabled` to true until RevenueCat and a tested live deletion path exist.

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
