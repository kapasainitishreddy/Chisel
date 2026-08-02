# Chisel Precision Mode Design

## Goal
Raise Chisel's repeatability under a controlled phone-camera protocol toward a 9/10 product-quality target without presenting selfie-derived estimates as medical, laboratory or perfect measurements.

## Truthful definition
A 90–100 score is a capture protocol quality score. It means a multi-photo batch passed strict gates for lighting, blur, framing, pose, model confidence, segmentation confidence, expression, occlusion, agreement and uncertainty. It does not mean 90–100% anatomical accuracy.

## Architecture
- `chisel-precision-stats.js`: robust median/MAD fusion, confidence intervals and compatible-progress comparison.
- `chisel-precision-protocol.js`: strict per-photo and batch gates.
- `chisel-precision-core.js`: face, skin, open-mouth and front/side body fusion.
- `chisel-precision-face.js`: local Face Landmarker analysis and colour sampling.
- `chisel-precision-body.js`: Pose Landmarker Full plus segmentation-mask analysis.
- `chisel-precision-ui.js` and `chisel-precision.js`: opt-in workflows, local storage and rejection explanations.

## Acceptance
Only batches scoring at least 90 are saved. Weak evidence returns no result. Selected photos are neither uploaded nor persisted. Progress is shown only when setup fingerprints are compatible and change exceeds combined uncertainty.
