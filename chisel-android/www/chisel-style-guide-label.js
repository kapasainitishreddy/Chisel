(function(root){
  'use strict';
  function detachLegacySummaryObserver(){
    if(typeof document==='undefined')return null;
    const summary=document.getElementById('cxStyleSummary');
    if(!summary)return null;
    if(summary.dataset.chiselDetachedLegacyObserver==='1')return summary;
    const clone=summary.cloneNode(true);
    clone.dataset.chiselDetachedLegacyObserver='1';
    summary.replaceWith(clone);
    return clone;
  }
  function sync(){
    if(typeof document==='undefined')return false;
    const bar=document.getElementById('styleBar');
    if(!bar||getComputedStyle(bar).display==='none')return false;
    const summary=detachLegacySummaryObserver()||document.getElementById('cxStyleSummary');
    const head=summary&&summary.closest('.cx-preview-head');
    const title=head&&head.querySelector('.cx-preview-title');
    const meta=document.querySelector('.camwrap .hud .meta');
    if(title&&title.textContent!=='Live placement guide')title.textContent='Live placement guide';
    if(meta&&meta.textContent!=='LIVE STYLE GUIDE')meta.textContent='LIVE STYLE GUIDE';
    return true;
  }
  function schedule(){setTimeout(sync,0);setTimeout(sync,220);setTimeout(sync,700);}
  function install(){
    if(typeof document==='undefined')return false;
    if(document.documentElement.dataset.chiselStyleGuideLabel==='1'){schedule();return true;}
    document.documentElement.dataset.chiselStyleGuideLabel='1';
    document.addEventListener('click',e=>{
      const t=e.target&&e.target.closest&&e.target.closest('#hairChips .sc,#beardChips .sc,#makeupChips .sc,#glassChips .sc,#styleTop .sc,#photorealBtn,#prRetry');
      if(t)schedule();
    },true);
    if(typeof openStyle==='function'&&!openStyle.__chiselStyleGuideLabel){
      const base=openStyle;
      const wrapped=function(){const r=base.apply(this,arguments);schedule();return r;};
      wrapped.__chiselStyleGuideLabel=true;
      try{openStyle=wrapped}catch(_){}
    }
    schedule();
    return true;
  }
  root.ChiselStyleGuideLabel={install,sync,detachLegacySummaryObserver};
  if(typeof window!=='undefined')window.addEventListener('load',()=>setTimeout(install,520),{once:true});
})(typeof globalThis!=='undefined'?globalThis:this);
