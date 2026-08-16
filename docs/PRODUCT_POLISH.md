# Chisel Product Polish

_Last updated: 2026-08-16_

Chisel's product direction is **Quiet Precision**: one useful action at a time,
conservative measurement language, local-first privacy, premium presentation and
no attractiveness ranking.

The primary product promise is:

> **Measure. Act. Compare yourself to yourself.**

## Product hierarchy

### Home — Today's Chisel

Home is a decision surface, not a dashboard dump.

The first product layer is `Today's Chisel`:

1. **Measure** — build a clean, repeatable baseline.
2. **Act** — do one controllable routine or style decision.
3. **Compare** — re-check later under similar conditions.

Chisel recommends **one** daily focus:

- before a useful baseline exists: create one clean scan;
- after a baseline exists: favor the controllable routine rather than repeated
  appearance checking.

Completion is always explicit. The user taps `Mark focus complete`; Chisel does
not infer or auto-complete it. Completion is stored locally under
`chisel:cxpDaily` and resets by local calendar day.

The direct tool launcher remains available below the daily focus:

- **Scan now** — create or compare a baseline.
- **Try-on Studio** — hair, facial hair, eyewear and makeup decisions.
- **Face Yoga** — gentle unisex AR movement and posture guidance.
- **Routine** — controllable actions between scans.

Home also makes the trust model visible immediately:

- core analysis is private by default;
- there is no public beauty score;
- matched-condition comparison is more useful than frequent checking.

### Analyze

Analyze explains trust before measurement:

- core analysis runs locally;
- multi-frame capture is preferred over one selfie;
- weak pose, lighting, distance or unstable measurements are rejected;
- results are photographic estimates for within-person guidance, not clinical
  measurements.

A failed capture should produce correction guidance rather than a forced result.

### Try-on Studio

Try-on is decision support, not a promise of final real-world appearance.

- Men hair, women hair, facial hair, eyewear and makeup are direct options.
- Local Live Guide should stay visually restrained enough to keep the real face
  readable.
- Photoreal generation is a separate, explicit cloud action.
- The exact selected style must survive the handoff into photoreal generation.

### AR Coach and Face Yoga

The AR camera should look like a premium guide, not a debug mesh.

Use:

- restrained jaw / cheek guides;
- minimal anchors;
- clear form state;
- compact glass HUD;
- large stop/control targets;
- explicit evidence and safety limits.

Face Yoga is unisex and framed as gentle movement / relaxation / posture awareness,
not adult-bone reshaping or spot-fat reduction.

### Grooming / Routine

The default action loop is:

1. choose one area;
2. follow the routine;
3. mark it complete;
4. compare later under matched conditions.

Reward consistency and useful decisions, not compulsive rescanning.

### Progress and results

A missing history is a useful empty state, not a blank region. Ask the user to
create one strong baseline first.

Result surfaces should identify themselves as photographic estimates, expose
capture-quality context where relevant and encourage matched-condition comparison.

Do not turn normal variation into a dramatic “improvement” claim.

### Mindset

Affirmation and visualization are optional confidence / attention practices.
Keep copy unisex and calm. Do not present visualization, repetition or affirmations
as guaranteed physical-change mechanisms.

### Settings and privacy

Settings lead with `Local by default`.

- Core analysis stays on-device.
- Photoreal rendering is the explicit optional cloud boundary.
- Deletion and privacy controls are never premium-only.
- No account is required for core use.
- No ads / analytics are part of the intended product model.

### Pro

Pro must be **additive** rather than a ransom layer over the trustworthy core app.

Current customer-facing value:

- more optional photoreal cloud-rendering capacity;
- core local scans and routines remain available;
- no ads;
- no account requirement for the core app;
- purchase restoration through Google Play.

Rules:

- exact price / renewal terms come from Google Play;
- do not fake scarcity, countdowns, review counts or “people viewing” indicators;
- do not imply privacy, deletion or honest scan results require payment;
- do not advertise unavailable Pro features as live;
- shipping free-first is acceptable until billing infrastructure is production-tested.

## Store / conversion rules

The Play Store story should communicate the product loop before feature count.
Recommended screenshot order:

1. Today's Chisel;
2. Quick Scan;
3. Try-on Studio;
4. Routine;
5. Progress;
6. AR Coach;
7. optional Photoreal / Pro.

Recommended feature-graphic hierarchy:

- headline: **MEASURE · ACT · COMPARE**;
- subline: **Private appearance improvement. No public rating.**

Do not use an “ugly → attractive” before/after graphic, fake review social proof,
guaranteed transformation language or unvalidated accuracy claims.

## Accessibility / interaction rules

- Minimum 44px interactive target.
- Visible `:focus-visible` treatment.
- Large text wraps instead of clipping.
- Reduced-motion preference disables decorative animation / transition timing.
- Camera and modal layers stay above floating launchers.
- Important destructive actions remain visually distinct and explicit.
- Dynamic completion text uses an appropriate live region rather than silent
  visual-only state changes.

## Accuracy language

Do not use:

- `clinical accuracy`;
- `medical-grade`;
- `sub-millimeter`;
- `perfect accuracy`;
- attractiveness percentiles;
- guaranteed transformation language.

Use `photographic estimate`, capture-quality context and uncertainty-aware
comparison until representative repeatability / reference validation exists.
