# Chisel build completion checkpoint — 4 October 2026

## Delivered build and scope

Actual repository: `kapasainitishreddy/Chisel`, local branch `work`. Baseline: `1c08c6efa8ed5696e16fd0d288ca2cb62f41f85f` (local origin/main). Final application source: **`bf826193988e91c2edc457b3ab405352594857e2`**. Subsequent handoff changes are documentation only. Changes are committed locally; no code was pushed, deployed or published, and no purchase, OTP email, paid render or external deletion was performed.

**Built:** `/workspace/chisel-build/chisel-debug.apk`, 9,482,141 bytes, debug signed. SHA-256: `8ed470ae883a70b10681aa1be3d83eb8d4222a6b80329958ead8c8ce5f43461d`. All **58 canonical web assets** match the APK contents byte-for-byte. Signature verification passed v1/v2. This is a test artifact, not a signed Play distribution or a physical-device acceptance result.

The approved five-task implementation plan is complete within its stated scope: build/runtime repairs, conservative programs/progress, encrypted exported backups/discussion sheets, lifecycle backend source, and whole-app engineering acceptance. This does **not** establish a perfect app or complete every historical roadmap proposal. Outstanding product and external release work is listed below.

## Implemented and wired in this build

| Capability | Actual source / behavior | Verification and limit |
|---|---|---|
| Reproducible web/native preparation | [`package.json`](../chisel-android/package.json) runs Capacitor sync before tests; [`verify-build.cjs`](../chisel-android/scripts/verify-build.cjs) checks real scripts, inline scripts and assets; frozen CI installs | Clean tracked checkout: 312 tests pass, 46 JS modules validated. Generated native assets are reproducible; a pre-populated developer checkout is unnecessary. |
| Runtime failure isolation | [`runtime loader`](../chisel-android/www/chisel-runtime-loader.js), [`AR core`](../chisel-android/www/chisel-ar-coach-core.js) define dependency groups, bounded loading and visible readiness/failure state | Browser deliberately blocks billing policy; independent local comparison still works. Skin and comparison dependencies belong to their own groups. Model/CDN availability can still affect camera features. |
| Eyewear fitting | [`eyewear fit`](../chisel-android/www/chisel-eyewear-fit.js) validates eye/temple anchors and pose, draws one fitted pair; [`policy`](../chisel-android/www/chisel-tryon-policy.js) labels guide versus AI visualization | Real MediaPipe on a fixture camera: 6 checks pass, no image upload. This is a placement guide, not optical dispensing or proof of realism on all faces. |
| Explicit beard selection | [`try-on fixes`](../chisel-android/www/chisel-tryon-runtime-fixes.js) preserve beard choice in both short and long style families | Regression passed. Generic defaults remain clean; deliberate selection is no longer reset by style family. |
| Adaptive local programs | [`programs`](../chisel-android/www/chisel-programs.js), [`visible Home controls`](../chisel-android/www/chisel-completion-ui.js): 30/60/90-day skin, posture and grooming routines, daily checklists, pause/resume, adherence adaptation and discomfort feedback | Actual browser checklist/pause pass. Pain feedback pauses the plan. Reviewed evidence links and conservative instructions; no promise of facial structural change. Deterministic adaptation, not a learned clinical coach. |
| Conservative progress | [`progress intelligence`](../chisel-android/www/chisel-progress-intelligence.js): per-metric low-uncertainty baseline, compatible setup/method gates, reproducibility JSON and milestones; [`Precision`](../chisel-android/www/chisel-precision.js): strict face/body version gates, removed 40-record Precision cap | Incompatible/unknown versions and invalid uncertainty do not become verified change. Precision quota failure now reports failure. Existing generic scan/photo limits remain; device capacity still bounds storage. Within-batch variation does not prove population accuracy. |
| Anti-rating surfaces | [`index.html`](../chisel-android/www/index.html) removes aggregate overall/Harmony saving, predicted headroom and beauty-score output from relevant result/timeline/share surfaces | Source regressions pass. Physical photographic metrics remain. Older motivational language and every historical copy surface were not comprehensively clinically reviewed. |
| Encrypted exported backup | [`private archive`](../chisel-android/www/chisel-private-archive.js): AES-256-GCM, PBKDF2-SHA256 600,000 iterations, random salt/IV, bounded validated schemas, quota-aware rollback; [`UI`](../chisel-android/www/chisel-completion-ui.js): local file unlock, explicit restore confirmation, passphrase clearing and timeout/background lock | Roundtrip, wrong-password/tampering, malformed imports and realistic quota rollback pass. Includes supported scans, progress thumbnails, Precision, programs/history, hydration, sleepLog and streak. **Live stores remain unencrypted; original portrait and AI gallery are excluded; no PIN/biometric vault.** Lost passphrases cannot be recovered. |
| Professional discussion sheets | [`discussion export`](../chisel-android/www/chisel-discussion-export.js) and private tools: barber, skincare, dental and posture printable local HTML with escaped notes, timestamp, available records and limitations | Browser downloaded safe report. Discussion aid, not medical interpretation; native sharing and professional usability remain unverified. Existing original/AI stylist brief remains separate. |
| Existing-account management | [`credits UI`](../chisel-android/www/chisel-credits-ui.js): sign-in/sign-out/deletion independent of billing flag; existing-user OTP mode does not create accounts | Browser verifies actual controls with explicit intercepted auth/delete fixtures. No real email or account deletion performed. Purchases remain disabled. |
| Owner-bound lifecycle and recovery source | [`account-lifecycle`](../supabase/functions/account-lifecycle/handler.mjs), [`migration`](../supabase/migrations/20261004000100_account_lifecycle.sql), [`cleanup`](../supabase/functions/output-cleanup/handler.mjs), [`configuration`](../supabase/config.toml), [`operator schedule`](../supabase/ops/schedule-output-cleanup.sql) | Verified identity, active-job guard, deletion tombstones, bounded output removal before records/auth, retry recovery, once-only stale refunds, dedicated scheduler token. Embedded PostgreSQL and handler tests pass. **Not deployed, scheduler not installed, live Supabase acceptance not run.** See [operational boundaries](ACCOUNT_LIFECYCLE.md). |
| Native build and CI wiring | [`Android workflow`](../.github/workflows/android-mobile-build.yml) separates debug and optional signed release; actual API-36 debug build succeeds | Debug artifact built locally with JDK 21 / Gradle 8.11.1 and build tools 35/36. This does not claim the revised GitHub workflow ran. Release signing intentionally fails closed without an upload key. |

