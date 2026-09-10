const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const w=path.join(__dirname,'../www'),read=f=>fs.readFileSync(path.join(w,f),'utf8');
test('image-led interface is loaded after existing feature and reliability layers',()=>{
 const loader=read('chisel-ar-coach-core.js');assert.match(loader,/chisel-personal-photo.js/);assert.match(loader,/chisel-personal-studio.js/);
 assert.ok(loader.indexOf("addScript('chisel-personal-studio.js')")>loader.indexOf("addScript('chisel-studio-theme.js')"));
});
test('personal surfaces reference the private photo store, never stock people or mock scores',()=>{
 const src=read('chisel-personal-studio.js');assert.match(src,/ChiselPersonalPhoto/);assert.match(src,/subscribe/);
 assert.doesNotMatch(src,/unsplash|pexels|portrait-male|portrait-female|Form Score: 72|84%|76%/);
 for(const surface of ['cpsHomeHero','cpsTrainerHero','cpsSkinHero','cpsStyleHero'])assert.ok(src.includes(surface));
});
test('session metadata and live feedback derive from real engines',()=>{
 const m=require('../www/chisel-personal-studio.js'),core=require('../www/chisel-ar-coach-core.js');
 assert.equal(m.sessionMeta(core,'cheek-builder').moves,3);assert.equal(m.sessionMeta(core,'bad'),null);
 assert.equal(m.liveForm({tracking:'guided'},{accepted:true,score:99}),null);
 assert.equal(m.liveForm({tracking:'form'},{accepted:false,score:99}),null);
 assert.equal(m.liveForm({tracking:'form'},{accepted:true,score:83}),83);
 assert.equal(m.liveForm({tracking:'form'},{accepted:true,score:NaN}),null);
});
test('photo styling cannot become a measurement input',()=>{
 const src=read('chisel-personal-studio.js');assert.match(src,/store\.original\(/);assert.match(src,/ChiselSkinAppearance\.selectFile/);
 assert.doesNotMatch(src,/detectForVideo\(|measureFrame\(|fetch\s*\(/);
});
test('skin original handoff invalidates old results and refuses changes during analysis',()=>{
 const src=read('chisel-skin-appearance.js');assert.match(src,/function selectFile\(candidate\)/);assert.match(src,/if\(busy\)return false/);
 assert.match(src,/selectFile,clearSelection/);
});
test('photo component assets are mirrored to native app',()=>{
 for(const f of ['chisel-personal-photo.js','chisel-personal-studio.js','chisel-personal-studio.css','chisel-skin-appearance.js','chisel-ar-coach-core.js'])
  assert.equal(read(f),fs.readFileSync(path.join(__dirname,'../android/app/src/main/assets/public',f),'utf8'),f);
});
