# Chisel branding, RevenueCat and customer experience

Date: 5 October 2026. Application SHA: **3ace5b5c845c2d3beadf77b492f8f8e41626b62d**. Starting source: **67486b7af44d4d67bee2a3ec0f2d786d5c127083**, the remotely verified feature-polish branch continuing the recovered newerChisel configuration. The earlier all-branch/PR comparison and recovered task provenance remain in [Play readiness report](PLAY_READINESS_REPORT.md). Main (1c08c6ef) was not selected as latest. Unrelated work is preserved.

Publication branch: `fix/brand-revenuecat-customer-experience-20261005`. This is code/branding/documentation work. No purchase, paid activation, credentials, signing key, console declaration, submission, public deployment, merge or force push was performed.

## Changes in the actual app

- Original generated transparent C/chisel logo in the masthead and web boot screen; authored SVG companion for favicon and Android adaptive/density launcher icons. Brand details and reproduction are in [BRAND](BRAND.md).
- Optional inline getting-started choices open scanning, routines and styles. The delayed first-use identity popup was removed; personalization is explicitly opened and can be closed with a real button. Dismissal persists locally. The photo hero fits its phone container without horizontal overflow.
- Native dialogs own keyboard focus/Escape when opened above a parent overlay. Account/credit dialogs can reopen safely and preserve their original return-focus target.
- Legacy Premium purchase and restore share a busy lock. Pending/unconfirmed results stay explicit; repeated taps cannot launch overlapping native operations. Late offering replies after close are discarded. Product titles are inserted as text, rather than untrusted HTML.
- Simple recurring offers show the actual local store charge, billing period, automatic renewal and free local access. Missing prices/terms, consumables, prepaid/installment offers and introductory phases cannot be purchased through this legacy UI until their full disclosures are implemented. Settings and Premium include direct Google Play management/cancellation links.
- Credit packs show “Store price unavailable” rather than planned dollar prices. Credit recovery is explained separately from Premium restoration. The active credit path takes precedence over the legacy Premium entry. Existing server-authoritative balances, receipt verification and billing-off flags remain intact.

## RevenueCat and growth findings

