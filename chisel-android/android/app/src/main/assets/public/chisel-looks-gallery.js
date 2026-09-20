/* Explicit, bounded local saves. Only saved results persist; no network access. */
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;else root.ChiselLooksGallery=api;})(typeof globalThis!=='undefined'?globalThis:this,function(root){
'use strict';
let connection=null,epoch=0,queue=Promise.resolve();
function open(){if(connection)return connection;connection=new Promise((resolve,reject)=>{const r=root.indexedDB.open('chisel-saved-looks',1);r.onupgradeneeded=()=>r.result.createObjectStore('looks',{keyPath:'id'});r.onerror=()=>{connection=null;reject(r.error);};r.onblocked=()=>{connection=null;reject(Error('Close other Chisel tabs and try again.'));};r.onsuccess=()=>{r.result.onversionchange=()=>{r.result.close();connection=null;};resolve(r.result);};});return connection;}
async function transaction(mode,fn){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction('looks',mode),request=fn(tx.objectStore('looks'));let value;request.onsuccess=()=>value=request.result;tx.oncomplete=()=>resolve(value);tx.onerror=tx.onabort=()=>reject(tx.error||request.error||Error('Could not save this look.'));});}
const enqueue=fn=>{const result=queue.then(fn);queue=result.catch(()=>{});return result;};
async function list(){return (await transaction('readonly',s=>s.getAll())).sort((a,b)=>b.createdAt-a.createdAt);}
function save(entry){const mine=epoch;return enqueue(async()=>{if(mine!==epoch)return false;if(!(entry.original instanceof Blob)||!(entry.result instanceof Blob)||entry.original.size>6e6||entry.result.size>8e6)throw Error('Look files are too large to save.');await transaction('readwrite',s=>s.put(entry));const items=await list();for(const item of items.slice(8))await transaction('readwrite',s=>s.delete(item.id));return true;});}
function remove(id){return enqueue(()=>transaction('readwrite',s=>s.delete(id)));}
function clear(){epoch++;return enqueue(()=>transaction('readwrite',s=>s.clear()));}
return{list,save,remove,clear};
});
