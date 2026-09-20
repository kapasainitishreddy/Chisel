import fs from 'node:fs';
import puppeteer from 'puppeteer-core';
const base=process.argv[2]||'http://127.0.0.1:4173',out='/tmp/chisel-studio-qa';
const report={scope:'Real Home and Style discovery with the shared header, not camera or model validation',checks:{},errors:[]};
fs.mkdirSync(out,{recursive:true});let browser;
const check=(name,value)=>{report.checks[name]=!!value;if(!value)throw Error(`Discovery QA failed: ${name}`);};
try{
 browser=await puppeteer.launch({executablePath:process.env.CHROME,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const page=await browser.newPage();await page.setViewport({width:430,height:900,deviceScaleFactor:1});
 page.on('pageerror',e=>report.errors.push(e.message));
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 await page.goto(`${base}/www/index.html`,{waitUntil:'load',timeout:30000});
 await page.waitForFunction(()=>document.documentElement.dataset.chiselTheme==='quiet-studio',{timeout:20000});
 await page.waitForSelector('#idModal.on',{visible:true});await page.click('#idX');
 await page.waitForFunction(()=>!document.querySelector('#idModal.on'));
 check('priorityToolsOnMobile',await page.evaluate(()=>document.querySelector('.cs-direct-tools').getBoundingClientRect().top<document.getElementById('cxpHomeHub').getBoundingClientRect().top));
 for(const width of [360,430,768,1280]){
  await page.setViewport({width,height:900,deviceScaleFactor:1});
  await page.evaluate(()=>{go('home');document.querySelector('main.view').scrollTop=0;});
  await page.screenshot({path:`${out}/home-${width}.png`});
  await page.click('#csOrbitTrigger');await page.click('#csOrbit [data-cs-open="style"]');
  await page.waitForFunction(()=>{const n=document.getElementById('cxStudioCard'),r=n.getBoundingClientRect();return r.height>0&&r.top>=0&&r.top<innerHeight/2;},{timeout:5000});
  check(`visibleStyleCatalog${width}`,await page.$eval('#cxStudioCard',n=>n.closest('.screen').classList.contains('active')&&n.getBoundingClientRect().height>0));
  check(`styleFits${width}`,await page.$eval('#cxStudioCard',n=>{const r=n.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&n.scrollWidth<=n.clientWidth+1;}));
  await page.screenshot({path:`${out}/style-${width}.png`});
 }
 check('noUncaughtErrors',report.errors.length===0);
}catch(error){report.errors.push(String(error.stack||error));process.exitCode=1;
 if(browser){const pages=await browser.pages();await pages.at(-1).screenshot({path:`${out}/discovery-failure.png`}).catch(()=>{});}
}finally{fs.writeFileSync(`${out}/discovery-report.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(browser)await browser.close();}
