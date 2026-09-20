-- Paid editing is opt-in and disabled until store/provider readiness is reviewed.
-- No client role can mutate a wallet, purchase receipt, job, or ledger entry.
create table if not exists public.chisel_credit_config (
 environment text primary key check (environment in ('PRODUCTION','SANDBOX')),
 sales_enabled boolean not null default false,
 renders_enabled boolean not null default false,
 costs_verified boolean not null default false,
 daily_budget_micros bigint not null default 5000000 check(daily_budget_micros between 0 and 100000000),
 model text not null default 'gpt-image-2.5-sunburst'
);
insert into public.chisel_credit_config(environment) values ('PRODUCTION'),('SANDBOX') on conflict do nothing;
create table if not exists public.chisel_credit_products (
 product_id text primary key, credits integer not null check(credits>0), usd_cents integer not null check(usd_cents>0)
);
insert into public.chisel_credit_products values ('chisel_credits_10',10,399),('chisel_credits_30',30,999),('chisel_credits_70',70,1999) on conflict do nothing;
create table if not exists public.chisel_credit_modes (
 mode text primary key, credits integer not null check(credits>0), reserve_micros bigint not null check(reserve_micros>0)
);
insert into public.chisel_credit_modes values ('standard',1,130000),('detail',3,390000) on conflict do nothing;
create table if not exists public.chisel_credit_accounts (
 user_id uuid not null, environment text not null references public.chisel_credit_config,
 balance bigint not null default 0, updated_at timestamptz not null default now(), primary key(user_id,environment)
);
create table if not exists public.chisel_credit_receipts (
 environment text not null, store text not null, transaction_id text not null,
 user_id uuid not null, product_id text not null references public.chisel_credit_products,
 state text not null check(state in ('granted','revoked')), granted_credits integer not null,
 primary key(environment,store,transaction_id)
);
create table if not exists public.chisel_credit_events (
 environment text not null, event_id text not null, fingerprint text not null, created_at timestamptz not null default now(), primary key(environment,event_id)
);
create table if not exists public.chisel_credit_jobs (
 id uuid primary key default gen_random_uuid(), user_id uuid not null, environment text not null,
 request_id uuid not null, input_digest text not null, mode text not null references public.chisel_credit_modes,
 credits integer not null, reserved_micros bigint not null,
 status text not null default 'reserved' check(status in ('reserved','processing','succeeded','failed')),
 refunded boolean not null default false, output_path text, actual_cost_micros bigint,
 error_code text, provider_request_id text, created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(), expires_at timestamptz not null default now()+interval '24 hours',
 unique(user_id,environment,request_id)
);
create index if not exists chisel_credit_jobs_owner on public.chisel_credit_jobs(user_id,environment,created_at desc);
create index if not exists chisel_credit_jobs_pending on public.chisel_credit_jobs(environment,updated_at) where status in ('reserved','processing');
create table if not exists public.chisel_credit_ledger (
 id bigint generated always as identity primary key, user_id uuid not null, environment text not null,
 entry_key text not null, delta bigint not null, kind text not null,
 created_at timestamptz not null default now(), unique(environment,entry_key)
);
create index if not exists chisel_credit_ledger_owner on public.chisel_credit_ledger(user_id,environment,id desc);
create table if not exists public.chisel_credit_budget (
 environment text not null, day date not null, reserved_micros bigint not null default 0, primary key(environment,day)
);

