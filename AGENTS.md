# AGENTS.md — Instructions for OpenAI Codex (and any coding agent)

**Start here, then read `docs/AI_HANDOFF.md` and continue from it. Do NOT restart
the project or redo completed work.**

## Project purpose
Chisel is an Android facial self-improvement app: on-device facial analysis
(jaw, cheekbones, 3D profile angles, symmetry, skin, teeth, hair), grooming +
makeup guidance, virtual try-on, and progress tracking. Positioning is
deliberately **anti-"rating"** — it measures what you can improve and grades every
tip by evidence strength. Cosmetic/educational, not medical.

## Framework & detected versions
- **Capacitor 6.1.2** wrapping a **single-file HTML/CSS/JS web app**. No React/Vue,
  no bundler, no build step for the web layer.
- MediaPipe **Tasks-Vision 0.10.20** (Face + Pose landmarkers) loaded from CDN as ESM.
- Native plugins declared: `@capacitor/camera`, `@capacitor/splash-screen`,
  `@capacitor/status-bar`, `@capacitor/local-notifications` (6.1.0),
  `@revenuecat/purchases-capacitor` (9.1.0). **The last two are declared in
  package.json but NOT yet installed/synced — see AI_HANDOFF P0/P1.**
- Backend: Supabase Edge Functions (Deno/TypeScript) + Postgres. Replicate for
  image generation. RevenueCat + Google Play Billing for the paywall.
- Android: minSdk 23, compileSdk 35, targetSdk 35, AGP 8.6.0, Gradle 8.7.

## Important folders
- `chisel-android/www/index.html` — **the entire app** (~3300 lines). Source of truth.
- `chisel-android/www/tools.html` — standalone public web funnel (canthal/symmetry/shape).
- `chisel-android/android/` — generated Capacitor Android project (build here).
- `supabase/functions/render-lookmax/` — photoreal render edge function.
- `supabase/functions/rc-webhook/` — RevenueCat entitlement webhook.
- `supabase/migrations/` — `render_counts`, `entitlements` tables.
- `docs/` — handoff docs, SCIENCE.md, privacy-policy.html, specs/plans.

## Application entry points
- Web app: `chisel-android/www/index.html` (Capacitor `webDir: www`).
- Android: `com.chisel.lookmax/.MainActivity` (Capacitor default).

## Commands
- **Package manager:** npm.
- **Install:** `cd chisel-android && npm install`
- **Dev (serve web):** `cd chisel-android && npm run serve` (http-server on :8080)
- **Type-check:** _none_ (no TypeScript in the web app; edge functions are Deno TS, checked by Supabase on deploy).
- **Lint:** _none configured._
- **Test:** _no framework._ The agreed verification for `index.html` is a Node
  syntax + sandbox check of its two `<script>` blocks — see
  `docs/TEST_STATUS.md` for the exact snippet. Run it after every edit.
- **Sync web → Android (required after web/plugin changes):** `cd chisel-android && npx cap sync android`
- **Android debug APK:** `cd chisel-android/android && gradlew.bat assembleDebug`
- **Android release AAB:** `cd chisel-android/android && gradlew.bat bundleRelease`
  (requires `chisel-android/android/keystore.properties` — see `PLAY_STORE.md`).
  Output: `chisel-android/android/app/build/outputs/bundle/release/app-release.aab`

## Architectural conventions
- Everything user-facing is one screen router in `index.html` (`go(route)`), six
  tabs (Home/Analyze/Affirm/Meditate/Groom/Connect) + full-screen camera overlay.
- **Design system:** onyx/gold/ivory, Cormorant Garamond + Inter, monochrome
  geometric glyphs (`◇◉✦◯▣⤓◢`) — never emoji in UI, no gradient "AI" buttons.
- State/persistence: `store.get/set` wrapping `localStorage` under `chisel:` keys.
- Camera features run a single `meshLoop()` with mode flags (scan/deep/posture/coach/style).
- Every scan recommendation carries an evidence grade: Strong / Moderate / Limited / Myth, with a bracketed citation resolved in `SCIENCE.md` / the in-app references modal.

## Privacy & security constraints
- On-device by default. Only the photoreal feature sends a photo off-device (to
  Replicate via the edge function); it is not retained.
- No accounts, no ads, no analytics/tracking SDKs.
- **Never commit secrets.** Files that must never contain secrets: `chisel-android/www/index.html`, `chisel-android/www/tools.html`, anything under `supabase/functions/` (use `Deno.env`), `capacitor.config.json`. Secret material lives only in: Supabase project env (`REPLICATE_API_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`, `RC_WEBHOOK_SECRET`) and the developer's local `keystore.properties` (gitignored).
- Client may contain only the Supabase **publishable** key (`RENDER_ANON_KEY`) and the RevenueCat **public** SDK key.

## Requirements for every task
- Read all shared handoff docs before modifying files.
- Inspect Git changes (`git status`, `git diff`) before editing; preserve Claude Code and user changes.
- Implement changes in **actual source**, not just docs.
- After work: run verification, then update `docs/AI_HANDOFF.md`, `FEATURE_MATRIX.md`, `TEST_STATUS.md`, `RELEASE_STATUS.md`, and `CHANGE_REQUESTS.md` if applicable.

## Definition of done (per task)
1. Source code changed in the real app.
2. Feature is actually wired/active (not just present).
3. Verification command run and passing (record the output).
4. The relevant build path still works (or the reason it can't be run here is recorded).
5. Handoff docs updated with evidence (files changed, commands, result, commit).
