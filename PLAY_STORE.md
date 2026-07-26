# Chisel — Play Store Release Guide

Everything you need to get a signed **AAB** and publish. Steps A–B produce the
uploadable file; C–F are the Play Console side.

> I cannot build/sign the AAB for you: it must be signed with **your** keystore
> and password (which only you should ever hold), and it needs your local Android
> SDK. The project is now configured so that **one command** produces the signed
> AAB once you've done the one-time setup below.

---

## A. One-time setup (do once)

### 1. Confirm tools
- Android Studio installed, and **Android SDK Platform 35** downloaded
  (Android Studio → Settings → SDK Manager → tick **Android 15 (API 35)** → Apply).
- The project now targets **API 35 / AGP 8.6 / Gradle 8.7** (updated for you).

### 2. Create your upload keystore (you choose the passwords)
Open a terminal in `chisel-android/android/` and run (uses the JDK bundled with
Android Studio; if `keytool` isn't found, use the full path
`"C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe"`):

```bash
keytool -genkey -v -keystore chisel-upload.jks -keyalg RSA -keysize 2048 -validity 10000 -alias chisel
```

- It asks for a **keystore password**, your name/org, and a **key password**.
  Pick strong passwords and **save them in a password manager** — if you lose
  them you can't update the app under the same key.
- This creates `chisel-android/android/chisel-upload.jks` (already gitignored).

### 3. Create `keystore.properties`
Copy `chisel-android/android/keystore.properties.example` to
`chisel-android/android/keystore.properties` and fill in your real values:

```properties
storeFile=chisel-upload.jks
storePassword=YOUR_store_password
keyAlias=chisel
keyPassword=YOUR_key_password
```
This file is gitignored — it never gets committed.

---

## B. Build the signed AAB (repeat for every release)

From `chisel-android/`:

```bash
npx cap sync android
cd android
gradlew.bat bundleRelease
```

Output (this is what you upload to Play):
```
chisel-android/android/app/build/outputs/bundle/release/app-release.aab
```

If you'd rather build in Android Studio: **Build → Generate Signed Bundle / APK
→ Android App Bundle**, pick your `chisel-upload.jks`, choose **release**, Finish.

> **Bump `versionCode`** in `chisel-android/android/app/build.gradle` (currently
> `1`) by +1 before every *new* upload after the first.

---

## C. Host the privacy policy (required, public URL)

`docs/privacy-policy.html` is ready. Easiest hosting = GitHub Pages:
1. GitHub repo → **Settings → Pages**.
2. Source: **Deploy from a branch**, Branch: **main**, Folder: **/docs** → Save.
3. Your URL becomes: `https://kapasainitishreddy.github.io/Chisel/privacy-policy.html`

