export const MAX_WEBHOOK_BODY_BYTES = 256 * 1024;
export const SIGNATURE_TOLERANCE_MS = 5 * 60 * 1000;

const textEncoder = new TextEncoder();

export function parseRevenueCatSignature(header) {
  if (typeof header !== 'string' || !header.trim()) return null;
  const parts = Object.fromEntries(
    header.split(',').map((part) => {
      const [key, ...rest] = part.trim().split('=');
      return [key, rest.join('=')];
    }),
  );
  const timestamp = Number(parts.t);
  const signature = parts.v1;
  if (!Number.isFinite(timestamp) || !/^[0-9a-f]{64}$/i.test(signature || '')) return null;
  return { timestamp, signature: signature.toLowerCase() };
}

function hexToBytes(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export async function verifyRevenueCatSignature({ rawBody, signatureHeader, secret, nowMs = Date.now(), toleranceMs = SIGNATURE_TOLERANCE_MS }) {
  if (typeof rawBody !== 'string' || typeof secret !== 'string' || secret.length < 32) return false;
  const parsed = parseRevenueCatSignature(signatureHeader);
  if (!parsed) return false;
  if (Math.abs(nowMs - parsed.timestamp * 1000) > toleranceMs) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  return crypto.subtle.verify(
    'HMAC',
    key,
    hexToBytes(parsed.signature),
    textEncoder.encode(`${parsed.timestamp}.${rawBody}`),
  );
}

export async function readRequestTextWithLimit(request, maxBytes = MAX_WEBHOOK_BODY_BYTES) {
  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) throw new Error('body_too_large');
  if (!request.body) return '';

  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) throw new Error('body_too_large');
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(merged);
}

export function validateRevenueCatEvent(event) {
  if (!event || typeof event !== 'object') return false;
  if (typeof event.id !== 'string' || event.id.length < 1 || event.id.length > 160) return false;
  if (typeof event.type !== 'string' || event.type.length < 1 || event.type.length > 64) return false;
  if (typeof event.app_user_id !== 'string' || event.app_user_id.length < 1 || event.app_user_id.length > 256) return false;
  if (!Number.isSafeInteger(event.event_timestamp_ms) || event.event_timestamp_ms < 0) return false;
  if (event.period_type != null && (typeof event.period_type !== 'string' || event.period_type.length > 32)) return false;
  if (event.expiration_at_ms != null && (!Number.isSafeInteger(event.expiration_at_ms) || event.expiration_at_ms < 0)) return false;
  return true;
}

export function entitlementActionForEvent(event) {
  const type = String(event?.type || '').toUpperCase();
  const period = String(event?.period_type || '').toUpperCase();
  const isTrial = period === 'TRIAL' || period === 'INTRO';

  if (type === 'INITIAL_PURCHASE') return isTrial ? 'grant_trial' : 'grant_subscribed';
  if (type === 'RENEWAL' || type === 'UNCANCELLATION') return isTrial ? 'preserve' : 'grant_subscribed';
  if (type === 'CANCELLATION') return 'preserve';
  if (type === 'EXPIRATION') return 'revoke';
  return 'noop';
}
