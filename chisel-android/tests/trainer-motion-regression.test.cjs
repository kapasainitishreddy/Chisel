'use strict';
const test=require('node:test'),assert=require('node:assert/strict');

test('trainer panel honours reduced motion and keeps a 44px close target',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const css=fs.readFileSync(path.join(__dirname,'../www/chisel-trainer-v2.css'),'utf8');
 const reduced=css.slice(css.indexOf('@media (prefers-reduced-motion:reduce)'));
 assert.match(reduced,/#arCoachModal \.panel\{animation:none!important;transition:none!important\}/);
 assert.match(css,/#arCoachX\{min-width:44px;min-height:44px;/);
});
