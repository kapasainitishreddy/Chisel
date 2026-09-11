(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.ChiselSkinAppearanceCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(value,min=0,max=100)=>Math.max(min,Math.min(max,Number(value)||0));
const round=value=>Math.round(clamp(value));
const METRIC_DEFS=Object.freeze({
  redness:{label:'Redness appearance',description:'Relative visible red-color signal within the sampled facial skin.'},
  shine:{label:'Visible shine',description:'Bright low-saturation reflection appearance under the current lighting.'},
  texture:{label:'Texture variation',description:'Local light-and-dark variation across the sampled skin surface.'},
  pores:{label:'Pore visibility proxy',description:'Small dark local-contrast features that may look pore-like in this photo.'},
  blemishContrast:{label:'Blemish-like contrast',description:'Localized visible contrast differences from nearby sampled skin.'},
  pigmentUnevenness:{label:'Pigment appearance unevenness',description:'Variation in visible tone and brown-color signal across the sampled region.'}
});
function validateInput(input){
  if(!input||!input.data||!Number.isInteger(input.width)||!Number.isInteger(input.height)||input.width<2||input.height<2)throw new TypeError('Valid RGBA image data is required');
  if(input.data.length<input.width*input.height*4)throw new RangeError('Image data is shorter than width × height × 4');
}
function luminance(r,g,b){return .2126*r+.7152*g+.0722*b;}
function saturation(r,g,b){const hi=Math.max(r,g,b),lo=Math.min(r,g,b);return hi?((hi-lo)/hi):0;}
function mean(values){return values.length?values.reduce((a,b)=>a+b,0)/values.length:0;}
function stdev(values,avg=mean(values)){if(!values.length)return 0;return Math.sqrt(values.reduce((sum,v)=>sum+(v-avg)*(v-avg),0)/values.length);}
function analyzePixelSet(input){
  validateInput(input);
  const {data,width,height}=input;
  const lums=[],reds=[],browns=[],sats=[];
  let brightLowSat=0,clipped=0,samples=0;
  const step=Math.max(1,Math.floor(Math.sqrt((width*height)/9000)));
  for(let y=0;y<height;y+=step){
    for(let x=0;x<width;x+=step){
      const i=(y*width+x)*4;if(data[i+3]<64)continue;
      const r=data[i],g=data[i+1],b=data[i+2],lum=luminance(r,g,b),sat=saturation(r,g,b);
      lums.push(lum);sats.push(sat);reds.push(r-(g+b)/2);browns.push((r+b*.15)-g*.55-b*.28);
      if(lum>215&&sat<.12)brightLowSat+=1;
      // Reject actual channel clipping, not a darker natural complexion.
      if(Math.max(r,g,b)<=2||Math.max(r,g,b)>=253)clipped+=1;
      samples+=1;
    }
  }
  if(!samples)return{redness:0,shine:0,texture:0,pores:0,blemishContrast:0,pigmentUnevenness:0,confidence:0,valid:false,sampleCount:0};
  const avgLum=mean(lums),avgRed=mean(reds),avgBrown=mean(browns),lumSd=stdev(lums,avgLum),redSd=stdev(reds,avgRed),brownSd=stdev(browns,avgBrown);
  let adjacentDiff=0,adjacentN=0,poreLike=0,contrastLike=0;
  for(let y=0;y<height;y+=step){
    for(let x=0;x<width;x+=step){
      const i=(y*width+x)*4;if(data[i+3]<64)continue;
      const r=data[i],g=data[i+1],b=data[i+2],lum=luminance(r,g,b),red=r-(g+b)/2,brown=(r+b*.15)-g*.55-b*.28;
      if(x+step<width){const j=(y*width+(x+step))*4;if(data[j+3]>=64){adjacentDiff+=Math.abs(lum-luminance(data[j],data[j+1],data[j+2]));adjacentN+=1;}}
      if(y+step<height){const j=((y+step)*width+x)*4;if(data[j+3]>=64){adjacentDiff+=Math.abs(lum-luminance(data[j],data[j+1],data[j+2]));adjacentN+=1;}}
      if(lum<avgLum-16&&Math.abs(red-avgRed)<redSd*1.5+8)poreLike+=1;
      if(Math.abs(lum-avgLum)>lumSd*1.25+8||Math.abs(red-avgRed)>redSd*1.25+7||Math.abs(brown-avgBrown)>brownSd*1.35+9)contrastLike+=1;
    }
  }
  const edgeMean=adjacentN?adjacentDiff/adjacentN:0;
  const clipRate=clipped/samples;
  const sizeConfidence=clamp((samples/450)*100);
  const exposureConfidence=clamp(100-clipRate*240);
  return{
    redness:round(((avgRed-8)/58)*100),
    shine:round((brightLowSat/samples)*420),
    texture:round((edgeMean/25)*76+(lumSd/40)*24),
    pores:round((poreLike/samples)*230+(edgeMean/34)*24),
    blemishContrast:round((contrastLike/samples)*155+(redSd/34)*22+(lumSd/45)*18),
    pigmentUnevenness:round((brownSd/34)*56+(lumSd/42)*44),
    confidence:round(Math.min(sizeConfidence,exposureConfidence)),
    valid:samples>=64&&clipRate<.25&&Math.min(sizeConfidence,exposureConfidence)>=42,
    clippedFraction:clipRate,
    methodVersion:'skin-appearance-quality-v2',
    sampleCount:samples
  };
}
function aggregateRegions(regionResults){
  const regions={...(regionResults||{})};
  const entries=Object.entries(regions).filter(([,result])=>result&&result.valid!==false&&Number.isFinite(result.confidence)&&result.confidence>=42&&Number(result.sampleCount)>0&&Object.keys(METRIC_DEFS).every(key=>Number.isFinite(result[key])));
  const out={regions};
  const keys=Object.keys(METRIC_DEFS);
  let weightTotal=0,confidenceTotal=0;
  for(const [,result] of entries){const weight=Math.max(1,Number(result.sampleCount)||1)*Math.max(.15,(Number(result.confidence)||0)/100);weightTotal+=weight;confidenceTotal+=(Number(result.confidence)||0)*weight;}
  for(const key of keys){let total=0;for(const [,result] of entries){const weight=Math.max(1,Number(result.sampleCount)||1)*Math.max(.15,(Number(result.confidence)||0)/100);total+=(Number(result[key])||0)*weight;}out[key]=round(weightTotal?total/weightTotal:0);}
  out.confidence=round(weightTotal?confidenceTotal/weightTotal:0);
  out.valid=entries.length>=3;
  out.excludedRegions=Object.keys(regions).filter(key=>!entries.some(([id])=>id===key));
  if(!out.valid)out.confidence=0;
  out.methodVersion='skin-appearance-quality-v2';
  out.sampleCount=entries.reduce((sum,[,result])=>sum+(Number(result.sampleCount)||0),0);
  return out;
}
function signalBand(value){const n=clamp(value);if(n<35)return{key:'low',label:'Low signal'};if(n<65)return{key:'moderate',label:'Moderate signal'};return{key:'high',label:'Higher signal'};}
function buildAppearanceSummary(metrics){
  const safe=metrics||{};
  const attention=(safe.valid===false?[]:Object.keys(METRIC_DEFS).filter(key=>Number.isFinite(safe[key]))).map(key=>({key,label:METRIC_DEFS[key].label,value:round(safe[key]),band:signalBand(safe[key]),description:METRIC_DEFS[key].description})).sort((a,b)=>b.value-a.value).slice(0,3);
  const confidence=round(safe.confidence);
  return{
    attention,
    confidence,
    headline:confidence>=75?'Photo sampling checks passed':confidence>=50?'Usable with caution':'Retake for a cleaner comparison',
    compareRule:'Compare again in matched lighting, camera distance, angle and expression. Look for repeated trends rather than one-photo changes.',
    disclaimer:'Cosmetic appearance signals only — not a diagnosis, disease screen, or measurement of skin health.'
  };
}
return{METRIC_DEFS,analyzePixelSet,aggregateRegions,buildAppearanceSummary,signalBand};
});