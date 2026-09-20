# Personal Photo Studio

Updated 2026-09-10. Implements the approved photographic Chisel direction in the actual app using each user's explicitly selected personal photo. PR #7 remains draft and unmerged.

## Implemented experience

Near-black/deep-green surfaces, cream pill controls, image-led Home, Trainer, Skin and Style, consistent 20px mobile gutters (16px narrow), balanced three-action tiles and separated task groups. Existing routes and feature handlers remain in use. Text, navigation and buttons are native HTML controls, not an image pretending to be an app.

Tap the avatar or photo edit control, then Choose photo or Take photo. The saved photo supplies the Home hero, avatar, daily task thumbnail, trainer poster and thumbnails, and Style poster. Before selection the app shows an empty Add your photo state, not a stock person.

The local IndexedDB store retains the original Blob separately from a bounded display rendition. Saving does not automatically upload or analyze it. Remove photo clears the record and displayed images. Clear all data awaits portrait deletion before its success notice/reload. Decoding/writing is ordered to prevent an old import resurrecting a removed or replaced photo. Object URLs are revoked when replaced. No new analytics or network-upload implementation is present in the photo store.

## Real feature connections

- Home retains the original training, skin, style, daily action and explicit completion handlers.
- Six trainer sessions and filters remain connected. Start session activates the current existing session. Movement counts come from the actual catalog. The still photo is a personal poster, not an exercise demonstration. Live movement feedback appears only for valid accepted camera-checked form; guided practice does not get an invented score.
- Skin: Use my photo explicitly passes the original file to the existing quality-gated analysis flow. Analyze is a separate action. Display crops and edge fades are never used as measurement inputs. Results stay hidden until actual analysis succeeds. Cancelled/replaced selection cannot save stale results.
- Style: Hair, Beard, Makeup and Eyewear filter the real existing guide controls. The poster states Your photo - no style applied. Try in camera opens the existing live guide. Saved still-photo photoreal transformation and new model deployment are not part of this change.
- The existing optional cloud renderer retains separate upload consent and provider configuration requirements.

## Verified revision

Application runtime: `5a4745b222498068a309918e4639c3bfea81f9fb`.
Application plus corrected interaction test: `2d5ecf6de339621c8c96258ea74b53a034faf865`.
Exact CI merge checkout: `66ca090ae691cf3f171765eb6f0e883f9bd0da81`.
A later documentation-only commit does not modify this tested application/test tree.

- Node: **222/222 PASS**, no failures or skips. Rerun locally against the downloaded exact CI source with the same result.
- Personal Photo browser lifecycle: **66/66 PASS**, zero uncaught errors and zero recorded POST requests.
- Personal Photo UI #4, run `34512941395`: SUCCESS. Artifact `10166520546` preserves exact source, JSON, logs and screenshots.
- Quiet Studio QA #10, run `34512941384`: SUCCESS.
- Reliability Evidence #15, run `34512941407`: SUCCESS.
- Chisel Tests #274, run `34512941383`: SUCCESS, including the original interaction and portrait/try-on fixture jobs.
- Five changed canonical/native asset pairs match byte-for-byte.

The new lifecycle runner checks empty state, invalid files, exact original SHA-256 preservation, sharing the selected photo across surfaces, reload persistence, removal, complete-data deletion with one confirmation, real filters, explicit Skin handoff and responsive placement at 360/430/1280 CSS-pixel widths. Existing suites additionally cover 768px. Unit regressions cover replacement, out-of-order decoding, deletion during import and storage failure.

## Review fixes and limits

Actual browser review found and fixed: a DOM-named toast collision blocking the full-delete success/reload path, light text on the selected cream filter, placeholder icons over loaded thumbnails, and doubled spacing above the Style destination. The old interaction runner's exact heading assertion was updated to the approved Face training title after waiting for the new runtime; the remaining interaction assertions were preserved.

Concept and final screenshots were compared for imagery ownership, typography, palette, layout, button geometry, spacing, task grouping and visible labels. The concept's fictional scores, fabricated style thumbnails and alternate navigation were deliberately not copied. See PERSONAL_STUDIO_REVIEW.md.

Local browser navigation was blocked by the execution environment; rendered verification ran in GitHub Actions Chromium. Screenshots use a repository test portrait imported through the real user control, not a production default or the user's own face. Physical Android camera/HUD, large text, screen reader, normal motion, empirical measurement accuracy and actual cloud-render realism remain acceptance work. No signed APK/AAB, installation, merge, production deployment, billing setup, new model import or store submission was performed.
