# Mobile UX, Analysis, and Facial-Hair Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct Chisel's phone navigation spacing and information architecture, make facial-hair try-on inclusive and visually stable, and make the jawline immediately visible in both live scanning and results.

**Architecture:** Preserve the canonical single-file app and camera loop. Add regression coverage around the generated UI contract, then make focused CSS/HTML/renderer changes in `www/index.html`; Capacitor sync remains the only copy path into Android. Keep existing storage keys and route names for compatibility.

**Tech Stack:** HTML/CSS/vanilla JavaScript, Canvas 2D, MediaPipe FaceLandmarker 0.10.20, Capacitor 6, Node built-in test runner, Android Gradle.

## Global Constraints

- Phone primary navigation has exactly five tabs: Home, Analyze, Affirm, Meditate, Groom.
- The existing `connect` route remains available as Settings but is not a primary tab.
- Safe-area bottom space is owned once; the app grid and tabs must not both add it.
- Facial hair is available for every identity and both hair collections.
- Beard geometry is deterministic across frames; `Math.random()` is prohibited inside `drawBeard`.
- Quick/Deep scan and AR coach jaw contours use a dark halo plus high-contrast foreground stroke.
- Face results lead with jaw structure and do not call the user a harmony score.
- No new dependency, permission, account, upload, medical claim, or adult-bone-change claim.

---

### Task 1: Regression contract

**Files:**
- Create: `chisel-android/tests/mobile-ux-regression.test.cjs`
- Test: `chisel-android/tests/mobile-ux-regression.test.cjs`

**Interfaces:**
- Consumes: canonical `www/index.html` as UTF-8 text.
- Produces: five focused regressions covering the reported phone failures.

- [ ] **Step 1: Write failing navigation and safe-area tests**

Create tests that extract `#bottomTabs` and assert five `data-route` links, no `Connect` label, a Home `data-go="connect"` Settings control, `repeat(5,minmax(0,1fr))`, a fixed `72px` mobile tab row, and pill width divided by five.

- [ ] **Step 2: Write failing facial-hair tests**

Extract `drawBeard` and `renderStyleChips`; assert the renderer has no women/identity early return and no `Math.random`, the beard chips are not hidden for a collection, and the visible selector copy says `Short styles` and `Long styles`.

- [ ] **Step 3: Write failing jaw-analysis tests**

Assert `drawScanStructureGuide(d,R)` is called by `drawMesh`, that it contains two jaw strokes and cheek anchors, that the Jaw area precedes Skin in the `areas` array, and that results use the heading `Face analysis` without `/100 harmony`.

- [ ] **Step 4: Verify RED**

Run: `node --test tests/mobile-ux-regression.test.cjs`

Expected: failures identify six tabs/Connect, double safe-area sizing, binary/random beard behavior, absent scan structure guide, and the score-led result hierarchy.

### Task 2: Five-tab mobile navigation and Settings entry

**Files:**
- Modify: `chisel-android/www/index.html` layout CSS, rail/tabs markup, Home markup, and `go(route)` pill sizing.
- Test: `chisel-android/tests/mobile-ux-regression.test.cjs`

**Interfaces:**
- Consumes: existing `connect` route and `go(route)` router.
- Produces: `#openSettings`/`data-go="connect"` Home control and a five-column `#bottomTabs`.

- [ ] **Step 1: Implement the single-owner safe area**

Set the phone grid row to `minmax(0,1fr) 72px`, remove bottom safe-area padding from `nav.tabs`, and calculate pill height from the fixed row only.

- [ ] **Step 2: Remove Connect from primary navigation**

Remove `connect` links from rail and bottom tabs. Add a compact, labeled Settings button on Home that routes to `connect`; change the screen eyebrow/title from Connect language to Settings language.

- [ ] **Step 3: Make pill movement independent of route-array index**

Create `primaryRoutes=['home','analyze','affirm','meditate','groom']`; move the pill only when the active route is in that array and hide it on Settings.

- [ ] **Step 4: Verify GREEN for navigation**

Run: `node --test tests/mobile-ux-regression.test.cjs`

Expected: navigation/safe-area assertions pass; later facial-hair and jaw assertions still fail.

### Task 3: Inclusive, stable facial-hair preview

**Files:**
- Modify: `chisel-android/www/index.html` `BEARD_STYLES`, `drawBeard`, `applyMatches`, `renderStyleTop`, `renderStyleChips`, `renderPhotoreal`, and `applyIdentity`.
- Test: `chisel-android/tests/mobile-ux-regression.test.cjs`

**Interfaces:**
- Consumes: `BEARD_FULL`, `LIP_RING`, `MOUS`, `CHIN_PATCH`, `JAW_LOW`, current color sample, and face-shape matches.
- Produces: deterministic `drawBeard(P,col,fH)` output and identity-independent facial-hair controls.

- [ ] **Step 1: Replace binary collection labels**

