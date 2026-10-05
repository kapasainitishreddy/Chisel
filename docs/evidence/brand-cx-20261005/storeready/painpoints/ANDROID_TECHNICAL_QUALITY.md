# Android Technical Quality

**Status:** AUTOMATION_PENDING

| Check | Status | Evidence | Action |
| --- | --- | --- | --- |
| 64-bit native support is not evidenced | AUTOMATION_PENDING |  |  |
| Current Android vitals evidence is not imported | AUTOMATION_PENDING | Crash, ANR and wake-lock bad-behavior thresholds can affect Play visibility and quality status. |  |
| Google Play memory-vitals compliance is not evidenced | AUTOMATION_PENDING | Google evaluates memory and bitmap memory using the last 28 days of Play vitals and RAM-tier thresholds. |  |

Tracked effective dates:

- Memory + DEX optimization: 2027-02-01
- Zero-tap sign-in restoration: 2027-04-01

Sources: https://support.google.com/googleplay/android-developer/answer/17492799 and https://developer.android.com/guide/practices/page-sizes
