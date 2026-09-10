const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const coachCore = fs.readFileSync(path.join(root, 'www/chisel-ar-coach-core.js'), 'utf8');

function read(name) {
  return fs.readFileSync(path.join(root, 'www', name), 'utf8');
}

test('trainer v2 runtime upgrades the existing AR coach instead of creating a second modal', () => {
  const js = read('chisel-trainer-v2.js');
  const css = read('chisel-trainer-v2.css');
  assert.match(js, /#arCoachModal|arCoachModal/);
  assert.match(js, /Face & Neck Trainer|Face &amp; Neck Trainer/);
  assert.match(js, /cheek-builder/);
  assert.match(js, /jaw-chin/);
  assert.match(js, /chisel:coach-state/);
  assert.match(js, /form score/i);
  assert.doesNotMatch(js, /male routine|female routine|for men|for women/i);
  assert.match(css, /min-height:\s*44px|min-height:\s*48px/);
  assert.match(css, /prefers-reduced-motion/);
});

test('trainer bootstrap loads css before runtime and keeps core first', () => {
  const cssIndex = coachCore.indexOf("chisel-trainer-v2.css");
  const jsIndex = coachCore.indexOf("chisel-trainer-v2.js");
  assert.ok(cssIndex >= 0, 'trainer css missing from bootstrap');
  assert.ok(jsIndex >= 0, 'trainer runtime missing from bootstrap');
  assert.ok(cssIndex < jsIndex, 'trainer css should be registered before runtime');
});
