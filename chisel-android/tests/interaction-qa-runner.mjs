import fs from 'node:fs';
import process from 'node:process';
import puppeteer from 'puppeteer-core';

const baseUrl=process.argv[2]||'http://127.0.0.1:4173';
const chrome=process.env.CHROME;
if(!chrome)throw new Error('CHROME environment variable is required');

const jsonPath='/tmp/chisel-interaction-qa.json';
const screenshotPath='/tmp/chisel-interaction-qa.png';
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

  const installed=await page.waitForFunction(
    ()=>!!(window.ChiselProductPolish&&document.documentElement.dataset.cxpInstalled==='1'&&document.getElementById('cxpHomeHub')),
    {timeout:15000,polling:100}
  ).then(()=>true).catch(()=>false);
  result.checks.productPolishInstalled=installed;
  if(!installed)throw new Error('ChiselProductPolish did not install');

  await page.evaluate(()=>window.go('home'));
  await wait(60);

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
