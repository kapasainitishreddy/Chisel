# AI Development Handoff

## Last updated

- **Timestamp:** 2026-08-16
- **Active work branch:** `feat/chisel-daily-pro-polish-20260816`
- **Pull request:** #4 — `Polish Chisel daily loop and Pro conversion`
- **Base branch:** `main`
- **Latest source/build-relevant commits:**
  - `5cd298161841f35bb9e7f19d45b6b6e037949014` — canonical + Android-mirrored product-polish implementation.
  - `db4dd407839f46e0250b16dbb080186ee5e54db5` — visual-QA workflow runtime-budget correction.
- **Latest authoritative source verification:** JavaScript syntax PASS; full Node suite **114/114**; Android Capacitor sync + debug APK + release AAB build PASS in GitHub Actions.

## Product summary

**Chisel** is an Android-first, privacy-first appearance and grooming studio. It
combines repeatable on-device facial analysis, evidence-aware routines, local
style try-ons, AR guidance and within-person progress tracking.

The core product rule is deliberately anti-rating:

> **Measure. Act. Compare yourself to yourself.**

Do not turn Chisel into an attractiveness leaderboard, public beauty score, PSL
rank, or guaranteed-transformation product. Camera-derived values are photographic
estimates for within-person context, not medical, clinical or ground-truth claims.

## Current architecture

- Capacitor 6.1.2 Android app.
- Canonical static app shell: `chisel-android/www/index.html`.
- No React/Vue/bundler for the web layer.
- MediaPipe Tasks-Vision for face/pose landmark processing.
- Late-loaded feature runtimes under `chisel-android/www/`.
- Android-packaged copies under
  `chisel-android/android/app/src/main/assets/public/`.
- Core state uses `localStorage` with `chisel:` keys.
- Core analysis is on-device.
- Optional photoreal rendering is the explicit cloud boundary.
- RevenueCat + Google Play purchase/restore seams exist, but production paid
  configuration is not yet complete.
- Supabase edge functions back optional cloud-render / entitlement infrastructure.

## Design / experience rules

Preserve the existing **Quiet Precision / Onyx Laboratory** language:

- dark onyx background;
- restrained gold + ivory accents;
- Cormorant Garamond display type + Inter UI type;
- geometric monochrome glyphs rather than emoji;
- minimum 44px touch targets;
- visible keyboard focus;
- reduced-motion support;
- calm copy with evidence/uncertainty rather than hype.

Core privacy / trust rules:

- no account required for core use;
- no ads;
- no analytics/tracking SDKs in the intended product model;
- deletion/privacy controls are never Pro-only;
- only explicit optional cloud actions send a photo off-device;
- never commit server secrets, service-role keys, keystores or passwords.

## Latest completed product pass — 2026-08-16

### 1. Home now has one coherent daily loop

`chisel-product-polish.js` now makes Home a decision surface instead of another
feature dump.

It adds:

- `Today's Chisel`;
- three-stage **Measure → Act → Compare** framing;
- one recommended focus for the day;
- baseline-first behavior: recommend Scan until a usable baseline exists, then
  recommend the controllable Routine path;
- explicit `Mark focus complete` action;
- local, date-scoped completion under `chisel:cxpDaily`;
- no automatic completion or hidden task inference;
- live completion text via `aria-live="polite"`;
- the four direct tools remain: Scan now, Try-on Studio, Face Yoga, Routine.

The behavior helpers exported for testing are:

- `dayKey(now)`;
- `dailyState(storage, now)`;
- `markDaily(storage, action, now)`.

### 2. Trust is more visible before feature depth

Home now states:

- core analysis is private by default;
- there is no public beauty score;
- repeatable matched-condition comparison matters more than checking often.

Analyze still explains:

- local processing;
- multi-frame capture;
- weak-scan rejection;
- photographic-estimate / capture-quality context.

The Groom loop remains:

1. choose one area;
2. follow the routine;
3. mark it complete;
4. compare later.

### 3. Pro presentation is additive, not coercive

The paywall now sells optional cloud value rather than implying that the core app
is artificially restricted.

Current value framing:

- more photoreal rendering capacity;
- core local analysis stays available;
- no ads;
- no account required;
- restore purchases through Google Play;
- Google Play is the source of exact price / renewal terms.

Do **not** add fake scarcity, fake reviews, countdowns, “last chance” copy or
unavailable paid claims.

### 4. Store positioning was rewritten

`PLAY_STORE.md` now uses:

- recommended app name: `Chisel: Face & Grooming`;
- short description centered on analysis, routines, try-ons, progress and no
  public beauty rating;
- positioning line: `Measure. Act. Compare yourself to yourself.`;
- screenshot order: Today → Scan → Try-on → Routine → Progress → AR Coach →
  optional Pro;
- feature-graphic direction: `MEASURE · ACT · COMPARE` / `Private appearance
  improvement. No public rating.`.

The listing deliberately avoids leading with “glow-up” hype or a paywall.

## Verification evidence

### Focused product-polish verification

- `product-polish.test.cjs`: **11/11 passing** after implementation.
- Tests cover local/day-scoped completion, explicit completion, Home hierarchy,
  Pro trust language, no scarcity copy and Android asset parity.