Verify it opens in an incognito window before you paste it into Play Console.
(Update the contact email inside the file first if you don't want to use the one there.)

---

## D. Play Console — create app & store listing

1. **Create app** → default language English, **App**, **Free**, accept declarations.
2. **Package name is fixed after first upload:** `com.chisel.lookmax`.
3. Store listing:

| Field | Value |
|---|---|
| App name (≤30) | `Chisel: Face & Glow-up` |
| Short description (≤80) | `On-device face analysis, grooming & makeup guidance — track your glow-up.` |
| Full description | see `STORE_DESCRIPTION` below |
| Icon | 512×512 PNG (your launcher icon) |
| Feature graphic | 1024×500 PNG/JPEG |
| Screenshots | ≥2 (use 4+ 1080×1920 portraits: Analyze results, Try-on, Makeup, Progress) |

**STORE_DESCRIPTION (paste, edit freely):**
> Chisel measures what you can actually improve — and shows you how, with the
> evidence behind every tip.
>
> • On-device facial analysis (Google MediaPipe, 468-point mesh): jawline, cheekbones, facial angles, symmetry, skin, teeth, hair.
> • 3D profile angles from a single front scan — nasofrontal, nasolabial and more.
> • Skin scan: undertone, evenness, redness, blemishes — each with a science-graded routine.
> • Virtual try-on: hair, beard, eyewear and makeup on your live face.
> • Makeup suggestions and a coach (guidance, never a rating) tailored to your undertone and face shape.
> • Progress photos, before/after slider, streaks, and 30-day glow-up programs.
> • Inclusive: male, female, non-binary and custom identities.
>
> Everything runs on your device. No login, no ads, no trackers. Cosmetic &
> educational guidance — not medical advice.

---

## E. App content, Data safety, and declarations

### Privacy policy
Paste your hosted URL from step C.

### Data safety form — answers
- **Does your app collect or share user data?** → **Yes** (because photoreal sends a photo, and a device ID is sent).
- **Data types:**
  - **Photos and videos → Photos**: Collected **Yes**, Shared **Yes** (image-generation provider). Processed **ephemerally / not stored**. Purpose: **App functionality**. Optional: **Yes** (only if user uses photoreal).
  - **Device or other IDs**: Collected **Yes**, Shared **No**. Purpose: **App functionality, Fraud prevention** (usage limits).
  - **Purchase history** (if you enable billing): handled by Google Play — declare **App functionality**.
- **Is all data encrypted in transit?** → **Yes**.
- **Can users request data deletion?** → **Yes** (email in the privacy policy).
- No location, contacts, messages, health-connect, or analytics data collected.

### Content rating
- Complete the questionnaire honestly. It's a wellness/beauty utility with no
  violence/sexual/gambling content → typically **Everyone/Teen**, but you may set
  **17+/Mature** given the appearance focus. No user-generated content, no social features.

### Health apps declaration
- If prompted (wellness wording), complete it and confirm **no medical claims**
  (the app already says "cosmetic & educational — not medical advice").

### App access
- No login required → select **All functionality is available without special access**.

### Ads
- **No ads.**

### Target audience & permissions
- Target audience: **17+** (recommended). Not appealing to children.
- **Camera permission**: prominent in-app purpose is shown before use; make sure a
  screenshot demonstrates the camera feature.

---

## F. Testing & release

- **Internal testing first:** upload `app-release.aab` to **Testing → Internal testing**, add your Google account, install via the opt-in link, and test: fresh install, camera permission, scan, try-on, purchases/restore (if billing on), offline, notifications.
- **New personal Play accounts (created after 13 Nov 2023):** you must run a **closed test with 12 testers opted in for 14 continuous days** before production access. Start this early.
- **Production:** create release → confirm **Play App Signing** → upload the AAB → add release notes → submit for review → consider a **staged rollout**.

### Final 10-minute gate
- [ ] App opens with no localhost/dev-server dependency (it's offline-first ✔).
- [ ] Privacy policy URL works in incognito.
- [ ] Data safety answers match the app (photo + device ID).
- [ ] versionCode higher than any previous upload.
- [ ] Keystore + passwords backed up in a password manager.
- [ ] Support email monitored.

---

## Notes / follow-ups
- **API 36:** From **31 Aug 2026**, new apps and updates must target **API 36**.
  You're on 35 (valid now). Bumping to 36 needs a small AGP/SDK bump — do it
  before your first update after that date.
- **RevenueCat/Play Billing:** the paywall **backend and in-app UI are now wired**
  (paywall screen, purchase + restore, "Go Premium" entry, free-limit → paywall
  routing). To turn it on you must, in the dashboards (can't be automated):
  1. **Play Console** → create a subscription with a 3-day $0.99 intro + $6.99/mo (or $39.99/yr) base plan; put the app in a testing track.
  2. **RevenueCat** → link the Play product to an entitlement named `premium`, copy the **public Android SDK key**.
  3. In `chisel-android/www/index.html`, set `const RC_API_KEY = '...'` (near the paywall block) to that key; run `npm install` + `npx cap sync android`.
  4. Point RevenueCat's webhook at the deployed `rc-webhook` function and set `RC_WEBHOOK_SECRET`.
  Until `RC_API_KEY` is set, the app stays free-tier and the paywall shows a friendly "store unavailable" message — safe to launch free-first.
- **Security hardening (optional):** enable R8 (`minifyEnabled true`) after
  testing, and run **MobSF** on the final AAB (see the security checklist).
