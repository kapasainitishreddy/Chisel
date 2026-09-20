# AI credits, OpenAI editing and comparison tools

2026-09-10 verified implementation. Actual source, an additive wallet migration and two deployed endpoints are delivered. Live paid editing is intentionally disabled, not a finished commercial/native release.

## Proposed US prices

| Product | Credits | USD price |
|---|---:|---:|
| chisel_credits_10 | 10 | 3.99 |
| chisel_credits_30 | 30 | 9.99 |
| chisel_credits_70 | 70 | 19.99 |

Standard: 1 credit, medium image quality. Detail: 3 credits, high quality. Credit packs do not expire or renew. Compare/save/reopen/export existing results consumes no generation credits. Only a native localized priceString enables a purchase; planned USD prices are visibly labelled and disabled without real store offers/readiness. These are proposed launch prices, not active store listings.

The server uses gpt-image-2.5-sunburst through multipart Images edits with the actual source photo. Documented per-million USD rates checked this session: text input5, image input8, output30. Input plus output usage matters. The estimator assumes no cached discount. Reservation envelopes are $0.13 Standard/$0.39 Detail, not measured fixed provider prices. A global default $5/day attempt-reservation budget and unknown/high-cost circuit breakers stop new edits; this is not an OpenAI account hard billing cap. Failed API attempts may still cost money, so their global budget reservations are not refunded.

Illustrative full-redemption scenario: assume 30% store fees, another 2% of gross held as a reserve, and $0.13 variable cost per credit. The three packs leave approximately $1.41, $2.89 and $4.49 contribution respectively. This is before fixed infrastructure, taxes, support, marketing, developer time and costs beyond the assumptions. Actual store treatment and model usage vary. Profit is not guaranteed; no paid launch until representative successful and failed edits have been costed.

## Implemented behavior

Free local tools remain account-free. Paid credits use optional email-code sign-in. The gateway verifies Supabase JWTs and never trusts a device/request user ID for wallet ownership. RevenueCat native APIs log into the same user UUID and retrieve localized consumables. Native purchase callbacks do not mint credits. A separately authenticated receipt webhook validates configured app/environment/store/product.

Postgres owns event/transaction deduplication, owner-conflict rejection, atomic debit, refund-before-grant tombstones, once-only job refunds and spent-purchase refund debt. Sandbox balances cannot fund production. A job starts once; one user cannot create concurrent reserved jobs. Unknown requests do not automatically issue another paid call. Closing a submitted edit does not guarantee cancellation.

The server enforces mode/quote/consent, JPEG dimensions and byte limits, bounded non-retrying provider requests, private output storage and owner-bound output retrieval. Failed jobs return credits once. Pending jobs over ten minutes reconcile on account/status activity. Results have a 24-hour retrieval expiry; physical removal is currently opportunistic, not a completed scheduled-retention service. That and account-deletion/operations remain launch work.

The existing editor gains a compact Credits control and Standard/Detail selector with quoted debit and named-provider consent. The original photo remains separate. No new theme controller, stock default face or fake output was introduced.

Compare & decide selects two to four stored results sharing the same original. A single selection opens a stylist reference: original, labelled AI preview, maintenance preference and escaped notes. Export produces a local self-contained printable HTML document or invokes supported sharing. It does not generate another image or prescribe a clipper grade, chemical treatment or guaranteed result. Native sharing still needs device tests.

## Actual backend actions and final state

Applied chisel_credit_wallet to existing project wnzbmmhtdchdqjnskwlo. SQL acceptance ran inside a rolled-back transaction and passed replay, conflicting owner/event, early refund, atomic reservation, once-only worker/refund, budget, private output path, late settlement, refund debt, stale recovery, cost breaker, environment isolation and role checks.

Deployed credit-studio v1 and credit-purchases v1 with immutable server imports pinned to 98d13b78a4076efbe1da437598cfb6e5c47f725e. The gateway verifies JWTs itself; the purchase endpoint verifies its configured Authorization value. The earlier Replicate functions were not replaced.

