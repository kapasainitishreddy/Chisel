# Release Status

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
