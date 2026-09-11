# Approved Chisel implementation scope

The user approved implementing the existing photo-first Chisel app and requested reasonable prices with margin from AI credits. No new theme, fake transformed examples, public uploads of their photo, or unlimited inference.

Implement a pay-as-you-go paid editing layer: 10 credits $3.99, 30 $9.99, 70 $19.99 (proposed US store prices; store-localized prices authoritative). Standard single edit costs 1 credit, higher-quality edit costs 3. Comparing/saving/reopening/exporting existing images is free. No expiry or recurring charge for purchased packs. These are priced assumptions, not activated store products or guaranteed profits.

Paid credits require an authenticated account separate from free local use. Backend verifies JWTs; RevenueCat logs into the same account ID. Only authenticated RevenueCat events grant credits. Debits are atomic and idempotent; failed or expired jobs refund once; purchase refunds can produce an account debt to prevent re-spending refunded credits. Closing a submitted edit is not a promise to cancel or refund it. Sandbox funds cannot reach production. Price/mode/provider configuration is server controlled. Sales and rendering start disabled until real configuration and cost/output validation.

Extend, do not replace, the current editor. Add a small Credits control, mode cost at confirmation, native pack purchase with truthful pending state, 2–4 look comparison, and local stylist reference export. Keep near-black/green, cream actions and existing photo handling. Do not infer an improved skin score from generated outputs. All provider tests must be labelled simulated unless a live response exists.

Use the documented OpenAI Images edits endpoint server-side. A secure key setup flow is available, but no key has reached this workspace. Never put an API secret in the APK, source, chat, logs or CI artifacts. No live rendering, consumer charging, or account email is initiated during testing.