Latest actual DB read: both SANDBOX and PRODUCTION sales_enabled=false, renders_enabled=false, costs_verified=false; zero accounts, receipts, jobs and ledger entries; output bucket private. No synthetic wallet money persisted.

Live endpoint test: GET credit-studio returned 200/apiVersion2/readyfalse/salesReadyfalse/walletnull. An unauthenticated create with no image was rejected401. Foreign Origin rejected403. credit-purchases rejected an unsigned empty request503/server_not_configured. These demonstrate deployment and rejection behavior, not real generation or successful receipt processing.

## Exact verification

Application/test head: 4a932d41b5af04f2e52317dcb2946cfac8e599c6.
CI merge checkout: ee278a54e3ebdf027b8152e149b01e6b581d457.
Following docs-only changes leave application/test files unchanged.

- Node: 273/273 PASS, zero failures/skips, freshly rerun against downloaded exact CI source.
- Credits/compare browser runner: 33/33 PASS, zero uncaught errors. Authentication, native-store callbacks, credit replies, face checks and returned image are explicit fixtures. Not a live purchase, email, image generation or accuracy test.
- Real deployed endpoint readiness/rejection: 6/6 PASS with no credential or image submission.
- Nine modified/new canonical and Android asset pairs match each other and the tested local source byte-for-byte.
- Browser widths360,430,1280 at height900. Reviewed actual wallet/editor/compare screenshots for clear prices, selected state, photo-first hierarchy, action placement and aligned spacing. Native account persistence, accessibility/large text and Android share/billing remain acceptance work.

Credits and Compare QA #2/run34557980667 SUCCESS. Artifact10183290778 contains full exact source, logs, screenshots, a real downloaded stylist HTML reference and both JSON reports. Chisel Tests #287/run34557980623, Looks #10/run34557980619, Personal #17/run34557980621, Quiet Studio #23/run34557980625, Reliability #28/run34557980618 and Render Readiness #4/run34557980652 also succeeded.

Known preexisting failure: Frame Fitting #3/run34557980653 fails on missing www/chisel-eyewear-fit.js. That earlier incomplete workflow also expects a policy module and browser runner. It was not disabled or described as fixed by this change. Do not claim every workflow is green.

Review repaired two real messaging inconsistencies: stale purchase-verification text after a server balance update, and an old disabled-service message remaining in an enabled fixture editor. The new balance regression was observed failing, then passed; browser checks assert both fixes. Earlier272/29 results are superseded.

Local Chromium navigation was blocked by environment policy. Rendered QA used GitHub Actions Chromium. User selfie was not uploaded to public GitHub or any provider. Screenshots use the existing repository test portrait, and comparison fixtures are not actual distinct hairstyle outputs.

## Still required before paid activation

Secure OpenAI credential/access setup and actual app-generated photo edits; identity/style/edge fidelity and measured costs; Play consumable products, RevenueCat config/receipt delivery/refunds and OTP sender/code template; account deletion, scheduled result cleanup and operational reconciliation; native APK/AAB, physical-device camera/picker/session/purchase/share/accessibility/performance testing and store/privacy review. No key was supplied through this session; backend key validity was not tested. Prior secure-setup opening is not a delivered credential.

No actual OpenAI edit, consumer purchase, user email, native build, phone install, merge or Play submission occurred. Hair/glasses overlay repair, skin-only sampling accuracy, full exercise animations and broader deferred Pro programs are not completed by the wallet feature.

## Official sources checked

- https://developers.openai.com/api/docs/models/gpt-image-2.5-sunburst
- https://developers.openai.com/api/reference/resources/images/methods/edit
- https://www.revenuecat.com/docs/platform-resources/non-subscriptions
- https://android-developers.googleblog.com/2026/06/play-expanded-billing.html
