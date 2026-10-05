# Chisel acquisition and paid conversion plan

Research checked 5 October 2026. Recommendations are hypotheses for Chisel, not forecasts or implemented campaigns. No messages, ad spend, purchases, tracking SDK, store declarations or dashboard changes were made.

## Positioning and first useful moment

Position Chisel as **a private grooming and style studio**, with three clear entry points: a careful baseline scan, a gentle face/neck routine, and a style guide. Avoid beauty ranks, promises of permanent jaw reshaping, fabricated transformations, and repeated checking as a retention mechanic. A successful first visit ends with one understood result or one completed routine. Optional AI references are illustrations, not predictions.

The app now offers inline, dismissible getting-started choices. Local tools stay account-free; personalization is explicit. The existing daily focus records completion only when the user marks it. New branding is the original ivory/sage C/chisel mark on forest green. User photo management, privacy and deletion remain within the established flow.

## What successful apps teach us

| Evidence | Chisel application | Limit |
|---|---|---|
| [Duolingo Q2 2026 shareholder letter](https://investors.duolingo.com/static-files/3c8277ee-bc94-4f5d-9b77-0db3e46f88b8) prioritizes retention and outcomes, experiments with monetization that avoids friction for free users, and broadens creator reach. | Make the free first task useful, offer a short return routine, and test creator demonstrations around concrete grooming problems. | Different category and scale; its results do not predict Chisel's outcomes. |
| [Photoroom's RevenueCat case study](https://www.revenuecat.com/customers/photoroom) describes localized templates/paywalls and purchase data linked to country-level profitability. | Test native language copy and culturally relevant style examples by country; reconcile paid conversion against verified receipts and costs. | Vendor-published customer story, not an independent controlled Chisel experiment. |
| [Pixelcut's RevenueCat case study](https://www.revenuecat.com/customers/pixelcut) evaluates monetization experiments using downstream lifetime value as well as paying customer counts. | Test pack explanations and purchase context with repeat paid usage, refunds and contribution margin as guardrails. | Its weekly-subscription winner is not a reason to replace Chisel's consumable credit model. |
| [RevenueCat State of Subscription Apps 2026](https://www.revenuecat.com/state-of-subscription-apps) reports substantial variation by store, country, category and access model. | Compare Android cohorts within a market and product type; optimize retention and margin alongside conversion. | Observational benchmarks cover subscription apps and 2025 data. Hard-paywall correlations do not establish causation and do not justify locking Chisel's free tools. |

## Four weeks of small experiments

These are preparation and proposed experiments. Launch only after release, measurement and billing acceptance gates are satisfied.

| Week | Work | Hypothesis | Primary measure | Guardrail |
|---|---|---|---|---|
| 1 | Observe five consenting users doing scan → result and routine → finish. Prepare listing screenshots showing actual UI, privacy, and free/paid boundaries. | Clear entry points increase first useful task completion. | Completed first task / first visits; median time; abandonment step. | Capture rejection honesty, accessibility, no forced account. |
| 2 | Produce six short demonstrations: matched-lighting baseline, haircut discussion, eyewear guide, gentle desk-break routine, private photo storage, export to stylist. Prepare outreach to a small set of relevant barbers/grooming creators; do not send automatically. | Concrete problem-led demonstrations attract users who complete a useful task. | Store visitors → installs → first task by content/channel. | Consenting adult models, visibly label AI references, no simulated bone-change claims. |
| 3 | Test one language/market's store copy and contextual AI-credit explanation after a user understands a style reference. Compare with the existing explanation. | Showing the paid job and exact local cost converts interested users. | Verified first purchasers / exposed eligible users. | No fake urgency, no surprise subscription, free comparison/export, refund rate and D7 return. |
| 4 | Examine D7/D30 return and repeat credit usage; interview users who abandoned a purchase or edit. Fix the highest-friction step. | Reliable delivery and saved looks increase trust and repeat paid usage. | Repeat verified purchasers / first purchasers; useful return sessions. | Support tickets, failed edits, credit refunds, realized contribution margin. |

Store listing copy draft: “Explore grooming and styles with a private studio. Capture a consistent baseline, follow gentle routines, and compare your own photos under similar conditions. Local tools need no account. Optional cloud style references are clearly labeled and use separate credits when available.” Treat this as draft copy only; confirm exact feature availability and Play listing requirements before use.

Content hooks: “Before you buy a haircut, prepare a clear reference”; “Three reasons two jawline photos do not compare”; “A short gentle face and neck break”; “Where your Chisel photo is stored.” Do not present cosmetic estimates as diagnoses or objectively rank attractiveness.

## Measurement and economics before scaling

No analytics SDK or new remote collection was added. Current local completion state cannot measure aggregate install funnels or channel attribution. Use Play Console aggregate store data and verified RevenueCat/server transactions when authorized. If product-event measurement is introduced later, define minimal events, consent/disclosures and retention first; exclude photos, facial measurements, email, tokens and free-text content.

Proposed minimal event vocabulary: first_task_started/completed (task type), offer_viewed (product/variant), checkout_started, purchase_verified, edit_completed/failed, and useful_return. These are a measurement specification, not events currently sent. Deduplicate verified purchases by store transaction ID; a native purchase callback is not a credited sale. Segment by store/country/version and compare consistent observation windows. Do not count billing-disabled visitors as eligible checkout users.

Calculate net contribution per purchased pack from actual proceeds less taxes/store fees/refunds, image generation and retry costs, infrastructure and support. Calculate CAC as spend divided by incremental verified new purchasers for a channel/cohort. Scale only when realized cohort contribution, rather than hoped-for lifetime value, supports that spend. Proposed growth percentages and prices require real experiments; none are claimed here.

## RevenueCat audit and operational blockers

- Installed SDK: purchases-capacitor 11.0.0, Billing 8 capable upstream. Its actual definitions return `PurchasesOfferings.current.availablePackages`; `subscriptionPeriod` is ISO 8601 and product prices are localized strings.
- Public legacy SDK key is empty; release `billingEnabled` remains false. The optional consumable path reads its public key and readiness from the authenticated server configuration. No credentials were filled in.
- Tool discovery found no relevant authorized RevenueCat account action; two searches returned unrelated toolkits, which were not used. Dashboard project, products, offerings, entitlement mappings, live webhook delivery, customer receipts and current sales settings are **not verified**.
- Legacy Premium requires an active `premium` entitlement after purchase/restore. Credits remain a separate server ledger; never attach consumables to a subscription entitlement to approximate a balance. [RevenueCat non-subscription guidance](https://www.revenuecat.com/docs/platform-resources/non-subscriptions) explains that consumable redemptions need separate bookkeeping and a consumable entitlement can remain permanently unlocked.
- Recover a credit balance by signing in to the same cloud account. Store restore cannot recreate consumed credits. [RevenueCat restoration guidance](https://www.revenuecat.com/docs/getting-started/restoring-purchases) distinguishes store restoration from identified-user transaction history.
- Simple recurring Premium offers now show the localized charge and renewal period. Missing metadata, consumables, prepaid/installment plans and introductory phases are rejected by this legacy UI until their complete terms are supported. No active introductory/trial sales have been configured or claimed.
- Test licensed Play accounts, pending/declined/cancelled purchases, reinstall/account switch, restore, duplicate/out-of-order/refunded webhook events, idempotent credits, failed-edit refund, real OTP and account deletion in the intended release environment before enabling sales. Existing offline tests cover many of these state transitions, but do not certify deployed behavior.
- Existing Play gates remain blocked: final signed AAB, device/16 KB acceptance where applicable, operational privacy/Data Safety/health declarations and billing/provider/account acceptance. See [Play readiness report](PLAY_READINESS_REPORT.md) and [feature polish report](FEATURE_POLISH_REPORT.md).
