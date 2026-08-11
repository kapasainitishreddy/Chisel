const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'www/index.html'), 'utf8');

test('Analyze exposes the AR coach and loads its engine before app behavior', () => {
  assert.match(html, /id="openTrain"[^>]*>AR Jaw &amp; Cheek Coach<\/button>/);
  assert.match(html, /id="arCoachModal"/);
  assert.match(html, /id="arCoachHud"/);
  const core = html.indexOf('chisel-ar-coach-core.js');
  const app = html.indexOf('function deviceId');
  assert.ok(core >= 0 && app >= 0 && core < app, 'AR coach core must load before app behavior');
});

test('AR coach UI keeps safety, evidence, stop, and mobile-safe controls visible', () => {
  assert.match(html, /does not reshape adult facial bones/i);
  assert.match(html, /Evidence: Limited/i);
  assert.match(html, /id="arCoachStop"[^>]*aria-label="Stop AR coaching"/);
  assert.match(html, /\.ar-coach-hud\{[^}]*safe-area-inset-bottom/s);
  assert.match(html, /\.ar-session[^}]*min-height:48px/s);
  assert.doesNotMatch(html, /Clench &amp; hold|Clench & hold|Jaw jut/i);
});

test('main application script still parses after AR integration', () => {
  const blocks = [...html.matchAll(/<script(?:\s+src="[^"]+")?>([\s\S]*?)<\/script>/g)]
    .map((match) => match[1]).filter((source) => source.trim());
  for (const source of blocks) assert.doesNotThrow(() => new vm.Script(source));
});
