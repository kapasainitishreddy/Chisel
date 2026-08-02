(function attachChiselEnhancements(root, factory) {
  const core = root && root.ChiselEnhancementsCore
    ? root.ChiselEnhancementsCore
    : (typeof require === 'function' ? require('./chisel-enhancements-core.js') : null);
  const api = factory(root || globalThis, core);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ChiselEnhancements = api;
  if (root && root.document) api.autoBoot();
})(typeof globalThis !== 'undefined' ? globalThis : this, function createEnhancements(root, core) {
  'use strict';

  const STORAGE_KEY = 'chisel:enhancements:v1';
  const MODULES = [
    { id: 'skin', icon: '◌', title: 'Skin Recovery', summary: 'Acne-support routine, irritation guardrails and progress check-ins.' },
    { id: 'expression', icon: '◇', title: 'Expression Calibration', summary: 'Neutral + open-mouth cheekbone remap and corrected angle map.' },
    { id: 'lips', icon: '◡', title: 'Lips & Color Lab', summary: 'Lip scanner, undertone-aware stain matches and local try-on.' },
    { id: 'neck', icon: '⌁', title: 'Neck Care', summary: 'Neck skin, shaving irritation and posture-aware care direction.' },
    { id: 'body', icon: '⌇', title: 'Body & Waist', summary: 'Full-body proportions, posture and an illustrative waist preview.' }
  ];

  const $ = (selector, scope) => (scope || root.document).querySelector(selector);
  const $$ = (selector, scope) => Array.from((scope || root.document).querySelectorAll(selector));
  const safeNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const clamp = core && core.clamp ? core.clamp : (v, a, b) => Math.min(b, Math.max(a, Number(v) || 0));
  let faceLandmarkerPromise = null;
  let poseLandmarkerPromise = null;
  let activeLipImage = null;
  let activeLipLandmarks = null;
  let activeBodySource = null;
  let activeBodyGeometry = null;

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function createStateStore(storage) {
    const fallback = {
      version: 1,
      skinChecks: {},
      skinHistory: [],
      expressionHistory: [],
      lipLooks: [],
      neckHistory: [],
      bodyHistory: [],
      settings: { sensitive: false, shaves: false }
    };
    let current;
    try {
      current = JSON.parse(storage.getItem(STORAGE_KEY) || 'null');
      if (!current || typeof current !== 'object') current = fallback;
    } catch (_) {
      current = fallback;
    }
    current = { ...fallback, ...current, version: 1 };
    const persist = () => {
      try { storage.setItem(STORAGE_KEY, JSON.stringify(current)); } catch (_) { /* local-only quota fallback */ }
    };
    persist();
    return {
      get() { return current; },
      patch(partial) { current = { ...current, ...partial, version: 1 }; persist(); return current; },
      update(key, updater) { current = { ...current, [key]: updater(current[key]), version: 1 }; persist(); return current; },
      clear() { current = { ...fallback }; persist(); return current; }
    };
  }

  function readLatestScan(storage) {
    const candidates = ['chisel:scans', 'scans'];
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (key && /(^|:)scans$/i.test(key) && !candidates.includes(key)) candidates.push(key);
    }
    for (const key of candidates) {
      try {
        const records = JSON.parse(storage.getItem(key) || '[]');
        if (Array.isArray(records) && records.length) return records.slice().sort((a, b) => safeNumber(a.t) - safeNumber(b.t)).at(-1);
      } catch (_) { /* try next key */ }
    }
    return null;
  }

  function buildShellHtml() {
    const nav = MODULES.map((item, index) => `
      <button class="chl-module-card${index === 0 ? ' is-active' : ''}" type="button" data-chl-open="${item.id}" aria-controls="chl-panel-${item.id}">
        <span class="chl-module-icon" aria-hidden="true">${item.icon}</span>
        <span><b>${item.title}</b><small>${item.summary}</small></span>
      </button>`).join('');

    return `
      <section id="chiselLabsRoot" class="chl-root" hidden aria-hidden="true">
        <div class="chl-backdrop" data-chl-close></div>
        <div class="chl-dialog" role="dialog" aria-modal="true" aria-labelledby="chl-title">
          <header class="chl-header">
            <div><span class="chl-kicker">LOCAL-ONLY EXPERIMENTAL LABS</span><h2 id="chl-title">Chisel Labs</h2></div>
            <button class="chl-close" type="button" data-chl-close aria-label="Close Chisel Labs">×</button>
          </header>
          <p class="chl-disclosure">Photos and measurements stay on this device. These tools provide cosmetic and educational guidance, not medical diagnosis, attractiveness ranking, or guaranteed transformation.</p>
          <div class="chl-layout">
            <nav class="chl-module-nav" aria-label="Chisel Labs modules">${nav}</nav>
            <main class="chl-panels">
              ${buildSkinPanel()}
              ${buildExpressionPanel()}
              ${buildLipPanel()}
              ${buildNeckPanel()}
              ${buildBodyPanel()}
            </main>
          </div>
        </div>
      </section>`;
  }

  function buildSkinPanel() {
    return `
      <section id="chl-panel-skin" class="chl-panel is-active" data-chl-panel="skin">
        <div class="chl-panel-head"><span class="chl-kicker">RECOVERY, NOT A CURE CLAIM</span><h3>Skin Recovery</h3><p>Uses your latest on-device redness, oil, evenness and blemish readings to build a cautious AM/PM plan.</p></div>
        <div id="chl-skin-scan" class="chl-metric-strip"></div>
        <div class="chl-form-grid">
          <label class="chl-field"><span>Persistent for how many weeks?</span><input id="chl-skin-weeks" type="number" min="0" max="104" value="0" inputmode="numeric"></label>
          <label class="chl-check"><input id="chl-skin-sensitive" type="checkbox"><span>Sensitive or easily irritated skin</span></label>
        </div>
        <button id="chl-build-skin" class="chl-primary" type="button">Build my recovery plan</button>
        <div id="chl-skin-result" class="chl-result" aria-live="polite"></div>
      </section>`;
  }

  function buildExpressionPanel() {
    return `
      <section id="chl-panel-expression" class="chl-panel" data-chl-panel="expression" hidden>
        <div class="chl-panel-head"><span class="chl-kicker">TWO-PHOTO CALIBRATION</span><h3>Expression Calibration</h3><p>Upload a relaxed neutral photo and a second photo with your mouth naturally open. Chisel remaps expression-distorted jaw landmarks toward the neutral reference before recalculating cheekbone and gonial geometry.</p></div>
        <div class="chl-upload-grid">
          <label class="chl-upload"><span>1 · Neutral face</span><input id="chl-neutral-file" type="file" accept="image/*" capture="user"><small>Front-facing, relaxed jaw, even light.</small></label>
          <label class="chl-upload"><span>2 · Mouth open</span><input id="chl-open-file" type="file" accept="image/*" capture="user"><small>Same distance and angle; open naturally.</small></label>
        </div>
        <button id="chl-run-expression" class="chl-primary" type="button">Calibrate cheekbones & angles</button>
        <div id="chl-expression-status" class="chl-status" aria-live="polite"></div>
        <canvas id="chl-expression-canvas" class="chl-canvas" hidden></canvas>
        <div id="chl-expression-result" class="chl-result"></div>
      </section>`;
  }

  function buildLipPanel() {
    return `
      <section id="chl-panel-lips" class="chl-panel" data-chl-panel="lips" hidden>
        <div class="chl-panel-head"><span class="chl-kicker">SCAN · MATCH · TRY ON</span><h3>Lips & Color Lab</h3><p>Uses your existing lip and skin colours or reads them from a selfie, then ranks stain shades by undertone and contrast.</p></div>
        <div id="chl-lip-colors" class="chl-metric-strip"></div>
        <div class="chl-form-grid">
          <label class="chl-field"><span>Intensity</span><select id="chl-lip-intensity"><option value="light">Light wash</option><option value="medium" selected>Medium</option><option value="deep">Deep</option></select></label>
          <label class="chl-upload compact"><span>Selfie for color scan / try-on</span><input id="chl-lip-file" type="file" accept="image/*" capture="user"></label>
        </div>
        <button id="chl-match-lips" class="chl-primary" type="button">Find my lip stains</button>
        <div id="chl-lip-status" class="chl-status" aria-live="polite"></div>
        <div id="chl-lip-shades" class="chl-shades"></div>
        <canvas id="chl-lip-canvas" class="chl-canvas" hidden></canvas>
        <p class="chl-note">Virtual stain is an approximate color overlay. Lighting, natural pigmentation, product opacity and screen calibration change real-world results.</p>
      </section>`;
  }

  function buildNeckPanel() {
    return `
      <section id="chl-panel-neck" class="chl-panel" data-chl-panel="neck" hidden>
        <div class="chl-panel-head"><span class="chl-kicker">SKIN + POSTURE + SHAVING</span><h3>Neck Care</h3><p>Extend skincare below the jaw, track visible redness and evenness, and connect neck presentation to posture without making medical claims.</p></div>
        <div class="chl-form-grid three">
          <label class="chl-field"><span>Posture angle</span><input id="chl-neck-angle" type="number" min="20" max="90" value="50"><small>Use your Chisel posture result when available.</small></label>
          <label class="chl-field"><span>Visible redness</span><input id="chl-neck-redness" type="range" min="0" max="100" value="25"><output id="chl-neck-redness-out">25</output></label>
          <label class="chl-field"><span>Unevenness</span><input id="chl-neck-evenness" type="range" min="0" max="100" value="25"><output id="chl-neck-evenness-out">25</output></label>
        </div>
        <div class="chl-form-grid">
          <label class="chl-check"><input id="chl-neck-shaves" type="checkbox"><span>I shave or trim my neck</span></label>
          <label class="chl-check"><input id="chl-neck-sensitive" type="checkbox"><span>Neck skin is sensitive</span></label>
          <label class="chl-upload compact"><span>Optional neck photo scan</span><input id="chl-neck-file" type="file" accept="image/*" capture="user"></label>
        </div>
        <button id="chl-build-neck" class="chl-primary" type="button">Build neck care direction</button>
        <div id="chl-neck-status" class="chl-status" aria-live="polite"></div>
        <div id="chl-neck-result" class="chl-result"></div>
      </section>`;
  }

  function buildBodyPanel() {
    return `
      <section id="chl-panel-body" class="chl-panel" data-chl-panel="body" hidden>
        <div class="chl-panel-head"><span class="chl-kicker">FULL-BODY, NON-RANKING</span><h3>Body & Waist</h3><p>Upload a full-body photo in fitted clothing against a plain background. Chisel estimates shoulder, waist and hip widths, checks torso tilt, and creates a mild illustrative preview.</p></div>
        <label class="chl-upload wide"><span>Full-body photo</span><input id="chl-body-file" type="file" accept="image/*" capture="environment"><small>Camera at waist height, straight-on, arms slightly away from torso.</small></label>
        <button id="chl-run-body" class="chl-primary" type="button">Analyze posture & waist</button>
        <div id="chl-body-status" class="chl-status" aria-live="polite"></div>
        <canvas id="chl-body-analysis" class="chl-canvas" hidden></canvas>
        <div id="chl-body-result" class="chl-result"></div>
        <div id="chl-body-preview-wrap" hidden>
          <label class="chl-field"><span>Illustrative preview strength</span><input id="chl-body-slider" type="range" min="0" max="12" value="0"><output id="chl-body-slider-out">0%</output></label>
          <canvas id="chl-body-preview" class="chl-canvas"></canvas>
          <p class="chl-note">Illustrative visualization only — not a prediction, target, health score or promise of body change.</p>
        </div>
      </section>`;
  }

  function metric(label, value, note) {
    return `<div class="chl-metric"><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b>${note ? `<small>${escapeHtml(note)}</small>` : ''}</div>`;
  }

  function renderPlanSteps(title, items, stateKey, stateStore) {
    return `<div class="chl-plan-group"><h4>${escapeHtml(title)}</h4>${items.map((item, index) => {
      const id = `${stateKey}-${index}`;
      const checked = Boolean(stateStore.get().skinChecks[id]);
      return `<label class="chl-plan-step"><input type="checkbox" data-chl-plan-check="${id}"${checked ? ' checked' : ''}><span><b>${escapeHtml(item.title)}</b><small>${escapeHtml(item.detail)}</small></span></label>`;
    }).join('')}</div>`;
  }

  function rgbToHex(rgb) {
    const toHex = (n) => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, '0');
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase();
  }

  function averagePixels(ctx, points, radius = 4) {
    const values = [];
    for (const point of points) {
      const x = Math.round(point.x);
      const y = Math.round(point.y);
      const sx = Math.max(0, x - radius);
      const sy = Math.max(0, y - radius);
      const sw = Math.min(ctx.canvas.width - sx, radius * 2 + 1);
      const sh = Math.min(ctx.canvas.height - sy, radius * 2 + 1);
      if (sw <= 0 || sh <= 0) continue;
      const data = ctx.getImageData(sx, sy, sw, sh).data;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 200) continue;
        values.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
      }
    }
    if (!values.length) return { r: 128, g: 96, b: 96 };
    values.sort((a, b) => (a.r + a.g + a.b) - (b.r + b.g + b.b));
    const slice = values.slice(Math.floor(values.length * 0.2), Math.ceil(values.length * 0.8));
    return slice.reduce((sum, value) => ({ r: sum.r + value.r / slice.length, g: sum.g + value.g / slice.length, b: sum.b + value.b / slice.length }), { r: 0, g: 0, b: 0 });
  }

  async function fileToImage(file) {
    if (!file) throw new Error('Choose a photo first.');
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.decoding = 'async';
      image.src = url;
      await image.decode();
      return image;
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  }

  function fitCanvas(image, canvas, max = 900) {
    const scale = Math.min(1, max / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height));
    canvas.width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
    canvas.height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return { ctx, scale };
  }

  async function loadVision() {
    return import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.20/+esm');
  }

  async function getFaceLandmarker() {
    if (!faceLandmarkerPromise) {
      faceLandmarkerPromise = (async () => {
        const vision = await loadVision();
        const fileset = await vision.FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.20/wasm');
        const options = {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU'
          },
          runningMode: 'IMAGE',
          numFaces: 1,
          outputFaceBlendshapes: true
        };
        try { return await vision.FaceLandmarker.createFromOptions(fileset, options); }
        catch (_) {
          options.baseOptions.delegate = 'CPU';
          return vision.FaceLandmarker.createFromOptions(fileset, options);
        }
      })();
    }
    return faceLandmarkerPromise;
  }

  async function getPoseLandmarker() {
    if (!poseLandmarkerPromise) {
      poseLandmarkerPromise = (async () => {
        const vision = await loadVision();
        const fileset = await vision.FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.20/wasm');
        const options = {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'GPU'
          },
          runningMode: 'IMAGE',
          numPoses: 1,
          minPoseDetectionConfidence: 0.55,
          minPosePresenceConfidence: 0.55
        };
        try { return await vision.PoseLandmarker.createFromOptions(fileset, options); }
        catch (_) {
          options.baseOptions.delegate = 'CPU';
          return vision.PoseLandmarker.createFromOptions(fileset, options);
        }
      })();
    }
    return poseLandmarkerPromise;
  }

  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  function angleAt(a, b, c) {
    const v1 = { x: a.x - b.x, y: a.y - b.y };
    const v2 = { x: c.x - b.x, y: c.y - b.y };
    const dot = v1.x * v2.x + v1.y * v2.y;
    const denom = Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y) || 1;
    return Math.acos(clamp(dot / denom, -1, 1)) * 180 / Math.PI;
  }

  async function detectFace(file, canvas) {
    const image = await fileToImage(file);
    const { ctx } = fitCanvas(image, canvas);
    const landmarker = await getFaceLandmarker();
    const result = landmarker.detect(image);
    const landmarks = result.faceLandmarks && result.faceLandmarks[0];
    if (!landmarks) throw new Error('No face found. Use a clear, front-facing photo.');
    const pts = landmarks.map((p) => ({ x: p.x * canvas.width, y: p.y * canvas.height, z: p.z || 0 }));
    return { image, ctx, landmarks: pts, normalized: landmarks, blendshapes: result.faceBlendshapes && result.faceBlendshapes[0] };
  }

  function faceGeometry(points) {
    const faceHeight = dist(points[10], points[152]) || 1;
    const cheekboneWidth = dist(points[234], points[454]) / faceHeight;
    const jawWidth = dist(points[172], points[397]) / faceHeight;
    const mouthWidth = dist(points[61], points[291]) || 1;
    const mouthOpening = dist(points[13], points[14]) / mouthWidth;
    const gonialAngle = (angleAt(points[234], points[172], points[152]) + angleAt(points[454], points[397], points[152])) / 2;
    return { cheekboneWidth, jawWidth, gonialAngle, mouthOpening };
  }

  function drawGeometry(ctx, points, stroke, label) {
    const lines = [[234, 454], [172, 397], [234, 172, 152, 397, 454], [61, 291], [13, 14]];
    ctx.save();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = Math.max(2, ctx.canvas.width / 300);
    ctx.fillStyle = stroke;
    ctx.font = `${Math.max(12, ctx.canvas.width / 48)}px system-ui`;
    lines.forEach((indices) => {
      ctx.beginPath();
      indices.forEach((index, i) => i ? ctx.lineTo(points[index].x, points[index].y) : ctx.moveTo(points[index].x, points[index].y));
      ctx.stroke();
    });
    ctx.fillText(label, 14, 28);
    ctx.restore();
  }

  function alignNeutralToOpen(neutral, open) {
    const nEyeL = neutral[33]; const nEyeR = neutral[263];
    const oEyeL = open[33]; const oEyeR = open[263];
    const nMid = { x: (nEyeL.x + nEyeR.x) / 2, y: (nEyeL.y + nEyeR.y) / 2 };
    const oMid = { x: (oEyeL.x + oEyeR.x) / 2, y: (oEyeL.y + oEyeR.y) / 2 };
    const scale = dist(oEyeL, oEyeR) / (dist(nEyeL, nEyeR) || 1);
    const nAngle = Math.atan2(nEyeR.y - nEyeL.y, nEyeR.x - nEyeL.x);
    const oAngle = Math.atan2(oEyeR.y - oEyeL.y, oEyeR.x - oEyeL.x);
    const rotation = oAngle - nAngle;
    const cos = Math.cos(rotation); const sin = Math.sin(rotation);
    return neutral.map((point) => {
      const x = (point.x - nMid.x) * scale;
      const y = (point.y - nMid.y) * scale;
      return { x: oMid.x + x * cos - y * sin, y: oMid.y + x * sin + y * cos, z: point.z || 0 };
    });
  }

  function renderExpressionMap(canvas, image, neutralPoints, openPoints, severity) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const aligned = alignNeutralToOpen(neutralPoints, openPoints);
    const corrected = openPoints.map((point, index) => {
      const lowerFace = [234, 172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397, 454, 61, 291, 13, 14].includes(index);
      const weight = lowerFace ? clamp(0.55 + severity * 0.32, 0.55, 0.87) : 0.12;
      return { x: point.x * (1 - weight) + aligned[index].x * weight, y: point.y * (1 - weight) + aligned[index].y * weight };
    });
    drawGeometry(ctx, openPoints, 'rgba(255,255,255,.5)', 'Observed open-mouth map');
    drawGeometry(ctx, corrected, '#D9B871', 'Expression-corrected landmark map');
  }

  function drawLipOverlay(canvas, image, points, hex, alpha = 0.52) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const outer = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191, 78];
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = alpha;
    ctx.fillStyle = hex;
    ctx.beginPath();
    outer.forEach((index, i) => i ? ctx.lineTo(points[index].x, points[index].y) : ctx.moveTo(points[index].x, points[index].y));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function analyseNeckPixels(file, canvas) {
    return detectFace(file, canvas).then(({ image, ctx, landmarks }) => {
      const chin = landmarks[152];
      const jawL = landmarks[172]; const jawR = landmarks[397];
      const faceH = dist(landmarks[10], chin);
      const x1 = Math.max(0, Math.min(jawL.x, jawR.x) + faceH * 0.08);
      const x2 = Math.min(canvas.width, Math.max(jawL.x, jawR.x) - faceH * 0.08);
      const y1 = Math.min(canvas.height - 1, chin.y + faceH * 0.08);
      const y2 = Math.min(canvas.height, chin.y + faceH * 0.48);
      if (x2 <= x1 || y2 <= y1) throw new Error('Neck area is not visible enough in this photo.');
      const data = ctx.getImageData(Math.round(x1), Math.round(y1), Math.round(x2 - x1), Math.round(y2 - y1)).data;
      let r = 0; let g = 0; let b = 0; let count = 0; const luminances = [];
      for (let i = 0; i < data.length; i += 16) {
        if (data[i + 3] < 200) continue;
        r += data[i]; g += data[i + 1]; b += data[i + 2]; count += 1;
        luminances.push(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]);
      }
      if (!count) throw new Error('Could not read the neck region.');
      const avg = { r: r / count, g: g / count, b: b / count };
      const meanLum = luminances.reduce((sum, value) => sum + value, 0) / luminances.length;
      const variance = luminances.reduce((sum, value) => sum + (value - meanLum) ** 2, 0) / luminances.length;
      const redness = clamp(((avg.r - avg.g) - 3) * 3.2, 0, 100);
      const unevenness = clamp(Math.sqrt(variance) * 3.4, 0, 100);
      ctx.save(); ctx.strokeStyle = '#D9B871'; ctx.lineWidth = 3; ctx.strokeRect(x1, y1, x2 - x1, y2 - y1); ctx.restore();
      return { redness: Math.round(redness), unevenness: Math.round(unevenness), image, canvas };
    });
  }

  function rowBackground(data, width, y) {
    const sample = [];
    const add = (x) => {
      const i = (Math.round(y) * width + Math.round(x)) * 4;
      sample.push([data[i], data[i + 1], data[i + 2]]);
    };
    for (let i = 0; i < 8; i += 1) { add(i); add(width - 1 - i); }
    return sample.reduce((sum, c) => [sum[0] + c[0] / sample.length, sum[1] + c[1] / sample.length, sum[2] + c[2] / sample.length], [0, 0, 0]);
  }

  function findSilhouetteEdges(ctx, y, centerX, expectedHalfWidth) {
    const width = ctx.canvas.width; const height = ctx.canvas.height;
    const yy = Math.round(clamp(y, 1, height - 2));
    const image = ctx.getImageData(0, 0, width, height);
    const data = image.data;
    const bg = rowBackground(data, width, yy);
    const distanceFromBg = (x) => {
      const i = (yy * width + Math.round(clamp(x, 0, width - 1))) * 4;
      return Math.hypot(data[i] - bg[0], data[i + 1] - bg[1], data[i + 2] - bg[2]);
    };
    const maxHalf = Math.min(width * 0.46, Math.max(expectedHalfWidth * 1.8, width * 0.12));
    const minHalf = Math.max(width * 0.03, expectedHalfWidth * 0.35);
    let left = centerX - minHalf; let right = centerX + minHalf;
    let bestLeft = left; let bestRight = right;
    for (let x = centerX - minHalf; x >= centerX - maxHalf; x -= 1) {
      if (distanceFromBg(x) > 34) bestLeft = x;
      else if (centerX - x > expectedHalfWidth * 0.6) break;
    }
    for (let x = centerX + minHalf; x <= centerX + maxHalf; x += 1) {
      if (distanceFromBg(x) > 34) bestRight = x;
      else if (x - centerX > expectedHalfWidth * 0.6) break;
    }
    const contrast = clamp((distanceFromBg(centerX) - 18) / 70, 0, 1);
    return { left: bestLeft, right: bestRight, confidence: contrast };
  }

  function cloneCanvasSurface(source, documentRef) {
    const doc = documentRef || root.document;
    const copy = doc.createElement('canvas');
    copy.width = source.width; copy.height = source.height;
    copy.getContext('2d').drawImage(source, 0, 0);
    return copy;
  }

  async function analyseBody(file, canvas) {
    const image = await fileToImage(file);
    const { ctx } = fitCanvas(image, canvas, 1000);
    const cleanSource = cloneCanvasSurface(canvas);
    const landmarker = await getPoseLandmarker();
    const result = landmarker.detect(image);
    const pose = result.landmarks && result.landmarks[0];
    if (!pose) throw new Error('No full-body pose found. Use a straight-on photo with shoulders and hips visible.');
    const p = pose.map((point) => ({ x: point.x * canvas.width, y: point.y * canvas.height, visibility: point.visibility == null ? 1 : point.visibility }));
    const shoulderMid = { x: (p[11].x + p[12].x) / 2, y: (p[11].y + p[12].y) / 2 };
    const hipMid = { x: (p[23].x + p[24].x) / 2, y: (p[23].y + p[24].y) / 2 };
    if (hipMid.y <= shoulderMid.y) throw new Error('Pose angle is too unusual for a waist estimate.');
    const centerX = (shoulderMid.x + hipMid.x) / 2;
    const shoulderY = shoulderMid.y + (hipMid.y - shoulderMid.y) * 0.1;
    const waistY = shoulderMid.y + (hipMid.y - shoulderMid.y) * 0.62;
    const hipY = hipMid.y;
    const expectedShoulder = dist(p[11], p[12]) / 2;
    const expectedHip = dist(p[23], p[24]) * 0.8;
    const shoulder = findSilhouetteEdges(ctx, shoulderY, centerX, expectedShoulder);
    const waist = findSilhouetteEdges(ctx, waistY, centerX, (expectedShoulder + expectedHip) / 2 * 0.72);
    const hip = findSilhouetteEdges(ctx, hipY, centerX, expectedHip);
    const torsoTiltDeg = Math.atan2(hipMid.x - shoulderMid.x, hipMid.y - shoulderMid.y) * 180 / Math.PI;
    const poseConfidence = [11, 12, 23, 24].reduce((sum, index) => sum + clamp(p[index].visibility, 0, 1), 0) / 4;
    const edgeConfidence = (shoulder.confidence + waist.confidence + hip.confidence) / 3;
    const metrics = core.estimateWaistMetrics({
      imageWidth: canvas.width,
      leftShoulderX: shoulder.left,
      rightShoulderX: shoulder.right,
      leftWaistX: waist.left,
      rightWaistX: waist.right,
      leftHipX: hip.left,
      rightHipX: hip.right,
      torsoTiltDeg,
      edgeConfidence,
      poseConfidence
    });
    const geometry = {
      shoulderY: shoulderY / canvas.height,
      waistY: waistY / canvas.height,
      hipY: hipY / canvas.height,
      amount: 0,
      centerX: centerX / canvas.width
    };
    ctx.save();
    [['Shoulders', shoulderY, shoulder], ['Waist', waistY, waist], ['Hips', hipY, hip]].forEach(([label, y, edges]) => {
      ctx.strokeStyle = label === 'Waist' ? '#D9B871' : 'rgba(255,255,255,.75)';
      ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(edges.left, y); ctx.lineTo(edges.right, y); ctx.stroke();
      ctx.fillStyle = ctx.strokeStyle; ctx.font = `${Math.max(12, canvas.width / 55)}px system-ui`; ctx.fillText(label, edges.left + 4, y - 7);
    });
    ctx.restore();
    return { metrics, geometry, image, sourceCanvas: cleanSource };
  }

  function renderWaistPreview(source, canvas, options) {
    const width = source.naturalWidth || source.videoWidth || source.width;
    const height = source.naturalHeight || source.videoHeight || source.height;
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(source, 0, 0, width, height);
    const centerX = clamp(options.centerX == null ? 0.5 : options.centerX, 0.25, 0.75) * width;
    const bandHalf = width * 0.34;
    for (let y = 0; y < height; y += 2) {
      const normalizedY = y / height;
      const scale = core.waistPreviewScaleAt(normalizedY, options);
      if (scale >= 0.999) continue;
      const sourceX = Math.max(0, centerX - bandHalf);
      const sourceW = Math.min(width - sourceX, bandHalf * 2);
      const destW = sourceW * scale;
      const destX = centerX - destW / 2;
      ctx.drawImage(source, sourceX, y, sourceW, Math.min(2, height - y), destX, y, destW, Math.min(2, height - y));
    }
    return canvas;
  }

  function status(element, message, kind) {
    if (!element) return;
    element.textContent = message || '';
    element.dataset.kind = kind || '';
  }

  function openModule(id) {
    $$('.chl-module-card').forEach((card) => card.classList.toggle('is-active', card.dataset.chlOpen === id));
    $$('.chl-panel').forEach((panel) => {
      const active = panel.dataset.chlPanel === id;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
    const activePanel = $(`[data-chl-panel="${id}"]`);
    if (activePanel) activePanel.scrollTop = 0;
  }

  function bindUi(stateStore) {
    const storage = root.localStorage;
    const latest = readLatestScan(storage) || {};
    $('#chl-skin-scan').innerHTML = latest.t
      ? metric('Blemish estimate', `${Math.round(safeNumber(latest.blemish))}/100`) + metric('Redness', `${Math.round(safeNumber(latest.redLevel))}/100`) + metric('Oil', `${Math.round(safeNumber(latest.oilPct))}%`) + metric('Last scan', new Date(latest.t).toLocaleDateString())
      : '<p class="chl-empty">No Chisel scan found yet. You can still build a conservative starter routine.</p>';
    $('#chl-lip-colors').innerHTML = metric('Undertone', latest.undertone || 'Neutral') + metric('Natural lip', latest.lipHex || 'Not scanned') + metric('Skin sample', latest.skinHex || 'Not scanned');

    $$('.chl-module-card').forEach((button) => button.addEventListener('click', () => openModule(button.dataset.chlOpen)));
    $$('[data-chl-close]').forEach((button) => button.addEventListener('click', closeLabs));
    root.document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !$('#chiselLabsRoot').hidden) closeLabs(); });

    $('#chl-build-skin').addEventListener('click', () => {
      const plan = core.buildSkinRecoveryPlan(latest, {
        sensitive: $('#chl-skin-sensitive').checked,
        persistentWeeks: safeNumber($('#chl-skin-weeks').value)
      });
      const result = $('#chl-skin-result');
      result.innerHTML = `<div class="chl-callout"><b>${escapeHtml(plan.level.replace('-', ' '))}</b><span>Routine intensity · ${plan.burden}/100 signal</span></div>
        <div class="chl-two-col">${renderPlanSteps('Morning', plan.am, 'am', stateStore)}${renderPlanSteps('Evening', plan.pm, 'pm', stateStore)}</div>
        <div class="chl-plan-group"><h4>When to get support</h4><ul>${plan.escalation.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>
        <p class="chl-note">${escapeHtml(plan.disclaimer)}</p>`;
      stateStore.update('skinHistory', (history) => [...(history || []), { t: Date.now(), level: plan.level, burden: plan.burden }].slice(-30));
      $$('[data-chl-plan-check]', result).forEach((box) => box.addEventListener('change', () => {
        stateStore.patch({ skinChecks: { ...stateStore.get().skinChecks, [box.dataset.chlPlanCheck]: box.checked } });
      }));
    });

    $('#chl-run-expression').addEventListener('click', async () => {
      const neutralFile = $('#chl-neutral-file').files[0];
      const openFile = $('#chl-open-file').files[0];
      const stat = $('#chl-expression-status');
      const canvas = $('#chl-expression-canvas');
      try {
        if (!neutralFile || !openFile) throw new Error('Choose both a neutral and an open-mouth photo.');
        status(stat, 'Loading the on-device face model…');
        const neutralCanvas = root.document.createElement('canvas');
        const openCanvas = root.document.createElement('canvas');
        const neutral = await detectFace(neutralFile, neutralCanvas);
        const opened = await detectFace(openFile, openCanvas);
        const neutralGeometry = faceGeometry(neutral.landmarks);
        const openGeometry = faceGeometry(opened.landmarks);
        const corrected = core.correctExpressionGeometry(neutralGeometry, openGeometry);
        canvas.width = openCanvas.width; canvas.height = openCanvas.height; canvas.hidden = false;
        renderExpressionMap(canvas, opened.image, neutral.landmarks, opened.landmarks, corrected.expressionSeverity);
        $('#chl-expression-result').innerHTML = `<div class="chl-metric-strip">
          ${metric('Expression severity', `${Math.round(corrected.expressionSeverity * 100)}%`)}
          ${metric('Corrected cheekbone', corrected.corrected.cheekboneWidth.toFixed(3), 'face-height ratio')}
          ${metric('Corrected jaw width', corrected.corrected.jawWidth.toFixed(3), 'face-height ratio')}
          ${metric('Corrected gonial', `${corrected.corrected.gonialAngle.toFixed(1)}°`)}
          ${metric('Confidence', `${Math.round(corrected.confidence * 100)}%`)}
        </div><p class="chl-note">${escapeHtml(corrected.note)} This corrects landmark geometry; it does not claim to alter bone structure.</p>`;
        stateStore.update('expressionHistory', (history) => [...(history || []), { t: Date.now(), ...corrected.corrected, confidence: corrected.confidence }].slice(-20));
        status(stat, 'Calibration complete.', 'success');
      } catch (error) { status(stat, error.message || 'Calibration failed.', 'error'); }
    });

    $('#chl-match-lips').addEventListener('click', async () => {
      const stat = $('#chl-lip-status');
      const canvas = $('#chl-lip-canvas');
      let scan = { ...latest };
      try {
        const file = $('#chl-lip-file').files[0];
        if (file) {
          status(stat, 'Reading lip and skin colour locally…');
          const detected = await detectFace(file, canvas);
          canvas.hidden = false;
          activeLipImage = detected.image;
          activeLipLandmarks = detected.landmarks;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          const lipPoints = [13, 14, 61, 291, 82, 312].map((index) => detected.landmarks[index]);
          const skinPoints = [50, 280, 205, 425].map((index) => detected.landmarks[index]);
          scan.lipHex = rgbToHex(averagePixels(ctx, lipPoints, 3));
          scan.skinHex = rgbToHex(averagePixels(ctx, skinPoints, 5));
          $('#chl-lip-colors').innerHTML = metric('Undertone', scan.undertone || 'Neutral') + metric('Natural lip', scan.lipHex) + metric('Skin sample', scan.skinHex);
        }
        const shades = core.recommendLipStains({
          undertone: scan.undertone || 'Neutral',
          skinHex: scan.skinHex,
          lipHex: scan.lipHex,
          intensity: $('#chl-lip-intensity').value,
          finish: 'stain'
        });
        $('#chl-lip-shades').innerHTML = shades.map((shade, index) => `<button class="chl-shade${index === 0 ? ' is-active' : ''}" type="button" data-hex="${shade.hex}" title="Try ${escapeHtml(shade.name)}"><i style="background:${shade.hex}"></i><span><b>${escapeHtml(shade.name)}</b><small>${escapeHtml(shade.why)}</small></span></button>`).join('');
        $$('.chl-shade').forEach((button) => button.addEventListener('click', () => {
          $$('.chl-shade').forEach((other) => other.classList.toggle('is-active', other === button));
          if (activeLipImage && activeLipLandmarks) drawLipOverlay(canvas, activeLipImage, activeLipLandmarks, button.dataset.hex);
          stateStore.update('lipLooks', (looks) => [...(looks || []), { t: Date.now(), hex: button.dataset.hex }].slice(-30));
        }));
        if (activeLipImage && activeLipLandmarks) drawLipOverlay(canvas, activeLipImage, activeLipLandmarks, shades[0].hex);
        status(stat, file ? 'Color scan and matches complete.' : 'Matches built from your latest Chisel scan.', 'success');
      } catch (error) { status(stat, error.message || 'Could not match lip stains.', 'error'); }
    });

    ['redness', 'evenness'].forEach((name) => {
      const input = $(`#chl-neck-${name}`); const output = $(`#chl-neck-${name}-out`);
      input.addEventListener('input', () => { output.textContent = input.value; });
    });
    $('#chl-build-neck').addEventListener('click', async () => {
      const stat = $('#chl-neck-status');
      try {
        const file = $('#chl-neck-file').files[0];
        if (file) {
          status(stat, 'Reading visible neck colour and evenness locally…');
          const tempCanvas = root.document.createElement('canvas');
          const scan = await analyseNeckPixels(file, tempCanvas);
          $('#chl-neck-redness').value = scan.redness; $('#chl-neck-redness-out').textContent = scan.redness;
          $('#chl-neck-evenness').value = scan.unevenness; $('#chl-neck-evenness-out').textContent = scan.unevenness;
        }
        const input = {
          postureAngle: safeNumber($('#chl-neck-angle').value, 50),
          redness: safeNumber($('#chl-neck-redness').value),
          unevenness: safeNumber($('#chl-neck-evenness').value),
          shaves: $('#chl-neck-shaves').checked,
          sensitive: $('#chl-neck-sensitive').checked
        };
        const plan = core.buildNeckCarePlan(input);
        $('#chl-neck-result').innerHTML = `<div class="chl-plan-group"><h4>Your direction</h4>${plan.steps.map((step) => `<div class="chl-advice"><b>${escapeHtml(step.title)}</b><span>${escapeHtml(step.detail)}</span></div>`).join('')}</div><p>${escapeHtml(plan.tracking)}</p><p class="chl-note">${escapeHtml(plan.disclaimer)}</p>`;
        stateStore.update('neckHistory', (history) => [...(history || []), { t: Date.now(), ...input }].slice(-30));
        status(stat, 'Neck care direction ready.', 'success');
      } catch (error) { status(stat, error.message || 'Could not build neck care direction.', 'error'); }
    });

    $('#chl-run-body').addEventListener('click', async () => {
      const stat = $('#chl-body-status');
      const canvas = $('#chl-body-analysis');
      try {
        const file = $('#chl-body-file').files[0];
        if (!file) throw new Error('Choose a full-body photo first.');
        status(stat, 'Loading the on-device pose model and reading the silhouette…');
        canvas.hidden = false;
        const result = await analyseBody(file, canvas);
        if (!result.metrics.valid) throw new Error('The silhouette confidence is too low. Try fitted clothing, a plain background and a straight-on pose.');
        activeBodySource = result.sourceCanvas;
        activeBodyGeometry = result.geometry;
        const plan = core.buildBodyPlan(result.metrics);
        $('#chl-body-result').innerHTML = `<div class="chl-metric-strip">
          ${metric('Waist : hip', result.metrics.waistToHip.toFixed(3))}
          ${metric('Shoulder : waist', result.metrics.shoulderToWaist.toFixed(3))}
          ${metric('Torso tilt', `${result.metrics.torsoTiltDeg.toFixed(1)}°`)}
          ${metric('Confidence', `${Math.round(result.metrics.confidence * 100)}%`)}
        </div><div class="chl-plan-group"><h4>Transformation direction</h4>${plan.actions.map((item) => `<div class="chl-advice"><b>${escapeHtml(item.title)}</b><span>${escapeHtml(item.detail)}</span></div>`).join('')}</div><p class="chl-note">${escapeHtml(plan.measurementRule)}</p>`;
        $('#chl-body-preview-wrap').hidden = false;
        const preview = $('#chl-body-preview');
        renderWaistPreview(activeBodySource, preview, activeBodyGeometry);
        stateStore.update('bodyHistory', (history) => [...(history || []), { t: Date.now(), ...result.metrics }].slice(-30));
        status(stat, 'Body and waist analysis complete.', 'success');
      } catch (error) { status(stat, error.message || 'Body analysis failed.', 'error'); }
    });

    $('#chl-body-slider').addEventListener('input', (event) => {
      const amount = clamp(safeNumber(event.target.value) / 100, 0, 0.12);
      $('#chl-body-slider-out').textContent = `${event.target.value}%`;
      if (activeBodySource && activeBodyGeometry) renderWaistPreview(activeBodySource, $('#chl-body-preview'), { ...activeBodyGeometry, amount });
    });
  }

  function openLabs(moduleId) {
    const rootEl = $('#chiselLabsRoot');
    if (!rootEl) return;
    rootEl.hidden = false; rootEl.setAttribute('aria-hidden', 'false');
    root.document.body.classList.add('chl-modal-open');
    openModule(moduleId || 'skin');
    const close = $('.chl-close', rootEl); if (close) close.focus();
  }

  function closeLabs() {
    const rootEl = $('#chiselLabsRoot');
    if (!rootEl) return;
    rootEl.hidden = true; rootEl.setAttribute('aria-hidden', 'true');
    root.document.body.classList.remove('chl-modal-open');
    const launcher = $('#chiselLabsLauncher'); if (launcher) launcher.focus();
  }

  function boot(options = {}) {
    if (!root.document || !root.document.body || root.__chiselLabsBooted) return false;
    if (!core) throw new Error('ChiselEnhancementsCore is required before Chisel Labs can boot.');
    root.__chiselLabsBooted = true;
    const launcher = root.document.createElement('button');
    launcher.id = 'chiselLabsLauncher'; launcher.className = 'chl-launcher'; launcher.type = 'button';
    launcher.setAttribute('aria-haspopup', 'dialog'); launcher.innerHTML = '<span aria-hidden="true">✦</span><b>Labs</b>';
    launcher.addEventListener('click', () => openLabs(options.initialModule));
    const shell = root.document.createElement('div'); shell.innerHTML = buildShellHtml();
    root.document.body.appendChild(launcher);
    root.document.body.appendChild(shell.firstElementChild);
    const stateStore = createStateStore(root.localStorage);
    bindUi(stateStore);
    return true;
  }

  function autoBoot() {
    const start = () => {
      try { boot(); }
      catch (error) { console.warn('[Chisel Labs] boot failed', error); root.__chiselLabsBooted = false; }
    };
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', start, { once: true });
    else root.setTimeout(start, 0);
  }

  return {
    STORAGE_KEY,
    MODULES,
    createStateStore,
    readLatestScan,
    buildShellHtml,
    renderWaistPreview,
    cloneCanvasSurface,
    boot,
    autoBoot,
    openLabs,
    closeLabs
  };
});
