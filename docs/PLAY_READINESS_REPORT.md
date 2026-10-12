# Chisel — StoreReady Google Play readiness audit

Date: 4 October 2026. **Release decision: BLOCKED.** This is an actual StoreReady source scan plus independent code, dependency, browser and native verification. It is not a Play approval, a final signed-artifact scan, a real purchase/deletion test, or a physical-device acceptance report.

## Source provenance and preserved work

Repository: https://github.com/kapasainitishreddy/Chisel. Starting retained branch `work`: **efebe81813f6cfa9ef68472f3f5edf7c0b7b21f0**; application checkpoint **bf826193988e91c2edc457b3ab405352594857e2**. Its report, 312-test logs and debug APK are present. This resolves the delegated task's unknown later local SHA: the later task work was recovered and audited, rather than replaced with a remote-baseline-only audit.

Fetched all 13 remote branches and compared every head's ancestry against both retained HEAD and current `main`. Queried all nine PRs, including closed/merged ones. Current remote `main` is **1c08c6efa8ed5696e16fd0d288ca2cb62f41f85f**, nine commits behind the retained checkpoint. PR #7's head is an ancestor of `main`; #8 is a divergent older Platinum UI proposal; #9 is a divergent documentation-only proposal. Several older feature branches also diverge. Date alone was not used to select source, and these unrelated proposals were not merged or overwritten. Full heads/counts and PR metadata are in the accompanying evidence.

Read repository `AGENTS.md`, current shared handoffs and relevant release/lifecycle/privacy guides. `/workspace/.agents` is empty; the app has no `.agents/skills` directory. No missing task-local changes were invented. The retained newer Chisel release flags remain **billingEnabled=false, cloudPhotoRendersEnabled=true**. Target/compile API remain 36 and min API remains 23.

Fix branch: `fix/storeready-play-readiness-20261004`. Tested application commit: **c87f20b8239c9e41b62ec33b72e0e02081054057**. Final published branch SHA: **See the documentation-inclusive branch head and standalone publication receipt; tested application SHA above is fixed.**. The report in the repository identifies the tested code SHA; the standalone publication receipt records the final documentation-inclusive SHA and remote verification.

## StoreReady execution and limits

Authorized GitHub access retrieved the private `kapasainitishreddy/play-store-ready-vibe-coded-apps` repository and its actual scanner/checklist. Checked-out scanner commit **16e71ad3dcf32daa782ad9294ff85f668747e9ac**, root version **2.1.0**, CLI/core package versions **1.0.0**, Node **24.19.0**. Scanner source remained outside Chisel and was not published.

Successful baseline invocation (exit 1 means its BLOCKED release gate):

```sh
node /workspace/StoreReady/packages/cli/bin/storeready.mjs scan /workspace/Chisel --home /workspace/chisel-play-evidence/store-home --out /workspace/chisel-play-evidence/storeready-baseline-scan.json
node /workspace/StoreReady/packages/cli/bin/storeready.mjs assure /workspace/Chisel --stores google-play --home /workspace/chisel-play-evidence/store-home --out /workspace/chisel-play-evidence/storeready-baseline
```

The first attempt hit StoreReady's default home-directory write error; `--home` resolved it without changing host configuration. The same `assure` command was rerun into `storeready-final-comparable`. An additional final run enabled checksum-verified Gitleaks 8.30.1 on PATH and passed the actual current privacy-policy file:

```sh
PATH=/workspace/chisel-play-toolchain:$PATH node /workspace/StoreReady/packages/cli/bin/storeready.mjs assure /workspace/Chisel --stores google-play --privacy-policy-file /workspace/Chisel/docs/privacy-policy.html --home /workspace/chisel-play-evidence/store-home --out /workspace/chisel-play-evidence/storeready-final
```

All raw reports and complete generated master checklists are preserved. Counts are **baseline {'PASS': 2, 'BLOCKED': 2, 'ACTION_REQUIRED': 6, 'PLATFORM_REQUIRED': 9, 'AUTOMATION_PENDING': 40, 'NOT_APPLICABLE': 0}; same-tool final {'PASS': 2, 'BLOCKED': 5, 'ACTION_REQUIRED': 6, 'PLATFORM_REQUIRED': 9, 'AUTOMATION_PENDING': 40, 'NOT_APPLICABLE': 0}; Gitleaks/policy-enhanced final {'PASS': 2, 'BLOCKED': 42, 'ACTION_REQUIRED': 6, 'PLATFORM_REQUIRED': 9, 'AUTOMATION_PENDING': 37, 'NOT_APPLICABLE': 0}**. Additional tool/policy coverage introduces more findings; a higher raw count does not mean the code regressions returned. Neither scanner output nor manual triage was rewritten into a green StoreReady result.

