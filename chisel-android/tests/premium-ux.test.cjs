const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const hash = (p) => crypto.createHash('sha256').update(read(p)).digest('hex');

const premiumFiles = ['chisel-premium.css', 'chisel-premium.js'];

test('premium experience assets are synchronized into Android', () => {
  for (const file of premiumFiles) {
    assert.equal(
      hash(`www/${file}`),
      hash(`android/app/src/main/assets/public/${file}`),
      `${file} differs between canonical www and packaged Android assets`
    );
  }
});

test('native loader injects premium CSS before premium behavior and compiles against Capacitor', () => {
  const java = read('android/app/src/main/java/com/chisel/lookmax/MainActivity.java');
  const css = java.indexOf('chisel-premium.css');
  const js = java.indexOf('chisel-premium.js');
  assert.ok(css >= 0, 'premium CSS is not injected');
  assert.ok(js >= 0, 'premium JS is not injected');
  assert.ok(css < js, 'premium CSS must load before premium JS');
  assert.match(java, /public void onResume\s*\(/, 'Capacitor 6 requires public onResume');
});

test('premium CSS enforces mobile hierarchy, accessibility and restrained motion', () => {
  const css = read('www/chisel-premium.css');
  assert.match(css, /--chx-accent:/);
  assert.match(css, /grid-template-columns:\s*repeat\(4,\s*1fr\)/);
  assert.match(css, /min-height:\s*48px/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /safe-area-inset-bottom/);
  assert.match(css, /\.chx-scan-journey/);
  assert.match(css, /\.chx-concierge/);
});

test('premium behavior parses, simplifies navigation and builds a guided privacy-first experience', () => {
  const js = read('www/chisel-premium.js');
  assert.doesNotThrow(() => new vm.Script(js, { filename: 'chisel-premium.js' }));
  assert.match(js, /PRIMARY_ROUTES\s*=\s*\['home',\s*'analyze',\s*'groom',\s*'connect'\]/);
  assert.match(js, /function simplifyMobileNavigation/);
  assert.match(js, /function buildTrustStrip/);
  assert.match(js, /function buildScanJourney/);
  assert.match(js, /function buildConcierge/);
  assert.match(js, /Tracking Index/);
  assert.match(js, /not an attractiveness rating/i);
  assert.match(js, /on-device/i);
  assert.doesNotMatch(js, /\bfetch\s*\(/, 'premium shell must not upload or fetch user data');
  assert.doesNotMatch(js, /XMLHttpRequest/, 'premium shell must remain local-only');
});
