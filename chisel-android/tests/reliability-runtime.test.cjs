'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../www/chisel-reliability-runtime.js'),'utf8');
const coach=require('../www/chisel-ar-coach-core.js');
function fixture(){
 const p=Array.from({length:478},()=>({x:.5,y:.5}));
 Object.assign(p,{1:{x:.5,y:.5},10:{x:.5,y:.2},152:{x:.5,y:.8},234:{x:.2,y:.5},454:{x:.8,y:.5},33:{x:.3,y:.35},263:{x:.7,y:.35},61:{x:.4,y:.56},291:{x:.6,y:.56},13:{x:.5,y:.59},14:{x:.5,y:.60}});
 return p;
}
function harness(){
 let now=100,confirmCount=0,reads=0;
 const listeners={},nodes={cam:{readyState:4,videoWidth:1920,videoHeight:1080,currentTime:1},ctv2FormScore:{textContent:''},arCoachHold:{textContent:''},arCoachCue:{textContent:''},arCoachHud:{classList:{remove(){}}}};
 const canvas={width:0,height:0,getContext(){return{translate(){},scale(){},drawImage(){},getImageData(){return{}}};},toDataURL(){return`frame:${this.width}x${this.height}`;}};
 const quality={outputSize:require('../www/chisel-capture-quality.js').outputSize,assessFace(){return{accepted:true,bounds:{left:.2,right:.8,top:.2,bottom:.8}}},assessPixels(){return{accepted:true}}};
 const context={ChiselARCoach:{...coach},ChiselCaptureQuality:quality,_arState:coach.createState('jaw-chin',100),_arForm:{},facing:'user',performance:{now:()=>now},navigator:{onLine:true},console,
 document:{hidden:false,documentElement:{dataset:{}},getElementById:id=>nodes[id]||null,createElement:()=>canvas,addEventListener:(type,fn)=>{listeners[type]=fn;}},
 confirm:()=>{confirmCount++;return false},readLandmarks(){reads++;return{pts:fixture()}},capturePhotorealSource(){return'old-cropped-frame'},
 trainStep(){context.calls=(context.calls||0)+1;const ex=coach.currentExercise(context._arState);context._arState=coach.advanceState(context._arState,{accepted:true,score:95},now);},
 renderARCoachHud(){},setGuideMsg(){},toast(){},setTimeout,clearTimeout};
 context.globalThis=context;vm.runInNewContext(source,context);context.ChiselReliabilityRuntime.install();
 return{context,nodes,listeners,setNow:n=>{now=n;},stats:()=>({confirmCount,reads}),event(){return{target:{closest:()=>({id:'photorealBtn'})},preventDefault(){this.blocked=true;},stopImmediatePropagation(){this.stopped=true;}}}};
}

test('trainer movement ratios are invariant to camera pixel aspect ratio',()=>{
 const p=fixture(),wide=p.map(pt=>({x:pt.x/2+.25,y:pt.y}));
 const square=coach.signalsFromLandmarks(p,{width:1000,height:1000});
 const rectangle=coach.signalsFromLandmarks(wide,{width:2000,height:1000});
 for(const key of ['cornerLift','cornerAsymmetry','mouthOpen','eyeTilt'])assert.ok(Math.abs(square[key]-rectangle[key])<1e-9,key);
});
test('runtime uses native video aspect ratio for the existing trainer',()=>{
 const h=harness(),p=fixture();const actual=h.context.ChiselARCoach.signalsFromLandmarks(p);
 const expected=coach.signalsFromLandmarks(p,{width:1920,height:1080});
 assert.ok(Math.abs(actual.cornerLift-expected.cornerLift)<1e-9);
});
test('repeated frozen video frames cannot complete a hold',()=>{
 const h=harness();h.context.trainStep({pts:fixture()});h.setNow(5000);h.context.trainStep({pts:fixture()});
 assert.equal(h.context.calls,1);assert.equal(h.context._arState.rep,0);assert.equal(h.context._arState.heldMs,0);
});
test('guided setup uses a setup label, not a verified movement score',()=>{
 const h=harness();h.context.trainStep({pts:fixture()});assert.equal(h.nodes.ctv2FormScore.textContent,'Setup only');
});
test('full-frame hair source keeps native aspect ratio instead of screen crop',()=>{
 const h=harness();assert.equal(h.context.capturePhotorealSource(),'frame:1536x864');
});
test('cancelled cloud consent blocks the original provider click listener',()=>{
 const h=harness(),event=h.event();h.context.ChiselReliabilityRuntime.beforeRender(event);
 assert.equal(h.stats().confirmCount,1);assert.equal(event.blocked,true);assert.equal(event.stopped,true);
});
test('offline rendering is stopped before photo preparation or cloud consent',()=>{
 const h=harness(),event=h.event();h.context.navigator.onLine=false;h.context.ChiselReliabilityRuntime.beforeRender(event);
 assert.equal(event.blocked,true);assert.equal(h.stats().reads,0);assert.equal(h.stats().confirmCount,0);
});
test('invalid camera preflight does not request upload consent',()=>{
 const h=harness(),event=h.event();h.context.ChiselCaptureQuality.assessFace=()=>({accepted:false,reasons:['Keep your face visible']});h.context.ChiselReliabilityRuntime.beforeRender(event);
 assert.equal(event.blocked,true);assert.equal(h.stats().confirmCount,0);
});
test('backgrounding the app resets observed holds',()=>{
 const h=harness();h.context.trainStep({pts:fixture()});h.context.document.hidden=true;h.setNow(300);h.listeners.visibilitychange();assert.equal(h.context._arState.heldMs,0);assert.equal(h.context._arState.holdStartedAt,0);
});
