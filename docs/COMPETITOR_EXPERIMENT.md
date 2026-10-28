# Chisel competitor experiment

Reviewed 2026-10-28. This is desk research, not a market-size, accuracy, or
user-demand study. Store reviews are a small, self-selected sample; they do
not establish prevalence or causation. No users were contacted or recruited.

## Product evidence and review sample

| Product / source | Date / platform | Observed user feedback | Counterevidence or limit |
|---|---|---|---|
| YouCam Makeup [Google Play listing](https://play.google.com/store/apps/details?id=com.cyberlink.youcammakeup) | Product listing checked 2026-10-28 | The listing currently advertises live and photo makeup try-on, hairstyle/color tools, compare before/after, and paid AI features. | These overlap with Chisel’s live local makeup/hair controls and optional saved-photo cloud editor; those feature descriptions alone do not show unmet user need. |
| YouCam Makeup [Google Play review listing](https://play.google.com/store/apps/details?id=com.cyberlink.youcammakeup) | Camille Johnson, 2022-12-24, Android | Praises natural-looking makeup previews on camera/photo and values the premium offer. | Positive, but older; confirms the core try-on can be valued and the paid option can appeal. It counters a blanket conclusion that users reject paid photo tools. This exact review was visible on the listing during research; a stable review-specific permalink was not available. |
| FaceApp [Google Play listing](https://play.google.com/store/apps/details?id=io.faceapp) | Product listing checked 2026-10-28 | The listing advertises one-tap photoreal edits, hair/makeup filters, before/after compare, and sharing. | Chisel already has local live try-on plus a source/result comparison path, but its local overlays are not photoreal and the cloud path lacks real-output acceptance. |
| FaceApp [Google Play review](https://play.google.com/store/apps/details?id=io.faceapp) | Christine Sparks, 2026-05-11, Android | Describes a subtle grooming change to a candid group photo as useful for preserving the memory. | One positive example of practical, non-transformative editing; Chisel’s side-by-side editor can compare an AI result but currently requires a separate disclosed cloud path. |
| FaceApp [Google Play review](https://play.google.com/store/apps/details?id=io.faceapp) | Cole, 2026-05-23, Android | Objects to removal of video editing after paying, asking for a refund or older version. | This is about feature changes/video, not Chisel’s local face fitting. Treat as a reminder to keep the marketed feature floor and refund scope explicit, not as a reason to add video. |
| FaceApp [App Store review](https://apps.apple.com/ae/app/faceapp-perfect-face-editor/id1180884341?platform=iphone&see-all=reviews) | motec88, 2025-05-26, iOS | Reports a perception that previously free filters had moved behind a paywall. | The developer response says this appeared to be a bug and lists free filters; the contradictory evidence means this is a pricing/entitlement clarity signal, not a proven product fact. |
| FaceApp [App Store review](https://apps.apple.com/ae/app/faceapp-perfect-face-editor/id1180884341?platform=iphone&see-all=reviews) | topsturner, 2024-09-09, iOS | Praises subtle edits for correcting wide-lens appearance and says the product was worth renewing. | Positive report counters “all appearance editing is harmful” and suggests practical subtle editing has value for some users. It does not validate Chisel’s price or outcomes. |

Official product pages checked: [YouCam product page](https://www.perfectcorp.com/consumer/apps/ycm) (JavaScript-only in this research environment) and [FaceApp website](https://www.faceapp.com/). For current YouCam features, the Play listing was the readable primary listing. Review-specific permalinks were unavailable; cited Google Play pages display the reviewer/date inline. The verified sample is small and not representative.

## What Chisel actually covers

- **Already present in source:** local live hair/beard/eyewear/makeup selections; style-family controls; local face-fit/capture guidance; saved original portrait; optional, separately consented cloud photo edit; a source/result comparison slider; local saved-look gallery and delete; explicit local clear. Historical evidence exists for many underlying functions, but this source comparison does not freshly render them on a device.
- **Current change:** choose multiple photos and view unranked capture notes for lighting, image detail, image tilt, and framing. The owner chooses; no 0–100 score, facial expression signal, or ordered recommendation is produced. The local flow does not upload photos. It is not a photoreal styling simulation.
- **Not solved:** local still-photo realistic hairstyle replacement, real provider fidelity/cost, native encrypted active-store vault, Android device accuracy/accessibility, or commercial billing acceptance.

No distinctive competitor interface or artwork was copied. The generic interaction pattern of user-selected side-by-side comparison is already implemented in Chisel; the new change is a safety correction to Chisel’s own ranked-photo behavior, not a demand inference from reviews. No external code or assets were imported, so there are no new licenses/notices.

## Decision and next experiment

The current change is justified by the product’s own no-attractiveness-ranking requirement and the existing code path, not by a claim that sampled competitor complaints represent the market. Keep the free local grooming exploration usable without sign-in. Optional paid image work should expose its provider, cost, and off-device use before consent, never consume credit on automatic retries, and remain unavailable until real output and refund/receipt gates pass. Measure successful local explore → undo/delete and data-location understanding through a consented formative usability study before interpreting a commercial result.

## Business hypothesis

Hypothesis: some adults will pay for a reliable, clearly previewed AI style reference while retaining free local exploration, save/compare, and deletion. It is not validated; there are no Chisel customer, conversion, price, provider-cost, or refund baselines. Do not treat the portfolio’s $5.99 / 125-subscriber scenario as a Chisel forecast or enable billing from this study.
