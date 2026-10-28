# Release Status

## Local saved-look lifecycle checkpoint, 2026-10-28

Working branch `recovery/chisel-cloud-build-20261004-efebe81`, source
`8ed59b6e2f1e41ca4d2ab41a25f53d860524d45f`. Source/runtime tests pass
335/335, Chromium journeys 3/3, and web validation 46 modules. Independent
read-only re-review found no must-fix after repairing retry, corrupt-row
cleanup and stale-save race paths. Generated Android web assets match the
canonical JS/CSS source.

This checkpoint does not create a native APK or encrypt live records. Native
Keystore storage, device deletion/interruption, Android accessibility, signing,
provider, billing and store release remain open; the pinned Gradle download
was refused and was not retried or bypassed. No real images, paid provider
requests, billing or deployment were used.

## Encrypted archive recovery checkpoint, 2026-10-28

Working branch `recovery/chisel-cloud-build-20261004-efebe81`, source
`e75241e27d0e775de128c1607d1850f0d3b9ef33`. Full `npm test`: 334/334;
Chromium browser journey: 2/2; web build validation: 46 modules. Independent
review found no must-fix. This is fixture-backed WebView recovery only: live
records and the temporary journal remain unencrypted. Multi-tab restore is
unsupported, device/power-loss acceptance is open, and no Android build, signing,
release, deployment, provider or billing gate was changed.

## Ranked-photo and local-delete reliability checkpoint, 2026-10-28

Working branch `recovery/chisel-cloud-build-20261004-efebe81`. The photo
capture chooser now offers unranked local capture notes (lighting, detail,
tilt, framing), retains input order, and revokes temporary preview URLs on
close. It does not use face-expression signals or upload the selected photos.
The clear-data path now clears the optional session token and both local image
stores, and reports failure instead of success when a store/module is
unavailable. Named style groups expose labels and pressed state. See
[FEATURE_LEDGER.csv](FEATURE_LEDGER.csv) and
[competitor desk research](COMPETITOR_EXPERIMENT.md).

Fresh verification at the earlier photo checkpoint: `npm test` 323/323 PASS (including Capacitor Android asset
sync and a Playwright/Chromium synthetic browser journey); `npm run build`
PASS (46 modules, inline scripts and assets). Browser acceptance uses generated
synthetic images, a fake camera, and a stub face model; no face upload or
provider request is performed. The Gradle 8.11.1 distribution is unavailable
in this environment, so Android compilation/device verification remain
blocked. This is source and fixture-backed UI progress only. The checkout has
a native Capacitor runtime, but no Keystore adapter exists; live WebView stores
remain unencrypted and native photo migration is still required. No provider,
billing, credentials, real-face data, signing, release or deployment action was
performed. Store/legal/AI applicability is not reviewed and release remains
blocked.

An independent read-only re-review found no must-fix in the changed code,
ledger paths, or competitor evidence. It confirmed the picker no longer asks
the face model for expression outputs and deletion tests cover missing-gallery
and blocked-database paths. Reviewer disposition: code checkpoint accepted for
source scope only; native, browser, accessibility, accuracy, market-demand,
and release gates remain open.

## Recovery branch privacy checkpoint, 2026-10-28

Branch `recovery/chisel-cloud-build-20261004-efebe81` contains the bounded
privacy/CX improvements described in [the native data contract](NATIVE_VAULT_CONTRACT.md).
The earlier 317/317 Node checkpoint and web source validation pass. The photo follow-up above adds a Chromium browser journey and 323/323 full-suite result. The archive recovery checkpoint at the top extends this to 334/334. An Android debug build could not complete because the Gradle 8.11.1 wrapper download was refused by the environment network. This does not produce a new APK or change prior release evidence. Live stores are not
encrypted; signed release, physical-device acceptance, lifecycle deployment,
billing/provider gates and full native vault remain open.

## Current local artifact, 2026-10-04

**Debug build delivered; public release remains BLOCKED.** Branch `work`, application source bf826193988e91c2edc457b3ab405352594857e2. Actual APK `/workspace/chisel-build/chisel-debug.apk`; SHA-256 `8ed470ae883a70b10681aa1be3d83eb8d4222a6b80329958ead8c8ce5f43461d`. 312 tests, 17 completion browser checks, 6 real-model fixture checks and native compilation pass; 58 packaged assets match canonical source.

The previously missing fitting/build modules are repaired. Account-lifecycle and output-recovery source is implemented, but no new migration/function/scheduler was deployed. Account controls have fixture acceptance only. No new live flag/configuration read is claimed. Signed AAB is blocked by the intentionally absent upload key; the release command rejects unsigned distribution. Play/device/store/empirical gates remain open. Full native biometric vault and local visual fidelity roadmap remain incomplete. No push, publish, payment, paid generation or OTP email occurred. See [full report](COMPLETION_REPORT.md) and [release gate](CHISEL_LAUNCH_GATE.md). Historical release statements below apply only to their dates.

2026-09-20. **Current release candidate:** `main` is merged and pushed; API 36
is configured; a previous debug APK was installed on a connected Android
device, and the current compliance-hardened debug APK has been built. The app
remains free-first: paid accounts and credit
purchases are disabled until account deletion, retention, billing and Play
testing are complete. A signed release AAB has not been produced because the
developer-owned upload keystore is intentionally not present in the repository.
Privacy Policy and Terms of Use are committed and linked through public GitHub
file pages, avoiding a GitHub Pages dependency. Play Console declarations still
must match the exact submitted artifact.

2026-09-10. **PR #7 remains draft/unmerged; no new installed APK or Play release.**

The credit-backed source and additive wallet migration are implemented. New credit-studio v1 and credit-purchases v1 Edge Functions were actually deployed to wnzbmmhtdchdqjnskwlo, pinned to server source 98d13b78a4076efbe1da437598cfb6e5c47f725e. Later UI-only source 4a932d41b5af04f2e52317dcb2946cfac8e599c6 does not change those server files. Public readiness and unauthenticated rejection were checked against the real deployed services.

**Sales, rendering and costs_verified are false in SANDBOX and PRODUCTION.** Final DB read: no accounts, purchases, jobs or ledger entries; output bucket private. No API key was supplied through this session and backend key validity was not tested. Secure setup being opened earlier is not a delivered key. No actual OpenAI image edit, payment or user OTP email was performed.

Activation requirements: OpenAI credentials/model access and real-output/cost acceptance; Play consumable product setup and RevenueCat notification/receipt mapping; OTP email template/sender; native purchase/refund/account tests; account-deletion UX, output-retention scheduler and operational recovery; exact-source native APK/AAB and signing; physical Android camera, export/share, accessibility and performance checks; remaining store/privacy/release requirements.

The prior Frame Fitting QA is still failing because its requested modules are absent. The faint hair guide, doubled-glasses issue and skin sampling accuracy are NOT solved by monetization work. Trainer demonstrations are now implemented as lightweight inline SVG guidance, with optional on-device hand-path checks and a Guided fallback; this is not a physical-device accuracy claim and does not measure pressure, muscle activation, circulation or structural change. Do not promote source-level or fixture tests to real rendering/accuracy evidence.

[Current implementation and tests](AI_CREDITS_STATUS.md), [full previous release checklist](history/2026-09-10-before-credits-RELEASE_STATUS.md) and [accuracy requirements](ACCURACY_RELIABILITY.md).
