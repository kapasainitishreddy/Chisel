# Chisel Labs Missing Features Design

**Date:** 2026-08-01  
**Repository:** `kapasainitishreddy/Chisel`  
**Target:** Android Capacitor app

## Goal

Add the capabilities missing from Chisel's existing face-analysis stack without turning the app into a medical-diagnosis product, an attractiveness rater, or a deceptive body-transformation generator.

## Scope

The feature set is delivered as **Chisel Labs**, an isolated local-only module with five tools:

1. **Skin Recovery** — converts the latest Chisel blemish, redness, oil and evenness readings into a conservative AM/PM routine, product-introduction guardrails, local adherence checks and escalation advice.
2. **Expression Calibration** — accepts a neutral photo and an open-mouth photo, detects both face meshes, aligns them by the eye axis, remaps lower-face landmarks toward the neutral reference and reports corrected cheekbone width, jaw width and gonial angle.
3. **Lips & Color Lab** — reads existing Chisel lip/skin colours or samples them from a selfie, ranks five undertone-compatible lip stains and renders an approximate local overlay.
4. **Neck Care** — combines posture angle, optional visible neck redness/evenness sampling, shaving habits and sensitivity into cosmetic neck-care direction.
5. **Body & Waist** — detects a full-body pose, samples shoulder/waist/hip silhouette edges, reports non-ranking proportions and torso tilt, and renders a mild illustrative waist preview capped at 12%.

## Architecture

### Canonical web assets

- `chisel-android/www/chisel-enhancements-core.js` contains pure, testable algorithms and copy generation.
- `chisel-android/www/chisel-enhancements.js` owns UI, local state, image loading, MediaPipe integration and canvas rendering.
- `chisel-android/www/chisel-enhancements.css` owns the premium onyx/gold responsive UI.

The existing `www/index.html` remains untouched because it is already a large single-file application. Android loads the module through a small idempotent injector in `MainActivity.java`. This avoids increasing coupling in the legacy file and survives future `npx cap sync android` runs because the canonical assets live under `www/`.

### Android packaging

The same three assets are committed under `android/app/src/main/assets/public/` so the current Android project can load them before the next Capacitor sync. A regression test requires the Android copies to exactly match the canonical `www/` copies.

### On-device inference

- Face analysis: MediaPipe Face Landmarker 0.10.20, IMAGE mode.
- Body analysis: MediaPipe Pose Landmarker Lite 0.10.20, IMAGE mode.
- Image data remains inside the WebView for all five tools.
- Models are loaded from the same public MediaPipe delivery pattern already used by Chisel; first use requires network access unless cached.

## Data Model

All new progress data uses a single localStorage record:

```text
chisel:enhancements:v1
```

Stored categories:

- skin routine checks and history
- expression-calibration history
- selected lip shades
- neck-care inputs/history
- body ratio history
- non-sensitive module settings

No image is persisted by Chisel Labs. Uploaded images are decoded into memory, processed locally and released.

## Measurement Rules

### Expression correction

The neutral and open-mouth meshes are aligned using inter-eye scale, rotation and translation. Lower-face landmarks receive stronger neutral-reference weighting than upper-face landmarks. The result is explicitly a corrected landmark estimate, not a claim that bone structure was changed.

### Skin guidance

The module may mention common over-the-counter cosmetic actives with patch-test and irritation warnings. It must never claim to cure acne or diagnose a condition. Painful, scarring, widespread or persistent concerns route to professional assessment.

### Neck scan

Visible colour/evenness sampling is limited to a rectangular region below the chin when the neck is visible. It is sensitive to lighting and is never described as diagnosis.

### Waist geometry

Pose landmarks locate the torso. Background-relative row sampling estimates silhouette edges at shoulder, waist and hip levels. Low-confidence or implausible geometry is rejected instead of shown. Clothing, camera angle, lens distance and background limitations are disclosed.

### Transformation preview

The preview performs a bounded horizontal canvas remap strongest at the waist and zero at shoulder/hip boundaries. Maximum strength is 12%. The UI labels it illustrative and never predictive.

## UX

A floating **Labs** control opens a full-screen accessible modal. Desktop uses a two-column navigation rail; mobile uses a horizontally scrollable module selector. The modal includes:

- visible keyboard focus
- Escape and close-button dismissal
- 44px+ touch targets
- reduced-motion support
- local-only and non-medical disclosure at the top
- per-operation status and error messages
- no attractiveness score, ranking or social leaderboard

## Error Handling

- Missing photos produce actionable validation text.
- Face/pose detection failure asks for a clearer pose or image.
- Low silhouette confidence blocks ratios and preview.
- GPU model creation falls back to CPU.
- Corrupt local state resets to a versioned empty record.
- localStorage quota errors do not prevent the current session from working.

## Testing

Node's built-in test runner covers:

- skin-plan escalation and claim safety
- expression correction direction and bounds
- lip undertone ranking
- neck-care composition
- waist metrics and preview bounds
- non-guaranteed body-plan language
- module catalog and accessible modal contract
- local state recovery
- clean-source preview behavior
- native injection order/idempotence
- canonical/Android asset checksum equality

A Java stub compile validates the `MainActivity` override and WebView injection syntax. Real camera/model accuracy still requires an Android device or emulator.

## Publishing Impact

This design closes the requested feature gaps, but it does not by itself make Chisel production-ready. A release still requires Capacitor sync, a signed AAB, API 36 migration before the applicable Play deadline, internal testing, real-device camera/model validation, hosted privacy policy, Play declarations, and completion of billing/notification setup if those features remain in the release.
