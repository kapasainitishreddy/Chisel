# Unisex Face & Neck Trainer + Skin Appearance Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a polished, unisex Face & Neck Trainer and a non-diagnostic local Skin Appearance Lab inside Chisel, while preserving existing AR coaching, privacy, release hardening, and Play-safe claims.

**Architecture:** Extend the existing `ChiselARCoach` UMD core rather than replacing it, and load focused runtime enhancement modules from the existing feature bootstrap. Add a pure-JS skin appearance analysis core so pixel metrics are unit-testable without a browser, then add a browser-only MediaPipe/Canvas UI module that augments the existing Skin Recovery panel. Keep all normal scans local; external photoreal model work stays behind the existing explicit opt-in path.

**Tech Stack:** Vanilla JavaScript/HTML/CSS, Node `node:test`, MediaPipe Tasks Vision 0.10.20, Canvas 2D, Capacitor 6 Android shell.

**Spec:** `docs/OSS_INTEGRATION_PLAN.md`

## Global Constraints

- Unisex by default: routines and recommendations are driven by geometry, goal, comfort, texture/length/style preferences, not gender.
- Never claim adult-bone reshaping, spot-fat loss, medical diagnosis, dermatologic treatment, or guaranteed attractiveness improvement.
- Core scan/trainer processing remains on-device; cloud photoreal rendering remains explicit opt-in.
- Preserve existing IDs and behavior relied on by the current AR coach, Labs, CI, Android asset-sync, and release-hardening tests.
- All new interactive controls must have visible labels, keyboard focus, at least 44px touch targets, mobile reflow at 320px width, and reduced-motion-safe behavior.
- Skin outputs must say “appearance”, “signal”, “proxy”, or “visible” where a user could otherwise read the metric as a medical diagnosis.

---

### Task 1: Lock the trainer-v2 behavioral contract with failing tests

**Files:**
- Create: `chisel-android/tests/face-neck-trainer-v2.test.cjs`
- Modify later: `chisel-android/www/chisel-ar-coach-core.js`

**Interfaces:**
- Consumes: existing `ChiselARCoach` exports.
- Produces: `FORM_TRACKING`, new unisex sessions, `scoreForm(exercise, signals)`, score-bearing `evaluateForm()`, and backward-compatible `advanceState()`.

- [ ] **Step 1: Write the failing tests** for: unisex session catalog; no clench/jut/bone-change claims; cheek lift symmetry; jaw-release safety; 0–100 form score; guided-vs-form tracking metadata; and backward-compatible rep completion.
- [ ] **Step 2: Run** `cd chisel-android && node --test tests/face-neck-trainer-v2.test.cjs` and confirm failure because the new sessions/score API do not exist yet.
- [ ] **Step 3: Implement minimal trainer-v2 core** in `chisel-ar-coach-core.js` while preserving all old exports and IDs.
- [ ] **Step 4: Re-run** trainer-v2 plus `tests/ar-coach-core.test.cjs` and require both to pass.
- [ ] **Step 5: Commit** trainer core behavior.

### Task 2: Lock the skin appearance analysis contract with failing tests

**Files:**
- Create: `chisel-android/tests/skin-appearance-core.test.cjs`
- Create later: `chisel-android/www/chisel-skin-appearance-core.js`

**Interfaces:**
- Produces: `analyzePixelSet({data,width,height})`, `aggregateRegions(regionResults)`, `buildAppearanceSummary(metrics)`, `signalBand(value)`, and `METRIC_DEFS`.

- [ ] **Step 1: Write failing tests** that require six bounded 0–100 cosmetic signals: redness appearance, shine/oil appearance, texture variation, pore visibility proxy, blemish-like contrast, and pigment unevenness; confidence must also be bounded and summary copy must remain non-diagnostic.
- [ ] **Step 2: Run** `cd chisel-android && node --test tests/skin-appearance-core.test.cjs` and confirm the missing module/API is the failure.
- [ ] **Step 3: Implement minimal pure-JS analysis** using deterministic RGB/luminance/chroma/local-contrast statistics; no ML or network dependency in the core.
- [ ] **Step 4: Re-run the test** and verify pass.
- [ ] **Step 5: Commit** the skin appearance core.

### Task 3: Add the polished trainer runtime UI

**Files:**
- Create: `chisel-android/www/chisel-trainer-v2.css`
- Create: `chisel-android/www/chisel-trainer-v2.js`
- Create: `chisel-android/tests/trainer-v2-ui.test.cjs`
- Modify: `chisel-android/www/chisel-ar-coach-core.js` bootstrap loader.

