# AR Jaw & Cheek Coach Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an on-device AR coach that guides safe jawline-posture and cheek-control sessions using the existing MediaPipe face mesh.

**Architecture:** Add one focused UMD module for the exercise catalog, landmark signals, form evaluation, and hold/repetition state machine. Load it before the existing main script and integrate it into the current `trainMode`/`meshLoop()` camera path, with one session-picker modal and one camera-safe coach panel.

**Tech Stack:** Capacitor 6.1.2, static HTML/CSS/JavaScript, MediaPipe Tasks-Vision 0.10.20, Node built-in test runner, Android Gradle.

## Global Constraints

- AR only; no VR or headset mode.
- No claim that exercises reshape adult facial bone, spot-reduce fat, or treat a medical condition.
- Remove forceful clenching and jaw-jutting from the user-facing routine.
- Keep camera analysis and progress storage on-device.
- Reuse the single `meshLoop()` and shared camera teardown.
- Use onyx/gold/ivory styling and monochrome geometric glyphs; no emoji.
- Every exercise displays an evidence grade and a safety cue.

---

### Task 1: Testable AR Coach Core

**Files:**
- Create: `chisel-android/www/chisel-ar-coach-core.js`
- Create: `chisel-android/tests/ar-coach-core.test.cjs`

**Interfaces:**
- Produces: `window.ChiselARCoach` and CommonJS export with `EXERCISES`, `SESSIONS`, `signalsFromLandmarks(landmarks)`, `evaluateForm(exercise, signals)`, `createState(sessionId, now)`, and `advanceState(state, form, now)`.
- `evaluateForm` returns `{ accepted:boolean, correction:string, tone:'find'|'hold' }`.
- `advanceState` returns a new serializable state with `exerciseIndex`, `rep`, `holdStartedAt`, `restUntil`, `completed`, and `event`.

- [ ] **Step 1: Write the failing catalog and safety tests**

```js
const coach = require('../www/chisel-ar-coach-core.js');

test('catalog offers jaw, cheek and full sessions without forceful jaw moves', () => {
  assert.deepEqual(Object.keys(coach.SESSIONS), ['jaw', 'cheek', 'full']);
  const names = coach.EXERCISES.map((item) => item.name).join(' ');
  assert.doesNotMatch(names, /clench|jut/i);
  assert.ok(coach.EXERCISES.every((item) => item.evidence && item.safety));
});

test('safety copy rejects bone reshaping and pain', () => {
  assert.match(coach.SAFETY_COPY, /does not reshape adult facial bones/i);
  assert.match(coach.SAFETY_COPY, /pain|clicking|locking|dizziness/i);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `cd chisel-android && node --test tests/ar-coach-core.test.cjs`

Expected: FAIL because `chisel-ar-coach-core.js` does not exist.

- [ ] **Step 3: Add failing geometry and state tests**

Create normalized 468-point fixtures containing landmarks 10, 13, 14, 33, 61,
152, 234, 263, 291, and 454. Assert that neutral landmarks pass alignment but
not cheek-lift form, symmetric raised corners pass cheek form, asymmetric corners
return a symmetry correction, bad form does not advance hold time, and accepted
form completes one rep only after the exercise hold duration.

- [ ] **Step 4: Implement the minimal UMD core**

Define four exercises: `chin-tuck`, `neck-length`, `cheek-raise`, and
`relaxed-smile`. Compute normalized mouth width, corner lift, corner asymmetry,
mouth openness, eye-line tilt, and face-width ratios. Keep thresholds in the
exercise definitions and make `advanceState` immutable.

- [ ] **Step 5: Verify GREEN**

Run: `cd chisel-android && node --test tests/ar-coach-core.test.cjs`

Expected: all AR core tests PASS.

- [ ] **Step 6: Commit the core**

```bash
git add chisel-android/www/chisel-ar-coach-core.js chisel-android/tests/ar-coach-core.test.cjs
git commit -m "feat: add AR jaw and cheek coach core"
```

### Task 2: Session Picker and Mobile Coach UI

**Files:**
- Modify: `chisel-android/www/index.html`
- Create: `chisel-android/tests/ar-coach-ui.test.cjs`

**Interfaces:**
- Consumes: `window.ChiselARCoach` from Task 1.
- Produces: `#arCoachModal`, `#arCoachHud`, `openARCoach()`, `startARCoach(sessionId)`, `renderARCoachHud()`, and `drawARCoachGuide(d, form)`.

- [ ] **Step 1: Write the failing static UI test**

