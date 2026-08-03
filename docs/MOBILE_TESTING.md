# Chisel Mobile Testing

## Which file should I use?

- Use the **debug APK** for the fastest direct test on your Android phone.
- Use the **AAB** for Google Play Internal Testing. An AAB is not directly installable like an APK.

## GitHub Actions build

1. Open the repository on GitHub.
2. Open **Actions**.
3. Select **Chisel Mobile Build**.
4. Choose **Run workflow** on `main`.
5. After the run succeeds, download the `chisel-mobile-build-*` artifact.
6. Extract it and install `app-debug.apk` on the phone, or upload `app-release.aab` to a Play Console Internal testing release.

The workflow performs:

```bash
npm install
npx cap sync android
npm test
./gradlew assembleDebug bundleRelease
```

It also verifies that the Android-packaged `index.html` exactly matches `www/index.html`.

## Local Capacitor test on an Android phone

Requirements: Node 22, JDK 17, Android Studio/SDK 35, USB debugging enabled.

```bash
git pull origin main
cd chisel-android
npm install
npx cap sync android
adb devices
npx cap run android
```

Alternative install command:

```bash
cd android
./gradlew installDebug
```

## AAB testing

An AAB should normally be tested through Google Play:

1. Create or open the Chisel app in Play Console.
2. Go to **Testing > Internal testing**.
3. Create a release and upload `app-release.aab`.
4. Add the tester email addresses.
5. Open the opt-in link on the Android phone and install from Google Play.

A Play upload requires a signed release AAB. The GitHub workflow produces an unsigned release AAB unless signing credentials are configured. The debug APK is ready for direct device installation.

## Device test checklist

Test on at least one low/mid-range and one recent Android device.

- Fresh install, relaunch, update install and data deletion
- Camera allow, deny, deny permanently, and retry
- Front/rear camera switching
- Quick scan and Precision Mode batches
- Face, skin, lips, neck, posture, front-body and side-body flows
- Low light, backlight, movement, multiple faces and no face
- Makeup, beard, glasses, different skin tones and fitted/loose clothing
- Offline relaunch after MediaPipe models have been cached
- Activity pause/resume, phone rotation, background/foreground
- Labs and Precision Mode launch buttons
- Local-only storage and Clear my data
- Paywall fallback when RevenueCat is not configured
- Photoreal feature network failure and retry behavior
- Accessibility: keyboard/focus where available, TalkBack labels and large text
- Performance, heat, memory use and camera frame rate

Record each issue with device model, Android version, exact steps, expected result, actual result, screenshot/video and logs.
