export const MAX_RENDER_REQUEST_BYTES = 8_500_000;
export const MAX_IMAGE_BYTES = 5_500_000;
export const MAX_PROVIDER_RESPONSE_BYTES = 262_144;

const SAFE_COLORS = new Map([
  ['match', 'preserve the source person’s natural hair colour'],
  ['black', 'use natural black hair colour'],
  ['dark brown', 'use natural dark brown hair colour'],
  ['brown', 'use natural medium brown hair colour'],
  ['light brown', 'use natural light brown hair colour'],
  ['blonde', 'use natural blonde hair colour'],
  ['platinum', 'use natural platinum-blonde hair colour'],
  ['auburn', 'use natural auburn hair colour'],
  ['copper', 'use natural copper hair colour'],
  ['red', 'use natural red hair colour'],
  ['gray', 'use natural gray hair colour'],
  ['grey', 'use natural gray hair colour'],
  ['silver', 'use natural silver-gray hair colour'],
]);

export async function readRequestTextWithLimit(request, maxBytes = MAX_RENDER_REQUEST_BYTES) {
  const rawLength = request.headers.get('content-length');
  if (rawLength != null && rawLength !== '') {
    if (!/^\d+$/.test(rawLength.trim())) throw new Error('invalid_content_length');
    const declaredLength = Number(rawLength);
    if (!Number.isSafeInteger(declaredLength) || declaredLength > maxBytes) throw new Error('body_too_large');
  }
  if (!request.body) return '';

  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => undefined);
        throw new Error('body_too_large');
      }
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
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(merged);
  } catch {
    throw new Error('invalid_utf8');
  }
}

export async function readJsonObjectResponseWithLimit(response, maxBytes = MAX_PROVIDER_RESPONSE_BYTES) {
  const rawLength = response.headers.get('content-length');
  if (rawLength != null && rawLength !== '') {
    if (!/^\d+$/.test(rawLength.trim())) throw new Error('provider_invalid_length');
    const declaredLength = Number(rawLength);
    if (!Number.isSafeInteger(declaredLength) || declaredLength > maxBytes) throw new Error('provider_response_too_large');
  }
  if (!response.body) throw new Error('provider_invalid_response');

  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => undefined);
        throw new Error('provider_response_too_large');
      }
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

  let text;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(merged);
  } catch {
    throw new Error('provider_invalid_response');
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('provider_invalid_response');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('provider_invalid_response');
  return parsed;
}

export function validateReplicatePollUrl(value) {
  if (typeof value !== 'string' || value.length < 1 || value.length > 2048) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null;
    if (url.hostname.toLowerCase() !== 'api.replicate.com') return null;
    if (!/^\/v1\/predictions\/[A-Za-z0-9_-]{1,160}$/.test(url.pathname)) return null;
    if (url.search || url.hash) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function validateHttpsOutputUrl(value) {
  if (typeof value !== 'string' || value.length < 1 || value.length > 2048) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.hash) return null;
    const host = url.hostname.toLowerCase();
    if (!host || host === 'localhost' || host.endsWith('.localhost')) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function normalizeDeviceId(value) {
  const id = typeof value === 'string' ? value.trim() : '';
  return /^[A-Za-z0-9._:-]{16,128}$/.test(id) ? id : null;
}

export function safeColorInstruction(value) {
  const key = typeof value === 'string' ? value.trim().toLowerCase() : 'match';
  return SAFE_COLORS.get(key) || SAFE_COLORS.get('match');
}

function decodeBase64(base64) {
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

function sniffImageFormat(bytes) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg';
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return 'png';
  if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return 'webp';
  return null;
}

export function validateDataImage(value, maxBytes = MAX_IMAGE_BYTES) {
  if (typeof value !== 'string') return { ok: false, error: 'invalid_image' };
  const match = /^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=]+)$/i.exec(value);
  if (!match) return { ok: false, error: 'invalid_image' };

  const bytes = decodeBase64(match[2]);
  if (!bytes || bytes.length === 0 || bytes.length > maxBytes) return { ok: false, error: 'invalid_image' };
  const declared = match[1].toLowerCase() === 'jpg' ? 'jpeg' : match[1].toLowerCase();
  const detected = sniffImageFormat(bytes);
  if (!detected || detected !== declared) return { ok: false, error: 'invalid_image' };
  return { ok: true, format: detected, bytes: bytes.length };
}

export function validateRenderIdentity({ deviceId, rcUserId }) {
  const device = normalizeDeviceId(deviceId);
  if (!device) return null;
  const revenueCat = rcUserId == null || rcUserId === ''
    ? null
    : (typeof rcUserId === 'string' && rcUserId.length <= 160 && /^[A-Za-z0-9_$:.-]+$/.test(rcUserId) ? rcUserId : null);
  if (rcUserId && !revenueCat) return null;
  return { deviceId: device, rcUserId: revenueCat };
}
