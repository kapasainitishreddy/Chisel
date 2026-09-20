# Test Status

## 2026-09-10 reliability checkpoint

`cd chisel-android && npm test`: **184/184 PASS locally**, zero failures or skips. The initial five new trainer regressions failed against the prior source before fixes. Later negative cases cover invalid skin captures/regions, missing Precision data, pixel-aspect invariance, native camera sizing, frozen video, backgrounding, offline requests and cancelled cloud-upload consent.

Syntax checks pass for modified JavaScript and the dedicated browser runner. Eight new/changed canonical `www` modules match their Android packaged copies byte-for-byte. Existing timer-only trainer tests now supply actual sequences of observed frames; their hold-duration and correction assertions remain.

Local Chromium navigation failed with `net::ERR_BLOCKED_BY_ADMINISTRATOR`. Therefore no local rendered-browser result is claimed. The new `Chisel Reliability Evidence` workflow preserves exact source and full Node output, and runs `tests/reliability-browser-runner.mjs` at mobile and desktop widths. It tests UI wiring and synthetic image-quality fixtures, not empirical measurement accuracy or generated hair quality. Read the exact-head run before asserting CI success.

No physical-device run, signed APK/AAB build, live cloud generation, billing test or representative accuracy study was performed by this update. See [remaining acceptance work](ACCURACY_RELIABILITY.md).

[Prior test evidence and historical device checks](history/2026-09-10-before-reliability-TEST_STATUS.md) are preserved separately and must not be reported as validation of the new thresholds.
