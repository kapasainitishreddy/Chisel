# Chisel Premium Features

Chisel's paid tier extends precision, history, coaching, styling depth, and secure storage. Core privacy and a useful local analysis remain free.

## Free

- Account-free local Quick Scan.
- Deep Scan for a stronger baseline.
- One complete Precision baseline and one Precision re-scan per month.
- Face/skin/lips/teeth/eye/cheekbone/jaw measurements that pass capture gates.
- Capture-quality feedback and retry guidance.
- Confidence/within-batch uncertainty on Precision results.
- Basic posture/body tracking when the capture passes quality gates.
- Basic local hair, beard, eyewear, and makeup previews.
- Daily routine, adherence, hydration/bloat log, and basic 30-day progress history.
- One shareable progress-card style.
- Evidence grades, limitations, privacy controls, local data deletion, and export.
- No ads at launch.

## Chisel Pro

### Precision Lab Pro

- Unlimited Precision scans.
- Multi-photo and multi-angle consensus.
- Condition Match assistant.
- Optional reference/tape calibration.
- Advanced measurement breakdown.
- Confidence bands and reproducibility reports.
- Automatic best-baseline selection.

### Progress Intelligence

- Unlimited history.
- Verified-change timeline.
- Trend confidence bands.
- Method-version-aware comparisons.
- Habit association view with explicit "association, not causation" wording.
- Milestone and long-form progress reports.

### Adaptive Protocols

- Goal-based 30-, 60-, and 90-day programs.
- Deterministic Private Smart Coach using reviewed evidence cards and decision trees.
- Routine adjustments based on adherence, confidence, and user feedback.
- Smart reminders and pause/recovery weeks.
- Event preparation mode.

### Looks Studio Pro

- Full local hairstyle, beard, eyewear, and makeup/grooming style library.
- Side-by-side decision boards using the same source photo.
- Maintenance filters and style packs.
- HD export without promotional watermark.
- Finite monthly opt-in photoreal cloud render allowance.

Cloud renders are not unlimited. Failed provider jobs should automatically return their credit.

### Professional Export

- Barber brief.
- Skincare discussion sheet.
- Dental discussion sheet.
- Posture/fitness report.
- Confidence, limitations, selected source image, and user notes included in every report.

These exports are discussion aids, not diagnoses or prescriptions.

### Private Vault Plus

- Biometric/PIN lock.
- Encrypted local archive.
- Secure export package.
- Optional user-controlled encrypted backup.

Core local privacy, data deletion, and basic export remain free.

## Recommended launch pricing

- Monthly: **$6.99**
- Annual: **$39.99**
- Annual trial: **7 days** with the renewal date and renewal price shown clearly.
- Optional founding annual offer: **$29.99 for the first year**.

Avoid weekly subscriptions, per-basic-scan fees, fake countdowns, and unlimited cloud rendering.

## Production dependencies

The UI and entitlement seams may exist before the paid tier is live. Production monetization still requires:

- Google Play subscription products/base plans.
- RevenueCat `premium` entitlement and public Android SDK key.
- Purchase/restore/grace/expiry testing on a Play testing track.
- Production webhook secret/deployment if server-side entitlement enforcement is enabled.
- Measured cloud-render provider costs before finalizing render quotas/top-ups.
