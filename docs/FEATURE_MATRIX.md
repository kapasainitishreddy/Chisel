# Chisel Feature Matrix

_Last updated: 2026-08-09_

Status legend:

- **Automated verified** — source/syntax/behavior or integration is covered by the current test suite.
- **Build verified** — Android CI compiles the packaged app on the configured SDK/Gradle stack.
- **Implemented, device validation required** — real camera/audio/Web Share/MediaPipe behavior still needs representative Android-device QA.
- **Configuration pending** — implementation seam exists but production credentials/product/dashboard configuration is still required.
- **Partial / illustrative** — intentionally not presented as a fully predictive or production-backed result.

> Chisel does not treat automated software tests as proof of medical, laboratory, anthropometric, dental, dermatology, or body-composition accuracy. Camera-derived measurements are photographic estimates and within-user tracking signals.

| ID | Feature | Current status | User value / remaining gate |
|---|---|---|---|
| FM-01 | Main mobile shell + navigation | Automated + physical-device verified | Canonical onyx/gold UI with six glyph-and-label tabs; no native UI injection can overlay controls |
| FM-02 | First-run concierge | Automated verified; device QA required | Explains privacy, confidence and baseline flow before camera use |
| FM-03 | Camera prominent disclosure | Implemented; device QA required | Camera purpose shown before use |
| FM-04 | Quick face scan | Implemented; device accuracy QA required | Fast on-device photographic appearance measurements |
| FM-05 | Deep face scan | Implemented; device accuracy QA required | Larger frame pool for stronger normal baseline |
| FM-06 | Precision Face & Skin | Automated verified; device accuracy QA required | 7–12 matched-photo consensus, outlier rejection, uncertainty |
| FM-07 | Precision capture-quality gate | Automated verified | Fails closed on poor capture rather than forcing a result |
| FM-08 | Actionable retry guidance | Automated verified | Lighting, blur, distance, head angle, glare, segmentation, limbs, occlusion guidance |
| FM-09 | Precision Condition Match | Automated verified | Checks camera/framing/light and optional method/view/orientation/distance metadata |
| FM-10 | Uncertainty-aware progress | Automated verified | Meaningful change must exceed combined measurement uncertainty |
| FM-11 | Face structure / symmetry proxies | Implemented; device accuracy QA required | Neutral ratios/geometry, not attractiveness ranking |
| FM-12 | Cheekbone / mid-face metrics | Implemented; device accuracy QA required | Photographic proportion tracking |
| FM-13 | Jaw metrics / gonial angle | Implemented; device accuracy QA required | Photographic geometry, not bone-change prediction |
| FM-14 | Profile-angle tools | Implemented; device accuracy QA required | Nasofrontal/nasolabial/mento/chin-related photographic angles |
| FM-15 | Skin appearance analysis | Implemented; device/color QA required | Visible undertone/ITA, evenness, redness, blemish and under-eye estimates |
| FM-16 | Teeth-region brightness | Implemented; device/color QA required | Within-user photographic trend, not dental shade/health diagnosis |
| FM-17 | Lips / eye spacing / canthal / brow metrics | Implemented; device accuracy QA required | Neutral photographic ratios/angles |
| FM-18 | Facial fullness/bloat proxy | Implemented; device QA required | Trend context only; not fluid-retention diagnosis |
| FM-19 | Expression Calibration | Automated verified; device QA required | Neutral/open-mouth remapping to reduce expression-driven geometry error |
| FM-20 | Skin Recovery Lab | Automated verified; device QA required | Conservative routine direction and professional-escalation language |
| FM-21 | Lips & Color Lab | Automated verified; device/color QA required | Local shade matching, sampling and stain preview |
| FM-22 | Neck Care Lab | Automated verified; device QA required | Visible skin/posture/shaving context without diagnosis |
| FM-23 | Body & Waist Lab | Automated verified; device accuracy QA required | Pose + silhouette ratios and bounded illustrative preview |
| FM-24 | Precision Body / front+side fusion | Automated verified; device accuracy QA required | Multi-photo front/side consensus and segmentation quality gates |
| FM-25 | Optional waist tape calibration | Automated verified; device workflow QA required | Converts personal photo trend to a relative calibrated waist trend |
| FM-26 | Posture analysis | Implemented; device accuracy QA required | Pose/CVA/neck-angle photographic proxies |
| FM-27 | AR jaw + cheek coach | Automated + physical-device verified | Jawline posture, cheek lift and full-face sessions with face-anchored AR guides, form-gated holds, local completion tracking, explicit evidence grades and no adult-bone reshaping claims |
| FM-28 | Grooming cards + evidence direction | Implemented | Controllable grooming actions and optional shopping links |
| FM-29 | Today's plan + check-off | Implemented | Local routine and adherence tracking |
| FM-30 | 30-day programs | Implemented | Structured local improvement programs |
| FM-31 | Hydration/sodium context | Implemented | Adds context to fullness/bloat tracking |
| FM-32 | Local reminders | Configuration/device QA pending | Local Notifications dependency is declared; Android permission/scheduling must be release-tested |
| FM-33 | Hair/beard local try-on | Implemented; device QA required | Landmark-based style exploration |
| FM-34 | Eyewear try-on | Implemented; device QA required | Landmark-positioned eyewear concepts |
| FM-35 | Makeup try-on + custom routine | Implemented; device QA required | Local style overlay and saved routine |
| FM-36 | Makeup suggestor | Implemented; device QA required | Undertone/shape-aware style guidance with evidence context |
| FM-37 | Makeup coach | Implemented; device QA required | Non-numeric application guidance |
| FM-38 | Makeup look gallery | Implemented; device QA required | Local saved-look history |
| FM-39 | Photo tracker + before/after slider | Implemented; device QA required | Local visual history and comparison |
| FM-40 | Best-photo picker | Implemented; device QA required | Image-quality selection rather than attractiveness ranking |
| FM-41 | Identity personalization | Implemented | Male/female/non-binary/custom personalization where relevant |
| FM-42 | Affirmations + mirror | Implemented | Daily mindset/affirmation experience |
| FM-43 | Meditation / visualization | Implemented; device audio QA required | Orb, scripts, TTS/audio where available |
| FM-44 | Streaks / freeze / badges | Implemented | Rewards routine consistency rather than compulsive scanning |
| FM-45 | Shareable progress card | Implemented; Android share QA required | Progress-oriented sharing without public beauty score |
| FM-46 | Barber/skincare discussion export | Implemented; Android share QA required | Discussion brief with scan/style context |
| FM-47 | Local data deletion | Implemented | Clears local Chisel data from inside the app |
| FM-48 | Privacy policy page | Implemented | Must be hosted and linked in Play Console |
| FM-49 | Photoreal hair/beard render | Client/server source present; production config/live QA pending | Optional cloud render with separate privacy/data-safety implications |
| FM-50 | Future-you preview | Partial / illustrative | Current local visualization is not a guaranteed prediction |
| FM-51 | Paywall UI + purchase/restore seam | Implemented; production config pending | Requires Play products + RevenueCat key/entitlement + live billing QA |
| FM-52 | Server entitlement enforcement | Partial / deploy pending | Supabase function source exists; production deployment/config required |
| FM-53 | Premium Pro product definition | Product spec committed | Precision Lab Pro, Progress Intelligence, Adaptive Protocols, Looks Studio Pro, Professional Export, Private Vault Plus |
| FM-54 | Automated tests / CI | Automated verified | Current suite covers enhancements, precision, native asset sync and premium UX |
| FM-55 | Capacitor Android sync integrity | Automated verified | Canonical `www` app/feature assets are checked against packaged Android copies |
| FM-56 | Android release signing config | Implemented | Real upload keystore/passwords remain developer-owned and gitignored |
| FM-57 | Android API 36 target | Configured; build CI gate | compile/target 36, AGP 8.10, Gradle 8.11.1 |
| FM-58 | Android privacy hardening | Configured | Broad OS backup disabled; cleartext HTTP disabled |
| FM-59 | Play Store listing/policy work | Manual/config pending | Store graphics, hosted policy URL, Data Safety/content/health declarations, testing tracks |
| FM-60 | iOS | Deferred | Android-first release; iOS remains a separate platform project |

## Product truth

The canonical `www/index.html` is the only active app shell. Legacy Labs,
Precision and Premium shell assets may remain in source for parity/history, but
the Android activity must not inject them over the canonical UI.

Chisel is feature-complete enough for a serious Android release candidate. The remaining distinction is **software implementation versus empirical device validation**: camera/MediaPipe features must still be tested across representative phones, lighting, skin tones, facial hair/glasses, body framing and repeated same-condition captures before describing their numeric accuracy more strongly than photographic estimates.

See `USER_GUIDE.md` for the end-user flow, `PREMIUM_FEATURES.md` for the Free/Pro boundary, and `PLAY_STORE.md` for publishing steps.
