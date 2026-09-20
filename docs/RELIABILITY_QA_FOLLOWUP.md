# Reliability QA follow-up (2026-09-10)

The reliability source at 33c2e53 passed 184/184 Node tests in CI but its first browser run missed the trainer Close action. A diagnostic-only rerun at 4391216 passed all 13 browser checks. A later diagnostic run at 7c29683 identified the intermittent failure: the delayed first-run identity popup was covering the trainer, and the simulated click hit `idModal`, not `arCoachX`.

The browser runner now waits for that first-run popup, dismisses it using the actual Close control, and confirms it is gone before exercising the trainer. No identity is invented or saved, no app event handlers are bypassed, and the trainer Close assertion is retained.

A separate confirmed CSS issue was also fixed: the trainer panel now disables animation when reduced motion is requested, and its Close target is at least 44 by 44 CSS pixels. A regression test failed before this CSS change and passed afterward. The full local suite is now **185/185**. The browser runner checks the computed reduced-motion state too.

Earlier documents' 184 counts refer to the preceding reliability checkpoint. Exact-head workflows remain authoritative for the new revision. These tests do not establish physical-device acceptance, numerical measurement accuracy, or generated-output realism.
