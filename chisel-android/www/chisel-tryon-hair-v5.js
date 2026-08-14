(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else{
    root.ChiselTryonHairV5=api;
    if(typeof window!=='undefined'&&typeof document!=='undefined')window.addEventListener('load',()=>setTimeout(api.install,400),{once:true});
  }
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';

const SILHOUETTE_FAMILIES=Object.freeze({
  CLIPPER:'clipper',FRINGE_CROP:'fringe-crop',SWEPT_PEAK:'swept-peak',POMPADOUR:'pompadour',SLICK_BACK:'slick-back',CURL_CROWN:'curl-crown',FLOW:'flow',SHORT_FEATHER:'short-feather',BOB:'bob',LONG_LAYERS:'long-layers',CURTAIN:'curtain',CURL_MASS:'curl-mass',COIL_MASS:'coil-mass',SHAG:'shag',BRAIDS:'braids',PONYTAIL:'ponytail',BUN:'bun',UPDO:'updo'
});

const STYLE_BLUEPRINTS=Object.freeze({
  buzz:{family:'clipper',crown:.065,side:.030,texture:.05,base:.64},
  crop:{family:'fringe-crop',crown:.145,side:.050,texture:.18,fringe:.105,base:.69},
  quiff:{family:'swept-peak',crown:.34,side:.065,texture:.24,sweep:.26,base:.72},
  pomp:{family:'pompadour',crown:.43,side:.075,texture:.22,sweep:.10,base:.73},
  slick:{family:'slick-back',crown:.20,side:.045,texture:.06,sweep:.20,base:.69},
  curly:{family:'curl-crown',crown:.35,side:.17,texture:.88,base:.68},
  mlong:{family:'flow',crown:.24,side:.12,texture:.30,length:.66,flare:.20,base:.70},

  pixie:{family:'short-feather',crown:.20,side:.075,texture:.20,sweep:.10,base:.69},
  bixie:{family:'short-feather',crown:.23,side:.09,texture:.26,sweep:.07,length:.25,base:.69},
  frenchbob:{family:'bob',crown:.21,side:.12,texture:.14,length:.49,flare:.22,fringe:.09,base:.72},
  bob:{family:'bob',crown:.22,side:.13,texture:.12,length:.57,flare:.24,base:.72},
  lob:{family:'bob',crown:.24,side:.14,texture:.20,length:.82,flare:.22,base:.71},
  butterfly:{family:'long-layers',crown:.31,side:.17,texture:.45,length:1.09,flare:.30,layers:4,base:.70},
  curtain:{family:'curtain',crown:.27,side:.15,texture:.32,length:1.04,flare:.25,fringe:.16,base:.70},
  layers:{family:'long-layers',crown:.27,side:.15,texture:.28,length:1.18,flare:.23,layers:5,base:.70},
  sleeklong:{family:'long-layers',crown:.21,side:.10,texture:.05,length:1.27,flare:.12,layers:2,base:.73},
  waves:{family:'long-layers',crown:.31,side:.19,texture:.68,length:1.10,flare:.31,layers:4,base:.69},
  curls:{family:'curl-mass',crown:.36,side:.24,texture:.94,length:.91,flare:.34,base:.68},
  coils:{family:'coil-mass',crown:.39,side:.27,texture:1,length:.83,flare:.37,base:.67},
  shag:{family:'shag',crown:.32,side:.20,texture:.76,length:.76,flare:.32,fringe:.12,base:.68},
  wolf:{family:'shag',crown:.35,side:.21,texture:.82,length:.81,flare:.34,fringe:.13,base:.68},
  braids:{family:'braids',crown:.22,side:.10,texture:.10,length:1.28,flare:.15,base:.70},
  pony:{family:'ponytail',crown:.25,side:.07,texture:.12,length:.82,sweep:.12,base:.72},
  bun:{family:'bun',crown:.20,side:.07,texture:.08,bunSize:.22,sweep:.10,base:.72},
  updo:{family:'updo',crown:.29,side:.11,texture:.30,bunSize:.28,sweep:.05,base:.70}
});

function styleBlueprint(style){
  const id=String(typeof style==='string'?style:(style&&style.id)||'none').toLowerCase();
  return Object.assign({id,family:'short-feather',crown:.20,side:.09,texture:.16,length:0,flare:.12,sweep:0,fringe:0,layers:0,base:.69},STYLE_BLUEPRINTS[id]||{});
}
const rnd=(n,s=0)=>{const x=Math.sin((n+1)*12.9898+s*78.233)*43758.5453;return x-Math.floor(x)};
const ROOT_IDS=[127,162,21,54,103,67,109,10,338,297,332,284,251,389,356];
function basis(P,h){
  const f=P(10),q=P(152),l=P(127),r=P(356),fw=Math.hypot(r.x-l.x,r.y-l.y)||h*.62,fh=Math.hypot(f.x-q.x,f.y-q.y)||h;
  return{f,q,l,r,fw,fh,up:{x:(f.x-q.x)/fh,y:(f.y-q.y)/fh},down:{x:(q.x-f.x)/fh,y:(q.y-f.y)/fh},right:{x:(r.x-l.x)/fw,y:(r.y-l.y)/fw}};
}
function move(p,b,up,right){return{x:p.x+b.up.x*up+b.right.x*right,y:p.y+b.up.y*up+b.right.y*right}}
function interp(a,t){const x=Math.max(0,Math.min(1,t))*(a.length-1),i=Math.min(a.length-2,Math.floor(x)),u=x-i,A=a[i],B=a[i+1];return{x:A.x+(B.x-A.x)*u,y:A.y+(B.y-A.y)*u}}
function rootLine(P,b){return ROOT_IDS.map((id,n)=>{const p=P(id),z=1-Math.abs(n-(ROOT_IDS.length-1)/2)/((ROOT_IDS.length-1)/2);return move(p,b,b.fh*(.018+.010*z),0)})}
function color(c,m){return c.map(v=>Math.max(3,Math.min(235,v*m)))}
function rgba(c,a){return`rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`}
function contourFrom(roots,b,fn){return roots.map((p,n)=>{const t=n/(roots.length-1),z=1-Math.abs(t-.5)*2,v=fn(t,z,n);return move(p,b,b.fh*v.up,b.fw*v.right)})}
function fillBand(roots,edge,palette,alpha){
  ctx.save();ctx.lineJoin='round';ctx.beginPath();roots.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));for(let i=edge.length-1;i>=0;i--)ctx.lineTo(edge[i].x,edge[i].y);ctx.closePath();
  const g=ctx.createLinearGradient(0,Math.min(...edge.map(p=>p.y)),0,Math.max(...roots.map(p=>p.y))+1);g.addColorStop(0,rgba(palette.light,alpha*.95));g.addColorStop(.55,rgba(palette.mid,alpha));g.addColorStop(1,rgba(palette.dark,alpha*.96));ctx.fillStyle=g;ctx.shadowColor='rgba(0,0,0,.26)';ctx.shadowBlur=8;ctx.fill();ctx.restore();
}
function crownStrands(roots,edge,b,bp,palette,count=96){
  ctx.save();ctx.lineCap='round';for(let i=0;i<count;i++){const t=(i+.45)/count,A=interp(roots,t),B=interp(edge,t),wave=Math.sin((i+1)*1.43)*b.fw*.018*bp.texture,j=(rnd(i,bp.id.length)-.5)*b.fw*(.005+.014*bp.texture),C={x:(A.x+B.x)/2+b.right.x*(wave+j),y:(A.y+B.y)/2+b.right.y*(wave+j)};ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.quadraticCurveTo(C.x,C.y,B.x+b.right.x*j,B.y+b.right.y*j);ctx.strokeStyle=rgba(i%7===0?palette.light:palette.dark,i%7===0?.30:.24+.12*bp.texture);ctx.lineWidth=Math.max(.6,b.fh*(i%11===0?.0030:.0016));ctx.stroke()}ctx.restore();
}
function crown(roots,b,bp,palette,fn,count){const edge=contourFrom(roots,b,fn);fillBand(roots,edge,palette,bp.base);crownStrands(roots,edge,b,bp,palette,count);return edge}
function sidePanel(P,roots,b,bp,palette,side,length=bp.length,texture=bp.texture){
  if(!length)return;const R=side<0?roots[0]:roots[roots.length-1],J=P(side<0?172:397),out=side*b.fw*(bp.flare||.16),end=move(J,b,-b.fh*length*.60,out),inner=move(J,b,-b.fh*length*.51,out*.30),outer=move(R,b,0,out*.72);
  const poly=[R,outer,end,inner];ctx.save();ctx.beginPath();poly.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=rgba(palette.dark,bp.base*.84);ctx.shadowColor='rgba(0,0,0,.22)';ctx.shadowBlur=6;ctx.fill();ctx.restore();
  ctx.save();ctx.lineCap='round';const N=texture>.7?54:36;for(let i=0;i<N;i++){const q=(i+.5)/N,off=(q-.5)*out*.82,start=move(R,b,0,off*.18),target=move(end,b,b.fh*(q-.5)*.035,off*.18),bend={x:(start.x+target.x)/2+b.right.x*Math.sin((i+2)*1.59)*Math.abs(out)*.22*texture,y:(start.y+target.y)/2+b.right.y*Math.sin((i+2)*1.59)*Math.abs(out)*.22*texture};ctx.beginPath();ctx.moveTo(start.x,start.y);ctx.quadraticCurveTo(bend.x,bend.y,target.x,target.y);ctx.strokeStyle=rgba(i%8===0?palette.light:palette.mid,.24+.10*texture);ctx.lineWidth=Math.max(.6,b.fh*(i%10===0?.0028:.0015));ctx.stroke()}ctx.restore();
}
function fringe(roots,b,palette,amount,mode){
  const N=mode==='curtain'?20:16;ctx.save();ctx.lineCap='round';for(let i=0;i<N;i++){const t=(i+.5)/N,A=interp(roots,.28+t*.44),side=t<.5?-1:1,center=1-Math.abs(t-.5)*2,drop=b.fh*amount*(.68+.32*center),away=mode==='curtain'?side*b.fw*.11*center:(t-.5)*b.fw*.025,B=move(A,b,-drop,away);ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.quadraticCurveTo((A.x+B.x)/2+b.right.x*away*.35,(A.y+B.y)/2+b.right.y*away*.35,B.x,B.y);ctx.strokeStyle=rgba(palette.dark,.52);ctx.lineWidth=Math.max(.8,b.fh*.0024);ctx.stroke()}ctx.restore();
}
function curlMarks(edge,b,bp,palette,coily=false){ctx.save();ctx.strokeStyle=rgba(palette.light,.34);ctx.lineWidth=Math.max(.7,b.fh*.0020);const N=coily?42:28;for(let i=0;i<N;i++){const A=interp(edge,(i+.5)/N),rad=b.fh*(coily?.010:.014)*(.75+rnd(i,7)*.65),phase=rnd(i,19)*Math.PI;ctx.beginPath();ctx.arc(A.x,A.y,rad,phase,phase+(coily?1.75:1.35)*Math.PI);ctx.stroke()}ctx.restore()}
function braids(P,roots,b,bp,palette){
  const topEdge=crown(roots,b,bp,palette,(t,z)=>({up:.08+.13*z,right:0}),72);void topEdge;
  [-1,1].forEach(side=>{const start=side<0?roots[0]:roots[roots.length-1],jaw=P(side<0?172:397),end=move(jaw,b,-b.fh*bp.length*.64,side*b.fw*.16);for(let rope=0;rope<3;rope++){const off=side*b.fw*(.04+.045*rope),A=move(start,b,0,off),B=move(end,b,0,off*.55);ctx.save();ctx.strokeStyle=rgba(palette.dark,.78);ctx.lineWidth=Math.max(3,b.fh*.016);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.quadraticCurveTo((A.x+B.x)/2+b.right.x*off*.2,(A.y+B.y)/2+b.right.y*off*.2,B.x,B.y);ctx.stroke();ctx.strokeStyle=rgba(palette.light,.35);ctx.lineWidth=Math.max(.8,b.fh*.0022);for(let k=1;k<15;k++){const q=k/15,C={x:A.x+(B.x-A.x)*q,y:A.y+(B.y-A.y)*q};ctx.beginPath();ctx.arc(C.x,C.y,b.fh*.009,0,Math.PI*2);ctx.stroke()}ctx.restore()}});
}
function ponytail(P,roots,b,bp,palette){const edge=crown(roots,b,bp,palette,(t,z)=>({up:.06+.14*z,right:.10*z}),78);const base=interp(edge,.68),tailEnd=move(P(397),b,-b.fh*bp.length*.58,b.fw*.27);ctx.save();ctx.strokeStyle=rgba(palette.dark,.82);ctx.lineWidth=Math.max(8,b.fh*.055);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(base.x,base.y);ctx.bezierCurveTo(base.x+b.right.x*b.fw*.34,base.y+b.right.y*b.fw*.34,tailEnd.x+b.right.x*b.fw*.20,tailEnd.y+b.right.y*b.fw*.20,tailEnd.x,tailEnd.y);ctx.stroke();ctx.strokeStyle=rgba(palette.light,.30);ctx.lineWidth=Math.max(.8,b.fh*.0022);for(let i=0;i<24;i++){const o=(i-12)*b.fw*.0028;ctx.beginPath();ctx.moveTo(base.x+b.right.x*o,base.y+b.right.y*o);ctx.quadraticCurveTo((base.x+tailEnd.x)/2+b.right.x*(b.fw*.22+o),(base.y+tailEnd.y)/2+b.right.y*(b.fw*.22+o),tailEnd.x+b.right.x*o*.35,tailEnd.y+b.right.y*o*.35);ctx.stroke()}ctx.restore()}
function bun(P,roots,b,bp,palette,updo){const edge=crown(roots,b,bp,palette,(t,z)=>({up:.07+(updo?.20:.14)*z,right:.08*z}),80);const top=interp(edge,.58),cx=top.x+b.up.x*b.fh*(updo?.13:.10)+b.right.x*b.fw*.11,cy=top.y+b.up.y*b.fh*(updo?.13:.10)+b.right.y*b.fw*.11,rx=b.fw*(bp.bunSize||.22),ry=b.fh*(updo?.16:.13);ctx.save();ctx.translate(cx,cy);ctx.rotate(updo?.12:-.05);const g=ctx.createRadialGradient(-rx*.2,-ry*.25,ry*.08,0,0,Math.max(rx,ry));g.addColorStop(0,rgba(palette.light,.76));g.addColorStop(.55,rgba(palette.mid,.78));g.addColorStop(1,rgba(palette.dark,.82));ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);ctx.fill();if(updo){ctx.fillStyle=rgba(palette.light,.18);for(let i=0;i<7;i++){const a=i/7*Math.PI*2,r=rx*.52;ctx.beginPath();ctx.arc(Math.cos(a)*r*.55,Math.sin(a)*ry*.45,ry*.25,0,Math.PI*2);ctx.fill()}}ctx.restore()}

