// Supabase Edge Function: render-lookmax
// Optional photoreal hairstyle / facial-hair rendering for Chisel.
// Server-owned controls: strict payload validation, RevenueCat entitlement lookup,
// atomic per-identity/global budgets, allowlisted prompt inputs, and restrictive CORS.

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  readRequestTextWithLimit,
  safeColorInstruction,
  validateDataImage,
  validateRenderIdentity,
} from './security.mjs';

interface RenderRequest {
  image: string;
  deviceId: string;
  rcUserId?: string;
  hairId: string;
  requestedHairId?: string;
  beardId?: string;
  colorName?: string;
  gender?: 'men' | 'women';
}

const HAIR_NAMES_MEN: Record<string,string> = {
  none: 'the same scalp hair as the source image; do not alter the scalp hairstyle',
  buzz: 'a true close buzz cut, uniformly clippered very short to the head with an unmistakably tight silhouette and clean natural hairline',
  crop: 'a low taper textured French crop: tight tapered sides, short choppy textured top, and a clearly visible short forward fringe',
  quiff: 'a modern quiff with distinctly tight sides and a taller swept-up front peak, textured rather than slick',
  pomp: 'a classic modern pompadour with a high rounded front roll, substantial top volume, and controlled shorter sides',
  slick: 'a sleek swept-back hairstyle with low front lift, comb direction moving backward from the hairline, and tidy close sides',
  curly: 'a short-to-medium curly taper with dense natural curl clumps on top, visible curl separation, and shorter controlled sides',
  mlong: 'a medium-length flow hairstyle with clear side and back fall toward the ears and nape, soft movement, and a natural center-to-side direction',
};

const HAIR_NAMES_WOMEN: Record<string,string> = {
  none: 'the same scalp hair as the source image; do not alter the scalp hairstyle',
  pixie: 'a soft pixie cut with cropped sides and back, feathered short layers, and a clearly short silhouette',
  bixie: 'a bixie cut between pixie and bob: short layered crown, soft side pieces, and visible ear-to-nape length without becoming a bob',
  frenchbob: 'a French bob ending around the jaw with a compact rounded perimeter and a light wispy fringe; unmistakably shorter than a lob',
  bob: 'a classic clean bob ending around the jaw, with a structured perimeter and no long shoulder-length fall',
  lob: 'a long bob ending around the collarbone with a clear medium-length perimeter and softly tucked or face-framing ends',
  butterfly: 'long butterfly layers with a lifted crown, dramatic shorter face-framing layers around the cheekbones and jaw, and clearly longer lower layers',
  curtain: 'long hair with unmistakable center-parted curtain bangs that split away from the forehead and frame both sides of the face',
  layers: 'long layered hair with several visible graduated lengths, soft face framing, and natural movement through the lower sections',
  sleeklong: 'very sleek long straight hair with a clean center or soft center part, minimal wave, smooth controlled fall, and a narrow silhouette',
  waves: 'long soft waves with broad S-shaped bends, airy movement, and separated wave groups rather than curls',
  curls: 'defined medium-to-long curls with distinct springy curl clumps, rounded volume, visible curl separation, and no straight side panels',
  coils: 'natural tight coils with dense small coil groups, rounded controlled volume, and authentic coily edge texture',
  shag: 'a textured shag with choppy crown layers, broken wispy fringe, uneven feathered ends, and intentionally piecey texture',
  wolf: 'a soft wolf cut with pronounced crown volume, short shaggy face-framing layers, wispy fringe, and a longer tapered back',
  braids: 'multiple long individual braids with visible braided structure from natural roots through the lengths; do not render them as loose straight hair',
  pony: 'a high ponytail with the front hair pulled cleanly back and a clearly visible elevated ponytail falling behind and to the side of the head',
  bun: 'a sleek pulled-back bun with a clearly visible compact rounded bun positioned high at the back/crown and no loose long side fall',
  updo: 'a soft textured updo with the hair gathered upward at the back/crown, visible pinned volume and a few controlled face-framing pieces',
  long: 'long straight-to-softly-textured hair with a natural long fall below the shoulders',
  wavy: 'long wavy hair with visible S-shaped wave groups',
  curly: 'defined curly hair with natural curl clumps and rounded volume',
  bangs: 'medium-to-long hair with a clearly visible soft fringe across the forehead',
};

