const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const theme=require('../www/chisel-studio-theme.js');
const source=fs.readFileSync(path.join(__dirname,'../www/chisel-studio-theme.js'),'utf8');
test('daily copy is short, task-specific and never invents completion',()=>{
 assert.equal(typeof theme.taskCopy,'function');
 for(const action of ['analyze','tryon','yoga','groom']){
  const copy=theme.taskCopy(action,false);
  assert.ok(copy.title.split(/\s+/).length<=3);
  assert.ok(copy.cta.split(/\s+/).length<=2);
  assert.equal(copy.done,'Mark done');
 }
 assert.equal(theme.taskCopy('groom',true).done,'Done');
});
test('the theme does not author marketing slogans over core tasks',()=>{
 for(const phrase of ['A little care.','A clear direction.','Your next small step','A clear photo, a careful read','One place for your daily care','More room to explore.']){
  assert.ok(!source.includes(phrase),phrase);
 }
});
test('skin help is disclosed without removing live errors or explicit upload consent',()=>{
 assert.match(source,/disclosure\('Photo tips'/);
 assert.match(source,/disclosure\('Details'/);
 assert.match(source,/Experimental\. Not a diagnosis\./);
 assert.doesNotMatch(source,/csaStatus[^\n]*(?:hidden=true|\.remove\()/);
 assert.doesNotMatch(source,/chiselCaptureTruth[^\n]*(?:hidden=true|\.remove\()/);
});
test('trainer keeps a visible safety cue with full original copy available',()=>{
 assert.match(source,/Stop if you feel pain/);
 assert.match(source,/details\.append\(safety\)/);
});
test('content cleanup keeps the existing daily action and completion handlers',()=>{
 assert.match(source,/data-cxp-done/);
 assert.match(source,/taskCopy\(focus\.dataset\.cxpFocus/);
 assert.doesNotMatch(source,/localStorage\.setItem|fetch\(/);
});
