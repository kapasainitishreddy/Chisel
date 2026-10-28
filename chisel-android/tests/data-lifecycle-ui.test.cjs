const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const html=fs.readFileSync('www/index.html','utf8');

test('settings distinguish local storage, encrypted export, and optional cloud data',()=>{
  const section=html.slice(html.indexOf('Where your data lives'),html.indexOf('</section>',html.indexOf('Where your data lives')));
  assert.match(section,/not encrypted by Chisel/i);
  assert.match(section,/optional encrypted backup protects only its listed records/i);
  assert.match(section,/excludes your selected portrait and saved AI gallery/i);
  assert.match(section,/does not delete any cloud records/i);
  assert.match(section,/photoreal style tool sends a still captured from the live camera/i);
  assert.match(section,/Retry sends another frame/i);
  assert.match(html,/paid credit features use an account and cloud services/i);
});

test('archive recovery is reachable from Settings and runs before app storage consumers',()=>{
  assert.match(html,/id="chiselPrivateToolsSettings" aria-haspopup="dialog"/);
  assert.ok(html.indexOf('ChiselPrivateArchive.recover(localStorage)')<html.indexOf('/* ---------- Utilities ---------- */'));
  const completion=fs.readFileSync('www/chisel-completion-ui.js','utf8');
  assert.match(completion,/not a full-device backup/i);
  assert.match(completion,/live WebView records remain unencrypted/i);
  assert.match(completion,/local unencrypted recovery copy/i);
  assert.match(completion,/concurrent multi-tab restore is not supported or tested/i);
  assert.match(completion,/selected portrait, saved AI gallery, camera-roll originals/);
  assert.match(completion,/Restore cancelled\. Nothing changed\./);
  const archive=fs.readFileSync('www/chisel-private-archive.js','utf8');
  assert.match(archive,/JOURNAL_KEY='chisel:archive:restore-journal:v1'/);
  assert.match(archive,/state='committed'/);
  assert.match(archive,/function recover\(storage\)/);
  assert.match(archive,/showRecoveryBlock/);
});

test('local deletion names its scope and keeps cloud account deletion separate',()=>{
  assert.match(html,/Delete Chisel data stored on this device, including scans, the selected portrait, saved looks/i);
  assert.match(html,/manage or delete those in the account controls/i);
  const photos=fs.readFileSync('www/chisel-personal-photo.js','utf8');
  assert.match(photos,/await root\.ChiselLooksStudio\.clearSaved\(\)/);
  assert.match(photos,/await remove\(\)/);
  assert.match(photos,/k\.startsWith\('chisel:'\)/);
  assert.match(html,/function deleteLocalDatabase\(name\)/);
  assert.match(html,/request\.onblocked=\(\)=>reject/);
  assert.match(html,/window\.ChiselPersonalPhoto\?\.getStore\)await window\.ChiselPersonalPhoto\.getStore\(\)\.clear\(\)/);
  assert.match(html,/window\.ChiselLooksGallery\?\.clear\)await window\.ChiselLooksGallery\.clear\(\)/);
  assert.match(html,/Could not finish clearing local data/);
  assert.match(photos,/else await deleteDatabase\('chisel-saved-looks'\)/);
  assert.match(photos,/chisel:credit-session/);
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