## Current engineering evidence

All checks below ran against the final application source; evidence is saved under `/workspace/chisel-build/evidence/`.

| Check | Result | What it establishes |
|---|---|---|
| Full Node suite | **312/312 PASS**, 0 failures/skips | Existing and new regression behavior; not clinical or provider accuracy |
| Fresh `git archive` checkout + `npm ci`, `npm test`, `npm run build` | **PASS**, 312 tests / 46 modules | Build preparation is reproducible from tracked files |
| Completion Chromium runner | **17/17 PASS** | Actual programs/storage/encrypted download/unlock/report/layout 360/430/1280/focus, fixture account controls, isolated billing failure |
| Eyewear Chromium runner | **6/6 PASS** | Real MediaPipe landmarks from fixture video, fitted renderer, camera close, no upload/page errors; not a real phone |
| Embedded PostgreSQL migration acceptance | **PASS** | Owner paths, storage-before-erasure, retry-safe deidentification, active jobs, once-only refunds, tombstones and denied authenticated service RPCs; not live Supabase/concurrency proof |
| Android `assembleDebug` | **BUILD SUCCESSFUL**, 248 tasks | Native debug compilation/package, not installation |
| APK integrity/signature | **58/58 assets match**, v1/v2 verified | Downloaded artifact contains tested canonical source, debug signing only |
| `bundleRelease` without upload keystore | **Expected BLOCKED** | Explicit signing guard rejects unsigned Play artifact; no AAB produced |
| Fresh whole-branch review | **7 findings addressed** with regressions | Import validation/rollback, body method mismatch, billing-independent sign-in, sleep history, dependency placement and scheduler JWT configuration fixed; no unaddressed review finding retained |

