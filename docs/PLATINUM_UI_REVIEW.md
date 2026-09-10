# Platinum UI integration

2026-09-10. Draft PR #8 extends PR #7, without changing measurement engines.

## Reconciliation

The parent branch advanced from 27c19d5 to e2f5bc0 while an isolated UI redesign was being prepared. Preserve that concurrent Quiet Studio work, including session filters, shared in-flow Tools header, capture instructions, existing handlers, and source/browser tests. The abandoned parallel Platinum controller and stylesheet are removed. There is one active shared Studio theme, now using graphite/platinum tokens and consistent sans-serif typography.

## User-visible refinements

- Graphite surfaces and platinum primary controls with consistent 12px control corners and readable 14px primary button labels.
- Shared navigation icons and selected states; no floating launcher over task buttons.
- Trainer heading and 48px Close target stay outside the scrollable list; all six sessions, goal filters and evidence disclosures remain attached to existing handlers.
- Skin photo controls remain separate from routine preferences. Capture-quality and non-diagnostic labels remain visible and truthful.
- Remember the actual external trigger before legacy dialogs focus their own Close controls; restore keyboard focus when leaving a dialog.
- Allow browser pinch zoom. Honor reduced-motion and narrow layouts.

## Engineering verification

Integrated local full suite: 199/199 passing. The four new behavior/presentation regressions fail against the e2f5bc0 baseline; asset-parity check passes before and after. The previous isolated proposal had 190 tests, before the nine concurrent Studio tests were included. That initial proposal is not the final architecture.

Exact canonical and Android copies of the edited shared stylesheet/runtime match. The original AR engine, skin engine, Precision math, capture-quality gates, provider paths and index shell are unchanged from the parent snapshot.

Browser validation runs in GitHub Actions Chromium, because local navigation was blocked by the execution environment. Consult the exact-head Chisel Platinum UI, Quiet Studio QA, Reliability Evidence and Chisel Tests runs for current completion. Do not infer rendered success from this local test checkpoint.

## Release and measurement limits

No merge, signed Android build, physical-device testing, deployment, billing configuration or store submission. No new accuracy percentage or photoreal model is claimed. Real-device measurement error and generated-image realism remain independent acceptance work. This document supplements existing FEATURE_MATRIX, TEST_STATUS, RELEASE_STATUS and AI_HANDOFF records for the UI slice only.
