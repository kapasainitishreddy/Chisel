# Test Status

## Content-density checkpoint, 2026-09-10

Tested application revision: `84ca6b3e09d3f85e9998bfb534291e05fc4eb565`. CI merge checkout: `070b41c6c5ed1f0a550662a29ee2a268d850de9d`. Later documentation-only edits do not change application source.

`cd chisel-android && npm test`: **200/200 PASS**, zero failures or skips, in CI and rerun locally from the exact downloaded source. Five new content regressions failed against the preceding source and passed after the edit. Theme syntax and canonical/Android theme asset parity pass.

Chisel Quiet Studio QA #4 (34503567137) and Chisel Tests #268 (34503567174) succeeded. Reliability Evidence #9 (34503567139) succeeded on attempt 2; the first attempt failed before app checks because Chrome did not start within 30 seconds. No application assertion was weakened for the retry.

Rendered suites: studio 43/43, discovery 10/10, density 46/46. Each has zero uncaught page errors. Browser widths: 360/430/768/1280; density-specific assertions cover 360/430/1280. Checks include actual task discovery, trainer filters, expanded safety/help, real completion state, rerender behavior, file states and bounded default-visible copy. The interaction runner opens Quick tools before checking its controls rather than assuming secondary actions are always visible.

Local Playwright navigation was blocked. Rendered verification used GitHub Actions Chromium, not the user's physical phone. This is not empirical accuracy, successful skin measurement, live photorealistic-output, billing or signed Android-build validation.

See [full evidence and counts](CONTENT_DENSITY.md), [release boundaries](RELEASE_STATUS.md), and [older test history](history/2026-09-10-before-studio-TEST_STATUS.md).
