(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else{root.ChiselBeardTuningV5=api;if(typeof window!=='undefined'&&typeof document!=='undefined')window.addEventListener('load',()=>setTimeout(api.install,420),{once:true});}
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
// V6.1 uses follicle-only zones: no filled cheek/jaw polygons are painted over the face.
const BEARD_BLUEPRINTS=Object.freeze({
 none:{family:'clean',moustache:0,cheeks:0,jaw:0,chin:0,neckline:0,density:0,length:0},
 stubble:{family:'stubble',moustache:.46,cheeks:.42,jaw:.58,chin:.62,neckline:.24,density:160,length:.0017,alpha:.34},
 short:{family:'short-boxed',moustache:.82,cheeks:.64,jaw:.96,chin:1,neckline:.72,density:215,length:.0056,alpha:.42},
 full:{family:'full',moustache:.92,cheeks:.86,jaw:1,chin:1,neckline:.90,density:255,length:.0105,alpha:.46},
 goatee:{family:'goatee',moustache:.76,cheeks:0,jaw:.08,chin:1,neckline:.08,density:205,length:.0077,alpha:.44},
 vandyke:{family:'vandyke',moustache:.86,cheeks:0,jaw:0,chin:1,neckline:0,density:215,length:.0088,alpha:.45},
 mous:{family:'moustache',moustache:1,cheeks:0,jaw:0,chin:0,neckline:0,density:205,length:.0063,alpha:.46},
 chin:{family:'chinstrap',moustache:.16,cheeks:.08,jaw:.96,chin:.52,neckline:.70,density:210,length:.0058,alpha:.42}
});
function beardBlueprint(style){const id=String(typeof style==='string'?style:(style&&style.id)||'none').toLowerCase();return Object.assign({id},BEARD_BLUEPRINTS[id]||BEARD_BLUEPRINTS.none)}
const rnd=(n,s=0)=>{const x=Math.sin((n+1)*12.9898+s*78.233)*43758.5453;return x-Math.floor(x)};
const LEFT_CHEEK=[234,93,132,58,172,136,150,149,176,152,17,84,91,61,205,50],RIGHT_CHEEK=[454,323,361,288,397,365,379,378,400,377,152,314,321,291,425,280],LEFT_JAW=[234,93,132,58,172,136,150,149,176,152,17,84,91,61],RIGHT_JAW=[454,323,361,288,397,365,379,378,400,377,152,314,321,291],MOUSTACHE=[129,2,358,291,269,267,0,37,39,61],CHIN=[91,84,17,314,321,400,377,152,176,148],LIP_RING=[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],JAW=[234,93,132,58,172,136,150,149,176,148,152,377,400,378,379,365,397,288,361,323,454];
function rgba(c,a){return`rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`}
function regionPath(P,indices){ctx.beginPath();indices.forEach((id,i)=>{const p=P(id);i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)});ctx.closePath()}
function bbox(P,indices){const a=indices.map(P),xs=a.map(p=>p.x),ys=a.map(p=>p.y);return{l:Math.min(...xs),r:Math.max(...xs),t:Math.min(...ys),b:Math.max(...ys)}}
function paintZone(P,indices,strength,bp,palette,h,salt){
 if(!(strength>0))return;const box=bbox(P,indices);ctx.save();regionPath(P,indices);ctx.clip();ctx.lineCap='round';const count=Math.min(280,Math.round(34+bp.density*strength));
 for(let i=0;i<count;i++){
  const x=box.l+rnd(i,salt)*(box.r-box.l),y=box.t+rnd(i,salt+19)*(box.b-box.t),opacity=(.11+.21*rnd(i,salt+31))*strength,L=h*bp.length*(.48+.80*rnd(i,salt+47));
  if(bp.family==='stubble'||L<h*.0022){const r=Math.max(.38,h*(.00045+.00042*rnd(i,salt+61)));ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=rgba(palette.dark,Math.min(.38,opacity*1.30));ctx.fill();}
  else{const lean=(rnd(i,salt+73)-.5)*L*.48;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+lean*.30,y+L*.43,x+lean,y+L);ctx.strokeStyle=rgba(i%13===0?palette.light:palette.dark,Math.min(.42,opacity*1.20));ctx.lineWidth=Math.max(.38,h*(i%17===0?.00105:.00068));ctx.stroke();}
 }
 ctx.restore();
}
function paintNeckline(P,strength,bp,palette,h){if(!(strength>0))return;const points=JAW.map(P);ctx.save();ctx.lineCap='round';const count=120;for(let i=0;i<count;i++){const z=(i+.5)/count,pos=z*(points.length-1),k=Math.min(points.length-2,Math.floor(pos)),u=pos-k,A=points[k],B=points[k+1],x=A.x+(B.x-A.x)*u,y=A.y+(B.y-A.y)*u,L=h*bp.length*(.38+.72*rnd(i,201));if(bp.family==='stubble'){const r=Math.max(.35,h*.00048);ctx.beginPath();ctx.arc(x+(rnd(i,207)-.5)*h*.006,y+(rnd(i,209)-.5)*h*.006,r,0,Math.PI*2);ctx.fillStyle=rgba(palette.dark,.18*strength);ctx.fill()}else{ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(rnd(i,211)-.5)*L*.30,y+L);ctx.strokeStyle=rgba(palette.dark,.18*strength);ctx.lineWidth=Math.max(.35,h*.00065);ctx.stroke()}}ctx.restore()}
function install(){
 if(typeof window==='undefined'||typeof window.drawBeard!=='function')return false;if(window.drawBeard.__v61)return true;
 const renderer=function(P,c,h){const style=(typeof BEARD_STYLES!=='undefined'&&BEARD_STYLES[typeof styleBeard==='number'?styleBeard:0])||null,bp=beardBlueprint(style);if(!style||bp.family==='clean'||!h)return;const palette={dark:c.map(v=>Math.max(4,Math.min(72,v*.30))),light:c.map(v=>Math.max(10,Math.min(115,v*.52)))};paintZone(P,MOUSTACHE,bp.moustache,bp,palette,h,11);paintZone(P,LEFT_CHEEK,bp.cheeks,bp,palette,h,31);paintZone(P,RIGHT_CHEEK,bp.cheeks,bp,palette,h,51);paintZone(P,LEFT_JAW,bp.jaw,bp,palette,h,71);paintZone(P,RIGHT_JAW,bp.jaw,bp,palette,h,91);paintZone(P,CHIN,bp.chin,bp,palette,h,111);paintNeckline(P,bp.neckline,bp,palette,h);ctx.save();ctx.globalCompositeOperation='destination-out';regionPath(P,LIP_RING);ctx.fill();ctx.restore()};
 renderer.__v5=true;renderer.__v5c=true;renderer.__v6=true;renderer.__v61=true;renderer.__chiselOriginalBeard=window.drawBeard;window.drawBeard=renderer;try{drawBeard=renderer}catch(_){}return true;
}
return{BEARD_BLUEPRINTS,beardBlueprint,paintZone,install};
});
