const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const hash = (p) => crypto.createHash('sha256').update(read(p)).digest('hex');

test('MainActivity leaves the canonical app shell unmodified after it loads', () => {
  const java = read('android/app/src/main/java/com/chisel/lookmax/MainActivity.java');
  assert.match(java, /onCreate/);
  assert.doesNotMatch(java, /evaluateJavascript/);
  assert.doesNotMatch(java, /__chiselLabsNativeInjected/);
  assert.doesNotMatch(java, /chisel-(enhancements|premium|precision)/);
});

test('synced Android app shell exactly matches the canonical www index', () => {
  assert.equal(
    hash('www/index.html'),
    hash('android/app/src/main/assets/public/index.html'),
    'index.html differs between www and Android assets'
  );
});

test('canonical mobile navigation uses five compact primary tabs', () => {
  const html = read('www/index.html');
  const tabs = html.match(/<nav class="tabs" id="bottomTabs">([\s\S]*?)<\/nav>/);
  assert.ok(tabs, 'bottom tab navigation is missing');
  assert.equal((tabs[1].match(/class="ico"/g) || []).length, 5, 'every primary mobile route needs a glyph');
  assert.doesNotMatch(tabs[1], /data-go="connect"/, 'Settings must not compete with primary tasks');
  assert.match(html, /nav\.tabs a \.ico\{font-size:16px;line-height:1\}/);
  assert.match(html, /nav\.tabs a\{[\s\S]*?letter-spacing:\.04em[\s\S]*?text-transform:none/);
});

test('customer-facing Connect screen has no developer installation instructions', () => {
  const html = read('www/index.html');
  const connect = html.match(/<section class="screen" data-screen="connect">([\s\S]*?)<\/section>/);
  assert.ok(connect, 'Connect screen is missing');
  assert.doesNotMatch(connect[1], /USB debugging|Android Studio|Sideload the APK|deploy\.bat|npx serve/i);
  assert.match(connect[1], /Your data stays on this device/i);
});

test('synced Android enhancement assets exactly match the canonical www copies', () => {
  for (const file of ['chisel-enhancements-core.js', 'chisel-enhancements.js', 'chisel-enhancements.css', 'chisel-ar-coach-core.js']) {
    assert.equal(
      hash(`www/${file}`),
      hash(`android/app/src/main/assets/public/${file}`),
      `${file} differs between www and Android assets`
    );
  }
});

test('Android production shell forbids cleartext and mixed-content loading', () => {
  const config = JSON.parse(read('capacitor.config.json'));
  const manifest = read('android/app/src/main/AndroidManifest.xml');

  assert.equal(config.android?.allowMixedContent, false, 'mixed HTTP content must stay disabled');
  assert.equal(config.android?.webContentsDebuggingEnabled, false, 'WebView debugging must stay disabled');
  assert.equal(config.server?.androidScheme, 'https', 'Capacitor origin must stay HTTPS');
  assert.equal(config.server?.cleartext, false, 'Capacitor cleartext server access must stay disabled');
  assert.match(manifest, /android:usesCleartextTraffic="false"/);
  assert.match(manifest, /android:allowBackup="false"/);
});
