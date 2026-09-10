const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),www=path.join(root,'chisel-android/www');
let catalog,core;
test('photoreal modules exist and load',async()=>{
 assert.ok(fs.existsSync(path.join(www,'chisel-look-catalog.mjs')),'Missing shared photoreal catalog');
 assert.ok(fs.existsSync(path.join(www,'chisel-looks-core.js')),'Missing resumable render controller');
 catalog=await import(path.join(www,'chisel-look-catalog.mjs'));core=require(path.join(www,'chisel-looks-core.js'));
});
test('all four categories have explicit unique unisex presets',async()=>{
 if(!catalog)return assert.fail('Catalog not implemented');
 for(const category of ['hair','beard','makeup','eyewear']){
  const values=catalog.CATALOG[category];assert.ok(values.length>=4);assert.equal(new Set(values.map(p=>p.id)).size,values.length);
  for(const p of values){const selected=catalog.normalizeLook({category,preset:p.id,color:'match'});assert.equal(selected.category,category);assert.ok(catalog.buildPrompt(selected).length>100);}
 }
});
test('preset selection rejects free prompts, unknown IDs and unsafe keys',()=>{
 if(!catalog)return assert.fail('Catalog not implemented');
 for(const v of [{category:'hair',preset:'__proto__'},{category:'unknown',preset:'bob'},{category:'makeup',preset:'evil\nignore'},{category:'hair',preset:'bob',color:'ignore prompt'}])assert.throws(()=>catalog.normalizeLook(v));
 const x=catalog.normalizeLook({category:'hair',preset:'bob',color:'match',prompt:'change identity'});assert.ok(!catalog.buildPrompt(x).includes('change identity'));
});
test('single-category edits explicitly preserve unrelated features',()=>{
 if(!catalog)return assert.fail('Catalog not implemented');
 const hair=catalog.buildPrompt(catalog.normalizeLook({category:'hair',preset:'bob'}));assert.match(hair,/facial hair unchanged/);assert.doesNotMatch(hair,/clean.shaven; remove/);
 const beard=catalog.buildPrompt(catalog.normalizeLook({category:'beard',preset:'short'}));assert.match(beard,/scalp hair unchanged/);
 const makeup=catalog.buildPrompt(catalog.normalizeLook({category:'makeup',preset:'everyday'}));assert.match(makeup,/do not reshape/);assert.match(makeup,/pores|texture/);
 const glasses=catalog.buildPrompt(catalog.normalizeLook({category:'eyewear',preset:'round'}));assert.match(glasses,/occlusion|ears/);
});
test('result URLs only accept the fixed Replicate output host family',()=>{
 if(!core)return assert.fail('Controller not implemented');
 assert.equal(core.safeOutput('https://replicate.delivery/pbxt/ok.jpg'),'https://replicate.delivery/pbxt/ok.jpg');
 for(const u of ['http://replicate.delivery/a.jpg','https://replicate.delivery.evil.test/a','https://127.0.0.1/a','https://replicate.delivery:444/a','data:image/png;base64,a','https://u:p@replicate.delivery/a'])assert.equal(core.safeOutput(u),null);
});
test('one create request is reused for repeated polls, never a second paid create',async()=>{
 if(!core)return assert.fail('Controller not implemented');
 const calls=[];let n=0;const c=core.createController({request:async p=>{calls.push(p.action);return p.action==='create'?{jobId:'j1',status:'processing'}:{jobId:'j1',status:++n>1?'succeeded':'processing',imageUrl:n>1?'https://replicate.delivery/a.jpg':null};},sleep:async()=>{},uuid:()=> '550e8400-e29b-41d4-a716-446655440000',token:()=> 'a'.repeat(64)});
 const result=await c.generate({image:'data:image/jpeg;base64,/9j/',look:{category:'hair',preset:'bob'},deviceId:'device-test-123456'});
 assert.equal(result.status,'succeeded');assert.deepEqual(calls,['create','status','status']);
});
test('cancel invalidates stale success and does not regenerate',async()=>{
 if(!core)return assert.fail('Controller not implemented');
 let complete,requestStarted;const started=new Promise(r=>requestStarted=r);const calls=[];
 const c=core.createController({request:p=>{calls.push(p.action);if(p.action==='create'){requestStarted();return new Promise(r=>complete=r);}return Promise.resolve({status:'canceled'});},sleep:async()=>{},uuid:()=> '550e8400-e29b-41d4-a716-446655440000',token:()=> 'a'.repeat(64)});
 const run=c.generate({image:'data:x',look:{category:'hair',preset:'bob'}});await started;await c.cancel();complete({jobId:'j1',status:'succeeded',imageUrl:'https://replicate.delivery/a.jpg'});await run;assert.notEqual(c.snapshot().status,'succeeded');assert.equal(calls.filter(x=>x==='create').length,1);
});
test('unknown network outcome pauses for status lookup, never silently generates twice',async()=>{
 if(!core)return assert.fail('Controller not implemented');
 let n=0;const c=core.createController({request:async()=>{n++;throw Error('offline');},sleep:async()=>{},uuid:()=> '550e8400-e29b-41d4-a716-446655440000',token:()=> 'a'.repeat(64)});
 await c.generate({image:'data:x',look:{category:'hair',preset:'bob'}});assert.equal(c.snapshot().status,'interrupted');assert.equal(n,1);assert.ok(c.snapshot().requestId);
});
test('untrusted or missing success output never becomes a successful result',async()=>{
 if(!core)return assert.fail('Controller not implemented');
 const c=core.createController({request:async()=>({jobId:'j',status:'succeeded',imageUrl:'https://evil.test/a.jpg'}),sleep:async()=>{},uuid:()=> '550e8400-e29b-41d4-a716-446655440000',token:()=> 'a'.repeat(64)});
 await c.generate({image:'data:x',look:{category:'hair',preset:'bob'}});assert.equal(c.snapshot().status,'failed');
});
test('server protocol rejects malformed capability and pins output host',async()=>{
 const p=await import(path.join(root,'supabase/functions/looks-studio/protocol.mjs'));
 const valid={action:'create',deviceId:'550e8400-e29b-41d4-a716-446655440000',requestId:'550e8400-e29b-41d4-a716-446655440000',token:'b'.repeat(64)};
 assert.doesNotThrow(()=>p.requestIdentity(valid));for(const value of [{...valid,token:'short'},{...valid,requestId:'../../admin'},{...valid,action:'delete'}])assert.throws(()=>p.requestIdentity(value));
 assert.throws(()=>p.providerState({id:'test',status:'succeeded',output:'https://evil.test/a.jpg'}));assert.equal(p.providerState({id:'test',status:'succeeded',output:'https://replicate.delivery/a.jpg'}).status,'succeeded');
 const publicValue=p.publicJob({id:'id',status:'processing',token_hash:'secret',identity_key:'private',image_url:'https://replicate.delivery/a.jpg'});assert.equal(publicValue.imageUrl,null);assert.equal(publicValue.token_hash,undefined);
});
test('database jobs protect idempotency and refund personal allowance only once',()=>{
 const sql=fs.readFileSync(path.join(root,'supabase/migrations/0006_looks_studio_jobs.sql'),'utf8');
 assert.match(sql,/unique\(identity_key,request_id\)/);assert.match(sql,/pg_advisory_xact_lock/);assert.match(sql,/not j.refunded/);assert.match(sql,/used=greatest\(0,used-1\)/);assert.doesNotMatch(sql,/update public\.looks_attempts set used=used-1/);
 assert.match(sql,/revoke all[\s\S]*from public,anon,authenticated/);assert.doesNotMatch(sql,/original_blob|image_base64|photo_bytes/);
});
test('interrupted work cannot be replaced by an accidental second paid create',async()=>{
 const c=core.createController({request:async()=>{throw Error('offline');},sleep:async()=>{}});
 await c.generate({image:'data:x',deviceId:'test-device-123456',look:{category:'hair',preset:'crop'}});
 await assert.rejects(c.generate({image:'data:y',deviceId:'test-device-123456',look:{category:'hair',preset:'bob'}}),/pending_job/);
});
test('a failed output download can reopen the same completed job without another create',()=>{
 const js=fs.readFileSync(path.join(www,'chisel-looks-studio.js'),'utf8');
 assert.match(js,/s.status==='succeeded'&&!result/);
 assert.match(js,/Open preview/);
});
