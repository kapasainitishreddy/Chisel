# Personal Photo Studio

2026-09-10. Implements the user-approved photographic UI direction in the existing Chisel app, using an explicitly chosen personal photo instead of the generated concept's models. Not a new image-generation model or accuracy certification.

## Design contract

Near-black and deep green surfaces, cream pill actions, image-led Home, Trainer, Skin and Style, 20px mobile gutters, 16px narrow gutters, 24px major section spacing. Native text and controls, not a screenshot used as UI. The concept's synthetic skin/form values and invented navigation are intentionally excluded. Existing five primary routes and controls remain available. No photo is seeded in production.

## Private photo lifecycle

Choose or take a JPEG/PNG/WebP photo through Your photo. Explicit UI disclosure says it is saved on this device and not uploaded. The new IndexedDB store holds the untouched original and a separate bounded display rendition. Blob URLs feed Home, the avatar, trainer poster/thumbnails and Style poster. Empty state offers Add your photo. Remove photo clears saved data and visible copies. Clear all data also awaits removal from IndexedDB before success/reload. Import/delete ordering prevents a late decode from resurrecting an older or deleted photo. Cross-tab revision messages contain no photo bytes.

A saved photo is not proof that face detection succeeded, and is not a training animation. Trainer session thumbnails identify the user's personalized surface; actual movement coaching remains in the existing live camera path.

## Feature connections

- Home retains real training/skin/style launchers and the original daily action/completion state.
- Six original trainer sessions and goal filters remain wired. Start session activates the selected existing session. Featured metadata is derived from the real exercise catalog; live movement feedback is shown only for accepted camera-checked form. No static score is seeded.
- Skin has Use my photo as an explicit selection action. It passes the original Blob, not the cropped/downscaled display rendition, into the existing quality-gated analyzer. Choosing does not automatically analyze or upload. A selection version prevents cancelled work from saving stale results.
- Style categories use the existing unisex hair/facial-hair/makeup controls plus an eyewear entry. The saved image is clearly labelled Your photo - no style applied. Try in camera opens the existing live guide. This update does not transform a saved still photo into a photoreal hairstyle.
- Existing cloud generation retains its separate consent/provider path, untouched by this UI module.

## Verification checkpoint

Local Node suite: 220/220 passing before initial push; 18 new tests were written and observed failing before implementation. Canonical and packaged Android assets are synchronized. Local browser navigation is blocked by the execution environment. The new Personal Photo UI workflow runs Chromium import, invalid-input, reload, original-byte, removal, clear-all, responsive layout and routing checks, and archives exact source and screenshots. Consult exact-head CI results before claiming rendered success.

## Remaining boundaries

No merge, native signed build, actual Android camera acceptance, provider deployment, live billing, new HairFastGAN/model weights, empirical accuracy percentage or Play submission is established. Reference-based measurement testing and real generated-output review remain separate work. Initial screenshots for QA use the existing repository portrait fixture, not a user's private photo and not a production default.
