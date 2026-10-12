/* Production Android App Bundle profile.
   Sai creates the upload key and android/keystore.properties locally.
   This script refuses to invent a key or embed a password. */
const {spawnSync} = require('node:child_process');
const path = require('node:path');

const appRoot = path.resolve(__dirname, '..');
const android = path.join(appRoot, 'android');
const keystore = path.join(android, 'keystore.properties');
if (!require('node:fs').existsSync(keystore)) {
  console.error('Release signing is not configured. Sai must create the upload key and android/keystore.properties before building the Play AAB. See docs/PLAY_INTERNAL_TESTING.md.');
  process.exit(1);
}

const sync = spawnSync('npx', ['cap', 'sync', 'android'], {cwd: appRoot, stdio: 'inherit'});
if (sync.status !== 0) process.exit(sync.status || 1);

const win = process.platform === 'win32';
const gradle = win ? 'gradlew.bat' : './gradlew';
const build = spawnSync(gradle, [':app:bundleRelease'], {cwd: android, stdio: 'inherit', shell: win});
if (build.status !== 0) process.exit(build.status || 1);
console.log('Production AAB: android/app/build/outputs/bundle/release/app-release.aab');
