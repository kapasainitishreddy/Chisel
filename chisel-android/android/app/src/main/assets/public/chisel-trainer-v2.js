(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.ChiselTrainerV2=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
'use strict';
const STORAGE_KEY='chisel:trainer:v2';
let installed=false,lastCompletionKey='',studioObserver=null;
function $(selector,scope){return (scope||document).querySelector(selector);}
function safeText(node,value){if(node&&node.textContent!==value)node.textContent=value;}
function launchSession(sessionId){
  try{
    if(typeof startARCoach==='function'){startARCoach(sessionId);return true;}
    if(root&&typeof root.startARCoach==='function'){root.startARCoach(sessionId);return true;}
  }catch{}
  return false;
}
function sessionButton(grid,id,title,meta){
  let button=grid.querySelector(`[data-ctv2-session="${id}"]`);
  if(!button){
    button=document.createElement('button');button.type='button';button.className='ar-session ctv2-session';button.dataset.ctv2Session=id;
    button.addEventListener('click',()=>launchSession(id));grid.appendChild(button);
  }
  button.innerHTML=`<strong>${title}</strong><span>${meta}</span>`;
  button.setAttribute('aria-label',`${title}, ${meta}`);
  return button;
}
function upgradeLegacyButton(grid,legacy,id,title,meta){
  const button=grid.querySelector(`[data-ar-session="${legacy}"]`);if(!button)return null;
  button.dataset.arSession=id;button.dataset.ctv2Session=id;
  button.innerHTML=`<strong>${title}</strong><span>${meta}</span>`;
  button.setAttribute('aria-label',`${title}, ${meta}`);
  return button;
}
function phaseMarkup(){return '<div class="ctv2-phase" aria-label="Exercise phase"><span data-phase="POSITION">Position</span><span data-phase="HOLD">Hold</span><span data-phase="RELEASE">Release</span><span data-phase="COMPLETE">Done</span></div>';}
function saveCompletion(detail){
  if(!root||!root.localStorage||!detail||!detail.state||!detail.state.completed)return;
  const state=detail.state,key=`${state.sessionId}:${state.startedAt}`;if(key===lastCompletionKey)return;lastCompletionKey=key;
  let history=[];try{history=JSON.parse(root.localStorage.getItem(STORAGE_KEY)||'[]');if(!Array.isArray(history))history=[];}catch{history=[];}
  history.unshift({sessionId:state.sessionId,completedAt:new Date().toISOString(),cleanReps:Number(state.cleanReps)||0,lastFormScore:Number(state.lastFormScore)||0});
  root.localStorage.setItem(STORAGE_KEY,JSON.stringify(history.slice(0,30)));
}
function updateLive(detail){
  if(!detail||!detail.state)return;const state=detail.state,form=detail.form||{},exercise=detail.exercise||{};
  const score=$('#ctv2FormScore'),phase=$('#ctv2PhaseText'),clean=$('#ctv2CleanReps'),tracking=$('#ctv2TrackingCopy');
  safeText(score,Number.isFinite(Number(form.score))?`${Math.round(Number(form.score))}/100`:`${Math.round(Number(state.lastFormScore)||0)}/100`);
  safeText(phase,state.phase||'POSITION');safeText(clean,String(Number(state.cleanReps)||0));
  if(tracking){const formTracked=exercise.tracking==='form';tracking.innerHTML=formTracked?'<b>Camera verified:</b> centering, range and symmetry gates are active.':'<b>Guided movement:</b> camera verifies setup and head position; follow the movement cue gently.';}
  document.querySelectorAll('#arCoachHud .ctv2-phase span').forEach(node=>node.classList.toggle('on',node.dataset.phase===(state.phase||'POSITION')));
  saveCompletion(detail);
}
function fixUnisexStudio(){
  if(typeof document==='undefined')return false;const card=$('#cxStudioCard');if(!card)return false;
  const copy=$('.cx-studio-copy',card);if(copy)safeText(copy,'Choose by style family and goal, not gender. Pick a look, then Chisel collapses the controls so you can see the result on your full face.');
  const relabel=(mode,title,meta,aria)=>{const button=card.querySelector(`[data-cx="${mode}"]`);if(!button)return;const b=button.querySelector('b'),small=button.querySelector('small');safeText(b,title);safeText(small,meta);button.setAttribute('aria-label',aria);};
  relabel('men','Short / structured','Crops, fades, texture + color','Short and structured hairstyle family');
  relabel('women','Long / layered','Layers, curls, waves + color','Long and layered hairstyle family');
  relabel('beard','Facial hair','Stubble, beard, goatee + moustache','Facial hair style studio');
  relabel('makeup','Makeup / color','Blush, lips, eyes + guide','Makeup and color style studio');
  card.dataset.unisexPresentation='1';return true;
}
function watchUnisexStudio(){
  if(fixUnisexStudio()||typeof MutationObserver==='undefined'||!document.body)return;
  if(studioObserver)return;studioObserver=new MutationObserver(()=>{if(fixUnisexStudio()){studioObserver.disconnect();studioObserver=null;}});studioObserver.observe(document.body,{childList:true,subtree:true});
}
function install(){
  if(installed||typeof document==='undefined')return installed;const modal=$('#arCoachModal');if(!modal)return false;installed=true;
  modal.dataset.trainerV2='1';const panel=$('.panel',modal),grid=$('.ar-session-grid',modal),title=$('#arCoachTitle',modal),intro=$('.ar-coach-intro',modal);
  safeText(title,'Face & Neck Trainer');
  safeText(intro,'Choose a unisex, goal-based session. Chisel follows your face on-device, gives live form score feedback where the camera can verify it, and clearly labels movements that are guided rather than measured.');
  if(grid){
    grid.setAttribute('aria-label','Face and neck training sessions');
    upgradeLegacyButton(grid,'jaw','jaw-chin','Jaw & chin posture','6 min · posture + control');
    upgradeLegacyButton(grid,'cheek','cheek-builder','Cheek activation','5 min · limited evidence');
    upgradeLegacyButton(grid,'full','full','Full face + neck','10 min · mixed evidence');
    sessionButton(grid,'chin-support','Chin & neck support','7 min · posture support');
    sessionButton(grid,'release','Face & jaw release','4 min · gentle mobility');
  }
  if(panel&&!$('#ctv2GoalBar',panel)){
    const goals=document.createElement('div');goals.id='ctv2GoalBar';goals.className='ctv2-goalbar';goals.innerHTML='<div class="ctv2-goal"><strong>Cheeks</strong><span>Symmetry, lift range and clean holds.</span></div><div class="ctv2-goal"><strong>Jaw + chin posture</strong><span>Neutral-head and neck-control practice.</span></div><div class="ctv2-goal"><strong>Neck support <span class="ctv2-motion" aria-hidden="true"><i></i></span></strong><span>Guided posture work, not targeted fat loss.</span></div>';
    grid&&grid.insertAdjacentElement('beforebegin',goals);
    const trust=document.createElement('div');trust.className='ctv2-trust';trust.innerHTML='<div class="ctv2-trust-card"><b><span class="ctv2-dot"></span>Camera verified</b><p>Face centering, head level, cheek symmetry/range and gentle jaw-opening gates can pause a rep when form drifts.</p></div><div class="ctv2-trust-card"><b><span class="ctv2-dot"></span>Guided</b><p>Chin tucks, deep-neck nods and brow release use the camera for setup only. Chisel does not pretend it can measure muscle or bone change from one frame.</p></div>';
    grid&&grid.insertAdjacentElement('afterend',trust);
    const note=document.createElement('p');note.className='ctv2-note';note.textContent='For under-chin appearance, the trainer supports posture and neck control. It does not claim to selectively remove under-chin fat or reshape adult facial bones.';trust.insertAdjacentElement('afterend',note);
  }
  const hud=$('#arCoachHud');if(hud&&!$('#ctv2Live',hud)){
    const live=document.createElement('div');live.id='ctv2Live';live.className='ctv2-live';live.innerHTML='<div class="ctv2-live-item"><small>Form score</small><strong id="ctv2FormScore">0/100</strong></div><div class="ctv2-live-item"><small>Phase</small><strong id="ctv2PhaseText">POSITION</strong></div><div class="ctv2-live-item"><small>Clean reps</small><strong id="ctv2CleanReps">0</strong></div>';
    const status=$('.ar-hud-status',hud);if(status)status.insertAdjacentElement('afterend',live);else hud.appendChild(live);
    live.insertAdjacentHTML('afterend',phaseMarkup()+'<div class="ctv2-tracking" id="ctv2TrackingCopy"><b>Camera verified:</b> keep your face centered to begin.</div>');
  }
  watchUnisexStudio();
  if(root&&root.addEventListener)root.addEventListener('chisel:coach-state',event=>updateLive(event.detail));
  return true;
}
return{install,updateLive,launchSession,fixUnisexStudio};
});