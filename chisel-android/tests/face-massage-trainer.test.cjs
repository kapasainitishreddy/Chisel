const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const coach=require('../www/chisel-ar-coach-core.js');
const demos=require('../www/chisel-trainer-demos.js');

const MASSAGE_IDS=['forehead-sweep','brow-sweep','temple-circles','brow-relaxation','forehead-release','orbital-sweep','under-eye-glide','brow-to-temple','cheek-upward-sweep','cheek-outward-glide','cheek-relaxation','smile-muscle-release','masseter-circles','jawline-glide','chin-to-ear-glide','jaw-relaxation-sequence','chin-sweep','chin-jaw-transition','neck-relaxation','side-neck-glide'];

function faceFixture(){
  const points=Array.from({length:468},()=>({x:.5,y:.5,z:0}));
  points[234]={x:.2,y:.5};points[454]={x:.8,y:.5};points[105]={x:.36,y:.38};points[334]={x:.64,y:.38};
  points[50]={x:.36,y:.55};points[280]={x:.64,y:.55};points[61]={x:.4,y:.62};points[291]={x:.6,y:.62};
  points[10]={x:.5,y:.2};points[151]={x:.5,y:.3};points[152]={x:.5,y:.82};points[172]={x:.3,y:.66};points[230]={x:.39,y:.52};
  points[13]={x:.5,y:.58};points[14]={x:.5,y:.60};points[33]={x:.35,y:.4};points[263]={x:.65,y:.4};points[1]={x:.5,y:.48};
  return points;
}
function handAt(point){return Array.from({length:21},(_,i)=>i===8?{x:point.x,y:point.y,z:0}:{x:point.x,y:point.y,z:0});}

test('massage catalog has complete metadata and every massage routine resolves',()=>{
  for(const id of MASSAGE_IDS){
    const exercise=coach.exerciseById(id);
    assert.ok(exercise,`missing ${id}`);assert.equal(exercise.tracking,'hand-guided');assert.equal(exercise.completionRule,'strokes');
    assert.ok(exercise.instruction);assert.ok(exercise.safety);assert.ok(exercise.animation);assert.ok(exercise.faceRegion);assert.ok(exercise.handPath);
    assert.ok(['forehead','brow','temple','eye-area','under-eye','brow-temple','cheek','mouth-side','masseter','jawline','chin','chin-jaw','side-neck','jaw-neck'].includes(exercise.handPath.region));
  }
  for(const session of Object.values(coach.SESSIONS)){assert.ok(session.exerciseIds.length,session.id);for(const id of session.exerciseIds)assert.ok(coach.exerciseById(id),`${session.id} references ${id}`);}
  for(const id of ['massage-morning','massage-jaw','massage-depuff','massage-reset','massage-full','massage-evening','massage-screen'])assert.equal(coach.SESSIONS[id].category,'massage');
});

test('hand guidance reports visibility and direction without claiming pressure',()=>{
  const exercise=coach.exerciseById('cheek-outward-glide'),points=faceFixture(),path=coach.handPathForExercise(exercise,points);
  const missing=coach.evaluateHandMovement(exercise,{landmarks:[]},points);
  assert.equal(missing.accepted,false);assert.equal(missing.handVisible,false);assert.match(missing.correction,/hand/i);
  const start=coach.evaluateHandMovement(exercise,{landmarks:[handAt(path.start)]},points);
  assert.equal(start.handVisible,true);assert.equal(start.accepted,true);
  const end=coach.evaluateHandMovement(exercise,{landmarks:[handAt(path.end)]},points,start.tracker);
  assert.equal(end.handVisible,true);assert.equal(end.accepted,true);assert.equal(end.strokeComplete,true);
  const outside=coach.evaluateHandMovement(exercise,{landmarks:[handAt({x:.02,y:.02})]},points);
  assert.equal(outside.correction,'Stay within the marked path');
  const catalog=JSON.stringify(coach.EXERCISES);
  assert.doesNotMatch(catalog,/measure(?:s|d)?\s+(?:finger\s+)?pressure|lymph drainage|blood flow/i);
  assert.doesNotMatch(JSON.stringify(outside),/lighter touch|pressure is measured/i);
});

test('hand-tracked strokes complete reps and unavailable hand tracking falls back to guided timing',()=>{
  const points=faceFixture(),exercise=coach.exerciseById('cheek-outward-glide'),path=coach.handPathForExercise(exercise,points);
  let state=coach.createState('massage-jaw',1000);assert.equal(coach.currentExercise(state).id,'brow-relaxation');
  const fallbackExercise={...coach.currentExercise(state),tracking:'guided'};
  state=coach.advanceState(state,{accepted:true,fallback:true,score:null,correction:'Guided mode'},1000);
  for(let t=1100;t<=3100;t+=100)state=coach.advanceState(state,{accepted:true,fallback:true,score:null,correction:'Guided mode'},t);
  assert.equal(state.guidedReps,1);assert.equal(state.rep,1);
  let handState=coach.createState('massage-morning',1000);
  const first=coach.currentExercise(handState),firstPath=coach.handPathForExercise(first,points);
  const form=coach.evaluateHandMovement(first,{landmarks:[handAt(firstPath.end)]},points);
  handState=coach.advanceState(handState,form,1100);
  assert.equal(handState.rep,1);assert.equal(handState.guidedReps,1);
  assert.ok(fallbackExercise);
});

test('every exercise resolves to a lightweight inline demonstration and packaged asset',()=>{
  for(const exercise of coach.EXERCISES){const svg=demos.svgMarkup(exercise);assert.match(svg,/ctv2-demo-svg/);assert.match(svg,new RegExp(exercise.animation));}
  const source=fs.readFileSync(path.join(__dirname,'../www/chisel-trainer-demos.js'),'utf8');
  const packaged=fs.readFileSync(path.join(__dirname,'../android/app/src/main/assets/public/chisel-trainer-demos.js'),'utf8');
  assert.equal(source,packaged);
});

test('hand model is lazy and only required by massage sessions',()=>{
  assert.equal(coach.sessionRequiresHand('massage-full'),true);assert.equal(coach.sessionRequiresHand('jaw-chin'),false);assert.equal(coach.sessionRequiresHand('yoga'),false);
});
