# Photoreal hair/beard try-on (Phase 1 of "biggest selling point" roadmap)

## Context

Chisel is a single-file, fully offline Capacitor Android app (`chisel-android/www/index.html`). It already has an on-device, live-camera hairstyle/beard/moustache try-on (stylized overlay anchored to a MediaPipe face mesh — see `styleMode` / `drawStyle()` / `HAIR_MEN` / `BEARD_STYLES` in the source). That overlay is fast and free but not photoreal.

This phase adds an **additive, opt-in cloud render**: from the same Style screen, the user can turn their current overlay preview into a photoreal image. It does not change or replace the existing offline overlay.

This is Phase 1 of a 5-phase roadmap (backend infra + hair/beard photoreal → more hair/beard presets → eyewear try-on → skin retouch preview → virtual makeup), chosen so the cloud pipeline built here is reused by phases 3–5.

## Goals / non-goals

**Goals**
- One-tap photoreal render of the currently selected hair/beard style + color, from a snapshot of the live try-on.
- Never block or degrade the existing free/offline overlay experience.
- Keep the Replicate API token off-device (server-side secret only).
- Cheap and simple: reuse a purpose-built model rather than building a custom masking/inpainting pipeline.

**Non-goals (this phase)**
- No user accounts/login (rate-limited by on-device install id instead).
- No monetization/paywall (explicitly deferred — user chose not to prioritize this now).
- No eyewear / skin retouch / makeup (later phases reuse this pipeline).
- No editing of the resulting photoreal image (crop/retouch) beyond retry/save.

## Architecture

```
Chisel app (offline-first)          InsForge project (new)                Replicate API
─────────────────────────           ─────────────────────────             ──────────────
Style try-on screen                 Edge function: POST /render-lookmax   flux-kontext-apps/
  live overlay (existing,  ──POST──▶  - holds REPLICATE_API_TOKEN secret    change-haircut
  unchanged, free/offline)            - maps our preset id/color → the
  "Make it photoreal" btn             model's hairstyle/color/gender
  (new)                    ◀─result──  fields, calls Replicate, polls,
                                        returns the rendered image
                                      - per-device daily counter (rate limit)
```

Model choice: **`flux-kontext-apps/change-haircut`** (Replicate) — purpose-built FLUX.1 Kontext app for hairstyle/color swap with identity preservation. No server-side face-mask generation needed; the model consumes the photo plus a style/color description directly. Fallback if quality is unsatisfactory in testing: `black-forest-labs/flux-kontext-pro` with a hand-authored prompt (same call shape, drop-in swap).

## Data flow

1. User picks a hair/beard style + color in the existing Style screen (unchanged).
2. Taps new **"✨ Make it photoreal"** button on `#styleBar` → app captures the current camera frame via the existing `snapStyle()` capture path (video + cover-mapped canvas → JPEG), base64-encodes it.
3. App POSTs `{ image, deviceId, styleId, colorName, gender }` to the InsForge edge function. `styleId`/`colorName`/`gender` are validated server-side against the known preset lists (`HAIR_MEN`/`HAIR_WOMEN`/`HAIR_COLORS` ids) — never free text, so a malicious client can't inject arbitrary prompts/spend.
4. Edge function checks the per-device daily counter; if under the cap, maps the validated preset to the model's input fields, calls Replicate, polls until complete (~5–15s typical for Kontext), returns `{ imageUrl }` (or a data URL) on success.
5. App shows a before/after card in the existing `#camSheet` pattern: original snapshot vs. photoreal result, with **Retry** (re-roll, since generative quality varies) and **Save** (downloads the photoreal image, same download pattern as the existing `snapStyle()` save).

## UI/UX

- New pill button in `#styleBar`, visually consistent with existing `.sc` chip styling but gold-solid to signal it's the premium/cloud action: "✨ Make it photoreal".
- Disabled (with tooltip "Needs internet") when `navigator.onLine` is false — never a dead click.
- On tap: button becomes a spinner with "Rendering your look… (~10s)" and a Cancel that aborts the fetch.
- Result view: reuses `#camSheet` slide-up sheet — large before/after (swipeable or side-by-side depending on screen width), Retry and Save buttons styled to match existing result-sheet buttons (see `renderResults()` for the existing pattern to follow).
- Errors (timeout, network, rate-limit hit, model content-policy reject) → toast (reuses existing `toast()` helper) with a specific, human message ("Couldn't render that one — try again" / "You've hit today's render limit, back tomorrow") and the sheet simply closes, returning to the live overlay — never a blank/broken state.
- Rate-limit remaining count shown subtly near the button ("3 photoreal renders left today") so the user isn't surprised by the cap.

## Cost controls

- Daily cap per device (default **5/day** — flag to revisit once real usage data exists; no monetization yet so this is the only spend guardrail).
- Server-side validation of style/color/gender against known enums — closes the obvious abuse vector (arbitrary prompt injection to run up API cost or generate disallowed content).
- No image retention beyond serving the response — the edge function does not persist uploaded photos or results server-side.

## Error handling

| Failure | Client behavior |
|---|---|
| Offline | Button disabled pre-emptively |
| Network drop mid-request | Toast + return to live overlay |
| Replicate timeout (>30s) | Toast "took too long, try again" + return to live overlay |
| Rate limit hit | Toast with remaining-quota message, button disabled until next day |
| Model returns NSFW/policy rejection | Toast "couldn't process that photo" + return to live overlay |

## Testing

No automated test harness exists in this codebase (single HTML file, no bundler/CI). Verification is manual, in two stages:
1. **Backend in isolation** — hit the deployed edge function directly (curl/Node script) with a sample base64 photo before touching the UI, to confirm the Replicate call, mapping, and rate-limit logic work.
2. **End-to-end on device** — `npx cap copy android` → rebuild debug APK → install to the S23 → drive the actual button in the real app (per existing [chisel-build-deploy] workflow), since the camera capture and cover-mapping math can only be validated against a real face.

## Open items resolved during brainstorming

- Backend host: InsForge (already available this session, no new account needed).
- Image model: `flux-kontext-apps/change-haircut` on Replicate.
- Integration style: additive button, not a replacement for the free overlay.
- Rate limit: 5/day per device, no monetization gate (deferred).
