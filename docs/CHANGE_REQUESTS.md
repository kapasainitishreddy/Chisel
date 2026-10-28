# Change Requests

## CR: Make saved-look lifecycle atomic and recoverable, 2026-10-28

**Goal:** make local style previews safe to save, compare, undo, reopen, remove
and recover after storage failures without resurfacing a deleted source.

Implemented at `8ed59b6e2f1e41ca4d2ab41a25f53d860524d45f`: save and retention
pruning share one IndexedDB transaction; gallery records are validated;
unreadable records can be reviewed and selectively removed by IndexedDB primary
key; a failed open can be retried; save checks that source, result and editor
epoch remain current after hashing. The browser test uses synthetic images and
stubbed local service output.

Verification: `npm test` 335/335; Chromium browser suite 3/3; web build validates
46 modules; canonical and generated Android assets match. Independent reviewer
repaired three findings and found no remaining must-fix. No Android device,
native encryption, real image, provider, credential, billing or deployment
acceptance is claimed. Full evidence: [TEST_STATUS.md](TEST_STATUS.md).

## CR: Recover interrupted local archive restore, 2026-10-28

**Goal:** let a user restore supported records from the existing encrypted
archive without silently accepting a mixed set after an interrupted write.

Implemented in `e75241e27d0e775de128c1607d1850f0d3b9ef33`: direct Settings entry;
scoped inclusion/exclusion and live-storage disclosure; a before-value journal
with prepared/committed states; startup rollback before app initialization;
fail-closed retry when storage remains unavailable; and confirmation,
interruption, duplicate-import and delete-after-recovery coverage. The
passphrase is not persisted. Temporary recovery data is unencrypted in local
WebView storage and the UI says so. Independent read-only review found no
must-fix. Concurrent multi-tab restore is explicitly unsupported and browser
users are told to close other tabs first.

Verification: full `npm test` 334/334; `CHISEL_CHROMIUM_PATH=/usr/bin/chromium
npm run test:browser` 2/2; `npm run build` validated 46 modules; canonical and
generated Android UI/archive/index assets match. Browser and unit tests use
synthetic records and deterministic local failure injection. Android device,
native vault, power-loss durability, cloud retention, legal applicability,
provider, billing, and release remain open.

## CR: Rendered local photo recovery and keyboard containment, 2026-10-28

**Goal:** verify that the photo comparison flow is understandable, keyboard
operable and reversible under local failure conditions, while preserving the
free local experience and accurate privacy claims.

Implemented at `5e1f9fdaa6dae4d712db55caa8db39ab27df395f`: accessible modal
semantics, keyboard close/focus return and a focus guard; reproducible
Playwright/Chromium testing with synthetic photos, fake camera and stub model;
local remove/reselect and deletion blocked/retry flows. Independent read-only
review found no must-fix in the dialog/focus change and noted the browser test's
network evidence is scoped to its synthetic journey. No real images, provider,
credentials or billing were used.

Verification: `CHISEL_CHROMIUM_PATH=/usr/bin/chromium npm run test:browser`
1/1; `npm test` 323/323; `npm run build` 46 modules; `git diff --check`
passed. Native Keystore encryption, interrupted native migration and Android
device acceptance remain open because the required compiler/SDK and Gradle
distribution are unavailable; no partial, uncompiled native adapter was added.

## CR: Clarify private data lifecycle and style recovery, 2026-10-28

**Goal:** let free-core users understand what is local, encrypted, exportable,
deletable or cloud processed and finish an early style/camera task without
misleading fit claims or dead-end errors. The intended paying user is an adult
who chooses an optional image edit for a practical style reference. Paid value
is a falsifiable hypothesis, not validated demand; conversion, willingness to
pay and cost baselines remain unknown. No revenue claim is made.

Implemented in source: accurate Settings data/backup disclosure; local clear
confirmation that separates optional cloud account deletion; larger,
keyboard-visible and aria-pressed legacy style controls with labelled colour
swatches and “Suggested” language; classified camera permission/device startup
guidance without claiming a successful test-camera start. Added the
[native private-data contract](NATIVE_VAULT_CONTRACT.md) to pin storage scope,
product gates and future native-encryption requirements. No account, billing,
provider, manifest security, backup flag or key settings changed.

Verification at that earlier checkpoint: focused lifecycle tests 8/8, full
Node suite 317/317 and web build 46-module/runtime validation passed. Android
assets were synced. Browser acceptance was added in the follow-up above. No
real face or provider test data used.

## Next gates

Instrument-free user study or privacy-reviewed success measurement; camera,
export/restore, deletion and large-text/TalkBack acceptance on real devices;
native per-store encryption/key lifecycle and interrupted-operation recovery;
test whether optional image-edit value is useful and cost-sustainable before
any store configuration. Keep full vault and monetization assertions separate.

## CR: Complete approved missing-feature build, 2026-10-04

Implemented the approved five-task plan in real source: reproducible build/runtime fitting, adaptive local programs and conservative progress, encrypted exported backups/discussion sheets, authenticated lifecycle/scheduler source, and whole-branch acceptance/handoff. Explicit beard selections also repaired. User approved continuous execution without further questions; work remains locally committed and no external deployment/publication/push occurred.

Final application commit bf826193988e91c2edc457b3ab405352594857e2: 312 Node, 17 completion browser and 6 real-model fixture checks pass; PostgreSQL lifecycle acceptance and actual debug APK pass. Seven review findings fixed. [Completion report](COMPLETION_REPORT.md) records all implementations and incomplete roadmap/external release work. No claim that every proposed Pro feature or the public release is finished.

## CR: Build credit-backed Chisel with reasonable pricing and margin, 2026-09-10

Implemented optional account-backed credits, OpenAI Images edits adapter, consumable purchase integration and server receipt settlement, comparison of 2–4 saved looks, and local printable stylist reference export. Keep the existing photo-first near-black/green design. New planned US prices are 10 credits/$3.99, 30/$9.99 and 70/$19.99; Standard edit costs 1 credit, Detail costs 3. Existing-image save/compare/export remains free. Purchased packs do not renew or expire. Pricing is a proposal pending actual store/cost validation, not a profit guarantee.

Applied the wallet migration and deployed two new disabled-by-configuration services. SQL rollback acceptance passed. Exact code/test 4a932d41b5af04f2e52317dcb2946cfac8e599c6 passed 273 Node tests, 33 fixture UI checks and six real unauthenticated endpoint/readiness checks. Screenshot review found and corrected two stale status messages. The existing Frame Fitting workflow remains failed on missing modules; all other checked workflows passed. No photos/keys/payments/emails were sent to test real provider or billing behavior.

Keep draft pending credentials, real output/cost/store/native testing, operational retention/account deletion and earlier release gates. This slice does not complete exercise animations or realistic local hair/glasses. [Full scope](AI_CREDITS_STATUS.md); [preceding change requests](history/2026-09-10-before-credits-CHANGE_REQUESTS.md).
