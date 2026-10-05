# UI/UX Findings

### AUTOMATION_PENDING · Evidence coverage gap

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** gitleaks: not installed
- **Why it matters:** undefined
- **Where/evidence:** The run recorded this gap but did not execute or receive the required evidence.
- **Exact fix:** Run the missing automated scanner, artifact or runtime evidence source and rerun StoreReady.
- **Fix type:** AUTOMATED_EVIDENCE
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Re-run StoreReady with the resulting evidence input; the gap must disappear before this check can become PASS.

### AUTOMATION_PENDING · Evidence coverage gap

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** osv: not installed
- **Why it matters:** undefined
- **Where/evidence:** The run recorded this gap but did not execute or receive the required evidence.
- **Exact fix:** Run the missing automated scanner, artifact or runtime evidence source and rerun StoreReady.
- **Fix type:** AUTOMATED_EVIDENCE
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Re-run StoreReady with the resulting evidence input; the gap must disappear before this check can become PASS.

### AUTOMATION_PENDING · Evidence coverage gap

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** trivy: not installed
- **Why it matters:** undefined
- **Where/evidence:** The run recorded this gap but did not execute or receive the required evidence.
- **Exact fix:** Run the missing automated scanner, artifact or runtime evidence source and rerun StoreReady.
- **Fix type:** AUTOMATED_EVIDENCE
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Re-run StoreReady with the resulting evidence input; the gap must disappear before this check can become PASS.

### AUTOMATION_PENDING · Evidence coverage gap

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** opengrep: not installed
- **Why it matters:** undefined
- **Where/evidence:** The run recorded this gap but did not execute or receive the required evidence.
- **Exact fix:** Run the missing automated scanner, artifact or runtime evidence source and rerun StoreReady.
- **Fix type:** AUTOMATED_EVIDENCE
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Re-run StoreReady with the resulting evidence input; the gap must disappear before this check can become PASS.

### AUTOMATION_PENDING · Evidence coverage gap

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** syft: unavailable
- **Why it matters:** undefined
- **Where/evidence:** The run recorded this gap but did not execute or receive the required evidence.
- **Exact fix:** Run the missing automated scanner, artifact or runtime evidence source and rerun StoreReady.
- **Fix type:** AUTOMATED_EVIDENCE
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Re-run StoreReady with the resulting evidence input; the gap must disappear before this check can become PASS.

### AUTOMATION_PENDING · Evidence coverage gap

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** grype: unavailable
- **Why it matters:** undefined
- **Where/evidence:** The run recorded this gap but did not execute or receive the required evidence.
- **Exact fix:** Run the missing automated scanner, artifact or runtime evidence source and rerun StoreReady.
- **Fix type:** AUTOMATED_EVIDENCE
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Re-run StoreReady with the resulting evidence input; the gap must disappear before this check can become PASS.

### AUTOMATION_PENDING · Evidence coverage gap

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** zizmor: unavailable
- **Why it matters:** undefined
- **Where/evidence:** The run recorded this gap but did not execute or receive the required evidence.
- **Exact fix:** Run the missing automated scanner, artifact or runtime evidence source and rerun StoreReady.
- **Fix type:** AUTOMATED_EVIDENCE
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Re-run StoreReady with the resulting evidence input; the gap must disappear before this check can become PASS.

### AUTOMATION_PENDING · Evidence coverage gap

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** actionlint: unavailable
- **Why it matters:** undefined
- **Where/evidence:** The run recorded this gap but did not execute or receive the required evidence.
- **Exact fix:** Run the missing automated scanner, artifact or runtime evidence source and rerun StoreReady.
- **Fix type:** AUTOMATED_EVIDENCE
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Re-run StoreReady with the resulting evidence input; the gap must disappear before this check can become PASS.

### AUTOMATION_PENDING · Critical release journey is not fully evidenced: account-lifecycle

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** Missing steps: signup, login, logout, recovery, data-export, account-deletion.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Document the intended behavior and make the smallest change needed to satisfy the gate.
- **Fix type:** DEVICE_TEST
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.

### AUTOMATION_PENDING · Critical release journey is not fully evidenced: adverse-network

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** Missing steps: cold-launch, offline-launch, poor-network, recovery.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Document the intended behavior and make the smallest change needed to satisfy the gate.
- **Fix type:** DEVICE_TEST
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.

### AUTOMATION_PENDING · Critical release journey is not fully evidenced: deep-link-notification

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** Missing steps: deep-link, notification-open, invalid-link, logged-out-link.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Document the intended behavior and make the smallest change needed to satisfy the gate.
- **Fix type:** DEVICE_TEST
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.

### AUTOMATION_PENDING · Critical release journey is not fully evidenced: privacy-permission

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** Missing steps: deny, continue-after-denial, grant, revoke, restart.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Document the intended behavior and make the smallest change needed to satisfy the gate.
- **Fix type:** ACTION_REQUIRED
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.

### AUTOMATION_PENDING · Critical release journey is not fully evidenced: reviewer-mode

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** Missing steps: reviewer-login, core-feature, premium-path, privacy, account-settings.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Document the intended behavior and make the smallest change needed to satisfy the gate.
- **Fix type:** ACTION_REQUIRED
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.

### AUTOMATION_PENDING · Critical release journey is not fully evidenced: subscription-journey

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** Missing steps: purchase, entitlement, restart, restore, cancel, expire.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Document the intended behavior and make the smallest change needed to satisfy the gate.
- **Fix type:** DEVICE_TEST
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.

