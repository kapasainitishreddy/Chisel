# Quiet Studio UI and UX

Updated 2026-09-10, draft PR #7, branch `feat/chisel-unisex-trainer-skin`. This is a presentation and interaction update, not a new measurement model or a production release.

## Design and implementation

Charcoal #101314, raised graphite #1b1f20, ivory #f4f3ed, champagne #e1d5bb and sage #b2d4c0. Editorial headings use Georgia; controls use the existing Inter/system stack. One scoped theme unifies typography, fields, buttons, navigation, panels and focus states. Main controls are at least 48 CSS pixels high and session filters at least 44. Four tested foreground/background token pairs exceed 4.5:1 contrast; that is not full accessibility certification.

- Home prioritizes Face & Neck Trainer and Skin Appearance shortcuts. Existing daily completion, reflection, habits, programs and settings handlers are retained.
- The six-session trainer has functional All, Cheeks, Posture and Release filters, keyboard support and movement counts derived from the real catalog. Guided and camera-checked movement labels remain separate.
- Skin presents comparable-photo preparation, real upload/analyze controls, unmeasured empty states, routine adjustment and capture-quality wording that is not an accuracy percentage.
- The existing Style catalog is moved into the visible Analyze route. Short/structured, long/layered, facial hair and makeup remain accessible to everyone with existing handlers intact.
- One Tools button in the shared in-flow header replaces competing floating Labs/Precision launchers. The concurrent shared-header correction is preserved, without adding another bottom dock. Dialog focus restoration avoids scrolling the Style destination away.
- Modal Escape, keyboard containment, background inertness, button states and reduced motion are supported. Measurement, persistence, consent and provider engines retain ownership.

## Verification and review

Local complete Node suite: 195/195 PASS. The additional discovery regression failed on the preceding implementation before being fixed. The theme JS/CSS and loader match Android packaged copies byte-for-byte. Syntax checks pass.

Initial browser review passed functional checks but screenshots exposed a hidden Style destination and an overlapping floating trigger. The shared-header correction and visible Style/Home refinements address those findings. Final browser assertions explicitly check a visible Style catalog at 360, 430, 768 and 1280 CSS-pixel widths rather than only checking the active route name.

The Chisel Quiet Studio QA workflow runs the full Node suite, the existing studio browser runner, and the additional discovery runner. It archives the full repository source, JSON reports and screenshots. Read the exact-head workflow result before claiming final CI success. Chisel Tests and Chisel Reliability Evidence must also remain green.

Local Playwright navigation was blocked by the environment. Rendered evidence is produced by GitHub Actions Chromium, not the user's physical Android handset. The earlier real local-image test rejected its fixture as too small/low-resolution; this proves a rejection path, not a successful accurate skin measurement.

## Acceptance boundaries

No clinical/reference accuracy, full accessibility conformance, photorealistic output, signed APK/AAB, production deployment, live billing or Play submission is certified by this UI change. Physical Android camera/HUD layout, large text, screen reader, normal-motion interaction and low-end performance remain acceptance work. HairFastGAN and the proposed external makeup/segmentation models were not imported or deployed. Preserve the accuracy and consent safeguards documented in ACCURACY_RELIABILITY.md.
