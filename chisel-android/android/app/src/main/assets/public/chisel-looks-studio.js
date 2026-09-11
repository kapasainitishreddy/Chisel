/* Actual original-photo -> consent -> cloud job -> downloaded result flow.
 * No stock results, scored beauty claims or replacement of the personal original. */
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;else root.ChiselLooksStudio=api;})(typeof globalThis!=='undefined'?globalThis:this,function(root){
'use strict';
const PENDING='chisel:looks:pending';
const CATEGORY_LABELS=Object.freeze({hair:'Hairstyle',beard:'Facial hair',makeup:'Makeup',eyewear:'Frames'});
const SWATCHES=Object.freeze({match:null,black:'#1b1b1b','dark brown':'#35251f',brown:'#664936','light brown':'#9c7351',blonde:'#d2b47b',platinum:'#e5ddc9',auburn:'#7b3525',copper:'#b66539',gray:'#777b7a',silver:'#bbc0bc'});
function selectionView(catalog,kind,id){
 if(!Object.prototype.hasOwnProperty.call(CATEGORY_LABELS,kind)||!catalog||!Array.isArray(catalog.CATALOG?.[kind]))return null;
 const items=catalog.CATALOG[kind],item=items.find(p=>p.id===id);
 return item?{name:item.label,label:CATEGORY_LABELS[kind],count:items.length}:null;
}
function matchesPreset(item,term){return !!item&&String(item.label).toLowerCase().includes(String(term||'').trim().toLowerCase());}
const glyph=name=>`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${({back:'m14 5-7 7 7 7',arrow:'M4 12h16m-6-6 6 6-6 6',grid:'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',close:'m6 6 12 12M18 6 6 18',edit:'m4 16 11-11 4 4L8 20H4z',check:'m5 12 4 4L19 6',photo:'M4 4h16v16H4zM4 16l5-5 4 4 3-3 4 4',search:'M20 20l-5-5M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0'})[name]||''}"/></svg>`;
let editor,lookBrowser,library,editorReturn=null,browserReturn=null;

const q=s=>root.document.querySelector(s),all=s=>Array.from(root.document.querySelectorAll(s));
let installed=false,controller,store,category='hair',preset='crop',color='match',epoch=0,preparing=false,ready=false,source=null,result=null,sourceURL=null,resultURL=null,saveId=null,savedLook=null,sourceIdentity=null,photoURL=null;
let previewController=null,consentDialog,consentResolve=null,consentReturn=null;const galleryURLs=new Set();
const text=(selector,value)=>{const n=q(selector);if(n&&n.textContent!==value)n.textContent=value;};
const show=(selector,value)=>{const n=q(selector);if(n)n.hidden=!value;};
function revoke(){for(const u of [sourceURL,resultURL])if(u)URL.revokeObjectURL(u);sourceURL=resultURL=null;source=result=null;saveId=null;savedLook=null;displayResult(false);}
function config(payload){
 if(payload?.backend==='credits'||(!payload&&root.ChiselCredits?.isActive()))return{endpoint:root.ChiselCredits.endpoint(),key:typeof RENDER_ANON_KEY==='string'?RENDER_ANON_KEY:'',paid:true};
 const legacy=typeof RENDER_FN_URL==='string'?RENDER_FN_URL:'';
 const endpoint=legacy.replace(/\/render-lookmax$/,'/looks-studio');
 if(!/^https:\/\/[a-z0-9]{20}\.supabase\.co\/functions\/v1\/looks-studio$/.test(endpoint))throw Error('server_not_configured');
 return {endpoint,key:typeof RENDER_ANON_KEY==='string'?RENDER_ANON_KEY:''};
}
async function request(payload){
 if(!navigator.onLine)throw Error('offline');const c=config(payload);
 const response=await fetch(c.endpoint,{method:payload?'POST':'GET',headers:{apikey:c.key,...(c.paid&&root.ChiselCredits.userId()?await root.ChiselCredits.headers(payload?.owner):{}),...(payload?{'Content-Type':'application/json'}:{})},...(payload?{body:JSON.stringify(payload)}:{}),signal:AbortSignal.timeout(30000),cache:'no-store',credentials:'omit',redirect:'error'});
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
function consent(){
 if(root.ChiselCredits?.isActive()){const quote=root.ChiselCredits.quote();const ps=consentDialog.querySelectorAll('p');ps[0].textContent=`This sends a prepared copy of your photo to OpenAI. ${quote.credits} ${quote.credits===1?'credit':'credits'} will be reserved. Failed edits return credits.`;ps[1].textContent='The AI result can change unintended details. Chisel temporarily stores the result privately for retrieval. Provider processing and retention apply. Your original stays on this device.';q('#clsConsentAccept').textContent=`Create · ${quote.credits} ${quote.credits===1?'credit':'credits'}`;}
 return new Promise(resolve=>{consentResolve=resolve;consentReturn=root.document.activeElement;consentDialog.showModal();q('#clsConsentCancel').focus({preventScroll:true});});}
function closeConsent(accepted){if(!consentResolve)return;const done=consentResolve;consentResolve=null;consentDialog.close();done(accepted);}
function persist(s){try{if(['idle','canceled','failed'].includes(s.status))sessionStorage.removeItem(PENDING);else sessionStorage.setItem(PENDING,JSON.stringify({...s,imageUrl:undefined,sourceIdentity}));}catch{}}
function labels(){
 const state=controller.snapshot(),active=['submitting','starting','processing','canceling'].includes(state.status),waiting=state.status==='interrupted';
 const paid=root.ChiselCredits?.isActive(),creditQuote=paid?root.ChiselCredits.quote():null;
 const button=q('#clsGenerate');if(button){button.disabled=!store.snapshot().hasPhoto||preparing||active||(!ready&&!waiting&&!(state.status==='succeeded'&&!result));button.textContent=waiting?'Check status':active?'Creating preview…':state.status==='succeeded'&&!result?'Open preview':!ready?'Preview unavailable':paid?`Generate · ${creditQuote.credits} ${creditQuote.credits===1?'credit':'credits'}`:'Generate preview';}
 all('#clsPresets button,#clsColor,#clsSwatches button,#clsBrowse,[data-cls-category],.cps-style-tabs button').forEach(n=>n.disabled=preparing||active||waiting);
 show('#clsCancel',preparing||active||waiting);if(paid)q('#clsCancel').textContent='Close';
 all('#ccModeGroup button').forEach(b=>b.disabled=preparing||active||waiting);show('#clsBusy',preparing||active);if(editor)editor.dataset.busy=String(preparing||active);
 if(active)text('#clsStatus',paid?'Creating your look. You can close and return later.':'Creating your look. You can cancel or return later.');
 if(waiting)text('#clsStatus',root.ChiselLooksCore.message(state.error));
 if(state.status==='failed')text('#clsStatus',root.ChiselLooksCore.message(state.error));
 if(state.status==='canceled')text('#clsStatus','Preview dismissed. A provider cancellation is requested when possible.');
}
function renderPresets(){
 const catalog=root.ChiselLookCatalog,strip=q('#clsPresets'),term=q('#clsSearch')?.value||'';strip.replaceChildren();
 for(const item of catalog.CATALOG[category]){
  const b=root.document.createElement('button');b.type='button';b.dataset.clsPreset=item.id;
  const name=root.document.createElement('span');name.textContent=item.label;b.append(name);
  const tick=root.document.createElement('span');tick.className='cls-choice-mark';tick.innerHTML=glyph('check');b.append(tick);
  b.setAttribute('aria-pressed',String(item.id===preset));b.hidden=!matchesPreset(item,term);strip.append(b);
 }
 const view=selectionView(catalog,category,preset);
 text('#clsSelectedName',view?.name||'Choose a look');text('#clsSelectionLabel',view?.label||'Style');
 text('#clsBrowserTitle',category==='hair'?'Hairstyles':category==='beard'?'Facial hair':category==='makeup'?'Makeup':'Frames');
 show('#clsNoMatches',!catalog.CATALOG[category].some(p=>matchesPreset(p,term)));
 all('[data-cls-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.clsCategory===category)));
 show('#clsColorLabel',category==='hair');show('#clsSwatches',category==='hair');labels();
}
function syncColor(){
 color=q('#clsColor').value;text('#clsColorName',color==='match'?'Natural':color.charAt(0).toUpperCase()+color.slice(1));
 all('[data-cls-color]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.clsColor===color)));
}
function selectCategory(value){
 if(!Object.prototype.hasOwnProperty.call(CATEGORY_LABELS,value))return;
 category=value;preset=root.ChiselLookCatalog.CATALOG[category][0].id;color='match';q('#clsColor').value=color;q('#clsSearch').value='';syncColor();renderPresets();
}
function openEditor(){
 if(!editor)return;if(!editor.open){editorReturn=root.document.activeElement;editor.showModal();}
 q('#clsPanel').open=true;syncPortrait(store.snapshot());q('#clsEditorClose').focus({preventScroll:true});
}
function closeEditor(){
 // Leaving before upload invalidates pending preparation; submitted jobs keep their identity.
 if(preparing){epoch++;preparing=false;labels();}
 closeConsent(false);if(lookBrowser.open)lookBrowser.close();if(library.open)library.close();editor.close();q('#clsPanel').open=false;
 // Closing the workspace does not start another request or silently cancel a paid job.
}
function syncPortrait(snapshot){
 const img=q('#clsPortrait');if(!img)return;
 if(snapshot.hasPhoto&&snapshot.url){if(img.getAttribute('src')!==snapshot.url)img.src=snapshot.url;img.hidden=false;}
 else{img.removeAttribute('src');img.hidden=true;}
 show('#clsPhotoEmpty',!snapshot.hasPhoto);show('#clsOriginalTag',snapshot.hasPhoto);
}
function displayResult(visible){
 show('#clsResult',visible);show('#clsPhotoStage',!visible);if(editor)editor.dataset.result=String(visible);
}
function openBrowser(){browserReturn=root.document.activeElement;q('#clsSearch').value='';renderPresets();lookBrowser.showModal();q('#clsSearch').focus({preventScroll:true});}
function openLibrary(){library.showModal();q('.cls-saved').open=true;gallery();}
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
 return {blob,data,shape:canvas.height>canvas.width*1.1?'portrait':canvas.width>canvas.height*1.1?'landscape':'square'};
}
async function loadResult(state,mine){
 if(previewController)previewController.abort();previewController=new AbortController();text('#clsStatus','Opening your preview…');
 try{
  const paid=state.backend==='credits'&&state.outputReady===true;const url=root.ChiselLooksCore.safeOutput(state.imageUrl);if(!paid&&!url)throw Error('invalid_output');
  const c=config(state);const response=await fetch(c.endpoint,{method:'POST',headers:{apikey:c.key,'Content-Type':'application/json',...(c.paid?await root.ChiselCredits.headers(state.owner):{})},body:JSON.stringify({action:'output',requestId:state.requestId,token:state.token,deviceId:state.deviceId}),credentials:'omit',cache:'no-store',redirect:'error',signal:AbortSignal.any([previewController.signal,AbortSignal.timeout(25000)])});
  if(!response.ok)throw Error('The preview link expired. Check status before creating another look.');
  const bytes=await boundedBytes(response,8000000),type=(response.headers.get('Content-Type')||'').split(';')[0];
  if(!root.ChiselPersonalPhoto.signatureMatches(type,bytes))throw Error('The provider returned an unsupported image.');
  const blob=new Blob([bytes],{type});const decoded=await createImageBitmap(blob);try{root.ChiselPersonalPhoto.displaySize(decoded.width,decoded.height);}finally{decoded.close();}
  if(mine!==epoch)return;
  if(resultURL)URL.revokeObjectURL(resultURL);result=blob;resultURL=URL.createObjectURL(blob);saveId=state.jobId||crypto.randomUUID();
  q('#clsAfter').src=resultURL;q('#clsBefore').src=sourceURL;displayResult(true);q('#clsCompare').value='50';q('#clsAfter').style.clipPath='inset(0 50% 0 0)';
  text('#clsStatus','AI preview. Check your face, hairline and edges before saving.');text('#clsAllowance',Number.isFinite(state.balance)?`${state.balance} credits remaining`:Number.isFinite(state.remaining)?`${state.remaining} renders left today`:'');if(editor.open)q('#clsResult').scrollIntoView({block:'nearest',behavior:'auto'});
 }catch(e){if(mine===epoch)text('#clsStatus',e.message||'Could not open the preview.');}
}
async function generate(){
 if(preparing)return;
 const paid=root.ChiselCredits?.isActive(),quote=paid?root.ChiselCredits.quote():null;
 if(paid&&!root.ChiselCredits.userId()){root.ChiselCredits.open();return;}
 const s=controller.snapshot();if(['submitting','starting','processing','canceling'].includes(s.status))return;
 const mine=++epoch;preparing=true;labels();
 try{
  if(paid&&s.status!=='interrupted'&&!(s.status==='succeeded'&&!result)){await root.ChiselCredits.refresh();if(mine!==epoch)return;if(root.ChiselCredits.userId()!==quote.userId)throw Error('Sign in again before creating this edit.');if((root.ChiselCredits.snapshot()?.balance??0)<quote.credits){root.ChiselCredits.open();return;}}
  const original=await store.original();if(!original)throw Error('Choose your photo first.');
  if(s.status==='succeeded'&&!result){if(!source){const previousCategory=category;category=s.look?.category||category;try{const prepared=await prepareOriginal(original);if(mine!==epoch)return;source=prepared.blob;sourceURL=URL.createObjectURL(source);}finally{category=previousCategory;}}await loadResult(s,mine);return;}
  sourceIdentity=await fileDigest(original);text('#clsStatus','Checking your photo on this device…');
  const prepared=await prepareOriginal(original);if(mine!==epoch)return;
  if(s.status!=='interrupted'&&!await consent()){text('#clsStatus','Nothing uploaded.');return;}
  if(mine!==epoch)return;
  revoke();source=prepared.blob;sourceURL=URL.createObjectURL(source);preparing=false;
  let state;if(s.status==='interrupted')state=await controller.resume();else state=await controller.generate({image:prepared.data,look:root.ChiselLookCatalog.normalizeLook({category,preset,color:category==='hair'?color:'match'}),deviceId:id(),...(paid?{backend:'credits',owner:quote.userId,quality:quote.quality,quotedCredits:quote.credits,consent:true,shape:prepared.shape}:{})});
  if(mine===epoch&&state.status==='succeeded')await loadResult(state,mine);
 }catch(e){if(mine===epoch)text('#clsStatus',e.message in {'offline':1,'server_not_configured':1}?root.ChiselLooksCore.message(e.message):e.message||'Could not prepare this look.');}
 finally{if(mine===epoch){preparing=false;labels();if(paid)root.ChiselCredits.refresh();}}
}
async function cancel(){if(controller?.snapshot().backend==='credits'&&['submitting','starting','processing','interrupted'].includes(controller.snapshot().status)){closeEditor();text('#clsStatus','Your edit is still processing. Reopen to check it.');return;}epoch++;preparing=false;closeConsent(false);if(previewController)previewController.abort();await controller.cancel();labels();}
async function gallery(){
 const node=q('#clsSavedList');if(!node)return;const ticket=epoch;
 let items;try{items=await root.ChiselLooksGallery.list();}catch{text('#clsSavedStatus','Saved looks are unavailable.');return;}
 if(ticket!==epoch)return;for(const url of galleryURLs)URL.revokeObjectURL(url);galleryURLs.clear();node.replaceChildren();
 text('#clsSavedStatus',items.length?'Saved on this device.':'No saved looks yet.');
 for(const item of items){const row=root.document.createElement('div');row.className='cls-saved-row';const img=root.document.createElement('img');img.alt='Saved AI look';const url=URL.createObjectURL(item.result);galleryURLs.add(url);img.src=url;const title=root.document.createElement('span');title.textContent=root.ChiselLookCatalog.CATALOG[item.look.category]?.find(x=>x.id===item.look.preset)?.label||'Saved look';const open=root.document.createElement('button');open.type='button';open.textContent='Open';open.addEventListener('click',()=>{epoch++;controller.clear();revoke();source=item.original;result=item.result;sourceURL=URL.createObjectURL(source);resultURL=URL.createObjectURL(result);saveId=item.id;savedLook=item.look;q('#clsBefore').src=sourceURL;q('#clsAfter').src=resultURL;if(library.open)library.close();displayResult(true);q('#clsResult').scrollIntoView({block:'nearest'});});const remove=root.document.createElement('button');remove.type='button';remove.textContent='Delete';remove.setAttribute('aria-label',`Delete ${title.textContent}`);remove.addEventListener('click',async()=>{try{await root.ChiselLooksGallery.remove(item.id);if(saveId===item.id)revoke();await gallery();}catch{text('#clsSavedStatus','Could not delete this look.');}});row.append(img,title,open,remove);node.append(row);}
}
async function save(){if(!source||!result)return;const state=controller.snapshot(),mine=epoch;try{const ok=await root.ChiselLooksGallery.save({id:saveId||crypto.randomUUID(),createdAt:Date.now(),look:savedLook||state.look||{category,preset,color},original:source,result,sourceIdentity:await fileDigest(source)});if(mine===epoch){text('#clsStatus',ok?'Saved on this device.':'Save cancelled.');await gallery();}}catch(e){text('#clsStatus',e.message||'Could not save the look.');}}
async function download(){if(!result)return;try{const file=new File([result],`chisel-look-${Date.now()}.${result.type==='image/png'?'png':'jpg'}`,{type:result.type});if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:'Chisel AI look'});return;}const url=URL.createObjectURL(file),a=root.document.createElement('a');a.href=url;a.download=file.name;root.document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){if(e.name!=='AbortError')text('#clsStatus','Could not export this preview.');}}
async function clearSaved(){epoch++;preparing=false;closeConsent(false);if(previewController)previewController.abort();controller?.clear();revoke();sessionStorage.removeItem(PENDING);await root.ChiselLooksGallery.clear();await gallery();await root.ChiselCredits?.signOut?.();}
function install(){
 if(installed||!root.document||!q('#cpsStyleHero')||!root.ChiselLookCatalog)return false;installed=true;store=root.ChiselPersonalPhoto.getStore();
 const panel=root.document.createElement('details');panel.id='clsPanel';panel.className='cls-panel';panel.setAttribute('aria-label','Photoreal photo editor');
 panel.innerHTML=`<summary aria-haspopup="dialog" aria-controls="clsEditor"><span>Open photo studio</span>${glyph('arrow')}</summary>`;
 q('#cpsTryStyle').insertAdjacentElement('beforebegin',panel);
 editor=root.document.createElement('dialog');editor.id='clsEditor';editor.className='cls-editor';editor.setAttribute('aria-labelledby','clsEditorTitle');
 editor.innerHTML=`<header class="cls-header"><button id="clsEditorClose" class="cls-icon" type="button" aria-label="Close photo studio">${glyph('back')}</button><h2 id="clsEditorTitle">Looks studio</h2><button id="clsLibraryOpen" class="cls-icon" type="button" aria-label="Saved looks">${glyph('grid')}</button></header>
 <div class="cls-workspace"><div class="cls-media">
 <figure id="clsPhotoStage" class="cls-photo-stage"><img id="clsPortrait" alt="Your original photo, no style applied" hidden><button id="clsPhotoEmpty" class="cls-empty" type="button">${glyph('photo')}<span>Add your photo</span></button><span id="clsOriginalTag" class="cls-original-tag" hidden>Original</span></figure>
 <section id="clsResult" class="cls-result" aria-label="Original and AI preview" hidden><div class="cls-compare"><img id="clsBefore" alt="Your original photo"><img id="clsAfter" alt="AI-generated style preview"><span class="cls-original-tag">Original / AI preview</span></div><label class="cls-comparison-label"><span>Original</span><input id="clsCompare" type="range" min="0" max="100" value="50" aria-label="Compare original and AI preview"><span>AI preview</span></label><div class="cls-result-actions"><button id="clsSave" class="cps-primary" type="button">Save look</button><button id="clsExport" class="cps-secondary" type="button">Export</button><button id="clsDismiss" class="cps-secondary" type="button">Back to editing</button></div></section>
 </div><section class="cls-console" aria-label="Edit your look">
 <div id="clsCategories" class="cls-categories" role="group" aria-label="Preview category"><button data-cls-category="hair" type="button" aria-pressed="true">Hair</button><button data-cls-category="beard" type="button" aria-pressed="false">Beard</button><button data-cls-category="makeup" type="button" aria-pressed="false">Makeup</button><button data-cls-category="eyewear" type="button" aria-pressed="false">Eyewear</button></div>
 <div class="cls-selection"><div><p id="clsSelectionLabel">Hairstyle</p><h3 id="clsSelectedName">Textured crop</h3></div><button id="clsBrowse" class="cls-browse" type="button" aria-haspopup="dialog" aria-controls="clsBrowser">Browse ${glyph('arrow')}</button></div>
 <div id="clsColorLabel" class="cls-color-label"><label for="clsColor">Hair colour</label><span id="clsColorName">Natural</span><select id="clsColor" class="cls-sr-only" aria-label="Hair colour" tabindex="-1" aria-hidden="true"></select></div><div id="clsSwatches" class="cls-swatches" role="group" aria-label="Hair colour swatches"></div>
 <footer class="cls-compose"><button id="clsGenerate" class="cps-primary" type="button" disabled>Preview unavailable</button><div id="clsBusy" class="cls-loading" role="progressbar" aria-label="Creating your look" hidden></div><button id="clsCancel" class="cps-secondary" type="button" hidden>Cancel</button><p id="clsStatus" class="cls-status" role="status" aria-live="polite">Checking cloud availability…</p><span id="clsAllowance"></span></footer>
 </section></div>`;
 root.document.body.append(editor);
 lookBrowser=root.document.createElement('dialog');lookBrowser.id='clsBrowser';lookBrowser.className='cls-browser';lookBrowser.setAttribute('aria-labelledby','clsBrowserTitle');
 lookBrowser.innerHTML=`<header class="cls-header"><h2 id="clsBrowserTitle">Hairstyles</h2><button class="cls-icon" id="clsBrowserClose" type="button" aria-label="Close styles">${glyph('close')}</button></header><label class="cls-search">${glyph('search')}<input id="clsSearch" type="search" placeholder="Search styles" aria-label="Search styles" autocomplete="off"></label><div id="clsPresets" class="cls-presets" role="group" aria-label="Look presets"></div><p id="clsNoMatches" hidden>No matching styles.</p>`;
 library=root.document.createElement('dialog');library.id='clsLibrary';library.className='cls-browser';library.setAttribute('aria-labelledby','clsLibraryTitle');library.innerHTML=`<header class="cls-header"><h2 id="clsLibraryTitle">Saved looks</h2><button id="clsLibraryClose" class="cls-icon" type="button" aria-label="Close saved looks">${glyph('close')}</button></header><details class="cls-saved"><summary>Your collection</summary><p id="clsSavedStatus"></p><div id="clsSavedList"></div></details>`;
 root.document.body.append(lookBrowser,library);
 panel.addEventListener('toggle',()=>{if(panel.open&&!editor.open)openEditor();});
 q('#clsEditorClose').addEventListener('click',closeEditor);editor.addEventListener('cancel',e=>{e.preventDefault();closeEditor();});
 editor.addEventListener('close',()=>{panel.open=false;if(editorReturn?.isConnected)editorReturn.focus({preventScroll:true});});
 q('#clsBrowse').addEventListener('click',openBrowser);q('#clsBrowserClose').addEventListener('click',()=>lookBrowser.close());lookBrowser.addEventListener('close',()=>browserReturn?.isConnected&&browserReturn.focus({preventScroll:true}));
 q('#clsSearch').addEventListener('input',renderPresets);q('#clsLibraryOpen').addEventListener('click',openLibrary);q('#clsLibraryClose').addEventListener('click',()=>library.close());
 q('#clsPhotoEmpty').addEventListener('click',()=>root.ChiselPersonalStudio.openPhoto());
 q('#clsCategories').addEventListener('click',e=>{const b=e.target.closest('[data-cls-category]');if(b&&!b.disabled)selectCategory(b.dataset.clsCategory);});
 q('#clsCategories').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;const buttons=all('[data-cls-category]'),i=buttons.indexOf(root.document.activeElement);if(i<0)return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[next].focus();buttons[next].click();});
 for(const [value,fill]of Object.entries(SWATCHES)){const b=root.document.createElement('button');b.type='button';b.className='cls-swatch';b.dataset.clsColor=value;b.setAttribute('aria-label',value==='match'?'Keep original hair colour':value);b.setAttribute('aria-pressed',String(value==='match'));b.title=value==='match'?'Natural':value;const dot=root.document.createElement('span');dot.className='cls-swatch-dot';if(fill)dot.style.background=fill;else dot.classList.add('cls-natural');b.append(dot);b.addEventListener('click',()=>{q('#clsColor').value=value;syncColor();});q('#clsSwatches').append(b);}
 const select=q('#clsColor');for(const [value]of Object.entries(root.ChiselLookCatalog.COLORS)){const opt=root.document.createElement('option');opt.value=value;opt.textContent=value==='match'?'Keep my colour':value.charAt(0).toUpperCase()+value.slice(1);select.append(opt);}select.addEventListener('change',syncColor);
 q('#clsPresets').addEventListener('click',e=>{const b=e.target.closest('[data-cls-preset]');if(b){preset=b.dataset.clsPreset;renderPresets();lookBrowser.close();q('#clsBrowse').focus({preventScroll:true});}});
 q('.cps-style-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-cps-style]');if(!b)return;selectCategory(b.dataset.cpsStyle==='glasses'?'eyewear':b.dataset.cpsStyle);});
 consentDialog=root.document.createElement('dialog');consentDialog.id='clsConsent';consentDialog.className='cls-consent';consentDialog.setAttribute('aria-labelledby','clsConsentTitle');consentDialog.innerHTML='<h2 id="clsConsentTitle">Create a cloud preview?</h2><p>This sends a prepared copy of your photo to Replicate through Chisel. The AI result may change details beyond your selected style.</p><p>Chisel does not store the photo on its server. Provider processing and retention apply. Your original on this device stays unchanged.</p><div><button id="clsConsentCancel" class="cps-secondary" type="button">Not now</button><button id="clsConsentAccept" class="cps-primary" type="button">Send photo & create</button></div>';
 root.document.body.append(consentDialog);q('#clsConsentCancel').addEventListener('click',()=>closeConsent(false));q('#clsConsentAccept').addEventListener('click',()=>closeConsent(true));consentDialog.addEventListener('cancel',e=>{e.preventDefault();closeConsent(false);});consentDialog.addEventListener('close',()=>consentReturn?.isConnected&&consentReturn.focus({preventScroll:true}));root.addEventListener('keydown',e=>{if(consentDialog.open)e.stopPropagation();},true);
 const savedText=sessionStorage.getItem(PENDING);
 controller=root.ChiselLooksCore.createController({request,persist});controller.subscribe(labels);renderPresets();
 q('#clsGenerate').addEventListener('click',generate);q('#clsCancel').addEventListener('click',cancel);q('#clsSave').addEventListener('click',save);q('#clsExport').addEventListener('click',download);q('#clsDismiss').addEventListener('click',()=>{epoch++;controller.clear();revoke();text('#clsStatus','');});q('#clsCompare').addEventListener('input',e=>q('#clsAfter').style.clipPath=`inset(0 ${100-Number(e.target.value)}% 0 0)`);q('.cls-saved').addEventListener('toggle',e=>{if(e.target.open)gallery();});
 store.subscribe(s=>{if(photoURL!==null&&s.url!==photoURL){cancel();revoke();controller.clear();sessionStorage.removeItem(PENDING);if(!s.hasPhoto)root.ChiselLooksGallery.clear().then(gallery).catch(()=>{});}photoURL=s.url;syncPortrait(s);labels();});
 request().then(s=>{ready=s.ready===true;text('#clsStatus',ready?'Upload only after confirmation':root.ChiselLooksCore.message(s.error));labels();}).catch(()=>{text('#clsStatus','Cloud service unavailable. Local camera guides still work.');});
 root.addEventListener('online',()=>request().then(s=>{ready=s.ready===true;labels();}).catch(()=>{}));
 // Pending entries contain a capability and hashes, not portrait pixels.
 if(savedText)try{const saved=JSON.parse(savedText);if(saved.createdAt>Date.now()-3600000){const resumedEpoch=epoch;store.load().then(async()=>{const original=await store.original();if(resumedEpoch!==epoch||!original||await fileDigest(original)!==saved.sourceIdentity){sessionStorage.removeItem(PENDING);return;}sourceIdentity=saved.sourceIdentity;controller.resume({...saved,status:'interrupted'}).then(async state=>{if(resumedEpoch===epoch&&state.status==='succeeded'){const prepared=await prepareOriginal(original);if(resumedEpoch!==epoch)return;source=prepared.blob;sourceURL=URL.createObjectURL(source);await loadResult(state,resumedEpoch);}}).catch(()=>text('#clsStatus','Check status to reopen this preview.'));}).catch(()=>text('#clsStatus','Could not restore this preview.'));}else sessionStorage.removeItem(PENDING);}catch{sessionStorage.removeItem(PENDING);}
 root.addEventListener('chisel:credits-change',labels);
 root.document.documentElement.dataset.looksStudio='1';return true;
}
function clearAccount(){if(controller?.snapshot().backend==='credits'){epoch++;preparing=false;controller.clear();revoke();sessionStorage.removeItem(PENDING);}}
async function refreshAvailability(){try{const s=await request();ready=s.ready===true;if(controller.snapshot().status==='idle'&&!preparing&&!result)text('#clsStatus',ready?'Upload only after confirmation':root.ChiselLooksCore.message(s.error));labels();}catch{ready=false;labels();}}
return{install,refreshAvailability,clearAccount,clearSaved,openEditor,closeEditor,selectionView,matchesPreset};
});
