# Paywall, Credits, and Trial Pricing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **Task 4 is a controller/human checkpoint, not a subagent-executable task — see its note.**

**Goal:** Add a 3-day/$0.99 trial and a $6.99/mo (or $39.99/yr) subscription to Chisel's photoreal try-on, enforced server-side via a new `entitlements` table fed by RevenueCat webhooks, replacing the client-resettable free-tier cap as the source of truth for paid access.

**Architecture:** RevenueCat (Google Play Billing under the hood) handles the actual purchase UI/flow via its Capacitor SDK. On purchase, RevenueCat sends a webhook to a new Supabase edge function (`rc-webhook`), which updates an `entitlements` table. The existing `render-lookmax` function checks that table before falling back to its existing (now-lowered) free daily cap.

**Tech Stack:** `@revenuecat/purchases-capacitor` (client), Supabase Edge Functions + Postgres (existing), Google Play Billing (via RevenueCat, configured in external dashboards).

## Global Constraints

- Free tier: **2 photoreal renders/device/day** (down from the current 5). Free on-device overlay try-on is unlimited and unaffected.
- Trial: **3 days, $0.99, all features + 15 photoreal credits.**
- Subscription: **$6.99/month or $39.99/year**, soft-capped at **60 renders/month** (never shown as a number in the UI — market as effectively unlimited).
- Backend: Supabase project `looksmaxxing`, ref `wnzbmmhtdchdqjnskwlo`, URL `https://wnzbmmhtdchdqjnskwlo.supabase.co` (same project as the photoreal feature).
- Client-safe Supabase publishable key: `sb_publishable_kr_GPQ_vODmXjIxQoV8v6A_FqH8RCts` (already in the codebase as `RENDER_ANON_KEY`).
- Source of truth for the client app is `chisel-android/www/index.html` (single file, no bundler). `npx cap sync android` must run after adding the new native RevenueCat plugin (not just `cap copy`, since this adds a native dependency).
- Icons: reuse the existing monochrome glyph set — no emoji, no new icon vocabulary.
- Copy stays plain/direct — no "unlock premium ✨" language (same bar as the photoreal feature).
- UI reuses the existing `.modal`/`.panel`/`.x` pattern (see `chisel-android/www/index.html:215-224`, used today by the Groom modal) rather than inventing a new interaction pattern.
- Never pipe a real secret value (RC webhook auth secret, Replicate token, etc.) through an agent-run command — human sets secrets directly, same rule as the photoreal plan.

---

### Task 1: Database — entitlements table

**Files:**
- Create: `supabase/migrations/0002_entitlements.sql`

**Interfaces:**
- Produces: table `public.entitlements(id text primary key, tier text, trial_credits_remaining integer, subscription_active_until timestamptz, monthly_render_count integer, monthly_reset_at date, updated_at timestamptz)`, used by Task 2 (`rc-webhook`) and Task 3 (`render-lookmax`).

- [ ] **Step 1: Write the migration file**

```sql
-- supabase/migrations/0002_entitlements.sql
create table if not exists public.entitlements (
  id text primary key,                    -- RevenueCat app_user_id (paying) or device_id (free-tier fallback, not written here)
  tier text not null default 'free',      -- 'free' | 'trial' | 'subscribed'
  trial_credits_remaining integer not null default 0,
  subscription_active_until timestamptz,
  monthly_render_count integer not null default 0,
  monthly_reset_at date,
  updated_at timestamptz not null default now()
);

alter table public.entitlements enable row level security;
-- No policies: only the service-role key (used server-side by rc-webhook and
-- render-lookmax) can read/write this table, same pattern as render_counts.
```

- [ ] **Step 2: Apply the migration**

Use the Supabase MCP tool `apply_migration` with `project_id: wnzbmmhtdchdqjnskwlo`, `name: entitlements`, `query`: the SQL from Step 1.

- [ ] **Step 3: Verify**

Use `list_tables` with `project_id: wnzbmmhtdchdqjnskwlo`, `schemas: ["public"]`. Expected: `public.entitlements` appears with the columns above, `rls_enabled: true`, alongside the existing `render_counts` table (untouched).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0002_entitlements.sql
git commit -m "Add entitlements table for paywall/credits"
```

---

### Task 2: Edge function — rc-webhook

**Files:**
- Create: `supabase/functions/rc-webhook/index.ts`

**Interfaces:**
- Consumes: `public.entitlements` table from Task 1.
- Produces: an HTTP endpoint at `https://wnzbmmhtdchdqjnskwlo.supabase.co/functions/v1/rc-webhook` that RevenueCat's dashboard webhook configuration (Task 4) points at. Accepts RevenueCat's webhook POST body: `{ api_version: string, event: { type: string, app_user_id: string, product_id: string, expiration_at_ms: number|null, entitlement_ids: string[], period_type: string } }`. Auth: RevenueCat echoes a dashboard-configured static value verbatim as the `Authorization` header on every request — this function must compare it against the `RC_WEBHOOK_SECRET` env var.

