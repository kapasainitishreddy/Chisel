(function attachChiselPrecisionProtocol(root, factory) {
  const stats = root && root.ChiselPrecisionStats ? root.ChiselPrecisionStats : (typeof require === 'function' ? require('./chisel-precision-stats.js') : null);
  const api = factory(stats); if (typeof module === 'object' && module.exports) module.exports = api; if (root) root.ChiselPrecisionProtocol = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createPrecisionProtocol(stats) {
  'use strict'; if (!stats) throw new Error('ChiselPrecisionStats is required.');
  const { clamp, robustConsensus, linearScore } = stats;
  const PROTOCOLS = {
    face: { minimumFrames: 7, weights: { brightness:.12, sharpness:.15, fill:.12, roll:.1, yaw:.12, pitch:.08, expression:.12, model:.12, occlusion:.07 }, hard: { brightness:[45,235], sharpness:35, fill:[.24,.82], roll:8, yaw:10, pitch:10, expression:.35, model:.72, occlusion:.2 } },
    expressionOpen: { minimumFrames: 7, weights: { brightness:.12, sharpness:.15, fill:.12, roll:.1, yaw:.12, pitch:.08, expression:.12, model:.12, occlusion:.07 }, hard: { brightness:[45,235], sharpness:35, fill:[.24,.82], roll:8, yaw:10, pitch:10, expression:[.1,.85], model:.72, occlusion:.2 } },
    skin: { minimumFrames: 7, weights: { brightness:.18, sharpness:.14, fill:.1, roll:.08, yaw:.08, pitch:.06, expression:.08, model:.1, occlusion:.08, glare:.1 }, hard: { brightness:[60,220], sharpness:45, fill:[.28,.78], roll:6, yaw:8, pitch:8, expression:.3, model:.78, occlusion:.15, glare:.18 } },
    bodyFront: { minimumFrames: 3, weights: { brightness:.12, sharpness:.12, fill:.13, tilt:.13, model:.16, mask:.18, limbs:.1, occlusion:.06 }, hard: { brightness:[45,235], sharpness:25, fill:[.46,.96], tilt:8, model:.72, mask:.68, limbs:.75, occlusion:.18 } },
    bodySide: { minimumFrames: 3, weights: { brightness:.12, sharpness:.12, fill:.13, tilt:.1, model:.17, mask:.2, limbs:.08, occlusion:.08 }, hard: { brightness:[45,235], sharpness:25, fill:[.46,.96], tilt:10, model:.72, mask:.68, limbs:.7, occlusion:.2 } }
  };
  function scoreFrame(frame = {}, kind = 'face') {
    const protocol = PROTOCOLS[kind] || PROTOCOLS.face, q = frame.quality || frame, scores = {};
    scores.brightness = linearScore(q.brightness, kind === 'skin' ? 95 : 80, kind === 'skin' ? 175 : 195, protocol.hard.brightness[0], protocol.hard.brightness[1]);
    scores.sharpness = linearScore(q.sharpness, kind.startsWith('body') ? 65 : 90, 10000, protocol.hard.sharpness, 10000);
    scores.fill = linearScore(q.fill, kind.startsWith('body') ? .62 : .38, kind.startsWith('body') ? .86 : .68, protocol.hard.fill[0], protocol.hard.fill[1]);
    if (kind.startsWith('body')) {
      scores.tilt = 1 - clamp(Math.abs(Number(q.tiltDeg) || 0) / protocol.hard.tilt, 0, 1); scores.model = linearScore(q.modelConfidence,.9,1,protocol.hard.model,1.01); scores.mask = linearScore(q.maskConfidence,.88,1,protocol.hard.mask,1.01); scores.limbs = linearScore(q.limbVisibility,.92,1,protocol.hard.limbs,1.01); scores.occlusion = 1 - clamp((Number(q.occlusion)||0)/protocol.hard.occlusion,0,1);
    } else {
      scores.roll = 1-clamp(Math.abs(Number(q.rollDeg)||0)/protocol.hard.roll,0,1); scores.yaw = 1-clamp(Math.abs(Number(q.yawDeg)||0)/protocol.hard.yaw,0,1); scores.pitch = 1-clamp(Math.abs(Number(q.pitchDeg)||0)/protocol.hard.pitch,0,1);
      scores.expression = kind === 'expressionOpen' ? linearScore(q.expression,.22,.6,protocol.hard.expression[0],protocol.hard.expression[1]) : 1-clamp((Number(q.expression)||0)/protocol.hard.expression,0,1);
      scores.model = linearScore(q.modelConfidence,.92,1,protocol.hard.model,1.01); scores.occlusion = 1-clamp((Number(q.occlusion)||0)/protocol.hard.occlusion,0,1); if (kind === 'skin') scores.glare = 1-clamp((Number(q.glare)||0)/protocol.hard.glare,0,1);
    }
    const score = Math.round(Object.entries(protocol.weights).reduce((sum,[key,weight]) => sum + (scores[key] == null ? 0 : scores[key]) * weight, 0) * 100), critical = [];
    if (q.brightness < protocol.hard.brightness[0] || q.brightness > protocol.hard.brightness[1]) critical.push('lighting'); if (q.sharpness < protocol.hard.sharpness) critical.push('blur'); if (q.fill < protocol.hard.fill[0] || q.fill > protocol.hard.fill[1]) critical.push('distance');
    if (kind.startsWith('body')) { if (Math.abs(Number(q.tiltDeg)||0)>protocol.hard.tilt) critical.push('pose'); if (q.modelConfidence<protocol.hard.model) critical.push('pose-confidence'); if (q.maskConfidence<protocol.hard.mask) critical.push('segmentation'); if (q.limbVisibility<protocol.hard.limbs) critical.push('limbs'); }
    else { if (Math.abs(Number(q.rollDeg)||0)>protocol.hard.roll || Math.abs(Number(q.yawDeg)||0)>protocol.hard.yaw || Math.abs(Number(q.pitchDeg)||0)>protocol.hard.pitch) critical.push('head-angle'); if (kind === 'expressionOpen') { if ((Number(q.expression)||0)<protocol.hard.expression[0] || (Number(q.expression)||0)>protocol.hard.expression[1]) critical.push('mouth-opening'); } else if ((Number(q.expression)||0)>protocol.hard.expression) critical.push('expression'); if (q.modelConfidence<protocol.hard.model) critical.push('face-confidence'); if (kind === 'skin' && (Number(q.glare)||0)>protocol.hard.glare) critical.push('glare'); }
    if ((Number(q.occlusion)||0)>protocol.hard.occlusion) critical.push('occlusion'); return { score, accepted: critical.length === 0 && score >= 78, critical, components:scores };
  }
  function evaluateProtocol(frames = [], kind = 'face') {
    const protocol = PROTOCOLS[kind] || PROTOCOLS.face, evaluated = frames.map((frame,index) => ({ index, frame, ...scoreFrame(frame,kind) })), accepted = evaluated.filter((item) => item.accepted);
    const minForStats = Math.max(2,Math.min(protocol.minimumFrames,accepted.length)); const scores = robustConsensus(accepted.map((item)=>item.score),{ minimum:minForStats,maxRelativeSpread:.12,digits:1 });
    const brightness = robustConsensus(accepted.map((item)=>item.frame.quality.brightness),{ minimum:minForStats,maxRelativeSpread:kind==='skin'?.055:.09,digits:1 }); const passRate = frames.length ? accepted.length/frames.length : 0;
    const stability = brightness.valid ? clamp(1-brightness.relativeSpread/(kind==='skin'?.055:.09),0,1) : 0; const protocolScore = Math.round(clamp((scores.valid?Number(scores.value):0)*.72 + passRate*18 + stability*10,0,100)); const reasons=[];
    if (frames.length<protocol.minimumFrames) reasons.push(`Capture at least ${protocol.minimumFrames} usable frames.`); if (accepted.length<protocol.minimumFrames) reasons.push(`Only ${accepted.length}/${protocol.minimumFrames} frames passed the strict quality gates.`); if (!brightness.valid) reasons.push('Lighting changed too much between frames.');
    const counts={}; evaluated.forEach((item)=>item.critical.forEach((reason)=>{counts[reason]=(counts[reason]||0)+1;})); Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,3).forEach(([reason,count])=>{if(count>=Math.max(2,Math.ceil(frames.length*.25))) reasons.push(`${reason.replace(/-/g,' ')} failed in ${count} frames.`);});
    return { kind, accepted: accepted.length>=protocol.minimumFrames && protocolScore>=90 && brightness.valid, score:protocolScore, minimumFrames:protocol.minimumFrames, totalFrames:frames.length, acceptedFrames:accepted.length, rejectedFrames:frames.length-accepted.length, reasons:[...new Set(reasons)], evaluated, brightness };
  }
  return { PROTOCOLS, scoreFrame, evaluateProtocol };
});