const BEARD_NAMES: Record<string,string> = {
  none: 'clean-shaven; remove visible beard and moustache while preserving natural skin texture',
  stubble: 'even natural 1–2 mm stubble across moustache, cheeks, jaw and chin; visibly present but very short, with a soft natural neckline',
  short: 'a clearly visible 4–6 mm short boxed beard with connected moustache, medium cheek density, stronger jaw and chin density, faded sideburn transition, a clean natural cheek line and tidy neckline',
  full: 'a dense full beard with connected moustache, filled cheeks, substantial jaw and chin volume, natural individual hairs, a clean cheek line and groomed neckline',
  goatee: 'a connected moustache-and-goatee concentrated around the mouth and chin, with cheeks essentially clean',
  vandyke: 'a Van Dyke with a distinct moustache and pointed chin beard separated by cleaner cheek and jaw areas',
  mous: 'a defined natural moustache only, with cheeks, jaw and chin clean-shaven',
  chin: 'a jawline/chinstrap beard following the jaw with a clean upper cheek area and controlled natural neckline',
};

const REPLICATE_MODEL = 'black-forest-labs/flux-kontext-pro';
const FREE_DAILY_LIMIT = 2;
const PREMIUM_DAILY_LIMIT = 20;

function validId(v: string | undefined, map: Record<string,string>) {
  return !!v && Object.prototype.hasOwnProperty.call(map, v);
}