Scanner limitations verified against real source:

- `targetSdk` is reported unknown because this parser does not resolve `rootProject.ext.targetSdkVersion` from `variables.gradle`. Native merged-manifest evidence is used for independent verification, without changing Gradle just to satisfy a regex.
- The HTTP finding includes SVG/XML namespace strings such as `http://www.w3.org/2000/svg`, archived design references and deliberately opt-in localhost development CORS. Production Capacitor mixed-content and global cleartext are disabled. No production plaintext endpoint was identified.
- Secret candidates are inherited Google Stitch page configuration, intentionally public Supabase publishable keys and example header spans containing that same public key. Gitleaks findings are redacted and individually triaged; no Chisel provider/service-role/private signing credential was identified in the worktree or unpublished fix range. No credentials were changed or revoked. The unrelated archived assets were preserved.
- Static policy parsing does not establish legal retention, provider protection, all collection categories or consent withdrawal. These missing proofs stay blocked/action-required. Source keyword matches for subscriptions/UGC are reviewed against actual disabled paid paths and the app's lack of a user-posting service; keyword detections are not console declarations.
- Missing OSV, Trivy, Opengrep, Syft/Grype, actionlint/zizmor, exact-artifact security and Android runtime evidence remain explicit coverage gaps. R8, root detection and Play Integrity are review/hardening suggestions, not blanket Google Play submission requirements. They were not enabled solely to change scanner scores.

## Verified fixes

1. **Deprecated native billing dependency.** Baseline packaged manifest and merger log resolve Play Billing **7.0.0** despite purchases being disabled. Google's normal Billing 7 submission deadline passed on 31 August 2026; no account extension was assumed. Upgraded the maintained RevenueCat bridge **9.1.0 → 11.0.0**, the first upstream Billing-8 release, with compatible Capacitor **7.6.9** and matching version-7 native plugins. RevenueCat hybrid common 15.0.0 → purchases 9.1.0 → Billing 8.0.0 is independently supported by saved upstream Maven POMs. Kept API 36, min API 23 and release feature flags. Updated AndroidX migration values, Java 21 CI and Kotlin 2.0.21; removed the officially obsolete `bundledWebRuntime=false` field. No dashboard/product/key settings changed.
2. **Unverified subscription success/restore.** The actual legacy paywall announced Premium and closed after any resolved purchase/restore callback, even an empty entitlement map. It now requires `premium.isActive === true`, keeps the paywall open with a truthful status otherwise, rejects direct purchase/restore when the release flag is off, and uses the same predicate for render entitlement identity. Consumable wallet balances continue to come only from the authenticated server; local callbacks do not mint credits.
3. **Automatic backup/device-transfer gap.** `allowBackup=false` alone does not block device transfers on every target-31+ vendor device. Added explicit legacy backup exclusions and modern cloud/device-transfer exclusions for all ordinary and device-protected storage domains. This protects photos, WebView local/IndexedDB records and preferences. It does not turn active storage into an encrypted biometric vault.
4. **Stale in-app privacy destination/copy.** The app linked the older `main` policy and said email/account management did not send anything off-device. It now bundles the current policy, links it locally, explains optional email/account traffic and disabled paid creation, and discloses optional local notifications. A regression checks canonical policy equality; Chromium checks local policy navigation with external requests denied. The public store policy URL and production retention still need separate acceptance.
5. **Release inspection blocked by signing guard.** The old guard rejected every task whose name contained `release`, including code/manifest inspection. It now checks the task graph for actual release distribution/signing tasks, including umbrella tasks, while allowing compilation/manifest inspection. The upload-key requirement remains enforced before distribution tasks execute.
6. **Development dependency advisories.** The supported CLI upgrade and normal non-forced lockfile remediation remove the baseline **9 advisories (1 critical, 6 high, 2 moderate)**. Full and production npm audits now each report **0**. These results cover npm's advisory database at this audit time, not every native Maven dependency or missing SCA tool.

## Verification actually performed

