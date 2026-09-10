const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const www=path.join(__dirname,'../www');
const read=name=>fs.readFileSync(path.join(www,name),'utf8');
test('pinch zoom is enabled by the shared UI without changing measurement code',()=>{
 const loader=read('chisel-ar-coach-core.js');
 assert.match(read('chisel-studio-theme.js'),/viewport.content='width=device-width, initial-scale=1, viewport-fit=cover'/);
 assert.ok(loader.indexOf("addScript('chisel-studio-theme.js')")>loader.indexOf("addScript('chisel-reliability-runtime.js')"));
});
test('Platinum refines the shared Studio tokens rather than loading a competing UI theme',()=>{
 const css=read('chisel-studio-theme.css'),js=read('chisel-studio-theme.js'),loader=read('chisel-ar-coach-core.js');
 for(const color of ['#0c0e12','#15181e','#f1f3f6','#e4eaf2'])assert.ok(css.includes(color));
 assert.match(css,/--display:Inter/);
 assert.match(css,/min-height:48px/);assert.match(css,/prefers-reduced-motion/);
 assert.match(js,/dataset.chiselFinish='platinum'/);
 assert.doesNotMatch(loader,/addScript\('chisel-platinum-ui.js'\)/);
});
test('trainer keeps its existing filters and callbacks under a pinned header',()=>{
 const js=read('chisel-studio-theme.js'),css=read('chisel-studio-theme.css');new vm.Script(js);
 for(const value of ['installTrainerFrame','cs-trainer-head','cs-trainer-body','csTrainerFilters','matchesGoal','csOrbitTrigger'])assert.ok(js.includes(value),value);
 assert.match(css,/\.cs-trainer-body\s*\{[^}]*overflow-y:auto/);
 assert.match(css,/\.cs-trainer-head\s*\{[^}]*flex:0 0 auto/);
 assert.match(js,/while\(panel.firstChild\)body.append\(panel.firstChild\)/);
});
test('dialog focus remembers external trigger before existing dialog focus handlers run',()=>{
 const js=read('chisel-studio-theme.js');
 assert.match(js,/pendingTrigger/);
 assert.match(js,/if\(button.closest\('#csOrbit'\)\)pendingTrigger=q\('#csOrbitTrigger'\)/);
 assert.match(js,/returnFocus=pendingTrigger&&pendingTrigger.isConnected\?pendingTrigger:doc\(\).activeElement/);
 assert.doesNotMatch(js,/fetch\(|getUserMedia\(|detectForVideo\(|localStorage\.setItem/);
});
test('shared Studio refinements and loader are packaged byte-identically',()=>{
 for(const name of ['chisel-studio-theme.css','chisel-studio-theme.js','chisel-ar-coach-core.js','index.html'])assert.equal(read(name),fs.readFileSync(path.join(__dirname,'../android/app/src/main/assets/public',name),'utf8'),name);
});
