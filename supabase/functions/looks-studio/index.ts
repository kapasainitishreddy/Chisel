// Saved-photo rendering. No image bytes or free-form prompts are persisted.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';
import {readRequestTextWithLimit,readJsonObjectResponseWithLimit,validateDataImage} from './security.mjs';
import {normalizeLook,buildPrompt} from './catalog.mjs';
import {MODEL,requestIdentity,providerState,publicJob,digest,outputURL} from './protocol.mjs';
const url=Deno.env.get('SUPABASE_URL')||'',key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const token=Deno.env.get('REPLICATE_API_TOKEN')||'';
const db=url&&key?createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}}):null;
const origins=new Set(['https://localhost',...(Deno.env.get('CHISEL_ALLOWED_ORIGINS')||'').split(',').map(v=>v.trim()).filter(Boolean)]);
if(Deno.env.get('CHISEL_ALLOW_DEV_ORIGIN')==='1')origins.add('http://localhost:8080');
function headers(req){const origin=req.headers.get('Origin');return {'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Vary':'Origin',...(origin&&origins.has(origin)?{'Access-Control-Allow-Origin':origin}:{})};}
function json(req,data,status=200){return new Response(JSON.stringify(data),{status,headers:headers(req)});}
async function remaining(identity,day){const [a,b]=await Promise.all([db.from('looks_settings').select('per_device_limit').eq('id',true).single(),db.from('looks_credits').select('used').eq('identity_key',identity).eq('day',day).maybeSingle()]);return a.error||b.error?null:Math.max(0,a.data.per_device_limit-(b.data?.used||0));}
async function savePrediction(job,pred){
 const state=providerState(pred);
 // Pin requests to the known API path; never follow provider-supplied URLs.
 const saved=await db.from('looks_jobs').update({provider_id:state.id,updated_at:new Date().toISOString()}).eq('id',job.id).select().single();
 if(saved.error)throw Error('job_storage_failed');
 if(['succeeded','failed','canceled'].includes(state.status)){
  const {data,error}=await db.rpc('finish_look_job',{p_job_id:job.id,p_status:state.status,p_image_url:state.imageUrl,p_error:state.status==='failed'?'render_failed':null});if(error)throw Error('job_storage_failed');return data;
 }
 if(saved.data.status==='canceling')return saved.data;
 const r=await db.from('looks_jobs').update({status:state.status}).eq('id',job.id).in('status',['submitting','starting','processing','unknown']).select().maybeSingle();
 if(r.error)throw Error('job_storage_failed');return r.data||saved.data;
}
async function providerFetch(path,method='GET',body=null){
 const response=await fetch('https://api.replicate.com/v1/'+path,{method,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json',...(method==='POST'?{Prefer:'wait=2','Cancel-After':'2m'}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(20000),redirect:'error',credentials:'omit',cache:'no-store'});
 if(!response.ok){const e=new Error(response.status>=400&&response.status<500&&response.status!==408?'provider_rejected':'provider_unconfirmed');throw e;}
 return readJsonObjectResponseWithLimit(response,8500000);
}
Deno.serve(async req=>{
 if(req.headers.get('Origin')&&!origins.has(req.headers.get('Origin')))return json(req,{error:'origin_not_allowed'},403);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers(req),'Access-Control-Allow-Headers':'apikey,authorization,content-type','Access-Control-Allow-Methods':'GET,POST,OPTIONS'}});
 if(req.method==='GET'){
  const config=db?await db.from('looks_settings').select('enabled,daily_budget,per_device_limit').eq('id',true).maybeSingle():null;
  const ready=!!token&&!!config&&!config.error&&!!config.data?.enabled;
  return json(req,{ready,apiVersion:1,categories:['hair','beard','makeup','eyewear'],provider:MODEL,...(ready?{dailyAllowance:config.data.per_device_limit}:{error:!token?'server_not_configured':config?.error?'storage_not_configured':'service_disabled'})},ready?200:503);
 }
 if(req.method!=='POST')return json(req,{error:'method_not_allowed'},405);
 if(!/^application\/json(?:\s*;|$)/i.test(req.headers.get('Content-Type')||''))return json(req,{error:'unsupported_media_type'},415);
 if(!db||!token)return json(req,{error:'server_not_configured'},503);
 let body,identity,identityKey,tokenHash;
 try{body=JSON.parse(await readRequestTextWithLimit(req));identity=requestIdentity(body);identityKey=await digest(identity.deviceId);tokenHash=await digest(identity.token);}catch(e){return json(req,{error:e.message==='body_too_large'?'body_too_large':'invalid_request'},400);}
 try{
  let job;
  if(body.action==='create'){
   let look;try{look=normalizeLook(body.look);}catch(e){return json(req,{error:e.message},400);}
   if(!validateDataImage(body.image).ok)return json(req,{error:'invalid_image'},400);
   const inputDigest=await digest(body.image+'\n'+JSON.stringify(look));
   const reservation=await db.rpc('reserve_look_job',{p_identity_key:identityKey,p_request_id:identity.requestId,p_token_hash:tokenHash,p_input_digest:inputDigest});
   if(reservation.error)return json(req,{error:'rate_limit_unavailable'},503);
   if(reservation.data.error)return json(req,{error:reservation.data.error},reservation.data.error.includes('limit')||reservation.data.error.includes('budget')?429:409);
   job=reservation.data.job;
   if(reservation.data.fresh){
    try{const prediction=await providerFetch(`models/${MODEL}/predictions`,'POST',{input:{prompt:buildPrompt(look),input_image:body.image,aspect_ratio:'match_input_image',output_format:'jpg',safety_tolerance:2,prompt_upsampling:false}});job=await savePrediction(job,prediction);
     if(job.status==='canceling'&&job.provider_id){const pd=await providerFetch(`predictions/${job.provider_id}/cancel`,'POST');job=await savePrediction(job,pd);}
    }catch(e){
     // An ambiguous timeout may still have started paid work. Never retry create.
     const status=e.message==='provider_rejected'?'failed':'unknown';
     const s=await db.rpc('finish_look_job',{p_job_id:job.id,p_status:status,p_error:status==='failed'?'render_failed':'render_timeout'});
     job=s.data||{...job,status};
    }
   }
  }else{
   const r=await db.from('looks_jobs').select('*').eq('identity_key',identityKey).eq('request_id',identity.requestId).eq('token_hash',tokenHash).maybeSingle();
   if(r.error)return json(req,{error:'job_storage_unavailable'},503);
   if(!r.data)return json(req,{error:'job_not_found'},404);job=r.data;
   if(new Date(job.expires_at).getTime()<Date.now())return json(req,{error:'job_expired'},410);
   if(body.action==='output'){
    const imageURL=outputURL(job.image_url);if(job.status!=='succeeded'||!imageURL)return json(req,{error:'output_not_ready'},409);
    // Outputs may require provider authorization. Never expose that secret to clients.
    const upstream=await fetch(imageURL,{headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(20000),redirect:'error',credentials:'omit',cache:'no-store'});
    if(!upstream.ok)return json(req,{error:'output_expired'},410);
    const type=(upstream.headers.get('Content-Type')||'').split(';')[0];
    if(!['image/jpeg','image/png','image/webp'].includes(type))return json(req,{error:'invalid_output'},502);
    const declared=Number(upstream.headers.get('Content-Length')||0);if(declared>8000000)return json(req,{error:'output_too_large'},502);
    const reader=upstream.body?.getReader();if(!reader)return json(req,{error:'invalid_output'},502);
    const chunks=[];let total=0;
    try{while(true){const part=await reader.read();if(part.done)break;total+=part.value.byteLength;if(total>8000000){await reader.cancel();return json(req,{error:'output_too_large'},502);}chunks.push(part.value);}}finally{reader.releaseLock();}
    const bytes=new Uint8Array(total);let at=0;for(const part of chunks){bytes.set(part,at);at+=part.length;}
    return new Response(bytes,{headers:{...headers(req),'Content-Type':type,'Content-Length':String(bytes.length)}});
   }

   if(!['succeeded','failed','canceled'].includes(job.status)){
    if(body.action==='cancel'){
     const r=await db.from('looks_jobs').update({status:'canceling'}).eq('id',job.id).in('status',['submitting','starting','processing','unknown','canceling']).select().maybeSingle();job=r.data||job;
    }
    if(job.provider_id){try{const pd=await providerFetch(`predictions/${job.provider_id}`+(body.action==='cancel'?'/cancel':''),body.action==='cancel'?'POST':'GET');job=await savePrediction(job,pd);}catch{return json(req,{...publicJob(job),error:null},202);}}
   }
  }
  const left=await remaining(job.identity_key,job.day);return json(req,publicJob(job,left),['succeeded','failed','canceled'].includes(job.status)?200:202);
 }catch{return json(req,{error:'service_unavailable'},503);}
});
