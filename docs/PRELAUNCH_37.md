# 37 pre-launch checks — Chisel free internal test

Source checklist: the attached "37 Pre-Launch Checks" (web-product template). Applied only where it changes this Android app or its public pages. A web SaaS item that would add tracking, email infrastructure, or a payment provider this app does not use is recorded as not applied, with the reason.

Status values: **Applied**, **Already true**, **Not this product**, **Sai**. Nothing was submitted to Play or deployed.

| # | Check | Status | What was done |
|---|---|---|---|
| 1 | Turn on RLS | Already true | Migrations enable row level security and revoke anon/authenticated access on render, entitlement, credit, looks, and account-deletion tables. Service role remains the server path. Live database policies were not re-queried in this session. |
| 2 | Enforce login and paywall on the server | Already true | `billingEnabled` is false. Credit sales require server `sales_enabled`, and that flag is documented off. A purchase callback cannot mint credits. Do not turn billing on until RevenueCat and deployed account deletion are accepted. |
| 3 | `/.env` shows nothing | Applied | No `.env` is in `chisel-android/www`. A release test fails if one appears. The app is not a public site that serves the repository root. |
| 4 | Remove secret keys from the frontend | Already true | Client holds the Supabase publishable key and an empty RevenueCat public key. Service-role, Replicate, OpenAI, and webhook secrets are not in the app. CI still greps for private-key patterns. |
| 5 | Force HTTPS | Already true | `usesCleartextTraffic` is false. The release config only accepts an `https://*.supabase.co` origin for account calls. Certificate renewal for a future public domain is Sai's. |
| 6 | Rate-limit expensive AI endpoints | Already true | Photoreal uses a per-identity daily allowance and a global daily budget, and returns 429 when either is exhausted. Credit rendering stays off with sales. |
| 7 | SPF, DKIM, DMARC | Not this product | This release does not send marketing or signup mail. Required before any live email-code login. |
| 8 | Transactional emails | Not this product | No signup email in this build. Existing-account codes would be Supabase Auth mail, which is not turned on for a new user. |
| 9 | Send yourself a signup email | Sai | Do this only after you intentionally enable account creation. |
| 10 | Send app email from a subdomain | Sai | Same gate as 7–9. |
| 11 | mail-tester score | Not this product | No app mail in this release. |
| 12 | Open Graph image | Partial | `index.html` and `tools.html` now have titles, descriptions, and `og:title` / `og:description`. There is no 1200×630 share image. Add one only if you host a public site. Not required for the Play AAB. |
| 13 | Sitemap in Search Console | Not this product | No public marketing domain is configured. |
| 14 | Do not block Google | Applied | `chisel-android/www/robots.txt` allows all crawlers. It does not disallow `/`. |
| 15 | Title and description on public pages | Applied | App shell and the face-tools page have a title and a meta description. Policy and deletion pages have titles. |
| 16 | Remove localhost and staging leftovers | Applied | The only `localhost` check is the secure-context test for local development of the camera. The face-tools "Get Chisel" control no longer points at `href="#"`. It opens `index.html`. |
| 17 | App on a subdomain, marketing on the apex | Not this product | No domain is attached. |
| 18 | robots.txt and llms.txt | Applied for robots | `www/robots.txt` is allow-all. `llms.txt` was not added. There is no public corpus to describe. |
| 19 | PageSpeed Insights | Sai | Needs a public URL. The Android app is a local WebView, not a hosted landing page. |
| 20 | Compress images | Already true | The only raster shipped in `www/` is `chisel-trainer-sculpture.webp` (about 47 KB). |
| 21 | Fix layout jump while loading | Partial | Fonts are preconnected. A full layout-shift pass on a phone is still Sai's, on the signed build. |
| 22 | Remove unused libraries | Not changed | RevenueCat stays in the project because the disabled paywall calls it. Removing it would be a separate native change, not a free-launch requirement. |
| 23 | Install analytics | Not this product | Chisel ships with no analytics SDK on purpose. Do not add one for this launch. |
| 24 | Track web vitals | Not this product | That would be a new tracker. Declined for the same reason. |
| 25 | Basic bot protection | Already true | Render quota plus origin checks on the account and credit functions. No public signup form to abuse in this build. |
| 26 | Conversion funnel | Not this product | No analytics, and this release does not sell anything. |
| 27 | Error tracking | Not this product | No third-party crash SDK, by the same privacy rule. Android vitals in Play Console are available after you upload, without adding a vendor SDK. |
| 28 | Session recordings | Not this product | Would record faces. Do not add this. |
| 29 | Terms and privacy policy | Already true | `docs/privacy-policy.html` and `docs/terms-of-use.html` are committed. The app links the bundled privacy page and the terms URL. The deletion page is now linked beside them. |
| 30 | Merchant of record | Sai, later | This AAB sells nothing. When billing is enabled, Google Play is the merchant of record for Play Billing. There is no Stripe account. |
| 31 | Cookie banner | Not this product | No tracking cookies and no analytics. A banner would be a false disclosure. |
| 32 | Stripe webhooks in live mode | Not this product | Payments, if ever enabled, are Google Play through RevenueCat. Those webhooks stay unwired until billing is a deliberate later release. |
| 33 | Second browser and desktop | Partial | The web shell can be opened in a desktop browser. A second-browser pass of the signed Android build is Sai's. |
| 34 | Core flow on a phone | Sai | Camera, scan, try-on, and notifications need a real device and the internal-test install. |
| 35 | Click every link and button | Partial | Dead store link on the tools page was fixed. Privacy, terms, and deletion links resolve to real pages. Full button coverage on device is Sai's. |
| 36 | Try to break forms | Applied in the browser | Empty and invalid emails are blocked on the existing-account form. Sleep outside 0–14 hours is rejected. Water outside 0–8 liters is rejected and is not stored. Salt `mid` from the Home control can be restored from an encrypted backup. Hostile input on a physical phone is still Sai's. |
| 37 | 404 page | Applied | `chisel-android/www/404.html` is the static not-found page. Inside the app, an unknown hash route returns to Home. |