Browser trust used only the managed proxy's CA pins for QA Chromium. No production TLS bypass was added. PGlite and browser tooling were temporary QA dependencies, not product dependencies.

## Remaining work, prioritized and explicitly unverified

1. **P0 — Distribution and device acceptance.** Supply the developer-owned upload key, build/verify a signed AAB, install through Play Internal testing, and check camera permissions, background/restart, reminders, sharing, deletion, large text, accessibility and performance on representative Android phones. Complete the exact-artifact store/privacy forms and real screenshots. No current build phone installation or Play submission is claimed.
2. **P0 if cloud/accounts/payments are activated — Operations.** Deploy the new lifecycle migration/functions after review, securely configure the cleanup token/Vault schedule, verify successful deletion and backlog recovery, define financial/tombstone retention, implement/review RevenueCat user deletion and provider retention, and verify live OTP/purchase/refund/account flows. Cleanup follows known output pointers; it does not sweep arbitrary orphan storage objects. Existing paid-provider readiness/flags were not newly verified; no new sales/render activation occurred.
3. **P0 before accuracy claims — Empirical validation.** Representative repeat captures across devices, lighting, distance, skin tones, facial hair and eyewear, with reference checks and variance. Real-model fixture success and 312 software tests do not demonstrate anatomical accuracy or routine efficacy.
4. **P1 — Full private vault.** Native PIN/biometric controls and encryption of active storage, plus explicitly scoped original-photo/gallery backup, are not implemented. Current encrypted export is useful but narrower. Adding native key lifecycle/recovery requires its own implementation and device acceptance.
5. **P1 — Visual fidelity.** Learned skin segmentation, photoreal local hair replacement/occlusion and broad frame-fitting quality studies are not delivered. Existing skin sampling remains heuristic and local hair remains a guide. Optional cloud editor source already exists, but real output fidelity/cost/provider validation remains unverified.
6. **P2 — Remaining roadmap depth.** Habit association exists as a conservative pure API but has no end-user association view. Full event-preparation coach, advanced Pro entitlement system, broad unlimited legacy history and every proposed paid-tier feature are incomplete. The historical monthly/annual Pro proposal is not an active subscription. Current consumable pack prices are proposals, not verified store prices or revenue.

These limits are release gates or separate product projects, not skipped failures in the implemented five-task plan. Keep a free/local test build until applicable release gates are resolved.

## Product and audit checkpoint

The strongest honest selling points remain private local routines, uncertainty-aware photo comparisons, evidence labels, transparent guide-versus-AI disclosure and practical grooming discussion exports. This build repairs the previously missing fitting/build foundation and adds useful privacy/routine functionality. It does not establish superiority over competitors in realism, clinical validity, scale or paid service reliability.

The original repository/competitor audit, official-source/review links, inventory and verified/unverified distinctions are preserved at `/workspace/chisel-audit-report.md`; its source baseline and failures are historical and superseded only where this report provides new evidence. Private competitor revenue remains unknown; no estimate should be treated as reported revenue. No new competitor claim or pricing claim is introduced by this build.

## Reproduce

From `chisel-android`: `npm ci`, `npm test`, `npm run build`. Tests generate Android assets via the `pretest` sync. With the Android SDK and compatible JDK/Gradle configured: `bash android/gradlew -p android assembleDebug`. Browser runner commands and their fixture scope are in [`completion-browser.mjs`](../chisel-android/tests/completion-browser.mjs) and [`render-repair-browser.mjs`](../chisel-android/tests/render-repair-browser.mjs). Android release additionally requires the ignored developer-owned `keystore.properties`.

Artifact metadata: `/workspace/chisel-build/build-evidence.json`; signature log: `/workspace/chisel-build/apk-signature.txt`. The source commit, checksum and evidence links allow the test artifact to be reviewed independently of later documentation edits.
