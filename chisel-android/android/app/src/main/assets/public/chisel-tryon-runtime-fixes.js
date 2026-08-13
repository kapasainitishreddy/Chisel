(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else {
    root.ChiselTryonRuntimeFixes=api;
    if(typeof window!=='undefined'&&typeof document!=='undefined'){
      window.addEventListener('load',()=>setTimeout(api.install,0),{once:true});
    }
  }
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function isDuplicateRoute(route,activeRoute,hash){
    const target=String(route||'home');
    return activeRoute===target && hash==='#'+target;
  }

  function installRouteGuard(){
    if(typeof window==='undefined'||typeof document==='undefined'||typeof window.go!=='function') return false;
    if(window.go.__chiselRouteGuard) return true;
    const originalGo=window.go;
    const wrappedGo=function(route){
      const target=String(route||'home');
      const active=document.querySelector('.screen.active');
      const activeRoute=active&&active.dataset?active.dataset.screen:null;
      if(isDuplicateRoute(target,activeRoute,window.location.hash)) return true;
      return originalGo.apply(this,arguments);
    };
    wrappedGo.__chiselRouteGuard=true;
    wrappedGo.__chiselOriginalGo=originalGo;
    window.go=wrappedGo;
    return true;
  }

  function seeded(n,salt){
    const x=Math.sin((n+1)*12.9898+(salt||0)*78.233)*43758.5453;
    return x-Math.floor(x);
  }

  function installPremiumHairRenderer(){
    if(typeof window==='undefined'||typeof window.drawHair!=='function') return false;
    if(window.drawHair.__chiselPremiumHair) return true;

    const premium=function(P,col,fH){
      const st=(typeof hairDef==='function')?hairDef():null;
      if(!st||st.id==='none'||!fH) return;

      const forehead=P(10),chin=P(152),leftTemple=P(127),rightTemple=P(356);
      const faceW=Math.hypot(rightTemple.x-leftTemple.x,rightTemple.y-leftTemple.y)||fH*.62;
      let rx=(rightTemple.x-leftTemple.x)/faceW,ry=(rightTemple.y-leftTemple.y)/faceW;
      const upLen=Math.hypot(forehead.x-chin.x,forehead.y-chin.y)||fH;
      const ux=(forehead.x-chin.x)/upLen,uy=(forehead.y-chin.y)/upLen;
      const dx=-ux,dy=-uy;
      const topMeta=Math.max(.24,Math.min(.56,Number(st.top)||.34));
      const sideMeta=Math.max(.10,Math.min(.30,Number(st.side)||.16));
      const lift=fH*(.13+topMeta*.34);
      const sideOut=faceW*(.045+sideMeta*.36);
      const line=[127,162,21,54,103,67,109,10,338,297,332,284,251,389,356].map(P);
      const leftOuter={x:leftTemple.x-rx*sideOut+ux*lift*.24,y:leftTemple.y-ry*sideOut+uy*lift*.24};
      const rightOuter={x:rightTemple.x+rx*sideOut+ux*lift*.24,y:rightTemple.y+ry*sideOut+uy*lift*.24};
      const apex={x:forehead.x+ux*lift,y:forehead.y+uy*lift};
      const leftCrown={x:forehead.x-rx*faceW*.34+ux*lift*.88,y:forehead.y-ry*faceW*.34+uy*lift*.88};
      const rightCrown={x:forehead.x+rx*faceW*.34+ux*lift*.88,y:forehead.y+ry*faceW*.34+uy*lift*.88};
      const light=col.map(v=>Math.min(255,Math.round(v*1.20)));
      const dark=col.map(v=>Math.max(0,Math.round(v*.66)));
      const mid=col.map(v=>Math.max(0,Math.round(v*.88)));

      const silhouette=()=>{
        ctx.beginPath();
        ctx.moveTo(leftTemple.x,leftTemple.y);
        ctx.bezierCurveTo(leftOuter.x,leftOuter.y,leftCrown.x-rx*faceW*.08,leftCrown.y,leftCrown.x,leftCrown.y);
        ctx.quadraticCurveTo(apex.x-rx*faceW*.12,apex.y,apex.x,apex.y);
        ctx.quadraticCurveTo(apex.x+rx*faceW*.12,apex.y,rightCrown.x,rightCrown.y);
        ctx.bezierCurveTo(rightCrown.x+rx*faceW*.08,rightCrown.y,rightOuter.x,rightOuter.y,rightTemple.x,rightTemple.y);
        for(let i=line.length-2;i>=0;i--) ctx.lineTo(line[i].x,line[i].y);
        ctx.closePath();
      };

      ctx.save();
      ctx.lineJoin='round';ctx.lineCap='round';
      ctx.save();
      ctx.filter=`blur(${Math.max(1.2,fH*.006)}px)`;
      silhouette();
      ctx.fillStyle=(typeof rgbStr==='function')?rgbStr(dark,.34):`rgba(${dark.join(',')},.34)`;
      ctx.fill();
      ctx.restore();

      const g=ctx.createLinearGradient(apex.x,apex.y,forehead.x+dx*fH*.02,forehead.y+dy*fH*.02);
      const color=(arr,a)=>(typeof rgbStr==='function')?rgbStr(arr,a):`rgba(${arr.join(',')},${a})`;
      g.addColorStop(0,color(light,.78));
      g.addColorStop(.5,color(col,.72));
      g.addColorStop(1,color(dark,.68));
      silhouette();ctx.fillStyle=g;ctx.shadowColor='rgba(0,0,0,.24)';ctx.shadowBlur=fH*.018;ctx.fill();ctx.shadowBlur=0;

      ctx.strokeStyle=color(mid,.22);ctx.lineWidth=Math.max(.65,fH*.0026);
      const strands=32;
      for(let k=0;k<strands;k++){
        const t=(k+.5)/strands;
        const pos=t*(line.length-1),i=Math.min(line.length-2,Math.floor(pos)),u=pos-i;
        const a=line[i],b=line[i+1];
        const sx=a.x+(b.x-a.x)*u,sy=a.y+(b.y-a.y)*u;
        const crown=1-Math.abs(t-.5)*2;
        const localLift=fH*(sideMeta*.35+(topMeta-sideMeta)*(.42+.58*crown));
        const jitter=(seeded(k,st.id.length)-.5)*faceW*.018;
        const ex=sx+ux*localLift+rx*jitter,ey=sy+uy*localLift+ry*jitter;
        const cx=(sx+ex)/2+rx*(t-.5)*faceW*.06,cy=(sy+ey)/2+ry*(t-.5)*faceW*.06;
        ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo(cx,cy,ex,ey);ctx.stroke();
      }

      if(st.fall){
        const fall=Math.max(.20,Math.min(1.25,Number(st.fall)||.45));
        const flare=faceW*Math.max(.06,Math.min(.28,Number(st.flare)||.12));
        const drawFall=(side)=>{
          const start=side<0?leftTemple:rightTemple;
          const jaw=P(side<0?172:397);
          const outX=rx*side,outY=ry*side;
          const end={x:jaw.x+outX*flare+dx*fH*fall*.48,y:jaw.y+outY*flare+dy*fH*fall*.48};
          const inner={x:jaw.x+outX*flare*.18+dx*fH*fall*.38,y:jaw.y+outY*flare*.18+dy*fH*fall*.38};
          ctx.save();ctx.beginPath();ctx.moveTo(start.x,start.y);
          ctx.bezierCurveTo(start.x+outX*flare,start.y+outY*flare,end.x+outX*flare*.20,end.y-dy*fH*.05,end.x,end.y);
          ctx.quadraticCurveTo(inner.x+outX*flare*.10,inner.y,inner.x,inner.y);
          ctx.bezierCurveTo(jaw.x+outX*flare*.04,jaw.y,start.x+outX*faceW*.015,start.y+outY*faceW*.015,start.x,start.y);
          ctx.closePath();
          const fg=ctx.createLinearGradient(start.x,start.y,end.x,end.y);fg.addColorStop(0,color(col,.69));fg.addColorStop(1,color(dark,.52));
          ctx.fillStyle=fg;ctx.shadowColor='rgba(0,0,0,.18)';ctx.shadowBlur=fH*.014;ctx.fill();ctx.shadowBlur=0;
          ctx.strokeStyle=color(light,.12);ctx.lineWidth=Math.max(.6,fH*.0022);
          for(let s=0;s<10;s++){
            const q=(s+1)/11,ox=(q-.5)*flare*.45;
            ctx.beginPath();ctx.moveTo(start.x+outX*ox,start.y+outY*ox);
            ctx.quadraticCurveTo((start.x+end.x)/2+outX*(flare*.15+ox),(start.y+end.y)/2+outY*(flare*.15+ox),end.x+outX*ox*.45,end.y+outY*ox*.45);ctx.stroke();
          }
          ctx.restore();
        };
        drawFall(-1);drawFall(1);
      }

      if(/curl|coil|shag|wolf|wave/.test(String(st.id))){
        ctx.strokeStyle=color(light,.18);ctx.lineWidth=Math.max(.7,fH*.0024);
        for(let n=0;n<15;n++){
          const t=(n+.5)/15,ang=(t-.5)*Math.PI*.92;
          const cx=apex.x+rx*Math.sin(ang)*faceW*.48+dx*fH*.02;
          const cy=apex.y+ry*Math.sin(ang)*faceW*.48+dy*fH*.02;
          const r=fH*(.018+seeded(n,9)*.012);
          ctx.beginPath();ctx.arc(cx,cy,r,Math.PI*.15,Math.PI*1.45);ctx.stroke();
        }
      }
      ctx.restore();
    };
    premium.__chiselPremiumHair=true;
    premium.__chiselOriginalHair=window.drawHair;
    window.drawHair=premium;
    try{drawHair=premium;}catch(_){}
    return true;
  }

  function install(){
    installRouteGuard();
    installPremiumHairRenderer();

    if(typeof renderStyleChips==='function'&&!renderStyleChips.__chiselTryonFix){
      const originalRender=renderStyleChips;
      const wrappedRender=function(){
        const result=originalRender.apply(this,arguments);
        try{
          const women=typeof styleGender!=='undefined'&&styleGender==='women';
          const beardLabel=document.getElementById('beardLab');
          const beardChips=document.getElementById('beardChips');
          if(beardLabel)beardLabel.style.display=women?'none':'';
          if(beardChips)beardChips.style.display=women?'none':'';
        }catch(e){}
        return result;
      };
      wrappedRender.__chiselTryonFix=true;
      renderStyleChips=wrappedRender;
    }

    if(typeof applyMatches==='function'&&!applyMatches.__chiselPreserveBeard){
      const originalMatches=applyMatches;
      const wrappedMatches=function(){
        const priorBeard=typeof styleBeard==='number'?styleBeard:0;
        const result=originalMatches.apply(this,arguments);
        try{
          styleBeard=(typeof styleGender!=='undefined'&&styleGender==='women')?0:priorBeard;
          if(typeof renderStyleChips==='function')renderStyleChips();
        }catch(e){}
        return result;
      };
      wrappedMatches.__chiselPreserveBeard=true;
      applyMatches=wrappedMatches;
    }

    if(typeof openStyle==='function'&&!openStyle.__chiselCleanDefault){
      const originalOpen=openStyle;
      const wrappedOpen=function(){
        const result=originalOpen.apply(this,arguments);
        try{
          styleBeard=0;
          if(typeof renderStyleChips==='function')renderStyleChips();
        }catch(e){}
        return result;
      };
      wrappedOpen.__chiselCleanDefault=true;
      openStyle=wrappedOpen;
    }
    return true;
  }
  return{install,isDuplicateRoute,installRouteGuard,installPremiumHairRenderer,seeded};
});