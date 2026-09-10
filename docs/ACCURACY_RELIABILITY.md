# Accuracy and realism: engineering status

Updated 2026-09-10 on `feat/chisel-unisex-trainer-skin` (draft PR #7).

## What this change actually improves

- AR form evaluation rejects incomplete, nonfinite and degenerate landmark data.
- Facial movement ratios use the camera's pixel aspect ratio rather than mixing differently normalized x/y coordinates.
- Holds accumulate only observed frames. Gaps longer than 350 ms, repeated frozen video timestamps and backgrounding reset the observed hold.
- Smile/jaw repetitions require an observed neutral release before re-arming. A held smile cannot produce repeated reps just because a timer elapsed.
- Guided posture holds are stored separately from camera-checked clean reps. The guided HUD says Setup only. Clean reps use the minimum form score over the observed hold, not just its final frame.
- Skin quality rejects actual channel clipping and unusable samples. It no longer penalizes low average brightness alone in the regional quality calculation. This removes one heuristic problem; it does not prove fairness across skin tones.
- Unusable regions say Not measured. Fewer than three usable regions cannot create a whole-face summary.
- Skin photo checks reject tiny, tilted, clipped, low-detail or multiple-face inputs. File selection is locked during analysis; model loading can retry after failure.
- Precision Face, Skin and Body quality checks reject missing/nonfinite measurements instead of using good-looking default values.
- The cloud try-on input uses the full camera frame, preserving aspect ratio, capped at 1536 pixels on the long edge without upscaling. The local guide and screen crop are not burned into the source image.
- A local quality check and explicit upload confirmation precede Generate/Retry. Cancellation, unavailable camera and offline state stop the normal button event before a provider request.

## Verification scope

Local full Node suite: **184/184 passing**, including 24 additional tests over the prior 160-test baseline. The first five new negative regressions failed against the old implementation before fixes. Eight modified/new canonical JavaScript modules are mirrored byte-for-byte into Android packaged assets. Syntax checks pass.

Local rendered-browser navigation was blocked by the execution environment with `net::ERR_BLOCKED_BY_ADMINISTRATOR`. No local screenshot or rendered-device success is claimed. The Chisel Reliability Evidence workflow runs the full suite plus a dedicated Chromium UI/preflight test and preserves exact tracked source, logs and screenshots. Consult the exact-head workflow result, not this document, for CI completion.

## Not established by these changes

No numerical accuracy percentage, clinical validation, skin-health diagnosis, muscle-growth measurement, targeted fat-loss measurement or adult-bone-change prediction is established. The six skin signals remain unvalidated photographic heuristics, with rectangular regional sampling rather than a newly integrated learned skin mask. Quality scores are engineering heuristics, not probabilities of correctness. Method-version tags mark the new skin-quality calculation.

No new HairFastGAN/OpenMakeupSDK/PSGAN/face-parsing/matting weights were imported or deployed. Local hair remains a placement guide. The existing optional cloud renderer still needs configured production credentials, licensing review of selected models, consent/retention review and real output QA. Better source capture is not proof that generated hair is realistic or that identity is preserved.

## Remaining acceptance work

1. On the exact Android build, verify actual exercise counts against human-labelled recordings, including dropped frames, low frame rates, head turns, partial occlusion and natural neutral expressions. Review the 350 ms/300 ms thresholds and movement ranges; they are not population-calibrated.
2. Measure test/retest error and reference error separately for each claimed face, posture, body and skin metric. Use held-out participants and multiple devices, lighting conditions, skin tones and facial-hair conditions. Report failed-capture rates too, not just successful scans.
3. For try-on, inspect real generated outputs for identity preservation, hairline blending, forehead/ear/glasses occlusion, colour consistency and reference-style fidelity. Keep AI images separate from measurement inputs and label them as visualizations.
4. Finish parent PR #6 production billing/rendering, signed Android build, device testing and Play release gates. Keep PR #7 draft until its acceptance requirements are met.
