# Chisel Labs Missing Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the missing skin, open-mouth cheekbone correction, lip stain, neck-care and body/waist capabilities as a local-only Android module.

**Architecture:** Keep the legacy single-file app unchanged. Add a pure algorithm module, a standalone UI module and scoped CSS under `www/`; inject them through Capacitor `MainActivity`; mirror the assets into Android public assets; guard all behavior with Node tests.

**Tech Stack:** JavaScript, Canvas 2D, MediaPipe Tasks Vision 0.10.20, localStorage, Capacitor Android 6.1.2, Java, Node test runner.

## Global Constraints

- All image analysis is on-device; uploaded images are not persisted.
- No beauty score, attractiveness rank or guaranteed transformation language.
- Acne and neck guidance remains cosmetic/educational, not diagnosis or treatment.
- Waist preview maximum horizontal reduction is 12% and is labelled illustrative.
- Android copies must exactly match canonical `www/` assets.
- The existing `www/index.html` is not enlarged or refactored.

---

### Task 1: Pure enhancement algorithms

**Files:**
- Create: `chisel-android/tests/enhancements-core.test.cjs`
- Create: `chisel-android/www/chisel-enhancements-core.js`

**Interfaces:**
- Produces: `buildSkinRecoveryPlan`, `correctExpressionGeometry`, `recommendLipStains`, `buildNeckCarePlan`, `estimateWaistMetrics`, `waistPreviewScaleAt`, `buildBodyPlan`.

- [x] Write failing tests for the seven behaviors and run `node --test tests/enhancements-core.test.cjs`; verify the module-not-found failure.
- [x] Implement the CommonJS/browser-compatible core module.
- [x] Re-run the test and verify all seven tests pass.

### Task 2: Accessible Chisel Labs UI

**Files:**
- Create: `chisel-android/tests/enhancements-ui.test.cjs`
- Create: `chisel-android/www/chisel-enhancements.js`
- Create: `chisel-android/www/chisel-enhancements.css`

**Interfaces:**
- Consumes: all Task 1 functions through `ChiselEnhancementsCore`.
- Produces: `boot`, `openLabs`, `closeLabs`, `readLatestScan`, `createStateStore`, `renderWaistPreview`.

- [x] Write failing tests for the five-module catalog, accessible modal, prefixed scan lookup, state recovery and preview dimensions.
- [x] Implement the module shell, local state and premium responsive styling.
- [x] Implement Skin Recovery using the latest `chisel:scans` record.
- [x] Implement two-photo expression calibration with neutral-reference landmark remapping.
- [x] Implement lip colour sampling, shade ranking and virtual stain overlay.
- [x] Implement optional neck colour/evenness sampling and care direction.
- [x] Implement full-body pose/silhouette analysis, confidence rejection and illustrative preview.
- [x] Run `node --test tests/enhancements-ui.test.cjs` and verify all tests pass.

### Task 3: Clean preview regression

**Files:**
- Modify: `chisel-android/tests/enhancements-ui.test.cjs`
- Modify: `chisel-android/www/chisel-enhancements.js`

**Interfaces:**
- Produces: `cloneCanvasSurface(source, documentRef)`.

- [x] Add a failing regression test proving a clean source canvas can be preserved before overlay drawing.
- [x] Clone the unannotated body canvas before measurement lines are painted.
- [x] Use the clean clone for the waist preview and re-run the UI tests.

### Task 4: Native Android loader

**Files:**
- Create: `chisel-android/tests/native-integration.test.cjs`
- Modify: `chisel-android/android/app/src/main/java/com/chisel/lookmax/MainActivity.java`
- Create: `chisel-android/android/app/src/main/assets/public/chisel-enhancements-core.js`
- Create: `chisel-android/android/app/src/main/assets/public/chisel-enhancements.js`
- Create: `chisel-android/android/app/src/main/assets/public/chisel-enhancements.css`

**Interfaces:**
- Consumes: canonical `www/` assets.
- Produces: idempotent WebView injection after Capacitor bridge startup.

- [x] Write failing native integration and checksum tests.
- [x] Override `onCreate` and `onResume`; inject CSS, then core JS, then UI JS.
- [x] Mirror canonical assets into Android public assets.
- [x] Run the native tests and verify injection order plus checksum equality.
- [x] Compile `MainActivity.java` against minimal Capacitor/Android stubs to verify Java syntax.

### Task 5: Test commands and documentation

**Files:**
- Modify: `chisel-android/package.json`
- Create: `docs/CHISEL_LABS.md`
- Create: `docs/superpowers/specs/2026-08-01-chisel-labs-missing-features-design.md`
- Create: `docs/superpowers/plans/2026-08-01-chisel-labs-missing-features.md`

- [x] Add `npm test` and `npm run test:enhancements` commands using Node's built-in runner.
- [x] Document usage, privacy boundaries, measurement limitations and release blockers.
- [x] Run `node --check` on both JavaScript files.
- [x] Run `npm test` and verify 15/15 tests pass.