- [ ] **Step 1: Write the edge function**

```typescript
// supabase/functions/rc-webhook/index.ts
//
// Receives RevenueCat subscription lifecycle webhooks and keeps the
// `entitlements` table in sync. RevenueCat sends a static, dashboard-
// configured value verbatim as the Authorization header on every request —
// that's the auth mechanism (see RC's Webhooks docs: "Authorization Header
// Value"), compared here against RC_WEBHOOK_SECRET.
//
// Deploy via the Supabase MCP tool `deploy_edge_function`.
// Secret RC_WEBHOOK_SECRET must be set by a human (see Task 4) — pick any
// long random string, put the same value in both the Supabase secret and
// the RevenueCat dashboard's webhook "Authorization Header Value" field.

import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TRIAL_CREDITS = 15;

interface RCEvent {
  type: string;
  app_user_id: string;
  product_id?: string;
  expiration_at_ms?: number | null;
  entitlement_ids?: string[];
  period_type?: string; // "TRIAL" | "INTRO" | "NORMAL" | "PROMOTIONAL" | "PREPAID"
}
interface RCWebhookBody {
  api_version?: string;
  event?: RCEvent;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405, headers: CORS });
  }

  const expectedAuth = Deno.env.get("RC_WEBHOOK_SECRET");
  if (!expectedAuth) {
    return new Response(JSON.stringify({ error: "Server not configured" }), { status: 500, headers: CORS });
  }
  if (req.headers.get("Authorization") !== expectedAuth) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: CORS });
  }

  let body: RCWebhookBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: CORS });
  }

  const event = body.event;
  if (!event || !event.type || !event.app_user_id) {
    return new Response(JSON.stringify({ error: "Missing event fields" }), { status: 400, headers: CORS });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const id = event.app_user_id;

  if (event.type === "INITIAL_PURCHASE" || event.type === "RENEWAL" || event.type === "UNCANCELLATION") {
    const isTrial = event.period_type === "TRIAL" || event.period_type === "INTRO";
    if (isTrial) {
      // Only grant trial credits on first entry into the trial (INITIAL_PURCHASE),
      // not on every event — a RENEWAL during an active trial shouldn't happen,
      // but guard anyway by only setting credits on INITIAL_PURCHASE.
      if (event.type === "INITIAL_PURCHASE") {
        const { error } = await supabase.from("entitlements").upsert({
          id,
          tier: "trial",
          trial_credits_remaining: TRIAL_CREDITS,
          updated_at: new Date().toISOString(),
        });
        if (error) console.error("entitlements upsert (trial) failed", error);
      }
    } else {
      // Paid (non-trial) period: mark subscribed, reset the monthly render
      // counter each renewal so the soft cap tracks the actual billing cycle.
      const activeUntil = event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null;
      const { error } = await supabase.from("entitlements").upsert({
        id,
        tier: "subscribed",
        subscription_active_until: activeUntil,
        monthly_render_count: 0,
        monthly_reset_at: new Date().toISOString().slice(0, 10),
        updated_at: new Date().toISOString(),
      });
      if (error) console.error("entitlements upsert (subscribed) failed", error);
    }
  } else if (event.type === "CANCELLATION" || event.type === "EXPIRATION") {
    const { error } = await supabase.from("entitlements").upsert({
      id,
      tier: "free",
      updated_at: new Date().toISOString(),
    });
    if (error) console.error("entitlements upsert (revert to free) failed", error);
  }
  // Other event types (BILLING_ISSUE, PRODUCT_CHANGE, etc.) are logged only —
  // no entitlement state change needed for this app's scope.
  else {
    console.log("Unhandled RC event type (no-op)", event.type);
  }

  return new Response(JSON.stringify({ ok: true }), { headers: { ...CORS, "Content-Type": "application/json" } });
});
```

- [ ] **Step 2: Deploy**

Use the Supabase MCP tool `deploy_edge_function` with `project_id: wnzbmmhtdchdqjnskwlo`, `name: rc-webhook`, the file content from Step 1.

- [ ] **Step 3: Verify deployment**

Use `list_edge_functions` with `project_id: wnzbmmhtdchdqjnskwlo`. Expected: `rc-webhook` listed with status `ACTIVE`.

- [ ] **Step 4: Human step — set RC_WEBHOOK_SECRET (do not automate)**

Same rule as the photoreal plan's Replicate token step. Tell the user:

