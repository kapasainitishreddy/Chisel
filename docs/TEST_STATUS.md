# Test Status

## Ranked-photo and deletion follow-up, 2026-10-28

- `npm test`: **322/322 PASS**, zero failed/skipped; `pretest` Capacitor Android
  asset sync completed.
- `npm run build`: **PASS**, 46 modules plus inline scripts/runtime assets.
- Focused lifecycle/photo comparison and deletion regression: **24/24 PASS**. It includes
  source checks for unranked notes, local object URL cleanup, named style
  groups, deletion scope/error handling, portrait store behavior and cloud
  account separation.
- `docs/FEATURE_LEDGER.csv`: **25 feature/gate rows**, each with source,
  observed state, scenario/evidence, blocker and next acceptance.
- Gradle/Android compilation and browser rendering: **BLOCKED/NOT RUN** in this
  batch. Gradle wrapper distribution retrieval was refused by the environment;
  browser acceptance lacks `puppeteer-core`. No physical device or TalkBack
  evidence is claimed.
- No external provider calls, paid billing, real face data, credentials, or
  cloud data changes.

## Privacy, recovery and style controls, 2026-10-28

- Focused lifecycle/UI suite: 8/8 PASS, covering disclosure, local/cloud
  deletion distinction, manifest boundary, style target/pressed states and
  camera recovery text.
- Full Node suite: 317/317 PASS after `npm test`; its pretest `cap sync android`
  completed and copied the canonical `index.html` into Android assets.
- Web runtime validation: `npm run build` PASS (46 modules, inline app scripts
  and runtime assets).
- Android debug build: NOT RUN to completion. `bash gradlew assembleDebug`
  could not fetch Gradle 8.11.1: network connection refused. Executing the
  wrapper directly also lacked executable permission; the prescribed `bash`
  invocation was then used.
- Browser completion runner: NOT RUN; this checkout does not have
  `puppeteer-core`. No screenshot/device acceptance is claimed.
- No live providers, real face images, paid billing, credentials or cloud
  lifecycle operations were used.

## Current application acceptance, 2026-10-04

Application source: **bf826193988e91c2edc457b3ab405352594857e2**. Subsequent handoff edits are documentation only.

- Node: **312/312 PASS**, zero failures/skips. Fresh archive + frozen install repeats 312/312.
- Build validation: **46 JavaScript modules PASS**, including inline scripts/assets.
- Completion browser: **17/17 PASS** with real local controls/downloads/storage; auth/deletion are intercepted fixtures, no emails/cloud deletion.
- Fitting browser: **6/6 PASS** using actual MediaPipe and fixture camera, no upload/page errors.
- Embedded PostgreSQL: lifecycle migrations/ownership/retry/refund/tombstone/access-control acceptance PASS; not production Supabase acceptance.
- Native debug: **BUILD SUCCESSFUL**, 248 tasks. All **58 assets match** APK; v1/v2 debug signature verified.
- Release command: expected BLOCKED by missing developer-owned upload signing, no AAB produced.
- Fresh review: seven findings fixed with regression coverage; Precision quota failure also fixed.

Evidence, scope, artifact SHA and reproduction: [completion report](COMPLETION_REPORT.md), `/workspace/chisel-build/evidence/`. Browser QA used only managed-proxy CA pins; production TLS is unchanged. No current physical-device install, live billing/provider output, real account/OTP deletion, new cloud deployment or empirical accuracy claim. Old Frame Fitting MODULE_NOT_FOUND and pristine-checkout failures are fixed at this source; historical CI results below are not a new CI run.

## Credits and compare, 2026-09-10

Exact application/test head: 4a932d41b5af04f2e52317dcb2946cfac8e599c6.
CI merge checkout: ee278a54e3ebdf027b8152e149b01e6b581d457.

- Full Node suite: 273/273 PASS, zero failures/skips, rerun locally against the downloaded exact CI source.
- Credit/compare browser runner: 33/33 PASS, no uncaught page errors. Auth, native billing, wallet replies, face checks and provider output are explicit fixtures. Real controls/storage/export operate locally.
- Live deployed endpoint probe: 6/6 PASS. GET reports ready=false/salesReady=false, no public wallet; unauthenticated create is 401; foreign Origin 403; unconfigured purchase webhook 503. No input photo, credential, email, purchase or paid generation was submitted.
- Actual Postgres acceptance transaction passed replay/owner/refund/reservation/budget/settlement/access-control cases, then ROLLBACK. Final DB inspection confirms both environments disabled and zero accounts/receipts/jobs/ledger entries.
- Nine changed canonical/native asset pairs match each other and the tested local source byte-for-byte.

Credits and Compare QA #2, run 34557980667: SUCCESS, artifact 10183290778. Chisel Tests #287 (34557980623), Looks QA #10 (34557980619), Personal Photo #17 (34557980621), Quiet Studio #23 (34557980625), Reliability #28 (34557980618), Render Readiness #4 (34557980652): SUCCESS.

**Known failure retained:** Frame Fitting QA #3 (34557980653) fails at node --check www/chisel-eyewear-fit.js with MODULE_NOT_FOUND. That workflow was added before this credits slice and references unimplemented fitting/policy/browser files. It is not hidden, skipped or claimed fixed.

Browser widths: 360,430,1280 x900. Reviewed wallet/editor/compare screenshots for alignment, clear prices/costs, photo visibility, selected state and text. Review caught stale pending-balance and disabled-service copy; one added unit regression failed before the correction, and four expanded browser assertions passed afterward. Initial 272/29 results are superseded by 273/33.

Local Chromium navigation was blocked by environment policy. Rendering ran in GitHub Actions Chromium. No real phone, native purchase, actual AI output or empirical measurement accuracy validation. [Earlier test history](history/2026-09-10-before-credits-TEST_STATUS.md) is preserved.