function drawFamily(P,c,h,bp){
  const b=basis(P,h),roots=rootLine(P,b),palette={dark:color(c,.42),mid:color(c,.72),light:color(c,1.06)};
  switch(bp.family){
    case 'clipper': crown(roots,b,bp,palette,(t,z)=>({up:.030+.040*z,right:0}),70);break;
    case 'fringe-crop': crown(roots,b,bp,palette,(t,z)=>({up:.045+.095*z,right:-.035*z}),90);fringe(roots,b,palette,bp.fringe||.105,'forward');break;
    case 'swept-peak': crown(roots,b,bp,palette,(t,z)=>{const peak=Math.exp(-Math.pow((t-.66)/.18,2));return{up:.055+.075*z+bp.crown*peak,right:bp.sweep*z*.45}} ,112);break;
    case 'pompadour': crown(roots,b,bp,palette,(t,z)=>({up:.060+bp.crown*(.38+.62*Math.pow(z,1.35)),right:bp.sweep*(t-.35)*z*.35}),118);break;
    case 'slick-back': crown(roots,b,bp,palette,(t,z)=>({up:.045+.145*z,right:bp.sweep*z*.55}),105);break;
    case 'curl-crown': {const e=crown(roots,b,bp,palette,(t,z,n)=>({up:.075+.255*z+Math.sin(n*1.8)*.018,right:Math.sin(n*1.4)*.025}),116);curlMarks(e,b,bp,palette,false);break;}
    case 'flow': crown(roots,b,bp,palette,(t,z)=>({up:.065+.17*z,right:(t-.5)*.02}),98);sidePanel(P,roots,b,bp,palette,-1);sidePanel(P,roots,b,bp,palette,1);break;
    case 'short-feather': crown(roots,b,bp,palette,(t,z,n)=>({up:.055+.15*z+(rnd(n,4)-.5)*.025,right:bp.sweep*z*.25}),96);if(bp.length){sidePanel(P,roots,b,bp,palette,-1,bp.length*.72);sidePanel(P,roots,b,bp,palette,1,bp.length*.72)}break;
    case 'bob': crown(roots,b,bp,palette,(t,z)=>({up:.065+.15*z,right:0}),92);sidePanel(P,roots,b,bp,palette,-1);sidePanel(P,roots,b,bp,palette,1);if(bp.fringe)fringe(roots,b,palette,bp.fringe,'forward');break;
    case 'long-layers': crown(roots,b,bp,palette,(t,z)=>({up:.07+.19*z,right:0}),105);sidePanel(P,roots,b,bp,palette,-1);sidePanel(P,roots,b,bp,palette,1);for(let k=1;k<(bp.layers||3);k++){const factor=1-k*.10;sidePanel(P,roots,b,Object.assign({},bp,{flare:bp.flare*(.7+k*.06)}),palette,-1,bp.length*factor,bp.texture*.75);sidePanel(P,roots,b,Object.assign({},bp,{flare:bp.flare*(.7+k*.06)}),palette,1,bp.length*factor,bp.texture*.75)}break;
    case 'curtain': crown(roots,b,bp,palette,(t,z)=>({up:.065+.16*z,right:0}),96);sidePanel(P,roots,b,bp,palette,-1);sidePanel(P,roots,b,bp,palette,1);fringe(roots,b,palette,bp.fringe||.16,'curtain');break;
    case 'curl-mass': {const e=crown(roots,b,bp,palette,(t,z,n)=>({up:.10+.25*z+Math.sin(n*1.7)*.022,right:Math.sin(n*1.3)*.030}),118);sidePanel(P,roots,b,bp,palette,-1);sidePanel(P,roots,b,bp,palette,1);curlMarks(e,b,bp,palette,false);break;}
    case 'coil-mass': {const e=crown(roots,b,bp,palette,(t,z,n)=>({up:.12+.28*z+Math.sin(n*2.0)*.028,right:Math.sin(n*1.6)*.035}),126);sidePanel(P,roots,b,bp,palette,-1);sidePanel(P,roots,b,bp,palette,1);curlMarks(e,b,bp,palette,true);break;}
    case 'shag': crown(roots,b,bp,palette,(t,z,n)=>({up:.075+.21*z+(rnd(n,12)-.5)*.045,right:(rnd(n,16)-.5)*.04}),98);sidePanel(P,roots,b,bp,palette,-1);sidePanel(P,roots,b,bp,palette,1);fringe(roots,b,palette,bp.fringe||.12,'forward');break;
    case 'braids': braids(P,roots,b,bp,palette);break;
    case 'ponytail': ponytail(P,roots,b,bp,palette);break;
    case 'bun': bun(P,roots,b,bp,palette,false);break;
    case 'updo': bun(P,roots,b,bp,palette,true);break;
    default: crown(roots,b,bp,palette,(t,z)=>({up:.06+.14*z,right:0}),90);
  }
}
function installExperienceCopy(){
  if(typeof document==='undefined')return;
  const btn=document.getElementById('photorealBtn'),note=document.getElementById('photorealNote'),bar=document.getElementById('styleBar');
  if(btn)btn.textContent='✦ Generate realistic try-on';
  if(note)note.textContent='Live Guide · approximate placement & silhouette · on-device';
  if(bar&&!document.getElementById('chiselLiveGuideNote')){const el=document.createElement('div');el.id='chiselLiveGuideNote';el.textContent='Live Guide shows approximate placement. Your photo stays on-device until you tap Generate realistic try-on.';el.style.cssText='font-size:10px;line-height:1.45;color:#a9a398;padding:8px 2px 2px';const row=bar.querySelector('.photorealRow');if(row)row.insertAdjacentElement('afterend',el);}
}
function install(){
  if(typeof window==='undefined'||typeof window.drawHair!=='function')return false;
  if(window.drawHair.__v6){installExperienceCopy();return true;}
  const renderer=function(P,c,h){const s=typeof hairDef==='function'?hairDef():null;if(!s||s.id==='none'||!h)return;drawFamily(P,c,h,styleBlueprint(s));};
  renderer.__v5=true;renderer.__v5c=true;renderer.__v6=true;renderer.__chiselOriginalHair=window.drawHair;window.drawHair=renderer;try{drawHair=renderer}catch(_){}installExperienceCopy();return true;
}
return{SILHOUETTE_FAMILIES,STYLE_BLUEPRINTS,styleBlueprint,drawFamily,installExperienceCopy,install};
});
