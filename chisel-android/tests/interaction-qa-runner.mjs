import fs from 'node:fs';
import process from 'node:process';
import puppeteer from 'puppeteer-core';

const baseUrl=process.argv[2]||'http://127.0.0.1:4173';
const chrome=process.env.CHROME;
if(!chrome)throw new Error('CHROME environment variable is required');

const jsonPath='/tmp/chisel-interaction-qa.json';
const screenshotPath='/tmp/chisel-interaction-qa.png';
const trainerScreenshotPath='/tmp/chisel-interaction-trainer.png';
const skinScreenshotPath='/tmp/chisel-interaction-skin.png';
const result={checks:{},details:{},errors:[]};
let browser=null;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const annotationSafe=value=>String(value).replace(/%/g,'%25').replace(/\r/g,'%0D').replace(/\n/g,'%0A');

try{
  browser=await puppeteer.launch({
    executablePath:chrome,
    headless:true,
    args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']
  });
  const page=await browser.newPage();
  await page.setViewport({width:430,height:900,deviceScaleFactor:1});
  await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  page.on('pageerror',e=>result.errors.push(`page:${e.message||e}`));

  await page.goto(`${baseUrl}/www/index.html?interactionQa=1`,{waitUntil:'domcontentloaded',timeout:30000});
  await page.evaluate(()=>{
    localStorage.clear();
    localStorage.setItem('chisel:cameraConsent','true');
  });
  await page.reload({waitUntil:'domcontentloaded',timeout:30000});

  const bootCleared=await page.waitForFunction(
    ()=>!!document.getElementById('boot')?.classList.contains('gone'),
    {timeout:8000,polling:100}
  ).then(()=>true).catch(()=>false);
  result.checks.bootCleared=bootCleared;
  if(!bootCleared)throw new Error('Chisel boot splash did not clear before interaction QA');

  const installed=await page.waitForFunction(
    ()=>!!(window.ChiselProductPolish&&document.documentElement.dataset.cxpInstalled==='1'&&document.getElementById('cxpHomeHub')),
    {timeout:15000,polling:100}
  ).then(()=>true).catch(()=>false);
  result.checks.productPolishInstalled=installed;
  if(!installed)throw new Error('ChiselProductPolish did not install');

  const featureInstall=await page.waitForFunction(
    ()=>!!(window.ChiselTrainerV2&&window.ChiselSkinAppearance&&document.querySelector('#arCoachModal[data-trainer-v2="1"]')&&document.querySelector('#chl-panel-skin[data-skin-appearance="1"] #csaShell')),
    {timeout:12000,polling:100}
  ).then(()=>true).catch(()=>false);
  result.checks.trainerAndSkinInstalled=featureInstall;
  if(!featureInstall)throw new Error('Trainer v2 or Skin Appearance Lab did not install');

  await page.waitForFunction(()=>document.documentElement.dataset.personalStudio==='1',{timeout:12000,polling:100});
  result.checks.personalStudioInstalled=true;

  const featureState=await page.evaluate(()=>{
    const modal=document.getElementById('arCoachModal');
    const skin=document.getElementById('csaShell');
    const studio=document.getElementById('cxStudioCard');
    return{
      trainerTitle:document.getElementById('arCoachTitle')?.textContent?.trim()||'',
      trainerSessions:[...modal.querySelectorAll('.ar-session')].map(el=>el.textContent.replace(/\s+/g,' ').trim()),
      trainerGoalCards:modal.querySelectorAll('.ctv2-goal').length,
      trainerTrustCards:modal.querySelectorAll('.ctv2-trust-card').length,
      skinTitle:skin.querySelector('#csaTitle')?.textContent?.trim()||'',
      skinFileType:skin.querySelector('#csaFile')?.getAttribute('accept')||'',
      skinAnalyzeDisabled:skin.querySelector('#csaAnalyze')?.disabled===true,
      skinGuidance:[...skin.querySelectorAll('.csa-guide h5')].map(el=>el.textContent.trim()),
      skinLocal:/on-device/i.test(skin.textContent),
      styleFamilies:studio?[...studio.querySelectorAll('.cx-studio-btn b')].map(el=>el.textContent.trim()):[],
      studioUnisex:studio?.dataset.unisexPresentation==='1'
    };
  });
  result.details.features=featureState;
  result.checks.trainerTitle=featureState.trainerTitle==='Face training';
  result.checks.trainerSessionCoverage=featureState.trainerSessions.some(x=>/Cheek activation/i.test(x))&&featureState.trainerSessions.some(x=>/Jaw & chin posture/i.test(x))&&featureState.trainerSessions.some(x=>/Chin & neck support/i.test(x));
  result.checks.trainerTrustHierarchy=featureState.trainerGoalCards===3&&featureState.trainerTrustCards===2;
  result.checks.skinAppearanceShell=featureState.skinTitle==='Skin appearance scan'&&featureState.skinAnalyzeDisabled&&/image\/jpeg/.test(featureState.skinFileType);
  result.checks.skinGuidanceHierarchy=['What I see','What to do','Compare next'].every(label=>featureState.skinGuidance.includes(label))&&featureState.skinLocal;
  result.checks.unisexStyleShortcuts=featureState.studioUnisex&&['Short / structured','Long / layered','Facial hair','Makeup / color'].every(label=>featureState.styleFamilies.includes(label));

  const trainerOpened=await page.evaluate(()=>{
    if(typeof openTrain!=='function')return null;
    openTrain();
    const modal=document.getElementById('arCoachModal');
    const rects=[...modal.querySelectorAll('.ar-session')].map(el=>({width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height}));
    return{open:modal.classList.contains('on'),rects};
  });
  await wait(80);
  result.details.trainerOpen=trainerOpened;
  result.checks.trainerOpens=!!trainerOpened&&trainerOpened.open===true;
  result.checks.trainerTouchTargets=!!trainerOpened&&trainerOpened.rects.length>=5&&trainerOpened.rects.every(r=>r.width>=44&&r.height>=44);
  if(result.checks.trainerOpens)await page.screenshot({path:trainerScreenshotPath,fullPage:true});
  await page.evaluate(()=>document.getElementById('arCoachModal')?.classList.remove('on'));

  const skinOpened=await page.evaluate(()=>{
    if(!window.ChiselEnhancements||typeof window.ChiselEnhancements.openLabs!=='function')return null;
    window.ChiselEnhancements.openLabs('skin');
    const root=document.getElementById('chiselLabsRoot');
    const shell=document.getElementById('csaShell');
    return{
      open:!!root&&!root.hidden&&root.getAttribute('aria-hidden')==='false',
      width:shell?.getBoundingClientRect().width||0,
      chooseHeight:shell?.querySelector('.csa-file')?.getBoundingClientRect().height||0,
      analyzeHeight:shell?.querySelector('#csaAnalyze')?.getBoundingClientRect().height||0
    };
  });
  await wait(80);
  result.details.skinOpen=skinOpened;
  result.checks.skinLabOpens=!!skinOpened&&skinOpened.open===true;
  result.checks.skinTouchTargets=!!skinOpened&&skinOpened.chooseHeight>=44&&skinOpened.analyzeHeight>=44;
  if(result.checks.skinLabOpens)await page.screenshot({path:skinScreenshotPath,fullPage:true});
  await page.evaluate(()=>window.ChiselEnhancements?.closeLabs?.());

  await page.evaluate(()=>window.go('home'));
  await wait(60);

  // Secondary tools are progressively disclosed after the content-density review.
  await page.evaluate(()=>{const d=document.querySelector('.cs-quick-tools');if(d)d.open=true;});
  const homeState=await page.evaluate(()=>{
    const current=[...document.querySelectorAll('[data-route][aria-current="page"]')].map(el=>el.dataset.route);
    const actions=[...document.querySelectorAll('#cxpHomeHub [data-cxp-action]')].map(el=>({
      action:el.dataset.cxpAction,
      height:el.getBoundingClientRect().height,
      width:el.getBoundingClientRect().width
    }));
    const toast=document.getElementById('toast');
    const generic=[...document.querySelectorAll('.camctrl,.x,[data-route]')].filter(el=>(el.getAttribute('aria-label')||'').trim().toLowerCase()==='activate');
    return{
      activeScreen:document.querySelector('.screen.active[data-screen]')?.dataset.screen||'',
      current,
      actions,
      toast:{role:toast?.getAttribute('role'),live:toast?.getAttribute('aria-live'),atomic:toast?.getAttribute('aria-atomic')},
      genericLabels:generic.map(el=>el.id||el.dataset.route||el.className),
      navLabel:(document.getElementById('bottomTabs')||document.querySelector('nav.tabs'))?.getAttribute('aria-label')||''
    };
  });
  result.details.home=homeState;
  result.checks.homeIsActive=homeState.activeScreen==='home';
  result.checks.homeIsCurrent=homeState.current.length===1&&homeState.current[0]==='home';
  result.checks.fourQuickActions=homeState.actions.length===4;
  result.checks.touchTargets=homeState.actions.every(x=>x.height>=44&&x.width>=44);
  result.checks.toastLiveRegion=homeState.toast.role==='status'&&homeState.toast.live==='polite'&&homeState.toast.atomic==='true';
  result.checks.noGenericActivateLabels=homeState.genericLabels.length===0;
  result.checks.primaryNavNamed=homeState.navLabel==='Primary navigation';

  const navClick=await page.evaluate(()=>{
    const target=[...document.querySelectorAll('[data-route="analyze"]')].find(el=>el.closest('nav'))||document.querySelector('[data-route="analyze"]');
    if(!target)return false;
    target.click();
    return true;
  });
  await wait(80);
  const analyzeState=await page.evaluate(()=>({
    active:document.querySelector('.screen.active[data-screen]')?.dataset.screen||'',
    current:[...document.querySelectorAll('[data-route][aria-current="page"]')].map(el=>el.dataset.route),
    reduced:window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    animation:document.querySelector('[data-screen="analyze"]')?getComputedStyle(document.querySelector('[data-screen="analyze"]')).animationName:''
  }));
  result.details.analyze=analyzeState;
  result.checks.analyzeTabClickable=navClick&&analyzeState.active==='analyze';
  result.checks.analyzeIsCurrent=analyzeState.current.length===1&&analyzeState.current[0]==='analyze';
  result.checks.reducedMotionHonored=analyzeState.reduced&&analyzeState.animation==='none';

  await page.evaluate(()=>window.go('home'));
  await wait(60);
  const locked=await page.evaluate(()=>{
    const btn=document.querySelector('#cxpHomeHub [data-cxp-action="analyze"]');
    if(!btn)return null;
    btn.click();
    return{disabled:btn.disabled,busy:btn.getAttribute('aria-busy'),lock:btn.dataset.cxpLock||''};
  });
  const duplicateRejected=await page.evaluate(()=>{
    const btn=document.querySelector('#cxpHomeHub [data-cxp-action="analyze"]');
    return btn?window.ChiselProductPolish.lockAction(btn,50)===false:false;
  });
  await wait(720);
  const unlocked=await page.evaluate(()=>{
    const btn=document.querySelector('#cxpHomeHub [data-cxp-action="analyze"]');
    return btn?{disabled:btn.disabled,busy:btn.getAttribute('aria-busy'),lock:btn.dataset.cxpLock||''}:null;
  });
  result.details.quickAction={locked,duplicateRejected,unlocked};
  result.checks.quickActionLocks=!!locked&&locked.disabled===true&&locked.busy==='true'&&locked.lock==='1';
  result.checks.duplicateActivationRejected=duplicateRejected;
  result.checks.quickActionUnlocks=!!unlocked&&unlocked.disabled===false&&unlocked.busy===null&&unlocked.lock==='';

  await page.screenshot({path:screenshotPath,fullPage:true});
  const failed=Object.entries(result.checks).filter(([,value])=>!value).map(([key])=>key);
  if(failed.length)throw new Error(`Interaction QA failed: ${failed.join(', ')}`);
}catch(err){
  const message=err?.stack||err?.message||String(err);
  result.errors.push(message);
  console.error(`::error title=Chisel interaction QA::${annotationSafe(message)}`);
  process.exitCode=1;
}finally{
  try{fs.writeFileSync(jsonPath,JSON.stringify(result,null,2));}catch{}
  console.log(JSON.stringify(result,null,2));
  if(browser)await Promise.race([browser.close().catch(()=>{}),wait(4000)]);
}

process.exit(process.exitCode||0);
