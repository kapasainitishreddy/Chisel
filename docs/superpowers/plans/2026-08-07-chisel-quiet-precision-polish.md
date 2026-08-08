# Chisel Quiet Precision Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden Chisel's measurement reliability, make failure states actionable, preserve the premium mobile UX, prepare Android for API 36, and document the production premium boundary.

**Architecture:** Keep the current static HTML + modular JS + Capacitor structure. Reliability logic stays in `chisel-precision-*` modules so UI code consumes stable outputs. Android changes remain isolated to Gradle/manifest/CI configuration. Existing user-facing features remain backwards compatible.

**Tech Stack:** HTML/CSS/JavaScript, Node test runner, MediaPipe-backed browser modules, Capacitor 6, Android Gradle Plugin, GitHub Actions.

## Global Constraints

- Core standard analysis remains account-free and local-first.
- No attractiveness/global beauty score.
- No meaningful-change claim unless it exceeds combined uncertainty.
- Low-quality capture must fail closed.
- Current package ID remains `com.chisel.lookmax`.
- Android production target is API 36.
- Privacy/export/delete/accessibility remain free.

---

### Task 1: Actionable capture-quality feedback

**Files:**
- Modify: `chisel-android/www/chisel-precision-protocol.js`
- Test: `chisel-android/tests/precision-core.test.cjs`

**Interfaces:**
- Consumes: `scoreFrame(frame, kind)` quality reason codes.
- Produces: `guidanceFor(reason)` and human-readable retry messages from `evaluateProtocol()`.

- [ ] **Step 1: Add failing tests** asserting that low-light, blur, head-angle, glare, segmentation, and body-limb failures return actionable correction text instead of raw internal reason names.
- [ ] **Step 2: Run** `npm test` and confirm the new assertions fail.
- [ ] **Step 3: Add a deterministic guidance map** in `chisel-precision-protocol.js`, for example:

```js
const GUIDANCE = {
  lighting: 'Move to even front lighting and avoid a bright window behind you.',
  blur: 'Hold the phone still, clean the lens, and wait for focus before capturing.',
  distance: 'Move until your face or body fits the guide without crowding the frame.',
  'head-angle': 'Keep the camera at eye level and face straight ahead.',
  expression: 'Relax your face and keep a neutral expression.',
  glare: 'Turn slightly away from reflections or remove reflective glasses for this scan.',
  occlusion: 'Move hair, hands, or accessories away from the measured landmarks.',
  segmentation: 'Use a plain contrasting background and keep your full outline visible.',
  limbs: 'Keep feet and required limbs fully visible in the frame.',
  pose: 'Stand square to the camera and keep the phone level.'
};
```

`evaluateProtocol()` should aggregate these messages using the most frequent failure reasons.
- [ ] **Step 4: Run** `npm test` and confirm all tests pass.
- [ ] **Step 5: Commit** as `feat: make precision capture failures actionable`.

### Task 2: Condition-match and method-version safety

**Files:**
- Modify: `chisel-android/www/chisel-precision-stats.js`
- Test: `chisel-android/tests/precision-core.test.cjs`

**Interfaces:**
- Consumes: scan setup metadata.
- Produces: `compatibleSetup(a, b)` with explicit reasons and a compatibility label.

- [ ] **Step 1: Add failing tests** for incompatible method versions, incompatible views, large distance mismatch when distance metadata exists, and compatible legacy scans without those optional fields.
- [ ] **Step 2: Run** `npm test` and confirm failure.
- [ ] **Step 3: Extend** `compatibleSetup()` so it checks:

```js
const sameMethod = !a.methodVersion || !b.methodVersion || a.methodVersion === b.methodVersion;
const sameView = !a.view || !b.view || a.view === b.view;
const distanceA = Number(a.distanceCm);
const distanceB = Number(b.distanceCm);
const distanceComparable = !Number.isFinite(distanceA) || !Number.isFinite(distanceB) ||
  Math.abs(distanceA - distanceB) / Math.max(distanceA, distanceB) <= 0.12;
```

