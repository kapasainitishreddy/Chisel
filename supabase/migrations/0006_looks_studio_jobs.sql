create table if not exists public.looks_settings (id boolean primary key default true check (id), enabled boolean not null default false, daily_budget integer not null default 5 check (daily_budget between 1 and 1000), per_device_limit integer not null default 2 check (per_device_limit between 1 and 100));
insert into public.looks_settings(id) values (true) on conflict do nothing;
create table if not exists public.looks_credits (identity_key text not null, day date not null, used integer not null default 0 check (used>=0), primary key(identity_key,day));
create table if not exists public.looks_attempts (day date primary key, used integer not null default 0 check (used>=0));
create table if not exists public.looks_jobs (id uuid primary key default gen_random_uuid(), identity_key text not null, request_id uuid not null, token_hash text not null, input_digest text not null, day date not null, status text not null default 'submitting' check (status in ('submitting','starting','processing','canceling','succeeded','failed','canceled','unknown')), provider_id text, image_url text, error_code text, refunded boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), expires_at timestamptz not null default (now()+interval '1 hour'), unique(identity_key,request_id));
alter table public.looks_settings enable row level security;
alter table public.looks_credits enable row level security;
alter table public.looks_attempts enable row level security;
alter table public.looks_jobs enable row level security;
revoke all on public.looks_settings,public.looks_credits,public.looks_attempts,public.looks_jobs from public,anon,authenticated;
grant all on public.looks_settings,public.looks_credits,public.looks_attempts,public.looks_jobs to service_role;
create index if not exists looks_jobs_expiration on public.looks_jobs(expires_at);
create or replace function public.reserve_look_job(p_identity_key text,p_request_id uuid,p_token_hash text,p_input_digest text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare j public.looks_jobs; cfg public.looks_settings; d date := (now() at time zone 'UTC')::date; personal integer; total integer;
begin
 if p_identity_key !~ '^[a-f0-9]{64}$' or p_token_hash !~ '^[a-f0-9]{64}$' or p_input_digest !~ '^[a-f0-9]{64}$' or p_request_id is null then raise exception 'invalid_request'; end if;
 perform pg_advisory_xact_lock(hashtextextended('chisel-looks:'||d::text,0));
 select * into j from public.looks_jobs where identity_key=p_identity_key and request_id=p_request_id;
 if found then
  if j.input_digest<>p_input_digest or j.token_hash<>p_token_hash then return jsonb_build_object('error','idempotency_conflict'); end if;
  return jsonb_build_object('fresh',false,'job',to_jsonb(j));
 end if;
 select * into cfg from public.looks_settings where id=true;
 if not found or not cfg.enabled then return jsonb_build_object('error','service_disabled'); end if;
 insert into public.looks_credits(identity_key,day) values(p_identity_key,d) on conflict do nothing;
 insert into public.looks_attempts(day) values(d) on conflict do nothing;
 select used into personal from public.looks_credits where identity_key=p_identity_key and day=d for update;
 select used into total from public.looks_attempts where day=d for update;
 if total>=cfg.daily_budget then return jsonb_build_object('error','service_budget_reached'); end if;
 if personal>=cfg.per_device_limit then return jsonb_build_object('error','free_limit_reached'); end if;
 update public.looks_credits set used=used+1 where identity_key=p_identity_key and day=d;
 update public.looks_attempts set used=used+1 where day=d;
 insert into public.looks_jobs(identity_key,request_id,token_hash,input_digest,day) values(p_identity_key,p_request_id,p_token_hash,p_input_digest,d) returning * into j;
 delete from public.looks_jobs where expires_at < now()-interval '1 day';
 return jsonb_build_object('fresh',true,'remaining',cfg.per_device_limit-personal-1,'job',to_jsonb(j));
end; $$;
create or replace function public.finish_look_job(p_job_id uuid,p_status text,p_image_url text default null,p_error text default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare j public.looks_jobs;
begin
 if p_status not in ('succeeded','failed','canceled','unknown') then raise exception 'invalid_status'; end if;
 select * into j from public.looks_jobs where id=p_job_id for update;
 if not found then raise exception 'job_not_found'; end if;
 if j.status in ('succeeded','failed','canceled') then return to_jsonb(j); end if;
 if p_status='succeeded' and (p_image_url is null or p_image_url !~ '^https://([a-z0-9-]+\.)*replicate\.delivery/') then raise exception 'invalid_output'; end if;
 if p_status in ('failed','canceled') and not j.refunded then
  update public.looks_credits set used=greatest(0,used-1) where identity_key=j.identity_key and day=j.day;
  j.refunded:=true;
 end if;
 update public.looks_jobs set status=p_status,image_url=p_image_url,error_code=p_error,refunded=j.refunded,updated_at=now() where id=j.id returning * into j;
 return to_jsonb(j);
end; $$;
revoke all on function public.reserve_look_job(text,uuid,text,text) from public,anon,authenticated;
revoke all on function public.finish_look_job(uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.reserve_look_job(text,uuid,text,text) to service_role;
grant execute on function public.finish_look_job(uuid,text,text,text) to service_role;
