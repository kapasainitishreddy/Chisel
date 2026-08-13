const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const canonical=fs.readFileSync(path.join(root,'www/chisel-tryon-runtime-fixes.js'),'utf8');
const packaged=fs.readFileSync(path.join(root,'android/app/src/main/assets/public/chisel-tryon-runtime-fixes.js'),'utf8');
const api=require('../www/chisel-tryon-runtime-fixes.js');

test('V4 try-on runtime is synchronized into Android',()=>{
  assert.equal(packaged,canonical);
  assert.match(canonical,/__chiselPremiumHairV4/);
});

test('V4 removes forehead needle roots and keeps the quick overlay restrained',()=>{
  assert.match(canonical,/roots start inside the existing hair mass/);
  assert.doesNotMatch(canonical,/for\(let k=0;k<46;k\+\+\)/);
  assert.match(canonical,/\.065\+\.045\*pr\.textureStrength/);
});

test('style summary includes makeup and is resynchronized after polish auto-collapse',()=>{
  assert.equal(api.previewSummary({id:'butterfly',name:'Butterfly layers'},{id:'none',name:'Clean'},{id:'peachlift',name:'Peach lift'}),'Butterfly layers + Peach lift');
  assert.match(canonical,/setTimeout\(syncPreviewSummary,180\)/);
});

test('women cuts keep distinct length and texture profiles',()=>{
  const bob=api.styleVisualProfile({id:'frenchbob',fall:.5,jitter:.025},'women');
  const butterfly=api.styleVisualProfile({id:'butterfly',fall:1.08,jitter:.05},'women');
  const curls=api.styleVisualProfile({id:'curls',fall:.9,jitter:.115},'women');
  assert.ok(butterfly.fallPx>bob.fallPx*1.5);
  assert.ok(curls.textureStrength>butterfly.textureStrength);
});

test('men crop and quiff remain visually distinct',()=>{
  const crop=api.styleVisualProfile({id:'crop'},'men');
  const quiff=api.styleVisualProfile({id:'quiff'},'men');
  assert.ok(quiff.frontLift>crop.frontLift*1.5);
  assert.notEqual(quiff.part,crop.part);
});
