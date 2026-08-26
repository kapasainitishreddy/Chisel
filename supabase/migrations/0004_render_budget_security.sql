-- Reproducible, server-only cost controls for the photoreal render endpoint.
-- Both per-identity and global daily budgets are checked and incremented in one
-- transaction so quota failures cannot be raced into extra Replicate spend.

create table if not exists public.render_global_counts (
  day date primary key,
  count integer not null default 0 check (count >= 0)
);

alter table public.render_global_counts enable row level security;
revoke all on table public.render_counts from public, anon, authenticated;
revoke all on table public.render_global_counts from public, anon, authenticated;

create or replace function public.consume_render_budget(
  p_identity_key text,
  p_day date,
  p_identity_limit integer,
  p_global_limit integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  identity_count integer;
  global_count integer;
begin
  if p_identity_key is null or length(p_identity_key) < 3 or length(p_identity_key) > 200 then
    raise exception 'invalid identity key';
  end if;
  if p_day is null then
    raise exception 'invalid day';
  end if;
  if p_identity_limit < 1 or p_identity_limit > 1000 then
    raise exception 'invalid identity limit';
  end if;
  if p_global_limit < 1 or p_global_limit > 100000 then
    raise exception 'invalid global limit';
  end if;

  insert into public.render_counts (device_id, day, count)
  values (p_identity_key, p_day, 0)
  on conflict (device_id, day) do nothing;

  insert into public.render_global_counts (day, count)
  values (p_day, 0)
  on conflict (day) do nothing;

  select count into identity_count
    from public.render_counts
    where device_id = p_identity_key and day = p_day
    for update;

  select count into global_count
    from public.render_global_counts
    where day = p_day
    for update;

  if identity_count >= p_identity_limit then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'identity_limit',
      'remaining', 0,
      'global_remaining', greatest(0, p_global_limit - global_count)
    );
  end if;

  if global_count >= p_global_limit then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'global_budget',
      'remaining', greatest(0, p_identity_limit - identity_count),
      'global_remaining', 0
    );
  end if;

  update public.render_counts
    set count = count + 1
    where device_id = p_identity_key and day = p_day
    returning count into identity_count;

  update public.render_global_counts
    set count = count + 1
    where day = p_day
    returning count into global_count;

  return jsonb_build_object(
    'allowed', true,
    'reason', null,
    'remaining', greatest(0, p_identity_limit - identity_count),
    'global_remaining', greatest(0, p_global_limit - global_count)
  );
end;
$$;

revoke all on function public.consume_render_budget(text, date, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_render_budget(text, date, integer, integer)
  to service_role;
