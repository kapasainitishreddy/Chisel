# Chisel open-source usefulness review

Date: 2026-09-11

Chisel is the focused unisex face-training, facial massage/yoga, jaw/cheek/posture, Skin Appearance and grooming/style product. This document records open-source projects that are potentially useful for the remaining trainer, camera, skin and Looks Studio work. No third-party code or model is copied by this documentation change.

## Highest-value engineering candidates

| Project | Useful for Chisel | Suggested use |
| --- | --- | --- |
| [MediaPipe](https://github.com/google-ai-edge/mediapipe) | Face landmarks, pose/vision pipelines | Best general foundation for on-device face landmarks, neutral-pose checks, head orientation, region tracking and camera guidance. Keep outputs measurement-oriented and uncertainty-aware. |
| [OpenCV](https://github.com/opencv/opencv) | Deterministic image preprocessing | Useful for alignment, crop, blur/exposure checks, perspective/geometry utilities and repeatability QA before any skin/style model. |
| [facesculpt-ai](https://github.com/AhmedReFu/facesculpt-ai) | Face-sculpting product reference | Research the exercise organization, user flow and computer-vision boundaries. Do not assume its exercise claims or code are production-ready; independently validate content and license. |
| [ai-hair-style-simulator](https://github.com/SamurAIGPT/ai-hair-style-simulator) | Hairstyle simulation reference | Useful for studying hairstyle selection/render UX and image-processing flow. Research/reference until license, dependencies, model rights and output quality are verified. |
| [barber-ai](https://github.com/DeanOpen/barber-ai) | Hair/grooming try-on reference | Useful for grooming preset UX, prompt/input constraints and before/after presentation. Reuse concepts only after license/provider review. |
| [HairFastGAN](https://github.com/AIRI-Institute/HairFastGAN) | Hair-transfer research | High-value research candidate for local/offline hairstyle work, but model/code/data licenses, device feasibility, identity preservation and runtime size must be reviewed before any integration. |
| [Ai-Hairstyle](https://github.com/Shaaaaan0903/Ai-Hairstyle-) | Hairstyle-generation reference | Compare UI/pipeline ideas with Chisel's current saved-photo Looks Studio. Treat as prototype research, not a trusted production dependency. |

## Trainer/exercise direction

1. Keep the trainer **unisex** and organize sessions by controllable objective: jaw/neck relaxation, cheeks, posture, facial mobility, massage/release and full routine.
2. Camera feedback should assess **form and visibility**, not claim muscle growth from landmarks.
3. Require neutral release between repetitions where measurement depends on facial position.
4. Use short looping demonstrations/animations for each exercise; posters are not sufficient demonstrations.
5. Separate evidence strength from instructions. If an exercise has weak evidence for structural change, say so clearly while still allowing it as a relaxation/mobility routine where appropriate.

## Skin Appearance direction

- Use capture-quality gates before analysis.
- Label photographic signals as appearance observations, not diagnoses.
- Avoid medical conditions, disease labels or treatment advice.
- Prefer local/on-device processing; require explicit consent before cloud rendering or analysis.
- Keep routine recommendations conservative and user-editable.

## Looks Studio direction

- Preserve the original photo and make generated looks non-destructive derivatives.
- Identity preservation, hair edges, skin texture and category isolation should be acceptance criteria.
- Do not enable a new cloud/model path merely because an open-source demo works on curated samples.
- HairFastGAN and the hairstyle repositories above should first be tested on a private benchmark set across hair textures, lengths, genders, glasses, facial hair and lighting.

## Integration guardrails

- Verify the exact license of every repository, model checkpoint and dataset before code/model reuse. Some research repos have restrictions that differ from ordinary permissive libraries.
- Do not copy health/appearance claims from README files as evidence.
- Any new model must pass privacy review, Android performance tests, failure-state UX, representative visual QA and repeatability checks.
- Cloud rendering must stay behind explicit upload consent and bounded retention/provider rules.
- Keep stronger empirical accuracy claims blocked until there is real validation evidence.

## Recommended implementation order

1. Use MediaPipe + OpenCV to improve trainer form/capture quality first.
2. Add clear exercise animations and form states without changing the measurement truth boundary.
3. Benchmark the hairstyle research projects offline against Chisel's current cloud workflow.
4. Only then choose whether any model/code is worth a licensed, production-grade integration.

This document is a research/backlog artifact, not a claim that any listed project is already integrated.