Render `Short styles` and `Long styles` labels while retaining the existing internal `men`/`women` keys for compatibility. Keep identity only as the initial collection default.

- [ ] **Step 2: Remove identity gates**

Delete the `styleGender==='women'` early return, always render `#beardLab`/`#beardChips`, apply beard matches regardless of collection, and pass the selected beard to optional photoreal rendering for either collection.

- [ ] **Step 3: Replace opaque/random beard rendering**

Add density/length/softness values to beard definitions. Clip to the selected landmark region, paint a low-alpha base, then render deterministic tapered strokes using a fixed integer hash per stroke; cut out the lips after all layers. Keep chinstrap as a softened jaw stroke.

- [ ] **Step 4: Verify GREEN for facial hair**

Run: `node --test tests/mobile-ux-regression.test.cjs`

Expected: facial-hair assertions pass; jaw-analysis assertions still fail.

### Task 4: Visible jaw and cheek structure during capture

**Files:**
- Modify: `chisel-android/www/index.html` near `drawMesh`, `drawARCoachGuide`, and canvas helpers.
- Test: `chisel-android/tests/mobile-ux-regression.test.cjs`

**Interfaces:**
- Consumes: `JAW_LOW`, MediaPipe points, `coverRect()`, current canvas transform, and AR form lock state.
- Produces: `drawScanStructureGuide(d,R)` and reusable dual-stroke paths.

- [ ] **Step 1: Add a reusable dual-stroke polyline helper**

Draw a black translucent halo first and a gold/green foreground second with round joins/caps. Stroke widths remain visually constant through `R.s`.

- [ ] **Step 2: Draw scan structure above the mesh**

After tessellation/feature connections, draw the full lower jaw and two cheek-anchor lines above the mesh. Do not cover the lips or eyes.

- [ ] **Step 3: Upgrade AR contrast**

Use the same halo/foreground sequence in `drawARCoachGuide` so the jaw and cheek paths remain visible against any background.

- [ ] **Step 4: Verify GREEN for jaw capture**

Run: `node --test tests/mobile-ux-regression.test.cjs`

Expected: live jaw structure assertions pass; only result hierarchy assertions remain if not yet implemented.

### Task 5: Jaw-first face-analysis results

**Files:**
- Modify: `chisel-android/www/index.html` `areas` ordering and `renderResults`.
- Test: `chisel-android/tests/mobile-ux-regression.test.cjs`

**Interfaces:**
- Consumes: existing jaw/cheek/symmetry metrics, `overall` for backward-compatible storage, and `extra.quality`.
- Produces: jaw-first, quality-led `#camSheet` result content.

- [ ] **Step 1: Reorder result areas**

Build `areas` in the order Jaw, Cheekbones, Symmetry, Skin, Hair, Grooming, Teeth, Lips, Bloat, Angles, Nose, Eyes. Mark Jaw with `priority:true`.

- [ ] **Step 2: Simplify the top result**

Change the heading to `Face analysis`, place Scan quality immediately below it, and add a compact jaw summary showing taper, gonial estimate, and jaw score as a photographic tracking signal. Remove `/100 harmony` and controllable-potential prominence from the first viewport.

- [ ] **Step 3: Collapse secondary areas**

Open only `priority` cards by default; leave all supporting measurements available on tap.

- [ ] **Step 4: Verify GREEN and full suite**

Run: `node --test tests/mobile-ux-regression.test.cjs`

Expected: all focused tests pass.

Run: `npm test`

Expected: all project tests pass with zero failures.

### Task 6: Android sync, device QA, and handoff

**Files:**
- Modify: generated `chisel-android/android/app/src/main/assets/public/index.html` via Capacitor sync.
- Modify: `docs/AI_HANDOFF.md`, `docs/FEATURE_MATRIX.md`, `docs/TEST_STATUS.md`, `docs/RELEASE_STATUS.md`, `docs/CHANGE_REQUESTS.md`.

**Interfaces:**
- Consumes: verified canonical web assets.
- Produces: synchronized APK and evidence-backed handoff.

- [ ] **Step 1: Sync and verify parity**

Run: `npx cap sync android`

Run: `npm test`

Expected: Android asset parity and all tests pass.

- [ ] **Step 2: Build**

Run from `chisel-android/android`: `gradlew.bat assembleDebug`

Expected: `BUILD SUCCESSFUL` and `app/build/outputs/apk/debug/app-debug.apk` exists.

- [ ] **Step 3: Physical-phone QA**

Upgrade-install on `R3CW10Y67TT`. Use UI-tree-derived coordinates to verify five-tab spacing, Home Settings entry, both hair collections with visible facial-hair controls, live jaw contrast, and jaw-first result hierarchy. Check the crash buffer.

- [ ] **Step 4: Protect camera data**

Delete temporary screenshots and UI dumps after inspection; do not commit them.

- [ ] **Step 5: Update docs and verify**

Record exact commands/results, run `git diff --check`, rerun `npm test`, and rerun `assembleDebug` before completion.
