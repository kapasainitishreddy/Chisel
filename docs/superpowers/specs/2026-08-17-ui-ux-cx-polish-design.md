# Chisel UI/UX/CX Polish Design

**Date:** 2026-08-17

## Goal

Polish the existing Chisel Android experience without replacing its established product direction. The pass should make navigation state clearer, taps feel deliberate, launch controls resist accidental double activation, motion feel cohesive, and accessibility semantics describe the real action a control performs.

## Product constraints

- Keep the canonical `chisel-android/www/index.html` shell and existing modular polish runtimes.
- Preserve the onyx / ivory / restrained-gold visual language.
- Do not change scan math, facial-analysis thresholds, evidence grades, local-first privacy behavior, or the anti-rating positioning.
- Do not add new permissions, analytics, accounts, tracking, or dependencies.
- Respect `prefers-reduced-motion`.
- Preserve 44px minimum touch targets and Android safe-area behavior.
- Keep source assets and packaged Android assets byte-for-byte synchronized.

## Interaction design

### Route transitions

Use the existing `go(screen)` router as the source of truth. `ChiselProductPolish` may wrap it once, call the original immediately, then add a short enter class to the newly active screen. The transition is presentation-only and must never delay routing, camera teardown, or feature logic. Reduced-motion users receive no visible animation.

### Navigation state

The five primary bottom-tab controls should expose `aria-current="page"` for the active route and remove it from inactive routes. State is synchronized on install and after every wrapped route change. This makes the visual and semantic current destination agree.

### Touch feedback and launch locking

Existing primary controls should use subtle opacity/border/shadow transitions rather than large transforms that could fight camera or layout transforms. Home quick-action launchers get a short busy lock after activation so rapid double taps cannot launch the camera/studio flow twice. The lock clears automatically and carries `aria-busy` while active.

### Accessible control names

Never replace a useful existing `aria-label`. For unlabeled controls, prefer visible text. For icon-only camera/close controls, derive a specific label from known IDs/classes. Do not use generic labels such as `Activate` when the action can be named.

### Status announcements

The existing toast surface should be a polite atomic live region so save/restore/action confirmations can be announced without interrupting camera guidance. Camera frame-by-frame guidance should not be made a live region because that would be excessively noisy.

## Error and edge-case behavior

- The route wrapper is idempotent and must not wrap `window.go` more than once.
- If `requestAnimationFrame` is unavailable, fall back to a zero-delay timer.
- If navigation, toast, or optional controls are absent, the installer quietly skips them.
- Busy-lock timers are stored per control and safely replace an earlier timer.
- Existing disabled state is respected; a disabled control is never re-enabled by a lock it did not create.

## Testing

Extend `product-polish.test.cjs` before production changes. Tests must require:

1. route-enter motion plus a reduced-motion override;
2. semantic `aria-current` synchronization;
3. named accessibility labels and no generic `Activate` fallback;
4. polite toast live-region semantics;
5. quick-action busy/double-tap protection;
6. byte-for-byte source/Android parity.

The final verification path is the repository's full `npm test` suite plus GitHub Actions (`Chisel Tests` and mobile build) on the pull request. Browser/physical-device validation remains separate because this ChatGPT environment has no attached Android device or browser-development plugin.