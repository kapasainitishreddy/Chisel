(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;if(root)root.ChiselTryonPolicy=api;})(typeof window!=='undefined'?window:null,()=>{
  function preview(kind){return kind==='cloud'?{label:'AI visualization · not a measurement',upload:true,requiresConsent:true}:{label:kind==='eyewear'?'Local eyewear placement guide · not an optical fitting':'Local style guide · not a photoreal result',upload:false,requiresConsent:false};}
  function install(){if(typeof document==='undefined')return;const e=document.getElementById('cxStyleSummary');if(e)e.setAttribute('title',preview('hair').label);}
  return{preview,install};
});
