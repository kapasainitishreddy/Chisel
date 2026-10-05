import fs from 'node:fs';
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
const out=process.env.CHISEL_QA_OUT||'/tmp/chisel-play-privacy';
fs.mkdirSync(out,{recursive:true});
const checks={},errors=[];
const browser=await puppeteer.launch({executablePath:process.env.CHROME||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 const page=await browser.newPage();
 await page.goto((process.argv[2]||'http://127.0.0.1:4173')+'/www/index.html',{waitUntil:'load'});
 await page.waitForFunction(()=>window.CHISEL_RUNTIME_STATUS?.completion?.status==='ready');
 await page.waitForFunction(()=>{const b=document.getElementById('boot');return !b||getComputedStyle(b).opacity==='0';});await page.evaluate(()=>openIdentity());await page.waitForSelector('#idModal.on');
 await page.click('#idX');
 await page.evaluate(()=>go('connect'));
 await page.waitForSelector('[data-screen="connect"] a[href="privacy-policy.html"]',{visible:true});
 await page.setRequestInterception(true);
 page.on('request',r=>r.url().startsWith(process.argv[2]||'http://127.0.0.1:4173')?r.continue():r.abort());
 await Promise.all([page.waitForNavigation({waitUntil:'load'}),page.click('[data-screen="connect"] a[href="privacy-policy.html"]')]);
 checks.offlinePolicy=await page.evaluate(()=>document.title==='Chisel — Privacy Policy'&&document.body.textContent.includes('Live app storage is not encrypted')&&document.body.textContent.includes('Notifications (optional)'));
 assert.ok(checks.offlinePolicy);
 await page.goBack({waitUntil:'load'});
 checks.returnToApp=await page.evaluate(()=>typeof go==='function'&&document.title.startsWith('Chisel'));
 assert.ok(checks.returnToApp);
}catch(e){errors.push(e.stack);process.exitCode=1;}
finally{await browser.close();fs.writeFileSync(out+'/report.json',JSON.stringify({scope:'Chromium local navigation with external requests denied; not Android/device acceptance.',checks,errors},null,2));console.log(JSON.stringify({checks,errors}));}
