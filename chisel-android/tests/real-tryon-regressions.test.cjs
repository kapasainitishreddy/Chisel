const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const runtime = fs.readFileSync(path.join(root, 'www/chisel-ar-coach-core.js'), 'utf8');
const fixPath = path.join(root, 'www/chisel-tryon-runtime-fixes.js');
const packagedFixPath = path.join(root, 'android/app/src/main/assets/public/chisel-tryon-runtime-fixes.js');
const fix = fs.readFileSync(fixPath, 'utf8');

test('Men/Women label repair is mutation-safe and cannot recursively rewrite identical labels', () => {
  assert.match(runtime, /buttons\[0\]\.textContent!=='Men'/);
  assert.match(runtime, /buttons\[1\]\.textContent!=='Women'/);
});

test('loader installs the user-controlled try-on fix before the polish layers', () => {
  const tryon = runtime.indexOf("chisel-tryon-runtime-fixes.js");
  const experience = runtime.indexOf("chisel-experience-polish.js");
  assert.ok(tryon >= 0);
  assert.ok(experience > tryon);
  assert.match(runtime, /ChiselTryonRuntimeFixes\.install\(\)/);
});

test('try-on fix is packaged exactly with Android', () => {
  assert.equal(fs.readFileSync(packagedFixPath, 'utf8'), fix);
  assert.doesNotThrow(() => new Function(fix));
});

test('generic try-on starts clean and face matching preserves a user-selected beard', () => {
  const nodes = {beardLab:{style:{}}, beardChips:{style:{}}};
  const context = {
    styleBeard: 0,
    styleGender: 'men',
    renderStyleChips(){},
    applyMatches(){ this.styleBeard = 5; },
    openStyle(){ this.styleBeard = 1; },
    document:{getElementById(id){return nodes[id] || null;}},
    console
  };
  context.globalThis = context;
  vm.runInNewContext(fix, context);
  context.ChiselTryonRuntimeFixes.install();

  context.openStyle();
  assert.equal(context.styleBeard, 0, 'generic try-on must start clean');

  context.applyMatches();
  assert.equal(context.styleBeard, 0, 'face matching must not silently add a beard');

  context.styleBeard = 2;
  context.applyMatches();
  assert.equal(context.styleBeard, 2, 'an explicit beard choice must survive later face matching');

  context.styleGender = 'women';
  context.styleBeard = 2;
  context.applyMatches();
  assert.equal(context.styleBeard, 0, 'Women Hair mode must not inherit facial hair');
  assert.equal(nodes.beardLab.style.display, 'none');
  assert.equal(nodes.beardChips.style.display, 'none');
});
