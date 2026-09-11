const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=path.join(__dirname,'../www');
const apiPath=path.join(base,'chisel-studio-theme.js');
test('studio tools live in a shared header instead of floating over task controls',()=>{
 const src=fs.readFileSync(apiPath,'utf8');
 const css=fs.readFileSync(path.join(base,'chisel-studio-theme.css'),'utf8');
 assert.match(src,/main\.prepend\(masthead\)/,'All routes share the in-flow header');
 assert.doesNotMatch(src,/body\.append\(button,dialog\)/,'Tools must not float over the task area');
 assert.match(css,/\.cs-orbit-trigger\s*\{[^}]*position:static/,'Tools occupy their own header space');
 assert.doesNotMatch(css,/\.cs-orbit-trigger\s*\{[^}]*(?:position:fixed|translateX)/);
});
