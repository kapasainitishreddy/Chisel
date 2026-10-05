# Resubmission Pack

## Reviewer issue

No rejection message supplied.

## Blockers fixed before resubmission

- [ ] Potential embedded secret detected | Fix: Revoke exposed credentials, move secrets server-side or into protected build secrets, and rotate keys.
- [ ] Privacy policy is present and machine-verified | Fix: Correct the detected compliance mismatch and rerun the checker.
- [ ] Data categories collected is not automatically verified | Fix: Update the privacy policy so this requirement is stated clearly and truthfully.
- [ ] Consent withdrawal/revocation is not automatically verified | Fix: Update the privacy policy so this requirement is stated clearly and truthfully.
- [ ] Third parties receive equivalent/contractual data protection is not automatically verified | Fix: Update the privacy policy so this requirement is stated clearly and truthfully.

## Automation/platform/action gates still required

- [ ] Non-local HTTP endpoint detected | Verify: Apply the recommended change or import the required evidence, then rerun the relevant StoreReady scanner. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Third-party SDK needs release review: RevenueCat | Verify: Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Release-code shrinking/obfuscation was not detected | Verify: Apply the recommended change or import the required evidence, then rerun the relevant StoreReady scanner. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Play Integrity integration was not detected | Verify: Apply the recommended change or import the required evidence, then rerun the relevant StoreReady scanner. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Target SDK could not be confirmed | Verify: Apply the recommended change or import the required evidence, then rerun the relevant StoreReady scanner. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Google Play Health apps declaration is imported | Verify: Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Public HTTPS privacy-policy URL is verified | Verify: Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Detected feature is missing from supplied store declaration evidence: accounts | Verify: Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Detected feature is missing from supplied store declaration evidence: health | Verify: Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Detected feature is missing from supplied store declaration evidence: subscriptions | Verify: Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Detected feature is missing from supplied store declaration evidence: ugc | Verify: Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Sensitive permission needs necessity evidence: android.permission.CAMERA | Verify: Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Review camera permission | Verify: Apply the recommended change or import the required evidence, then rerun the relevant StoreReady scanner. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Verify Play Store listing assets | Verify: Apply the recommended change or import the required evidence, then rerun the relevant StoreReady scanner. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] 64-bit native support is not evidenced | Verify: Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Google Play memory-vitals compliance is not evidenced | Verify: Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Account deletion works end to end and the external deletion route is reachable | Verify: Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] AI data handling is disclosed and runtime data flow is verified | Verify: Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Purchase/restore/cancel lifecycle evidence is available | Verify: Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Privacy policy is reachable from the app/product source | Verify: Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Release jurisdictions are configured | Verify: Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Security checker has no blocking findings | Verify: Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] UGC report/block controls work on the release build | Verify: Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Security scanner coverage gap | Verify: Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Security scanner coverage gap | Verify: Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Security scanner coverage gap | Verify: Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Security scanner coverage gap | Verify: Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Security scanner coverage gap | Verify: Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Security scanner coverage gap | Verify: Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Security scanner coverage gap | Verify: Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Security scanner coverage gap | Verify: Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Exact release artifact security evidence is missing | Verify: Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Runtime security/privacy evidence is missing | Verify: Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Exported Android components are explicitly reviewed | Verify: Apply the recommended change or import the required evidence, then rerun storeready.autonomous. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Evidence coverage gap | Verify: Re-run StoreReady with the resulting evidence input; the gap must disappear before this check can become PASS.
- [ ] Evidence coverage gap | Verify: Re-run StoreReady with the resulting evidence input; the gap must disappear before this check can become PASS.
- [ ] Evidence coverage gap | Verify: Re-run StoreReady with the resulting evidence input; the gap must disappear before this check can become PASS.
- [ ] Evidence coverage gap | Verify: Re-run StoreReady with the resulting evidence input; the gap must disappear before this check can become PASS.
- [ ] Evidence coverage gap | Verify: Re-run StoreReady with the resulting evidence input; the gap must disappear before this check can become PASS.
- [ ] Evidence coverage gap | Verify: Re-run StoreReady with the resulting evidence input; the gap must disappear before this check can become PASS.
- [ ] Evidence coverage gap | Verify: Re-run StoreReady with the resulting evidence input; the gap must disappear before this check can become PASS.
- [ ] Evidence coverage gap | Verify: Re-run StoreReady with the resulting evidence input; the gap must disappear before this check can become PASS.
- [ ] Critical release journey is not fully evidenced: account-lifecycle | Verify: Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Critical release journey is not fully evidenced: adverse-network | Verify: Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Critical release journey is not fully evidenced: deep-link-notification | Verify: Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Critical release journey is not fully evidenced: privacy-permission | Verify: Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Critical release journey is not fully evidenced: reviewer-mode | Verify: Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Critical release journey is not fully evidenced: subscription-journey | Verify: Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Runtime privacy data-flow map is missing | Verify: Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.
- [ ] Android developer verification must be tracked | Verify: Apply the recommended change or import the required evidence, then rerun storeready.painpoints. Evidence must show the corrected file/build or an authorized store-platform export.

## Reviewer notes checklist

- [ ] Explain only the changes relevant to the rejection.
- [ ] Provide valid reviewer access without exposing credentials in this report.
- [ ] Identify where the reviewer can find the corrected feature.
- [ ] Reference the exact submitted build/version.
- [ ] Re-run StoreReady against the final artifact and preserve the evidence pack.
