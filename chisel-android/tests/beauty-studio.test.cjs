const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const beauty = require('../www/chisel-beauty-studio.js');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

test('women hair library is broad and includes modern cuts and textured hair', () => {
  assert.ok(beauty.WOMEN_HAIR_LIBRARY.length >= 16);
  for (const id of ['frenchbob','butterfly','curtain','layers','curls','coils','shag','wolf','braids','bun']) {
    assert.ok(beauty.WOMEN_HAIR_LIBRARY.some((style) => style.id === id), id);
  }
});

test('hair recommendations honor texture and length instead of face shape alone', () => {
  const rec = beauty.recommendWomenHair('round', { texture:'coily', length:'medium', maintenance:'medium' }, 6);
  assert.equal(rec[0].style.textures.includes('coily'), true);
  assert.equal(rec[0].style.length, 'medium');
});

test('blush placement changes with face shape and occasion', () => {
  assert.equal(beauty.blushPlacementFor('round', 'everyday'), 'lifted');
  assert.equal(beauty.blushPlacementFor('oblong', 'everyday'), 'horizontal');
  assert.equal(beauty.blushPlacementFor('square', 'romantic'), 'apples');
  assert.equal(beauty.blushPlacementFor('heart', 'evening'), 'draped');
});

test('makeup guide returns actionable sections without a numeric beauty score', () => {
  const guide = beauty.makeupGuide({ undertone:'Olive', faceShape:'heart', vibe:'soft-glam' });
  assert.equal(guide.undertone, 'Olive');
  assert.deepEqual(guide.sections.map((section) => section.title), ['Base','Brows','Eyes','Blush','Lips']);
  assert.equal(Object.prototype.hasOwnProperty.call(guide, 'score'), false);
  assert.doesNotMatch(JSON.stringify(guide.sections), /\/100|attractiveness/i);
  assert.match(guide.note, /styling guidance/i);
});

test('beauty studio is present in both canonical and packaged Android assets', () => {
  assert.equal(read('www/chisel-beauty-studio.js'), read('android/app/src/main/assets/public/chisel-beauty-studio.js'));
});
