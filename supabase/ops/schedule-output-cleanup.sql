-- Operator-only installation AFTER the lifecycle migration/functions are deployed.
-- Configure two Vault secrets using secure administration, not this file:
-- chisel_cleanup_url: https://<project>.supabase.co/functions/v1/output-cleanup
-- chisel_cleanup_token: same value as Edge Function CHISEL_CLEANUP_TOKEN.
-- Enable pg_cron and pg_net in the project's extension administration first.
-- Validate readiness before enabling paid services; no schedule is installed by the migration.
do $$
begin
 if not exists(select 1 from vault.decrypted_secrets where name='chisel_cleanup_url' and decrypted_secret ~ '^https://[a-z0-9]{20}\.supabase\.co/functions/v1/output-cleanup$') or not exists(select 1 from vault.decrypted_secrets where name='chisel_cleanup_token' and length(decrypted_secret)>=32) then
  raise exception 'Secure cleanup configuration is incomplete';
 end if;
end $$;
select cron.schedule('chisel-output-cleanup','*/15 * * * *', $schedule$
 select net.http_post(
  url := (select decrypted_secret from vault.decrypted_secrets where name='chisel_cleanup_url' limit 1),
  headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||(select decrypted_secret from vault.decrypted_secrets where name='chisel_cleanup_token' limit 1)),
  body := '{}'::jsonb,
  timeout_milliseconds := 10000
 );
$schedule$);
