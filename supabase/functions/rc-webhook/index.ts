// supabase/functions/rc-webhook/index.ts
// RevenueCat subscription lifecycle webhook with layered verification:
// dashboard Authorization secret + HMAC signature + durable event-id idempotency.

import { createClient } from "npm:@supabase/supabase-js@2";
import {
  entitlementActionForEvent,
  readRequestTextWithLimit,
  validateRevenueCatEvent,
  verifyRevenueCatSignature,
} from "./security.mjs";

const TRIAL_CREDITS = 15;

interface RCEvent {
  id: string;
  type: string;
  app_user_id: string;
  event_timestamp_ms: number;
  product_id?: string;
  expiration_at_ms?: number | null;
  entitlement_ids?: string[];
  period_type?: string;
}
interface RCWebhookBody {
  api_version?: string;
  event?: RCEvent;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!/^application\/json(?:\s*;|$)/i.test(req.headers.get("Content-Type") || "")) {
    return json({ error: "unsupported_media_type" }, 415);
  }

  const expectedAuth = Deno.env.get("RC_WEBHOOK_SECRET");
  const signingSecret = Deno.env.get("RC_WEBHOOK_SIGNING_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!expectedAuth || !signingSecret || !supabaseUrl || !serviceRoleKey) {
    console.error("RevenueCat webhook server configuration incomplete");
    return json({ error: "server_not_configured" }, 500);
  }

  if (req.headers.get("Authorization") !== expectedAuth) {
    return json({ error: "unauthorized" }, 401);
  }

  let rawBody: string;
  try {
    rawBody = await readRequestTextWithLimit(req);
  } catch (error) {
    if (error instanceof Error && error.message === "body_too_large") {
      return json({ error: "body_too_large" }, 413);
    }
    console.error("RevenueCat webhook body read failed");
    return json({ error: "invalid_request" }, 400);
  }

  const signatureOk = await verifyRevenueCatSignature({
    rawBody,
    signatureHeader: req.headers.get("X-RevenueCat-Webhook-Signature"),
    secret: signingSecret,
  });
  if (!signatureOk) return json({ error: "invalid_signature" }, 401);

  let body: RCWebhookBody;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const event = body.event;
  if (!validateRevenueCatEvent(event)) return json({ error: "invalid_event" }, 400);

  const action = entitlementActionForEvent(event);
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.rpc("process_revenuecat_event", {
    p_event_id: event.id,
    p_event_type: event.type,
    p_app_user_id: event.app_user_id,
    p_event_timestamp_ms: event.event_timestamp_ms,
    p_action: action,
    p_expiration_at_ms: event.expiration_at_ms ?? null,
    p_trial_credits: TRIAL_CREDITS,
  });

  if (error) {
    console.error("RevenueCat webhook processing failed", {
      eventId: event.id,
      eventType: event.type,
    });
    return json({ error: "processing_failed" }, 500);
  }

  return json({
    ok: true,
    duplicate: Boolean(data?.duplicate),
    stale: Boolean(data?.stale),
  });
});
