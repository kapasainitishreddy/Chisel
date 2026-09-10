const test = require('node:test');
const assert = require('node:assert/strict');

const coach = require('../www/chisel-ar-coach-core.js');

function faceFixture({ smile = false, asymmetric = false, open = 0.02, eyeTilt = 0 } = {}) {
  const points = Array.from({ length: 468 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  points[234] = { x: 0.2, y: 0.5, z: 0 };
  points[454] = { x: 0.8, y: 0.5, z: 0 };
  points[33] = { x: 0.35, y: 0.4, z: 0 };
  points[263] = { x: 0.65, y: 0.4 + eyeTilt, z: 0 };
  points[10] = { x: 0.5, y: 0.2, z: 0 };
  points[152] = { x: 0.5, y: 0.84, z: 0 };
  points[1] = { x: 0.5, y: 0.48, z: -0.02 };
  points[13] = { x: 0.5, y: 0.59 - open / 2, z: 0 };
  points[14] = { x: 0.5, y: 0.59 + open / 2, z: 0 };
  points[61] = { x: 0.4, y: smile ? 0.55 : 0.62, z: 0 };
  points[291] = { x: 0.6, y: asymmetric ? 0.62 : (smile ? 0.55 : 0.62), z: 0 };
  return points;
}

test('trainer exposes unisex goal-based sessions rather than gender routines', () => {
  for (const id of ['jaw-chin', 'cheek-builder', 'release', 'full']) {
    assert.ok(coach.SESSIONS[id], `missing ${id}`);
  }
  const catalog = JSON.stringify({ sessions: coach.SESSIONS, exercises: coach.EXERCISES });
  assert.doesNotMatch(catalog, /\b(men|women|male|female)\b/i);
  assert.doesNotMatch(catalog, /clench|jaw jut|bone reshape|spot[- ]reduce/i);
});

test('each exercise declares evidence and whether Chisel can form-track it', () => {
  assert.ok(coach.FORM_TRACKING);
  assert.ok(coach.EXERCISES.length >= 7);
  for (const exercise of coach.EXERCISES) {
    assert.ok(['form', 'guided'].includes(exercise.tracking), `${exercise.id} missing tracking mode`);
    assert.ok(exercise.evidence);
    assert.ok(exercise.safety);
  }
});

test('form score is bounded and rewards centered symmetric cheek form', () => {
  assert.equal(typeof coach.scoreForm, 'function');
  const exercise = coach.exerciseById('cheek-raise');
  const good = coach.signalsFromLandmarks(faceFixture({ smile: true }));
  const bad = coach.signalsFromLandmarks(faceFixture({ smile: true, asymmetric: true, eyeTilt: 0.04 }));
  const goodScore = coach.scoreForm(exercise, good);
  const badScore = coach.scoreForm(exercise, bad);
  assert.ok(goodScore >= 80 && goodScore <= 100, `good score ${goodScore}`);
  assert.ok(badScore >= 0 && badScore < goodScore, `bad score ${badScore}`);
});

test('evaluateForm includes score and preserves corrective feedback', () => {
  const exercise = coach.exerciseById('cheek-raise');
  const uneven = coach.signalsFromLandmarks(faceFixture({ smile: true, asymmetric: true }));
  const form = coach.evaluateForm(exercise, uneven);
  assert.equal(typeof form.score, 'number');
  assert.equal(form.accepted, false);
  assert.match(form.correction, /evenly/i);
});

test('guided posture exercises are explicitly not presented as camera-verified anatomy change', () => {
  const guided = coach.EXERCISES.filter((item) => item.tracking === 'guided');
  assert.ok(guided.length >= 2);
  for (const exercise of guided) {
    assert.match(exercise.safety, /gentle|comfortable|pain|dizz|small|relax/i);
  }
  assert.match(coach.SAFETY_COPY, /does not reshape adult facial bones/i);
  assert.match(coach.SAFETY_COPY, /spot-reduce fat/i);
});

test('existing rep state machine remains backward compatible with scored form', () => {
  let state = coach.createState('cheek-builder', 1000);
  const exercise = coach.currentExercise(state);
  assert.ok(exercise);
  state = coach.advanceState(state, { accepted: true, correction: '', score: 94 }, 1000);
  state = coach.advanceState(state, { accepted: true, correction: '', score: 94 }, 1000 + exercise.hold * 1000);
  assert.equal(state.rep, 1);
  assert.equal(state.lastFormScore, 94);
});
