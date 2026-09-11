# Chisel Feature Matrix

> **2026-09-10 reliability update:** See [Accuracy and realism status](ACCURACY_RELIABILITY.md). The current local suite has 184 passing tests; CI status must be read from the exact-head run. Trainer holds now require fresh frames and neutral release, guided repetitions are separate, skin/Precision checks reject unusable data, and cloud try-on uses uncropped input with explicit consent. These are software safeguards, not empirical accuracy or realism certification. Prior physical-device evidence below does not validate the new thresholds.

_Last updated: 2026-09-10_

Status legend:

- **Automated verified** — source/syntax/behavior or integration is covered by the current test suite.
- **Rendered verified** — the current browser interaction QA rendered and exercised the user-facing surface.
- **Build verified** — Android CI compiles the packaged app on the configured SDK/Gradle stack.
- **Implemented, device validation required** — real camera/audio/Web Share/MediaPipe behavior still needs representative Android-device QA.
- **Configuration pending** — implementation seam exists but production credentials/product/dashboard configuration is still required.
- **Partial / illustrative** — intentionally not presented as a fully predictive or production-backed result.

> Chisel does not treat automated software tests as proof of medical, laboratory, anthropometric, dental, dermatology, body-composition, or appearance-change accuracy. Camera-derived measurements and skin signals are photographic estimates and within-user tracking signals.

| ID | Feature | Current status | User value / remaining gate |
|---|---|---|---|
| FM-01 | Main mobile shell + navigation | Automated + physical-device verified | Five primary glyph-and-label tabs fit directly above Samsung system navigation; Settings is a Home action and no native UI injection can overlay controls |
| FM-02 | First-run concierge | Automated verified; device QA required | Explains privacy, confidence and baseline flow before camera use |
| FM-03 | Camera prominent disclosure | Implemented; device QA required | Camera purpose shown before use |
| FM-04 | Quick face scan | Automated + single-device flow verified; accuracy QA required | Jaw-first on-device photographic estimates with visible primary action and quality context |
| FM-05 | Deep face scan | Implemented; device accuracy QA required | Larger frame pool for stronger normal baseline |
| FM-06 | Precision Face & Skin | Automated verified; device accuracy QA required | 7–12 matched-photo consensus, outlier rejection, uncertainty |
| FM-07 | Precision capture-quality gate | Automated verified | Fails closed on poor capture rather than forcing a result |
| FM-08 | Actionable retry guidance | Automated verified | Lighting, blur, distance, head angle, glare, segmentation, limbs, occlusion guidance |
| FM-09 | Precision Condition Match | Automated verified | Checks camera/framing/light and optional method/view/orientation/distance metadata |
| FM-10 | Uncertainty-aware progress | Automated verified | Meaningful change must exceed combined measurement uncertainty |
| FM-11 | Face structure / symmetry proxies | Automated + single-device rendering verified; accuracy QA required | Jaw/cheek/symmetry-first hierarchy and tracking language, not attractiveness ranking |
| FM-12 | Cheekbone / mid-face metrics | Implemented; device accuracy QA required | Photographic proportion tracking |
| FM-13 | Jaw metrics / gonial angle | Automated + physical overlay verified; accuracy QA required | High-contrast jaw contour plus photographic geometry, not bone-change prediction |
| FM-14 | Profile-angle tools | Implemented; device accuracy QA required | Nasofrontal/nasolabial/mento/chin-related photographic angles |
| FM-15 | Regional skin appearance analysis | Automated + rendered verified; device/color QA required | On-device forehead/left-cheek/right-cheek/chin sampling with redness appearance, visible shine, texture variation, pore-visibility proxy, blemish-like contrast and pigment-unevenness signals plus capture confidence |
| FM-16 | Teeth-region brightness | Implemented; device/color QA required | Within-user photographic trend, not dental shade/health diagnosis |
| FM-17 | Lips / eye spacing / canthal / brow metrics | Implemented; device accuracy QA required | Neutral photographic ratios/angles |
| FM-18 | Facial fullness/bloat proxy | Implemented; device QA required | Trend context only; not fluid-retention diagnosis |
| FM-19 | Expression Calibration | Automated verified; device QA required | Neutral/open-mouth remapping to reduce expression-driven geometry error |
| FM-20 | Skin Recovery + Appearance Lab | Automated + rendered verified; device/color QA required | Local photo quality gate, regional cosmetic signals, What I see → What to do → Compare next hierarchy, conservative AM/PM direction and professional-escalation language without diagnosis |
| FM-21 | Lips & Color Lab | Automated verified; device/color QA required | Local shade matching, sampling and stain preview |
| FM-22 | Neck Care Lab | Automated verified; device QA required | Visible skin/posture/shaving context without diagnosis |
| FM-23 | Body & Waist Lab | Automated verified; device accuracy QA required | Pose + silhouette ratios and bounded illustrative preview |
| FM-24 | Precision Body / front+side fusion | Automated verified; device accuracy QA required | Multi-photo front/side consensus and segmentation quality gates |
| FM-25 | Optional waist tape calibration | Automated verified; device workflow QA required | Converts personal photo trend to a relative calibrated waist trend |
| FM-26 | Posture analysis | Implemented; device accuracy QA required | Pose/CVA/neck-angle photographic proxies |
| FM-27 | Unisex Face & Neck Trainer v2 | Automated + rendered verified; prior AR camera path physically verified; new-session device acceptance required | Goal-based jaw/chin posture, cheek activation, chin/neck support, face/jaw release, full-face and Face Yoga sessions; 0–100 form score where landmarks can verify form, guided labels where they cannot, form-gated holds, phase rail, clean-rep tracking, evidence grades and no adult-bone reshaping or spot-fat-loss claims |
| FM-28 | Grooming cards + evidence direction | Implemented | Controllable grooming actions and optional shopping links |
| FM-29 | Today's plan + check-off | Implemented | Local routine and adherence tracking |
| FM-30 | 30-day programs | Implemented | Structured local improvement programs |
| FM-31 | Hydration/sodium context | Implemented | Adds context to fullness/bloat tracking |
| FM-32 | Local reminders | Configuration/device QA pending | Local Notifications dependency is declared; Android permission/scheduling must be release-tested |
| FM-33 | Hair/facial-hair local try-on | Automated + rendered + physical-device layout verified; realism QA required | Inclusive deterministic facial-hair rendering, unisex style-family presentation (Short/structured, Long/layered, Facial hair, Makeup/color), and a fitted scrollable phone control grid above system navigation |
| FM-34 | Eyewear try-on | Implemented; device QA required | Landmark-positioned eyewear concepts |
| FM-35 | Makeup try-on + custom routine | Implemented; device QA required | Local style overlay and saved routine |
| FM-36 | Makeup suggestor | Implemented; device QA required | Undertone/shape-aware style guidance with evidence context |
| FM-37 | Makeup coach | Implemented; device QA required | Non-numeric application guidance |
| FM-38 | Makeup look gallery | Implemented; device QA required | Local saved-look history |
| FM-39 | Photo tracker + before/after slider | Implemented; device QA required | Local visual history and comparison |
| FM-40 | Best-photo picker | Implemented; device QA required | Image-quality selection rather than attractiveness ranking |
| FM-41 | Identity personalization | Implemented | Optional male/female/non-binary/custom personalization where relevant; measurements remain the same and trainer/skin/style access is not gender-restricted |
| FM-42 | Affirmations + mirror | Implemented | Daily mindset/affirmation experience |
| FM-43 | Meditation / visualization | Implemented; device audio QA required | Orb, scripts, TTS/audio where available |
| FM-44 | Streaks / freeze / badges | Implemented | Rewards routine consistency rather than compulsive scanning |
| FM-45 | Shareable progress card | Implemented; Android share QA required | Progress-oriented sharing without public beauty score |
| FM-46 | Barber/skincare discussion export | Implemented; Android share QA required | Discussion brief with scan/style context |
| FM-47 | Local data deletion | Implemented | Clears local Chisel data from inside the app |
| FM-48 | Privacy policy page | Implemented | Must be hosted and linked in Play Console |
| FM-49 | Photoreal hair/beard render | Client/server source present; production config/live QA pending | Optional cloud render with separate privacy/data-safety implications; HairFastGAN and other OSS engines remain integration candidates, not bundled production weights |
| FM-50 | Future-you preview | Partial / illustrative | Current local visualization is not a guaranteed prediction |
| FM-51 | Paywall UI + purchase/restore seam | Implemented; production config pending | Requires Play products + RevenueCat key/entitlement + live billing QA |
| FM-52 | Server entitlement enforcement | Partial / deploy pending | Supabase function source exists; production deployment/config required |
| FM-53 | Premium Pro product definition | Product spec committed | Precision Lab Pro, Progress Intelligence, Adaptive Protocols, Looks Studio Pro, Professional Export, Private Vault Plus |
| FM-54 | Automated tests / CI | Local automated verified; exact-head CI required | 184/184 local Node tests for the reliability update. Exact-head CI/browser results must be checked separately; the prior 160-test snapshot and its rendered QA are historical |
| FM-55 | Capacitor Android sync integrity | Automated verified | Canonical `www` app/feature assets are checked byte-for-byte against packaged Android copies, including trainer and skin-appearance runtimes |
| FM-56 | Android release signing config | Implemented | Real upload keystore/passwords remain developer-owned and gitignored |
| FM-57 | Android API 36 target | Configured; build CI gate | compile/target 36, AGP 8.10, Gradle 8.11.1 |
| FM-58 | Android privacy hardening | Configured | Broad OS backup disabled; cleartext HTTP disabled |
| FM-59 | Play Store listing/policy work | Manual/config pending | Store graphics, hosted policy URL, Data Safety/content/health declarations, testing tracks |
| FM-60 | iOS | Deferred | Android-first release; iOS remains a separate platform project |

