# Chisel — Play Store Release Guide

Everything needed to get a signed **AAB** and publish Chisel. Steps A–B produce
the uploadable file; C–F cover the Play Console side.

> The upload keystore and passwords stay developer-owned and must never be
> committed. The project is configured so the signed AAB can be produced once
> that one-time setup is complete.

---

## A. One-time setup

### 1. Confirm tools
- Android Studio installed with **Android SDK Platform 36**.
- The project targets **API 36 / AGP 8.10 / Gradle 8.11.1**.
- Java 17 available.

### 2. Create the upload keystore
Open a terminal in `chisel-android/android/` and run:

```bash
keytool -genkey -v -keystore chisel-upload.jks -keyalg RSA -keysize 2048 -validity 10000 -alias chisel
```

Choose strong passwords and save them in a password manager. The generated
`chisel-upload.jks` is gitignored and must remain private.

### 3. Create `keystore.properties`
Copy `chisel-android/android/keystore.properties.example` to
`chisel-android/android/keystore.properties` and fill in the real values:

```properties
storeFile=chisel-upload.jks
storePassword=YOUR_store_password
keyAlias=chisel
keyPassword=YOUR_key_password
```

This file is gitignored.

---

## B. Build the signed AAB

From `chisel-android/`:

```bash
npx cap sync android
cd android
gradlew.bat bundleRelease
```

Output:

```text
chisel-android/android/app/build/outputs/bundle/release/app-release.aab
```

Or use Android Studio → Build → Generate Signed Bundle / APK → Android App
Bundle → release.

> Increment `versionCode` before every new Play upload after the first.

---

## C. Host the privacy policy

`docs/privacy-policy.html` is ready. One simple route is GitHub Pages:

1. Repository Settings → Pages.
2. Deploy from branch → `main` → `/docs`.
3. Verify the resulting public policy URL in an incognito browser before adding
   it to Play Console.

---

## D. Play Console — store listing

1. Create app → English → App → Free → declarations.
2. Package name: `com.chisel.lookmax`.
3. Use the positioning below rather than leading with a generic “glow-up” claim.

| Field | Recommended value |
|---|---|
| App name (≤30) | `Chisel: Face & Grooming` |
| Short description (≤80) | `Face analysis, grooming routines, try-ons and progress. No public beauty rating.` |
| Full description | `STORE_DESCRIPTION` below |
| Icon | 512×512 PNG |
| Feature graphic | 1024×500 PNG/JPEG |
| Screenshots | 5–7 portrait screenshots; sequence below |

### Positioning line

**Measure. Act. Compare yourself to yourself.**

This is the clearest product promise: Chisel is a private appearance-improvement
studio, not a public attractiveness score.

### STORE_DESCRIPTION

> **Measure. Act. Compare yourself to yourself.**
>
> Chisel helps you make better appearance and grooming decisions without turning
> your face into a public beauty score.
>
> **Measure carefully**
> • Private on-device facial analysis with capture-quality checks and multi-frame measurements.
> • Track jaw, cheek, symmetry, skin and other photographic appearance signals over time.
> • Weak captures are rejected so one bad selfie does not become “progress.”
>
> **Act on what you can control**
> • Evidence-aware grooming and skincare routines.
> • A simple Today focus so you do one useful action instead of repeatedly checking the mirror.
> • Gentle AR jaw/posture and cheek guidance with explicit safety limits.
>
> **Try a look before committing**
> • Live hair, facial-hair, eyewear and makeup previews.
> • Optional photoreal cloud renders only when you explicitly choose them.
>
> **Compare later**
> • Local progress photos, matched-condition comparisons, routines, reminders and streaks.
> • Best-photo tools based on capture quality, not attractiveness voting.
>
> **Private by default**
> Core face analysis stays on your device. No account required. No ads. No analytics trackers.
>
> Chisel is cosmetic and educational guidance, not medical advice or a clinical measurement tool.

### Screenshot order

The first screenshots should explain the product loop before showing feature
depth. Do not lead with a paywall.

