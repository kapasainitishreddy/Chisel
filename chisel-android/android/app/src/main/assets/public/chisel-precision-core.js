(function attachChiselPrecisionCore(root, factory) {
  const stats = root && root.ChiselPrecisionStats ? root.ChiselPrecisionStats : (typeof require === 'function' ? require('./chisel-precision-stats.js') : null);
  const protocol = root && root.ChiselPrecisionProtocol ? root.ChiselPrecisionProtocol : (typeof require === 'function' ? require('./chisel-precision-protocol.js') : null);
  const api = factory(stats, protocol); if (typeof module === 'object' && module.exports) module.exports = api; if (root) root.ChiselPrecisionCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createPrecisionCore(stats, protocol) {
  'use strict'; if (!stats || !protocol) throw new Error('Precision stats and protocol are required.');
  const { clamp, round, finite, robustConsensus, rgbToLab, deltaE76, ellipseCircumference, compatibleSetup, compareTrackedMetric, precisionLabel } = stats;
  const { PROTOCOLS, scoreFrame, evaluateProtocol } = protocol;
  const metricConsensus = (samples, metric, options={}) => robustConsensus(samples.map((sample)=>sample.metrics&&sample.metrics[metric]),options);

  function fuseFaceMeasurements(samples=[]) {
    const gate=evaluateProtocol(samples,'face'), usable=gate.evaluated.filter((i)=>i.accepted).map((i)=>i.frame);
    const defs={cheekboneWidth:{maxRelativeSpread:.018,digits:4},jawWidth:{maxRelativeSpread:.02,digits:4},gonialAngle:{maxRelativeSpread:.018,digits:1,absoluteFloor:.18},lipFullness:{maxRelativeSpread:.03,digits:4},eyeSpacing:{maxRelativeSpread:.018,digits:4},canthalTilt:{maxRelativeSpread:.08,digits:2,absoluteFloor:.1},browArch:{maxRelativeSpread:.045,digits:4},bloatFullness:{maxRelativeSpread:.016,digits:5},mouthOpening:{maxRelativeSpread:.08,digits:4,absoluteFloor:.005}};
    const metrics={}; Object.entries(defs).forEach(([name,options])=>{metrics[name]=metricConsensus(usable,name,{minimum:5,...options});}); const required=['cheekboneWidth','jawWidth','gonialAngle','lipFullness','eyeSpacing','bloatFullness'];
    const stability=Math.round(required.reduce((sum,name)=>sum+(metrics[name].valid?clamp(1-metrics[name].relativeSpread/defs[name].maxRelativeSpread,0,1):0),0)/required.length*100); const score=Math.round(gate.score*.65+stability*.35);
    const reasons=[...gate.reasons]; required.forEach((name)=>{if(!metrics[name].valid)reasons.push(`${name.replace(/([A-Z])/g,' $1').toLowerCase()} varied too much between frames.`);});
    return {accepted:gate.accepted&&required.every((name)=>metrics[name].valid)&&score>=90,score,protocol:gate,metrics,reasons:[...new Set(reasons)]};
  }

  function fuseExpressionCalibration(neutralSamples=[],openSamples=[]) {
    const neutral=fuseFaceMeasurements(neutralSamples), gate=evaluateProtocol(openSamples,'expressionOpen'), open=gate.evaluated.filter((i)=>i.accepted).map((i)=>i.frame);
    const openMetrics={cheekboneWidth:metricConsensus(open,'cheekboneWidth',{minimum:5,maxRelativeSpread:.022,digits:4}),jawWidth:metricConsensus(open,'jawWidth',{minimum:5,maxRelativeSpread:.026,digits:4}),gonialAngle:metricConsensus(open,'gonialAngle',{minimum:5,maxRelativeSpread:.024,absoluteFloor:.2,digits:1}),mouthOpening:metricConsensus(open,'mouthOpening',{minimum:5,maxRelativeSpread:.08,absoluteFloor:.01,digits:4})};
    const stable=Object.values(openMetrics).every((x)=>x.valid), severity=clamp(((openMetrics.mouthOpening.value||0)-.08)/.42,0,1);
    const mix=(name,weight)=>{const observed=openMetrics[name],base=neutral.metrics[name];if(!observed||!observed.valid||!base||!base.valid)return{valid:false};const value=observed.value*(1-weight)+base.value*weight,ci95=Math.max(observed.ci95||0,base.ci95||0),digits=name==='gonialAngle'?1:4;return{valid:true,value:round(value,digits),ci95:round(ci95,digits),observed:observed.value,neutral:base.value};};
    const corrected={cheekboneWidth:mix('cheekboneWidth',.62+severity*.16),jawWidth:mix('jawWidth',.7+severity*.18),gonialAngle:mix('gonialAngle',.7+severity*.18)};
    const stability=stable?Math.round(Object.values(openMetrics).reduce((sum,item)=>sum+clamp(1-item.relativeSpread/.08,0,1),0)/4*100):0,score=Math.round(Math.min(neutral.score,gate.score)*.72+stability*.28),reasons=[...neutral.reasons,...gate.reasons];if(!stable)reasons.push('Open-mouth geometry varied too much between photos.');
    return{accepted:neutral.accepted&&gate.accepted&&stable&&Object.values(corrected).every((x)=>x.valid)&&score>=90,score,neutral,openProtocol:gate,openMetrics,corrected,expressionSeverity:round(severity,3),reasons:[...new Set(reasons)]};
  }

  function fuseSkinMeasurements(samples=[]) {
    const gate=evaluateProtocol(samples,'skin'),usable=gate.evaluated.filter((i)=>i.accepted).map((i)=>i.frame),skinLabs=usable.map((s)=>s.skin&&s.skin.lab).filter(Array.isArray),lipLabs=usable.map((s)=>s.skin&&s.skin.lipLab).filter(Array.isArray),neckLabs=usable.map((s)=>s.skin&&s.skin.neckLab).filter(Array.isArray);
    const coordinate=(list,index)=>robustConsensus(list.map((lab)=>lab[index]),{minimum:5,maxRelativeSpread:index===0?.035:.24,absoluteFloor:index===0?.2:.15,digits:2}); const skin=[0,1,2].map((i)=>coordinate(skinLabs,i)),lip=[0,1,2].map((i)=>coordinate(lipLabs,i)),neck=neckLabs.length>=5?[0,1,2].map((i)=>coordinate(neckLabs,i)):null;
    const center=skin.map((x)=>x.value),deltas=skinLabs.map((lab)=>deltaE76(lab,center)),delta=robustConsensus(deltas,{minimum:5,maxRelativeSpread:.8,absoluteFloor:.2,digits:2});
    const redness=robustConsensus(usable.map((s)=>s.skin&&s.skin.redness),{minimum:5,maxRelativeSpread:.12,absoluteFloor:.8,digits:1}),evenness=robustConsensus(usable.map((s)=>s.skin&&s.skin.evenness),{minimum:5,maxRelativeSpread:.1,absoluteFloor:.8,digits:1}),blemish=robustConsensus(usable.map((s)=>s.skin&&s.skin.blemish),{minimum:5,maxRelativeSpread:.18,absoluteFloor:1.2,digits:1});
    const neckRedness=robustConsensus(usable.map((s)=>s.skin&&s.skin.neckRedness),{minimum:5,maxRelativeSpread:.14,absoluteFloor:1,digits:1}),neckEvenness=robustConsensus(usable.map((s)=>s.skin&&s.skin.neckEvenness),{minimum:5,maxRelativeSpread:.12,absoluteFloor:1,digits:1});
    const colorStable=delta.valid&&delta.value<=3.2&&deltas.every((v)=>v<=6),required=skin.every((x)=>x.valid)&&lip.every((x)=>x.valid)&&redness.valid&&evenness.valid&&blemish.valid,stability=Math.round(clamp(100-(delta.value||20)*8,0,100)),score=Math.round(gate.score*.7+stability*.3),reasons=[...gate.reasons];
    if(!colorStable)reasons.push('Skin colour changed too much across the batch; use one light source and disable beauty filters.');if(!required)reasons.push('Redness, evenness or blemish readings were not repeatable enough.');
    return{accepted:gate.accepted&&colorStable&&required&&score>=90,score,protocol:gate,skinLab:center.map((v)=>round(v,2)),lipLab:lip.map((x)=>x.value),neckLab:neck?neck.map((x)=>x.value):null,maxDeltaE:deltas.length?round(Math.max(...deltas),2):null,medianDeltaE:delta.value,metrics:{redness,evenness,blemish,neckRedness,neckEvenness},reasons:[...new Set(reasons)]};
  }

  function fuseBodyMeasurements(frontSamples=[],sideSamples=[],calibration={}) {
    const frontGate=evaluateProtocol(frontSamples,'bodyFront'),sideGate=evaluateProtocol(sideSamples,'bodySide'),front=frontGate.evaluated.filter((i)=>i.accepted).map((i)=>i.frame),side=sideGate.evaluated.filter((i)=>i.accepted).map((i)=>i.frame);
    const frontDefs={shoulderWidth:{maxRelativeSpread:.025,digits:4},waistWidth:{maxRelativeSpread:.022,digits:4},hipWidth:{maxRelativeSpread:.022,digits:4},torsoTiltDeg:{maxRelativeSpread:.18,absoluteFloor:.18,digits:1}},sideDefs={waistDepth:{maxRelativeSpread:.03,digits:4},hipDepth:{maxRelativeSpread:.03,digits:4},neckAngle:{maxRelativeSpread:.045,digits:1,absoluteFloor:.18}},metrics={};
    Object.entries(frontDefs).forEach(([name,opt])=>{metrics[name]=metricConsensus(front,name,{minimum:3,...opt});});Object.entries(sideDefs).forEach(([name,opt])=>{metrics[name]=metricConsensus(side,name,{minimum:3,...opt});});const required=['shoulderWidth','waistWidth','hipWidth','waistDepth','hipDepth','neckAngle'],stable=required.every((name)=>metrics[name].valid);
    const waist=stable?ellipseCircumference(metrics.waistWidth.value,metrics.waistDepth.value):null,hip=stable?ellipseCircumference(metrics.hipWidth.value,metrics.hipDepth.value):null,low=stable?ellipseCircumference(Math.max(0,metrics.waistWidth.value-metrics.waistWidth.ci95),Math.max(0,metrics.waistDepth.value-metrics.waistDepth.ci95)):null,high=stable?ellipseCircumference(metrics.waistWidth.value+metrics.waistWidth.ci95,metrics.waistDepth.value+metrics.waistDepth.ci95):null;
    const ratios=stable?{waistToHip:round(waist/hip,4),shoulderToWaist:round(metrics.shoulderWidth.value/metrics.waistWidth.value,4),photoWaistPerimeter:round(waist,5),photoWaistPerimeterCi95:round(Math.abs(high-low)/2,5)}:{};let calibratedWaistCm=null;
    if(stable&&finite(calibration.baselineWaistCm)&&finite(calibration.baselinePhotoPerimeter)&&Number(calibration.baselinePhotoPerimeter)>0)calibratedWaistCm=round(Number(calibration.baselineWaistCm)*waist/Number(calibration.baselinePhotoPerimeter),1);
    const stability=stable?Math.round(required.reduce((sum,name)=>sum+clamp(1-metrics[name].relativeSpread/(frontDefs[name]||sideDefs[name]).maxRelativeSpread,0,1),0)/required.length*100):0,score=Math.round(Math.min(frontGate.score,sideGate.score)*.62+stability*.38),reasons=[...frontGate.reasons,...sideGate.reasons];required.forEach((name)=>{if(!metrics[name].valid)reasons.push(`${name.replace(/([A-Z])/g,' $1').toLowerCase()} varied too much between photos.`);});
    return{accepted:frontGate.accepted&&sideGate.accepted&&stable&&score>=90,score,frontProtocol:frontGate,sideProtocol:sideGate,metrics,ratios,calibratedWaistCm,reasons:[...new Set(reasons)]};
  }
  return {...stats,...protocol,fuseFaceMeasurements,fuseExpressionCalibration,fuseSkinMeasurements,fuseBodyMeasurements,rgbToLab,deltaE76,compatibleSetup,compareTrackedMetric,precisionLabel};
});
