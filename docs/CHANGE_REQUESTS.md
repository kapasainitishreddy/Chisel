# Change Requests

## CR: Build credit-backed Chisel with reasonable pricing and margin, 2026-09-10

Implemented optional account-backed credits, OpenAI Images edits adapter, consumable purchase integration and server receipt settlement, comparison of 2–4 saved looks, and local printable stylist reference export. Keep the existing photo-first near-black/green design. New planned US prices are 10 credits/$3.99, 30/$9.99 and 70/$19.99; Standard edit costs 1 credit, Detail costs 3. Existing-image save/compare/export remains free. Purchased packs do not renew or expire. Pricing is a proposal pending actual store/cost validation, not a profit guarantee.

Applied the wallet migration and deployed two new disabled-by-configuration services. SQL rollback acceptance passed. Exact code/test 4a932d41b5af04f2e52317dcb2946cfac8e599c6 passed 273 Node tests, 33 fixture UI checks and six real unauthenticated endpoint/readiness checks. Screenshot review found and corrected two stale status messages. The existing Frame Fitting workflow remains failed on missing modules; all other checked workflows passed. No photos/keys/payments/emails were sent to test real provider or billing behavior.

Keep draft pending credentials, real output/cost/store/native testing, operational retention/account deletion and earlier release gates. This slice does not complete exercise animations or realistic local hair/glasses. [Full scope](AI_CREDITS_STATUS.md); [preceding change requests](history/2026-09-10-before-credits-CHANGE_REQUESTS.md).
