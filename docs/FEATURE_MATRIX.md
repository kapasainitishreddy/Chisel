# Chisel Feature Matrix

## Credit-backed studio checkpoint, 2026-09-10

| Feature | Implemented and verified | Still required |
|---|---|---|
| AI credit wallet | Server-owned account balance, three pack definitions, atomic reservations, ledger, event/transaction dedupe, once-only refunds, refunded-purchase debt, sandbox isolation | Live Play/RevenueCat integration and financial reconciliation acceptance |
| OpenAI photo edits | Authenticated Images edits adapter, original-input preparation and byte/pixel limits, fixed presets and modes, no automatic paid retries, owner-bound private result retrieval | Real credentials, actual output fidelity/cost review; production renders OFF |
| Credit UI | Credits balance control, optional email-code account, actual native-store product/purchase calls, localized price requirement, explicit quote/provider consent, disabled sales state | Real OTP delivery, native billing, session and phone tests |
| Compare & decide | Two to four saved looks from the same source photo, no new AI request | Broader phone/large-text/accessibility acceptance |
| Stylist reference | Original + labelled AI reference + maintenance preference + escaped notes; local printable HTML download/share | Native sharing and end-user review; not a clinical report or exact haircut prescription |
| Privacy | Free local experience retained; paid account/ledger and private server outputs documented | Account-deletion flow, scheduled output cleanup and production review |
| Pricing | Proposed US packs: 10/$3.99, 30/$9.99, 70/$19.99; Standard 1, Detail 3; no recurring pack or credit expiry | Actual store products and measured contribution margin; no profit guarantee |

Revision 4a932d41b5af04f2e52317dcb2946cfac8e599c6: 273/273 Node, 33/33 browser and 6/6 real endpoint guard checks. Browser auth/store/provider output are fixtures. The SQL migration and separate endpoints are deployed, but both environments remain disabled for sales/rendering and contain zero accounts/receipts/jobs/ledger entries. No real photoreal output, native build or installation is implied.

[Previous feature matrix](history/2026-09-10-before-credits-FEATURE_MATRIX.md) preserves the full existing photo, trainer, skin, hair, makeup, posture and release boundaries. Local hair/glasses rendering and skin accuracy are not upgraded by these credit features. Instructional animation remains unfinished; the earlier Frame Fitting workflow is failing on missing modules. See [current evidence](AI_CREDITS_STATUS.md).
