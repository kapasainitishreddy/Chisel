// Consumable receipts only. Do not route these products into an unlimited Pro entitlement.
import {createClient} from 'npm:@supabase/supabase-js@2';
import {purchaseEvent} from '../credit-studio/policy.mjs';
import {readBytes} from '../credit-studio/provider.mjs';
const secret=Deno.env.get('CHISEL_RC_WEBHOOK_AUTH')||'',appId=Deno.env.get('CHISEL_RC_APP_ID')||'',environment=Deno.env.get('CHISEL_CREDIT_ENV')||'PRODUCTION';
const hash=async(v:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v))),x=>x.toString(16).padStart(2,'0')).join('');
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
Deno.serve(async req=>{
 if(req.method!=='POST')return json({error:'method_not_allowed'},405);
 if(!secret||!appId)return json({error:'server_not_configured'},503);
 const incoming=req.headers.get('authorization')||'';
 if(incoming.length>1024||await hash(incoming)!==await hash(secret))return json({error:'unauthorized'},401);
 if(!/^application\/json(?:;|$)/i.test(req.headers.get('content-type')||''))return json({error:'unsupported_media_type'},415);
 let raw:string,event;
 try{raw=new TextDecoder().decode(await readBytes(req,65536));event=purchaseEvent(JSON.parse(raw).event,{appId,environment});}catch{return json({error:'invalid_event'},400);}
 if(!event)return json({ignored:true});
 const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
 const r=await db.rpc('chisel_credit_purchase',{p_environment:event.environment,p_store:event.store,p_transaction:event.transactionId,p_event:event.eventId,p_user:event.userId,p_product:event.productId,p_action:event.action,p_fingerprint:await hash(raw!)});
 if(r.error)return json({error:'receipt_pending_review'},503);
 return json({ok:true,duplicate:!!r.data?.duplicate});
});
