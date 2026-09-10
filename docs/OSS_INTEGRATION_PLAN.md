# Chisel Open-Source Integration Plan

Status: implementation blueprint for the current draft release branch. This document does not claim that every listed external component is already integrated.

## Product direction

Keep Chisel unisex and local-first. Use one coherent tracking/render stack instead of adding duplicate frameworks:

- MediaPipe for face, blendshape, and pose tracking.
- OpenCV for deterministic image quality, alignment, color/texture proxies, and capture validation.
- Face parsing/segmentation only where region masks materially improve results.
- WebGL/Three.js or lightweight canvas/SVG overlays for instant local try-on and exercise coaching.
- GPU/server inference only for photorealistic transforms such as hairstyle transfer.
- ONNX Runtime Mobile where a compatible model can be exported and run efficiently on-device.
- No adult-bone-reshaping, medical diagnosis, guaranteed attractiveness, or spot-fat-loss claims.

## User-supplied repositories

### AIRI-Institute/HairFastGAN — preferred photoreal hair-transfer engine

Use for reference-based hairstyle shape and color transfer in Looks Studio Pro. It is the strongest candidate of the supplied repositories for actual image transformation rather than only UI/workflow. Run as an isolated GPU service first; do not force it into the Android bundle.

Repo code license: MIT. Before commercial shipping, separately audit every downloaded pretrained weight and inherited dependency/model license.

### SamurAIGPT/ai-hair-style-simulator — workflow reference

Useful for makeover-studio UX, preset selection, async jobs, galleries, compare/delete flows, and credit-aware generation. Do not treat MuAPI as open-source inference; the repo is an application around an external provider.

Repo license: MIT.

### DeanOpen/barber-ai — barber consultation and catalog reference

Reuse product ideas such as stylist-readable hairstyle prompts, grouped style catalogs, labeled lookbooks, per-customer comparison sessions, progress streaming, retry flows, and a barber-facing presentation/export experience. Do not copy its plaintext image-retention behavior into Chisel.

Repo license: MIT.

### Shaaaaan0903/Ai-Hairstyle- — face-shape recommendation reference

Useful for local face-shape estimation from MediaPipe/OpenCV and hairstyle recommendation UX. Chisel should replace the men/women split with a unisex recommendation engine driven by face geometry, hair texture, length preference, maintenance tolerance, styling goals, and optional presentation preference.

Repo license: Apache-2.0.

## Preferred open-source stack by Chisel feature

| Chisel capability | Preferred project / approach | Integration decision |
|---|---|---|
| Face landmarks, scan guidance, jaw/cheek exercise tracking | google-ai-edge/mediapipe Face Landmarker + blendshapes | Keep as the canonical live face tracker. Use landmarks/blendshapes for rep state machines, form correction, symmetry, head pose, and AR anchors. |
| Body/posture | MediaPipe Pose Landmarker | Keep one runtime instead of adding a second pose framework. Use for neck/shoulder alignment and posture coaching. |
| Hair transfer | AIRI-Institute/HairFastGAN | Preferred photoreal server-side reference hair shape/color transfer. |
| Hairstyle recommendation | Chisel rules + Shaaaaan0903/Ai-Hairstyle- concepts | Build an original unisex recommender from Chisel measurements/preferences. Do not hard-code gender catalogs. |
| Hair/beard instant preview | MediaPipe + face parsing + local vector/texture assets | Keep instant previews local. Use the same photoreal cloud/server route only when the user explicitly requests a generated render. |
| Barber consultation / lookbook | DeanOpen/barber-ai concepts | Add style taxonomy, labeled comparison grid, favorite shortlist, and barber brief/export. |
| Real-time makeup | ehsanwwe/OpenMakeupSDK concepts or compatible MIT code | Best local AR reference: MediaPipe + WebGL shaders for foundation, blush, lips, liner, mascara, shadow. Disable cosmetic face-reshape features in Chisel unless clearly labeled as illustrative styling. |
| Reference makeup transfer | wtjiang98/PSGAN | Optional higher-fidelity server experiment. MIT code, but older research stack; keep behind an experimental flag until model/dependency audit and realism QA pass. |
| Face/hair/lip/skin region masks | zllrunning/face-parsing.PyTorch | MIT reference for semantic regions. Prefer an ONNX export or a smaller replacement for mobile if performance is acceptable. |
| Eyewear AR | diogogithub/virtual-glasses-try-on concepts | Strong reference for landmark anchoring, temporal smoothing, yaw/pitch/roll, scale calibration, and occlusion. Repo is archived but MIT; implement the technique in Chisel's existing renderer. |
| 3D/WebGL rendering | mrdoob/three.js | MIT. Use only where 3D depth/occlusion adds value; keep simple exercise overlays in canvas/SVG for speed. |
| Portrait/hair-edge matting | ZHKKKe/MODNet | Apache-2.0 official model/code. Useful for hair-edge compositing, export cleanup, and photoreal preview masks. |
| Skin appearance maps | OpenCV + MediaPipe; DurtyDhiana/skin-scan as algorithm reference | Use redness, specular/oiliness, texture, pore-like blob, blemish-like, and pigment appearance proxies only. Keep cosmetic/non-diagnostic wording and validate repeatability before exposing scores. |
| Capture-quality gate | OpenCV blur/exposure/glare metrics + BRISQUE as optional secondary score | Never use a single IQA score alone. Combine blur, exposure, face size, pose, occlusion, glare, and condition matching. |
| Before/after alignment | MediaPipe landmarks + OpenCV affine/ECC alignment | Normalize scale/rotation/crop before slider comparisons. |
| Best-photo picker | Chisel quality model using capture metrics | Rank image quality and suitability only, never attractiveness. |
| On-device model runtime | microsoft/onnxruntime Mobile | MIT. Use for models that export cleanly and meet memory/latency targets; otherwise keep MediaPipe Tasks. |
| Tutorial animation | airbnb/lottie-android for non-interactive instruction; live overlays for tracked reps | Lottie is for explainers only. Real reps must be driven by live landmark/blendshape state. |
| Local privacy | Existing Chisel local-first architecture + Android Keystore/AES-GCM | Do not introduce external upload for core scans. Cloud render remains explicit opt-in. |

