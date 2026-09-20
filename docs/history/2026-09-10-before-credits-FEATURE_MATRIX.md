# Chisel Feature Matrix

## Current Looks workspace checkpoint, 2026-09-10

The actual saved-photo editor now uses a dedicated native dialog rather than a stacked inline form. It retains the 45 unisex presets, 11 colour choices, original-photo input, explicit upload consent, comparison and local gallery from the preceding Looks implementation. Added: prominent portrait and primary action together, searchable Browse sheet, colour swatches bound to real parameters, a separate saved collection and respectful close/late-result behavior.

Revision `3e0fc9d536a149ec7452c22129f92e15766bbe50`: 245/245 Node, 54/54 Looks browser checks, all five current workflows green. Provider responses and face checks are fixtures. No new generated output, enabled production rendering, measurement model, exercise animation or Android build is implied. See [latest design and verification](LOOKS_WORKSPACE_REVIEW.md) and [cloud limitations](LOOKS_STUDIO_STATUS.md).

## Earlier Personal Photo Studio inventory

The [complete earlier 60-area inventory](history/2026-09-10-before-studio-FEATURE_MATRIX.md) and its measurement/configuration limits remain applicable.

| Area | Current implementation | Remaining acceptance |
|---|---|---|
| Personal photo | Explicit choose/take, local original and display storage, reload, replacement, removal and full-data deletion | Physical Android picker/camera and storage-lifecycle checks |
| Home | Own-photo hero/avatar, three balanced tool controls and original daily completion | Physical touch/scroll and large text |
| Trainer | Own-photo poster/thumbnails, real Start action, six sessions and working filters; no sample scores | Live camera thresholds and human-labelled rep validation; poster is not exercise animation |
| Skin | Personal original selection, separate Analyze action, original quality gates and honest empty results | Signals remain experimental; reference accuracy unestablished |
| Style | Personal poster and existing live-guide actions; saved-photo workflow and focused editor described above | Real provider output review and production enablement pending |
| Shared presentation | Dark green/black surfaces, cream controls, grouped photo-led tasks and consistent gutters | Physical accessibility/performance acceptance |
| Reliability/privacy | Existing quality and provider consent boundaries retained; photo data not uploaded by the personal store | Empirical validation and full production privacy review |
| Cloud/billing/store | Source and previously deployed disabled Looks service | Production configuration, live rendering, signing, real billing and store requirements |

Earlier personal-photo revision `2d5ecf6de339621c8c96258ea74b53a034faf865` passed 222 Node and 66 personal-photo browser checks. See [historical evidence](PERSONAL_STUDIO.md), [release limits](RELEASE_STATUS.md) and [prior presentation matrix](history/2026-09-10-before-personal-FEATURE_MATRIX.md). UI test passes are not evidence of accuracy or realism.
