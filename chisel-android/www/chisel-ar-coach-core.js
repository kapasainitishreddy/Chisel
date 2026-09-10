(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ChiselARCoach = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const SAFETY_COPY = 'This does not reshape adult facial bones or spot-reduce fat. Face and neck training here is gentle movement, posture, muscle-control and relaxation practice. Keep your jaw relaxed and never force the movement. Stop for pain, clicking, locking, dizziness, numbness, or discomfort.';
  const FORM_TRACKING = Object.freeze({ FORM:'form', GUIDED:'guided' });
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

  const distance=(a,b)=>Math.hypot((a.x||0)-(b.x||0),(a.y||0)-(b.y||0));
  const exerciseById=id=>EXERCISES.find(item=>item.id===id)||null;
  function signalsFromLandmarks(points){
    const required=[1,10,13,14,33,61,152,234,263,291,454];
    if(!Array.isArray(points)||!required.every(index=>points[index]))return{valid:false,frontal:false};
    const leftFace=points[234],rightFace=points[454],leftEye=points[33],rightEye=points[263],leftCorner=points[61],rightCorner=points[291],mouthTop=points[13],mouthBottom=points[14];
    const mouthWidth=distance(leftCorner,rightCorner)||.0001,faceWidth=distance(leftFace,rightFace)||.0001,mouthCenterY=(mouthTop.y+mouthBottom.y)/2;
    const leftLift=(mouthCenterY-leftCorner.y)/mouthWidth,rightLift=(mouthCenterY-rightCorner.y)/mouthWidth;
    return{valid:true,frontal:true,eyeTilt:Math.abs(leftEye.y-rightEye.y)/(distance(leftEye,rightEye)||.0001),centered:Math.abs(points[1].x-((leftFace.x+rightFace.x)/2))/faceWidth,cornerLift:(leftLift+rightLift)/2,cornerAsymmetry:Math.abs(leftLift-rightLift),mouthOpen:distance(mouthTop,mouthBottom)/mouthWidth,faceWidth,faceHeight:distance(points[10],points[152])};
  }
  function scoreForm(exercise,signals){
    if(!exercise||!signals||!signals.valid||signals.frontal===false)return 0;
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
    if(!exercise||!signals||!signals.valid)return{accepted:false,correction:'Center your face in the guide',tone:'find',score};
    if(signals.frontal===false)return{accepted:false,correction:'Face the camera directly',tone:'find',score};
    if(signals.eyeTilt>.055)return{accepted:false,correction:'Level your eyes',tone:'find',score};
    if(signals.centered>.08)return{accepted:false,correction:'Center your face',tone:'find',score};
    if(exercise.kind==='release'){
      if(signals.mouthOpen<.025)return{accepted:false,correction:'Let your lips part slightly and soften the jaw',tone:'find',score};
      if(signals.mouthOpen>.16)return{accepted:false,correction:'Use a smaller jaw release - do not open wide',tone:'find',score};
    }else if(signals.mouthOpen>.16)return{accepted:false,correction:'Relax your jaw and soften your mouth',tone:'find',score};
    if(exercise.kind==='smile'){
      if(signals.cornerAsymmetry>.08)return{accepted:false,correction:'Lift both cheeks evenly',tone:'find',score};
      if(signals.cornerLift<exercise.minLift)return{accepted:false,correction:'Lift your cheeks gently',tone:'find',score};
      if(signals.cornerLift>exercise.maxLift)return{accepted:false,correction:'Soften the smile and keep your jaw loose',tone:'find',score};
    }
    const guided=exercise.tracking===FORM_TRACKING.GUIDED;
    return{accepted:true,correction:guided?'Position ready - follow the movement cue gently':'Form locked - keep breathing',tone:'hold',score};
  }
  function phaseForEvent(event){
    if(event==='hold')return'HOLD';if(event==='rep'||event==='rest')return'RELEASE';if(event==='complete')return'COMPLETE';return'POSITION';
  }
  function createState(sessionId,now=0){const session=SESSIONS[sessionId]||SESSIONS.full;return{sessionId:session.id,exerciseIds:session.exerciseIds.slice(),exerciseIndex:0,rep:0,cleanReps:0,lastFormScore:0,holdStartedAt:0,restUntil:0,startedAt:now,completed:false,event:'start',phase:'POSITION',correction:''};}
  function currentExercise(state){return state&&!state.completed?exerciseById(state.exerciseIds[state.exerciseIndex]):null;}
  function emitCoachState(state,form){
    if(typeof window==='undefined'||typeof window.dispatchEvent!=='function'||typeof window.CustomEvent!=='function')return;
    try{window.dispatchEvent(new window.CustomEvent('chisel:coach-state',{detail:{state:{...state},form:form?{...form}:null,exercise:currentExercise(state)}}));}catch{}
  }
  function finish(next,form){next.phase=phaseForEvent(next.event);emitCoachState(next,form);return next;}
  function advanceState(state,form,now){
    if(!state||state.completed)return state;const next={...state};
    if(form&&Number.isFinite(Number(form.score)))next.lastFormScore=Math.round(clamp(form.score,0,100));
    if(next.restUntil&&now<next.restUntil){next.holdStartedAt=0;next.event='rest';return finish(next,form);}if(next.restUntil)next.restUntil=0;
    if(!form||!form.accepted){next.holdStartedAt=0;next.event='find';next.correction=form&&form.correction?form.correction:'Center your face in the guide';return finish(next,form);}
    const exercise=currentExercise(next);if(!exercise){next.completed=true;next.event='complete';return finish(next,form);}
    if(!next.holdStartedAt){next.holdStartedAt=now;next.event='hold';next.correction=form.correction||'';return finish(next,form);}
    if(now-next.holdStartedAt<exercise.hold*1000){next.event='hold';next.correction=form.correction||'';return finish(next,form);}
    next.holdStartedAt=0;next.rep+=1;if(next.lastFormScore>=80)next.cleanReps=(next.cleanReps||0)+1;next.correction='';
    if(next.rep>=exercise.reps){next.exerciseIndex+=1;next.rep=0;if(next.exerciseIndex>=next.exerciseIds.length){next.completed=true;next.event='complete';next.restUntil=0;return finish(next,form);}next.event='exercise';}else next.event='rep';
    next.restUntil=now+1300;return finish(next,form);
  }
  return{SAFETY_COPY,FORM_TRACKING,EXERCISES,SESSIONS,exerciseById,signalsFromLandmarks,scoreForm,evaluateForm,createState,currentExercise,advanceState};
});

