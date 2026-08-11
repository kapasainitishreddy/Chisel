# Chisel Mobile UX, Analysis, and Facial-Hair Redesign

## Context and decision

The current phone build has four user-visible failures:

1. The mobile tab bar counts the Android bottom safe area in the app grid and again inside the tab bar, producing a large empty band.
2. A sixth `Connect` tab consumes scarce space even though its content is settings, privacy, and device information.
3. Facial hair is explicitly disabled for the `women` style collection and rendered as an opaque polygon with per-frame random dots, making it binary, artificial, and visually unstable.
4. Scan feedback draws a low-emphasis general mesh and then buries jaw information beneath a score-led, long result sheet.

Three approaches were considered:

- Patch only the labels and spacing. Fast, but leaves the weak beard renderer and confusing result hierarchy.
- Replace the try-on and scan subsystems completely. Highest potential fidelity, but too risky for the current single-file app and unnecessary for this correction.
- Correct the shared layout and information architecture, then improve the existing landmark renderers in place. This is the selected approach because it fixes the root causes while preserving the working camera loop and privacy model.

The user has already granted autonomous design approval and explicitly asked not to be interrupted with more design questions.

## Mobile navigation

- Phone navigation has five equal tabs: Home, Analyze, Affirm, Meditate, Groom.
- `Connect` is removed from both mobile and desktop primary navigation.
- The existing `connect` route remains internally for compatibility but is presented as **Settings** from a compact Home control, preserving identity, privacy, diagnostics, and data deletion without wasting a primary tab.
- The app grid owns a fixed 72px tab row. Android's safe area is not added a second time inside the grid or tab padding.
- The active pill width and movement use five equal columns.

## Unisex facial-hair studio

- Style collection choices are labeled **Short styles** and **Long styles**, not Men/Women.
- Facial-hair controls are available in both collections and for every saved identity.
- Hair collection defaults may still use identity as a starting convenience, but never hide an option.
- Beard rendering uses a low-opacity base tint plus deterministic, tapered hair strokes clipped to landmark regions. It must not generate new random geometry each animation frame.
- Styles vary through density, hair length, coverage region, and softness rather than simply increasing opacity.
- Lips remain cut out and the result remains explicitly a stylized local preview, not photoreal.

## Jaw visibility and face analysis

- During Quick/Deep scan, the lower jaw contour receives a dark halo plus a high-contrast gold line drawn above the general mesh. Cheekbone anchor lines receive a quieter companion treatment.
- AR coaching uses the same dual-stroke approach so the guide remains visible on light and dark skin, facial hair, and bright backgrounds.
- Results lead with a dedicated jaw summary card, then cheekbones and symmetry, before skin/style categories.
- The header reads **Face analysis**, not a harmony/beauty score. Existing stored numeric data remains compatible but is framed as photographic measurements rather than a rank.
- Only the primary jaw card opens by default. Other cards are collapsed to shorten the first read.
- Scan quality is visible near the top; low-confidence claims remain approximate and no medical or bone-change claim is added.

## Accessibility and interaction

- All primary targets remain at least 44px; the settings entry and five tabs have accessible labels.
- State is communicated by text and geometry, not color alone.
- Bottom spacing is validated against the physical Android navigation area.
- The camera Stop/close controls remain unobstructed.

## Verification

- Add regressions that fail against the current six-tab/double-inset layout, binary facial-hair gate, random beard renderer, weak jaw overlay, and score-led result header.
- Run the focused tests red, implement, then run them green and run the full suite.
- Run `npx cap sync android` and `gradlew.bat assembleDebug`.
- Upgrade-install on `R3CW10Y67TT`; inspect Home/tab spacing, Settings access, Groom try-on controls, scan jaw overlay, and result hierarchy using UI-tree-derived interaction and accepted screenshots.
- Keep all camera captures temporary and delete them after inspection.