Return `label: 'matched' | 'usable' | 'not-comparable'` while preserving the existing `compatible` boolean for callers.
- [ ] **Step 4: Run** `npm test` and confirm all tests pass.
- [ ] **Step 5: Commit** as `feat: harden precision comparison matching`.

### Task 3: Results trust language

**Files:**
- Modify: `chisel-android/www/chisel-precision-ui.js`
- Test: `chisel-android/tests/precision-ui.test.cjs`

**Interfaces:**
- Consumes: precision fusion score, acceptance state, confidence intervals, retry reasons.
- Produces: result copy that distinguishes capture quality from measurement repeatability.

- [ ] **Step 1: Add failing UI tests** for the presence of `Capture quality`, `Measurement repeatability`, `Within-batch uncertainty`, and `Not a medical or laboratory measurement` copy.
- [ ] **Step 2: Run** `npm test` and verify failure.
- [ ] **Step 3: Update result rendering** so `90+` is described only as protocol quality, confidence intervals are explicitly within-batch repeatability ranges, and rejected batches show the actionable retry list.
- [ ] **Step 4: Run** `npm test` and confirm pass.
- [ ] **Step 5: Commit** as `feat: clarify precision result confidence`.

### Task 4: Android 16 / API 36 release hardening

**Files:**
- Modify: `chisel-android/android/variables.gradle`
- Modify: `chisel-android/android/build.gradle`
- Modify: `chisel-android/android/gradle/wrapper/gradle-wrapper.properties`
- Modify: `.github/workflows/android-mobile-build.yml`
- Modify: `chisel-android/android/app/src/main/AndroidManifest.xml`

**Interfaces:**
- Produces: an API-36-capable Android build using a compatible AGP/Gradle pair.

- [ ] **Step 1: Upgrade** compile/target SDK to 36.
- [ ] **Step 2: Upgrade** Android Gradle Plugin to 8.10.0 and Gradle wrapper to 8.11.1.
- [ ] **Step 3: Update CI** to install `platforms;android-36` and `build-tools;36.0.0`.
- [ ] **Step 4: Disable broad Android backup** for the appearance-tracking app by setting `android:allowBackup="false"` unless explicit scoped backup rules are introduced later.
- [ ] **Step 5: Push and verify** `Chisel Tests` and `Chisel Mobile Build` both succeed on `main`.
- [ ] **Step 6: Commit** as `build: prepare Chisel for Android 16`.

### Task 5: Release truth and premium documentation

**Files:**
- Modify: `docs/RELEASE_STATUS.md`
- Modify: `docs/FEATURE_MATRIX.md`
- Create: `docs/PREMIUM_FEATURES.md`

**Interfaces:**
- Produces: one accurate source of truth for what is implemented, what requires production credentials, and what remains device-validated vs automated-only.

- [ ] **Step 1: Remove stale claims** that CI is missing or the app is still planning-only.
- [ ] **Step 2: Record** the verified CI state, Precision Mode, premium UX, API 36 migration, and external RevenueCat/Play dependencies.
- [ ] **Step 3: Document** the Free vs Pro boundary: Precision Lab Pro, Progress Intelligence, Adaptive Protocols, Looks Studio Pro, Professional Export, and Private Vault Plus.
- [ ] **Step 4: Explicitly mark** photoreal cloud render quotas and production billing as externally configured features until keys/products are live.
- [ ] **Step 5: Commit** as `docs: refresh Chisel production feature truth`.

## Verification

Run from `chisel-android/`:

```bash
npm install --no-audit --no-fund
npx cap sync android
npm test
cd android
./gradlew assembleDebug bundleRelease --stacktrace
```

Expected: all Node tests pass; synchronized Android assets match `www`; debug APK and release AAB build successfully.
