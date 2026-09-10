const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
test('style discovery is moved to the visible analyze route without disturbing the shared header',()=>{
 const root=path.join(__dirname,'../www');
 const src=fs.readFileSync(path.join(root,'chisel-studio-theme.js'),'utf8');
 assert.ok(src.includes('analyze.append(studio)'));
 assert.ok(src.includes('intro.append(launch)'));
 assert.ok(src.includes('main.prepend(masthead)'));
 assert.ok(src.includes('preventScroll:true'));
});
