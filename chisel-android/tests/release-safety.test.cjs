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
  assert.match(html,/const RC_API_KEY = ''/);
  assert.match(html,/id="deleteCloudAccount"/);
  assert.match(html,/ChiselCredits && window\.ChiselCredits\.openAccount\(\)/);
  assert.match(credits,/Credit purchases and paid accounts are disabled in this release/);
  assert.match(credits,/button\.hidden=!billingEnabled\(\)/);
  assert.match(credits,/create_user:billingEnabled\(\)&&!accountManagement/);
  assert.match(credits,/This signs in to an existing account only/);
  assert.match(credits,/if\(installed\|\|!root\.ChiselWalletCore\)return false/);
  assert.doesNotMatch(credits,/!q\('#clsEditor'\)\)return false/);
});

test('privacy and deletion disclosures are present in the shipping surfaces',()=>{
  const html=read('www/index.html');
  const policy=read('../docs/privacy-policy.html');
  const terms=read('../docs/terms-of-use.html');
  assert.match(html,/href="privacy-policy\.html"/);
  assert.equal(read('www/privacy-policy.html'),fs.readFileSync(path.join(root,'../docs/privacy-policy.html'),'utf8'));
  assert.match(html,/terms-of-use\.html/);
  assert.match(html,/function wipeAllData\(\)/);
  assert.match(html,/Clear all my data/);
  assert.match(policy,/Camera/);
  assert.match(policy,/optional cloud editing/i);
  assert.match(policy,/paid accounts and credit purchases are disabled/i);
  assert.match(policy,/nittureddy26@gmail\.com/);
  assert.match(terms,/not a diagnosis/i);
  assert.match(terms,/Stop immediately/i);
});

test('release signing fails closed without developer-owned credentials',()=>{
  const gradle=read('android/app/build.gradle');
  assert.match(gradle,/Release signing is not configured/);
  assert.match(gradle,/keystore\.properties/);
});
