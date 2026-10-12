# Play Console drafts — Data safety and health

Draft for the **free internal-test** artifact. These are answers to paste into Google Play after you re-read them against the exact AAB you upload. They were not submitted. Nothing here is legal advice.

The build these answers describe:

- `window.CHISEL_RELEASE_CONFIG.billingEnabled` is `false`. Credit purchases, the premium button, and new paid-account creation stay off.
- `cloudPhotoRendersEnabled` is `true`. Optional photoreal editing can send a prepared photo after the user confirms.
- `RC_API_KEY` is empty. RevenueCat is not configured.
- Account deletion source exists (`supabase/functions/account-lifecycle`) and is **not deployed**. The public request page is `docs/account-deletion.html`.
- No ads and no analytics SDK.

If you flip either release flag, or deploy billing, stop and rewrite this form before you upload.

## Data safety

**Does your app collect or share any of the required user data types?** Yes.

On-device camera analysis, local photos, routines, and logs are not "collected" under Play's definition when they never leave the phone. The optional photoreal path does send a photo off the device.

**Is all of the user data collected by your app encrypted in transit?** Yes. Cleartext traffic is disabled (`usesCleartextTraffic=false`). Off-device calls use HTTPS.

**Do you provide a way for users to request that their data is deleted?** Yes, with the limits below. Do not answer this as a completed live cloud deletion.

| Data type | Collected | Shared | Optional | Purpose | What actually happens in this build |
|---|---|---|---|---|---|
| Photos and videos → Photos | Yes | Yes | Yes | App functionality | Only if the user confirms photoreal editing. The app sends a prepared JPEG to the `render-lookmax` edge function, which sends it to Replicate. Chisel does not write that source photo into its own database. Replicate's retention is the provider's, and it has not been re-verified for this draft. The credit/OpenAI path is not for sale in this build. |
| Device or other IDs | Yes | No | No, for the photoreal quota | App functionality, fraud prevention / abuse | A random device id is created on the phone and sent so the free render allowance can be counted. It is hashed before the budget row is stored. It is not an advertising id. |
| Email address | Yes, only if someone asks | Yes, with the auth host | Yes | Account management | Home → Progress reports & private tools → Manage existing cloud account can request an email code for an **existing** account (`create_user` is false). That call goes to the configured Supabase Auth host. This release does not create accounts. Do not declare email as required. |
| Purchase history | No | No | — | — | Billing is off and the RevenueCat key is empty. Declare purchase history only after you enable billing. |
| Name, address, phone, precise location, contacts, messages, files other than the optional photo, health-sensor data, financial info, web browsing, crash logs, diagnostics, app interactions, search history, audio | No | No | — | — | Not collected by this build. Sleep hours, water, and salt are self-logged on the device and are not uploaded. |

**Data the form sometimes asks about separately**

- **Ephemeral processing:** Chisel's own backend does not store the photoreal source photo. Do not tick "processed ephemerally" for the provider until you have checked Replicate's current retention for this integration. If you cannot confirm that, answer that the photo is shared with the image provider and describe the purpose as app functionality, optional.
- **Account deletion URL** (only required once the app lets people create an account): after this file is on `main`, `https://github.com/kapasainitishreddy/Chisel/blob/main/docs/account-deletion.html`. The same page is inside the app as `account-deletion.html`. In-app local wipe is Connect → Clear all my data. Live cloud deletion still needs the undeployed function, plus one real deletion test.
- **Can users create an account in this version?** No. App access for internal testing: all functionality in this free build is available without a login. The existing-account screen is only for an account that already exists.

## Health apps declaration

Complete the health declaration. Do not choose "no health features." This build includes movement practice, meditation, and self-logged sleep, water, and salt. It is still a cosmetic and educational app, not a medical device.

Select or review these categories, and use the wording next to them:

| Category | Select? | Draft statement |
|---|---|---|
| Activity and fitness | Yes | Face and neck routines and posture practice. The app does not count steps, read heart rate, or connect to wearables. It does not measure pressure, blood flow, lymph drainage, muscle activation, fat loss, or bone change. |
| Stress management, relaxation, and mental acuity | Yes | Affirmations and a short meditation. This is not therapy, counseling, or a crisis service. |
| Sleep | Review, and select if the form treats a manual log as sleep management | The user can type hours of sleep. There is no microphone, sensor, or sleep-stage claim. |
| Nutrition and weight | Review, and select if the form treats a manual log as nutrition | The user can log water and a coarse salt level because the app discusses facial puffiness. There is no calorie target, weight goal, or diet prescription. |
| Diseases and conditions, clinical decision support, medical device, period tracking, fertility, medications, Health Connect | No | None of these are in the app. |

Additional declaration text you can paste:

> Chisel gives cosmetic and educational guidance. It does not diagnose, treat, cure, or prevent any disease. It is not a medical device and does not claim clinical validation. Stop for pain, clicking, locking, dizziness, numbness, or discomfort. Face exercises and posture practice do not reshape adult facial bones or spot-reduce fat.

Target audience for the listing remains 17+. The app is not directed to children. No ads.

## Signing the internal-test AAB

The release build reads a keystore you create and keep. The repository rejects `bundleRelease` until `chisel-android/android/keystore.properties` exists. That file and `*.jks` are gitignored. Do not commit them, and do not send them to an agent.

1. Install Android Studio and Android SDK Platform 36.
2. From `chisel-android/android/`, create the upload key and store the passwords in a password manager:

```bash
keytool -genkey -v -keystore chisel-upload.jks -keyalg RSA -keysize 2048 -validity 10000 -alias chisel
```

3. Copy `keystore.properties.example` to `keystore.properties` in the same folder:

```properties
storeFile=chisel-upload.jks
storePassword=YOUR_STORE_PASSWORD
keyAlias=chisel
keyPassword=YOUR_KEY_PASSWORD
```

4. From `chisel-android/`:

```bash
npx cap sync android
cd android
./gradlew bundleRelease
```

On Windows use `gradlew.bat bundleRelease`. The file to upload is `chisel-android/android/app/build/outputs/bundle/release/app-release.aab`. `versionCode` is `1` for the first upload. Increase it before every later upload. Turn on Play App Signing in the console and let Google hold the app signing key. You keep the upload key.

Full listing steps remain in `PLAY_STORE.md`.

## What you still have to do

See the checklist at the end of `docs/PRELAUNCH_37.md`. Do not upload this draft, do not create the Play app from this session, and do not deploy the Supabase functions from this session.
