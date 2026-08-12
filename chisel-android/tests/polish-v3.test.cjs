const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

function exists(p){ return fs.existsSync(path.join(root,p)); }

test('scan guard exists and refuses weak captures instead of guessing', () => {
  assert.ok(exists('www/chisel-scan-guard.js'), 'scan guard runtime is missing');
  const guard = require(path.join(root,'www/chisel-scan-guard.js'));
  const weak = Array.from({length:8},()=>({frontal:false,qLum:35,faceFill:.18,rollDeg:13,yaw:.16,blink:.5,jawTaper:1.1,fWHR:1.7}));
  const result = guard.assessBurst(weak,false);
  assert.equal(result.accepted,false);
  assert.ok(result.corrections.length >= 1);
  const strong = Array.from({length:10},(_,i)=>({frontal:true,qLum:130+i,faceFill:.38,rollDeg:1,yaw:.01,blink:.1,jawTaper:1.08+(i%2)*.002,fWHR:1.72+(i%2)*.003,shLw:1.40+(i%2)*.002,shJc:.82+(i%2)*.002,shFc:.90+(i%2)*.002}));
  assert.equal(guard.assessBurst(strong,false).accepted,true);
});

test('face yoga is a real unisex AR session with multiple movements', () => {
  const coach = require(path.join(root,'www/chisel-ar-coach-core.js'));
  assert.ok(coach.SESSIONS.yoga, 'Face Yoga session is missing');
  assert.ok(coach.SESSIONS.yoga.exerciseIds.length >= 4);
  assert.match(coach.SESSIONS.yoga.title,/face yoga/i);
  for(const id of coach.SESSIONS.yoga.exerciseIds) assert.ok(coach.exerciseById(id),`Missing yoga exercise ${id}`);
});

test('try-on polish exposes direct men women beard and makeup entry points', () => {
  assert.ok(exists('www/chisel-experience-polish.js'), 'experience polish runtime is missing');
  const js = read('www/chisel-experience-polish.js');
  for(const token of ['Men hair','Beard studio','Women hair','Makeup studio']) assert.match(js,new RegExp(token,'i'));
  assert.match(js,/styleBeard\s*=\s*0/,'generic try-on must open clean-shaven');
  assert.match(js,/preview-only/,'try-on needs a compact preview state so the jaw remains visible');
});

test('new polish runtimes are mirrored into Android packaged assets', () => {
  for(const file of ['chisel-scan-guard.js','chisel-experience-polish.js']){
    assert.ok(exists(`www/${file}`),`${file} missing from www`);
    assert.ok(exists(`android/app/src/main/assets/public/${file}`),`${file} missing from Android package`);
    assert.equal(read(`www/${file}`),read(`android/app/src/main/assets/public/${file}`),`${file} differs between www and Android assets`);
  }
});
