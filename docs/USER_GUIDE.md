# Chisel User Guide

Chisel is a private appearance-tracking and self-improvement app. It is designed to measure repeatable visual signals, help the user act on controllable factors, and avoid global attractiveness ratings.

> Core camera measurements are cosmetic/educational estimates. They are not medical, dental, dermatology, laboratory, or body-composition diagnoses.

## 1. First launch

When the user installs and opens Chisel:

1. The Onyx premium shell opens with a short first-run concierge.
2. Chisel explains that core analysis runs on-device and that weak captures may be rejected instead of producing a confident-looking result.
3. The user can create a baseline immediately or explore the app first.
4. Camera permission is requested only when the user enters a camera-dependent feature.
5. No account is required for the core local experience.

The mobile experience is organized around the current primary destinations: **Home**, **Scan**, **Routine**, and **More**. Additional tools appear contextually inside those destinations instead of crowding the bottom navigation.

## 2. Home / recommended next action

Access: **Home**.

The user sees:

- a recommended next action based on whether a baseline exists
- scan readiness guidance
- progress/tracking context
- private-processing and confidence principles
- shortcuts into a guided scan or Precision Mode
- daily mindset/affirmation entry points
- current streak/program context when available

A new user is guided toward a controlled baseline. A returning user is encouraged to repeat the baseline under similar conditions instead of scanning constantly.

## 3. Quick Scan

Access: **Scan → Quick**.

Use when the user wants a fast appearance check. Chisel uses the face camera/mesh and a short multi-frame pool rather than depending on one still image.

Depending on capture quality and visibility, the standard analysis can provide photographic estimates or ratios for:

- facial geometry and symmetry proxies
- cheekbone/mid-face proportions
- jaw width and jaw-related geometry
- facial thirds/proportions
- lips
- eye spacing and eye-area geometry
- skin brightness/evenness/redness/visible blemish signals
- under-eye appearance
- teeth-region brightness
- bloat/facial-fullness trend proxies
- hair/visible grooming context

Results are intended for within-user tracking and guidance rather than population ranking.

## 4. Deep Scan

Access: **Scan → Deep**.

Deep is the preferred normal baseline mode. It uses a larger frame pool than Quick and is intended to reduce one-frame noise.

Use Deep when:

- creating the first baseline
- re-scanning after several weeks
- generating the routine from a stronger capture
- comparing general appearance trends over time

## 5. Precision Mode

Access: **Home → Open Precision Mode** or **Scan → Precision**.

Precision Mode is the strict repeatability workflow. It is separate from normal Quick/Deep scanning.

### Precision Face & Skin

The user selects 7–12 matched neutral photos from one controlled session. An optional second 7–12-photo open-mouth batch can be added for expression calibration.

Precision Mode checks:

- lighting
- blur/sharpness
- framing/fill
- head roll/yaw/pitch
- expression stability
- face-model confidence
- glare for colour-sensitive skin work
- landmark occlusion

Bad batches return actionable instructions such as fixing backlight, camera distance, blur, head angle, glare, hair/accessory occlusion, or expression rather than raw internal error names.

Accepted batches use robust consensus, outlier rejection, and within-batch uncertainty. Results explicitly separate:

- **Capture quality**
- **Measurement repeatability**
- **Within-batch uncertainty**

The `90+` Precision score refers only to capture/protocol quality, not laboratory accuracy.

### Precision Body & Posture

The user supplies at least three front and three side photos under a controlled setup. Chisel uses pose landmarks plus segmentation and rejects poor silhouettes.

It can track:

- waist-to-hip photographic ratio
- shoulder-to-waist photographic ratio
- normalized photo waist-perimeter trend
- waist width/depth trends
- hip width/depth trends
- torso/posture geometry
- neck/ear-to-shoulder posture-angle proxy

The user may enter one real tape-measured waist baseline to calibrate later relative trends. Chisel does not claim that uncalibrated pixels equal centimetres.

### Precision Progress

Chisel only treats two Precision scans as strictly comparable when their available setup metadata is sufficiently compatible, including scan kind, camera, framing, lighting and—when recorded—method version, view, orientation, and camera distance.

A change must also exceed the combined uncertainty of the compared measurements. Otherwise the product should describe the result as within normal variation or not comparable instead of inventing progress.

## 6. Chisel Labs

Access: **More / Chisel Labs**.

### Skin Recovery

