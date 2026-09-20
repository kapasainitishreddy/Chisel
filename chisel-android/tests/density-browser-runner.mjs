import fs from 'node:fs';
import puppeteer from 'puppeteer-core';
const base=process.argv[2]||'http://127.0.0.1:4173',out='/tmp/chisel-studio-qa';
const report={scope:'Default-screen text density and actual discovery controls; not measurement accuracy',checks:{},words:{},errors:[]};
fs.mkdirSync(out,{recursive:true});let browser;
const check=(name,value)=>{report.checks[name]=!!value;if(!value)throw Error(name);};
async function words(page,selector){return page.$eval(selector,root=>{
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const parts=[];
 while(walker.nextNode()){
  const n=walker.currentNode,p=n.parentElement;if(!p||!n.textContent.trim())continue;
  let visible=true;
  for(let a=p;a;a=a.parentElement){
   const s=getComputedStyle(a);
   if(['SCRIPT','STYLE'].includes(a.tagName)||a.hidden||s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0){visible=false;break;}
   if(a.tagName==='DETAILS'&&!a.open&&!a.querySelector(':scope > summary')?.contains(p)){visible=false;break;}
  }
  if(visible)parts.push(n.textContent.trim());
 }
 const text=parts.join(' ').replace(/\s+/g,' ').trim();return {count:text?text.split(/\s+/).length:0,text};
});}
try{
 browser=await puppeteer.launch({executablePath:process.env.CHROME,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
 const page=await browser.newPage();page.on('pageerror',e=>report.errors.push(e.message));
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 await page.setViewport({width:430,height:900,deviceScaleFactor:1});
 await page.goto(`${base}/www/index.html`,{waitUntil:'load',timeout:30000});
 await page.waitForFunction(()=>document.documentElement.dataset.chiselTheme==='quiet-studio',{timeout:20000});
 await page.waitForSelector('#idModal.on',{visible:true,timeout:10000});await page.click('#idX');
 await page.waitForFunction(()=>!document.querySelector('#idModal.on'));
 for(const width of [360,430,1280]){
  await page.setViewport({width,height:900,deviceScaleFactor:1});
  await page.evaluate(()=>{go('home');document.querySelector('main.view').scrollTop=0;document.querySelectorAll('details').forEach(n=>n.open=false);});
  const home=await words(page,'[data-screen="home"]');report.words[`home${width}`]=home;
  check(`homeUnder65Words${width}`,home.count<=65);
  check(`noMarketingHeadline${width}`,!home.text.includes('A little care')&&!home.text.includes('Measure carefully'));
  check(`noHomeOverflow${width}`,await page.$eval('main.view',n=>n.scrollWidth<=n.clientWidth+1));
  check(`threePrimaryTools${width}`,await page.$$eval('.cs-direct-tools [data-cs-open]',nodes=>nodes.length===3&&nodes.every(n=>{const r=n.getBoundingClientRect();return r.height>=48&&r.width>=44&&r.bottom<=innerHeight-65;})));
  await page.screenshot({path:`${out}/edited-home-${width}.png`});
  await page.click('.cs-direct-tools [data-cs-open="train"]');
  await page.waitForSelector('#arCoachModal.on',{visible:true});
  const trainer=await words(page,'#arCoachModal');report.words[`trainer${width}`]=trainer;
  check(`trainerUnder75Words${width}`,trainer.count<=75);
  check(`visibleSafety${width}`,await page.$eval('.cs-comfort',n=>n.getBoundingClientRect().height>0&&n.textContent.includes('Stop if')));
  await page.screenshot({path:`${out}/edited-trainer-${width}.png`});
  await page.click('.cs-trainer-method>summary');
  check(`fullSafetyRetained${width}`,await page.$eval('.cs-trainer-method',n=>n.open&&n.textContent.includes('clicking')));
  await page.keyboard.press('Escape');
  await page.click('.cs-direct-tools [data-cs-open="skin"]');await page.waitForSelector('#csaShell',{visible:true});
  const skin=await words(page,'#chiselLabsRoot');report.words[`skin${width}`]=skin;
  check(`skinUnder90Words${width}`,skin.count<=90);
  check(`photoInputsReachable${width}`,await page.$eval('.csa-file',n=>{const r=n.getBoundingClientRect();return r.height>=48&&r.top>=0&&r.bottom<innerHeight;}));
  check(`invalidPhotoStillDisabled${width}`,await page.$eval('#csaAnalyze',n=>n.disabled));
  await page.screenshot({path:`${out}/edited-skin-${width}.png`});
  await page.click('.cs-photo-tips>summary');
  check(`photoTipsWork${width}`,await page.$eval('.cs-photo-tips',n=>n.open&&n.textContent.includes('Same camera')));
  await page.click('.cs-skin-details>summary');
  check(`accuracyLimitRetained${width}`,await page.$eval('#csSkinMethod',n=>n.getBoundingClientRect().height>0&&n.textContent.includes('not an accuracy percentage')));
  await page.keyboard.press('Escape');
  await page.click('.cs-direct-tools [data-cs-open="style"]');
  const style=await words(page,'#cxStudioCard');report.words[`style${width}`]=style;
  check(`styleUnder55Words${width}`,style.count<=55);
  check(`styleVisible${width}`,await page.$eval('#cxStudioCard',n=>{const r=n.getBoundingClientRect();return r.height>0&&r.top>=0&&r.top<innerHeight/2;}));
  await page.screenshot({path:`${out}/edited-style-${width}.png`});
 }
 await page.evaluate(()=>{go('home');document.querySelector('main.view').scrollTop=0;});
 await page.click('.cs-quick-tools>summary');
 check('quickToolsRemainAvailable',await page.$$eval('.cxp-action',n=>n.length===4&&n.every(b=>b.getBoundingClientRect().height>=44)));
 await page.click('[data-cxp-done]');
 await page.waitForFunction(()=>document.querySelector('[data-cxp-done]').textContent==='Done');
 check('completionUsesRealState',await page.$eval('[data-cxp-done]',n=>n.getAttribute('aria-pressed')==='true'));
 check('rerenderDoesNotRestoreTextWall',(await words(page,'#cxpHomeHub')).count<35);
 check('noUncaughtErrors',report.errors.length===0);
}catch(error){report.errors.push(String(error.stack||error));process.exitCode=1;
 if(browser){const pages=await browser.pages();await pages.at(-1).screenshot({path:`${out}/density-failure.png`}).catch(()=>{});}
}finally{fs.writeFileSync(`${out}/density-report.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(browser)await browser.close();}
