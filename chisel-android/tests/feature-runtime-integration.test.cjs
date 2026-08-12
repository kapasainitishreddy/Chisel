const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const hash = (p) => crypto.createHash('sha256').update(read(p)).digest('hex');

test('feature runtime loads Beauty Studio, Chisel Labs, and Precision after the app shell', () => {
  const js = read('www/chisel-ar-coach-core.js');
  for (const ref of [
    'chisel-beauty-studio.js',
    'chisel-enhancements.css',
    'chisel-enhancements-core.js',
    'chisel-enhancements.js',
    'chisel-precision.css',
    'chisel-precision-stats.js',
    'chisel-precision-protocol.js',
    'chisel-precision-core.js',
    'chisel-precision-face.js',
    'chisel-precision-body.js',
    'chisel-precision-ui.js',
    'chisel-precision.js'
  ]) assert.ok(js.includes(ref), `${ref} is not loaded by the runtime`);
});

test('Precision runtime loads dependency order before dependants', () => {
  const js = read('www/chisel-ar-coach-core.js');
  const order = ['chisel-precision-stats.js','chisel-precision-protocol.js','chisel-precision-core.js','chisel-precision-face.js','chisel-precision-body.js','chisel-precision-ui.js','chisel-precision.js'];
  for (let i=1;i<order.length;i++) assert.ok(js.indexOf(order[i-1]) < js.indexOf(order[i]), `${order[i-1]} must load before ${order[i]}`);
});

test('style gender switch is customer-facing Men / Women', () => {
  const js = read('www/chisel-ar-coach-core.js');
  assert.match(js, /textContent = 'Men'/);
  assert.match(js, /textContent = 'Women'/);
  assert.match(js, /aria-label', 'Men hairstyles'/);
  assert.match(js, /aria-label', 'Women hairstyles'/);
});

test('feature runtime is synchronized into the Android package assets', () => {
  assert.equal(hash('www/chisel-ar-coach-core.js'), hash('android/app/src/main/assets/public/chisel-ar-coach-core.js'), 'feature runtime differs between canonical www and Android assets');
});

test('floating Labs and Precision launchers stay below camera and modal layers', () => {
  const js = read('www/chisel-ar-coach-core.js');
  assert.match(js, /\.chl-launcher,\.chp-launcher\{z-index:180!important\}/);
});
