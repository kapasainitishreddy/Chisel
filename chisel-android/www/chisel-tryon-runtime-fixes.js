(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else {
    root.ChiselTryonRuntimeFixes=api;
    if(typeof window!=='undefined'&&typeof document!=='undefined'){
      window.addEventListener('load',()=>setTimeout(api.install,0),{once:true});
    }
  }
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function isDuplicateRoute(route,activeRoute,hash){
    const target=String(route||'home');
    return activeRoute===target && hash==='#'+target;
  }

  function installRouteGuard(){
    if(typeof window==='undefined'||typeof document==='undefined'||typeof window.go!=='function') return false;
    if(window.go.__chiselRouteGuard) return true;
    const originalGo=window.go;
    const wrappedGo=function(route){
      const target=String(route||'home');
      const active=document.querySelector('.screen.active');
      const activeRoute=active&&active.dataset?active.dataset.screen:null;
      if(isDuplicateRoute(target,activeRoute,window.location.hash)) return true;
      return originalGo.apply(this,arguments);
    };
    wrappedGo.__chiselRouteGuard=true;
    wrappedGo.__chiselOriginalGo=originalGo;
    window.go=wrappedGo;
    return true;
  }

  function install(){
    installRouteGuard();

    if(typeof renderStyleChips==='function'&&!renderStyleChips.__chiselTryonFix){
      const originalRender=renderStyleChips;
      const wrappedRender=function(){
        const result=originalRender.apply(this,arguments);
        try{
          const women=typeof styleGender!=='undefined'&&styleGender==='women';
          const beardLabel=document.getElementById('beardLab');
          const beardChips=document.getElementById('beardChips');
          if(beardLabel)beardLabel.style.display=women?'none':'';
          if(beardChips)beardChips.style.display=women?'none':'';
        }catch(e){}
        return result;
      };
      wrappedRender.__chiselTryonFix=true;
      renderStyleChips=wrappedRender;
    }

    if(typeof applyMatches==='function'&&!applyMatches.__chiselPreserveBeard){
      const originalMatches=applyMatches;
      const wrappedMatches=function(){
        const priorBeard=typeof styleBeard==='number'?styleBeard:0;
        const result=originalMatches.apply(this,arguments);
        try{
          styleBeard=(typeof styleGender!=='undefined'&&styleGender==='women')?0:priorBeard;
          if(typeof renderStyleChips==='function')renderStyleChips();
        }catch(e){}
        return result;
      };
      wrappedMatches.__chiselPreserveBeard=true;
      applyMatches=wrappedMatches;
    }

    if(typeof openStyle==='function'&&!openStyle.__chiselCleanDefault){
      const originalOpen=openStyle;
      const wrappedOpen=function(){
        const result=originalOpen.apply(this,arguments);
        try{
          styleBeard=0;
          if(typeof renderStyleChips==='function')renderStyleChips();
        }catch(e){}
        return result;
      };
      wrappedOpen.__chiselCleanDefault=true;
      openStyle=wrappedOpen;
    }
    return true;
  }
  return{install,isDuplicateRoute,installRouteGuard};
});