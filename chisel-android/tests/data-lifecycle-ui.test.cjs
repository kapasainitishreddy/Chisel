const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const html=fs.readFileSync('www/index.html','utf8');

test('settings distinguish local storage, encrypted export, and optional cloud data',()=>{
  const section=html.slice(html.indexOf('Where your data lives'),html.indexOf('</section>',html.indexOf('Where your data lives')));
  assert.match(section,/not encrypted by Chisel/i);
  assert.match(section,/optional encrypted backup protects only its listed records/i);
  assert.match(section,/excludes your selected portrait and saved AI gallery/i);
  assert.match(section,/does not delete an optional cloud account/i);
  assert.match(html,/paid credit features use an account and cloud services/i);
});

test('local deletion names its scope and keeps cloud account deletion separate',()=>{
  assert.match(html,/Delete Chisel data stored on this device, including scans, the selected portrait, saved looks/i);
  assert.match(html,/manage or delete those in the account controls/i);
  const photos=fs.readFileSync('www/chisel-personal-photo.js','utf8');
  assert.match(photos,/await root\.ChiselLooksStudio\.clearSaved\(\)/);
  assert.match(photos,/await remove\(\)/);
  assert.match(photos,/k\.startsWith\('chisel:'\)/);
});

test('Android backup flag is not confused with encryption of live WebView stores',()=>{
  const manifest=fs.readFileSync('android/app/src/main/AndroidManifest.xml','utf8');
  assert.match(manifest,/android:allowBackup="false"/);
  assert.match(html,/live records are not encrypted by Chisel/i);
  assert.match(html,/device-to-device transfer behavior can vary/i);
});

test('legacy style controls expose selected state and usable touch targets',()=>{
  assert.match(html,/setAttribute\('aria-pressed',String\(!!on\)\)/);
  assert.match(html,/setAttribute\('aria-label',c\.name/);
  assert.match(html,/#styleBar \.sc\{[^}]*min-height:44px/);
  assert.match(html,/#styleBar \.sw\{[^}]*width:44px;height:44px/);
  assert.match(html,/\['match','Suggested'\]/);
  assert.doesNotMatch(html,/Best matches/);
  assert.doesNotMatch(html,/c\.name\s*\+\s*\(m\s*\?\s*' · suits you'/);
});

test('camera permission and startup failures have a next step',()=>{
  assert.match(html,/function cameraFailureMessage\(error\)/);
  assert.match(html,/Allow camera access for Chisel in Android Settings, then tap Test Camera again/);
  assert.match(html,/No camera was found/);
  assert.match(html,/Close other apps using the camera, then try Test Camera again/);
  assert.match(html,/if\(await openCam\(\)\) \$\('#camMeta'\)\.textContent='Test mode'/);
});
