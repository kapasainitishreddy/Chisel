const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ui = require('../www/chisel-looks-studio.js');
const read = name => fs.readFileSync(path.join(__dirname, '../www', name), 'utf8');

test('selection names come from the actual catalog rather than invented thumbnails', async () => {
  const catalog = await import('../www/chisel-look-catalog.mjs');
  assert.equal(typeof ui.selectionView, 'function');
  const view = ui.selectionView(catalog, 'hair', 'crop');
  assert.equal(view.name, catalog.CATALOG.hair.find(p => p.id === 'crop').label);
  assert.equal(view.label, 'Hairstyle');
  assert.equal(view.count, 25);
  assert.equal(ui.selectionView(catalog, 'eyewear', 'round').label, 'Frames');
});
test('unknown categories and presets never render a fabricated selection', async () => {
  const catalog = await import('../www/chisel-look-catalog.mjs');
  assert.equal(typeof ui.selectionView, 'function');
  assert.equal(ui.selectionView(catalog, '__proto__', 'crop'), null);
  assert.equal(ui.selectionView(catalog, 'hair', 'unknown'), null);
});
test('browse search preserves all catalog choices and safely filters case-insensitively', () => {
  assert.equal(typeof ui.matchesPreset, 'function');
  assert.equal(ui.matchesPreset({label:'Textured crop'}, '  CROP '), true);
  assert.equal(ui.matchesPreset({label:'Textured crop'}, ''), true);
  assert.equal(ui.matchesPreset({label:'Textured crop'}, 'bob'), false);
});
test('the dedicated workspace has real native dialogs, photo canvas and deliberate catalog discovery', () => {
  const js = read('chisel-looks-studio.js');
  for (const name of ['clsEditor','clsPortrait','clsBrowser','clsSearch','clsLibrary','clsSwatches','clsSelectedName']) assert.ok(js.includes(name), name);
  assert.match(js, /showModal\(\)/);
  assert.match(js, /preventScroll:true/);
  assert.ok(js.includes('Upload only after confirmation'));
});
test('workspace layout makes the original photo and primary action coexist on mobile', () => {
  const css = read('chisel-looks-studio.css');
  assert.match(css, /\.cls-workspace/);
  assert.match(css, /\.cls-photo-stage/);
  assert.match(css, /object-fit:contain/);
  assert.match(css, /safe-area-inset-bottom/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /\.cls-swatch/);
});
test('new editor uses the saved display photo but preserves existing original-file preparation and consent', () => {
  const js = read('chisel-looks-studio.js');
  assert.ok(js.includes("q('#clsPortrait')"));
  assert.ok(js.includes('await store.original()'));
  assert.ok(js.includes('!await consent()'));
  assert.ok(js.includes("type='button'"));
});

test('leaving the editor invalidates pre-upload preparation without canceling submitted jobs', () => {
  const js = read('chisel-looks-studio.js');
  const close = js.slice(js.indexOf('function closeEditor(){'), js.indexOf('function syncPortrait('));
  assert.match(close, /if\(preparing\)\{epoch\+\+;preparing=false;/);
  assert.doesNotMatch(close, /controller\.cancel\(/);
});
test('late downloaded results do not reopen or scroll a workspace the user closed', () => {
  const js = read('chisel-looks-studio.js');
  const display = js.slice(js.indexOf('function displayResult('), js.indexOf('function openBrowser('));
  const load = js.slice(js.indexOf('async function loadResult('), js.indexOf('async function generate('));
  assert.doesNotMatch(display, /openEditor\(/);
  assert.doesNotMatch(load, /q\('#clsPanel'\)\.open=true/);
  assert.match(load, /if\(editor\.open\)q\('#clsResult'\)\.scrollIntoView/);
});
test('the search field has a single accessible focus outline, not stacked frames', () => {
  const css = read('chisel-looks-studio.css');
  assert.match(css, /\.cls-search:focus-within/);
  assert.match(css, /#clsSearch:focus-visible\s*\{[^}]*outline:none!important/);
});