1. **Today’s Chisel** — caption: `One useful action. Then get on with your day.`
2. **Quick Scan** — caption: `Private, multi-frame analysis with weak-scan rejection.`
3. **Try-on Studio** — caption: `Try hair, facial hair, eyewear and makeup before you commit.`
4. **Routine** — caption: `Act on controllables, not a beauty score.`
5. **Progress** — caption: `Compare yourself to yourself under similar conditions.`
6. **AR Coach** — caption: `Gentle form guidance with evidence and safety limits.`
7. Optional **Photoreal / Pro** — caption: `More optional cloud rendering when you want it.`

### Feature graphic direction

Keep the existing onyx/gold/ivory identity. Use one face-neutral product visual,
not a before/after “ugly → attractive” transformation. Recommended headline:

**MEASURE · ACT · COMPARE**

Subline: **Private appearance improvement. No public rating.**

Avoid fake review counts, fake scarcity, guaranteed transformation claims, or
medical/anthropometric accuracy claims.

---

## E. App content, Data safety, and declarations

### Privacy policy
Paste the hosted policy URL from step C.

### Data safety form
- **Does the app collect or share user data?** → **Yes**, because optional
  photoreal rendering sends a photo and a device ID is used for render limits.
- **Photos and videos → Photos:** collected/shared only for the optional
  photoreal action; processed for app functionality; not a core-scan requirement.
- **Device or other IDs:** used for app functionality / abuse prevention around
  render limits.
- **Purchase history:** declare accurately once billing is live.
- **Encrypted in transit:** Yes for network paths.
- No location, contacts, messages, Health Connect, advertising IDs or analytics
  data should be declared unless the implementation changes.

### Content rating
Complete the questionnaire honestly. Chisel has no user-generated social feed,
gambling, violence or sexual content. Keep the appearance/wellness positioning
age-appropriate and do not market to children.

### Health apps declaration
If prompted, state that Chisel provides cosmetic/educational guidance and does
not diagnose, treat or provide clinical measurements.

### App access
No login required → all core functionality is available without special access.

### Ads
**No ads.**

### Camera permission
The app includes a prominent camera-purpose disclosure before first use. Final
store screenshots and review notes should make the camera-dependent features clear.

---

## F. Testing & release

- Upload the signed AAB to **Internal testing** first.
- Test fresh install, camera permission denial/recovery, Quick/Deep scan, AR
  coach, try-ons, progress, offline core behavior, share/export, reminders and
  data deletion.
- If paid access is enabled, test purchase, restore, expiry/grace behavior and the
  free-render → paywall path with a real Play test account.
- Complete any closed-testing requirement shown by the developer account.
- Use staged rollout for production.

### Final gate
- [ ] App opens without a localhost/dev-server dependency.
- [ ] Privacy-policy URL works publicly.
- [ ] Data Safety answers match the exact shipped build.
- [ ] `versionCode` exceeds every previous upload.
- [ ] Upload keystore and passwords are backed up privately.
- [ ] Final screenshots come from the release candidate on a real device.
- [ ] Support email is monitored.
- [ ] Any Pro purchase shown in the app is actually configured and testable.

---

## RevenueCat / Play Billing

The client contains purchase/restore and paywall seams, but paid access is not
production-ready until the external configuration is complete:

1. Create the intended Play subscription/base plans.
2. Link those products in RevenueCat to the `premium` entitlement.
3. Put the RevenueCat **public Android SDK key** in the client configuration.
4. Configure and deploy the entitlement/webhook server path and secrets.
5. Validate purchase, restore, expiry/grace and server enforcement on a Play test track.

Do not hard-code a launch price in this release guide until the actual Play
products are created. The app should display the price and renewal terms returned
by Google Play rather than duplicating them in marketing copy.

Until the public RevenueCat key and products are configured, Chisel remains safe
to ship free-first and should not imply that unavailable paid functionality is live.

## Optional security hardening

After release-device testing, consider R8/minification and run a mobile security
scanner such as MobSF against the final signed artifact. Keep signing material and
server secrets outside the repository.
