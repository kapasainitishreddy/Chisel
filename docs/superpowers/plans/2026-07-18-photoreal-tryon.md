# Photoreal Hair/Beard Try-On Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an opt-in, one-tap photoreal render of the user's selected hair/beard style + color to the existing on-device Style try-on screen, backed by a Supabase edge function that calls Replicate.

**Architecture:** Client captures a snapshot from the existing live try-on camera (reusing the existing `coverRect()`/canvas-compositing pattern from `snapStyle()`), POSTs it plus a validated style/color/gender selection to a Supabase Edge Function (`render-lookmax`) in the existing `looksmaxxing` project. The function re-validates the selection server-side (never trusts client free text), builds a prompt, calls `black-forest-labs/flux-kontext-pro` on Replicate, enforces a per-device daily cap via a new `render_counts` table, and returns the rendered image URL. The client shows a before/after in the existing camera-sheet pattern with Retry/Save.

**Tech Stack:** Supabase (Postgres + Deno Edge Functions) via the connected Supabase MCP tools, Replicate REST API, vanilla JS/HTML/CSS (matches the existing single-file app — no new client dependencies).

## Global Constraints

- Backend: Supabase project `looksmaxxing`, ref `wnzbmmhtdchdqjnskwlo`, URL `https://wnzbmmhtdchdqjnskwlo.supabase.co`.
- Client-safe publishable key: `sb_publishable_kr_GPQ_vODmXjIxQoV8v6A_FqH8RCts` (safe to embed in the app; Supabase publishable keys are designed for client-side use).
- Model: `black-forest-labs/flux-kontext-pro` on Replicate.
- Rate limit: 5 photoreal renders per device per day (no monetization gate yet — per spec).
- No new bottom-tab or route; feature lives entirely inside the existing Groom → Style try-on flow.
- Icons: reuse the existing monochrome glyph set (◉ ◢ ◣ ◤ ▤ ✦ ▥ ✕ ⟲) — no emoji, no new icon vocabulary. Use `✦` for this feature (already used for "Facial Hair" in the Groom grid).
- Copy stays plain/direct (matches existing app voice) — no "AI-powered ✨" marketing language.
- Never pipe the raw `REPLICATE_API_TOKEN` value through an agent-run command — it must be set by the human directly (Task 2, Step 4).
- Source of truth for the client app is `chisel-android/www/index.html` (single file, no bundler). After any change to it, `npx cap copy android` must be re-run before a rebuild (per existing `chisel-build-deploy` workflow) — this is Task 5.

---

### Task 1: Database — rate-limit table

**Files:**
- Create: `supabase/migrations/0001_render_counts.sql`

**Interfaces:**
- Produces: table `public.render_counts(device_id text, day date, count integer, primary key(device_id, day))`, used by Task 2's edge function via the service-role client.

- [ ] **Step 1: Write the migration file**

```sql
-- supabase/migrations/0001_render_counts.sql
create table if not exists public.render_counts (
  device_id text not null,
  day date not null,
  count integer not null default 0,
  primary key (device_id, day)
);

alter table public.render_counts enable row level security;
-- No policies defined: only the service-role key (used server-side by the
-- render-lookmax edge function) can read/write this table. No client-side
-- access is intended or possible with the publishable key.
```

- [ ] **Step 2: Apply the migration to the `looksmaxxing` Supabase project**

Use the Supabase MCP tool `apply_migration` with:
- `project_id`: `wnzbmmhtdchdqjnskwlo`
- `name`: `render_counts`
- `query`: the SQL from Step 1

- [ ] **Step 3: Verify the table exists**

