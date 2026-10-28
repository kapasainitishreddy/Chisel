/* Appearance: light/dark tokens, icons, haptics, keyboard inset. Presentation only. */
(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.ChiselAppearance=api;
  if(root&&root.document){
    const start=()=>api.install();
    if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',start);
    else start();
  }
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
'use strict';
const KEY='chisel:theme';
const PALETTES=Object.freeze({
  dark:Object.freeze({bg:'#141210',surface:'#211E1A',text:'#F7F4EF',muted:'#D2C9BC',accent:'#F2C4A2',sage:'#B7DCC8',onAccent:'#141210'}),
  light:Object.freeze({bg:'#F6F3EE',surface:'#FFFCF8',text:'#1C1915',muted:'#5C564C',accent:'#9A3412',sage:'#1F6A45',onAccent:'#FFF8F3'})
});
const GLYPHS=Object.freeze({
  jawline:'scan',nose:'orbit',lips:'affirm',neck:'meditate',facial:'groom',haircut:'style',
  skin:'skin',jaw:'scan',glow:'affirm',first:'scan',week:'affirm',month:'meditate',ten:'groom',pics:'style',deep:'scan'
});
function storageOf(storage){return storage||(root&&root.localStorage)||null;}
function preference(storage){
  try{const value=storageOf(storage)&&storageOf(storage).getItem(KEY);return value==='light'||value==='dark'?value:'system';}
  catch{return 'system';}
}
function resolved(pref,scheme){return pref==='light'||pref==='dark'?pref:(scheme==='light'?'light':'dark');}
function scheme(){
  try{return root.matchMedia&&root.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}
  catch{return 'dark';}
}
function setPreference(value,storage){
  const store=storageOf(storage);if(!store)return preference();
  try{
    if(value==='system')store.removeItem(KEY);
    else if(value==='light'||value==='dark')store.setItem(KEY,value);
  }catch{return preference(store);}
  return preference(store);
}
function apply(document,pref,colorScheme){
  if(!document||!document.documentElement)return resolved(pref,colorScheme);
  const mode=resolved(pref,colorScheme||'dark');
  const el=document.documentElement;
  el.dataset.chiselTheme='quiet-studio';
  if(pref==='system')delete el.dataset.theme;else el.dataset.theme=pref;
  el.style.colorScheme=mode;
  const meta=document.querySelector&&document.querySelector('meta[name="theme-color"]');
  if(meta)meta.setAttribute('content',PALETTES[mode].bg);
  return mode;
}
function haptic(style,host){
  try{
    const plugin=host||(root.Capacitor&&root.Capacitor.Plugins&&root.Capacitor.Plugins.Haptics);
    if(!plugin||typeof plugin.impact!=='function')return false;
    const result=plugin.impact({style:style==='HEAVY'?'HEAVY':'LIGHT'});
    if(result&&typeof result.catch==='function')result.catch(function(){});
    return true;
  }catch{return false;}
}
function icon(name){
  const paths={
    home:'M4 11 12 4l8 7v9h-5v-6H9v6H4z',
    scan:'M8 3H4v4M16 3h4v4M4 16v4h4M16 21h4v-4M9 12h6',
    affirm:'M12 3.5 13.4 8.6 18.5 10 13.4 11.4 12 16.5 10.6 11.4 5.5 10 10.6 8.6z',
    meditate:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 8v4l2.5 1.5',
    groom:'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
    close:'M6 6l12 12M18 6 6 18',
    capture:'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM12 3v2M12 19v2M3 12h2M19 12h2',
    flip:'M4 8h11l-3-3M20 16H9l3 3',
    settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0-5v2m0 14v2M3 12h2m14 0h2',
    check:'m5 12 4 4L19 6',
    orbit:'M12 3a9 9 0 1 0 9 9M12 7v5l3 2',
    style:'M8 3v18m-4-4h8M14 6l7 7m-7 0 7-7',
    skin:'M12 3c-2 4-7 8-7 12a7 7 0 0 0 14 0c0-4-5-8-7-12z',
    train:'M6 4c-2 2-2 6-2 8 0 6 4 9 8 9s8-3 8-9c0-2 0-6-2-8'
  };
  const d=paths[name]||paths.orbit;
  return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+d+'"/></svg>';
}
function accessibleViewport(content){
  const blocked=/^(?:user-scalable\s*=\s*no|maximum-scale\s*=\s*1(?:\.0*)?)$/i;
  const parts=String(content||'').split(',').map(part=>part.trim()).filter(part=>part&&!blocked.test(part));
  for(const required of ['width=device-width','initial-scale=1','viewport-fit=cover']){
    if(!parts.some(part=>part.toLowerCase()===required))parts.push(required);
  }
  return parts.join(', ');
}
function init(){
  if(!root.document)return false;
  const viewport=root.document.querySelector('meta[name="viewport"]');
  if(viewport)viewport.setAttribute('content',accessibleViewport(viewport.getAttribute('content')));
  apply(root.document,preference(),scheme());
  return true;
}
let installed=false;
function paintGlyphs(doc){
  doc.querySelectorAll('.cs-glyph').forEach(node=>{
    if(node.querySelector('svg'))return;
    const name=GLYPHS[node.getAttribute('data-glyph')]||node.getAttribute('data-glyph')||'orbit';
    node.innerHTML=icon(name);
  });
}
function pinAppearance(doc){
  const card=doc.getElementById('appearanceCard');
  const screen=doc.querySelector('[data-screen="connect"]');
  if(!card||!screen)return;
  const lede=screen.querySelector('.lede');
  if(lede&&lede.nextElementSibling!==card)lede.insertAdjacentElement('afterend',card);
}
function syncChoices(doc){
  const pref=preference();
  doc.querySelectorAll('[data-theme-choice]').forEach(button=>{
    const on=button.getAttribute('data-theme-choice')===pref;
    button.setAttribute('aria-pressed',on?'true':'false');
  });
}
function install(){
  if(installed||!root.document)return false;
  installed=true;
  init();
  const doc=root.document;
  paintGlyphs(doc);
  syncChoices(doc);
  pinAppearance(doc);
  root.setTimeout(()=>pinAppearance(doc),1200);
  ['#milestones','#programs','#groomGrid','#programBody'].forEach(sel=>{
    const node=doc.querySelector(sel);if(!node||typeof root.MutationObserver!=='function')return;
    new root.MutationObserver(()=>paintGlyphs(doc)).observe(node,{childList:true,subtree:true});
  });
  doc.addEventListener('click',event=>{
    const choice=event.target.closest&&event.target.closest('[data-theme-choice]');
    if(choice){
      setPreference(choice.getAttribute('data-theme-choice'));
      apply(doc,preference(),scheme());
      syncChoices(doc);
      haptic('LIGHT');
      return;
    }
    const hit=event.target.closest&&event.target.closest('nav a[data-route], .btn.solid, #medStart, #camShot');
    if(hit)haptic('LIGHT');
  });
  const vv=root.visualViewport;
  const keyboard=()=>{
    if(!vv)return;
    const inset=Math.max(0,root.innerHeight-vv.height-vv.offsetTop);
    doc.documentElement.style.setProperty('--cs-keyboard',Math.round(inset)+'px');
    doc.documentElement.dataset.keyboard=inset>80?'1':'0';
  };
  if(vv){vv.addEventListener('resize',keyboard);vv.addEventListener('scroll',keyboard);}
  doc.addEventListener('focusin',event=>{
    const target=event.target;
    if(!target||!target.matches||!target.matches('input,textarea,select'))return;
    root.setTimeout(()=>{try{target.scrollIntoView({block:'center',behavior:doc.documentElement.dataset.keyboard==='1'?'auto':'smooth'});}catch(e){}},60);
  });
  if(root.matchMedia){
    const query=root.matchMedia('(prefers-color-scheme: light)');
    const onChange=()=>{if(preference()==='system')apply(doc,'system',query.matches?'light':'dark');};
    if(query.addEventListener)query.addEventListener('change',onChange);
  }
  return true;
}
return {KEY,PALETTES,GLYPHS,preference,resolved,setPreference,apply,haptic,icon,accessibleViewport,init,install,paintGlyphs,pinAppearance};
});
