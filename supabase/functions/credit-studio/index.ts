import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import {createClient} from 'npm:@supabase/supabase-js@2';
import {createHandler} from './handler.mjs';
const url=Deno.env.get('SUPABASE_URL')||'',service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const handler=createHandler({db:url&&service?createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}}):null,key:Deno.env.get('OPENAI_API_KEY')||'',environment:Deno.env.get('CHISEL_CREDIT_ENV')||'PRODUCTION',rcPublicKey:Deno.env.get('CHISEL_RC_PUBLIC_KEY')||'',rcAppId:Deno.env.get('CHISEL_RC_APP_ID')||'',rcWebhookReady:!!Deno.env.get('CHISEL_RC_WEBHOOK_AUTH'),origins:['https://localhost',...(Deno.env.get('CHISEL_ALLOWED_ORIGINS')||'').split(',').map(x=>x.trim()).filter(Boolean)],schedule:work=>EdgeRuntime.waitUntil(work)});
Deno.serve(handler);
