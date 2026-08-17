const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const polishPath = path.join(root, 'www/chisel-product-polish.js');

test('product polish runtime exists, parses, and is mirrored into Android', () => {
  assert.ok(exists('www/chisel-product-polish.js'), 'product polish runtime missing');
  assert.doesNotThrow(() => require(polishPath));
  assert.ok(exists('android/app/src/main/assets/public/chisel-product-polish.js'), 'Android product polish runtime missing');
  assert.equal(read('www/chisel-product-polish.js'), read('android/app/src/main/assets/public/chisel-product-polish.js'));
});

test('runtime exposes premium global accessibility and reduced-motion behavior', () => {
  const js = read('www/chisel-product-polish.js');
  assert.match(js, /focus-visible/);
  assert.match(js, /min-height:\s*44px/);
  assert.match(js, /prefers-reduced-motion/);
  assert.match(js, /overflow-wrap:\s*anywhere/);
});

test('home provides a clear four-action start hub', () => {
  const js = read('www/chisel-product-polish.js');
  for (const label of ['Scan now', 'Try-on Studio', 'Face Yoga', 'Routine']) assert.match(js, new RegExp(label, 'i'));
  for (const action of ['analyze', 'tryon', 'yoga', 'groom']) assert.match(js, new RegExp(`data-cxp-action=["']${action}["']`));
});

test('analyze and results explain trust instead of overclaiming accuracy', () => {
  const js = read('www/chisel-product-polish.js');
  for (const token of ['Local processing', 'Multi-frame', 'Weak scans are rejected', 'Photographic estimate']) assert.match(js, new RegExp(token, 'i'));
  assert.match(js, /capture quality/i);
  assert.doesNotMatch(js, /clinical accuracy|medical-grade|perfect accuracy/i);
});

test('visible copy is unisex and calmer', () => {
  const js = read('www/chisel-product-polish.js');
  assert.match(js, /See who/);
  assert.match(js, /appearance and grooming studio/i);
  assert.match(js, /Guided/);
  assert.doesNotMatch(js, /become more attractive|hotter|10\/10/i);
});

test('grooming flow prioritizes actions over scores', () => {
  const js = read('www/chisel-product-polish.js');
  for (const token of ['Choose one area', 'Follow the routine', 'Mark it complete', 'Compare later']) assert.match(js, new RegExp(token, 'i'));
});

test('empty states and privacy/paywall polish are explicit', () => {
  const js = read('www/chisel-product-polish.js');
  assert.match(js, /No comparable scans yet/i);
  assert.match(js, /Start with one good baseline/i);
  assert.match(js, /Core analysis stays on this device/i);
  assert.match(js, /Photoreal renders are optional cloud features/i);
  assert.match(js, /Restore purchases/i);
});

test('dynamic feature runtime loads product polish after experience polish', () => {
  const runtime = read('www/chisel-ar-coach-core.js');
  const experience = runtime.indexOf('chisel-experience-polish.js');
  const product = runtime.indexOf('chisel-product-polish.js');
  assert.ok(experience >= 0, 'experience polish runtime missing');
  assert.ok(product > experience, 'product polish must load after experience polish');
  assert.match(runtime, /ChiselProductPolish\.install\(\)/);
});

test('route polish keeps current navigation semantic and motion reduced-motion safe', () => {
  const js = read('www/chisel-product-polish.js');
  assert.match(js, /aria-current/);
  assert.match(js, /cxp-entering/);
  assert.match(js, /@keyframes\s+cxpScreenIn/);
  assert.match(js, /prefers-reduced-motion/);
  assert.match(js, /__cxpWrapped/);
});

test('controls get useful names and toast status is announced politely', () => {
  const js = read('www/chisel-product-polish.js');
  assert.match(js, /Switch camera/);
  assert.match(js, /Capture photo/);
  assert.match(js, /aria-live/);
  assert.match(js, /polite/);
  assert.doesNotMatch(js, /aria-label[^\n]{0,80}Activate/);
});

test('semantic camera names win over icon glyph text and generic fallback labels', () => {
  const {controlLabel} = require(polishPath);
  const fake = (id, textContent, ariaLabel='') => ({
    id,
    textContent,
    classList:{contains:()=>false},
    getAttribute:(name)=>name==='aria-label'?ariaLabel:''
  });
  assert.equal(controlLabel(fake('camFlip','↻')), 'Switch camera');
  assert.equal(controlLabel(fake('camShot','◉')), 'Capture photo');
  assert.equal(controlLabel(fake('camFlip','↻','Activate')), 'Switch camera');
  assert.equal(controlLabel(fake('pickerX','×','Activate')), 'Close style picker');
  assert.equal(controlLabel(fake('plainAction','Readable action')), 'Readable action');
});

test('home quick actions guard against accidental double activation', () => {
  const js = read('www/chisel-product-polish.js');
  assert.match(js, /aria-busy/);
  assert.match(js, /lockAction/);
  assert.match(js, /disabled\s*=\s*true/);
  assert.match(js, /data-cxp-action/);
});
