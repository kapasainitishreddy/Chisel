import fs from 'node:fs';
import process from 'node:process';
import puppeteer from 'puppeteer-core';

const gender=process.argv[2];
const videoPath=process.argv[3];
const baseUrl=process.argv[4]||'http://127.0.0.1:4173';
const chrome=process.env.CHROME;
const DEADLINE=70000;
if(!['male','female'].includes(gender))throw new Error('gender must be male or female');
if(!videoPath||!fs.existsSync(videoPath))throw new Error(`missing fake camera video: ${videoPath}`);
if(!chrome)throw new Error('CHROME environment variable is required');
const jsonPath=`/tmp/chisel-${gender}-visual-tryon.json`;
let browser=null,finished=false;
const result={gender,checks:{},captures:[],errors:[]};
const watchdog=setTimeout(()=>{if(!finished){try{fs.writeFileSync(jsonPath,JSON.stringify({...result,errors:[...result.errors,`visual QA exceeded ${DEADLINE}ms`]},null,2));}catch{}process.exit(124);}},DEADLINE);
watchdog.unref?.();
const wait=ms=>new Promise(r=>setTimeout(r,ms));

try{
  browser=await puppeteer.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required','--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream',`--use-file-for-fake-video-capture=${videoPath}`]});
  const page=await browser.newPage();
  await page.setViewport({width:430,height:900,deviceScaleFactor:1});
  page.on('pageerror',e=>result.errors.push(`page:${e.message||e}`));
  await page.goto(`${baseUrl}/www/index.html?visualTryon=${gender}`,{waitUntil:'domcontentloaded',timeout:30000});
  await page.evaluate(g=>{localStorage.clear();localStorage.setItem('chisel:identity',JSON.stringify({gender:g,label:null}));localStorage.setItem('chisel:cameraConsent','true');},gender);
  await page.reload({waitUntil:'domcontentloaded',timeout:30000});
  const ready=await page.evaluate(async()=>{try{return !!(window.faceKit&&await Promise.race([window.faceKit.ready(),new Promise(r=>setTimeout(()=>r(false),22000))]));}catch{return false;}});
  result.checks.faceEngineReady=ready;
  if(!ready)throw new Error('MediaPipe face engine did not initialize');
  await page.evaluate(g=>{try{identitySet(g,null);applyIdentity();}catch{}openStyle();},gender);
  const detected=await page.waitForFunction(()=>{try{return !!readLandmarks();}catch{return false;}},{timeout:18000,polling:250}).then(()=>true).catch(()=>false);
  result.checks.faceDetected=detected;
  if(!detected)throw new Error('Face landmarks were not detected in try-on mode');

  const cases=gender==='female'?
    [{slug:'french-bob-bare',hair:'frenchbob',beard:'none',makeup:'none'},{slug:'butterfly-peach-lift',hair:'butterfly',beard:'none',makeup:'peachlift'},{slug:'defined-curls-draped-rose',hair:'curls',beard:'none',makeup:'drapedrose'}]:
    [{slug:'quiff-clean',hair:'quiff',beard:'none',makeup:'none'},{slug:'crop-soft-stubble',hair:'crop',beard:'stubble',makeup:'none'},{slug:'flow-short-beard',hair:'mlong',beard:'short',makeup:'none'}];

  for(const item of cases){
    const requested=await page.evaluate(item=>{
      styleView='all';renderStyleTop();renderStyleChips();
      const hairList=styleGender==='women'?HAIR_WOMEN:HAIR_MEN;
      const hair=hairList.find(x=>x&&x.id===item.hair),beard=BEARD_STYLES.find(x=>x&&x.id===item.beard),makeup=MAKEUP_LOOKS.find(x=>x&&x.id===item.makeup);
      const clickNamed=(id,name)=>{if(!name)return false;const b=[...document.querySelectorAll(`#${id} .sc`)].find(x=>x.textContent.trim()===name);if(!b)return false;b.click();return true;};
      const clickedHair=clickNamed('hairChips',hair&&hair.name);
      const clickedBeard=clickNamed('beardChips',beard&&beard.name);
      const clickedMakeup=clickNamed('makeupChips',makeup&&makeup.name);
      return{hairId:item.hair,hairName:hair&&hair.name,beardId:item.beard,beardName:beard&&beard.name,makeupId:item.makeup,makeupName:makeup&&makeup.name,clickedHair,clickedBeard,clickedMakeup};
    },item);
    await wait(900);
    const evidence=await page.evaluate(()=>{
      const list=styleGender==='women'?HAIR_WOMEN:HAIR_MEN,hs=list[styleHair]||{},bs=BEARD_STYLES[styleBeard]||{},ms=MAKEUP_LOOKS[styleMakeup]||{};
      const c=document.getElementById('overlay'),summary=document.getElementById('cxStyleSummary')?.textContent||'';
      const x=c&&c.getContext('2d',{willReadFrequently:true});let visible=0,hash=2166136261;
      if(x&&c.width&&c.height){const px=x.getImageData(0,0,c.width,c.height).data;for(let i=3;i<px.length;i+=4*97){if(px[i]>8)visible++;hash^=px[i-3]+px[i-2]*3+px[i-1]*7+px[i]*11;hash=Math.imul(hash,16777619)>>>0;}}
      return{selected:{hairId:hs.id,hairName:hs.name,beardId:bs.id,beardName:bs.name,makeupId:ms.id,makeupName:ms.name},summary,visible,hash,width:c?.width||0,height:c?.height||0};
    });
    const path=`/tmp/chisel-${gender}-visual-${item.slug}.png`;
    await (await page.$('#camwrap')).screenshot({path});
    const expected=[requested.hairName,requested.beardId!=='none'?requested.beardName:null,requested.makeupId!=='none'?requested.makeupName:null].filter(Boolean).join(' + ');
    const selectionStable=evidence.selected.hairId===item.hair&&evidence.selected.beardId===item.beard&&evidence.selected.makeupId===item.makeup;
    result.captures.push({slug:item.slug,file:path,requested,...evidence,expectedSummary:expected,selectionStable,summaryMatches:evidence.summary===expected,overlayVisible:evidence.visible>20});
  }
  result.checks.threeRenders=result.captures.length===3;
  result.checks.userSelectionsStable=result.captures.every(x=>x.selectionStable&&x.requested.clickedHair&&x.requested.clickedBeard&&x.requested.clickedMakeup);
  result.checks.summarySync=result.captures.every(x=>x.summaryMatches);
  result.checks.overlayVisible=result.captures.every(x=>x.overlayVisible);
  result.checks.stylesDistinct=new Set(result.captures.map(x=>x.hash)).size===result.captures.length;
  if(!Object.values(result.checks).every(Boolean))throw new Error('One or more visual try-on checks failed');
}catch(err){result.errors.push(err?.stack||err?.message||String(err));process.exitCode=1;}
finally{
  finished=true;clearTimeout(watchdog);try{fs.writeFileSync(jsonPath,JSON.stringify(result,null,2));}catch{}
  console.log(JSON.stringify(result,null,2));
  if(browser)await Promise.race([browser.close().catch(()=>{}),wait(4000)]);
}
process.exit(process.exitCode||0);