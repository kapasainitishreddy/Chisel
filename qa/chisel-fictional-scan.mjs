/** Chisel source-pinned fictional-user QA. No cameras, photos, auth or purchases. */
import { chromium } from 'playwright';
import { mkdir,readFile,writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const BASE='http://127.0.0.1:4173', OUT=resolve('qa-output');
const PIN='1c08c6efa8ed5696e16fd0d288ca2cb62f41f85f';
await mkdir(resolve(OUT,'screenshots'),{recursive:true});
const actual=(await readFile(resolve(OUT,'target-commit.txt'),'utf8')).trim();
if(actual!==PIN)throw Error('Target checkout does not match pinned Chisel commit');
const checks=[],start=new Date().toISOString();
const save=(name,obj)=>writeFile(resolve(OUT,name),JSON.stringify(obj,null,2)+'\n');
const LENSES=[
 {id:'first-visit',name:'Mira',intent:'Understand the home experience without sharing a face',width:390,height:844},
 {id:'mobile-access',name:'Dev',intent:'Reach scan and understand the camera permission gate',width:360,height:800},
 {id:'inclusive-style',name:'Sam',intent:'Understand appearance and grooming options without an inferred gender',width:430,height:900},
 {id:'keyboard-reduced-motion',name:'Robin',intent:'Navigate with keyboard and see reduced-motion trainer controls',width:1280,height:900,reducedMotion:'reduce'},
 {id:'privacy-conscious',name:'Alex',intent:'Understand private processing, no fabricated scan and safe cloud costs',width:390,height:844},
];
const browser=await chromium.launch({headless:true});
for(const lens of LENSES){
 const context=await browser.newContext({
  viewport:{width:lens.width,height:lens.height},deviceScaleFactor:1,
  reducedMotion:lens.reducedMotion||'no-preference',permissions:[],
  serviceWorkers:'block',acceptDownloads:false,
 });
 const blocked=[],pageErrors=[],httpFailures=[],warnings=[];
 await context.route('**/*',async route=>{
  const req=route.request();
  try{
   const url=new URL(req.url());
   if(url.origin!==BASE||!['GET','HEAD','OPTIONS'].includes(req.method())){
    blocked.push({origin:url.origin,path:url.pathname,method:req.method()});
    await route.abort('blockedbyclient');return;
   }
  }catch{blocked.push({origin:'unknown'});await route.abort('blockedbyclient');return;}
  await route.continue();
 });
 if(context.routeWebSocket) await context.routeWebSocket('**/*',ws=>ws.close());
 await context.tracing.start({screenshots:true,snapshots:true});
 const page=await context.newPage();page.setDefaultTimeout(7000);
 page.on('pageerror',e=>pageErrors.push(e.message.slice(0,260)));
 page.on('console',m=>{if(m.type()==='warning')warnings.push(m.text().slice(0,240));});
 page.on('response',r=>{
  if(r.status()>=400){const url=new URL(r.url());httpFailures.push({path:url.pathname,status:r.status()})}
 });
 let shots=0;
 async function capture(label){
  const name='screenshots/'+lens.id+'-'+String(++shots).padStart(2,'0')+'-'+label+'.png';
  await page.screenshot({path:resolve(OUT,name),fullPage:false});
  return name;
 }
 async function check(id,description,fn){
  try{
   const result=await fn();const ok=result.pass;delete result.pass;
   checks.push({lens:lens.id,fictionalName:lens.name,id,expected:description,
    status:ok?'PASS':'FAIL',...result});
  }catch(e){
   checks.push({lens:lens.id,fictionalName:lens.name,id,expected:description,status:'ERROR',
    error:String(e?.message||e).slice(0,750),screenshot:await capture(id+'-error').catch(()=>undefined)});
  }
 }
 try{
  const response=await page.goto(BASE+'/www/index.html',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.getElementById('boot')?.classList.contains('gone'),
    {timeout:13000}).catch(()=>{});
  await check('page-renders','Chisel opens as a usable app with a primary navigation.',async()=>{
   const title=await page.title();
   const active=await page.locator('.screen.active[data-screen]').count();
   const nav=await page.locator('#bottomTabs [data-route]').count();
   return {pass:response?.status()===200&&title.includes('Chisel')&&active===1&&nav>=4,
    title,status:response?.status(),activeScreens:active,navItems:nav,screenshot:await capture('home')};
  });
  // A normal first-run modal has no permission to upload, analyze or start camera.
  await check('onboarding-exists','Identity/usage choice is optional and dismissible, with a privacy explanation.',async()=>{
   const modal=page.locator('#idModal');
   const visible=await modal.isVisible().catch(()=>false);
   const options=await page.locator('#idChips [data-gender]').count();
   const copy=await modal.locator('.lede').innerText().catch(()=> '');
   if(visible)await page.locator('#idX').click();
   const dismissed=await modal.evaluate(e=>!e.classList.contains('on')).catch(()=>false);
   return {pass:options>=4&&/Stored only on your device/i.test(copy)&&dismissed,
    modalPresented:visible,optionCount:options,copyMentionsLocalData:/stored only on your device/i.test(copy),
    dismissed,screenshot:await capture('after-intro')};
  });
  await check('responsive-root','The page has no horizontal overflow at the chosen viewport.',async()=>{
   const result=await page.evaluate(()=>({viewport:innerWidth,docWidth:document.documentElement.scrollWidth}));
   return {pass:result.docWidth<=result.viewport+2,...result};
  });
  if(lens.id==='first-visit'){
   await check('home-hub','A first-time visitor can find scan, style, trainer, and routine entries.',async()=>{
    const actions=await page.locator('#cxpHomeHub [data-cxp-action]').allTextContents();
    const has=await page.locator('#cxpHomeHub').count()>0;
    const named=['Scan now','Try-on Studio','Face Yoga','Routine'];
    return {pass:has&&named.every(n=>actions.some(t=>t.includes(n))),
     accessibleEntryPoints:actions.map(x=>x.replace(/\s+/g,' ').trim()).slice(0,10),
     screenshot:await capture('home-hub')};
   });
  }
  if(lens.id==='mobile-access'){
   await check('scan-tab','Visible mobile Analyze navigation switches exactly one selected view.',async()=>{
    const tab=page.locator('#bottomTabs [data-route="analyze"]');
    await tab.click();
    const active=await page.locator('.screen.active[data-screen]').getAttribute('data-screen');
    const selected=await page.locator('#bottomTabs [aria-current="page"]').count();
    return {pass:active==='analyze'&&selected===1,active,selected,screenshot:await capture('scan-tab')};
   });
   await check('camera-gate','No appearance score is fabricated without a camera/valid capture.',async()=>{
    const camera=await page.evaluate(()=>({
      mediaAvailable:typeof navigator.mediaDevices?.getUserMedia==='function',
      activeVideo:[...document.querySelectorAll('video')].filter(e=>e.readyState>=2 && !e.paused).length,
      analysisDisabled:document.querySelector('#photorealBtn')?.disabled ?? null,
      truth:document.querySelector('#chiselCaptureTruth')?.textContent?.slice(0,450)||''
    }));
    return {pass:camera.activeVideo===0&&/not a prediction|Wait for the live camera|local/i.test(camera.truth),
      ...camera,screenshot:await capture('scan-no-camera')};
   });
  }
  if(lens.id==='inclusive-style'){
   await check('inclusive-options','The optional onboarding supports male/female/non-binary/custom identity.',async()=>{
    const labels=await page.locator('#idChips [data-gender]').allTextContents();
    return {pass:['male','female','nonbinary','custom'].every(k=>labels.some(x=>x.toLowerCase().replace(/[^a-z]/g,'').includes(k))),
      selections:labels.map(s=>s.trim())};
   });
   await check('skin-empty-state','Appearance scan is inert before an image is selected.',async()=>{
    const inspected=await page.evaluate(()=>{
     window.ChiselEnhancements?.openLabs?.('skin');
     const file=document.getElementById('csaFile');
     const submit=document.getElementById('csaAnalyze');
     const shell=document.getElementById('csaShell');
     return {visible:!!shell&&shell.getBoundingClientRect().height>0,
       accept:file?.accept||'',disabled:!!submit?.disabled,resultsHidden:document.getElementById('csaResults')?.hidden===true};
    });
    return {pass:inspected.visible&&inspected.disabled&&inspected.resultsHidden,
     ...inspected,screenshot:await capture('skin-empty')};
   });
  }
  if(lens.id==='keyboard-reduced-motion'){
   await check('nav-keyboard','A nav control can be activated with keyboard and its selection is exposed.',async()=>{
    const tab=page.locator('#bottomTabs [data-route="groom"]');
    await tab.focus();await tab.press('Enter');
    const active=await page.locator('.screen.active').getAttribute('data-screen');
    const current=await page.locator('#bottomTabs [data-route="groom"]').getAttribute('aria-current');
    return {pass:active==='groom'&&current==='page',active,ariaCurrent:current,screenshot:await capture('keyboard-nav')};
   });
   await check('trainer-reduced-motion','Face and Neck Trainer is available without forced motion.',async()=>{
    await page.evaluate(()=>window.go('analyze'));
    await page.locator('#openTrain').click();
    const inspected=await page.evaluate(()=>{
      const panel=document.querySelector('#arCoachModal');
      return {open:panel?.classList.contains('on'),sessions:panel?.querySelectorAll('.ar-session').length??0,
       reduce:matchMedia('(prefers-reduced-motion: reduce)').matches,
       animation:panel?.querySelector('.panel')?getComputedStyle(panel.querySelector('.panel')).animationName:''};
    });
    return {pass:inspected.open&&inspected.sessions>=5&&inspected.reduce&&inspected.animation==='none',
     ...inspected,screenshot:await capture('reduced-motion-trainer')};
   });
  }
  if(lens.id==='privacy-conscious'){
   await check('local-privacy-copy','Privacy messaging is present; no real image/cloud request is required to use basics.',async()=>{
    const text=await page.locator('body').innerText();
    const local=/on-device|on your device|local processing/i.test(text);
    const disclosures=/photographic estimate|not a prediction|not medical|weak scans/i.test(text);
    return {pass:local&&disclosures,
     localCopyPresent:local,limitationsVisible:disclosures,screenshot:await capture('privacy-copy')};
   });
   await check('no-camera-or-payments','The controlled browser did not use a live camera, payment or cloud API.',async()=>{
    const used=await page.evaluate(()=>{
     const videos=[...document.querySelectorAll('video')].filter(v=>v.srcObject && v.readyState>=2);
     return {activeCameraStreams:videos.length};
    });
    return {pass:used.activeCameraStreams===0,...used,
     paymentProviderCalls:blocked.filter(r=>/payment|stripe|revenuecat|checkout|supabase/i.test(r.path||r.origin)).length,
     deniedRemoteRequests:blocked.length};
   });
  }
  await check('js-health','No uncaught JavaScript exceptions in this visitor journey.',async()=>({
   pass:pageErrors.length===0,errorCount:pageErrors.length,exceptions:pageErrors.slice(0,5),
   blockedCrossOriginCount:blocked.length,httpFailures:httpFailures.slice(0,6),warnings:warnings.slice(0,3)
  }));
 }catch(e){
  checks.push({lens:lens.id,fictionalName:lens.name,id:'browser-setup',status:'ERROR',
   error:String(e.message||e).slice(0,700),screenshot:await capture('setup-error').catch(()=>undefined)});
 }finally{
  await context.tracing.stop({path:resolve(OUT,lens.id+'-trace.zip')}).catch(()=>{});
  await context.close();await save('checks.json',checks);
 }
}
await browser.close();
const summary={
 kind:'fictional-scripted-browser-QA',app:'Chisel',targetRepository:'kapasainitishreddy/Chisel',
 pinnedCommit:actual,startedAt:start,endedAt:new Date().toISOString(),
 location:'localhost pinned source HTML',humanParticipants:0,paidModelCalls:0,modelDrivenPersonaReasoning:false,
 cameraUsed:false,cloudProductionConnected:false,sourceCodeModified:false,
 fictionalLenses:LENSES.map(({id,name,intent,width,height})=>({id,name,intent,viewport:{width,height}})),
 totals:{checks:checks.length,passed:checks.filter(c=>c.status==='PASS').length,
  failed:checks.filter(c=>c.status==='FAIL').length,errors:checks.filter(c=>c.status==='ERROR').length},
 checks,limitations:[
  'This is a scripted Chromium website-shell scan, not an Android native-camera or on-device face-accuracy trial.',
  'No biometric measurements, actual face photographs, payments, OTPs, or developer cloud accounts were tested.',
  'Some third-party fonts and remote resources are intentionally blocked by the isolated environment.',
  'Fictional lenses are not real people, preferences, satisfaction, health outcomes, or legal/compliance attestations.',
 ]};
await save('summary.json',summary);
console.log('CHISEL_QA_RESULT '+JSON.stringify({
 pinnedCommit:actual,lenses:LENSES.length,...summary.totals,
 failures:checks.filter(c=>c.status!=='PASS').map(c=>({lens:c.lens,id:c.id,status:c.status,error:c.error||null})),
}));
if(summary.totals.failed||summary.totals.errors)process.exitCode=1;
