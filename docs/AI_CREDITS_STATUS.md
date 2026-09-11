# AI credits, OpenAI editing and comparison tools

2026-09-10 initial implementation checkpoint. This adds actual source and an additive database migration, not a promise of a completed live business or a native app release.

## Proposed US prices and credit rules

| Product | Credits | USD price |
|---|---:|---:|
| chisel_credits_10 | 10 | 3.99 |
| chisel_credits_30 | 30 | 9.99 |
| chisel_credits_70 | 70 | 19.99 |

Standard uses 1 credit (medium image quality); Detail uses 3 (high). Purchased credits have no expiry and packs do not renew. Existing-image comparison, saving, reopening and export consume no generation credit. Store-localized priceString is authoritative at checkout. Planned dollar prices are shown disabled until actual native product offers and server readiness exist.

Model: gpt-image-2.5-sunburst, server-side multipart Images edits endpoint. Input image and output token usage are billed. Current documented per-million USD rates are text input 5, image input 8, image output 30; the calculator makes no cached discount assumption. A standard reservation is $0.13, Detail $0.39, subject to actual-cost validation. These are engineering reservations, not per-call provider price guarantees. Initial attempt-budget reservation is $5/day and cost/unknown-usage circuit breakers disable new edits. The reservation budget is not an OpenAI account hard billing cap.

For illustration only, a fully used $19.99/70 pack at 30% store fees, a separate 2% revenue reserve, and $0.13 variable cost per credit leaves $4.4932 contribution before fixed infrastructure, taxes, support, refunds, marketing and developer time. Actual fee treatment and unit costs vary. Profit is not guaranteed. Do not enable sales until representative successful and failed edits are costed.

## Implemented

Optional email-code account for paid usage; free local tools remain account-free. Server validates the Supabase token rather than trusting device or request user IDs. RevenueCat native purchases use the same authenticated user UUID; native purchase callbacks never mint credits. The independent receipt endpoint accepts only configured app/environment/store/product events. Per-event and per-transaction deduplication, once-only refunds, refund-before-grant tombstones, negative balances after spent-purchase refunds and sandbox separation are in Postgres.

The authenticated render gateway reserves credits atomically, enforces known modes/quote/consent and image byte/pixel limits, starts each worker once, makes one OpenAI edit without automatic paid retries, stores output privately, and serves it only to the owning account. Failed edits refund once; attempt budget remains reserved. Stale jobs reconcile on account/status activity. Closing an already submitted OpenAI edit does not guarantee cancellation. A 24-hour retrieval expiry is implemented; scheduled physical deletion and operational reconciliation remain launch work.

The editor has a small Credits control, explicit Standard/Detail credit costs and provider upload consent. No new theme controller. Saved-look tools compare 2–4 selections from one original, and export a local printable HTML stylist brief containing original, labelled AI reference, maintenance preference and escaped user notes. No invented haircut settings or new image request.

## Verification and actions

Local full Node suite: 272/272 PASS before initial push. New tariff, adapter, transport, wallet, comparison and privacy regressions were observed failing before their implementations. Applied chisel_credit_wallet to the existing Supabase project. Actual rolled-back SQL test passed transaction/event replay, owner conflicts, early refunds, atomic debit, once-only worker/refund, output ownership, negative debt, stale recovery, cost breaker, sandbox isolation and access control. Dummy transactions are not persisted.

Dedicated Chromium workflow exercises real UI and local file handling with explicitly isolated auth, native-store, wallet and returned-image fixtures. Run/read exact-head artifacts before claiming rendered success. Tests are not live purchases, OTP email delivery, photorealistic output or physical-device validation. Local localhost navigation is blocked by the execution environment; no workaround used.

## Still disabled / not released

Neither environment is enabled for sales, rendering or verified costs. No OpenAI API secret was supplied to this workspace; server key presence is not inferred. No real API generation, consumer purchase, user email, private selfie upload, APK/AAB build, merge or store submission occurred. Live provider credentials/access, generated result quality/cost, Play consumable products, RevenueCat configuration/notifications/webhook and OTP email template/sender must be tested before activation. Email templates must expose the sign-in code rather than only the default magic-link button. Account deletion and scheduled output retention require release review.

The prior frame-fitting workflow references files never implemented by the earlier repair attempt. This credits change does not claim that hair/glasses overlays, instructional exercise animations, skin sampling accuracy or that preexisting workflow are fixed.

## Official references checked

- https://developers.openai.com/api/docs/models/gpt-image-2.5-sunburst
- https://developers.openai.com/api/reference/resources/images/methods/edit
- https://www.revenuecat.com/docs/platform-resources/non-subscriptions
- https://android-developers.googleblog.com/2026/06/play-expanded-billing.html
