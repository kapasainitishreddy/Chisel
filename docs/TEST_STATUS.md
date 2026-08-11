# Test Status

## Test framework
**Node built-in test runner.** The single-file Capacitor app has a focused
`node --test` suite for native-shell boundaries, asset synchronization, precision
logic, and mobile UI regressions. Jest/Vitest/Playwright are not configured.

## Available test commands
- **Web verification (agreed proxy for "tests")** — Node syntax + sandbox check of
  the two `<script>` blocks in `index.html`. Run from repo root:
  ```bash
  node -e '
  const fs=require("fs"),vm=require("vm");
  const html=fs.readFileSync("chisel-android/www/index.html","utf8");
  const blocks=[...html.matchAll(/<script(?:\s+type="module")?>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
  let ok=true; blocks.forEach((b,i)=>{try{new vm.Script(b)}catch(e){ok=false;console.log("SYNTAX ERR "+i+":",e.message)}});
  console.log("syntax:", ok?"OK":"FAIL", "("+blocks.length+" blocks)");
  '
  ```
  A fuller variant (used this session) also runs the main block in a stubbed-DOM
  `vm` context and asserts that every top-level function **defines at load** (catches
  runtime-at-parse errors). See prior session notes / `git log` for the harness.
- **`tools.html`** — same syntax check on its single module script.
- **JSON config** — `node -e "JSON.parse(require('fs').readFileSync('chisel-android/capacitor.config.json'))"`.

## Last execution
- **Timestamp:** 2026-08-11
- **Web syntax + sandbox (`index.html`):** **PASS** — both `<script>` blocks parse;
  all functions define at load in the stubbed-DOM sandbox (including this session's
  camera-consent and data-wipe additions).
- **`capacitor.config.json`:** parses; `webContentsDebuggingEnabled: false` confirmed.
- **Automated suite (`npm test`):** **PASS** -- **50/50** tests.
- **Capacitor sync:** `npx cap sync android` passed and Android assets were re-synced to match `www/index.html`.
- **On-device shell/UI check:** fresh debug APK installed and launched on device
  `R3CW10Y67TT`; Home and Analyze were captured on-screen. No Labs launcher,
  injected Precision shell, or legacy Premium shell was present; the six main
  tabs fit the handset with glyphs and labels.
- **On-device AR coach check:** Analyze → AR Jaw & Cheek Coach → Cheek lift ran
  with the real front camera and MediaPipe landmarks. Jaw contour, cheek paths,
  target dots, center line, correction banner, evidence label, rep/progress HUD
  and Stop control all rendered within the phone viewport. Android's crash
  buffer was empty after the run.

## Passing
- Web syntax + sandbox check (as above).

## Failing
- None currently.

## Skipped
- Empirical scan accuracy/repeatability, billing, notifications, and cloud-render
  runtime behavior remain outside this focused AR shell/UI check.

## Untested critical flows (need a device or emulator)
- Quick/deep scan metric repeatability against reference measurements across
  representative devices, lighting, skin tones, facial hair and eyewear.
- Photoreal render round-trip (Replicate) and the free-limit → paywall flow.
- RevenueCat purchase/restore and entitlement gating.
- Local notification scheduling/delivery.
- Web Share (progress card, export sheet) and file downloads.
- Fresh-install/uninstall data behavior, permission denial/recovery, and offline behavior.

## Regression tests added
- Native activity must not inject legacy Labs/Premium/Precision UI.
- Canonical mobile navigation must retain six compact glyph-and-label tabs.
- AR coach catalog excludes forceful jaw jut/clench movements and retains safety/evidence copy.
- AR form holds fail closed on missing/poor landmarks and reset when form is lost.
- AR session picker/HUD/core engine must be present, mobile-safe and syntax-valid.

## Emulator / device validation
- **Physical Android AR validation performed:** `R3CW10Y67TT`, 2026-08-11.
  Upgrade install, Home → Analyze → AR session picker → live Cheek lift camera
  flow, screenshots, UI-tree inspection and crash-buffer check passed. This
  proves the AR flow/rendering works on this handset; it is not a clinical or
  population-level efficacy/accuracy validation.
- **Physical Android shell/UI validation performed:** `R3CW10Y67TT`, 2026-08-09.
  Fresh install, Home → Analyze navigation, screenshots, UI-tree inspection and
  logcat checks passed. This was not a full camera or accuracy-validation pass.

## Current release blockers (testing-related)
- No automated smoke test guarding the single-file app against regressions (APP-P2-001).
- No full on-device validation of core scan/camera flows (repro steps for final
  camera UX verification still require your side to run and confirm on physical phone).
- Play internal-testing pass not yet run (needs a built AAB → APP-P0-001, keystore).
