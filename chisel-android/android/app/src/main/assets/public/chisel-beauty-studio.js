(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ChiselBeautyStudio = api;
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const boot = () => { try { api.bootstrapBrowser(); } catch (err) { console.warn('Chisel Beauty Studio', err); } };
    if (document.readyState === 'complete') setTimeout(boot, 0);
    else window.addEventListener('load', boot, { once: true });
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const WOMEN_HAIR_LIBRARY = [
    { id:'pixie', name:'Soft pixie', length:'short', textures:['straight','wavy','curly'], maintenance:'low', shapes:['oval','heart','diamond'], overlay:{top:.30,side:.12,front:.30,jitter:.025} },
    { id:'bixie', name:'Bixie', length:'short', textures:['straight','wavy'], maintenance:'medium', shapes:['oval','heart','square'], overlay:{top:.33,side:.15,front:.31,jitter:.03,fall:.25,flare:.10} },
    { id:'frenchbob', name:'French bob', length:'short', textures:['straight','wavy','curly'], maintenance:'medium', shapes:['oval','oblong','heart','diamond'], fringe:true, overlay:{top:.32,side:.18,front:.22,jitter:.025,fall:.50,flare:.17} },
    { id:'bob', name:'Classic bob', length:'short', textures:['straight','wavy'], maintenance:'medium', shapes:['oval','square','heart','diamond'], overlay:{top:.31,side:.18,front:.32,jitter:.02,fall:.55,flare:.17} },
    { id:'lob', name:'Long bob', length:'medium', textures:['straight','wavy','curly'], maintenance:'low', shapes:['oval','round','square','heart','diamond'], overlay:{top:.32,side:.18,front:.33,jitter:.03,fall:.82,flare:.17} },
    { id:'butterfly', name:'Butterfly layers', length:'long', textures:['straight','wavy','curly'], maintenance:'medium', shapes:['oval','round','square','heart','diamond','triangle'], overlay:{top:.42,side:.21,front:.39,jitter:.05,fall:1.08,flare:.24} },
    { id:'curtain', name:'Curtain bangs', length:'long', textures:['straight','wavy','curly'], maintenance:'medium', shapes:['oval','round','square','heart','oblong'], fringe:true, overlay:{top:.37,side:.19,front:.18,jitter:.035,fall:1.04,flare:.21} },
    { id:'layers', name:'Long layers', length:'long', textures:['straight','wavy','curly','coily'], maintenance:'low', shapes:['oval','round','square','heart','diamond','triangle'], overlay:{top:.37,side:.19,front:.34,jitter:.035,fall:1.18,flare:.19} },
    { id:'sleeklong', name:'Sleek long', length:'long', textures:['straight'], maintenance:'medium', shapes:['oval','round','square','heart','diamond'], overlay:{top:.31,side:.14,front:.28,jitter:.012,fall:1.26,flare:.11} },
    { id:'waves', name:'Soft waves', length:'long', textures:['wavy','straight'], maintenance:'low', shapes:['oval','round','square','heart','oblong','diamond'], overlay:{top:.43,side:.22,front:.39,jitter:.075,fall:1.10,flare:.25} },
    { id:'curls', name:'Defined curls', length:'medium', textures:['curly'], maintenance:'medium', shapes:['oval','round','square','oblong','heart','diamond'], overlay:{top:.48,side:.26,front:.44,jitter:.115,fall:.90,flare:.27} },
    { id:'coils', name:'Natural coils', length:'medium', textures:['coily'], maintenance:'medium', shapes:['oval','round','square','heart','diamond','triangle'], overlay:{top:.52,side:.29,front:.47,jitter:.14,fall:.82,flare:.31} },
    { id:'shag', name:'Textured shag', length:'medium', textures:['wavy','curly','straight'], maintenance:'low', shapes:['oval','oblong','heart','diamond'], fringe:true, overlay:{top:.43,side:.23,front:.29,jitter:.09,fall:.74,flare:.26} },
    { id:'wolf', name:'Soft wolf cut', length:'medium', textures:['wavy','curly','straight'], maintenance:'medium', shapes:['oval','round','heart','diamond'], fringe:true, overlay:{top:.45,side:.23,front:.30,jitter:.10,fall:.76,flare:.25} },
    { id:'braids', name:'Long braids', length:'long', textures:['straight','wavy','curly','coily'], maintenance:'high', shapes:['oval','round','square','heart','diamond','triangle'], overlay:{top:.35,side:.15,front:.29,jitter:.012,fall:1.30,flare:.10}, localApprox:true },
    { id:'pony', name:'High ponytail', length:'long', textures:['straight','wavy','curly','coily'], maintenance:'medium', shapes:['oval','round','square','heart'], overlay:{top:.48,side:.15,front:.35,jitter:.025,fall:.74,flare:.12}, localApprox:true },
    { id:'bun', name:'Sleek bun', length:'medium', textures:['straight','wavy','curly','coily'], maintenance:'medium', shapes:['oval','round','square','heart','diamond'], overlay:{top:.56,side:.14,front:.39,jitter:.018}, localApprox:true },
    { id:'updo', name:'Soft updo', length:'medium', textures:['straight','wavy','curly','coily'], maintenance:'high', shapes:['oval','round','square','heart','diamond'], overlay:{top:.55,side:.17,front:.42,jitter:.035}, localApprox:true }
  ];

  const BLUSH_LOOKS = [
    { id:'peachlift', name:'Peach lift', blush:[232,150,118], placement:'lifted', undertones:['Warm','Neutral','Olive'], vibes:['natural','everyday'] },
    { id:'roseapples', name:'Rose apples', blush:[221,132,151], placement:'apples', undertones:['Cool','Neutral'], vibes:['natural','romantic'] },
    { id:'sunkissed', name:'Sun-kissed', blush:[224,132,105], placement:'sunkissed', undertones:['Warm','Neutral','Olive'], vibes:['everyday','soft-glam'] },
    { id:'drapedrose', name:'Draped rose', blush:[207,111,137], placement:'draped', undertones:['Cool','Neutral','Olive'], vibes:['soft-glam','evening'] },
    { id:'berrysculpt', name:'Berry sculpt', blush:[176,82,112], placement:'sculpt', undertones:['Cool','Neutral','Olive'], vibes:['soft-glam','evening'] },
    { id:'apricotveil', name:'Apricot veil', blush:[236,164,124], placement:'horizontal', undertones:['Warm','Neutral'], vibes:['natural','everyday'] },
    { id:'coralbalance', name:'Soft coral balance', blush:[226,144,126], placement:'low-lift', undertones:['Warm','Neutral','Olive'], vibes:['natural','everyday'] }
  ];

  const DEFAULT_PREFS = Object.freeze({ texture:'any', length:'any', maintenance:'any', fringe:'either' });
  const BASE_SHAPE_BLUSH = Object.freeze({ round:'lifted', oblong:'horizontal', square:'apples', heart:'low-lift', diamond:'apples', triangle:'lifted', oval:'lifted' });

  function normalizePrefs(prefs) {
    const p = Object.assign({}, DEFAULT_PREFS, prefs || {});
    if (!['any','straight','wavy','curly','coily'].includes(p.texture)) p.texture='any';
    if (!['any','short','medium','long'].includes(p.length)) p.length='any';
    if (!['any','low','medium','high'].includes(p.maintenance)) p.maintenance='any';
    if (!['either','yes','no'].includes(p.fringe)) p.fringe='either';
    return p;
  }

  function recommendWomenHair(faceShape, prefs, limit = 6) {
    const p = normalizePrefs(prefs);
    const shape = String(faceShape || 'oval').toLowerCase();
    return WOMEN_HAIR_LIBRARY.map((style, index) => {
      let score = 0;
      if (style.shapes.includes(shape)) score += 6;
      if (p.texture === 'any' || style.textures.includes(p.texture)) score += p.texture === 'any' ? 1 : 4; else score -= 4;
      if (p.length === 'any' || style.length === p.length) score += p.length === 'any' ? 1 : 3; else score -= 2;
      if (p.maintenance === 'any' || style.maintenance === p.maintenance) score += p.maintenance === 'any' ? 1 : 2; else if (p.maintenance === 'low' && style.maintenance === 'high') score -= 3;
      if (p.fringe === 'yes') score += style.fringe ? 3 : -2;
      if (p.fringe === 'no' && style.fringe) score -= 2;
      if (style.localApprox) score -= 0.25;
      return { id:style.id, name:style.name, score, style, index };
    }).sort((a,b)=>b.score-a.score || a.index-b.index).slice(0, Math.max(1, limit));
  }

  function blushPlacementFor(faceShape, vibe) {
    const shape = String(faceShape || 'oval').toLowerCase();
    const mood = String(vibe || 'everyday').toLowerCase();
    if (mood === 'evening') return shape === 'oblong' ? 'horizontal' : 'draped';
    if (mood === 'soft-glam') return shape === 'square' ? 'draped' : 'sculpt';
    if (mood === 'romantic') return 'apples';
    return BASE_SHAPE_BLUSH[shape] || 'lifted';
  }

  function normalizeUndertone(value) {
    const v = String(value || 'Neutral').toLowerCase();
    if (v.includes('warm')) return 'Warm';
    if (v.includes('cool')) return 'Cool';
    if (v.includes('olive')) return 'Olive';
    return 'Neutral';
  }

  function pickBlush(undertone, faceShape, vibe) {
    const u = normalizeUndertone(undertone), placement = blushPlacementFor(faceShape, vibe);
    const candidates = BLUSH_LOOKS.filter(x=>x.undertones.includes(u));
    return candidates.find(x=>x.placement === placement) || candidates.find(x=>x.vibes.includes(String(vibe || '').toLowerCase())) || candidates[0] || BLUSH_LOOKS[0];
  }

  function makeupGuide(profile) {
    const data = profile || {}, undertone = normalizeUndertone(data.undertone), shape = String(data.faceShape || 'oval').toLowerCase(), vibe = String(data.vibe || 'everyday').toLowerCase(), blush = pickBlush(undertone, shape, vibe);
    const shade = {
      Warm:{base:'golden or neutral-warm', lips:'peach nude, terracotta, brick or warm red', eyes:'bronze, copper, caramel or warm brown'},
      Cool:{base:'neutral-cool or rosy', lips:'rose, mauve, berry or blue-red', eyes:'taupe, plum, mauve or cool brown'},
      Neutral:{base:'neutral beige', lips:'rosy nude, soft berry or true red', eyes:'taupe, champagne, soft bronze or neutral brown'},
      Olive:{base:'neutral-olive or golden-olive', lips:'terracotta, muted berry, brick or warm rose', eyes:'olive, bronze, warm taupe or cocoa'}
    }[undertone];
    const placementText = {
      lifted:'Place colour high on the outer cheek and diffuse it toward the temple.', horizontal:'Keep colour more horizontal across the apples to add visual width.', apples:'Tap colour onto the apples, then soften the edge outward.', 'low-lift':'Start just below the apples and blend gently outward, not too high.', sunkissed:'Blend the cheeks softly and add only a whisper across the bridge of the nose.', draped:'Carry a sheer veil from upper cheek toward the temple for a lifted evening finish.', sculpt:'Keep colour just above the cheek hollow and blend upward rather than inward.'
    }[blush.placement] || 'Blend softly upward from the apples.';
    const intensity = vibe === 'evening' ? 'Build in two thin layers, checking in natural-looking light between layers.' : vibe === 'soft-glam' ? 'Use one sheer layer, then add a second only on the outer cheek.' : 'Start sheer and keep skin texture visible.';
    return { undertone, faceShape:shape, vibe, blush, sections:[
      { title:'Base', text:`Choose a ${shade.base} complexion match and test it along the jaw/neck transition.` },
      { title:'Brows', text:'Follow your natural brow direction first. Add definition only where you want it instead of redrawing the whole brow.' },
      { title:'Eyes', text:`A simple family to start with: ${shade.eyes}. Keep the deepest shade closest to the lash line.` },
      { title:'Blush', text:`Try ${blush.name}. ${placementText} ${intensity}` },
      { title:'Lips', text:`Easy colour families: ${shade.lips}. Blot once for a softer everyday result.` }
    ], note:'This is styling guidance, not a beauty score or rule. Lighting, product finish and your own preference matter more than a face-shape label.' };
  }

  function browserStoreGet(key, fallback) { try { return (typeof store !== 'undefined' && store && store.get) ? store.get(key, fallback) : fallback; } catch (_) { return fallback; } }
  function browserStoreSet(key, value) { try { if (typeof store !== 'undefined' && store && store.set) store.set(key, value); } catch (_) {} }
  function getPrefs() { return normalizePrefs(browserStoreGet('beautyHairPrefs', DEFAULT_PREFS)); }
  function hairOverlayEntry(style) { return Object.assign({ id:style.id, name:style.name, beautyMeta:{length:style.length,textures:style.textures,maintenance:style.maintenance,fringe:!!style.fringe,localApprox:!!style.localApprox} }, style.overlay); }

  function installHairLibrary() {
    if (typeof HAIR_WOMEN === 'undefined' || !Array.isArray(HAIR_WOMEN)) return;
    HAIR_WOMEN.splice(0, HAIR_WOMEN.length, {id:'none',name:'None'}, ...WOMEN_HAIR_LIBRARY.map(hairOverlayEntry));
    if (typeof HAIR_MATCH !== 'undefined' && HAIR_MATCH) ['oval','round','square','oblong','heart','diamond','triangle'].forEach(shape=>{ if (!HAIR_MATCH[shape]) HAIR_MATCH[shape]={men:[],women:[]}; HAIR_MATCH[shape].women = recommendWomenHair(shape, DEFAULT_PREFS, 8).map(x=>x.id); });
  }

  function installMakeupLooks() {
    if (typeof MAKEUP_LOOKS === 'undefined' || !Array.isArray(MAKEUP_LOOKS)) return;
    const customIndex = MAKEUP_LOOKS.findIndex(x=>x && x.id === 'custom'), at = customIndex >= 0 ? customIndex : MAKEUP_LOOKS.length;
    BLUSH_LOOKS.forEach((b, offset)=>{ if (MAKEUP_LOOKS.some(x=>x && x.id===b.id)) return; const lip=b.id==='berrysculpt'?[156,62,86]:b.id==='drapedrose'?[183,92,116]:[192,112,105], shadow=b.id==='berrysculpt'?[132,101,118]:[190,158,145]; MAKEUP_LOOKS.splice(Math.min(at+offset,MAKEUP_LOOKS.length),0,{id:b.id,name:b.name,lip,blush:b.blush,shadow,liner:b.id==='berrysculpt'||b.id==='drapedrose',brow:.20,blushPlacement:b.placement}); });
  }

  function installPreferenceAwareMatches() {
    if (typeof matchHairIds !== 'function' || matchHairIds.__beautyWrapped) return;
    const base=matchHairIds, wrapped=function(){ if (typeof styleGender !== 'undefined' && styleGender === 'women') return recommendWomenHair(typeof _faceShape!=='undefined'?_faceShape:null,getPrefs(),8).map(x=>x.id); return base.apply(this,arguments); }; wrapped.__beautyWrapped=true; matchHairIds=wrapped;
  }

  function colorString(rgb, alpha) { return `rgba(${Math.round(rgb[0])},${Math.round(rgb[1])},${Math.round(rgb[2])},${alpha})`; }
  function paintSoftEllipse(context, center, rgb, alpha, rx, ry, angle) { context.save(); context.translate(center.x,center.y); context.rotate(angle||0); context.scale(Math.max(.1,rx/ry),1); const g=context.createRadialGradient(0,0,0,0,0,ry); g.addColorStop(0,colorString(rgb,alpha)); g.addColorStop(.58,colorString(rgb,alpha*.58)); g.addColorStop(1,colorString(rgb,0)); context.globalCompositeOperation='multiply'; context.fillStyle=g; context.beginPath(); context.arc(0,0,ry,0,Math.PI*2); context.fill(); context.restore(); }

  function drawAdaptiveBlush(P,fH,color,placement) {
    if (typeof ctx === 'undefined' || !ctx || !color) return;
    const cheekR={x:(P(50).x+P(205).x)/2,y:(P(50).y+P(205).y)/2}, cheekL={x:(P(280).x+P(425).x)/2,y:(P(280).y+P(425).y)/2}, templeR=P(127), templeL=P(356), nose=P(1), blend=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
    const pair=(mode)=>{ if(mode==='apples')return[[cheekR,0],[cheekL,0]]; if(mode==='horizontal')return[[blend(cheekR,templeR,.12),-.08],[blend(cheekL,templeL,.12),.08]]; if(mode==='draped')return[[blend(cheekR,templeR,.48),-.42],[blend(cheekL,templeL,.48),.42]]; if(mode==='sculpt')return[[blend(cheekR,templeR,.32),-.34],[blend(cheekL,templeL,.32),.34]]; if(mode==='low-lift')return[[{x:cheekR.x,y:cheekR.y+fH*.025},-.25],[{x:cheekL.x,y:cheekL.y+fH*.025},.25]]; return[[blend(cheekR,templeR,.30),-.34],[blend(cheekL,templeL,.30),.34]]; };
    const mode=placement||'lifted', rx=fH*(mode==='horizontal'?.22:mode==='draped'?.20:.18), ry=fH*(mode==='apples'?.135:.105);
    if(mode!=='sunkissed') pair(mode).forEach(([c,a])=>paintSoftEllipse(ctx,c,color,mode==='apples'?.25:.28,rx,ry,a));
    if(mode==='draped'){paintSoftEllipse(ctx,templeR,color,.10,fH*.10,fH*.07,-.48);paintSoftEllipse(ctx,templeL,color,.10,fH*.10,fH*.07,.48);}
    if(mode==='sunkissed'){paintSoftEllipse(ctx,cheekR,color,.22,fH*.18,fH*.11,-.18);paintSoftEllipse(ctx,cheekL,color,.22,fH*.18,fH*.11,.18);paintSoftEllipse(ctx,nose,color,.10,fH*.09,fH*.055,0);}
  }

  function installAdaptiveBlush() {
    if (typeof drawMakeup !== 'function' || drawMakeup.__beautyWrapped) return;
    const base=drawMakeup, wrapped=function(P,fH){ const look=(typeof makeupLook==='function')?makeupLook():null; if(!look||!look.blush||!look.blushPlacement)return base.apply(this,arguments); const saved=look.blush; look.blush=null; try{base.apply(this,arguments);}finally{look.blush=saved;} drawAdaptiveBlush(P,fH,saved,look.blushPlacement); }; wrapped.__beautyWrapped=true; drawMakeup=wrapped;
  }

  function styleSheet() {
    if (document.getElementById('chiselBeautyCss')) return;
    const s=document.createElement('style'); s.id='chiselBeautyCss'; s.textContent='.beauty-prefs{border-top:1px solid rgba(201,168,106,.18);padding-top:10px;margin-top:4px}.beauty-prefs .beauty-title{font-size:9px;letter-spacing:.23em;text-transform:uppercase;color:#C9C2B4;margin-bottom:7px}.beauty-prefs .beauty-row{display:flex;gap:6px;overflow-x:auto;padding-bottom:5px}.beauty-prefs button{border:1px solid rgba(255,255,255,.14);background:transparent;color:#C9C2B4;border-radius:999px;padding:7px 10px;font-size:10px;white-space:nowrap}.beauty-prefs button.on{background:#C9A86A;color:#0A0A0B;border-color:#C9A86A}.beauty-note{font-size:10px;line-height:1.45;color:#918b80;margin-top:5px}.beauty-guide-modal{position:fixed;inset:0;z-index:760;background:rgba(4,4,5,.78);display:none;align-items:flex-end;justify-content:center}.beauty-guide-modal.on{display:flex}.beauty-guide-panel{width:min(620px,100%);max-height:88vh;overflow:auto;background:linear-gradient(180deg,#1a191b,#0d0d0f);border:1px solid rgba(201,168,106,.25);border-radius:22px 22px 0 0;padding:22px}.beauty-guide-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.beauty-guide-step{padding:12px;border:1px solid rgba(201,168,106,.15);border-radius:12px;background:rgba(255,255,255,.02)}.beauty-guide-step b{display:block;color:#E2C58A;margin-bottom:4px}.beauty-guide-step span{font-size:12px;line-height:1.5;color:#C9C2B4}@media(max-width:520px){.beauty-guide-grid{grid-template-columns:1fr}}'; document.head.appendChild(s);
  }

  function ensureHairPrefs() {
    const bar=document.getElementById('styleBar'), hair=document.getElementById('hairChips'); if(!bar||!hair)return;
    let box=document.getElementById('beautyHairPrefs'); if(!box){box=document.createElement('div');box.id='beautyHairPrefs';box.className='beauty-prefs';hair.insertAdjacentElement('afterend',box);}
    const women=(typeof styleGender!=='undefined'&&styleGender==='women'); box.style.display=women?'block':'none'; if(!women)return;
    const p=getPrefs(), rows=[['Texture','texture',['any','straight','wavy','curly','coily']],['Length','length',['any','short','medium','long']],['Upkeep','maintenance',['any','low','medium','high']],['Fringe','fringe',['either','yes','no']]];
    box.innerHTML=rows.map(([title,key,vals])=>`<div class="beauty-title">${title}</div><div class="beauty-row">${vals.map(v=>`<button data-pref="${key}" data-value="${v}" class="${p[key]===v?'on':''}">${v==='any'?'Any':v==='either'?'Either':v[0].toUpperCase()+v.slice(1)}</button>`).join('')}</div>`).join('')+'<div class="beauty-note">Matches combine your preferences with face-shape framing. They are suggestions, not rules. Braids, ponytails and updos use a simplified local silhouette; use Photoreal for texture/detail.</div>';
    box.querySelectorAll('button[data-pref]').forEach(btn=>btn.addEventListener('click',()=>{const next=getPrefs();next[btn.dataset.pref]=btn.dataset.value;browserStoreSet('beautyHairPrefs',next);if(typeof renderStyleChips==='function')renderStyleChips();ensureHairPrefs();}));
  }

  function installRenderHooks() {
    if(typeof renderStyleChips==='function'&&!renderStyleChips.__beautyWrapped){const base=renderStyleChips,wrapped=function(){const r=base.apply(this,arguments);ensureHairPrefs();return r;};wrapped.__beautyWrapped=true;renderStyleChips=wrapped;}
    if(typeof openStyle==='function'&&!openStyle.__beautyWrapped){const base=openStyle,wrapped=function(){const r=base.apply(this,arguments);try{if(typeof styleGender!=='undefined'&&styleGender==='women'){styleBeard=0;styleView='match';const rec=recommendWomenHair(typeof _faceShape!=='undefined'?_faceShape:null,getPrefs(),1)[0],idx=typeof HAIR_WOMEN!=='undefined'?HAIR_WOMEN.findIndex(x=>x.id===rec.id):-1;if(idx>=0)styleHair=idx;}else{styleBeard=0;}if(typeof renderStyleChips==='function')renderStyleChips();ensureHairPrefs();}catch(e){console.warn('beauty openStyle',e);}return r;};wrapped.__beautyWrapped=true;openStyle=wrapped;}
    if(typeof renderPhotoreal==='function'&&!renderPhotoreal.__beautyWrapped){const base=renderPhotoreal,alias={bixie:'pixie',frenchbob:'bob',butterfly:'wavy',curtain:'long',layers:'long',sleeklong:'long',waves:'wavy',curls:'curly',coils:'curly',shag:'wavy',wolf:'wavy',braids:'long',pony:'long',bun:'updo'},wrapped=async function(){let st=null,original=null;try{st=(typeof hairDef==='function')?hairDef():null;if(st&&alias[st.id]){original=st.id;st.id=alias[st.id];}return await base.apply(this,arguments);}finally{if(st&&original)st.id=original;}};wrapped.__beautyWrapped=true;renderPhotoreal=wrapped;}
  }

  function scanProfile(vibe) { let s=null;try{if(typeof lastScan==='function')s=lastScan();}catch(_){} const undertone=(s&&(s.undertone&&s.undertone.label||s.undertone||s.undLabel||s.und))||'Neutral',face=(typeof _faceShape!=='undefined'&&_faceShape)||(s&&(s.faceShape||s.shape))||'oval';return{undertone,faceShape:face,vibe:vibe||browserStoreGet('beautyGuideVibe','everyday')}; }
  function ensureGuideModal(){let modal=document.getElementById('beautyGuideModal');if(modal)return modal;modal=document.createElement('div');modal.id='beautyGuideModal';modal.className='beauty-guide-modal';modal.innerHTML='<div class="beauty-guide-panel"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px"><div><div style="font-size:9px;letter-spacing:.3em;text-transform:uppercase;color:#C9A86A">Beauty guide</div><h3 style="font-family:Georgia,serif;font-size:28px;margin:3px 0">Build the look, step by step</h3></div><button id="beautyGuideX" style="width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.15);background:transparent;color:#F2EDE4">✕</button></div><div id="beautyVibes" style="display:flex;gap:7px;overflow:auto;margin:12px 0"></div><div id="beautyGuideBody"></div></div>';document.body.appendChild(modal);modal.querySelector('#beautyGuideX').addEventListener('click',()=>modal.classList.remove('on'));modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('on');});return modal;}
  function renderGuide(vibe){browserStoreSet('beautyGuideVibe',vibe);const modal=ensureGuideModal(),guide=makeupGuide(scanProfile(vibe)),vibes=['natural','everyday','romantic','soft-glam','evening'],holder=modal.querySelector('#beautyVibes');holder.innerHTML=vibes.map(v=>`<button data-vibe="${v}" style="border:1px solid ${v===vibe?'#C9A86A':'rgba(255,255,255,.14)'};background:${v===vibe?'#C9A86A':'transparent'};color:${v===vibe?'#0A0A0B':'#C9C2B4'};border-radius:999px;padding:8px 11px;white-space:nowrap">${v.replace('-',' ')}</button>`).join('');holder.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>renderGuide(b.dataset.vibe)));modal.querySelector('#beautyGuideBody').innerHTML=`<p style="font-size:12px;color:#C9C2B4;line-height:1.55"><b style="color:#E2C58A">${guide.undertone} undertone</b> · ${guide.faceShape} face · ${guide.vibe.replace('-',' ')}</p><div class="beauty-guide-grid">${guide.sections.map(s=>`<div class="beauty-guide-step"><b>${s.title}</b><span>${s.text}</span></div>`).join('')}</div><p style="font-size:11px;color:#918b80;line-height:1.5;margin-top:12px">${guide.note}</p><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button id="beautyTryGuide" style="border:0;background:#C9A86A;color:#0A0A0B;border-radius:999px;padding:11px 16px;font-weight:700">Try ${guide.blush.name}</button></div>`;modal.querySelector('#beautyTryGuide').addEventListener('click',()=>{try{if(typeof MAKEUP_LOOKS!=='undefined'){const i=MAKEUP_LOOKS.findIndex(x=>x.id===guide.blush.id);if(i>=0)styleMakeup=i;}if(typeof _openMakeup!=='undefined')_openMakeup=true;modal.classList.remove('on');if(typeof openStyle==='function')openStyle();}catch(e){console.warn(e);}});modal.classList.add('on');}
  function injectGuideButton(){const anchor=document.getElementById('openMakeupTry');if(!anchor)return;const row=anchor.parentElement;if(!row||document.getElementById('openBeautyGuide'))return;const b=document.createElement('button');b.id='openBeautyGuide';b.className='btn';b.textContent='Beauty guide';b.addEventListener('click',()=>renderGuide(browserStoreGet('beautyGuideVibe','everyday')));row.insertBefore(b,anchor.nextSibling);}

  function bootstrapBrowser(){if(typeof document==='undefined'||document.documentElement.dataset.chiselBeautyReady==='1')return;document.documentElement.dataset.chiselBeautyReady='1';styleSheet();installHairLibrary();installMakeupLooks();installPreferenceAwareMatches();installAdaptiveBlush();installRenderHooks();injectGuideButton();ensureHairPrefs();try{if(typeof renderStyleChips==='function')renderStyleChips();}catch(_){} }
  return { WOMEN_HAIR_LIBRARY, BLUSH_LOOKS, DEFAULT_PREFS, normalizePrefs, recommendWomenHair, blushPlacementFor, normalizeUndertone, pickBlush, makeupGuide, bootstrapBrowser };
});