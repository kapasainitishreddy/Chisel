(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.ChiselProductPolish=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const MARK='data-cxp';
  const q=(s,r=document)=>r&&r.querySelector?r.querySelector(s):null;
  const CONTROL_LABELS={
    camFlip:'Switch camera',
    camShot:'Capture photo',
    camX:'Close camera',
    pickerX:'Close style picker',
    suggestX:'Close suggestions',
    coachX:'Close coach',
    routineX:'Close routine',
    paywallX:'Close Chisel Pro'
  };

  function route(screen){
    if(typeof window!=='undefined'&&typeof window.go==='function'){window.go(screen);return true;}
    const link=document.querySelector(`[data-route="${screen}"]`);
    if(link){link.click();return true;}
    return false;
  }

  function injectStyles(){
    if(document.getElementById('chiselProductPolishCss')) return;
    const style=document.createElement('style');
    style.id='chiselProductPolishCss';
    style.textContent=`
      :root{--cxp-surface:rgba(255,255,255,.028);--cxp-line:rgba(201,168,106,.22);--cxp-soft:rgba(242,237,228,.68)}
      html{-webkit-text-size-adjust:100%} body{overscroll-behavior:none}
      button,a,[role="button"],input,select,summary{touch-action:manipulation}
      button,.btn,.chip,.camctrl,[role="button"],nav a{min-height:44px}
      button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible,[role="button"]:focus-visible{outline:2px solid var(--gold-bright)!important;outline-offset:3px!important}
      p,small,.lede,.cxp-copy,.cxp-sub,.card{overflow-wrap:anywhere}
      main.view{scroll-padding-top:22px}.screen>.eyebrow{margin-top:2px}.screen>.lede{font-size:13px;line-height:1.65}
      .card{box-shadow:0 14px 38px rgba(0,0,0,.12)}
      .cxp-hub,.cxp-trust,.cxp-loop,.cxp-privacy,.cxp-empty,.cxp-result-trust{border:1px solid var(--cxp-line);background:linear-gradient(145deg,rgba(201,168,106,.075),rgba(255,255,255,.018));border-radius:18px}
      .cxp-hub{margin:12px 0 22px;padding:16px}.cxp-kicker{font-size:9px;letter-spacing:.28em;text-transform:uppercase;color:var(--gold);font-weight:700}.cxp-title{font-family:var(--display);font-size:25px;line-height:1.1;margin:5px 0 4px}.cxp-copy{font-size:11px;line-height:1.55;color:var(--ivory-dim);margin:0}
      .cxp-actions{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:13px}.cxp-action{min-height:62px;border:1px solid rgba(255,255,255,.13);border-radius:13px;background:rgba(0,0,0,.22);color:var(--ivory);padding:10px;text-align:left;font:600 11px/1.2 var(--sans);cursor:pointer}.cxp-action b{display:block;color:var(--gold-bright);font-size:12px;margin-bottom:4px}.cxp-action span{display:block;color:var(--ivory-dim);font-size:9px;font-weight:500;line-height:1.3}
      .cxp-action[aria-busy="true"]{opacity:.58;cursor:progress}
      .cxp-trust{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;padding:1px;margin:0 0 14px;overflow:hidden}.cxp-trust>div{padding:12px;background:rgba(8,8,10,.62)}.cxp-trust b{display:block;font-size:11px;color:var(--ivory);margin-bottom:3px}.cxp-trust span{font-size:9px;color:var(--ivory-dim);line-height:1.35}
      .cxp-loop{margin:0 0 18px;padding:15px}.cxp-loop-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:10px}.cxp-step{padding:10px;border-radius:12px;background:rgba(0,0,0,.20);font-size:10px;color:var(--ivory-dim);line-height:1.35}.cxp-step b{display:block;color:var(--gold-bright);font-size:10px;margin-bottom:3px}
      .cxp-privacy{padding:14px;margin:0 0 14px;display:flex;gap:12px;align-items:flex-start}.cxp-privacy .cxp-lock{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:rgba(62,107,90,.18);color:#9ED5BC;flex:0 0 auto}.cxp-privacy b{font-size:12px}.cxp-privacy p{font-size:10px;line-height:1.5;color:var(--ivory-dim);margin:3px 0 0}
      .cxp-empty{padding:18px;margin-top:12px;text-align:center}.cxp-empty b{display:block;font-family:var(--display);font-size:20px;margin-bottom:4px}.cxp-empty span{font-size:10px;line-height:1.5;color:var(--ivory-dim)}
      .cxp-result-trust{padding:11px 12px;margin:0 0 12px;display:flex;gap:10px;align-items:flex-start}.cxp-result-trust i{width:8px;height:8px;border-radius:50%;margin-top:4px;background:#7CC79A;box-shadow:0 0 0 4px rgba(124,199,154,.10);flex:0 0 auto}.cxp-result-trust b{font-size:10px;color:var(--ivory)}.cxp-result-trust span{display:block;font-size:9px;color:var(--ivory-dim);line-height:1.4;margin-top:2px}
      .btn,.cxp-action,.cx-studio-btn,.ar-session,.camctrl,nav.tabs [data-route]{transition:opacity .14s ease,border-color .18s ease,background-color .18s ease,box-shadow .18s ease}
      .btn:not(:disabled):active,.cxp-action:not(:disabled):active,.cx-studio-btn:not(:disabled):active,.ar-session:not(:disabled):active,.camctrl:not(:disabled):active,nav.tabs [data-route]:active{opacity:.72}
      .cxp-entering{animation:cxpScreenIn .18s cubic-bezier(.2,.7,.2,1) both}
      @keyframes cxpScreenIn{from{opacity:.72;transform:translateY(5px)}to{opacity:1;transform:none}}
      #paywall .panel{border-color:rgba(201,168,106,.34);box-shadow:0 30px 90px rgba(0,0,0,.55)}#paywallRestore{margin-top:4px}
      @media(max-width:760px){.cxp-actions{grid-template-columns:repeat(2,minmax(0,1fr))}.cxp-loop-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.cxp-trust{grid-template-columns:1fr}.hero{padding-top:20px!important}.card{border-radius:16px}}
      @media(max-width:380px){.cxp-actions,.cxp-loop-grid{grid-template-columns:1fr}}
      @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}.cxp-entering{animation:none!important}}
    `;
    document.head.appendChild(style);
  }

  function currentScreen(){
    if(typeof document==='undefined')return '';
    const active=q('.screen.active[data-screen]');
    return active&&active.dataset?active.dataset.screen||'':'';
  }

  function syncNavigationState(screen){
    if(typeof document==='undefined')return false;
    const current=screen||currentScreen();
    document.querySelectorAll('[data-route]').forEach(el=>{
      if(el.dataset&&el.dataset.route===current)el.setAttribute('aria-current','page');
      else el.removeAttribute('aria-current');
    });
    return !!current;
  }

  function animateScreenEntry(screen){
    if(typeof document==='undefined')return false;
    const current=screen||currentScreen();
    const next=current?q(`[data-screen="${current}"]`):null;
    if(!next)return false;
    next.classList.remove('cxp-entering');
    void next.offsetWidth;
    next.classList.add('cxp-entering');
    if(next.__cxpEnterTimer)clearTimeout(next.__cxpEnterTimer);
    next.__cxpEnterTimer=setTimeout(()=>{next.classList.remove('cxp-entering');next.__cxpEnterTimer=null;},240);
    return true;
  }

  function defer(fn){
    if(typeof requestAnimationFrame==='function')requestAnimationFrame(fn);
    else setTimeout(fn,0);
  }

  function installRoutePolish(){
    if(typeof window==='undefined'||typeof window.go!=='function'){syncNavigationState();return false;}
    const original=window.go;
    if(original.__cxpWrapped){syncNavigationState();return true;}
    const wrapped=function(screen){
      const result=original.apply(this,arguments);
      defer(()=>{syncNavigationState(screen);animateScreenEntry(screen);});
      return result;
    };
    wrapped.__cxpWrapped=true;
    wrapped.__cxpOriginal=original;
    window.go=wrapped;
    syncNavigationState();
    return true;
  }

  function controlLabel(el){
    if(!el)return '';
    const existing=el.getAttribute&&el.getAttribute('aria-label');
    if(existing&&existing.trim())return existing.trim();
    const id=el.id||'';
    if(CONTROL_LABELS[id])return CONTROL_LABELS[id];
    if((el.classList&&el.classList.contains('x'))||/X$/.test(id))return 'Close';
    const text=(el.textContent||'').replace(/\s+/g,' ').trim();
    if(text)return text;
    return '';
  }

  function enhanceControlSemantics(){
    if(typeof document==='undefined')return false;
    const nav=document.getElementById('bottomTabs')||q('nav.tabs');
    if(nav&&!nav.getAttribute('aria-label'))nav.setAttribute('aria-label','Primary navigation');
    document.querySelectorAll('.camctrl,.x,[data-route]').forEach(el=>{
      if(el.getAttribute&&el.getAttribute('aria-label'))return;
      const label=controlLabel(el);
      if(label)el.setAttribute('aria-label',label);
    });
    return true;
  }

  function installLiveRegions(){
    if(typeof document==='undefined')return false;
    const toast=document.getElementById('toast');
    if(!toast)return false;
    toast.setAttribute('role','status');
    toast.setAttribute('aria-live','polite');
    toast.setAttribute('aria-atomic','true');
    return true;
  }

  function lockAction(button,duration=650){
    if(!button||button.disabled||(button.dataset&&button.dataset.cxpLock==='1'))return false;
    const wasDisabled=!!button.disabled;
    if(button.dataset)button.dataset.cxpLock='1';
    button.disabled = true;
    button.setAttribute('aria-busy','true');
    if(button.__cxpLockTimer)clearTimeout(button.__cxpLockTimer);
    button.__cxpLockTimer=setTimeout(()=>{
      if(button.dataset)delete button.dataset.cxpLock;
      button.removeAttribute('aria-busy');
      if(!wasDisabled)button.disabled=false;
      button.__cxpLockTimer=null;
    },duration);
    return true;
  }

  function polishVisibleCopy(){
    const home=q('[data-screen="home"]');
    const homeLede=home&&q('.lede',home);
    if(homeLede) homeLede.textContent='A private appearance and grooming studio for repeatable scans, practical routines, realistic try-ons, and progress you can compare with context.';
    const meditate=q('[data-screen="meditate"]');
    const h=meditate&&q('h2.section',meditate);
    if(h) h.innerHTML='See who <span class="gold">you\'re becoming.</span>';
    const medLede=meditate&&q('.lede',meditate);
    if(medLede) medLede.textContent='Guided breathing and visualization for a calmer routine. Pick a duration, settle in, and use what feels useful.';
    if(meditate){
      meditate.querySelectorAll('[data-dur]').forEach(btn=>{if(/Lookmax/i.test(btn.textContent)) btn.textContent=btn.textContent.replace(/Lookmax/ig,'Guided');});
    }
    const affirm=q('[data-screen="affirm"]');
    const affirmLede=affirm&&q('.lede',affirm);
    if(affirmLede) affirmLede.textContent='Use affirmations as a short confidence and attention practice. Choose the lines that feel useful; there is no need to force repetition.';
    const analyze=q('[data-screen="analyze"]');
    const analyzeLede=analyze&&q(':scope > .lede',analyze);
    if(analyzeLede) analyzeLede.textContent='Private on-device analysis starts with capture quality and repeatability, then reports photographic structure and appearance estimates with context.';
  }

  function installHomeHub(){
    const home=q('[data-screen="home"]');
    const hero=home&&q('.hero',home);
    if(!hero||document.getElementById('cxpHomeHub')) return;
    const hub=document.createElement('section');
    hub.id='cxpHomeHub';hub.className='cxp-hub';hub.setAttribute(MARK,'home-hub');hub.setAttribute('aria-labelledby','cxpHomeHubTitle');
    hub.innerHTML=`<div class="cxp-kicker">Start here</div><h3 class="cxp-title" id="cxpHomeHubTitle">One useful action, then get on with your day.</h3><p class="cxp-copy">Scan when conditions are good. Use Try-on when making a style decision. Use the routine between scans.</p><div class="cxp-actions"><button type="button" class="cxp-action" data-cxp-action="analyze"><b>Scan now</b><span>Create or compare a baseline</span></button><button type="button" class="cxp-action" data-cxp-action="tryon"><b>Try-on Studio</b><span>Hair, beard, eyewear, makeup</span></button><button type="button" class="cxp-action" data-cxp-action="yoga"><b>Face Yoga</b><span>Gentle unisex AR guidance</span></button><button type="button" class="cxp-action" data-cxp-action="groom"><b>Routine</b><span>Do the controllable work</span></button></div>`;
    hero.insertAdjacentElement('afterend',hub);
    hub.addEventListener('click',e=>{
      const btn=e.target.closest('[data-cxp-action]');if(!btn||!lockAction(btn))return;
      const a=btn.dataset.cxpAction;
      if(a==='analyze'){route('analyze');return;}
      if(a==='groom'){route('groom');return;}
      if(a==='tryon'){
        route('analyze');setTimeout(()=>{if(typeof window.openStyle==='function')window.openStyle();else{const b=document.getElementById('openStyle');if(b)b.click();}},80);return;
      }
      if(a==='yoga'){
        route('analyze');setTimeout(()=>{if(typeof window.startARCoach==='function')window.startARCoach('yoga');else{const b=document.getElementById('openTrain');if(b)b.click();}},80);return;
      }
    });
  }

  function installAnalyzeTrust(){
    const analyze=q('[data-screen="analyze"]');
    if(!analyze||document.getElementById('cxpAnalyzeTrust')) return;
    const card=q('.analyze-start',analyze);
    if(!card)return;
    const trust=document.createElement('div');trust.id='cxpAnalyzeTrust';trust.className='cxp-trust';trust.setAttribute(MARK,'trust');
    trust.innerHTML='<div><b>Local processing</b><span>Core face analysis stays on this device.</span></div><div><b>Multi-frame</b><span>Chisel checks several frames instead of trusting one selfie.</span></div><div><b>Weak scans are rejected</b><span>Bad pose, light, distance or unstable measurements trigger a retake.</span></div>';
    card.insertAdjacentElement('beforebegin',trust);
  }

  function installGroomLoop(){
    const groom=q('[data-screen="groom"]');
    if(!groom||document.getElementById('cxpGroomLoop'))return;
    const lede=q(':scope > .lede',groom);if(!lede)return;
    const loop=document.createElement('section');loop.id='cxpGroomLoop';loop.className='cxp-loop';loop.setAttribute(MARK,'loop');
    loop.innerHTML='<div class="cxp-kicker">The Chisel loop</div><div class="cxp-loop-grid"><div class="cxp-step"><b>1 · Choose one area</b>Pick the controllable thing that matters now.</div><div class="cxp-step"><b>2 · Follow the routine</b>Keep the plan small enough to repeat.</div><div class="cxp-step"><b>3 · Mark it complete</b>Track adherence, not obsession.</div><div class="cxp-step"><b>4 · Compare later</b>Re-scan only under comparable conditions.</div></div>';
    lede.insertAdjacentElement('afterend',loop);
  }

  function installPrivacySummary(){
    const settings=q('[data-screen="connect"]');
    if(!settings||document.getElementById('cxpPrivacySummary'))return;
    const lede=q(':scope > .lede',settings);if(!lede)return;
    const box=document.createElement('div');box.id='cxpPrivacySummary';box.className='cxp-privacy';box.setAttribute(MARK,'privacy');
    box.innerHTML='<div class="cxp-lock">◆</div><div><b>Local by default</b><p>Core analysis stays on this device. Photoreal renders are optional cloud features and should only run after you choose them.</p></div>';
    lede.insertAdjacentElement('afterend',box);
  }

  function installEmptyStates(){
    const history=document.getElementById('scanHistory');
    if(!history||history.dataset.cxpObserved)return;
    history.dataset.cxpObserved='1';
    let busy=false;
    const sync=()=>{
      if(busy)return;busy=true;
      const real=[...history.children].filter(el=>!el.hasAttribute('data-cxp-empty'));
      const empty=history.querySelector('[data-cxp-empty]');
      if(real.length===0&&!empty){
        const node=document.createElement('div');node.className='cxp-empty';node.setAttribute('data-cxp-empty','1');node.innerHTML='<b>No comparable scans yet</b><span>Start with one good baseline. Future scans become useful when lighting, framing and method are similar.</span>';history.appendChild(node);
      }else if(real.length>0&&empty) empty.remove();
      busy=false;
    };
    new MutationObserver(sync).observe(history,{childList:true});sync();
  }

  function installResultTrust(){
    const sheet=document.getElementById('camSheet');
    if(!sheet||sheet.dataset.cxpResultObserved)return;
    sheet.dataset.cxpResultObserved='1';
    let busy=false;
    const sync=()=>{
      if(busy)return;busy=true;
      const hasMeaningful=[...sheet.children].some(el=>!el.hasAttribute('data-cxp-result-trust'));
      if(hasMeaningful&&!sheet.querySelector('[data-cxp-result-trust]')){
        const note=document.createElement('div');note.className='cxp-result-trust';note.setAttribute('data-cxp-result-trust','1');note.innerHTML='<i></i><div><b>Photographic estimate · capture quality checked</b><span>Use these results for within-person guidance and matched progress, not as clinical measurements. Retake when capture quality is weak.</span></div>';
        sheet.prepend(note);
      }
      busy=false;
    };
    new MutationObserver(sync).observe(sheet,{childList:true});
  }

  function polishPaywall(){
    const paywall=document.getElementById('paywall');if(!paywall)return;
    const panel=q('.panel',paywall),title=panel&&q('h3',panel),lede=panel&&q('.lede',panel),restore=document.getElementById('paywallRestore');
    if(title)title.textContent='Chisel Pro, without hiding the core app.';
    if(lede)lede.textContent='Core analysis stays on this device. Photoreal renders are optional cloud features. Paid access should add convenience and rendering capacity, not lock basic privacy, deletion or honest scan results.';
    if(restore){restore.textContent='Restore purchases';restore.setAttribute('aria-label','Restore purchases from Google Play');}
  }

  function install(){
    if(typeof document==='undefined')return false;
    if(document.documentElement.dataset.cxpInstalled==='1')return true;
    document.documentElement.dataset.cxpInstalled='1';
    injectStyles();polishVisibleCopy();installHomeHub();installAnalyzeTrust();installGroomLoop();installPrivacySummary();installEmptyStates();installResultTrust();polishPaywall();enhanceControlSemantics();installLiveRegions();installRoutePolish();
    return true;
  }

  return{install,route,controlLabel,lockAction,syncNavigationState};
});