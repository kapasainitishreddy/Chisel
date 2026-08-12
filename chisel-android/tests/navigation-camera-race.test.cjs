const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const runtime = require(path.join(root, 'www/chisel-tryon-runtime-fixes.js'));

test('duplicate hashchange for the already-active route is ignored', () => {
  assert.equal(runtime.isDuplicateRoute('analyze', 'analyze', '#analyze'), true);
  assert.equal(runtime.isDuplicateRoute('home', 'home', '#home'), true);
});

test('real navigation is never swallowed by the duplicate-route guard', () => {
  assert.equal(runtime.isDuplicateRoute('groom', 'analyze', '#analyze'), false);
  assert.equal(runtime.isDuplicateRoute('analyze', 'analyze', '#home'), false);
  assert.equal(runtime.isDuplicateRoute('analyze', 'home', '#analyze'), false);
});

test('runtime fix auto-installs in browser and stays mirrored in Android assets', () => {
  const web = fs.readFileSync(path.join(root, 'www/chisel-tryon-runtime-fixes.js'), 'utf8');
  const android = fs.readFileSync(path.join(root, 'android/app/src/main/assets/public/chisel-tryon-runtime-fixes.js'), 'utf8');
  assert.equal(web, android);
  assert.match(web, /addEventListener\('load',[\s\S]*api\.install/);
  assert.match(web, /__chiselRouteGuard/);
});
