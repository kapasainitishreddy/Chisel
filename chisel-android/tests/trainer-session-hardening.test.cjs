const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const trainer=require('../www/chisel-trainer-v2.js');

test('completion distinguishes skipped movements and actual elapsed time',()=>{
  assert.deepEqual(trainer.completionSummary({exerciseIds:['a','b','c'],completed:true,skippedExercises:1,startedAt:1000,lastSampleAt:66000}),{total:3,completed:2,skipped:1,elapsed:'1:05 elapsed'});
});

test('recommendations ignore invalid, future and stale saved routines',()=>{
  const source=fs.readFileSync(path.join(__dirname,'../www/chisel-trainer-v2.js'),'utf8');
  const now=new Date(2026,8,20,14);
  const recommend=history=>{
    const context={module:{exports:{}},localStorage:{getItem:()=>JSON.stringify(history)},ChiselARCoach:{SESSIONS:{release:{}}}};
    vm.runInNewContext(source,context);
    return context.module.exports.todayRecommendation(now).sessionId;
  };
  assert.equal(recommend([{sessionId:'release',completedAt:new Date(now-3600000).toISOString()}]),'release');
  assert.equal(recommend([{sessionId:'missing',completedAt:now.toISOString()}]),'quick');
  assert.equal(recommend([{sessionId:'release',completedAt:new Date(+now+3600000).toISOString()}]),'quick');
  assert.equal(recommend([{sessionId:'release',completedAt:new Date(now-48*3600000).toISOString()}]),'quick');
});

test('finishing releases camera immediately and cannot schedule a later close of a new session',()=>{
  const html=fs.readFileSync(path.join(__dirname,'../www/index.html'),'utf8');
  const source=html.match(/function finishTrain\(\)\{[\s\S]*?\n\}/)[0];
  let stopped=0,cancelled=0,scheduled=0;
  const context={_arState:{sessionId:'release',exerciseIds:['jaw-release'],completed:true},_arForm:{},store:{get:()=>({total:0,byType:{}}),set:()=>{}},window:{},setGuideMsg:()=>{},bumpStreak:()=>{},toast:()=>{},setTimeout:()=>scheduled++,closeCam:()=>{},detLoop:1,cancelAnimationFrame:()=>cancelled++,stream:{getTracks:()=>[{stop:()=>stopped++}]},cam:{srcObject:{}},Date};
  vm.runInNewContext(source+';finishTrain();',context);
  assert.equal(stopped,1);assert.equal(cancelled,1);assert.equal(scheduled,0);
  assert.equal(context.cam.srcObject,null);assert.equal(context.stream,null);
});
