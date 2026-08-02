const test = require('node:test');
const assert = require('node:assert/strict');

const core = require('../www/chisel-enhancements-core.js');

test('skin recovery plan escalates persistent high-blemish scans without diagnosing', () => {
  const plan = core.buildSkinRecoveryPlan(
    { blemish: 82, redLevel: 66, oilPct: 74, skinEven: 42 },
    { sensitive: true, persistentWeeks: 10 }
  );

  assert.equal(plan.level, 'support-needed');
  assert.match(plan.disclaimer, /not a diagnosis/i);
  assert.ok(plan.am.some((step) => /sunscreen/i.test(step.title)));
  assert.ok(plan.pm.some((step) => /salicylic|benzoyl/i.test(`${step.title} ${step.detail}`)));
  assert.ok(plan.escalation.some((item) => /dermatologist/i.test(item)));
  assert.ok(plan.pm.every((step) => !/cure/i.test(`${step.title} ${step.detail}`)));
});

test('expression calibration remaps open-mouth jaw geometry toward neutral measurements', () => {
  const result = core.correctExpressionGeometry(
    { cheekboneWidth: 0.91, jawWidth: 0.77, gonialAngle: 121, mouthOpening: 0.04 },
    { cheekboneWidth: 0.93, jawWidth: 0.68, gonialAngle: 136, mouthOpening: 0.31 }
  );

  assert.ok(result.expressionSeverity > 0.75);
  assert.ok(Math.abs(result.corrected.jawWidth - 0.77) < Math.abs(0.68 - 0.77));
  assert.ok(Math.abs(result.corrected.gonialAngle - 121) < Math.abs(136 - 121));
  assert.ok(result.corrected.cheekboneWidth >= 0.91 && result.corrected.cheekboneWidth <= 0.93);
  assert.ok(result.confidence >= 0 && result.confidence <= 1);
});

test('lip stain matcher prioritizes undertone-compatible shades and returns usable metadata', () => {
  const shades = core.recommendLipStains({
    undertone: 'Warm',
    skinHex: '#C98B6B',
    lipHex: '#8F4D55',
    intensity: 'medium',
    finish: 'stain'
  });

  assert.equal(shades.length, 5);
  assert.ok(shades[0].undertones.includes('warm'));
  assert.match(shades[0].why, /undertone|contrast/i);
  assert.match(shades[0].hex, /^#[0-9A-F]{6}$/i);
});

test('neck care plan covers posture, sun care, and shaving irritation without medical claims', () => {
  const plan = core.buildNeckCarePlan({
    postureAngle: 43,
    redness: 62,
    unevenness: 55,
    shaves: true,
    sensitive: true
  });

  assert.ok(plan.steps.some((step) => /spf|sunscreen/i.test(`${step.title} ${step.detail}`)));
  assert.ok(plan.steps.some((step) => /shav/i.test(`${step.title} ${step.detail}`)));
  assert.ok(plan.steps.some((step) => /posture|chin tuck/i.test(`${step.title} ${step.detail}`)));
  assert.match(plan.disclaimer, /cosmetic|not medical/i);
});

test('waist geometry reports ratios and confidence from a valid silhouette', () => {
  const metrics = core.estimateWaistMetrics({
    imageWidth: 1000,
    leftShoulderX: 250,
    rightShoulderX: 750,
    leftWaistX: 340,
    rightWaistX: 660,
    leftHipX: 300,
    rightHipX: 700,
    torsoTiltDeg: 3,
    edgeConfidence: 0.88,
    poseConfidence: 0.93
  });

  assert.equal(metrics.shoulderWidth, 500);
  assert.equal(metrics.waistWidth, 320);
  assert.equal(metrics.hipWidth, 400);
  assert.equal(metrics.waistToHip, 0.8);
  assert.equal(metrics.shoulderToWaist, 1.563);
  assert.ok(metrics.confidence > 0.8);
  assert.equal(metrics.valid, true);
});

test('waist preview scale is strongest at the waist and bounded', () => {
  const top = core.waistPreviewScaleAt(0.2, { shoulderY: 0.2, waistY: 0.5, hipY: 0.78, amount: 0.12 });
  const waist = core.waistPreviewScaleAt(0.5, { shoulderY: 0.2, waistY: 0.5, hipY: 0.78, amount: 0.12 });
  const hip = core.waistPreviewScaleAt(0.78, { shoulderY: 0.2, waistY: 0.5, hipY: 0.78, amount: 0.12 });

  assert.equal(top, 1);
  assert.equal(hip, 1);
  assert.equal(waist, 0.88);
  assert.ok(core.waistPreviewScaleAt(0.5, { shoulderY: 0.2, waistY: 0.5, hipY: 0.78, amount: 0.8 }) >= 0.82);
});

test('body plan avoids guaranteed transformation language', () => {
  const plan = core.buildBodyPlan({ waistToHip: 0.86, shoulderToWaist: 1.34, torsoTiltDeg: 9, confidence: 0.79 });
  const copy = JSON.stringify(plan);
  assert.doesNotMatch(copy, /guarantee|will reshape|spot reduce|cure/i);
  assert.ok(plan.actions.some((item) => /posture|strength|sleep|nutrition/i.test(`${item.title} ${item.detail}`)));
  assert.match(plan.previewDisclaimer, /illustrative/i);
});
