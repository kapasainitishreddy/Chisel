const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const modulePath=path.join(__dirname,'../www/chisel-personal-photo.js');
const load=()=>require(modulePath);
test('personal photo module exists',()=>assert.ok(fs.existsSync(modulePath)));
test('image dimensions preserve ratio and never upscale',()=>{
 const m=load();assert.deepEqual(m.displaySize(3000,4000),{width:1152,height:1536});
 assert.deepEqual(m.displaySize(300,400),{width:300,height:400});
 for(const args of [[0,100],[NaN,500],[500,Infinity],[-1,22],[30000,30000]])assert.throws(()=>m.displaySize(...args));
});
test('photo upload rejects malformed, empty, oversized and unsupported inputs',()=>{
 const m=load();for(const x of [null,{}, {type:'image/svg+xml',size:30},{type:'image/jpeg',size:0},{type:'image/png',size:16*1024*1024}])assert.throws(()=>m.validateFile(x));
 assert.equal(m.validateFile({type:'image/jpeg',size:2048}),true);
});
test('claimed MIME must match real image bytes',()=>{
 const m=load();assert.equal(m.signatureMatches('image/jpeg',Uint8Array.from([255,216,255,224])),true);
 assert.equal(m.signatureMatches('image/png',Uint8Array.from([137,80,78,71,13,10,26,10])),true);
 assert.equal(m.signatureMatches('image/jpeg',new Uint8Array(16)),false);
 assert.equal(m.signatureMatches('image/svg+xml',new Uint8Array(16)),false);
});
function memory(){let value=null;return{read:async()=>value,write:async v=>{value=v;},clear:async()=>{value=null;}};}
function engine(adapter=memory(),prepare=async original=>({original,display:new Blob(['preview'],{type:'image/jpeg'}),width:100,height:150})){let n=0;return load().createPhotoStore({adapter,prepare,makeURL:()=>`blob:local-${++n}`,revokeURL:()=>{}});}
test('empty photo store has no seeded face or scores',async()=>{
 const e=engine();await e.load();assert.equal(e.snapshot().hasPhoto,false);assert.equal(e.snapshot().url,null);assert.equal(await e.original(),null);
});
test('own original is retained separately from the display rendition',async()=>{
 const e=engine(),f=new Blob(['user-original'],{type:'image/jpeg'});await e.set(f);
 assert.equal(e.snapshot().hasPhoto,true);assert.equal(await e.original(),f);assert.match(e.snapshot().url,/^blob:/);
});
test('saved portrait rehydrates and remove persists across reloads',async()=>{
 const a=memory(),e=engine(a);await e.set(new Blob(['own'],{type:'image/jpeg'}));
 const fresh=engine(a);await fresh.load();assert.equal(fresh.snapshot().hasPhoto,true);await fresh.clear();
 const third=engine(a);await third.load();assert.equal(third.snapshot().hasPhoto,false);
});
test('storage failure does not falsely report a saved image',async()=>{
 const a={read:async()=>null,write:async()=>{throw Error('Quota exceeded');},clear:async()=>{}},e=engine(a);
 await assert.rejects(()=>e.set(new Blob(['own'],{type:'image/jpeg'})),/Quota/);assert.equal(e.snapshot().hasPhoto,false);
});
test('removal cancels an import already decoding',async()=>{
 let release;const prepare=()=>new Promise(r=>release=r),a=memory(),e=engine(a,prepare);
 const f=new Blob(['own'],{type:'image/jpeg'});const importing=e.set(f);await e.clear();release({original:f,display:f,width:100,height:100});await importing;
 assert.equal(e.snapshot().hasPhoto,false);assert.equal(await a.read(),null);
});
test('latest selection wins when decodes finish out of order',async()=>{
 const completions=[];const a=memory(),e=engine(a,original=>new Promise(r=>completions.push(()=>r({original,display:original,width:100,height:100}))))
 const f1=new Blob(['first'],{type:'image/jpeg'}),f2=new Blob(['second'],{type:'image/jpeg'});
 const first=e.set(f1),second=e.set(f2);completions[1]();await second;completions[0]();await first;
 assert.equal(await e.original(),f2);
});
test('new photo invalidates old object URL; clearing notifies all subscribed views',async()=>{
 const revoked=[],e=load().createPhotoStore({adapter:memory(),prepare:async original=>({original,display:original,width:100,height:100}),makeURL:(()=>{let n=0;return()=>`blob:${++n}`})(),revokeURL:u=>revoked.push(u)}),states=[];
 e.subscribe(s=>states.push(s.hasPhoto));const f=new Blob(['own'],{type:'image/jpeg'});await e.set(f);await e.set(f);await e.clear();
 assert.deepEqual(revoked,['blob:1','blob:2']);assert.equal(states.at(-1),false);
});
test('portrait module has no remote upload or analytics dependency',()=>{
 const src=fs.readFileSync(modulePath,'utf8');assert.doesNotMatch(src,/fetch\s*\(|XMLHttpRequest|sendBeacon|https?:\/\//);
 assert.match(src,/wipeData/);assert.match(src,/wipeAllData/);
});
