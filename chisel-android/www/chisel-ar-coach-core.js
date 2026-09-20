(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ChiselARCoach = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const SAFETY_COPY = 'This does not reshape adult facial bones or spot-reduce fat. Face and neck training here is gentle movement, posture, muscle-control and relaxation practice. Keep your jaw relaxed and never force the movement. Stop for pain, clicking, locking, dizziness, numbness, or discomfort.';
  const FORM_TRACKING = Object.freeze({ FORM:'form', GUIDED:'guided', HAND:'hand-guided' });
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,Number(value)||0));

  const EXERCISES = [
    { id:'chin-tuck', name:'Chin tuck', kind:'align', tracking:FORM_TRACKING.GUIDED, reps:5, hold:4, evidence:'Moderate', cue:'Glide your chin gently straight back. Keep your eyes level and jaw loose.', safety:'Small comfortable movement only. Do not push the jaw forward or tighten it.' },
    { id:'deep-neck-nod', name:'Deep neck nod', kind:'align', tracking:FORM_TRACKING.GUIDED, reps:5, hold:4, evidence:'Moderate', cue:'Make a tiny yes-nod while keeping the back of your neck long.', safety:'Keep the movement gentle and small. Stop for pain or dizziness.' },
    { id:'neutral-head', name:'Neutral head hold', kind:'align', tracking:FORM_TRACKING.FORM, reps:3, hold:8, evidence:'Moderate', cue:'Eyes level, face centered, neck tall and shoulders relaxed.', safety:'Stay in a comfortable neutral position. Do not force your neck backward.' },
    { id:'neck-length', name:'Neck length', kind:'align', tracking:FORM_TRACKING.GUIDED, reps:3, hold:6, evidence:'Moderate', cue:'Grow tall through the crown of your head. Relax your shoulders and jaw.', safety:'Stay comfortable and stop if you feel dizzy or strained.' },
    { id:'cheek-raise', name:'Cheek lifter', kind:'smile', tracking:FORM_TRACKING.FORM, reps:6, hold:3, minLift:0.08, maxLift:0.34, evidence:'Limited', cue:'Lift both cheeks gently toward your eyes without squeezing your jaw.', safety:'Use a soft lift. Keep the teeth relaxed and stop if the jaw feels uncomfortable.' },
    { id:'happy-cheeks', name:'Happy cheeks hold', kind:'smile', tracking:FORM_TRACKING.FORM, reps:3, hold:6, minLift:0.07, maxLift:0.30, evidence:'Limited', cue:'Hold a small closed-mouth smile and lift both cheeks evenly.', safety:'Keep the smile gentle. Reduce the range if your jaw feels tired or sore.' },
    { id:'relaxed-smile', name:'Relaxed smile', kind:'smile', tracking:FORM_TRACKING.FORM, reps:4, hold:4, minLift:0.055, maxLift:0.30, evidence:'Limited', cue:'Hold a small, even smile. Keep your lips soft and teeth relaxed.', safety:'Reduce the range if your jaw clicks or feels tired.' },
    { id:'brow-release', name:'Brow lift and release', kind:'align', tracking:FORM_TRACKING.GUIDED, reps:3, hold:4, evidence:'Limited', cue:'Lift your brows gently, then soften your forehead while keeping your head still.', safety:'No forceful stretching. Keep the eyes relaxed and stop if you feel strain.' },
    { id:'jaw-release', name:'Jaw release', kind:'release', tracking:FORM_TRACKING.FORM, reps:3, hold:5, evidence:'Limited', cue:'Let your lips part slightly and release jaw tension. Keep the movement small and comfortable.', safety:'Do not open wide or push through clicking, locking, or pain.' }
  ];

  const jawChinIds=['chin-tuck','deep-neck-nod','neutral-head','neck-length'];
  const cheekBuilderIds=['cheek-raise','happy-cheeks','relaxed-smile'];
  const releaseIds=['jaw-release','brow-release','neck-length'];
  const SESSIONS = {
    jaw:{id:'jaw',title:'Jaw & chin posture',duration:'6 min',exerciseIds:jawChinIds.slice()},
    cheek:{id:'cheek',title:'Cheek activation',duration:'5 min',exerciseIds:cheekBuilderIds.slice()},
    'jaw-chin':{id:'jaw-chin',title:'Jaw & chin posture',duration:'6 min',exerciseIds:jawChinIds.slice()},
    'cheek-builder':{id:'cheek-builder',title:'Cheek activation',duration:'5 min',exerciseIds:cheekBuilderIds.slice()},
    'chin-support':{id:'chin-support',title:'Chin & neck support',duration:'7 min',exerciseIds:['chin-tuck','deep-neck-nod','neutral-head','neck-length']},
    release:{id:'release',title:'Face & jaw release',duration:'4 min',exerciseIds:releaseIds.slice()},
    full:{id:'full',title:'Full face + neck',duration:'10 min',exerciseIds:['chin-tuck','deep-neck-nod','neutral-head','cheek-raise','happy-cheeks','jaw-release','neck-length']},
    yoga:{id:'yoga',title:'Unisex Face Yoga',duration:'7 min',exerciseIds:['brow-release','cheek-raise','happy-cheeks','jaw-release','neck-length']}
  };

  /*
   * Massage stays in the same catalog and state machine as Face Yoga.  The
   * camera only checks approximate hand placement and movement direction; it
   * never claims to measure pressure, circulation or lymphatic drainage.
   */
  const MASSAGE_EXERCISES = [
    { id:'forehead-sweep', name:'Forehead sweep', kind:'massage', tracking:FORM_TRACKING.HAND, reps:3, hold:1, evidence:'Guided', difficulty:'Gentle', goalTags:['refresh','tension'], faceRegion:'forehead', animation:'forehead-sweep', completionRule:'strokes', cue:'Place two or three fingers lightly at the brow and glide upward, then release.', safety:'Use feather-light contact. Avoid the eyelids and stop if the skin feels sore.', handPath:{region:'forehead',motion:'sweep',direction:'upward',side:'both',strokes:3} },
    { id:'brow-sweep', name:'Brow sweep', kind:'massage', tracking:FORM_TRACKING.HAND, reps:3, hold:1, evidence:'Guided', difficulty:'Gentle', goalTags:['tension'], faceRegion:'brow', animation:'brow-sweep', completionRule:'strokes', cue:'Sweep along the brow from the inner brow toward the temple with very light pressure.', safety:'Stay on the brow bone, never press into the eye, and keep the glide comfortable.', handPath:{region:'brow',motion:'glide',direction:'outward',side:'both',strokes:3} },
    { id:'temple-circles', name:'Temple circles', kind:'massage', tracking:FORM_TRACKING.HAND, reps:3, hold:1, evidence:'Guided', difficulty:'Gentle', goalTags:['relax','tension'], faceRegion:'temple', animation:'temple-circles', completionRule:'strokes', cue:'Make three slow, small circles at the temple. Let the jaw stay loose.', safety:'Use small circles and gentle contact. Do not press hard or work over a tender spot.', handPath:{region:'temple',motion:'circle',direction:'circle',side:'both',strokes:3} },
    { id:'brow-relaxation', name:'Brow relaxation', kind:'massage', tracking:FORM_TRACKING.HAND, reps:2, hold:2, evidence:'Guided', difficulty:'Gentle', goalTags:['relax','tension'], faceRegion:'brow', animation:'brow-relaxation', completionRule:'strokes', cue:'Rest your fingertips above the brows, soften the forehead, and breathe out slowly.', safety:'Keep the touch still and light. Avoid pulling the skin or holding your breath.', handPath:{region:'brow',motion:'hold',direction:'soften',side:'both',strokes:2} },
    { id:'forehead-release', name:'Forehead tension release', kind:'massage', tracking:FORM_TRACKING.HAND, reps:3, hold:1, evidence:'Guided', difficulty:'Gentle', goalTags:['relax','tension'], faceRegion:'forehead', animation:'forehead-release', completionRule:'strokes', cue:'Glide from the center of the forehead outward, then let your hands float away.', safety:'Use a slow, light glide. Stop if you feel pressure around the eyes or a headache.', handPath:{region:'forehead',motion:'glide',direction:'outward',side:'both',strokes:3} },
    { id:'orbital-sweep', name:'Orbital-area gentle sweep', kind:'massage', tracking:FORM_TRACKING.HAND, reps:2, hold:1, evidence:'Guided', difficulty:'Very gentle', goalTags:['refresh'], faceRegion:'eye-area', animation:'orbital-sweep', completionRule:'strokes', cue:'Trace the orbital area with the lightest touch, staying on the bone and away from the eye.', safety:'Very light contact only. Never press on the eyeball, eyelid or inner corner.', handPath:{region:'eye-area',motion:'glide',direction:'outward',side:'both',strokes:2} },
    { id:'under-eye-glide', name:'Under-eye outward glide', kind:'massage', tracking:FORM_TRACKING.HAND, reps:2, hold:1, evidence:'Guided', difficulty:'Very gentle', goalTags:['refresh'], faceRegion:'under-eye', animation:'under-eye-glide', completionRule:'strokes', cue:'Use a ring finger to glide from the inner under-eye outward, barely touching the skin.', safety:'Use almost no pressure. Do not drag the skin or work over irritation.', handPath:{region:'under-eye',motion:'glide',direction:'outward',side:'both',strokes:2} },
    { id:'brow-to-temple', name:'Brow-to-temple sweep', kind:'massage', tracking:FORM_TRACKING.HAND, reps:3, hold:1, evidence:'Guided', difficulty:'Gentle', goalTags:['refresh','tension'], faceRegion:'brow-temple', animation:'brow-to-temple', completionRule:'strokes', cue:'Sweep from the brow toward the temple in one calm outward motion.', safety:'Stay light and avoid the eye socket. Stop if the area feels tender.', handPath:{region:'brow-temple',motion:'glide',direction:'outward',side:'both',strokes:3} },
    { id:'cheek-upward-sweep', name:'Cheek upward sweep', kind:'massage', tracking:FORM_TRACKING.HAND, reps:3, hold:1, evidence:'Guided', difficulty:'Gentle', goalTags:['refresh','cheeks'], faceRegion:'cheek', animation:'cheek-upward-sweep', completionRule:'strokes', cue:'Glide from the lower cheek upward toward the cheekbone, then release at the temple.', safety:'Use a comfortable, light glide. This supports relaxation and sensation, not structural change.', handPath:{region:'cheek',motion:'glide',direction:'upward',side:'both',strokes:3} },
    { id:'cheek-outward-glide', name:'Cheek outward glide', kind:'massage', tracking:FORM_TRACKING.HAND, reps:3, hold:1, evidence:'Guided', difficulty:'Gentle', goalTags:['refresh','cheeks'], faceRegion:'cheek', animation:'cheek-outward-glide', completionRule:'strokes', cue:'Move from beside the nose outward toward the ear with a slow, even glide.', safety:'Keep the pressure light and avoid stretching the skin.', handPath:{region:'cheek',motion:'glide',direction:'outward',side:'both',strokes:3} },
    { id:'cheek-relaxation', name:'Cheek relaxation', kind:'massage', tracking:FORM_TRACKING.HAND, reps:2, hold:2, evidence:'Guided', difficulty:'Gentle', goalTags:['relax','cheeks'], faceRegion:'cheek', animation:'cheek-relaxation', completionRule:'strokes', cue:'Rest the palms or fingertips on the cheeks, breathe, and let the face soften.', safety:'No kneading or squeezing. Stop if the skin feels hot, numb or irritated.', handPath:{region:'cheek',motion:'hold',direction:'soften',side:'both',strokes:2} },
    { id:'smile-muscle-release', name:'Smile-muscle relaxation', kind:'massage', tracking:FORM_TRACKING.HAND, reps:2, hold:2, evidence:'Guided', difficulty:'Gentle', goalTags:['relax','cheeks'], faceRegion:'cheek', animation:'smile-muscle-release', completionRule:'strokes', cue:'Place fingertips beside the mouth and soften the muscles while breathing normally.', safety:'Use a still, gentle touch. Do not pull the corners of the mouth.', handPath:{region:'mouth-side',motion:'hold',direction:'soften',side:'both',strokes:2} },
    { id:'masseter-circles', name:'Masseter-area gentle circles', kind:'massage', tracking:FORM_TRACKING.HAND, reps:3, hold:1, evidence:'Guided', difficulty:'Gentle', goalTags:['jaw-relax','relax'], faceRegion:'masseter', animation:'masseter-circles', completionRule:'strokes', cue:'With the teeth relaxed, make small circles over the thick cheek muscle near the back teeth.', safety:'Gentle contact only. Do not press into a painful spot or the jaw joint.', handPath:{region:'masseter',motion:'circle',direction:'circle',side:'both',strokes:3} },
    { id:'jawline-glide', name:'Jawline glide', kind:'massage', tracking:FORM_TRACKING.HAND, reps:3, hold:1, evidence:'Guided', difficulty:'Gentle', goalTags:['jaw-relax'], faceRegion:'jawline', animation:'jawline-glide', completionRule:'strokes', cue:'Glide along the jawline from the chin toward the ear without digging into the tissue.', safety:'Use a light glide and avoid the front and side of the neck.', handPath:{region:'jawline',motion:'glide',direction:'outward',side:'both',strokes:3} },
    { id:'chin-to-ear-glide', name:'Chin-to-ear glide', kind:'massage', tracking:FORM_TRACKING.HAND, reps:3, hold:1, evidence:'Guided', difficulty:'Gentle', goalTags:['jaw-relax'], faceRegion:'jawline', animation:'chin-to-ear-glide', completionRule:'strokes', cue:'Start at the chin and sweep along the jaw toward the ear in one smooth pass.', safety:'Keep contact comfortable and stay on the jawline, away from the throat.', handPath:{region:'chin-jaw',motion:'glide',direction:'outward',side:'both',strokes:3} },
    { id:'jaw-relaxation-sequence', name:'Jaw relaxation sequence', kind:'massage', tracking:FORM_TRACKING.HAND, reps:2, hold:2, evidence:'Guided', difficulty:'Gentle', goalTags:['jaw-relax','relax'], faceRegion:'jaw', animation:'jaw-relaxation-sequence', completionRule:'strokes', cue:'Let the teeth separate, place your fingers lightly at the jaw, and breathe out.', safety:'Never force the jaw open. Stop for clicking, locking, pain or discomfort.', handPath:{region:'masseter',motion:'hold',direction:'soften',side:'both',strokes:2} },
    { id:'chin-sweep', name:'Chin sweep', kind:'massage', tracking:FORM_TRACKING.HAND, reps:3, hold:1, evidence:'Guided', difficulty:'Gentle', goalTags:['refresh','jaw-relax'], faceRegion:'chin', animation:'chin-sweep', completionRule:'strokes', cue:'Sweep lightly across the chin from the center toward each side.', safety:'Use a light touch and keep the lips and jaw relaxed.', handPath:{region:'chin',motion:'glide',direction:'outward',side:'both',strokes:3} },
    { id:'chin-jaw-transition', name:'Chin-to-jaw transition', kind:'massage', tracking:FORM_TRACKING.HAND, reps:3, hold:1, evidence:'Guided', difficulty:'Gentle', goalTags:['jaw-relax'], faceRegion:'chin-jaw', animation:'chin-jaw-transition', completionRule:'strokes', cue:'Move from the center of the chin along the jawline toward the ear.', safety:'Stay on the jawline and never press into the throat or under the jaw.', handPath:{region:'chin-jaw',motion:'glide',direction:'outward',side:'both',strokes:3} },
    { id:'neck-relaxation', name:'Gentle neck relaxation', kind:'massage', tracking:FORM_TRACKING.HAND, reps:2, hold:2, evidence:'Guided', difficulty:'Gentle', goalTags:['relax','neck'], faceRegion:'neck', animation:'neck-relaxation', completionRule:'strokes', cue:'With shoulders down, glide lightly down the side of the neck toward the collarbone.', safety:'Use a feather-light touch on the side of the neck. Avoid the front of the throat and any pulse point.', handPath:{region:'side-neck',motion:'glide',direction:'downward',side:'both',strokes:2} },
    { id:'side-neck-glide', name:'Side-neck glide', kind:'massage', tracking:FORM_TRACKING.HAND, reps:3, hold:1, evidence:'Guided', difficulty:'Gentle', goalTags:['neck','refresh'], faceRegion:'neck', animation:'side-neck-glide', completionRule:'strokes', cue:'Glide from below the ear down toward the collarbone with minimal pressure.', safety:'Stay to the side of the neck. Stop for dizziness, numbness or discomfort.', handPath:{region:'side-neck',motion:'glide',direction:'downward',side:'both',strokes:3} },
    { id:'posture-reset', name:'Posture reset', kind:'align', tracking:FORM_TRACKING.GUIDED, reps:2, hold:6, evidence:'Moderate', difficulty:'Gentle', goalTags:['neck','posture'], faceRegion:'neck', animation:'posture-reset', cue:'Grow tall through the crown, soften the jaw and let the shoulders settle.', safety:'Stay in a neutral, comfortable position. Stop if the neck feels strained or dizzy.' },
    { id:'jaw-neck-reset', name:'Jaw + neck reset', kind:'align', tracking:FORM_TRACKING.GUIDED, reps:2, hold:6, evidence:'Moderate', difficulty:'Gentle', goalTags:['jaw-relax','neck','posture'], faceRegion:'jaw-neck', animation:'jaw-neck-reset', cue:'Let the teeth part, keep the head level, and breathe slowly into a tall posture.', safety:'Keep the movement small and comfortable. Stop for pain, clicking, locking or dizziness.' }
  ];
  EXERCISES.push(...MASSAGE_EXERCISES);
  Object.assign(SESSIONS, {
    'massage-morning':{id:'massage-morning',title:'3-minute Morning Refresh',duration:'3 min',category:'massage',goal:'refresh',difficulty:'Gentle',exerciseIds:['forehead-sweep','temple-circles','cheek-upward-sweep','side-neck-glide']},
    'massage-jaw':{id:'massage-jaw',title:'5-minute Jaw Relax',duration:'5 min',category:'massage',goal:'jaw-relax',difficulty:'Gentle',exerciseIds:['brow-relaxation','masseter-circles','jaw-release','jawline-glide','chin-to-ear-glide']},
    'massage-depuff':{id:'massage-depuff',title:'5-minute De-Puff Routine',duration:'5 min',category:'massage',goal:'refresh',difficulty:'Very gentle',exerciseIds:['orbital-sweep','under-eye-glide','cheek-outward-glide','chin-sweep','side-neck-glide']},
    'massage-reset':{id:'massage-reset',title:'7-minute Face Reset',duration:'7 min',category:'massage',goal:'relax',difficulty:'Gentle',exerciseIds:['forehead-release','brow-to-temple','cheek-relaxation','jaw-relaxation-sequence','jaw-neck-reset']},
    'massage-full':{id:'massage-full',title:'10-minute Full Face Massage',duration:'10 min',category:'massage',goal:'full-face',difficulty:'Gentle',exerciseIds:['forehead-sweep','brow-sweep','temple-circles','under-eye-glide','cheek-upward-sweep','masseter-circles','chin-jaw-transition','side-neck-glide']},
    'massage-evening':{id:'massage-evening',title:'Evening Unwind',duration:'5 min',category:'massage',goal:'relax',difficulty:'Gentle',exerciseIds:['forehead-release','temple-circles','smile-muscle-release','jaw-relaxation-sequence','neck-relaxation']},
    'massage-screen':{id:'massage-screen',title:'Screen-Time Face Reset',duration:'4 min',category:'massage',goal:'tension',difficulty:'Gentle',exerciseIds:['brow-sweep','orbital-sweep','brow-to-temple','jaw-release','posture-reset']},
    quick:{id:'quick',title:'Quick Face Reset',duration:'3 min',category:'quick',goal:'relax',difficulty:'Gentle',exerciseIds:['jaw-release','cheek-relaxation','posture-reset']}
  });
  Object.values(SESSIONS).forEach(session=>{
    if(!session.category)session.category=session.id==='yoga'?'yoga':session.id==='release'?'relax':session.id==='full'?'full':'jaw-neck';
    if(!session.goal)session.goal=session.category==='yoga'?'all':session.category==='jaw-neck'?'posture':'relax';
    if(!session.difficulty)session.difficulty='Gentle';
  });
  EXERCISES.forEach(exercise=>{
    exercise.instruction=exercise.instruction||exercise.cue;
    exercise.animation=exercise.animation||exercise.id;
    exercise.goalTags=exercise.goalTags||([exercise.kind==='smile'?'cheeks':exercise.kind==='release'?'relax':'posture']);
    exercise.faceRegion=exercise.faceRegion||'face';
    exercise.difficulty=exercise.difficulty||'Gentle';
  });
  const ROUTINES=Object.freeze(Object.values(SESSIONS));
  const MASSAGE_REGIONS=Object.freeze(['forehead','brow','temple','eye-area','under-eye','brow-temple','cheek','mouth-side','masseter','jawline','chin','chin-jaw','side-neck','jaw-neck']);

  const HAND_INDEX_TIP=8;
  const handPoint=hand=>Array.isArray(hand)&&hand[HAND_INDEX_TIP]&&Number.isFinite(hand[HAND_INDEX_TIP].x)&&Number.isFinite(hand[HAND_INDEX_TIP].y)?{x:hand[HAND_INDEX_TIP].x,y:hand[HAND_INDEX_TIP].y}:null;
  const facePoint=(points,index,fallback)=>points&&points[index]&&Number.isFinite(points[index].x)&&Number.isFinite(points[index].y)?{x:points[index].x,y:points[index].y}:fallback;
  function handLandmarkPoint(result){
    const hands=result&&Array.isArray(result.landmarks)?result.landmarks:(result&&Array.isArray(result.handLandmarks)?result.handLandmarks:[]);
    const point=hands.length?handPoint(hands[0]):null;
    return point?{point,hands}:null;
  }
  function handPathForExercise(exercise,points){
    if(!exercise||!exercise.handPath)return null;
    const left=facePoint(points,234,{x:.22,y:.48}),right=facePoint(points,454,{x:.78,y:.48});
    const browL=facePoint(points,105,{x:.36,y:.38}),browR=facePoint(points,334,{x:.64,y:.38});
    const cheekL=facePoint(points,50,{x:.36,y:.55}),cheekR=facePoint(points,280,{x:.64,y:.55});
    const chin=facePoint(points,152,{x:.5,y:.82}),mouthL=facePoint(points,61,{x:.40,y:.61}),mouthR=facePoint(points,291,{x:.60,y:.61});
    const top=facePoint(points,10,{x:.5,y:.22}),forehead=facePoint(points,151,{x:.5,y:.30});
    const templeL={x:(left.x+browL.x)/2,y:(left.y+browL.y)/2},templeR={x:(right.x+browR.x)/2,y:(right.y+browR.y)/2};
    const neckL={x:chin.x-.10,y:Math.min(1,chin.y+.16)},neckR={x:chin.x+.10,y:Math.min(1,chin.y+.16)};
    const side=exercise.handPath.side==='left'?{start:browL,end:templeL,anchor:templeL}:exercise.handPath.side==='right'?{start:browR,end:templeR,anchor:templeR}:null;
    const region=exercise.handPath.region;
    const pair={
      forehead:{start:{x:forehead.x,y:forehead.y+.04},end:{x:forehead.x,y:top.y+.01},anchor:forehead},
      brow:{start:browL,end:templeL,anchor:browL},temple:{start:templeL,end:templeL,anchor:templeL},
      'eye-area':{start:facePoint(points,230,{x:.39,y:.47}),end:templeL,anchor:facePoint(points,230,{x:.39,y:.47})},
      'under-eye':{start:facePoint(points,230,{x:.39,y:.52}),end:templeL,anchor:facePoint(points,230,{x:.39,y:.52})},
      'brow-temple':{start:browL,end:templeL,anchor:templeL},
      cheek:{start:cheekL,end:templeL,anchor:cheekL},'mouth-side':{start:mouthL,end:cheekL,anchor:mouthL},
      masseter:{start:facePoint(points,172,{x:.30,y:.66}),end:facePoint(points,172,{x:.30,y:.66}),anchor:facePoint(points,172,{x:.30,y:.66})},
      jawline:{start:chin,end:facePoint(points,172,{x:.30,y:.66}),anchor:chin},
      'chin-jaw':{start:chin,end:facePoint(points,172,{x:.30,y:.66}),anchor:chin},chin:{start:chin,end:mouthL,anchor:chin},
      'side-neck':{start:neckL,end:{x:neckL.x,y:Math.min(1,neckL.y+.14)},anchor:neckL},'jaw-neck':{start:chin,end:neckL,anchor:chin}
    }[region]||{start:cheekL,end:templeL,anchor:cheekL};
    if(side)return side;
    if(exercise.handPath.side==='both'){
      return {start:pair.start,end:pair.end,anchor:pair.anchor,mirrored:{start:{x:1-pair.start.x,y:pair.start.y},end:{x:1-pair.end.x,y:pair.end.y},anchor:{x:1-pair.anchor.x,y:pair.anchor.y}}};
    }
    return pair;
  }
  function pathDistance(point,start,end){
    const dx=end.x-start.x,dy=end.y-start.y,len=dx*dx+dy*dy||1;
    const t=clamp(((point.x-start.x)*dx+(point.y-start.y)*dy)/len,0,1);
    const near={x:start.x+dx*t,y:start.y+dy*t};
    return {t,distance:Math.hypot(point.x-near.x,point.y-near.y),near};
  }
  function angleDelta(next,previous){
    let delta=next-previous;
    while(delta>Math.PI)delta-=Math.PI*2;
    while(delta<-Math.PI)delta+=Math.PI*2;
    return delta;
  }
  function evaluateHandMovement(exercise,result,points,previous={}){
    const located=handLandmarkPoint(result);
    if(!located)return{accepted:false,handVisible:false,strokeComplete:false,score:null,tracking:FORM_TRACKING.HAND,correction:'Bring one hand into view',tracker:{}};
    const path=handPathForExercise(exercise,points),tip=located.point;
    const faceWidth=Math.max(.12,Math.abs((points&&points[454]?points[454].x:.8)-(points&&points[234]?points[234].x:.2)));
    const radius=faceWidth*(exercise.handPath&&exercise.handPath.region==='eye-area'?.32:.42);
    const candidates=[path,path&&path.mirrored].filter(Boolean).map(item=>({...path,...item}));
    let best=null;
    for(const candidate of candidates){
      const projection=pathDistance(tip,candidate.start,candidate.end);
      const dist=exercise.handPath.motion==='circle'?Math.hypot(tip.x-candidate.anchor.x,tip.y-candidate.anchor.y):projection.distance;
      if(!best||dist<best.distance)best={...candidate,...projection,distance:dist};
    }
    if(!best||best.distance>radius)return{accepted:false,handVisible:true,strokeComplete:false,score:Math.max(0,Math.round(74-best.distance/faceWidth*80)),tracking:FORM_TRACKING.HAND,correction:'Follow the marked path with a lighter touch',handPoint:tip,path,tracker:{last:tip}};
    const tracker={...previous,last:tip};
    let strokeComplete=false,progress=best.t;
    if(exercise.handPath.motion==='circle'){
      const angle=Math.atan2(tip.y-best.anchor.y,tip.x-best.anchor.x);
      const previousAngle=Number.isFinite(previous.angle)?previous.angle:angle;
      tracker.angle=angle;tracker.travel=(previous.travel||0)+Math.abs(angleDelta(angle,previousAngle));
      if(tracker.completed&&tracker.travel<.2)tracker.completed=false;
      if(!tracker.completed&&tracker.travel>=Math.PI*1.45){strokeComplete=true;tracker.completed=true;tracker.travel=0;}
      progress=Math.min(1,(tracker.travel||0)/(Math.PI*1.45));
    }else if(exercise.handPath.motion==='hold'){
      tracker.holdMs=(previous.holdMs||0)+16;strokeComplete=tracker.holdMs>=Math.max(550,(exercise.hold||1)*700);progress=Math.min(1,tracker.holdMs/Math.max(550,(exercise.hold||1)*700));
    }else{
      const direction=exercise.handPath.direction;
      if(tracker.completed&&best.t<.25)tracker.completed=false;
      const moved=Number.isFinite(previous.progress)?best.t-previous.progress:0;
      tracker.progress=Math.max(Number.isFinite(previous.progress)?previous.progress:0,best.t);
      if(direction==='downward')progress=1-best.t;else if(direction==='upward')progress=best.t;else progress=best.t;
      const enough=direction==='downward'?best.t>=.74:best.t>=.74;
      strokeComplete=!tracker.completed&&enough&&(moved>.015||!Number.isFinite(previous.progress));
      if(strokeComplete)tracker.completed=true;
    }
    return{accepted:true,handVisible:true,strokeComplete,score:Math.round(86+Math.min(14,progress*14)),tracking:FORM_TRACKING.HAND,correction:strokeComplete?'Nice and easy':'Follow the marked path slowly',handPoint:tip,path,motionProgress:progress,tracker};
  }

  let handLandmarkerPromise=null,handLandmarker=null;
  async function loadHandLandmarker(){
    if(handLandmarker)return handLandmarker;
    if(handLandmarkerPromise)return handLandmarkerPromise;
    handLandmarkerPromise=(async()=>{
      const base='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.20';
      const vision=await import(base+'/vision_bundle.mjs');
      const fileset=await vision.FilesetResolver.forVisionTasks(base+'/wasm');
      const model='https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
      const options={baseOptions:{modelAssetPath:model,delegate:'GPU'},runningMode:'VIDEO',numHands:1};
      try{handLandmarker=await vision.HandLandmarker.createFromOptions(fileset,options);}
      catch(error){handLandmarker=await vision.HandLandmarker.createFromOptions(fileset,{...options,baseOptions:{modelAssetPath:model,delegate:'CPU'}});}
      return handLandmarker;
    })().catch(error=>{handLandmarkerPromise=null;return null;});
    return handLandmarkerPromise;
  }

  const MAX_FRAME_GAP_MS=350;
  const validSignals=s=>!!s&&s.valid===true&&s.frontal===true&&['eyeTilt','centered','cornerLift','cornerAsymmetry','mouthOpen'].every(k=>typeof s[k]==='number'&&Number.isFinite(s[k]));
  const distance=(a,b)=>Math.hypot((a.x||0)-(b.x||0),(a.y||0)-(b.y||0));
  const exerciseById=id=>EXERCISES.find(item=>item.id===id)||null;
  function signalsFromLandmarks(points,dimensions){
    const required=[1,10,13,14,33,61,152,234,263,291,454];
    if(!Array.isArray(points)||!required.every(index=>points[index]&&['x','y'].every(k=>Number.isFinite(points[index][k])&&points[index][k]>=0&&points[index][k]<=1)))return{valid:false,frontal:false};
    // Landmarks normalize x by image width and y by image height. Put both
    // axes in one pixel scale before computing distances and movement ratios.
    if(dimensions){
      if(!Number.isFinite(dimensions.width)||!Number.isFinite(dimensions.height)||dimensions.width<=0||dimensions.height<=0)return{valid:false,frontal:false};
      const aspect=dimensions.height/dimensions.width;
      points=points.map(p=>p?{...p,y:p.y*aspect}:p);
    }
    const leftFace=points[234],rightFace=points[454],leftEye=points[33],rightEye=points[263],leftCorner=points[61],rightCorner=points[291],mouthTop=points[13],mouthBottom=points[14];
    const mouthWidth=distance(leftCorner,rightCorner)||.0001,faceWidth=distance(leftFace,rightFace)||.0001,mouthCenterY=(mouthTop.y+mouthBottom.y)/2;
    if(faceWidth<.01||mouthWidth<.005||distance(leftEye,rightEye)<.005||distance(points[10],points[152])<.01)return{valid:false,frontal:false};
    const leftLift=(mouthCenterY-leftCorner.y)/mouthWidth,rightLift=(mouthCenterY-rightCorner.y)/mouthWidth;
    return{valid:true,frontal:true,eyeTilt:Math.abs(leftEye.y-rightEye.y)/(distance(leftEye,rightEye)||.0001),centered:Math.abs(points[1].x-((leftFace.x+rightFace.x)/2))/faceWidth,cornerLift:(leftLift+rightLift)/2,cornerAsymmetry:Math.abs(leftLift-rightLift),mouthOpen:distance(mouthTop,mouthBottom)/mouthWidth,faceWidth,faceHeight:distance(points[10],points[152])};
  }
  function scoreForm(exercise,signals){
    if(!exercise||!validSignals(signals))return 0;
    let score=100;
    score-=clamp(signals.eyeTilt/.055,0,1)*28;
    score-=clamp(signals.centered/.08,0,1)*22;
    if(exercise.kind==='smile'){
      score-=clamp(signals.cornerAsymmetry/.08,0,1)*28;
      if(signals.cornerLift<exercise.minLift)score-=clamp((exercise.minLift-signals.cornerLift)/(exercise.minLift||.01),0,1)*28;
      if(signals.cornerLift>exercise.maxLift)score-=clamp((signals.cornerLift-exercise.maxLift)/.18,0,1)*24;
      if(signals.mouthOpen>.16)score-=18;
    }else if(exercise.kind==='release'){
      if(signals.mouthOpen<.025)score-=clamp((.025-signals.mouthOpen)/.025,0,1)*35;
      if(signals.mouthOpen>.16)score-=clamp((signals.mouthOpen-.16)/.14,0,1)*35;
    }else if(signals.mouthOpen>.16)score-=16;
    return Math.round(clamp(score,0,100));
  }
  function evaluateForm(exercise,signals){
    const score=scoreForm(exercise,signals);
    const aligned=validSignals(signals)&&signals.eyeTilt<=.055&&signals.centered<=.08;
    const released=!!exercise&&aligned&&signals.mouthOpen<.16&&(
      exercise.kind==='smile'?signals.cornerLift<exercise.minLift*.55&&signals.cornerAsymmetry<=.08:
      exercise.kind==='release'?signals.mouthOpen<.02:false);
    const result=(accepted,correction,tone='find')=>({accepted,correction,tone,score,released,tracking:exercise&&exercise.tracking});
    if(!exercise||!validSignals(signals))return result(false,'Center your face in the guide');
    if(signals.eyeTilt>.055)return result(false,'Level your eyes');
    if(signals.centered>.08)return result(false,'Center your face');
    if(exercise.kind==='release'){
      if(signals.mouthOpen<.025)return result(false,'Let your lips part slightly and soften the jaw');
      if(signals.mouthOpen>.16)return result(false,'Use a smaller jaw release - do not open wide');
    }else if(signals.mouthOpen>.16)return result(false,'Relax your jaw and soften your mouth');
    if(exercise.kind==='smile'){
      if(signals.cornerAsymmetry>.08)return result(false,'Lift both cheeks evenly');
      if(signals.cornerLift<exercise.minLift)return result(false,'Lift your cheeks gently');
      if(signals.cornerLift>exercise.maxLift)return result(false,'Soften the smile and keep your jaw loose');
    }
    return result(true,exercise.tracking===FORM_TRACKING.GUIDED?'Position ready - follow the movement cue gently':'Form locked - keep breathing','hold');
  }
  function phaseForEvent(event){
    if(event==='hold')return'HOLD';if(event==='rep'||event==='rest'||event==='release')return'RELEASE';if(event==='complete')return'COMPLETE';return'POSITION';
  }
  function createState(sessionId,now=0){const session=SESSIONS[sessionId]||SESSIONS.full;return{sessionId:session.id,exerciseIds:session.exerciseIds.slice(),exerciseIndex:0,rep:0,cleanReps:0,guidedReps:0,skippedExercises:0,lastFormScore:0,minHoldScore:100,heldMs:0,lastSampleAt:null,needsRelease:false,releaseMs:0,holdStartedAt:0,restUntil:0,startedAt:now,completed:false,event:'start',phase:'POSITION',correction:''};}
  function currentExercise(state){return state&&!state.completed?exerciseById(state.exerciseIds[state.exerciseIndex]):null;}
  function emitCoachState(state,form){
    if(typeof window==='undefined'||typeof window.dispatchEvent!=='function'||typeof window.CustomEvent!=='function')return;
    try{window.dispatchEvent(new window.CustomEvent('chisel:coach-state',{detail:{state:{...state},form:form?{...form}:null,exercise:currentExercise(state)}}));}catch{}
  }
  function finish(next,form){next.phase=phaseForEvent(next.event);emitCoachState(next,form);return next;}
  function advanceState(state,form,now){
    if(!state||state.completed)return state;
    const next={...state};
    const resetHold=()=>{next.holdStartedAt=0;next.heldMs=0;next.minHoldScore=100;};
    if(!Number.isFinite(now)||now<0||(next.lastSampleAt!==null&&now<=next.lastSampleAt)){
      resetHold();next.releaseMs=0;next.event='find';next.correction='Waiting for a fresh camera frame';
      return finish(next,form);
    }
    const gap=next.lastSampleAt===null?0:now-next.lastSampleAt;
    const fresh=gap<=MAX_FRAME_GAP_MS;
    next.lastSampleAt=now;
    next.lastFormScore=form&&Number.isFinite(form.score)?Math.round(clamp(form.score,0,100)):0;
    if(!fresh){resetHold();next.releaseMs=0;}
    const exercise=currentExercise(next);
    if(!exercise){next.completed=true;next.event='complete';return finish(next,form);}
    // Re-arming requires an observed, stable neutral release, not just a rest timer.
    if(next.needsRelease){
      next.releaseMs=form&&form.released===true&&fresh?(next.releaseMs||0)+gap:0;
      if(next.releaseMs<300){resetHold();next.event='release';next.correction='Release gently to neutral before the next repetition';return finish(next,form);}
      next.needsRelease=false;next.releaseMs=0;
    }
    if(next.restUntil&&now<next.restUntil){resetHold();next.event='rest';return finish(next,form);}
    next.restUntil=0;
    if(!form||form.accepted!==true){resetHold();next.event='find';next.correction=form&&form.correction||'Center your face in the guide';return finish(next,form);}
    if(exercise.completionRule==='strokes'&&form.fallback!==true&&form.strokeComplete!==true){resetHold();next.event='find';next.correction=form.correction||'Follow the marked path slowly';return finish(next,form);}
    if(!next.holdStartedAt){next.holdStartedAt=Math.max(now,.001);next.heldMs=0;next.minHoldScore=next.lastFormScore;}
    else next.heldMs=(next.heldMs||0)+gap;
    next.minHoldScore=Math.min(next.minHoldScore,next.lastFormScore);
    if(next.heldMs<exercise.hold*1000&&!(exercise.completionRule==='strokes'&&form.strokeComplete===true)){next.event='hold';next.correction=form.correction||'';return finish(next,form);}
    const clean=exercise.tracking===FORM_TRACKING.FORM&&next.minHoldScore>=80;
    if(clean)next.cleanReps=(next.cleanReps||0)+1;
    if(exercise.tracking===FORM_TRACKING.GUIDED||exercise.tracking===FORM_TRACKING.HAND||form.fallback===true)next.guidedReps=(next.guidedReps||0)+1;
    resetHold();next.rep+=1;next.correction='';
    next.needsRelease=exercise.kind==='smile'||exercise.kind==='release';
    if(next.rep>=exercise.reps){next.exerciseIndex+=1;next.rep=0;next.needsRelease=false;if(next.exerciseIndex>=next.exerciseIds.length){next.completed=true;next.event='complete';next.restUntil=0;return finish(next,form);}next.event='exercise';}
    else next.event='rep';
    next.restUntil=now+1300;return finish(next,form);
  }
  function skipExercise(state,now=0){
    if(!state||state.completed)return state;
    const next={...state,exerciseIndex:state.exerciseIndex+1,rep:0,skippedExercises:(state.skippedExercises||0)+1,holdStartedAt:0,heldMs:0,minHoldScore:100,lastSampleAt:Number.isFinite(now)?now:state.lastSampleAt,needsRelease:false,releaseMs:0,restUntil:0,event:'exercise',correction:'Exercise skipped'};
    if(next.exerciseIndex>=next.exerciseIds.length){next.exerciseIndex=state.exerciseIndex;next.event='skip-end';next.correction='Last movement — stop when you are ready';}
    return finish(next,{accepted:false,score:null,correction:next.correction,tracking:'guided'});
  }
  const sessionRequiresHand=id=>!!(SESSIONS[id]&&SESSIONS[id].exerciseIds.some(key=>{const item=exerciseById(key);return item&&item.tracking===FORM_TRACKING.HAND;}));
  return{SAFETY_COPY,FORM_TRACKING,EXERCISES,SESSIONS,ROUTINES,MASSAGE_REGIONS,exerciseById,signalsFromLandmarks,scoreForm,evaluateForm,createState,currentExercise,advanceState,skipExercise,handPathForExercise,evaluateHandMovement,loadHandLandmarker,sessionRequiresHand};
});

