# Chisel Android app

This directory contains the Capacitor Android shell and the canonical web app
in `www/`. For the current feature checkpoint, privacy boundaries, test
evidence, and open release gates, start with the [repository README](../README.md)
and [feature ledger](../docs/FEATURE_LEDGER.csv).

## Local checks

```sh
npm ci
npm test
npm run build
CHISEL_CHROMIUM_PATH=/path/to/chromium npm run test:browser
```

The browser suite uses synthetic test data; it does not verify Android runtime
behavior. After an authorized Android SDK and the pinned Gradle distribution
are available, sync and build with:

```sh
npx cap sync android
cd android
bash gradlew assembleDebug
```

This project has not passed native acceptance for the current recovery
checkpoint. Do not infer that live WebView storage is encrypted from the
encrypted archive export; the native Keystore vault is still an open gate.
