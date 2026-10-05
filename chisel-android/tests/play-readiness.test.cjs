const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function paywall(plugin){
 const html=read('www/index.html'),code=html.slice(html.indexOf('const RC_API_KEY'),html.indexOf('/* ---------- Boot ---------- */'));
 const elements=new Map(),messages=[];
 const $=s=>{if(!elements.has(s))elements.set(s,{hidden:false,innerHTML:'',classList:{add(){},remove(){this.closed=true;}},addEventListener(event,fn){this[event]=fn;}});return elements.get(s);};
 const context={window:{CHISEL_RELEASE_CONFIG:{billingEnabled:true},Capacitor:{Plugins:{Purchases:plugin}}},console:{warn(){}},deviceId:()=> 'test-device',$,toast:m=>messages.push(m),document:{createElement:()=>{throw Error('not needed');}}};
 vm.createContext(context);vm.runInContext(code.replace("const RC_API_KEY = '';","const RC_API_KEY = 'public-test';"),context);
 return{context,$,messages,ready:async()=>{await new Promise(r=>setImmediate(r));}};
}
const packageOffer={identifier:'plan',product:{title:'Premium',priceString:'₹499',subscriptionPeriod:'P1M',productCategory:'SUBSCRIPTION'}};
const info=active=>({customerInfo:{entitlements:{active:active?{premium:{isActive:true}}:{}}}});
test('purchase without an active entitlement does not announce Premium or close the paywall',async()=>{
 const h=paywall({configure:async()=>{},purchasePackage:async()=>info(false)});await h.ready();await h.context.purchase(packageOffer);
 assert.ok(h.messages.some(m=>/not.*active|not.*confirmed|pending/i.test(m)));assert.ok(!h.messages.some(m=>/enjoy Premium/.test(m)));assert.ok(!h.$('#paywall').classList.closed);
});
test('restore without active entitlement stays open and explains the result',async()=>{
 const h=paywall({configure:async()=>{},restorePurchases:async()=>info(false)});await h.ready();await h.$('#paywallRestore').click();
 assert.ok(h.messages.some(m=>/no active|not.*active/i.test(m)));assert.ok(!h.$('#paywall').classList.closed);
});
test('confirmed purchase and restore close the paywall, cancelled purchases do not',async()=>{
 for(const method of ['purchasePackage','restorePurchases']){const h=paywall({configure:async()=>{},[method]:async()=>info(true)});await h.ready();if(method==='purchasePackage')await h.context.purchase(packageOffer);else await h.$('#paywallRestore').click();assert.equal(h.$('#paywall').classList.closed,true);}
 const h=paywall({configure:async()=>{},purchasePackage:async()=>{throw {userCancelled:true};}});await h.ready();await h.context.purchase(packageOffer);assert.equal(h.messages.length,0);assert.ok(!h.$('#paywall').classList.closed);
});
test('release disabled flag prevents direct purchase and restore even after SDK setup',async()=>{
 let calls=0;const h=paywall({configure:async()=>{},purchasePackage:async()=>{calls++;return info(true);},restorePurchases:async()=>{calls++;return info(true);}});await h.ready();h.context.window.CHISEL_RELEASE_CONFIG.billingEnabled=false;await h.context.purchase(packageOffer);await h.$('#paywallRestore').click();assert.equal(calls,0);
});
test('cloud and device transfer exclude private WebView and preference data in every backup domain',()=>{
 const manifest=read('android/app/src/main/AndroidManifest.xml');assert.match(manifest,/android:dataExtractionRules="@xml\/data_extraction_rules"/);assert.match(manifest,/android:fullBackupContent="@xml\/backup_rules"/);
 const xml=read('android/app/src/main/res/xml/data_extraction_rules.xml'),legacy=read('android/app/src/main/res/xml/backup_rules.xml');
 for(const section of ['cloud-backup','device-transfer']){const body=xml.match(new RegExp('<'+section+'[^>]*>([\\s\\S]*?)</'+section+'>'))?.[1];assert.ok(body,section);for(const domain of ['root','file','database','sharedpref','external','device_root','device_file','device_database','device_sharedpref'])assert.ok(body.includes('domain="'+domain+'" path="."'),section+': '+domain);}
 for(const domain of ['root','file','database','sharedpref','external'])assert.ok(legacy.includes('domain="'+domain+'" path="."'));
});
test('billing SDK uses Billing 8 capable upstream and matching Capacitor peers',()=>{
 const pkg=JSON.parse(read('package.json'));assert.ok(Number(pkg.dependencies['@revenuecat/purchases-capacitor'].split('.')[0])>=11);for(const dep of ['@capacitor/android','@capacitor/core'])assert.equal(Number(pkg.dependencies[dep].split('.')[0]),7);
 const native=read('node_modules/@revenuecat/purchases-capacitor/android/build.gradle');assert.match(native,/purchases-hybrid-common:15\.0\.0/);
});

test('in-app privacy policy is bundled and matches the current source disclosures',()=>{
 assert.match(read('www/index.html'),/href="privacy-policy\.html"/);
 assert.equal(read('www/privacy-policy.html'),fs.readFileSync(path.join(root,'../docs/privacy-policy.html'),'utf8'));
 assert.match(read('www/privacy-policy.html'),/Live app storage is not encrypted/);
});
