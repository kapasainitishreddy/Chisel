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

  function clamp(v,min,max){ return Math.max(min,Math.min(max,Number(v)||0)); }

  function styleVisualProfile(style,gender){
    const st=style||{},id=String(st.id||'none').toLowerCase(),women=gender==='women';
    const top=clamp(st.top||.30,.08,.62),side=clamp(st.side||.12,.04,.34),front=clamp(st.front||top,.08,.68);
    const fall=st.fall==null?0:clamp(st.fall,.18,1.40),flare=clamp(st.flare||.10,.04,.34);
    let part='natural',partBias=0,fringe='none',baseOpacity=women?.62:.60;
    let hairlineLift=women?.105:.09,textureStrength=clamp((st.jitter||0)*7.2,0,.92);
    let crownLift=.12+top*.34,frontLift=.09+front*.36,sideLift=.055+side*.26,fallPx=fall;

    if(id==='buzz'){ part='close';baseOpacity=.34;hairlineLift=.072;crownLift=.09;frontLift=.08;textureStrength=.16; }
    else if(id==='crop'){ part='forward';partBias=-.08;baseOpacity=.53;hairlineLift=.088;crownLift=.14;frontLift=.16;textureStrength=.20; }
    else if(id==='quiff'){ part='swept-right';partBias=.24;hairlineLift=.096;crownLift=.25;frontLift=.34;textureStrength=.28; }
    else if(id==='pomp'){ part='swept-back';partBias=.12;hairlineLift=.10;crownLift=.31;frontLift=.40;textureStrength=.34; }
    else if(id==='slick'){ part='slick-back';partBias=.14;hairlineLift=.105;crownLift=.26;frontLift=.19;textureStrength=.10; }
    else if(id==='curly'){ part='diffuse';hairlineLift=.095;crownLift=.29;frontLift=.28;textureStrength=.90; }
    else if(id==='mlong'){ part='soft-center';hairlineLift=.10;crownLift=.24;frontLift=.22;textureStrength=.32;fallPx=Math.max(fallPx,.48); }

    if(id==='pixie'){ part='soft-side';partBias=.12;hairlineLift=.102;crownLift=.22;frontLift=.19;textureStrength=.24; }
    else if(id==='bixie'){ part='soft-side';partBias=.10;hairlineLift=.105;crownLift=.24;frontLift=.20;textureStrength=.30;fallPx=Math.max(fallPx,.28); }
    else if(id==='frenchbob'){ part='soft-center';hairlineLift=.112;crownLift=.225;frontLift=.16;textureStrength=.22;fallPx=Math.max(fallPx,.50);fringe='wispy';baseOpacity=.57; }
    else if(id==='bob'){ part='soft-center';hairlineLift=.11;crownLift=.22;frontLift=.20;textureStrength=.18;fallPx=Math.max(fallPx,.55);baseOpacity=.58; }
    else if(id==='lob'){ part='soft-center';hairlineLift=.112;crownLift=.235;frontLift=.21;textureStrength=.24;fallPx=Math.max(fallPx,.82); }
    else if(id==='butterfly'){ part='center';hairlineLift=.122;crownLift=.32;frontLift=.29;textureStrength=.48;fallPx=Math.max(fallPx,1.08);baseOpacity=.56; }
    else if(id==='curtain'){ part='center';hairlineLift=.12;crownLift=.27;frontLift=.16;textureStrength=.34;fallPx=Math.max(fallPx,1.04);fringe='curtain'; }
    else if(id==='layers'){ part='soft-center';hairlineLift=.12;crownLift=.27;frontLift=.23;textureStrength=.34;fallPx=Math.max(fallPx,1.18); }
    else if(id==='sleeklong'){ part='center';hairlineLift=.12;crownLift=.22;frontLift=.18;textureStrength=.08;fallPx=Math.max(fallPx,1.26);baseOpacity=.55; }
    else if(id==='waves'){ part='soft-center';hairlineLift=.115;crownLift=.31;frontLift=.27;textureStrength=.68;fallPx=Math.max(fallPx,1.10); }
    else if(id==='curls'){ part='diffuse';hairlineLift=.105;crownLift=.35;frontLift=.31;textureStrength=1.0;fallPx=Math.max(fallPx,.90);baseOpacity=.54; }
    else if(id==='coils'){ part='diffuse';hairlineLift=.098;crownLift=.39;frontLift=.35;textureStrength=1.15;fallPx=Math.max(fallPx,.82);baseOpacity=.52; }
    else if(id==='shag'){ part='broken-center';hairlineLift=.108;crownLift=.31;frontLift=.22;textureStrength=.78;fallPx=Math.max(fallPx,.74);fringe='wispy'; }
    else if(id==='wolf'){ part='broken-center';hairlineLift=.108;crownLift=.33;frontLift=.23;textureStrength=.86;fallPx=Math.max(fallPx,.76);fringe='wispy'; }
    else if(id==='braids'){ part='center';hairlineLift=.12;crownLift=.23;frontLift=.18;textureStrength=.18;fallPx=Math.max(fallPx,1.30);baseOpacity=.50; }
    else if(id==='pony'){ part='slick-back';hairlineLift=.12;crownLift=.34;frontLift=.25;textureStrength=.16;fallPx=Math.max(fallPx,.74);baseOpacity=.52; }
    else if(id==='bun'){ part='slick-back';hairlineLift=.12;crownLift=.40;frontLift=.26;textureStrength=.10;fallPx=0;baseOpacity=.54; }
    else if(id==='updo'){ part='soft-back';hairlineLift=.115;crownLift=.39;frontLift=.27;textureStrength=.30;fallPx=0;baseOpacity=.54; }

    return {id,part,partBias,fringe,baseOpacity,hairlineLift,textureStrength,crownLift,frontLift,sideLift,fallPx,flare,top,side,front,women};
  }

  function previewSummary(hair,beard,makeup){
    const parts=[];
    if(hair&&hair.id!=='none'&&hair.name) parts.push(hair.name);
    if(beard&&beard.id!=='none'&&beard.name) parts.push(beard.name);
    if(makeup&&makeup.id!=='none'&&makeup.name) parts.push(makeup.name);
    return parts.join(' + ')||'Clean preview';
  }

  function syncPreviewSummary(){
    if(typeof document==='undefined') return false;
    const el=document.getElementById('cxStyleSummary');
    if(!el) return false;
    try{
      const list=(typeof styleGender!=='undefined'&&styleGender==='women')?HAIR_WOMEN:HAIR_MEN;
      const hair=list&&list[typeof styleHair==='number'?styleHair:0];
      const beard=(typeof BEARD_STYLES!=='undefined'&&BEARD_STYLES[typeof styleBeard==='number'?styleBeard:0])||null;
      const makeup=(typeof styleMakeup==='number'&&styleMakeup>0&&typeof MAKEUP_LOOKS!=='undefined')?MAKEUP_LOOKS[styleMakeup]:null;
      el.textContent=previewSummary(hair,beard,makeup);
      return true;
    }catch(_){ return false; }
  }

  function installPremiumHairRenderer(){
    if(typeof window==='undefined'||typeof window.drawHair!=='function') return false;
    if(window.drawHair.__chiselPremiumHairV2) return true;

    const premium=function(P,col,fH){
      const st=(typeof hairDef==='function')?hairDef():null;
      if(!st||st.id==='none'||!fH) return;
      const gender=(typeof styleGender!=='undefined'&&styleGender==='women')?'women':'men';
      const profile=styleVisualProfile(st,gender);
      const forehead=P(10),chin=P(152),leftTemple=P(127),rightTemple=P(356);
      const faceW=Math.hypot(rightTemple.x-leftTemple.x,rightTemple.y-leftTemple.y)||fH*.62;
      const rx=(rightTemple.x-leftTemple.x)/faceW,ry=(rightTemple.y-leftTemple.y)/faceW;
      const upLen=Math.hypot(forehead.x-chin.x,forehead.y-chin.y)||fH;
      const ux=(forehead.x-chin.x)/upLen,uy=(forehead.y-chin.y)/upLen,dx=-ux,dy=-uy;
      const baseIds=[127,162,21,54,103,67,109,10,338,297,332,284,251,389,356];
      const raw=baseIds.map(P),mid=(raw.length-1)/2;
      const color=(arr,a)=>(typeof rgbStr==='function')?rgbStr(arr,a):`rgba(${arr.join(',')},${a})`;
      const light=col.map(v=>Math.min(255,Math.round(v*1.24))),dark=col.map(v=>Math.max(0,Math.round(v*.60))),midCol=col.map(v=>Math.max(0,Math.round(v*.84)));

      const hairline=raw.map((p,n)=>{
        const cw=1-Math.abs(n-mid)/mid;
        let lift=profile.hairlineLift + cw*(profile.frontLift*.11);
        if(profile.part==='center'||profile.part==='soft-center') lift+=Math.max(0,.018-Math.abs(n-mid)*.008);
        if(profile.fringe==='wispy') lift-=cw*.018;
        return {x:p.x+ux*fH*lift,y:p.y+uy*fH*lift};
      });
      const leftRoot=hairline[0],rightRoot=hairline[hairline.length-1];
      const sideOut=faceW*(.05+profile.side*.42);
      const crown=profile.crownLift*fH;
      const sweep=profile.partBias*faceW;
      const apex={x:forehead.x+ux*crown+rx*sweep*.52,y:forehead.y+uy*crown+ry*sweep*.52};
      const leftCrown={x:forehead.x-rx*faceW*.36+ux*crown*.84-rx*sweep*.08,y:forehead.y-ry*faceW*.36+uy*crown*.84-ry*sweep*.08};
      const rightCrown={x:forehead.x+rx*faceW*.36+ux*crown*.84+rx*sweep*.08,y:forehead.y+ry*faceW*.36+uy*crown*.84+ry*sweep*.08};
      const leftOuter={x:leftRoot.x-rx*sideOut+ux*crown*.16,y:leftRoot.y-ry*sideOut+uy*crown*.16};
      const rightOuter={x:rightRoot.x+rx*sideOut+ux*crown*.16,y:rightRoot.y+ry*sideOut+uy*crown*.16};

      const silhouette=()=>{
        ctx.beginPath();ctx.moveTo(leftRoot.x,leftRoot.y);
        ctx.bezierCurveTo(leftOuter.x,leftOuter.y,leftCrown.x-rx*faceW*.07,leftCrown.y,leftCrown.x,leftCrown.y);
        ctx.quadraticCurveTo(apex.x-rx*faceW*.13,apex.y,apex.x,apex.y);
        ctx.quadraticCurveTo(apex.x+rx*faceW*.13,apex.y,rightCrown.x,rightCrown.y);
        ctx.bezierCurveTo(rightCrown.x+rx*faceW*.07,rightCrown.y,rightOuter.x,rightOuter.y,rightRoot.x,rightRoot.y);
        for(let i=hairline.length-2;i>=0;i--) ctx.lineTo(hairline[i].x,hairline[i].y);
        ctx.closePath();
      };

      ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
      const g=ctx.createLinearGradient(apex.x,apex.y,forehead.x+dx*fH*.02,forehead.y+dy*fH*.02);
      g.addColorStop(0,color(light,profile.baseOpacity*.78));
      g.addColorStop(.45,color(col,profile.baseOpacity));
      g.addColorStop(1,color(dark,profile.baseOpacity*.82));
      silhouette();ctx.fillStyle=g;ctx.shadowColor='rgba(0,0,0,.18)';ctx.shadowBlur=fH*.012;ctx.fill();ctx.shadowBlur=0;

      const rootCount=42;
      for(let k=0;k<rootCount;k++){
        const t=(k+.5)/rootCount,pos=t*(hairline.length-1),i=Math.min(hairline.length-2,Math.floor(pos)),u=pos-i;
        const a=hairline[i],b=hairline[i+1],sx=a.x+(b.x-a.x)*u,sy=a.y+(b.y-a.y)*u;
        const len=fH*(.022+.018*seeded(k,profile.id.length));
        const drift=(seeded(k,7)-.5)*faceW*.008;
        ctx.strokeStyle=color(dark,.30+.12*seeded(k,3));ctx.lineWidth=Math.max(.55,fH*.0019);
        ctx.beginPath();ctx.moveTo(sx+rx*drift,sy+ry*drift);ctx.lineTo(sx+ux*len+rx*drift*.4,sy+uy*len+ry*drift*.4);ctx.stroke();
      }

      const strands=profile.id==='buzz'?20:46;
      ctx.lineWidth=Math.max(.55,fH*.0020);
      for(let k=0;k<strands;k++){
        const t=(k+.5)/strands,pos=t*(hairline.length-1),i=Math.min(hairline.length-2,Math.floor(pos)),u=pos-i;
        const a=hairline[i],b=hairline[i+1],sx=a.x+(b.x-a.x)*u,sy=a.y+(b.y-a.y)*u;
        const center=1-Math.abs(t-.5)*2;
        let local=fH*(profile.sideLift+(profile.crownLift-profile.sideLift)*(.35+.65*center));
        if(profile.id==='buzz') local*=.36;
        if(profile.id==='crop') local*=.62;
        const sweepX=rx*faceW*profile.partBias*(.18+.55*center);
        const jitter=(seeded(k,profile.id.length)-.5)*faceW*(.008+.024*profile.textureStrength);
        const ex=sx+ux*local+sweepX+rx*jitter,ey=sy+uy*local+ry*faceW*profile.partBias*(.18+.55*center)+ry*jitter;
        const wave=profile.textureStrength*faceW*.045*Math.sin((k+1)*1.72);
        const cx=(sx+ex)/2+rx*((t-.5)*faceW*.045+wave),cy=(sy+ey)/2+ry*((t-.5)*faceW*.045+wave);
        ctx.strokeStyle=color((k%4===0)?light:midCol,(profile.id==='buzz'?.22:.18)+.14*profile.textureStrength);
        ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo(cx,cy,ex,ey);ctx.stroke();
      }

      const drawFall=(side)=>{
        const root=side<0?leftRoot:rightRoot,jaw=P(side<0?172:397),outX=rx*side,outY=ry*side;
        const length=fH*profile.fallPx*.72,flare=faceW*profile.flare;
        const end={x:jaw.x+outX*flare+dx*length,y:jaw.y+outY*flare+dy*length};
        const inner={x:jaw.x+outX*flare*.16+dx*length*.86,y:jaw.y+outY*flare*.16+dy*length*.86};
        ctx.save();ctx.beginPath();ctx.moveTo(root.x,root.y);
        ctx.bezierCurveTo(root.x+outX*flare*.78,root.y+outY*flare*.78,end.x+outX*flare*.12,end.y-dy*fH*.04,end.x,end.y);
        ctx.quadraticCurveTo(inner.x,inner.y,inner.x,inner.y);
        ctx.bezierCurveTo(jaw.x+outX*flare*.03,jaw.y,root.x+outX*faceW*.01,root.y+outY*faceW*.01,root.x,root.y);ctx.closePath();
        const fg=ctx.createLinearGradient(root.x,root.y,end.x,end.y);fg.addColorStop(0,color(col,profile.baseOpacity*.82));fg.addColorStop(1,color(dark,profile.baseOpacity*.62));
        ctx.fillStyle=fg;ctx.fill();
        const sideStrands=profile.textureStrength>.75?18:12;
        for(let s=0;s<sideStrands;s++){
          const q=(s+1)/(sideStrands+1),offset=(q-.5)*flare*.52;
          const bend=Math.sin((s+1)*1.8)*profile.textureStrength*flare*.34;
          ctx.strokeStyle=color((s%3===0)?light:midCol,.14+.10*profile.textureStrength);ctx.lineWidth=Math.max(.55,fH*.0019);
          ctx.beginPath();ctx.moveTo(root.x+outX*offset*.3,root.y+outY*offset*.3);
          ctx.quadraticCurveTo((root.x+end.x)/2+outX*(offset+bend),(root.y+end.y)/2+outY*(offset+bend),end.x+outX*offset*.35,end.y+outY*offset*.35);ctx.stroke();
        }
        ctx.restore();
      };
      if(profile.fallPx>0){ drawFall(-1);drawFall(1); }

      if(profile.fringe!=='none'){
        const count=profile.fringe==='curtain'?14:20;
        for(let n=0;n<count;n++){
          const t=(n+.5)/count,side=t<.5?-1:1,center=Math.abs(t-.5)*2;
          const rootIdx=Math.max(2,Math.min(hairline.length-3,Math.round((.30+t*.40)*(hairline.length-1))));
          const r=hairline[rootIdx],drop=fH*(profile.fringe==='curtain'?.14:.10)*(1-center*.35);
          const away=faceW*(profile.fringe==='curtain'?.09:.035)*side*(1-center);
          ctx.strokeStyle=color(dark,.30);ctx.lineWidth=Math.max(.6,fH*.0021);
          ctx.beginPath();ctx.moveTo(r.x,r.y);ctx.quadraticCurveTo(r.x+rx*away*.35+dx*drop*.45,r.y+ry*away*.35+dy*drop*.45,r.x+rx*away+dx*drop,r.y+ry*away+dy*drop);ctx.stroke();
        }
      }

      if(profile.textureStrength>.58){
        const curls=Math.round(10+profile.textureStrength*14);
        for(let n=0;n<curls;n++){
          const t=(n+.5)/curls,ang=(t-.5)*Math.PI*.95;
          const cx=apex.x+rx*Math.sin(ang)*faceW*.49+dx*fH*(.015+.025*seeded(n,6));
          const cy=apex.y+ry*Math.sin(ang)*faceW*.49+dy*fH*(.015+.025*seeded(n,6));
          const r=fH*(.012+.018*profile.textureStrength+.008*seeded(n,9));
          ctx.strokeStyle=color(light,.13+.11*profile.textureStrength);ctx.lineWidth=Math.max(.65,fH*.0020);
          ctx.beginPath();ctx.arc(cx,cy,r,Math.PI*.1,Math.PI*1.55);ctx.stroke();
        }
      }

      if(!['diffuse','close','forward'].includes(profile.part)){
        const dir=profile.partBias>=0?1:-1,partX=apex.x-rx*faceW*profile.partBias*.18,partY=apex.y-ry*faceW*profile.partBias*.18;
        const h=hairline[Math.round(mid+dir*Math.min(3,Math.abs(profile.partBias)*10))]||hairline[Math.round(mid)];
        ctx.strokeStyle='rgba(238,220,198,.15)';ctx.lineWidth=Math.max(.8,fH*.0032);ctx.beginPath();ctx.moveTo(partX,partY);ctx.quadraticCurveTo((partX+h.x)/2,(partY+h.y)/2,h.x,h.y);ctx.stroke();
      }
      ctx.restore();
    };
    premium.__chiselPremiumHair=true;
    premium.__chiselPremiumHairV2=true;
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
          syncPreviewSummary();
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
          syncPreviewSummary();
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
          syncPreviewSummary();
        }catch(e){}
        return result;
      };
      wrappedOpen.__chiselCleanDefault=true;
      openStyle=wrappedOpen;
    }
    return true;
  }
  return{install,isDuplicateRoute,installRouteGuard,installPremiumHairRenderer,seeded,styleVisualProfile,previewSummary,syncPreviewSummary};
});