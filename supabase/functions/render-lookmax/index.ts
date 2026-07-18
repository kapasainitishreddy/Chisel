// supabase/functions/render-lookmax/index.ts
//
// Validates a hair/beard style + color selection against known presets,
// builds a server-side prompt (client free text is never trusted or used),
// and calls Replicate's flux-kontext-pro model to render a photoreal preview.
//
// Deploy via the Supabase MCP tool `deploy_edge_function` (see Task 2 Step 2).
// Secret REPLICATE_API_TOKEN must be set by a human (see Task 2 Step 4) —
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are auto-injected by the
// Edge Functions runtime and need no manual setup.

import { createClient } from "npm:@supabase/supabase-js@2";

// Men's and women's preset lists both reuse the ids "none" and "curly" with
// different meanings (men's curly = short curly crop; women's curly = long
// curly hair) — kept as separate maps, selected by gender, so they can never
// be cross-mislabeled.
const HAIR_NAMES_MEN: Record<string, string> = {
  none: "no hair / bald", buzz: "buzz cut", crop: "textured crop",
  quiff: "quiff", pomp: "pompadour", slick: "slicked back hair",
  curly: "curly crop", mlong: "medium-length flowing hair",
};
const HAIR_NAMES_WOMEN: Record<string, string> = {
  none: "no hair / bald", pixie: "pixie cut", bob: "bob haircut",
  lob: "long bob", long: "long straight hair", wavy: "wavy hair",
  curly: "curly, long hair", bangs: "hair with bangs", updo: "updo hairstyle",
};
const BEARD_NAMES: Record<string, string> = {
  none: "clean shaven", stubble: "light stubble", short: "short beard",
  full: "full beard", goatee: "goatee", vandyke: "Van Dyke beard",
  mous: "moustache only", chin: "chinstrap beard",
};
const COLOR_NAMES: Record<string, string> = {
  match: "", Black: "black", Espresso: "dark espresso brown",
  "Dk brown": "dark brown", "Ash brown": "ash brown", Brown: "brown",
  Caramel: "caramel brown", Auburn: "auburn red-brown",
  "Golden blonde": "golden blonde", Blonde: "blonde",
  "Ash blonde": "ash blonde", Grey: "grey", Platinum: "platinum blonde",
};

const RATE_LIMIT_PER_DAY = 5;
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RenderRequest {
  image?: string;
  deviceId?: string;
  hairId?: string;
  beardId?: string;
  colorName?: string;
  gender?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405, headers: CORS });
  }

  let body: RenderRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: CORS });
  }

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

  const hairDesc = hairNames[hairId];
  const beardDesc = gender === "men" && beardId ? BEARD_NAMES[beardId] : null;
  const colorDesc = COLOR_NAMES[colorName];
  const parts = [`Change this person's hairstyle to ${hairDesc}`];
  if (colorDesc) parts.push(`with ${colorDesc} hair color`);
  if (beardDesc) parts.push(`and facial hair styled as ${beardDesc}`);
  parts.push("keep the same face, identity, skin tone, and background, photorealistic, natural lighting");
  const prompt = parts.join(", ") + ".";

  const replicateToken = Deno.env.get("REPLICATE_API_TOKEN");
  if (!replicateToken) {
    return new Response(JSON.stringify({ error: "Server not configured" }), { status: 500, headers: CORS });
  }

  const predictionRes = await fetch(
    "https://api.replicate.com/v1/models/black-forest-labs/flux-kontext-pro/predictions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${replicateToken}`,
        "Content-Type": "application/json",
        Prefer: "wait=25",
      },
      body: JSON.stringify({
        input: {
          prompt,
          input_image: image,
          output_format: "jpg",
          safety_tolerance: 2,
        },
      }),
    },
  );

  if (!predictionRes.ok) {
    console.error("Replicate error", predictionRes.status, await predictionRes.text());
    return new Response(JSON.stringify({ error: "render_failed" }), { status: 502, headers: CORS });
  }

  let prediction;
  try {
    prediction = await predictionRes.json();
  } catch (err) {
    console.error("Replicate response not JSON", err);
    return new Response(JSON.stringify({ error: "render_failed" }), { status: 502, headers: CORS });
  }

  let attempts = 0;
  while (
    prediction.status !== "succeeded" &&
    prediction.status !== "failed" &&
    prediction.status !== "canceled" &&
    attempts < 8
  ) {
    await new Promise((r) => setTimeout(r, 1500));
    const pollRes = await fetch(prediction.urls.get, {
      headers: { Authorization: `Bearer ${replicateToken}` },
    });
    if (!pollRes.ok) {
      console.error("Replicate poll error", pollRes.status, await pollRes.text());
      return new Response(JSON.stringify({ error: "render_failed" }), { status: 502, headers: CORS });
    }
    try {
      prediction = await pollRes.json();
    } catch (err) {
      console.error("Replicate poll response not JSON", err);
      return new Response(JSON.stringify({ error: "render_failed" }), { status: 502, headers: CORS });
    }
    attempts++;
  }

  if (prediction.status !== "succeeded") {
    return new Response(JSON.stringify({ error: "render_timeout" }), { status: 504, headers: CORS });
  }

  await supabase.from("render_counts").upsert(
    { device_id: deviceId, day: today, count: used + 1 },
    { onConflict: "device_id,day" },
  );

  const outputUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
  return new Response(
    JSON.stringify({ imageUrl: outputUrl, remaining: RATE_LIMIT_PER_DAY - used - 1 }),
    { headers: { ...CORS, "Content-Type": "application/json" } },
  );
});
