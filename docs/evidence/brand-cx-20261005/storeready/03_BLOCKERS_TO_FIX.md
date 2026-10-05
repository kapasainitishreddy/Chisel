# Blockers To Fix

### BLOCKED · Potential embedded secret detected

- **Store:** Google Play
- **Severity:** CRITICAL
- **Issue:** Secret-shaped credential material appears in source.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** [REDACTED API KEY]
- **Exact fix:** Revoke exposed credentials, move secrets server-side or into protected build secrets, and rotate keys.
- **Fix type:** PLATFORM_REQUIRED
- **Autofix:** NO — external evidence or product change required.
- **Verification:** Apply the recommended change or import the required evidence, then rerun the relevant StoreReady scanner. Evidence must show the corrected file/build or an authorized store-platform export.

### BLOCKED · Privacy policy is present and machine-verified

- **Store:** Cross-store
- **Severity:** HIGH
- **Issue:** The required evidence was not supplied.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Correct the detected compliance mismatch and rerun the checker.
- **Fix type:** ACTION_REQUIRED
- **Autofix:** NO — external evidence or product change required.
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.

### BLOCKED · Data categories collected is not automatically verified

- **Store:** Cross-store
- **Severity:** HIGH
- **Issue:** The current privacy policy text did not provide machine-detectable evidence for this requirement.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Update the privacy policy so this requirement is stated clearly and truthfully.
- **Fix type:** ACTION_REQUIRED
- **Autofix:** NO — external evidence or product change required.
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.

### BLOCKED · Consent withdrawal/revocation is not automatically verified

- **Store:** Cross-store
- **Severity:** HIGH
- **Issue:** The current privacy policy text did not provide machine-detectable evidence for this requirement.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Update the privacy policy so this requirement is stated clearly and truthfully.
- **Fix type:** ACTION_REQUIRED
- **Autofix:** NO — external evidence or product change required.
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.

### BLOCKED · Third parties receive equivalent/contractual data protection is not automatically verified

- **Store:** Cross-store
- **Severity:** HIGH
- **Issue:** The current privacy policy text did not provide machine-detectable evidence for this requirement.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Update the privacy policy so this requirement is stated clearly and truthfully.
- **Fix type:** ACTION_REQUIRED
- **Autofix:** NO — external evidence or product change required.
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.

