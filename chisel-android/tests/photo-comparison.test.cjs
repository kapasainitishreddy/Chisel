const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const html=fs.readFileSync('www/index.html','utf8');

test('photo comparison reports capture notes without ranking a face or expression',()=>{
  const picker=html.slice(html.indexOf('async function scorePhoto'),html.indexOf('/* ================= Makeup:',html.indexOf('async function scorePhoto')));
  assert.match(html,/Compare capture conditions/);
  assert.match(html,/Chisel does not score or rank your face or expression/);
  assert.match(html,/simple, unvalidated local checks/);
  assert.match(picker,/Lighting looks/);
  assert.match(picker,/Image detail looks/);
  assert.match(picker,/Image looks/);
  assert.match(picker,/Face framing looks/);
  assert.doesNotMatch(picker,/\.sort\(|Best pick|#\s*\+|score\s*:/);
  assert.doesNotMatch(picker,/mouthSmile|eyeBlink|genuine smile|symmetry|beauty score/i);
  assert.doesNotMatch(picker,/outputFaceBlendshapes\s*:\s*true/);
  assert.match(picker,/for\(const \[index,f\] of files\.entries\(\)\)/);
});

test('photo comparison keeps each preview local and revokes temporary URLs on close',()=>{
  const picker=html.slice(html.indexOf('async function scorePhoto'),html.indexOf('/* ================= Makeup:',html.indexOf('async function scorePhoto')));
  assert.doesNotMatch(picker,/fetch\s*\(|XMLHttpRequest|sendBeacon/);
  assert.match(picker,/URL\.createObjectURL\(f\)/);
  assert.match(picker,/function closePicker\(\)/);
  assert.match(picker,/if\(run!==pickerRunId\)return/);
  assert.match(picker,/URL\.revokeObjectURL\(url\)/);
  assert.match(html,/id="pickerBody" aria-live="polite"/);
  assert.match(html,/id="pickerModal" role="dialog" aria-modal="true" aria-labelledby="pickerTitle"/);
  assert.match(html,/<button class="x" id="pickerX" type="button" aria-label="Close photo comparison">/);
  assert.match(picker,/e\.key==='Escape'/);
  assert.match(picker,/e\.key!=='Tab'/);
  assert.match(picker,/notFocusable/);
  assert.match(picker,/pickerReturnFocus\.focus/);
});

test('style preset groups have names and pressed state for assistive technology',()=>{
  for(const [id,label]of [['hairChips','hairLab'],['beardChips','beardLab'],['colorChips','colorLab'],['glassChips','glassLab'],['makeupChips','makeupLab']])
    assert.match(html,new RegExp(`id="${id}" role="group" aria-labelledby="${label}"`));
  assert.match(html,/setAttribute\('aria-pressed',String\(!!on\)\)/);
});
