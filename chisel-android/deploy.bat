@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title Chisel - One-click install to your phone

echo.
echo  ====================================================
echo     CHISEL  -  Sculpt your best self
echo     One-click Android install over USB
echo  ====================================================
echo.

REM --- 1. Sanity checks ---
where node >nul 2>nul
if errorlevel 1 goto NONODE
where adb >nul 2>nul
if errorlevel 1 goto FINDADB
set "ADB=adb"
goto HAVEDEVICE

:FINDADB
set "ADB=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"
if not exist "%ADB%" (
  echo  [X] adb not found. Install Android Studio or platform-tools and re-run.
  pause
  exit /b 1
)
goto HAVEDEVICE

:NONODE
echo  [X] Node.js not found. Install LTS from https://nodejs.org and re-run.
pause
exit /b 1

:HAVEDEVICE

REM --- 2. Device check ---
echo  [STEP] Checking for your phone over USB...
%ADB% devices
%ADB% devices | findstr /R "device$" >nul
if errorlevel 1 goto NODEVICE
echo  [OK] Phone detected.
echo.

REM --- 3. Install JS deps ---
echo  [STEP] Installing Capacitor dependencies, first run takes 1-2 minutes...
call npm install --no-audit --no-fund
if errorlevel 1 goto NPMFAIL
echo  [OK] Dependencies installed.
echo.

REM --- 4. Add Android platform if missing ---
if exist "android" goto HAVEANDROID
echo  [STEP] Adding Android platform, first run takes 2-3 minutes...
call npx cap add android
if errorlevel 1 goto CAPFAIL
echo  [OK] Android platform added.
goto SYNC

:CAPFAIL
echo  [X] Failed to add Android platform.
pause
exit /b 1

:HAVEANDROID

REM --- 5. Sync web assets ---
:SYNC
echo  [STEP] Syncing web assets to Android...
call npx cap sync android
if errorlevel 1 goto SYNCFAIL
echo  [OK] Assets synced.
echo.

REM --- 6. Build APK ---
echo  [STEP] Building debug APK, this takes 3-5 minutes the first time...
cd android
call gradlew assembleDebug --no-daemon
if errorlevel 1 goto GRADLEFAIL
cd ..
echo  [OK] APK built.
echo.

REM --- 7. Install APK to phone ---
set "APK=android\app\build\outputs\apk\debug\app-debug.apk"
if not exist "%APK%" goto NOAPK
echo  [STEP] Installing Chisel to your phone...
%ADB% install -r "%APK%"
if errorlevel 1 goto INSTALLFAIL
echo  [OK] Installed.
echo.

REM --- 8. Launch app ---
echo  [STEP] Launching Chisel...
%ADB% shell monkey -p com.chisel.lookmax -c android.intent.category.LAUNCHER 1 >nul 2>nul
echo  [OK] Launched.
echo.

echo  ====================================================
echo     CHISEL INSTALLED
echo     Open it from your phone's launcher. Look for
echo     the gold C icon. Grant camera access on first
echo     open and start chiseling.
echo  ====================================================
echo.
pause
exit /b 0

:NODEVICE
echo.
echo  [!] No device found. Please:
echo      1. Plug your phone into this PC with a USB cable
echo      2. On the phone, pull down the notification shade
echo      3. Tap the USB notification and choose File transfer / MTP
echo      4. Confirm Allow USB debugging if it pops up
echo      5. Re-run this script
echo.
pause
exit /b 1

:NPMFAIL
echo  [X] npm install failed. Check your internet connection.
pause
exit /b 1

:SYNCFAIL
echo  [X] cap sync failed.
pause
exit /b 1

:GRADLEFAIL
echo.
echo  [X] Gradle build failed.
echo      Common fix - install Android SDK and accept licenses:
echo        set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
echo        "%LOCALAPPDATA%\Android\Sdk\cmdline-tools\latest\bin\sdkmanager" --licenses
echo      Then re-run this script.
echo.
pause
exit /b 1

:NOAPK
echo  [X] APK not found at %APK%
pause
exit /b 1

:INSTALLFAIL
echo  [X] adb install failed. Make sure the phone is unlocked and tap Allow on the USB prompt.
pause
exit /b 1
