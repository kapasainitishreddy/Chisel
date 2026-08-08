# Chisel Quiet Precision Product Polish Design

Date: 2026-08-07
Status: Approved for implementation

## Goal

Turn Chisel from a feature-rich release candidate into a trustworthy premium appearance-tracking product. The experience should feel calm, precise, private, and useful without ever reducing a person to an attractiveness score.

## Product promise

Chisel measures what is changing, explains what is controllable, and refuses to guess when a capture is not reliable.

## Non-negotiables

- No global attractiveness, beauty, masculinity/femininity, golden-ratio, percentile, or potential score.
- Core analysis remains account-free, on-device, offline-capable, and useful without payment.
- Weak captures are rejected rather than converted into precise-looking numbers.
- Meaningful progress is shown only when the delta exceeds combined measurement uncertainty and the scans are comparable.
- Camera-derived outputs are cosmetic/educational estimates, not medical diagnoses.
- Privacy, export, deletion, accessibility, restore purchase, and safety disclosures are never premium-gated.
- Incomplete, random, mocked, or unvalidated features remain hidden.

## Experience architecture

The premium mobile shell prioritizes four jobs:

1. **Today** - best next action, routine status, scan readiness, and one verified change.
2. **Scan** - Quick, Deep, Precision, Body/Posture, and Looks Studio entry points.
3. **Progress** - condition-matched comparisons, trends, programs, milestones, and before/after.
4. **Studio** - hair, beard, eyewear, makeup/grooming, reports, coach/mindset, privacy, and subscription controls.

The existing route implementation may continue to map these jobs onto the current underlying screens while preserving backwards compatibility.

## First-run CX

- Explain private/on-device processing before asking for camera permission.
- Explain what Chisel can measure and what it intentionally refuses to infer.
- Let the user choose goals without forcing gendered assumptions.
- Explain Quick vs Deep vs Precision.
- Ask for camera permission only when the user starts capture.
- End the first successful baseline with one controllable win and one concrete next action.

## Capture UX

The camera experience must provide actionable quality guidance for lighting, blur, distance, head angle, expression, occlusion, glare, segmentation, limbs, and body pose. Auto-accept only stable batches. A failure state must explain how to correct the capture rather than displaying a generic low-confidence message.

## Results hierarchy

Results must appear in this order:

1. What was measured.
2. Capture quality.
3. Measurement confidence/uncertainty.
4. Change from a compatible baseline.
5. Whether the change exceeds normal measurement variation.
6. Three highest-impact controllable actions.
7. Evidence strength and limitations.
8. Detailed measurements behind progressive disclosure.
9. Re-scan guidance.

Preferred progress language: **Likely changed**, **Within normal variation**, and **Not comparable**.

## Measurement reliability

### Shared protocol

- Use stable bursts/batches, robust consensus, outlier rejection, accepted/rejected frame counts, and uncertainty intervals.
- Store scan type, camera, framing/fill, lighting, orientation, method version, and timestamp when available.
- Absolute centimetres/millimetres require explicit calibration; otherwise use ratios or angles.
- Comparisons require compatible scan type, camera, framing/distance, lighting, view, and method version when metadata exists.

### Face

- Frontal views for facial ratios and photographic symmetry proxies.
- Real side capture for profile angles where required.
- Reject excessive yaw/pitch/roll, unstable expression, occlusion, and weak landmark confidence.

### Skin

- Limit outputs to visible redness/evenness/brightness/blemish and under-eye appearance estimates.
- Reject large colour drift, glare, unstable lighting, and suspected filters/makeup when the measurement depends on colour.
- No medical diagnosis or skin-age claim.

### Teeth/lips

- Teeth brightness is a within-user photographic trend, not a clinical shade or dental health score.
- Do not score alignment from a selfie.
- Lip outputs remain neutral proportions/ratios.

### Posture/body

- Require stable front/side captures, segmentation-quality gates, visible limbs, and multiple frames.
- No body-fat percentage from a single photo and no musculoskeletal diagnosis.
- Absolute waist output requires calibration; otherwise show normalized trend ratios.

## Premium boundary

### Free

- Complete local Quick Scan.
- One Precision baseline and one Precision re-scan per month.
- Full basic results including uncertainty and top controllable wins.
- Basic local style previews.
- Basic routine, 30-day progress history, one share-card style.
- Privacy/export/delete/accessibility/evidence controls.
- No ads at launch.

### Chisel Pro

- **Precision Lab Pro:** unlimited Precision scans, multi-angle consensus, calibration, confidence bands, reproducibility report, Condition Match.
- **Progress Intelligence:** unlimited history, verified-change timeline, confidence bands, best-baseline selection, method-version handling, milestone reports.
- **Adaptive Protocols:** 30/60/90-day goal programs, deterministic evidence-backed coach, routine adjustments, smart reminders, event-prep mode.
- **Looks Studio Pro:** expanded local style library, side-by-side boards, premium packs, HD export, finite monthly cloud renders.
- **Professional Export:** barber, skincare-discussion, dental-discussion, and posture/fitness reports with confidence and limitations.
- **Private Vault Plus:** biometric/PIN lock, encrypted local archive, secure export, optional user-controlled encrypted backup.

Recommended pricing: $6.99/month or $39.99/year with a transparent 7-day annual trial. Cloud renders use a finite credit allowance and failed provider jobs return the credit.

## Accessibility and platform quality

- 48x48dp minimum touch targets.
- 200% font scaling without clipped controls.
- Screen-reader labels and live state announcements.
- Reduced-motion support and no information conveyed only through colour.
- Correct Android Back, safe-area, keyboard, rotation, and process-restoration behavior.
- High-contrast states and visible focus treatment.

## Release gates

Chisel is ready when:

- Every visible feature works end-to-end on a real Android device.
- Same-condition repeated scans do not create false progress.
- Bad captures are rejected with an actionable reason.
- Precision results include uncertainty and limitations.
- Core analysis works offline without an account.
- Cloud upload uses separate explicit consent.
- Purchase, restore, expiry/grace, and failed-render credit recovery work.
- Data export/delete and privacy controls pass.
- Signed production AAB passes CI/device/Play checks.
