'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const skin=require('../www/chisel-skin-appearance-core.js');
const protocol=require('../www/chisel-precision-protocol.js');
function patch(rgb){const data=new Uint8ClampedArray(40*40*4);for(let i=0;i<data.length;i+=4)data.set([...rgb,255],i);return{width:40,height:40,data};}
test('fully black and white captures cannot pass the skin quality threshold',()=>{
 for(const rgb of [[0,0,0],[255,255,255]]){const r=skin.analyzePixelSet(patch(rgb));assert.ok(r.confidence<42);assert.equal(r.valid,false);}
});
test('skin capture quality does not penalize a darker unclipped complexion',()=>{
 assert.equal(skin.analyzePixelSet(patch([32,24,19])).confidence,skin.analyzePixelSet(patch([170,135,110])).confidence);
});
test('an unusable region cannot manufacture a clean-looking whole-face result',()=>{
 const invalid={...skin.analyzePixelSet(patch([255,255,255])),valid:false};
 const r=skin.aggregateRegions({forehead:invalid,leftCheek:invalid,rightCheek:invalid,chin:invalid});
 assert.equal(r.valid,false);assert.equal(r.confidence,0);assert.equal(skin.buildAppearanceSummary(r).attention.length,0);
});
test('Precision rejects missing or nonfinite quality measurements instead of defaulting to perfect pose',()=>{
 const q={brightness:140,sharpness:120,fill:.5,rollDeg:0,yawDeg:0,pitchDeg:0,expression:0,modelConfidence:.99,occlusion:0};
 assert.equal(protocol.scoreFrame({quality:q},'face').accepted,true);
 for(const field of Object.keys(q)){for(const bad of [undefined,null,NaN,Infinity]){
  assert.equal(protocol.scoreFrame({quality:{...q,[field]:bad}},'face').accepted,false,`${field}: ${bad}`);
 }}
});
test('rejected skin regions are labelled unavailable rather than clean-looking zero scores',()=>{
 const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
 const code=fs.readFileSync(path.join(__dirname,'../www/chisel-skin-appearance.js'),'utf8');
 const start=code.indexOf('function regionCard('),end=code.indexOf('function renderResults(',start);
 const context={REGION_LABELS:{chin:'Chin'}};vm.runInNewContext(code.slice(start,end),context);
 assert.match(context.regionCard('chin',{valid:false,confidence:0,redness:0,shine:0,texture:0,pores:0,blemishContrast:0,pigmentUnevenness:0}),/not measured/i);
});
