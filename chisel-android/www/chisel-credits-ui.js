/* Optional paid account and consumables. API secrets never reach this module.
   Local/free tools remain account-free; a native purchase callback never grants funds. */
(function(root){
'use strict';
let installed=false,session=null,wallet,dialog,returnFocus,configured=false,loggedIn=null,refreshing=null,discovered=false,selectedQuality='standard',productsBusy=false;
const SESSION='chisel:credit-session',q=s=>document.querySelector(s);
function base(){const u=new URL(typeof RENDER_FN_URL==='string'?RENDER_FN_URL:'');if(!/^https:\/\/[a-z0-9]{20}\.supabase\.co$/.test(u.origin))throw Error('server_not_configured');return u.origin;}
const anon=()=>typeof RENDER_ANON_KEY==='string'?RENDER_ANON_KEY:'';
const uid=()=>session?.user?.id||null;
const safeMessage=(id,s)=>{const n=q(id);if(n)n.textContent=s;};
async function jsonFetch(url,options={}){const response=await fetch(url,{credentials:'omit',redirect:'error',cache:'no-store',signal:AbortSignal.timeout(15000),...options});if(response.status===204)return{};const data=await response.json();if(!response.ok)throw Error(response.status===429?'Too many attempts. Try again later.':'Could not complete this request.');return data;}
async function auth(path,body){return jsonFetch(base()+'/auth/v1/'+path,{method:'POST',headers:{apikey:anon(),'Content-Type':'application/json'},body:JSON.stringify(body)});}
function saveSession(value){session=value?.access_token&&value?.refresh_token&&root.ChiselCreditPolicy.UUID.test(value?.user?.id||'')?{...value,expires_at:value.expires_at||Math.floor(Date.now()/1000)+(value.expires_in||3600)}:null;try{if(session)sessionStorage.setItem(SESSION,JSON.stringify(session));else sessionStorage.removeItem(SESSION);}catch{};}
async function authHeaders(owner){
 if(!session)throw Error('sign_in_required');
 if(session.expires_at*1000<Date.now()+30000){if(!refreshing){const prior=session;refreshing=auth('token?grant_type=refresh_token',{refresh_token:prior.refresh_token}).then(next=>{if(session===prior)saveSession(next);}).finally(()=>refreshing=null);}await refreshing;}
 if(!session||owner&&uid()!==owner)throw Error('account_changed');return{Authorization:`Bearer ${session.access_token}`};
}
async function load(){const owner=uid();let headers={apikey:anon()};if(owner)headers={...headers,...await authHeaders(owner)};return jsonFetch(base()+'/functions/v1/credit-studio',{headers});}
async function native(){
 const config=wallet.snapshot().configuration,P=typeof rcPlugin==='function'?rcPlugin():root.Capacitor?.Plugins?.Purchases;
 if(!P||!config?.rcPublicKey||!uid())throw Error('native_store_unavailable');
 if(!configured){if(!(typeof rcReady!=='undefined'&&rcReady))await P.configure({apiKey:config.rcPublicKey,appUserID:uid()});configured=true;}
 if(loggedIn!==uid()){await P.logIn({appUserID:uid()});loggedIn=uid();}return P;
}
async function getProducts(){const P=await native();return (await P.getProducts({productIdentifiers:root.ChiselCreditPolicy.PACKS.map(p=>p.id),type:'NON_SUBSCRIPTION'})).products||[];}
async function purchase(product,owner){const P=await native();if(uid()!==owner)throw Error('account_changed');await P.purchaseStoreProduct({product});}
function changed(){root.dispatchEvent(new CustomEvent('chisel:credits-change'));}
function draw(s){
 if(!dialog)return;
 safeMessage('#ccBalance',s.balance===null?'Sign in to see your balance':`${s.balance} credits`);
 safeMessage('#ccEditorBalance',s.balance===null?'Credits':`${Math.max(0,s.balance)} credits`);
 safeMessage('#ccStatus',s.message||(!s.configuration?.ready?'AI edits and purchases are not enabled yet.':!s.salesReady?'Credit purchases are not available yet.':'Credits are added after store verification.'));
 q('#ccSignIn').hidden=!!uid();q('#ccSignOut').hidden=!uid();q('#ccSignOut').disabled=s.busy;
 const list=q('#ccPacks');list.replaceChildren();
 for(const pack of root.ChiselCreditPolicy.PACKS){const offer=s.offers.find(p=>p.identifier===pack.id),button=document.createElement('button');button.type='button';button.className='cc-pack';button.dataset.creditPack=pack.id;button.disabled=!offer||!uid()||!s.salesReady||s.busy;
 const name=document.createElement('span');name.textContent=`${pack.credits} credits`;const price=document.createElement('strong');price.textContent=offer?.priceString||`$${(pack.usdCents/100).toFixed(2)} planned`;button.append(name,price);button.addEventListener('click',()=>wallet.buy(pack.id).catch(()=>safeMessage('#ccStatus','Purchase unavailable. Refresh and try again.')));list.append(button);}
 q('#ccPriceNotice').textContent=s.offers.length?'The store confirms your local price before purchase.':'US launch prices shown. Checkout stays disabled until local store offers are available.';
 if(q('#ccModeGroup'))q('#ccModeGroup').hidden=!discovered;
 changed();
}
async function refresh(){try{const s=await wallet.refresh();discovered=s.configuration?.apiVersion===2;if(discovered)root.ChiselLooksStudio?.refreshAvailability?.();if(s.salesReady&&uid()&&!productsBusy){productsBusy=true;try{await wallet.loadProducts();}catch{safeMessage('#ccStatus','Credit purchases are available in the configured Android app.');}finally{productsBusy=false;}}draw(wallet.snapshot());}catch{safeMessage('#ccStatus','Wallet unavailable. No purchase was started.');}}
function open(){if(!dialog)return;returnFocus=document.activeElement;dialog.showModal();q('#ccClose').focus();refresh();}
async function signOut(){if(wallet.snapshot().busy)return;const old=session;saveSession(null);wallet.reset();loggedIn=null;root.ChiselLooksStudio?.clearAccount?.();changed();try{if(old)await jsonFetch(base()+'/auth/v1/logout?scope=local',{method:'POST',headers:{apikey:anon(),Authorization:`Bearer ${old.access_token}`}});}catch{}refresh();}
function quote(){const m=root.ChiselCreditPolicy.mode(selectedQuality);return{quality:selectedQuality,credits:m.credits,userId:uid()};}
function install(){
 if(installed||!root.ChiselWalletCore||!q('#clsEditor'))return false;installed=true;
 try{saveSession(JSON.parse(sessionStorage.getItem(SESSION)||'null'));}catch{saveSession(null);}
 dialog=document.createElement('dialog');dialog.id='ccDialog';dialog.className='cc-dialog';dialog.setAttribute('aria-labelledby','ccTitle');dialog.innerHTML='<header><h2 id="ccTitle">AI credits</h2><button id="ccClose" type="button" aria-label="Close credits">×</button></header><div class="cc-balance" id="ccBalance">Sign in to see your balance</div><p class="cc-sub">New edits use credits. Saved looks are yours to keep.</p><form id="ccSignIn"><label for="ccEmail">Email</label><input id="ccEmail" type="email" autocomplete="email" required placeholder="you@example.com"><button id="ccSendCode" type="submit">Send sign-in code</button><div id="ccCodeStep" hidden><label for="ccCode">Email code</label><input id="ccCode" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6,10}" maxlength="10"><button id="ccVerify" type="button">Verify code</button></div><small>Only paid credits need an account. Your local photos stay on this device.</small></form><div id="ccPacks" class="cc-packs"></div><p id="ccPriceNotice" class="cc-small"></p><p class="cc-rules">Standard edit: 1 credit · Detail edit: 3 credits.<br>No subscription. Purchased credits do not expire.<br>Failed edits return credits. Comparing and exporting are free.</p><p id="ccStatus" role="status" class="cc-small"></p><div class="cc-footer"><button id="ccRefresh" type="button">Refresh balance</button><button id="ccSignOut" type="button" hidden>Sign out</button></div>';
 document.body.append(dialog);
 wallet=root.ChiselWalletCore.createWallet({userId:uid,load,products:getProducts,purchase});wallet.subscribe(draw);
 q('#ccClose').onclick=()=>dialog.close();dialog.addEventListener('close',()=>returnFocus?.isConnected&&returnFocus.focus({preventScroll:true}));
 q('#ccRefresh').onclick=refresh;q('#ccSignOut').onclick=signOut;
 q('#ccSignIn').onsubmit=async e=>{e.preventDefault();const b=q('#ccSendCode');b.disabled=true;try{await auth('otp',{email:q('#ccEmail').value.trim(),create_user:true});q('#ccCodeStep').hidden=false;safeMessage('#ccStatus','Enter the code from your email.');q('#ccCode').focus();}catch(e){safeMessage('#ccStatus',e.message);}finally{b.disabled=false;}};
 q('#ccVerify').onclick=async()=>{const b=q('#ccVerify');b.disabled=true;try{const s=await auth('verify',{email:q('#ccEmail').value.trim(),token:q('#ccCode').value.trim(),type:'email'});saveSession(s);if(!session)throw Error('Sign-in did not complete.');wallet.reset();q('#ccCode').value='';await refresh();}catch(e){safeMessage('#ccStatus',e.message);}finally{b.disabled=false;}};
 const button=document.createElement('button');button.id='ccEditorBalance';button.className='cc-chip';button.type='button';button.textContent='Credits';button.onclick=open;q('#clsEditor .cls-header').insertBefore(button,q('#clsLibraryOpen'));
 const modes=document.createElement('div');modes.id='ccModeGroup';modes.className='cc-modes';modes.hidden=true;modes.setAttribute('role','group');modes.setAttribute('aria-label','Image editing quality and credit cost');
 for(const [id,m]of Object.entries(root.ChiselCreditPolicy.MODES)){const b=document.createElement('button');b.type='button';b.dataset.creditMode=id;b.textContent=`${m.label} · ${m.credits} ${m.credits===1?'credit':'credits'}`;b.setAttribute('aria-pressed',String(id===selectedQuality));b.onclick=()=>{selectedQuality=id;for(const node of modes.querySelectorAll('button'))node.setAttribute('aria-pressed',String(node===b));changed();};modes.append(b);}
 q('#clsGenerate').parentElement.insertBefore(modes,q('#clsGenerate'));
 root.addEventListener('online',refresh);refresh();document.documentElement.dataset.creditUI='1';return true;
}
root.ChiselCredits={install,open,refresh,quote,signOut,isActive:()=>discovered,endpoint:()=>base()+'/functions/v1/credit-studio',headers:authHeaders,snapshot:()=>wallet?.snapshot(),userId:uid};
})(globalThis);
