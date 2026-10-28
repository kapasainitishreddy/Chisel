# Native private-data contract

Status: bounded implementation checkpoint, 2026-10-28. This is a contract for
accurate product behavior and future native vault work. It does not claim that
the current live stores are encrypted.

Current native finding: the repository has a Capacitor 6 Android runtime and a
plain `BridgeActivity`, so a custom Keystore-backed plugin is technically
possible. `MainActivity` registers no custom vault plugin, and there is no
Android Keystore/storage adapter in the source tree. In this execution
environment only the Java runtime is present: `javac`, `gradle`, `adb`, and
Android SDK environment variables are absent. The wrapper pins Gradle 8.11.1;
the previous exact `bash gradlew assembleDebug` attempt failed when the
environment refused the Gradle distribution download. The user explicitly
forbade bypassing that download restriction. Therefore no new native crypto
or migration code can be compiled, instrumented, or device-tested here. A
partial unbuilt Android adapter would not safely migrate current live stores;
the native-vault work remains blocked, not an absent-runtime finding.

## User goal and product scope

The free core serves people who want private, local grooming exploration and
progress notes without an account. Their first successful outcome is being
able to record or explore a look, understand where it is saved, and either make
a recoverable export or delete the device copy with clear scope. No user value
depends on an attractiveness score or appearance-anxiety upsell.

Proposed first-run usability target: in a small, consented formative study, at
least 4 of 5 participants should correctly identify which data is local, which
archive data can be restored, and whether an image edit sends a photo off-device;
all 5 should be able to find the local clear action. This is a target, not a
measured result, and the five-person study is not a population estimate.

The optional paid-value hypothesis is that some users will pay for a clearly
previewed, consent-based AI image edit and a useful saved reference. That
hypothesis is unvalidated: repeat-use, conversion, willingness to pay, realized
provider costs, refunds, and contribution margin have no trustworthy current
baseline. No revenue or pricing result is implied by this contract.

## Current storage inventory

| Data | Current location | Covered by encrypted export | Removed by local clear |
|---|---|---:|---:|
| Scan and progress records, habits, routines and thumbnails | WebView `localStorage` (`chisel:` keys) | Supported records only | Yes |
| Selected original portrait and display rendition | App-origin IndexedDB | No | Yes |
| Saved AI look gallery | App-origin IndexedDB | No | Yes |
| Optional credit session | `sessionStorage` | No | Yes, when the WebView session is cleared |
| Optional account, credit ledger and generated output | Cloud service | No | No; separate account deletion and server retention paths apply |
| Downloaded encrypted archive or shared reports | User-selected destination | Archive itself is encrypted; report is not | No; users manage their exported copies |

The encrypted archive uses AES-256-GCM and a passphrase-derived key. It does not
encrypt active WebView storage and does not contain the selected portrait or
saved AI gallery. A restore validates its schema, requires confirmation, and
replaces only record groups present in that archive. A local clear confirms
device scope, clears namespaced local records and the two IndexedDB galleries,
then reloads only after cleanup succeeds. It cannot revoke a downloaded file,
erase the camera roll original, or delete optional cloud account/transaction
records.

## Native and platform boundary

The Android manifest sets `android:allowBackup="false"`; this is a backup
policy, not application-level encryption. Android's documentation explains
that Android 12+ can still allow device-to-device transfer with this flag.
Do not promise a native private vault until live database/filesystem contents,
WebView storage, temporary images, share/export copies, backups, deletion and
key lifecycle are implemented and tested on supported devices.

A future vault implementation must define an explicit protected-data contract
for each location above; encrypt active stores with per-install keys protected
by Android Keystore; have a recoverable, user-explained export path; lock on
background/timeout without leaking plaintext into logs or crash reports; make
destructive clear transactional and retryable; and test upgrade, reinstall,
device migration, missing/invalidated keys, storage quota failure, photo removal,
account deletion independence and accessibility. PIN/biometric unlock must use
platform authentication APIs and must not be described as encryption by itself.
This checkpoint deliberately leaves the manifest and security configuration
unchanged.

## Threat model and review status

The assets include a selected face photo, derived preview, facial scan records,
optional cloud edit outputs, an account session token, and encrypted exports.
Relevant boundaries are WebView localStorage/IndexedDB, Android app sandbox and
backup/device transfer, JavaScript-to-native bridge, OS photo picker/camera,
user-selected export destinations, and optional provider/account services.
Threats include another local app or person reading an unlocked device, backup
or share-copy leakage, stale tabs blocking deletion, corrupted/tampered restore,
key loss/invalidation, accidental cloud upload, partial provider failure, and
session data surviving a local clear. The current source does not provide
active-store encryption, verified byte-level deletion, native key lifecycle,
or server retention evidence for this checkpoint.

OWASP ASVS/MASVS, WCAG 2.2, NIST AI RMF, app-store policy, and privacy/sector
law applicability are **not reviewed**. This is a risk inventory, not a
compliance mapping or legal conclusion. Geography, age range, retention terms,
provider contracts, store declarations, and legal review remain unverified.

## Success and reliability gates

- First-success measure: a person can create an encrypted backup, unlock it,
  restore selected supported records with confirmation, and distinguish those
  records from the portrait/gallery/cloud account. Instrumentation is not added;
  baseline usage and success rates are unknown until ethical, privacy-reviewed
  measurement or opt-in research exists.
- Reliability gate: tests cover authenticated archive roundtrip, rejection of
  malformed/tampered files, rollback on quota failure, complete local deletion,
  and separate cloud-account deletion semantics. Device acceptance must still
  exercise camera denied/unavailable/busy states, background lock, restore,
  export, deletion, large text and TalkBack on real Android hardware.
- Safety gate: image upload remains optional and separately disclosed; no
  real face data is used for this work; no paid provider, store billing or
  security setting is activated here.

## Primary platform source

- Android Developers, [Backup leaks](https://developer.android.com/privacy-and-security/risks/backup-leaks) (backup controls and Android 12+ device-transfer caveat).
