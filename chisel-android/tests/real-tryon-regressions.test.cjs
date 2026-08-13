const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const runtime = fs.readFileSync(path.join(root, 'www/chisel-ar-coach-core.js'), 'utf8');
const fixPath = path.join(root, 'www/chisel-tryon-runtime-fixes.js');
const packagedFixPath = path.join(root, 'android/app/src/main/assets/public/chisel-tryon-runtime-fixes.js');
const fix = fs.readFileSync(fixPath, 'utf8');
const fixes = require(fixPath);

test('Men/Women label repair is mutation-safe and cannot recursively rewrite identical labels', () => {
  assert.match(runtime, /buttons\[0\]\.textContent!=='Men'/);
  assert.match(runtime, /buttons\[1\]\.textContent!=='Women'/);
});

test('loader installs the user-controlled try-on fix before the polish layers', () => {
  const tryon = runtime.indexOf("chisel-tryon-runtime-fixes.js");
  const experience = runtime.indexOf("chisel-experience-polish.js");
  assert.ok(tryon >= 0);
  assert.ok(experience > tryon);
  assert.match(runtime, /ChiselTryonRuntimeFixes\.install\(\)/);
});

test('try-on fix is packaged exactly with Android', () => {
  assert.equal(fs.readFileSync(packagedFixPath, 'utf8'), fix);
  assert.doesNotThrow(() => new Function(fix));
});

test('generic try-on starts clean and face matching preserves a user-selected beard', () => {
  const nodes = {beardLab:{style:{}}, beardChips:{style:{}}, cxStyleSummary:{textContent:''}};
  const context = {
    styleBeard: 0,
    styleHair: 1,
    styleMakeup: 0,
    styleGender: 'men',
    HAIR_MEN:[{id:'none',name:'No hair'},{id:'quiff',name:'Quiff'}],
    HAIR_WOMEN:[{id:'none',name:'No hair'},{id:'bob',name:'Bob'}],
    BEARD_STYLES:[{id:'none',name:'Clean'},{id:'stubble',name:'Soft stubble'},{id:'short',name:'Short beard'}],
    MAKEUP_LOOKS:[{id:'none',name:'Bare'}],
    renderStyleChips(){},
    applyMatches(){ this.styleBeard = 5; },
    openStyle(){ this.styleBeard = 1; },
    document:{getElementById(id){return nodes[id] || null;}},
    console
  };
  context.globalThis = context;
  vm.runInNewContext(fix, context);
  context.ChiselTryonRuntimeFixes.install();

  context.openStyle();
  assert.equal(context.styleBeard, 0, 'generic try-on must start clean');

  context.applyMatches();
  assert.equal(context.styleBeard, 0, 'face matching must not silently add a beard');

  context.styleBeard = 2;
  context.applyMatches();
  assert.equal(context.styleBeard, 2, 'an explicit beard choice must survive later face matching');

  context.styleGender = 'women';
  context.styleBeard = 2;
  context.applyMatches();
  assert.equal(context.styleBeard, 0, 'Women Hair mode must not inherit facial hair');
  assert.equal(nodes.beardLab.style.display, 'none');
  assert.equal(nodes.beardChips.style.display, 'none');
});

test('live preview summary follows the selected hair and beard state', () => {
  assert.equal(fixes.previewSummary({id:'frenchbob',name:'French bob'},{id:'none',name:'Clean'}), 'French bob');
  assert.equal(fixes.previewSummary({id:'quiff',name:'Quiff'},{id:'short',name:'Short beard'}), 'Quiff + Short beard');
});

test('women haircuts resolve to materially different visual geometry', () => {
  const french = fixes.styleVisualProfile({id:'frenchbob',top:.32,side:.18,front:.22,jitter:.025,fall:.50,flare:.17,fringe:true},'women');
  const butterfly = fixes.styleVisualProfile({id:'butterfly',top:.42,side:.21,front:.39,jitter:.05,fall:1.08,flare:.24},'women');
  const curls = fixes.styleVisualProfile({id:'curls',top:.48,side:.26,front:.44,jitter:.115,fall:.90,flare:.27},'women');
  assert.ok(butterfly.fallPx > french.fallPx * 1.5, 'Butterfly must visibly fall longer than French bob');
  assert.ok(curls.textureStrength > butterfly.textureStrength, 'Defined curls must carry stronger texture than Butterfly');
  assert.notEqual(french.part, curls.part, 'French bob and curls must not share the same silhouette recipe');
});

test('premium local hair keeps the real forehead visible instead of drawing an opaque helmet', () => {
  const profile = fixes.styleVisualProfile({id:'frenchbob',top:.32,side:.18,front:.22,jitter:.025,fall:.50,flare:.17},'women');
  assert.ok(profile.hairlineLift >= .08, `hairlineLift=${profile.hairlineLift}`);
  assert.ok(profile.baseOpacity <= .72, `baseOpacity=${profile.baseOpacity}`);
});

test('men crop and quiff keep distinct front/crown behavior', () => {
  const crop = fixes.styleVisualProfile({id:'crop',top:.20,side:.10,front:.26,jitter:.01},'men');
  const quiff = fixes.styleVisualProfile({id:'quiff',top:.34,side:.10,front:.52,jitter:.015},'men');
  assert.ok(quiff.frontLift > crop.frontLift * 1.35);
  assert.notEqual(quiff.part, crop.part);
});
