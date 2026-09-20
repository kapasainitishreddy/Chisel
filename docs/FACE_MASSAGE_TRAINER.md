# Face Massage Trainer

Updated 2026-09-19 on `codex/full-face-massage-animated`, based on `feat/chisel-unisex-trainer-skin`.

## What changed

The Face & Neck Trainer remains the single trainer surface and state machine. It now adds:

- 20 massage movements covering forehead, brow, temple, eye area, cheeks, jaw, chin and side neck.
- Seven routines: Morning Refresh, Jaw Relax, De-Puff Routine, Face Reset, Full Face Massage, Evening Unwind and Screen-Time Face Reset.
- A Quick Face Reset alongside the existing Face Yoga and Jaw + Neck sessions.
- Compact Yoga / Massage / Jaw + Neck / Quick filtering and a short routine preview before camera launch.
- Inline SVG demonstrations for all existing face-yoga and new massage movements. The animation layer is intentionally small and independent from camera tracking.
- Lazy MediaPipe Hand Landmarker loading for massage sessions. It checks hand visibility, approximate region and movement direction only. If the model cannot load, the routine becomes Guided and continues with the illustrated instructions.
- Stroke/circle progression for hand-guided movements, a reachable Pause control, reduced-motion handling and a compact completion summary.

## Safety and privacy boundaries

The camera does not measure finger pressure, blood flow, lymph drainage, muscle activation, fat loss or skeletal change. Eye-area movements use very light-touch instructions. Neck movements avoid the front of the throat and sensitive structures. Existing stop conditions for pain, clicking, locking, dizziness, numbness or discomfort remain in the trainer.

Hand and face inference stays in the existing on-device camera flow. Raw camera frames are not uploaded by the trainer.

## Validation

- Focused trainer/massage Node suite: 23/23 passing.
- Full repository Node suite on this Windows runner: 267/278 passing. The 11 failures are the pre-existing Looks Studio ESM/path failures (`ERR_UNSUPPORTED_ESM_URL_SCHEME` and dependent “Catalog not implemented” failures); no trainer test failed.
- Browser-rendered QA could not be run in this workspace because the repository does not include the `puppeteer-core` dependency and the in-app browser blocks localhost navigation.
- No physical Android device, signed APK/AAB, empirical camera accuracy study, native Hand Landmarker model packaging, Rive/Lottie asset bundle, haptic validation or Play release was claimed.