## Sai's remaining checklist

Do these yourself. This session did not create a keystore, upload an AAB, open Play Console, deploy functions, or spend money.

1. Create `chisel-android/android/chisel-upload.jks` and gitignored `keystore.properties`. Keep the passwords. Steps are in `docs/PLAY_DATA_SAFETY.md`.
2. Run `npx cap sync android` and `./gradlew bundleRelease` (or `gradlew.bat` on Windows). Upload that AAB only to **Internal testing**.
3. Re-read `docs/PLAY_DATA_SAFETY.md` against that AAB, then fill Data safety, health, content rating, ads (no), target audience (17+), and app access (no login required for this build).
4. Set the privacy policy URL to `https://github.com/kapasainitishreddy/Chisel/blob/main/docs/privacy-policy.html` after this branch is on `main`, and confirm it opens in a private window.
5. If Play asks for an account-deletion URL before you allow account creation, use `https://github.com/kapasainitishreddy/Chisel/blob/main/docs/account-deletion.html` and say that this version does not let users create an account.
6. Add yourself as an internal tester, install from the opt-in link, and walk camera permission, a scan, try-on, Clear all my data, offline launch, and notifications.
7. Leave `billingEnabled` false until you have created the Play products, set the RevenueCat public SDK key, pointed the webhook at `rc-webhook`, deployed `account-lifecycle` and `output-cleanup`, installed the cleanup schedule, and deleted a real test account from the phone and from the web request.
8. Leave cloud photo editing as a separate decision. It is on in source. If the internal-test build should be strictly on-device, set `cloudPhotoRendersEnabled` to `false` and then change the Data safety photo answers before you upload.
9. New personal Play accounts created after 13 November 2023 need a closed test with 12 testers for 14 continuous days before production. Internal testing alone does not unlock production.
10. Store listing assets are still yours: 512×512 icon, 1024×500 feature graphic, and phone screenshots of this build.
11. Confirm the contact inbox `nittureddy26@gmail.com` is monitored before you publish the deletion page URL.
12. Do not commit the keystore, `keystore.properties`, or any service-role key.
