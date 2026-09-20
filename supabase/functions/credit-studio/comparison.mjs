/* Pure local compare/export rules. These do not invoke an image model. */
export function pickLooks(rows,ids){
 if(!Array.isArray(ids)||ids.length<2||ids.length>4||new Set(ids).size!==ids.length)throw Error('Choose two to four different saved looks.');
 const picked=ids.map(id=>rows.find(r=>r.id===id));if(picked.some(r=>!r))throw Error('A saved look is no longer available.');
 const first=picked[0].sourceIdentity;if(!/^[a-f0-9]{64}$/.test(first||'')||picked.some(r=>r.sourceIdentity!==first))throw Error('Compare looks made from the same original photo.');
 return picked;
}
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function briefHTML({style,notes='',maintenance='Discuss with stylist',source,result}){
 const valid=s=>typeof s==='string'&&/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(s);
 if(!valid(source)||!valid(result))throw Error('The brief needs a saved original and preview.');
 return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Chisel stylist reference</title><style>body{font:16px/1.6 system-ui,sans-serif;max-width:900px;margin:36px auto;padding:24px;color:#14201b;background:#fff}h1{font-size:32px;line-height:1.2}.photos{display:grid;grid-template-columns:1fr 1fr;gap:20px}figure{margin:0}img{width:100%;max-height:560px;object-fit:contain}figcaption{font-size:14px;color:#48554e}p{white-space:pre-wrap}footer{border-top:1px solid #ccd2ce;margin-top:28px;font-size:13px}@media print{body{margin:0;padding:12px}figure{break-inside:avoid}}</style><h1>${escape(style).slice(0,200)}</h1><div class="photos"><figure><img alt="Original photo" src="${source}"><figcaption>Original photo</figcaption></figure><figure><img alt="AI style reference" src="${result}"><figcaption>AI style reference, not a predicted result</figcaption></figure></div><h2>Maintenance preference</h2><p>${escape(maintenance).slice(0,300)}</p><h2>My notes</h2><p>${escape(notes).slice(0,4000)}</p><footer>Discuss feasibility, hair texture, current length and upkeep with your stylist. This AI-edited reference may contain artifacts. No clipper grade, chemical treatment or exact outcome is prescribed.</footer></html>`;
}
