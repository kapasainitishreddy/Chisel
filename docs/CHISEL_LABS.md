# Chisel Labs

Chisel Labs adds the feature gaps requested on 2026-08-01 without changing the large legacy `www/index.html` file.

## Included

### Skin Recovery

- reads latest blemish, redness, oil and evenness values when available
- generates conservative morning/evening direction
- includes sensitive-skin pacing, patch-test wording and local check-offs
- routes persistent, painful, scarring or rapidly worsening concerns to professional support
- never presents itself as an acne diagnosis or cure

### Expression Calibration

- requires one neutral photo and one naturally open-mouth photo
- detects both 468-point face meshes locally
- aligns the neutral mesh to the open photo by eye scale/rotation/translation
- remaps lower-face landmarks before recalculating cheekbone width, jaw width and gonial angle
- displays observed and corrected landmark maps instead of pretending to change bone structure

### Lips & Color Lab

- reads existing Chisel `lipHex`, `skinHex` and undertone values
- can sample lip/skin colour from a new selfie
- ranks five undertone-compatible stain shades
- supports local virtual stain overlay and shade-history tracking

### Neck Care

- accepts posture angle, visible redness/evenness and shaving/sensitivity inputs
- can sample a visible neck region from a selfie
- creates sunscreen, moisturising, shaving-irritation and posture direction
- avoids medical diagnosis

### Body & Waist

- uses Pose Landmarker plus background-relative silhouette sampling
- reports waist-to-hip, shoulder-to-waist, torso tilt and confidence
- rejects low-confidence images
- creates a mild 0–12% illustrative canvas preview
- never labels body shape as attractive/unattractive and never promises a result

## Privacy

All five tools process images inside the Android WebView. Chisel Labs does not upload or persist selected photos. Progress summaries are stored in:

```text
chisel:enhancements:v1
```

The MediaPipe model files are loaded from public model/CDN URLs on first use. The image itself is not sent to those URLs.

## Android loading

`MainActivity.java` injects the following local assets in order:

1. `chisel-enhancements.css`
2. `chisel-enhancements-core.js`
3. `chisel-enhancements.js`

The script uses `window.__chiselLabsNativeInjected` and the UI uses `window.__chiselLabsBooted` to prevent duplicate loading after activity resume.

Canonical files live under `chisel-android/www/`. Copies under `android/app/src/main/assets/public/` exist so the checked-in Android project can load the module immediately. Running `npx cap sync android` will refresh those copies from `www/`.

## Verification

From `chisel-android/`:

```bash
npm test
node --check www/chisel-enhancements-core.js
node --check www/chisel-enhancements.js
```

Current automated result at implementation time: **15/15 passing**.

## Required real-device checks

Automated tests do not prove camera/model accuracy. Before release, test on multiple Android devices and skin tones with:

- neutral/open-mouth photos at matching and mismatched distances
- no-face and multiple-face images
- low light and backlight
- lipstick and facial hair
- neck cropped out / neck clearly visible
- loose clothing, dark background, patterned background and arms against torso
- low-memory WebView behavior
- offline launch after model caching
- rotation, app pause/resume and permission denial

## Remaining publishing blockers outside this feature

- run `npm install` and `npx cap sync android`
- build and sign a real AAB
- perform internal/closed Play testing
- migrate target/compile SDK as required by the release date
- validate all existing camera/MediaPipe flows on-device
- host and link the privacy policy
- finish Play Data safety, Health Apps, content-rating and camera declarations
- configure RevenueCat/Play billing and notifications if included in the release
