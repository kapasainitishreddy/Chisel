const test = require('node:test');
const assert = require('node:assert/strict');
const theme = require('../www/chisel-studio-theme.js');
const appearance = require('../www/chisel-appearance.js');

function memory(){
  const bag = new Map();
  return {
    getItem: (key) => bag.has(key) ? bag.get(key) : null,
    setItem: (key, value) => bag.set(key, String(value)),
    removeItem: (key) => bag.delete(key)
  };
}

test('theme preference is system until the user chooses light or dark', () => {
  const store = memory();
  assert.equal(appearance.preference(store), 'system');
  assert.equal(appearance.setPreference('light', store), 'light');
  assert.equal(appearance.preference(store), 'light');
  assert.equal(appearance.setPreference('dark', store), 'dark');
  assert.equal(appearance.setPreference('system', store), 'system');
  assert.equal(appearance.setPreference('nope', store), 'system');
});

test('resolved mode follows the phone when preference is system', () => {
  assert.equal(appearance.resolved('system', 'light'), 'light');
  assert.equal(appearance.resolved('system', 'dark'), 'dark');
  assert.equal(appearance.resolved('light', 'dark'), 'light');
  assert.equal(appearance.resolved('dark', 'light'), 'dark');
});

test('light and dark text, muted, and button pairs meet WCAG AA', () => {
  for (const palette of [appearance.PALETTES.light, appearance.PALETTES.dark, theme.TOKENS]) {
    assert.ok(theme.contrastRatio(palette.text, palette.bg) >= 4.5);
    assert.ok(theme.contrastRatio(palette.muted, palette.surface || palette.bg) >= 4.5);
    assert.ok(theme.contrastRatio(palette.bg, palette.accent) >= 4.5);
  }
  for (const palette of [appearance.PALETTES.light, appearance.PALETTES.dark]) {
    assert.ok(theme.contrastRatio(palette.onAccent, palette.accent) >= 4.5);
    assert.ok(theme.contrastRatio(palette.sage, palette.surface) >= 4.5);
  }
});

test('haptics call Capacitor when it is present and stay quiet on the web', () => {
  assert.equal(appearance.haptic('LIGHT', null), false);
  let seen = null;
  const host = { impact(opts){ seen = opts; return Promise.resolve(); } };
  assert.equal(appearance.haptic('HEAVY', host), true);
  assert.deepEqual(seen, { style: 'HEAVY' });
  assert.equal(appearance.haptic('LIGHT', host), true);
  assert.deepEqual(seen, { style: 'LIGHT' });
});

test('icons are inline strokes without emoji', () => {
  for (const name of ['home', 'scan', 'affirm', 'meditate', 'groom', 'close', 'capture']) {
    const svg = appearance.icon(name);
    assert.match(svg, /<svg/);
    assert.doesNotMatch(svg, /[\u{1F300}-\u{1FAFF}❄◇◉✦◯▣]/u);
  }
});

test('apply sets the theme attribute and leaves system as the default', () => {
  const attrs = {};
  const meta = { value: '', setAttribute(name, value){ if (name === 'content') this.value = value; } };
  const document = {
    documentElement: {
      dataset: attrs,
      style: {},
    },
    querySelector: () => meta
  };
  assert.equal(appearance.apply(document, 'system', 'light'), 'light');
  assert.equal(attrs.chiselTheme, 'quiet-studio');
  assert.equal(attrs.theme, undefined);
  assert.equal(meta.value, appearance.PALETTES.light.bg);
  appearance.apply(document, 'dark', 'light');
  assert.equal(attrs.theme, 'dark');
  assert.equal(document.documentElement.style.colorScheme, 'dark');
});
