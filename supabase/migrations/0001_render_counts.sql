-- supabase/migrations/0001_render_counts.sql
create table if not exists public.render_counts (
  device_id text not null,
  day date not null,
  count integer not null default 0,
  primary key (device_id, day)
);

alter table public.render_counts enable row level security;
-- No policies defined: only the service-role key (used server-side by the
-- render-lookmax edge function) can read/write this table. No client-side
-- access is intended or possible with the publishable key.
