/* Actual original-photo -> consent -> cloud job -> downloaded result flow.
 * No stock results, scored beauty claims or replacement of the personal original. */
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;else root.ChiselLooksStudio=api;})(typeof globalThis!=='undefined'?globalThis:this,function(root){
'use strict';
const PENDING='chisel:looks:pending';
const q=s=>root.document.querySelector(s),all=s=>Array.from(root.document.querySelectorAll(s));
let installed=false,controller,store,category='hair',preset='crop',color='match',epoch=0,preparing=false,ready=false,source=null,result=null,sourceURL=null,resultURL=null,saveId=null,savedLook=null,sourceIdentity=null,photoURL=null;
let previewController=null,consentDialog,consentResolve=null,consentReturn=null;const galleryURLs=new Set();
const text=(selector,value)=>{const n=q(selector);if(n&&n.textContent!==value)n.textContent=value;};
const show=(selector,value)=>{const n=q(selector);if(n)n.hidden=!value;};
function revoke(){for(const u of [sourceURL,resultURL])if(u)URL.revokeObjectURL(u);sourceURL=resultURL=null;source=result=null;saveId=null;savedLook=null;show('#clsResult',false);}
function config(){
 const legacy=typeof RENDER_FN_URL==='string'?RENDER_FN_URL:'';
 const endpoint=legacy.replace(/\/render-lookmax$/,'/looks-studio');
 if(!/^https:\/\/[a-z0-9]{20}\.supabase\.co\/functions\/v1\/looks-studio$/.test(endpoint))throw Error('server_not_configured');
 return {endpoint,key:typeof RENDER_ANON_KEY==='string'?RENDER_ANON_KEY:''};
}
async function request(payload){
 if(!navigator.onLine)throw Error('offline');const c=config();
 const response=await fetch(c.endpoint,{method:payload?'POST':'GET',headers:{apikey:c.key,...(payload?{'Content-Type':'application/json'}:{})},...(payload?{body:JSON.stringify(payload)}:{}),signal:AbortSignal.timeout(30000),cache:'no-store',credentials:'omit',redirect:'error'});
 const body=await boundedBytes(response,65536);let data;try{data=JSON.parse(new TextDecoder().decode(body));}catch{throw Error('invalid_response');}
 if(!response.ok&&!data.error)throw Error('service_unavailable');return data;
}
async function boundedBytes(response,max){
 const length=response.headers.get('Content-Length');if(length&&(!/^\d+$/.test(length)||Number(length)>max))throw Error('response_too_large');
 if(!response.body)throw Error('empty_response');const reader=response.body.getReader(),chunks=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();throw Error('response_too_large');}chunks.push(value);}}finally{reader.releaseLock();}
 const out=new Uint8Array(size);let at=0;for(const part of chunks){out.set(part,at);at+=part.length;}return out;
}
function id(){return typeof root.deviceId==='function'?root.deviceId():(()=>{let v=localStorage.getItem('chisel:looks-device');if(!v){v=crypto.randomUUID();localStorage.setItem('chisel:looks-device',v);}return v;}) ();}
async function fileDigest(blob){const b=await crypto.subtle.digest('SHA-256',await blob.arrayBuffer());return Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');}
function consent(){return new Promise(resolve=>{consentResolve=resolve;consentReturn=root.document.activeElement;consentDialog.showModal();q('#clsConsentCancel').focus({preventScroll:true});});}
function closeConsent(accepted){if(!consentResolve)return;const done=consentResolve;consentResolve=null;consentDialog.close();done(accepted);}
function persist(s){try{if(['idle','canceled','failed'].includes(s.status))sessionStorage.removeItem(PENDING);else sessionStorage.setItem(PENDING,JSON.stringify({...s,imageUrl:undefined,sourceIdentity}));}catch{}}
function labels(){
 const state=controller.snapshot(),active=['submitting','starting','processing','canceling'].includes(state.status),waiting=state.status==='interrupted';
 const button=q('#clsGenerate');if(button){button.disabled=!store.snapshot().hasPhoto||preparing||active||!ready;button.textContent=waiting?'Check status':active?'Creating look…':state.status==='succeeded'&&!result?'Open preview':'Create look';}
 all('#clsPresets button,#clsColor,.cps-style-tabs button').forEach(n=>n.disabled=preparing||active||waiting);
 show('#clsCancel',preparing||active||waiting);show('#clsBusy',preparing||active);
 if(active)text('#clsStatus','Creating your look. You can cancel or return later.');
 if(waiting)text('#clsStatus',root.ChiselLooksCore.message(state.error));
 if(state.status==='failed')text('#clsStatus',root.ChiselLooksCore.message(state.error));
 if(state.status==='canceled')text('#clsStatus','Preview dismissed. A provider cancellation is requested when possible.');
}
function renderPresets(){
 const catalog=root.ChiselLookCatalog,strip=q('#clsPresets');strip.replaceChildren();
 for(const item of catalog.CATALOG[category]){const b=root.document.createElement('button');b.type='button';b.dataset.clsPreset=item.id;b.textContent=item.label;b.setAttribute('aria-pressed',String(item.id===preset));strip.append(b);}
 show('#clsColorLabel',category==='hair');labels();
}
async function prepareOriginal(original){
 root.ChiselPersonalPhoto.validateFile(original);const head=new Uint8Array(await original.slice(0,12).arrayBuffer());if(!root.ChiselPersonalPhoto.signatureMatches(original.type,head))throw Error('invalid_image');
 const bitmap=await createImageBitmap(original);let canvas;
 try{const size=root.ChiselPersonalPhoto.displaySize(bitmap.width,bitmap.height);canvas=root.document.createElement('canvas');canvas.width=size.width;canvas.height=size.height;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(bitmap,0,0,size.width,size.height);}finally{bitmap.close();}
 const faces=await root.ChiselSkinAppearance.detectFaces(canvas);
 if(!faces||faces.length!==1)throw Error('Use a clear photo containing exactly one face.');
 const quality=root.ChiselCaptureQuality,frame=quality.assessFace(faces[0],canvas.width,canvas.height,{hair:category==='hair'});
 if(!frame.accepted)throw Error(frame.reasons[0]);
 const b=frame.bounds,ctx=canvas.getContext('2d'),pixels=ctx.getImageData(Math.floor(b.left*canvas.width),Math.floor(b.top*canvas.height),Math.max(3,Math.floor((b.right-b.left)*canvas.width)),Math.max(3,Math.floor((b.bottom-b.top)*canvas.height)));
 const check=quality.assessPixels(pixels);if(!check.accepted)throw Error(check.reasons[0]);
 const blob=await new Promise((resolve,reject)=>canvas.toBlob(x=>x?resolve(x):reject(Error('Could not prepare the photo.')),'image/jpeg',.93));
 if(blob.size>5500000)throw Error('Choose a smaller original photo.');
 const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('Could not read this photo.'));r.readAsDataURL(blob);});
 return {blob,data};
}
async function loadResult(state,mine){
 if(previewController)previewController.abort();previewController=new AbortController();text('#clsStatus','Opening your preview…');
 try{
  const url=root.ChiselLooksCore.safeOutput(state.imageUrl);if(!url)throw Error('invalid_output');
  const c=config();const response=await fetch(c.endpoint,{method:'POST',headers:{apikey:c.key,'Content-Type':'application/json'},body:JSON.stringify({action:'output',requestId:state.requestId,token:state.token,deviceId:state.deviceId}),credentials:'omit',cache:'no-store',redirect:'error',signal:AbortSignal.any([previewController.signal,AbortSignal.timeout(25000)])});
  if(!response.ok)throw Error('The preview link expired. Check status before creating another look.');
  const bytes=await boundedBytes(response,8000000),type=(response.headers.get('Content-Type')||'').split(';')[0];
  if(!root.ChiselPersonalPhoto.signatureMatches(type,bytes))throw Error('The provider returned an unsupported image.');
  const blob=new Blob([bytes],{type});const decoded=await createImageBitmap(blob);try{root.ChiselPersonalPhoto.displaySize(decoded.width,decoded.height);}finally{decoded.close();}
  if(mine!==epoch)return;
  if(resultURL)URL.revokeObjectURL(resultURL);result=blob;resultURL=URL.createObjectURL(blob);saveId=state.jobId||crypto.randomUUID();
  q('#clsAfter').src=resultURL;q('#clsBefore').src=sourceURL;show('#clsResult',true);q('#clsPanel').open=true;q('#clsCompare').value='50';q('#clsAfter').style.clipPath='inset(0 50% 0 0)';
  text('#clsStatus','AI preview. Check your face, hairline and edges before saving.');text('#clsAllowance',Number.isFinite(state.remaining)?`${state.remaining} renders left today`:'');q('#clsResult').scrollIntoView({block:'nearest',behavior:'auto'});
 }catch(e){if(mine===epoch)text('#clsStatus',e.message||'Could not open the preview.');}
}
async function generate(){
 if(preparing)return;const s=controller.snapshot();if(['submitting','starting','processing','canceling'].includes(s.status))return;
 const mine=++epoch;preparing=true;labels();
 try{
  const original=await store.original();if(!original)throw Error('Choose your photo first.');
  if(s.status==='succeeded'&&!result){if(!source){const previousCategory=category;category=s.look?.category||category;try{const prepared=await prepareOriginal(original);if(mine!==epoch)return;source=prepared.blob;sourceURL=URL.createObjectURL(source);}finally{category=previousCategory;}}await loadResult(s,mine);return;}
  sourceIdentity=await fileDigest(original);text('#clsStatus','Checking your photo on this device…');
  const prepared=await prepareOriginal(original);if(mine!==epoch)return;
  if(s.status!=='interrupted'&&!await consent()){text('#clsStatus','Nothing uploaded.');return;}
  if(mine!==epoch)return;
  revoke();source=prepared.blob;sourceURL=URL.createObjectURL(source);preparing=false;
  let state;if(s.status==='interrupted')state=await controller.resume();else state=await controller.generate({image:prepared.data,look:root.ChiselLookCatalog.normalizeLook({category,preset,color:category==='hair'?color:'match'}),deviceId:id()});
  if(mine===epoch&&state.status==='succeeded')await loadResult(state,mine);
 }catch(e){if(mine===epoch)text('#clsStatus',e.message in {'offline':1,'server_not_configured':1}?root.ChiselLooksCore.message(e.message):e.message||'Could not prepare this look.');}
 finally{if(mine===epoch){preparing=false;labels();}}
}
async function cancel(){epoch++;preparing=false;closeConsent(false);if(previewController)previewController.abort();await controller.cancel();labels();}
async function gallery(){
 const node=q('#clsSavedList');if(!node)return;for(const url of galleryURLs)URL.revokeObjectURL(url);galleryURLs.clear();node.replaceChildren();
 let items;try{items=await root.ChiselLooksGallery.list();}catch{text('#clsSavedStatus','Saved looks are unavailable.');return;}
 text('#clsSavedStatus',items.length?'Saved on this device.':'No saved looks yet.');
 for(const item of items){const row=root.document.createElement('div');row.className='cls-saved-row';const img=root.document.createElement('img');img.alt='Saved AI look';const url=URL.createObjectURL(item.result);galleryURLs.add(url);img.src=url;const title=root.document.createElement('span');title.textContent=root.ChiselLookCatalog.CATALOG[item.look.category]?.find(x=>x.id===item.look.preset)?.label||'Saved look';const open=root.document.createElement('button');open.type='button';open.textContent='Open';open.addEventListener('click',()=>{epoch++;controller.clear();revoke();source=item.original;result=item.result;sourceURL=URL.createObjectURL(source);resultURL=URL.createObjectURL(result);saveId=item.id;savedLook=item.look;q('#clsBefore').src=sourceURL;q('#clsAfter').src=resultURL;show('#clsResult',true);q('#clsResult').scrollIntoView({block:'nearest'});});const remove=root.document.createElement('button');remove.type='button';remove.textContent='Delete';remove.setAttribute('aria-label',`Delete ${title.textContent}`);remove.addEventListener('click',async()=>{try{await root.ChiselLooksGallery.remove(item.id);if(saveId===item.id)revoke();await gallery();}catch{text('#clsSavedStatus','Could not delete this look.');}});row.append(img,title,open,remove);node.append(row);}
}
async function save(){if(!source||!result)return;const state=controller.snapshot(),mine=epoch;try{const ok=await root.ChiselLooksGallery.save({id:saveId||crypto.randomUUID(),createdAt:Date.now(),look:savedLook||state.look||{category,preset,color},original:source,result});if(mine===epoch){text('#clsStatus',ok?'Saved on this device.':'Save cancelled.');await gallery();}}catch(e){text('#clsStatus',e.message||'Could not save the look.');}}
async function download(){if(!result)return;try{const file=new File([result],`chisel-look-${Date.now()}.${result.type==='image/png'?'png':'jpg'}`,{type:result.type});if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:'Chisel AI look'});return;}const url=URL.createObjectURL(file),a=root.document.createElement('a');a.href=url;a.download=file.name;root.document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){if(e.name!=='AbortError')text('#clsStatus','Could not export this preview.');}}
async function clearSaved(){epoch++;preparing=false;closeConsent(false);if(previewController)previewController.abort();controller?.clear();revoke();sessionStorage.removeItem(PENDING);await root.ChiselLooksGallery.clear();await gallery();}
function install(){
 if(installed||!root.document||!q('#cpsStyleHero')||!root.ChiselLookCatalog)return false;installed=true;store=root.ChiselPersonalPhoto.getStore();
 const panel=root.document.createElement('details');panel.id='clsPanel';panel.className='cls-panel';panel.setAttribute('aria-label','Photoreal photo editor');
 panel.innerHTML=`<summary>Create a photo preview</summary><div class="cls-section-title"><h3>Photo preview</h3><span>Optional cloud edit</span></div><div id="clsPresets" class="cls-presets" role="group" aria-label="Look presets"></div><label id="clsColorLabel" class="cls-color-label">Hair colour<select id="clsColor"></select></label><button id="clsGenerate" class="cps-primary" type="button" disabled>Create look</button><div id="clsBusy" class="cls-loading" role="progressbar" aria-label="Creating your look" hidden></div><button id="clsCancel" class="cps-secondary" type="button" hidden>Cancel</button><p id="clsStatus" class="cls-status" role="status" aria-live="polite">Checking cloud availability…</p><span id="clsAllowance"></span><section id="clsResult" class="cls-result" aria-label="Original and AI preview" hidden><div class="cls-compare"><img id="clsBefore" alt="Your original photo"><img id="clsAfter" alt="AI-generated style preview"></div><label class="cls-comparison-label">Original / AI preview<input id="clsCompare" type="range" min="0" max="100" value="50" aria-label="Compare original and AI preview"></label><div class="cls-result-actions"><button id="clsSave" class="cps-primary" type="button">Save look</button><button id="clsExport" class="cps-secondary" type="button">Export</button><button id="clsDismiss" class="cps-secondary" type="button">Dismiss</button></div></section><details class="cls-saved"><summary>Saved looks</summary><p id="clsSavedStatus"></p><div id="clsSavedList"></div></details>`;
 q('#cpsTryStyle').insertAdjacentElement('beforebegin',panel);
 const select=q('#clsColor');for(const [value]of Object.entries(root.ChiselLookCatalog.COLORS)){const opt=root.document.createElement('option');opt.value=value;opt.textContent=value==='match'?'Keep my colour':value.charAt(0).toUpperCase()+value.slice(1);select.append(opt);}select.addEventListener('change',()=>color=select.value);
 q('#clsPresets').addEventListener('click',e=>{const b=e.target.closest('[data-cls-preset]');if(b){preset=b.dataset.clsPreset;renderPresets();}});
 q('.cps-style-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-cps-style]');if(!b)return;category=b.dataset.cpsStyle==='glasses'?'eyewear':b.dataset.cpsStyle;preset=root.ChiselLookCatalog.CATALOG[category][0].id;color='match';select.value=color;renderPresets();});
 consentDialog=root.document.createElement('dialog');consentDialog.id='clsConsent';consentDialog.className='cls-consent';consentDialog.setAttribute('aria-labelledby','clsConsentTitle');consentDialog.innerHTML='<h2 id="clsConsentTitle">Create a cloud preview?</h2><p>This sends a prepared copy of your photo to Replicate through Chisel. The AI result may change details beyond your selected style.</p><p>Chisel does not store the photo on its server. Provider processing and retention apply. Your original on this device stays unchanged.</p><div><button id="clsConsentCancel" class="cps-secondary" type="button">Not now</button><button id="clsConsentAccept" class="cps-primary" type="button">Send photo & create</button></div>';
 root.document.body.append(consentDialog);q('#clsConsentCancel').addEventListener('click',()=>closeConsent(false));q('#clsConsentAccept').addEventListener('click',()=>closeConsent(true));consentDialog.addEventListener('cancel',e=>{e.preventDefault();closeConsent(false);});consentDialog.addEventListener('close',()=>consentReturn?.isConnected&&consentReturn.focus({preventScroll:true}));root.addEventListener('keydown',e=>{if(consentDialog.open)e.stopPropagation();},true);
 const savedText=sessionStorage.getItem(PENDING);
 controller=root.ChiselLooksCore.createController({request,persist});controller.subscribe(labels);renderPresets();
 q('#clsGenerate').addEventListener('click',generate);q('#clsCancel').addEventListener('click',cancel);q('#clsSave').addEventListener('click',save);q('#clsExport').addEventListener('click',download);q('#clsDismiss').addEventListener('click',()=>{epoch++;controller.clear();revoke();text('#clsStatus','');});q('#clsCompare').addEventListener('input',e=>q('#clsAfter').style.clipPath=`inset(0 ${100-Number(e.target.value)}% 0 0)`);q('.cls-saved').addEventListener('toggle',e=>{if(e.target.open)gallery();});
 store.subscribe(s=>{if(photoURL!==null&&s.url!==photoURL){cancel();revoke();controller.clear();sessionStorage.removeItem(PENDING);if(!s.hasPhoto)root.ChiselLooksGallery.clear().then(gallery).catch(()=>{});}photoURL=s.url;labels();});
 request().then(s=>{ready=s.ready===true;text('#clsStatus',ready?'Choose a look. Your photo uploads only after confirmation.':root.ChiselLooksCore.message(s.error));labels();}).catch(()=>{text('#clsStatus','Cloud service unavailable. Local camera guides still work.');});
 root.addEventListener('online',()=>request().then(s=>{ready=s.ready===true;labels();}).catch(()=>{}));
 // Pending entries contain a capability and hashes, not portrait pixels.
 if(savedText)try{const saved=JSON.parse(savedText);if(saved.createdAt>Date.now()-3600000){const resumedEpoch=epoch;store.load().then(async()=>{const original=await store.original();if(resumedEpoch!==epoch||!original||await fileDigest(original)!==saved.sourceIdentity){sessionStorage.removeItem(PENDING);return;}sourceIdentity=saved.sourceIdentity;controller.resume({...saved,status:'interrupted'}).then(async state=>{if(resumedEpoch===epoch&&state.status==='succeeded'){const prepared=await prepareOriginal(original);if(resumedEpoch!==epoch)return;source=prepared.blob;sourceURL=URL.createObjectURL(source);await loadResult(state,resumedEpoch);}}).catch(()=>text('#clsStatus','Check status to reopen this preview.'));}).catch(()=>text('#clsStatus','Could not restore this preview.'));}else sessionStorage.removeItem(PENDING);}catch{sessionStorage.removeItem(PENDING);}
 root.document.documentElement.dataset.looksStudio='1';return true;
}
return{install,clearSaved};
});
