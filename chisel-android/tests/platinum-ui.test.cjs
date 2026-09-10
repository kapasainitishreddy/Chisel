const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const www = path.join(__dirname, '../www');
const read = name => fs.readFileSync(path.join(www, name), 'utf8');
test('platinum theme and zoom permission are set before optional feature boot', () => {
  const loader = read('chisel-ar-coach-core.js');
  assert.match(loader, /dataset.chiselTheme='platinum'/);
  assert.match(loader, /theme.href='chisel-platinum.css'/);
  assert.match(loader, /viewport.content='width=device-width, initial-scale=1, viewport-fit=cover'/);
  assert.ok(loader.indexOf("dataset.chiselTheme='platinum'") < loader.indexOf("await addScript('chisel-beauty-studio.js')"));
});
test('platinum styles define one theme, readable controls and reduced motion', () => {
  const css = read('chisel-platinum.css');
  for (const token of ['--cp-bg', '--cp-surface', '--cp-text', '--cp-muted', '--cp-accent', '--cp-radius']) assert.ok(css.includes(token));
  assert.match(css, /min-height:\s*48px/);
  assert.match(css, /focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /safe-area-inset-bottom/);
  assert.match(css, /\.cp-dialog-body/);
});
test('platinum UI preserves the real shell, moves tools, and retains safety disclosures', () => {
  const js = read('chisel-platinum-ui.js');
  new vm.Script(js);
  assert.match(js, /ChiselPlatinum/);
  assert.match(js, /cpToolDock/);
  assert.match(js, /chiselLabsLauncher/);
  assert.match(js, /chiselPrecisionLauncher/);
  assert.match(js, /cpTrainerDetails/);
  assert.match(js, /\.ar-safety/);
  assert.match(js, /\.ctv2-trust/);
  assert.doesNotMatch(js, /fetch\(|getUserMedia\(|detectForVideo\(|localStorage\.setItem/);
});
test('theme runs after reliability, preserving its overrides', () => {
  const source = read('chisel-ar-coach-core.js');
  assert.ok(source.indexOf("addScript('chisel-platinum-ui.js')") > source.indexOf("addScript('chisel-reliability-runtime.js')"));
});
test('platinum assets are packaged byte-for-byte for Android', () => {
  for (const name of ['chisel-platinum.css', 'chisel-platinum-ui.js', 'index.html', 'chisel-ar-coach-core.js']) {
    assert.equal(read(name), fs.readFileSync(path.join(__dirname, '../android/app/src/main/assets/public', name), 'utf8'), name);
  }
});
