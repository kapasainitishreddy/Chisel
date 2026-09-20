const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const coachCore = fs.readFileSync(path.join(root, 'www/chisel-ar-coach-core.js'), 'utf8');

function read(name) {
  return fs.readFileSync(path.join(root, 'www', name), 'utf8');
}

test('skin appearance runtime augments the existing skin panel with local regional analysis', () => {
  const js = read('chisel-skin-appearance.js');
  const css = read('chisel-skin-appearance.css');
  assert.doesNotThrow(() => new Function(js));
  assert.match(js, /chl-panel-skin/);
  assert.match(js, /forehead/);
  assert.match(js, /leftCheek/);
  assert.match(js, /rightCheek/);
  assert.match(js, /chin/);
  assert.match(js, /FaceLandmarker/);
  assert.match(js, /What I see/);
  assert.match(js, /What to do/);
  assert.match(js, /Compare next/);
  assert.match(js, /not a diagnosis|cosmetic appearance/i);
  assert.doesNotMatch(js, /you have acne|diagnosed|skin disease/i);
  assert.match(css, /grid-template-columns/);
  assert.match(css, /@media\s*\(max-width:\s*560px\)/);
  assert.match(css, /min-height:\s*44px|min-height:\s*48px/);
});

test('skin appearance core and css load before the browser runtime', () => {
  const coreIndex = coachCore.indexOf('chisel-skin-appearance-core.js');
  const cssIndex = coachCore.indexOf('chisel-skin-appearance.css');
  const runtimeIndex = coachCore.indexOf('chisel-skin-appearance.js');
  assert.ok(coreIndex >= 0, 'skin appearance core not bootstrapped');
  assert.ok(cssIndex >= 0, 'skin appearance css not bootstrapped');
  assert.ok(runtimeIndex >= 0, 'skin appearance runtime not bootstrapped');
  assert.ok(coreIndex < runtimeIndex, 'core must load before runtime');
  assert.ok(cssIndex < runtimeIndex, 'css must load before runtime');
});
