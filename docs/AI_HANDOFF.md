# AI Development Handoff

## Last Updated
- **Timestamp:** 2026-08-11
- **Updated by:** Codex
- **Current branch:** `main`
- **Latest relevant commit:** `fba0da5` (chore: checkpoint app progress for Codex handoff) — contains the handoff system + this session's app changes.
- **Working tree status:** clean except untracked `.claude/` (local tooling, not committed).

## Latest verified update — AR jaw + cheek coach
- Replaced the old jaw trainer (which included forceful jut/clench guidance) with an AR-only coach for gentle jawline posture and cheek-lift sessions.
- Added Jawline posture, Cheek lift, and Full face sessions. The on-device face mesh renders a clean jaw contour, cheek paths/targets, and center line with gold “find form” and green “form locked” states.
- Hold timers pause when the face is off-angle, uncentered, the mouth/jaw is not relaxed, or cheek movement is uneven/out of range. Completion is tracked locally under `chisel:arCoachSessions`; no score, upload, account, or new permission was added.
- Safety/evidence copy says exercises do not reshape adult facial bones or spot-reduce fat, grades cheek work Limited and posture awareness Moderate, and tells users to stop for pain/clicking/locking/dizziness/numbness/discomfort.
- Verified 2026-08-11: `npx cap sync android`, full Node suite (**57/57**), `gradlew.bat assembleDebug`, APK upgrade-install and live physical-device UI/AR checks on `R3CW10Y67TT`.
- Relevant source: `chisel-android/www/chisel-ar-coach-core.js`, `chisel-android/www/index.html`, `chisel-android/tests/ar-coach-core.test.cjs`, `chisel-android/tests/ar-coach-ui.test.cjs`.

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

**Latest mobile UX / analysis correction (2026-08-11):** Replaced the six-tab
phone bar with five primary tabs and moved the former Connect content to a Home
Settings action; removed duplicate bottom-inset ownership; made Analyze jaw-first
with Quick Scan and AR Coach above secondary options; replaced harmony/rank language
with photographic tracking language; made Jaw/Cheek/Symmetry the first result cards;
added high-contrast jaw/cheek guides; rebuilt facial-hair try-on as deterministic,
inclusive low-alpha hair strokes; and converted phone try-on controls to a fitted,
scrollable three-column tray above Samsung system navigation. Verified with 57/57
Node tests, Capacitor sync, Android debug build, install, UI-tree bounds, live camera,
live AR jaw session and privacy-cleaned screenshots on `R3CW10Y67TT`.

## Current Work in Progress
_None mid-flight._ All edits this session are complete, verified (syntax/sandbox), and left in a non-broken state. If resuming, start at "Next Task".

**Latest mobile-shell correction (2026-08-09):** The Android activity had been
injecting legacy Labs, Precision and Premium assets after the canonical app
loaded. That created a floating Labs control and overrode the intended phone UI.
The injector was removed entirely; `MainActivity` now leaves the canonical
`www/index.html` shell untouched. The six bottom tabs were changed to compact
geometric glyphs plus labels with safe-area-aware sizing. Verified with `npm test`
(40/40), `npx cap sync android`, `assembleDebug`, fresh physical install, Home →
Analyze navigation, UI-tree inspection, screenshots and logcat on `R3CW10Y67TT`.

**Latest Connect-screen correction (2026-08-09):** Removed the customer-visible
USB debugging/Android Studio/APK sideload guide left from internal development.
The tab now shows only device, camera-control and privacy content. Verified with
`npm test` (41/41), sync/build, and installed on `R3CW10Y67TT`.

**Latest micro-session (a11y/polish):** Added `:focus-visible` keyboard focus, tap-highlight removal, heading text-overflow guards, tighter mobile button spacing, and `role`/`aria-label` on the icon-only camera flip/capture controls (CR-005). Verified: `index.html` syntax PASS. This was a CSS/HTML-only pass — no logic changed; all features intact. Note: "check all features working" could only be verified by Node syntax+sandbox here, **not on a device** — on-device QA of the camera/scan flows remains an open testing gap (see TEST_STATUS.md).

## Next Task
- **Task ID:** APP-P2-007
- **Priority:** P2 (empirical accuracy and repeatability).
- **Objective:** Build and run a repeatability/calibration protocol for Quick and
  Deep scans across controlled lighting, distance, expression, facial hair and eyewear.
- **Acceptance criteria:** repeated same-condition scans report variance; weak or
  incompatible captures fail closed; claims remain "photographic estimate" until
  compared with reference measurements across representative devices and people.

## Prioritized Remaining Tasks
### P0 — Crashes, build failures, data loss, security
- **APP-P0-001** — ✅ Complete. Android web assets and all five Capacitor plugins
  are synced; native integration tests enforce canonical asset equality.

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
- **BUG-002** — Closed 2026-08-11. Canonical and packaged `index.html` match;
  the sync-integrity regression test passes after `npx cap sync android`.
- **NOTE (not a bug):** camera/MediaPipe/build paths are now verified on one
  Samsung handset. Population/device accuracy remains an empirical testing gap.

## Commands and Results
| Command | Last run | Result |
|---|---|---|
| Dependency installation | 2026-08-11 | Installed; sync found Camera, Local Notifications, Splash Screen, Status Bar and RevenueCat |
| Type check | N/A | No TypeScript in web app |
| Lint | N/A | None configured |
| Node regression/integration tests | 2026-08-11 | **PASS — 57/57** |
| Web syntax + sandbox check of `index.html` | 2026-07-26 | **PASS** — both `<script>` blocks parse; all functions define at load (see TEST_STATUS.md) |
| Development build (`npm run build`) | N/A | No-op echo (static app) |
| Android debug build | 2026-08-11 | **PASS** — `gradlew.bat assembleDebug`; APK installed on `R3CW10Y67TT` |
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
6. Otherwise start "Next Task" = **APP-P2-007** (scan repeatability/calibration protocol).
7. Modify actual source files (`chisel-android/www/index.html` etc.), not just docs.
8. Run verification (syntax+sandbox for web; the real build if you have JDK/SDK).
9. Update this file (Work Completed, Next Task), `FEATURE_MATRIX.md`, `TEST_STATUS.md`, `RELEASE_STATUS.md`, and `CHANGE_REQUESTS.md` if applicable. Then commit.
