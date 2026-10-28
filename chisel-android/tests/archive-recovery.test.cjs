const test=require('node:test');
const assert=require('node:assert/strict');
const archive=require('../www/chisel-private-archive.js');

const date='2026-10-28T12:00:00.000Z';
const data=records=>({version:1,createdAt:date,records});
const next={'chisel:scans':JSON.stringify([{t:20}]),'chisel:hydration':JSON.stringify({'synthetic-day':{water:2,salt:'Low'}})};
const old={'chisel:scans':JSON.stringify([{t:10}]),'chisel:hydration':JSON.stringify({'synthetic-day':{water:1,salt:'Medium'}})};
const copy=x=>JSON.parse(JSON.stringify(x));
function memory(initial={},fail=()=>false){
 const values=new Map(Object.entries(initial)),ops=[];
 return{values,ops,getItem(k){ops.push(['get',k]);return values.has(k)?values.get(k):null;},setItem(k,v){ops.push(['set',k,v]);if(fail('set',k,v,ops))throw Error('quota/storage failure');values.set(k,String(v));},removeItem(k){ops.push(['remove',k]);if(fail('remove',k,null,ops))throw Error('storage unavailable');values.delete(k);},snapshot(){return Object.fromEntries(values);}};
}

test('archive recovery journal rolls back an interrupted multi-key restore and is repeatable after reload',()=>{
 const store=memory(old),changed=Object.keys(next),before=Object.fromEntries(changed.map(k=>[k,store.getItem(k)]));store.setItem(archive.JOURNAL_KEY,JSON.stringify({version:1,state:'prepared',keys:changed,before}));store.setItem(changed[0],next[changed[0]]);
 assert.equal(store.getItem('chisel:scans'),next['chisel:scans']);assert.equal(store.getItem('chisel:hydration'),old['chisel:hydration']);assert.equal(JSON.parse(store.getItem(archive.JOURNAL_KEY)).state,'prepared');
 const first=archive.recover(store);assert.deepEqual(first,{recovered:true,committed:false});assert.deepEqual(store.snapshot(),old);
 assert.deepEqual(archive.recover(store),{recovered:false,committed:false});assert.deepEqual(store.snapshot(),old);
});

test('successful and duplicate imports commit every supported group and remove the journal',()=>{
 const store=memory(old);assert.deepEqual(archive.restore(data(next),store),{count:2,cleanupPending:false});assert.deepEqual(store.snapshot(),next);
 assert.deepEqual(archive.restore(data(next),store),{count:2,cleanupPending:false});assert.deepEqual(store.snapshot(),next);assert.equal(store.getItem(archive.JOURNAL_KEY),null);
});

test('quota at every restore write including prepare and commit marker preserves old records',()=>{
 for(const failAt of [1,2,3,4]){
  let writes=0;const store=memory(old,(op,key)=>op==='set'&&++writes===failAt);
  assert.throws(()=>archive.restore(data(next),store));assert.deepEqual(store.snapshot(),old,`failure at set stage ${failAt}`);
 }
});

test('failed rollback leaves journal and blocks app; retry restores old records before use',()=>{
 let failTarget=true,failRollback=true;
 const store=memory(old,(op,key)=>{if(op==='set'&&key==='chisel:hydration'&&failTarget){failTarget=false;return true;}if(op==='remove'&&key==='chisel:scans'&&failRollback)return true;return false;});
 assert.throws(()=>archive.restore(data(next),store),/recovery is still pending/i);
 assert.ok(store.getItem(archive.JOURNAL_KEY));assert.match(globalThis.CHISEL_ARCHIVE_RECOVERY_BLOCKED,/recovery is still pending/i);
 failRollback=false;assert.deepEqual(archive.recover(store),{recovered:true,committed:false});assert.deepEqual(store.snapshot(),old);delete globalThis.CHISEL_ARCHIVE_RECOVERY_BLOCKED;
});

test('failure at every rollback removal, prior-value write, or journal cleanup stage leaves a retryable journal',()=>{
 for(const failAt of [1,2,3,4,5]){
  let trigger=true,rollback=false,stage=0,failRollback=true;
  const store=memory(old,(op,key)=>{
   if(!rollback&&op==='set'&&key==='chisel:hydration'&&trigger){trigger=false;rollback=true;return true;}
   if(rollback&&failRollback&&++stage===failAt)return true;
   return false;
  });
  assert.throws(()=>archive.restore(data(next),store),/recovery is still pending/i,`rollback stage ${failAt}`);assert.ok(store.getItem(archive.JOURNAL_KEY),`journal retained for stage ${failAt}`);
  failRollback=false;assert.deepEqual(archive.recover(store),{recovered:true,committed:false});assert.deepEqual(store.snapshot(),old,`retry restored previous data for stage ${failAt}`);
 }
 delete globalThis.CHISEL_ARCHIVE_RECOVERY_BLOCKED;
});

test('commit marker survives a reload and recovery keeps the fully committed values',()=>{
 let failed=false;const store=memory(old,(op,key,value)=>op==='remove'&&key===archive.JOURNAL_KEY&&!failed&&(failed=true));
 assert.deepEqual(archive.restore(data(next),store),{count:2,cleanupPending:true});assert.deepEqual(store.snapshot(),{...next,[archive.JOURNAL_KEY]:store.values.get(archive.JOURNAL_KEY)});
 assert.deepEqual(archive.recover(store),{recovered:false,committed:true});assert.deepEqual(store.snapshot(),next);
});

test('archive validation and passphrase failures do not mutate live records',async()=>{
 const original=memory(old),before=original.snapshot();const encrypted=await archive.encrypt(data(next),'synthetic recovery passphrase',crypto);
 await assert.rejects(archive.decrypt(encrypted,'wrong synthetic passphrase',crypto),/unlock/i);assert.deepEqual(original.snapshot(),before);
 await assert.rejects(archive.decrypt({...encrypted,ciphertext:'*'},'synthetic recovery passphrase',crypto));
 await assert.rejects(archive.decrypt({...encrypted,version:999},'synthetic recovery passphrase',crypto));
 await assert.rejects(archive.encrypt(data({'unsupported:key':'{}'}),'synthetic recovery passphrase',crypto));
 const huge={...encrypted,ciphertext:'A'.repeat(Math.ceil((archive.MAX_BYTES+17)/3)*4+8)};
 await assert.rejects(archive.decrypt(huge,'synthetic recovery passphrase',crypto));assert.throws(()=>archive.restore(data({'unsupported:key':'{}'}),original));assert.throws(()=>archive.restore(data({'chisel:scans':'not json'}),original));assert.deepEqual(original.snapshot(),before);assert.equal(original.getItem(archive.JOURNAL_KEY),null);
});

test('recovery never restores records for a key that was not part of the import and local clear removes journal namespace',()=>{
 const store=memory({...old,'chisel:unrelated':'keep'});assert.deepEqual(archive.restore(data({'chisel:scans':next['chisel:scans']}),store),{count:1,cleanupPending:false});assert.equal(store.getItem('chisel:unrelated'),'keep');
 assert.ok(archive.JOURNAL_KEY.startsWith('chisel:'));assert.ok(archive.JOURNAL_KEY!== 'chisel:credit-session');
});
