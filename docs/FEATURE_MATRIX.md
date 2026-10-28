# Chisel Feature Matrix

## Appearance preferences, 2026-10-28

Settings now offer System, Light, and Dark appearance choices. The selected
preference is applied on startup and saved locally; if browser storage is
unavailable or denied, the control reports failure without claiming it was
saved. The rendered Chromium check covers all choices, reload persistence,
keyboard focus, reduced motion, and denied-storage behavior. Public Sans is
bundled locally under the SIL Open Font License with its notice at
`chisel-android/www/fonts/OFL.txt`. This does not represent a full WCAG audit or
native TalkBack acceptance. See [test evidence](TEST_STATUS.md).

Privacy follow-up: Settings and the style action now state that the legacy
photoreal control sends a live-camera still to the backend and Replicate, and
Retry sends another frame. The separately confirmed selected-photo flow is
described independently. The policy and local policy mirror are synchronized;
an independent review found no further must-fix after this correction.

## Local saved-look lifecycle, 2026-10-28

Saved-look insertion and retention pruning now commit in one IndexedDB
transaction. Valid records are checked before display/open; unreadable rows are
reported, and users can retry a storage read or remove only corrupt records.
Cleanup follows each cursor's primary key, including numeric keys. A stale
save checks its source/result identity and studio epoch after the asynchronous
source hash, so portrait deletion cannot enqueue a delayed gallery write.

The rendered synthetic Chromium path saves two different styles, moves and
resets the comparison slider with the keyboard, injects a failed transaction,
reopens data after reload, repairs a corrupt record while retaining valid
looks, deletes one item, and races a delayed save against portrait deletion.
Browser viewport 360x640 and reduced-motion behavior are checked. Full suite is
335/335; browser suite 3/3; `npm run build` validates 46 modules. Independent
review found no remaining must-fix. See [test evidence](TEST_STATUS.md) and
[feature ledger](FEATURE_LEDGER.csv).

This does not encrypt IndexedDB, prove native interruption/byte deletion, or
verify Android device accessibility. Only synthetic test images and mocked
local service responses were used; no real image-provider call was made.

## Encrypted archive recovery, 2026-10-28

The existing home progress/tools dialog already mounted encrypted export and
restore, but Settings exposed only a privacy explanation and local-delete
action. Settings now opens the same scoped archive flow. Its text identifies
included record groups, excluded portrait/gallery/camera-roll/cloud records,
and that only the downloaded archive is encrypted. It also explains the
temporary local, unencrypted recovery copy used during restore.

Restore now records the previous values before replacing supported keys. A
prepared journal is rolled back before startup consumes app records; a committed
marker is cleaned up while preserving the fully restored records. Failed
recovery leaves its journal in place and blocks local tools until retry. The
passphrase remains in memory only and is cleared from the field after each
action. The restore disclosure asks users to close other tabs because
cross-tab concurrency is unsupported and untested. Local clear removes the
`chisel:` recovery namespace along with other device records.

Rendered Chromium acceptance and deterministic failure injection pass; see
[archive test evidence](TEST_STATUS.md) and the updated
[feature ledger](FEATURE_LEDGER.csv). This remains WebView-local recovery over
unencrypted stores, not a full-device backup, formal transactional guarantee,
native vault or device-level acceptance. No unsupported data were added to the
archive.

## Local photo lifecycle and rendered accessibility, 2026-10-28

The photo comparison is now a labelled modal dialog with a real close button,
Escape handling, focus return and a keyboard focus guard. A Playwright test runs
the app in system Chromium with synthetic canvas photos, a fake camera and stub
face-model responses. It exercises local image save/remove/reselect; comparison
success, model-unavailable/no-face and interrupted work; keyboard style
selection and undo; reduced motion; 200% text sizing; and local clear success
plus simulated IndexedDB-blocked failure/retry. The run asserts the tested
journey makes no external POST request. It does not prove every possible
network route is upload-free. Full `npm test` passes 334/334 and `npm run build`
validates 46 modules. The native vault remains missing: active WebView stores
are unencrypted, and native compilation/device acceptance is blocked by the
unavailable Gradle distribution and absent Android toolchain. See
[test evidence](TEST_STATUS.md), [native contract](NATIVE_VAULT_CONTRACT.md),
and [feature ledger](FEATURE_LEDGER.csv).

## Privacy and style recovery, 2026-10-28

Settings now disclose unencrypted live WebView records, the limited encrypted
export scope, optional cloud/account paths, local-clear scope, and Android
backup/device-transfer caveat. Legacy style controls now expose selected state,
descriptive colour names, visible keyboard focus and 44px targets; “Suggested”
replaces universal-sounding “Best matches.” Camera startup failures now explain
permission, absent-camera, busy-device and unsupported-size recovery. This does
not implement a native encrypted vault, expand archive contents, or activate a
cloud provider. See [native private-data contract](NATIVE_VAULT_CONTRACT.md).

317/317 Node tests and the web source/runtime validation pass. Android package
assets are generated from the canonical web source. Physical-device and
browser screenshots are not freshly accepted in this environment.

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
