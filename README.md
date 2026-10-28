# Chisel

Chisel is a local-first Android grooming and style exploration app built with
Capacitor. It includes face and style tools, grooming guidance, saved looks,
progress features, and an optional image studio. It does not present a social
attractiveness ranking or a measure of personal worth. Some face and progress
flows still show private cosmetic measurement scores; their accuracy and
usefulness need further validation. Analysis is not medical advice.

## Main source checkpoint

The implementation and test checkpoint is on `main` at
`dd8189408859cd2c4b9cd33bd425a9c54b5f3947`.

The local saved-look flow supports create/save, comparison and undo, reload,
single-look removal, corrupt-record recovery, and cancellation of a delayed
save after its source photo is removed. Settings now offer system, light, and
dark appearance choices. The preference stays on-device; the bundled Public
Sans font includes its SIL Open Font License. The Android runtime dependencies
are aligned to Capacitor 7.6.9 and its 7.x plugins.

## Checks run on this source

- `npm audit --omit=dev --audit-level=high`: **0 vulnerabilities**.
- `npm run build`: **passed**, 47 modules validated.
- `npm test`: **351/351 passed**, sequential Node test execution; Capacitor
  sync completed and Android plugins resolved to their 7.x versions.
- `CHISEL_CHROMIUM_PATH=/usr/bin/chromium npm run test:browser`: **4/4 passed**.
  These local journeys use synthetic images and stubbed service responses.
- Main-source syntax checks, the repository's obvious-secret scan, and
  `git diff --check`: **passed**.

The tests include a rendered theme journey for light/dark/system persistence,
contrast-token checks, keyboard focus, reduced motion, storage denial, and the
saved-photo/archive recovery flows. Settings and the photoreal action state
that Make it photoreal sends a live camera still to the backend and Replicate,
that Retry sends another frame, and that the selected-photo studio has a
separate confirmation. GitHub Actions first found two browser-test assumptions
on CI: the first-run identity dialog could return after reload, and the gallery
test read failure text before the retry control was mounted. Tests now seed a
synthetic identity and deterministically reject the gallery read until its
retry UI is ready. The corrected main run passed; earlier failed runs are
recorded in [test status](docs/TEST_STATUS.md).

## Privacy and release limits

Live WebView records and saved looks are not encrypted at rest. Encrypted
archive export does not encrypt live app storage. Android cloud/device-transfer
backup exclusions do not create a private vault. The Android Keystore-backed
vault, native image migration, and byte-level deletion are not implemented.
Native Android compilation, device behavior, TalkBack, power-loss durability,
empirical model accuracy, provider retention, billing, legal/store
applicability, signing, and release readiness remain unverified or blocked.
The pinned Gradle 8.11.1 download was refused in the prior environment and was
not retried or bypassed. No real photos, paid API calls, billing activation,
deployment, or publication were used.

## Run locally

```sh
cd chisel-android
npm ci
npm test
npm run build
CHISEL_CHROMIUM_PATH=/path/to/chromium npm run test:browser
```

The current Capacitor 7 Android project uses JDK 21. After an authorized
Android SDK and the pinned Gradle distribution are available, prepare and
compile it with:

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
