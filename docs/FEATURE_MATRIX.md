# Feature Matrix

Status legend: **Verified complete** · **Implemented but unverified** (code present + Node syntax/sandbox verified, not exercised on a device here) · **Partial** · **UI only** · **Mocked** · **Broken** · **Missing** · **Externally blocked** · **Not required**.

> All web features live in `chisel-android/www/index.html` unless noted. "Unverified" = camera/MediaPipe/rendering/build were not run in this environment (no device, no JDK, `file://` preview unavailable). Nothing below is known-broken.

| Feature ID | Feature | Required | Status | UI | Logic | Persistence | Tested | Relevant Files | Remaining Work |
|---|---|---|---|---|---|---|---|---|---|
| FM-01 | Screen router + 6 tabs | Yes | Implemented but unverified | Yes | Yes | n/a | Sandbox + seen rendering | `index.html` `go()` | Device pass |
| FM-02 | On-device facial scan (mesh, burst, Quick/Deep) | Yes | Implemented but unverified | Yes | Yes | localStorage `scans` | Sandbox only | `measureFrame`, `finalizeScan`, `meshLoop` | On-device accuracy validation |
| FM-03 | Cheekbones module (malar 3D, mid-face) | Yes | Implemented but unverified | Yes | Yes | in scan record | Sandbox | `measureFrame`, areas | Device validation of z-depth |
| FM-04 | Angles & profile (nasofrontal/labial/mento/chin) | Yes | Implemented but unverified | Yes | Yes | in scan record | Sandbox | `ang3`, areas | Device validation |
| FM-05 | Skin scan (ITA°, undertone, evenness, redness, blemish, under-eye) | Yes | Implemented but unverified | Yes | Yes | in scan record | Sandbox | `rgb2lab`, `blemishRead`, skin area | Device validation |
| FM-06 | Teeth / lips / eyes / symmetry / bloat | Yes | Implemented but unverified | Yes | Yes | scan record | Sandbox | `finalizeScan` areas | Device validation |
| FM-07 | Controllable-potential figure | Yes | Implemented but unverified | Yes | Yes | `lastPotential` | Sandbox | `finalizeScan`, `renderResults` | — |
| FM-08 | Jawline training (guided reps) | Yes | Implemented but unverified | Yes | Yes | n/a | Sandbox | `JAW_TRAIN`, `trainStep` | Device |
| FM-09 | Affirmations (gendered banks) + mirror | Yes | Implemented but unverified | Yes | Yes | `homeCat` | Sandbox + seen | `AFFIRM*`, `buildPool` | — |
| FM-10 | Meditation (orb, TTS, hum) | Yes | Implemented but unverified | Yes | Yes | n/a | Sandbox | `SCRIPTS`, `startMed` | Device (audio/TTS) |
| FM-11 | Grooming cards + shoppable links | Yes | Implemented but unverified | Yes | Yes | `plan` | Sandbox | `GROOM`, `SHOP`, `openGroom` | Affiliate tag (optional) |
| FM-12 | Today's plan check-off + adherence % | Yes | Implemented but unverified | Yes | Yes | `routineDone` | Sandbox | `renderPlan`, `adherence7` | — |
| FM-13 | Try-on: hair/beard | Yes | Implemented but unverified | Yes | Yes | n/a | Sandbox | `drawHair`, `drawBeard` | Device |
| FM-14 | Try-on: eyewear | Yes | Implemented but unverified | Yes | Yes | n/a | Sandbox | `GLASS_STYLES`, `drawGlasses` | Device |
| FM-15 | Try-on: makeup + custom routine | Yes | Implemented but unverified | Yes | Yes | `makeupCustom` | Sandbox | `MAKEUP_LOOKS`, `drawMakeup` | Device |
| FM-16 | Makeup suggestor (undertone+shape, cited) | Yes | Implemented but unverified | Yes | Yes | reads `scans` | Sandbox | `openSuggest`, `MK_*` | Device |
| FM-17 | Makeup coach (non-numeric) | Yes | Implemented but unverified | Yes | Yes | n/a | Sandbox | `coachStep`, `finalizeCoach` | Device |
| FM-18 | Makeup look gallery | Yes | Implemented but unverified | Yes | Yes | `makeupPhotos` | Sandbox | `saveMakeupPhoto` | Device |
| FM-19 | Posture (MediaPipe Pose CVA) | Yes | Implemented but unverified | Yes | Yes | `posture` | Sandbox | `startPosture`, `postureStep` | Device |
| FM-20 | Photo tracker + before/after slider | Yes | Implemented but unverified | Yes | Yes | `photos` | Sandbox | `savePhoto`, `wireBASlider` | Device |
| FM-21 | Best-photo picker (IMAGE landmarker) | Yes | Implemented but unverified | Yes | Yes | n/a | Sandbox | `loadImageKit`, `scorePhoto` | Device |
| FM-22 | Identity system (M/F/NB/custom) | Yes | Implemented but unverified | Yes | Yes | `identity` | Sandbox | `identity*`, `applyIdentity` | — |
| FM-23 | Gamification (streak, freeze, badges) | Yes | Implemented but unverified | Yes | Yes | `streak`, `deepCount` | Sandbox | `bumpStreak`, `BADGES` | — |
| FM-24 | Share progress card | Yes | Implemented but unverified | Yes | Yes | n/a | Sandbox | `buildShareCard`, `shareProgress` | Device (Web Share) |
| FM-25 | 30-day programs | Yes | Implemented but unverified | Yes | Yes | `program` | Sandbox | `PROGRAMS`, `openProgram` | — |
| FM-26 | Water/sodium logging → bloat | Yes | Implemented but unverified | Yes | Yes | `hydration` | Sandbox | `saveHydration`, bloat rem | — |
| FM-27 | Barber/derm export sheet | Yes | Implemented but unverified | Yes | Yes | reads `scans` | Sandbox | `openExport`, `exportShare` | Device (share) |
| FM-28 | Reminders (local notifications) | Yes | Externally blocked | Yes | Yes | `reminders` | Sandbox | `initReminders`, `scheduleReminders` | `npm install`+`cap sync`; POST_NOTIFICATIONS UX |
| FM-29 | Paywall UI (offerings/purchase/restore) | Yes | Externally blocked | Yes | Yes | via SDK | Sandbox | `initRevenueCat`, `openPaywall` | `RC_API_KEY`, Play/RC setup, plugin sync |
| FM-30 | Paywall backend entitlement enforcement | Yes | Partial | n/a | Yes (source) | `entitlements` table | Not run (no Deno) | `supabase/functions/render-lookmax/index.ts` | Deploy (source updated, undeployed) |
| FM-31 | Photoreal render (hair/beard) | Yes | Implemented but unverified | Yes | Yes | `render_counts` | Sandbox (client) | `renderPhotoreal`, `render-lookmax` | Device + live render |
| FM-32 | "Future you" preview | No | Partial (client filter) | Yes | Yes | reads `photos` | Sandbox | `openFuture` | Real photoreal render = P3 |
| FM-33 | Camera prominent disclosure | Yes (Play) | Implemented but unverified | Yes | Yes | `cameraConsent` | Sandbox | `ensureCameraConsent`, `#camConsent` | Device |
| FM-34 | In-app data deletion | Yes (Play) | Implemented but unverified | Yes | Yes | clears localStorage | Sandbox | `wipeAllData`, `#wipeData` | Device |
| FM-35 | Public web funnel (`tools.html`) | No | Implemented but unverified | Yes | Yes | none | Syntax | `www/tools.html` | Hosting |
| FM-36 | Privacy policy page | Yes (Play) | Verified complete | Yes | n/a | n/a | Renders | `docs/privacy-policy.html` | Host + link in Console |
| FM-37 | Store graphics (feature + screenshots) | Yes (Play) | Partial (representations) | Yes | n/a | n/a | Rendered | (artifact, not in repo) | Real device captures |
| FM-38 | Automated tests / CI | Yes | Missing | n/a | n/a | n/a | None | — | Add smoke test + Actions |
| FM-39 | Android release signing config | Yes | Implemented but unverified | n/a | Yes | n/a | Config only | `app/build.gradle`, `.gitignore` | Build with real keystore |
| FM-40 | iOS platform | No | Missing | — | — | — | — | — | Deferred (needs Mac) |
