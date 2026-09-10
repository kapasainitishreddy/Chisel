import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
const base=process.argv[2]||'http://127.0.0.1:4173',out='/tmp/chisel-looks-qa';
fs.mkdirSync(out,{recursive:true});
const report={scope:'Real app controls, storage and image decode with explicitly mocked provider responses and face checks. No paid generation or visual-realism validation.',checks:{},errors:[],calls:[]};
const fixture=path.resolve('tests/fixtures/portrait-male.jpg'),bytes=fs.readFileSync(fixture);
let browser,page,interrupt=false;const jobs=new Map();
const check=(name,value)=>{report.checks[name]=!!value;if(!value)throw Error(name);};
async function boot(){await page.goto(base+'/www/index.html',{waitUntil:'load',timeout:30000});await page.waitForFunction(()=>document.documentElement.dataset.looksStudio==='1',{timeout:20000});try{await page.waitForSelector('#idModal.on',{timeout:2500});await page.click('#idX');}catch{}await page.waitForFunction(()=>!document.querySelector('#idModal.on'));}
async function style(){await page.evaluate(()=>ChiselStudioTheme.openSurface('style'));await page.waitForSelector('#cpsStyleHero',{visible:true});await page.$eval('#clsPanel',n=>{n.open=true;n.scrollIntoView({block:'start'});});}
async function fixtureChecks(){await page.evaluate(()=>{ChiselSkinAppearance.detectFaces=async()=>[[]];ChiselCaptureQuality.assessFace=()=>({accepted:true,bounds:{left:.15,right:.85,top:.1,bottom:.9}});ChiselCaptureQuality.assessPixels=()=>({accepted:true});});}
try{
 browser=await puppeteer.launch({executablePath:process.env.CHROME,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});page=await browser.newPage();await page.setViewport({width:430,height:900,deviceScaleFactor:1});await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 page.on('pageerror',e=>report.errors.push(e.message));await page.setRequestInterception(true);
 page.on('request',async r=>{try{
  if(!r.url().includes('/functions/v1/looks-studio')){if(r.method()==='POST'&&/replicate|render-lookmax/.test(r.url()))return r.abort();return r.continue();}
  const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'apikey,content-type','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Content-Type':'application/json'};
  if(r.method()==='OPTIONS')return r.respond({status:204,headers});
  if(r.method()==='GET')return r.respond({status:200,headers,body:JSON.stringify({ready:true,dailyAllowance:2})});
  const b=JSON.parse(r.postData());report.calls.push({action:b.action,requestId:b.requestId,category:b.look?.category});
  if(b.action==='create'){jobs.set(b.requestId,{image:b.image,look:b.look});return r.respond({status:202,headers,body:JSON.stringify({status:'processing',jobId:b.requestId,remaining:1})});}
  if(b.action==='status'){if(interrupt){interrupt=false;return r.abort('failed');}return r.respond({status:200,headers,body:JSON.stringify({status:'succeeded',jobId:b.requestId,imageUrl:'https://replicate.delivery/test-fixture.jpg',remaining:1})});}
  if(b.action==='output')return r.respond({status:200,headers:{...headers,'Content-Type':'image/jpeg'},body:bytes});
  if(b.action==='cancel')return r.respond({status:200,headers,body:JSON.stringify({status:'canceled'})});
  return r.respond({status:400,headers,body:JSON.stringify({error:'invalid_request'})});
 }catch(e){report.errors.push(e.message);if(!r.isInterceptResolutionHandled())await r.abort();}});
 await boot();check('startsWithoutSeededResults',await page.$eval('#clsResult',n=>n.hidden));check('newPanelCollapsed',await page.$eval('#clsPanel',n=>!n.open));
 await page.click('.cps-avatar');await(await page.$('#cpsPhotoFile')).uploadFile(fixture);await page.waitForFunction(()=>ChiselPersonalPhoto.getStore().snapshot().hasPhoto);await page.click('#cpsPhotoClose');await style();
 const originalHash=await page.evaluate(async()=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',await(await ChiselPersonalPhoto.getStore().original()).arrayBuffer()))].join(','));
 for(const [category,count]of [['hair',25],['beard',8],['makeup',6],['glasses',6]]){await page.click(`[data-cps-style="${category}"]`);check(`presets-${category}`,await page.$$eval('#clsPresets button',n=>n.length)===count);}
 await page.click('[data-cps-style="hair"]');
 for(const width of [360,430,1280]){await page.setViewport({width,height:900,deviceScaleFactor:1});await style();check(`editorFits${width}`,await page.$eval('#clsPanel',n=>{const r=n.getBoundingClientRect();return r.width>0&&r.left>=0&&r.right<=innerWidth+1&&n.scrollWidth<=n.clientWidth+1;}));check(`buttonTarget${width}`,await page.$eval('#clsGenerate',n=>n.getBoundingClientRect().height>=48));await page.screenshot({path:`${out}/editor-${width}.png`});}
 await page.setViewport({width:430,height:900,deviceScaleFactor:1});await style();await page.evaluate(()=>ChiselSkinAppearance.detectFaces=async()=>[]);await page.click('#clsGenerate');await page.waitForFunction(()=>document.getElementById('clsStatus').textContent.includes('exactly one face'));
 check('noFaceCannotUpload',report.calls.every(c=>c.action!=='create'));await fixtureChecks();
 await page.click('#clsGenerate');await page.waitForSelector('#clsConsent[open]');check('consentBeforeUpload',report.calls.every(c=>c.action!=='create'));await page.click('#clsConsentCancel');check('declineLeavesOriginal',await page.$eval('#clsResult',n=>n.hidden));check('declineCreatesNoJob',report.calls.every(c=>c.action!=='create'));
 await page.click('#clsGenerate');await page.waitForSelector('#clsConsent[open]');await page.click('#clsConsentAccept');await page.waitForSelector('#clsResult:not([hidden])',{visible:true,timeout:20000});await page.waitForFunction(()=>document.getElementById('clsAfter').naturalWidth>0);
 check('exactlyOneCreate',report.calls.filter(c=>c.action==='create').length===1);check('resultDownloadedThroughServer',report.calls.some(c=>c.action==='output'));check('noProviderSecretInRequest',await page.evaluate(()=>!document.documentElement.innerHTML.includes('REPLICATE_API_TOKEN')));
 await page.$eval('#clsCompare',n=>{n.value='80';n.dispatchEvent(new Event('input',{bubbles:true}));});check('comparisonMoves',await page.$eval('#clsAfter',n=>n.style.clipPath.includes('20%')));
 await page.click('#clsSave');await page.waitForFunction(async()=>(await ChiselLooksGallery.list()).length===1);check('savePersistsActualBlobs',await page.evaluate(async()=>{const v=(await ChiselLooksGallery.list())[0];return v.original instanceof Blob&&v.result instanceof Blob&&v.original.size>0&&v.result.size>0;}));
 check('originalNotOverwritten',await page.evaluate(async()=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',await(await ChiselPersonalPhoto.getStore().original()).arrayBuffer()))].join(','))===originalHash);
 await page.click('#clsDismiss');check('dismissHidesResult',await page.$eval('#clsResult',n=>n.hidden));
 await page.$eval('.cls-saved',n=>n.open=true);await page.waitForSelector('.cls-saved-row button');await page.locator('.cls-saved-row button').click();check('savedLookReopens',await page.$eval('#clsResult',n=>!n.hidden));await page.click('#clsDismiss');
 // A lost status response must resume the same job, not initiate another paid call.
 interrupt=true;await page.click('#clsGenerate');await page.waitForSelector('#clsConsent[open]');await page.click('#clsConsentAccept');await page.waitForFunction(()=>document.getElementById('clsGenerate').textContent==='Check status',{timeout:15000});
 const createdBefore=report.calls.filter(c=>c.action==='create').length;await page.click('#clsGenerate');await page.waitForSelector('#clsResult:not([hidden])',{visible:true,timeout:15000});check('interruptionResumesWithoutCreate',report.calls.filter(c=>c.action==='create').length===createdBefore);
 await page.click('#clsDismiss');await page.evaluate(()=>go('home'));await page.click('.cps-avatar');await page.click('#cpsPhotoRemove');await page.waitForFunction(async()=>!(await ChiselLooksGallery.list()).length);check('photoRemovalClearsSavedCopies',await page.evaluate(async()=>!(await ChiselLooksGallery.list()).length));check('photoRemovalHidesPreview',await page.$eval('#clsResult',n=>n.hidden));
 check('noUncaughtErrors',report.errors.length===0);
}catch(e){report.errors.push(String(e.stack||e));process.exitCode=1;if(page)await page.screenshot({path:out+'/failure.png'}).catch(()=>{});}
finally{fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(browser)await browser.close();}
