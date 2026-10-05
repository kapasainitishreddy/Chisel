import fs from 'node:fs';
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
const out=process.env.CHISEL_QA_OUT||'/workspace/chisel-feature-polish-evidence/browser',base=process.argv[2]||'http://127.0.0.1:4173';
fs.mkdirSync(out,{recursive:true});
const checks={},errors=[];let browser,page;
try{
 browser=await puppeteer.launch({executablePath:process.env.CHROME||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));await page.setViewport({width:430,height:900});
 await page.goto(base+'/www/index.html',{waitUntil:'load'});await page.waitForFunction(()=>window.CHISEL_RUNTIME_STATUS?.completion?.status==='ready');
 await page.waitForFunction(()=>{const b=document.getElementById('boot');return !b||getComputedStyle(b).opacity==='0';});await page.evaluate(()=>openIdentity());await page.waitForSelector('#idModal.on');await page.click('#idX');await page.evaluate(()=>go('analyze'));
 if(process.env.CHISEL_BASELINE){
  for(const width of [360,430,1280]){await page.setViewport({width,height:900});await page.screenshot({path:`${out}/scan-${width}.png`});await page.evaluate(()=>openTrain());await page.screenshot({path:`${out}/trainer-${width}.png`});await page.evaluate(()=>closeARCoachPicker());}
  checks.baselineCaptured=true;
 }else{

  checks.capturePreparation=await page.$eval('.scan-prep',e=>e.children.length===3);
  checks.emptyJawline=await page.$eval('#chiselJawlineProgress',e=>e.textContent.includes('No accepted jawline batch yet'));
  await page.click('#chiselJawPrecision');await page.waitForSelector('#chiselPrecisionRoot:not([hidden])');checks.precisionConnected=true;await page.click('.chp-close');
  // Explicit local records verify comparison UI, never real measurement accuracy.
  const records=[{t:1791072000000,score:95,methodVersion:'fixture-v1',setup:{kind:'face',camera:'front',orientation:'portrait',aspect:1,fill:.5,brightness:100,protocolVersion:2},metrics:{jawWidth:{valid:true,value:.8,ci95:.01},gonialAngle:{valid:true,value:120,ci95:1}}}];
  records.push({...records[0],t:1791158400000,metrics:{jawWidth:{valid:true,value:.805,ci95:.01},gonialAngle:{valid:true,value:120.5,ci95:1}}});
  await page.evaluate(records=>ChiselPrecisionUI.writeStore({faceScans:records,bodyScans:[]}),records);
  checks.baselineAndUncertainty=await page.$eval('#chiselJawlineProgress',e=>e.textContent.includes('0.800 ± 0.010')&&e.textContent.includes('Within normal variation'));for(const width of [360,1280]){await page.setViewport({width,height:900});await page.$eval('#chiselJawlineProgress',e=>e.scrollIntoView({block:'start'}));await page.screenshot({path:`${out}/jawline-${width}.png`});}
  await page.evaluate(r=>ChiselPrecisionUI.writeStore({faceScans:[...r,{...r[1],t:r[1].t+86400000,methodVersion:'fixture-v2'}],bodyScans:[]}),records);
  checks.methodMismatch=await page.$eval('#chiselJawlineProgress',e=>e.textContent.includes('Not comparable'));
  await page.click('#chiselJawReport');checks.fullReport=await page.$eval('#chiselProgressSummary',e=>e.textContent.includes('Jaw ratio')&&e.textContent.includes('±'));await page.click('#chiselCompletionClose');
  checks.reportFocusReturned=await page.evaluate(()=>document.activeElement.id==='chiselJawReport');
  await page.evaluate(()=>{const c=document.createElement('canvas');c.width=100;c.height=100;c.getContext('2d').fillRect(0,0,100,100);const url=c.toDataURL();store.set('photos',[{t:1791072000000,url},{t:1791158400000,url}]);store.set('scans',[{t:1791072000000,bloat:50},{t:1791158400000,bloat:55}]);renderTimeline();});
  await page.focus('#baRange');await page.keyboard.press('ArrowRight');checks.keyboardComparison=await page.$eval('#baRange',e=>e.value==='51'&&e.getAttribute('aria-valuetext').includes('51'));
  checks.noDecorativeChart=await page.$eval('#scanHistory',e=>!e.innerHTML.includes('height:74px')&&e.textContent.includes('appearance snapshots'));
  // Permission cancellation and a late camera response exercise the actual app lifecycle.
  await page.click('#openAnalyze');await page.waitForSelector('#camConsent.on');await page.click('#camConsentNo');
  checks.consentCancel=await page.evaluate(()=>!scanMode&&!isCamOpen()&&camMode==='idle');
  await page.evaluate(()=>{store.set('cameraConsent',true);window.polishStopped=0;navigator.mediaDevices.getUserMedia=()=>new Promise(r=>window.polishResolveCamera=r);Object.defineProperty(cam,'srcObject',{configurable:true,writable:true,value:null});cam.play=async()=>{};faceKit.ready=async()=>true;readLandmarks=()=>null;});
  await page.evaluate(()=>document.getElementById('openAnalyze').click());await page.waitForFunction(()=>!!window.polishResolveCamera);await page.click('#camBack');
  await page.evaluate(()=>polishResolveCamera({getTracks:()=>[{stop(){window.polishStopped++;}}]}));await page.waitForFunction(()=>polishStopped===1);
  checks.lateCameraStopped=await page.evaluate(()=>!stream&&!detLoop&&!cam.srcObject);
  await page.evaluate(()=>{navigator.mediaDevices.getUserMedia=async()=>({getTracks:()=>[{stop(){}}]});_burst=[{old:true}];});
  await page.click('#openAnalyze');await page.waitForFunction(()=>stream!==null);checks.freshScan=await page.evaluate(()=>_burst.length===0&&scanMode);
  checks.keyboardCameraClose=await page.$eval('#camBack',e=>e.tagName==='BUTTON');await page.focus('#camBack');await page.keyboard.press('Enter');
  checks.cameraClosed=await page.evaluate(()=>!stream&&!isCamOpen());
  await page.evaluate(()=>{setCamMode('scan');document.getElementById('camwrap').classList.add('on');_burst=Array.from({length:10},()=>({frontal:false}));finalizeScan();});
  checks.weakScanRetake=await page.evaluate(()=>document.getElementById('scanTrustBadge').textContent.includes('Retake needed')&&store.get('scans').length===2&&document.getElementById('sgSub').textContent.startsWith('RETAKE'));
  await page.evaluate(()=>{_burst=Array.from({length:10},()=>({frontal:true,qLum:130,faceFill:.38,rollDeg:1,yaw:.01,blink:.1,jawTaper:.8,fWHR:1.7,shLw:1.4,shJc:.82,shFc:.9}));_lastScanFrameAt=performance.now()-1000;finalizeScan();});checks.staleBurstRetake=await page.evaluate(()=>document.getElementById('scanTrustBadge').textContent.includes('fresh camera frame')&&store.get('scans').length===2);await page.evaluate(()=>closeCam());checks.oldBadgeCleared=await page.evaluate(()=>!document.getElementById('scanTrustBadge'));
  await page.click('#openTrain');await page.click('[data-cs-goal="jaw-neck"]');await page.click('.ar-session[data-ctv2-session="jaw-chin"]');
  checks.routinePreview=await page.$eval('#ctv2Preview',e=>!e.hidden&&e.textContent.includes('See all movements'));
  await page.click('#ctv2StartRoutine');await page.waitForFunction(()=>trainMode&&!!stream);
  await page.evaluate(()=>{_arDemoUntil=0;_arForm={accepted:true,score:88};_arState.holdStartedAt=performance.now()-3000;_arState.heldMs=500;renderARCoachHud(performance.now());});
  await page.click('#ctv2Pause');checks.pauseResetsHold=await page.evaluate(()=>_arPaused&&_arState.heldMs===0&&document.getElementById('ctv2Pause').getAttribute('aria-pressed')==='true'&&!document.getElementById('arCoachHud').classList.contains('locked'));
  await page.evaluate(()=>{_arDemoUntil=0;trainStep({pts:[]});});checks.pauseVisible=await page.$eval('#arCoachHold',e=>e.textContent==='Paused'&&getComputedStyle(e).display!=='none');
  for(const [width,height] of [[360,900],[800,430],[1280,900]]){await page.setViewport({width,height});await page.screenshot({path:`${out}/training-${width}.png`});checks['trainingFits'+width]=await page.$eval('#arCoachHud',e=>e.scrollWidth<=e.clientWidth+1);checks['stopReachable'+width]=await page.$eval('#arCoachHud',e=>{e.scrollTop=e.scrollHeight;const stop=e.querySelector('#arCoachStop').getBoundingClientRect(),hud=e.getBoundingClientRect();return stop.top>=hud.top&&stop.bottom<=hud.bottom+1;});}
  await page.click('#arCoachStop');await page.evaluate(()=>go('analyze'));
  for(const width of [360,430,1280]){await page.setViewport({width,height:900});await page.screenshot({path:`${out}/scan-progress-${width}.png`});checks['scanFits'+width]=await page.$eval('[data-screen="analyze"]',e=>e.scrollWidth<=e.clientWidth+1);await page.click('#openTrain');await page.click('[data-cs-goal="massage"]');await page.click('.ar-session[data-ctv2-session="massage-morning"]');await page.screenshot({path:`${out}/trainer-preview-${width}.png`});checks['previewFits'+width]=await page.$eval('#arCoachModal .panel',e=>e.scrollWidth<=e.clientWidth+1);await page.evaluate(()=>closeARCoachPicker());}
  checks.noPageErrors=errors.length===0;assert.ok(Object.values(checks).every(Boolean),JSON.stringify(checks));

 }
}catch(error){if(page)checks.diagnostics=await page.evaluate(()=>({mode:camMode,stream:!!stream,consent:cameraConsented(),request:_cameraRequestId,resolveCamera:!!window.polishResolveCamera,camOpen:isCamOpen(),active:document.activeElement?.id,bodyClass:document.body.className})).catch(()=>null);errors.push(error.stack);process.exitCode=1;}finally{if(browser)await browser.close();fs.writeFileSync(out+'/report.json',JSON.stringify({scope:'Local Chromium UI checks; camera/model signals are explicit fixtures when supplied. No Android device or accuracy validation.',checks,errors},null,2));console.log(JSON.stringify({checks,errors}));}
