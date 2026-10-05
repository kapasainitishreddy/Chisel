# Security Report

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

### ACTION_REQUIRED · Non-local HTTP endpoint detected

- **Store:** Google Play
- **Severity:** HIGH
- **Issue:** Plain HTTP may expose user or device data in transit.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Use HTTPS and validate server certificates.
- **Fix type:** CODE_FIX
- **Automation state:** ACTION_REQUIRED
- **Verification:** Apply the recommended change or import the required evidence, then rerun the relevant StoreReady scanner. Evidence must show the corrected file/build or an authorized store-platform export.

### ACTION_REQUIRED · Third-party SDK needs release review: RevenueCat

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** Detected SDK category: purchases.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Document the intended behavior and make the smallest change needed to satisfy the gate.
- **Fix type:** CODE_FIX
- **Automation state:** ACTION_REQUIRED
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.

### ACTION_REQUIRED · Release-code shrinking/obfuscation was not detected

- **Store:** Google Play
- **Severity:** REVIEW
- **Issue:** No enabled Android minify/R8 marker was found in parsed Gradle files. Source inspection cannot determine the final AAB/APK protection configuration.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Enable and test R8/minification for the release variant where compatible, retain required keep rules, then inspect the produced artifact.
- **Fix type:** CONFIG_FIX
- **Automation state:** ACTION_REQUIRED
- **Verification:** Apply the recommended change or import the required evidence, then rerun the relevant StoreReady scanner. Evidence must show the corrected file/build or an authorized store-platform export.

### ACTION_REQUIRED · Play Integrity integration was not detected

- **Store:** Google Play
- **Severity:** REVIEW
- **Issue:** No Play Integrity client integration was found in the scanned source. This is not a store requirement, but high-value actions remain easier to abuse from modified, repackaged, rooted, or emulated clients without server-verified integrity evidence.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** For fraud-sensitive actions, integrate the Play Integrity API and verify the verdict on your backend before granting the protected action.
- **Fix type:** CONFIG_FIX
- **Automation state:** ACTION_REQUIRED
- **Verification:** Apply the recommended change or import the required evidence, then rerun the relevant StoreReady scanner. Evidence must show the corrected file/build or an authorized store-platform export.

### AUTOMATION_PENDING · Security checker has no blocking findings

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** The required evidence was not supplied.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Enable the missing automated evidence source or connector.
- **Fix type:** CODE_FIX
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.

### AUTOMATION_PENDING · Security scanner coverage gap

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** gitleaks: not installed
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Run the missing automated evidence source and rerun StoreReady.
- **Fix type:** CODE_FIX
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.

### AUTOMATION_PENDING · Security scanner coverage gap

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** osv: not installed
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Run the missing automated evidence source and rerun StoreReady.
- **Fix type:** CODE_FIX
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.

### AUTOMATION_PENDING · Security scanner coverage gap

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** trivy: not installed
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Run the missing automated evidence source and rerun StoreReady.
- **Fix type:** CODE_FIX
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.

### AUTOMATION_PENDING · Security scanner coverage gap

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** opengrep: not installed
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Run the missing automated evidence source and rerun StoreReady.
- **Fix type:** CODE_FIX
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.

### AUTOMATION_PENDING · Security scanner coverage gap

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** syft: unavailable
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Run the missing automated evidence source and rerun StoreReady.
- **Fix type:** CODE_FIX
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.

### AUTOMATION_PENDING · Security scanner coverage gap

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** grype: unavailable
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Run the missing automated evidence source and rerun StoreReady.
- **Fix type:** CODE_FIX
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.

### AUTOMATION_PENDING · Security scanner coverage gap

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** zizmor: unavailable
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Run the missing automated evidence source and rerun StoreReady.
- **Fix type:** CODE_FIX
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.

### AUTOMATION_PENDING · Security scanner coverage gap

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** actionlint: unavailable
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Run the missing automated evidence source and rerun StoreReady.
- **Fix type:** CODE_FIX
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.

### AUTOMATION_PENDING · Exact release artifact security evidence is missing

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** Inspect the exact APK/AAB/IPA used for release.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Run the missing automated evidence source and rerun StoreReady.
- **Fix type:** CODE_FIX
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.

### AUTOMATION_PENDING · Runtime security/privacy evidence is missing

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** Execute the release build and import runtime/network evidence.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Run the missing automated evidence source and rerun StoreReady.
- **Fix type:** ACTION_REQUIRED
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.

### AUTOMATION_PENDING · Exported Android components are explicitly reviewed

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** activity:.MainActivity
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Run the missing automated evidence source and rerun StoreReady.
- **Fix type:** CODE_FIX
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.

### PASS · Compromised-device detection evidence detected

- **Store:** Google Play
- **Severity:** PASS
- **Issue:** Source includes root/jailbreak-detection indicators. Keep protected authorization decisions on the server because client-side checks can be bypassed.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Document the intended behavior and make the smallest change needed to satisfy the gate.
- **Fix type:** CODE_FIX
- **Autofix:** NO — external evidence or product change required.
- **Verification:** Apply the recommended change or import the required evidence, then rerun the relevant StoreReady scanner. Evidence must show the corrected file/build or an authorized store-platform export.

### PASS · Global cleartext traffic not enabled

- **Store:** Google Play
- **Severity:** PASS
- **Issue:** No usesCleartextTraffic=true marker found.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Document the intended behavior and make the smallest change needed to satisfy the gate.
- **Fix type:** CONFIG_FIX
- **Autofix:** NO — external evidence or product change required.
- **Verification:** Apply the recommended change or import the required evidence, then rerun the relevant StoreReady scanner. Evidence must show the corrected file/build or an authorized store-platform export.


Coverage gaps: gitleaks: not installed; osv: not installed; trivy: not installed; opengrep: not installed; syft: unavailable; grype: unavailable; zizmor: unavailable; actionlint: unavailable
