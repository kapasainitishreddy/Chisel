export const MAX_RENDER_REQUEST_BYTES = 8_500_000;
export const MAX_IMAGE_BYTES = 5_500_000;

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
