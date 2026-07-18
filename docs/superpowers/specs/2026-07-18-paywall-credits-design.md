# Paywall, credits, and trial pricing

## Context

Chisel's photoreal try-on (see [2026-07-18-photoreal-tryon-design.md](2026-07-18-photoreal-tryon-design.md)) currently gives every device 5 free renders/day with no payment involved. This phase adds monetization: a paid 3-day trial, a recurring subscription, and a proper credits/entitlement system so paid access is enforced server-side rather than by a client-resettable device id.

Chisel is planned for eventual Google Play Store publication (the user already has a Play Console developer account and a RevenueCat account). Because Google requires Play Billing for in-app digital goods sold within a Play-distributed app, this design uses **Google Play Billing via RevenueCat** rather than Stripe — building on Stripe now would mean re-implementing this later.

## Goals / non-goals

**Goals**
- A 3-day, $0.99 trial that unlocks all features plus 15 photoreal credits.
- A recurring subscription ($6.99/month or $39.99/year) with a 60/month soft cap on photoreal renders (not shown to the user as a number — marketed as effectively unlimited for normal use).
- Reduce the always-free daily photoreal cap from 5 to 2 (unlimited on-device overlay try-on is untouched and stays free forever).
- Server-side enforcement of paid entitlements via RevenueCat + Google Play Billing (a device cannot fake owning a purchase).
- A paywall screen presenting the trial/subscription offer.

