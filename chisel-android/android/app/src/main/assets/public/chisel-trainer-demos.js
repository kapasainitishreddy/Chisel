(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.ChiselTrainerDemos=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const esc=value=>String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const MOTION={
    'forehead-sweep':'M68 78 C80 58 92 45 120 32',
    'brow-sweep':'M57 92 C82 82 104 76 135 72',
    'temple-circles':'M170 64 a18 18 0 1 1 -1 0',
    'brow-relaxation':'M62 85 C92 82 122 80 150 83',
    'forehead-release':'M118 45 C94 50 78 62 62 78',
    'orbital-sweep':'M65 91 C92 106 128 108 158 94',
    'under-eye-glide':'M65 106 C94 116 126 116 157 105',
    'brow-to-temple':'M62 81 C92 72 130 68 164 61',
    'cheek-upward-sweep':'M78 134 C87 112 98 99 111 87',
    'cheek-outward-glide':'M88 119 C112 120 139 116 164 104',
    'cheek-relaxation':'M80 123 C103 130 136 130 160 120',
    'smile-muscle-release':'M84 126 C104 121 137 121 156 126',
    'masseter-circles':'M164 126 a17 17 0 1 1 -1 0',
    'jawline-glide':'M75 147 C103 165 139 165 169 145',
    'chin-to-ear-glide':'M118 156 C137 157 155 151 172 139',
    'jaw-relaxation-sequence':'M76 133 C102 142 138 142 164 132',
    'chin-sweep':'M104 153 C119 157 134 157 149 151',
    'chin-jaw-transition':'M119 155 C140 157 160 149 174 136',
    'neck-relaxation':'M167 145 C169 161 173 174 181 188',
    'side-neck-glide':'M166 137 C170 154 176 171 184 188',
    'posture-reset':'M120 42 C120 82 120 117 120 166',
    'jaw-neck-reset':'M120 150 C120 164 120 177 120 190'
  };
  function motionPath(exercise){
    return MOTION[exercise&&exercise.animation]||MOTION['cheek-relaxation'];
  }
  function svgMarkup(exercise,options={}){
    const name=esc(exercise&&exercise.name||'Movement demonstration');
    const path=motionPath(exercise);
    const circle=exercise&&exercise.handPath&&exercise.handPath.motion==='circle';
    const hand=exercise&&exercise.tracking==='hand-guided';
    const label=hand?'Follow the light path':'Follow the gentle cue';
    return `<svg class="ctv2-demo-svg" viewBox="0 0 240 210" role="img" aria-label="${name} demonstration" data-motion="${esc(exercise&&exercise.animation)}" data-reduced-motion="${options.reducedMotion?'true':'false'}">
      <defs><linearGradient id="ctDemoFace" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#e7d8be" stop-opacity=".92"/><stop offset="1" stop-color="#a4c6b4" stop-opacity=".75"/></linearGradient></defs>
      <path class="ct-demo-neck" d="M96 168 C96 188 89 194 82 202 M144 168 C144 188 151 194 158 202"/>
      <ellipse class="ct-demo-face" cx="120" cy="102" rx="58" ry="73"/>
      <path class="ct-demo-brow" d="M83 88 Q98 80 110 87 M130 87 Q143 80 157 88"/>
      <path class="ct-demo-eye" d="M86 99 Q98 105 109 99 M131 99 Q142 105 154 99"/>
      <path class="ct-demo-mouth" d="M105 137 Q120 145 135 137"/>
      <path class="ct-demo-motion-halo" d="${path}"/>
      <path class="ct-demo-motion" d="${path}"/>
      ${hand?`<circle class="ct-demo-hand" r="7" cx="0" cy="0"><animateMotion dur="2.4s" repeatCount="indefinite" path="${path}" rotate="auto"/></circle>`:''}
      ${circle?'<circle class="ct-demo-orbit" cx="170" cy="64" r="23"/>':''}
      <text class="ct-demo-label" x="120" y="204" text-anchor="middle">${esc(label)}</text>
    </svg>`;
  }
  function render(exercise,host,options){
    if(!host)return false;
    host.innerHTML=svgMarkup(exercise,options||{});
    host.setAttribute('aria-label',`${exercise&&exercise.name||'Movement'} demonstration`);
    host.dataset.demoAnimation=exercise&&exercise.animation||'';
    return true;
  }
  return{MOTION,svgMarkup,render,motionPath};
});
