(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ChiselARCoach = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const SAFETY_COPY = 'This does not reshape adult facial bones or spot-reduce fat. Keep your jaw relaxed and never force the movement. Stop for pain, clicking, locking, dizziness, numbness, or discomfort.';

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
    }
  ];

  const SESSIONS = {
    jaw: { id: 'jaw', title: 'Jawline posture', duration: '3 min', exerciseIds: ['chin-tuck', 'neck-length'] },
    cheek: { id: 'cheek', title: 'Cheek lift', duration: '3 min', exerciseIds: ['cheek-raise', 'relaxed-smile'] },
    full: { id: 'full', title: 'Full face', duration: '6 min', exerciseIds: ['chin-tuck', 'neck-length', 'cheek-raise', 'relaxed-smile'] }
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
    if (signals.mouthOpen > 0.16) return { accepted: false, correction: 'Relax your jaw and soften your mouth', tone: 'find' };
    if (exercise.kind === 'smile') {
      if (signals.cornerAsymmetry > 0.08) return { accepted: false, correction: 'Lift both cheeks evenly', tone: 'find' };
      if (signals.cornerLift < exercise.minLift) return { accepted: false, correction: 'Lift your cheeks gently', tone: 'find' };
      if (signals.cornerLift > exercise.maxLift) return { accepted: false, correction: 'Soften the smile and keep your jaw loose', tone: 'find' };
    }
    return { accepted: true, correction: 'Form locked — keep breathing', tone: 'hold' };
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