### Full source verification

GitHub Actions on source commit
`5cd298161841f35bb9e7f19d45b6b6e037949014`:

- JavaScript `node --check` gate: PASS.
- `npm test`: **114/114 passing, 0 failures, 0 skipped**.

### Android build verification

`Chisel Mobile Build` run 119: PASS.

The workflow completed dependency install, Android SDK setup, Capacitor sync,
asset verification, full tests, debug APK build, release AAB build and artifact
upload.

### Visual QA workflow note

The original visual workflow gave the entire male/female browser jobs only four
minutes each. Male jobs passed; both female jobs hit that job-level ceiling.
The individual browser commands already had 120–150 second timeout guards, so the
workflow job budget was raised to seven minutes in
`db4dd407839f46e0250b16dbb080186ee5e54db5`. Verify the fresh run before claiming
all visual matrix jobs green.

### Existing physical-device validation

The 2026-08-11 Samsung-device QA remains the latest physical proof for the base
camera/mobile implementation:

- canonical five-tab shell fit above Android system navigation;
- Settings was kept out of the primary tab bar;
- Quick Scan / AR Coach were reachable;
- front-camera MediaPipe AR jaw/cheek guides rendered;
- try-on controls remained scrollable;
- focused crash-buffer check was empty.

The 2026-08-16 late-loaded Home/paywall changes still need one final smoke pass on
the eventual release candidate/test-track build.

## Major implemented feature groups

- Quick + Deep on-device face scanning.
- Capture-quality gates and actionable retry guidance.
- Jaw/Cheek/Symmetry-first photographic result hierarchy.
- Precision Face/Skin and Body/Posture consensus / uncertainty tooling.
- AR Jawline posture, Cheek lift, Full face and Face Yoga guidance.
- Hair, facial-hair, eyewear and makeup local try-ons.
- Makeup suggestions / non-numeric coach / saved routine.
- Photo progress / before-after comparison / best-photo quality picker.
- Grooming routines, Today plan, adherence, programs, reminders UI.
- Identity personalization.
- Affirmations / visualization / streaks / milestones.
- Local data deletion and privacy disclosure.
- Optional photoreal cloud rendering seam.
- RevenueCat purchase/restore UI seam.
- `Today's Chisel` daily focus and local completion.

See `FEATURE_MATRIX.md` for the detailed feature truth.

## Current external / production blockers

### Paid access

Production subscriptions are not live until all of these are complete:

1. Create Google Play subscription/base-plan products.
2. Map the products in RevenueCat to entitlement `premium`.
3. Configure the RevenueCat public Android SDK key in the client.
4. Deploy/configure the server entitlement / webhook path with server-only secrets.
5. Validate purchase, restore, grace/expiry and entitlement enforcement on a Play
   testing track.
6. Validate photoreal render quota/cost behavior.

Do not hard-code a marketing price until the real Play products exist; the app
should render Play-provided price/renewal terms.

### Release signing / console

- Real upload keystore + `keystore.properties` are developer-owned and gitignored.
- A GitHub-built release AAB proves compilation; it is not the final signed Play
  upload unless a valid secret-backed signing path is configured.
- Privacy policy URL / Data Safety / content declarations / store graphics and
  tester-track rollout still require Play Console work.

### Empirical measurement validation

`APP-P2-007` remains the main product-evidence gate: run repeated same-condition
Quick/Deep scans across representative Android devices, lighting, distances,
expressions, facial hair and eyewear, then compare against reference measurements.
Keep `photographic estimate` language until that evidence exists.

## Known implementation truth

- Canonical `www/index.html` remains the shell; do not reintroduce native
  post-load Labs/Premium/Precision UI injection.
- Android assets must remain synchronized with canonical `www` files.
- `chisel-product-polish.js` loads after `chisel-experience-polish.js`.
- `chisel:cxpDaily` is the new daily-product state key. Do not rename it without a
  migration because that would silently lose completion state.
- The app may safely launch free-first while paid infrastructure is completed.

## Next engineering task

**APP-P2-007 — Repeatability / calibration protocol.**

Goal: quantify same-condition Quick/Deep scan variance, fail closed on weak or
incompatible captures, and establish the evidence needed before any stronger
accuracy marketing.

Parallel launch work can continue on signed internal testing, store graphics and
production billing configuration without changing the core measurement claims.

## Resume checklist for the next agent

1. Read `AGENTS.md`, this file, `FEATURE_MATRIX.md`, `TEST_STATUS.md`,
   `RELEASE_STATUS.md`, `CHANGE_REQUESTS.md`, `PRODUCT_POLISH.md` and
   `PREMIUM_FEATURES.md`.
2. Inspect current branch/PR and preserve user/other-agent commits.
3. Confirm the latest GitHub Actions source/visual/build results before making a
   success claim.
4. Modify actual source, not only docs.
5. Keep canonical `www` and Android packaged assets synchronized.
6. Run the full Node suite and relevant Android/visual CI before integration.
7. Update the handoff/test/release docs with actual evidence, not estimated
   percentages.
