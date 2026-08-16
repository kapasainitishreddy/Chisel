const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));

test('product polish runtime exists, parses, and is mirrored into Android', () => {
  assert.ok(exists('www/chisel-product-polish.js'), 'product polish runtime missing');
  assert.doesNotThrow(() => require(path.join(root, 'www/chisel-product-polish.js')));
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

test('daily focus state is local, date-scoped, and explicitly completed by the user', () => {
  const polish = require(path.join(root, 'www/chisel-product-polish.js'));
  assert.equal(typeof polish.dayKey, 'function');
  assert.equal(typeof polish.dailyState, 'function');
  assert.equal(typeof polish.markDaily, 'function');
  const bag = new Map();
  const storage = {
    getItem: (key) => bag.has(key) ? bag.get(key) : null,
    setItem: (key, value) => bag.set(key, value)
  };
  const sunday = new Date('2026-08-16T12:00:00-04:00');
  const monday = new Date('2026-08-17T12:00:00-04:00');
  assert.equal(polish.dailyState(storage, sunday).done, false);
  polish.markDaily(storage, 'groom', sunday);
  assert.equal(polish.dailyState(storage, sunday).done, true);
  assert.equal(polish.dailyState(storage, sunday).action, 'groom');
  assert.equal(polish.dailyState(storage, monday).done, false);
});

test('home makes Measure Act Compare the primary daily product loop', () => {
  const js = read('www/chisel-product-polish.js');
  for (const token of ["Today's Chisel", 'Measure', 'Act', 'Compare', 'Mark focus complete', 'cxpDaily']) assert.match(js, new RegExp(token, 'i'));
  assert.match(js, /aria-live=["']polite["']/i);
  assert.match(js, /Do one useful thing today/i);
});

test('Pro presentation sells optional cloud value without dark patterns', () => {
  const js = read('www/chisel-product-polish.js');
  for (const token of ['What Pro adds', 'More photoreal', 'No ads', 'No account required', 'Charged by Google Play', 'Core stays local']) assert.match(js, new RegExp(token, 'i'));
  assert.doesNotMatch(js, /limited time|only today|last chance|people are viewing|spots left/i);
});
