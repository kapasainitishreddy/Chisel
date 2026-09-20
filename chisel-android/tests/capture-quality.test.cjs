'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
let api={};try{api=require('../www/chisel-capture-quality.js');}catch(e){if(e.code!=='MODULE_NOT_FOUND')throw e;}
test('capture-quality implementation exists',()=>assert.equal(typeof api.outputSize,'function'));
test('hair source preserves native aspect ratio without upscaling',()=>{
 assert.deepEqual(api.outputSize(1920,1080),{width:1536,height:864});
 assert.deepEqual(api.outputSize(640,480),{width:640,height:480});
 assert.throws(()=>api.outputSize(0,1080));assert.throws(()=>api.outputSize(Infinity,1080));
});
function image(kind){const width=128,height=128,data=new Uint8ClampedArray(width*height*4);for(let y=0;y<height;y++)for(let x=0;x<width;x++){const c=kind==='black'?0:kind==='white'?255:kind==='flat'?128:60+((x>>3)+(y>>3))%2*110;data.set([c,c,c,255],(y*width+x)*4);}return{width,height,data};}
test('blank, clipped, and flat blurred source images fail preflight',()=>{
 for(const kind of ['black','white','flat'])assert.equal(api.assessPixels(image(kind)).accepted,false,kind);
 assert.equal(api.assessPixels(image('texture')).accepted,true);
});
test('malformed pixels fail rather than returning a quality estimate',()=>{
 assert.throws(()=>api.assessPixels({width:128,height:128,data:[]}), /bounded RGBA/);
});
function face(){const p=Array.from({length:478},()=>({x:.5,y:.5}));Object.assign(p,{1:{x:.5,y:.5},10:{x:.5,y:.22},152:{x:.5,y:.8},234:{x:.25,y:.5},454:{x:.75,y:.5},33:{x:.36,y:.4},263:{x:.64,y:.4}});return p;}
test('framing gate rejects small, tilted and incomplete faces',()=>{
 const p=face();assert.equal(api.assessFace(p,960,960).accepted,true);
 assert.equal(api.assessFace(p,128,128).accepted,false);
 const tilt=face();tilt[33].y=.25;assert.equal(api.assessFace(tilt,960,960).accepted,false);
 assert.equal(api.assessFace([],960,960).accepted,false);
});
