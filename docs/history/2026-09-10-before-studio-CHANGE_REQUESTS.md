# Change Requests

## CR: Improve accuracy, reliability and try-on realism (2026-09-10)

User approved implementation, continuing draft PR #7. The delivered engineering slice covers fresh-frame AR holds, neutral-release rep counting, finite/aspect-aware geometry, separate guided progress, skin/Precision invalid-data rejection, full-camera-frame try-on input and explicit upload consent. It does not deliver empirical validation of every feature or new photoreal model deployment.

Verification: 184/184 local Node tests, syntax and eight-module Android asset parity. Exact-head CI/browser results are recorded by workflows. Local browser navigation was blocked. Physical-device, reference-data and actual generated-output acceptance remain open.

See [complete scope and remaining work](ACCURACY_RELIABILITY.md). [All prior change requests](history/2026-09-10-before-reliability-CHANGE_REQUESTS.md) remain preserved; this checkpoint does not mark their unrelated release gates complete.
