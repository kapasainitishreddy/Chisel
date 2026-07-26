# AI Development Handoff

## Last Updated
- **Timestamp:** 2026-07-26 23:43 UTC
- **Updated by:** Claude Code
- **Current branch:** `main`
- **Latest relevant commit:** `2a3780e` (Wire paywall UI) — a checkpoint commit is added at the end of this session (see Work Completed).
- **Working tree status:** clean except untracked `.claude/` (local tooling, not committed).

## Application Summary
- **App name:** Chisel
- **App purpose:** On-device facial self-improvement — analysis (jaw, cheekbones, 3D profile angles, symmetry, skin, teeth, hair, bloat), grooming + makeup guidance, virtual try-on, progress tracking. Anti-"rating": measures what's controllable, grades every tip by evidence strength.
- **Framework:** Capacitor 6.1.2 around a single-file HTML/CSS/JS web app (no framework, no bundler). MediaPipe Tasks-Vision 0.10.20 (Face + Pose) via CDN ESM.
- **Platforms:** Android only (iOS deferred).
- **Architecture:** One self-contained `chisel-android/www/index.html` (~3300 lines) with a hash router + camera overlay; `tools.html` public web funnel; Supabase edge functions (render-lookmax, rc-webhook) + Postgres.
- **Storage:** `localStorage` (all user data on-device, `chisel:` key prefix). No server-side user profiles.
- **Authentication:** None. A random device id is used for render rate-limiting only.
- **External services:** Supabase (edge functions + `render_counts`/`entitlements` tables), Replicate (`flux-kontext-pro` for photoreal), RevenueCat + Google Play Billing (paywall), MediaPipe CDN.
- **Privacy model:** On-device by default; only the photoreal feature sends a photo to Replicate (not retained); device id for rate limits; no ads/analytics. Privacy policy at `docs/privacy-policy.html`.

## Current Overall Status
Percentages are evidence-based estimates (no automated tests exist to measure precisely).
- **Product completion:** ~85% — the entire on-device app is implemented; paywall enforcement and a few Play-compliance UX items remain.
- **Engineering completion:** ~70% — single-file app is complete and syntax/sandbox-verified, but Android assets are stale, new native plugins aren't installed/synced, edge-function entitlement branch not deployed, no tests.
- **Testing completion:** ~10% — no test framework; only Node syntax + sandbox verification of `index.html` has been run. No on-device or camera/MediaPipe validation performed in this environment.
- **Android release readiness:** ~55% — release signing config wired, SDK 35, versionName 1.0.0; but no AAB has been built/signed (needs keystore + local SDK), and `cap sync` is required (assets stale).
- **Play Store readiness:** ~45% — privacy policy, Data-safety answers, listing copy, and store graphics drafted; content rating/testing-track/submission not done; camera prominent-disclosure and in-app data deletion added this session (see below).

## What Currently Works
> Verification method for all web features: **Node `vm` syntax check of both `<script>` blocks + sandbox execution confirming every function defines at load** (see `docs/TEST_STATUS.md`). Camera/MediaPipe/rendering were **not** exercised on a device in this environment (`file://` preview access was unavailable). Treat camera-dependent math as "implemented, syntax-verified, needs on-device validation."

