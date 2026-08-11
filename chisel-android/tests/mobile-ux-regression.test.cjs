const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'www/index.html'), 'utf8');

function functionBody(name) {
  const start = html.indexOf(`function ${name}`);
  assert.notEqual(start, -1, `${name} is missing`);
  const next = html.indexOf('\nfunction ', start + 10);
  return html.slice(start, next === -1 ? html.length : next);
}

test('phone navigation has five primary tasks and a separate Settings entry', () => {
  const tabs = html.match(/<nav class="tabs" id="bottomTabs">([\s\S]*?)<\/nav>/);
  assert.ok(tabs, 'mobile tabs are missing');
  assert.equal((tabs[1].match(/data-route=/g) || []).length, 5);
  assert.doesNotMatch(tabs[1], />Connect</i);
  assert.match(html, /id="openSettings"[^>]*data-go="connect"[^>]*>Settings<\/button>/i);
});

test('phone tab layout owns the bottom inset only once', () => {
  assert.match(html, /grid-template-rows:minmax\(0,1fr\) 72px/);
  assert.match(html, /nav\.tabs\{display:grid;grid-template-columns:repeat\(5,minmax\(0,1fr\)\);[^}]*padding:4px 2px\}/s);
  assert.match(html, /nav\.tabs \.pill\{[^}]*width:calc\(\(100% - 4px\)\/5\)/s);
  assert.doesNotMatch(html, /nav\.tabs\{display:grid;[^}]*safe-area-inset-bottom/s);
});

test('facial hair is inclusive and deterministic across camera frames', () => {
  const beard = functionBody('drawBeard');
  const chips = functionBody('renderStyleChips');
  assert.doesNotMatch(beard, /styleGender\s*===\s*['"]women['"]/);
  assert.doesNotMatch(beard, /Math\.random/);
  assert.doesNotMatch(chips, /beardLab[\s\S]*style\.display\s*=\s*women/);
  assert.match(html, /Short styles/);
  assert.match(html, /Long styles/);
});

test('scan and AR overlays use high-contrast jaw and cheek structure guides', () => {
  const mesh = functionBody('drawMesh');
  const guide = functionBody('drawScanStructureGuide');
  const ar = functionBody('drawARCoachGuide');
  assert.match(mesh, /drawScanStructureGuide\(d,R\)/);
  assert.match(guide, /JAW_LOW/);
  assert.match(guide, /234,50,101,205,61/);
  assert.match(guide, /454,280,330,425,291/);
  assert.match(guide, /halo/i);
  assert.match(ar, /halo/i);
});

test('face results lead with jaw structure instead of a harmony score', () => {
  const start = html.indexOf('const areas=[');
  const end = html.indexOf('/* Brows', start);
  assert.ok(start >= 0 && end > start, 'result area list is missing');
  const areas = html.slice(start, end);
  assert.ok(areas.indexOf("k:'Jaw'") < areas.indexOf("k:'Skin'"), 'Jaw must appear before Skin');
  assert.match(areas, /k:'Jaw'[\s\S]*?priority:true/);
  const render = functionBody('renderResults');
  assert.match(render, /<h3>Face analysis<\/h3>/);
  assert.doesNotMatch(render, /\/100 harmony/i);
  assert.match(render, /a\.priority\?' open'/);
  const home = html.match(/<section class="screen active" data-screen="home">([\s\S]*?)<\/section>/);
  assert.ok(home, 'Home screen is missing');
  assert.doesNotMatch(home[1], /Lookmax Score|against the golden ratio/, 'Home must not frame analysis as an attractiveness rank');
});

test('Analyze keeps the scan and jaw coach visible before secondary options', () => {
  const analyze = html.match(/<section class="screen[^>]*" data-screen="analyze">([\s\S]*?)<\/section>/);
  assert.ok(analyze, 'Analyze screen is missing');
  assert.match(analyze[0], /class="screen analyze-screen"/);
  assert.doesNotMatch(analyze[1], /dermatology-grade skin scan/, 'technical detail must not bury the actions');
  const more = analyze[1].indexOf('<details class="scan-more">');
  assert.ok(more > 0, 'secondary scan options should be collapsible');
  assert.ok(analyze[1].indexOf('id="openAnalyze"') < more, 'Quick scan must stay immediately visible');
  assert.ok(analyze[1].indexOf('id="openTrain"') < more, 'Jaw coach must stay immediately visible');
  assert.ok(analyze[1].indexOf('id="openDeep"') > more, 'Deep scan belongs in secondary options');
});

test('style try-on controls fit the phone instead of clipping off-screen', () => {
  for (const id of ['hairChips', 'beardChips', 'colorChips', 'glassChips', 'makeupChips']) {
    assert.match(html, new RegExp(`class="scroller fit-grid" id="${id}"`), `${id} needs the phone-fit grid`);
  }
  assert.match(html, /@media \(max-width:560px\)\{[\s\S]*?#styleBar\{max-height:62vh;overflow-y:auto/);
  assert.match(html, /#styleBar\{max-height:62vh;overflow-y:auto;[^}]*bottom:max\(env\(safe-area-inset-bottom\),48px\)/, 'try-on tray must sit above Android system navigation');
  assert.match(html, /#styleBar \.fit-grid\{display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\);overflow:visible/);
  assert.match(html, /Hair &amp; facial hair mirror/);
});
