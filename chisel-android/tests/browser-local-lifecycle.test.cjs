const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('playwright');
const webRoot=path.resolve(__dirname,'../www');
let server,browser,context,page,requests=[],errors=[];
const fakeVision=`export const FilesetResolver={forVisionTasks:async()=>({})};
export const FaceLandmarker={FACE_LANDMARKS_TESSELATION:[],FACE_LANDMARKS_FACE_OVAL:[],FACE_LANDMARKS_LIPS:[],FACE_LANDMARKS_LEFT_EYE:[],FACE_LANDMARKS_RIGHT_EYE:[],FACE_LANDMARKS_LEFT_EYEBROW:[],FACE_LANDMARKS_RIGHT_EYEBROW:[],FACE_LANDMARKS_LEFT_IRIS:[],FACE_LANDMARKS_RIGHT_IRIS:[],createFromOptions:async()=>({detect:()=>({faceLandmarks:[]}),detectForVideo:()=>({faceLandmarks:[]})})};`;

test('browser photo lifecycle, comparison, undo, keyboard, reduced motion, large viewport text, and deletion recovery',async t=>{
  t.after(async()=>{if(browser)await browser.close();if(server)await new Promise(resolve=>server.close(resolve));});
  server=http.createServer((req,res)=>{
    let name;try{name=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);}catch{name='/';}if(name==='/')name='/index.html';
    const file=path.resolve(webRoot,'.'+name);if(!file.startsWith(webRoot+path.sep)&&file!==webRoot){res.writeHead(403).end();return;}
    fs.stat(file,(error,stat)=>{if(error||!stat.isFile()){res.writeHead(404).end();return;}const ext=path.extname(file);const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json'}[ext]||'application/octet-stream';res.writeHead(200,{'content-type':mime});fs.createReadStream(file).pipe(res);});
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const address=server.address(),base=`http://127.0.0.1:${address.port}`;
  const executablePath=process.env.CHISEL_CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
  if(!executablePath&&!fs.existsSync(chromium.executablePath())){t.skip('Install Playwright Chromium or set CHISEL_CHROMIUM_PATH to an existing Chromium binary.');return;}
  browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
  context=await browser.newContext({viewport:{width:390,height:844}});await context.grantPermissions(['camera'],{origin:base});page=await context.newPage();page.setDefaultTimeout(8000);
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push({url:r.url(),method:r.method(),body:r.postData()}));
  await page.addInitScript(()=>{window.__photoURLs={created:[],revoked:[]};const create=URL.createObjectURL.bind(URL),revoke=URL.revokeObjectURL.bind(URL);URL.createObjectURL=value=>{const url=create(value);window.__photoURLs.created.push(url);return url;};URL.revokeObjectURL=url=>{window.__photoURLs.revoked.push(url);return revoke(url);};});
  await page.route('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/**/vision_bundle.mjs',async route=>{await new Promise(resolve=>setTimeout(resolve,900));await route.fulfill({contentType:'text/javascript',body:fakeVision});});
  await page.route('https://storage.googleapis.com/mediapipe-models/**',route=>route.abort());
  await page.route(/^https:\/\/[^/]+\.supabase\.co\//,route=>route.abort());
  await page.goto(base,{waitUntil:'domcontentloaded'});await page.locator('.screen.active').waitFor();await page.locator('#boot.gone').waitFor();await page.waitForTimeout(1000);
  if(await page.locator('#idModal.on').count()){await page.locator('[data-gender="nonbinary"]').click();await page.locator('#idSave').click();}

  const imageBytes=await page.evaluate(async()=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=160;const c=canvas.getContext('2d');c.fillStyle='#d9c3a2';c.fillRect(0,0,160,160);c.fillStyle='#4c3529';c.beginPath();c.arc(80,63,46,Math.PI,0);c.fill();c.fillStyle='#f4dbba';c.beginPath();c.ellipse(80,83,33,42,0,0,Math.PI*2);c.fill();c.fillStyle='#211b1b';c.beginPath();c.arc(68,78,3,0,7);c.arc(92,78,3,0,7);c.fill();c.beginPath();c.arc(80,101,12,0,Math.PI);c.stroke();const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));return Array.from(new Uint8Array(await blob.arrayBuffer()));});
  const synthetic={name:'synthetic-test-face.png',mimeType:'image/png',buffer:Buffer.from(imageBytes)};

  await page.locator('[data-cps-add-caption]').click();assert.match(await page.locator('.cps-private-note').innerText(),/Saved on this device\. Not uploaded\./,'local photo boundary is shown before selection');await page.locator('#cpsPhotoFile').setInputFiles(synthetic);
  await page.getByText('Photo saved on this device.').waitFor();assert.equal(await page.evaluate(()=>window.ChiselPersonalPhoto.getStore().snapshot().hasPhoto),true,'synthetic photo is saved locally');
  await page.locator('#cpsPhotoRemove').click();await page.getByText('Photo removed.').waitFor();assert.equal(await page.evaluate(()=>window.ChiselPersonalPhoto.getStore().snapshot().hasPhoto),false,'remove clears the saved photo');
  await page.locator('#cpsPhotoClose').click();await page.locator('[data-cps-add-caption]').click();await page.locator('#cpsPhotoFile').setInputFiles(synthetic);
  await page.getByText('Photo saved on this device.').waitFor();assert.equal(await page.evaluate(()=>window.ChiselPersonalPhoto.getStore().snapshot().hasPhoto),true,'reselecting restores the local photo after removal');await page.locator('#cpsPhotoClose').click();

  await page.locator('details.cs-home-more > summary').click();const picker=page.locator('#openPicker');await picker.evaluate(e=>e.scrollIntoView());await picker.click();
  const urlStart=await page.evaluate(()=>window.__photoURLs.created.length);
  await page.evaluate(()=>{imgKitReady=()=>new Promise(resolve=>setTimeout(()=>resolve(null),1200));});
  await page.locator('#pickerFiles').setInputFiles([{...synthetic,name:'capture-1.png'},{...synthetic,name:'capture-2.png'}]);
  const dialog=page.getByRole('dialog',{name:'Capture notes'});await dialog.waitFor();
  assert.equal(await page.locator('.app').evaluate(e=>e.inert),true,'background app content is inert while the comparison dialog is open');
  await page.keyboard.press('Escape');await page.locator('#pickerModal.on').waitFor({state:'detached'});await page.waitForTimeout(1350);
  assert.equal(await page.locator('#pickerBody article').count(),0,'closed in-flight comparison does not render stale results');
  assert.equal(await page.evaluate(n=>window.__photoURLs.created.slice(n).every(url=>window.__photoURLs.revoked.includes(url)),urlStart),true,'interrupted comparison revokes both temporary image URLs');
  await page.evaluate(()=>{imgKitReady=()=>Promise.resolve(null);});await picker.click();const failedURLStart=await page.evaluate(()=>window.__photoURLs.created.length);
  await page.locator('#pickerFiles').setInputFiles([{...synthetic,name:'capture-1.png'},{...synthetic,name:'capture-2.png'}]);
  await page.locator('#pickerBody article').nth(1).waitFor();assert.equal(await page.locator('#pickerBody article').count(),2,'both selected files remain in input order');
  assert.match(await page.locator('#pickerBody').innerText(),/On-device photo check is unavailable/,'model-unavailable state is understandable');
  assert.match(await page.locator('#pickerBody').innerText(),/simple, unvalidated local checks/);
  await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.closest('#pickerModal')!==null),true,'Tab focus remains inside the modal');
  await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.closest('#pickerModal')!==null),true,'Shift+Tab focus remains inside the modal');
  assert.equal(await page.evaluate(n=>window.__photoURLs.created.length-n,failedURLStart),2,'comparison creates short-lived previews');
  await page.screenshot({path:'/tmp/chisel-photo-comparison-dialog.png'});
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),true);
  const duration=await page.locator('#pickerModal .panel').evaluate(e=>parseFloat(getComputedStyle(e).animationDuration));assert.ok(duration<0.02,'reduced-motion preference removes modal animation');
  await page.keyboard.press('Escape');await page.locator('#pickerModal.on').waitFor({state:'detached'});await page.waitForTimeout(20);assert.equal(await page.evaluate(()=>document.activeElement.id),'openPicker',`keyboard close restores focus to launch control (return=${await page.evaluate(()=>pickerReturnFocus?.id||'none')})`);
  assert.equal(await page.evaluate(n=>window.__photoURLs.created.slice(n).every(url=>window.__photoURLs.revoked.includes(url)),failedURLStart),true,'closing comparison revokes both temporary image URLs');
  await page.evaluate(()=>{imgKitReady=()=>Promise.resolve({detect:()=>({faceLandmarks:[]})});});await picker.click();await page.locator('#pickerFiles').setInputFiles(synthetic);
  await page.locator('#pickerBody article').first().waitFor();assert.match(await page.locator('#pickerBody').innerText(),/No face was detected for capture checks/,'no-face state is explicit');
  const textScale=await page.evaluate(()=>{const panel=document.querySelector('#pickerModal .panel');for(const el of panel.querySelectorAll('button,h3,p,li,article span')){const size=parseFloat(getComputedStyle(el).fontSize);if(Number.isFinite(size))el.style.fontSize=`${size*2}px`;}const close=document.querySelector('#pickerX').getBoundingClientRect();return{closeVisible:close.width>0&&close.height>0,client:panel.clientHeight,scroll:panel.scrollHeight};});
  assert.equal(textScale.closeVisible,true,'dialog close control remains visible at 200% text');assert.ok(textScale.scroll>=textScale.client,'large-text content remains reachable by scrolling');await page.screenshot({path:'/tmp/chisel-photo-comparison-200pct.png'});await page.locator('#pickerX').click();

  await page.setViewportSize({width:195,height:422});await page.locator('details.cs-home-more > summary').evaluate(e=>e.scrollIntoView());
  const narrow=await page.evaluate(()=>({width:innerWidth,main:document.querySelector('main.view').clientWidth,scroll:document.querySelector('main.view').scrollWidth,summary:document.querySelector('details.cs-home-more > summary').getBoundingClientRect().toJSON()}));
  assert.ok(narrow.summary.width>0&&narrow.summary.right<=narrow.width,'More disclosure stays visible at a 200%-zoom-equivalent viewport');

  await page.setViewportSize({width:390,height:844});
  await page.locator('a[data-route="groom"]').last().click();const openStyle=page.locator('#openStyle');await openStyle.evaluate(e=>e.scrollIntoView());await openStyle.click();
  if(await page.locator('#camConsentOk').isVisible())await page.locator('#camConsentOk').click();
  await page.locator('#camwrap.on').waitFor();await page.locator('#hairChips button').first().waitFor();
  assert.equal(await page.locator('#hairChips').getAttribute('role'),'group');assert.equal(await page.locator('#hairChips').getAttribute('aria-labelledby'),'hairLab');
  const selected=page.locator('#hairChips button[aria-pressed="true"]').first(),beforeLabel=await selected.innerText();
  const alternative=page.locator('#hairChips button[aria-pressed="false"]').first();
  await alternative.focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#hairChips button[aria-pressed="true"]').count(),1,'keyboard selection maintains one active style');
  const restore=page.locator('#hairChips button').filter({hasText:beforeLabel}).first();await restore.focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#hairChips button[aria-pressed="true"]').first().innerText(),beforeLabel,'the prior style can be restored with keyboard activation');
  await page.screenshot({path:'/tmp/chisel-style-keyboard.png'});
  await page.locator('#camBack').click();

  await page.evaluate(()=>go('connect'));await page.locator('#wipeData').scrollIntoViewIfNeeded();
  await page.evaluate(()=>{window.__savedGallery=window.ChiselLooksGallery;window.__savedStudio=window.ChiselLooksStudio;window.__dbDelete=indexedDB.deleteDatabase.bind(indexedDB);window.__clearSnapshot=null;window.ChiselLooksGallery=undefined;window.ChiselLooksStudio=undefined;indexedDB.deleteDatabase=name=>{if(name!=='chisel-saved-looks')return window.__dbDelete(name);const request={};queueMicrotask(()=>request.onblocked&&request.onblocked());return request;};sessionStorage.setItem('chisel:credit-session','synthetic-test-token');localStorage.setItem('chisel:browser-test','fixture');});
  page.once('dialog',dialog=>dialog.accept());await page.locator('#wipeData').click();await page.getByText('Could not finish deleting your data. Please try again.').waitFor();
  assert.equal(await page.evaluate(()=>window.ChiselPersonalPhoto.getStore().snapshot().hasPhoto),true,'blocked database clear keeps the photo and does not claim success');assert.equal(await page.evaluate(()=>localStorage.getItem('chisel:browser-test')),'fixture','failed delete leaves remaining local records for retry');
  assert.equal(await page.evaluate(()=>window.__clearSnapshot),null,'failed deletion does not announce the completion event');
  await page.evaluate(()=>{indexedDB.deleteDatabase=window.__dbDelete;window.ChiselLooksGallery=window.__savedGallery;window.ChiselLooksStudio=window.__savedStudio;window.__clearSnapshot=null;addEventListener('chisel:data-cleared',()=>{window.__clearSnapshot={keys:Object.keys(localStorage).filter(k=>k.startsWith('chisel:')),session:sessionStorage.getItem('chisel:credit-session')};});sessionStorage.setItem('chisel:credit-session','synthetic-test-token');});
  page.once('dialog',dialog=>dialog.accept());await page.locator('#wipeData').click();await page.waitForFunction(()=>window.__clearSnapshot!==null);
  assert.deepEqual(await page.evaluate(()=>window.__clearSnapshot.keys),[],'local clear removes namespaced records');assert.equal(await page.evaluate(()=>window.__clearSnapshot.session),null,'local clear removes the same-tab session token');
  assert.equal(await page.evaluate(()=>window.ChiselPersonalPhoto.getStore().snapshot().hasPhoto),false,'local clear removes the image before reporting success');
  assert.doesNotMatch(await page.locator('#toast').innerText(),/Could not finish/);assert.deepEqual(errors,[],'journey finishes without uncaught page errors');
  assert.equal(requests.filter(r=>r.method==='POST'&&new URL(r.url).origin!==base).length,0,'the synthetic local-image journey makes no external POST requests');
  await page.screenshot({path:'/tmp/chisel-browser-local-lifecycle.png'});
});
