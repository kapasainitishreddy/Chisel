import {PACKS,MODES,MODEL,UUID,mode} from './policy.mjs';
import {readBytes,validatePreparedImage,editImage} from './provider.mjs';
import {normalizeLook,buildPrompt} from '../looks-studio/catalog.mjs';
const hash=async text=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),x=>x.toString(16).padStart(2,'0')).join('');
const BUCKET='chisel-credit-output';
export function createHandler({db,key='',environment='PRODUCTION',rcPublicKey='',rcAppId='',rcWebhookReady=false,origins=['https://localhost'],fetcher=fetch,schedule=work=>work}){
 if(!['PRODUCTION','SANDBOX'].includes(environment))throw Error('invalid_environment');const allowed=new Set(origins);
 const headers=req=>({'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',Vary:'Origin',...(allowed.has(req.headers.get('origin'))?{'Access-Control-Allow-Origin':req.headers.get('origin')}:{})});
 const json=(req,body,status=200)=>new Response(JSON.stringify(body),{status,headers:headers(req)});
 async function config(){const r=await db.from('chisel_credit_config').select('*').eq('environment',environment).single();if(r.error)throw Error('configuration_unavailable');return r.data;}
 async function user(req){const token=/^Bearer ([^\s]+)$/.exec(req.headers.get('authorization')||'')?.[1];if(!token)return null;const r=await db.auth.getUser(token);return !r.error&&UUID.test(r.data?.user?.id||'')?r.data.user:null;}
 async function balance(id){const r=await db.from('chisel_credit_accounts').select('balance').eq('user_id',id).eq('environment',environment).maybeSingle();if(r.error)throw Error('wallet_unavailable');return r.data?.balance??0;}
 const ready=c=>!!key&&c.renders_enabled&&c.costs_verified&&c.model===MODEL;
 async function view(job){return {apiVersion:2,jobId:job.id,status:job.status==='reserved'?'starting':job.status,outputReady:job.status==='succeeded',error:job.status==='failed'?(job.error_code||'render_failed'):null,balance:await balance(job.user_id),chargedCredits:job.credits};}
 async function work(job,input){
  let outputPath,actualCost=null,providerRequest=null;
  try{
   const claim=await db.rpc('chisel_credit_start',{p_job:job.id});if(claim.error||!claim.data)return;
   const edited=await editImage({key,image:input.image,prompt:buildPrompt(normalizeLook(input.look)),quality:input.quality,shape:input.shape,fetcher});
   actualCost=edited.costMicros;providerRequest=edited.requestId;
   outputPath=`${environment}/${job.user_id}/${job.id}.jpg`;
   const upload=await db.storage.from(BUCKET).upload(outputPath,edited.bytes,{contentType:'image/jpeg',cacheControl:'0',upsert:false});if(upload.error)throw Error('output_storage_failed');
   const settled=await db.rpc('chisel_credit_finish',{p_job:job.id,p_status:'succeeded',p_cost:edited.costMicros,p_path:outputPath,p_provider_request:edited.requestId});
   if(settled.error||settled.data?.status!=='succeeded')await db.storage.from(BUCKET).remove([outputPath]);
  }catch(e){
   if(outputPath)await db.storage.from(BUCKET).remove([outputPath]).catch(()=>{});
   // Do not retry paid API calls. A failed attempt keeps its budget reservation.
   await db.rpc('chisel_credit_finish',{p_job:job.id,p_status:'failed',p_error:'render_failed',p_cost:actualCost,p_provider_request:providerRequest});
   if(['provider_unconfirmed','invalid_provider_result'].includes(e.code)||actualCost!==null&&actualCost>job.reserved_micros)await db.from('chisel_credit_config').update({renders_enabled:false,costs_verified:false}).eq('environment',environment);
  }
 }
 return async req=>{
  if(req.headers.has('origin')&&!allowed.has(req.headers.get('origin')))return json(req,{error:'origin_not_allowed'},403);
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers(req),'Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'GET,POST,OPTIONS'}});
  if(!db)return json(req,{apiVersion:2,ready:false,error:'server_not_configured'},503);
  try{
   const c=await config();
   if(req.method==='GET'){
    const person=await user(req);let wallet=null;
    if(person){await db.rpc('chisel_credit_reconcile',{p_user:person.id,p_environment:environment});wallet={userId:person.id,balance:await balance(person.id)};}
    return json(req,{apiVersion:2,billing:'credits',provider:'OpenAI',model:MODEL,environment,ready:ready(c),salesReady:!!(c.sales_enabled&&ready(c)&&rcPublicKey&&rcAppId&&rcWebhookReady),rcPublicKey:rcPublicKey||null,packs:PACKS,modes:MODES,wallet,...(!ready(c)?{error:'service_disabled'}:{})});
   }
   if(req.method!=='POST')return json(req,{error:'method_not_allowed'},405);
   const person=await user(req);if(!person)return json(req,{error:'sign_in_required'},401);
   if(!/^application\/json(?:;|$)/i.test(req.headers.get('content-type')||''))return json(req,{error:'unsupported_media_type'},415);
   let input;try{input=JSON.parse(new TextDecoder().decode(await readBytes(req,8600000)));}catch{return json(req,{error:'invalid_request'},400);}
   await db.rpc('chisel_credit_reconcile',{p_user:person.id,p_environment:environment});
   if(!UUID.test(input.requestId||''))return json(req,{error:'invalid_request'},400);
   let job;
   if(input.action==='create'){
    if(!ready(c))return json(req,{error:'service_disabled'},503);
    let look,tariff;try{tariff=mode(input.quality);look=normalizeLook(input.look);validatePreparedImage(input.image);if(!['portrait','landscape','square'].includes(input.shape))throw Error();}catch{return json(req,{error:'invalid_request'},400);}
    if(input.quotedCredits!==tariff.credits||input.consent!==true)return json(req,{error:'confirm_credit_cost'},409);
    const reserved=await db.rpc('chisel_credit_reserve',{p_user:person.id,p_environment:environment,p_request:input.requestId,p_mode:input.quality,p_digest:await hash(input.image+'\n'+JSON.stringify(look)+'\n'+input.quality+'\n'+input.shape)});
    if(reserved.error)return json(req,{error:'wallet_unavailable'},503);
    if(reserved.data.error)return json(req,{error:reserved.data.error},409);
    job=reserved.data.job;
    if(reserved.data.fresh)schedule(work(job,{...input,look}));
    return json(req,await view(job),202);
   }
   if(!['status','output','cancel'].includes(input.action))return json(req,{error:'invalid_request'},400);
   const found=await db.from('chisel_credit_jobs').select('*').eq('user_id',person.id).eq('environment',environment).eq('request_id',input.requestId).maybeSingle();
   if(found.error)throw Error('job_storage_unavailable');if(!found.data)return json(req,{error:'job_not_found'},404);job=found.data;
   if(input.action==='output'){
    if(job.status!=='succeeded'||!job.output_path)return json(req,{error:'output_not_ready'},409);
    if(Date.parse(job.expires_at)<Date.now()){await db.storage.from(BUCKET).remove([job.output_path]);return json(req,{error:'output_expired'},410);}
    const image=await db.storage.from(BUCKET).download(job.output_path);if(image.error||!image.data)return json(req,{error:'output_unavailable'},503);
    return new Response(image.data,{headers:{...headers(req),'Content-Type':'image/jpeg'}});
   }
   // OpenAI image edits cannot be reliably cancelled once submitted. Keep the job
   // recoverable and never claim an automatic refund for merely closing the editor.
   return json(req,await view(job),job.status==='processing'||job.status==='reserved'?202:200);
  }catch{return json(req,{error:'service_unavailable'},503);}
 };
}
