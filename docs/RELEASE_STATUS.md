# Release Status

2026-09-10. **PR #7 remains draft/unmerged; no new installed APK or Play release.**

The credit-backed source and additive wallet migration are implemented. New credit-studio v1 and credit-purchases v1 Edge Functions were actually deployed to wnzbmmhtdchdqjnskwlo, pinned to server source 98d13b78a4076efbe1da437598cfb6e5c47f725e. Later UI-only source 4a932d41b5af04f2e52317dcb2946cfac8e599c6 does not change those server files. Public readiness and unauthenticated rejection were checked against the real deployed services.

**Sales, rendering and costs_verified are false in SANDBOX and PRODUCTION.** Final DB read: no accounts, purchases, jobs or ledger entries; output bucket private. No API key was supplied through this session and backend key validity was not tested. Secure setup being opened earlier is not a delivered key. No actual OpenAI image edit, payment or user OTP email was performed.

Activation requirements: OpenAI credentials/model access and real-output/cost acceptance; Play consumable product setup and RevenueCat notification/receipt mapping; OTP email template/sender; native purchase/refund/account tests; account-deletion UX, output-retention scheduler and operational recovery; exact-source native APK/AAB and signing; physical Android camera, export/share, accessibility and performance checks; remaining store/privacy/release requirements.

The prior Frame Fitting QA is still failing because its requested modules are absent. The faint hair guide, doubled-glasses issue, skin sampling accuracy and instructional exercise animations are NOT solved by monetization work. Do not promote source-level or fixture tests to real rendering/accuracy evidence.

[Current implementation and tests](AI_CREDITS_STATUS.md), [full previous release checklist](history/2026-09-10-before-credits-RELEASE_STATUS.md) and [accuracy requirements](ACCURACY_RELIABILITY.md).
