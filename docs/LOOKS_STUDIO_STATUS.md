# Saved-photo Looks Studio

Implementation checkpoint, 2026-09-10. This extends the approved personal-photo UI; no replacement theme or generated concept is shipped.

## Implemented in source

- A collapsed Photo preview editor alongside the existing live camera guide.
- A shared server/client allowlist with 25 hair, 8 beard, 6 makeup and 6 eyewear presets; 11 hair-colour options including keep original. Categories do not restrict access by gender. Each prompt explicitly preserves unrelated features.
- Original-file input, one-face/detail/framing preflight, native image aspect ratio and bounded JPEG preparation. The decorative hero crop is never sent as the source.
- Separate cloud-upload confirmation before each create. Returning to a pending job checks its status instead of silently creating another render.
- Capability-protected status, cancellation and output retrieval; invalid result hosts/types/sizes fail closed. Provider credentials never enter the client.
- Original/AI result comparison, explicit local saves, a bounded 8-look IndexedDB gallery, reopen/delete and export/share handling. The personal original is not overwritten. Clear all data awaits saved-look deletion.
- Late/canceled responses cannot display stale output. A failed image download reopens the same completed job rather than creating a second render.

## Backend actions performed

Restored the existing looksmaxxing Supabase project wnzbmmhtdchdqjnskwlo from INACTIVE to ACTIVE_HEALTHY. Applied looks_studio_jobs and tested reservation idempotency, capability conflicts, once-only user allowance refund and unchanged global attempt counter inside a rolled-back SQL transaction. RLS and service-role-only table/RPC access are enabled.

Deployed a separate looks-studio Edge Function v1 pinned to server source commit 710f745631cc050b1af17503f26b862fede2abc9. The legacy render-lookmax function was not replaced. The new service is deliberately disabled in looks_settings while provider credentials and actual output quality remain unverified. The initial disabled pilot settings are 2 renders per device/day and 5 provider-start attempts globally/day; these are not a finalized paid Pro allowance.

## Verification so far

235/235 local Node tests pass, zero failures/skips. New lifecycle/prompt/validation regressions were observed failing before implementation. Browser runner is supplied and uses explicitly intercepted provider responses and injected face-check fixtures to exercise controls without spending credits or claiming photorealism. Consult current CI results before treating that runner as executed. Local Chromium navigation is blocked by the environment.

## Still required

A successful live authenticated provider request, real output review across the four categories, production billing-aware allowance policy and device acceptance are not completed. No real photorealistic image was generated in this checkpoint. No HairFastGAN weights, new makeup-specific model or learned segmentation model was imported. The server uses the already selected Replicate FLUX Kontext Pro API, not an open-source model deployment.

The existing face-yoga and neck/posture catalog remains unchanged. Its personal-photo posters are still not instructional exercise animations. No full-body yoga curriculum is added by this feature. No APK/AAB build, merge, phone installation or store submission is claimed.
