-- Harden RevenueCat webhook processing with durable idempotency and event ordering.
-- This migration is intentionally server-only: RLS is enabled and no client policy
-- is created; the SECURITY DEFINER RPC is executable only by service_role.

alter table public.entitlements
  add column if not exists last_event_timestamp_ms bigint;

create table if not exists public.revenuecat_webhook_events (
  event_id text primary key,
  event_type text not null,
  app_user_id text not null,
  event_timestamp_ms bigint not null,
  action text not null,
  processed_at timestamptz not null default now()
);

alter table public.revenuecat_webhook_events enable row level security;
revoke all on table public.revenuecat_webhook_events from public, anon, authenticated;

create or replace function public.process_revenuecat_event(
  p_event_id text,
  p_event_type text,
  p_app_user_id text,
  p_event_timestamp_ms bigint,
  p_action text,
  p_expiration_at_ms bigint default null,
  p_trial_credits integer default 15
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_event_id text;
  current_event_timestamp_ms bigint;
  active_until timestamptz;
begin
  if p_event_id is null or length(p_event_id) < 1 or length(p_event_id) > 160 then
    raise exception 'invalid event id';
  end if;
  if p_event_type is null or length(p_event_type) < 1 or length(p_event_type) > 64 then
    raise exception 'invalid event type';
  end if;
  if p_app_user_id is null or length(p_app_user_id) < 1 or length(p_app_user_id) > 256 then
    raise exception 'invalid app user id';
  end if;
  if p_event_timestamp_ms is null or p_event_timestamp_ms < 0 then
    raise exception 'invalid event timestamp';
  end if;
  if p_expiration_at_ms is not null and p_expiration_at_ms < 0 then
    raise exception 'invalid expiration timestamp';
  end if;
  if p_trial_credits < 0 or p_trial_credits > 1000 then
    raise exception 'invalid trial credits';
  end if;
  if p_action not in ('grant_trial', 'grant_subscribed', 'preserve', 'revoke', 'noop') then
    raise exception 'invalid entitlement action';
  end if;

  insert into public.revenuecat_webhook_events (
    event_id, event_type, app_user_id, event_timestamp_ms, action
  ) values (
    p_event_id, p_event_type, p_app_user_id, p_event_timestamp_ms, p_action
  )
  on conflict (event_id) do nothing
  returning event_id into inserted_event_id;

  if inserted_event_id is null then
    return jsonb_build_object('processed', false, 'duplicate', true, 'stale', false);
  end if;

  -- Unknown/no-op RevenueCat event types are recorded for idempotency/audit only.
  -- They must not advance entitlement ordering or change access.
  if p_action = 'noop' then
    return jsonb_build_object('processed', true, 'duplicate', false, 'stale', false);
  end if;

  select last_event_timestamp_ms
    into current_event_timestamp_ms
    from public.entitlements
    where id = p_app_user_id
    for update;

  if current_event_timestamp_ms is not null and p_event_timestamp_ms < current_event_timestamp_ms then
    return jsonb_build_object('processed', false, 'duplicate', false, 'stale', true);
  end if;

  active_until := case
    when p_expiration_at_ms is null then null
    else to_timestamp(p_expiration_at_ms / 1000.0)
  end;

  if p_action = 'grant_trial' then
    insert into public.entitlements (
      id, tier, trial_credits_remaining, subscription_active_until,
      updated_at, last_event_timestamp_ms
    ) values (
      p_app_user_id, 'trial', p_trial_credits, active_until,
      now(), p_event_timestamp_ms
    )
    on conflict (id) do update set
      tier = 'trial',
      trial_credits_remaining = excluded.trial_credits_remaining,
      subscription_active_until = coalesce(excluded.subscription_active_until, public.entitlements.subscription_active_until),
      updated_at = now(),
      last_event_timestamp_ms = excluded.last_event_timestamp_ms;

  elsif p_action = 'grant_subscribed' then
    insert into public.entitlements (
      id, tier, trial_credits_remaining, subscription_active_until,
      monthly_render_count, monthly_reset_at, updated_at, last_event_timestamp_ms
    ) values (
      p_app_user_id, 'subscribed', 0, active_until,
      0, current_date, now(), p_event_timestamp_ms
    )
    on conflict (id) do update set
      tier = 'subscribed',
      trial_credits_remaining = 0,
      subscription_active_until = coalesce(excluded.subscription_active_until, public.entitlements.subscription_active_until),
      monthly_render_count = 0,
      monthly_reset_at = current_date,
      updated_at = now(),
      last_event_timestamp_ms = excluded.last_event_timestamp_ms;

  elsif p_action = 'preserve' then
    -- Cancellation means auto-renew is off, not that paid access ended. Preserve
    -- the current tier and only record the newer expiry/order on an existing row.
    update public.entitlements
      set subscription_active_until = coalesce(active_until, subscription_active_until),
          updated_at = now(),
          last_event_timestamp_ms = p_event_timestamp_ms
      where id = p_app_user_id;

  elsif p_action = 'revoke' then
    insert into public.entitlements (
      id, tier, trial_credits_remaining, subscription_active_until,
      updated_at, last_event_timestamp_ms
    ) values (
      p_app_user_id, 'free', 0, null, now(), p_event_timestamp_ms
    )
    on conflict (id) do update set
      tier = 'free',
      trial_credits_remaining = 0,
      subscription_active_until = null,
      updated_at = now(),
      last_event_timestamp_ms = excluded.last_event_timestamp_ms;
  end if;

  return jsonb_build_object('processed', true, 'duplicate', false, 'stale', false);
end;
$$;

revoke all on function public.process_revenuecat_event(text, text, text, bigint, text, bigint, integer)
  from public, anon, authenticated;
grant execute on function public.process_revenuecat_event(text, text, text, bigint, text, bigint, integer)
  to service_role;
