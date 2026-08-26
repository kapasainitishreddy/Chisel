const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = path.resolve(__dirname, '..');
const helperUrl = pathToFileURL(path.resolve(root, '../supabase/functions/rc-webhook/security.mjs')).href;
let security;

test.before(async () => {
  if (!globalThis.crypto) globalThis.crypto = crypto.webcrypto;
  security = await import(helperUrl);
});

function signatureFor(rawBody, secret, timestampSeconds) {
  const digest = crypto
    .createHmac('sha256', secret)
    .update(`${timestampSeconds}.${rawBody}`)
    .digest('hex');
  return `t=${timestampSeconds},v1=${digest}`;
}

test('RevenueCat HMAC accepts exact fresh raw body and rejects tampering', async () => {
  const secret = 'unit-test-signing-secret-that-is-long-enough';
  const nowMs = 1_800_000_000_000;
  const timestamp = Math.floor(nowMs / 1000);
  const rawBody = JSON.stringify({ api_version: '1.0', event: { id: 'evt_1' } });
  const signatureHeader = signatureFor(rawBody, secret, timestamp);

  assert.equal(await security.verifyRevenueCatSignature({ rawBody, signatureHeader, secret, nowMs }), true);
  assert.equal(await security.verifyRevenueCatSignature({ rawBody: `${rawBody} `, signatureHeader, secret, nowMs }), false);
});

test('RevenueCat HMAC rejects stale and malformed signatures', async () => {
  const secret = 'unit-test-signing-secret-that-is-long-enough';
  const nowMs = 1_800_000_000_000;
  const staleTimestamp = Math.floor((nowMs - 10 * 60 * 1000) / 1000);
  const rawBody = '{}';

  assert.equal(await security.verifyRevenueCatSignature({
    rawBody,
    signatureHeader: signatureFor(rawBody, secret, staleTimestamp),
    secret,
    nowMs,
  }), false);
  assert.equal(security.parseRevenueCatSignature('t=nope,v1=abcd'), null);
  assert.equal(security.parseRevenueCatSignature(null), null);
});

test('RevenueCat event schema requires durable replay and ordering fields', () => {
  const valid = {
    id: 'evt_unique_123',
    type: 'RENEWAL',
    app_user_id: 'rc-user-1',
    event_timestamp_ms: 1_800_000_000_000,
    expiration_at_ms: 1_802_000_000_000,
    period_type: 'NORMAL',
  };
  assert.equal(security.validateRevenueCatEvent(valid), true);
  assert.equal(security.validateRevenueCatEvent({ ...valid, id: '' }), false);
  assert.equal(security.validateRevenueCatEvent({ ...valid, event_timestamp_ms: 1.25 }), false);
  assert.equal(security.validateRevenueCatEvent({ ...valid, app_user_id: 'x'.repeat(257) }), false);
});

test('RevenueCat lifecycle mapping preserves cancellation access and revokes only on expiration', () => {
  assert.equal(security.entitlementActionForEvent({ type: 'INITIAL_PURCHASE', period_type: 'TRIAL' }), 'grant_trial');
  assert.equal(security.entitlementActionForEvent({ type: 'INITIAL_PURCHASE', period_type: 'NORMAL' }), 'grant_subscribed');
  assert.equal(security.entitlementActionForEvent({ type: 'RENEWAL', period_type: 'NORMAL' }), 'grant_subscribed');
  assert.equal(security.entitlementActionForEvent({ type: 'CANCELLATION' }), 'preserve');
  assert.equal(security.entitlementActionForEvent({ type: 'EXPIRATION' }), 'revoke');
  assert.equal(security.entitlementActionForEvent({ type: 'BILLING_ISSUE' }), 'noop');
});

test('RevenueCat body reader enforces declared and streamed size ceilings', async () => {
  const declared = new Request('https://example.test/webhook', {
    method: 'POST',
    headers: { 'content-length': '2048' },
    body: '{}',
  });
  await assert.rejects(() => security.readRequestTextWithLimit(declared, 1024), /body_too_large/);

  const streamed = new Request('https://example.test/webhook', {
    method: 'POST',
    body: 'x'.repeat(1025),
  });
  await assert.rejects(() => security.readRequestTextWithLimit(streamed, 1024), /body_too_large/);

  const accepted = new Request('https://example.test/webhook', {
    method: 'POST',
    body: JSON.stringify({ ok: true }),
  });
  assert.equal(await security.readRequestTextWithLimit(accepted, 1024), '{"ok":true}');
});

test('RevenueCat SQL migration keeps event ids unique and service-role only', () => {
  const sql = fs.readFileSync(path.resolve(root, '../supabase/migrations/0003_revenuecat_webhook_security.sql'), 'utf8');
  assert.match(sql, /event_id text primary key/i);
  assert.match(sql, /on conflict \(event_id\) do nothing/i);
  assert.match(sql, /p_event_timestamp_ms < current_event_timestamp_ms/i);
  assert.match(sql, /p_action = 'preserve'[\s\S]*?update public\.entitlements/i);
  assert.doesNotMatch(sql.match(/p_action = 'preserve'[\s\S]*?elsif p_action = 'revoke'/i)?.[0] || '', /tier\s*=\s*'free'/i);
  assert.match(sql, /revoke all on function[\s\S]*from public, anon, authenticated/i);
  assert.match(sql, /grant execute on function[\s\S]*to service_role/i);
});