```js
test('Analyze exposes one AR coach entry and loads the core before the app', () => {
  assert.match(html, /id="openTrain"[^>]*>AR Jaw &amp; Cheek Coach/);
  assert.match(html, /id="arCoachModal"/);
  assert.match(html, /id="arCoachHud"/);
  assert.ok(html.indexOf('chisel-ar-coach-core.js') < html.indexOf('function deviceId'));
});

test('AR coach UI includes safety, evidence and a reachable stop control', () => {
  assert.match(html, /does not reshape adult facial bones/i);
  assert.match(html, /Evidence: Limited/i);
  assert.match(html, /id="arCoachStop"/);
  assert.doesNotMatch(coachSection, /clench|jaw jut/i);
});
```

- [ ] **Step 2: Run the UI test and verify RED**

Run: `cd chisel-android && node --test tests/ar-coach-ui.test.cjs`

Expected: FAIL because the modal, HUD, and core script reference are absent.

- [ ] **Step 3: Build the session picker**

Add an onyx/gold modal with three 44px-minimum session buttons, session length,
exercise names, evidence disclosure, and the complete stop-symptom warning.
Change the Analyze button label to “AR Jaw & Cheek Coach.”

- [ ] **Step 4: Build the camera coach panel**

Add `#arCoachHud` inside the camera shell with exercise title, evidence chip,
cue, progress bar, rep count, and `#arCoachStop`. Position it above Android safe
area, keep text readable over video, and disable nonessential animation under
`prefers-reduced-motion`.

- [ ] **Step 5: Integrate the state engine**

`openARCoach()` opens the picker without starting the camera.
`startARCoach(sessionId)` calls `setCamMode('train')`, creates state, renders the
HUD, then calls `openCam()`. `trainStep(d)` obtains signals and form from the core,
advances state, pauses on face loss/bad form, provides one correction, optionally
vibrates for 20ms on a completed rep, and calls `finishTrain()` only on session
completion. Stop and teardown hide the HUD and clear coach state.

- [ ] **Step 6: Draw AR guides**

When `trainMode` is active, replace the dense scan mesh with a clean jaw contour,
two cheek arcs, mouth-corner targets, and a vertical center line. Use gold while
finding form and green while accepted; pair color with the text status.

- [ ] **Step 7: Verify GREEN and full regression suite**

Run:

```bash
cd chisel-android
node --test tests/ar-coach-ui.test.cjs
npm test
```

Expected: AR UI tests and the complete suite PASS.

- [ ] **Step 8: Commit the active UI**

```bash
git add chisel-android/www/index.html chisel-android/tests/ar-coach-ui.test.cjs
git commit -m "feat: add AR jaw and cheek coaching UI"
```

### Task 3: Android Sync, Physical QA, and Handoff

**Files:**
- Modify: `chisel-android/android/app/src/main/assets/public/index.html` (generated by sync)
- Create: `chisel-android/android/app/src/main/assets/public/chisel-ar-coach-core.js` (generated by sync)
- Modify: `docs/AI_HANDOFF.md`
- Modify: `docs/FEATURE_MATRIX.md`
- Modify: `docs/TEST_STATUS.md`
- Modify: `docs/RELEASE_STATUS.md`
- Modify: `docs/CHANGE_REQUESTS.md`

**Interfaces:**
- Consumes: completed source and tests from Tasks 1–2.
- Produces: synchronized Android assets, verified APK, installed physical build, and evidence-backed handoff.

- [ ] **Step 1: Synchronize and verify parity**

Run:

```bash
cd chisel-android
npx cap sync android
npm test
```

Expected: canonical `www` assets match packaged Android assets and all tests pass.

- [ ] **Step 2: Build the debug APK**

Run: `cd chisel-android/android && gradlew.bat assembleDebug`

Expected: `BUILD SUCCESSFUL` and `app/build/outputs/apk/debug/app-debug.apk` exists.

- [ ] **Step 3: Install and smoke-test on the connected phone**

Install with ADB, launch `com.chisel.lookmax/.MainActivity`, use the UI tree to
open Analyze and the AR picker, start Full Face, allow camera if prompted, verify
the AR HUD and Stop remain visible, stop the session, and confirm normal Analyze
controls return. Capture UI tree, screenshot, and crash log evidence.

- [ ] **Step 4: Update all handoff documents**

Record the active feature, evidence/safety limits, exact test count, sync/build
results, device serial, APK installation, and any camera validation limitation.

- [ ] **Step 5: Final verification and commit**

Run `git diff --check`, repeat `npm test`, and confirm `adb shell pm path
com.chisel.lookmax`. Commit only the AR coach and required handoff changes while
preserving unrelated working-tree edits.