Use the Supabase MCP tool `list_tables` with `project_id: wnzbmmhtdchdqjnskwlo`, `schemas: ["public"]`.
Expected: `public.render_counts` appears in the result alongside the pre-existing (unrelated) tables — do not modify those.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0001_render_counts.sql
git commit -m "Add render_counts rate-limit table for photoreal try-on"
```

---

### Task 2: Edge function — render-lookmax

**Files:**
- Create: `supabase/functions/render-lookmax/index.ts`

**Interfaces:**
- Consumes: `public.render_counts` table from Task 1.
- Produces: an HTTP endpoint at `https://wnzbmmhtdchdqjnskwlo.supabase.co/functions/v1/render-lookmax` accepting `POST { image: string (data URL), deviceId: string, hairId: string, beardId?: string, colorName: string, gender: 'men'|'women' }`, called by the client in Task 3/4. Returns `200 { imageUrl: string, remaining: number }`, `400 { error: string }` (bad input), `429 { error: 'rate_limited', remaining: 0 }`, `502/504 { error: string }` (upstream failure). The `hairId`/`beardId`/`colorName` values must exactly match the `id`/`name` fields already used client-side in `HAIR_MEN`/`HAIR_WOMEN`/`BEARD_STYLES`/`HAIR_COLORS` (see `chisel-android/www/index.html:853-903` for the authoritative preset lists) — Task 4 passes these verbatim.

- [ ] **Step 1: Write the edge function**

```typescript
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
  const { data: existing } = await supabase
    .from("render_counts")
    .select("count")
    .eq("device_id", deviceId)
    .eq("day", today)
    .maybeSingle();

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

  let prediction = await predictionRes.json();

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
    prediction = await pollRes.json();
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
```

- [ ] **Step 2: Deploy the function**

Use the Supabase MCP tool `deploy_edge_function` with:
- `project_id`: `wnzbmmhtdchdqjnskwlo`
- `name`: `render-lookmax`
- the file content from Step 1 as the function's `index.ts` entrypoint

- [ ] **Step 3: Verify deployment**

Use the Supabase MCP tool `list_edge_functions` with `project_id: wnzbmmhtdchdqjnskwlo`.
Expected: `render-lookmax` listed with status `ACTIVE`.

- [ ] **Step 4: Human step — set the Replicate secret (do not automate this)**

This step must be performed by the user directly, not run by an agent, so the raw API token never passes through an agent-executed command. Tell the user:

> 1. Get a Replicate API token from https://replicate.com/account/api-tokens
> 2. In the Supabase Dashboard for project `looksmaxxing` (`wnzbmmhtdchdqjnskwlo`) → Edge Functions → `render-lookmax` → Secrets, add `REPLICATE_API_TOKEN` with that value. (Or, if you prefer the CLI: run `npx supabase login` then `npx supabase secrets set REPLICATE_API_TOKEN=<your token> --project-ref wnzbmmhtdchdqjnskwlo` yourself, in your own terminal.)
> 3. Confirm back here once it's set, so testing (Step 5) can proceed.

- [ ] **Step 5: Test — invalid-input path (no Replicate cost)**

Run:
```bash
curl -s -X POST https://wnzbmmhtdchdqjnskwlo.supabase.co/functions/v1/render-lookmax \
  -H "apikey: sb_publishable_kr_GPQ_vODmXjIxQoV8v6A_FqH8RCts" \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"test","hairId":"not-a-real-id","colorName":"Black","gender":"men","image":"data:image/jpeg;base64,x"}'
```
Expected: `400` with `{"error":"Unknown style or color id"}` — confirms validation runs before any Replicate call is made.

- [ ] **Step 6: Test — real render (one live call, costs one Replicate credit)**

Prepare a real face photo as base64 (e.g. `base64 -w0 test-face.jpg` on Linux/macOS, or `[Convert]::ToBase64String([IO.File]::ReadAllBytes('test-face.jpg'))` in PowerShell), then:
```bash
curl -s -X POST https://wnzbmmhtdchdqjnskwlo.supabase.co/functions/v1/render-lookmax \
  -H "apikey: sb_publishable_kr_GPQ_vODmXjIxQoV8v6A_FqH8RCts" \
  -H "Content-Type: application/json" \
  -d "{\"deviceId\":\"test\",\"hairId\":\"pomp\",\"colorName\":\"Black\",\"gender\":\"men\",\"image\":\"data:image/jpeg;base64,$(cat test-face.b64)\"}"
```
Expected: `200` with `{"imageUrl": "https://replicate.delivery/...", "remaining": 4}`. Open the URL and confirm it's a photoreal image of the same person with a pompadour and black hair.

