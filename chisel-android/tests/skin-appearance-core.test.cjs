const test = require('node:test');
const assert = require('node:assert/strict');

const skin = require('../www/chisel-skin-appearance-core.js');

function imageData(width, height, pixelFn) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const [r, g, b, a = 255] = pixelFn(x, y);
      const i = (y * width + x) * 4;
      data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = a;
    }
  }
  return { data, width, height };
}

test('skin appearance core exposes six cosmetic non-diagnostic metrics', () => {
  const keys = Object.keys(skin.METRIC_DEFS);
  assert.deepEqual(keys, ['redness', 'shine', 'texture', 'pores', 'blemishContrast', 'pigmentUnevenness']);
  for (const def of Object.values(skin.METRIC_DEFS)) {
    assert.match(def.label, /appearance|visible|variation|proxy|contrast|unevenness/i);
    assert.doesNotMatch(`${def.label} ${def.description}`, /diagnos|disease|acne severity|dehydrat/i);
  }
});

test('analyzePixelSet returns bounded scores and confidence', () => {
  const sample = imageData(24, 24, (x, y) => {
    const base = 142 + ((x + y) % 5) * 4;
    const redBoost = x > 12 && y > 10 ? 18 : 0;
    return [base + redBoost, base - 15, base - 22, 255];
  });
  const result = skin.analyzePixelSet(sample);
  for (const key of Object.keys(skin.METRIC_DEFS)) {
    assert.ok(Number.isFinite(result[key]), `${key} should be numeric`);
    assert.ok(result[key] >= 0 && result[key] <= 100, `${key} out of range: ${result[key]}`);
  }
  assert.ok(result.confidence >= 0 && result.confidence <= 100);
});

test('redder pixels produce a stronger redness appearance signal', () => {
  const neutral = imageData(20, 20, () => [150, 132, 122, 255]);
  const red = imageData(20, 20, () => [190, 112, 105, 255]);
  assert.ok(skin.analyzePixelSet(red).redness > skin.analyzePixelSet(neutral).redness);
});

test('specular highlights produce a stronger shine signal', () => {
  const matte = imageData(20, 20, (x, y) => [135 + ((x + y) % 2), 116, 106, 255]);
  const shiny = imageData(20, 20, (x, y) => ((x + y) % 4 === 0 ? [246, 241, 238, 255] : [140, 122, 112, 255]));
  assert.ok(skin.analyzePixelSet(shiny).shine > skin.analyzePixelSet(matte).shine);
});

test('aggregateRegions returns weighted metrics and a regional breakdown', () => {
  const regionResults = {
    forehead: { redness: 20, shine: 60, texture: 30, pores: 20, blemishContrast: 10, pigmentUnevenness: 25, confidence: 90, sampleCount: 100 },
    leftCheek: { redness: 45, shine: 20, texture: 35, pores: 40, blemishContrast: 30, pigmentUnevenness: 35, confidence: 80, sampleCount: 120 },
    rightCheek: { redness: 40, shine: 18, texture: 32, pores: 36, blemishContrast: 25, pigmentUnevenness: 30, confidence: 82, sampleCount: 120 },
    chin: { redness: 35, shine: 30, texture: 28, pores: 32, blemishContrast: 22, pigmentUnevenness: 28, confidence: 78, sampleCount: 90 }
  };
  const result = skin.aggregateRegions(regionResults);
  assert.deepEqual(Object.keys(result.regions), Object.keys(regionResults));
  assert.ok(result.redness > 20 && result.redness < 45);
  assert.ok(result.confidence > 0 && result.confidence <= 100);
});

test('summary uses cautious appearance language and produces ranked attention areas', () => {
  const summary = skin.buildAppearanceSummary({ redness: 72, shine: 35, texture: 48, pores: 58, blemishContrast: 64, pigmentUnevenness: 40, confidence: 86 });
  assert.ok(summary.attention.length >= 2);
  assert.match(summary.disclaimer, /cosmetic appearance/i);
  assert.match(summary.disclaimer, /not a diagnosis/i);
  const claims = JSON.stringify({ attention: summary.attention, headline: summary.headline, compareRule: summary.compareRule });
  assert.doesNotMatch(claims, /you have acne|skin disease|diagnosed|treats acne|cures/i);
});

test('signalBand gives stable low moderate high presentation labels', () => {
  assert.equal(skin.signalBand(20).key, 'low');
  assert.equal(skin.signalBand(50).key, 'moderate');
  assert.equal(skin.signalBand(85).key, 'high');
});