Reads available skin appearance signals and creates conservative morning/evening skincare direction. It includes pacing, patch-test language, local check-offs, and escalation to professional care for persistent/painful/scarring/rapidly worsening concerns. It does not diagnose acne or promise a cure.

### Expression Calibration

The user provides one neutral and one naturally open-mouth photo. Chisel aligns the face meshes and remaps lower-face landmarks so expression-induced jaw/cheek changes are not mistaken for bone-structure change.

### Lips & Color Lab

Uses stored skin/lip colour and undertone information or a new local sample to:

- sample visible lip/skin colour
- rank compatible lip-stain shades
- preview a local virtual stain overlay
- keep local shade history

### Neck Care

Combines posture angle, visible neck redness/evenness and shaving/sensitivity inputs to create sunscreen, moisturizing, shaving-irritation and posture direction without diagnosing a condition.

### Body & Waist Lab

Uses pose plus silhouette sampling to show normalized waist/hip/shoulder geometry, confidence and a mild illustrative preview. It does not rank body attractiveness or guarantee transformation.

## 7. Jawline training

Access: **Scan → More scan tools → Jaw/Training** where exposed by the current shell.

The guided camera mode walks the user through jaw/neck exercise reps and form checks. Exercise guidance is framed around muscular activity/posture rather than claiming exercise can reshape adult facial bone.

## 8. Grooming and daily routine

Access: **Routine**.

The user can:

- open evidence-backed grooming cards
- build/see today's plan
- check tasks off
- view adherence percentage
- follow skincare/grooming/posture actions
- open product/shopping links where available
- track daily completion locally

The product should prioritize a few controllable actions rather than presenting a giant deficiency list.

## 9. 30-day programs

Access: **Routine / Programs**.

Programs turn individual recommendations into a structured month-long routine. Progress and completion are stored locally.

Pro product direction also defines adaptive 30-, 60-, and 90-day protocols, but production Pro entitlements must not be advertised as live until the corresponding entitlement/configuration is enabled.

## 10. Hydration, sodium and bloat context

Access: **Routine / hydration-bloat controls**.

The user can log water/sodium-related context. Chisel uses it as contextual information for fullness/bloat trends rather than claiming to diagnose fluid retention or health conditions.

## 11. Local reminders

Access: **Routine / reminder controls** when the native Local Notifications plugin is enabled in the production build.

Users can schedule routine reminders. Android notification permission UX must be validated on a real production build before this feature is treated as release-verified.

## 12. Hair and beard try-on

Access: **More / Looks tools / Try-on**.

The local try-on canvas can overlay hairstyle and beard concepts using face landmarks. This is for style exploration rather than a claim that the rendered result is an exact future appearance.

## 13. Eyewear try-on

Access: **More / Looks tools / Try-on**.

The user can preview multiple eyewear styles positioned using face landmarks.

## 14. Makeup tools

Access: **More / Makeup / Looks tools**.

Chisel includes:

- local makeup try-on
- custom makeup routine
- undertone/face-shape-aware suggestion logic
- non-numeric makeup coach
- saved local makeup-look gallery

Guidance is about style and application, not attractiveness ranking.

## 15. Photoreal hair/beard rendering

Access: **Looks tools / Photoreal render** when production rendering is configured.

This is an opt-in cloud feature and is different from the default local overlays. It may send the selected image to the configured rendering provider. Production use requires the server function/provider configuration, quotas, privacy disclosure and live device testing.

Chisel Pro direction uses finite render credits rather than unlimited rendering; failed provider jobs should restore the credit.

## 16. Future-you preview

Access: **Scan → More scan tools / Future preview** where exposed.

The current implementation includes a client-side illustrative preview using the user's progress data. It must be described as an illustrative visualization, not a guaranteed prediction. A true photoreal future render remains dependent on the production cloud-render path.

## 17. Posture analysis

Access: **More / Posture** or the relevant body tool.

MediaPipe Pose is used to estimate posture geometry such as craniovertebral/neck-angle proxies. It is a photographic tracking tool, not a musculoskeletal diagnosis.

## 18. Photo tracker and before/after

Access: **More / Progress** or progress-related entry points.

Users can:

- save local progress photos
- compare before/after
- use the slider
- review scan/photo history
- see longer-term changes alongside routine adherence

## 19. Best-photo picker

Access: **More / photo tools** where exposed.

The image landmarker can help compare candidate photos and choose the strongest capture according to image/face quality signals. It is not an attractiveness ranking.

## 20. Identity/personalization

Access: **More / Settings / identity controls**.

