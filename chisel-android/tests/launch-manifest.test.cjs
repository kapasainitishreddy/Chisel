const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');

function manifest() {
  return JSON.parse(readFileSync(join(__dirname, '..', '..', 'launch', 'chisel.launch.json'), 'utf8'));
}

test('Chisel launch manifest stays truthful about availability and privacy', () => {
  const value = manifest();
  assert.equal(value.schemaVersion, 1);
  assert.equal(value.productId, 'chisel');
  assert.equal(value.status, 'Waitlist');
  assert.equal(value.evidence.releaseGate, 'pending');
  assert.equal(value.evidence.releaseReport, null);
  assert.equal(value.privacy.telemetry, 'none');
});

test('Chisel launch copy preserves anti-rating and evidence boundaries', () => {
  const value = manifest();
  const approved = [value.promise, value.problem, ...value.differentiators, ...value.allowedClaims].join('\n');
  assert.match(approved, /anti-rating|without turning your face into a rating/i);
  assert.match(approved, /evidence/i);
  assert.match(approved, /local|on-device/i);
  assert.doesNotMatch(approved, /highly accurate facial measurement/i);
  assert.doesNotMatch(approved, /clinically proven/i);
});

test('Chisel cannot be promoted to Live without passing release evidence', () => {
  const value = manifest();
  if (value.status === 'Live') {
    assert.equal(value.evidence.releaseGate, 'pass');
    assert.equal(typeof value.evidence.releaseReport, 'string');
    assert.ok(value.evidence.releaseReport.length > 0);
  }
});
