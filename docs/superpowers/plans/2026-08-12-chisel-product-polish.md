# Chisel Product Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make every major Chisel surface feel like one premium, trustworthy product with clear feature access, conservative scan/result language, strong accessibility, and coherent daily-use flow.

**Architecture:** Keep `www/index.html` as the canonical shell. Add one focused `chisel-product-polish.js` runtime loaded after the existing Beauty, Labs, Precision, scan-guard, and experience-polish runtimes. The runtime only enhances presentation, discoverability, user guidance, and result trust; measurement math stays in the existing scan/Precision modules.

**Tech Stack:** Capacitor Android, vanilla HTML/CSS/JavaScript, Node test runner, GitHub Actions.

## Global Constraints

- Preserve the Onyx / ivory / restrained-gold visual language.
- Core analysis stays local-first and must never be described as clinical or medical-grade.
- Weak captures must be rejected rather than turned into confident-looking results.
- Men, women, non-binary and custom identities must all have a coherent experience.
- Existing working functions remain canonical; polish code may wrap or route to them but must not duplicate measurement engines.
- Respect reduced motion, large text, focus-visible and 44px minimum interactive targets.

---

### Task 1: Product-wide polish runtime

**Files:**
- Create: `chisel-android/www/chisel-product-polish.js`
- Create: `chisel-android/android/app/src/main/assets/public/chisel-product-polish.js`
- Modify: `chisel-android/www/chisel-ar-coach-core.js`
- Modify: `chisel-android/android/app/src/main/assets/public/chisel-ar-coach-core.js`
- Test: `chisel-android/tests/product-polish.test.cjs`

**Interfaces:**
- Consumes existing DOM ids: `view`, `scanHistory`, `camSheet`, `paywall`, `paywallOfferings`, `openStyle`, `openTrain`.
- Produces `window.ChiselProductPolish.install()`.

- [ ] Write tests requiring the runtime, runtime boot wiring, Android mirror parity, unisex copy, accessibility styles, Home action hub, Analyze trust strip, grooming improvement loop, empty-state messaging, and result trust header.
- [ ] Verify the tests fail before the runtime exists.
- [ ] Implement the runtime with isolated installer functions and idempotent DOM markers.
- [ ] Load it after `chisel-experience-polish.js` and explicitly call `ChiselProductPolish.install()` after dynamic load.
- [ ] Mirror the runtime into Android packaged assets.
- [ ] Run the full Node suite and Android build.

### Task 2: Screen-level CX polish

**Files:** same runtime and tests as Task 1.

- [ ] Home: inject a compact `Start here` hub for Scan, Try-on, Face Yoga and Routine/Grooming.
- [ ] Analyze: add Local / Multi-frame / Refuse weak scans trust strip and a short capture-quality explanation.
- [ ] Results: prepend `Photographic estimate` and capture-quality context without changing numeric measurement code.
- [ ] Groom: add the loop `choose one area -> follow routine -> mark complete -> compare later` so the app prioritizes actions over scores.
- [ ] Affirm/Meditate: replace gender-locked and looksmax slang in visible UI with unisex, calmer copy.
- [ ] Settings: add a compact privacy summary and make destructive actions visually distinct without alarmist copy.
- [ ] Paywall: keep billing claims honest while improving hierarchy, restore visibility and local-vs-cloud explanation.

### Task 3: Accessibility and state polish

**Files:** same runtime and tests as Task 1.

- [ ] Add `:focus-visible` treatment, touch-target floor, text wrapping and safe-area behavior.
- [ ] Respect `prefers-reduced-motion` across screen transitions, buttons and overlays.
- [ ] Add useful empty states to scan history / routines when the canonical renderer has no content.
- [ ] Ensure injected cards disappear or update when real content becomes available.
- [ ] Keep modal/camera layers above floating launchers.

### Task 4: Verification

- [ ] Run `npm test` and require zero failures.
- [ ] Confirm canonical and Android runtime copies are byte-for-byte equal.
- [ ] Confirm GitHub `Chisel Tests` succeeds on the final commit.
- [ ] Confirm `Chisel Mobile Build` passes Capacitor sync, tests, debug APK, release AAB and artifact upload.
- [ ] Report remaining physical-device-only validation separately from software verification.
