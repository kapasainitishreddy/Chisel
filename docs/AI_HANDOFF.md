# AI Development Handoff

## Current: credit-backed studio and local comparison, 2026-09-10

Continue draft PR #7 on feat/chisel-unisex-trainer-skin. The user explicitly approved actual implementation of reasonable AI-credit pricing, OpenAI editing, comparison and stylist export. Do not restart the app, add another theme controller or substitute ChatGPT Image Gen for app tests. The older AGENTS.md account-free/Replicate-only statements now apply only to the free/legacy paths: paid credits use an optional verified email account and an OpenAI backend. Never expose API keys.

Read [current implementation, prices and exact evidence](AI_CREDITS_STATUS.md). Code/test head 4a932d41b5af04f2e52317dcb2946cfac8e599c6 passed 273 Node tests, 33 fixture-backed browser checks and six real endpoint readiness/rejection checks. Nine modified canonical/native assets match. The additive wallet migration and two new Edge Functions were deployed to the existing looksmaxxing project; sales, rendering and verified-cost flags remain OFF in both environments. No user account, receipt, wallet job or ledger entry was created by tests.

The photo-first UI now includes a Credits control, Standard/Detail quote, optional email-code sign-in, real native-store API integration, server balance, saved-look comparison and local printable HTML stylist reference. Browser store/auth/provider replies are explicit fixtures, not live purchases or real transformations. Free local tools remain account-free. Sharing, signing in, account persistence and Android billing still need physical-device acceptance.

Do not claim the entire CI is green: preexisting Frame Fitting QA fails because chisel-eyewear-fit.js is missing; the earlier workflow was committed without the promised fitting/policy/runner modules. Credits changes do not fix that, the faint local hair overlay, skin-only segmentation or exercise demonstrations.

Before enabling money or generation: securely supply/verify OpenAI access, generate real app outputs and measure full costs, configure Play consumables and RevenueCat/OTP, validate purchase/refund delivery, and complete account deletion, output cleanup and operational recovery. Then exact-source native builds and release acceptance. A backend deployment is not an APK or a finished store release.

[Full preceding handoff](history/2026-09-10-before-credits-AI_HANDOFF.md) and all prior photo/layout/accuracy checkpoints are preserved.
