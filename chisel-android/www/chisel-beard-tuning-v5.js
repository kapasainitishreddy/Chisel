(function(r){
const rnd=(n,s=0)=>{const x=Math.sin((n+1)*12.9898+s*78.233)*43758.5453;return x-Math.floor(x)};
const CFG={stubble:[.12,180,.0010],short:[.22,320,.0018],full:[.32,480,.0030],goatee:[.25,250,.0022],vandyke:[.27,280,.0025],mous:[.24,180,.0019],chin:[.22,250,.0020]};
function install(){
 if(!r.drawBeard||r.drawBeard.__v5c)return false;
 r.drawBeard=function(P,c,h){
  const s=BEARD_STYLES[styleBeard];if(!s||s.id==='none'||!h)return;const v=CFG[s.id]||CFG.stubble,dark=c.map(x=>Math.min(105,Math.max(8,x*.42))),faceL=P(234),faceR=P(454),mouthL=P(61),mouthR=P(291),mouthT=P(13),chin=P(152),jawL=P(172),jawR=P(397),fw=Math.hypot(faceR.x-faceL.x,faceR.y-faceL.y)||h*.64,fh=Math.hypot(P(10).x-chin.x,P(10).y-chin.y)||h,mw=Math.hypot(mouthR.x-mouthL.x,mouthR.y-mouthL.y)||fw*.30;
  const col=a=>rgbStr(dark,a),blob=(x,y,rx,ry,a)=>{ctx.save();ctx.translate(x,y);ctx.scale(rx,ry);const g=ctx.createRadialGradient(0,0,.08,0,0,1);g.addColorStop(0,col(a));g.addColorStop(.58,col(a*.72));g.addColorStop(1,col(0));ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.fill();ctx.restore()},ellipsePoint=(cx,cy,rx,ry,n,salt)=>{const ang=rnd(n,salt)*Math.PI*2,rad=Math.sqrt(rnd(n,salt+17));return{x:cx+Math.cos(ang)*rx*rad,y:cy+Math.sin(ang)*ry*rad}};
  const LC={x:(mouthL.x+jawL.x)/2,y:(mouthL.y+jawL.y)/2},RC={x:(mouthR.x+jawR.x)/2,y:(mouthR.y+jawR.y)/2},CC={x:chin.x,y:(mouthT.y+chin.y)/2+.04*fh},MC={x:(mouthL.x+mouthR.x)/2,y:mouthT.y+.018*fh};
  ctx.save();
  if(s.region==='full'){
    blob(LC.x,LC.y,fw*.24,fh*.22,v[0]*.68);blob(RC.x,RC.y,fw*.24,fh*.22,v[0]*.68);blob(CC.x,CC.y,fw*.29,fh*.22,v[0]);blob(MC.x,MC.y,mw*.64,fh*.055,v[0]*.72);
  }else if(s.region==='goatee'||s.region==='vandyke'){
    blob(CC.x,CC.y,fw*.20,fh*.21,v[0]);blob(MC.x,MC.y,mw*.62,fh*.052,v[0]*.88);
  }else if(s.region==='mous')blob(MC.x,MC.y,mw*.66,fh*.055,v[0]);
  else if(s.region==='chinstrap'){
    const js=JAW_LOW.map(P);for(let i=0;i<js.length;i+=2)blob(js[i].x,js[i].y,fw*.09,fh*.055,v[0]*.88);
  }
  ctx.fillStyle=col(.16);ctx.strokeStyle=col(.12);ctx.lineCap='round';
  for(let i=0;i<v[1];i++){
    let pt;if(s.region==='mous')pt=ellipsePoint(MC.x,MC.y,mw*.58,fh*.040,i,81);else if(s.region==='goatee'||s.region==='vandyke')pt=i%3===0?ellipsePoint(MC.x,MC.y,mw*.55,fh*.038,i,91):ellipsePoint(CC.x,CC.y,fw*.17,fh*.17,i,101);else if(s.region==='chinstrap'){const A=P(JAW_LOW[i%JAW_LOW.length]);pt=ellipsePoint(A.x,A.y,fw*.055,fh*.032,i,111)}else{const z=i%3;pt=z===0?ellipsePoint(LC.x,LC.y,fw*.20,fh*.18,i,121):z===1?ellipsePoint(RC.x,RC.y,fw*.20,fh*.18,i,131):ellipsePoint(CC.x,CC.y,fw*.24,fh*.18,i,141)}
    const rad=Math.max(.25,h*(.00045+.00045*rnd(i,151)));ctx.beginPath();ctx.arc(pt.x,pt.y,rad,0,Math.PI*2);ctx.fillStyle=col(.08+.08*rnd(i,161));ctx.fill();if(s.id!=='stubble'&&rnd(i,171)>.58){const L=h*v[2]*(.55+.65*rnd(i,181));ctx.beginPath();ctx.moveTo(pt.x,pt.y);ctx.quadraticCurveTo(pt.x+(rnd(i,191)-.5)*L*.35,pt.y+L*.45,pt.x+(rnd(i,201)-.5)*L*.45,pt.y+L);ctx.lineWidth=Math.max(.35,h*.0008);ctx.strokeStyle=col(.09+.06*rnd(i,211));ctx.stroke()}
  }
  ctx.globalCompositeOperation='destination-out';pathPts(P,LIP_RING);ctx.fill();ctx.globalCompositeOperation='source-over';ctx.restore();
 };
 r.drawBeard.__v5=true;r.drawBeard.__v5c=true;try{drawBeard=r.drawBeard}catch{}return true;
}
r.ChiselBeardTuningV5={install};if(typeof window!=='undefined')window.addEventListener('load',()=>setTimeout(install,420),{once:true});
})(typeof globalThis!=='undefined'?globalThis:this);
