const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),web=path.join(root,'www');let count=0;
for(const file of fs.readdirSync(web)){if(/\.(js|mjs)$/.test(file)){execFileSync(process.execPath,['--check',path.join(web,file)],{stdio:'pipe'});count++;}}
const html=fs.readFileSync(path.join(web,'index.html'),'utf8');for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(!/\bsrc=/.test(match[1])&&!/application\/ld\+json/.test(match[1]))new vm.Script(match[2]);}
const runtime=fs.readFileSync(path.join(web,'chisel-ar-coach-core.js'),'utf8');for(const ref of new Set([...runtime.matchAll(/['"](chisel-[a-z0-9-]+\.(?:js|mjs|css))['"]/g)].map(m=>m[1])))if(!fs.existsSync(path.join(web,ref)))throw Error(`Runtime asset missing: ${ref}`);
console.log(`Validated ${count} modules, inline app scripts and runtime assets.`);
