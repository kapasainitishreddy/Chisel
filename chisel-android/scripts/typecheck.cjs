/* Syntax and inline-script check for the Capacitor app and Supabase functions.
   The web app is JavaScript. Edge functions are TypeScript checked for syntax
   with Node's type stripper; they are not executed and no secrets are read. */
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');

const appRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(appRoot, '..');
const skip = new Set(['node_modules', 'build', '.gradle', 'android']);

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, {withFileTypes: true})) {
    if (skip.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

function check(file, args) {
  try {
    execFileSync(process.execPath, args, {stdio: 'pipe'});
  } catch (error) {
    const detail = error.stderr ? error.stderr.toString() : error.message;
    console.error(`typecheck failed: ${path.relative(repoRoot, file)}\n${detail}`);
    process.exit(1);
  }
}

const jsRoots = [
  path.join(appRoot, 'www'),
  path.join(appRoot, 'tests'),
  path.join(appRoot, 'scripts'),
  path.join(repoRoot, 'supabase', 'functions'),
];
const files = jsRoots.flatMap(dir => walk(dir));
const scripts = files.filter(file => /\.(?:js|cjs|mjs)$/.test(file));
const types = files.filter(file => file.endsWith('.ts'));

for (const file of scripts) check(file, ['--check', file]);
for (const file of types) check(file, ['--experimental-strip-types', '--check', file]);

execFileSync(process.execPath, [path.join(appRoot, 'scripts', 'verify-build.cjs')], {stdio: 'inherit'});
console.log(`Typecheck passed: ${scripts.length} JavaScript files, ${types.length} TypeScript files, inline app scripts.`);
