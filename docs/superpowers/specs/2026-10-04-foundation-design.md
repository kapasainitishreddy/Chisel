# Reliable builds and local fitting

User approved completion and explicitly requested no further questions on 2026-10-04. Native execution in the existing isolated cloud work branch.

## Design

Canonical www is the source of truth. npm test first synchronizes Capacitor assets; build validates JavaScript syntax and runtime references. Native debug and signed-release jobs are separate, with frozen dependencies and secret-backed release configuration. A dependency-aware loader reports failures and continues independent feature groups. Eyewear uses validated landmarks, one canvas drawing path, and confidence-gated local fitting; no upload is performed.

## Verification

Use regression tests observed failing before changes and passing afterward. Run the full Node suite after asset synchronization, browser acceptance with explicit fixtures where appropriate, and attempt an Android debug build. Signing, real provider/billing, physical-device and empirical accuracy remain unverified without actual evidence. Never deploy, publish, purchase, push or fabricate acceptance.
