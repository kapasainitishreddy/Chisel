(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ChiselARCoach = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const SAFETY_COPY = 'This does not reshape adult facial bones or spot-reduce fat. Face Yoga is gentle movement and relaxation awareness. Keep your jaw relaxed and never force the movement. Stop for pain, clicking, locking, dizziness, numbness, or discomfort.';

  const EXERCISES = [
    {
      id: 'chin-tuck', name: 'Chin tuck', kind: 'align', reps: 4, hold: 4,
      evidence: 'Moderate', cue: 'Glide your chin gently back. Keep your eyes level and jaw loose.',
      safety: 'Small movement only. Do not push your jaw forward or clench.'
    },
    {
      id: 'neck-length', name: 'Neck length', kind: 'align', reps: 3, hold: 5,
      evidence: 'Moderate', cue: 'Grow tall through the crown of your head. Relax your shoulders and jaw.',
      safety: 'Stay comfortable and stop if you feel dizzy or strained.'
    },
    {
      id: 'cheek-raise', name: 'Cheek raise', kind: 'smile', reps: 5, hold: 3, minLift: 0.08, maxLift: 0.34,
      evidence: 'Limited', cue: 'Lift both cheeks gently toward your eyes without squeezing your jaw.',
      safety: 'Use a soft lift. Do not grit your teeth or force the expression.'
    },
    {
      id: 'relaxed-smile', name: 'Relaxed smile', kind: 'smile', reps: 4, hold: 4, minLift: 0.055, maxLift: 0.30,
      evidence: 'Limited', cue: 'Hold a small, even smile. Keep your lips soft and teeth unclenched.',
      safety: 'Reduce the range if your jaw clicks or feels tired.'
    },
    {
      id: 'brow-release', name: 'Brow lift and release', kind: 'align', reps: 3, hold: 4,
      evidence: 'Limited', cue: 'Lift your brows gently, then soften your forehead while keeping your head still.',
      safety: 'No forceful stretching. Keep the eyes relaxed and stop if you feel strain.'
    },
    {
      id: 'jaw-release', name: 'Jaw release', kind: 'release', reps: 3, hold: 5,
      evidence: 'Limited', cue: 'Let your lips part slightly and release jaw tension. Keep the movement small and comfortable.',
      safety: 'Do not open wide or push through clicking, locking, or pain.'
    }
  ];

  const SESSIONS = {
    jaw: { id: 'jaw', title: 'Jawline posture', duration: '3 min', exerciseIds: ['chin-tuck', 'neck-length'] },
    cheek: { id: 'cheek', title: 'Cheek lift', duration: '3 min', exerciseIds: ['cheek-raise', 'relaxed-smile'] },
    full: { id: 'full', title: 'Full face', duration: '6 min', exerciseIds: ['chin-tuck', 'neck-length', 'cheek-raise', 'relaxed-smile'] },
    yoga: { id: 'yoga', title: 'Unisex Face Yoga', duration: '7 min', exerciseIds: ['brow-release', 'cheek-raise', 'jaw-release', 'neck-length'] }
  };

  const distance = (a, b) => Math.hypot((a.x || 0) - (b.x || 0), (a.y || 0) - (b.y || 0));
  const exerciseById = (id) => EXERCISES.find((item) => item.id === id) || null;

  function signalsFromLandmarks(points) {
    const required = [1, 10, 13, 14, 33, 61, 152, 234, 263, 291, 454];
    if (!Array.isArray(points) || !required.every((index) => points[index])) {
      return { valid: false, frontal: false };
    }
    const leftFace = points[234], rightFace = points[454];
    const leftEye = points[33], rightEye = points[263];
    const leftCorner = points[61], rightCorner = points[291];
    const mouthTop = points[13], mouthBottom = points[14];
    const mouthWidth = distance(leftCorner, rightCorner) || 0.0001;
    const faceWidth = distance(leftFace, rightFace) || 0.0001;
    const mouthCenterY = (mouthTop.y + mouthBottom.y) / 2;
    const leftLift = (mouthCenterY - leftCorner.y) / mouthWidth;
    const rightLift = (mouthCenterY - rightCorner.y) / mouthWidth;
    return {
      valid: true,
      frontal: true,
      eyeTilt: Math.abs(leftEye.y - rightEye.y) / (distance(leftEye, rightEye) || 0.0001),
      centered: Math.abs(points[1].x - ((leftFace.x + rightFace.x) / 2)) / faceWidth,
      cornerLift: (leftLift + rightLift) / 2,
      cornerAsymmetry: Math.abs(leftLift - rightLift),
      mouthOpen: distance(mouthTop, mouthBottom) / mouthWidth,
      faceWidth,
      faceHeight: distance(points[10], points[152])
    };
  }

  function evaluateForm(exercise, signals) {
    if (!exercise || !signals || !signals.valid) return { accepted: false, correction: 'Center your face in the guide', tone: 'find' };
    if (signals.frontal === false) return { accepted: false, correction: 'Face the camera directly', tone: 'find' };
    if (signals.eyeTilt > 0.055) return { accepted: false, correction: 'Level your eyes', tone: 'find' };
    if (signals.centered > 0.08) return { accepted: false, correction: 'Center your face', tone: 'find' };
    if (exercise.kind === 'release') {
      if (signals.mouthOpen < 0.025) return { accepted: false, correction: 'Let your lips part slightly and soften the jaw', tone: 'find' };
      if (signals.mouthOpen > 0.16) return { accepted: false, correction: 'Use a smaller jaw release - do not open wide', tone: 'find' };
    } else if (signals.mouthOpen > 0.16) return { accepted: false, correction: 'Relax your jaw and soften your mouth', tone: 'find' };
    if (exercise.kind === 'smile') {
      if (signals.cornerAsymmetry > 0.08) return { accepted: false, correction: 'Lift both cheeks evenly', tone: 'find' };
      if (signals.cornerLift < exercise.minLift) return { accepted: false, correction: 'Lift your cheeks gently', tone: 'find' };
      if (signals.cornerLift > exercise.maxLift) return { accepted: false, correction: 'Soften the smile and keep your jaw loose', tone: 'find' };
    }
    return { accepted: true, correction: 'Form locked - keep breathing', tone: 'hold' };
  }

  function createState(sessionId, now = 0) {
    const session = SESSIONS[sessionId] || SESSIONS.full;
    return {
      sessionId: session.id,
      exerciseIds: session.exerciseIds.slice(),
      exerciseIndex: 0,
      rep: 0,
      holdStartedAt: 0,
      restUntil: 0,
      startedAt: now,
      completed: false,
      event: 'start',
      correction: ''
    };
  }

  function currentExercise(state) {
    return state && !state.completed ? exerciseById(state.exerciseIds[state.exerciseIndex]) : null;
  }

  function advanceState(state, form, now) {
    if (!state || state.completed) return state;
    const next = { ...state };
    if (next.restUntil && now < next.restUntil) {
      next.holdStartedAt = 0;
      next.event = 'rest';
      return next;
    }
    if (next.restUntil) next.restUntil = 0;
    if (!form || !form.accepted) {
      next.holdStartedAt = 0;
      next.event = 'find';
      next.correction = form && form.correction ? form.correction : 'Center your face in the guide';
      return next;
    }
    const exercise = currentExercise(next);
    if (!exercise) return { ...next, completed: true, event: 'complete' };
    if (!next.holdStartedAt) {
      next.holdStartedAt = now;
      next.event = 'hold';
      next.correction = form.correction || '';
      return next;
    }
    if (now - next.holdStartedAt < exercise.hold * 1000) {
      next.event = 'hold';
      next.correction = form.correction || '';
      return next;
    }
    next.holdStartedAt = 0;
    next.rep += 1;
    next.correction = '';
    if (next.rep >= exercise.reps) {
      next.exerciseIndex += 1;
      next.rep = 0;
      if (next.exerciseIndex >= next.exerciseIds.length) {
        next.completed = true;
        next.event = 'complete';
        next.restUntil = 0;
        return next;
      }
      next.event = 'exercise';
    } else {
      next.event = 'rep';
    }
    next.restUntil = now + 1300;
    return next;
  }

  return {
    SAFETY_COPY,
    EXERCISES,
    SESSIONS,
    exerciseById,
    signalsFromLandmarks,
    evaluateForm,
    createState,
    currentExercise,
    advanceState
  };
});

