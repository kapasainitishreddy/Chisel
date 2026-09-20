const test = require('node:test');
const assert = require('node:assert/strict');
const theme = require('../www/chisel-studio-theme.js');

test('viewport normalization removes zoom-blocking directives', () => {
  const actual = theme.accessibleViewport('width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no, maximum-scale=1');
  assert.match(actual, /width=device-width/);
  assert.match(actual, /initial-scale=1/);
  assert.match(actual, /viewport-fit=cover/);
  assert.doesNotMatch(actual, /user-scalable\s*=\s*no/i);
  assert.doesNotMatch(actual, /maximum-scale\s*=\s*1(?:\.0*)?(?:,|$)/i);
});

test('viewport normalization preserves non-restrictive directives without duplication', () => {
  const actual = theme.accessibleViewport('width=device-width, initial-scale=1, viewport-fit=cover, minimum-scale=0.5');
  assert.equal(actual, 'width=device-width, initial-scale=1, viewport-fit=cover, minimum-scale=0.5');
});
