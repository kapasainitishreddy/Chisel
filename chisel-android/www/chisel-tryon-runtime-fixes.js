(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.ChiselTryonRuntimeFixes=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function install(){
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
  return{install};
});