**Interfaces:**
- Consumes: `window.ChiselARCoach`, existing `#arCoachModal`, `.ar-session-grid`, `#arCoachHud`, and `chisel:coach-state` CustomEvents emitted by the core.
- Produces: a Face & Neck Trainer modal upgrade, four unisex routine cards, phase rail, live form-score row, clean-rep language, evidence labels, and explicit non-spot-fat-loss copy.

- [ ] **Step 1: Write failing UI source tests** for the new runtime/CSS and bootstrap references.
- [ ] **Step 2: Run** `node --test tests/trainer-v2-ui.test.cjs` and confirm failure before creating production files.
- [ ] **Step 3: Implement CSS/JS** that upgrades the existing modal in place; do not create a parallel modal or new app shell.
- [ ] **Step 4: Extend the core** to emit `chisel:coach-state` only when browser event APIs exist; Node behavior remains unchanged.
- [ ] **Step 5: Re-run** trainer core/UI/mobile UX tests.
- [ ] **Step 6: Commit** trainer runtime UI.

### Task 4: Add the Skin Appearance Lab UI and regional analysis

**Files:**
- Create: `chisel-android/www/chisel-skin-appearance.css`
- Create: `chisel-android/www/chisel-skin-appearance.js`
- Create: `chisel-android/tests/skin-appearance-ui.test.cjs`
- Modify: `chisel-android/www/chisel-ar-coach-core.js` bootstrap loader.

**Interfaces:**
- Consumes: `window.ChiselSkinAppearanceCore`, `window.ChiselEnhancementsCore`, existing `#chl-panel-skin`, MediaPipe Face Landmarker, Canvas 2D.
- Produces: photo capture/upload, capture-quality gate, face-region masks (forehead, left cheek, right cheek, chin), six appearance cards, regional breakdown, confidence/condition note, annotated preview, “What I see / What to do / Compare next” hierarchy, and local history.

- [ ] **Step 1: Write failing UI tests** for the new module, safe labels, responsive CSS hooks, and bootstrap loading order.
- [ ] **Step 2: Run** `node --test tests/skin-appearance-ui.test.cjs` and confirm failure.
- [ ] **Step 3: Implement local MediaPipe + Canvas analysis**. Reject missing face, under/overexposure, or insufficient face size rather than forcing scores.
- [ ] **Step 4: Map aggregate signals into the existing conservative `buildSkinRecoveryPlan()` API** using only cosmetic inputs; render the plan without diagnosis language.
- [ ] **Step 5: Re-run** core/UI/enhancement/mobile tests.
- [ ] **Step 6: Commit** Skin Appearance Lab UI.

### Task 5: Make Looks Studio presentation unisex without breaking existing style assets

**Files:**
- Create: `chisel-android/tests/unisex-style-presentation.test.cjs`
- Modify: `chisel-android/www/chisel-ar-coach-core.js` bootstrap label fix.

**Interfaces:**
- Consumes: existing `#styleTop` segmented style-family buttons.
- Produces: user-facing style-family labels `Short / structured` and `Long / layered`, plus “browse by style family, not gender” accessibility text, while preserving existing internal mode values/assets.

- [ ] **Step 1: Write a failing test** that rejects forced `Men hairstyles` / `Women hairstyles` labels in the runtime bootstrap.
- [ ] **Step 2: Run** the test and confirm red against the current branch.
- [ ] **Step 3: Replace only visible/accessibility labels**, not underlying internal style selection values.
- [ ] **Step 4: Run** beauty-studio, mobile UX, and feature-runtime integration tests.
- [ ] **Step 5: Commit** unisex style presentation.

### Task 6: Full verification and release truth update

**Files:**
- Modify: `docs/FEATURE_MATRIX.md`
- Modify: `docs/TEST_STATUS.md` only with evidence actually produced by CI.

**Interfaces:**
- Produces: truthful feature/release documentation; no accuracy claims beyond tested software behavior.

- [ ] **Step 1: Run full suite** with `cd chisel-android && npm test`.
- [ ] **Step 2: Run JavaScript syntax checks** for each new runtime/core file with `node --check`.
- [ ] **Step 3: Run GitHub CI on the exact branch head** and confirm all jobs green.
- [ ] **Step 4: Inspect interaction/visual QA artifacts if CI produces them**, checking mobile overflow, controls, labels, and core trainer/skin paths.
- [ ] **Step 5: Update docs** with exact verified counts/status only.
- [ ] **Step 6: Keep the work on the feature branch/draft PR until physical-device skin-camera and trainer acceptance is performed; do not claim empirical skin or facial-change accuracy from software tests alone.
