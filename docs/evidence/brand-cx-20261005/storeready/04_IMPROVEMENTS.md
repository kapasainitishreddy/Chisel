# Improvements

Separate required fixes from product and growth improvements.

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

### ACTION_REQUIRED · Target SDK could not be confirmed

- **Store:** Google Play
- **Severity:** REVIEW
- **Issue:** PlayReady could not determine targetSdk from supported Gradle syntax.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Confirm targetSdk in the release module.
- **Fix type:** CONFIG_FIX
- **Automation state:** ACTION_REQUIRED
- **Verification:** Apply the recommended change or import the required evidence, then rerun the relevant StoreReady scanner. Evidence must show the corrected file/build or an authorized store-platform export.

### PLATFORM_REQUIRED · Google Play Health apps declaration is imported

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** Google Play requires the Health apps declaration for published apps, including apps that declare no health features.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Connect/import the platform evidence so StoreReady can verify it automatically.
- **Fix type:** PLATFORM_REQUIRED
- **Automation state:** PLATFORM_REQUIRED
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.

### PLATFORM_REQUIRED · Public HTTPS privacy-policy URL is verified

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** Apple requires a privacy policy URL for all apps; Google requires a complete privacy policy where applicable.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Connect/import the platform evidence so StoreReady can verify it automatically.
- **Fix type:** ACTION_REQUIRED
- **Automation state:** PLATFORM_REQUIRED
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.

### PLATFORM_REQUIRED · Detected feature is missing from supplied store declaration evidence: accounts

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** The required evidence was not supplied.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Document the intended behavior and make the smallest change needed to satisfy the gate.
- **Fix type:** STORE_CONSOLE
- **Automation state:** PLATFORM_REQUIRED
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.

### PLATFORM_REQUIRED · Detected feature is missing from supplied store declaration evidence: health

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** The required evidence was not supplied.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Document the intended behavior and make the smallest change needed to satisfy the gate.
- **Fix type:** STORE_CONSOLE
- **Automation state:** PLATFORM_REQUIRED
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.

### PLATFORM_REQUIRED · Detected feature is missing from supplied store declaration evidence: subscriptions

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** The required evidence was not supplied.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Document the intended behavior and make the smallest change needed to satisfy the gate.
- **Fix type:** STORE_CONSOLE
- **Automation state:** PLATFORM_REQUIRED
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.

### PLATFORM_REQUIRED · Detected feature is missing from supplied store declaration evidence: ugc

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** The required evidence was not supplied.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Document the intended behavior and make the smallest change needed to satisfy the gate.
- **Fix type:** STORE_CONSOLE
- **Automation state:** PLATFORM_REQUIRED
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.

### PLATFORM_REQUIRED · Sensitive permission needs necessity evidence: android.permission.CAMERA

- **Store:** Google Play
- **Severity:** REVIEW
- **Issue:** The required evidence was not supplied.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** android.permission.CAMERA
- **Exact fix:** Document the intended behavior and make the smallest change needed to satisfy the gate.
- **Fix type:** STORE_CONSOLE
- **Automation state:** PLATFORM_REQUIRED
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.

### PLATFORM_REQUIRED · Review camera permission

- **Store:** Google Play
- **Severity:** REVIEW
- **Issue:** Sensitive or policy-relevant permission detected: android.permission.CAMERA.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** android.permission.CAMERA
- **Exact fix:** Verify the permission is core to user-facing functionality, request it contextually, disclose use, and remove it if unnecessary.
- **Fix type:** STORE_CONSOLE
- **Automation state:** PLATFORM_REQUIRED
- **Verification:** Apply the recommended change or import the required evidence, then rerun the relevant StoreReady scanner. Evidence must show the corrected file/build or an authorized store-platform export.

### PLATFORM_REQUIRED · Verify Play Store listing assets

- **Store:** Google Play
- **Severity:** REVIEW
- **Issue:** Confirm 512×512 app icon, 1024×500 feature graphic, compliant screenshots, and truthful metadata.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Use the generated asset brief and validate final screenshots against the real app.
- **Fix type:** STORE_CONSOLE
- **Automation state:** PLATFORM_REQUIRED
- **Verification:** Apply the recommended change or import the required evidence, then rerun the relevant StoreReady scanner. Evidence must show the corrected file/build or an authorized store-platform export.

### AUTOMATION_PENDING · 64-bit native support is not evidenced

- **Store:** Google Play
- **Severity:** HIGH
- **Issue:** The required evidence was not supplied.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Document the intended behavior and make the smallest change needed to satisfy the gate.
- **Fix type:** AUTOMATION_PENDING
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.