/* Feature runtime loader. index.html loads this small core early; this loader
   activates optional feature modules that ship in the APK. */
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.addEventListener('load', () => {
    const addCss = (href) => {
      if (document.querySelector(`link[data-chisel-runtime="${href}"]`)) return;
      const link = document.createElement('link');
      link.rel = 'stylesheet'; link.href = href; link.dataset.chiselRuntime = href;
      document.head.appendChild(link);
    };
    if (!document.getElementById('chiselLauncherLayerFix')) {
      const layerFix = document.createElement('style');
      layerFix.id = 'chiselLauncherLayerFix';
      layerFix.textContent = '.chl-launcher,.chp-launcher{z-index:180!important}';
      document.head.appendChild(layerFix);
    }
    const addScript = (src) => new Promise((resolve, reject) => {
      const prior = document.querySelector(`script[data-chisel-runtime="${src}"]`);
      if (prior) { if (prior.dataset.loaded === '1') resolve(); else prior.addEventListener('load', resolve, { once:true }); return; }
      const script = document.createElement('script');
      script.src = src; script.dataset.chiselRuntime = src;
      script.addEventListener('load', () => { script.dataset.loaded='1'; resolve(); }, { once:true });
      script.addEventListener('error', () => reject(new Error(`Could not load ${src}`)), { once:true });
      document.body.appendChild(script);
    });
    (async () => {
      try {
        await addScript('chisel-beauty-studio.js');
        const fixStyleLabels = () => {
          const first = document.querySelector('#styleTop .seg');
          if (!first) return;
          const buttons = first.querySelectorAll('button');
          if (buttons[0]) { buttons[0].textContent = 'Men'; buttons[0].setAttribute('aria-label', 'Men hairstyles'); }
          if (buttons[1]) { buttons[1].textContent = 'Women'; buttons[1].setAttribute('aria-label', 'Women hairstyles'); }
        };
        fixStyleLabels();
        const styleTop = document.getElementById('styleTop');
        if (styleTop && !styleTop.dataset.genderLabelObserver) {
          styleTop.dataset.genderLabelObserver = '1';
          new MutationObserver(fixStyleLabels).observe(styleTop, { childList:true, subtree:true });
        }
        addCss('chisel-enhancements.css');
        await addScript('chisel-enhancements-core.js');
        await addScript('chisel-enhancements.js');
        addCss('chisel-precision.css');
        for (const src of [
          'chisel-precision-stats.js', 'chisel-precision-protocol.js',
          'chisel-precision-core.js', 'chisel-precision-face.js',
          'chisel-precision-body.js', 'chisel-precision-ui.js',
          'chisel-precision.js'
        ]) await addScript(src);
        await addScript('chisel-scan-guard.js');
        await addScript('chisel-experience-polish.js');
      } catch (error) {
        console.warn('[Chisel runtime] optional feature module failed to load', error);
      }
    })();
  }, { once: true });
}