- [ ] **Step 7: Commit**

```bash
git add supabase/functions/render-lookmax/index.ts
git commit -m "Add render-lookmax edge function (Replicate flux-kontext-pro proxy)"
```

---

### Task 3: Client — device id + endpoint constants

**Files:**
- Modify: `chisel-android/www/index.html:580` (immediately after the existing `store` constant)

**Interfaces:**
- Consumes: `store.get`/`store.set` (existing, `chisel-android/www/index.html:580`).
- Produces: `RENDER_FN_URL: string`, `RENDER_ANON_KEY: string`, `deviceId(): string` — used by Task 4's `renderPhotoreal()`.

- [ ] **Step 1: Add the constants and helper**

Insert immediately after line 580 (`const store = { ... };`):

```javascript
const RENDER_FN_URL = 'https://wnzbmmhtdchdqjnskwlo.supabase.co/functions/v1/render-lookmax';
const RENDER_ANON_KEY = 'sb_publishable_kr_GPQ_vODmXjIxQoV8v6A_FqH8RCts';
function deviceId(){
  let id = store.get('deviceId', null);
  if(!id){ id = 'c-'+Math.random().toString(36).slice(2)+Date.now().toString(36); store.set('deviceId', id); }
  return id;
}
```

- [ ] **Step 2: Verify it loads without error**

Open `chisel-android/www/index.html` directly in a desktop browser (`npx serve chisel-android/www` then visit the URL), open devtools console, run `deviceId()` twice.
Expected: no console errors; both calls return the same string (persisted via localStorage).

- [ ] **Step 3: Commit**

```bash
git add chisel-android/www/index.html
git commit -m "Add device id helper and render-fn constants for photoreal try-on"
```

---

### Task 4: Client — photoreal button, CSS, and result view

**Files:**
- Modify: `chisel-android/www/index.html:157` (CSS — insert after the existing `#styleBar` rules, before the `/* Dev validation readout */` comment)
- Modify: `chisel-android/www/index.html:513-521` (HTML — `#styleBar` markup, add button to `#styleTop`)
- Modify: `chisel-android/www/index.html:1149` (JS — after `snapStyle()`, add the new render/result functions)
- Modify: `chisel-android/www/index.html:1161-1169` (JS — `openStyle()`, reset render state on open)

**Interfaces:**
- Consumes: `coverRect()`, `cam`, `cv`, `facing`, `toast()`, `$()`, `styleHair`, `styleBeard`, `styleGender`, `_styleHairColLock`, `curHairList()` (all existing, `chisel-android/www/index.html`), `RENDER_FN_URL`/`RENDER_ANON_KEY`/`deviceId()` (Task 3).
- Produces: `capturePhotorealSource(): string` (data URL), `renderPhotoreal(): Promise<void>`, `showPhotorealResult(beforeUrl, afterUrl)`, `closePhotorealResult()` — internal to this feature, no other task depends on them.

- [ ] **Step 1: Add CSS for the button and result sheet**

Insert after line 157 (`#styleBar .seg .sc.on{...}`), before the `/* Dev validation readout */` comment:

```css
  #styleBar .photoreal-btn{flex:0 0 auto;padding:8px 16px;min-height:36px;border:0;border-radius:999px;background:linear-gradient(90deg,var(--gold),var(--gold-bright));color:var(--onyx);font-size:11px;font-weight:600;letter-spacing:.08em;white-space:nowrap;cursor:pointer}
  #styleBar .photoreal-btn:disabled{opacity:.5;cursor:default}
  #styleBar .photoreal-note{font-size:10px;color:var(--ivory-dim);padding:0 2px}

  #photorealSheet{display:none;flex-direction:column;gap:14px;align-items:center}
  #photorealSheet .compare{display:flex;gap:10px;width:100%}
  #photorealSheet .compare > div{flex:1;display:flex;flex-direction:column;gap:6px;align-items:center}
  #photorealSheet .compare img{width:100%;border-radius:12px;border:1px solid var(--line)}
  #photorealSheet .compare .lab{font-size:9px;letter-spacing:.3em;text-transform:uppercase;color:var(--ivory-dim)}
  #photorealSheet .btn-row{display:flex;gap:10px;width:100%}
  #photorealSheet .btn-row .btn{flex:1}
```

