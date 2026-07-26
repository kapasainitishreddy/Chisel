# Change Requests

How to use: a request stays under **Pending** until it is implemented **in the
actual app** and verified. Only then move it to **Implemented and Verified** with
evidence (files changed, verification, commit). If the user edits source directly,
detect the diff (`git diff`), preserve it, verify it, and record it here.

---

## Pending
_None._

## In Progress
_None._

## Implemented and Verified

- **CR-001 — Camera prominent disclosure** (Play compliance). Added a one-time
  consent screen shown before the first camera use.
  - Affected features: FM-33, FM-02/13/15/17/19.
  - Files: `chisel-android/www/index.html` (`ensureCameraConsent`, `#camConsent`, `cameraConsent` store key).
  - Verification: Node syntax + sandbox (functions define; consent gate wraps `openCam`). 2026-07-26. Commit: session checkpoint.

- **CR-002 — In-app data deletion** (Play compliance). "Clear my data" control on
  the Connect screen wipes all `chisel:` localStorage keys after confirmation.
  - Affected features: FM-34, privacy model.
  - Files: `chisel-android/www/index.html` (`wipeAllData`, `#wipeData`).
  - Verification: Node syntax + sandbox. 2026-07-26. Commit: session checkpoint.

- **CR-003 — Release-build hardening.** `webContentsDebuggingEnabled` set to `false`.
  - Files: `chisel-android/capacitor.config.json`.
  - Verification: JSON parses; value confirmed. 2026-07-26. Commit: session checkpoint.

- **CR-004 — Paywall backend entitlement check (source).** Implemented `rcUserId`
  lookup, `entitlements` gating, `free_limit_reached`/`showPaywall`, and 2/day free
  cap in the render function source.
  - Affected features: FM-30.
  - Files: `supabase/functions/render-lookmax/index.ts`.
  - Verification: manual review only (no Deno runtime here). **Deployment pending** (external blocker) — this CR is source-complete, NOT live.

> Earlier session change requests (facial analysis modules, try-on, makeup studio,
> identity system, growth features, Play-prep, paywall UI) are recorded in Git
> history (`git log`) and reflected in `docs/FEATURE_MATRIX.md`.

## Rejected or Superseded

- **CR-R01 — Beauty / makeup "rater" (0–10 score).** Rejected after research
  (bias, body-image harm, Play-policy risk) and because it contradicts Chisel's
  anti-rating positioning. Superseded by the non-numeric **makeup coach** (FM-17)
  and **controllable-potential** figure (FM-07). Do not reintroduce a rating.