create or replace function public.chisel_credit_purchase(p_environment text,p_store text,p_transaction text,p_event text,p_user uuid,p_product text,p_action text,p_fingerprint text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare receipt public.chisel_credit_receipts; product public.chisel_credit_products; previous text; delta integer:=0;
begin
 if p_environment is null or p_store is null or p_action is null or p_transaction is null or p_event is null or p_fingerprint is null or p_environment not in ('PRODUCTION','SANDBOX') or p_store<>'PLAY_STORE' or p_action not in ('grant','revoke') or p_user is null or length(p_transaction) not between 1 and 256 or length(p_event) not between 1 and 200 or p_fingerprint !~ '^[a-f0-9]{64}$' then raise exception 'invalid_purchase'; end if;
 perform pg_advisory_xact_lock(hashtextextended('chisel-credit:'||p_environment,0));
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

create or replace function public.chisel_credit_start(p_job uuid)
returns boolean language plpgsql security definer set search_path='' as $$
declare env text; changed integer;
begin
 select environment into env from public.chisel_credit_jobs where id=p_job;if not found then return false;end if;
 perform pg_advisory_xact_lock(hashtextextended('chisel-credit:'||env,0));
 update public.chisel_credit_jobs set status='processing',updated_at=now() where id=p_job and status='reserved' and created_at>now()-interval '10 minutes';
 get diagnostics changed=row_count;return changed=1;
end $$;

create or replace function public.chisel_credit_finish(p_job uuid,p_status text,p_cost bigint default null,p_path text default null,p_error text default null,p_provider_request text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare job public.chisel_credit_jobs; env text;
begin
 if p_status is null or p_status not in ('succeeded','failed') or p_cost<0 then raise exception 'invalid_settlement'; end if;
 select environment into env from public.chisel_credit_jobs where id=p_job;if not found then raise exception 'job_not_found';end if;
 perform pg_advisory_xact_lock(hashtextextended('chisel-credit:'||env,0));
 select * into job from public.chisel_credit_jobs where id=p_job;
 if job.status in ('succeeded','failed') then return to_jsonb(job);end if;
 if p_status='succeeded' and (p_path is null or p_path<>job.environment||'/'||job.user_id||'/'||job.id||'.jpg') then raise exception 'invalid_output_path';end if;
 if p_status='failed' and not job.refunded then
  update public.chisel_credit_accounts set balance=balance+job.credits,updated_at=now() where user_id=job.user_id and environment=job.environment;
  insert into public.chisel_credit_ledger(user_id,environment,entry_key,delta,kind) values(job.user_id,job.environment,'refund:'||job.id,job.credits,'render_refund');
 end if;
 -- Unknown or unexpectedly high measured costs trip the server kill switch.
 if p_status='succeeded' and (p_cost is null or p_cost>job.reserved_micros) then update public.chisel_credit_config set renders_enabled=false,costs_verified=false where environment=env;end if;
 update public.chisel_credit_jobs set status=p_status,refunded=p_status='failed',actual_cost_micros=p_cost,output_path=case when p_status='succeeded' then p_path else null end,error_code=p_error,provider_request_id=p_provider_request,updated_at=now() where id=p_job returning * into job;
 -- Attempt budget is intentionally not refunded: failed calls may still incur provider cost.
 return to_jsonb(job);
end $$;

create or replace function public.chisel_credit_reconcile(p_user uuid,p_environment text)
returns integer language plpgsql security definer set search_path='' as $$
declare job record; count integer:=0;
begin
 perform pg_advisory_xact_lock(hashtextextended('chisel-credit:'||p_environment,0));
 for job in select id from public.chisel_credit_jobs where user_id=p_user and environment=p_environment and status in ('reserved','processing') and updated_at<now()-interval '10 minutes' loop
  perform public.chisel_credit_finish(job.id,'failed',null,null,'render_expired');count:=count+1;
 end loop;return count;
end $$;

-- Private output storage; users retrieve bytes only through the authenticated gateway.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('chisel-credit-output','chisel-credit-output',false,8000000,array['image/jpeg']) on conflict(id) do nothing;

do $$ declare t text; f record; begin
 foreach t in array array['chisel_credit_config','chisel_credit_products','chisel_credit_modes','chisel_credit_accounts','chisel_credit_receipts','chisel_credit_events','chisel_credit_jobs','chisel_credit_ledger','chisel_credit_budget'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from public,anon,authenticated',t);
  execute format('grant all on public.%I to service_role',t);
 end loop;
 for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on p.pronamespace=n.oid where n.nspname='public' and p.proname in ('chisel_credit_purchase','chisel_credit_reserve','chisel_credit_start','chisel_credit_finish','chisel_credit_reconcile') loop
  execute format('revoke all on function %s from public,anon,authenticated',f.signature);
  execute format('grant execute on function %s to service_role',f.signature);
 end loop;
end $$;
grant usage,select on sequence public.chisel_credit_ledger_id_seq to service_role;
