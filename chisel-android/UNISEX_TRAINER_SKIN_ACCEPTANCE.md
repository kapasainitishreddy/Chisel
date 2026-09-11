# Unisex Trainer + Skin Appearance Device Acceptance

This checklist is intentionally device-focused. Automated and browser-rendered tests prove software behavior; they do not establish facial-change efficacy, clinical skin validity, or population-level camera accuracy.

## Face & Neck Trainer

- Install the exact branch build on at least one current Samsung/Pixel-class Android phone.
- Open Home → Face Yoga / Analyze → Face & Neck Trainer.
- Verify all visible session names are goal-based and unisex.
- Run Jaw & chin posture, Cheek activation, Chin & neck support, Face & jaw release, Full face + neck and Unisex Face Yoga.
- Confirm camera-verifiable exercises pause or correct for off-center/tilted/asymmetric form.
- Confirm guided exercises are labeled Guided and do not imply that the camera measured muscle or bone change.
- Confirm form score, phase rail and clean-rep counters update without covering the face guide.
- Confirm Stop remains reachable with large text/display scaling and at narrow width.
- Stop immediately if any test movement causes pain, clicking, locking, numbness or dizziness; Chisel must preserve this safety language.

## Skin Appearance Lab

- Open Chisel Labs → Skin Recovery → Skin appearance scan.
- Try a clear front-facing JPEG/PNG/WebP in soft even light.
- Confirm forehead, left cheek, right cheek and chin regions map to the visible face.
- Confirm the six outputs are presented as cosmetic appearance signals: redness appearance, visible shine, texture variation, pore visibility proxy, blemish-like contrast and pigment appearance unevenness.
- Confirm the result hierarchy is What I see → What to do → Compare next.
- Confirm capture confidence is described as photo/sample quality rather than medical or diagnostic accuracy.
- Try a face that is too small, no-face photo, dark/overexposed photo and beauty-filtered photo; weak conditions should fail or warn instead of forcing a confident result.
- Confirm normal photo pixels are not persisted or uploaded and that only bounded numeric history is stored locally.
- Repeat with matched lighting/distance to judge within-user repeatability before publishing stronger numeric-accuracy claims.

## Style presentation

- Confirm Try-on Studio entry points read Short / structured, Long / layered, Facial hair and Makeup / color.
- Confirm every style family remains available regardless of the optional identity-personalization setting.

## Release gate

Do not merge this feature branch for store release until the new trainer sessions and Skin Appearance photo flow pass this physical-device acceptance checklist. Do not market the trainer as adult-bone reshaping or targeted under-chin fat loss, and do not market skin signals as diagnoses or measurements of skin health.
