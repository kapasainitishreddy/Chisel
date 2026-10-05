import fs from 'node:fs';import assert from 'node:assert/strict';import puppeteer from 'puppeteer-core';
const out=process.env.CHISEL_QA_OUT||'/workspace/chisel-cx-evidence/browser',base=process.argv[2]||'http://127.0.0.1:4173';fs.mkdirSync(out,{recursive:true});
const checks={},errors=[];let browser,page;
try{
 browser=await puppeteer.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));await page.setViewport({width:430,height:900});
 // Block external writes. These checks never contact auth, checkout or render endpoints.
 await page.setRequestInterception(true);page.on('request',r=>r.method()==='POST'?r.abort():r.continue());
 await page.goto(base+'/www/index.html',{waitUntil:'load'});await page.waitForFunction(()=>window.CHISEL_RUNTIME_STATUS?.completion?.status==='ready');
 await page.waitForFunction(()=>document.getElementById('boot').classList.contains('gone')&&getComputedStyle(document.getElementById('boot')).opacity==='0');
 checks.noInterruptingIdentity=await page.evaluate(()=>!document.querySelector('#idModal.on')&&!!document.getElementById('cpsWelcome'));
 checks.brandLoaded=await page.$eval('.cps-brand-mark',n=>n.complete&&n.naturalWidth>0);
 for(const width of [360,430,1280]){await page.setViewport({width,height:900});await page.screenshot({path:`${out}/home-${width}.png`});checks['homeFits'+width]=await page.$eval('[data-screen="home"]',n=>n.scrollWidth<=n.clientWidth+1);}
 await page.setViewport({width:430,height:900});await page.click('#cpsPersonalize');await page.waitForSelector('#idModal.on');checks.personalizationExplicit=true;await page.focus('#idX');await page.keyboard.press('Enter');checks.personalizationCloses=await page.evaluate(()=>!document.querySelector('#idModal.on'));
 await page.click('[data-cps-start="scan"]');checks.scanRoute=await page.$eval('[data-screen="analyze"]',n=>n.classList.contains('active'));await page.evaluate(()=>go('home'));
 await page.click('[data-cps-start="train"]');await page.waitForSelector('#arCoachModal.on');checks.trainingConnected=true;
 // Native credit/account dialog atop an existing parent overlay must own focus.
 await page.evaluate(()=>ChiselCredits.openAccount());await page.waitForSelector('#ccDialog[open]');await page.focus('#ccEmail');await page.keyboard.press('Tab');checks.nestedFocus=await page.evaluate(()=>document.getElementById('ccDialog').contains(document.activeElement));
 await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.getElementById('ccDialog').open);checks.escapeClosesOnlyTop=await page.evaluate(()=>document.getElementById('arCoachModal').classList.contains('on'));await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.getElementById('arCoachModal').classList.contains('on'));checks.parentThenCloses=true;
 await page.evaluate(()=>go('home'));await page.click('[data-cps-start="style"]');checks.stylesConnected=await page.$eval('[data-screen="analyze"]',n=>n.classList.contains('active'));await page.evaluate(()=>go('home'));
 await page.click('#cpsWelcomeDismiss');await page.reload({waitUntil:'load'});await page.waitForFunction(()=>window.CHISEL_RUNTIME_STATUS?.completion?.status==='ready');checks.dismissalPersists=await page.evaluate(()=>!document.getElementById('cpsWelcome'));
 checks.billingStaysDisabled=await page.evaluate(()=>!CHISEL_RELEASE_CONFIG.billingEnabled&&document.getElementById('goPremiumBtn').hidden&&!ChiselCredits.open());
 // Store replies below are explicit local fixtures to inspect actual rendering and controls.
 await page.evaluate(()=>{_rc={getOfferings:async()=>({current:{availablePackages:[{identifier:'monthly',product:{title:'Monthly Premium',priceString:'₹499',subscriptionPeriod:'P1M',productCategory:'SUBSCRIPTION'}}]}})};rcReady=true;document.getElementById('paywall').classList.add('on');renderOfferings();});await page.waitForSelector('#paywallOfferings .card button');
 checks.localPricePreserved=await page.$eval('#paywallOfferings .card button',n=>n.textContent==='Continue with ₹499');checks.renewalDisclosed=await page.$eval('#paywallOfferings',n=>n.textContent.includes('₹499 every 1 month')&&n.textContent.includes('Automatically renews'));
 for(const width of [360,430,1280]){await page.setViewport({width,height:900});await page.screenshot({path:`${out}/premium-fixture-${width}.png`});checks['offerFits'+width]=await page.$eval('#paywall .panel',n=>n.scrollWidth<=n.clientWidth+1);}
 checks.noPageErrors=errors.length===0;assert.ok(Object.values(checks).every(Boolean),JSON.stringify(checks));
}catch(e){errors.push(e.stack);process.exitCode=1;if(page)await page.screenshot({path:out+'/failure.png'}).catch(()=>{});}finally{if(browser)await browser.close();fs.writeFileSync(out+'/report.json',JSON.stringify({scope:'Chromium CX/keyboard/responsive controls; explicit store fixtures, no real purchase, auth, Android device or attribution experiment.',checks,errors},null,2));console.log(JSON.stringify({checks,errors}));}