Chisel supports male, female, non-binary and custom identity choices so copy, affirmations and style direction can be personalized without forcing a single presentation.

## 21. Affirmations and mirror

Access: **Home → Daily mindset**.

Users can cycle through personalized affirmation banks and use the mirror-style mindset experience. These features are complementary wellbeing tools rather than measurement outputs.

## 22. Meditation / visualization

Access: **Home → Visualize / meditation**.

Includes a breathing/visual orb, guided scripts, text-to-speech where available, and audio/hum elements.

## 23. Streaks, freezes and badges

Access: visible through Home/Routine/Progress context.

Chisel tracks continued engagement with routines/scans and can award badges/streak state. Gamification should reward consistent actions rather than compulsive scanning or appearance ranking.

## 24. Shareable progress card

Access: **Progress / Share**.

The user can generate a progress-oriented share card. The share concept is based on habits and verified progress rather than a public attractiveness score. Android/Web Share behavior still needs final real-device validation for the production release.

## 25. Barber / skincare discussion export

Access: **Scan → More scan tools → Export** or the relevant More/Export entry.

Chisel can create a shareable brief using scan/style information for discussion with a barber or skincare professional. These exports are discussion aids and should carry limitations rather than medical recommendations.

The Pro roadmap expands this into barber, skincare, dental and posture/fitness reports.

## 26. Local privacy and data controls

Access: **More / Settings / Privacy**.

Users can:

- understand when analysis is local versus when an optional cloud render is used
- delete local Chisel data from inside the app
- use the public privacy-policy page
- control exports explicitly

Android app backup is disabled for the release build to avoid broad OS backup of app-local appearance history. Cleartext HTTP traffic is also disabled.

## 27. Camera disclosure

Before camera use, Chisel shows a prominent disclosure describing why camera access is needed. Camera hardware is marked optional at installation level so devices are not excluded solely by manifest filtering.

## 28. Paywall, purchase and restore

Access: **Go Premium / paywall** once production billing is configured.

The client contains purchase/restore and entitlement seams. Production Premium still depends on:

- Google Play subscription products/base plans
- RevenueCat `premium` entitlement
- RevenueCat public Android SDK key
- live purchase/restore/grace/expiry testing
- production server entitlement/webhook setup where used

Until those external systems are configured and validated, paid entitlement behavior must be treated as configuration-pending rather than fully live.

## 29. Chisel Pro product set

The approved Pro direction is documented in `PREMIUM_FEATURES.md`:

- **Precision Lab Pro** — unlimited Precision, advanced condition matching, calibration and reproducibility reports
- **Progress Intelligence** — unlimited history, verified-change timeline, confidence bands and method-aware comparison
- **Adaptive Protocols** — longer programs and deterministic reviewed coaching
- **Looks Studio Pro** — deeper style libraries, decision boards, HD export and finite cloud-render credits
- **Professional Export** — barber/skincare/dental/posture discussion reports
- **Private Vault Plus** — biometric/PIN lock, encrypted archive and secure/optional encrypted backup

Recommended initial pricing: $6.99/month or $39.99/year with a clearly disclosed 7-day annual trial. Production pricing remains a business configuration until Play/RevenueCat products are created.

## 30. Build, privacy and release infrastructure

Chisel also includes product infrastructure the end user does not normally see:

- Capacitor Android shell
- reproducible GitHub Actions tests
- APK/AAB build workflow
- release signing configuration using a developer-owned gitignored keystore
- privacy policy
- Supabase function source for cloud rendering/entitlements
- evidence/science documentation
- Android 16 / API 36 compile and target configuration
- local backup disabled
- cleartext traffic disabled

## A typical user journey

1. Install and open Chisel.
2. Read the short privacy/accuracy introduction.
3. Tap **Create my baseline**.
4. Choose **Deep** for a normal baseline or **Precision** for a controlled multi-photo baseline.
5. Follow camera guidance until the capture passes the quality gate.
6. Review measurements, confidence/repeatability and the highest-impact controllable actions.
7. Add those actions to the daily **Routine**.
8. Use style tools such as hair/beard/eyewear/makeup previews when making grooming decisions.
9. Log routine completion and relevant hydration/context over the following weeks.
10. Repeat the scan under matching conditions rather than scanning every day.
11. Open **Progress**/Precision history to see whether a measured change exceeds normal variation and whether the scans are comparable.
12. Share a progress card or professional discussion brief if desired.
13. Optionally upgrade to Chisel Pro after production billing is enabled for deeper Precision, history, programs, style tools and private-vault features.
