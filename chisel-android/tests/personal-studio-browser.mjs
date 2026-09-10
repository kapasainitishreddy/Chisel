import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import puppeteer from 'puppeteer-core';
const base=process.argv[2]||'http://127.0.0.1:4173',out='/tmp/chisel-personal-ui';
fs.mkdirSync(out,{recursive:true});
const report={scope:'User-owned photo lifecycle, actual UI and original-photo handoff. Not empirical accuracy or generated hairstyle validation.',checks:{},errors:[],requests:[],details:{}};
let browser,page;
function check(name,v){report.checks[name]=!!v;if(!v)throw Error(name);}
async function ready(p){
 await p.goto(base+'/www/index.html',{waitUntil:'load',timeout:30000});
 await p.waitForFunction(()=>document.documentElement.dataset.personalStudio==='1',{timeout:20000});
 if(await p.$('#idModal')){try{await p.waitForSelector('#idModal.on',{visible:true,timeout:2500});await p.click('#idX');}catch{}}
 await p.waitForFunction(()=>!document.querySelector('#idModal.on'));
}
const fixture=path.resolve('tests/fixtures/portrait-male.jpg');
try{
 browser=await puppeteer.launch({executablePath:process.env.CHROME,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
 page=await browser.newPage();await page.setViewport({width:430,height:900,deviceScaleFactor:1});
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 page.on('pageerror',e=>report.errors.push(e.message));
 page.on('request',r=>{if(r.method()==='POST')report.requests.push(r.url());});
 await ready(page);
 check('emptyStateDoesNotSeedAPerson',await page.evaluate(()=>!ChiselPersonalPhoto.getStore().snapshot().hasPhoto&&document.querySelectorAll('[data-cps-photo]:not([hidden])').length===0));
 await page.screenshot({path:out+'/empty-home.png'});
 await page.click('.cps-avatar');
 await page.waitForSelector('#cpsPhotoDialog[open]');
 check('localStorageDisclosureVisible',await page.$eval('.cps-private-note',n=>n.textContent.includes('Not uploaded')));
 fs.writeFileSync(out+'/invalid.txt','not an image');
 await(await page.$('#cpsPhotoFile')).uploadFile(out+'/invalid.txt');
 await page.waitForFunction(()=>/JPEG|PNG|WebP/.test(document.getElementById('cpsPhotoStatus').textContent));
 check('invalidImportLeavesEmptyState',await page.evaluate(()=>!ChiselPersonalPhoto.getStore().snapshot().hasPhoto));
 await(await page.$('#cpsPhotoFile')).uploadFile(fixture);
 await page.waitForFunction(()=>ChiselPersonalPhoto.getStore().snapshot().hasPhoto,{timeout:15000});
 await page.waitForFunction(()=>[...document.querySelectorAll('[data-cps-photo]')].every(n=>n.complete&&n.naturalWidth>0));
 const digest=await page.evaluate(async()=>{const b=await ChiselPersonalPhoto.getStore().original();return [...new Uint8Array(await crypto.subtle.digest('SHA-256',await b.arrayBuffer()))].map(n=>n.toString(16).padStart(2,'0')).join('');});
 check('originalBytesPreserved',digest===crypto.createHash('sha256').update(fs.readFileSync(fixture)).digest('hex'));
 check('onePhotoFeedsEverySurface',await page.evaluate(()=>new Set([...document.querySelectorAll('[data-cps-photo]')].map(n=>n.src)).size===1));
 await page.click('#cpsPhotoClose');
 await ready(page);
 await page.waitForFunction(()=>ChiselPersonalPhoto.getStore().snapshot().hasPhoto);
 check('photoSurvivesReload',await page.$eval('#cpsHomeHero img',n=>!n.hidden&&n.src.startsWith('blob:')));
 for(const width of [360,430,1280]){
  await page.setViewport({width,height:900,deviceScaleFactor:1});
  await page.evaluate(()=>{go('home');document.querySelector('main.view').scrollTop=0;});
  await page.waitForFunction(()=>document.querySelector('#cpsHomeHero img').complete);
  check(`homeFits${width}`,await page.$eval('main.view',n=>n.scrollWidth<=n.clientWidth+1));
  check(`tilesAreBalanced${width}`,await page.$$eval('.cs-direct-tools button',ns=>{const r=ns.map(n=>n.getBoundingClientRect());return r.length===3&&r.every(x=>x.height>=48)&&Math.max(...r.map(x=>x.width))-Math.min(...r.map(x=>x.width))<2;}));
  await page.screenshot({path:`${out}/home-${width}.png`});
  await page.click('.cs-direct-tools [data-cs-open="train"]');await page.waitForSelector('#arCoachModal.on',{visible:true});
  check(`trainerUsesOwnPhoto${width}`,await page.$eval('#cpsTrainerHero img',n=>!n.hidden&&n.naturalWidth>0));
  check(`noMadeUpFormScore${width}`,await page.$eval('#cpsLiveForm',n=>n.hidden));
  check(`trainerCloseVisible${width}`,await page.$eval('#arCoachX',n=>{const r=n.getBoundingClientRect();return r.top>=0&&r.bottom<innerHeight&&r.width>=44&&r.height>=44;}));
  await page.screenshot({path:`${out}/trainer-${width}.png`});
  await page.click('[data-cs-goal="cheeks"]');
  check(`realFilterUpdatesFeature${width}`,await page.$eval('#cpsSessionTitle',n=>n.textContent==='Cheek activation'));
  check(`oneCheekSession${width}`,await page.$$eval('.ar-session:not([hidden])',n=>n.length===1));
  await page.click('[data-cs-goal="all"]');await page.keyboard.press('Escape');
  await page.click('.cs-direct-tools [data-cs-open="skin"]');await page.waitForSelector('#csaShell',{visible:true});
  check(`skinHasOwnPhoto${width}`,await page.$eval('#cpsSkinHero img',n=>!n.hidden&&n.complete&&n.naturalWidth>0));
  check(`noSeededSkinScores${width}`,await page.$eval('#csaResults',n=>n.hidden));
  check(`photoHandoffButtonAvailable${width}`,await page.$eval('#cpsUsePhoto',n=>!n.hidden));
  await page.screenshot({path:`${out}/skin-${width}.png`});
  await page.click('#cpsUsePhoto');await page.waitForFunction(()=>!document.getElementById('csaAnalyze').disabled);
  check(`skinReceivesExplicitSelection${width}`,await page.$eval('#csaStatus',n=>n.textContent.includes('Photo ready')));
  await page.keyboard.press('Escape');
  await page.click('.cs-direct-tools [data-cs-open="style"]');
  await page.waitForFunction(()=>{const r=document.getElementById('cxStudioCard').getBoundingClientRect();return r.width>0&&r.top>=0&&r.top<innerHeight/2;});
  check(`styleUsesOwnPhoto${width}`,await page.$eval('#cpsStyleHero img',n=>!n.hidden&&n.complete&&n.naturalWidth>0));
  check(`posterNotPretendingToBeRendered${width}`,await page.$eval('#cpsStyleHero',n=>n.textContent.includes('no style applied')));
  await page.screenshot({path:`${out}/style-${width}.png`});
  await page.click('[data-cps-style="beard"]');
  check(`beardFilterWired${width}`,await page.$$eval('#cxStudioCard .cx-studio-btn:not([hidden])',ns=>ns.length===1&&ns[0].dataset.cx==='beard'));
  await page.click('[data-cps-style="glasses"]');
  check(`eyewearReachable${width}`,await page.$eval('[data-cps-eyewear]',n=>!n.hidden));
  await page.click('[data-cps-style="hair"]');
 }
 await page.setViewport({width:430,height:900,deviceScaleFactor:1});
 await page.evaluate(()=>go('home'));await page.click('.cps-avatar');
 await page.click('#cpsPhotoRemove');await page.waitForFunction(()=>!ChiselPersonalPhoto.getStore().snapshot().hasPhoto);
 check('removeClearsAllPhotoSurfaces',await page.evaluate(()=>[...document.querySelectorAll('.cps-personal-image')].every(n=>n.hidden&&!n.hasAttribute('src'))));
 await page.click('#cpsPhotoClose');await ready(page);
 check('removedPhotoStaysRemoved',await page.evaluate(()=>!ChiselPersonalPhoto.getStore().snapshot().hasPhoto));
 await page.click('.cps-avatar');await(await page.$('#cpsPhotoFile')).uploadFile(fixture);await page.waitForFunction(()=>ChiselPersonalPhoto.getStore().snapshot().hasPhoto);await page.click('#cpsPhotoClose');
 await page.evaluate(()=>go('connect'));
 let confirmations=0;page.on('dialog',async d=>{confirmations++;await d.accept();});
 await Promise.all([page.waitForNavigation({waitUntil:'load',timeout:15000}),page.click('#wipeData')]);
 await page.waitForFunction(()=>document.documentElement.dataset.personalStudio==='1');
 await page.waitForFunction(()=>!ChiselPersonalPhoto.getStore().snapshot().hasPhoto);
 const record=await page.evaluate(()=>new Promise((resolve,reject)=>{const r=indexedDB.open('chisel-personal-photo',1);r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result,t=db.transaction('photos'),v=t.objectStore('photos').get('portrait');v.onsuccess=()=>{resolve(!!v.result);db.close();};};}));
 check('clearAllDeletesIndexedDBPortrait',record===false);
 check('clearAllHasOneConfirmation',confirmations===1);
 check('noPhotoUploadsOrOtherPOSTs',report.requests.length===0);
 check('noUncaughtAppErrors',report.errors.length===0);
}catch(error){report.errors.push(String(error.stack||error));process.exitCode=1;if(page)await page.screenshot({path:out+'/failure.png'}).catch(()=>{});}
finally{fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(browser)await browser.close();}
