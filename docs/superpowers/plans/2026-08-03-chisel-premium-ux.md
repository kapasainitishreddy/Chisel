# Chisel Premium UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and package a premium, calm, mobile-first Chisel experience with simplified navigation, guided scanning, trust messaging and stronger accessibility.

**Architecture:** Add a self-contained CSS override layer and a DOM-enhancement JavaScript layer that sit above the existing static app, Labs and Precision modules. Keep canonical source in `chisel-android/www`, mirror it into Android packaged assets, and load it from `MainActivity` after existing dependencies.

**Tech Stack:** Static HTML/CSS/JavaScript, Capacitor 6, Android WebView, Node test runner.

## Global Constraints

- Preserve all existing features and existing storage keys.
- Do not upload photos, scans or measurements from the premium layer.
- Use four persistent mobile destinations: Home, Scan, Routine and More.
- Keep all primary controls at least 48 px high.
- Support Android safe areas, reduced motion, keyboard focus and large text.
- Reframe scores as tracking aids, never attractiveness rankings.

---

### Task 1: Premium UX Regression Contract

**Files:**
- Create: `chisel-android/tests/premium-ux.test.cjs`

**Interfaces:**
- Consumes: canonical and Android asset files.
- Produces: parity, injection, accessibility and privacy assertions.

- [x] **Step 1: Write failing tests for premium assets, four-tab navigation, guided scanning and native loader visibility.**
- [x] **Step 2: Open a draft PR so CI records the expected failure before implementation.**

### Task 2: Onyx Laboratory Visual Layer

**Files:**
- Create: `chisel-android/www/chisel-premium.css`
- Create: `chisel-android/android/app/src/main/assets/public/chisel-premium.css`

**Interfaces:**
- Consumes: existing Chisel, Labs and Precision class names.
- Produces: premium design tokens, mobile hierarchy, trust, journey, concierge and accessibility styles.

- [ ] **Step 1: Define restrained onyx, graphite, ivory and champagne tokens.**
- [ ] **Step 2: Restyle core cards, typography, buttons and spacing without deleting legacy rules.**
- [ ] **Step 3: Implement four-column safe-area navigation with an elevated Scan action.**
- [ ] **Step 4: Style command center, trust strip, scan journey, mode cards and progressive disclosure.**
- [ ] **Step 5: Polish Labs and Precision surfaces for sticky mobile actions and clearer hierarchy.**
- [ ] **Step 6: Add focus-visible, large-text, contrast and reduced-motion behavior.**
- [ ] **Step 7: Copy the exact CSS into Android packaged assets.**

### Task 3: Premium Customer Experience Layer

**Files:**
- Create: `chisel-android/www/chisel-premium.js`
- Create: `chisel-android/android/app/src/main/assets/public/chisel-premium.js`

**Interfaces:**
- Consumes: existing route anchors and button IDs (`openAnalyze`, `openDeep`, `openTrain`, `hintAnalyze`, `openFuture`, `openExport`).
- Produces: `simplifyMobileNavigation()`, `buildTrustStrip()`, `buildScanJourney()`, `buildConcierge()` and local-only UX enhancements.

- [ ] **Step 1: Add the premium body state and refine product copy.**
- [ ] **Step 2: Reduce mobile navigation to Home, Scan, Routine and More while retaining secondary routes elsewhere.**
- [ ] **Step 3: Build the Home trust strip and one-action command card from local scan state.**
- [ ] **Step 4: Build Prepare → Capture → Quality → Result stages and three scan mode cards.**
- [ ] **Step 5: Move advanced scan controls into a closed-by-default details panel.**
- [ ] **Step 6: Add a one-time local concierge with accessible dismiss and start actions.**
- [ ] **Step 7: Add subtle press/loading feedback and re-run enhancements when delayed modules mount.**
- [ ] **Step 8: Copy the exact JavaScript into Android packaged assets.**

### Task 4: Native Packaging and Build Repair

**Files:**
- Modify: `chisel-android/android/app/src/main/java/com/chisel/lookmax/MainActivity.java`
- Modify: `chisel-android/package.json`

**Interfaces:**
- Consumes: premium CSS and JavaScript assets.
- Produces: ordered native injection and a Capacitor-compatible Android activity.

- [ ] **Step 1: Inject premium CSS before premium JavaScript after existing feature modules.**
- [ ] **Step 2: Change `onResume()` from protected to public to match Capacitor 6.**
- [ ] **Step 3: Add `test:premium` for isolated regression runs.**

### Task 5: Verification and Merge

**Files:**
- Modify: PR description and state only.

**Interfaces:**
- Consumes: GitHub Actions test and Android build results.
- Produces: verified main-branch premium UX.

- [ ] **Step 1: Run the complete Node test suite and require zero failures.**
- [ ] **Step 2: Run Capacitor sync and verify canonical/package parity.**
- [ ] **Step 3: Build the debug APK and release AAB in GitHub Actions.**
- [ ] **Step 4: Inspect build warnings and ensure no critical compile errors remain.**
- [ ] **Step 5: Mark PR ready, merge to main and verify the merged commit status.**