## Face & Neck Trainer expansion

Make training unisex. Personalize from geometry, mobility, goal, and comfort instead of gender.

### Core routines

1. Cheek activation
   - Cheek Lifter
   - Happy Cheeks hold
   - Relax/reset

2. Jaw/chin posture
   - Chin tuck
   - Deep-neck-flexor nod
   - Neutral-head hold
   - Scapular retraction
   - Wall posture hold

3. Double-chin support
   - Chin tuck
   - Deep-neck-flexor work
   - Posture sequence
   - Optional gentle anterior-neck activation
   - Whole-body activity reminder where relevant

Do not claim that these routines selectively burn under-chin fat, reshape adult jaw bone, or guarantee a sharper jawline.

### Live exercise engine

Every tracked exercise should use a state machine:

READY -> POSITION -> CONTRACT/MOVE -> HOLD -> RELEASE -> REP COMPLETE

A rep counts only after required landmarks/blendshapes remain inside form thresholds for the specified hold. Detect and coach common compensation such as head rotation, excessive tilt, jaw clenching, shoulder elevation, or range that is too large.

Show:

- clean reps
- hold time
- form score
- range quality
- left/right symmetry when meaningful
- compensation flags
- streak/adherence

Do not convert one workout into an appearance-change score.

## Looks Studio redesign

Create one unified, unisex flow:

1. Choose category: Hair, Facial Hair, Eyewear, Makeup/Grooming.
2. Instant local preview first.
3. Compare up to four looks on the same source photo.
4. Filter by maintenance, length, texture compatibility, professional/casual presentation, and user-selected style goals.
5. Optional photoreal render only after explicit cloud-processing consent.
6. Save favorite looks locally.
7. Export a stylist/barber discussion brief with style names, reference images, maintenance notes, and user notes.

## Integration order

### Phase A — lowest risk / highest value

- Strengthen MediaPipe exercise state machines and unisex trainer catalog.
- Add glasses anchoring/smoothing/occlusion improvements.
- Add local real-time makeup shaders.
- Add unisex hairstyle recommendation rules.
- Add barber/lookbook comparison and export workflow.
- Improve capture quality with OpenCV metrics.

### Phase B — local vision upgrades

- Add face parsing for semantic masks.
- Improve hair/beard/makeup compositing.
- Add MODNet where edge matting materially improves results.
- Evaluate ONNX Runtime Mobile for any exported auxiliary models.

### Phase C — GPU photoreal features

- Prototype HairFastGAN as an isolated service.
- Compare quality/cost/latency against the existing Chisel photoreal provider path.
- Add PSGAN only if it clearly beats the local shader makeup path for saved renders.

## Release gates for every external component

Before shipping any external code/model in production:

1. Record source repository, commit/tag, code license, model-weight license, dataset restrictions, and required attribution.
2. Scan dependencies and secrets.
3. Verify no license is research-only/non-commercial for the exact artifact shipped.
4. Benchmark latency, memory, APK/AAB impact, GPU cost, and failure behavior.
5. Test across representative skin tones, hair textures, face shapes, facial hair, glasses, lighting, and Android devices.
6. Preserve Chisel's explicit uncertainty/non-medical language.
7. Keep a third-party notices file in the app/repository.

## Projects not selected as primary dependencies

- HairCLIP/HairCLIPv2: technically useful for text/reference hair editing, but the code/dependency licensing path is more complicated than HairFastGAN for a commercial Android product. Keep as research reference unless a full dependency/weight audit clears it.
- FaceSculpt AI: useful UX inspiration for live face positioning and exercise guidance, but Chisel already has the stronger tracking foundation. Do not make it a core dependency.
- MuAPI/OpenAI-backed makeover repositories: useful workflow references, not substitutes for an open-source local model.

## Product rule

Chisel should feel like one product, not a bundle of GitHub demos. External projects supply algorithms or interaction ideas; Chisel owns the design system, safety language, measurement contracts, local privacy behavior, data model, progress logic, and unisex coaching experience.
