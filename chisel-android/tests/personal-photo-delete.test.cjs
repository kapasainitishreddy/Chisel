const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../www/chisel-personal-photo.js'),'utf8');
function harness(fail=false){
 let handler,cleared=false,reloads=0;const toast={textContent:'',setAttribute(){},classList:{add(){},remove(){}}};
 const button={disabled:false,removeEventListener(){},addEventListener(name,fn){handler=fn;}};
 const db={transaction(){const tx={objectStore(){return{delete(){cleared=true;return{};}}}};queueMicrotask(()=>{if(fail){tx.error=Error('Storage unavailable');tx.onabort();}else tx.oncomplete();});return tx;}};
 const root={module:{exports:{}},Blob,URL,Uint8Array,Number,Math,Date,Promise,Set,Object,Error,TypeError,RangeError,
  toast,document:{getElementById:id=>id==='wipeData'?button:id==='toast'?toast:null},
  indexedDB:{open(){const req={result:db};queueMicrotask(()=>req.onsuccess());return req;}},
  localStorage:{setItem(){},removeItem(){}},wipeAllData(){},confirm:()=>true,dispatchEvent(){},addEventListener(){},
  CustomEvent:class{constructor(type){this.type=type;}},location:{reload(){reloads++;}},setTimeout:fn=>{fn();return 1;}};
 vm.runInNewContext(source,root);root.module.exports.installDeletion();
 return{run:()=>handler(),result:()=>({cleared,reloads,notification:toast.textContent,disabled:button.disabled})};
}
test('clear all survives a DOM element named toast and reloads only after photo deletion',async()=>{
 const h=harness();await h.run();const r=h.result();assert.equal(r.cleared,true);assert.equal(r.reloads,1);assert.match(r.notification,/cleared/);assert.equal(r.disabled,false);
});
test('failed portrait deletion shows an error and does not reload or claim success',async()=>{
 const h=harness(true);await h.run();const r=h.result();assert.equal(r.reloads,0);assert.match(r.notification,/Could not finish deleting/);assert.equal(r.disabled,false);
});
