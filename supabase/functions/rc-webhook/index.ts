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
