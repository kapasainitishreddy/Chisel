/* Quiet Studio: presentation only. Measurement and provider engines retain ownership. */
(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.ChiselStudioTheme=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
'use strict';
const TOKENS=Object.freeze({bg:'#101314',surface:'#1b1f20',text:'#f4f3ed',muted:'#b8bfbc',accent:'#e1d5bb',sage:'#b2d4c0'});
const SESSION_ORDER=['cheek-builder','jaw-chin','chin-support','release','full','yoga'];
const validScore=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=100;
function qualityLabel(value){return validScore(value)?`${Math.round(value)}/100 capture quality`:'Not measured';}
function feedbackLabel(exercise,form){
  if(exercise&&exercise.tracking==='guided')return 'Setup only';
  if(!form||form.accepted!==true)return 'Adjust position';
  return validScore(form.score)?`${Math.round(form.score)}/100`:'Not measured';
}
function sessionInfo(core,id){
  const session=core&&core.SESSIONS&&core.SESSIONS[id];if(!session)return null;
  const exercises=session.exerciseIds.map(key=>core.exerciseById(key)).filter(Boolean);
  const tracked=exercises.filter(e=>e.tracking==='form').length;
  return {title:session.title,movements:exercises.length,tracking:tracked===0?'guided':tracked===exercises.length?'camera':'mixed'};
}
function matchesGoal(id,goal){
  if(goal==='all')return SESSION_ORDER.includes(id);
  return ({cheeks:['cheek-builder'],posture:['jaw-chin','chin-support'],relax:['release','full','yoga']}[goal]||[]).includes(id);
}
function contrastRatio(a,b){
  const lum=hex=>{const rgb=hex.replace('#','').match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
  const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
function taskCopy(action,done){
 const names={analyze:['Your baseline','Scan'],tryon:['Try a style','Open styles'],yoga:['Face yoga','Start'],groom:['Daily routine','Open routine']};
 const [title,cta]=names[action]||names.groom;
 return {title:done?'Complete for today':title,cta,done:done?'Done':'Mark done'};
}
function accessibleViewport(content){
 const blocked=/^(?:user-scalable\s*=\s*no|maximum-scale\s*=\s*1(?:\.0*)?)$/i;
 const parts=String(content||'').split(',').map(part=>part.trim()).filter(part=>part&&!blocked.test(part));
 for(const required of ['width=device-width','initial-scale=1','viewport-fit=cover']){
  if(!parts.some(part=>part.toLowerCase()===required))parts.push(required);
 }
 return parts.join(', ');
}
let installed=false,lastOverlay=null,returnFocus=null,orbitReturn=null;
const doc=()=>root.document;
const q=(s,scope)=> (scope||doc()).querySelector(s);
const all=(s,scope)=>Array.from((scope||doc()).querySelectorAll(s));
function text(node,value){if(node&&node.textContent!==value)node.textContent=value;}
function el(tag,cls,content){const n=doc().createElement(tag);if(cls)n.className=cls;if(content)n.textContent=content;return n;}
function icon(name){
 const paths={close:'M6 6l12 12M18 6L6 18',arrow:'M5 12h14m-6-6 6 6-6 6',scan:'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M9 9h6v6H9z',home:'m3 10 9-7 9 7v10h-6v-7H9v7H3z',skin:'M12 3c-2 4-7 8-7 12a7 7 0 0 0 14 0c0-4-5-8-7-12zm-4 12c0 2 1 3 3 3',train:'M6 4c-2 2-2 6-2 8 0 6 4 9 8 9s8-3 8-9c0-2 0-6-2-8M8 10h1m6 0h1m-7 5c2 2 4 2 6 0',style:'M8 3v18m-4-4h8M14 6l7 7m-7 0 7-7',settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0-5v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4',orbit:'M12 3v18M3 12h18M6 6l12 12M6 18 12-12',check:'m5 12 4 4L19 6',precision:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8',routine:'M8 3h8v3h-8zM6 5H4v16h16V5h-2M8 11h8M8 16h5'};
 return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]||paths.orbit}"/></svg>`;
}
function call(name,...args){if(typeof root[name]==='function'){root[name](...args);return true;}return false;}
function openSurface(id){
 closeOrbit();
 if(id==='home')return call('go','home');
 if(id==='scan')return call('go','analyze');
 if(id==='train')return call('openTrain');
 if(id==='skin'&&root.ChiselEnhancements){root.ChiselEnhancements.openLabs('skin');return true;}
 if(id==='precision'&&root.ChiselPrecision){root.ChiselPrecision.open('face');return true;}
 if(id==='style'){call('go','analyze');const n=q('#cxStudioCard');if(n)n.scrollIntoView({block:'start',behavior:'auto'});return !!n;}
 if(id==='routine')return call('go','groom');
 if(id==='settings')return call('go','connect');
 return false;
}
function disclosure(title,nodes,cls=''){
 const details=el('details',`cs-disclosure ${cls}`),summary=el('summary','',title);details.append(summary);
 nodes.filter(Boolean).forEach(n=>details.append(n));return details;
}
function installHome(){
 const home=q('[data-screen="home"]'),hero=q('.hero',home),hub=q('#cxpHomeHub');if(!home||!hero||!hub)return;
 const masthead=el('header','cs-masthead');masthead.innerHTML='<span class="cs-wordmark">Chisel<span class="cs-wordmark-dot" aria-hidden="true">.</span></span><span class="cs-private">Your private studio</span>';
 const settings=q('#openSettings');if(settings){settings.classList.add('cs-icon-button');settings.innerHTML=icon('settings');settings.setAttribute('aria-label','Settings');masthead.append(settings);}
 home.prepend(masthead);
 const heading=q('h1.display',hero);if(heading)heading.textContent='Today';
 q('.lede',hero)?.remove();
 const intro=hero.firstElementChild,heroActions=q('.btn-row',intro);if(heroActions){const d=disclosure('Mindset & reflection',[heroActions]);intro.append(d);}
 const side=hero.children[1];if(side){side.classList.add('cs-home-reflection');const d=disclosure('Your reflection & streak',[side]);home.append(d);}
 hero.append(hub);
 // Keep real inputs and handlers, but remove the competing home feature catalogue.
 const secondary=el('div','cs-home-secondary');
 Array.from(home.children).forEach(n=>{if(n!==masthead&&n!==hero&&n!==hub&&n.id!=='cxpValueStrip')secondary.append(n);});
 const date=q('.eyebrow',intro);if(date)secondary.prepend(date);
 const trust=q('#cxpValueStrip');if(trust)secondary.append(trust);
 home.append(disclosure('More',[secondary],'cs-home-more'));
 const transformHub=()=>{
  if(q('.cs-hub-marker',hub))return;
  hub.prepend(el('span','cs-hub-marker'));
  text(q('#cxpHomeHubTitle',hub),'Next');
  q('.cxp-kicker',hub)?.remove();q('.cxp-copy',hub)?.remove();q('.cxp-phases',hub)?.remove();
  const focus=q('[data-cxp-focus]',hub),done=q('[data-cxp-done]',hub);
  if(focus&&done){
   const copy=taskCopy(focus.dataset.cxpFocus,done.getAttribute('aria-pressed')==='true');
   text(q('.cxp-focus-copy b',hub),copy.title);text(focus,copy.cta);text(done,copy.done);
   const explanation=q('.cxp-focus-copy span',hub);if(explanation)hub.append(disclosure('Details',[explanation],'cs-focus-details'));
   text(q('.cxp-daily-status',hub),done.getAttribute('aria-pressed')==='true'?'Saved on this device.':'');
  }
  const actions=q('.cxp-actions',hub);q('.cxp-tools-label',hub)?.remove();
  all('.cxp-action',hub).forEach(button=>{
   const key=button.dataset.cxpAction;
   text(q('b',button),({analyze:'Scan',tryon:'Style',yoga:'Face yoga',groom:'Routine'})[key]);
   q('span',button)?.remove();
   const i=el('i','cs-action-icon');i.innerHTML=icon(({analyze:'scan',tryon:'style',yoga:'train',groom:'routine'})[key]);button.prepend(i);
  });
  if(actions)hub.append(disclosure('Quick tools',[actions],'cs-quick-tools'));
 };
 transformHub();new root.MutationObserver(transformHub).observe(hub,{childList:true});
 const launch=el('section','cs-direct-tools');launch.setAttribute('aria-label','Training and skin tools');
 launch.innerHTML=`<button class="cs-tool-row cs-train-entry" type="button" data-cs-open="train">${icon('train')}<span><b>Face training</b><small>6 sessions</small></span>${icon('arrow')}</button><button class="cs-tool-row" type="button" data-cs-open="skin">${icon('skin')}<span><b>Skin</b></span>${icon('arrow')}</button><button class="cs-tool-row" type="button" data-cs-open="style">${icon('style')}<span><b>Style</b></span>${icon('arrow')}</button>`;
 const reflection=q('.cs-disclosure',intro);if(reflection)secondary.prepend(reflection);
 launch.style.gridTemplateColumns='1fr';launch.style.marginTop='20px';intro.append(launch);
}
function installTrainer(){
 const modal=q('#arCoachModal'),grid=q('.ar-session-grid',modal);if(!grid)return;
 q('.ar-coach-intro',modal)?.remove();q('.eyebrow',modal)?.remove();
 const goalbar=q('#ctv2GoalBar',modal),trust=q('.ctv2-trust',modal),note=q('.ctv2-note',modal),evidence=q('.ar-evidence',modal),yoga=q('.cx-yoga-note',modal);
 const details=disclosure('How tracking works',[goalbar,trust,note,evidence,yoga],'cs-trainer-method');
 const safety=q('.ar-safety',modal);
 const comfort=el('p','cs-comfort','Keep it gentle. Stop if you feel pain.');
 grid.insertAdjacentElement('afterend',comfort);comfort.insertAdjacentElement('afterend',details);
 if(safety)details.append(safety);
 const filters=el('div','cs-segments');filters.id='csTrainerFilters';filters.setAttribute('role','group');filters.setAttribute('aria-label','Filter training sessions');
 for(const [id,label] of [['all','All'],['cheeks','Cheeks'],['posture','Posture'],['relax','Release']]){
  const b=el('button','',label);b.type='button';b.dataset.csGoal=id;b.setAttribute('aria-pressed',String(id==='all'));filters.append(b);
 }
 grid.insertAdjacentElement('beforebegin',filters);
 const update=goal=>{all('[data-cs-goal]',filters).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.csGoal===goal)));all('.ar-session',grid).forEach(b=>{b.hidden=!matchesGoal(b.dataset.ctv2Session||b.dataset.arSession,goal);});};
 filters.addEventListener('click',e=>{const b=e.target.closest('[data-cs-goal]');if(b)update(b.dataset.csGoal);});
 filters.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;const buttons=all('button',filters),i=buttons.indexOf(doc().activeElement);if(i<0)return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[next].focus();buttons[next].click();});
 SESSION_ORDER.forEach((id,index)=>{
  const b=all('.ar-session',grid).find(n=>(n.dataset.ctv2Session||n.dataset.arSession)===id);if(!b)return;
  const info=sessionInfo(root.ChiselARCoach,id);if(!info)return;
  b.dataset.csIndex=String(index+1).padStart(2,'0');b.dataset.csTracking=info.tracking;
  text(q('strong',b),info.title);
  text(q('span',b),`${info.movements} moves`);
  b.setAttribute('aria-label',`${info.title}, ${info.movements} movements, ${info.tracking==='camera'?'camera checked':info.tracking==='guided'?'guided':'guided and camera checked'}`);grid.append(b);
 });
 const check=q('.ctv2-trust-card b',modal);if(check)text(check,'Camera-checked movement');
 const hud=q('#arCoachHud');if(hud){const pause=q('#arCoachStop');if(pause)pause.setAttribute('aria-label','Stop training and close camera');}
 root.addEventListener('chisel:coach-state',event=>{
  const d=event.detail||{};text(q('#ctv2FormScore'),feedbackLabel(d.exercise,d.form));
  const tracking=q('#ctv2TrackingCopy');if(tracking)text(tracking,d.exercise&&d.exercise.tracking==='form'?'Camera movement check':'Guided movement · setup only');
 });
}
function installSkin(){
 const shell=q('#csaShell');if(!shell)return;
 const top=q('.csa-top p',shell);text(top,'Experimental. Not a diagnosis.');
 const prep=el('section','cs-capture-prep');prep.setAttribute('aria-label','Prepare a comparable skin photo');
 prep.innerHTML='<h5>Start with a comparable photo</h5><ol><li><b>Even light</b><span>Face a window. Avoid direct sun and strong shadows.</span></li><li><b>No filters</b><span>Use an unedited photo, without heavy makeup.</span></li><li><b>Match your setup</b><span>Same camera, distance, angle and relaxed expression.</span></li></ol>';
 const tips=disclosure('Photo tips',[prep],'cs-photo-tips');
 shell.append(tips);text(q('#csaStatus',shell),'Even light. No filters.');
 const actions=q('.csa-actions',shell);actions.insertAdjacentElement('afterend',q('#csaStatus',shell));
 const file=q('.csa-file',shell);if(file){
  for(const child of Array.from(file.childNodes))if(child.nodeType===3)child.textContent='';
  file.append(el('b','','Add photo'));file.prepend(el('span','cs-file-icon'));q('.cs-file-icon',file).innerHTML=icon('scan');
 }
 text(q('#csaAnalyze',shell),'Analyze');text(q('.csa-local',shell),'On-device');
 const resultInfo=el('p','cs-method-note','Capture quality is a photo check, not an accuracy percentage. Skin signals are experimental and can change with lighting.');resultInfo.id='csSkinMethod';shell.append(disclosure('Details',[resultInfo],'cs-skin-details'));
 const quality=q('#csaConfidence');if(quality){const normalize=()=>{const value=quality.textContent.trim();if(/^\d+(?:\.\d+)?%$/.test(value))text(quality,qualityLabel(Number(value.slice(0,-1))));};new root.MutationObserver(normalize).observe(quality,{childList:true,characterData:true,subtree:true});normalize();}
 const results=q('#csaResults');if(results){const render=()=>{shell.dataset.hasResults=String(!results.hidden);};new root.MutationObserver(render).observe(results,{attributes:true,attributeFilter:['hidden']});render();}
 const panel=q('#chl-panel-skin');
 if(panel){
  const nodes=[q('#chl-skin-scan'),q('.chl-form-grid',panel),q('#chl-build-skin'),q('#chl-skin-result')];
  panel.append(disclosure('Your routine',nodes,'cs-skin-routine'));
 }
 text(q('#chl-title'),'Care');q('.chl-header .chl-kicker')?.remove();
 const moduleNames={skin:'Skin',expression:'Expression',lips:'Lips & color',neck:'Neck',body:'Body'};
 all('.chl-module-card').forEach(b=>{const name=moduleNames[b.dataset.chlOpen];if(name){b.setAttribute('aria-label',b.textContent.trim());text(q('b',b),name);}});
 const dis=q('.chl-disclosure');if(dis){const more=disclosure('Privacy & measurement limits',[dis],'cs-labs-disclosure');q('.chl-dialog').append(more);}
 const skinButton=el('button','btn cs-secondary','Skin appearance');skinButton.type='button';skinButton.dataset.csOpen='skin';skinButton.id='csOpenSkin';
 const analyze=q('.analyze-primary');if(analyze)analyze.append(skinButton);
 const precisionButton=el('button','btn ghost','Precision batch');precisionButton.type='button';precisionButton.dataset.csOpen='precision';
 const options=q('.scan-more .btn-row');if(options)options.prepend(precisionButton);
 text(q('#openTrain'),'Face & neck trainer');
}
function installOrbit(){
 const button=el('button','cs-orbit-trigger');button.id='csOrbitTrigger';button.type='button';button.innerHTML=icon('orbit')+'<span>Tools</span>';button.setAttribute('aria-label','Open Chisel tools');button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','csOrbit');
 const dialog=el('dialog','cs-orbit');dialog.id='csOrbit';dialog.setAttribute('aria-labelledby','csOrbitTitle');
 dialog.innerHTML=`<header><div><h2 id="csOrbitTitle">Tools</h2></div><button class="cs-icon-button" type="button" id="csOrbitClose" aria-label="Close Chisel tools">${icon('close')}</button></header><div class="cs-orbit-map"><button type="button" data-cs-open="home" class="cs-orbit-home">${icon('home')}<span>Home</span></button><button type="button" data-cs-open="train">${icon('train')}<span>Train</span></button><button type="button" data-cs-open="scan" class="cs-orbit-scan">${icon('scan')}<span>Scan</span></button><button type="button" data-cs-open="skin">${icon('skin')}<span>Skin</span></button><button type="button" data-cs-open="style">${icon('style')}<span>Style</span></button><button type="button" data-cs-open="routine">${icon('routine')}<span>Routine</span></button><button type="button" data-cs-open="precision">${icon('precision')}<span>Precision</span></button></div><button type="button" data-cs-open="settings" class="cs-orbit-settings">${icon('settings')}<span>Settings & privacy</span>${icon('arrow')}</button>`;
 // Keep tool discovery in document flow, never over a task or the bottom tabs.
 const main=q('main.view'),masthead=q('.cs-masthead')||el('header','cs-masthead');
 const privateLabel=q('.cs-private',masthead);if(privateLabel)privateLabel.remove();
 const settings=q('#openSettings',masthead);masthead.insertBefore(button,settings||null);
 if(main)main.prepend(masthead);else doc().body.prepend(masthead);
 doc().body.append(dialog);
 button.addEventListener('click',openOrbit);q('#csOrbitClose').addEventListener('click',closeOrbit);
 dialog.addEventListener('cancel',()=>{button.setAttribute('aria-expanded','false');});
 dialog.addEventListener('close',()=>{button.setAttribute('aria-expanded','false');if(orbitReturn&&orbitReturn.isConnected)orbitReturn.focus({preventScroll:true});});
 dialog.addEventListener('click',e=>{if(e.target===dialog)closeOrbit();});
}
function openOrbit(){
 const dialog=q('#csOrbit');if(!dialog||dialog.open)return;
 orbitReturn=doc().activeElement;q('#csOrbitTrigger').setAttribute('aria-expanded','true');
 if(typeof dialog.showModal==='function')dialog.showModal();
 else{dialog.setAttribute('open','');dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');}
 q('#csOrbitClose').focus();
}
function closeOrbit(){
 const dialog=doc()&&q('#csOrbit');if(!dialog||!dialog.open)return;
 if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');
 q('#csOrbitTrigger').setAttribute('aria-expanded','false');
}
function activeOverlay(){
 const items=all('.modal.on,#chiselLabsRoot:not([hidden]),#chiselPrecisionRoot:not([hidden])');
 return items.sort((a,b)=>(parseInt(root.getComputedStyle(a).zIndex)||0)-(parseInt(root.getComputedStyle(b).zIndex)||0)).pop()||null;
}
function installDialogAccess(){
 const sync=()=>{
  const active=activeOverlay(),camera=q('.camwrap.on'),app=q('.app'),trigger=q('#csOrbitTrigger');
  if(trigger)trigger.hidden=!!active||!!camera;
  if(app)app.inert=!!active||!!camera;
  if(active!==lastOverlay){
   if(active){returnFocus=doc().activeElement;active.setAttribute('role','dialog');active.setAttribute('aria-modal','true');
    const first=q('button:not(:disabled),[role="button"]',active);if(first&&!active.contains(doc().activeElement))first.focus();
   }else if(lastOverlay&&returnFocus&&returnFocus.isConnected){const target=returnFocus.getClientRects().length?returnFocus:trigger;if(target&&!target.hidden)target.focus();}
   lastOverlay=active;
  }
 };
 const observer=new root.MutationObserver(sync);
 all('.modal,.camwrap,#chiselLabsRoot,#chiselPrecisionRoot').forEach(n=>observer.observe(n,{attributes:true,attributeFilter:['class','hidden','style']}));
 doc().addEventListener('keydown',e=>{
  const orbit=q('#csOrbit'),active=orbit&&orbit.open?orbit:activeOverlay();if(!active)return;
  if(e.key==='Escape'&&active!==orbit){e.preventDefault();e.stopImmediatePropagation();
   if(active.id==='chiselLabsRoot')root.ChiselEnhancements.closeLabs();
   else if(active.id==='chiselPrecisionRoot')root.ChiselPrecision.close();
   else{const close=q('.x,button[aria-label^="Close"]',active);if(close)close.click();}return;
  }
  if(e.key!=='Tab')return;
  const focusable=all('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary,[tabindex="0"]',active).filter(n=>n.getClientRects().length&&root.getComputedStyle(n).visibility!=='hidden');
  if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];
  if(e.shiftKey&&(doc().activeElement===first||!active.contains(doc().activeElement))){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&(doc().activeElement===last||!active.contains(doc().activeElement))){e.preventDefault();first.focus();}
 },true);sync();
}
function install(){
 if(installed||!root.document||!q('#cxpHomeHub')||!q('#csaShell'))return installed;
 const viewport=q('meta[name="viewport"]');if(viewport)viewport.content=accessibleViewport(viewport.content);
 installed=true;doc().documentElement.dataset.chiselTheme='quiet-studio';
 installHome();installTrainer();installSkin();
 const studio=q('#cxStudioCard'),analyze=q('[data-screen="analyze"]');
 if(studio&&analyze){analyze.append(studio);text(q('.cx-studio-copy',studio),'Live guides, not predictions.');
  all('.cx-studio-btn small',studio).forEach(n=>n.remove());}
 const analyzeHelp=q('#cxpAnalyzeTrust');
 if(analyzeHelp)analyze.append(disclosure('About these measurements',[analyzeHelp],'cs-analyze-details'));
 q('[data-screen="analyze"] > .lede')?.remove();
 const groom=q('[data-screen="groom"]'),loop=q('#cxpGroomLoop');
 if(groom&&loop)groom.append(disclosure('How routines work',[loop]));
 installOrbit();installDialogAccess();
 doc().addEventListener('click',e=>{const button=e.target.closest('[data-cs-open]');if(button&&!button.disabled)openSurface(button.dataset.csOpen);});
 const paywall=q('#paywall .panel h3');text(paywall,'Chisel Pro');
 text(q('#paywall .eyebrow'),'Chisel Pro');
 text(q('#paywall .lede'),'Optional AI style previews. Core tools stay free.');
 all('.x').forEach(button=>{if(button.tagName==='BUTTON')return;button.setAttribute('role','button');button.tabIndex=0;button.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();button.click();}});});
 return true;
}
return{TOKENS,SESSION_ORDER,taskCopy,sessionInfo,matchesGoal,qualityLabel,feedbackLabel,contrastRatio,accessibleViewport,install,openOrbit,closeOrbit,openSurface};
});
