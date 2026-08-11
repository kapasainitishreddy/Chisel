const test = require('node:test');
const assert = require('node:assert/strict');

const coach = require('../www/chisel-ar-coach-core.js');

function faceFixture({ smile = false, asymmetric = false, open = 0.02 } = {}) {
  const points = Array.from({ length: 468 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  points[234] = { x: 0.2, y: 0.5, z: 0 };
  points[454] = { x: 0.8, y: 0.5, z: 0 };
  points[33] = { x: 0.35, y: 0.4, z: 0 };
  points[263] = { x: 0.65, y: 0.4, z: 0 };
  points[10] = { x: 0.5, y: 0.2, z: 0 };
  points[152] = { x: 0.5, y: 0.84, z: 0 };
  points[1] = { x: 0.5, y: 0.48, z: -0.02 };
  points[13] = { x: 0.5, y: 0.59 - open / 2, z: 0 };
  points[14] = { x: 0.5, y: 0.59 + open / 2, z: 0 };
  points[61] = { x: 0.4, y: smile ? 0.55 : 0.62, z: 0 };
  points[291] = { x: 0.6, y: asymmetric ? 0.62 : (smile ? 0.55 : 0.62), z: 0 };
  return points;
}

test('catalog offers jaw, cheek and full sessions without forceful jaw moves', () => {
  assert.deepEqual(Object.keys(coach.SESSIONS), ['jaw', 'cheek', 'full']);
  const names = coach.EXERCISES.map((item) => item.name).join(' ');
  assert.doesNotMatch(names, /clench|jut/i);
  assert.ok(coach.EXERCISES.every((item) => item.evidence && item.safety));
});

test('safety copy rejects bone reshaping and warns about symptoms', () => {
  assert.match(coach.SAFETY_COPY, /does not reshape adult facial bones/i);
  assert.match(coach.SAFETY_COPY, /pain|clicking|locking|dizziness/i);
});

test('neutral alignment passes posture form but not cheek-raise form', () => {
  const signals = coach.signalsFromLandmarks(faceFixture());
  assert.equal(coach.evaluateForm(coach.exerciseById('chin-tuck'), signals).accepted, true);
  const cheek = coach.evaluateForm(coach.exerciseById('cheek-raise'), signals);
  assert.equal(cheek.accepted, false);
  assert.match(cheek.correction, /lift/i);
});

test('symmetric cheek lift passes while asymmetric lift returns a correction', () => {
  const raised = coach.signalsFromLandmarks(faceFixture({ smile: true }));
  assert.equal(coach.evaluateForm(coach.exerciseById('cheek-raise'), raised).accepted, true);
  const uneven = coach.signalsFromLandmarks(faceFixture({ smile: true, asymmetric: true }));
  const form = coach.evaluateForm(coach.exerciseById('cheek-raise'), uneven);
  assert.equal(form.accepted, false);
  assert.match(form.correction, /evenly/i);
});

test('bad form resets the hold and accepted form completes only after hold duration', () => {
  let state = coach.createState('cheek', 1000);
  state = coach.advanceState(state, { accepted: true, correction: '' }, 1000);
  assert.equal(state.holdStartedAt, 1000);
  state = coach.advanceState(state, { accepted: false, correction: 'Lift gently' }, 2000);
  assert.equal(state.holdStartedAt, 0);
  assert.equal(state.rep, 0);
  state = coach.advanceState(state, { accepted: true, correction: '' }, 3000);
  state = coach.advanceState(state, { accepted: true, correction: '' }, 5999);
  assert.equal(state.rep, 0);
  state = coach.advanceState(state, { accepted: true, correction: '' }, 6000);
  assert.equal(state.rep, 1);
  assert.equal(state.event, 'rep');
});

test('missing landmarks fail closed with a centering correction', () => {
  const signals = coach.signalsFromLandmarks([]);
  const form = coach.evaluateForm(coach.exerciseById('neck-length'), signals);
  assert.equal(form.accepted, false);
  assert.match(form.correction, /center/i);
});
