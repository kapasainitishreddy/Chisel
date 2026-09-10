import fs from 'node:fs';
import puppeteer from 'puppeteer-core';

const base=process.argv[2]||'http://127.0.0.1:4173';
const out='/tmp/chisel-reliability-browser';
const report={scope:'Rendered UI and synthetic quality fixtures, not empirical accuracy or cloud generation',checks:{},errors:[]};
let browser;
fs.mkdirSync(out,{recursive:true});
try {
 browser=await puppeteer.launch({executablePath:process.env.CHROME,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
 const page=await browser.newPage();
 await page.setViewport({width:430,height:900,deviceScaleFactor:1});
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 page.on('pageerror',error=>report.errors.push(String(error.message||error)));
 await page.goto(`${base}/www/index.html`,{waitUntil:'load',timeout:30000});
 await page.waitForFunction(()=>document.documentElement.dataset.chiselReliability==='1'&&(!document.getElementById('boot')||getComputedStyle(document.getElementById('boot')).pointerEvents==='none'),{timeout:15000});
 report.checks.pageIdentity=(await page.title()).startsWith('Chisel');
 report.checks.runtimeInstalled=true;
 await page.evaluate(()=>openTrain());
 await page.waitForSelector('#arCoachModal.on',{visible:true});
 const trainer=await page.evaluate(()=>({sessions:document.querySelectorAll('#arCoachModal .ar-session').length,width:document.getElementById('arCoachModal').scrollWidth,viewport:innerWidth}));
 report.checks.sixTrainerSessions=trainer.sessions===6;
 report.checks.trainerFits=trainer.width<=trainer.viewport+1;
 await page.screenshot({path:`${out}/trainer.png`});
 report.closeBefore=await page.evaluate(()=>{
  window.__closeClicks=[];
  document.addEventListener('click',e=>window.__closeClicks.push({id:e.target.id,classes:e.target.className}),true);
  const b=document.getElementById('arCoachX'),r=b.getBoundingClientRect(),panel=b.closest('.panel');
  return{rect:{x:r.x,y:r.y,w:r.width,h:r.height},hit:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.outerHTML,animations:panel.getAnimations().map(a=>({state:a.playState,time:a.currentTime}))};
 });
 await page.click('#arCoachX');
 report.closeAfter=await page.evaluate(()=>({clicks:window.__closeClicks,open:document.getElementById('arCoachModal').classList.contains('on')}));
 report.checks.trainerCloses=await page.evaluate(()=>!document.getElementById('arCoachModal').classList.contains('on'));
 await page.evaluate(()=>ChiselEnhancements.openLabs('skin'));
 await page.waitForSelector('#csaShell',{visible:true});
 report.checks.skinEmptyHasNoScores=await page.evaluate(()=>document.getElementById('csaResults').hidden);
 report.checks.skinSections=await page.evaluate(()=>['What I see','What to do','Compare next'].every(text=>[...document.querySelectorAll('#csaShell .csa-guide h5')].some(n=>n.textContent===text)));
 await page.evaluate(()=>document.getElementById('csaShell').scrollIntoView({block:'start'}));
 await page.screenshot({path:`${out}/skin.png`});
 await page.evaluate(()=>ChiselEnhancements.closeLabs());
 report.checks.fullFrameShape=await page.evaluate(()=>{const r=ChiselCaptureQuality.outputSize(1920,1080);return r.width===1536&&r.height===864;});
 report.checks.clippedImageRejected=await page.evaluate(()=>{const data=new Uint8ClampedArray(128*128*4).fill(255);return !ChiselCaptureQuality.assessPixels({width:128,height:128,data}).accepted;});
 report.checks.photoDisclosure=await page.evaluate(()=>/not a prediction/.test(document.getElementById('chiselCaptureTruth').textContent));
 // No camera opened: dispatch through the real DOM event chain and verify the upload is blocked.
 report.checks.noCameraBlocksUpload=await page.evaluate(()=>{let reached=false;const b=document.getElementById('photorealBtn');const spy=()=>{reached=true;};b.addEventListener('click',spy);b.click();b.removeEventListener('click',spy);return !reached&&/Wait for the live camera/.test(document.getElementById('chiselCaptureTruth').textContent);});
 await page.setViewport({width:1280,height:900,deviceScaleFactor:1});
 await page.evaluate(()=>openTrain());
 await page.screenshot({path:`${out}/trainer-desktop.png`});
 report.checks.desktopFits=await page.evaluate(()=>document.getElementById('arCoachModal').scrollWidth<=innerWidth+1);
 report.checks.noUncaughtErrors=report.errors.length===0;
 const failed=Object.entries(report.checks).filter(([,v])=>!v).map(([k])=>k);
 if(failed.length)throw new Error(`Reliability UI checks failed: ${failed.join(', ')}`);
} catch(error) {
 report.errors.push(String(error.stack||error));process.exitCode=1;
} finally {
 fs.writeFileSync(`${out}/report.json`,JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));
 if(browser)await browser.close();
}
