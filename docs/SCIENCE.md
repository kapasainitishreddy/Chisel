# Chisel — SCIENCE.md

> How every measurement and recommendation in Chisel is computed, and the
> evidence behind each fix. Mirrors the in-app **Analyze → How scoring works**
> modal. Chisel is a **measurement & cosmetic-guidance tool — not a beauty
> rank, and not medical advice.**

## How a scan works

Everything runs **on-device** (Google MediaPipe FaceLandmarker, 468-point mesh
+ pixel colour analysis). No image or measurement leaves the phone.

A scan does **not** trust one frame. It pools many live frames and takes the
**median** of each measurement — the standard robust defence against a blink,
glare, or a head tilt. Frames are filtered before they count:

1. **Frontal** pose only (roll/yaw/pitch gate).
2. **Exposure-checked** frames preferred when ≥3 are available.
3. **Open-eye** frames preferred when ≥3 are available.

| Mode | Frames | Hold | Use for |
|---|---|---|---|
| **Quick scan** | ~10 over ~3s | 2.6s | A fast read |
| **Deep scan** | ~40 over ~5s | 5.2s | Higher-confidence tracking over time |

Each result reports a **confidence %** derived from how many usable frames were
captured and how many quality filters passed.

## What each score means

### Geometry (jaw, nose, lips, eyes, symmetry, thirds, face shape)
Landmarks are rotated to level the eyes first, so head tilt can't distort
widths/lengths. Each proportion is scored on a **bell curve** around a published
reference value (gradual falloff, not pass/fail). These are **geometric proxies
from a 2D selfie**, not calibrated clinical measurements.

- **Symmetry** — mean left/right deviation of paired landmarks ÷ face width.
- **Thirds** — evenness of brow / mid / lower face thirds.
- **Jaw** — jaw-to-cheek taper, fWHR, and an *approximate frontal* gonial angle
  (true gonial angle is a lateral cephalometric measure — labelled as a proxy).
- **Face shape** — majority vote across frames of a width-hierarchy classifier;
  drives the beard/haircut recommendation.

### Skin, hair & teeth (colour science — estimates, not diagnosis)
Colour is read from **pooled pixels with specular (glare/oil) pixels rejected**
[Shafer 1985], and **white-balanced** off a neutral reference (sclera/teeth)
when visible [Buchsbaum 1980].

- **Tone** — ITA° depth [Chardon 1991], mapped *approximately* to Fitzpatrick
  [Del Bino 2013; ITA↔Fitzpatrick is imperfect, Osto 2022]; undertone from
  CIELAB hue.
- **Evenness / redness / T-zone shine / under-eye** — luminance & a*-channel
  reads across skin regions.
- **Blemish estimate** — counts skin patches that deviate from *your own local
  median* (darker = a mark, redder = inflammation). Self-relative, so tone and
  lighting don't bias it. An estimate of texture, **not an acne diagnosis**.
- **Skin score** ≈ `0.42·evenness + 0.22·(100−redness) + 0.14·(shine term) +
  0.12·(100−under-eye) + 0.10·(100−blemish)`.
- **Bloat / fullness** — lower-face width:height vs **your own first scan**
  (50 = baseline). Never an absolute number — absolute face width:height is
  bone-driven, not a health signal.
- **Teeth** — shade estimate (A1–D) from a smiling frame's luminance + b* yellow.

### Overall "harmony"
The single number is the **average of seven per-area scores** (symmetry, thirds,
jaw, nose, lips, eyes, skin). It is a snapshot to track **against yourself over
time** — not a rank against other people, not an attractiveness or medical score.

## Beard & haircut recommendation
Driven by the detected **face shape**, recommending beard fullness and matching
cuts (e.g. round → chin length + tight cheeks; oblong → fuller sides, short
chin; triangle → light sides). Honest caveats in-app: **beard density is
genetic/DHT-driven** (minoxidil has *emerging* RCT support), and **trim, never
pluck** stray hairs.

## Evidence grades

Every recommendation is tagged so you know how much to trust it:

| Grade | Meaning |
|---|---|
| **Strong** | RCT or systematic-review evidence |
| **Moderate** | Supportive but weaker/observational evidence |
| **Limited** | Plausible, thin evidence |
| **Myth** | Commonly claimed, no controlled evidence — labelled as such |

## References

- **Alam 2018** — Alam M, et al. *Association of Facial Exercise With the Appearance of Aging.* JAMA Dermatol. 2018;154(3):365–367.
- **Hughes 2013** — Hughes MCB, et al. *Sunscreen and prevention of skin aging: a randomized trial.* Ann Intern Med. 2013;158(11):781–790.
- **Mukherjee 2006** — Mukherjee S, et al. *Retinoids in the treatment of skin aging.* Clin Interv Aging. 2006;1(4):327–348.
- **Morita 2007** — Morita A. *Tobacco smoke causes premature skin aging.* J Dermatol Sci. 2007;48(3):169–175.
- **Oyetakin-White 2015** — Oyetakin-White P, et al. *Does poor sleep quality affect skin ageing?* Clin Exp Dermatol. 2015;40(1):17–22.
- **Acne RCTs** — Guideline/RCT evidence that topical benzoyl peroxide and adapalene are first-line for mild–moderate acne (AAD acne guidelines).
- **Minoxidil beard** — Randomized evidence topical minoxidil increases beard/facial-hair density (e.g. Ingprasert et al.) — emerging.
- **Cochrane whitening** — Systematic-review/Cochrane evidence that peroxide-based agents effectively whiten teeth.
- **ENT nasal hair** — Clinical/ENT guidance: trim rather than pluck nasal hair (facial "danger triangle" infection risk).
- **Cervical RCT** — RCT/review evidence that cervical-retraction & deep-neck-flexor exercises improve forward-head posture (craniovertebral angle).
- **Rhodes 2006** — Rhodes G. *The evolutionary psychology of facial beauty.* Annu Rev Psychol. 2006;57:199–226.
- **Lerner 2014** — Facial-attractiveness literature on jaw definition as a masculine cue.
- **Pallanch 2015** — Pallanch & Larson. Facial proportion / nasal analysis ("rule of thirds").
- **Swift 2012** — Image-consulting/barbering analysis of haircuts and perceived face structure.
- **Chardon 1991** — Chardon A, Cler I, Charveron M. *ITA° skin-colour classification.* Int J Cosmet Sci. 1991;13:191.
- **Del Bino 2013** — Del Bino S, Bernerd F. *Skin-colour groups by ITA°.* Br J Dermatol. 2013;169(s3):33.
- **Osto 2022** — Osto M, et al. ITA° ↔ Fitzpatrick correlation is imperfect.
- **Shafer 1985** — Shafer SA. *Using colour to separate reflection components.* Color Res Appl. 1985;10:210 (specular-highlight rejection).
- **Buchsbaum 1980** — Buchsbaum G. *A spatial processor model for colour perception.* J Franklin Inst. 1980;310:1 (grey-world white balance).
- **Neff 2003** — Neff KD. *Self-compassion.* Self and Identity. 2003;2(2):85–101 (reduces appearance anxiety).

*Cosmetic & educational — not medical advice. For persistent skin, hair or
dental concerns, see a dermatologist or dentist.*
