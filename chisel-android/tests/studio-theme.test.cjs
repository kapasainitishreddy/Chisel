const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=path.join(__dirname,'../www');
const apiPath=path.join(base,'chisel-studio-theme.js');
function theme(){assert.ok(fs.existsSync(apiPath),'Quiet Studio runtime must exist');return require(apiPath);}
test('studio exposes six unisex sessions with computed movement and tracking metadata',()=>{
 const t=theme(),core=require('../www/chisel-ar-coach-core.js');
 for(const id of ['jaw-chin','cheek-builder','full','chin-support','release','yoga']){
  const info=t.sessionInfo(core,id);
  assert.equal(info.movements,core.SESSIONS[id].exerciseIds.length);
  assert.ok(['guided','camera','mixed'].includes(info.tracking));
 }
 assert.equal(t.sessionInfo(core,'not-a-session'),null);
});
test('studio filters change discovery not session availability by identity',()=>{
 const t=theme();
 assert.equal(t.matchesGoal('cheek-builder','cheeks'),true);
 assert.equal(t.matchesGoal('jaw-chin','cheeks'),false);
 assert.equal(t.matchesGoal('yoga','all'),true);
 assert.equal(t.matchesGoal('jaw-chin','posture'),true);
 assert.equal(t.matchesGoal('release','relax'),true);
});
test('studio never formats missing or invalid quality as a measured zero or accuracy percentage',()=>{
 const t=theme();
 for(const v of [undefined,null,NaN,Infinity,-1,101,'99'])assert.equal(t.qualityLabel(v),'Not measured');
 assert.equal(t.qualityLabel(0),'0/100 capture quality');
 assert.equal(t.qualityLabel(87),'87/100 capture quality');
});
test('a guided movement or invalid form cannot display a camera-checked score',()=>{
 const t=theme();
 assert.equal(t.feedbackLabel({tracking:'guided'},{accepted:true,score:100}),'Setup only');
 assert.equal(t.feedbackLabel({tracking:'form'},{accepted:false,score:93}),'Adjust position');
 assert.equal(t.feedbackLabel({tracking:'form'},{accepted:true,score:null}),'Not measured');
 assert.equal(t.feedbackLabel({tracking:'form'},{accepted:true,score:87}),'87/100');
});
test('shared text and primary button colors meet the chosen 4.5:1 contrast target',()=>{
 const t=theme();
 for(const [text,bg] of [[t.TOKENS.text,t.TOKENS.bg],[t.TOKENS.muted,t.TOKENS.surface],[t.TOKENS.bg,t.TOKENS.accent],[t.TOKENS.sage,t.TOKENS.surface]])assert.ok(t.contrastRatio(text,bg)>=4.5);
});
test('studio runtime and theme are bundled byte-identically for Android',()=>{
 theme();for(const file of ['chisel-studio-theme.js','chisel-studio-theme.css']){
  assert.equal(fs.readFileSync(path.join(base,file),'utf8'),fs.readFileSync(path.join(base,'../android/app/src/main/assets/public',file),'utf8'));
 }
});
test('the theme loads after reliability safeguards and does not replace the measurement engines',()=>{
 theme();const loader=fs.readFileSync(path.join(base,'chisel-ar-coach-core.js'),'utf8');
 assert.ok(loader.lastIndexOf("addScript('chisel-studio-theme.js')")>loader.lastIndexOf("addScript('chisel-reliability-runtime.js')"));
 const src=fs.readFileSync(apiPath,'utf8');
 assert.doesNotMatch(src,/\b(?:trainStep|readLandmarks|renderPhotoreal|evaluateForm)\s*=/);
 assert.doesNotMatch(src,/\beval\s*\(|new Function/);
});
test('shared components include explicit disabled, focus, reduced-motion and small-screen rules',()=>{
 theme();const css=fs.readFileSync(path.join(base,'chisel-studio-theme.css'),'utf8');
 for(const text of [':disabled',':focus-visible','prefers-reduced-motion','360px','48px','--cs-accent'])assert.ok(css.includes(text),text);
});