function allowedOrigins() {
  const configured = (Deno.env.get('CHISEL_ALLOWED_ORIGINS') || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const origins = new Set<string>(['https://localhost', ...configured]);
  if (Deno.env.get('CHISEL_ALLOW_DEV_ORIGIN') === '1') origins.add('http://localhost:8080');
  return origins;
}

function responseHeaders(req: Request) {
  const headers: Record<string,string> = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Vary': 'Origin',
  };
  const origin = req.headers.get('Origin');
  if (origin && allowedOrigins().has(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

function json(req: Request, data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: responseHeaders(req) });
}

function originAllowed(req: Request) {
  const origin = req.headers.get('Origin');
  return !origin || allowedOrigins().has(origin);
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function isPremiumViaRevenueCat(userId: string | null): Promise<boolean> {
  if (!userId) return false;
  const secret = Deno.env.get('REVENUECAT_SECRET');
  if (!secret) return false;
  try {
    const r = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return false;
    const d = await r.json();
    const entitlement = d?.subscriber?.entitlements?.premium;
    return !!(entitlement && (!entitlement.expires_date || new Date(entitlement.expires_date).getTime() > Date.now()));
  } catch {
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (!originAllowed(req)) return json(req, { error: 'origin_not_allowed' }, 403);
  if (req.method === 'OPTIONS') {
    const headers = responseHeaders(req);
    headers['Access-Control-Allow-Headers'] = 'authorization, x-client-info, apikey, content-type';
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    headers['Access-Control-Max-Age'] = '600';
    return new Response(null, { status: 204, headers });
  }
  if (req.method !== 'POST') return json(req, { error: 'method_not_allowed' }, 405);
  if (!/^application\/json(?:\s*;|$)/i.test(req.headers.get('Content-Type') || '')) {
    return json(req, { error: 'unsupported_media_type' }, 415);
  }

  let rawBody: string;
  try {
    rawBody = await readRequestTextWithLimit(req);
  } catch (error) {
    if (error instanceof Error && error.message === 'body_too_large') return json(req, { error: 'body_too_large' }, 413);
    return json(req, { error: 'invalid_request' }, 400);
  }

  let body: RenderRequest;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return json(req, { error: 'invalid_json' }, 400);
  }

  const identity = validateRenderIdentity({ deviceId: body?.deviceId, rcUserId: body?.rcUserId });
  if (!identity || typeof body?.hairId !== 'string') return json(req, { error: 'invalid_request' }, 400);

  const imageCheck = validateDataImage(body.image);
  if (!imageCheck.ok) return json(req, { error: 'invalid_image' }, 400);

  const gender = body.gender === 'women' ? 'women' : 'men';
  const beardId = typeof body.beardId === 'string' ? body.beardId : 'none';
  const hairMap = gender === 'women' ? HAIR_NAMES_WOMEN : HAIR_NAMES_MEN;
  const exactHairId = validId(body.requestedHairId, hairMap) ? body.requestedHairId! : body.hairId;
  if (!validId(exactHairId, hairMap) || !validId(beardId, BEARD_NAMES)) {
    return json(req, { error: 'invalid_style' }, 400);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const replicateToken = Deno.env.get('REPLICATE_API_TOKEN');
  const globalBudget = Number(Deno.env.get('CHISEL_GLOBAL_DAILY_RENDER_BUDGET'));
  if (!supabaseUrl || !serviceKey || !replicateToken || !Number.isInteger(globalBudget) || globalBudget < 1 || globalBudget > 100000) {
    console.error('render-lookmax server configuration incomplete');
    return json(req, { error: 'server_not_configured' }, 503);
  }

  const premium = await isPremiumViaRevenueCat(identity.rcUserId);
  const identityLimit = premium ? PREMIUM_DAILY_LIMIT : FREE_DAILY_LIMIT;
  const identityMaterial = premium && identity.rcUserId
    ? `premium:${identity.rcUserId}`
    : `device:${identity.deviceId}`;
  const identityKey = await sha256Hex(identityMaterial);

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const day = new Date().toISOString().slice(0, 10);
  const { data: allowance, error: allowanceError } = await supabase.rpc('consume_render_budget', {
    p_identity_key: identityKey,
    p_day: day,
    p_identity_limit: identityLimit,
    p_global_limit: globalBudget,
  });
  if (allowanceError) {
    console.error('render budget check failed');
    return json(req, { error: 'rate_limit_unavailable' }, 503);
  }
  if (!allowance?.allowed) {
    const globalExhausted = allowance?.reason === 'global_budget';
    return json(req, {
      error: globalExhausted ? 'service_budget_reached' : 'free_limit_reached',
      showPaywall: !premium && !globalExhausted,
      remaining: Number(allowance?.remaining || 0),
    }, 429);
  }

  const hairDesc = hairMap[exactHairId];
  const beardDesc = BEARD_NAMES[beardId];
  const colorDesc = safeColorInstruction(body.colorName);
  const prompt = [
    'Perform a precise identity-preserving grooming edit on this portrait. Edit only scalp hair and facial hair.',
    `Requested scalp hairstyle: ${hairDesc}.`,
    `Facial hair: ${beardDesc}. ${colorDesc}.`,
    'Preserve the exact same person: do not change facial geometry, apparent age, expression, skin tone or skin texture, eyebrows, eyes, nose, lips, ears, neck, pose, clothing, camera angle, lens perspective, crop or background. Do not beautify, reshape, slim, enlarge, de-age or retouch the face.',
    'Make the hair physically believable: natural roots emerging from the scalp, individual strand groups, realistic density variation, subtle flyaways, translucent edge hairs, correct forehead and ear occlusion, and contact shadows that match the source lighting. Facial hair must contain individual hairs and natural density transitions instead of a painted patch.',
    'Avoid wig-like edges, helmet shapes, plastic shine, painted hair, duplicated curls, halo artifacts, floating hair, fake beard stickers or changes to the person’s identity. Match the original image’s lighting, sharpness, grain, colour response and depth of field. Photorealistic editorial grooming result.',
  ].join(' ');

  try {
    const create = await fetch(`https://api.replicate.com/v1/models/${REPLICATE_MODEL}/predictions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${replicateToken}`,
        'Content-Type': 'application/json',
        Prefer: 'wait=60',
      },
      body: JSON.stringify({ input: { prompt, input_image: body.image, output_format: 'jpg', safety_tolerance: 2 } }),
    });
    const pred = await create.json();
    if (!create.ok) {
      console.error('Replicate render creation failed', { status: create.status });
      return json(req, { error: 'render_failed' }, 502);
    }

    let output = pred.output;
    if (!output && pred.urls?.get) {
      for (let i = 0; i < 28; i += 1) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        const poll = await fetch(pred.urls.get, { headers: { Authorization: `Bearer ${replicateToken}` } });
        const pd = await poll.json();
        if (pd.status === 'succeeded') {
          output = pd.output;
          break;
        }
        if (pd.status === 'failed' || pd.status === 'canceled') return json(req, { error: 'render_failed' }, 502);
      }
    }

    const imageUrl = Array.isArray(output) ? output[0] : output;
    if (typeof imageUrl !== 'string' || !/^https:\/\//i.test(imageUrl)) return json(req, { error: 'render_timeout' }, 504);
    return json(req, {
      imageUrl,
      remaining: Number(allowance.remaining || 0),
      premium,
      hairId: exactHairId,
    });
  } catch {
    console.error('Replicate render request failed');
    return json(req, { error: 'render_failed' }, 502);
  }
});
