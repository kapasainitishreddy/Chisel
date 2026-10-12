(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;if(root)root.ChiselRuntimeLoader=api;})(typeof window!=='undefined'?window:null,()=>{
  async function run(groups,onStatus){const result={};for(const group of groups){const blocked=(group.deps||[]).filter(id=>result[id]?.status!=='ready');if(blocked.length)result[group.id]={status:'blocked',dependencies:blocked};else{try{await group.run();result[group.id]={status:'ready'};}catch(error){result[group.id]={status:'failed',message:String(error?.message||error)};}}if(onStatus)try{onStatus(group.id,result[group.id]);}catch{} }return result;}
  return{run};
});
