# Change Requests

## CR: Free Play internal test, 2026-10-12

Prepared the 23 Sep `main` plus `fix/storeready-play-readiness-20261004` for a free internal-test upload. Paid purchases remain behind `billingEnabled: false`. Added the public deletion-request page and linked it from the app, privacy policy, and face-tools page. The existing-account dialog no longer opens with credit-purchase copy. Water entry rejects out-of-range liters, and encrypted backups accept the Home salt value `mid`. Draft Data safety and health answers are in `docs/PLAY_DATA_SAFETY.md`. The 37 pre-launch checks are dispositioned in `docs/PRELAUNCH_37.md`. Signing instructions stay in `PLAY_STORE.md`. No keystore, deployment, or store submission.

Verified with `npm ci`, `npm run typecheck` (119 files), `npm test` (321/321), `npm run build`, `npm run doctor`, and a headless Chrome pass of the changed screens. `bundleRelease` was not run because the Android SDK is not installed in this environment.

## StoreReady Play audit and fixes — 2026-10-04

Continue `fix/storeready-play-readiness-20261004`, application/test SHA **c87f20b8239c9e41b62ec33b72e0e02081054057**. The later retained task source was recovered: work efebe818 / application bf826193, nine commits ahead of remote main. All 13 remote branches and nine PRs were compared. Read [Play readiness report](PLAY_READINESS_REPORT.md) and [durable evidence](evidence/play-readiness-20261004/source-and-tool-version.json).

Actual StoreReady 2.1.0 at 16e71ad3 ran before/after and remains **BLOCKED**. Verified fixes: Billing 8/compatible Capacitor 7 and Java 21/Kotlin 2 migration; active-entitlement purchase/restore checks; explicit backup/transfer exclusions; current bundled privacy and notification disclosure; distribution-only signing guard; npm advisories 9→0. Release flags remain billingEnabled=false/cloudPhotoRendersEnabled=true, API 36/min API 23.

319/319 Node tests, clean-source frozen install/build, 17/17 completion browser checks and 2/2 external-network-denied policy navigation checks PASS. Debug and release source compilation/resources and release-manifest merge PASS; 221 Gradle tasks. Merged release target 36/Billing 8.0.0; 61 downloaded AARs have no .so. bundleRelease --dry-run correctly rejects absent upload credentials. No signing key or current installable artifact created; prior debug APK is historical bf826193 evidence. Unpublished 10-commit range Gitleaks: no leaks; worktree public/reference-key candidates individually triaged.

Final signed AAB, real Android/16 KB/permission/lifecycle/accessibility/performance acceptance, real billing/OTP/deletion, undeployed lifecycle/scheduler/provider-retention acceptance, exact-artifact Data Safety/privacy/health/listing and account testing/identity gates remain blocked or not run. Browser auth/billing/deletion replies are fixtures. No console change, purchase, deployment, merge or force push; authorized publication is only the non-default fix branch.

## CR: Complete approved missing-feature build, 2026-10-04

Implemented the approved five-task plan in real source: reproducible build/runtime fitting, adaptive local programs and conservative progress, encrypted exported backups/discussion sheets, authenticated lifecycle/scheduler source, and whole-branch acceptance/handoff. Explicit beard selections also repaired. User approved continuous execution without further questions; work remains locally committed and no external deployment/publication/push occurred.

Final application commit bf826193988e91c2edc457b3ab405352594857e2: 312 Node, 17 completion browser and 6 real-model fixture checks pass; PostgreSQL lifecycle acceptance and actual debug APK pass. Seven review findings fixed. [Completion report](COMPLETION_REPORT.md) records all implementations and incomplete roadmap/external release work. No claim that every proposed Pro feature or the public release is finished.

## CR: Build credit-backed Chisel with reasonable pricing and margin, 2026-09-10

Implemented optional account-backed credits, OpenAI Images edits adapter, consumable purchase integration and server receipt settlement, comparison of 2–4 saved looks, and local printable stylist reference export. Keep the existing photo-first near-black/green design. New planned US prices are 10 credits/$3.99, 30/$9.99 and 70/$19.99; Standard edit costs 1 credit, Detail costs 3. Existing-image save/compare/export remains free. Purchased packs do not renew or expire. Pricing is a proposal pending actual store/cost validation, not a profit guarantee.

Applied the wallet migration and deployed two new disabled-by-configuration services. SQL rollback acceptance passed. Exact code/test 4a932d41b5af04f2e52317dcb2946cfac8e599c6 passed 273 Node tests, 33 fixture UI checks and six real unauthenticated endpoint/readiness checks. Screenshot review found and corrected two stale status messages. The existing Frame Fitting workflow remains failed on missing modules; all other checked workflows passed. No photos/keys/payments/emails were sent to test real provider or billing behavior.

Keep draft pending credentials, real output/cost/store/native testing, operational retention/account deletion and earlier release gates. This slice does not complete exercise animations or realistic local hair/glasses. [Full scope](AI_CREDITS_STATUS.md); [preceding change requests](history/2026-09-10-before-credits-CHANGE_REQUESTS.md).