The SDK code and installed type definitions were audited against [RevenueCat's consumable guidance](https://www.revenuecat.com/docs/platform-resources/non-subscriptions) and [restoration guidance](https://www.revenuecat.com/docs/getting-started/restoring-purchases). Dashboard projects, offerings, entitlement mappings, customer receipts and live webhooks were **not verified**: discovery twice produced unrelated toolkit results and no relevant authorized account action. No unrelated connection was initiated. The legacy public key remains empty and sales remain disabled.

[Growth strategy](GROWTH_STRATEGY.md) contains the evidence from Duolingo, Photoroom, Pixelcut and RevenueCat, proposed four-week experiments, content hooks, measurement definitions and margin/CAC guardrails. These are hypotheses and prepared work, not launched campaigns or measured growth. No analytics or attribution SDK was added. Chisel's consumable packs should not be turned into subscriptions just because another app's subscription variant won an experiment.

Google's current [subscription policy](https://support.google.com/googleplay/android-developer/answer/9900533?hl=en) requires clear price, billing cycle, renewal, trial and cancellation information; one-time value should use an in-app product. The legacy UI blocks unsupported complex terms. [Billing security guidance](https://developer.android.com/google/play/billing/security) supports verified, deduplicated backend grants rather than client balance changes.

## Verification gates

| Gate | Status | Evidence |
|---|---|---|
| Baseline suite | PASS, 329 tests | [baseline](evidence/brand-cx-20261005/baseline.log) |
| New purchase regressions | PASS, four; all four fail on original source | [baseline failures](evidence/brand-cx-20261005/reproduction.log), [fixed suite](evidence/brand-cx-20261005/tests.log) |
| Final tests/build | PASS, 333 tests / 46 modules | [tests](evidence/brand-cx-20261005/tests.log), [build](evidence/brand-cx-20261005/build.log) |
| Frozen clean application SHA install/test/build | PASS, 333 tests / 46 modules | [install](evidence/brand-cx-20261005/clean-install.log), [tests](evidence/brand-cx-20261005/clean-tests.log), [build](evidence/brand-cx-20261005/clean-build.log) |
| CX browser | PASS, 21 checks, 360/430/1280 px | [report/screenshots](evidence/brand-cx-20261005/browser/report.json) |
| Tracker/scan/trainer browser | PASS, 33 checks | [report](evidence/brand-cx-20261005/features/report.json) |
| Completion/private tools browser | PASS, 17 checks | [report](evidence/brand-cx-20261005/completion/report.json) |
| Offline policy/return browser | PASS, two checks | [report](evidence/brand-cx-20261005/privacy/report.json) |
| Android source/resources/release manifest | PASS, 220 Gradle tasks | [native log](evidence/brand-cx-20261005/native-final.log) |
| App commit secret scan | PASS, Gitleaks 8.30.1 / no leaks | [log](evidence/brand-cx-20261005/gitleaks-app.log) |
| Actual StoreReady assurance | BLOCKED; 3 PASS / 5 BLOCKED / 5 ACTION_REQUIRED / 9 PLATFORM_REQUIRED / 40 AUTOMATION_PENDING | [raw report](evidence/brand-cx-20261005/storeready/report.json), [scorecard](evidence/brand-cx-20261005/storeready/01_RELEASE_SCORECARD.md) |
| Live RevenueCat/Play/OTP/deletion/provider acceptance | NOT RUN | No account access, licensed device/store acceptance or operational proof |
| Signed AAB, physical Android/16 KB, empirical scan/training accuracy | NOT RUN / BLOCKED | Existing release gates remain |

Node tests ran with permissions required for real child processes. Commands: `npm test`, `npm run build`; clean verification used `git archive` of the application SHA and `npm ci --ignore-scripts`. Browser commands: `node tests/customer-experience-browser.mjs`, `node tests/feature-polish-browser.mjs`, `node tests/completion-browser.mjs`, `node tests/play-privacy-browser.mjs`, using local Chromium and the existing QA-only Puppeteer installation. Browser store/camera/model/account signals are explicit fixtures; no real purchase, OTP or photo accuracy claim follows. Harnesses now explicitly open optional personalization after the boot overlay ends. Earlier exploratory harness races and the intentionally failing baseline are not counted as passing gates.

Android command: `python3 /workspace/chisel-play-toolchain/run-native.py :app:compileDebugSources :app:compileReleaseSources :app:processReleaseManifest`. These are source/resource/manifest tasks, not installable artifacts, instrumented tests or device tests. The current [target SDK requirement](https://developer.android.com/google/play/requirements/target-sdk) is API 36 for ordinary new apps/updates from August 31, 2026; Chisel targets/compiles 36. Exact signed artifact and [16 KB compatibility](https://developer.android.com/guide/practices/page-sizes) acceptance remain pending.

StoreReady version/commit and exact invocation are in [source/results](evidence/brand-cx-20261005/source-and-results.json). This is an actual scanner run, not a manual equivalent. Exit 1 reflects BLOCKED, not scanner startup failure. Its framework detector reports unknown for the repository root, so platform categories marked not applicable are not treated as proof. Independent native/manual checks and the earlier complete readiness report remain necessary. Raw public/reference-key heuristics and operational/privacy action gates are preserved, with prior candidate triage linked from the earlier report. Final signed-artifact Data Safety/privacy, account deletion/backend deployment, health declarations, store listing and licensed purchase/restore/refund/device acceptance remain release blockers.

Working evidence: `/workspace/chisel-cx-evidence`; clean checkout: `/workspace/chisel-cx-clean`. A final publication receipt and final report SHA are recorded outside the Git commit at `/workspace/chisel-cx-evidence/publication-receipt.json` and `/workspace/chisel-cx-report.md` after remote verification.

Publication secret review: Gitleaks 8.30.1 over application + report commits produced two candidates in `SHA256SUMS.json`, at lines 64 and 104. Both values exactly match recomputed SHA-256 hashes of `storeready/security/SECRETS_CHECK.md` and `storeready/painpoints/GOOGLE_PRODUCTION_ACCESS.md`. These are reproducible file checksums, not credentials. The app commit has no findings. [Raw redacted publication scan](evidence/brand-cx-20261005/gitleaks-publication.json) and [individual verification](evidence/brand-cx-20261005/secret-triage.json) are retained; scanner findings were not hidden or relabeled as a zero-finding result.
