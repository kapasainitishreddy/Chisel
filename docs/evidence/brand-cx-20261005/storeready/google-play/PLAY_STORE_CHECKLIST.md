# Google Play Submission Checklist

Generated from the current StoreReady evidence. Unexecuted checks remain AUTOMATION_PENDING and must not be treated as PASS. StoreReady does not publish or submit.

- [ ] **PLATFORM_REQUIRED** Policy declarations match the shipped product — Fix type: STORE_CONSOLE. Evidence required: a current source, artifact, device, or store-console record.
- [x] **PASS** Privacy policy and data declarations are complete and evidence-backed — Fix type: AUTOMATED_EVIDENCE. Evidence required: a current source, artifact, device, or store-console record.
- [ ] **ACTION_REQUIRED** Release artifact is present, versioned, signed, and installable — Fix type: DEVICE_TEST. Evidence required: a current source, artifact, device, or store-console record.
- [ ] **ACTION_REQUIRED** Release build passed cold launch, upgrade, offline, error, and crash checks — Fix type: DEVICE_TEST. Evidence required: a current source, artifact, device, or store-console record.
- [ ] **AUTOMATION_PENDING** Accessibility labels, focus order, text scaling, contrast, and touch targets verified — Fix type: DEVICE_TEST. Evidence required: a current source, artifact, device, or store-console record.
- [ ] **PLATFORM_REQUIRED** Listing title, description, icon, screenshots, and support URLs are complete — Fix type: STORE_CONSOLE. Evidence required: a current source, artifact, device, or store-console record.
- [ ] **AUTOMATION_PENDING** Every submitted locale has translated, truthful metadata and screenshots — Fix type: AUTOMATED_EVIDENCE. Evidence required: a current source, artifact, device, or store-console record.
- [ ] **ACTION_REQUIRED** Target SDK, package ID, version code/name — Fix type: STORE_CONSOLE. Evidence required: a current source, artifact, device, or store-console record.
- [ ] **AUTOMATION_PENDING** AAB, 64-bit/native and release-signing validation — Fix type: STORE_CONSOLE. Evidence required: a current source, artifact, device, or store-console record.
- [ ] **AUTOMATION_PENDING** Permissions, foreground services and background-location justification — Fix type: STORE_CONSOLE. Evidence required: a current source, artifact, device, or store-console record.
- [ ] **AUTOMATION_PENDING** Advertising ID, Ads, Families, target audience and content rating — Fix type: STORE_CONSOLE. Evidence required: a current source, artifact, device, or store-console record.
- [ ] **AUTOMATION_PENDING** Account deletion, app access/reviewer credentials and support URLs — Fix type: STORE_CONSOLE. Evidence required: a current source, artifact, device, or store-console record.
- [ ] **AUTOMATION_PENDING** Billing, subscriptions, restore and cancellation state — Fix type: STORE_CONSOLE. Evidence required: a current source, artifact, device, or store-console record.
- [ ] **ACTION_REQUIRED** Play Console pre-launch report and manual gates — Fix type: STORE_CONSOLE. Evidence required: a current source, artifact, device, or store-console record.

## Remaining findings

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

### PASS · Privacy policy evidence detected

- **Store:** Google Play
- **Severity:** PASS
- **Issue:** A privacy-related link or policy reference was detected.
- **Why it matters:** A missing or unresolved gate can cause store rejection, security/privacy risk, or an unverified release outcome.
- **Where/evidence:** No direct evidence supplied; this check cannot be treated as PASS.
- **Exact fix:** Document the intended behavior and make the smallest change needed to satisfy the gate.
- **Fix type:** ACTION_REQUIRED
- **Autofix:** NO — external evidence or product change required.
- **Verification:** Apply the recommended change or import the required evidence, then rerun the relevant StoreReady scanner. Evidence must show the corrected file/build or an authorized store-platform export.

