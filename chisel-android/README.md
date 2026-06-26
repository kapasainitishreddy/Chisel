# Chisel — Lookmax AI Facial Assistant

A native Android app, wrapped with Capacitor around a single self-contained HTML/CSS/JS web app.

## What you get
- **6 screens**: Home, Analyze, Affirm, Meditate, Groom, Connect
- **Live front camera** with face-landmark overlay (uses browser `FaceDetector`, falls back gracefully)
- **Affirmations & manifestation lines** displayed on top of your live reflection
- **Guided meditation** with breathing orb, gold progress arc, ambient hum, and voice guidance
- **Science-based grooming guide** (jawline, nose, lips, neck, facial hair, haircut) with daily checklist
- **One-tap "Today's plan"** that persists across sessions

## Install on your phone (USB cable, USB debugging already on)

### One-click (recommended)
Plug in your phone with a USB cable, then double-click:
```
chisel-android\deploy.bat
```
It will:
1. Detect your phone via `adb`
2. Install Capacitor + Android platform
3. Build a debug APK
4. Install it on the phone
5. Launch Chisel

### If you don't have the Android SDK
1. Install **Node.js LTS** from https://nodejs.org
2. Install **Android Studio** from https://developer.android.com/studio
   - Open it once and let it download the Android SDK + platform-tools
3. Make sure your phone is in **File transfer / MTP** mode and **USB debugging is on**
4. Run `deploy.bat`

### Manual fallback (if gradle complains)
```bash
cd chisel-android
npm install
npx cap add android      # only first time
npx cap sync android
cd android
gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.chisel.lookmax/.MainActivity
```

## Phone permissions Chisel will request
- **Camera** — required for Analyze, Affirm, and Meditate
- **Storage** — not used in v1, but Capacitor may ask for it on first run

## File layout
```
chisel-android/
├── www/
│   └── index.html         ← the entire app (HTML + CSS + JS, no build)
├── capacitor.config.json
├── package.json
├── deploy.bat             ← Windows one-click installer
├── deploy.sh              ← macOS / Linux one-click installer
└── README.md
```

## Design tokens (used in the app)
- Onyx `#0A0A0B` · Graphite `#1A1A1D` · Ivory `#F2EDE4`
- Brushed gold `#C9A86A` · Gold-bright `#E2C58A`
- Rose `#D4A5A5` (affirmations) · Emerald `#3E6B5A` (meditation)
- Display: Cormorant Garamond · Body: Inter

## Notes
- This is a debug-signed APK (`app-debug.apk`). For Play Store distribution you would need a release build with a signing key — not required for personal use.
- All face scoring is heuristic / directional. The science citations in-app (Lerner 2014, Pallanch 2015, Swift 2012, etc.) are the references behind each routine.
- localStorage persists: streak, lookmax score, today's plan, intention, and affirmation category.
