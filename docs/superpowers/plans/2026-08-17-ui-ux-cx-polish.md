# Chisel UI/UX/CX Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Chisel navigation, touch interactions, motion, and accessibility feel deliberate and easy to control without changing analysis logic or product scope.

**Architecture:** Extend the existing `ChiselProductPolish` runtime instead of adding another UI layer. Keep route behavior canonical in `window.go`; the polish wrapper adds only semantic current-route state and a short enter animation. Add idempotent accessibility/live-region installers and a per-button busy lock for Home quick actions. Mirror the runtime into packaged Android assets and validate with the existing Node/CI suite.

**Tech Stack:** Capacitor 6, vanilla HTML/CSS/JavaScript, Node 22 built-in test runner, GitHub Actions.

## Global Constraints

- Preserve the Onyx / ivory / restrained-gold visual language.
- Do not change scan math, camera quality gates, evidence grades, privacy behavior, billing semantics, or anti-rating copy.
- No new dependencies, permissions, analytics, accounts, or tracking.
- Respect `prefers-reduced-motion` and the existing 44px touch-target floor.
- Source and Android packaged copies must remain byte-for-byte identical.
- Browser/physical-device validation must be reported separately when unavailable.

---

### Task 1: Define failing interaction-polish regressions

**Files:**
- Modify: `chisel-android/tests/product-polish.test.cjs`

**Interfaces:**
- Consumes: `www/chisel-product-polish.js` as text and CommonJS module.
- Produces: regression expectations for motion, current-route semantics, accessible labels, live regions, and quick-action locking.

- [ ] **Step 1: Add a failing route-motion/current-route test**

```js
test('route polish keeps current navigation semantic and motion reduced-motion safe', () => {
  const js = read('www/chisel-product-polish.js');
  assert.match(js, /aria-current/);
  assert.match(js, /cxp-entering/);
  assert.match(js, /@keyframes\s+cxpScreenIn/);
  assert.match(js, /prefers-reduced-motion/);
  assert.match(js, /__cxpWrapped/);
});
```

- [ ] **Step 2: Add a failing accessibility/live-region test**

```js
test('controls get useful names and toast status is announced politely', () => {
  const js = read('www/chisel-product-polish.js');
  assert.match(js, /Switch camera/);
  assert.match(js, /Capture photo/);
  assert.match(js, /aria-live/);
  assert.match(js, /polite/);
  assert.doesNotMatch(js, /aria-label[^\n]{0,80}Activate/);
});
```

- [ ] **Step 3: Add a failing quick-action lock test**

```js
test('home quick actions guard against accidental double activation', () => {
  const js = read('www/chisel-product-polish.js');
  assert.match(js, /aria-busy/);
  assert.match(js, /lockAction/);
  assert.match(js, /disabled\s*=\s*true/);
  assert.match(js, /data-cxp-action/);
});
```

- [ ] **Step 4: Verify RED in CI**

Commit only the test changes and open the pull request. Expected: `Chisel Tests` fails because `aria-current`, `cxp-entering`, named camera labels, polite live-region semantics, and `lockAction` do not yet exist in the product-polish runtime.

- [ ] **Step 5: Commit**

```bash
git add chisel-android/tests/product-polish.test.cjs
git commit -m "test: define Chisel interaction polish regressions"
```

---

### Task 2: Implement semantic navigation and smooth route entry

**Files:**
- Modify: `chisel-android/www/chisel-product-polish.js`
- Modify: `chisel-android/android/app/src/main/assets/public/chisel-product-polish.js`

**Interfaces:**
- Produces: `syncNavigationState(screen)`, `animateScreenEntry(screen)`, `installRoutePolish()`.
- Keeps: `route(screen)` as the public helper and `window.go` as canonical navigation behavior.

- [ ] **Step 1: Add presentation-only motion CSS**

Add:

```css
.cxp-entering{animation:cxpScreenIn .18s cubic-bezier(.2,.7,.2,1) both}
@keyframes cxpScreenIn{from{opacity:.72;transform:translateY(5px)}to{opacity:1;transform:none}}
.btn,.cxp-action,.cx-studio-btn,.ar-session,.camctrl,nav.tabs [data-route]{transition:opacity .14s ease,border-color .18s ease,background-color .18s ease,box-shadow .18s ease}
.btn:not(:disabled):active,.cxp-action:not(:disabled):active,.cx-studio-btn:not(:disabled):active,.ar-session:not(:disabled):active,.camctrl:not(:disabled):active,nav.tabs [data-route]:active{opacity:.72}
```

