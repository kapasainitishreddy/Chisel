/* Presentation only. Existing nodes and event handlers remain the source of
   behaviour. This module never writes measurements, starts a camera, or uploads. */
(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.ChiselPlatinum=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
'use strict';
let installed=false,dialogObserver=null,activeDialog=null,returnFocus=null;
const $=(selector,scope=root.document)=>(scope&&scope.querySelector(selector));
const ICONS={
  home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
  analyze:'<path d="M8 3H4a1 1 0 0 0-1 1v4m13-5h4a1 1 0 0 1 1 1v4M3 16v4a1 1 0 0 0 1 1h4m13-5v4a1 1 0 0 1-1 1h-4"/><ellipse cx="12" cy="11.5" rx="4" ry="5"/>',
  affirm:'<path d="M20.5 4.8a5.5 5.5 0 0 0-7.8 0L12 5.5l-.7-.7a5.5 5.5 0 0 0-7.8 7.8L12 21l8.5-8.4a5.5 5.5 0 0 0 0-7.8Z"/>',
  meditate:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
  groom:'<path d="m16 3 5 5L8 21l-5-5Z"/><path d="m13 6 5 5M5 12l7 7"/>',
  settings:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="10" cy="18" r="2"/>',
  skin:'<path d="M12 3S5 11 5 15a7 7 0 0 0 14 0c0-4-7-12-7-12Z"/><path d="M8 15a4 4 0 0 0 4 4"/>',
  precision:'<path d="M4 4h16v16H4Z M8 4v4m4-4v3m4-3v4M4 12h4m-4 4h3"/>',
  arrow:'<path d="m9 5 7 7-7 7"/>'
};
function icon(name){return `<svg class="cp-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]||ICONS.arrow}</svg>`;}
function element(tag,classes){const node=root.document.createElement(tag);if(classes)node.className=classes;return node;}
function details(id,label){let node=$(`#${id}`);if(node)return node;node=element('details','cp-details');node.id=id;const summary=element('summary');summary.textContent=label;node.appendChild(summary);return node;}
function text(node,value){if(node&&node.textContent!==value)node.textContent=value;}
function navigation(){
 root.document.querySelectorAll('nav [data-route]').forEach(link=>{const glyph=$('.ico',link);if(glyph)glyph.innerHTML=icon(link.dataset.route);});
 const home=$('[data-screen="home"]'),hero=$('.hero',home);if(!home||!hero)return;
 const top=element('header','cp-topbar');top.innerHTML='<div><span class="cp-wordmark">Chisel</span><small>Personal care, on your terms.</small></div>';
 const settings=$('#openSettings');if(settings){settings.innerHTML=icon('settings');settings.setAttribute('aria-label','Open settings');top.appendChild(settings);}home.prepend(top);
 const title=$('h1.display',hero);if(title){title.innerHTML='Your daily care.<br>Made personal.';title.classList.add('cp-home-title');}
 text($('.lede',hero),'A private space to understand your appearance, build a routine, and explore your style.');
 const extras=details('cpHomeDetails','Your rituals & progress');
 const side=hero.children[1];if(side){side.classList.add('cp-home-secondary');extras.appendChild(side);}
 const actions=$('.btn-row',hero);if(actions)extras.appendChild(actions);
 // The compact action hub already links these routes. Preserve the original
 // secondary controls in an explicit disclosure instead of duplicating them.
 const quick=[...home.children].find(n=>n!==hero&&n.querySelector('.card[data-go="affirm"]'));
 if(quick)extras.appendChild(quick);
 const strip=$('#cxpValueStrip');if(strip){const trust=details('cpHomeTrust','Privacy & measurement notes');strip.replaceWith(trust);trust.appendChild(strip);trust.insertAdjacentElement('afterend',extras);}else hero.insertAdjacentElement('afterend',extras);
}
function toolDock(){
 const analyze=$('[data-screen="analyze"]'),start=$('.analyze-start',analyze);
 const labs=$('#chiselLabsLauncher'),precision=$('#chiselPrecisionLauncher');
 if(!start||!labs||!precision)return false;
 text($('#openTrain'),'Face & Neck Trainer');
 text($('h2.section',analyze),'Understand your baseline.');
 text($(':scope > .lede',analyze),'Start with a clear photo. Explore face, skin and posture signals, with quality checks before results.');
 const dock=element('div','cp-tool-dock');dock.id='cpToolDock';
 const entries=[['skin','Skin appearance','Regional photo signals + a simple routine',()=>{if(root.ChiselEnhancements)root.ChiselEnhancements.openLabs('skin');}],['precision','Precision scans','Multi-photo face, skin + body comparisons',()=>precision.click()]];
 for(const [name,title,copy,action] of entries){const b=element('button','cp-tool');b.type='button';b.dataset.cpTool=name;b.innerHTML=icon(name)+`<span><b>${title}</b><small>${copy}</small></span>`;b.addEventListener('click',action);dock.appendChild(b);}
 start.insertAdjacentElement('afterend',dock);
 const trust=$('#cxpAnalyzeTrust');if(trust){const d=details('cpAnalyzeDetails','How capture checks work');trust.replaceWith(d);d.appendChild(trust);dock.insertAdjacentElement('afterend',d);}
 root.document.documentElement.dataset.cpTools='1';return true;
}
function trainer(){
 const modal=$('#arCoachModal'),panel=$('.panel',modal),title=$('#arCoachTitle');if(!panel||!title)return;
 const head=element('header','cp-dialog-head'),body=element('div','cp-dialog-body');
 const eyebrow=$('.eyebrow',panel),close=$('#arCoachX');
 if(eyebrow){text(eyebrow,'Move gently. Stay consistent.');head.appendChild(eyebrow);}head.appendChild(title);if(close)head.appendChild(close);
 while(panel.firstChild)body.appendChild(panel.firstChild);panel.append(head,body);
 text($('.ar-coach-intro',body),'Choose a session. Follow the movement cues at a comfortable pace. Camera-guided and setup-only exercises are clearly labelled.');
 const grid=$('.ar-session-grid',body),info=details('cpTrainerDetails','How tracking works');
 for(const selector of ['.ctv2-goalbar','.ctv2-trust','.ctv2-note','.ar-evidence','.cx-yoga-note']){const node=$(selector,body);if(node)info.appendChild(node);}
 const safety=$('.ar-safety',body);if(grid&&safety)grid.insertAdjacentElement('afterend',safety);
 body.appendChild(info);
 if(grid)grid.querySelectorAll('.ar-session').forEach(b=>b.insertAdjacentHTML('beforeend',icon('arrow')));
 const note=element('p');note.id='cpTrainerAccuracy';note.className='ctv2-note';note.textContent='Movement feedback is not an accuracy percentage or a measurement of muscle growth.';info.appendChild(note);
}
function skin(){
 const panel=$('#chl-panel-skin'),shell=$('#csaShell');if(!panel||!shell)return;
 text($('#chl-title'),'Care studio');
 text($('.chl-panel-head h3',panel),'Skin, with context.');
 text($('.chl-panel-head p',panel),'Explore visible appearance in a clear photo, then keep your routine simple.');
 const intro=element('p');intro.id='cpSkinAccuracy';intro.textContent='Photo-based appearance signals, not a diagnosis. Capture quality describes the photo, not measurement accuracy.';shell.insertAdjacentElement('beforebegin',intro);
 const preferences=details('cpSkinPreferences','Routine preferences');
 const oldScan=$('#chl-skin-scan'),form=$('.chl-form-grid',panel),build=$('#chl-build-skin');
 if(oldScan)preferences.appendChild(oldScan);if(form)preferences.appendChild(form);if(build)preferences.appendChild(build);
 shell.insertAdjacentElement('afterend',preferences);
 const field=$('.csa-file');if(field)field.setAttribute('aria-describedby','csaStatus cpSkinAccuracy');
}
function styleStudio(){
 const groom=$('[data-screen="groom"]'),studio=$('#cxStudioCard');if(!groom||!studio)return;
 text($('h2.section',groom),'Find your everyday look.');
 text($(':scope > .lede',groom),'Explore hair, facial hair and makeup by style, not gender. Keep the looks and routines that feel like you.');
 text($('.cx-studio-title',studio),'Hair & style studio');
 // Move, do not recreate: all four existing action handlers remain attached.
 const lede=$(':scope > .lede',groom);if(lede)lede.insertAdjacentElement('afterend',studio);
 const loop=$('#cxpGroomLoop');if(loop){const info=details('cpRoutineHow','Build a routine you can repeat');loop.replaceWith(info);info.appendChild(loop);groom.appendChild(info);}
 const warning=element('p');warning.className='cx-studio-copy';warning.id='cpStyleAccuracy';warning.textContent='Live Guide shows approximate placement. Optional AI renders are visualizations, not predictions.';studio.appendChild(warning);
 text($('#paywall h3'),'Chisel Pro');
}
function keyboardCloseButtons(){
 root.document.querySelectorAll('.modal .x').forEach(b=>{
  if(b.tagName==='BUTTON')return;b.setAttribute('role','button');b.tabIndex=0;
  if(!b.getAttribute('aria-label'))b.setAttribute('aria-label','Close dialog');
  b.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();b.click();}});
 });
}
function visible(node){return !!node&&!node.hidden&&root.getComputedStyle(node).display!=='none'&&node.getClientRects().length>0;}
function installDialogs(){
 const configs=[['arCoachModal','#arCoachX'],['chiselLabsRoot','.chl-close'],['chiselPrecisionRoot','.chp-close'],['paywall','#paywallX'],['idModal','#idX']];
 const candidates=configs.map(([id,close])=>({node:$(`#${id}`),close})).filter(c=>c.node);
 const sync=()=>{
  const current=candidates.filter(c=>visible(c.node)).sort((a,b)=>(parseInt(root.getComputedStyle(b.node).zIndex)||0)-(parseInt(root.getComputedStyle(a.node).zIndex)||0))[0]||null;
  if(current&&activeDialog&&current.node===activeDialog.node)return;
  const previous=activeDialog;activeDialog=current;
  const app=$('.app');if(app)app.inert=!!current;
  if(current){
   if(!previous)returnFocus=root.document.activeElement;
   const target=$('[role="dialog"]',current.node)||current.node;
   target.setAttribute('role','dialog');target.setAttribute('aria-modal','true');
   const closer=$(current.close,current.node);if(closer)closer.focus({preventScroll:true});
  }else if(returnFocus&&returnFocus.isConnected){returnFocus.focus({preventScroll:true});returnFocus=null;}
 };
 dialogObserver=new MutationObserver(sync);
 for(const c of candidates)dialogObserver.observe(c.node,{attributes:true,attributeFilter:['class','hidden','style']});
 root.document.addEventListener('keydown',e=>{
  if(!activeDialog)return;
  if(e.key==='Escape'){const closer=$(activeDialog.close,activeDialog.node);if(closer){e.preventDefault();e.stopPropagation();closer.click();}return;}
  if(e.key!=='Tab')return;
  const focusable=[...activeDialog.node.querySelectorAll('button,a[href],input,select,textarea,summary,[tabindex="0"]')].filter(n=>!n.disabled&&visible(n));
  if(!focusable.length)return;
  const first=focusable[0],last=focusable[focusable.length-1],focused=root.document.activeElement;
  if(e.shiftKey&&(focused===first||!activeDialog.node.contains(focused))){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&(focused===last||!activeDialog.node.contains(focused))){e.preventDefault();first.focus();}
 });
 sync();
}
function install(){
 if(installed||!root.document)return installed;
 if(!$('#cxpHomeHub')||!$('#csaShell')||!root.document.documentElement.dataset.chiselReliability)return false;
 navigation();toolDock();trainer();skin();styleStudio();keyboardCloseButtons();installDialogs();
 installed=true;root.document.documentElement.dataset.chiselPlatinum='1';return true;
}
return{install,icon};
});
