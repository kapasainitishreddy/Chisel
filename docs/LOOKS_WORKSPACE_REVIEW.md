# Looks workspace refinement

2026-09-10. User rejected the inline editor as basic and text-heavy. This refines the existing photo-led art direction, without a new theme controller, generated stock faces or backend changes.

## Design and source

The actual saved-photo editor now opens a native dialog: personal image, compact Hair/Beard/Makeup/Eyewear selector, one selected-style title, searchable Browse sheet, real hair-colour swatches and a single primary generation action. Saved looks occupy their own sheet. Desktop pairs the photo with an editing column; mobile gives the photo the upper canvas and places the controls below. Standard gutters are 20px mobile / 24-28px desktop, secondary targets 44px and the primary action 54px. The full original remains a separate inference input. Labels and controls are real HTML, not a screenshot used as an app.

The accepted concept is the previously approved photo-led Chisel concept in the conversation. Intentional deviations: no invented output thumbnails or sample scores; own unedited photo instead of concept models; a dedicated editing workspace instead of leaving the editor embedded in a crowded scrolling catalog. Category/preset counts, privacy consent, original hashes and job behavior remain unchanged. Cloud generation remains disabled on the service; this UI work does not enable it.

## Initial verification checkpoint

Baseline Node: 236/236. Six new selection/layout/source regressions failed before implementation and pass afterward. Full local Node suite: 242/242; syntax checks pass. Both canonical/native JS/CSS pairs match their uploaded blob hashes. Existing Looks browser lifecycle assertions are retained and adapted to actual dialog entry points, with additional portrait-plus-action visibility, search, swatch and keyboard checks.

Local Chromium navigation failed with net::ERR_BLOCKED_BY_ADMINISTRATOR. Use the exact-head GitHub Actions Chromium artifact for rendered review, not the local source tests. Browser verification and final screenshot comparison are pending at this initial push. Provider responses and face checks in that runner remain explicit fixtures, not live output or empirical accuracy evidence.

No signed APK/AAB, installation, merge, model deployment, billing or backend changes in this task.
