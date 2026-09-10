# Personal Photo Studio Implementation Plan

**Goal:** Implement the approved photographic Chisel direction using each app user's local portrait and existing real feature actions.

**Architecture:** Preserve the static Capacitor application and shared Studio controller. Add a local photo store and focused view composition, retain originals separately from display renditions, and preserve measurement/provider ownership.

**Tech stack:** Existing JavaScript, CSS, IndexedDB, Capacitor, Node and GitHub Actions Chromium. No new runtime dependency.

**Spec:** docs/PERSONAL_STUDIO.md and the approved four-screen concept in conversation.

## Completed tasks

- [x] Inspect current PR/source and preserve viewport accessibility changes.
- [x] Write failing tests for limits, image originals, empty state, persistence, failure and selection/removal races.
- [x] Implement private photo import/replacement/removal and full-data deletion integration.
- [x] Write failing tests for real session metadata, unmeasured feedback and original Skin handoff.
- [x] Implement Home, Trainer, Skin and Style within existing routes with no seeded people or scores.
- [x] Preserve existing camera, provider, upload-consent and measurement engines.
- [x] Mirror runtime/style assets to Android and verify syntax/parity.
- [x] Fix actual deletion, contrast, placeholder and Style-spacing defects found during browser review.
- [x] Verify 222 Node tests and 66 personal-photo browser checks, all four current workflows green on 2d5ecf6.
- [x] Inspect approved concept and actual final mobile screenshots, record intentional differences and update handoff/privacy documentation.

## Boundaries

No merge, signed Android build or installed phone update. Physical-device interaction, empirical measurement accuracy and actual cloud-render realism remain release acceptance, not completed by this UI plan. Saving a portrait does not upload it or automatically analyze it. A personalized still poster is not a generated exercise demonstration or transformed hairstyle.
