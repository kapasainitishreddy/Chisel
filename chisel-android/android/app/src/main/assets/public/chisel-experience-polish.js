(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.ChiselExperiencePolish=api;
  if(typeof window!=='undefined'&&typeof document!=='undefined') window.addEventListener('load',()=>setTimeout(api.install,120),{once:true});
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function install(){
    const css=document.createElement('style');css.id='chiselExperiencePolishCss';css.textContent=`
      #styleBar{max-height:42vh!important;overflow-y:auto!important;padding-top:10px!important;background:linear-gradient(180deg,rgba(8,8,10,.76),rgba(8,8,10,.97) 28%)!important;backdrop-filter:blur(18px)}
      #styleBar .cx-preview-head{display:flex;align-items:center;justify-content:space-between;gap:10px;position:sticky;top:-10px;z-index:8;padding:8px 2px 10px;background:linear-gradient(180deg,rgba(8,8,10,.98),rgba(8,8,10,.88),transparent)}
      #styleBar .cx-preview-title{font:600 11px/1.2 Inter,sans-serif;color:#F2EDE4;letter-spacing:.08em}.cx-preview-sub{font:500 9px/1.2 Inter,sans-serif;color:#C9C2B4;margin-top:3px}
      #styleBar .cx-preview-toggle{border:1px solid rgba(201,168,106,.5);border-radius:999px;background:rgba(201,168,106,.12);color:#E2C58A;padding:8px 12px;font:700 9px/1 Inter,sans-serif;letter-spacing:.12em;text-transform:uppercase}
      #styleBar.preview-only{max-height:126px!important;overflow:hidden!important;background:linear-gradient(180deg,rgba(8,8,10,.70),rgba(8,8,10,.95))!important}
      #styleBar.preview-only>:not(.cx-preview-head):not(.style-top){display:none!important}
      #styleBar.preview-only .style-top>.info,#styleBar.preview-only .style-top>.seg:nth-of-type(2){display:none!important}
      .cx-studio-card{margin:14px 0 18px;padding:16px;border:1px solid rgba(201,168,106,.28);border-radius:16px;background:linear-gradient(145deg,rgba(201,168,106,.09),rgba(255,255,255,.015))}
      .cx-studio-title{font-family:var(--display);font-size:24px;margin:0 0 4px}.cx-studio-copy{font-size:12px;color:var(--ivory-dim);line-height:1.5;margin:0 0 12px}.cx-studio-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
      .cx-studio-btn{min-height:48px;border:1px solid rgba(255,255,255,.16);border-radius:13px;background:rgba(0,0,0,.22);color:var(--ivory);font:600 11px/1.15 var(--sans);letter-spacing:.04em;text-align:left;padding:10px 12px}.cx-studio-btn b{display:block;color:var(--gold-bright);font-size:12px;margin-bottom:3px}.cx-studio-btn small{color:var(--ivory-dim);font-size:9px}
      #arCoachHud{left:14px!important;right:14px!important;bottom:max(14px,env(safe-area-inset-bottom))!important;border-radius:22px!important;padding:16px!important;background:linear-gradient(160deg,rgba(10,10,12,.88),rgba(17,17,20,.96))!important;border:1px solid rgba(201,168,106,.38)!important;box-shadow:0 18px 60px rgba(0,0,0,.48)!important;backdrop-filter:blur(20px)}
      #arCoachHud.locked{border-color:rgba(124,199,154,.58)!important;box-shadow:0 0 0 1px rgba(124,199,154,.12),0 18px 60px rgba(0,0,0,.48)!important}
      #arCoachExercise{font-size:28px!important;line-height:1!important}.ar-coach-cue{font-size:13px!important;line-height:1.55!important}.ar-hud-progress{height:6px!important;border-radius:999px!important;background:rgba(255,255,255,.08)!important}.ar-hud-progress i{border-radius:999px!important;background:linear-gradient(90deg,#C9A86A,#E2C58A)!important}
      .cx-yoga-note{margin-top:10px;padding:10px 12px;border-radius:12px;background:rgba(124,199,154,.08);border:1px solid rgba(124,199,154,.2);font-size:10px;color:#C9C2B4;line-height:1.45}
    `;if(!document.getElementById(css.id))document.head.appendChild(css);

    /* Replace the old debug-like face trace with a restrained AR guide. The
       face remains visible; only the lower jaw arc and a few movement anchors
       are drawn, switching from gold to green when form locks. */
    try{
      if(typeof drawARCoachGuide==='function'&&!drawARCoachGuide.__cxPremium){
        const premium=function(d,R){
          if(!d||!d.pts)return;
          const pts=d.pts,w=R.vw,h=R.vh,locked=!!(_arForm&&_arForm.accepted);
          const main=locked?'rgba(124,199,154,.96)':'rgba(226,197,138,.94)';
          const glow=locked?'rgba(124,199,154,.20)':'rgba(226,197,138,.17)';
          const P=i=>({x:pts[i].x*w,y:pts[i].y*h});
          const premiumJaw=[234,93,132,58,172,136,150,149,176,152,400,378,379,365,397,288,361,323,454];
          const cheekAnchors=[50,280];
          ctx.save();
          if(facing==='user'){ctx.translate(R.cw,0);ctx.scale(-1,1);}
          ctx.translate(R.ox,R.oy);ctx.scale(R.s,R.s);
          const jawPath=()=>{ctx.beginPath();premiumJaw.forEach((i,n)=>{const p=P(i);n?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y);});};
          jawPath();ctx.strokeStyle='rgba(0,0,0,.42)';ctx.lineWidth=5.2/R.s;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();
          jawPath();ctx.strokeStyle=main;ctx.lineWidth=1.9/R.s;ctx.stroke();
          ctx.shadowColor=glow;ctx.shadowBlur=16/R.s;ctx.fillStyle=main;
          [172,152,397].forEach(i=>{const p=P(i);ctx.beginPath();ctx.arc(p.x,p.y,3.4/R.s,0,Math.PI*2);ctx.fill();});
          const ex=(typeof AR_COACH!=='undefined'&&typeof _arState!=='undefined'&&_arState)?AR_COACH.currentExercise(_arState):null;
          if(ex&&ex.kind==='smile'){
            cheekAnchors.forEach(i=>{const p=P(i);ctx.beginPath();ctx.arc(p.x,p.y,10/R.s,0,Math.PI*2);ctx.strokeStyle=glow;ctx.lineWidth=7/R.s;ctx.stroke();ctx.beginPath();ctx.arc(p.x,p.y,3/R.s,0,Math.PI*2);ctx.fill();});
          }else{
            const chin=P(152);ctx.beginPath();ctx.arc(chin.x,chin.y,9/R.s,0,Math.PI*2);ctx.strokeStyle=glow;ctx.lineWidth=6/R.s;ctx.stroke();
          }
          ctx.restore();
        };
        premium.__cxPremium=true;
        drawARCoachGuide=premium;
      }
    }catch(e){console.warn('[Chisel premium AR guide]',e);}

    const styleBar=document.getElementById('styleBar');
    if(styleBar&&!document.getElementById('cxPreviewHead')){
      const head=document.createElement('div');head.id='cxPreviewHead';head.className='cx-preview-head';head.innerHTML='<div><div class="cx-preview-title">Live preview</div><div class="cx-preview-sub" id="cxStyleSummary">Choose a style, then preview your full face</div></div><button class="cx-preview-toggle" type="button">Preview face</button>';
      styleBar.insertBefore(head,styleBar.firstChild);
      head.querySelector('button').addEventListener('click',()=>{styleBar.classList.toggle('preview-only');head.querySelector('button').textContent=styleBar.classList.contains('preview-only')?'Change style':'Preview face';updateSummary();});
      const autoCollapse=e=>{if(e.target.closest('.sc'))setTimeout(()=>{styleBar.classList.add('preview-only');head.querySelector('button').textContent='Change style';updateSummary();},120)};
      ['hairChips','beardChips','makeupChips','glassChips'].forEach(id=>{const el=document.getElementById(id);if(el)el.addEventListener('click',autoCollapse)});
    }
    function updateSummary(){
      const el=document.getElementById('cxStyleSummary');if(!el)return;
      try{const h=(styleGender==='women'?HAIR_WOMEN:HAIR_MEN)[styleHair];const b=BEARD_STYLES[styleBeard];el.textContent=[h&&h.name,b&&b.id!=='none'?b.name:null].filter(Boolean).join(' + ')||'Clean preview';}catch(e){el.textContent='Live style preview';}
    }
    function setClean(){try{styleBeard=0;renderStyleChips();updateSummary();}catch(e){}}
    const originalOpen=typeof openStyle==='function'?openStyle:null;
    if(originalOpen&&!originalOpen.__cxWrapped){const wrapped=function(){const r=originalOpen.apply(this,arguments);setTimeout(()=>{setClean();if(styleBar)styleBar.classList.remove('preview-only')},20);return r};wrapped.__cxWrapped=true;openStyle=wrapped;}
    function launch(mode){
      if(typeof openStyle!=='function')return;openStyle();
      setTimeout(()=>{try{
        if(mode==='men'){styleGender='men';styleHair=2;styleBeard=0;}
        if(mode==='beard'){styleGender='men';styleHair=0;styleBeard=Math.min(2,BEARD_STYLES.length-1);}
        if(mode==='women'){styleGender='women';styleHair=Math.min(4,HAIR_WOMEN.length-1);styleBeard=0;}
        if(mode==='makeup'){styleBeard=0;styleMakeup=Math.max(1,typeof MAKEUP_LOOKS!=='undefined'?MAKEUP_LOOKS.findIndex(x=>x.id==='natural'):1);}
        renderStyleTop();renderStyleChips();if(styleBar){styleBar.classList.remove('preview-only');styleBar.scrollTop=0;}updateSummary();
        const target=mode==='beard'?document.getElementById('beardLab'):mode==='makeup'?document.getElementById('makeupChips'):document.getElementById('hairLab');if(target&&target.scrollIntoView)target.scrollIntoView({block:'nearest'});
      }catch(e){console.warn('[Chisel studio launch]',e)}},80);
    }
    const openBtn=document.getElementById('openStyle');const host=openBtn&&openBtn.closest('.card');
    if(host&&!document.getElementById('cxStudioCard')){
      const card=document.createElement('div');card.id='cxStudioCard';card.className='cx-studio-card';card.innerHTML='<h3 class="cx-studio-title">Try-on Studio</h3><p class="cx-studio-copy">Open exactly what you want. Pick a style, then Chisel collapses the controls so you can actually see the hair, beard or makeup on your full face.</p><div class="cx-studio-grid"><button class="cx-studio-btn" data-cx="men"><b>Men hair</b><small>Cuts + color</small></button><button class="cx-studio-btn" data-cx="beard"><b>Beard studio</b><small>Stubble, beard, goatee, moustache</small></button><button class="cx-studio-btn" data-cx="women"><b>Women hair</b><small>18 styles + texture filters</small></button><button class="cx-studio-btn" data-cx="makeup"><b>Makeup studio</b><small>Blush, lips, eyes + guide</small></button></div>';
      host.insertAdjacentElement('afterend',card);card.addEventListener('click',e=>{const b=e.target.closest('[data-cx]');if(b)launch(b.dataset.cx)});
    }
    const grid=document.querySelector('#arCoachModal .ar-session-grid');
    if(grid&&!grid.querySelector('[data-ar-session="yoga"]')){
      const b=document.createElement('button');b.className='ar-session';b.type='button';b.dataset.arSession='yoga';b.innerHTML='<strong>Unisex Face Yoga</strong><span>7 min - Gentle guided flow</span>';b.addEventListener('click',()=>{if(typeof startARCoach==='function')startARCoach('yoga')});grid.appendChild(b);
      const note=document.createElement('div');note.className='cx-yoga-note';note.textContent='Face Yoga is a relaxation and movement-awareness flow. Chisel tracks pose and movement cues; it does not claim to reshape facial bones or spot-reduce fat.';grid.parentElement.appendChild(note);
    }
    return true;
  }
  return {install};
});
