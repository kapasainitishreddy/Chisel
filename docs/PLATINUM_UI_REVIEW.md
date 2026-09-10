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

## Real bug found in rendered review

The first review captured Analyze after Tools > Style. Source inspection showed that openSurface routed to Analyze even though cxStudioCard is inside Groom. Existing tests checked only element presence or the wrong route; they did not prove visible style access.

The fix derives the destination from the actual card's containing screen, and returns Tools focus with preventScroll so closing the menu cannot undo the intended scroll. Both browser runners now require the actual style card to be visible on Groom. One additional source regression failed before this fix and passes after it.

## Engineering verification

Integrated local full suite: 200/200 passing. Four initial UI regressions fail against e2f5bc0; one additional Style routing regression failed at the 199-test checkpoint. Exact canonical and Android copies of the edited shared stylesheet/runtime match. The original AR engine, skin engine, Precision math, capture-quality gates, provider paths and index shell are unchanged from the parent snapshot.

Browser validation runs in GitHub Actions Chromium because local navigation was blocked by the execution environment. Run 34500453530 on fedce59 passed 199 Node tests, 79 Platinum, 43 Studio and 15 reliability checks, but manual screenshot review found the Style assertion gap described above. Those earlier passing counts are not sufficient acceptance evidence for Style. Consult the latest branch run for the corrected visibility tests.

## Release and measurement limits

No merge, signed Android build, physical-device testing, deployment, billing configuration or store submission. No new accuracy percentage or photoreal model is claimed. The real-image skin QA fixture was rejected as too small rather than producing scores; this validates that rejection path, not skin accuracy. Real-device measurement error and generated-image realism remain separate acceptance work.

This document supplements FEATURE_MATRIX, TEST_STATUS, RELEASE_STATUS and AI_HANDOFF for the UI slice only. The initially isolated Platinum proposal is not the final architecture.
