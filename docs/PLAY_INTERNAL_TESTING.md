# Chisel — Google Play internal testing

12 October 2026. This is the free-first internal-test candidate. It is not a Play submission, a signed AAB, or permission to turn purchases on.

Source line: `main` at `1c08c6e` (23 September 2026) plus `fix/storeready-play-readiness-20261004`. The July branch `claude/remaining-tasks-3luvx4` is stale and is not included.

## What this build is

Chisel is a **Capacitor 7** Android app (`com.chisel.lookmax`), not an Expo app. There is no `eas.json`. `npx expo-doctor` does not apply and must not be forced green by adding a second native project.

The production Android profile is the Gradle **release App Bundle**:

```bash
cd chisel-android
npm ci
npm run typecheck
npm test
npm run doctor
npm run aab:production
```

`npm run aab:production` syncs the web app and runs `:app:bundleRelease`. It exits before Gradle if `chisel-android/android/keystore.properties` is missing. Output, after Sai signs it:

`chisel-android/android/app/build/outputs/bundle/release/app-release.aab`

| Setting | Value |
|---|---|
| Profile name | production |
| Artifact | Android App Bundle (`.aab`) |
| Gradle task | `:app:bundleRelease` |
| Application id | `com.chisel.lookmax` |
| versionCode / versionName | `1` / `1.0.0` |
| minSdk / targetSdk / compileSdk | 23 / 36 / 36 |
| Track | Internal testing only |
| Purchases | Off (`billingEnabled: false`, empty RevenueCat public key) |

## Signing — Sai creates the key

No upload key, keystore password, or Play service-account JSON is in this repository. Do not generate a key on a shared machine and do not commit one.

1. On a machine Sai controls, with a JDK available:

```bash
cd chisel-android/android
keytool -genkeypair -v -keystore chisel-upload.jks -keyalg RSA -keysize 2048 -validity 10000 -alias chisel
```

2. Store both passwords in a password manager and keep a backup of `chisel-upload.jks` outside the repo. Losing the upload key blocks updates until Google resets it.
3. Copy `keystore.properties.example` to `keystore.properties` in the same folder and fill in the real values. Both `keystore.properties` and `*.jks` are gitignored.
4. On the first Play upload, enroll in **Play App Signing**. Sai's key is the upload key. Google holds the app signing key.
5. Build with `npm run aab:production` and upload that AAB to **Internal testing**. Do not promote it to production from this draft.

`bundleRelease` without `keystore.properties` is rejected on purpose.

## Paid features stay off

RevenueCat is linked so the Billing 8 library is present, but this build does not configure it:

- `window.CHISEL_RELEASE_CONFIG.billingEnabled` is `false`
- `RC_API_KEY` is empty
- The Go Premium control is hidden
- Email sign-in uses `create_user: false` unless billing is on and the person is not in the deletion flow

Do not set `billingEnabled` or paste a RevenueCat key until both of these are true:

1. A RevenueCat **public** Android SDK key exists, Play products are in a test track, and a purchase, restore, refund, and expiry have been tested.
2. In-app account deletion completes against the deployed `account-lifecycle` function, including output cleanup, and a web deletion-request URL exists. The function in this repo is not deployed.

## Account deletion in this build

- **Clear all my data** (Settings) deletes on-device Chisel data, including the saved personal photo and saved looks. It does not delete a cloud account.
- **Delete cloud account** (Settings) opens the existing-account flow. It can request an email code and send `DELETE` to `account-lifecycle` with confirmation `DELETE`. It does not create an account and does not start a purchase.
- That edge function and the output-cleanup scheduler are **not deployed**. Until they are, the in-app cloud request cannot finish. The working request path is email to nittureddy26@gmail.com.

## Checks run for this candidate

From `chisel-android` after `npm ci`:

- `npm run typecheck`
- `npm test` (this also runs `npx cap sync android`)
- `npm run doctor`

`npm run aab:production` was not run here: this environment has no Android SDK and must not create Sai's upload key.

## Sai's next steps

1. Create the upload key and `keystore.properties` as above. Do not commit them.
2. Run `npm ci`, `npm run typecheck`, `npm test`, and `npm run doctor`.
3. Run `npm run aab:production` and confirm the AAB application id, version, and target SDK.
4. In Play Console, create the app if needed (`com.chisel.lookmax`, Free, English) and upload the AAB to **Internal testing** only.
5. Paste the drafts in [PLAY_DATA_SAFETY.md](PLAY_DATA_SAFETY.md), [PLAY_HEALTH_DECLARATION.md](PLAY_HEALTH_DECLARATION.md), and [PLAY_STORE_LISTING.md](PLAY_STORE_LISTING.md). Re-read them against the exact AAB. Do not submit production.
6. Point the privacy-policy field at the policy file for the same commit, and open it in a private window before saving. The in-app copy is `privacy-policy.html`.
7. Add internal testers, install from the opt-in link, and exercise camera permission, a scan, try-on, offline launch, local data deletion, and the disabled purchase state.
8. Capture real-device screenshots and a 1024×500 feature graphic. The listing draft does not include artwork.
9. If this Play developer account was created after 13 November 2023, plan the 12-tester / 14-day closed test before production access. This repo does not know the account's creation date.
10. Leave purchases off until the RevenueCat and deployed account-deletion gates above are done.