- [ ] **Step 2: Add the button to the style bar and the result sheet to the DOM**

Modify the existing `#styleBar` block (`chisel-android/www/index.html:513-521`) — the current markup is:

```html
  <div id="styleBar">
    <div class="scroller" id="styleTop"></div>
    <div class="lab" id="hairLab">Hairstyle</div>
    <div class="scroller" id="hairChips"></div>
    <div class="lab" id="beardLab">Beard &amp; moustache</div>
    <div class="scroller" id="beardChips"></div>
    <div class="lab">Hair colour</div>
    <div class="scroller" id="colorChips"></div>
  </div>
```

Replace with (adds a `photorealRow` under the top scroller, and the result sheet as a sibling of `#styleBar`, inside the same parent):

```html
  <div id="styleBar">
    <div class="scroller" id="styleTop"></div>
    <div class="photorealRow" style="display:flex;align-items:center;gap:10px">
      <button class="photoreal-btn" id="photorealBtn">✦ Make it photoreal</button>
      <span class="photoreal-note" id="photorealNote"></span>
    </div>
    <div class="lab" id="hairLab">Hairstyle</div>
    <div class="scroller" id="hairChips"></div>
    <div class="lab" id="beardLab">Beard &amp; moustache</div>
    <div class="scroller" id="beardChips"></div>
    <div class="lab">Hair colour</div>
    <div class="scroller" id="colorChips"></div>
  </div>
  <div class="sheet" id="photorealSheet">
    <div class="compare">
      <div><span class="lab">Before</span><img id="prBefore" /></div>
      <div><span class="lab">Photoreal</span><img id="prAfter" /></div>
    </div>
    <div class="btn-row">
      <button class="btn ghost" id="prRetry">Retry</button>
      <button class="btn solid" id="prSave">Save</button>
    </div>
    <button class="btn ghost" id="prClose" style="min-height:36px;padding:8px 14px">Close</button>
  </div>
```

- [ ] **Step 3: Add the render/result JS functions**

Insert immediately after `snapStyle()` (after the closing `}` at `chisel-android/www/index.html:1160`, before `function openStyle(){`):

```javascript
let _prLastResult=null, _prBeforeUrl=null;
function capturePhotorealSource(){
  const R=coverRect(), out=document.createElement('canvas'); out.width=R.cw; out.height=R.ch;
  const o=out.getContext('2d');
  o.save(); if(facing==='user'){ o.translate(R.cw,0); o.scale(-1,1); }
  o.drawImage(cam,R.ox,R.oy,R.vw*R.s,R.vh*R.s); o.restore();
  return out.toDataURL('image/jpeg',0.9);
}
async function renderPhotoreal(){
  const btn=$('#photorealBtn');
  if(!navigator.onLine){ toast('Needs internet'); return; }
  const hl=curHairList(), hairId=hl[styleHair]&&hl[styleHair].id;
  if(!hairId){ toast('Pick a style first'); return; }
  const beardId = styleGender==='men' ? (BEARD_STYLES[styleBeard]&&BEARD_STYLES[styleBeard].id) : undefined;
  const colorName = _styleHairColLock ? (HAIR_COLORS.find(c=>c.rgb&&hex(c.rgb)===hex(_styleHairColLock))||{}).name : 'match';
  const image = capturePhotorealSource();
  _prBeforeUrl = image;
  btn.disabled = true; const origText = btn.textContent; btn.textContent = 'Rendering… (~10s)';
  try{
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
    _prLastResult = data.imageUrl;
    $('#photorealNote').textContent = data.remaining+' left today';
    showPhotorealResult(_prBeforeUrl, _prLastResult);
  }catch(e){
    console.warn('renderPhotoreal', e); toast('Couldn\'t render that one — try again');
  }finally{
    btn.disabled = false; btn.textContent = origText;
  }
}
function showPhotorealResult(beforeUrl, afterUrl){
  $('#prBefore').src = beforeUrl; $('#prAfter').src = afterUrl;
  $('#photorealSheet').style.display = 'flex';
}
function closePhotorealResult(){ $('#photorealSheet').style.display = 'none'; }
$('#photorealBtn') && $('#photorealBtn').addEventListener('click', renderPhotoreal);
$('#prRetry') && $('#prRetry').addEventListener('click', renderPhotoreal);
$('#prClose') && $('#prClose').addEventListener('click', closePhotorealResult);
$('#prSave') && $('#prSave').addEventListener('click', ()=>{
  if(!_prLastResult) return;
  const a=document.createElement('a'); a.href=_prLastResult; a.download='chisel-photoreal-'+Date.now()+'.jpg';
  document.body.appendChild(a); a.click(); a.remove(); toast('Saved');
});
```