The existing reduced-motion rule must collapse this animation/transition to effectively zero duration.

- [ ] **Step 2: Add current-route synchronization**

Implement `syncNavigationState(screen)` to set `aria-current="page"` only on `[data-route]` controls whose route equals the active screen and remove it from all others.

- [ ] **Step 3: Wrap the canonical router once**

Implement `installRoutePolish()` so it marks the wrapper with `__cxpWrapped`, calls the original `window.go` synchronously, then schedules `animateScreenEntry(screen)` and `syncNavigationState(screen)` without changing return values or camera teardown behavior.

- [ ] **Step 4: Mirror source to Android packaged assets**

The two `chisel-product-polish.js` files must be byte-for-byte equal.

- [ ] **Step 5: Verify GREEN for the focused product-polish test and then full suite**

Run:

```bash
node --test tests/product-polish.test.cjs
npm test
```

Expected: focused test passes; full suite has zero failures.

---

### Task 3: Improve control names, status announcements, and double-tap safety

**Files:**
- Modify: `chisel-android/www/chisel-product-polish.js`
- Modify: `chisel-android/android/app/src/main/assets/public/chisel-product-polish.js`
- Test: `chisel-android/tests/product-polish.test.cjs`

**Interfaces:**
- Produces: `controlLabel(el)`, `enhanceControlSemantics()`, `installLiveRegions()`, `lockAction(button, duration)`.

- [ ] **Step 1: Implement specific accessible naming**

`controlLabel(el)` must preserve an existing label, otherwise use trimmed visible text, then known icon mappings including `camFlip -> Switch camera`, `camShot -> Capture photo`, and `.x`/IDs ending `X -> Close`.

`enhanceControlSemantics()` applies labels only when useful and sets an accessible label on the primary nav when needed. It must not write the generic label `Activate`.

- [ ] **Step 2: Install a polite toast live region**

Set the existing toast element, when present, to `role="status"`, `aria-live="polite"`, and `aria-atomic="true"`. Do not make frame-by-frame camera guidance a live region.

- [ ] **Step 3: Add a per-control busy lock**

`lockAction(button, duration=650)` records whether the control was already disabled, sets `disabled=true` and `aria-busy=true`, replaces any prior Chisel lock timer, then restores only state created by the lock. Apply it at the start of Home quick-action handling before route/camera launch work.

- [ ] **Step 4: Mirror source to Android packaged assets**

Keep both runtime copies identical.

- [ ] **Step 5: Run focused and full tests**

```bash
node --test tests/product-polish.test.cjs
npm test
```

Expected: all tests pass.

---

### Task 4: Update handoff evidence and run repository verification

**Files:**
- Modify: `docs/AI_HANDOFF.md`
- Modify: `docs/FEATURE_MATRIX.md`
- Modify: `docs/TEST_STATUS.md`
- Modify: `docs/RELEASE_STATUS.md`
- Modify: `docs/CHANGE_REQUESTS.md`

**Interfaces:**
- Records one new verified change request for UI/UX/CX interaction polish.

- [ ] **Step 1: Record the user-visible changes and exact verification evidence**

Document semantic active-route state, route-entry motion, reduced-motion handling, useful control labels, polite toast announcements, and quick-action double-tap protection.

- [ ] **Step 2: Confirm the final diff is scoped**

Expected changed implementation surface: product-polish source + Android mirror, one regression test, design/plan docs, and required handoff/status docs. No analysis/calibration code changes.

- [ ] **Step 3: Run pull-request CI**

Require `Chisel Tests` to run the full Node suite and its browser-controlled try-on/portrait QA. Require the Android mobile workflow to complete sync/build gates when triggered.

- [ ] **Step 4: Merge only after verification supports it**

If CI is green, merge the feature branch to `main` with a normal non-force merge. If a check exposes a real regression, fix it on the branch and rerun verification before merging.