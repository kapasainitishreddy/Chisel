(function(r){
const rnd=(n,s=0)=>{const x=Math.sin((n+1)*12.9898+s*78.233)*43758.5453;return x-Math.floor(x)};
function install(){
  if(!r.drawHair||r.drawHair.__v5c)return false;
  r.drawHair=function(P,c,h){
    const s=hairDef();if(!s||s.id==='none'||!h)return;
    const M={
      buzz:[.055,.030,0,.92,.04,.05,0],crop:[.12,.045,0,.98,.15,.07,-.10],quiff:[.36,.070,0,1.05,.24,.09,.28],pomp:[.43,.075,0,1.07,.24,.10,.15],slick:[.19,.045,0,.98,.04,.06,.18],curly:[.34,.15,0,1.11,.86,.16,0],mlong:[.23,.12,.68,1.09,.30,.20,0],
      pixie:[.19,.075,0,1,.16,.08,.10],bixie:[.22,.09,.28,1.04,.22,.12,.08],frenchbob:[.20,.12,.48,1.08,.12,.22,0],bob:[.21,.13,.56,1.10,.10,.24,0],lob:[.23,.14,.82,1.10,.18,.22,0],butterfly:[.31,.17,1.08,1.15,.44,.29,0],curtain:[.27,.15,1.04,1.12,.30,.26,0],layers:[.27,.15,1.18,1.12,.27,.24,0],sleeklong:[.21,.10,1.26,1.04,.04,.14,0],waves:[.31,.19,1.10,1.16,.66,.31,0],curls:[.35,.23,.90,1.20,.90,.34,0],coils:[.38,.26,.82,1.24,1,.36,0],shag:[.31,.19,.76,1.17,.74,.32,0],wolf:[.34,.20,.80,1.18,.80,.33,0],braids:[.22,.10,1.30,1.04,.12,.16,0],pony:[.31,.09,.76,1.03,.12,.14,.12],bun:[.35,.09,0,1,.06,.10,.12],updo:[.36,.12,0,1.04,.22,.12,.08]
    };
    const m=M[s.id]||[Math.max(.16,s.top||.22),Math.max(.07,s.side||.10),s.fall||0,1.05,Math.min(1,(s.jitter||.02)*7),s.flare||.12,0];
    const ids=[127,162,21,54,103,67,109,10,338,297,332,284,251,389,356],a=P(127),b=P(356),f=P(10),q=P(152),w=Math.hypot(b.x-a.x,b.y-a.y)||h*.62,ux=(f.x-q.x)/h,uy=(f.y-q.y)/h,dx=-ux,dy=-uy,rx=(b.x-a.x)/w,ry=(b.y-a.y)/w,mid=(ids.length-1)/2,raw=ids.map(P);
    const roots=raw.map((p,n)=>{const z=1-Math.abs(n-mid)/mid,L=h*(.020+.012*z);return{x:p.x+ux*L,y:p.y+uy*L}});
    const outer=roots.map((p,n)=>{const t=n/(roots.length-1),z=1-Math.abs(t-.5)*2,L=h*(m[1]+(m[0]-m[1])*Math.pow(z,.72)),side=(t-.5)*w*(m[3]-1),sweep=w*m[6]*(.12+.34*z),wave=Math.sin((n+1)*1.65)*w*.018*m[4];return{x:p.x+ux*L+rx*(side+sweep+wave),y:p.y+uy*L+ry*(side+sweep+wave)}});
    const dark=c.map(v=>Math.min(115,Math.max(4,v*.42))),lite=c.map(v=>Math.min(210,Math.max(18,v*.92))),interp=(arr,t)=>{const x=Math.max(0,Math.min(1,t))*(arr.length-1),i=Math.min(arr.length-2,Math.floor(x)),u=x-i,A=arr[i],B=arr[i+1];return{x:A.x+(B.x-A.x)*u,y:A.y+(B.y-A.y)*u}};
    ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
    // Soft root shadow anchors the virtual hair without drawing a hard cap.
    ctx.save();ctx.filter=`blur(${Math.max(1,h*.006)}px)`;ctx.strokeStyle=rgbStr(dark,.24);ctx.lineWidth=Math.max(5,h*.025);ctx.beginPath();roots.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();ctx.restore();
    const strands=s.id==='buzz'?70:130;
    for(let i=0;i<strands;i++){
      const t=(i+.35)/strands,A=interp(roots,t),B=interp(outer,t),z=1-Math.abs(t-.5)*2,j=(rnd(i,s.id.length)-.5)*w*(.006+.020*m[4]),wave=Math.sin((i+1)*1.37)*w*.020*m[4],bend={x:(A.x+B.x)/2+rx*((t-.5)*w*.045+wave+j+m[6]*w*.08*z),y:(A.y+B.y)/2+ry*((t-.5)*w*.045+wave+j+m[6]*w*.08*z)};
      ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.quadraticCurveTo(bend.x,bend.y,B.x+rx*j,B.y+ry*j);ctx.strokeStyle=rgbStr(i%7===0?lite:dark,(i%7===0?.24:.28)+m[4]*.07);ctx.lineWidth=Math.max(.65,h*(i%9===0?.0032:.0017));ctx.stroke();
    }
    if(s.id==='crop')for(let i=0;i<15;i++){const A=interp(roots,.30+(i/14)*.40),L=h*(.032+.020*rnd(i,3));ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.quadraticCurveTo(A.x+rx*(i-7)*h*.0015,A.y+dy*L*.45,A.x+dx*L,A.y+dy*L);ctx.strokeStyle=rgbStr(dark,.38);ctx.lineWidth=Math.max(.7,h*.0021);ctx.stroke()}
    if(m[2]>0){[-1,1].forEach(side=>{const R=side<0?roots[0]:roots[roots.length-1],J=P(side<0?172:397),ox=rx*side,oy=ry*side,len=h*m[2]*.60,flare=w*m[5],count=m[4]>.7?58:42;for(let i=0;i<count;i++){const t=(i+.5)/count,off=(t-.5)*flare*.95,start={x:R.x+ox*off*.12,y:R.y+oy*off*.12},end={x:J.x+ox*(flare+off*.38)+dx*len*(.78+.16*t),y:J.y+oy*(flare+off*.38)+dy*len*(.78+.16*t)},wig=Math.sin((i+1)*1.61)*flare*.22*m[4],bend={x:(start.x+end.x)/2+ox*(off*.45+wig),y:(start.y+end.y)/2+oy*(off*.45+wig)};ctx.beginPath();ctx.moveTo(start.x,start.y);ctx.quadraticCurveTo(bend.x,bend.y,end.x,end.y);ctx.strokeStyle=rgbStr(i%8===0?lite:dark,(i%8===0?.20:.27)+m[4]*.06);ctx.lineWidth=Math.max(.65,h*(i%10===0?.0030:.0017));ctx.stroke()}})}
    if(m[4]>.62){ctx.strokeStyle=rgbStr(lite,.22);ctx.lineWidth=Math.max(.65,h*.0018);for(let i=0;i<28;i++){const A=interp(outer,(i+.5)/28),R=h*(.008+.011*m[4])*(.8+rnd(i,7)*.5);ctx.beginPath();ctx.arc(A.x,A.y,R,.1*Math.PI,1.55*Math.PI);ctx.stroke()}}
    ctx.restore();
  };
  r.drawHair.__v5=true;r.drawHair.__v5c=true;try{drawHair=r.drawHair}catch{}return true;
}
r.ChiselTryonHairV5={install};if(typeof window!=='undefined')window.addEventListener('load',()=>setTimeout(install,400),{once:true});
})(typeof globalThis!=='undefined'?globalThis:this);
