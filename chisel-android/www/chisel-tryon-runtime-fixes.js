(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else{
    root.ChiselTryonRuntimeFixes=api;
    if(typeof window!=='undefined'&&typeof document!=='undefined'){
      window.addEventListener('load',()=>setTimeout(api.install,0),{once:true});
      window.addEventListener('load',()=>setTimeout(api.installLate,260),{once:true});
    }
  }
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
let hairChoiceLocked=false,summaryObserver=null;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
function seeded(n,s=0){const x=Math.sin((n+1)*12.9898+s*78.233)*43758.5453;return x-Math.floor(x)}
function isDuplicateRoute(route,active,hash){const t=String(route||'home');return active===t&&hash==='#'+t}
function installRouteGuard(){
  if(typeof window==='undefined'||typeof document==='undefined'||typeof window.go!=='function')return false;
  if(window.go.__chiselRouteGuard)return true;const original=window.go;
  const wrapped=function(route){const t=String(route||'home'),a=document.querySelector('.screen.active'),r=a&&a.dataset?a.dataset.screen:null;if(isDuplicateRoute(t,r,location.hash))return true;return original.apply(this,arguments)};
  wrapped.__chiselRouteGuard=true;wrapped.__chiselOriginalGo=original;window.go=wrapped;try{go=wrapped}catch{}return true;
}
const STYLE={
  buzz:{part:'close',hairlineLift:.082,crownLift:.075,frontLift:.065,textureStrength:.08,massOpacity:.040},
  crop:{part:'forward',partBias:-.07,hairlineLift:.094,crownLift:.13,frontLift:.15,textureStrength:.18,massOpacity:.055},
  quiff:{part:'swept-right',partBias:.25,hairlineLift:.10,crownLift:.24,frontLift:.32,textureStrength:.25,massOpacity:.060},
  pomp:{part:'swept-back',partBias:.14,hairlineLift:.102,crownLift:.29,frontLift:.38,textureStrength:.29,massOpacity:.060},
  slick:{part:'slick-back',partBias:.13,hairlineLift:.105,crownLift:.22,frontLift:.17,textureStrength:.07,massOpacity:.052},
  curly:{part:'diffuse',hairlineLift:.10,crownLift:.27,frontLift:.27,textureStrength:.80,massOpacity:.048},
  mlong:{part:'soft-center',hairlineLift:.108,crownLift:.22,frontLift:.20,textureStrength:.28,fallPx:.46,massOpacity:.052},
  pixie:{part:'soft-side',partBias:.11,hairlineLift:.108,crownLift:.20,frontLift:.17,textureStrength:.18,massOpacity:.050},
  bixie:{part:'soft-side',partBias:.10,hairlineLift:.11,crownLift:.22,frontLift:.18,textureStrength:.24,fallPx:.25,massOpacity:.052},
  frenchbob:{part:'soft-center',hairlineLift:.12,crownLift:.20,frontLift:.145,textureStrength:.16,fallPx:.48,fringe:'wispy',massOpacity:.048},
  bob:{part:'soft-center',hairlineLift:.118,crownLift:.20,frontLift:.18,textureStrength:.13,fallPx:.54,massOpacity:.050},
  lob:{part:'soft-center',hairlineLift:.12,crownLift:.22,frontLift:.19,textureStrength:.20,fallPx:.78,massOpacity:.052},
  butterfly:{part:'center',hairlineLift:.13,crownLift:.28,frontLift:.26,textureStrength:.46,fallPx:1.06,massOpacity:.052},
  curtain:{part:'center',hairlineLift:.128,crownLift:.25,frontLift:.14,textureStrength:.30,fallPx:1.02,fringe:'curtain',massOpacity:.050},
  layers:{part:'soft-center',hairlineLift:.128,crownLift:.25,frontLift:.21,textureStrength:.29,fallPx:1.15,massOpacity:.050},
  sleeklong:{part:'center',hairlineLift:.128,crownLift:.20,frontLift:.16,textureStrength:.05,fallPx:1.23,massOpacity:.042},
  waves:{part:'soft-center',hairlineLift:.124,crownLift:.28,frontLift:.25,textureStrength:.60,fallPx:1.08,massOpacity:.048},
  curls:{part:'diffuse',hairlineLift:.116,crownLift:.31,frontLift:.28,textureStrength:.90,fallPx:.88,massOpacity:.043},
  coils:{part:'diffuse',hairlineLift:.112,crownLift:.34,frontLift:.30,textureStrength:1,fallPx:.80,massOpacity:.040},
  shag:{part:'broken-center',hairlineLift:.116,crownLift:.28,frontLift:.20,textureStrength:.72,fallPx:.72,fringe:'wispy',massOpacity:.046},
  wolf:{part:'broken-center',hairlineLift:.116,crownLift:.30,frontLift:.21,textureStrength:.78,fallPx:.74,fringe:'wispy',massOpacity:.046},
  braids:{part:'center',hairlineLift:.128,crownLift:.21,frontLift:.16,textureStrength:.12,fallPx:1.26,massOpacity:.032},
  pony:{part:'slick-back',hairlineLift:.128,crownLift:.30,frontLift:.22,textureStrength:.12,fallPx:.72,massOpacity:.036},
  bun:{part:'slick-back',hairlineLift:.128,crownLift:.34,frontLift:.23,textureStrength:.07,fallPx:0,massOpacity:.038},
  updo:{part:'soft-back',hairlineLift:.124,crownLift:.34,frontLift:.24,textureStrength:.22,fallPx:0,massOpacity:.038}
};
function styleVisualProfile(style,gender){
  const st=style||{},id=String(st.id||'none').toLowerCase(),women=gender==='women',base={id,women,part:'natural',partBias:0,fringe:'none',hairlineLift:women?.112:.098,crownLift:.12+clamp(st.top||.3,.08,.62)*.31,frontLift:.09+clamp(st.front||st.top||.3,.08,.68)*.30,sideLift:.05+clamp(st.side||.12,.04,.34)*.22,textureStrength:clamp((st.jitter||0)*6.4,0,.95),fallPx:st.fall==null?0:clamp(st.fall,.18,1.4),flare:clamp(st.flare||.10,.04,.34),massOpacity:women?.055:.060};
  return Object.assign(base,STYLE[id]||{});
}
function previewSummary(h,b,m){const p=[];if(h&&h.id!=='none'&&h.name)p.push(h.name);if(b&&b.id!=='none'&&b.name)p.push(b.name);if(m&&m.id!=='none'&&m.name)p.push(m.name);return p.join(' + ')||'Clean preview'}
function currentSummary(){try{const l=(typeof styleGender!=='undefined'&&styleGender==='women')?HAIR_WOMEN:HAIR_MEN,h=l&&l[typeof styleHair==='number'?styleHair:0],b=(typeof BEARD_STYLES!=='undefined'&&BEARD_STYLES[typeof styleBeard==='number'?styleBeard:0])||null,m=(typeof styleMakeup==='number'&&styleMakeup>0&&typeof MAKEUP_LOOKS!=='undefined')?MAKEUP_LOOKS[styleMakeup]:null;return previewSummary(h,b,m)}catch{return'Live style preview'}}
function syncPreviewSummary(){if(typeof document==='undefined')return false;const e=document.getElementById('cxStyleSummary');if(!e)return false;const n=currentSummary();if(e.textContent!==n)e.textContent=n;const t=e.closest?e.closest('.cx-preview-head')?.querySelector('.cx-preview-title'):null;if(t&&t.textContent!=='Quick AR preview')t.textContent='Quick AR preview';return true}
function installSummaryObserver(){if(typeof document==='undefined')return false;const e=document.getElementById('cxStyleSummary');if(!e)return false;if(summaryObserver)return true;syncPreviewSummary();if(typeof MutationObserver==='undefined')return true;summaryObserver=new MutationObserver(syncPreviewSummary);summaryObserver.observe(e,{childList:true,characterData:true,subtree:true});return true}
function installHairChoiceGuard(){if(typeof document==='undefined'||document.documentElement.dataset.chiselHairChoiceGuard==='1')return false;document.documentElement.dataset.chiselHairChoiceGuard='1';document.addEventListener('click',e=>{if(e.target&&e.target.closest&&e.target.closest('#hairChips .sc')){hairChoiceLocked=true;setTimeout(syncPreviewSummary,0)}},true);return true}
function installPremiumHairRenderer(){
  if(typeof window==='undefined'||typeof window.drawHair!=='function')return false;if(window.drawHair.__chiselPremiumHairV3)return true;
  const premium=function(P,col,fH){
    const st=typeof hairDef==='function'?hairDef():null;if(!st||st.id==='none'||!fH)return;const pr=styleVisualProfile(st,typeof styleGender!=='undefined'?styleGender:'men');
    const forehead=P(10),chin=P(152),lt=P(127),rt=P(356),faceW=Math.hypot(rt.x-lt.x,rt.y-lt.y)||fH*.62,rx=(rt.x-lt.x)/faceW,ry=(rt.y-lt.y)/faceW,ul=Math.hypot(forehead.x-chin.x,forehead.y-chin.y)||fH,ux=(forehead.x-chin.x)/ul,uy=(forehead.y-chin.y)/ul,dx=-ux,dy=-uy;
    const ids=[127,162,21,54,103,67,109,10,338,297,332,284,251,389,356],raw=ids.map(P),mid=(raw.length-1)/2,c=(a,x)=>(typeof rgbStr==='function'?rgbStr(a,x):`rgba(${a.join(',')},${x})`),light=col.map(v=>Math.min(255,Math.round(v*1.22))),dark=col.map(v=>Math.max(0,Math.round(v*.58))),midc=col.map(v=>Math.max(0,Math.round(v*.86)));
    const roots=raw.map((p,n)=>{const cw=1-Math.abs(n-mid)/mid,l=pr.hairlineLift+cw*pr.frontLift*.10-(pr.fringe==='wispy'?cw*.014:0);return{x:p.x+ux*fH*l,y:p.y+uy*fH*l}});
    const interp=(arr,t)=>{const z=t*(arr.length-1),i=Math.min(arr.length-2,Math.floor(z)),u=z-i,a=arr[i],b=arr[i+1];return{x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u}};
    const curve=(a,b,d,w,s)=>{ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo(b.x,b.y,d.x,d.y);ctx.lineWidth=w;ctx.strokeStyle=s;ctx.stroke()};
    ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
    /* Hair mass is layered translucent locks, never a filled polygon over the forehead. */
    for(let k=0;k<22;k++){const t=(k+.5)/22,r=interp(roots,t),center=1-Math.abs(t-.5)*2,local=fH*(pr.sideLift+(pr.crownLift-pr.sideLift)*(.35+.65*center))*(pr.id==='buzz'?.35:pr.id==='crop'?.64:1),sweep=faceW*pr.partBias*(.12+.36*center),wave=Math.sin((k+1)*1.43)*faceW*.026*pr.textureStrength,e={x:r.x+ux*local+rx*(sweep+wave),y:r.y+uy*local+ry*(sweep+wave)},b={x:(r.x+e.x)/2+rx*((t-.5)*faceW*.04+wave*.45),y:(r.y+e.y)/2+ry*((t-.5)*faceW*.04+wave*.45)};curve(r,b,e,Math.max(2.2,fH*.011),c(dark,pr.massOpacity))}
    for(let k=0;k<72;k++){const t=(k+.35)/72,r=interp(roots,t),center=1-Math.abs(t-.5)*2,local=fH*(pr.sideLift+(pr.crownLift-pr.sideLift)*(.34+.66*center))*(pr.id==='buzz'?.28:pr.id==='crop'?.64:1),sweep=faceW*pr.partBias*(.10+.45*center),wave=Math.sin((k+1)*1.47)*faceW*.027*pr.textureStrength,j=(seeded(k,st.id.length)-.5)*faceW*(.006+.018*pr.textureStrength),e={x:r.x+ux*local+rx*(sweep+wave+j),y:r.y+uy*local+ry*(sweep+wave+j)},b={x:(r.x+e.x)/2+rx*((t-.5)*faceW*.03+wave*.55),y:(r.y+e.y)/2+ry*((t-.5)*faceW*.03+wave*.55)};curve(r,b,e,Math.max(.55,fH*.0019),c(k%5===0?light:midc,.14+.09*pr.textureStrength))}
    for(let k=0;k<46;k++){const t=(k+.5)/46,r=interp(roots,t),len=fH*(.012+.012*seeded(k,11)),j=(seeded(k,5)-.5)*faceW*.006;ctx.beginPath();ctx.moveTo(r.x,r.y);ctx.lineTo(r.x+ux*len+rx*j,r.y+uy*len+ry*j);ctx.lineWidth=Math.max(.5,fH*.0016);ctx.strokeStyle=c(dark,.22+.08*seeded(k,2));ctx.stroke()}
    const sideLocks=side=>{if(pr.fallPx<=0)return;const root=side<0?roots[0]:roots[roots.length-1],jaw=P(side<0?172:397),ox=rx*side,oy=ry*side,len=fH*pr.fallPx*.62,flare=faceW*pr.flare,count=pr.textureStrength>.7?28:20;for(let s=0;s<count;s++){const q=(s+.5)/count,off=(q-.5)*flare*.95,wob=Math.sin((s+1)*1.57)*flare*.30*pr.textureStrength,start={x:root.x+ox*off*.12,y:root.y+oy*off*.12},end={x:jaw.x+ox*(flare+off*.34)+dx*len*(.78+.18*q),y:jaw.y+oy*(flare+off*.34)+dy*len*(.78+.18*q)},b={x:(start.x+end.x)/2+ox*(off*.52+wob),y:(start.y+end.y)/2+oy*(off*.52+wob)};curve(start,b,end,s%4===0?Math.max(2,fH*.005):Math.max(.6,fH*.002),c(s%4===0?dark:(s%5===0?light:midc),s%4===0?.045:.13+.08*pr.textureStrength))}};sideLocks(-1);sideLocks(1);
    if(pr.fringe!=='none')for(let n=0;n<(pr.fringe==='curtain'?16:14);n++){const t=(n+.5)/(pr.fringe==='curtain'?16:14),r=interp(roots,.32+t*.36),side=t<.5?-1:1,center=Math.abs(t-.5)*2,drop=fH*(pr.fringe==='curtain'?.095:.07)*(1-center*.25),away=faceW*(pr.fringe==='curtain'?.10:.035)*side*(1-center),e={x:r.x+dx*drop+rx*away,y:r.y+dy*drop+ry*away},b={x:(r.x+e.x)/2+rx*away*.2,y:(r.y+e.y)/2+ry*away*.2};curve(r,b,e,Math.max(.55,fH*.0018),c(dark,.18))}
    if(!['diffuse','close','forward'].includes(pr.part)){const r=interp(roots,.5+clamp(pr.partBias,-.25,.25)*.22),e={x:r.x+ux*fH*.10,y:r.y+uy*fH*.10};ctx.beginPath();ctx.moveTo(r.x,r.y);ctx.lineTo(e.x,e.y);ctx.lineWidth=Math.max(.7,fH*.0022);ctx.strokeStyle='rgba(238,220,198,.12)';ctx.stroke()}
    ctx.restore();
  };
  premium.__chiselPremiumHair=true;premium.__chiselPremiumHairV3=true;premium.__chiselOriginalHair=window.drawHair;window.drawHair=premium;try{drawHair=premium}catch{}return true;
}
function install(){
  installRouteGuard();installPremiumHairRenderer();installHairChoiceGuard();
  if(typeof renderStyleChips==='function'&&!renderStyleChips.__chiselTryonV3){const o=renderStyleChips,w=function(){const r=o.apply(this,arguments);try{const women=typeof styleGender!=='undefined'&&styleGender==='women',l=document.getElementById('beardLab'),b=document.getElementById('beardChips');if(l)l.style.display=women?'none':'';if(b)b.style.display=women?'none':'';syncPreviewSummary()}catch{}return r};w.__chiselTryonV3=true;renderStyleChips=w}
  if(typeof applyMatches==='function'&&!applyMatches.__chiselPreserveHairChoice){const o=applyMatches,w=function(){const h=typeof styleHair==='number'?styleHair:0,b=typeof styleBeard==='number'?styleBeard:0,r=o.apply(this,arguments);try{if(hairChoiceLocked)styleHair=h;styleBeard=(typeof styleGender!=='undefined'&&styleGender==='women')?0:b;if(typeof renderStyleChips==='function')renderStyleChips();syncPreviewSummary()}catch{}return r};w.__chiselPreserveHairChoice=true;applyMatches=w}
  if(typeof openStyle==='function'&&!openStyle.__chiselCleanDefaultV3){const o=openStyle,w=function(){hairChoiceLocked=false;const r=o.apply(this,arguments);try{styleBeard=0;if(typeof renderStyleChips==='function')renderStyleChips();syncPreviewSummary()}catch{}return r};w.__chiselCleanDefaultV3=true;openStyle=w}
  installSummaryObserver();return true;
}
function installLate(){install();let n=0;const tick=()=>{n++;if(!installSummaryObserver()&&n<12)setTimeout(tick,100);else syncPreviewSummary()};tick();return true}
return{install,installLate,isDuplicateRoute,installRouteGuard,installPremiumHairRenderer,seeded,styleVisualProfile,previewSummary,syncPreviewSummary};
});