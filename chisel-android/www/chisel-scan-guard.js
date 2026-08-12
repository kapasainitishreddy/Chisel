(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.ChiselScanGuard=api;
  if(typeof window!=='undefined'&&typeof document!=='undefined') window.addEventListener('load',()=>setTimeout(api.installBrowserGuard,0),{once:true});
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const med=a=>{const b=a.filter(Number.isFinite).slice().sort((x,y)=>x-y);if(!b.length)return null;const m=Math.floor(b.length/2);return b.length%2?b[m]:(b[m-1]+b[m])/2};
  const mad=a=>{const m=med(a);if(m==null)return null;return med(a.filter(Number.isFinite).map(v=>Math.abs(v-m)))};
  function assessBurst(frames,deep){
    const raw=Array.isArray(frames)?frames:[];
    const min=deep?16:7;
    const good=raw.filter(f=>f&&f.frontal===true&&f.qLum>=65&&f.qLum<=225&&f.faceFill>=.25&&f.faceFill<=.55&&Math.abs(f.rollDeg||0)<=6&&Math.abs(f.yaw||0)<=.07&&(f.blink||0)<.35);
    const corrections=[];
    if(raw.length<min) corrections.push(`Hold still longer - need at least ${min} usable frames`);
    const frontal=raw.filter(f=>f&&f.frontal===true).length/Math.max(1,raw.length);
    if(frontal<.75) corrections.push('Face the camera straight on and keep your head level');
    const exposure=raw.filter(f=>f&&f.qLum>=65&&f.qLum<=225).length/Math.max(1,raw.length);
    if(exposure<.75) corrections.push('Use even front lighting and avoid strong shadows or glare');
    const distance=raw.filter(f=>f&&f.faceFill>=.25&&f.faceFill<=.55).length/Math.max(1,raw.length);
    if(distance<.75) corrections.push('Move the phone until your face fits the guide without filling the frame');
    if(good.length<min) corrections.push(`Only ${good.length} frames passed the quality gate`);
    const metrics=['jawTaper','fWHR','shLw','shJc','shFc'];
    const unstable=[];
    for(const key of metrics){
      const vals=good.map(f=>Number(f[key])).filter(Number.isFinite);
      if(vals.length<min) continue;
      const m=med(vals),d=mad(vals);
      if(m&&d!=null&&Math.abs(d/m)>.035) unstable.push(key);
    }
    if(unstable.length) corrections.push('Measurements moved too much between frames - keep expression and camera position steady');
    const accepted=good.length>=min&&!unstable.length;
    const quality=Math.max(0,Math.min(100,Math.round(100*(.38*Math.min(1,good.length/min)+.22*frontal+.18*exposure+.12*distance+.10*(unstable.length?0:1)))));
    return {accepted,frames:good,corrections:[...new Set(corrections)],quality};
  }
  function installBrowserGuard(){
    try{
      if(typeof finalizeScan!=='function'||finalizeScan.__chiselGuarded) return false;
      const original=finalizeScan;
      const guarded=function(){
        const verdict=assessBurst(typeof _burst!=='undefined'?_burst:[],typeof deepScan!=='undefined'&&!!deepScan);
        const existing=document.getElementById('scanTrustBadge');
        if(existing) existing.remove();
        const badge=document.createElement('div');badge.id='scanTrustBadge';badge.style.cssText='position:absolute;left:16px;right:16px;top:78px;z-index:8;padding:10px 12px;border-radius:12px;background:rgba(10,10,11,.82);backdrop-filter:blur(10px);border:1px solid rgba(201,168,106,.34);font:600 11px/1.35 Inter,sans-serif;letter-spacing:.04em;color:#F2EDE4';
        badge.textContent=verdict.accepted?`Capture quality ${verdict.quality}/100 - measurement can proceed`:`Retake needed - ${verdict.corrections[0]||'capture quality is too low'}`;
        const wrap=document.getElementById('camwrap'); if(wrap) wrap.appendChild(badge);
        if(!verdict.accepted){
          try{ if(typeof toast==='function') toast('Retake: '+(verdict.corrections[0]||'capture quality too low'),3200); }catch(e){}
          try{ if(typeof setGuideMsg==='function') setGuideMsg('','RETAKE - '+(verdict.corrections[0]||'IMPROVE CAPTURE').toUpperCase()); }catch(e){}
          try{ _burst=[]; }catch(e){}
          return false;
        }
        try{ _burst=verdict.frames.slice(); }catch(e){}
        return original.apply(this,arguments);
      };
      guarded.__chiselGuarded=true;
      finalizeScan=guarded;
      return true;
    }catch(e){console.warn('[Chisel scan guard]',e);return false;}
  }
  return {assessBurst,installBrowserGuard};
});