### AUTOMATION_PENDING · Google Play memory-vitals compliance is not evidenced

- **Store:** Google Play
- **Severity:** HIGH
- **Issue:** Google evaluates memory and bitmap memory using the last 28 days of Play vitals and RAM-tier thresholds.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Document the intended behavior and make the smallest change needed to satisfy the gate.
- **Fix type:** AUTOMATION_PENDING
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.

### AUTOMATION_PENDING · Account deletion works end to end and the external deletion route is reachable

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** Source evidence exists, but runtime deletion and public web-route evidence are still required.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Enable the missing automated evidence source or connector.
- **Fix type:** AUTOMATION_PENDING
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.

### AUTOMATION_PENDING · AI data handling is disclosed and runtime data flow is verified

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** The required evidence was not supplied.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Enable the missing automated evidence source or connector.
- **Fix type:** AUTOMATION_PENDING
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.

### AUTOMATION_PENDING · Purchase/restore/cancel lifecycle evidence is available

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** The required evidence was not supplied.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Enable the missing automated evidence source or connector.
- **Fix type:** AUTOMATION_PENDING
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.

### AUTOMATION_PENDING · Privacy policy is reachable from the app/product source

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** The required evidence was not supplied.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Enable the missing automated evidence source or connector.
- **Fix type:** ACTION_REQUIRED
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.

### AUTOMATION_PENDING · Release jurisdictions are configured

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** StoreReady cannot run jurisdiction-specific privacy controls without declared release markets.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Enable the missing automated evidence source or connector.
- **Fix type:** ACTION_REQUIRED
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.

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

### AUTOMATION_PENDING · UGC report/block controls work on the release build

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** Static controls were detected; automated runtime evidence is still required.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Enable the missing automated evidence source or connector.
- **Fix type:** AUTOMATION_PENDING
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

### AUTOMATION_PENDING · Runtime privacy data-flow map is missing

- **Store:** Cross-store
- **Severity:** REVIEW
- **Issue:** The required evidence was not supplied.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Document the intended behavior and make the smallest change needed to satisfy the gate.
- **Fix type:** ACTION_REQUIRED
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.

### AUTOMATION_PENDING · Android developer verification must be tracked

- **Store:** Google Play
- **Severity:** REVIEW
- **Issue:** Phase-one enforcement begins September 30, 2026 in Brazil, Indonesia, Singapore and Thailand. Google has announced broader rollout during 2027 without StoreReady inventing an exact global date.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Document the intended behavior and make the smallest change needed to satisfy the gate.
- **Fix type:** AUTOMATION_PENDING
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.

### AUTOMATION_PENDING · Confirm whether the Google closed-testing production-access gate applies

- **Store:** Google Play
- **Severity:** REVIEW
- **Issue:** StoreReady does not guess developer-account type or creation date.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Document the intended behavior and make the smallest change needed to satisfy the gate.
- **Fix type:** AUTOMATION_PENDING
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.

### AUTOMATION_PENDING · Current Android vitals evidence is not imported

- **Store:** Google Play
- **Severity:** REVIEW
- **Issue:** Crash, ANR and wake-lock bad-behavior thresholds can affect Play visibility and quality status.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Document the intended behavior and make the smallest change needed to satisfy the gate.
- **Fix type:** AUTOMATION_PENDING
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.

### AUTOMATION_PENDING · Complete Data Safety from confirmed runtime behavior

- **Store:** Google Play
- **Severity:** REVIEW
- **Issue:** Static SDK/source evidence is insufficient to truthfully determine every collection and sharing answer.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Review every SDK/backend and confirm collection, sharing, purpose, encryption, deletion, and optionality.
- **Fix type:** ACTION_REQUIRED
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Apply the recommended change or import the required evidence, then rerun the relevant StoreReady scanner. Evidence must show the corrected file/build or an authorized store-platform export.

### AUTOMATION_PENDING · AAB release artifact not included

- **Store:** Google Play
- **Severity:** REVIEW
- **Issue:** No Android App Bundle was present in the scanned project. This is an evidence gap, not proof the build cannot produce one.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Generate and install/test the release bundle before production submission.
- **Fix type:** AUTOMATION_PENDING
- **Automation state:** AUTOMATION_PENDING
- **Verification:** Apply the recommended change or import the required evidence, then rerun the relevant StoreReady scanner. Evidence must show the corrected file/build or an authorized store-platform export.


## Optional growth and ASO

- Replace generated listing copy with truthful benefits from the shipped build.
- Localize screenshots and metadata for supported markets.
- Validate icon, screenshots, support URL, privacy URL, and account-deletion URL in each store console.
