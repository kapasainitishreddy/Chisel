# Saved-photo Looks Studio

Updated 2026-09-10. The saved-photo workflow is implemented and fixture-tested, but live photoreal generation is NOT enabled or verified. This extends the approved personal-photo UI; no replacement theme or generated concept is shipped.

## Implemented in source

- A collapsed Photo preview editor alongside the existing live camera guide.
- Shared server/client allowlist: 25 hair, 8 beard, 6 makeup and 6 eyewear presets; 11 hair-colour choices including keep original. Access is unisex. Single-category prompts instruct preservation of unrelated features; actual identity/style fidelity still needs real output review.
- Original-file selection, one-face/detail/framing preflight, native aspect ratio and bounded JPEG preparation. The decorated hero crop is never used as the render source.
- Separate cloud-upload confirmation before create. Pending jobs are resumed through status requests, not automatic repeated paid creates.
- Random 256-bit job capability, hashed on the server, protects status/cancel/output. Output requests are restricted to the provider delivery host family, size and image types. Provider credentials remain server-side.
- Original/AI preview slider; explicit local saves; an eight-look IndexedDB gallery; reopen/delete; export/share handling. The personal original is not overwritten. Clear-all awaits saved-look deletion.
- Stale/canceled results are discarded. A failed output download can reopen the existing completed job. Gallery refresh reads finish before replacing its live controls.

## Backend actions performed

Restored the existing looksmaxxing Supabase project wnzbmmhtdchdqjnskwlo from INACTIVE to ACTIVE_HEALTHY. Applied looks_studio_jobs and tested reservation idempotency, capability conflicts, once-only personal allowance refund and unchanged global attempt count in a rolled-back SQL transaction. RLS and service-role-only table/RPC permissions are enabled.

Deployed a separate looks-studio Edge Function v1 pinned to server source commit 710f745631cc050b1af17503f26b862fede2abc9. The legacy render-lookmax function was not replaced. Deployment success does not establish provider connectivity or a completed generated image.

Final database read: enabled=false, daily_budget=5, per_device_limit=2, job_count=0, provider_start_reservations=0. No live image-generation request was initiated. These disabled pilot limits are not the finalized paid Pro allowance. Provider token presence/validity and billing were not verified; do not describe a token as definitely absent.

Refunds apply once when the server observes a failed/canceled terminal provider status. Ambiguous timeouts stay reserved rather than risking duplicate spend. This is not a background settlement worker. Job metadata has an expiry and opportunistic cleanup, not a guaranteed timed deletion service. Full commercial quota, reconciliation and retention review remain release work.

## Exact verification

Application/test commit: 55754d84c89d665de337ed4a943ff16f2eefd502.
CI merge checkout: af95e502ad4bb1a7dcfc363cc9627706258a97fc.
Any following documentation-only commit leaves these tested application/test files unchanged.

- Full Node suite: 236/236 PASS, no failures or skips, also rerun locally from the downloaded exact CI source.
- Looks browser suite: 28/28 PASS, zero uncaught page errors. Real controls, storage and image decoding; explicitly mocked provider responses and injected face-check fixtures. It does not establish detector accuracy or photorealism.
- Chisel Looks UI QA #2, run 34525145990: SUCCESS. Artifact 10171261615 includes exact source, report, Node output and actual editor screenshots.
- Chisel Tests #279, run 34525146004: SUCCESS.
- Chisel Personal Photo UI #9, run 34525146175: SUCCESS.
- Chisel Quiet Studio QA #15, run 34525146026: SUCCESS.
- Chisel Reliability Evidence #20, run 34525146059: SUCCESS.
- Eight canonical www/packaged Android pairs match each other and the locally tested files byte-for-byte.
- New editor checks cover 360, 430 and 1280 CSS-pixel widths at height 900. Existing UI suites also cover 768.

Verified interactions: all four preset groups, empty states, no-face rejection, consent refusal without create, one create followed by status/output, comparison slider, actual Blob saving, original-file preservation, saved-look reopening, interrupted status recovery without another create, portrait removal clearing saved looks and preview. Export/share is implemented but native Android export is not proven by this suite.

The first Looks browser run failed when a gallery refresh temporarily removed the Open control. A source regression failed before the fix. The gallery now awaits its read before replacing DOM and rejects stale refreshes; the browser uses a locator for the preserved reopen assertion. No result or consent assertion was removed.

Rendered tests ran in GitHub Actions Chromium because local Chromium navigation returned net::ERR_BLOCKED_BY_ADMINISTRATOR. The 430px editor screenshot was reviewed for matching theme, spacing, readable controls, horizontal preset scrolling and fit. Screenshots use an existing repository test portrait. Mocked returned images must never be presented as real generated output.

## Still required for live completion

Verify the Replicate secret/authentication and billing in the project, complete an actual authenticated render, inspect real outputs across all four categories, and fix identity preservation, requested-style fidelity and edges where needed. Then deliberately enable the service with approved spend controls and production billing-aware allowances. Device acceptance and production privacy/retention review remain open.

No real photorealistic image was generated. No HairFastGAN weights, new makeup-specific model or learned segmentation model were imported. The server uses the previously selected Replicate FLUX Kontext Pro API, not an open-source model deployment. No APK/AAB build, merge, phone installation or store submission occurred.

## Exercise animation scope

The existing nine movements cover cheek lifts/holds/smiles, jaw release, brow release, chin tuck, small deep-neck nod, neutral head hold and neck length. The six sessions include Face Yoga, face/jaw release and face/neck/posture programs. The animation work should cover these, not only cheek exercises. This change does not add full-body yoga poses or implement new instructional animations. Personal-photo posters are still not animated exercise demonstrations.
