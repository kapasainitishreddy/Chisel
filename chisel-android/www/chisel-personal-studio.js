/* Photo-led components within the existing Chisel shell. No scores are seeded.
 * The user's saved original is never replaced with a styled display rendition. */
(function(root,factory){
 const api=factory(root);
 if(typeof module==='object'&&module.exports)module.exports=api;else root.ChiselPersonalStudio=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
 'use strict';
 const q=(s,n=root.document)=>n&&n.querySelector(s),all=(s,n=root.document)=>Array.from(n.querySelectorAll(s));
 const svg=(name)=>{const paths={camera:'M8 6l2-3h4l2 3h4v14H4V6z M16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0',play:'M9 5l10 7-10 7z',chevron:'m9 5 7 7-7 7',close:'m6 6 12 12M18 6 6 18',person:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-2a8 8 0 0 1 16 0v2',edit:'m4 16 11-11 4 4L8 20H4z M13 7l4 4',skin:'M12 3C9 8 5 11 5 15a7 7 0 0 0 14 0c0-4-4-7-7-12z',train:'M6 4c-4 6-2 16 6 17 8-1 10-11 6-17M8 10h1m6 0h1M9 15c2 2 4 2 6 0',style:'M5 3v18M2 7h6M13 7l8 10M21 7l-8 10',lock:'M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5z',image:'M3 3h18v18H3z m0 14 6-6 4 4 3-3 5 5M16 7h.01',glasses:'M2 12h3m14 0h3M9 12h6M9 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0M23 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0'};
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[name]||paths.chevron}"/></svg>`;};
 const el=(tag,cls,html)=>{const n=root.document.createElement(tag);if(cls)n.className=cls;if(html)n.innerHTML=html;return n;};
 const setText=(n,t)=>{if(n&&n.textContent!==t)n.textContent=t;};
 function sessionMeta(core,id){
  const s=core&&core.SESSIONS&&core.SESSIONS[id];if(!s)return null;
  const moves=s.exerciseIds.map(x=>core.exerciseById(x)).filter(Boolean);
  return {id:s.id,title:s.title,moves:moves.length,tracking:moves.every(x=>x.tracking==='form')?'Camera checked':'Guided + camera'};
 }
 function liveForm(ex,form){return ex&&ex.tracking==='form'&&form&&form.accepted===true&&typeof form.score==='number'&&Number.isFinite(form.score)&&form.score>=0&&form.score<=100?Math.round(form.score):null;}
 let installed=false,store,photoDialog,dialogReturn,photoBusy=false,skinURL=null,skinUsesSaved=false;
 const photoMarkup=(alt='Your saved photo')=>`<img class="cps-personal-image" data-cps-photo alt="${alt}" hidden><span class="cps-photo-empty">${svg('camera')}</span>`;
 function photoSurface(id,cls){const n=el('div',`cps-photo ${cls||''}`,photoMarkup());n.id=id;return n;}
 function openPhoto(){
  if(!photoDialog||photoDialog.open)return;dialogReturn=root.document.activeElement;
  photoDialog.showModal();q('#cpsPhotoClose').focus({preventScroll:true});
 }
 function bindPhotoViews(snapshot){
  all('[data-cps-photo]').forEach(img=>{if(snapshot.hasPhoto){if(img.src!==snapshot.url)img.src=snapshot.url;img.hidden=false;}else{img.hidden=true;img.removeAttribute('src');}});
  all('.cps-photo').forEach(n=>{if(n.dataset.cpsSelection!=='1')n.classList.toggle('has-photo',snapshot.hasPhoto);});
  all('[data-cps-add-caption]').forEach(n=>{n.hidden=snapshot.hasPhoto;});
  const remove=q('#cpsPhotoRemove');if(remove)remove.hidden=!snapshot.hasPhoto;
  const own=q('#cpsUsePhoto');if(own)own.hidden=!snapshot.hasPhoto;
  const hero=q('#cpsHomeHero');if(hero)hero.setAttribute('aria-label',snapshot.hasPhoto?'Your personal photo':'Add your own photo to Chisel');
 }
 function installPhotoManager(){
  photoDialog=el('dialog','cps-photo-dialog');photoDialog.id='cpsPhotoDialog';photoDialog.setAttribute('aria-labelledby','cpsPhotoTitle');
  photoDialog.innerHTML=`<header><h2 id="cpsPhotoTitle">Your photo</h2><button type="button" id="cpsPhotoClose" class="cps-icon-btn" aria-label="Close photo settings">${svg('close')}</button></header><div id="cpsPhotoPreview" class="cps-photo">${photoMarkup()}</div><p class="cps-private-note">Saved on this device. Not uploaded.</p><div class="cps-photo-actions"><label class="cps-primary">${svg('image')}Choose photo<input id="cpsPhotoFile" type="file" accept="image/jpeg,image/png,image/webp"></label><label class="cps-secondary">${svg('camera')}Take photo<input id="cpsCameraFile" type="file" accept="image/jpeg,image/png,image/webp" capture="user"></label></div><button class="cps-remove" id="cpsPhotoRemove" type="button" hidden>Remove photo</button><p id="cpsPhotoStatus" role="status" aria-live="polite"></p>`;
  root.document.body.append(photoDialog);
  q('#cpsPhotoClose').addEventListener('click',()=>photoDialog.close());
  photoDialog.addEventListener('close',()=>{if(dialogReturn&&dialogReturn.isConnected)dialogReturn.focus({preventScroll:true});});
  photoDialog.addEventListener('click',e=>{if(e.target===photoDialog)photoDialog.close();});
  // Native dialog provides focus containment; do not let the older parent
  // modal's keyboard handler pull focus behind this top-layer dialog.
  root.addEventListener('keydown',e=>{if(photoDialog.open)e.stopPropagation();},true);
  async function importPhoto(e){
   const file=e.target.files&&e.target.files[0];if(!file||photoBusy)return;
   photoBusy=true;all('input,button',photoDialog).forEach(n=>n.disabled=true);setText(q('#cpsPhotoStatus'),'Saving your photo…');
   try{const saved=await root.ChiselPersonalPhoto.save(file);setText(q('#cpsPhotoStatus'),saved?'Photo saved on this device.':'Selection cancelled.');}
   catch(error){setText(q('#cpsPhotoStatus'),error.message||'Could not save your photo.');}
   finally{photoBusy=false;all('input,button',photoDialog).forEach(n=>n.disabled=false);e.target.value='';}
  }
  q('#cpsPhotoFile').addEventListener('change',importPhoto);q('#cpsCameraFile').addEventListener('change',importPhoto);
  q('#cpsPhotoRemove').addEventListener('click',async()=>{
   if(photoBusy)return;photoBusy=true;
   try{await root.ChiselPersonalPhoto.remove();setText(q('#cpsPhotoStatus'),'Photo removed.');}
   catch{setText(q('#cpsPhotoStatus'),'Could not remove the photo. Please try again.');}
   finally{photoBusy=false;}
  });
  root.document.addEventListener('click',e=>{if(e.target.closest('[data-cps-edit-photo]'))openPhoto();});
 }
 function installHome(){
  const home=q('[data-screen="home"]'),hero=q('.hero',home),intro=hero&&hero.firstElementChild,launch=q('.cs-direct-tools'),hub=q('#cxpHomeHub');if(!hero||!launch)return;
  const image=photoSurface('cpsHomeHero','cps-home-hero');
  image.innerHTML+=`<div class="cps-edge-fade"></div><button class="cps-icon-btn cps-edit-photo" data-cps-edit-photo type="button" aria-label="Change your photo">${svg('edit')}</button><button class="cps-add-photo" data-cps-edit-photo data-cps-add-caption type="button">Add your photo</button><h1>Your Best<br>Version</h1>`;
  q('h1',intro)?.remove();intro.prepend(image);
  const start=el('div','cps-start');start.append(el('h2','','Start today'));start.append(launch);intro.append(start);
  launch.style.removeProperty('grid-template-columns');launch.style.removeProperty('margin-top');
  all('.cs-tool-row',launch).forEach(b=>{q('small',b)?.remove();b.classList.add('cps-start-tile');});
  function decorateFocus(){
   setText(q('#cxpHomeHubTitle',hub),"Today's focus");
   const focus=q('.cxp-focus',hub);if(focus&&!q('.cps-focus-photo',focus))focus.prepend(photoSurface('cpsFocusPhoto','cps-focus-photo'));
   bindPhotoViews(store.snapshot());
  }
  decorateFocus();new MutationObserver(decorateFocus).observe(hub,{childList:true});
  const masthead=q('.cs-masthead');
  const avatar=el('button','cps-avatar',photoMarkup()+svg('person'));avatar.type='button';avatar.dataset.cpsEditPhoto='1';avatar.setAttribute('aria-label','Your photo');masthead.append(avatar);
  // Keep Settings in the existing tools dialog, without a third header button.
  const settings=q('#openSettings');if(settings){settings.classList.add('cps-settings-in-tools');q('#csOrbit').append(settings);settings.innerHTML=svg('person')+'<span>Settings</span>';}
  setText(q('.cs-wordmark',masthead),'CHISEL');
 }
 function installTrainer(){
  const modal=q('#arCoachModal'),panel=q('.panel',modal),grid=q('.ar-session-grid',modal);if(!panel||!grid)return;
  const header=el('header','cps-screen-head'),title=q('#arCoachTitle'),close=q('#arCoachX');setText(title,'Face training');header.append(title,close);
  const body=el('div','cps-trainer-body');while(panel.firstChild)body.append(panel.firstChild);panel.append(header,body);
  const featured=photoSurface('cpsTrainerHero','cps-trainer-hero');
  featured.innerHTML+=`<div class="cps-edge-fade"></div><span class="cps-image-label">Your photo</span><div class="cps-feature-caption"><h3 id="cpsSessionTitle"></h3><p id="cpsSessionMeta"></p><button type="button" id="cpsStartSession" class="cps-primary">${svg('play')}Start session</button></div>`;
  body.prepend(featured);
  grid.insertAdjacentElement('beforebegin',el('h4','cps-subheading','All exercises'));
  let selected='jaw-chin';
  const refresh=()=>{const info=sessionMeta(root.ChiselARCoach,selected);setText(q('#cpsSessionTitle'),info.title);setText(q('#cpsSessionMeta'),`${info.moves} moves · ${info.tracking}`);};refresh();
  q('#cpsStartSession').addEventListener('click',()=>{const b=all('.ar-session',grid).find(n=>(n.dataset.ctv2Session||n.dataset.arSession)===selected);if(b)b.click();});
  all('.ar-session',grid).forEach((b,i)=>{const thumb=photoSurface(`cpsExercise${i}`,'cps-exercise-thumb');thumb.setAttribute('aria-hidden','true');b.prepend(thumb);});
  q('#csTrainerFilters')?.addEventListener('click',()=>{const b=all('.ar-session',grid).find(n=>!n.hidden);if(b){selected=b.dataset.ctv2Session||b.dataset.arSession;refresh();}});
  const meter=el('div','cps-form-meter');meter.id='cpsLiveForm';meter.hidden=true;meter.innerHTML='<strong id="cpsLiveValue"></strong><span>Movement check</span>';
  q('#arCoachHud').append(meter);
  root.addEventListener('chisel:coach-state',e=>{const v=liveForm(e.detail&&e.detail.exercise,e.detail&&e.detail.form);meter.hidden=v===null;if(v!==null){setText(q('#cpsLiveValue'),String(v));meter.style.setProperty('--cps-score',String(v));}});
 }
 function installSkin(){
  const shell=q('#csaShell'),actions=q('.csa-actions',shell),top=q('.csa-top',shell);if(!shell||!actions)return;
  const hero=photoSurface('cpsSkinHero','cps-skin-hero');
  hero.innerHTML+=`<div class="cps-edge-fade"></div><span class="cps-scan-bracket" aria-hidden="true"></span><div class="cps-skin-title"><h3>Scan<br>your skin</h3><span>On-device</span></div>`;
  top.insertAdjacentElement('afterend',hero);
  const use=el('button','cps-secondary','Use my photo');use.type='button';use.id='cpsUsePhoto';use.hidden=true;actions.prepend(use);
  use.addEventListener('click',async()=>{
   if(q('#csaAnalyze').hasAttribute('aria-busy'))return;
   const original=await store.original();if(!original)return;
   // Never feed the cropped / downscaled hero image to the analysis engine.
   const file=new File([original],'my-photo.'+(original.type==='image/png'?'png':original.type==='image/webp'?'webp':'jpg'),{type:original.type});
   skinUsesSaved=true;root.ChiselSkinAppearance.selectFile(file);
  });
  root.addEventListener('chisel:skin-selection',e=>{
   if(skinURL){URL.revokeObjectURL(skinURL);skinURL=null;}
   const img=q('.cps-personal-image',hero),file=e.detail&&e.detail.file;
   if(file){hero.dataset.cpsSelection='1';skinURL=URL.createObjectURL(file);img.removeAttribute('data-cps-photo');img.src=skinURL;img.hidden=false;hero.classList.add('has-photo');}
   else{delete hero.dataset.cpsSelection;img.setAttribute('data-cps-photo','');bindPhotoViews(store.snapshot());}
  });
  const fileInput=q('#csaFile');fileInput.addEventListener('change',()=>{skinUsesSaved=false;});
  store.subscribe(s=>{if(!s.hasPhoto&&skinUsesSaved){skinUsesSaved=false;root.ChiselSkinAppearance.clearSelection();}});
  // Decorative framing is not a detected skin mask. Results stay hidden until
  // the original analysis and its quality gate succeed.
  const results=q('#csaResults');new MutationObserver(()=>hero.classList.toggle('cps-analyzed',!results.hidden)).observe(results,{attributes:true,attributeFilter:['hidden']});
 }
 function installStyle(){
  const card=q('#cxStudioCard');if(!card)return;
  setText(q('.cx-studio-title',card),'Style studio');
  const hero=photoSurface('cpsStyleHero','cps-style-hero');hero.innerHTML+='<span class="cps-image-label">Your photo · no style applied</span>';
  const tabs=el('div','cps-style-tabs');tabs.setAttribute('aria-label','Style category');tabs.setAttribute('role','group');
  const types=[['hair','Hair'],['beard','Beard'],['makeup','Makeup'],['glasses','Eyewear']];let category='hair';
  for(const [id,label]of types){const b=el('button','',label);b.type='button';b.dataset.cpsStyle=id;b.setAttribute('aria-pressed',String(id==='hair'));tabs.append(b);}
  const title=q('.cx-studio-title',card);title.insertAdjacentElement('afterend',tabs);tabs.insertAdjacentElement('afterend',hero);
  const grid=q('.cx-studio-grid',card);grid.setAttribute('aria-label','Open a live style guide');
  const action=el('button','cps-primary',svg('camera')+'Try in camera');action.type='button';action.id='cpsTryStyle';
  hero.insertAdjacentElement('afterend',action);
  const eyewear=el('button','cx-studio-btn',`<b>Eyewear</b>${svg('chevron')}`);eyewear.type='button';eyewear.dataset.cpsEyewear='1';grid.append(eyewear);
  function openGlasses(){
   if(typeof root.openStyle!=='function')return;root.openStyle();
   const first=q('#glassChips .sc:nth-child(2)');if(first)first.click();
  }
  eyewear.addEventListener('click',openGlasses);
  function filter(){
   all('[data-cps-style]',tabs).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.cpsStyle===category)));
   all('.cx-studio-btn',grid).forEach(b=>{const mode=b.dataset.cx;b.hidden=category==='hair'?!['men','women'].includes(mode):category==='glasses'?!b.dataset.cpsEyewear:mode!==category;});
  }
  tabs.addEventListener('click',e=>{const b=e.target.closest('[data-cps-style]');if(b){category=b.dataset.cpsStyle;filter();}});
  action.addEventListener('click',()=>{const b=all('.cx-studio-btn',grid).find(n=>!n.hidden);if(b)b.click();});filter();
  setText(q('.cx-studio-copy',card),'Live guides, not predictions.');
 }
 function install(){
  if(installed||!root.document||!q('#csaShell')||!root.ChiselPersonalPhoto)return false;
  installed=true;store=root.ChiselPersonalPhoto.getStore();
  root.document.documentElement.dataset.personalStudio='1';
  installPhotoManager();installHome();installTrainer();installSkin();installStyle();
  store.subscribe(bindPhotoViews);root.ChiselPersonalPhoto.installDeletion();
  store.load().catch(()=>setText(q('#cpsPhotoStatus'),'Photo storage is unavailable. Try again in a regular browser window.'));
  return true;
 }
 return {sessionMeta,liveForm,install,openPhoto};
});
