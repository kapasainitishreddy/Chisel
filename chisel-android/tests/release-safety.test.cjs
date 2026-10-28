const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('free-first release does not expose unfinished paid account creation',()=>{
  const html=read('www/index.html');
  const credits=read('www/chisel-credits-ui.js');
  assert.match(html,/CHISEL_RELEASE_CONFIG\s*=\s*Object\.freeze\(\{billingEnabled:false/);
  assert.match(html,/cloudPhotoRendersEnabled!==true/);
  assert.match(credits,/Credit purchases and paid accounts are disabled in this release/);
  assert.match(credits,/button\.hidden=!billingEnabled\(\)/);
});

test('privacy and deletion disclosures are present in the shipping surfaces',()=>{
  const html=read('www/index.html');
  const policy=read('../docs/privacy-policy.html');
  const terms=read('../docs/terms-of-use.html');
  assert.match(html,/href="privacy-policy\.html"/);
  assert.equal(fs.readFileSync(path.join(root,'www/privacy-policy.html'),'utf8'),fs.readFileSync(path.join(root,'../docs/privacy-policy.html'),'utf8'));
  assert.match(html,/terms-of-use\.html/);
  assert.match(html,/function wipeAllData\(\)/);
  assert.match(html,/Clear all my data/);
  assert.match(policy,/Camera/);
  assert.match(policy,/optional cloud editing/i);
  assert.match(policy,/tapping <em>Make it photoreal<\/em> captures a still from the live camera view/i);
  assert.match(policy,/there is no additional confirmation dialog in this flow/i);
  assert.match(policy,/credit-backed account and purchase flow is disabled in this release/i);
  assert.match(policy,/paid accounts and credit purchases are disabled/i);
  assert.match(policy,/nittureddy26@gmail\.com/);
  assert.match(html,/photoreal style tool sends a still captured from the live camera to Chisel's backend and Replicate/i);
  assert.match(html,/paid accounts and credit-backed photo edits are disabled in this release/i);
  assert.match(html,/Retry sends another frame/i);
  assert.match(html,/id="photorealPrivacyNote"[\s\S]*?Tapping Make it photoreal sends a still from this live camera view to Chisel's backend and Replicate/i);
  assert.match(html,/Retry submits a newly captured camera frame to the cloud renderer/i);
  assert.match(html,/const image = capturePhotorealSource\(\)/);
  assert.match(html,/fetch\(RENDER_FN_URL/);
  assert.match(terms,/not a diagnosis/i);
  assert.match(terms,/Stop immediately/i);
});

test('release signing fails closed without developer-owned credentials',()=>{
  const gradle=read('android/app/build.gradle');
  assert.match(gradle,/Release signing is not configured/);
  assert.match(gradle,/keystore\.properties/);
});

test('Capacitor sync copies appearance runtime and licensed fonts into Android assets',()=>{
  for(const file of ['chisel-appearance.js','chisel-studio-theme.css','fonts/public-sans-400.woff2','fonts/public-sans-600.woff2','fonts/public-sans-700.woff2','fonts/OFL.txt']){
    const source=path.join(root,'www',file),target=path.join(root,'android/app/src/main/assets/public',file);
    assert.ok(fs.existsSync(source),`canonical ${file} exists`);
    assert.ok(fs.existsSync(target),`synced Android ${file} exists`);
    assert.deepEqual(fs.readFileSync(target),fs.readFileSync(source),`${file} is synced byte-identically`);
  }
});
