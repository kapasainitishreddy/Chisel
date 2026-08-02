# Chisel Precision Mode

Precision Mode is a strict, local-only measurement workflow for repeatable face, skin, lip, neck, posture and waist tracking.

## What 90+ means

A score of 90–100 means the **capture protocol** passed strict quality and cross-photo agreement gates. It is not a promise of 90–100% anatomical, medical or laboratory accuracy.

## Face and skin protocol

- Select 7–12 photos from one neutral-expression burst.
- Use the same front camera, distance, zoom, orientation and diffuse light.
- Remove makeup when tracking skin and disable beauty/portrait effects.
- Keep the face and upper neck unobstructed.
- An optional second 7–12-photo batch performs natural open-mouth expression remapping.

Chisel filters outliers and reports confidence intervals for cheekbone width, jaw width, gonial angle, lips, eyes, brows, bloat/fullness, redness, evenness, blemish signal and visible upper-neck skin.

## Body and waist protocol

- Select at least three front and three true side photos.
- Use the rear camera at waist height and 1× zoom.
- Wear fitted clothing; use a plain contrasting background; keep feet visible and arms away from the torso.
- Chisel uses Pose Landmarker Full plus person segmentation.
- Optional tape calibration converts future photo-perimeter changes into a personal relative centimetre trend.

## Progress rules

A scan is saved only when its quality score is at least 90. Progress is compared only when scan type, camera, aspect ratio, subject fill/distance and lighting are compatible. A change is shown only when it exceeds the combined confidence intervals and a practical-change floor; otherwise the result is “steady within measurement uncertainty.”

## Privacy

Photos are processed in the Android WebView and are not uploaded or stored by Precision Mode. Only accepted numeric summaries are stored under `chisel:precision:v2`.

## Remaining validation

Automated tests prove the calculations and rejection gates behave as designed. They do not prove real-world measurement accuracy. Before numerical marketing claims, validate on multiple Android devices, skin tones, body types and lighting setups against repeated tape/caliper measurements and expert-labelled skin photos.
