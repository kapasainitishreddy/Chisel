# Chisel Premium UX Design

## Goal
Transform Chisel from a feature-dense dark utility into a premium, calm, mobile-first private glow-up tracker while preserving every existing capability.

## Product Position
Chisel is a private improvement system, not an attractiveness rater. The interface must consistently communicate three promises:

1. Measurements and photos stay on-device unless a separate feature explicitly says otherwise.
2. Results are estimates with capture-quality and confidence information, not medical or laboratory claims.
3. The product helps users measure, improve, and repeat without shame or insecurity bait.

## Information Architecture

### Primary mobile navigation
The six-item mobile navigation becomes four destinations:

- **Home** — daily command center, next action, routine and progress summary.
- **Scan** — quick, deep and Precision Mode capture.
- **Routine** — grooming plans and action programs.
- **More** — affirmations, visualization, exports, settings and supporting tools.

Affirmations and visualization remain accessible from Home and More; they are removed only from the persistent mobile navigation.

### Scan journey
Every scan surface follows the same visible sequence:

1. **Prepare** — lighting, framing and privacy instructions.
2. **Capture** — choose Quick, Deep or Precision.
3. **Quality** — explain whether evidence is sufficient and how to retry.
4. **Result** — show measurements, confidence and one recommended next action.

Advanced tools such as jawline training, future preview and exports sit behind progressive disclosure.

## Visual System: Onyx Laboratory

- Background: near-black onyx with restrained warm gradients.
- Surfaces: layered graphite with fine ivory borders.
- Accent: warm champagne gold used only for primary actions, selected states and meaningful progress.
- Typography: Cormorant Garamond for editorial display text and Inter for readable controls and data.
- Cards: less glow, more spacing, clearer elevation and consistent 18–24 px radii.
- Motion: subtle 160–280 ms transitions; all motion disabled when reduced-motion is requested.

## Core Experience Components

### Trust strip
A compact strip on Home and Scan communicates: on-device processing, confidence ranges and no attractiveness rating.

### Next-action command card
Home presents one recommended action instead of making the user choose from every feature at once. New users create a baseline; returning users repeat a compatible scan or continue their routine.

### First-run concierge
A one-time, dismissible introduction explains privacy, guided capture and uncertainty-aware progress. It never blocks returning users.

### Scan mode cards
Quick, Deep and Precision are presented as three clear choices with time, evidence quality and intended use. Deep is recommended for regular tracking; Precision is recommended for controlled comparisons.

### Progressive disclosure
Secondary tools remain available under “More scan tools,” keeping the initial decision simple without removing functionality.

## Accessibility and Mobile Requirements

- Minimum 48 px interactive height for primary controls.
- Four-column mobile navigation with safe-area support.
- Visible keyboard focus and strong contrast.
- Readable labels without excessive all-caps letter spacing.
- Large-text-safe layouts and no horizontal overflow.
- Screen-reader labels for new controls and dialogs.
- Escape/backdrop/dedicated close actions for concierge and modal surfaces.

## Technical Approach

Add a self-contained `chisel-premium.css` visual layer and `chisel-premium.js` experience layer. Android injects these after existing Chisel Labs and Precision Mode assets. Canonical files in `www/` are copied byte-for-byte into Android packaged assets. No user images or measurements are uploaded by the premium layer.

## Acceptance Criteria

- Mobile persistent navigation has four primary destinations and a dominant Scan action.
- Home contains trust messaging and one recommended next action.
- Analyze contains Prepare → Capture → Quality → Result stages.
- Quick, Deep and Precision choices are visually clear; advanced tools are collapsed by default.
- First-run concierge is dismissible and stored locally.
- “Lookmax Score” is reframed as a non-attractiveness “Tracking Index.”
- Premium assets pass Android parity tests and native injection-order tests.
- The Android project compiles past the Capacitor `onResume()` visibility error.
