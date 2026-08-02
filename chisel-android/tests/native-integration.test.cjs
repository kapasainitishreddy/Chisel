const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const hash = (p) => crypto.createHash('sha256').update(read(p)).digest('hex');

test('MainActivity injects Chisel Labs assets in dependency order with an idempotent guard', () => {
  const java = read('android/app/src/main/java/com/chisel/lookmax/MainActivity.java');
  assert.match(java, /onCreate/);
  assert.match(java, /evaluateJavascript/);
  assert.match(java, /__chiselLabsNativeInjected/);
  const core = java.indexOf('chisel-enhancements-core.js');
  const css = java.indexOf('chisel-enhancements.css');
  const ui = java.indexOf('chisel-enhancements.js');
  assert.ok(core >= 0 && css >= 0 && ui >= 0);
  assert.ok(core < ui, 'core must load before UI');
});

test('synced Android enhancement assets exactly match the canonical www copies', () => {
  for (const file of ['chisel-enhancements-core.js', 'chisel-enhancements.js', 'chisel-enhancements.css']) {
    assert.equal(
      hash(`www/${file}`),
      hash(`android/app/src/main/assets/public/${file}`),
      `${file} differs between www and Android assets`
    );
  }
});
