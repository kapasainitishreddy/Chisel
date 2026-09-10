import {validateHttpsOutputUrl} from './security.mjs';
export const MODEL='black-forest-labs/flux-kontext-pro';
export function outputURL(raw){
 const valid=validateHttpsOutputUrl(raw);if(!valid)return null;const u=new URL(valid);
 return !u.port&&(u.hostname==='replicate.delivery'||u.hostname.endsWith('.replicate.delivery'))?u.href:null;
}
export function requestIdentity(body){
 if(!body||!['create','status','cancel','output'].includes(body.action)||typeof body.deviceId!=='string'||!/^[A-Za-z0-9._:-]{16,128}$/.test(body.deviceId)||typeof body.requestId!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(body.requestId)||typeof body.token!=='string'||!/^[a-f0-9]{64}$/.test(body.token))throw Error('invalid_request');
 return {deviceId:body.deviceId,requestId:body.requestId,token:body.token};
}
export function publicJob(job,remaining){return {jobId:job.id,status:job.status,imageUrl:job.status==='succeeded'?outputURL(job.image_url):null,error:job.status==='failed'?job.error_code||'render_failed':null,remaining};}
export function providerState(pred){
 if(!pred||typeof pred!=='object'||typeof pred.id!=='string'||!/^[A-Za-z0-9_-]{1,160}$/.test(pred.id))throw Error('provider_invalid_response');
 if(!['starting','processing','succeeded','failed','canceled'].includes(pred.status))throw Error('provider_invalid_response');
 const raw=Array.isArray(pred.output)?pred.output[0]:pred.output;
 if(pred.status==='succeeded'&&!outputURL(raw))throw Error('invalid_output');
 return {id:pred.id,status:pred.status,imageUrl:pred.status==='succeeded'?outputURL(raw):null};
}
export async function digest(value){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');}
