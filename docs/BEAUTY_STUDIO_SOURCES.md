# Beauty Studio source notes

Chisel Beauty Studio uses an independent implementation built on Chisel's existing face-landmark canvas renderer. No third-party repository code is vendored into the app by this feature.

## References reviewed

- `kyleolsz/hairgen` / HairGen (CVPR 2020): useful research and interaction reference for controlled hair/facial-hair synthesis. The public repository currently publishes project material and states that code/models/data are forthcoming, so Chisel does not import it.
- `varundataquest/BarberAI`: useful UX reference for recommendations and user overrides, but it depends on its own hosted Base44 AI services. Chisel does not copy its implementation or service dependency.
- `equally-creator/awesome-ai-hairstyle-changer`: a discovery list of hairstyle projects and services, used only to survey the space.
- `MYlab10/Virtual_makeup_try_on_tool`: confirms the practicality of face-landmark cosmetic overlays; no license was present in the repository root when reviewed, so Chisel uses its own landmark/gradient implementation instead of copying code.

## Chisel implementation

- Women-first hairstyle catalog with texture, length, upkeep, fringe and face-framing metadata.
- User preferences outrank automatic face-shape matching.
- The app defaults facial hair to clean instead of forcing stubble.
- Blush is placed with landmark-aware soft ellipses rather than two fixed circles.
- Blush placement changes with face shape and selected look: lifted, apples, horizontal, low-lift, sun-kissed, draped or sculpted.
- Beauty Guide creates Base, Brows, Eyes, Blush and Lips instructions from the saved undertone/face-shape context and the user's chosen vibe.
- Guidance remains non-numeric and never produces an attractiveness or beauty score.

## Rendering note

The local camera overlay is intentionally a fast style preview. New hairstyle variants that the current cloud renderer does not yet understand are mapped to the closest existing server-side base style for optional Photoreal rendering. This prevents failed requests while preserving the expanded local catalog. A later server update can give each new style its own generation prompt.