- Baseline: `npm test`: **312 passed**, zero failed/skipped; `npm run build`: **46 modules**, inline scripts and runtime assets valid.
- New regression file initially produced **5 failures / 1 pass** on unchanged baseline for empty purchase, empty restore, disabled direct billing, backup exclusions and billing dependency. After fixes, full suite: **319 passed**, zero failed/skipped. Tests execute actual paywall code with explicit SDK fixtures; they do not make purchases.
- Fresh tracked-source copy plus new audit files, `npm ci --ignore-scripts`, full tests and build: **319/319 PASS, 46 modules valid**. No local QA packages, ignored credentials or prepopulated native assets are required.
- Chromium completion suite: **17/17 PASS**, no page errors. Real local controls/storage/encrypted file operations; email, cloud deletion and billing are intercepted fixtures.
- Chromium offline privacy navigation: **2/2 PASS, no errors**. This is web navigation evidence, not an Android permission/lifecycle result.
- Native: **debug and release Java/Kotlin source compilation, resources and release manifest PASS; 221 Gradle tasks, 48 executed and 173 up-to-date on the successful final run. Release classpath and merged metadata resolve Billing 8.0.0**. Toolchain restored under `/workspace` from official checksum-verified Android/JDK/Gradle downloads. Proxy CA trust is scoped to the QA toolchain; no product TLS bypass exists. No new signing key was created.
- Distribution guard: **PASS: bundleRelease --dry-run fails before task execution with the expected missing-upload-key error**. No final AAB or current-source installable APK was produced, signed or installed.
- Retained historical debug APK SHA-256: `8ed470ae883a70b10681aa1be3d83eb8d4222a6b80329958ead8c8ce5f43461d`, source `bf826193…`. Re-inspected it with StoreReady and `zipalign -c -P 16 4`: pass; archive has **zero `.so` libraries**. It is debug-signed and contains Billing 7; it must not be submitted or described as the current fixed artifact.
- Gitleaks 8.30.1 worktree and unpublished commit-range scan: **PASS for unpublished range: 10 commits / no leaks. Worktree: 18 candidates, all individually reviewed as inherited public reference/client-key material; raw scanner remains flagged**, with redacted raw output and individual candidate dispositions. `git diff --check` passes.

## Gate ledger

PASS below means the stated bounded engineering evidence passed; it does not mean Play approval.

| Gate | Outcome | Evidence or remaining requirement |
| --- | --- | --- |
| Latest source/provenance | PASS | Retained newer task checkpoint recovered; all remote heads and nine PRs compared; no unrelated merge |
| Target API 36 | PASS, merged release source | variables.gradle is 36; current merged release manifest confirms it |
| Billing dependency version | PASS, resolved native release source | Upstream supported Billing 8 migration; resolved release classpath and merged metadata both confirm 8.0.0 |
| Purchase/restore entitlement code | PASS | Actual callback regressions; unentitled/pending results never claim Premium; release flag stays off |
| Consumable credit reconciliation | PASS, source/fixture only | Wallet/server tests retain owner checks, replay/dedupe/refund paths; real receipt verification/consumption/restore remains NOT RUN |
| Permissions/minimization | PASS source review; NOT RUN device | Merged release permissions: CAMERA, INTERNET, VIBRATE, RECEIVE_BOOT_COMPLETED, WAKE_LOCK, POST_NOTIFICATIONS, BILLING, ACCESS_NETWORK_STATE and app signature receiver permission; no broad storage/location/SMS/exact-alarm permissions; contextual camera and local reminder source present |
| Permission denial/revoke/restart | NOT RUN | No ready Android device/emulator; Play testing needed |
| Privacy policy in app | PASS, local source/web | Bundled current disclosures; canonical equality regression; public main policy is still an older source snapshot |
| Public policy/support/deletion URL | NOT RUN for final acceptance | GitHub main policy responds HTTP 200; no proof it is the final rendered, accepted store policy or a working deletion web resource |
| Data Safety declaration | NOT RUN | No form submitted/changed. Runtime traffic, providers, retention, optional cloud photo/ID/email/purchase categories need artifact-specific review |
| Account/data deletion | PASS source/fixtures; BLOCKED live | Existing-account controls and owner-bound lifecycle tests retained; lifecycle functions/scheduler undeployed, external provider/financial retention and web/email route unaccepted |
| Local deletion | PASS software/fixture scope | Existing local photo/gallery/program/history deletion tests; phone IndexedDB/WebView lifecycle not verified |
| Backup/secure storage | PASS source/resources; NOT RUN device | Explicit automatic backup/transfer exclusions and AES-GCM exported backup; active stores unencrypted and no native biometric vault |
| npm dependency advisories | PASS | Baseline 9 → 0 full and 0 production; native SCA coverage remains incomplete |
| Release manifest/components/TLS | PASS, merged release source | Current merge: no debuggable=true flag, internal FileProvider, intentional launcher and permission-protected Amazon/ProfileInstaller receivers; product cleartext/mixed content/WebView debugging disabled; launcher export intentional, providers internal, SDK exports reviewed |
| Signed AAB/exact artifact security | BLOCKED | Developer-owned upload credentials absent; no key creation, no signing/submission |
| 16 KB compatibility | PARTIAL; final NOT RUN | Historical APK has no native ELF and passes ZIP alignment. 61 downloaded AARs contain no .so; final signed artifact and 16 KB device still need verification. WASM in WebView is not an Android `.so` |
| Android runtime/accessibility/performance | NOT RUN | Browser suites do not prove phone camera/picker/share/notifications/backups/large text/accessibility/lifecycle, vitals or 16 KB behavior |
| Ads/UGC/subscription console evidence | NOT RUN | Source has no ad/analytics SDK or active posting service; purchases disabled. Exact store declarations remain account-owned |
| Health, AI and accuracy disclosures | ACTION REQUIRED | Wellness routines, photo heuristics and optional generated looks require truthful exact-artifact declarations and provider/empirical review; no clinical validation claimed |
| Listing assets/content rating/app access | NOT RUN | Exact-artifact screenshots, reviewer paths, truthful copy, audience/rating and versionCode availability need Console acceptance |
| Closed-test production access/developer identity | PLATFORM REQUIRED | Account type/creation date/market verification and tester evidence unavailable; no production eligibility inferred |
| StoreReady overall | BLOCKED / NO | Raw generated checklist preserved; missing proofs and candidate triage remain visible |

