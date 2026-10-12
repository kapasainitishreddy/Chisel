# Play Data safety draft — free-first internal test

12 October 2026. Paste this into Play Console only after checking it against the AAB you upload. This draft describes the current source: `billingEnabled: false`, `cloudPhotoRendersEnabled: true`, empty RevenueCat public key. It is not a completed console form.

Play's definition of **collect** is data transmitted off the device. Camera frames, scans, routines, sleep/water/salt logs, and photos that stay on the phone are not collected.

## Form answers

| Question | Answer |
|---|---|
| Does the app collect or share any of the required user data types? | **Yes** |
| Is all user data collected by the app encrypted in transit? | **Yes** (HTTPS only; `usesCleartextTraffic` is false) |
| Do you provide a way for users to request that their data be deleted? | **Yes** |
| Does the app allow users to create an account? | **No.** Do not answer yes for this build. |
| Data sold? | **No** |
| Ads? | **No** |
| Independent security review? | **No** |

### Deletion

- In the app: **Clear all my data** removes local Chisel storage, the saved personal photo, and saved looks. Uninstall or clearing app storage does the same. Android backup and device transfer are excluded for the app's storage domains.
- In the app: **Delete cloud account** is for an account that already exists. It does not create an account. The `account-lifecycle` service in this repo is **not deployed**, so this button cannot finish deletion until that deployment is tested.
- Today, cloud deletion requests go to **nittureddy26@gmail.com**.
- Do not enter a web deletion URL, and do not say in-app cloud deletion completes, until Sai deploys and tests `account-lifecycle`. Play's web-deletion rule applies when the app lets people create an account. This build does not.

## Data types to declare

### Photos and videos → Photos

| Field | Answer |
|---|---|
| Collected | Yes |
| Shared | Yes |
| Processed ephemerally | **No** |
| Required / optional | Optional. The app works if the person never uses a cloud edit. |
| Purpose | App functionality |

What actually happens: if the person confirms **Make it photoreal** or a Looks studio generate action, a prepared JPEG is sent to the Chisel Supabase function and then to **Replicate** (`black-forest-labs/flux-kontext-pro` for the style-bar render). Chisel's render function does not write the image bytes into its database. Looks studio stores a hash of the input, job status, and the provider result URL, not the image bytes. Replicate receives the image, and its retention is separate, so this is not ephemeral processing.

The paid OpenAI credit editor cannot start while billing is off. Do not list OpenAI as a recipient for this AAB.

On-device camera analysis, try-on, and progress photos are not this data type. They are not uploaded.

### Device or other IDs

| Field | Answer |
|---|---|
| Collected | Yes |
| Shared | No |
| Processed ephemerally | **No** |
| Required / optional | Optional. The id is sent only with an optional cloud edit. |
| Purposes | App functionality; Fraud prevention, security, and compliance |

The app creates a random id on the device (`chisel:deviceId`, and a separate random id for Looks studio). It is not an advertising ID, IMEI, or MAC address. The cloud request sends it so the server can enforce a daily allowance. The server stores a SHA-256 of that id with the day count, not the raw id in the quota row. The hash is kept for the quota, so the processing is not ephemeral. The id is not sent to Replicate as its own field.

### Email address

| Field | Answer |
|---|---|
| Collected | Yes |
| Shared | No |
| Processed ephemerally | No |
| Required / optional | Optional. Core use does not ask for email. |
| Purpose | Account management |

Collected only if someone chooses **Delete cloud account** and requests an email code for an existing account. The address is sent to Supabase Auth to deliver the code. That sign-in uses `create_user: false` while billing is off. No name, phone, address, or contacts are collected.

## Do not declare for this AAB

- Location, contacts, messages, audio, files from the gallery picker beyond the photo the person chooses to edit, calendar, web browsing, or app interactions/analytics. There is no analytics SDK and no ads SDK.
- Health and fitness info. Sleep hours, water, and salt are typed by the person and stored on the device. They are not transmitted. Declare the features on the Health apps form, not as collected health data here.
- Financial info or purchase history. The Billing 8 / RevenueCat library is in the binary because purchases may be enabled later, and the manifest can include `com.android.vending.BILLING`. This build never configures RevenueCat (`RC_API_KEY` is empty) and the purchase and restore actions refuse to run. No purchase is sent. If Play pre-fills the Billing SDK, leave purchase history unchecked and keep the note that the SDK is not configured.
- Crash logs or diagnostics. No crash reporter is included. Play vitals are Google's, not a developer SDK.

## Security questions

- Data is encrypted in transit with TLS.
- Users cannot be required to provide the optional photo or email.
- Data is not sold.
- Local "Clear all my data" is the deletion control for on-device data. Cloud deletion is email until the account service is deployed and re-tested.
