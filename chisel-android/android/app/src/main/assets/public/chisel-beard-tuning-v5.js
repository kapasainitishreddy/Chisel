(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else{
    root.ChiselBeardTuningV5=api;
    if(typeof window!=='undefined'&&typeof document!=='undefined')window.addEventListener('load',()=>setTimeout(api.install,420),{once:true});
  }
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';

const BEARD_BLUEPRINTS=Object.freeze({
  none:{family:'clean',moustache:0,cheeks:0,jaw:0,chin:0,neckline:0,density:0,length:0},
  stubble:{family:'stubble',moustache:.42,cheeks:.38,jaw:.52,chin:.55,neckline:.22,density:105,length:.0018,base:.20},
  short:{family:'short-boxed',moustache:.76,cheeks:.58,jaw:.92,chin:.96,neckline:.68,density:150,length:.0062,base:.34},
  full:{family:'full',moustache:.88,cheeks:.82,jaw:1,chin:1,neckline:.88,density:185,length:.0125,base:.43},
  goatee:{family:'goatee',moustache:.72,cheeks:0,jaw:.08,chin:1,neckline:.10,density:145,length:.0085,base:.38},
  vandyke:{family:'vandyke',moustache:.82,cheeks:0,jaw:0,chin:1,neckline:0,density:155,length:.0100,base:.40},
  mous:{family:'moustache',moustache:1,cheeks:0,jaw:0,chin:0,neckline:0,density:150,length:.0070,base:.42},
  chin:{family:'chinstrap',moustache:.20,cheeks:.10,jaw:.92,chin:.58,neckline:.66,density:145,length:.0065,base:.36}
});
function beardBlueprint(style){const id=String(typeof style==='string'?style:(style&&style.id)||'none').toLowerCase();return Object.assign({id},BEARD_BLUEPRINTS[id]||BEARD_BLUEPRINTS.none)}
const rnd=(n,s=0)=>{const x=Math.sin((n+1)*12.9898+s*78.233)*43758.5453;return x-Math.floor(x)};
const LEFT_CHEEK=[234,93,132,58,172,136,150,149,176,152,17,84,91,61,205,50];
const RIGHT_CHEEK=[454,323,361,288,397,365,379,378,400,377,152,314,321,291,425,280];
const LEFT_JAW=[234,93,132,58,172,136,150,149,176,152,17,84,91,61];
const RIGHT_JAW=[454,323,361,288,397,365,379,378,400,377,152,314,321,291];
const MOUSTACHE=[129,2,358,291,269,267,0,37,39,61];
const CHIN=[91,84,17,314,321,400,377,152,176,148];
const LIP_RING=[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146];
const JAW=[234,93,132,58,172,136,150,149,176,148,152,377,400,378,379,365,397,288,361,323,454];
function rgba(c,a){return`rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`}
function regionPath(P,indices){ctx.beginPath();indices.forEach((id,i)=>{const p=P(id);i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)});ctx.closePath()}
function bbox(P,indices){const a=indices.map(P),xs=a.map(p=>p.x),ys=a.map(p=>p.y);return{l:Math.min(...xs),r:Math.max(...xs),t:Math.min(...ys),b:Math.max(...ys)}}
function paintZone(P,indices,strength,bp,palette,h,salt){
  if(!(strength>0))return;const box=bbox(P,indices),alpha=(.07+bp.base*.52)*strength;
  ctx.save();ctx.filter=`blur(${Math.max(.7,h*.0038)}px)`;regionPath(P,indices);ctx.fillStyle=rgba(palette.dark,alpha);ctx.fill();ctx.restore();
  ctx.save();regionPath(P,indices);ctx.clip();ctx.lineCap='round';const count=Math.min(190,Math.round(24+bp.density*strength));
  for(let i=0;i<count;i++){
    const x=box.l+rnd(i,salt)*(box.r-box.l),y=box.t+rnd(i,salt+19)*(box.b-box.t),tone=.12+.20*rnd(i,salt+31),L=h*bp.length*(.55+.75*rnd(i,salt+47));
    if(bp.family==='stubble'||L<h*.0024){const r=Math.max(.45,h*(.00055+.0005*rnd(i,salt+61)));ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=rgba(palette.dark,tone*strength);ctx.fill();}
    else{const lean=(rnd(i,salt+73)-.5)*L*.55;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+lean*.35,y+L*.45,x+lean,y+L);ctx.strokeStyle=rgba(i%9===0?palette.light:palette.dark,tone*strength);ctx.lineWidth=Math.max(.45,h*(i%11===0?.00135:.00082));ctx.stroke();}
  }
  ctx.restore();
}
function paintNeckline(P,strength,bp,palette,h){
  if(!(strength>0))return;const points=JAW.map(P);ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.filter=`blur(${Math.max(.8,h*.004)}px)`;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle=rgba(palette.dark,(.09+bp.base*.40)*strength);ctx.lineWidth=Math.max(3,h*.030*strength);ctx.stroke();ctx.restore();
  ctx.save();ctx.lineCap='round';for(let i=0;i<86;i++){const z=(i+.5)/86,pos=z*(points.length-1),k=Math.min(points.length-2,Math.floor(pos)),u=pos-k,A=points[k],B=points[k+1],x=A.x+(B.x-A.x)*u,y=A.y+(B.y-A.y)*u,L=h*bp.length*(.42+.58*rnd(i,201));ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(rnd(i,211)-.5)*L*.35,y+L);ctx.strokeStyle=rgba(palette.dark,.10*strength);ctx.lineWidth=Math.max(.4,h*.00075);ctx.stroke()}ctx.restore();
}
function install(){
  if(typeof window==='undefined'||typeof window.drawBeard!=='function')return false;if(window.drawBeard.__v6)return true;
  const renderer=function(P,c,h){
    const style=(typeof BEARD_STYLES!=='undefined'&&BEARD_STYLES[typeof styleBeard==='number'?styleBeard:0])||null,bp=beardBlueprint(style);if(!style||bp.family==='clean'||!h)return;
    const palette={dark:c.map(v=>Math.max(5,Math.min(92,v*.38))),light:c.map(v=>Math.max(16,Math.min(150,v*.68)))};
    paintZone(P,MOUSTACHE,bp.moustache,bp,palette,h,11);
    paintZone(P,LEFT_CHEEK,bp.cheeks,bp,palette,h,31);paintZone(P,RIGHT_CHEEK,bp.cheeks,bp,palette,h,51);
    paintZone(P,LEFT_JAW,bp.jaw,bp,palette,h,71);paintZone(P,RIGHT_JAW,bp.jaw,bp,palette,h,91);
    paintZone(P,CHIN,bp.chin,bp,palette,h,111);paintNeckline(P,bp.neckline,bp,palette,h);
    ctx.save();ctx.globalCompositeOperation='destination-out';regionPath(P,LIP_RING);ctx.fill();ctx.restore();
  };
  renderer.__v5=true;renderer.__v5c=true;renderer.__v6=true;renderer.__chiselOriginalBeard=window.drawBeard;window.drawBeard=renderer;try{drawBeard=renderer}catch(_){}return true;
}
return{BEARD_BLUEPRINTS,beardBlueprint,paintZone,install};
});
