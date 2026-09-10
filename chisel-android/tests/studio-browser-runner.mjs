import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
const base=process.argv[2]||'http://127.0.0.1:4173';
const out='/tmp/chisel-studio-qa';fs.mkdirSync(out,{recursive:true});
const report={scope:'Actual rendered UI, navigation and local photo input; not empirical accuracy, physical Android or cloud realism',checks:{},details:{},errors:[]};
let browser;
const check=(name,value)=>{report.checks[name]=!!value;if(!value)throw Error(`Studio QA failed: ${name}`);};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
try{
 browser=await puppeteer.launch({executablePath:process.env.CHROME,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
 const page=await browser.newPage();await page.setViewport({width:430,height:900,deviceScaleFactor:1});
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto(`${base}/www/index.html`,{waitUntil:'load',timeout:30000});
 await page.waitForFunction(()=>document.documentElement.dataset.chiselTheme==='quiet-studio',{timeout:20000});
 await page.waitForSelector('#idModal.on',{visible:true,timeout:10000});
 await page.click('#idX');await page.waitForFunction(()=>!document.querySelector('#idModal.on'));
 check('identityAndMeaningfulContent',(await page.title()).startsWith('Chisel')&&await page.$('#cxpHomeHub'));
 check('noFrameworkErrorOverlay',await page.evaluate(()=>!document.querySelector('vite-error-overlay,nextjs-portal')));
 check('sameFivePrimaryRoutes',await page.$$eval('nav.tabs [data-route]',n=>n.length===5));
 check('oneToolsEntry',await page.evaluate(()=>getComputedStyle(document.querySelector('.chl-launcher')).display==='none'&&getComputedStyle(document.querySelector('.chp-launcher')).display==='none'&&!document.getElementById('csOrbitTrigger').hidden));
 for(const width of [360,430,768,1280]){
  await page.setViewport({width,height:900,deviceScaleFactor:1});
  await page.evaluate(()=>{go('home');document.querySelector('main.view').scrollTop=0;});await wait(120);
  const layout=await page.evaluate(()=>({body:document.body.scrollWidth,width:innerWidth,main:document.querySelector('main.view').clientWidth,content:document.querySelector('main.view').scrollWidth,button:getComputedStyle(document.querySelector('.cxp-focus-btn')).fontSize}));
  report.details[`home${width}`]=layout;
  check(`homeFits${width}`,layout.content<=layout.main+1&&layout.body<=layout.width+1);
  const headerLayout=await page.evaluate(()=>{
   const trigger=document.getElementById('csOrbitTrigger'),header=trigger.closest('.cs-masthead');
   const b=trigger.getBoundingClientRect(),h=header.getBoundingClientRect();
   const focus=document.querySelector('.cxp-focus-btn').getBoundingClientRect();
   return {inFlow:getComputedStyle(trigger).position==='static',shared:header.parentElement.matches('main.view'),
    target:b.width>=44&&b.height>=44,inside:b.left>=h.left&&b.right<=h.right+1,
    clear:b.bottom<=focus.top||b.top>=focus.bottom||b.right<=focus.left||b.left>=focus.right};
  });
  report.details[`header${width}`]=headerLayout;
  check(`toolsHeaderFits${width}`,Object.values(headerLayout).every(Boolean));
  await page.screenshot({path:`${out}/home-${width}.png`});
 }
 await page.setViewport({width:430,height:900,deviceScaleFactor:1});
 await page.click('#csOrbitTrigger');await page.waitForSelector('#csOrbit[open]');
 check('orbitIsNamedModal',await page.$eval('#csOrbit',n=>n.getAttribute('aria-labelledby')==='csOrbitTitle'));
 await page.screenshot({path:`${out}/orbit-430.png`});
 await page.click('#csOrbit [data-cs-open="train"]');await page.waitForSelector('#arCoachModal.on',{visible:true});
 check('orbitDestinationClosesOrbit',await page.$eval('#csOrbit',n=>!n.open));
 check('allSixSessionsInitiallyVisible',await page.$$eval('#arCoachModal .ar-session',n=>n.length===6&&n.every(x=>!x.hidden)));
 check('trainerBackgroundInert',await page.$eval('.app',n=>n.inert));
 check('trainerCloseTouchTarget',await page.$eval('#arCoachX',n=>{const r=n.getBoundingClientRect();return r.width>=44&&r.height>=44;}));
 check('readableSessionTypography',await page.$eval('#arCoachModal .ar-session strong',n=>parseFloat(getComputedStyle(n).fontSize)>=15));
 await page.screenshot({path:`${out}/trainer-430.png`});
 await page.click('[data-cs-goal="cheeks"]');
 check('cheeksFilter',await page.$$eval('#arCoachModal .ar-session:not([hidden])',n=>n.length===1&&n[0].textContent.includes('Cheek activation')));
 await page.keyboard.press('ArrowRight');
 check('keyboardPostureFilter',await page.$$eval('#arCoachModal .ar-session:not([hidden])',n=>n.length===2));
 await page.click('[data-cs-goal="all"]');
 check('allSessionsRestored',await page.$$eval('#arCoachModal .ar-session:not([hidden])',n=>n.length===6));
 await page.click('.cs-trainer-method>summary');
 check('trackingExplanationAccessible',await page.$eval('.cs-trainer-method',n=>n.open&&n.textContent.includes('Guided')));
 await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('#arCoachModal.on'));
 check('escapeRestoresBackground',await page.$eval('.app',n=>!n.inert));
 await page.click('#csOrbitTrigger');await page.click('#csOrbit [data-cs-open="skin"]');
 await page.waitForSelector('#csaShell',{visible:true});
 check('skinEmptyIsUnmeasured',await page.$eval('#csaResults',n=>n.hidden));
 check('analysisDisabledWithoutFile',await page.$eval('#csaAnalyze',n=>n.disabled));
 check('skinHasCaptureInstructions',await page.$$eval('.cs-capture-prep li',n=>n.length===3));
 check('qualityNotClaimedAccuracy',await page.$eval('#csSkinMethod',n=>n.textContent.includes('not an accuracy percentage')));
 await page.screenshot({path:`${out}/skin-430.png`});
 await page.click('.cs-skin-routine>summary');await page.click('#chl-build-skin');
 check('routineBuildChangesRealState',await page.$eval('#chl-skin-result',n=>n.textContent.trim().length>30));
 await page.screenshot({path:`${out}/skin-routine-430.png`});
 fs.writeFileSync(`${out}/invalid.txt`,'not an image');
 await (await page.$('#csaFile')).uploadFile(`${out}/invalid.txt`);
 check('invalidFileRejected',await page.$eval('#csaAnalyze',n=>n.disabled));
 await (await page.$('#csaFile')).uploadFile(path.resolve('tests/fixtures/portrait-male.jpg'));
 check('validFileEnablesAnalyze',await page.$eval('#csaAnalyze',n=>!n.disabled));
 // Exercise the real local model. A capture rejection is a legitimate outcome,
 // recorded separately from a successful result, never labelled accuracy validation.
 await page.click('#csaAnalyze');
 await page.waitForFunction(()=>!document.getElementById('csaAnalyze').hasAttribute('aria-busy'),{timeout:45000});
 report.details.skinPhotoOutcome=await page.evaluate(()=>({status:document.getElementById('csaStatus').textContent,resultsVisible:!document.getElementById('csaResults').hidden,quality:document.getElementById('csaConfidence').textContent}));
 check('photoFlowTerminatesHonestly',!!report.details.skinPhotoOutcome.status);
 await page.screenshot({path:`${out}/skin-photo-outcome-430.png`});
 await page.keyboard.press('Escape');
 await page.click('#csOrbitTrigger');await page.click('#csOrbit [data-cs-open="style"]');
 check('styleDiscoveryReachable',await page.$eval('[data-screen="analyze"]',n=>n.classList.contains('active')));
 check('unisexStylesPreserved',await page.$$eval('#cxStudioCard .cx-studio-btn b',n=>['Short / structured','Long / layered','Facial hair','Makeup / color'].every(s=>n.some(x=>x.textContent===s))));
 await page.screenshot({path:`${out}/style-430.png`});
 await page.click('#csOrbitTrigger');await page.click('#csOrbit [data-cs-open="precision"]');
 await page.waitForSelector('#chiselPrecisionRoot:not([hidden])',{visible:true});
 check('precisionStillReachable',await page.$eval('#chiselPrecisionRoot',n=>!n.hidden));
 await page.keyboard.press('Escape');
 await page.evaluate(()=>{go('home');document.querySelector('main.view').scrollTop=0;});
 await page.click('#csOrbitTrigger');await page.keyboard.press('Escape');
 check('orbitEscapeCloses',await page.$eval('#csOrbit',n=>!n.open));
 check('orbitFocusReturns',await page.evaluate(()=>document.activeElement.id==='csOrbitTrigger'));
 // Use actual controls, preserving the existing explicit-completion requirement.
 await page.click('[data-cxp-done]');
 check('dailyActionPersists',await page.$eval('[data-cxp-done]',n=>n.getAttribute('aria-pressed')==='true'));
 check('hubRerenderKeepsThemeIcons',await page.$$eval('.cs-action-icon',n=>n.length===4));
 await page.evaluate(()=>openPaywall());
 await page.waitForSelector('#paywall.on',{visible:true});
 check('restoreRemainsAvailable',await page.$eval('#paywallRestore',n=>!n.disabled));
 await page.screenshot({path:`${out}/pro-430.png`});
 await page.keyboard.press('Escape');
 await page.setViewport({width:360,height:900,deviceScaleFactor:1});
 await page.evaluate(()=>openTrain());await page.click('[data-cs-goal="all"]');
 await page.screenshot({path:`${out}/trainer-360.png`});
 check('smallTrainerFits',await page.$eval('#arCoachModal .panel',n=>n.scrollWidth<=n.clientWidth+1));
 await page.keyboard.press('Escape');
 await page.setViewport({width:1280,height:900,deviceScaleFactor:1});await page.evaluate(()=>openTrain());
 await page.screenshot({path:`${out}/trainer-1280.png`});
 check('desktopTrainerFits',await page.$eval('#arCoachModal .panel',n=>n.scrollWidth<=n.clientWidth+1));
 check('reducedMotionHonored',await page.$eval('#arCoachModal .panel',n=>getComputedStyle(n).animationName==='none'));
 await page.keyboard.press('Escape');
 check('noUncaughtAppErrors',report.errors.length===0);
}catch(error){report.errors.push(String(error.stack||error));process.exitCode=1;
 if(browser){const pages=await browser.pages();await pages.at(-1).screenshot({path:`${out}/failure.png`}).catch(()=>{});}
}finally{fs.writeFileSync(`${out}/report.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(browser)await browser.close();}
