# Personal Photo Studio Implementation Plan

**Goal:** Implement the approved photographic Chisel design with each app user's own locally stored image and existing real feature actions.

**Architecture:** Preserve the static Capacitor app and shared Studio controller. Add a narrowly scoped personal photo store and view composition, keep original image bytes separate from display renditions, and retain measurement/provider ownership.

**Tech stack:** Existing JavaScript, CSS, IndexedDB, Capacitor, Node tests and GitHub Actions Chromium. No new runtime dependency.

**Spec:** docs/PERSONAL_STUDIO.md and the user-approved four-screen concept in conversation.

## Tasks

- [x] Read current PR/source and preserve current viewport-accessibility changes.
- [x] Write failing tests for file limits, original/display separation, empty state, persistence, failures and selection/removal races.
- [x] Implement chisel-personal-photo.js with local storage, explicit selection and full-data deletion integration.
- [x] Write failing tests for real session metadata, unmeasured feedback, original skin handoff and Android asset parity.
- [x] Implement Home, Trainer, Skin and Style photo-led views and CSS within the existing routes.
- [x] Connect original photo selection/cancellation without modifying the skin measurement algorithms.
- [x] Run the 220-test Node suite and syntax checks; mirror canonical runtime assets to Android.
- [ ] Run exact-head browser lifecycle and responsive checks in CI and inspect actual screenshots beside the approved concept.
- [ ] Resolve visual/interaction defects, preserve existing regression coverage, and record final exact-source evidence.

## Constraints

No stock person is a production default. No fake progress or generated appearance values. Saving a photo does not upload it or automatically analyze it. Existing cloud consent remains mandatory. Keep source edits on the existing draft branch; no merge, build-signing or store submission. No unverified measurement-accuracy or photorealistic-output claim.
