-- supabase/migrations/0002_entitlements.sql
create table if not exists public.entitlements (
  id text primary key,                    -- RevenueCat app_user_id (paying) or device_id (free-tier fallback, not written here)
  tier text not null default 'free',      -- 'free' | 'trial' | 'subscribed'
  trial_credits_remaining integer not null default 0,
  subscription_active_until timestamptz,
  monthly_render_count integer not null default 0,
  monthly_reset_at date,
  updated_at timestamptz not null default now()
);

alter table public.entitlements enable row level security;
-- No policies: only the service-role key (used server-side by rc-webhook and
-- render-lookmax) can read/write this table, same pattern as render_counts.
