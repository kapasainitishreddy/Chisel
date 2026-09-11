const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'www/chisel-ar-coach-core.js'), 'utf8');

test('runtime presents hairstyle catalogs as unisex style families', () => {
  assert.doesNotMatch(source, /Men hairstyles|Women hairstyles/);
  assert.match(source, /Short \/ structured/);
  assert.match(source, /Long \/ layered/);
  assert.match(source, /Browse by style family, not gender/i);
});
