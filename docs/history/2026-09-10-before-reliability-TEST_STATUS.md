# Test Status

## Test framework
**Node built-in test runner + browser-rendered CI QA.** Chisel has focused
`node --test` coverage for native-shell boundaries, asset synchronization, precision
logic, release/security behavior, Face & Neck Trainer behavior, Skin Appearance
analysis and mobile UI regressions. GitHub Actions also uses Puppeteer/Chromium for
rendered interaction, generated-portrait and try-on visual QA. Jest/Vitest/Playwright
are not configured.

## Available test commands
- **Full automated source/logic suite** — from `chisel-android/`:
  ```bash
  npm test
  ```
- **Syntax gates** — the GitHub workflow runs `node --check` across the main feature
  runtimes, including `chisel-ar-coach-core.js`, `chisel-trainer-v2.js`,
  `chisel-skin-appearance-core.js`, `chisel-skin-appearance.js`, Precision,
  experience/product polish and the browser QA runners.
- **Rendered interaction QA** — CI serves the canonical `www` app in Chromium and
  runs `tests/interaction-qa-runner.mjs` at a 430×900 phone viewport with reduced
  motion enabled. It verifies navigation, action locking, trainer/skin installation,
  trainer touch targets, Skin Appearance hierarchy and unisex style-family labels.
- **Portrait/try-on visual QA** — CI renders the existing portrait and live try-on
  fixtures for both existing catalog fixture modes and uploads image/JSON evidence.

## Implementation verification snapshot — 2026-09-10
GitHub Actions **Chisel Tests #252** verified the trainer/skin implementation merge
candidate before the documentation-only status update:

- **Automated suite:** **PASS — 160/160**, 0 failures.
- **Production dependency audit:** `npm audit --omit=dev --audit-level=high` —
  **0 production vulnerabilities**.
- **Committed-secret pattern scan:** PASS.
- **Syntax gates:** PASS.
- **Rendered interaction QA:** PASS with no page errors.
- **Generated portrait QA:** male and female fixture jobs passed.
- **Try-on visual QA:** male and female fixture jobs passed.
- **Canonical ↔ Android runtime parity:** PASS for the new trainer and skin assets.

The full development/tooling dependency install still reports advisories in the broader
non-production graph. Do not describe the complete dependency graph as vulnerability-free;
the production-only audit is the clean gate recorded above.

### Rendered interaction checks now include
- `Face & Neck Trainer` installs and opens from the existing AR coach surface.
- Jaw & chin posture, Cheek activation, Full face + neck, Chin & neck support,
  Face & jaw release and Unisex Face Yoga are present.
- Trainer goal hierarchy is present and Camera verified vs Guided behavior is explicit.
- Every rendered trainer session control in the 430px phone viewport is at least 44px
  in both width and height.
- `Skin appearance scan` installs inside the existing Skin Recovery Lab.
- Skin result structure includes `What I see`, `What to do`, and `Compare next`.
- Normal skin-photo processing is labeled on-device.
- Try-on Studio shortcuts render as `Short / structured`, `Long / layered`,
  `Facial hair`, and `Makeup / color` rather than gender-restricted entry points.
- Existing home/navigation accessibility, polite live regions, reduced-motion behavior
  and double-activation guards remain green.

## Passing
- Full 160-test Node suite in the implementation verification snapshot.
- Browser-rendered interaction QA for the new trainer/skin/unisex presentation.
- Existing generated-portrait and visual try-on QA.
- Android asset synchronization tests.
- Production-only dependency audit and committed-secret scan.

## Failing
- None in the recorded implementation verification snapshot.

## Skipped / not established by software CI
- Real-device Skin Appearance photo capture across representative Android cameras,
  lighting, skin tones, makeup states and image compression levels.
- Empirical accuracy or clinical validity of redness/shine/texture/pore/blemish-like/
  pigment appearance signals. They remain cosmetic photographic signals, not diagnoses.
- Real-device acceptance of every new trainer session and form-score threshold.
- Claims that facial exercise reshapes adult bone or spot-reduces under-chin fat are
  intentionally excluded and are not test targets.
- Billing, notifications and production cloud-render runtime behavior.

## Regression tests added for the September 2026 trainer/skin upgrade
- Trainer catalog remains unisex and rejects clench/jut/bone-change/spot-fat-loss claims.
- Every exercise declares an evidence grade and whether tracking is `form` or `guided`.
- Cheek form scoring rewards centered symmetric form and returns corrective feedback.
- The legacy hold/rep state machine remains backward compatible while recording form
  score and clean reps.
- Skin Appearance exposes exactly six cautious cosmetic metrics, bounded 0–100 with
  bounded capture confidence.
- Synthetic redder imagery raises the redness-appearance signal and specular imagery
  raises visible-shine signal.
- Regional aggregation remains bounded and preserves forehead/left-cheek/right-cheek/chin
  results.
- Skin summary copy requires explicit non-diagnostic language and rejects affirmative
  disease/treatment claims.
- Trainer and Skin Appearance browser runtimes must parse, be loaded in the correct order,
  meet mobile/reduced-motion UI requirements and stay byte-identical in Android assets.
- User-facing hairstyle presentation must remain unisex while legacy internal catalog
  identifiers can remain for renderer compatibility.

## Earlier physical Android validation retained
- **Physical Android corrective UX validation:** `R3CW10Y67TT`, 2026-08-11. Final APK
  install, five-tab/system-nav bounds, Home Settings, jaw-first Analyze, Quick Scan,
  AR Jawline posture, visible jaw/cheek guides, facial-hair option grid and scrollable
  try-on tray were checked.
- **Physical Android AR validation:** `R3CW10Y67TT`, 2026-08-11. Home → Analyze → AR
  session picker → live Cheek lift camera flow, screenshots, UI-tree inspection and
  crash-buffer check passed. This proves the older AR path rendered and ran on this
  handset; it is not clinical or population-level efficacy/accuracy validation.
- **Physical Android shell/UI validation:** `R3CW10Y67TT`, 2026-08-09. Fresh install,
  Home → Analyze navigation, screenshots, UI-tree inspection and logcat checks passed.

## Current release blockers (testing-related)
- Physical-device acceptance of the new September Face & Neck Trainer sessions and
  Skin Appearance photo flow has not yet been executed.
- No representative empirical scan repeatability/ground-truth validation (APP-P2-007).
- Play internal-testing pass not yet run (requires the final signed AAB and developer keystore).
- Production RevenueCat/Replicate/Supabase acceptance remains a separate release gate.
