# Chisel Feature Matrix

## Play internal-test candidate, 2026-10-12

| Feature | Implemented and verified | Still required |
|---|---|---|
| Free-first Play build | Billing flag off, RevenueCat public key empty, purchases hidden, sign-in cannot create accounts while billing is off | Sai's upload key, signed AAB, internal-track install |
| Account deletion | Settings → Clear all my data (local, including saved photo and looks). Settings → Delete cloud account opens the existing-account request and does not create an account | Deploy and live-test `account-lifecycle` before any paid account is enabled |
| Play drafts | Data safety, health declaration, and store listing drafts match this source | Sai pastes them into Play Console against the uploaded AAB |
| Production AAB profile | `npm run aab:production` runs Capacitor sync and Gradle `:app:bundleRelease`, and refuses to run without `keystore.properties` | Android SDK on Sai's machine and the key he creates |

## StoreReady Play audit and fixes — 2026-10-04

Continue `fix/storeready-play-readiness-20261004`, application/test SHA **c87f20b8239c9e41b62ec33b72e0e02081054057**. The later retained task source was recovered: work efebe818 / application bf826193, nine commits ahead of remote main. All 13 remote branches and nine PRs were compared. Read [Play readiness report](PLAY_READINESS_REPORT.md) and [durable evidence](evidence/play-readiness-20261004/source-and-tool-version.json).

Actual StoreReady 2.1.0 at 16e71ad3 ran before/after and remains **BLOCKED**. Verified fixes: Billing 8/compatible Capacitor 7 and Java 21/Kotlin 2 migration; active-entitlement purchase/restore checks; explicit backup/transfer exclusions; current bundled privacy and notification disclosure; distribution-only signing guard; npm advisories 9→0. Release flags remain billingEnabled=false/cloudPhotoRendersEnabled=true, API 36/min API 23.

319/319 Node tests, clean-source frozen install/build, 17/17 completion browser checks and 2/2 external-network-denied policy navigation checks PASS. Debug and release source compilation/resources and release-manifest merge PASS; 221 Gradle tasks. Merged release target 36/Billing 8.0.0; 61 downloaded AARs have no .so. bundleRelease --dry-run correctly rejects absent upload credentials. No signing key or current installable artifact created; prior debug APK is historical bf826193 evidence. Unpublished 10-commit range Gitleaks: no leaks; worktree public/reference-key candidates individually triaged.

Final signed AAB, real Android/16 KB/permission/lifecycle/accessibility/performance acceptance, real billing/OTP/deletion, undeployed lifecycle/scheduler/provider-retention acceptance, exact-artifact Data Safety/privacy/health/listing and account testing/identity gates remain blocked or not run. Browser auth/billing/deletion replies are fixtures. No console change, purchase, deployment, merge or force push; authorized publication is only the non-default fix branch.

## Current build additions, 2026-10-04

[Completion report](COMPLETION_REPORT.md) is the current feature/evidence matrix. Added and wired: dependency-isolated runtime; one confidence-gated eyewear renderer; explicit beard selections across families; 30/60/90-day adaptive local plans; method-aware progress/baselines/JSON; encrypted supported-record backup with validated restore; four discussion sheets; billing-independent existing-account controls. Owner-bound account deletion and bounded cleanup/scheduler are implemented **in source only**. Reproducible clean tests and an actual debug APK are verified. Missing fitting modules are no longer a current source blocker.

312 Node tests, 17 completion-browser checks and 6 real-model fixture checks pass. This is not live cloud/payment, physical-device or empirical measurement acceptance. Native vault/biometrics, learned segmentation, realistic local hair replacement, association UI and all advanced paid roadmap features remain incomplete. Existing generic history caps remain; Precision no longer has its previous 40-record cap. Historical rows below describe their own checkpoints.

## Credit-backed studio checkpoint, 2026-09-10

| Feature | Implemented and verified | Still required |
|---|---|---|
| AI credit wallet | Server-owned account balance, three pack definitions, atomic reservations, ledger, event/transaction dedupe, once-only refunds, refunded-purchase debt, sandbox isolation | Live Play/RevenueCat integration and financial reconciliation acceptance |
| OpenAI photo edits | Authenticated Images edits adapter, original-input preparation and byte/pixel limits, fixed presets and modes, no automatic paid retries, owner-bound private result retrieval | Real credentials, actual output fidelity/cost review; production renders OFF |
| Credit UI | Credits balance control, optional email-code account, actual native-store product/purchase calls, localized price requirement, explicit quote/provider consent, disabled sales state | Real OTP delivery, native billing, session and phone tests |
| Compare & decide | Two to four saved looks from the same source photo, no new AI request | Broader phone/large-text/accessibility acceptance |
| Stylist reference | Original + labelled AI reference + maintenance preference + escaped notes; local printable HTML download/share | Native sharing and end-user review; not a clinical report or exact haircut prescription |
| Privacy | Free local experience retained; paid account/ledger and private server outputs documented | Account-deletion flow, scheduled output cleanup and production review |
| Pricing | Proposed US packs: 10/$3.99, 30/$9.99, 70/$19.99; Standard 1, Detail 3; no recurring pack or credit expiry | Actual store products and measured contribution margin; no profit guarantee |

Revision 4a932d41b5af04f2e52317dcb2946cfac8e599c6: 273/273 Node, 33/33 browser and 6/6 real endpoint guard checks. Browser auth/store/provider output are fixtures. The SQL migration and separate endpoints are deployed, but both environments remain disabled for sales/rendering and contain zero accounts/receipts/jobs/ledger entries. No real photoreal output, native build or installation is implied.

Trainer expansion checkpoint, 2026-09-19: the existing Face & Neck Trainer now includes a catalog-backed Face Massage area, seven massage routines, lightweight inline demonstrations for every movement, lazy on-device Hand Landmarker guidance with an honest Guided fallback, compact category filtering, routine preview, pause and completion summary. See [Face Massage Trainer implementation](FACE_MASSAGE_TRAINER.md).

[Previous feature matrix](history/2026-09-10-before-credits-FEATURE_MATRIX.md) preserves the full existing photo, trainer, skin, hair, makeup, posture and release boundaries. Local hair/glasses rendering and skin accuracy are not upgraded by these credit features. Rive/Lottie native asset authoring and physical-device acceptance remain future work; the current browser/native-webview layer uses small inline SVG demonstrations and does not claim Android camera accuracy. The earlier Frame Fitting workflow is failing on missing modules. See [current evidence](AI_CREDITS_STATUS.md).
