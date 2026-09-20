(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ChiselCaptureQuality=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
// Engineering rejection heuristics, not calibrated probabilities or clinical accuracy.
function outputSize(width,height,maxEdge=1536){
 if(![width,height,maxEdge].every(n=>Number.isInteger(n)&&n>0&&n<=32768))throw new RangeError('Invalid image dimensions');
 const scale=Math.min(1,maxEdge/Math.max(width,height));
 return{width:Math.max(1,Math.round(width*scale)),height:Math.max(1,Math.round(height*scale))};
}
function assessFace(points,width,height,{hair=false}={}){
 const fail=message=>({accepted:false,reasons:[message]});
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)return fail('Camera is not ready.');
 const ids=[1,10,33,152,234,263,454];
 if(!Array.isArray(points)||!ids.every(i=>points[i]&&['x','y'].every(k=>Number.isFinite(points[i][k])&&points[i][k]>=0&&points[i][k]<=1)))return fail('Keep one complete face visible.');
 const left=Math.min(points[234].x,points[454].x),right=Math.max(points[234].x,points[454].x),top=points[10].y,bottom=points[152].y;
 const fw=(right-left)*width,fh=(bottom-top)*height,eyes=Math.abs(points[263].x-points[33].x)*width;
 if(fw<(hair?240:160)||fh<180||eyes<40)return fail('Move closer or choose a higher-resolution photo.');
 const roll=Math.abs(Math.atan2((points[263].y-points[33].y)*height,(points[263].x-points[33].x)*width)*180/Math.PI);
 const yawProxy=Math.abs(points[1].x-(left+right)/2)/(right-left);
 if(roll>8||yawProxy>.10)return fail('Face straight ahead and keep your eyes level.');
 if(left<.03||right>.97||top<.03||bottom>.97)return fail('Keep the whole face inside the frame.');
 if(hair&&(top-(bottom-top)*.22<.01||left<.08||right>.92))return fail('Move back slightly to leave space around your hair.');
 return{accepted:true,reasons:[],bounds:{left,right,top,bottom},rollDeg:roll,yawProxy};
}
function assessPixels(image){
 const {width,height,data}=image||{};
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<3||height<3||width*height>16000000||!data||data.length!==width*height*4)throw new TypeError('A bounded RGBA image is required');
 const w=Math.min(128,width),h=Math.min(128,height),luma=new Float64Array(w*h);
 let clipped=0,usable=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const p=(Math.min(height-1,Math.floor((y+.5)*height/h))*width+Math.min(width-1,Math.floor((x+.5)*width/w)))*4;
  const [r,g,b,a]=[data[p],data[p+1],data[p+2],data[p+3]];
  if(![r,g,b,a].every(n=>Number.isFinite(n)&&n>=0&&n<=255))throw new TypeError('Invalid pixel value');
  luma[y*w+x]=.2126*r+.7152*g+.0722*b;
  if(a<200)continue;usable++;if(Math.max(r,g,b)<=2||Math.max(r,g,b)>=253)clipped++;
 }
 let sum=0,square=0,n=0;
 for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
  const i=y*w+x,v=4*luma[i]-luma[i-1]-luma[i+1]-luma[i-w]-luma[i+w];sum+=v;square+=v*v;n++;
 }
 const variance=n?Math.max(0,square/n-(sum/n)**2):0,clipRate=usable?clipped/usable:1,reasons=[];
 if(usable/(w*h)<.95)reasons.push('Use an opaque, complete face photo.');
 if(clipRate>.20)reasons.push('Avoid clipped highlights and blocked shadows. Retake in even light.');
 if(variance<8)reasons.push('The face image lacks usable detail. Clean the lens and wait for focus.');
 return{accepted:reasons.length===0,reasons,focusVariance:variance,clippedFraction:clipRate,qualityScore:Math.round(Math.max(0,Math.min(100,(1-clipRate)*100,variance<8?0:100))),methodVersion:'capture-checks-v1'};
}
return{outputSize,assessFace,assessPixels};
});