**Non-goals (this phase)**
- No fix for free-tier device-id reset abuse (reinstalling the app resets the 2/day free counter). Accepted as low-stakes (worst case ~$0.08/device/day) — not worth login-gating the free tier over.
- No iOS/App Store billing (Android/Play Store only, matching the app's current platform).
- No annual-vs-monthly plan-switching UI polish, upgrade/downgrade flows, or win-back offers — a single subscribe/trial CTA is sufficient for launch.
- No changes to the free on-device overlay try-on itself.

## Architecture

```
Chisel app                    RevenueCat (existing account)     Google Play Billing
───────────                   ──────────────────────           ────────────────────
New Paywall screen   ──SDK──▶  Trial/subscription products      Actual purchase +
 "3-day trial $0.99"           (configured in RC dashboard,      payment processing
 "$6.99/mo · $39.99/yr"        linked to Play Console SKUs)
 via RevenueCat Capacitor SDK
       │
       │ purchase succeeds → SDK returns entitlement + rc_user_id
       ▼
Client stores rc_user_id  ────────────────────────────────▶  RevenueCat webhook
 (sent with render                                             (purchase/renew/cancel)
 requests once purchased)                                            │
       │                                                              ▼
       ▼                                                     New edge function
render-lookmax (existing,  ◀── reads `entitlements` table ── `rc-webhook`
 extended check order)                                        updates `entitlements`
```

**New Supabase table `entitlements`:**
```sql
create table public.entitlements (
  id text primary key,                    -- rc_user_id (paying) or device_id (free)
  tier text not null default 'free',      -- 'free' | 'trial' | 'subscribed'
  trial_credits_remaining integer not null default 0,
  subscription_active_until timestamptz,
  monthly_render_count integer not null default 0,
  monthly_reset_at date,
  updated_at timestamptz not null default now()
);
alter table public.entitlements enable row level security;
-- No policies: service-role key only (same pattern as render_counts).
```

**New edge function `rc-webhook`:** receives RevenueCat webhook events (`INITIAL_PURCHASE`, `RENEWAL`, `CANCELLATION`, `EXPIRATION`), verifies the RevenueCat webhook auth header against a secret, and upserts the corresponding row in `entitlements` (sets `tier='trial'` + `trial_credits_remaining=15` on first purchase of the trial product, `tier='subscribed'` + `subscription_active_until` on the recurring product, reverts to `tier='free'` on cancellation/expiration). On every `RENEWAL` event, also resets `monthly_render_count=0` and sets `monthly_reset_at` to that event's period-start date — the monthly cap tracks the actual billing cycle, not a calendar month, since RevenueCat fires `RENEWAL` at each billing cycle regardless of signup date.

**`render-lookmax` (existing edge function) gets a new check inserted before the current rate-limit logic:**
1. If the request includes an `rcUserId` and `entitlements` for that id has `tier='trial'` with `trial_credits_remaining > 0` → allow, decrement the credit.
2. Else if `tier='subscribed'` and `subscription_active_until > now()` and `monthly_render_count < 60` (resetting monthly via `monthly_reset_at`) → allow, increment the count.
3. Else fall back to the existing `render_counts` free-tier check, now capped at **2/day** instead of 5.
4. Else `429` with a response the client uses to route to the paywall (distinct error code from the existing generic rate-limit response, e.g. `{error:'free_limit_reached', showPaywall:true}`).

## Client changes

- New Paywall screen/modal in `chisel-android/www/index.html`, styled consistently with the existing design system (dark/gold, `.card`/`.btn.solid` patterns — same "no AI slop" bar as the photoreal work): shows the 3-day/$0.99 trial as the primary CTA, subscription price as secondary, plain copy (no "unlock premium ✨" language).
- Triggered when: (a) the user taps a new "Go Premium" entry point (placed near the existing photoreal button), or (b) `render-lookmax` returns `free_limit_reached`.
- New dependency: `@revenuecat/purchases-capacitor` (the standard Capacitor SDK for RevenueCat — this is the one new dependency this phase adds, justified since building raw Play Billing + server-side receipt validation from scratch is substantially more code and more ways to get billing edge cases wrong).
- On purchase success, the SDK returns a `CustomerInfo` object containing the RevenueCat `app_user_id`; the client stores this (alongside, not replacing, the existing `deviceId()`) and includes it as `rcUserId` in future `render-lookmax` requests once present.
- Restore-purchases entry point (standard Play Store requirement) so a user who reinstalls doesn't lose an active subscription.

## What's built vs. what requires manual dashboard setup

This phase has real infrastructure dependencies outside of code, same pattern as the Replicate API token step in the photoreal feature but larger in scope:

1. **Play Console** (human step): create the subscription product with a 3-day-at-$0.99 introductory price plus a $6.99/month (or $39.99/year) base price; the app must be in at least a closed/internal testing track for any billing testing to function at all.
2. **RevenueCat dashboard** (human step): link the Play Console product to a RevenueCat entitlement (e.g. `"premium"`), retrieve the SDK public API key for the client, and point RevenueCat's webhook configuration at the deployed `rc-webhook` Supabase URL with a shared secret.
3. **License testers** (human step): Play Billing test purchases require the tester's Google account to be added as a license tester in Play Console — real purchases can't be meaningfully tested otherwise.

None of these three can be done by an agent — they require the user's own Play Console/RevenueCat account access.

## Error handling

| Failure | Client behavior |
|---|---|
| Purchase fails/cancelled mid-flow | RevenueCat SDK reports failure; toast, stay on paywall |
| `rc-webhook` receives an event for an unrecognized user | Log and no-op (don't crash the webhook — RevenueCat retries failed webhook deliveries) |
| Free cap + no entitlement | `429 free_limit_reached` → client shows the paywall, not a dead-end toast |
| Subscription lapses (webhook sets tier back to 'free') | Silent fallback to free-tier limits on next render request — no special client handling needed, the existing 429 path covers it |

## Testing

No automated test suite exists in this codebase (consistent with the rest of the project). Verification is manual, same layered approach as the photoreal feature:
1. `rc-webhook` tested directly (curl with a synthetic RevenueCat webhook payload) before wiring the client.
2. `render-lookmax`'s new entitlement-check branch tested directly against test rows inserted into `entitlements`.
3. End-to-end purchase flow tested on-device using a Play Console license-tester account (test purchases don't charge real money), once the human-step dashboard configuration above is complete.
