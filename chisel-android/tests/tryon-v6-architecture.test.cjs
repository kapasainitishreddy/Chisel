const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const hair=read('www/chisel-tryon-hair-v5.js');
const beard=read('www/chisel-beard-tuning-v5.js');
const backend=read('../supabase/functions/render-lookmax/index.ts');
const hairPack=read('android/app/src/main/assets/public/chisel-tryon-hair-v5.js');
const beardPack=read('android/app/src/main/assets/public/chisel-beard-tuning-v5.js');
const hairApi=require('../www/chisel-tryon-hair-v5.js');

test('live hair uses separate silhouette families instead of one shared outer contour',()=>{
  assert.match(hair,/SILHOUETTE_FAMILIES/);
  for(const family of ['clipper','fringe-crop','swept-peak','pompadour','slick-back','curl-crown','flow','bob','long-layers','curtain','curl-mass','coil-mass','shag','braids','ponytail','bun','updo']){
    assert.ok(hair.includes(`family:'${family}'`)||hair.includes(`family:\"${family}\"`),`missing family ${family}`);
  }
  assert.match(hair,/function styleBlueprint/);
  assert.match(hair,/function drawFamily/);
  assert.doesNotMatch(hair,/const outer=roots\.map/);
});

test('beards use explicit moustache cheek jaw chin and neckline zones',()=>{
  assert.match(beard,/BEARD_BLUEPRINTS/);
  assert.match(beard,/moustache:/);
  assert.match(beard,/cheeks:/);
  assert.match(beard,/jaw:/);
  assert.match(beard,/chin:/);
  assert.match(beard,/neckline:/);
  assert.match(beard,/function beardBlueprint/);
  assert.match(beard,/function paintZone/);
});

test('local guide never paints opaque geometric hair or beard masks over the face',()=>{
  assert.match(hair,/HAIRLINE_LIFT/);
  assert.match(hair,/function silhouetteStroke/);
  assert.doesNotMatch(hair,/function fillBand/);
  assert.match(beard,/follicle-only zones/);
  assert.doesNotMatch(beard,/ctx\.filter=`blur\([^`]+`\);regionPath\(P,indices\);ctx\.fillStyle/);
});

test('live guide is outline-first rather than pretending to be rendered hair',()=>{
  assert.equal(hairApi.LIVE_GUIDE_STRANDS,0);
  assert.equal(hairApi.SIDE_GUIDE_STRANDS,2);
  assert.equal(hairApi.FRINGE_GUIDE_STRANDS,3);
  assert.match(hair,/edge\.slice\(2,-2\)/);
  assert.match(hair,/Live Style Guide/);
  assert.match(hair,/Live placement guide/);
});

test('photoreal request bridge captures exact selection before any legacy alias wrapper',()=>{
  assert.match(hair,/function installPhotorealRequestBridge/);
  assert.match(hair,/let pendingRequestedHair/);
  assert.match(hair,/function captureExactSelection/);
  assert.match(hair,/addEventListener\('click',captureExactSelection,true\)/);
  assert.match(hair,/pendingRequestedHair\|\|currentHairSelection\(\)/);
  assert.match(hair,/requestedHairId/);
  assert.match(hair,/requestedHairName/);
  assert.match(hair,/LEGACY_HAIR_ALIAS/);
});

test('Live Guide copy cannot fight the existing Quick AR summary observer',()=>{
  assert.doesNotMatch(hair,/new MutationObserver/);
  assert.doesNotMatch(hair,/querySelector\('\.cx-preview-title'\)/);
  assert.match(hair,/setTimeout\(syncExperienceCopy,220\)/);
});

test('try-on UX clearly separates local Live Guide from realistic generation',()=>{
  assert.match(hair,/Live Guide/);
  assert.match(hair,/Generate realistic try-on/);
  assert.match(hair,/actual hairstyle\/beard result/);
});

test('photoreal backend supports every current women style without generic aliases',()=>{
  for(const id of ['pixie','bixie','frenchbob','bob','lob','butterfly','curtain','layers','sleeklong','waves','curls','coils','shag','wolf','braids','pony','bun','updo']){
    assert.match(backend,new RegExp(`\\b${id}:`),`backend missing ${id}`);
  }
  assert.match(backend,/preserve the exact same person/i);
  assert.match(backend,/individual strand/i);
  assert.match(backend,/wig-like/i);
  assert.match(backend,/contact shadow/i);
});

test('new try-on renderers remain byte-identical in Android assets',()=>{
  assert.equal(hairPack,hair);
  assert.equal(beardPack,beard);
});
