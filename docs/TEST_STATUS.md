# Test Status

## Quiet Studio checkpoint, 2026-09-10

`cd chisel-android && npm test`: **195/195 PASS locally**, zero failures or skips. This includes the prior 185-test reliability baseline, eight theme tests, the shared-header regression and the visible Style/Home discovery regression. The latter failed against the preceding source before the fix.

Syntax checks pass for the theme and discovery runner. Theme JS/CSS and the loader are byte-identical to packaged Android copies. Existing measurement and consent safeguards remain unchanged.

The exact-head Chisel Quiet Studio QA runs studio-browser-runner.mjs and studio-discovery-browser.mjs in Chromium. It exercises real UI controls, session filters, keyboard navigation, routine building, explicit daily completion, photo file selection/rejection and visible Style discovery at 360/430/768/1280 widths. Read its report and screenshots before asserting final success. Chisel Tests and Chisel Reliability Evidence remain required.

Local Playwright navigation is blocked by the execution environment. CI browser results are not physical Android results. The earlier skin fixture was rejected as too small/low-resolution, not successfully measured. No accuracy study, live photoreal rendering, billing test or signed APK/AAB is claimed.

See [UI acceptance boundaries](STUDIO_UI_STATUS.md) and [prior test status](history/2026-09-10-before-studio-TEST_STATUS.md).