> Pick any long random string yourself (e.g. generate one with `openssl rand -hex 32` in your own terminal, or any password generator) — this is not a value I should generate or see used in a command. Set it as a Supabase secret named `RC_WEBHOOK_SECRET` for this project (same Dashboard → Edge Functions → Secrets flow as `REPLICATE_API_TOKEN`), and separately paste the identical value into RevenueCat's dashboard under the webhook's "Authorization Header Value" field (this is part of Task 4).

- [ ] **Step 5: Test — unauthorized request rejected (no DB writes)**

```bash
curl -s -X POST https://wnzbmmhtdchdqjnskwlo.supabase.co/functions/v1/rc-webhook \
  -H "Content-Type: application/json" \
  -d '{"api_version":"1.0","event":{"type":"INITIAL_PURCHASE","app_user_id":"test","period_type":"TRIAL"}}'
```
Expected: `401 {"error":"Unauthorized"}` (no `Authorization` header sent).

- [ ] **Step 6: Test — authorized trial event updates entitlements (needs RC_WEBHOOK_SECRET from Step 4)**

```bash
curl -s -X POST https://wnzbmmhtdchdqjnskwlo.supabase.co/functions/v1/rc-webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: <the RC_WEBHOOK_SECRET value>" \
  -d '{"api_version":"1.0","event":{"type":"INITIAL_PURCHASE","app_user_id":"test-user-1","period_type":"TRIAL"}}'
```
Expected: `200 {"ok":true}`. Then use the Supabase MCP tool `execute_sql` with `project_id: wnzbmmhtdchdqjnskwlo`, query: `select * from entitlements where id = 'test-user-1';` — expect one row with `tier='trial'`, `trial_credits_remaining=15`.

- [ ] **Step 7: Commit**

```bash
git add supabase/functions/rc-webhook/index.ts
git commit -m "Add rc-webhook edge function to sync RevenueCat entitlements"
```

---

### Task 3: Extend render-lookmax with entitlement check

**Files:**
- Modify: `supabase/functions/render-lookmax/index.ts` (current content shown below for exact anchoring)

**Interfaces:**
- Consumes: `public.entitlements` table from Task 1. Client now optionally sends `rcUserId` in the request body (added by Task 7).
- Produces: same response shape as before (`{imageUrl, remaining}` on success), with `remaining` now meaning "renders left in whichever tier granted this one" — free-tier responses report against the 2/day cap, trial responses report `trial_credits_remaining` after decrement, subscribed responses report `60 - monthly_render_count` after increment.

The current file (`supabase/functions/render-lookmax/index.ts`) has this shape around the rate-limit check (lines 69-108):

```typescript
  const { image, deviceId, hairId, beardId, colorName, gender } = body;
  if (!image || !deviceId || !hairId || !colorName || !gender) {
    return new Response(JSON.stringify({ error: "Missing required field" }), { status: 400, headers: CORS });
  }
  if (gender !== "men" && gender !== "women") {
    return new Response(JSON.stringify({ error: "Unknown gender" }), { status: 400, headers: CORS });
  }
  const hairNames = gender === "men" ? HAIR_NAMES_MEN : HAIR_NAMES_WOMEN;
  if (!(hairId in hairNames) || !(colorName in COLOR_NAMES)) {
    return new Response(JSON.stringify({ error: "Unknown style or color id" }), { status: 400, headers: CORS });
  }
  if (beardId && !(beardId in BEARD_NAMES)) {
    return new Response(JSON.stringify({ error: "Unknown beard id" }), { status: 400, headers: CORS });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const today = new Date().toISOString().slice(0, 10);
  const { data: existing, error: rateLimitError } = await supabase
    .from("render_counts")
    .select("count")
    .eq("device_id", deviceId)
    .eq("day", today)
    .maybeSingle();

  // Fail closed: if the rate-limit read itself fails (RLS misconfig, DB
  // hiccup), don't silently let the request through — that would bypass the
  // cap that exists specifically to bound Replicate API spend.
  if (rateLimitError) {
    console.error("Rate limit check failed", rateLimitError);
    return new Response(JSON.stringify({ error: "rate_limit_check_failed" }), { status: 500, headers: CORS });
  }

  const used = existing?.count ?? 0;
  if (used >= RATE_LIMIT_PER_DAY) {
    return new Response(JSON.stringify({ error: "rate_limited", remaining: 0 }), { status: 429, headers: CORS });
  }
```

- [ ] **Step 1: Add the `rcUserId` field and lower the free-tier constant**

In the `RenderRequest` interface, add one field:

```typescript
interface RenderRequest {
  image?: string;
  deviceId?: string;
  rcUserId?: string;
  hairId?: string;
  beardId?: string;
  colorName?: string;
  gender?: string;
}
```

Change the existing constant:

```typescript
const RATE_LIMIT_PER_DAY = 2; // was 5 — paywall now covers heavier usage
```

Add one new constant near it:

