# Account and output lifecycle

User approved completion and explicitly requested no further questions on 2026-10-04. Native execution in the existing isolated cloud work branch.

## Design

Add authenticated account-deletion and authenticated scheduled-retention endpoints. Deletion verifies ownership, blocks active jobs, removes owned private output objects before auth deletion, retains only explicitly documented legally necessary purchase records, and can be retried after partial cleanup. Cleanup has bounded batches and service-only credentials. Cloud sales/render flags stay disabled until live acceptance. Keep current consumable credit policy; do not add unconfigured subscriptions or spend on provider tests.

## Verification

Use regression tests observed failing before changes and passing afterward. Run the full Node suite after asset synchronization, browser acceptance with explicit fixtures where appropriate, and attempt an Android debug build. Signing, real provider/billing, physical-device and empirical accuracy remain unverified without actual evidence. Never deploy, publish, purchase, push or fabricate acceptance.
