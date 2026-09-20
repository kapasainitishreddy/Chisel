# Quiet Studio visual review

2026-09-10, draft PR #7.

The premium theme was introduced at 43698405. Its exact-source Quiet Studio browser run 34496368413 passed 39 checks at 360, 430, 768 and 1280 CSS-pixel widths. Actual screenshots were reviewed for typography, button geometry, palette, grouping and navigation.

The review identified a remaining defect: the fixed Chisel tools trigger overlaps the daily action area on the 430-pixel Home screen. This follow-up moves the existing trigger into the shared masthead in main.view, changes the visible label to Tools, and removes its fixed positioning and horizontal transform. It remains available on every primary route without an extra floating overlay. The existing dialog and destination handlers are preserved.

A new regression failed against the old code and passed after the fix. Local theme/header tests: 9/9 pass. Canonical and packaged Android CSS/JS files have matching blob hashes. Browser coverage now checks header ownership, target dimensions, available width and separation from the daily action at all four viewport widths. Consult the exact-head Chisel Quiet Studio QA workflow for the final rendered result.

Local Playwright navigation failed with net::ERR_BLOCKED_BY_ADMINISTRATOR. Browser verification is performed in GitHub Actions Chromium, not on a physical Android handset. No measurement algorithms, quality thresholds, cloud-provider behavior, credentials, billing or release-signing settings are changed by this layout fix. The existing experimental-skin and guided-versus-camera-checked boundaries remain in place. The theme is not empirical accuracy validation.
