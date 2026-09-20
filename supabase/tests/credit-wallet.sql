-- All dummy transactions and temporary configuration are rolled back.
begin;
create temporary table credit_test_result(result text) on commit drop;
do $$
declare u uuid:=gen_random_uuid(); other_user uuid:=gen_random_uuid(); r uuid:=gen_random_uuid(); job uuid; v jsonb; bal bigint; budget bigint; prefix text:=gen_random_uuid()::text;
begin
 if exists(select 1 from public.chisel_credit_config where sales_enabled or renders_enabled or costs_verified) then raise exception 'Run against disabled launch configuration only';end if;
 update public.chisel_credit_config set renders_enabled=true,costs_verified=true,daily_budget_micros=5000000 where environment='SANDBOX';
 perform public.chisel_credit_purchase('SANDBOX','PLAY_STORE',prefix||':a',prefix||':e1',u,'chisel_credits_10','grant',repeat('a',64));
 v:=public.chisel_credit_purchase('SANDBOX','PLAY_STORE',prefix||':a',prefix||':e1',u,'chisel_credits_10','grant',repeat('a',64));
 if v->>'duplicate'<>'true' then raise exception 'event dedupe failed';end if;
 perform public.chisel_credit_purchase('SANDBOX','PLAY_STORE',prefix||':a',prefix||':e2',u,'chisel_credits_10','grant',repeat('b',64));
 select balance into bal from public.chisel_credit_accounts where user_id=u and environment='SANDBOX';if bal<>10 then raise exception 'transaction double grant';end if;
 begin
  perform public.chisel_credit_purchase('SANDBOX','PLAY_STORE',prefix||':a',prefix||':e1',u,'chisel_credits_10','grant',repeat('c',64));raise exception 'expected event conflict';
 exception when others then if sqlerrm<>'event_conflict' then raise;end if;end;
 begin
  perform public.chisel_credit_purchase('SANDBOX','PLAY_STORE',prefix||':a',prefix||':e3',other_user,'chisel_credits_10','grant',repeat('c',64));raise exception 'expected owner conflict';
 exception when others then if sqlerrm<>'purchase_owner_conflict' then raise;end if;end;
 perform public.chisel_credit_purchase('SANDBOX','PLAY_STORE',prefix||':b',prefix||':e4',u,'chisel_credits_70','revoke',repeat('d',64));
 perform public.chisel_credit_purchase('SANDBOX','PLAY_STORE',prefix||':b',prefix||':e5',u,'chisel_credits_70','grant',repeat('e',64));
 select balance into bal from public.chisel_credit_accounts where user_id=u and environment='SANDBOX';if bal<>10 then raise exception 'refund-before-purchase resurrected credit';end if;
 v:=public.chisel_credit_reserve(u,'SANDBOX',r,'standard',repeat('1',64));job:=(v#>>'{job,id}')::uuid;if v->>'fresh'<>'true' then raise exception 'no reservation';end if;
 v:=public.chisel_credit_reserve(u,'SANDBOX',r,'standard',repeat('1',64));if v->>'fresh'<>'false' or (v#>>'{job,id}')::uuid<>job then raise exception 'duplicate reserve';end if;
 v:=public.chisel_credit_reserve(u,'SANDBOX',r,'detail',repeat('1',64));if v->>'error'<>'idempotency_conflict' then raise exception 'request conflict failed';end if;
 v:=public.chisel_credit_reserve(u,'SANDBOX',gen_random_uuid(),'detail',repeat('1',64));if v->>'error'<>'job_in_progress' then raise exception 'concurrent pending accepted';end if;
 if not public.chisel_credit_start(job) or public.chisel_credit_start(job) then raise exception 'provider duplicate start';end if;
 select balance into bal from public.chisel_credit_accounts where user_id=u and environment='SANDBOX';if bal<>9 then raise exception 'wrong debit';end if;
 select reserved_micros into budget from public.chisel_credit_budget where environment='SANDBOX' and day=(now() at time zone 'UTC')::date;
 perform public.chisel_credit_finish(job,'failed',null,null,'fixture_failure');perform public.chisel_credit_finish(job,'failed',null,null,'fixture_failure');
 select balance into bal from public.chisel_credit_accounts where user_id=u and environment='SANDBOX';if bal<>10 then raise exception 'double or absent refund';end if;
 if(select reserved_micros from public.chisel_credit_budget where environment='SANDBOX' and day=(now() at time zone 'UTC')::date)<>budget then raise exception 'failed call budget refunded';end if;
 v:=public.chisel_credit_reserve(u,'SANDBOX',gen_random_uuid(),'detail',repeat('2',64));job:=(v#>>'{job,id}')::uuid;
 begin perform public.chisel_credit_finish(job,'succeeded',10000,'other-user/result.jpg');raise exception 'expected path block';exception when others then if sqlerrm<>'invalid_output_path' then raise;end if;end;
 perform public.chisel_credit_finish(job,'succeeded',10000,'SANDBOX/'||u||'/'||job||'.jpg');
 perform public.chisel_credit_finish(job,'failed',null,null,'late_failure');
 select balance into bal from public.chisel_credit_accounts where user_id=u and environment='SANDBOX';if bal<>7 then raise exception 'settled job refunded later';end if;
 perform public.chisel_credit_purchase('SANDBOX','PLAY_STORE',prefix||':a',prefix||':e6',u,'chisel_credits_10','revoke',repeat('f',64));
 select balance into bal from public.chisel_credit_accounts where user_id=u and environment='SANDBOX';if bal<>-3 then raise exception 'spent purchase refund not reconciled';end if;
 v:=public.chisel_credit_reserve(u,'SANDBOX',gen_random_uuid(),'standard',repeat('3',64));if v->>'error'<>'insufficient_credits' then raise exception 'debt can generate';end if;
 perform public.chisel_credit_purchase('SANDBOX','PLAY_STORE',prefix||':c',prefix||':e7',u,'chisel_credits_10','grant',repeat('a',64));
 v:=public.chisel_credit_reserve(u,'SANDBOX',gen_random_uuid(),'standard',repeat('4',64));job:=(v#>>'{job,id}')::uuid;
 update public.chisel_credit_jobs set updated_at=now()-interval '11 minutes' where id=job;
 if public.chisel_credit_reconcile(u,'SANDBOX')<>1 or public.chisel_credit_reconcile(u,'SANDBOX')<>0 then raise exception 'stale job reconciliation';end if;
 v:=public.chisel_credit_reserve(u,'SANDBOX',gen_random_uuid(),'standard',repeat('5',64));job:=(v#>>'{job,id}')::uuid;
 perform public.chisel_credit_finish(job,'succeeded',999999,'SANDBOX/'||u||'/'||job||'.jpg');
 if(select renders_enabled from public.chisel_credit_config where environment='SANDBOX')then raise exception 'cost spike not stopped';end if;
 v:=public.chisel_credit_reserve(u,'PRODUCTION',gen_random_uuid(),'standard',repeat('6',64));if v->>'error'<>'service_disabled' then raise exception 'production enabled by sandbox';end if;
 if exists(select 1 from public.chisel_credit_accounts where user_id=u and environment='PRODUCTION') then raise exception 'sandbox polluted production';end if;
 if has_table_privilege('authenticated','public.chisel_credit_accounts','SELECT') or has_table_privilege('anon','public.chisel_credit_jobs','INSERT') then raise exception 'client table permissions too broad';end if;
 if has_function_privilege('authenticated','public.chisel_credit_reserve(uuid,text,uuid,text,text)','EXECUTE') or not has_function_privilege('service_role','public.chisel_credit_reserve(uuid,text,uuid,text,text)','EXECUTE') then raise exception 'RPC permissions wrong';end if;
 if(select public from storage.buckets where id='chisel-credit-output') then raise exception 'public output bucket';end if;
 insert into credit_test_result values('PASS: event/transaction dedupe, conflicting owner/event, refund-before-grant, atomic reserve, once-only worker claim/refund, cost budget, private output path, late settlement, refund debt, stale-job reconciliation, cost circuit breaker, sandbox isolation, role restrictions, private bucket');
end $$;
select * from credit_test_result;
rollback;
