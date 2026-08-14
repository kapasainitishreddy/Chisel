// Supabase Edge Function: render-lookmax
// Optional photoreal hairstyle / facial-hair rendering for Chisel.
// Deploy to the Chisel Supabase project and set REPLICATE_API_TOKEN + REVENUECAT_SECRET.

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface RenderRequest {
  image: string;
  deviceId: string;
  rcUserId?: string;
  hairId: string;
  requestedHairId?: string;
  requestedHairName?: string;
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

  // Legacy IDs retained only for older installed clients.
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

function json(data: unknown, status=200) {
  return new Response(JSON.stringify(data), { status, headers:{...CORS,'Content-Type':'application/json'} });
}
function validId(v: string | undefined, map: Record<string,string>) { return !!v && Object.prototype.hasOwnProperty.call(map,v); }

async function isPremiumViaRevenueCat(userId: string | undefined): Promise<boolean> {
  if (!userId) return false;
  const secret = Deno.env.get('REVENUECAT_SECRET');
  if (!secret) return false;
  try {
    const r = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, { headers:{ Authorization:`Bearer ${secret}` } });
    if (!r.ok) return false;
    const d = await r.json();
    const entitlement = d?.subscriber?.entitlements?.premium;
    return !!(entitlement && (!entitlement.expires_date || new Date(entitlement.expires_date).getTime() > Date.now()));
  } catch { return false; }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok',{headers:CORS});
  if (req.method !== 'POST') return json({error:'method_not_allowed'},405);

  let body: RenderRequest;
  try { body = await req.json(); } catch { return json({error:'invalid_json'},400); }
  const { image, deviceId, rcUserId, hairId, requestedHairId, beardId='none', colorName='match', gender='men' } = body;
  if (!image || !deviceId || !hairId) return json({error:'missing_fields'},400);
  if (image.length > 8_000_000 || !/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(image)) return json({error:'invalid_image'},400);

  const hairMap = gender === 'women' ? HAIR_NAMES_WOMEN : HAIR_NAMES_MEN;
  const exactHairId = validId(requestedHairId,hairMap) ? requestedHairId! : hairId;
  if (!validId(exactHairId,hairMap) || !validId(beardId,BEARD_NAMES)) return json({error:'invalid_style'},400);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const replicateToken = Deno.env.get('REPLICATE_API_TOKEN');
  if (!supabaseUrl || !serviceKey || !replicateToken) return json({error:'server_not_configured'},503);

  const premium = await isPremiumViaRevenueCat(rcUserId);
  const supabase = createClient(supabaseUrl,serviceKey,{auth:{persistSession:false}});
  const day = new Date().toISOString().slice(0,10);
  let remaining = -1;
  if (!premium) {
    const { data, error } = await supabase.rpc('consume_render_allowance',{ p_device_id:deviceId,p_day:day,p_limit:FREE_DAILY_LIMIT });
    if (error) { console.error('allowance',error); return json({error:'rate_limit_unavailable'},503); }
    if (!data?.allowed) return json({error:'free_limit_reached',showPaywall:true,remaining:0},429);
    remaining = data.remaining;
  }

  const hairDesc = hairMap[exactHairId];
  const beardDesc = BEARD_NAMES[beardId];
  const colorDesc = colorName === 'match' ? 'preserve the source person’s natural hair colour' : `use ${colorName} hair colour`;
  const requestName = requestedHairName ? ` The user selected the style named “${requestedHairName}”.` : '';
  const prompt = [
    `Perform a precise identity-preserving grooming edit on this portrait. Edit only scalp hair and facial hair.`,
    `Requested scalp hairstyle: ${hairDesc}.${requestName}`,
    `Facial hair: ${beardDesc}. ${colorDesc}.`,
    `Preserve the exact same person: do not change facial geometry, apparent age, expression, skin tone or skin texture, eyebrows, eyes, nose, lips, ears, neck, pose, clothing, camera angle, lens perspective, crop or background. Do not beautify, reshape, slim, enlarge, de-age or retouch the face.`,
    `Make the hair physically believable: natural roots emerging from the scalp, individual strand groups, realistic density variation, subtle flyaways, translucent edge hairs, correct forehead and ear occlusion, and contact shadows that match the source lighting. Facial hair must contain individual hairs and natural density transitions instead of a painted patch.`,
    `Avoid wig-like edges, helmet shapes, plastic shine, painted hair, duplicated curls, halo artifacts, floating hair, fake beard stickers or changes to the person’s identity. Match the original image’s lighting, sharpness, grain, colour response and depth of field. Photorealistic editorial grooming result.`
  ].join(' ');

  try {
    const create = await fetch(`https://api.replicate.com/v1/models/${REPLICATE_MODEL}/predictions`, {
      method:'POST',
      headers:{ Authorization:`Bearer ${replicateToken}`,'Content-Type':'application/json','Prefer':'wait=60' },
      body:JSON.stringify({ input:{ prompt,input_image:image,output_format:'jpg',safety_tolerance:2 } }),
    });
    const pred = await create.json();
    if (!create.ok) { console.error('replicate create',pred); return json({error:'render_failed'},502); }
    let output = pred.output;
    if (!output && pred.urls?.get) {
      for (let i=0;i<28;i++) {
        await new Promise(r=>setTimeout(r,1200));
        const poll = await fetch(pred.urls.get,{headers:{Authorization:`Bearer ${replicateToken}`}});
        const pd = await poll.json();
        if (pd.status === 'succeeded') { output=pd.output; break; }
        if (pd.status === 'failed' || pd.status === 'canceled') return json({error:'render_failed'},502);
      }
    }
    const imageUrl = Array.isArray(output) ? output[0] : output;
    if (!imageUrl) return json({error:'render_timeout'},504);
    return json({ imageUrl, remaining, premium, hairId:exactHairId });
  } catch (e) {
    console.error('render exception',e);
    return json({error:'render_failed'},502);
  }
});
