// Readiness and rejection paths only: no account, secret, photo, valid purchase or generation.
import fs from 'node:fs';
const base='https://wnzbmmhtdchdqjnskwlo.supabase.co/functions/v1/';
const report={scope:'Live deployed credit endpoints: readiness and unauthenticated rejection only. No generation, purchase or photo.',checks:{},responses:{}};
function check(name,value){report.checks[name]=!!value;if(!value)throw Error(name);}
async function read(path,options={}){const response=await fetch(base+path,{...options,redirect:'error',signal:AbortSignal.timeout(20000)});const text=await response.text();if(text.length>65536)throw Error('oversized_response');let data={};try{data=JSON.parse(text);}catch{}return{status:response.status,data,headers:response.headers};}
try{
 const ready=await read('credit-studio');report.responses.readiness={status:ready.status,version:ready.data.apiVersion,ready:ready.data.ready,salesReady:ready.data.salesReady,wallet:ready.data.wallet,error:ready.data.error};
 check('deployedGatewayResponds',ready.status===200&&ready.data.apiVersion===2);
 check('prelaunchSalesAndRendersDisabled',ready.data.ready===false&&ready.data.salesReady===false);
 check('publicResponseHasNoAccount',ready.data.wallet===null);
 const rejected=await read('credit-studio',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'create',requestId:'00000000-0000-4000-8000-000000000001'})});report.responses.unauthenticated={status:rejected.status,error:rejected.data.error};
 check('noAuthenticationNoGeneration',rejected.status===401&&rejected.data.error==='sign_in_required');
 const cors=await read('credit-studio',{headers:{Origin:'https://unapproved.example.invalid'}});report.responses.origin={status:cors.status,error:cors.data.error};
 check('unapprovedOriginRejected',cors.status===403&&cors.data.error==='origin_not_allowed');
 const webhook=await read('credit-purchases',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});report.responses.webhook={status:webhook.status,error:webhook.data.error};
 check('unsignedWebhookCannotCreditWallet',[401,503].includes(webhook.status)&&['unauthorized','server_not_configured'].includes(webhook.data.error));
}catch(e){report.error=e.message;process.exitCode=1;}
finally{fs.mkdirSync('/tmp/chisel-credits-qa',{recursive:true});fs.writeFileSync('/tmp/chisel-credits-qa/live-readiness.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