- [ ] **Step 4: Reset render state when the try-on screen opens**

Modify `openStyle()` (`chisel-android/www/index.html:1161-1169`) — current code:

```javascript
function openStyle(){
  scanMode=false; trainMode=false; styleMode=true;
  styleGender='men'; styleView='match'; _faceShape=null; _shapeBuf=[]; _shapeT=0;
  styleHair=2; styleBeard=1; _styleHairCol=null; _styleHairColLock=null;
  renderStyleTop(); renderStyleChips();   // re-ranks once the face is read (drawStyle→applyMatches)
  $('#styleBar').style.display='flex';
  const h=$('.tap-hint'); if(h) h.style.display='none';   // styleBar owns the bottom
  openCam();
}
```

Add one line before `openCam();`:

```javascript
function openStyle(){
  scanMode=false; trainMode=false; styleMode=true;
  styleGender='men'; styleView='match'; _faceShape=null; _shapeBuf=[]; _shapeT=0;
  styleHair=2; styleBeard=1; _styleHairCol=null; _styleHairColLock=null;
  renderStyleTop(); renderStyleChips();   // re-ranks once the face is read (drawStyle→applyMatches)
  $('#styleBar').style.display='flex';
  const h=$('.tap-hint'); if(h) h.style.display='none';   // styleBar owns the bottom
  closePhotorealResult();
  openCam();
}
```

- [ ] **Step 5: Manual verification in desktop browser**

Run `npx serve chisel-android/www`, open in a desktop browser with webcam access, navigate Groom → Open Try-on, pick a style, click "✦ Make it photoreal".
Expected: button shows "Rendering… (~10s)", then the result sheet appears with before/after images, Retry re-runs, Save downloads a file, Close hides the sheet and returns to the live overlay.

- [ ] **Step 6: Commit**

```bash
git add chisel-android/www/index.html
git commit -m "Add photoreal try-on button and result view to Style screen"
```

---

### Task 5: Build and verify on device

**Files:** none (build/deploy only — see `chisel-build-deploy` memory for the full command reference)

- [ ] **Step 1: Sync web assets into the Android project**

```bash
cd "chisel-android" && npx cap copy android
```
Expected: "Copying web assets... Copy finished" with no errors.

- [ ] **Step 2: Build the debug APK**

```bash
cd android && .\gradlew.bat assembleDebug --no-daemon -q
```
Expected: build succeeds, no output on success (quiet mode).

- [ ] **Step 3: Install to the connected S23**

```bash
adb install -r app\build\outputs\apk\debug\app-debug.apk
```
Expected: `Success`.

- [ ] **Step 4: Launch and manually verify on the real device**

```bash
adb shell monkey -p com.chisel.lookmax -c android.intent.category.LAUNCHER 1
```
On the phone: Groom → Open Try-on → pick a style → "✦ Make it photoreal" → confirm the photoreal result renders correctly with your actual face and the Retry/Save/Close buttons all work as expected.

- [ ] **Step 5: Commit any fixes found during device testing, then final commit**

```bash
git add -A
git commit -m "Photoreal try-on: on-device verification fixes"
```
(Skip this commit if no fixes were needed.)
