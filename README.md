# Chisel

Chisel is a local-first Android grooming and style exploration app built with
Capacitor. It offers face and style tools, grooming guidance, saved looks,
progress features, and an optional image studio. It does not present a social
attractiveness ranking or a measure of personal worth. Some face and progress
flows still show private cosmetic measurement scores, whose accuracy and
usefulness require further validation. Analysis is not medical advice.

## Current verified checkpoint

The recovery branch `recovery/chisel-cloud-build-20261004-efebe81` contains a
synthetic-data saved-look lifecycle checkpoint. In the rendered browser journey,
a user can create and save a local look, compare and undo the comparison, reload
the gallery, remove a look, recover from a corrupt record or storage failure,
and delete the source photo while a delayed save is in progress without the
photo reappearing. The test also checks a small viewport, keyboard actions and
reduced-motion behavior.

At source checkpoint `37d72bf7b40caa8c099474e037d7e3ab1e6a68ce`, recorded checks
were:

- `npm test`: 335/335 passed.
- `CHISEL_CHROMIUM_PATH=/usr/bin/chromium npm run test:browser`: 3/3 passed.
- `npm run build`: passed; 46 modules validated.
- Runtime syntax, generated Android asset comparisons and `git diff --check`:
  passed.

These are source and fixture-backed browser results, not native-device or full
product acceptance. The browser fixtures use synthetic images and local test
responses. No real portrait, paid provider request, purchase, or billing action
was used.

## Privacy and release limits

Saved looks and current WebView records are not encrypted at rest by Chisel.
Encrypted archive export does not encrypt live app storage. The Android
Keystore-backed vault and native image migration are not implemented. Android
device behavior, power-loss durability, TalkBack, byte-level deletion,
empirical model accuracy, provider retention, billing, legal/store
applicability, signing, and release readiness remain unverified or blocked.
The pinned Gradle download was refused in the current environment and was not
bypassed. Do not treat this checkpoint as a completed or released app.

## Run locally

```sh
cd chisel-android
npm ci
npm test
npm run build
CHISEL_CHROMIUM_PATH=/path/to/chromium npm run test:browser
```

To prepare the Android project after installing the Android SDK and the pinned
Gradle distribution through an authorized route:

```sh
npx cap sync android
cd android
bash gradlew assembleDebug
```

## Project records

- [Feature and acceptance ledger](docs/FEATURE_LEDGER.csv)
- [Test evidence and limitations](docs/TEST_STATUS.md)
- [Release gates](docs/RELEASE_STATUS.md)
- [Current handoff](docs/AI_HANDOFF.md)
- [Native vault contract](docs/NATIVE_VAULT_CONTRACT.md)
- [User guide](docs/USER_GUIDE.md)

The ledger marks incomplete families and the next acceptance evidence required.
