(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.ChiselSkinAppearance=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
'use strict';
const HISTORY_KEY='chisel:skin-appearance:v1';
let installed=false,visionPromise=null,landmarkerPromise=null,selectedFile=null,busy=false;
const REGION_LABELS={forehead:'Forehead',leftCheek:'Left cheek',rightCheek:'Right cheek',chin:'Chin'};
function $(selector,scope){return (scope||document).querySelector(selector);}
function clamp(v,a,b){return Math.max(a,Math.min(b,Number(v)||0));}
function status(message){const node=$('#csaStatus');if(node)node.textContent=message;}
async function loadVision(){
  if(!visionPromise)visionPromise=import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.20/+esm');
  return visionPromise;
}
async function getFaceLandmarker(){
  if(landmarkerPromise)return landmarkerPromise;
  landmarkerPromise=(async()=>{
    const vision=await loadVision();const {FaceLandmarker,FilesetResolver}=vision;
    const files=await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.20/wasm');
    const baseOptions={modelAssetPath:'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',delegate:'GPU'};
    try{return await FaceLandmarker.createFromOptions(files,{baseOptions,runningMode:'IMAGE',numFaces:2,outputFaceBlendshapes:false,outputFacialTransformationMatrixes:false});}
    catch{return FaceLandmarker.createFromOptions(files,{baseOptions:{...baseOptions,delegate:'CPU'},runningMode:'IMAGE',numFaces:2,outputFaceBlendshapes:false,outputFacialTransformationMatrixes:false});}
  })();
  try{return await landmarkerPromise;}catch(error){landmarkerPromise=null;visionPromise=null;throw error;}
}
async function decodeImage(file){
  if(root.createImageBitmap)return root.createImageBitmap(file);
  return new Promise((resolve,reject)=>{const img=new Image();const url=URL.createObjectURL(file);img.onload=()=>{URL.revokeObjectURL(url);resolve(img);};img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Could not decode this image.'));};img.src=url;});
}
function faceBounds(points){
  const xs=points.map(p=>p.x),ys=points.map(p=>p.y);return{left:Math.min(...xs),right:Math.max(...xs),top:Math.min(...ys),bottom:Math.max(...ys)};
}
function rectFromFace(box,fx,fy,fw,fh,width,height){
  const bw=box.right-box.left,bh=box.bottom-box.top;
  const x=clamp(Math.round((box.left+bw*fx)*width),0,width-2),y=clamp(Math.round((box.top+bh*fy)*height),0,height-2);
  const w=clamp(Math.round(bw*fw*width),2,width-x),h=clamp(Math.round(bh*fh*height),2,height-y);
  return{x,y,w,h};
}
function regionRects(points,width,height){
  const box=faceBounds(points);
  return{
    forehead:rectFromFace(box,.29,.13,.42,.20,width,height),
    leftCheek:rectFromFace(box,.16,.43,.29,.24,width,height),
    rightCheek:rectFromFace(box,.55,.43,.29,.24,width,height),
    chin:rectFromFace(box,.34,.69,.32,.18,width,height)
  };
}
function analyzeRegions(ctx,rects){
  const core=root.ChiselSkinAppearanceCore;if(!core)throw new Error('Skin appearance core is unavailable.');
  const out={};for(const [key,rect] of Object.entries(rects)){const image=ctx.getImageData(rect.x,rect.y,rect.w,rect.h);out[key]=core.analyzePixelSet(image);}return out;
}
function drawRegions(ctx,rects){
  ctx.save();ctx.font='600 12px system-ui,-apple-system,sans-serif';ctx.lineWidth=2;
  for(const [key,r] of Object.entries(rects)){ctx.strokeStyle='rgba(224,199,157,.82)';ctx.fillStyle='rgba(7,7,8,.72)';ctx.strokeRect(r.x+.5,r.y+.5,r.w-1,r.h-1);const label=REGION_LABELS[key];const tw=ctx.measureText(label).width;ctx.fillRect(r.x,r.y,tw+12,21);ctx.fillStyle='rgba(244,239,231,.96)';ctx.fillText(label,r.x+6,r.y+15);}
  ctx.restore();
}
function planFor(metrics){
  const core=root.ChiselEnhancementsCore;if(!core||typeof core.buildSkinRecoveryPlan!=='function')return null;
  const sensitive=Boolean($('#chl-skin-sensitive')&&$('#chl-skin-sensitive').checked),weeks=Number($('#chl-skin-weeks')&&$('#chl-skin-weeks').value)||0;
  return core.buildSkinRecoveryPlan({blemish:metrics.blemishContrast,redLevel:metrics.redness,oilPct:metrics.shine,skinEven:clamp(100-(metrics.texture*.55+metrics.pigmentUnevenness*.45),0,100)},{sensitive,persistentWeeks:weeks});
}
function metricCard(key,value){
  const core=root.ChiselSkinAppearanceCore,def=core.METRIC_DEFS[key],band=core.signalBand(value);
  return `<article class="csa-metric"><div class="csa-metric-top"><span class="csa-metric-name">${def.label}</span><strong class="csa-metric-value">${Math.round(value)}</strong></div><span class="csa-band">${band.label}</span><div class="csa-meter" aria-hidden="true"><i style="width:${Math.round(value)}%"></i></div><p>${def.description}</p></article>`;
}
function regionCard(key,result){
  if(result.valid===false||!Number.isFinite(result.confidence)||result.confidence<42)return `<div class="csa-region"><strong>${REGION_LABELS[key]}</strong><span>Not measured: insufficient usable skin samples. Retake rather than interpreting a zero score.</span></div>`;
  const strongest=[['redness',result.redness],['shine',result.shine],['texture',result.texture],['pores',result.pores],['blemish-like contrast',result.blemishContrast],['pigment unevenness',result.pigmentUnevenness]].sort((a,b)=>b[1]-a[1]).slice(0,2);
  return `<div class="csa-region"><strong>${REGION_LABELS[key]}</strong><span>${strongest.map(([name,value])=>`${name} ${Math.round(value)}`).join(' · ')}</span></div>`;
}
function renderResults(metrics){
  const core=root.ChiselSkinAppearanceCore,summary=core.buildAppearanceSummary(metrics),plan=planFor(metrics);
  const results=$('#csaResults');if(!results)return;
  $('#csaMetrics').innerHTML=Object.keys(core.METRIC_DEFS).map(key=>metricCard(key,metrics[key])).join('');
  $('#csaRegions').innerHTML=Object.entries(metrics.regions||{}).map(([key,result])=>regionCard(key,result)).join('');
  const see=$('#csaSee');see.innerHTML=summary.attention.map(item=>`<li><strong>${item.label}</strong>: ${item.band.label.toLowerCase()} · ${item.value}/100</li>`).join('');
  const doList=$('#csaDo');
  if(plan){const actions=[...(plan.am||[]).slice(0,2),...(plan.pm||[]).slice(0,2)];doList.innerHTML=actions.map(item=>`<li><strong>${item.title}</strong> — ${item.detail}</li>`).join('');}
  else doList.innerHTML='<li>Keep the routine simple and consistent. Introduce changes one at a time so later comparisons remain interpretable.</li>';
  const compare=$('#csaCompare');compare.textContent=summary.compareRule;
  const headline=$('#csaCondition');headline.textContent=summary.headline;$('#csaConfidence').textContent=`${summary.confidence}/100`;
  $('#csaDisclaimer').textContent=summary.disclaimer+(plan&&plan.escalation&&plan.escalation[0]?` ${plan.escalation[0]}`:'');
  results.hidden=false;
}
function saveHistory(metrics){
  if(!root.localStorage)return;let history=[];try{history=JSON.parse(root.localStorage.getItem(HISTORY_KEY)||'[]');if(!Array.isArray(history))history=[];}catch{history=[];}
  const compact={createdAt:new Date().toISOString(),confidence:metrics.confidence,methodVersion:metrics.methodVersion};for(const key of Object.keys(root.ChiselSkinAppearanceCore.METRIC_DEFS))compact[key]=metrics[key];
  history.unshift(compact);root.localStorage.setItem(HISTORY_KEY,JSON.stringify(history.slice(0,30)));
}
async function analyzeSelected(){
  const button=$('#csaAnalyze');if(!selectedFile||!button||busy)return;busy=true;$('#csaFile').disabled=true;button.disabled=true;button.setAttribute('aria-busy','true');status('Checking face position and lighting…');
  try{
    const image=await decodeImage(selectedFile),canvas=$('#csaPreview'),ctx=canvas.getContext('2d',{willReadFrequently:true});
    const iw=image.width||image.naturalWidth,ih=image.height||image.naturalHeight,scale=Math.min(1,960/Math.max(iw,ih));canvas.width=Math.max(2,Math.round(iw*scale));canvas.height=Math.max(2,Math.round(ih*scale));ctx.drawImage(image,0,0,canvas.width,canvas.height);if(typeof image.close==='function')image.close();
    status('Mapping forehead, cheeks and chin on-device…');const landmarker=await getFaceLandmarker(),detected=landmarker.detect(canvas),points=detected&&detected.faceLandmarks&&detected.faceLandmarks[0];
    if(!points)throw new Error('No clear face found. Use a front-facing photo with the full face visible.');
    if(detected.faceLandmarks.length!==1)throw new Error('Use a photo containing exactly one face.');
    const quality=root.ChiselCaptureQuality;if(!quality)throw new Error('Capture checks are unavailable. Reload and retry.');
    const framing=quality.assessFace(points,canvas.width,canvas.height);if(!framing.accepted)throw new Error(framing.reasons[0]);
    const b=framing.bounds,facePixels=ctx.getImageData(Math.floor(b.left*canvas.width),Math.floor(b.top*canvas.height),Math.floor((b.right-b.left)*canvas.width),Math.floor((b.bottom-b.top)*canvas.height));
    const detail=quality.assessPixels(facePixels);if(!detail.accepted)throw new Error(detail.reasons[0]);
    const box=faceBounds(points),fill=(box.right-box.left)*(box.bottom-box.top);if(fill<.10)throw new Error('Move closer so your face fills more of the frame.');
    const rects=regionRects(points,canvas.width,canvas.height),regions=analyzeRegions(ctx,rects),metrics=root.ChiselSkinAppearanceCore.aggregateRegions(regions);
    if(!metrics.valid||metrics.confidence<42)throw new Error('Lighting or exposure is too inconsistent for a useful appearance comparison. Retake in soft, even light.');
    drawRegions(ctx,rects);$('#csaPreviewWrap').hidden=false;renderResults(metrics);saveHistory(metrics);status('Appearance scan complete. Photo pixels stayed on this device; only numeric history is saved locally. These cosmetic signals remain unvalidated estimates.');
  }catch(error){$('#csaResults').hidden=true;status(error&&error.message?error.message:'Could not analyze this photo. Try another clear, evenly lit image.');}
  finally{busy=false;$('#csaFile').disabled=false;button.disabled=!selectedFile;button.removeAttribute('aria-busy');}
}
function buildShell(panel){
  if($('#csaShell',panel))return;const shell=document.createElement('section');shell.id='csaShell';shell.className='csa-shell';shell.setAttribute('aria-labelledby','csaTitle');shell.innerHTML=`
    <div class="csa-top"><div><h4 id="csaTitle">Skin appearance scan</h4><p>See visible cosmetic signals by region, then turn them into a simple routine and a matched-condition comparison. No public beauty score.</p></div><span class="csa-local">On-device analysis</span></div>
    <div class="csa-actions"><label class="csa-file">Choose face photo<input id="csaFile" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Choose a face photo for skin appearance analysis"></label><button class="csa-button" id="csaAnalyze" type="button" disabled>Analyze appearance</button></div>
    <div class="csa-status" id="csaStatus" role="status" aria-live="polite">Use a front-facing photo in soft, even light. Avoid beauty filters and heavy makeup when tracking skin appearance.</div>
    <div class="csa-preview-wrap" id="csaPreviewWrap" hidden><canvas class="csa-preview" id="csaPreview" aria-label="Face photo with sampled forehead, cheek and chin regions"></canvas><div class="csa-capture"><div class="csa-capture-head"><strong id="csaCondition">Capture quality</strong><span class="csa-confidence" id="csaConfidence">Not checked</span></div><p>This is a photo-quality heuristic, not a probability of accuracy. Passing cannot establish skin health, pore size, hydration, or lighting equivalence.</p><p>Regions: forehead · left cheek · right cheek · chin</p></div></div>
    <div class="csa-results" id="csaResults" hidden>
      <section class="csa-section"><div class="csa-section-head"><h5>Appearance signals</h5><span>0–100 within-photo signals</span></div><div class="csa-metrics" id="csaMetrics"></div></section>
      <section class="csa-section"><div class="csa-section-head"><h5>Regional read</h5><span>Strongest visible signals</span></div><div class="csa-regions" id="csaRegions"></div></section>
      <section class="csa-section csa-guidance"><article class="csa-guide"><h5>What I see</h5><ul id="csaSee"></ul></article><article class="csa-guide"><h5>What to do</h5><ul id="csaDo"></ul></article><article class="csa-guide"><h5>Compare next</h5><p id="csaCompare"></p></article></section>
      <p class="csa-disclaimer" id="csaDisclaimer">Cosmetic appearance guidance only — this is not a diagnosis.</p>
    </div>`;
  const head=$('.chl-panel-head',panel);if(head)head.insertAdjacentElement('afterend',shell);else panel.prepend(shell);
  const file=$('#csaFile'),button=$('#csaAnalyze');file.addEventListener('change',()=>{const candidate=file.files&&file.files[0];selectedFile=null;button.disabled=true;$('#csaResults').hidden=true;$('#csaPreviewWrap').hidden=true;if(!candidate){status('Choose a clear front-facing photo to begin.');return;}if(!/^image\/(jpeg|png|webp)$/i.test(candidate.type)){status('Use a JPEG, PNG or WebP photo.');return;}if(candidate.size>15*1024*1024){status('Choose an image smaller than 15 MB.');return;}selectedFile=candidate;button.disabled=false;status(`Ready to analyze ${candidate.name}. Processing stays on-device.`);});button.addEventListener('click',analyzeSelected);
}
function install(attempt=0){
  if(installed||typeof document==='undefined')return installed;const panel=$('#chl-panel-skin');if(!panel){if(attempt<20)setTimeout(()=>install(attempt+1),120);return false;}installed=true;panel.dataset.skinAppearance='1';buildShell(panel);return true;
}
return{install,analyzeSelected,regionRects};
});