- **Screen router + 6 tabs (Home/Analyze/Affirm/Meditate/Groom/Connect).** Files: `index.html` (`go()`, `nav`). Verified: syntax/sandbox; Home + scoring modal were seen rendering in an earlier browser session.
- **On-device facial scan** (468-pt MediaPipe mesh; median-of-burst; frontal/exposure/blink gating; Quick + Deep modes). Files: `index.html` (`measureFrame`, `finalizeScan`, `meshLoop`, `collectFrame`, `autoCapture`). Metrics: symmetry, thirds, jaw taper/fWHR/gonial, **cheekbones (malar projection 3D, mid-face ratio)**, **angles & profile (nasofrontal/nasolabial/mentolabial/chin-projection from mesh depth)**, nose, eyes/canthal, skin (ITA°/undertone/evenness/redness/T-zone/under-eye/**blemish**), hair, teeth, lips, **bloat vs baseline**, **controllable-potential** figure, brows (female). Limitation: proxies from a 2D selfie; needs device validation.
- **Jawline training** (guided reps, live form-check). Files: `index.html` (`JAW_TRAIN`, `trainStep`).
- **Affirmations** with gendered banks (male/female/neutral) + mirror overlay. Files: `AFFIRM`, `AFFIRM_F`, `AFFIRM_N`, `buildPool`.
- **Meditation** (breathing orb, TTS, ambient hum). Files: `SCRIPTS`, `startMed`.
- **Grooming** (6 cited routine cards + shoppable retailer links) and **Today's plan** with **check-off + 7-day adherence %**. Files: `GROOM`, `SHOP`, `renderPlan`, `routineDoneToday`, `adherence7`.
- **Virtual try-on:** hair (men/women), beard, **eyewear**, **makeup** overlays on the live mesh; face-shape auto-matching; snapshot. Files: `drawStyle`, `drawHair/drawBeard/drawGlasses/drawMakeup`, `HAIR_*`, `BEARD_STYLES`, `GLASS_STYLES`, `MAKEUP_LOOKS`.
- **Makeup studio:** suggestor (undertone+shape → shades, with references), coach (non-numeric base-vs-neck/evenness), custom routine, local look gallery, self-compassion copy. Files: `openSuggest`, `openCoach`/`coachStep`, `openRoutine`, `saveMakeupPhoto`, `MK_*`.
- **Posture measurement** (MediaPipe Pose craniovertebral angle, side-on). Files: `loadPose`, `startPosture`, `postureStep`, `finalizePosture`.
- **Photo progress tracker + before/after drag slider.** Files: `savePhoto`, `renderTimeline`, `wireBASlider`.
- **Best-photo picker** (IMAGE-mode landmarker ranks uploads). Files: `loadImageKit`, `scorePhoto`.
- **Identity system** (male/female/non-binary/custom) tailoring affirmations, jaw framing, grooming, try-on default. Files: `identity*`, `applyIdentity`, id modal.
- **Gamification:** streak + freeze, milestone badges. Files: `bumpStreak`, `BADGES`, `renderBadges`.
- **Share progress card** + **30-day programs** + **water/sodium logging** (feeds bloat) + **barber/derm export sheet**. Files: `buildShareCard`, `PROGRAMS`, `saveHydration`, `exportShare`.
- **Reminders** UI (daily/weekly) via `@capacitor/local-notifications`. Files: `initReminders`, `scheduleReminders`. Limitation: **plugin not installed/synced yet** — no-ops in browser and until `npm install` + `cap sync`.
- **Paywall UI** (offerings, purchase, restore, "Go Premium", free-limit → paywall routing). Files: `initRevenueCat`, `openPaywall`, `renderOfferings`, `purchase`. Limitation: `RC_API_KEY` empty + plugin not synced + **backend entitlement check not deployed** (see P1).
- **Camera prominent disclosure** (one-time consent before first camera use). Added this session — Files: `cameraConsent`, `ensureCameraConsent`, `#camConsent`.
- **In-app data deletion** ("Clear my data" on Connect). Added this session — Files: `wipeAllData`, `#wipeData`.
- **Public web funnel** `tools.html` (canthal/symmetry/shape from an uploaded photo).
- **Backend:** `render-lookmax` (validated Replicate render, per-device daily cap), `rc-webhook` (entitlement sync), migrations for `render_counts` + `entitlements`. Deployed earlier per commit history.

## Work Completed During Latest Session
- **HANDOFF-DOCS** — Created the agent handoff system: `CLAUDE.md`, `AGENTS.md`, `docs/AI_HANDOFF.md`, `docs/FEATURE_MATRIX.md`, `docs/CHANGE_REQUESTS.md`, `docs/TEST_STATUS.md`, `docs/RELEASE_STATUS.md`. Result: created. Commit: see checkpoint below.
- **APP-P1-002** — Camera prominent disclosure. Changed: `index.html` (consent overlay `#camConsent`, `ensureCameraConsent()` gating `openCam` on first use, stores `chisel:cameraConsent`). Verified: Node syntax + sandbox (functions define). Result: pass.
- **APP-P1-003** — In-app data deletion. Changed: `index.html` (`wipeAllData()`, "Clear my data" control on Connect). Verified: Node syntax + sandbox. Result: pass.
- **APP-P2-002** — Release hardening: `capacitor.config.json` `webContentsDebuggingEnabled` → `false`. Verified: JSON parses. Result: pass.
- **APP-P1-001 (source only)** — Implemented the entitlement check + lowered free cap in `supabase/functions/render-lookmax/index.ts` (adds `rcUserId`, `entitlements` lookup, `free_limit_reached`+`showPaywall`, 2/day cap). **Not deployed** (needs Supabase credentials/MCP) — see External Blockers. Verified: manual review only (no Deno runtime here).

(Commit hashes recorded in the checkpoint commit at session end; see `git log`.)

## Current Work in Progress
_None mid-flight._ All edits this session are complete, verified (syntax/sandbox), and left in a non-broken state. If resuming, start at "Next Task".

## Next Task
- **Task ID:** APP-P0-001
- **Priority:** P0 (build correctness — an AAB built now ships a stale app).
- **Objective:** Install the new deps and sync so the Android project contains the current web app and the native plugins.
- **Relevant files:** `chisel-android/package.json`, `chisel-android/package-lock.json`, `chisel-android/android/**` (generated).
- **Acceptance criteria:** `npm install` completes; `npx cap sync android` completes and registers `@revenuecat/purchases-capacitor` + `@capacitor/local-notifications`; `chisel-android/android/app/src/main/assets/public/index.html` checksum equals `chisel-android/www/index.html`; `POST_NOTIFICATIONS` present in the merged manifest.
- **Verification commands:**
  ```
  cd chisel-android && npm install
  npx cap sync android
  # then compare:
  sha1sum www/index.html android/app/src/main/assets/public/index.html   # must match
  ```
  (Requires network + local Node; the Android build additionally needs JDK 17 + SDK 35.)

## Prioritized Remaining Tasks
### P0 — Crashes, build failures, data loss, security
- **APP-P0-001** — Android web assets are **stale** (synced copy ≠ `www/index.html`) and new plugins not synced. A release build ships an outdated app without reminders/billing native code. Fix: `npm install` + `npx cap sync android` + rebuild. _(This is "Next Task".)_

### P1 — Missing core functionality
- **APP-P1-001** — Paywall **entitlement enforcement not deployed.** Deployed `render-lookmax` still returns `rate_limited` at 5/day and ignores `rcUserId`. Source updated this session (2/day + `entitlements` check + `free_limit_reached`); **must be deployed** to Supabase project `wnzbmmhtdchdqjnskwlo`. Blocked on Supabase access.
- **APP-P1-004** — Billing inert until `RC_API_KEY` is set in `index.html` and the Play Console subscription + RevenueCat entitlement `premium` are configured. External blocker (dashboards).
- **APP-P1-002** — ✅ Done this session (camera prominent disclosure).
- **APP-P1-003** — ✅ Done this session (in-app data deletion).

### P2 — Reliability, UX, accessibility, performance
- **APP-P2-001** — No automated tests / CI. Add at least a headless smoke test (e.g. Playwright loading `www/index.html`, asserting boot + no console errors) and wire GitHub Actions.
- **APP-P2-002** — ✅ Done this session (`webContentsDebuggingEnabled: false`). Follow-up: strip/guard the ~14 `console.*` calls for production.
- **APP-P2-004** — Target **API 36** before 2026-08-31 (currently 35). Needs AGP/SDK bump; verify build.
- **APP-P2-005** — Android 13+ runtime `POST_NOTIFICATIONS` permission flow for reminders (the plugin adds the permission on sync; confirm the request UX).
- **APP-P2-006** — Accessibility pass (focus states, prefers-reduced-motion already partial, ARIA on camera controls).

### P3 — Optional polish
- **APP-P3-001** — "Future you" is a client-side canvas filter; wire a real photoreal render (reuse the Replicate pipeline with a new server-validated goal).
- **APP-P3-002** — Enable R8 (`minifyEnabled true`) after on-device testing; run MobSF on the signed AAB.
- **APP-P3-003** — iOS platform (needs a Mac/cloud-Mac).
- **APP-P3-004** — Replace representative store screenshots with real on-device captures.

## Known Bugs
- **BUG-001** — Severity: Medium (functional gap, not a crash). Repro: on a fresh device, exhaust free photoreal renders. Expected: paywall appears due to entitlement logic. Actual: server returns `rate_limited` at 5/day; client routes it to the paywall (graceful) but no entitlement is actually checked/decremented. Suspected cause: `render-lookmax` deployment predates the entitlement branch. Files: `supabase/functions/render-lookmax/index.ts` (source now updated, undeployed). Status: source fixed, **deploy pending** (APP-P1-001).
- **BUG-002** — Severity: Medium (build correctness). Repro: `gradlew bundleRelease` without running `cap sync` first. Expected: AAB contains current app. Actual: AAB contains stale `index.html`. Files: `chisel-android/android/app/src/main/assets/public/`. Status: open (APP-P0-001).
- **NOTE (not a bug):** camera/MediaPipe/build paths are unverified in this environment (no device, no JDK). Not known-broken — just unproven here.

## Commands and Results
| Command | Last run | Result |
|---|---|---|
| Dependency installation (`npm install`) | Not run this session | Deps declared in package.json; `node_modules`/`package-lock` do **not** contain revenuecat/local-notifications yet → APP-P0-001 |
| Type check | N/A | No TypeScript in web app |
| Lint | N/A | None configured |
| Unit tests | N/A | No framework |
| Integration tests | N/A | No framework |
| Web syntax + sandbox check of `index.html` | 2026-07-26 | **PASS** — both `<script>` blocks parse; all functions define at load (see TEST_STATUS.md) |
| Development build (`npm run build`) | N/A | No-op echo (static app) |
| Android debug build | Not run | Needs JDK 17 + SDK 35 (absent here) |
| Android release build / AAB | Not run | Needs keystore + JDK/SDK (developer machine) |

## External Blockers
- **Signing keystore** — developer must create `chisel-android/android/keystore.properties` + `chisel-upload.jks` (see `PLAY_STORE.md`). Agents must never generate/store these.
- **Supabase deploy access** — needed to deploy the updated `render-lookmax` (APP-P1-001) to project `wnzbmmhtdchdqjnskwlo`.
- **RevenueCat public SDK key + Play Console subscription product** — needed for billing (APP-P1-004).
- **Play Console** — content rating, closed testing (12 testers/14 days if the dev account is post-2023-11-13), submission.
- **Local Android SDK 35 + JDK 17** — to build the AAB.

## Important Decisions
- **Anti-"rating" positioning is core.** Never add a beauty/attractiveness score or PSL rank. "Controllable potential" and per-area measurements replace it. (Researched: bias/body-image/store risk.)
- **Single-file, no-bundler architecture** is intentional (offline-first, simple). Do not introduce a bundler/framework without strong reason.
- **On-device-first privacy.** Only photoreal sends data off-device. No analytics/ads. Keep it that way.
- **Evidence grading** (Strong/Moderate/Limited/Myth + citation) is mandatory for every recommendation.
- **Free-first launch is acceptable** — paywall is additive; `RC_API_KEY` empty keeps the app free and functional.
- **Capacitor plugins accessed via `window.Capacitor.Plugins.*` proxy** (no ESM import), because there is no bundler.

## Do Not Change
- The onyx/gold/ivory design system, serif display type, and monochrome glyph icon set (no emoji in UI, no gradient "AI" buttons).
- The `store`/`localStorage` persistence model and `chisel:` key names (renaming loses user data).
- Existing evidence citations / `SCIENCE.md` mappings.
- `keystore.properties`, `*.jks`, Supabase service-role/Replicate/RC-webhook secrets — never commit; keep server-side.
- Working camera `meshLoop` mode-flag structure (scan/deep/posture/coach/style) — extend, don't rewrite.
- User/other-agent commits on `main`.

## Resume Instructions for the Next Agent
1. `git status` — confirm branch `main`, note any uncommitted user changes.
2. Inspect the current diff: `git diff` and `git log --oneline -10`.
3. Read `AGENTS.md`, this file, `FEATURE_MATRIX.md`, `CHANGE_REQUESTS.md`, `TEST_STATUS.md`, `RELEASE_STATUS.md`.
4. Verify the latest recorded test result: run the Node syntax+sandbox snippet from `TEST_STATUS.md`; it must PASS before you build on top.
5. If "Current Work in Progress" lists an in-flight task, resume it. (Currently none.)
6. Otherwise start "Next Task" = **APP-P0-001** (install + `cap sync`).
7. Modify actual source files (`chisel-android/www/index.html` etc.), not just docs.
8. Run verification (syntax+sandbox for web; the real build if you have JDK/SDK).
9. Update this file (Work Completed, Next Task), `FEATURE_MATRIX.md`, `TEST_STATUS.md`, `RELEASE_STATUS.md`, and `CHANGE_REQUESTS.md` if applicable. Then commit.
