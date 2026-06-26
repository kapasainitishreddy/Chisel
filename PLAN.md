# Chisel — Product & Build Plan

Date: 2026-06-21
Status: Planning (no code yet)

## Mission

**Chisel doesn't rate you. It uplifts you — with evidence.**

Competitors (MaxLookAI, Umax, moggedup) lead with a "PSL score" that ranks how
attractive you are. That drives insecurity, invites body-image harm, and attracts
app-store scrutiny. Chisel inverts it:

1. **Measure only what's measurable**, honestly, and call it a *measurement* —
   never a beauty rank.
2. **Show what's in your control** (skin, posture, grooming, teeth, muscle tone,
   habits) vs what isn't (bone structure) — so effort goes where it pays off.
3. **Every method ships with its evidence** — strength rating + citation — in the
   spirit of the GymLens SCIENCE.md ethos. No method without a receipt.
4. **Confidence is the product.** Progress, streaks, self-compassion framing, and
   visible wins — not a number that says you're a 4/10.

Tagline candidates: "Confidence, backed by evidence." / "Look better. Feel
better. With receipts."

## Positioning vs competitors

| | Umax / MaxLookAI / moggedup | **Chisel** |
|---|---|---|
| Core hook | "Your PSL/attractiveness score" | "What you can improve + how, proven" |
| Emotional effect | Insecurity / comparison | Confidence / agency |
| Claims | Confident, mostly unsupported | Evidence-tiered, honest about limits |
| Store/wellbeing risk | High (rating minors' looks) | Lower (framing + evidence + 17+) |

## Analysis modules

Each module separates **Measured** (computed on-device) from **Guided self-check**
(where reliable AI measurement isn't honest — we give an evidence-based checklist
instead of faking a score). Every improvement **Method** carries an evidence
strength: **Strong / Moderate / Limited / None (myth)**.

### 1. Face structure & jawline
- **Measured (MediaPipe FaceLandmarker, 478 pts):** facial symmetry %, facial-
  thirds balance, gonial (jaw) angle, jaw-to-cheekbone width ratio, fWHR. Shown
  as neutral measurements with a labeled overlay.
- **Methods:**
  - Chewing / firm gum → masseter activity (jaw-muscle definition). *Moderate* —
    masseter responds to mastication load [R7].
  - Mewing / resting tongue posture. **None (myth)** — no controlled evidence for
    bone change; shown with explicit caveat [R8].
  - Lower body-fat % (jaw/cheek definition tracks facial adiposity). *Strong* —
    facial fat strongly influences perceived jawline [R6].
- **Honesty note:** bone structure (chin/jaw skeleton) is *not* changed by
  exercise; we say so plainly.

### 2. Cheekbones
- **Measured:** cheekbone (bizygomatic) width, mid-face ratio.
- **Methods:** facial-muscle exercises improved cheek fullness/appearance over 20
  weeks. *Moderate* [R1]. Body-fat + hydration. *Moderate*.

### 3. Lips
- **Measured:** upper/lower lip ratio, lip-to-face proportion, fullness vs facial
  width.
- **Methods:** daily UV lip balm (SPF) prevents actinic cheilitis & lip
  photoaging *Strong* [R2,R9]; hydration; stop smoking (smoker's lips/perioral
  lines) *Strong* [R9]. Lip "exercises" for size: **None (myth)**.

### 4. Nose & nasal grooming
- **Measured:** nose width-to-face ratio, nasal-tip position (geometry only).
- **Guided self-check (NOT a fake AI scan):** nose hair / grooming checklist —
  honest because nose-hair density isn't reliably measurable from a selfie.
- **Methods:** **trim, don't pluck** nasal hair — plucking risks infection in the
  facial "danger triangle." *Strong (clinical guidance)* [R10]. Nose "shape
  exercises": **None (myth)** — nasal shape is cartilage/bone.

### 5. Beard
- **Guided self-check:** coverage/patchiness self-rating + style guidance (density
  isn't honestly measurable from one selfie).
- **Methods:** topical minoxidil can increase facial-hair density. *Moderate
  (emerging RCT evidence)* [R5]. Grooming/shaping for the face shape; derm
  referral for patchiness. Beard is largely genetic/DHT-driven — stated honestly.

### 6. Skin
- **Measured (basic image analysis):** evenness/redness/brightness estimates from
  the photo (rough, on-device) — labeled as estimates, not diagnosis.
- **Methods (the strongest-evidence module):**
  - Daily broad-spectrum sunscreen slows visible skin aging. *Strong (RCT)* [R3].
  - Topical retinoids improve photoaging. *Strong* [R4].
  - Don't smoke (premature skin aging). *Strong* [R9].
  - Sleep quality affects skin aging/recovery. *Moderate* [R11].
- **Honesty:** real skin diagnosis needs a dermatologist; we educate + refer.

### 7. Teeth & smile
- **Measured:** smile width / buccal corridor, teeth visible region brightness
  (rough whiteness estimate). Alignment is *not* reliably measurable — say so.
- **Methods:** peroxide-based whitening is effective. *Strong* [R12]. Oral hygiene
  basics. *Strong*. Orthodontics for alignment → dentist referral.

### 8. Neck & posture
- **Measured:** head/neck angle (forward-head-posture proxy), submental profile.
- **Methods:** chin tucks / cervical-retraction & deep-neck-flexor exercises
  improve forward head posture (and the jaw/neck profile). *Moderate–Strong* [R13].
  Lower body-fat for submental fullness. *Strong* [R6].

## The confidence / uplift layer (the differentiator)

- **No global "score of you."** Per-area measurements + a personalized,
  prioritized **"biggest controllable wins"** list (effort → impact).
- **Daily routine + streak** of evidence-backed habits (on-device `localStorage`).
- **Progress re-scans** ("skin evenness +6%, posture angle improved") — progress,
  not ranking, is the dopamine.
- **Self-compassion framing** in copy (reduces appearance anxiety) [R14]. Wins,
  encouragement, and "what you improved," never "what's wrong with you."
- **Wellbeing guardrails:** 17+, no "ugly/attractive" language, links to support
  if usage patterns suggest distress.

## Virality (growth engine)

- Shareable **progress card** ("30-day skin streak", "posture improved") rather
  than a rate-me card — uplifting content spreads and avoids the toxic loop.
- "Improve with me" challenges; Web Share → TikTok/IG/Snap, download fallback.

## Technical approach

- **Shared engine with GymLens:** MediaPipe (Face + Pose), WASM, Capacitor,
  design system. Reuse, don't rebuild (~80% shared plumbing).
- **On-device & offline** for landmark geometry. Basic skin/teeth color estimates
  also on-device (canvas pixel analysis). Anything we can't do honestly on-device
  is a **guided self-check**, not a fake AI score.
- **Android first** (buildable now); iOS later via cloud-Mac.
- **Free in v1, paywall-ready** (`entitlements.ts` seam; RevenueCat later).

## Phased roadmap

- **Phase 0 — App scaffold:** Next.js + Capacitor in `Chisel/`, shared engine,
  design system, home, disclaimer/17+ gate.
- **Phase 1 — Viral core:** Face structure + Skin analysis (the two with the best
  measured value + strongest evidence) → measurements + "controllable wins" +
  **shareable progress card**. Ship, install, test on phone, post to TikTok.
- **Phase 2 — Routine + tracking:** daily streak, progress re-scans, the
  uplift/self-compassion layer.
- **Phase 3 — More modules:** Lips, Teeth/Smile, Neck/posture, Nose & Beard
  (guided), Exercise library with full citations.
- **Phase 4 — Monetization:** flip `entitlements.ts` → RevenueCat weekly sub.

## Guardrails (non-negotiable)

- 17+ rating; "facial symmetry & self-improvement," never "rate my face."
- Every method displays evidence strength + citation; myths labeled as myths.
- Measurements only where honest; guided checks elsewhere; referrals (derm/
  dentist) where appropriate. "Cosmetic & educational — not medical advice."

## References

> Evidence strengths are honest summaries; exact citations to be verified into a
> `SCIENCE.md` during build (same discipline as GymLens).

- **[R1]** Alam M, Walter AJ, Geisler A, et al. *Association of Facial Exercise
  With the Appearance of Aging.* JAMA Dermatology. 2018;154(3):365–367.
- **[R2]** UV protection prevents actinic cheilitis / lip photodamage — clinical
  dermatology guidance (lips lack melanin protection).
- **[R3]** Hughes MCB, Williams GM, Baker P, Green AC. *Sunscreen and prevention
  of skin aging: a randomized trial.* Ann Intern Med. 2013;158(11):781–790.
- **[R4]** Mukherjee S, et al. *Retinoids in the treatment of skin aging.* Clin
  Interv Aging. 2006;1(4):327–348 (review of RCT evidence for topical retinoids).
- **[R5]** Randomized evidence that topical minoxidil increases facial-hair/beard
  density (e.g., Ingprasert et al., minoxidil-for-beard trial) — *emerging*.
- **[R6]** Rhodes G. *The evolutionary psychology of facial beauty.* Annu Rev
  Psychol. 2006;57:199–226 (and facial-adiposity perception literature).
- **[R7]** Mastication load and masseter muscle thickness/activity (chewing/gum
  studies) — muscle, not bone.
- **[R8]** Orthotropics / "mewing": no controlled clinical evidence for bone
  change — labeled as a myth in-app.
- **[R9]** Morita A. *Tobacco smoke causes premature skin aging.* J Dermatol Sci.
  2007;48(3):169–175 (and Model D, "smoker's face," BMJ 1985).
- **[R10]** Clinical/ENT guidance: trim rather than pluck nasal hair (infection
  risk in the facial "danger triangle").
- **[R11]** Oyetakin-White P, et al. *Does poor sleep quality affect skin
  ageing?* Clin Exp Dermatol. 2015;40(1):17–22.
- **[R12]** Systematic-review evidence (incl. Cochrane) that peroxide-based
  whitening agents effectively whiten teeth.
- **[R13]** RCT/systematic-review evidence that cervical-retraction & deep-neck-
  flexor exercises improve forward head posture (craniovertebral angle).
- **[R14]** Neff KD. *Self-compassion: an alternative conceptualization of a
  healthy attitude toward oneself.* Self and Identity. 2003;2(2):85–101 (self-
  compassion reduces appearance/body anxiety).

## Open questions to confirm before build

1. App name final: **Chisel** (or alternative)?
2. Phase 1 scope OK (Face structure + Skin + share card first)?
3. Which modules are must-have for v1 vs later?
4. Confirm 17+ / wellbeing framing is the direction you want.
