const test = require('node:test');
const assert = require('node:assert/strict');

const ui = require('../www/chisel-enhancements.js');

function memoryStorage(seed = {}) {
  const data = { ...seed };
  return {
    getItem(key) { return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null; },
    setItem(key, value) { data[key] = String(value); },
    removeItem(key) { delete data[key]; },
    key(index) { return Object.keys(data)[index] ?? null; },
    get length() { return Object.keys(data).length; },
    dump() { return { ...data }; }
  };
}

test('module catalog exposes every missing feature as a distinct lab', () => {
  assert.deepEqual(ui.MODULES.map((item) => item.id), ['skin', 'expression', 'lips', 'neck', 'body']);
  assert.ok(ui.MODULES.every((item) => item.title && item.summary));
});

test('shell is an accessible modal with local-only and non-medical disclosure', () => {
  const html = ui.buildShellHtml();
  assert.match(html, /role="dialog"/);
  assert.match(html, /aria-modal="true"/);
  assert.match(html, /local-only/i);
  assert.match(html, /not medical/i);
  for (const module of ui.MODULES) assert.match(html, new RegExp(module.title, 'i'));
});

test('latest scan reader handles prefixed localStorage records', () => {
  const storage = memoryStorage({
    'chisel:scans': JSON.stringify([
      { t: 10, blemish: 20 },
      { t: 20, blemish: 45, undertone: 'Warm' }
    ])
  });
  assert.deepEqual(ui.readLatestScan(storage), { t: 20, blemish: 45, undertone: 'Warm' });
});

test('state store round-trips module progress and recovers from malformed data', () => {
  const storage = memoryStorage({ 'chisel:enhancements:v1': '{broken' });
  const state = ui.createStateStore(storage);
  assert.equal(state.get().version, 1);
  state.patch({ skinChecks: { cleanser: true } });
  assert.equal(state.get().skinChecks.cleanser, true);
  assert.match(storage.dump()['chisel:enhancements:v1'], /skinChecks/);
});

test('body preview warp keeps output canvas dimensions stable', () => {
  const calls = [];
  const source = { width: 100, height: 120 };
  const context = {
    clearRect: (...args) => calls.push(['clearRect', ...args]),
    drawImage: (...args) => calls.push(['drawImage', ...args])
  };
  const canvas = { width: 0, height: 0, getContext: () => context };
  ui.renderWaistPreview(source, canvas, { shoulderY: 0.2, waistY: 0.5, hipY: 0.78, amount: 0.1 });
  assert.equal(canvas.width, 100);
  assert.equal(canvas.height, 120);
  assert.ok(calls.filter((call) => call[0] === 'drawImage').length > 20);
});

test('body analysis can preserve a clean source canvas before drawing measurement overlays', () => {
  const calls = [];
  const source = { width: 320, height: 480 };
  const copyContext = { drawImage: (...args) => calls.push(args) };
  const documentStub = { createElement: () => ({ width: 0, height: 0, getContext: () => copyContext }) };
  const clone = ui.cloneCanvasSurface(source, documentStub);
  assert.equal(clone.width, 320);
  assert.equal(clone.height, 480);
  assert.deepEqual(calls[0], [source, 0, 0]);
});
