'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const coach = require('../www/chisel-ar-coach-core.js');

const good = {valid:true,frontal:true,eyeTilt:0,centered:0,cornerLift:0.12,cornerAsymmetry:0,mouthOpen:0.04};

test('incomplete and nonfinite form signals fail closed', () => {
  const exercise = coach.exerciseById('cheek-raise');
  assert.equal(coach.evaluateForm(exercise, {valid:true,frontal:true}).accepted, false);
  for (const key of ['eyeTilt','centered','cornerLift','cornerAsymmetry','mouthOpen']) {
    for (const value of [NaN,Infinity,-Infinity,undefined,null]) {
      assert.equal(coach.evaluateForm(exercise, {...good,[key]:value}).accepted, false, `${key}: ${value}`);
    }
  }
});

test('degenerate or nonfinite face landmarks are never valid', () => {
  const points = Array.from({length:478}, () => ({x:0.5,y:0.5,z:0}));
  assert.equal(coach.signalsFromLandmarks(points).valid, false);
  points[33].x = NaN;
  assert.equal(coach.signalsFromLandmarks(points).valid, false);
});

test('a camera gap cannot earn an unobserved hold', () => {
  let state = coach.createState('cheek-builder', 100);
  const form = coach.evaluateForm(coach.currentExercise(state), good);
  state = coach.advanceState(state, form, 100);
  state = coach.advanceState(state, form, 6000);
  assert.equal(state.rep, 0, 'elapsed time without frames must not earn a rep');
  assert.equal(state.cleanReps, 0);
});

test('one sustained smile cannot become multiple repetitions', () => {
  let state = coach.createState('cheek-builder', 100);
  for (let t=100;t<=12000;t+=100) {
    state = coach.advanceState(state, coach.evaluateForm(coach.currentExercise(state),good),t);
  }
  assert.equal(state.rep,1,'release to neutral must be observed before another smile rep');
  assert.equal(state.exerciseIndex,0);
});

test('guided setup holds are not counted as camera-verified clean repetitions', () => {
  let state = coach.createState('jaw-chin',100);
  for (let t=100;t<=4300;t+=100) {
    state = coach.advanceState(state,coach.evaluateForm(coach.currentExercise(state),good),t);
  }
  assert.equal(state.rep,1);
  assert.equal(state.cleanReps,0,'the camera cannot verify a chin-tuck contraction from frontal setup');
});
