(function attachChiselEnhancementsCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ChiselEnhancementsCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createCore() {
  'use strict';

  const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
  const round = (value, digits = 3) => {
    const factor = 10 ** digits;
    return Math.round((Number(value) || 0) * factor) / factor;
  };
  const mix = (a, b, weightB) => (Number(a) || 0) * (1 - weightB) + (Number(b) || 0) * weightB;

  function normalizeUndertone(value) {
    const tone = String(value || 'neutral').trim().toLowerCase();
    if (tone.includes('warm') || tone.includes('gold') || tone.includes('olive')) return 'warm';
    if (tone.includes('cool') || tone.includes('pink') || tone.includes('rose')) return 'cool';
    return 'neutral';
  }

  function buildSkinRecoveryPlan(scan = {}, profile = {}) {
    const blemish = clamp(scan.blemish, 0, 100);
    const redness = clamp(scan.redLevel, 0, 100);
    const oil = clamp(scan.oilPct, 0, 100);
    const evenness = clamp(scan.skinEven == null ? 50 : scan.skinEven, 0, 100);
    const persistentWeeks = clamp(profile.persistentWeeks, 0, 104);
    const sensitive = Boolean(profile.sensitive);
    const burden = 0.45 * blemish + 0.25 * redness + 0.2 * oil + 0.1 * (100 - evenness);
    const level = burden >= 68 || persistentWeeks >= 8 ? 'support-needed' : burden >= 38 ? 'focused' : 'maintenance';

    const am = [
      { title: 'Gentle cleanse', detail: 'Use lukewarm water and a fragrance-free cleanser; avoid scrubbing or picking.' },
      { title: 'Light moisturiser', detail: 'Choose a non-comedogenic moisturiser that supports the skin barrier.' },
      { title: 'Broad-spectrum sunscreen', detail: 'Apply SPF 30+ to face, jaw and neck every morning; reapply with prolonged outdoor exposure.' }
    ];

    const pm = [
      { title: 'Cleanse once', detail: 'Remove sunscreen and sweat without double-scrubbing.' },
      sensitive
        ? { title: 'Salicylic acid introduction', detail: 'Patch-test a 0.5–2% salicylic-acid product once or twice weekly, then increase only if comfortable.' }
        : { title: 'Acne-support active', detail: 'Start with either 0.5–2% salicylic acid or 2.5% benzoyl peroxide on separate nights; do not begin both together.' },
      { title: 'Barrier moisturiser', detail: 'Finish with a simple moisturiser; pause new actives if stinging, peeling or marked irritation develops.' }
    ];

    if (redness >= 55) {
      pm.splice(1, 0, { title: 'Redness buffer', detail: 'Use fewer active nights and prioritise fragrance-free products while the barrier settles.' });
    }

    const escalation = [];
    if (persistentWeeks >= 8 || blemish >= 75) {
      escalation.push('Consider a dermatologist if breakouts are painful, scarring, widespread, or unchanged after 8–12 weeks of a consistent routine.');
    }
    if (redness >= 80) escalation.push('Seek clinical advice for persistent burning, swelling, crusting, or rapidly worsening redness.');
    if (!escalation.length) escalation.push('Re-scan under similar lighting every 7–14 days and judge the trend, not one photo.');

    return {
      level,
      burden: round(burden, 1),
      am,
      pm,
      habits: [
        'Change pillowcases regularly and clean items that touch the face.',
        'Avoid picking; record products introduced so irritation has a traceable cause.',
        'Keep sleep, hydration and stress notes beside scans to spot personal patterns.'
      ],
      escalation,
      disclaimer: 'Cosmetic and educational guidance only — this is not a diagnosis or a promise to treat acne.'
    };
  }

  function correctExpressionGeometry(neutral = {}, open = {}) {
    const neutralOpening = clamp(neutral.mouthOpening, 0, 1);
    const openOpening = clamp(open.mouthOpening, 0, 1);
    const expressionSeverity = clamp((openOpening - neutralOpening) / 0.34, 0, 1);
    const remapWeight = clamp(0.58 + expressionSeverity * 0.32, 0.58, 0.9);

    const corrected = {
      cheekboneWidth: round(mix(open.cheekboneWidth, neutral.cheekboneWidth, 0.68 + expressionSeverity * 0.12), 4),
      jawWidth: round(mix(open.jawWidth, neutral.jawWidth, remapWeight), 4),
      gonialAngle: round(mix(open.gonialAngle, neutral.gonialAngle, remapWeight), 1),
      mouthOpening: round(neutralOpening, 4)
    };

    const geometryAgreement = 1 - clamp(
      Math.abs((Number(open.cheekboneWidth) || 0) - (Number(neutral.cheekboneWidth) || 0)) * 2.5,
      0,
      0.65
    );
    const confidence = round(clamp(0.55 + 0.25 * expressionSeverity + 0.2 * geometryAgreement, 0, 1), 3);

    return {
      expressionSeverity: round(expressionSeverity, 3),
      corrected,
      confidence,
      note: expressionSeverity > 0.35
        ? 'Lower-face landmarks were remapped toward the neutral reference before angle calculation.'
        : 'Expression change was small; only a light correction was applied.'
    };
  }

  const LIP_PALETTE = [
    { name: 'Terracotta Veil', hex: '#A84E3F', undertones: ['warm', 'neutral'], depth: 3 },
    { name: 'Burnt Rose', hex: '#9D4F58', undertones: ['warm', 'neutral'], depth: 3 },
    { name: 'Berry Ink', hex: '#7B3558', undertones: ['cool', 'neutral'], depth: 4 },
    { name: 'Mulberry Wash', hex: '#6E304B', undertones: ['cool'], depth: 4 },
    { name: 'Rosewood', hex: '#874B4D', undertones: ['neutral', 'warm'], depth: 3 },
    { name: 'Cherry Water', hex: '#B3394A', undertones: ['cool', 'neutral'], depth: 3 },
    { name: 'Peach Tea', hex: '#C56C5A', undertones: ['warm'], depth: 2 },
    { name: 'Cocoa Plum', hex: '#704048', undertones: ['neutral', 'cool'], depth: 5 },
    { name: 'Brick Bloom', hex: '#974438', undertones: ['warm'], depth: 4 },
    { name: 'Soft Mauve', hex: '#9A6172', undertones: ['cool', 'neutral'], depth: 2 },
    { name: 'Fig Nude', hex: '#7E514E', undertones: ['neutral', 'warm'], depth: 3 },
    { name: 'Raspberry Tint', hex: '#A6325B', undertones: ['cool'], depth: 3 }
  ];

  function hexToRgb(hex) {
    const clean = String(hex || '').replace('#', '').trim();
    if (!/^[0-9a-f]{6}$/i.test(clean)) return { r: 128, g: 96, b: 96 };
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16)
    };
  }

  function colourDistance(a, b) {
    const ca = hexToRgb(a);
    const cb = hexToRgb(b);
    return Math.hypot(ca.r - cb.r, ca.g - cb.g, ca.b - cb.b) / 441.673;
  }

  function recommendLipStains(options = {}) {
    const undertone = normalizeUndertone(options.undertone);
    const intensity = String(options.intensity || 'medium').toLowerCase();
    const desiredDepth = intensity === 'light' ? 2 : intensity === 'deep' ? 5 : 3;
    const naturalLip = options.lipHex || '#8F5960';

    return LIP_PALETTE
      .map((shade) => {
        const undertoneScore = shade.undertones.includes(undertone) ? 3 : shade.undertones.includes('neutral') ? 1.5 : 0;
        const depthScore = 2 - Math.min(2, Math.abs(shade.depth - desiredDepth) * 0.65);
        const contrast = colourDistance(shade.hex, naturalLip);
        const contrastScore = intensity === 'light' ? 1 - contrast : intensity === 'deep' ? contrast : 1 - Math.abs(contrast - 0.42);
        return { ...shade, score: undertoneScore + depthScore + contrastScore };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((shade) => ({
        name: shade.name,
        hex: shade.hex,
        undertones: shade.undertones,
        finish: options.finish || 'stain',
        why: `${shade.undertones.includes(undertone) ? 'Matches' : 'Balances'} your ${undertone} undertone with ${intensity} contrast against your natural lip colour.`,
        wearTip: 'Apply one thin layer, blot, then add a second layer only at the centre for longer-looking, even wear.'
      }));
  }

  function buildNeckCarePlan(input = {}) {
    const postureAngle = Number(input.postureAngle);
    const redness = clamp(input.redness, 0, 100);
    const unevenness = clamp(input.unevenness, 0, 100);
    const sensitive = Boolean(input.sensitive);
    const shaves = Boolean(input.shaves);
    const steps = [
      { title: 'Extend face care to the neck', detail: 'Use the same gentle cleanser and moisturiser down to the collarbone; avoid aggressive scrubs.' },
      { title: 'Daily neck SPF', detail: 'Apply broad-spectrum SPF 30+ to the front, sides and back of the neck.' }
    ];

    if (Number.isFinite(postureAngle) && postureAngle < 50) {
      steps.push({ title: 'Posture reset', detail: 'Try short chin-tuck and upper-back strength sessions; stop if movement causes pain, numbness or dizziness.' });
    } else {
      steps.push({ title: 'Posture maintenance', detail: 'Keep screens near eye level and alternate positions instead of holding one posture for long periods.' });
    }

    if (shaves) {
      steps.push({
        title: 'Low-irritation shaving',
        detail: sensitive || redness > 45
          ? 'Use a fragrance-free shave medium, shave with the grain, avoid repeated passes, and moisturise afterward.'
          : 'Use a clean sharp blade, shave with the grain, and rinse away residue before moisturising.'
      });
    }
    if (redness > 55 || unevenness > 55) {
      steps.push({ title: 'Slow introduction rule', detail: 'Introduce only one neck product at a time and patch-test because neck skin can react differently from facial skin.' });
    }

    return {
      steps,
      tracking: 'Photograph the neck in the same light every two weeks and compare comfort, redness and evenness rather than chasing a single score.',
      disclaimer: 'Cosmetic guidance only, not medical advice. Persistent rash, pain, swelling, darkening or sudden change needs professional assessment.'
    };
  }

  function estimateWaistMetrics(input = {}) {
    const shoulderWidth = Math.abs((Number(input.rightShoulderX) || 0) - (Number(input.leftShoulderX) || 0));
    const waistWidth = Math.abs((Number(input.rightWaistX) || 0) - (Number(input.leftWaistX) || 0));
    const hipWidth = Math.abs((Number(input.rightHipX) || 0) - (Number(input.leftHipX) || 0));
    const imageWidth = Math.max(1, Number(input.imageWidth) || 1);
    const plausible = shoulderWidth > imageWidth * 0.12 && waistWidth > imageWidth * 0.08 && hipWidth > imageWidth * 0.1;
    const shapePlausible = waistWidth < Math.max(shoulderWidth, hipWidth) * 1.25 && waistWidth > Math.min(shoulderWidth, hipWidth) * 0.45;
    const confidence = round(clamp(
      0.55 * clamp(input.poseConfidence, 0, 1) +
      0.35 * clamp(input.edgeConfidence, 0, 1) +
      0.1 * (plausible && shapePlausible ? 1 : 0),
      0,
      1
    ), 3);

    return {
      valid: plausible && shapePlausible && confidence >= 0.45,
      shoulderWidth: round(shoulderWidth, 1),
      waistWidth: round(waistWidth, 1),
      hipWidth: round(hipWidth, 1),
      waistToHip: hipWidth ? round(waistWidth / hipWidth, 3) : null,
      shoulderToWaist: waistWidth ? round(shoulderWidth / waistWidth, 3) : null,
      torsoTiltDeg: round(input.torsoTiltDeg, 1),
      confidence,
      note: 'Photo-derived proportions are sensitive to clothing, lens distance, pose and background contrast.'
    };
  }

  function waistPreviewScaleAt(y, options = {}) {
    const shoulderY = Number(options.shoulderY);
    const waistY = Number(options.waistY);
    const hipY = Number(options.hipY);
    if (![shoulderY, waistY, hipY].every(Number.isFinite) || shoulderY >= waistY || waistY >= hipY) return 1;
    const amount = clamp(options.amount, 0, 0.18);
    if (y <= shoulderY || y >= hipY) return 1;
    const distance = y <= waistY
      ? (waistY - y) / (waistY - shoulderY)
      : (y - waistY) / (hipY - waistY);
    return round(1 - amount * (1 - clamp(distance, 0, 1)), 4);
  }

  function buildBodyPlan(metrics = {}) {
    const tilt = Math.abs(Number(metrics.torsoTiltDeg) || 0);
    const actions = [
      {
        title: 'Whole-body strength',
        detail: 'Use progressive resistance for legs, back, shoulders and core two to four times weekly, adjusted to your experience and recovery.'
      },
      {
        title: 'Nutrition consistency',
        detail: 'Use sustainable meals with adequate protein, fibre and hydration; waist change cannot be targeted to one body area.'
      },
      {
        title: 'Sleep and recovery',
        detail: 'Track sleep and stress beside measurements because short-term water retention can change the silhouette.'
      }
    ];
    actions.unshift(tilt >= 6
      ? { title: 'Posture and symmetry', detail: 'Add upper-back, hip and core stability work, and retake the photo in a neutral stance before comparing proportions.' }
      : { title: 'Keep the measurement neutral', detail: 'Use the same camera height, distance, clothing and relaxed stance for every comparison.' });

    return {
      actions,
      measurementRule: 'Track a multi-week trend using the same setup. Do not use one photo as a health or attractiveness score.',
      previewDisclaimer: 'The waist preview is illustrative only. It is not a forecast, medical outcome, or promise of how your body will change.'
    };
  }

  return {
    clamp,
    round,
    normalizeUndertone,
    buildSkinRecoveryPlan,
    correctExpressionGeometry,
    recommendLipStains,
    buildNeckCarePlan,
    estimateWaistMetrics,
    waistPreviewScaleAt,
    buildBodyPlan
  };
});
