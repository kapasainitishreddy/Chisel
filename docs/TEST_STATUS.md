# Test Status

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
