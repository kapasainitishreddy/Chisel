-- Account lifecycle: all mutation and cleanup functions are service-role only.
create table public.chisel_account_deletions (
 user_id uuid primary key,
 anonymous_id uuid not null default gen_random_uuid(),
 requested_at timestamptz not null default now(),
 completed_at timestamptz
);
alter table public.chisel_account_deletions enable row level security;
revoke all on public.chisel_account_deletions from public,anon,authenticated;
grant all on public.chisel_account_deletions to service_role;

create function public.chisel_reject_deleted_account() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from public.chisel_account_deletions where user_id=new.user_id) then
  -- Clearing already-generated output pointers is necessary for retryable cleanup.
  if tg_table_name='chisel_credit_jobs' and tg_op='UPDATE' then
   if new.output_path is null and (to_jsonb(new)-'output_path')=(to_jsonb(old)-'output_path') then return new;end if;
  end if;
  raise exception 'account_deleting';
 end if;
 return new;
end $$;
create trigger chisel_jobs_deletion_guard before insert or update on public.chisel_credit_jobs for each row execute function public.chisel_reject_deleted_account();
create trigger chisel_accounts_deletion_guard before insert or update on public.chisel_credit_accounts for each row execute function public.chisel_reject_deleted_account();
create trigger chisel_receipts_deletion_guard before insert or update on public.chisel_credit_receipts for each row execute function public.chisel_reject_deleted_account();
create trigger chisel_ledger_deletion_guard before insert or update on public.chisel_credit_ledger for each row execute function public.chisel_reject_deleted_account();
create or replace function public.chisel_credit_purchase(p_environment text,p_store text,p_transaction text,p_event text,p_user uuid,p_product text,p_action text,p_fingerprint text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare receipt public.chisel_credit_receipts; product public.chisel_credit_products; previous text; delta integer:=0;
begin
 if p_environment is null or p_store is null or p_action is null or p_transaction is null or p_event is null or p_fingerprint is null or p_environment not in ('PRODUCTION','SANDBOX') or p_store<>'PLAY_STORE' or p_action not in ('grant','revoke') or p_user is null or length(p_transaction) not between 1 and 256 or length(p_event) not between 1 and 200 or p_fingerprint !~ '^[a-f0-9]{64}$' then raise exception 'invalid_purchase'; end if;
 perform pg_advisory_xact_lock(hashtextextended('chisel-credit:'||p_environment,0));
 if exists(select 1 from public.chisel_account_deletions where user_id=p_user) then return jsonb_build_object('ignored',true,'deleted_account',true);end if;
 select fingerprint into previous from public.chisel_credit_events where environment=p_environment and event_id=p_event;
 if found then
  if previous<>p_fingerprint then raise exception 'event_conflict'; end if;
  return jsonb_build_object('duplicate',true);
 end if;
 select * into product from public.chisel_credit_products where product_id=p_product;
 if not found then raise exception 'unknown_product'; end if;
 select * into receipt from public.chisel_credit_receipts where environment=p_environment and store=p_store and transaction_id=p_transaction;
 if found then
  if receipt.user_id<>p_user or receipt.product_id<>p_product then raise exception 'purchase_owner_conflict'; end if;
  if p_action='revoke' and receipt.state='granted' then
   delta:=-receipt.granted_credits;
   update public.chisel_credit_receipts set state='revoked' where environment=p_environment and store=p_store and transaction_id=p_transaction;
  end if;
 else
  -- A refund arriving first creates a tombstone. A delayed grant never restores it.
  delta:=case when p_action='grant' then product.credits else 0 end;
  insert into public.chisel_credit_receipts values(p_environment,p_store,p_transaction,p_user,p_product,case when p_action='grant' then 'granted' else 'revoked' end,product.credits);
 end if;
 insert into public.chisel_credit_accounts(user_id,environment) values(p_user,p_environment) on conflict do nothing;
 if delta<>0 then
  update public.chisel_credit_accounts set balance=balance+delta,updated_at=now() where user_id=p_user and environment=p_environment;
  insert into public.chisel_credit_ledger(user_id,environment,entry_key,delta,kind) values(p_user,p_environment,p_store||':'||p_transaction||':'||p_action,delta,p_action);
 end if;
 insert into public.chisel_credit_events(environment,event_id,fingerprint) values(p_environment,p_event,p_fingerprint);
 return jsonb_build_object('duplicate',false,'delta',delta);
end $$;

create or replace function public.chisel_credit_reserve(p_user uuid,p_environment text,p_request uuid,p_mode text,p_digest text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare job public.chisel_credit_jobs; config public.chisel_credit_config; tariff public.chisel_credit_modes; bal bigint; used bigint; today date:=(now() at time zone 'UTC')::date;
begin
 if p_user is null or p_request is null or p_digest is null or p_environment is null or p_mode is null or p_digest !~ '^[a-f0-9]{64}$' then raise exception 'invalid_request'; end if;
 perform pg_advisory_xact_lock(hashtextextended('chisel-credit:'||p_environment,0));
 if exists(select 1 from public.chisel_account_deletions where user_id=p_user) then return jsonb_build_object('error','account_deleting');end if;
 select * into job from public.chisel_credit_jobs where user_id=p_user and environment=p_environment and request_id=p_request;
 if found then
  if job.input_digest<>p_digest or job.mode<>p_mode then return jsonb_build_object('error','idempotency_conflict'); end if;
  return jsonb_build_object('fresh',false,'job',to_jsonb(job));
 end if;
 select * into config from public.chisel_credit_config where environment=p_environment;
 if not found or not config.renders_enabled or not config.costs_verified then return jsonb_build_object('error','service_disabled'); end if;
 select * into tariff from public.chisel_credit_modes where mode=p_mode;
 if not found then return jsonb_build_object('error','invalid_quality'); end if;
 if exists(select 1 from public.chisel_credit_jobs where user_id=p_user and environment=p_environment and status in ('reserved','processing')) then return jsonb_build_object('error','job_in_progress'); end if;
 select balance into bal from public.chisel_credit_accounts where user_id=p_user and environment=p_environment;
 if coalesce(bal,0)<tariff.credits then return jsonb_build_object('error','insufficient_credits'); end if;
 insert into public.chisel_credit_budget(environment,day) values(p_environment,today) on conflict do nothing;
 select reserved_micros into used from public.chisel_credit_budget where environment=p_environment and day=today;
 if used+tariff.reserve_micros>config.daily_budget_micros then return jsonb_build_object('error','service_budget_reached'); end if;
 insert into public.chisel_credit_jobs(user_id,environment,request_id,input_digest,mode,credits,reserved_micros)
 values(p_user,p_environment,p_request,p_digest,p_mode,tariff.credits,tariff.reserve_micros) returning * into job;
 update public.chisel_credit_accounts set balance=balance-tariff.credits,updated_at=now() where user_id=p_user and environment=p_environment;
 update public.chisel_credit_budget set reserved_micros=reserved_micros+tariff.reserve_micros where environment=p_environment and day=today;
 insert into public.chisel_credit_ledger(user_id,environment,entry_key,delta,kind) values(p_user,p_environment,'reserve:'||job.id,-tariff.credits,'reserve');
 return jsonb_build_object('fresh',true,'job',to_jsonb(job));
end $$;
create function public.chisel_begin_account_deletion(p_user uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare paths jsonb; count integer;
begin
 if p_user is null then raise exception 'invalid_user';end if;
 perform pg_advisory_xact_lock(hashtextextended('chisel-credit:PRODUCTION',0));
 perform pg_advisory_xact_lock(hashtextextended('chisel-credit:SANDBOX',0));
 if not exists(select 1 from public.chisel_account_deletions where user_id=p_user) then
  perform public.chisel_credit_reconcile(p_user,'PRODUCTION');perform public.chisel_credit_reconcile(p_user,'SANDBOX');
 end if;
 if exists(select 1 from public.chisel_credit_jobs where user_id=p_user and status in ('reserved','processing')) then return jsonb_build_object('state','active_jobs');end if;
 insert into public.chisel_account_deletions(user_id) values(p_user) on conflict do nothing;
 select count(*) into count from public.chisel_credit_jobs where user_id=p_user and output_path is not null;
 select coalesce(jsonb_agg(output_path),'[]'::jsonb) into paths from (select output_path from public.chisel_credit_jobs where user_id=p_user and output_path is not null order by id limit 100) as batch;
 return jsonb_build_object('state','ready','paths',paths,'remaining',count>100);
end $$;
create function public.chisel_erase_account_data(p_user uuid) returns boolean
language plpgsql security definer set search_path='' as $$
declare anonymous uuid;
begin
 perform pg_advisory_xact_lock(hashtextextended('chisel-credit:PRODUCTION',0));perform pg_advisory_xact_lock(hashtextextended('chisel-credit:SANDBOX',0));
 select anonymous_id into anonymous from public.chisel_account_deletions where user_id=p_user;
 if not found then raise exception 'deletion_not_started';end if;
 if exists(select 1 from public.chisel_credit_jobs where user_id=p_user and (output_path is not null or status in ('reserved','processing'))) then raise exception 'cleanup_incomplete';end if;
 -- Keep transaction dedupe/refund bookkeeping while unlinking it from the auth identity.
 update public.chisel_credit_receipts set user_id=anonymous where user_id=p_user;
 update public.chisel_credit_ledger set user_id=anonymous where user_id=p_user;
 delete from public.chisel_credit_jobs where user_id=p_user;
 delete from public.chisel_credit_accounts where user_id=p_user;
 delete from public.entitlements where id=p_user::text;
 return true;
end $$;
create function public.chisel_complete_account_deletion(p_user uuid) returns boolean
language plpgsql security definer set search_path='' as $$
begin
 update public.chisel_account_deletions set completed_at=coalesce(completed_at,now()) where user_id=p_user;
 return found;
end $$;
create function public.chisel_recover_stale_jobs() returns integer
language plpgsql security definer set search_path='' as $$
declare job record; recovered integer:=0;
begin
 perform pg_advisory_xact_lock(hashtextextended('chisel-credit:PRODUCTION',0));perform pg_advisory_xact_lock(hashtextextended('chisel-credit:SANDBOX',0));
 for job in select id from public.chisel_credit_jobs where status in ('reserved','processing') and updated_at<now()-interval '10 minutes' order by updated_at limit 100 loop
  perform public.chisel_credit_finish(job.id,'failed',null,null,'render_expired');recovered:=recovered+1;
 end loop;
 delete from public.looks_jobs where expires_at<now();
 return recovered;
end $$;
revoke all on function public.chisel_reject_deleted_account() from public,anon,authenticated;
revoke all on function public.chisel_begin_account_deletion(uuid) from public,anon,authenticated;
revoke all on function public.chisel_erase_account_data(uuid) from public,anon,authenticated;
revoke all on function public.chisel_complete_account_deletion(uuid) from public,anon,authenticated;
revoke all on function public.chisel_recover_stale_jobs() from public,anon,authenticated;
grant execute on function public.chisel_begin_account_deletion(uuid),public.chisel_erase_account_data(uuid),public.chisel_complete_account_deletion(uuid),public.chisel_recover_stale_jobs() to service_role;
