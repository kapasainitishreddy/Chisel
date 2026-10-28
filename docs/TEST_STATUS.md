# Test Status

## Local saved-look gallery lifecycle, 2026-10-28

Implementation source SHA `8ed59b6e2f1e41ca4d2ab41a25f53d860524d45f` on
`recovery/chisel-cloud-build-20261004-efebe81`.

- `npm test`: **335/335 PASS**, zero failed/skipped. The pretest Capacitor
  sync completed and copied the canonical gallery/UI assets into Android's
  generated WebView asset directory.
- `CHISEL_CHROMIUM_PATH=/usr/bin/chromium npm run test:browser`: **3/3 PASS**.
  The added gallery journey uses only a synthetic canvas portrait/result and
  stubbed local service responses. It covers rendered create/save, keyboard
  compare and neutral split reset, interrupted IndexedDB write with no false
  success, synchronous database-open failure followed by retry, corrupt numeric
  key recovery and failed-cleanup retry, valid look persistence across reload,
  removal of one look, and portrait deletion while the source digest is paused.
  The delayed save is canceled and remains absent after reload. It also checks
  360×640 layout and reduced-motion loading behavior.
- `npm run build`: **PASS**, 46 modules validated.
- `git diff --check`, `node --check` for both changed runtime files, and
  `cmp` of canonical gallery JS, studio JS and CSS against generated Android
  assets: **PASS**.
- Screenshot from the synthetic corrupt-record state:
  `/tmp/chisel-saved-looks-corrupt-record.png`.
- Independent read-only reviewer: the three reported must-fix issues were
  repaired (failed connection retry, numeric IndexedDB primary key deletion,
  and stale digest save after photo deletion); re-review found **no remaining
  must-fix**.

Not demonstrated: native Android behavior, power-loss transaction durability,
live WebView encryption, byte-level deletion, TalkBack, real image accuracy,
provider retention, billing or release readiness. No real portrait, paid API,
provider request, credentials or billing were used.

## Encrypted archive recovery checkpoint, 2026-10-28

Source SHA: `e75241e27d0e775de128c1607d1850f0d3b9ef33` on
`recovery/chisel-cloud-build-20261004-efebe81`. The archive controls were
already mounted by the completion tools from the home tools dialog; this
checkpoint also exposes the same dialog from Settings and gates app startup on
recovery of a prior restore journal.

- `CHISEL_CHROMIUM_PATH=/usr/bin/chromium npm run test:browser`: **2/2 PASS**.
  The archive journey runs through the rendered Settings control and tests the
  encrypted download bytes; wrong passphrase, corrupt and oversized import
  rejection; cancelled confirmation; successful and repeated restore; injected
  quota failure with rollback; failed rollback and retained journal; startup
  fail-closed behavior while storage remains blocked; successful retry and
  idempotent recovery; then device clear and reload with no restored record or
  journal resurrection. It checks keyboard focus return and reduced motion.
  All archive data are synthetic fixture values.
- `node --test tests/archive-recovery.test.cjs tests/data-lifecycle-ui.test.cjs`:
  **15/15 PASS**. Deterministic storage doubles inject failure at journal
  prepare, each supported-record write, commit marker, every rollback remove
  and old-value write, and journal cleanup. They also cover unsupported/malformed
  records, passphrase/corrupt/oversized inputs, duplicate import and recovery
  repeatability.
- Full `npm test`: **334/334 PASS**, zero failures/skips; `pretest` completed
  Capacitor asset sync. `CHISEL_CHROMIUM_PATH=/usr/bin/chromium npm run
  test:browser`: **2/2 PASS**, zero skips. `npm run build`: **PASS**, 46 modules.
  `git diff --check`: **PASS**. Canonical archive/UI/index files match generated
  Android assets after the sync.
- Rendered screenshots from the local synthetic run:
  `/tmp/chisel-archive-settings.png`, `/tmp/chisel-archive-unlock-error.png`,
  and `/tmp/chisel-archive-recovery-pending.png`.
- Independent read-only review at core recovery SHA
  `0729120bd7258be986d24d838222f62d93abaa42`: **no must-fix**. It confirmed
  prepared/committed ordering, interrupted rollback, fail-closed startup,
  committed-marker retry, and clear-after-recovery coverage. Its identified
  multi-tab limitation is now stated in Settings and asserted in the rendered
  journey at the final checkpoint SHA above.
- The journal contains a temporary unencrypted copy of only the record groups
  being replaced, in the same local WebView storage as current live data. It is
  removed after commit or rollback; if cleanup/storage operations fail, startup
  keeps local tools blocked until retry. This is application-level recovery,
  not a formal transaction/security guarantee. No passphrase is persisted.

Not proven here: device power-loss durability, cross-tab concurrent restore,
Android Keystore encryption, native backup/restore, TalkBack, byte-level storage
erasure, provider/account retention, billing or release. No real personal
records/photos, external provider calls or paid services were used.

## Browser lifecycle and accessibility follow-up, 2026-10-28

- Added pinned `playwright@1.64.1` dev dependency using the public npm registry;
  system Chromium already existed at `/usr/bin/chromium`. Test source:
  `tests/browser-local-lifecycle.test.cjs` starts an ephemeral local HTTP server.
- `CHISEL_CHROMIUM_PATH=/usr/bin/chromium npm run test:browser`: **1/1 PASS**.
  With synthetic canvas images, fake camera and a stub MediaPipe module, it
  exercised local photo save/remove/reselect; comparison model-unavailable and
  no-face messages; close during pending work; temporary URL revocation;
  keyboard dialog close/focus return; keyboard style change/restore; reduced
  motion; 200% text sizing and a 195×422 CSS viewport; and local deletion on
  success plus a simulated blocked IndexedDB request and retry. It records no
  image upload; optional Supabase calls are aborted in-browser.
- Full `npm test`: **323/323 PASS**, including `pretest` Capacitor sync and the
  new browser test. `npm run build`: **PASS**, 46 modules and runtime assets.
- Browser screenshots: `/tmp/chisel-photo-comparison-dialog.png`,
  `/tmp/chisel-photo-comparison-200pct.png`,
  `/tmp/chisel-style-keyboard.png`, and
  `/tmp/chisel-browser-local-lifecycle.png`.
- Still not proven: TalkBack/screen reader, actual Android camera/storage,
  cross-tab physical IDB blocking, real MediaPipe accuracy, native encryption,
  cloud lifecycle, provider output, or billing. No real faces or credentials
  were used.

## Native-vault toolchain check, 2026-10-28

Only `/usr/bin/java` is available; `javac`, `gradle`, `adb`, `ANDROID_HOME`,
`ANDROID_SDK_ROOT`, and `JAVA_HOME` are absent. `MainActivity` is a plain
Capacitor `BridgeActivity`, with no custom Keystore plugin registered. The
wrapper is pinned to Gradle 8.11.1, and its prior assemble attempt was refused
when retrieving that distribution. The new delegation explicitly prohibits
bypassing that restriction, so no unbuildable native crypto/migration code was
added. Native vault implementation and device acceptance remain blocked.

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
