(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.ChiselScanGuard=api;
  if(typeof window!=='undefined'&&typeof document!=='undefined') window.addEventListener('load',()=>setTimeout(api.installBrowserGuard,0),{once:true});
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const med=a=>{const b=a.filter(Number.isFinite).slice().sort((x,y)=>x-y);if(!b.length)return null;const m=Math.floor(b.length/2);return b.length%2?b[m]:(b[m-1]+b[m])/2};
  const mad=a=>{const m=med(a);if(m==null)return null;return med(a.filter(Number.isFinite).map(v=>Math.abs(v-m)))};
  const METRICS=['jawTaper','fWHR','shLw','shJc','shFc'];
  function assessFrame(f){
    let correction='';
    if(!f||f.frontal!==true) correction='Face the camera straight on and keep your chin level';
    else if(!Number.isFinite(f.faceFill)||f.faceFill<.25) correction='Move a little closer to the camera';
    else if(f.faceFill>.55) correction='Move a little farther from the camera';
    else if(!Number.isFinite(f.rollDeg)||Math.abs(f.rollDeg)>6) correction='Straighten your head';
    else if(!Number.isFinite(f.yaw)||Math.abs(f.yaw)>.07) correction='Face the camera straight on';
    else if(!Number.isFinite(f.qLum)||f.qLum<65||f.qLum>225) correction='Use even front lighting without shadows or glare';
    else if(!Number.isFinite(f.blink)||f.blink>=.35) correction='Keep your eyes comfortably open';
    else if(METRICS.some(key=>!Number.isFinite(f[key])||f[key]<=0)) correction='Wait for a complete face reading';
    return{accepted:!correction,correction};
  }
  function assessBurst(frames,deep){
    const raw=Array.isArray(frames)?frames:[];
    const min=deep?16:7;
    const good=raw.filter(f=>assessFrame(f).accepted);
    const corrections=[];
    if(raw.length<min) corrections.push(`Hold still longer - need at least ${min} usable frames`);
    const frontal=raw.filter(f=>f&&f.frontal===true).length/Math.max(1,raw.length);
    if(frontal<.75) corrections.push('Face the camera straight on and keep your head level');
    const exposure=raw.filter(f=>f&&f.qLum>=65&&f.qLum<=225).length/Math.max(1,raw.length);
    if(exposure<.75) corrections.push('Use even front lighting and avoid strong shadows or glare');
    const distance=raw.filter(f=>f&&f.faceFill>=.25&&f.faceFill<=.55).length/Math.max(1,raw.length);
    if(distance<.75) corrections.push('Move the phone until your face fits the guide without filling the frame');
    if(good.length<min) corrections.push(`Only ${good.length} frames passed the quality gate`);
    const metrics=METRICS;
    const unstable=[];
    for(const key of metrics){
      const vals=good.map(f=>f[key]).filter(Number.isFinite);
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
        const age=typeof _lastScanFrameAt!=='undefined'&&_lastScanFrameAt>0?performance.now()-_lastScanFrameAt:Infinity;
        const verdict=assessCapture(typeof _burst!=='undefined'?_burst:[],typeof deepScan!=='undefined'&&!!deepScan,age);
        const existing=document.getElementById('scanTrustBadge');
        if(existing) existing.remove();
        const badge=document.createElement('div');badge.id='scanTrustBadge';badge.style.cssText='position:absolute;left:16px;right:16px;top:78px;z-index:8;padding:10px 12px;border-radius:12px;background:rgba(10,10,11,.82);backdrop-filter:blur(10px);border:1px solid rgba(201,168,106,.34);font:600 11px/1.35 Inter,sans-serif;letter-spacing:.04em;color:#F2EDE4';
        badge.textContent=verdict.accepted?`Capture quality ${verdict.quality}/100 - measurement can proceed`:`Retake needed - ${verdict.corrections[0]||'capture quality is too low'}`;
        const wrap=document.getElementById('camwrap'); if(wrap) wrap.appendChild(badge);
        if(!verdict.accepted){
          try{ if(typeof toast==='function') toast('Retake: '+(verdict.corrections[0]||'capture quality too low'),3200); }catch(e){}
          try{ if(typeof setGuideMsg==='function') setGuideMsg('','RETAKE - '+(verdict.corrections[0]||'IMPROVE CAPTURE').toUpperCase()); }catch(e){}
          try{ _burst=[]; }catch(e){}
          try{ _lockAt=0; if(typeof setScanWatch==='function')setScanWatch(); }catch(e){}
          return false;
        }
        if(typeof setGuideMsg==='function')setGuideMsg('✓','CAPTURED');
        try{ _burst=verdict.frames.slice(); }catch(e){}
        return original.apply(this,arguments);
      };
      guarded.__chiselGuarded=true;
      finalizeScan=guarded;
      return true;
    }catch(e){console.warn('[Chisel scan guard]',e);return false;}
  }
  function assessCapture(frames,deep,age){
    if(!Number.isFinite(age)||age<0||age>350)return{accepted:false,frames:[],quality:0,corrections:['Wait for a fresh camera frame, then hold still']};
    return assessBurst(frames,deep);
  }
  return {assessFrame,assessBurst,assessCapture,installBrowserGuard};
});