## Product truth

The canonical `www/index.html` is the only active app shell. Legacy Labs,
Precision and Premium shell assets may remain in source for parity/history, but
the Android activity must not inject them over the canonical UI.

The September 2026 trainer/skin upgrade extends the existing shell rather than adding a parallel app. The Face & Neck Trainer reuses the existing AR coach and separates **camera-verified form** from **guided movement** so the UI does not imply the camera can measure muscle growth, fat loss or bone change. The Skin Appearance Lab performs its normal photo analysis locally and saves numeric history only; it rejects weak face/exposure conditions rather than forcing results.

Chisel is feature-complete enough for a serious Android release candidate. The remaining distinction is **software implementation versus empirical device validation**: camera/MediaPipe features must still be tested across representative phones, lighting, skin tones, facial hair/glasses, body framing and repeated same-condition captures before describing their numeric accuracy more strongly than photographic estimates. The new trainer sessions and skin-appearance photo workflow also require physical-device acceptance before this branch should be merged for release.

The broader open-source integration plan is documented in `OSS_INTEGRATION_PLAN.md`. HairFastGAN, OpenMakeupSDK/PSGAN, face parsing/matting and other external engines are approved integration candidates, but their code/model weights are not described as production-bundled until their dependency and weight licenses plus runtime infrastructure are separately verified.

See `USER_GUIDE.md` for the end-user flow, `PREMIUM_FEATURES.md` for the Free/Pro boundary, and `PLAY_STORE.md` for publishing steps.