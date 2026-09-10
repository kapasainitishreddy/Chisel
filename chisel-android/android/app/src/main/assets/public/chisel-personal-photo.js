/* A private portrait for the interface. Originals and display copies are separate.
 * Nothing in this module sends a photo to a provider or produces measurements. */
(function(root,factory){
 const api=factory(root);
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.ChiselPersonalPhoto=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
 'use strict';
 const MAX_BYTES=15*1024*1024, MAX_PIXELS=32000000;
 const DB_NAME='chisel-personal-photo', STORE='photos', KEY='portrait';
 const REVISION_KEY='chisel:personal-photo-revision';
 function validateFile(file){
  if(!file||!/^image\/(jpeg|png|webp)$/i.test(file.type||''))throw new TypeError('Choose a JPEG, PNG or WebP photo.');
  if(!Number.isFinite(file.size)||file.size<=0||file.size>MAX_BYTES)throw new RangeError('Choose a photo smaller than 15 MB.');
  return true;
 }
 function signatureMatches(type,b){
  if(!b)return false;
  if(type==='image/jpeg')return b[0]===255&&b[1]===216&&b[2]===255;
  if(type==='image/png')return [137,80,78,71,13,10,26,10].every((v,i)=>b[i]===v);
  if(type==='image/webp')return b.length>=12&&String.fromCharCode(...b.slice(0,4))==='RIFF'&&String.fromCharCode(...b.slice(8,12))==='WEBP';
  return false;
 }
 function displaySize(width,height){
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width*height>MAX_PIXELS)throw new RangeError('Choose a photo up to 32 megapixels.');
  const scale=Math.min(1,1536/Math.max(width,height));
  return {width:Math.max(1,Math.round(width*scale)),height:Math.max(1,Math.round(height*scale))};
 }
 async function preparePhoto(original){
  validateFile(original);
  const head=new Uint8Array(await original.slice(0,12).arrayBuffer());
  if(!signatureMatches(original.type,head))throw new Error('This file is not a supported photo.');
  let image,sourceURL;
  try{
   if(root.createImageBitmap)image=await root.createImageBitmap(original);
   else{sourceURL=URL.createObjectURL(original);image=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('This photo could not be opened.'));img.src=sourceURL;});}
   const width=image.width||image.naturalWidth,height=image.height||image.naturalHeight;
   const size=displaySize(width,height),canvas=root.document.createElement('canvas');
   canvas.width=size.width;canvas.height=size.height;
   const ctx=canvas.getContext('2d');if(!ctx)throw Error('Photo preview is unavailable.');
   ctx.drawImage(image,0,0,size.width,size.height);
   // The rendition is for the interface only. Analysis receives the original.
   const display=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Could not prepare this photo.')),'image/jpeg',.91));
   return {version:1,original,display,width,height,savedAt:new Date().toISOString()};
  }finally{if(image&&typeof image.close==='function')image.close();if(sourceURL)URL.revokeObjectURL(sourceURL);}
 }
 function indexedAdapter(){
  let connection;
  function open(){
   if(connection)return connection;
   connection=new Promise((resolve,reject)=>{
    if(!root.indexedDB){reject(Error('Private photo storage is unavailable in this browser.'));return;}
    const request=root.indexedDB.open(DB_NAME,1);
    request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(STORE))request.result.createObjectStore(STORE);};
    request.onerror=()=>{connection=null;reject(request.error||Error('Photo storage is unavailable.'));};
    request.onblocked=()=>{connection=null;reject(Error('Close other Chisel tabs and try again.'));};
    request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>{db.close();connection=null;};resolve(db);};
   });return connection;
  }
  async function transact(mode,operation){
   const db=await open();return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,mode),request=operation(tx.objectStore(STORE));let value;
    request.onsuccess=()=>{value=request.result;};
    tx.oncomplete=()=>resolve(value||null);
    tx.onabort=tx.onerror=()=>reject(tx.error||request.error||Error('Could not save this photo on your device.'));
   });
  }
  return {read:()=>transact('readonly',s=>s.get(KEY)),write:value=>transact('readwrite',s=>s.put(value,KEY)),clear:()=>transact('readwrite',s=>s.delete(KEY))};
 }
 function createPhotoStore({adapter,prepare=preparePhoto,makeURL=b=>URL.createObjectURL(b),revokeURL=u=>URL.revokeObjectURL(u)}){
  let record=null,url=null,epoch=0,queue=Promise.resolve();const listeners=new Set();
  const snapshot=()=>Object.freeze({hasPhoto:!!record,url,width:record?record.width:null,height:record?record.height:null});
  const notify=()=>{for(const fn of listeners){try{fn(snapshot());}catch{}}};
  function replace(next){const old=url;record=next;url=next?makeURL(next.display):null;notify();if(old)revokeURL(old);}
  function serialize(fn){const task=queue.catch(()=>{}).then(fn);queue=task;return task;}
  async function load(){const ticket=epoch;const saved=await adapter.read();if(ticket!==epoch)return snapshot();
   const valid=saved&&saved.original instanceof Blob&&saved.display instanceof Blob&&Number.isFinite(saved.width)&&Number.isFinite(saved.height);
   replace(valid?saved:null);return snapshot();}
  async function set(original){validateFile(original);const ticket=++epoch,next=await prepare(original);
   return serialize(async()=>{if(ticket!==epoch)return false;await adapter.write(next);if(ticket!==epoch)return false;replace(next);return true;});}
  async function clear(){++epoch;return serialize(async()=>{await adapter.clear();replace(null);});}
  return {snapshot,load,set,clear,original:async()=>record?record.original:null,subscribe:fn=>{listeners.add(fn);fn(snapshot());return()=>listeners.delete(fn);}};
 }
 let liveStore=null,deletionInstalled=false;
 function getStore(){
  if(!liveStore){liveStore=createPhotoStore({adapter:indexedAdapter()});
   if(root.addEventListener)root.addEventListener('storage',e=>{if(e.key===REVISION_KEY||e.key===null)liveStore.load().catch(()=>{});});
  }return liveStore;
 }
 function broadcast(){try{root.localStorage.setItem(REVISION_KEY,`${Date.now()}:${Math.random()}`);}catch{}}
 async function save(file){const saved=await getStore().set(file);if(saved)broadcast();return saved;}
 async function remove(){await getStore().clear();broadcast();}
 function notify(message){
  // Named DOM elements may also appear on window; never call one as a function.
  if(typeof root.toast==='function'){root.toast(message);return;}
  const node=root.document&&root.document.getElementById('toast');
  if(node){node.textContent=message;node.setAttribute('role','status');node.classList.add('on');root.setTimeout(()=>node.classList.remove('on'),3500);}
 }
 function installDeletion(){
  if(deletionInstalled||!root.document)return;
  const button=root.document.getElementById('wipeData');if(!button)return;
  deletionInstalled=true;
  const original=root.wipeAllData;
  // Replace the one existing action so IndexedDB deletion completes before the
  // success notice and reload. A rejected deletion never reports success.
  if(typeof original==='function')button.removeEventListener('click',original);
  const wipe=async function(){
   if(!root.confirm('Delete all Chisel data on this device, including your saved photo? This cannot be undone.'))return;
   button.disabled=true;
   try{
    await remove();
    Object.keys(root.localStorage).filter(k=>k.startsWith('chisel:')).forEach(k=>root.localStorage.removeItem(k));
    root.dispatchEvent(new CustomEvent('chisel:data-cleared'));
    notify('Your local data was cleared');
    setTimeout(()=>root.location.reload(),400);
   }catch(error){notify('Could not finish deleting your data. Please try again.');}
   finally{button.disabled=false;}
  };
  root.wipeAllData=wipe;button.addEventListener('click',wipe);
 }
 return {MAX_BYTES,displaySize,validateFile,signatureMatches,preparePhoto,createPhotoStore,getStore,save,remove,installDeletion};
});
