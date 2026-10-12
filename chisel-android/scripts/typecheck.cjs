/* Syntax check for the web app. There is no TypeScript project in www/. */
const {spawnSync} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const files = [];

function walk(dir) {
  for (const ent of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full);
    else if (/\.(?:cjs|mjs|js)$/.test(ent.name)) files.push(full);
  }
}

for (const dir of ['www', 'tests', 'scripts']) walk(path.join(root, dir));
files.sort();

let failed = 0;
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], {stdio: 'inherit'});
  if (result.status !== 0) failed += 1;
}

if (failed) {
  console.error(`${failed} file(s) failed node --check`);
  process.exit(1);
}
console.log(`${files.length} files passed node --check`);
