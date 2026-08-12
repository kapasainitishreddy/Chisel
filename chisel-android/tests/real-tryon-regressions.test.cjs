const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'www/index.html'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'www/chisel-ar-coach-core.js'), 'utf8');

test('Men/Women label repair is mutation-safe and cannot recursively rewrite identical labels', () => {
  assert.match(runtime, /buttons\[0\]\.textContent!=='Men'/);
  assert.match(runtime, /buttons\[1\]\.textContent!=='Women'/);
});

test('try-on uses customer-facing Men/Women labels in the canonical renderer', () => {
  assert.match(index, /g==='men'\?'Men':'Women'/);
  assert.doesNotMatch(index, /g==='men'\?'Short styles':'Long styles'/);
});

test('generic try-on starts clean and face matching never auto-applies facial hair', () => {
  assert.match(index, /styleHair=2; styleBeard=0;/);
  const applyStart = index.indexOf('function applyMatches(){');
  const applyEnd = index.indexOf('function chipBtn(', applyStart);
  assert.ok(applyStart >= 0 && applyEnd > applyStart);
  const applyBody = index.slice(applyStart, applyEnd);
  assert.doesNotMatch(applyBody, /matchBeardIds\(\)/);
  assert.doesNotMatch(applyBody, /styleBeard\s*=/);
});