```typescript
const MONTHLY_SOFT_CAP = 60;
```

- [ ] **Step 2: Insert the entitlement check before the existing rate-limit block**

Insert this new function above `Deno.serve(...)`:

```typescript
// Returns { allowed: true, consume: () => Promise<void> } if a paid
// entitlement covers this request, or { allowed: false } to fall through to
// the existing free-tier device check. `consume` is only called after a
// successful Replicate render, matching the existing free-tier pattern of
// incrementing only on success.
async function checkEntitlement(
  supabase: ReturnType<typeof createClient>,
  rcUserId: string | undefined,
): Promise<{ allowed: boolean; consume?: () => Promise<void> }> {
  if (!rcUserId) return { allowed: false };

  const { data, error } = await supabase
    .from("entitlements")
    .select("tier, trial_credits_remaining, subscription_active_until, monthly_render_count")
    .eq("id", rcUserId)
    .maybeSingle();

  if (error) {
    console.error("Entitlement check failed", error);
    return { allowed: false }; // fail closed to the free-tier check, not open
  }
  if (!data) return { allowed: false };

  if (data.tier === "trial" && (data.trial_credits_remaining ?? 0) > 0) {
    return {
      allowed: true,
      consume: async () => {
        await supabase
          .from("entitlements")
          .update({ trial_credits_remaining: data.trial_credits_remaining - 1 })
          .eq("id", rcUserId);
      },
    };
  }

  if (
    data.tier === "subscribed" &&
    data.subscription_active_until &&
    new Date(data.subscription_active_until) > new Date() &&
    (data.monthly_render_count ?? 0) < MONTHLY_SOFT_CAP
  ) {
    return {
      allowed: true,
      consume: async () => {
        await supabase
          .from("entitlements")
          .update({ monthly_render_count: (data.monthly_render_count ?? 0) + 1 })
          .eq("id", rcUserId);
      },
    };
  }

  return { allowed: false };
}
```

Then, in the request handler, replace this block:

```typescript
  const { image, deviceId, hairId, beardId, colorName, gender } = body;
```

with:

```typescript
  const { image, deviceId, rcUserId, hairId, beardId, colorName, gender } = body;
```

and insert the entitlement check immediately after the `supabase` client is created (right before `const today = ...`):

```typescript
  const entitlement = await checkEntitlement(supabase, rcUserId);
```

Finally, wrap the existing free-tier rate-limit block (the `today`/`existing`/`rateLimitError`/`used` logic) so it's skipped when `entitlement.allowed` is true. The cleanest way: change

```typescript
  const used = existing?.count ?? 0;
  if (used >= RATE_LIMIT_PER_DAY) {
    return new Response(JSON.stringify({ error: "rate_limited", remaining: 0 }), { status: 429, headers: CORS });
  }
```

to:

```typescript
  const used = existing?.count ?? 0;
  if (!entitlement.allowed && used >= RATE_LIMIT_PER_DAY) {
    return new Response(JSON.stringify({ error: "free_limit_reached", remaining: 0, showPaywall: true }), { status: 429, headers: CORS });
  }
```

