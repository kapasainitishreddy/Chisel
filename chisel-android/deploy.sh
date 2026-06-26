#!/usr/bin/env bash
# Chisel - One-click install to your phone (macOS / Linux)
set -e
BOLD="\033[1m"; GOLD="\033[38;5;179m"; RESET="\033[0m"
echo -e "${GOLD}====================================================${RESET}"
echo -e "${BOLD}    CHISEL  -  Sculpt your best self${RESET}"
echo -e "${GOLD}    One-click Android install over USB${RESET}"
echo -e "${GOLD}====================================================${RESET}"
echo

# 1. Sanity
command -v node >/dev/null 2>&1 || { echo "[X] Node.js missing. Install from https://nodejs.org"; exit 1; }
command -v adb >/dev/null 2>&1 || { echo "[X] adb missing. Install platform-tools: brew install android-platform-tools"; exit 1; }

# 2. Device
echo "[*] Checking for your phone over USB..."
if ! adb devices | grep -E "device$" >/dev/null; then
  echo "[!] No device found. Plug in, set USB mode to MTP, allow USB debugging, then re-run."
  adb devices
  exit 1
fi
echo "[OK] Phone detected:"
adb devices
echo

# 3. Install deps
echo "[*] Installing Capacitor dependencies..."
npm install --no-audit --no-fund

# 4. Add Android platform if missing
if [ ! -d "android" ]; then
  echo "[*] Adding Android platform..."
  npx cap add android
fi

# 5. Sync
echo "[*] Syncing web assets..."
npx cap sync android

# 6. Build
echo "[*] Building debug APK..."
( cd android && ./gradlew assembleDebug --no-daemon )

# 7. Install
APK="android/app/build/outputs/apk/debug/app-debug.apk"
[ -f "$APK" ] || { echo "[X] APK not found at $APK"; exit 1; }
echo "[*] Installing Chisel..."
adb install -r "$APK"

# 8. Launch
echo "[*] Launching Chisel..."
adb shell monkey -p com.chisel.lookmax -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1 || true

echo
echo -e "${GOLD}====================================================${RESET}"
echo -e "${BOLD}    CHISEL INSTALLED. Open it from your launcher.${RESET}"
echo -e "${GOLD}====================================================${RESET}"
