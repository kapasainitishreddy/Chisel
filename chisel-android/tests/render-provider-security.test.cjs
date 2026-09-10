const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = path.resolve(__dirname, '..');
const helperUrl = pathToFileURL(path.resolve(root, '../supabase/functions/render-lookmax/security.mjs')).href;
let security;

test.before(async () => {
  security = await import(helperUrl);
});

function responseFromBytes(bytes, headers = {}) {
  return new Response(new Uint8Array(bytes), { headers });
}

test('bounded provider JSON accepts a small object and rejects non-objects', async () => {
  const response = new Response(JSON.stringify({ ok: true, output: 'x' }), {
    headers: { 'content-type': 'application/json' },
  });
  assert.deepEqual(await security.readJsonObjectResponseWithLimit(response, 1024), { ok: true, output: 'x' });

  await assert.rejects(
    () => security.readJsonObjectResponseWithLimit(new Response('[1,2,3]'), 1024),
    /provider_invalid_response/,
  );
});

test('bounded provider JSON rejects declared, streamed and malformed lengths', async () => {
  const declared = new Response('{"ok":true}', { headers: { 'content-length': '2048' } });
  await assert.rejects(() => security.readJsonObjectResponseWithLimit(declared, 1024), /provider_response_too_large/);

  const streamed = new Response('x'.repeat(1025));
  await assert.rejects(() => security.readJsonObjectResponseWithLimit(streamed, 1024), /provider_response_too_large/);

  const malformed = new Response('{"ok":true}', { headers: { 'content-length': '1e6' } });
  await assert.rejects(() => security.readJsonObjectResponseWithLimit(malformed, 1024), /provider_invalid_length/);
});

test('bounded provider JSON rejects malformed JSON and invalid UTF-8', async () => {
  await assert.rejects(
    () => security.readJsonObjectResponseWithLimit(new Response('{broken'), 1024),
    /provider_invalid_response/,
  );
  await assert.rejects(
    () => security.readJsonObjectResponseWithLimit(responseFromBytes([0xc3, 0x28]), 1024),
    /provider_invalid_response/,
  );
});

test('Replicate polling URL is pinned to the prediction API', () => {
  assert.equal(
    security.validateReplicatePollUrl('https://api.replicate.com/v1/predictions/abc_123-Z'),
    'https://api.replicate.com/v1/predictions/abc_123-Z',
  );
  for (const unsafe of [
    'http://api.replicate.com/v1/predictions/abc',
    'https://evil.example/v1/predictions/abc',
    'https://api.replicate.com.evil.example/v1/predictions/abc',
    'https://user:pass@api.replicate.com/v1/predictions/abc',
    'https://api.replicate.com/v1/predictions/abc?next=https://evil.example',
    'https://api.replicate.com/v1/predictions/../models',
  ]) {
    assert.equal(security.validateReplicatePollUrl(unsafe), null, unsafe);
  }
});

test('render output URL requires HTTPS and no embedded credentials', () => {
  assert.equal(
    security.validateHttpsOutputUrl('https://replicate.delivery/pbxt/result.jpg'),
    'https://replicate.delivery/pbxt/result.jpg',
  );
  assert.equal(security.validateHttpsOutputUrl('http://replicate.delivery/result.jpg'), null);
  assert.equal(security.validateHttpsOutputUrl('https://user:pass@example.com/result.jpg'), null);
  assert.equal(security.validateHttpsOutputUrl('https://localhost/result.jpg'), null);
});

test('render provider source refuses redirects and never buffers with response.json()', () => {
  const source = fs.readFileSync(path.resolve(root, '../supabase/functions/render-lookmax/index.ts'), 'utf8');
  assert.doesNotMatch(source, /\.json\(\)/);
  assert.match(source, /readJsonObjectResponseWithLimit/);
  assert.match(source, /validateReplicatePollUrl/);
  assert.match(source, /validateHttpsOutputUrl/);
  assert.match(source, /AbortSignal\.timeout\(REVENUECAT_TIMEOUT_MS\)/);
  assert.match(source, /AbortSignal\.timeout\(REPLICATE_CREATE_TIMEOUT_MS\)/);
  assert.match(source, /AbortSignal\.timeout\(REPLICATE_POLL_TIMEOUT_MS\)/);
  assert.ok((source.match(/redirect:\s*'error'/g) || []).length >= 3);
  assert.ok((source.match(/credentials:\s*'omit'/g) || []).length >= 3);
  assert.ok((source.match(/cache:\s*'no-store'/g) || []).length >= 3);
});
