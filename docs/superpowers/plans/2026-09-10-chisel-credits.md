# Chisel credit-backed studio implementation

Goal: working source, secure wallet, native purchase integration, cost controls and useful compare/export features in the existing Chisel shell.
Architecture: shared pure policy; service-role-only Postgres ledger; authenticated Edge gateway and separate RevenueCat webhook; optional client account/credits module; small hooks in the current Looks Studio; local comparison and stylist reference sheet.
Spec: ../specs/2026-09-10-chisel-credits.md
Execution: test-first; no new design approvals needed for this explicitly approved scope.

- [x] Add failing tests for tariffs, spend scenarios, purchase replay/refunds and account/production boundaries.
- [x] Implement policy, SQL transactions and provider adapter with bounded non-retrying request.
- [x] Test real SQL in rolled-back transactions; keep production sales/render switches off.
- [x] Implement optional email OTP sign-in, RevenueCat pack purchase, server balance and live-price-only purchase UI.
- [x] Wire paid transport and explicit cost/provider consent into current editor; retain legacy non-paid flow for existing installs.
- [x] Implement saved-look comparison and stylist sheet with image/source labels and private local storage.
- [ ] Validate browser controls, CSS layout, account switching and purchase pending states against exact pushed revision.
- [ ] Record final exact evidence and remaining live provider/store/native release gates.

Local full Node suite before initial push: 272/272 passing. The real Postgres migration was applied with paid capabilities off. The SQL acceptance transaction passed and was rolled back, leaving no dummy balances or purchases. Rendered checks are pending; do not infer UI success from Node tests.
