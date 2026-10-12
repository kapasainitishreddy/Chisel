import {createClient} from 'npm:@supabase/supabase-js@2';
import {createHandler} from './handler.mjs';
const url=Deno.env.get('SUPABASE_URL')||'',key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
async function rpc(name:string,user:string){const result=await db.rpc(name,{p_user:user});if(result.error)throw Error('cleanup_database_failed');return result.data;}
Deno.serve(createHandler({origins:['https://localhost',...(Deno.env.get('CHISEL_ALLOWED_ORIGINS')||'').split(',').map(x=>x.trim()).filter(Boolean)],
 authenticate:async(req:Request)=>{const token=req.headers.get('authorization')?.match(/^Bearer (\S+)$/)?.[1];if(!token||token.length>8192)return null;const result=await db.auth.getUser(token);return result.error?null:result.data.user?.id;},
 begin:(user:string)=>rpc('chisel_begin_account_deletion',user),
 removeOutputs:async(paths:string[],user:string)=>{if(!paths.length)return;const r=await db.storage.from('chisel-credit-output').remove(paths);if(r.error)throw Error('output_cleanup_failed');const cleared=await db.from('chisel_credit_jobs').update({output_path:null}).eq('user_id',user).in('output_path',paths);if(cleared.error)throw Error('output_record_cleanup_failed');},
 eraseData:(user:string)=>rpc('chisel_erase_account_data',user),
 deleteIdentity:async(user:string)=>{const r=await db.auth.admin.deleteUser(user);if(r.error&&r.error.status!==404)throw Error('identity_cleanup_failed');},
 complete:(user:string)=>rpc('chisel_complete_account_deletion',user)
}));