if(typeof window!=='undefined'&&typeof document!=='undefined'){
  window.addEventListener('load',()=>{
    const addCss=href=>{if(document.querySelector(`link[data-chisel-runtime="${href}"]`))return;const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.dataset.chiselRuntime=href;document.head.appendChild(link);};
    if(!document.getElementById('chiselLauncherLayerFix')){const layerFix=document.createElement('style');layerFix.id='chiselLauncherLayerFix';layerFix.textContent='.chl-launcher,.chp-launcher{z-index:180!important}';document.head.appendChild(layerFix);}
    const addScript=src=>new Promise((resolve,reject)=>{const prior=document.querySelector(`script[data-chisel-runtime="${src}"]`);if(prior){if(prior.dataset.loaded==='1')resolve();else prior.addEventListener('load',resolve,{once:true});return;}const script=document.createElement('script');script.src=src;if(src.endsWith('.mjs'))script.type='module';script.dataset.chiselRuntime=src;script.addEventListener('load',()=>{script.dataset.loaded='1';resolve();},{once:true});script.addEventListener('error',()=>reject(new Error(`Could not load ${src}`)),{once:true});document.body.appendChild(script);});
    (async()=>{try{
      await addScript('chisel-beauty-studio.js');
      await addScript('chisel-tryon-runtime-fixes.js');if(window.ChiselTryonRuntimeFixes)window.ChiselTryonRuntimeFixes.install();
      await addScript('chisel-tryon-hair-v5.js');if(window.ChiselTryonHairV5)window.ChiselTryonHairV5.install();
      await addScript('chisel-beard-tuning-v5.js');if(window.ChiselBeardTuningV5)window.ChiselBeardTuningV5.install();
      await addScript('chisel-style-guide-label.js');if(window.ChiselStyleGuideLabel)window.ChiselStyleGuideLabel.install();
      const fixStyleLabels=()=>{const first=document.querySelector('#styleTop .seg');if(!first)return;const buttons=first.querySelectorAll('button');if(buttons[0]){if(buttons[0].textContent!=='Short / structured')buttons[0].textContent='Short / structured';buttons[0].setAttribute('aria-label','Short structured hairstyle family');}if(buttons[1]){if(buttons[1].textContent!=='Long / layered')buttons[1].textContent='Long / layered';buttons[1].setAttribute('aria-label','Long layered hairstyle family');}first.setAttribute('aria-label','Browse by style family, not gender');};
      fixStyleLabels();const styleTop=document.getElementById('styleTop');if(styleTop&&!styleTop.dataset.styleFamilyObserver){styleTop.dataset.styleFamilyObserver='1';new MutationObserver(fixStyleLabels).observe(styleTop,{childList:true,subtree:true});}
      addCss('chisel-enhancements.css');await addScript('chisel-enhancements-core.js');await addScript('chisel-enhancements.js');
      await addScript('chisel-capture-quality.js');
      addCss('chisel-trainer-v2.css');addCss('chisel-skin-appearance.css');await addScript('chisel-skin-appearance-core.js');
      await addScript('chisel-trainer-demos.js');
      await addScript('chisel-trainer-v2.js');if(window.ChiselTrainerV2)window.ChiselTrainerV2.install();
      await addScript('chisel-skin-appearance.js');if(window.ChiselSkinAppearance)window.ChiselSkinAppearance.install();
      addCss('chisel-precision.css');
      for(const src of ['chisel-precision-stats.js','chisel-precision-protocol.js','chisel-precision-core.js','chisel-precision-face.js','chisel-precision-body.js','chisel-precision-ui.js','chisel-precision.js'])await addScript(src);
      await addScript('chisel-scan-guard.js');if(window.ChiselScanGuard)window.ChiselScanGuard.installBrowserGuard();
      await addScript('chisel-experience-polish.js');if(window.ChiselExperiencePolish)window.ChiselExperiencePolish.install();
      await addScript('chisel-product-polish.js');if(window.ChiselProductPolish)window.ChiselProductPolish.install();
      await addScript('chisel-reliability-runtime.js');if(window.ChiselReliabilityRuntime)window.ChiselReliabilityRuntime.install();
      addCss('chisel-studio-theme.css');await addScript('chisel-studio-theme.js');if(window.ChiselStudioTheme)window.ChiselStudioTheme.install();
      addCss('chisel-personal-studio.css');await addScript('chisel-personal-photo.js');
      await addScript('chisel-personal-studio.js');if(window.ChiselPersonalStudio)window.ChiselPersonalStudio.install();
      await addScript('chisel-look-catalog.mjs');await addScript('chisel-looks-core.js');await addScript('chisel-looks-gallery.js');
      addCss('chisel-looks-studio.css');await addScript('chisel-looks-studio.js');if(window.ChiselLooksStudio)window.ChiselLooksStudio.install();
      addCss('chisel-pro-tools.css');await addScript('chisel-policy-shared.js');await addScript('chisel-comparison-shared.js');await addScript('chisel-wallet-core.js');await addScript('chisel-credits-ui.js');if(window.ChiselCredits)window.ChiselCredits.install();
      await addScript('chisel-compare-tools.js');if(window.ChiselCompareTools)window.ChiselCompareTools.install();
    }catch(error){console.warn('[Chisel runtime] optional feature module failed to load',error);}})();
  },{once:true});
}
