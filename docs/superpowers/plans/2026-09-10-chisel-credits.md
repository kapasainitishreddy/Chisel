# Chisel credit-backed studio implementation

Goal: working source, secure wallet, native purchase integration, cost controls and useful compare/export features in the existing Chisel shell.
Architecture: shared pure policy; service-role-only Postgres ledger; authenticated Edge gateway and separate RevenueCat webhook; optional client account/credits module; small hooks in the current Looks Studio; local comparison and stylist reference sheet.
Spec: ../specs/2026-09-10-chisel-credits.md

- [x] Add failing tests for tariffs, spend scenarios, purchase replay/refunds and account/production boundaries.
- [x] Implement policy, SQL transactions and provider adapter with bounded non-retrying request.
- [x] Test real SQL in rolled-back transactions; keep production sales/render switches off.
- [x] Implement optional email OTP sign-in, RevenueCat pack purchase, server balance and live-price-only purchase UI.
- [x] Wire paid transport and explicit cost/provider consent into current editor; retain legacy non-paid flow for existing installs.
- [x] Implement saved-look comparison and stylist sheet with image/source labels and private local storage.
- [x] Validate browser controls, CSS layout and pending states against exact pushed revision; unit-test account races.
- [x] Deploy additive endpoints with generation/sales disabled, verify real GET and rejection paths.
- [x] Record exact evidence and remaining live-provider/store/native gates.

Final app/test head4a932d41b5af04f2e52317dcb2946cfac8e599c6: 273/273 Node,33/33 fixture browser,6/6 real endpoint rejection/readiness. Actual SQL test passed and rolled back. See docs/AI_CREDITS_STATUS.md. This completed implementation slice does not mean the commercial app is released or all previous feature requests are done. Live key/output/cost/store testing, retention/deletion operations, phone builds, original hair/glasses repair and instructional animations remain open.