if(typeof window!=='undefined'&&typeof document!=='undefined'){
  window.addEventListener('load',()=>{
    const addCss=href=>{if(document.querySelector(`link[data-chisel-runtime="${href}"]`))return;const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.dataset.chiselRuntime=href;document.head.appendChild(link);};
    if(!document.getElementById('chiselLauncherLayerFix')){const layerFix=document.createElement('style');layerFix.id='chiselLauncherLayerFix';layerFix.textContent='.chl-launcher,.chp-launcher{z-index:180!important}';document.head.appendChild(layerFix);}
    const addScript=src=>new Promise((resolve,reject)=>{const prior=document.querySelector(`script[data-chisel-runtime="${src}"]`);if(prior){if(prior.dataset.loaded==='1')resolve();else prior.addEventListener('load',resolve,{once:true});return;}const script=document.createElement('script');script.src=src;script.dataset.chiselRuntime=src;script.addEventListener('load',()=>{script.dataset.loaded='1';resolve();},{once:true});script.addEventListener('error',()=>reject(new Error(`Could not load ${src}`)),{once:true});document.body.appendChild(script);});
    (async()=>{try{
      await addScript('chisel-beauty-studio.js');
      await addScript('chisel-tryon-runtime-fixes.js');if(window.ChiselTryonRuntimeFixes)window.ChiselTryonRuntimeFixes.install();
      await addScript('chisel-tryon-hair-v5.js');if(window.ChiselTryonHairV5)window.ChiselTryonHairV5.install();
      await addScript('chisel-beard-tuning-v5.js');if(window.ChiselBeardTuningV5)window.ChiselBeardTuningV5.install();
      await addScript('chisel-style-guide-label.js');if(window.ChiselStyleGuideLabel)window.ChiselStyleGuideLabel.install();
      const fixStyleLabels=()=>{const first=document.querySelector('#styleTop .seg');if(!first)return;const buttons=first.querySelectorAll('button');if(buttons[0]){if(buttons[0].textContent!=='Short / structured')buttons[0].textContent='Short / structured';buttons[0].setAttribute('aria-label','Short structured hairstyle family');}if(buttons[1]){if(buttons[1].textContent!=='Long / layered')buttons[1].textContent='Long / layered';buttons[1].setAttribute('aria-label','Long layered hairstyle family');}first.setAttribute('aria-label','Browse by style family, not gender');};
      fixStyleLabels();const styleTop=document.getElementById('styleTop');if(styleTop&&!styleTop.dataset.styleFamilyObserver){styleTop.dataset.styleFamilyObserver='1';new MutationObserver(fixStyleLabels).observe(styleTop,{childList:true,subtree:true});}
      addCss('chisel-enhancements.css');await addScript('chisel-enhancements-core.js');await addScript('chisel-enhancements.js');
      addCss('chisel-trainer-v2.css');addCss('chisel-skin-appearance.css');await addScript('chisel-skin-appearance-core.js');
      await addScript('chisel-trainer-v2.js');if(window.ChiselTrainerV2)window.ChiselTrainerV2.install();
      await addScript('chisel-skin-appearance.js');if(window.ChiselSkinAppearance)window.ChiselSkinAppearance.install();
      addCss('chisel-precision.css');
      for(const src of ['chisel-precision-stats.js','chisel-precision-protocol.js','chisel-precision-core.js','chisel-precision-face.js','chisel-precision-body.js','chisel-precision-ui.js','chisel-precision.js'])await addScript(src);
      await addScript('chisel-scan-guard.js');if(window.ChiselScanGuard)window.ChiselScanGuard.installBrowserGuard();
      await addScript('chisel-experience-polish.js');if(window.ChiselExperiencePolish)window.ChiselExperiencePolish.install();
      await addScript('chisel-product-polish.js');if(window.ChiselProductPolish)window.ChiselProductPolish.install();
    }catch(error){console.warn('[Chisel runtime] optional feature module failed to load',error);}})();
  },{once:true});
}