## Current official policy evidence

All URLs below were checked on 4 October 2026, independent of the scanner's bundled policy snapshot:

- [Target SDK](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en): phone new apps/updates require API 36 from 31 August 2026.
- [Billing deprecation](https://developer.android.com/google/play/billing/deprecation-faq), [purchase lifecycle](https://developer.android.com/google/play/billing/integrate): Billing 7's ordinary deadline passed; Billing 8 is supported. Pending callbacks are not proof of entitlement; backend/acknowledgment/consumption and resume recovery need real acceptance.
- [16 KB page sizes](https://developer.android.com/guide/practices/page-sizes): current official text requires support for API 35+ on 64-bit Play devices and states an update-enforcement date of **1 February 2027**. Do not substitute the older November-2025 wording for the page's current text. Java/Kotlin-only apps without native libraries already support the memory-page architecture; runtime testing is still recommended.
- [Android backup](https://developer.android.com/identity/data/autobackup): vendor device transfers can persist despite allowBackup=false; explicit extraction rules matter.
- [User Data](https://support.google.com/googleplay/android-developer/answer/10144311), [Data Safety](https://support.google.com/googleplay/android-developer/answer/10787469), [account deletion](https://support.google.com/googleplay/android-developer/answer/13327111), [permissions](https://support.google.com/googleplay/android-developer/answer/16558241): use exact observed behavior and real operational evidence. In-app creation triggers in-app plus external deletion requirements; source-only implementations do not prove them.
- [Health declaration](https://support.google.com/googleplay/android-developer/answer/14738291), [personal-account closed testing](https://support.google.com/googleplay/android-developer/answer/14151465), [developer verification](https://developer.android.com/developer-verification): remaining platform gates depend on actual app/account/market evidence. Eligible new personal accounts require 12 opted-in testers for 14 continuous days before applying for production access.
- [RevenueCat Billing-8 migration](https://github.com/RevenueCat/purchases-capacitor/releases/tag/11.0.0), [Capacitor 7 migration](https://capacitorjs.com/docs/updating/7-0): supported upstream dependency path, including Java 21 and compatible plugin peers. Consumed consumables cannot be reconstructed solely by store restore; the account-backed ledger remains the credit authority.

## Evidence and next gates

Repository evidence: `docs/evidence/play-readiness-20261004/`; working evidence: `/workspace/chisel-play-evidence/`. The repository copy includes scanner JSON/checklists, before/after test/audit logs, branch/PR summaries, native manifests/classpath results, browser reports, official source URLs and redacted secret triage. The final dependency/manifest checks ran with sync and native compilation serialized after an earlier QA sync invalidated generated resource files during compilation; the retry passed. No product workaround or weakened check was used. A SHA-256 manifest identifies the copied evidence.

Keep the app's paid paths disabled. Before release, an owner must provide the existing upload signing material through the normal secure path, produce and inspect the final signed AAB, run Play Internal/device and 16 KB testing, complete production deletion/provider/retention/billing acceptance and exact-artifact store/privacy/health/access declarations, and resolve any applicable account testing/verification gate. None of those external actions was performed here. No purchases, signing-key creation, credential changes, console declarations, store submission, public deployment, merge or force push occurred. Authorized GitHub push is limited to this non-default fix branch.
