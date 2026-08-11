# AR Jaw & Cheek Coach Design

## Goal

Add an on-device augmented-reality coaching experience that helps users practice
safe facial muscle control and head/neck posture. The feature must not claim to
reshape adult cheekbones or jaw bone, spot-reduce facial fat, or provide medical
treatment.

## User Experience

The Analyze screen replaces the current “Jawline training” entry with “AR Jaw &
Cheek Coach.” Opening it presents a compact session picker with three options:

- Jawline Posture: chin tuck, neck-length alignment, and relaxed jaw position.
- Cheek Lift: controlled cheek raise and relaxed smile holds.
- Full Face: a balanced sequence containing both groups.

After selection, the existing full-screen front-camera experience opens. A
mobile-safe lower coach panel shows the exercise name, evidence grade, concise
cue, repetition progress, and a large stop control. The camera canvas adds a
live jaw contour, cheek target arcs, and a vertical alignment guide. The guide
is gold while the user is finding position and green while form is accepted.
The hold timer advances only while the detected form remains valid.

When the face is missing or alignment is outside the accepted range, the timer
pauses and the coach gives one corrective instruction. Between repetitions the
UI explicitly asks the user to relax. Completion records one local session,
updates the streak, and displays a calm completion summary without a beauty or
attractiveness score.

## Exercise and Safety Model

The feature removes forceful clenching and jaw-jutting from the current routine.
The initial exercise catalog is:

- Chin tuck: neutral frontal alignment followed by a small backward chin glide.
- Neck length: level eyes, relaxed shoulders, and a tall neutral head position.
- Cheek raise: symmetrical upward mouth-corner and cheek movement.
- Relaxed smile hold: gentle symmetric smile without jaw clenching.

Each exercise includes a maximum hold, repetition count, evidence label, and a
short safety cue. Facial-exercise appearance claims are labeled Limited. Posture
practice is described as alignment training, not as guaranteed jaw reshaping.

The pre-session panel and camera coach state:

- Exercises do not reshape adult facial bones or spot-reduce fat.
- Keep the jaw relaxed; never force range or clench.
- Stop for pain, clicking, locking, dizziness, numbness, or discomfort.
- Seek a qualified clinician for persistent jaw symptoms.

## Architecture

The feature extends the existing single `meshLoop()` and `trainMode` flow rather
than adding a second camera or overlay stack.

Pure geometry helpers derive normalized signals from MediaPipe landmarks:

- frontal pose and eye-line alignment;
- normalized mouth-corner lift;
- left/right smile symmetry;
- mouth openness to reject clenching-like or open-mouth form;
- chin/neck alignment proxies where supported by the visible face geometry.

The session engine consumes those signals and returns one of three states:
`find`, `hold`, or `rest`, plus a correction message and progress. Rendering is
separate: it draws AR guides from the current landmarks and updates the existing
camera overlay. This boundary keeps geometry and session progression testable
without a camera.

No network request, photo upload, account, or new permission is introduced.
Progress continues to use the existing `chisel:` local-storage wrapper.

## Error Handling

- Camera denial or engine failure uses the existing close-and-recover path.
- Face loss pauses the timer; it never awards a repetition from elapsed time.
- Unsupported or unstable landmark signals fall back to neutral alignment cues.
- Backgrounding, route changes, or Stop always call the shared camera teardown.
- Completion timeouts are cleared during teardown so the coach cannot remain on
  top of another screen.

## Accessibility and Mobile UI

- Controls have at least 44px targets and explicit accessible labels.
- Instructions are short, high contrast, and never depend on color alone.
- The coach panel respects Android safe-area insets and does not cover Stop.
- Reduced-motion preference removes celebratory/guide animation.
- Haptic feedback is optional and only used for accepted reps when supported.

## Verification

Automated tests cover the exercise catalog, safety/evidence copy, geometry
thresholds, state progression, no-progress-on-bad-form behavior, teardown, and
canonical Android asset parity. Existing suites must remain green.

Release verification includes Capacitor sync, Node tests, debug APK assembly,
installation on the connected Android phone, and a physical smoke pass checking
session selection, camera launch, AR guide visibility, Stop, and route recovery.

## Out of Scope

- VR/headset support.
- Claims of bone remodeling, fat loss, medical treatment, or guaranteed facial
  change.
- Server-side analysis, social comparison, leaderboards, or attractiveness
  scores.