(Note the error code change from `rate_limited` to `free_limit_reached` plus a `showPaywall: true` flag — this is what Task 7's client code checks to route to the paywall instead of a generic toast.)

And the existing pre-fetch DB read (`const { data: existing, error: rateLimitError } = ...`) still runs unconditionally — that's fine and simpler than skipping it, since it's cheap and its result is only consulted when `!entitlement.allowed`.

- [ ] **Step 3: Call `consume()` on success instead of the unconditional free-tier upsert**

Find the existing success-path upsert:

```typescript
  await supabase.from("render_counts").upsert(
    { device_id: deviceId, day: today, count: used + 1 },
    { onConflict: "device_id,day" },
  );

  const outputUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
  return new Response(
    JSON.stringify({ imageUrl: outputUrl, remaining: RATE_LIMIT_PER_DAY - used - 1 }),
    { headers: { ...CORS, "Content-Type": "application/json" } },
  );
```

Replace with:

```typescript
  let remaining: number;
  if (entitlement.allowed && entitlement.consume) {
    await entitlement.consume();
    remaining = -1; // client doesn't need an exact count for paid tiers; -1 signals "not a free-tier count"
  } else {
    await supabase.from("render_counts").upsert(
      { device_id: deviceId, day: today, count: used + 1 },
      { onConflict: "device_id,day" },
    );
    remaining = RATE_LIMIT_PER_DAY - used - 1;
  }

  const outputUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
  return new Response(
    JSON.stringify({ imageUrl: outputUrl, remaining }),
    { headers: { ...CORS, "Content-Type": "application/json" } },
  );
```

- [ ] **Step 4: Deploy and verify**

Use `deploy_edge_function` (project_id: wnzbmmhtdchdqjnskwlo, name: render-lookmax) with the full updated file, then `list_edge_functions` to confirm `ACTIVE` with an incremented version.

- [ ] **Step 5: Test — free-tier cap now 2, not 5**

Reuse the invalid-input curl from the photoreal plan (`hairId: "not-a-real-id"`) to confirm validation still runs first (still `400`), then run 3 consecutive valid real-render requests from the same `deviceId` and confirm the 3rd returns `429 {"error":"free_limit_reached", ..., "showPaywall":true}` instead of succeeding. This costs 2 real Replicate renders (the two that succeed under the new cap of 2) — acceptable, matches how the original photoreal plan tested with real renders.

- [ ] **Step 6: Test — trial entitlement bypasses the free cap**

Using the `test-user-1` row Task 2 created (tier='trial', trial_credits_remaining=15), send a real render request with `rcUserId: "test-user-1"` and a fresh `deviceId` that has already exhausted its free cap from Step 5. Expected: `200`, not `429` — confirms the entitlement check is consulted before the free-tier cap blocks. Then check via `execute_sql`: `select trial_credits_remaining from entitlements where id='test-user-1';` — expect `14` (decremented).

- [ ] **Step 7: Commit**

```bash
git add supabase/functions/render-lookmax/index.ts
git commit -m "Extend render-lookmax with entitlement check, lower free cap to 2/day"
```

---

### Task 4: Human checkpoint — Play Console + RevenueCat dashboard setup

**This task is not subagent-executable.** It requires the human's own Play Console and RevenueCat account access — no agent (controller or subagent) can complete it. When executing this plan, the controller should stop here, ask the human directly (same pattern as the Replicate API token step in the photoreal plan, but larger), and wait for the values below before dispatching Task 5.

**What the human needs to do:**
1. In **Play Console**, create a subscription product for Chisel with a base plan (e.g. $6.99/month, or a second base plan at $39.99/year) and a 3-day free-trial-priced-at-$0.99 introductory offer on it. Get the app into at least a closed/internal testing track (required before any billing testing works).
2. In the **RevenueCat dashboard**: link the Play Console product to a RevenueCat "Offering" containing the package(s) above, and to an entitlement (suggest naming it `premium`). Retrieve:
   - The RevenueCat **public SDK API key** for the Android app.
   - Configure a webhook pointed at `https://wnzbmmhtdchdqjnskwlo.supabase.co/functions/v1/rc-webhook`, with the "Authorization Header Value" set to the same secret used for `RC_WEBHOOK_SECRET` in Task 2 Step 4.
3. Add the human's own Google account as a **license tester** in Play Console (Settings → License testing) so test purchases don't charge real money — needed for Task 8.

**What the human hands back for Task 5 to use:**
- The RevenueCat public SDK API key (a string, safe to embed client-side — same trust level as `RENDER_ANON_KEY`).
- The entitlement identifier chosen in RevenueCat (e.g. `premium`).

---

### Task 5: Client — RevenueCat SDK install + init

**Files:**
- Modify: `chisel-android/package.json` (add dependency)
- Modify: `chisel-android/www/index.html:608-616` (add SDK import/config near the existing `RENDER_FN_URL`/`RENDER_ANON_KEY`/`deviceId()` block)

**Interfaces:**
- Consumes: RevenueCat public SDK key and entitlement id from Task 4.
- Produces: `RC_API_KEY: string`, `RC_ENTITLEMENT_ID: string` constants, and an initialized `Purchases` SDK instance — consumed by Task 6 (paywall UI) and Task 7 (purchase wiring).

**Before starting:** this task adds a native Capacitor plugin (not pure JS), which needs `npx cap sync android` (not just `cap copy`) to pull the native Android dependency in, and needs the actual values from Task 4 to be meaningful — confirm those are available before starting.

- [ ] **Step 1: Install the dependency**

```bash
cd chisel-android
npm install @revenuecat/purchases-capacitor
```

Check the installed version's exact API before writing Step 3 — the summarized docs used to write this plan may not perfectly match the installed version. Read `chisel-android/node_modules/@revenuecat/purchases-capacitor/dist/esm/definitions.d.ts` (or the nearest `.d.ts` file) to confirm the exact shape of `Purchases.configure()`, `Purchases.getOfferings()`, and `Purchases.purchasePackage()` before Task 6/7 write code against them. If the shape differs from what's shown in this plan, follow the installed package's actual types — they're ground truth, this plan's paraphrase is not.

- [ ] **Step 2: Sync the native Android project**

```bash
npx cap sync android
```

Expected: completes without error, reports the RevenueCat plugin found and added to the Android project.

- [ ] **Step 3: Add the SDK import and init constants**

The current file has this block at `chisel-android/www/index.html:608-616`:

```javascript
const RENDER_FN_URL = 'https://wnzbmmhtdchdqjnskwlo.supabase.co/functions/v1/render-lookmax';
const RENDER_ANON_KEY = 'sb_publishable_kr_GPQ_vODmXjIxQoV8v6A_FqH8RCts';
function deviceId(){
  let id = store.get('deviceId', null);
  if(!id){ id = 'c-'+Math.random().toString(36).slice(2)+Date.now().toString(36); store.set('deviceId', id); }
  return id;
}
```

Add immediately after it (using the actual values handed off from Task 4 in place of the placeholders shown — these are real config constants, not logic, so filling them in with the real values from Task 4 is a mechanical substitution, not a design decision):

```javascript
const RC_API_KEY = '<RevenueCat public SDK key from Task 4>';
const RC_ENTITLEMENT_ID = '<entitlement id chosen in Task 4, e.g. "premium">';
let rcReady = false;
async function initRevenueCat(){
  try{
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    await Purchases.configure({ apiKey: RC_API_KEY, appUserID: deviceId() });
    window._Purchases = Purchases; // stashed for Task 6/7 to use without re-importing
    rcReady = true;
  }catch(e){ console.warn('RevenueCat init failed', e); }
}
initRevenueCat();
```

Note: passing `deviceId()` as `appUserID` links the RevenueCat identity to the same id already used for the free-tier count, so a user's purchase history stays associated with their device even before Task 7 wires the purchase flow.

- [ ] **Step 4: Verify it loads without error**

`npx serve chisel-android/www`, open in a desktop browser, check devtools console. Since this is a native Capacitor plugin, it will likely log a warning/no-op in a plain browser (no native bridge) rather than fully initializing — that's expected; confirm there's no *uncaught* exception (the try/catch in Step 3 should turn any failure into a caught `console.warn`, not a crash).

- [ ] **Step 5: Commit**

```bash
git add chisel-android/package.json chisel-android/package-lock.json chisel-android/www/index.html
git commit -m "Add RevenueCat SDK dependency and client init"
```

---

### Task 6: Client — Paywall modal UI

**Files:**
- Modify: `chisel-android/www/index.html` (CSS: none new needed, reuses `.modal`/`.panel`/`.x`/`.card`/`.btn` — see Global Constraints)
- Modify: `chisel-android/www/index.html` (HTML: add paywall modal markup, near the existing `<!-- GROOM MODAL -->` block around line 552)
- Modify: `chisel-android/www/index.html` (JS: add paywall render/open/close functions, after Task 5's `initRevenueCat`)

**Interfaces:**
- Consumes: `rcReady`, `window._Purchases`, `RC_ENTITLEMENT_ID` from Task 5.
- Produces: `openPaywall(): void`, `closePaywall(): void` — consumed by Task 7 (wiring the "Go Premium" entry point and the `free_limit_reached` response).

- [ ] **Step 1: Add the paywall modal markup**

Insert after the existing `<!-- GROOM MODAL -->` block (after its closing `</div>` at line 569, before `<script>`):

```html
<!-- PAYWALL MODAL -->
<div class="modal" id="paywall">
  <div class="panel">
    <div class="x" id="paywallX">✕</div>
    <div class="eyebrow">Go Premium</div>
    <h3>Photoreal, unlocked.</h3>
    <p class="lede">Try every feature for 3 days, then keep going if it's for you.</p>
    <div id="paywallOfferings" style="margin:18px 0;display:flex;flex-direction:column;gap:14px">
      <p class="lede" id="paywallLoading">Loading offers…</p>
    </div>
    <button class="btn ghost" id="paywallRestore" style="width:100%">Restore purchases</button>
  </div>
</div>
```

- [ ] **Step 2: Add the paywall JS**

Insert after `initRevenueCat()` (from Task 5, `chisel-android/www/index.html` near line 620):

```javascript
function openPaywall(){
  $('#paywall').classList.add('on');
  renderPaywallOfferings();
}
function closePaywall(){ $('#paywall').classList.remove('on'); }
$('#paywallX').addEventListener('click', closePaywall);
$('#paywall').addEventListener('click', e=>{ if(e.target.id==='paywall') closePaywall(); });

async function renderPaywallOfferings(){
  const el = $('#paywallOfferings');
  if(!rcReady){ el.innerHTML = '<p class="lede">Store unavailable right now — try again shortly.</p>'; return; }
  try{
    const offerings = await window._Purchases.getOfferings();
    const pkgs = offerings.current && offerings.current.availablePackages || [];
    if(!pkgs.length){ el.innerHTML = '<p class="lede">No offers available right now.</p>'; return; }
    el.innerHTML = '';
    pkgs.forEach(pkg=>{
      const card = document.createElement('div');
      card.className = 'card gold';
      const price = pkg.product && pkg.product.priceString || '';
      const title = pkg.product && pkg.product.title || pkg.identifier;
      card.innerHTML = `<div class="eyebrow">${title}</div>
        <div style="font-family:var(--display);font-size:28px;margin:6px 0">${price}</div>
        <button class="btn solid" style="width:100%;margin-top:10px">Choose</button>`;
      card.querySelector('button').addEventListener('click', ()=>purchase(pkg));
      el.appendChild(card);
    });
  }catch(e){
    console.warn('renderPaywallOfferings', e);
    el.innerHTML = '<p class="lede">Couldn\'t load offers — try again shortly.</p>';
  }
}
```

`purchase(pkg)` itself is written in Task 7 (it needs the entitlement-check/render-request wiring context) — this task only renders the offerings list and defines the open/close/render functions above.

- [ ] **Step 3: Verify it loads without error**

`npx serve chisel-android/www`, open in a desktop browser, run `openPaywall()` in devtools console. Expected: the modal slides up (reusing the existing Groom-modal animation/style), shows "Store unavailable right now" (since `rcReady` will be `false` in a plain browser without the native bridge — expected, matches Task 5 Step 4's note), and `paywallX`/click-outside both close it.

- [ ] **Step 4: Commit**

```bash
git add chisel-android/www/index.html
git commit -m "Add paywall modal UI"
```

---

### Task 7: Client — wire purchase flow and 429 routing

**Files:**
- Modify: `chisel-android/www/index.html:1204-1239` (`renderPhotoreal()` — send `rcUserId`, route `free_limit_reached` to the paywall)
- Modify: `chisel-android/www/index.html` (add `purchase()` function near Task 6's paywall functions)
- Modify: `chisel-android/www/index.html` (add a "Go Premium" entry point button — see Step 3)

**Interfaces:**
- Consumes: `openPaywall()`/`closePaywall()` from Task 6, `window._Purchases`/`RC_ENTITLEMENT_ID`/`rcReady` from Task 5.
- Produces: `purchase(pkg): Promise<void>`, `rcUserIdIfEntitled(): string|undefined` — internal to this feature.

The current `renderPhotoreal()` (`chisel-android/www/index.html:1204-1239`) sends this body:

```javascript
    const res = await fetch(RENDER_FN_URL, {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'apikey':RENDER_ANON_KEY },
      body: JSON.stringify({ image, deviceId: deviceId(), hairId, beardId, colorName: colorName||'match', gender: styleGender })
    });
    const data = await res.json();
    if(!res.ok){
      if(data.error==='rate_limited') toast('You\'ve hit today\'s render limit — back tomorrow');
      else toast('Couldn\'t render that one — try again');
      return;
    }
```

- [ ] **Step 1: Add the entitlement-lookup helper and update the request body**

Insert this function near `deviceId()` (Task 3's file, `chisel-android/www/index.html` near line 616):

```javascript
async function rcUserIdIfEntitled(){
  if(!rcReady) return undefined;
  try{
    const result = await window._Purchases.getCustomerInfo();
    const info = result.customerInfo || result; // SDK versions vary on whether this is wrapped
    const active = info.entitlements && info.entitlements.active && info.entitlements.active[RC_ENTITLEMENT_ID];
    return (active && active.isActive) ? deviceId() : undefined; // appUserID was set to deviceId() in Task 5
  }catch(e){ console.warn('rcUserIdIfEntitled', e); return undefined; }
}
```

Update the fetch body in `renderPhotoreal()`:

```javascript
    const rcUserId = await rcUserIdIfEntitled();
    const res = await fetch(RENDER_FN_URL, {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'apikey':RENDER_ANON_KEY },
      body: JSON.stringify({ image, deviceId: deviceId(), rcUserId, hairId, beardId, colorName: colorName||'match', gender: styleGender })
    });
```

- [ ] **Step 2: Route the 429 response to the paywall**

Replace:

```javascript
    if(!res.ok){
      if(data.error==='rate_limited') toast('You\'ve hit today\'s render limit — back tomorrow');
      else toast('Couldn\'t render that one — try again');
      return;
    }
```

with:

```javascript
    if(!res.ok){
      if(data.showPaywall){ closePhotorealResult(); openPaywall(); }
      else toast('Couldn\'t render that one — try again');
      return;
    }
```

(The old `rate_limited` error code no longer exists on this path — Task 3 renamed it to `free_limit_reached` with `showPaywall:true`. `closePhotorealResult()` already exists from the photoreal feature.)

- [ ] **Step 3: Fix the remaining-count note for paid-tier renders**

Task 3 Step 3 has the server send `remaining: -1` for trial/subscribed renders (since "renders left today" doesn't apply to those tiers). The existing success handler in `renderPhotoreal()` doesn't know about this sentinel yet:

```javascript
    _prLastResult = data.imageUrl;
    $('#photorealNote').textContent = data.remaining+' left today';
    showPhotorealResult(_prBeforeUrl, _prLastResult);
```

Replace the note-setting line with:

```javascript
    _prLastResult = data.imageUrl;
    $('#photorealNote').textContent = data.remaining>=0 ? (data.remaining+' left today') : 'Premium';
    showPhotorealResult(_prBeforeUrl, _prLastResult);
```

- [ ] **Step 4: Add the `purchase()` function and a "Go Premium" entry point**

Insert near Task 6's paywall functions:

```javascript
async function purchase(pkg){
  if(!rcReady){ toast('Store unavailable right now'); return; }
  try{
    await window._Purchases.purchasePackage({ aPackage: pkg });
    toast('You\'re in — enjoy premium');
    closePaywall();
  }catch(e){
    if(e && e.userCancelled) return; // silent — user backed out, not an error
    console.warn('purchase', e);
    toast('Purchase didn\'t go through — try again');
  }
}
$('#paywallRestore').addEventListener('click', async ()=>{
  if(!rcReady){ toast('Store unavailable right now'); return; }
  try{
    await window._Purchases.restorePurchases();
    toast('Purchases restored');
    closePaywall();
  }catch(e){ console.warn('restorePurchases', e); toast('Couldn\'t restore — try again'); }
});
```

**Note on `purchasePackage({ aPackage: pkg })`:** verify this exact parameter shape against the installed package's type definitions (Task 5 Step 1 already flagged this as the one uncertain API surface in this plan) before finalizing — some RevenueCat Capacitor SDK versions use `{ aPackage }`, others a positional argument. Use whatever the installed `.d.ts` actually declares.

Add the "Go Premium" entry point button next to the existing photoreal button — modify the `#photorealBtn`/`#photorealNote` row (`chisel-android/www/index.html:527-529`, currently):

```html
      <button class="photoreal-btn" id="photorealBtn">✦ Make it photoreal</button>
      <span class="photoreal-note" id="photorealNote"></span>
```

to:

```html
      <button class="photoreal-btn" id="photorealBtn">✦ Make it photoreal</button>
      <span class="photoreal-note" id="photorealNote"></span>
      <button class="btn ghost" id="goPremiumBtn" style="min-height:32px;padding:6px 12px;font-size:10px">Go Premium</button>
```

and add its handler alongside the other paywall wiring:

```javascript
$('#goPremiumBtn').addEventListener('click', openPaywall);
```

- [ ] **Step 5: Verify live**

`npx serve chisel-android/www` in a desktop browser (no real purchase possible without the native bridge, but confirm no console errors): open Style try-on, confirm the "Go Premium" button opens the paywall modal, confirm `renderPhotoreal()` still runs end-to-end for a real render (the `rcUserId` lookup should gracefully resolve to `undefined` outside Capacitor and fall through to the existing free-tier path, unchanged behavior from before this task).

- [ ] **Step 6: Commit**

```bash
git add chisel-android/www/index.html
git commit -m "Wire RevenueCat purchase flow and route free-limit to paywall"
```

---

### Task 8: Build and verify on device with a real test purchase

**Files:** none (build/deploy only, plus the license-tester purchase test)

- [ ] **Step 1: Sync and build**

```bash
cd chisel-android && npx cap sync android
cd android && .\gradlew.bat assembleDebug --no-daemon -q
```

- [ ] **Step 2: Install to the connected device**

```bash
adb install -r app\build\outputs\apk\debug\app-debug.apk
adb shell monkey -p com.chisel.lookmax -c android.intent.category.LAUNCHER 1
```

- [ ] **Step 3: Manual verification (human, on the real device, signed in with the license-tester Google account from Task 4)**

- Open Style try-on, tap "Go Premium" — confirm the paywall shows the real offering(s) configured in Task 4 with real price strings.
- Tap the trial offer — confirm Google's real purchase sheet appears, showing "$0.99 for 3 days" (license testers see this UI but aren't actually charged).
- Complete the test purchase — confirm the paywall closes and a success toast appears.
- Tap "Make it photoreal" — confirm it succeeds without hitting the free-tier cap (this is now covered by the trial entitlement).
- Check via the Supabase MCP tool `execute_sql` (`select * from entitlements where id = '<the device's deviceId>';`) — confirm `tier='trial'` and `trial_credits_remaining` decremented from 15.
- Tap "Restore purchases" — confirm it succeeds without erroring (there's nothing new to restore right after purchasing, but the call itself should complete cleanly).

- [ ] **Step 4: Commit any fixes found during device testing**

```bash
git add -A
git commit -m "Paywall: on-device verification fixes"
```
(Skip this commit if no fixes were needed.)
