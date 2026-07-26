# Test Status

## Test framework
**None.** This is a single-file, no-bundler Capacitor app; no Jest/Vitest/Playwright
is configured, and there are no unit/integration suites. This is an accepted state
for the project so far — see APP-P2-001 to add a smoke test + CI.

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
- **Timestamp:** 2026-07-26
- **Web syntax + sandbox (`index.html`):** **PASS** — both `<script>` blocks parse;
  all functions define at load in the stubbed-DOM sandbox (including this session's
  camera-consent and data-wipe additions).
- **`capacitor.config.json`:** parses; `webContentsDebuggingEnabled: false` confirmed.

## Passing
- Web syntax + sandbox check (as above).

## Failing
- None currently.

## Skipped
- All device/runtime behavior — not executable in this environment.

## Untested critical flows (need a device or emulator)
- Live camera scan + MediaPipe FaceLandmarker/PoseLandmarker inference and the
  derived metrics (jaw/cheekbone/angle/skin) — never run on-device here.
- Photoreal render round-trip (Replicate) and the free-limit → paywall flow.
- RevenueCat purchase/restore and entitlement gating.
- Local notification scheduling/delivery.
- Web Share (progress card, export sheet) and file downloads.
- Android install/upgrade/uninstall, permission grant/deny, offline behavior.

## Regression tests added
- None (no framework). Manual verification only.

## Emulator / device validation
- **Not performed in this environment.** Requires JDK 17 + Android SDK 35 + a device/emulator.

## Current release blockers (testing-related)
- No automated smoke test guarding the single-file app against regressions (APP-P2-001).
- No on-device validation of the core scan/camera flows.
- Play internal-testing pass not yet run (needs a built AAB → APP-P0-001, keystore).
