# Fix Plan

## P0: Do not submit

- Potential embedded secret detected: Revoke exposed credentials, move secrets server-side or into protected build secrets, and rotate keys.
- Privacy policy is present and machine-verified: Correct the detected compliance mismatch and rerun the checker.
- Data categories collected is not automatically verified: Update the privacy policy so this requirement is stated clearly and truthfully.
- Consent withdrawal/revocation is not automatically verified: Update the privacy policy so this requirement is stated clearly and truthfully.
- Third parties receive equivalent/contractual data protection is not automatically verified: Update the privacy policy so this requirement is stated clearly and truthfully.

## P1: Must fix before release

- Non-local HTTP endpoint detected: Use HTTPS and validate server certificates.
- 64-bit native support is not evidenced: Document the intended behavior and make the smallest change needed to satisfy the gate.
- Google Play memory-vitals compliance is not evidenced: Document the intended behavior and make the smallest change needed to satisfy the gate.

## P2: Strongly recommended

- Third-party SDK needs release review: RevenueCat: Document the intended behavior and make the smallest change needed to satisfy the gate.
- Release-code shrinking/obfuscation was not detected: Enable and test R8/minification for the release variant where compatible, retain required keep rules, then inspect the produced artifact.
- Play Integrity integration was not detected: For fraud-sensitive actions, integrate the Play Integrity API and verify the verdict on your backend before granting the protected action.
- Target SDK could not be confirmed: Confirm targetSdk in the release module.
- Google Play Health apps declaration is imported: Connect/import the platform evidence so StoreReady can verify it automatically.
- Public HTTPS privacy-policy URL is verified: Connect/import the platform evidence so StoreReady can verify it automatically.
- Detected feature is missing from supplied store declaration evidence: accounts: Document the intended behavior and make the smallest change needed to satisfy the gate.
- Detected feature is missing from supplied store declaration evidence: health: Document the intended behavior and make the smallest change needed to satisfy the gate.
- Detected feature is missing from supplied store declaration evidence: subscriptions: Document the intended behavior and make the smallest change needed to satisfy the gate.
- Detected feature is missing from supplied store declaration evidence: ugc: Document the intended behavior and make the smallest change needed to satisfy the gate.
- Sensitive permission needs necessity evidence: android.permission.CAMERA: Document the intended behavior and make the smallest change needed to satisfy the gate.
- Review camera permission: Verify the permission is core to user-facing functionality, request it contextually, disclose use, and remove it if unnecessary.
- Verify Play Store listing assets: Use the generated asset brief and validate final screenshots against the real app.
- Account deletion works end to end and the external deletion route is reachable: Enable the missing automated evidence source or connector.
- AI data handling is disclosed and runtime data flow is verified: Enable the missing automated evidence source or connector.
- Purchase/restore/cancel lifecycle evidence is available: Enable the missing automated evidence source or connector.
- Privacy policy is reachable from the app/product source: Enable the missing automated evidence source or connector.
- Release jurisdictions are configured: Enable the missing automated evidence source or connector.
- Security checker has no blocking findings: Enable the missing automated evidence source or connector.
- UGC report/block controls work on the release build: Enable the missing automated evidence source or connector.
- Security scanner coverage gap: Run the missing automated evidence source and rerun StoreReady.
- Security scanner coverage gap: Run the missing automated evidence source and rerun StoreReady.
- Security scanner coverage gap: Run the missing automated evidence source and rerun StoreReady.
- Security scanner coverage gap: Run the missing automated evidence source and rerun StoreReady.
- Security scanner coverage gap: Run the missing automated evidence source and rerun StoreReady.
- Security scanner coverage gap: Run the missing automated evidence source and rerun StoreReady.
- Security scanner coverage gap: Run the missing automated evidence source and rerun StoreReady.
- Security scanner coverage gap: Run the missing automated evidence source and rerun StoreReady.
- Exact release artifact security evidence is missing: Run the missing automated evidence source and rerun StoreReady.
- Runtime security/privacy evidence is missing: Run the missing automated evidence source and rerun StoreReady.
- Exported Android components are explicitly reviewed: Run the missing automated evidence source and rerun StoreReady.
- Evidence coverage gap: Run the missing automated scanner, artifact or runtime evidence source and rerun StoreReady.
- Evidence coverage gap: Run the missing automated scanner, artifact or runtime evidence source and rerun StoreReady.
- Evidence coverage gap: Run the missing automated scanner, artifact or runtime evidence source and rerun StoreReady.
- Evidence coverage gap: Run the missing automated scanner, artifact or runtime evidence source and rerun StoreReady.
- Evidence coverage gap: Run the missing automated scanner, artifact or runtime evidence source and rerun StoreReady.
- Evidence coverage gap: Run the missing automated scanner, artifact or runtime evidence source and rerun StoreReady.
- Evidence coverage gap: Run the missing automated scanner, artifact or runtime evidence source and rerun StoreReady.
- Evidence coverage gap: Run the missing automated scanner, artifact or runtime evidence source and rerun StoreReady.
- Critical release journey is not fully evidenced: account-lifecycle: Document the intended behavior and make the smallest change needed to satisfy the gate.
- Critical release journey is not fully evidenced: adverse-network: Document the intended behavior and make the smallest change needed to satisfy the gate.
- Critical release journey is not fully evidenced: deep-link-notification: Document the intended behavior and make the smallest change needed to satisfy the gate.
- Critical release journey is not fully evidenced: privacy-permission: Document the intended behavior and make the smallest change needed to satisfy the gate.
- Critical release journey is not fully evidenced: reviewer-mode: Document the intended behavior and make the smallest change needed to satisfy the gate.
- Critical release journey is not fully evidenced: subscription-journey: Document the intended behavior and make the smallest change needed to satisfy the gate.
- Runtime privacy data-flow map is missing: Document the intended behavior and make the smallest change needed to satisfy the gate.
- Android developer verification must be tracked: Document the intended behavior and make the smallest change needed to satisfy the gate.
- Confirm whether the Google closed-testing production-access gate applies: Document the intended behavior and make the smallest change needed to satisfy the gate.
- Current Android vitals evidence is not imported: Document the intended behavior and make the smallest change needed to satisfy the gate.
- Complete Data Safety from confirmed runtime behavior: Review every SDK/backend and confirm collection, sharing, purpose, encryption, deletion, and optionality.
- AAB release artifact not included: Generate and install/test the release bundle before production submission.

## P3: Optimization

- Improve ASO, screenshots, localization, conversion copy, and polish after release gates pass.
