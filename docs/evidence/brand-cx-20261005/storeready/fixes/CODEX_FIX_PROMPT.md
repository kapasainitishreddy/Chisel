# Codex Release Fix Handoff

You are fixing release-readiness issues reported by StoreReady.

## Guardrails

- Inspect the existing implementation before changing it.
- Make the smallest safe change that addresses the finding.
- Do not redesign unrelated screens or flows.
- Preserve existing product behavior unless the finding specifically requires a behavior change.
- Add/update focused tests for code changes.
- Do not fabricate device, store-console, legal, billing, reviewer or production evidence.
- Do not publish, submit, change pricing, rotate production credentials or accept legal declarations.
- If a finding requires external evidence, keep it as PLATFORM_REQUIRED or AUTOMATION_PENDING.

## P0: do not submit

1. Potential embedded secret detected
   Evidence: [REDACTED API KEY]
   Required fix: Revoke exposed credentials, move secrets server-side or into protected build secrets, and rotate keys.
   Verification: Apply the recommended change or import the required evidence, then rerun the relevant StoreReady scanner. Evidence must show the corrected file/build or an authorized store-platform export.

2. Privacy policy is present and machine-verified
   Evidence: No direct evidence supplied; this check cannot be treated as PASS.
   Required fix: Correct the detected compliance mismatch and rerun the checker.
   Verification: Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.

3. Data categories collected is not automatically verified
   Evidence: No direct evidence supplied; this check cannot be treated as PASS.
   Required fix: Update the privacy policy so this requirement is stated clearly and truthfully.
   Verification: Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.

4. Consent withdrawal/revocation is not automatically verified
   Evidence: No direct evidence supplied; this check cannot be treated as PASS.
   Required fix: Update the privacy policy so this requirement is stated clearly and truthfully.
   Verification: Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.

5. Third parties receive equivalent/contractual data protection is not automatically verified
   Evidence: No direct evidence supplied; this check cannot be treated as PASS.
   Required fix: Update the privacy policy so this requirement is stated clearly and truthfully.
   Verification: Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.

## P1: must resolve or evidence

1. Non-local HTTP endpoint detected
   Evidence: No direct evidence supplied; this check cannot be treated as PASS.
   Required fix: Use HTTPS and validate server certificates.
   Verification: Apply the recommended change or import the required evidence, then rerun the relevant StoreReady scanner. Evidence must show the corrected file/build or an authorized store-platform export.

2. 64-bit native support is not evidenced
   Evidence: No direct evidence supplied; this check cannot be treated as PASS.
   Required fix: Document the intended behavior and make the smallest change needed to satisfy the gate.
   Verification: Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.

3. Google Play memory-vitals compliance is not evidenced
   Evidence: No direct evidence supplied; this check cannot be treated as PASS.
   Required fix: Document the intended behavior and make the smallest change needed to satisfy the gate.
   Verification: Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.

## Completion contract

1. Run the relevant unit/integration checks.
2. Re-run StoreReady on the final source and artifact.
3. Confirm no P0 finding was hidden by a score or warning downgrade.
4. Report changed files, tests, remaining automation, platform and action gates and the new StoreReady status.
