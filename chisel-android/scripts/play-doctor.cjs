/* Release doctor for the Capacitor Android app.
   This is not Expo and does not call expo-doctor. The production artifact is
   the Gradle release App Bundle (npm run aab:production). */
const fs = require('node:fs');
const path = require('node:path');

const appRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(appRoot, '..');
const read = file => fs.readFileSync(path.join(repoRoot, file), 'utf8');
const problems = [];
const fail = message => problems.push(message);

const html = read('chisel-android/www/index.html');
const credits = read('chisel-android/www/chisel-credits-ui.js');
const gradle = read('chisel-android/android/app/build.gradle');
const pkg = JSON.parse(read('chisel-android/package.json'));
const policyApp = read('chisel-android/www/privacy-policy.html');
const policyDocs = read('docs/privacy-policy.html');

if (!/CHISEL_RELEASE_CONFIG\s*=\s*Object\.freeze\(\{billingEnabled:false,cloudPhotoRendersEnabled:true\}\)/.test(html)) {
  fail('Release flags must stay billingEnabled:false and cloudPhotoRendersEnabled:true for this internal-test build.');
}
if (!/const RC_API_KEY = '';/.test(html)) fail('RC_API_KEY must stay empty. Do not commit a RevenueCat key.');
if (!/create_user:billingEnabled\(\)&&!accountManagement/.test(credits)) fail('Email sign-in must not create accounts while billing is off.');
if (!/id="deleteCloudAccount"/.test(html)) fail('Settings is missing Delete cloud account.');
if (!/Release signing is not configured/.test(gradle)) fail('Release signing guard is missing.');
if (policyApp !== policyDocs) fail('Bundled privacy policy does not match docs/privacy-policy.html.');
for (const script of ['typecheck', 'test', 'doctor', 'aab:production']) {
  if (!pkg.scripts || !pkg.scripts[script]) fail(`package.json is missing the ${script} script.`);
}
for (const doc of ['docs/PLAY_DATA_SAFETY.md', 'docs/PLAY_HEALTH_DECLARATION.md', 'docs/PLAY_STORE_LISTING.md', 'docs/PLAY_INTERNAL_TESTING.md']) {
  if (!fs.existsSync(path.join(repoRoot, doc))) fail(`Missing ${doc}.`);
}

function banned(dir) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === 'build' || ent.name === '.gradle') continue;
      banned(full);
      continue;
    }
    if (/\.(?:jks|keystore)$/i.test(ent.name) || ent.name === 'keystore.properties') fail(`Signing secret is present: ${path.relative(repoRoot, full)}`);
  }
}
banned(path.join(appRoot, 'android'));

if (fs.existsSync(path.join(appRoot, 'eas.json')) || fs.existsSync(path.join(repoRoot, 'eas.json')) || fs.existsSync(path.join(appRoot, 'app.json'))) {
  fail('An Expo/EAS config is present. Chisel ships as a Capacitor app; do not add a second Android project.');
}

if (problems.length) {
  console.error('play doctor failed');
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log('play doctor passed');
console.log('- install/typecheck/test scripts are present');
console.log('- billing is off, RevenueCat public key is empty, and sign-in cannot create accounts');
console.log('- Settings exposes local wipe and existing-account deletion');
console.log('- no upload keystore is in the tree');
console.log('- production Android profile: npm run aab:production (Gradle :app:bundleRelease AAB)');
console.log('- expo-doctor: not applicable. This repository is Capacitor 7, not an Expo project.');
