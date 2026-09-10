# Reliability QA follow-up (2026-09-10)

The reliability source at 33c2e53 passed 184/184 Node tests in CI but its first browser run missed the trainer Close action. A diagnostic-only rerun at 4391216 passed all 13 browser checks with no errors; the close target was correct and the actual click closed the modal. This does not establish the cause of the earlier intermittent miss.

The follow-up explicitly disables trainer panel animation when reduced motion is requested, and makes the Close target at least 44 by 44 CSS pixels. A regression test failed before this CSS change and passed afterward. The full local suite is now **185/185**. A browser assertion checks the computed reduced-motion animation state without removing or relaxing the Close assertion.

Earlier documents' 184 counts refer to the preceding reliability checkpoint. Exact-head workflows remain authoritative for the new revision. No new claim of physical-device acceptance, numerical measurement accuracy, or generated-output realism follows from these tests.
