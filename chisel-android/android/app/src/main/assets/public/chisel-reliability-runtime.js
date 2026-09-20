(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;else root.ChiselReliabilityRuntime=api;})(typeof globalThis!=='undefined'?globalThis:this,function(root){
'use strict';
let installed=false,pendingFrame=null,lastVideoTime=null,lastFreshAt=0,sessionKey=null;
const node=id=>root.document.getElementById(id);
function notice(message){const n=node('chiselCaptureTruth');if(n)n.textContent=message;if(typeof toast==='function')toast(message,5000);}
function paintTrainer(){
 if(typeof _arState==='undefined'||!_arState)return;
 const ex=root.ChiselARCoach.currentExercise(_arState);
 if(ex&&ex.tracking==='guided'){
  if(node('ctv2FormScore'))node('ctv2FormScore').textContent='Setup only';
  if(node('arCoachHold'))node('arCoachHold').textContent='Guided hold';
 }
 if(_arState.needsRelease){
  if(node('arCoachHold'))node('arCoachHold').textContent='Return to neutral';
  if(node('arCoachCue'))node('arCoachCue').textContent=_arState.correction;
  if(node('arCoachHud'))node('arCoachHud').classList.remove('locked');
  if(typeof setGuideMsg==='function')setGuideMsg('','RELEASE GENTLY TO NEUTRAL');
 }
}
function resetObservedHold(){
 if(typeof _arState==='undefined'||!_arState)return;
 const missing={accepted:false,released:false,score:0,correction:'Camera paused - center your face again'};
 _arState=root.ChiselARCoach.advanceState(_arState,missing,root.performance.now());
 if(typeof _arForm!=='undefined')_arForm=missing;
 if(typeof renderARCoachHud==='function')renderARCoachHud(root.performance.now());
}
function fullFrame(){
 const video=node('cam'),size=root.ChiselCaptureQuality.outputSize(video.videoWidth,video.videoHeight);
 const canvas=root.document.createElement('canvas');canvas.width=size.width;canvas.height=size.height;
 const ctx=canvas.getContext('2d');
 if(typeof facing!=='undefined'&&facing==='user'){ctx.translate(size.width,0);ctx.scale(-1,1);}
 ctx.drawImage(video,0,0,size.width,size.height);
 return canvas;
}
function beforeRender(event){
 const button=event.target&&event.target.closest&&event.target.closest('#photorealBtn,#prRetry');if(!button)return;
 const block=message=>{event.preventDefault();event.stopImmediatePropagation();pendingFrame=null;if(message)notice(message);};
 if(root.navigator&&root.navigator.onLine===false)return block('Realistic generation needs internet. The local Live Guide remains available.');
 if(button.disabled||typeof _prBusy!=='undefined'&&_prBusy)return block();
 const video=node('cam'),quality=root.ChiselCaptureQuality;
 if(!video||video.readyState<2||!quality)return block('Wait for the live camera before generating a hairstyle.');
 const landmarks=typeof readLandmarks==='function'?readLandmarks():null;
 const frameCheck=quality.assessFace(landmarks&&landmarks.pts,video.videoWidth,video.videoHeight,{hair:true});
 if(!frameCheck.accepted)return block(frameCheck.reasons[0]);
 try{
  const canvas=fullFrame(),b=frameCheck.bounds,mirrored=typeof facing!=='undefined'&&facing==='user';
  const x=Math.floor((mirrored?1-b.right:b.left)*canvas.width),y=Math.floor(b.top*canvas.height);
  const w=Math.floor((b.right-b.left)*canvas.width),h=Math.floor((b.bottom-b.top)*canvas.height);
  const captureCheck=quality.assessPixels(canvas.getContext('2d',{willReadFrequently:true}).getImageData(x,y,w,h));
  if(!captureCheck.accepted)return block(captureCheck.reasons[0]);
  if(!root.confirm('Generate a hairstyle preview? This sends this portrait to the configured Chisel cloud rendering service and its image provider. The result is an AI visualization, not a prediction or a verified measurement.'))return block('Photo not sent. You can keep using the local Live Guide.');
  pendingFrame={image:canvas.toDataURL('image/jpeg',.94),at:root.performance.now()};
 }catch(_){return block('Could not prepare a clear camera image. Retake the photo.');}
}
function install(){
 if(installed||!root||!root.document||!root.ChiselCaptureQuality)return installed;
 installed=true;
 const signals=root.ChiselARCoach&&root.ChiselARCoach.signalsFromLandmarks;
 if(signals)root.ChiselARCoach.signalsFromLandmarks=function(points,dimensions){
  const video=node('cam');
  return signals(points,dimensions||(video&&video.videoWidth&&video.videoHeight?{width:video.videoWidth,height:video.videoHeight}:undefined));
 };
 if(typeof trainStep==='function'){
  const original=trainStep;
  trainStep=function(data){
   const video=node('cam'),now=root.performance.now(),key=typeof _arState!=='undefined'&&_arState?_arState.startedAt:null;
   if(key!==sessionKey){lastVideoTime=null;sessionKey=key;}
   if(video&&video.currentTime===lastVideoTime){if(now-lastFreshAt>350)resetObservedHold();return;}
   lastVideoTime=video?video.currentTime:null;lastFreshAt=now;
   original(data);paintTrainer();
  };
 }
 root.document.addEventListener('visibilitychange',()=>{pendingFrame=null;if(root.document.hidden)resetObservedHold();lastVideoTime=null;});
 if(typeof capturePhotorealSource==='function')capturePhotorealSource=function(){
  if(pendingFrame&&root.performance.now()-pendingFrame.at<2000){const image=pendingFrame.image;pendingFrame=null;return image;}
  pendingFrame=null;
  return fullFrame().toDataURL('image/jpeg',.94);
 };
 root.document.addEventListener('click',beforeRender,true);
 const old=node('photorealNote');
 if(old&&!node('chiselCaptureTruth')){const p=root.document.createElement('p');p.id='chiselCaptureTruth';p.setAttribute('role','status');p.style.cssText='font:12px/1.5 var(--sans);color:var(--ivory-dim);margin:8px 0';p.textContent='AI visualization, not a prediction. Clear, uncropped camera input is checked before any optional cloud upload.';old.insertAdjacentElement('afterend',p);}
 root.document.documentElement.dataset.chiselReliability='1';
 return true;
}
return{install,beforeRender};
});
