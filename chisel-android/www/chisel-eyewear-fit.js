(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;if(root)root.ChiselEyewearFit=api;})(typeof window!=='undefined'?window:null,()=>{
  const anchors=[33,133,263,362,127,356];
  function geometry(P){
    const p=anchors.map(P);if(p.some(v=>!v||!Number.isFinite(v.x)||!Number.isFinite(v.y)))return{accepted:false,reason:'Eye anchors unavailable'};
    const mid=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2}),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    const left=mid(p[0],p[1]),right=mid(p[2],p[3]),span=dist(left,right),fw=dist(p[4],p[5]),eyeWidths=[dist(p[0],p[1]),dist(p[2],p[3])];
    if(!(fw>0&&span/fw>.2&&span/fw<.8&&Math.min(...eyeWidths)/Math.max(...eyeWidths)>.5&&Math.min(...eyeWidths)>fw*.05))return{accepted:false,reason:'Face forward with both eyes visible'};
    const angle=Math.atan2(right.y-left.y,right.x-left.x);if(Math.abs(angle)>.5)return{accepted:false,reason:'Keep your head upright'};
    const width=Math.min(span*.84,Math.max(...eyeWidths)*1.55),height=width*.64;
    return{accepted:true,angle,lenses:[{...left,width,height},{...right,width,height}],bridge:mid(left,right),faceWidth:fw};
  }
  function fit(points,width,height){if(!Array.isArray(points)||!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0||anchors.some(i=>!points[i]||points[i].x<0||points[i].x>1||points[i].y<0||points[i].y>1))return{accepted:false,reason:'Invalid capture'};return geometry(i=>({x:points[i]?.x*width,y:points[i]?.y*height}));}
  function draw(context,P,style){const g=geometry(P);if(!g.accepted||!style||style.id==='none')return g;const rgb=Array.isArray(style.frame)?style.frame:[25,25,25];context.save();context.lineWidth=Math.max(1,g.faceWidth*.008);context.strokeStyle=`rgba(${rgb.join(',')},0.9)`;context.fillStyle=`rgba(${rgb.join(',')},${Math.min(.85,Math.max(0,style.tint||0))})`;
    for(const lens of g.lenses){context.save();context.translate(lens.x,lens.y);context.rotate(g.angle);context.beginPath();if(['round','aviator'].includes(style.shape))context.ellipse(0,0,lens.width/2,lens.height/2,0,0,Math.PI*2);else context.roundRect(-lens.width/2,-lens.height/2,lens.width,lens.height,lens.height*.2);if(style.tint>0)context.fill();context.stroke();context.restore();}
    const a=g.lenses[0],b=g.lenses[1],dx=Math.cos(g.angle),dy=Math.sin(g.angle);context.beginPath();context.moveTo(a.x+dx*a.width/2,a.y+dy*a.width/2);context.lineTo(b.x-dx*b.width/2,b.y-dy*b.width/2);context.stroke();context.restore();return g;}
  function install(){if(typeof window==='undefined'||typeof window.drawGlasses!=='function')return false;const render=(P)=>draw(ctx,P,GLASS_STYLES[styleGlass]);render.__chiselFittedEyewear=true;window.drawGlasses=render;try{drawGlasses=render;}catch{}return true;}
  return{fit,geometry,draw,install};
});
