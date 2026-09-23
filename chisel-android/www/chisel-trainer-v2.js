(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.ChiselTrainerV2=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';
  const STORAGE_KEY='chisel:trainer:v2',VOICE_KEY='chisel:trainer:voice';
  let installed=false,lastCompletionKey='',studioObserver=null,previewSessionId='',previewReturn=null;
  function $(selector,scope){return (scope||document).querySelector(selector);}
  function all(selector,scope){return Array.from((scope||document).querySelectorAll(selector));}
  function safeText(node,value){if(node&&node.textContent!==value)node.textContent=value;}
  function core(){return root&&root.ChiselARCoach;}
  function voiceEnabled(){try{return root.localStorage&&root.localStorage.getItem(VOICE_KEY)==='on';}catch{return false;}}
  function updateVoiceButtons(){const enabled=voiceEnabled();all('.ctv2-voice-toggle').forEach(button=>{button.textContent=`Voice ${enabled?'on':'off'}`;button.setAttribute('aria-pressed',String(enabled));button.setAttribute('aria-label',`Spoken guidance ${enabled?'on':'off'}`);});}
  function setVoiceEnabled(enabled){try{if(root.localStorage)root.localStorage.setItem(VOICE_KEY,enabled?'on':'off');}catch{}if(!enabled&&root.speechSynthesis)root.speechSynthesis.cancel();updateVoiceButtons();}
  function toggleVoice(){setVoiceEnabled(!voiceEnabled());}
  function speakGuidance(text){if(!voiceEnabled()||!text)return;try{if(typeof root.speak==='function'){root.speak(text,{rate:.82});return;}if(root.speechSynthesis&&root.SpeechSynthesisUtterance){root.speechSynthesis.cancel();const utterance=new root.SpeechSynthesisUtterance(text);utterance.rate=.82;root.speechSynthesis.speak(utterance);}}catch{}}
  function haptic(kind='light'){
    try{const plugin=root.Capacitor&&root.Capacitor.Plugins&&root.Capacitor.Plugins.Haptics;if(plugin){const result=kind==='complete'&&plugin.notification?plugin.notification({type:'SUCCESS'}):plugin.impact?plugin.impact({style:kind==='complete'?'HEAVY':'LIGHT'}):null;if(result&&typeof result.catch==='function')result.catch(()=>{});return;}}catch{}
    try{if(root.navigator&&typeof root.navigator.vibrate==='function')root.navigator.vibrate(kind==='complete'?[18,40,28]:kind==='start'?12:18);}catch{}
  }
  function completionHistory(){
    try{
      const history=JSON.parse(root.localStorage&&root.localStorage.getItem(STORAGE_KEY)||'[]');
      return Array.isArray(history)?history:[];
    }catch{return[];}
  }
  function todayRecommendation(now=new Date()){
    const history=completionHistory(),last=history[0],lastAt=last&&Date.parse(last.completedAt),age=now.getTime()-lastAt;
    if(last&&core()&&Object.hasOwn(core().SESSIONS,last.sessionId)&&Number.isFinite(lastAt)&&age>=0&&age<36*60*60*1000)return{sessionId:last.sessionId,label:'Repeat your last routine',reason:'Keep today simple and build consistency.'};
    const hour=now.getHours();
    if(hour<12)return{sessionId:'massage-morning',label:'Start with a morning refresh',reason:'A short, gentle way to begin the day.'};
    if(hour>=18)return{sessionId:'massage-evening',label:'Unwind for the evening',reason:'A quiet reset for jaw and facial tension.'};
    return{sessionId:'quick',label:'Start with a quick reset',reason:'Three minutes is enough to get moving.'};
  }
  function launchSession(sessionId){
    try{
      if(typeof startARCoach==='function'){startARCoach(sessionId);return true;}
      if(root&&typeof root.startARCoach==='function'){root.startARCoach(sessionId);return true;}
    }catch{}
    return false;
  }
  function sessionButton(grid,id,title,meta){
    let button=grid.querySelector(`[data-ctv2-session="${id}"]`);
    if(!button){button=document.createElement('button');button.type='button';button.className='ar-session ctv2-session';button.dataset.ctv2Session=id;grid.appendChild(button);}
    button.innerHTML=`<strong>${title}</strong><span>${meta}</span>`;button.setAttribute('aria-label',`${title}, ${meta}`);return button;
  }
  function upgradeLegacyButton(grid,legacy,id,title,meta){
    const button=grid.querySelector(`[data-ar-session="${legacy}"]`);if(!button)return null;
    button.dataset.arSession=id;button.dataset.ctv2Session=id;button.innerHTML=`<strong>${title}</strong><span>${meta}</span>`;button.setAttribute('aria-label',`${title}, ${meta}`);return button;
  }
  function phaseMarkup(){return '<div class="ctv2-phase" aria-label="Exercise phase"><span data-phase="POSITION">Position</span><span data-phase="HOLD">Hold</span><span data-phase="RELEASE">Release</span><span data-phase="COMPLETE">Done</span></div>';}
  function syncCompactGrid(grid){
    if(!grid)return;const buttons=all('.ar-session',grid);buttons.forEach(button=>button.classList.remove('ctv2-overflow'));const visible=buttons.filter(button=>!button.hidden),expanded=grid.dataset.expanded==='true';
    visible.forEach((button,index)=>button.classList.toggle('ctv2-overflow',index>=3));
    const toggle=$('#ctv2ViewAll');if(toggle){toggle.hidden=visible.length<=3;toggle.setAttribute('aria-expanded',String(expanded));toggle.textContent=expanded?'Show less':`View all ${visible.length}`;}
  }
  function saveCompletion(detail){
    if(!root||!root.localStorage||!detail||!detail.state||!detail.state.completed)return;
    const state=detail.state,key=`${state.sessionId}:${state.startedAt}`;if(key===lastCompletionKey)return;lastCompletionKey=key;
    let history=[];try{history=JSON.parse(root.localStorage.getItem(STORAGE_KEY)||'[]');if(!Array.isArray(history))history=[];}catch{history=[];}
    history.unshift({sessionId:state.sessionId,completedAt:new Date().toISOString(),cleanReps:Number(state.cleanReps)||0,lastFormScore:Number(state.lastFormScore)||0,guidedReps:Number(state.guidedReps)||0});
    try{root.localStorage.setItem(STORAGE_KEY,JSON.stringify(history.slice(0,30)));}catch{}
  }
  function updateLive(detail){
    if(!detail||!detail.state)return;
    const state=detail.state,form=detail.form||{},exercise=detail.exercise||{};
    const score=$('#ctv2FormScore'),phase=$('#ctv2PhaseText'),clean=$('#ctv2CleanReps'),tracking=$('#ctv2TrackingCopy');
    safeText(score,exercise.tracking==='hand-guided'?(form.fallback?'Guided mode':'Hand path'):(Number.isFinite(Number(form.score))?`${Math.round(Number(form.score))}/100`:`${Math.round(Number(state.lastFormScore)||0)}/100`));
    safeText(phase,state.phase||'POSITION');safeText(clean,String(Number(state.cleanReps)||0));
    if(tracking){
      if(exercise.tracking==='hand-guided')tracking.innerHTML=form.fallback?'<b>Guided mode:</b> hand guidance is unavailable, so follow the illustrated path gently.':'<b>Hand guidance:</b> position and movement direction are approximate; pressure is not measured.';
      else {const formTracked=exercise.tracking==='form';tracking.innerHTML=formTracked?'<b>Camera verified:</b> centering, range and symmetry gates are active.':'<b>Guided movement:</b> camera verifies setup and head position; follow the movement cue gently.';}
    }
    all('#arCoachHud .ctv2-phase span').forEach(node=>node.classList.toggle('on',node.dataset.phase===(state.phase||'POSITION')));
    const pause=$('#ctv2Pause');if(pause)pause.textContent=root&&typeof root.isARCoachPaused==='function'&&root.isARCoachPaused()?'Resume':'Pause';
    const next=$('#ctv2Next');if(next)next.textContent=state.exerciseIndex>=state.exerciseIds.length-1?'End':'Next';
    saveCompletion(detail);
  }
  function showCompletion(detail){
    const hud=$('#arCoachHud');if(!hud||!detail||!detail.state)return false;
    const state=detail.state,session=(core()&&core().SESSIONS&&core().SESSIONS[state.sessionId])||null;
    let card=$('#ctv2Complete',hud);if(!card){card=document.createElement('div');card.id='ctv2Complete';card.className='ctv2-complete';hud.appendChild(card);}
    const summary=completionSummary(state);
    card.innerHTML=`<span class="ctv2-complete-kicker">Session finished</span><strong>${summary.elapsed}</strong><span>Completed: ${summary.completed}/${summary.total} movements${summary.skipped?' · '+summary.skipped+' skipped':''}</span><div class="ctv2-complete-actions"><button type="button" class="btn ghost" id="ctv2CompleteRepeat">Repeat</button><button type="button" class="btn solid" id="ctv2CompleteDone">Done</button></div>`;
    hud.classList.add('is-complete');hud.hidden=false;
    $('#ctv2CompleteDone',card).onclick=()=>{if(root&&typeof root.closeCam==='function')root.closeCam();else if(typeof closeCam==='function')closeCam();};
    $('#ctv2CompleteRepeat',card).onclick=()=>{if(root&&typeof root.closeCam==='function')root.closeCam();else if(typeof closeCam==='function')closeCam();launchSession(state.sessionId);};
    $('#ctv2CompleteDone',card).focus({preventScroll:true});
    return true;
  }
  function completionSummary(state){
    const total=state.exerciseIds.length,skipped=Math.min(total,Math.max(0,Math.floor(Number(state.skippedExercises)||0)));
    const seconds=Math.max(0,Math.floor(((Number(state.lastSampleAt)||0)-(Number(state.startedAt)||0))/1000));
    return{total,skipped,completed:Math.max(0,(state.completed?total:state.exerciseIndex)-skipped),elapsed:`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')} elapsed`};
  }
  function closePreview(){
    const preview=$('#ctv2Preview'),modal=$('#arCoachModal'),panel=$('.panel',modal),body=$('.cps-trainer-body',panel),grid=$('.ar-session-grid',modal);
    if(preview){preview.hidden=true;preview.innerHTML='';}
    if(body)body.hidden=false;if(grid)grid.hidden=false;if(panel)panel.classList.remove('ctv2-preview-open');
    const target=previewReturn;previewReturn=null;previewSessionId='';
    if(target&&target.isConnected&&modal&&modal.classList.contains('on'))target.focus({preventScroll:true});
  }
  function benefitCopy(session){
    const goal=session&&session.goal;
    return ({refresh:'A light reset for a fresher, more awake appearance.','jaw-relax':'Gentle touch and movement for jaw comfort.','full-face':'A balanced pass across the face, jaw and neck.',relax:'A calm routine for facial tension and evening comfort.',tension:'Focused relief after long screen time.',posture:'Head, jaw and neck positioning practice.',all:'Balanced face control and relaxation.'})[goal]||'A short, comfort-first face and neck practice.';
  }
  function openRoutinePreview(id){
    const c=core(),session=c&&c.SESSIONS&&c.SESSIONS[id];if(!session)return launchSession(id);
    const modal=$('#arCoachModal'),panel=$('.panel',modal),grid=$('.ar-session-grid',modal);if(!panel||!grid)return launchSession(id);
    let preview=$('#ctv2Preview',panel);if(!preview){preview=document.createElement('section');preview.id='ctv2Preview';preview.className='ctv2-preview';preview.hidden=true;panel.appendChild(preview);}
    const body=$('.cps-trainer-body',panel);previewReturn=document.activeElement;previewSessionId=id;grid.hidden=true;if(body)body.hidden=true;preview.hidden=false;panel.classList.add('ctv2-preview-open');preview.setAttribute('aria-labelledby','ctv2PreviewTitle');
    const moves=session.exerciseIds.map(key=>c.exerciseById(key)).filter(Boolean),first=moves[0];
    const tracking=moves.some(x=>x.tracking==='hand-guided')?'Hand guidance + guided fallback':moves.every(x=>x.tracking==='form')?'Camera checked':'Guided + camera',isMassage=session.category==='massage';
    preview.innerHTML=`<button type="button" class="ctv2-preview-back" id="ctv2PreviewBack" aria-label="Back to routines"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg><span>Routines</span></button><div class="ctv2-preview-stage"><img src="chisel-trainer-sculpture.webp" alt="" decoding="async"><div class="ctv2-preview-shade"></div><span class="ctv2-preview-step">Movement 1 of ${moves.length}</span><div class="ctv2-preview-demo" id="ctv2PreviewDemo"></div></div><div class="ctv2-preview-head"><span class="ctv2-kicker">${session.duration} · ${moves.length} movements</span><h4 id="ctv2PreviewTitle">${session.title.replace(/^\d+-minute\s+/i,'')}</h4><p class="ctv2-preview-benefit">${benefitCopy(session)}</p></div><div class="ctv2-preview-instruction"><span>First movement</span><p class="ctv2-preview-cue">${first?first.instruction:''}</p></div><div class="ctv2-preview-meta"><span>${tracking}</span><span>Private · on-device</span></div>${isMassage?'<div class="ctv2-skin-note"><strong>Touch should feel comfortable</strong><span>Skip massage on irritated or painful skin. Camera guidance cannot measure pressure.</span><button type="button" class="btn ghost" id="ctv2NoTouch">Choose no-touch release</button></div>':''}<button type="button" class="ctv2-voice-toggle" id="ctv2VoiceToggle"></button><details><summary>See all movements</summary><ol>${moves.map(item=>`<li>${item.name}</li>`).join('')}</ol></details><div class="ctv2-preview-footer"><button type="button" class="btn solid ctv2-start-routine" id="ctv2StartRoutine">Start routine</button><p class="ctv2-frequency-note">Once daily is enough. Stop if anything feels painful or uncomfortable.</p><p class="ctv2-pressure-note">Camera guidance checks approximate position and direction. It does not measure finger pressure.</p></div>`;
    // Text and Start remain available when an optional illustration fails.
    try{if(root.ChiselTrainerDemos&&first)root.ChiselTrainerDemos.render(first,$('#ctv2PreviewDemo',preview),{reducedMotion:root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches});}catch{safeText($('#ctv2PreviewDemo',preview),'Follow the written technique below.');}
    const back=$('#ctv2PreviewBack',preview);back.onclick=closePreview;$('#ctv2VoiceToggle',preview).onclick=toggleVoice;$('#ctv2StartRoutine',preview).onclick=()=>{closePreview();launchSession(id);};const noTouch=$('#ctv2NoTouch',preview);if(noTouch)noTouch.onclick=()=>{closePreview();openRoutinePreview('release');};updateVoiceButtons();back.focus({preventScroll:true});
  }
  function matchesCategory(id,category){
    const session=core()&&core().SESSIONS&&core().SESSIONS[id];if(!session)return false;
    if(category==='all')return true;if(category==='massage')return session.category==='massage';if(category==='yoga')return session.category==='yoga';
    if(category==='jaw-neck')return session.category==='jaw-neck'||session.category==='relax';if(category==='quick')return session.category==='quick'||id==='quick';return true;
  }
  function installCategoryBar(grid){
    if($('#csTrainerFilters'))return $('#csTrainerFilters');
    const filters=document.createElement('div');filters.id='csTrainerFilters';filters.className='cs-segments ctv2-category-bar';filters.setAttribute('role','group');filters.setAttribute('aria-label','Trainer areas');
    [['all','All'],['yoga','Yoga'],['massage','Massage'],['jaw-neck','Jaw + Neck'],['quick','Quick']].forEach(([id,label],index)=>{const b=document.createElement('button');b.type='button';b.dataset.csGoal=id;b.setAttribute('aria-pressed',String(index===0));b.textContent=label;filters.appendChild(b);});
    grid.insertAdjacentElement('beforebegin',filters);
    const apply=category=>{all('button',filters).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.csGoal===category)));all('.ar-session',grid).forEach(b=>{b.hidden=!matchesCategory(b.dataset.ctv2Session||b.dataset.arSession,category);});grid.dataset.expanded='false';syncCompactGrid(grid);};
    filters.addEventListener('click',e=>{const b=e.target.closest('[data-cs-goal]');if(b)apply(b.dataset.csGoal);});apply('all');return filters;
  }
  function fixUnisexStudio(){
    if(typeof document==='undefined')return false;const card=$('#cxStudioCard');if(!card)return false;
    const copy=$('.cx-studio-copy',card);if(copy)safeText(copy,'Choose by style family and goal, not gender. Pick a look, then Chisel collapses the controls so you can see the result on your full face.');
    const relabel=(mode,title,meta,aria)=>{const button=card.querySelector(`[data-cx="${mode}"]`);if(!button)return;const b=button.querySelector('b'),small=button.querySelector('small');safeText(b,title);safeText(small,meta);button.setAttribute('aria-label',aria);};
    relabel('men','Short / structured','Crops, fades, texture + color','Short and structured hairstyle family');relabel('women','Long / layered','Layers, curls, waves + color','Long and layered hairstyle family');relabel('beard','Facial hair','Stubble, beard, goatee + moustache','Facial hair style studio');relabel('makeup','Makeup / color','Blush, lips, eyes + guide','Makeup and color style studio');card.dataset.unisexPresentation='1';return true;
  }
  function watchUnisexStudio(){
    if(fixUnisexStudio()||typeof MutationObserver==='undefined'||!document.body)return;if(studioObserver)return;
    studioObserver=new MutationObserver(()=>{if(fixUnisexStudio()){studioObserver.disconnect();studioObserver=null;}});studioObserver.observe(document.body,{childList:true,subtree:true});
  }
  function install(){
    if(installed||typeof document==='undefined')return installed;const modal=$('#arCoachModal');if(!modal)return false;installed=true;
    modal.dataset.trainerV2='1';const panel=$('.panel',modal),grid=$('.ar-session-grid',modal),title=$('#arCoachTitle',modal),intro=$('.ar-coach-intro',modal);safeText(title,'Face & Neck Trainer');
    if(typeof MutationObserver!=='undefined')new MutationObserver(()=>{if(!modal.classList.contains('on')&&previewSessionId)closePreview();}).observe(modal,{attributes:true,attributeFilter:['class']});
    safeText(intro,'Choose a short goal-based routine. Chisel keeps camera checks honest and labels hand movements as guided when the phone cannot verify them reliably.');
    if(grid){
      grid.setAttribute('aria-label','Face yoga and face massage routines');upgradeLegacyButton(grid,'jaw','jaw-chin','Jaw & chin posture','6 min · posture + control');upgradeLegacyButton(grid,'cheek','cheek-builder','Cheek activation','5 min · camera checked');upgradeLegacyButton(grid,'full','full','Full face + neck','10 min · mixed guidance');
      sessionButton(grid,'chin-support','Chin & neck support','7 min · guided posture');sessionButton(grid,'release','Face & jaw release','4 min · gentle mobility');sessionButton(grid,'massage-morning','3-minute Morning Refresh','4 moves · gentle massage');sessionButton(grid,'massage-jaw','5-minute Jaw Relax','5 moves · hand guided');sessionButton(grid,'massage-depuff','5-minute De-Puff Routine','5 moves · very gentle');sessionButton(grid,'massage-reset','7-minute Face Reset','5 moves · hand guided');sessionButton(grid,'massage-full','10-minute Full Face Massage','8 moves · hand guided');sessionButton(grid,'massage-evening','Evening Unwind','5 moves · hand guided');sessionButton(grid,'massage-screen','Screen-Time Face Reset','5 moves · gentle');sessionButton(grid,'quick','Quick Face Reset','3 moves · start here');const filters=installCategoryBar(grid);
      if(!$('#ctv2ViewAll')){const toggle=document.createElement('button');toggle.type='button';toggle.id='ctv2ViewAll';toggle.className='ctv2-view-all';toggle.addEventListener('click',()=>{grid.dataset.expanded=String(grid.dataset.expanded!=='true');syncCompactGrid(grid);});grid.insertAdjacentElement('afterend',toggle);}syncCompactGrid(grid);
      if(filters)filters.addEventListener('click',()=>setTimeout(()=>{grid.dataset.expanded='false';syncCompactGrid(grid);},0));setTimeout(()=>syncCompactGrid(grid),0);
      if(panel&&!$('#ctv2Today',panel)){const recommendation=todayRecommendation(),recommended=core()&&core().SESSIONS&&core().SESSIONS[recommendation.sessionId],today=document.createElement('section');today.id='ctv2Today';today.className='ctv2-today';today.innerHTML=`<div><span class="ctv2-kicker">Today</span><strong>${recommendation.label}</strong><span>${recommendation.reason}${recommended?' · '+recommended.duration:''}</span></div><button type="button" class="btn solid" id="ctv2TodayStart">Start</button>`;const anchor=filters||grid;anchor.insertAdjacentElement('beforebegin',today);$('#ctv2TodayStart',today).onclick=()=>openRoutinePreview(recommendation.sessionId);}
      if(typeof MutationObserver!=='undefined'){new MutationObserver(records=>{if(records.some(record=>record.attributeName==='hidden'))syncCompactGrid(grid);}).observe(grid,{subtree:true,attributes:true,attributeFilter:['hidden']});}
      grid.addEventListener('click',event=>{const button=event.target.closest('.ar-session');if(!button)return;event.preventDefault();event.stopImmediatePropagation();openRoutinePreview(button.dataset.ctv2Session||button.dataset.arSession);},true);
      if(panel&&!$('#ctv2MassageNote',panel)){const note=document.createElement('p');note.id='ctv2MassageNote';note.className='ctv2-note';note.textContent='Massage uses light, comfort-first touch. Stop for pain, clicking, locking, dizziness, numbness or discomfort.';grid.insertAdjacentElement('afterend',note);}
    }
    if(panel&&!$('#ctv2GoalBar',panel)){const goals=document.createElement('div');goals.id='ctv2GoalBar';goals.className='ctv2-goalbar';goals.innerHTML='<div class="ctv2-goal"><strong>Relax</strong><span>Jaw, brow and screen-time tension.</span></div><div class="ctv2-goal"><strong>Refresh</strong><span>Short, gentle movement and massage routines.</span></div><div class="ctv2-goal"><strong>Posture</strong><span>Neutral head and neck-control practice.</span></div>';grid&&grid.insertAdjacentElement('beforebegin',goals);}
    const hud=$('#arCoachHud');if(hud){
      if(!$('#ctv2Live',hud)){const live=document.createElement('div');live.id='ctv2Live';live.className='ctv2-live';live.innerHTML='<div class="ctv2-live-item"><small>Form score</small><strong id="ctv2FormScore">Not measured</strong></div><div class="ctv2-live-item"><small>Phase</small><strong id="ctv2PhaseText">POSITION</strong></div><div class="ctv2-live-item"><small>Clean reps</small><strong id="ctv2CleanReps">0</strong></div>';const status=$('.ar-hud-status',hud);if(status)status.insertAdjacentElement('afterend',live);else hud.appendChild(live);live.insertAdjacentHTML('afterend',phaseMarkup()+'<div class="ctv2-tracking" id="ctv2TrackingCopy"><b>Camera verified:</b> keep your face centered to begin.</div>');}
      if(!$('#ctv2Demo',hud)){const demo=document.createElement('div');demo.id='ctv2Demo';demo.className='ctv2-demo';demo.hidden=true;hud.insertBefore(demo,hud.firstChild);}
      if(!$('#ctv2Pause',hud)){const pause=document.createElement('button');pause.type='button';pause.id='ctv2Pause';pause.className='ctv2-pause';pause.textContent='Pause';pause.onclick=()=>root&&typeof root.toggleARCoachPause==='function'&&root.toggleARCoachPause();hud.appendChild(pause);}
      if(!$('.ctv2-actions',hud)){const actions=document.createElement('div');actions.className='ctv2-actions';hud.appendChild(actions);}
      const actions=$('.ctv2-actions',hud),pause=$('#ctv2Pause',hud),stop=$('#arCoachStop',hud);if(pause&&pause.parentElement!==actions)actions.appendChild(pause);
      if(!$('#ctv2Next',hud)){const next=document.createElement('button');next.type='button';next.id='ctv2Next';next.className='ctv2-next';next.textContent='Next';next.onclick=()=>root&&typeof root.skipARCoachExercise==='function'&&root.skipARCoachExercise();actions.appendChild(next);}
      if(stop){stop.classList.add('ctv2-stop-secondary');hud.appendChild(stop);}
      if(!$('#ctv2VoiceToggleHud',hud)){const voice=document.createElement('button');voice.type='button';voice.id='ctv2VoiceToggleHud';voice.className='ctv2-voice-toggle ctv2-voice-hud';voice.onclick=toggleVoice;hud.insertBefore(voice,actions);}updateVoiceButtons();
    }
    watchUnisexStudio();if(root&&root.addEventListener){root.addEventListener('chisel:coach-state',event=>updateLive(event.detail));root.addEventListener('chisel:trainer-complete',event=>showCompletion(event.detail));root.addEventListener('keydown',event=>{if(event.key==='Escape'&&previewSessionId){event.preventDefault();closePreview();}});}return true;
  }
  return{install,updateLive,showCompletion,completionSummary,todayRecommendation,launchSession,openRoutinePreview,closePreview,fixUnisexStudio,voiceEnabled,setVoiceEnabled,speakGuidance,haptic,syncCompactGrid};
});
