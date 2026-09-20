/* Resumable client lifecycle. Only create starts paid work; status never does. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ChiselLooksCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
function safeOutput(value){
 try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.port||u.hash||!(u.hostname==='replicate.delivery'||u.hostname.endsWith('.replicate.delivery')))return null;return u.href;}catch{return null;}
}
const ERROR_COPY=Object.freeze({sign_in_required:'Sign in to use purchased credits.',account_changed:'Sign in to the account that started this edit.',insufficient_credits:'Add credits to create another look.',confirm_credit_cost:'Review the edit cost and confirm again.',job_in_progress:'Your current edit is still processing.',server_not_configured:'Cloud rendering is not configured yet.',service_disabled:'Cloud rendering is not enabled yet.',service_budget_reached:'The studio has reached its daily render limit. Try again tomorrow.',free_limit_reached:'Your daily render allowance is used up.',invalid_style:'Choose a supported style.',invalid_color:'Choose a supported hair colour.',invalid_image:'Choose a clear JPEG, PNG or WebP photo.',render_failed:'The provider could not finish this look. Your render allowance was returned.',render_timeout:'The result is still unconfirmed. Check status before starting another look.',job_not_found:'This render could not be found. No new render was started.',idempotency_conflict:'This request belongs to a different photo or look. Choose a new look.',invalid_output:'The provider returned an unsupported image link.',offline:'You are offline. Reconnect and check status.',busy:'A look is already being prepared.'});
function message(code){return ERROR_COPY[code]||'Could not reach the studio. Check status before generating again.';}
function randomToken(){const b=new Uint8Array(32);crypto.getRandomValues(b);return Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');}
function createController({request,sleep=ms=>new Promise(r=>setTimeout(r,ms)),uuid=()=>crypto.randomUUID(),token=randomToken,persist=()=>{}}){
 let state={status:'idle'},epoch=0,locked=false;const listeners=new Set();
 const snapshot=()=>Object.freeze({...state});
 function emit(patch){state={...state,...patch};for(const fn of listeners)try{fn(snapshot());}catch{};persist(snapshot());return snapshot();}
 function accept(data){
  if(!data||typeof data!=='object')throw Error('invalid_response');
  if(data.error){emit({status:'failed',error:data.error});return true;}
  const status=data.status;
  if(status==='succeeded'&&state.backend==='credits'&&data.apiVersion===2&&data.outputReady===true&&/^[a-f0-9-]{36}$/i.test(data.jobId||'')){emit({status,outputReady:true,jobId:data.jobId,balance:data.balance});return true;}
  if(status==='succeeded'){const url=safeOutput(data.imageUrl);if(!url){emit({status:'failed',error:'invalid_output'});return true;}emit({status,imageUrl:url,remaining:data.remaining,jobId:data.jobId||state.jobId});return true;}
  if(['failed','canceled','unknown'].includes(status)){emit({status:status==='unknown'?'interrupted':status,error:data.error|| (status==='unknown'?'render_timeout':status==='failed'?'render_failed':null),jobId:data.jobId||state.jobId});return true;}
  if(!['submitting','starting','processing','canceling'].includes(status))throw Error('invalid_response');
  emit({status,jobId:data.jobId||state.jobId,remaining:data.remaining});return false;
 }
 async function poll(myEpoch){
  for(let i=0;i<90&&myEpoch===epoch;i++){
   await sleep(1500);if(myEpoch!==epoch)return snapshot();
   const data=await request({action:'status',requestId:state.requestId,token:state.token,deviceId:state.deviceId,...(state.backend?{backend:state.backend,owner:state.owner}:{})});
   if(myEpoch!==epoch)return snapshot();if(accept(data))return snapshot();
  }
  if(myEpoch===epoch)emit({status:'interrupted',error:'render_timeout'});return snapshot();
 }
 async function generate(input){
  if(locked)throw Error('busy');if(state.status==='interrupted')throw Error('pending_job');locked=true;const mine=++epoch;
  state={status:'submitting',requestId:uuid(),token:token(),deviceId:input.deviceId,look:input.look,createdAt:Date.now(),...(input.backend?{backend:input.backend,owner:input.owner}:{} )};const creds={requestId:state.requestId,token:state.token,deviceId:state.deviceId,...(state.backend?{backend:state.backend,owner:state.owner}:{})};emit({});
  try{const data=await request({...input,action:'create',requestId:state.requestId,token:state.token});
   if(mine!==epoch){try{await request({...creds,action:'cancel'});}catch{}return snapshot();}if(!accept(data))await poll(mine);
  }catch(error){if(mine===epoch)emit({status:'interrupted',error:error.message||'network_error'});}
  finally{if(mine===epoch)locked=false;}return snapshot();
 }
 async function resume(saved){
  if(locked)throw Error('busy');if(saved){state={...saved};emit({});}
  if(!state.requestId||!state.token)return snapshot();locked=true;const mine=++epoch;
  try{const data=await request({action:'status',requestId:state.requestId,token:state.token,deviceId:state.deviceId,...(state.backend?{backend:state.backend,owner:state.owner}:{})});if(mine===epoch&&!accept(data))await poll(mine);}
  catch(error){if(mine===epoch)emit({status:'interrupted',error:error.message||'network_error'});}
  finally{if(mine===epoch)locked=false;}return snapshot();
 }
 async function cancel(){
  const requestData={action:'cancel',requestId:state.requestId,token:state.token,deviceId:state.deviceId,...(state.backend?{backend:state.backend,owner:state.owner}:{})};epoch++;locked=false;emit({status:'canceled',imageUrl:null,error:null});
  if(requestData.requestId)try{await request(requestData);}catch{};return snapshot();
 }
 function clear(){epoch++;locked=false;state={status:'idle'};emit({});}
 return{snapshot,generate,resume,cancel,clear,subscribe(fn){listeners.add(fn);fn(snapshot());return()=>listeners.delete(fn);}};
}
return{safeOutput,message,createController};
});
