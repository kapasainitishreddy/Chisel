import fs from 'node:fs';import path from 'node:path';import puppeteer from 'puppeteer-core';
const out='/tmp/chisel-credits-qa',base=process.argv[2]||'http://127.0.0.1:4173';fs.mkdirSync(out,{recursive:true});
const report={scope:'Actual credit UI, compare and export controls. Auth, native store, image provider and wallet replies are explicit fixtures. No purchases, email, image generation or private selfie uploads.',checks:{},errors:[],calls:[]};
const uid='11111111-1111-4111-8111-111111111111',fixture=path.resolve('tests/fixtures/portrait-male.jpg'),bytes=fs.readFileSync(fixture);let balance=0,apiReady=true,salesReady=true,jobs=new Map(),browser,page;
const check=(name,value)=>{report.checks[name]=!!value;if(!value)throw Error(name);};
try{
 browser=await puppeteer.launch({executablePath:process.env.CHROME,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});page=await browser.newPage();await page.setViewport({width:430,height:900,deviceScaleFactor:1});await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);page.on('pageerror',e=>report.errors.push(e.message));await page.setRequestInterception(true);
 page.on('request',async r=>{try{
  const url=r.url();if(!url.includes('.supabase.co')){if(r.method()==='POST')return r.abort();return r.continue();}
  const headers={'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'apikey,authorization,content-type','Access-Control-Allow-Methods':'GET,POST,OPTIONS'};
  const json=(body,status=200)=>r.respond({status,headers,body:JSON.stringify(body)});if(r.method()==='OPTIONS')return r.respond({status:204,headers});
  if(url.includes('/auth/v1/otp'))return json({});
  if(url.includes('/auth/v1/verify'))return json({access_token:'fixture-access',refresh_token:'fixture-refresh',expires_in:3600,user:{id:uid}});
  if(url.includes('/auth/v1/logout'))return json({});
  if(!url.includes('/credit-studio'))return json({ready:false,error:'service_disabled'});
  if(r.method()==='GET')return json({apiVersion:2,ready:apiReady,salesReady,provider:'OpenAI',rcPublicKey:'fixture_public_not_a_real_key',wallet:r.headers().authorization?{userId:uid,balance}:null});
  const data=JSON.parse(r.postData());report.calls.push({action:data.action,quality:data.quality,credits:data.quotedCredits,requestId:data.requestId});
  if(!r.headers().authorization)return json({error:'sign_in_required'},401);
  if(data.action==='create'){
   if(!jobs.has(data.requestId)){balance-=data.quotedCredits;jobs.set(data.requestId,{id:data.requestId,look:data.look});}
   return json({apiVersion:2,status:'processing',jobId:data.requestId,balance},202);
  }
  if(data.action==='status')return json({apiVersion:2,status:'succeeded',jobId:data.requestId,outputReady:true,balance});
  if(data.action==='output')return r.respond({status:200,headers:{...headers,'Content-Type':'image/jpeg'},body:bytes});
  return json({error:'invalid_request'},400);
 }catch(e){report.errors.push(e.message);if(!r.isInterceptResolutionHandled())await r.abort();}});
 await page.goto(base+'/www/index.html',{waitUntil:'load',timeout:30000});await page.waitForFunction(()=>document.documentElement.dataset.creditUI==='1'&&document.documentElement.dataset.chiselCompare==='1',{timeout:20000});try{await page.waitForSelector('#idModal.on',{timeout:2500});await page.click('#idX');}catch{}
 check('appIdentity',await page.title().then(s=>s.includes('Chisel')));
 await page.click('.cps-avatar');await(await page.$('#cpsPhotoFile')).uploadFile(fixture);await page.waitForFunction(()=>ChiselPersonalPhoto.getStore().snapshot().hasPhoto);await page.click('#cpsPhotoClose');await page.evaluate(()=>ChiselStudioTheme.openSurface('style'));await page.click('#clsPanel>summary');await page.waitForSelector('#clsEditor[open]');
 await page.waitForFunction(()=>ChiselCredits.isActive());check('signedOutNoBalance',await page.$eval('#ccEditorBalance',n=>n.textContent==='Credits'));
 await page.click('#ccEditorBalance');check('signedOutNoPurchases',await page.$$eval('[data-credit-pack]',ns=>ns.length===3&&ns.every(n=>n.disabled)));
 await page.evaluate(()=>{window.__storeCalls=0;window.rcPlugin=()=>({configure:async()=>{},logIn:async({appUserID})=>{window.__rcUser=appUserID;},getProducts:async()=>({products:ChiselCreditPolicy.PACKS.map(p=>({identifier:p.id,priceString:'$'+(p.usdCents/100).toFixed(2)}))}),purchaseStoreProduct:async({product})=>{window.__storeCalls++;window.__bought=product.identifier;}});});
 await page.type('#ccEmail','fixture@example.invalid');await page.click('#ccSendCode');await page.waitForSelector('#ccCodeStep:not([hidden])');await page.type('#ccCode','123456');await page.click('#ccVerify');await page.waitForFunction(()=>ChiselCredits.snapshot().offers.length===3);
 check('rcAuthenticatedIdentity',await page.evaluate(()=>window.__rcUser)===uid);
 check('localizedPrices',await page.$$eval('.cc-pack strong',ns=>ns.map(n=>n.textContent).join(',')==='$3.99,$9.99,$19.99'));
 await page.click('[data-credit-pack="chisel_credits_10"]');await page.waitForFunction(()=>!ChiselCredits.snapshot().busy);
 check('nativeCallbackNotCreditGrant',await page.evaluate(()=>ChiselCredits.snapshot().balance===0&&window.__storeCalls===1));
 balance=10;await page.click('#ccRefresh');await page.waitForFunction(()=>ChiselCredits.snapshot().balance===10);
 check('serverConfirmedBalance',await page.$eval('#ccBalance',n=>n.textContent==='10 credits'));check('confirmedBalanceCopy',await page.$eval('#ccStatus',n=>n.textContent==='Balance updated.'));
 for(const width of [360,430,1280]){await page.setViewport({width,height:900,deviceScaleFactor:1});check(`walletFit${width}`,await page.$eval('#ccDialog',n=>n.scrollWidth<=n.clientWidth+1));await page.screenshot({path:`${out}/credits-${width}.png`});}
 await page.click('#ccClose');
 for(const width of [360,430,1280]){await page.setViewport({width,height:900,deviceScaleFactor:1});check(`editorFit${width}`,await page.$eval('#clsEditor',n=>n.scrollWidth<=n.clientWidth+1));check(`creditCostVisible${width}`,await page.$eval('#clsGenerate',n=>n.textContent.includes('1 credit')));check(`readyCopyConsistent${width}`,await page.$eval('#clsStatus',n=>!n.textContent.includes('not enabled')));await page.screenshot({path:`${out}/editor-${width}.png`});}
 await page.setViewport({width:430,height:900,deviceScaleFactor:1});await page.click('[data-credit-mode="detail"]');check('higherQualityQuote',await page.$eval('#clsGenerate',n=>n.textContent.includes('3 credits')));await page.click('[data-credit-mode="standard"]');
 await page.evaluate(()=>{ChiselSkinAppearance.detectFaces=async()=>[[]];ChiselCaptureQuality.assessFace=()=>({accepted:true,bounds:{left:.15,right:.85,top:.1,bottom:.9}});ChiselCaptureQuality.assessPixels=()=>({accepted:true});});
 await page.click('#clsGenerate');await page.waitForSelector('#clsConsent[open]');check('providerAndCreditConsent',await page.$eval('#clsConsent',n=>n.textContent.includes('OpenAI')&&n.textContent.includes('1 credit')));await page.click('#clsConsentCancel');check('refusalCreatesNothing',report.calls.length===0);
 await page.click('#clsGenerate');await page.waitForSelector('#clsConsent[open]');await page.click('#clsConsentAccept');await page.waitForSelector('#clsResult:not([hidden])',{visible:true,timeout:20000});await page.waitForFunction(()=>document.getElementById('clsAfter').naturalWidth>0);
 check('onePaidCreate',report.calls.filter(c=>c.action==='create').length===1);check('correctQuotedCharge',report.calls.find(c=>c.action==='create').credits===1);await page.click('#clsSave');await page.waitForFunction(async()=>(await ChiselLooksGallery.list()).length===1);
 const requestsBefore=report.calls.filter(c=>c.action==='create').length;
 // Additional comparison fixture reuses an actual decoded Blob; never presented as generated evidence.
 await page.evaluate(async()=>{const a=(await ChiselLooksGallery.list())[0];await ChiselLooksGallery.save({...a,id:crypto.randomUUID(),look:{category:'hair',preset:'quiff',color:'match'},createdAt:Date.now()+1});});
 await page.click('#clsLibraryOpen');await page.click('#cbOpen');await page.waitForSelector('.cb-choice');await page.$$eval('.cb-choice input',ns=>ns.forEach(n=>n.click()));await page.click('#cbCompare');
 check('twoSavedLookBoard',await page.$$eval('#cbGrid figure',ns=>ns.length===2));check('compareNoAiCredits',report.calls.filter(c=>c.action==='create').length===requestsBefore);
 await page.screenshot({path:out+'/compare-fixtures-430.png'});
 await page.click('.cb-choice input');await page.click('#cbBrief');await page.waitForSelector('#cbNotes:not([hidden])');await page.type('#cbNote','Keep my natural texture. Discuss upkeep.');
 const session=await page.createCDPSession();await session.send('Page.setDownloadBehavior',{behavior:'allow',downloadPath:out});await page.click('#cbExport');
 for(let i=0;i<40&&!fs.existsSync(out+'/chisel-stylist-reference.html');i++)await new Promise(r=>setTimeout(r,100));
 check('briefActuallyExported',fs.existsSync(out+'/chisel-stylist-reference.html'));const exported=fs.readFileSync(out+'/chisel-stylist-reference.html','utf8');check('briefContainsOriginalAndReference',exported.includes('AI style reference')&&exported.includes('Keep my natural texture.'));
 check('exportNoAiCredits',report.calls.filter(c=>c.action==='create').length===requestsBefore);
 await page.click('#cbDialog .cb-close');await page.click('#clsLibraryClose');await page.click('#clsDismiss');
 apiReady=false;salesReady=false;await page.click('#ccEditorBalance');await page.click('#ccRefresh');await page.waitForFunction(()=>!ChiselCredits.snapshot().salesReady);
 check('disabledServiceCannotSellCredits',await page.$$eval('.cc-pack',ns=>ns.every(n=>n.disabled)));await page.screenshot({path:out+'/credits-disabled-430.png'});
 await page.click('#ccSignOut');await page.waitForFunction(()=>!ChiselCredits.userId());check('signoutClearsVisibleWallet',await page.$eval('#ccBalance',n=>n.textContent.includes('Sign in')));
 check('noUncaughtErrors',report.errors.length===0);
}catch(e){report.errors.push(String(e.stack||e));process.exitCode=1;if(page)await page.screenshot({path:out+'/failure.png'}).catch(()=>{});}finally{fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(browser)await browser.close();}
