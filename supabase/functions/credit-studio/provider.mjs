import {MODEL,mode,usageMicros} from './policy.mjs';
export class ProviderError extends Error{constructor(code){super(code);this.code=code;}}
export async function readBytes(response,max){
 const declared=response.headers.get('content-length');if(declared&&(!/^\d+$/.test(declared)||Number(declared)>max))throw new ProviderError('response_too_large');
 if(!response.body)throw new ProviderError('empty_response');const reader=response.body.getReader(),chunks=[];let size=0;
 try{while(true){const r=await reader.read();if(r.done)break;size+=r.value.length;if(size>max){await reader.cancel();throw new ProviderError('response_too_large');}chunks.push(r.value);}}finally{reader.releaseLock();}
 const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}return bytes;
}
export function imageBytes(value){
 if(typeof value!=='string'||value.length>8400000)throw new ProviderError('invalid_image');
 const m=/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);if(!m)throw new ProviderError('invalid_image');
 let raw;try{raw=atob(m[2]);}catch{throw new ProviderError('invalid_image');}
 if(raw.length<4||raw.length>6000000)throw new ProviderError('invalid_image');const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));
 const valid=m[1]==='image/jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:m[1]==='image/png'?bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71:raw.slice(0,4)==='RIFF'&&raw.slice(8,12)==='WEBP';
 if(!valid)throw new ProviderError('invalid_image');return{bytes,type:m[1]};
}
export async function editImage({key,image,prompt,quality='standard',shape='portrait',fetcher=fetch}){
 if(!key)throw new ProviderError('provider_not_configured');const selected=mode(quality),photo=imageBytes(image);
 if(typeof prompt!=='string'||prompt.length>5000)throw new ProviderError('invalid_prompt');
 const sizes={portrait:'1024x1360',landscape:'1360x1024',square:'1024x1024'};if(!Object.hasOwn(sizes,shape))throw new ProviderError('invalid_shape');
 const data=new FormData();data.set('model',MODEL);data.set('prompt',prompt);data.set('n','1');data.set('quality',selected.quality);data.set('size',sizes[shape]);data.set('output_format','jpeg');data.set('image',new Blob([photo.bytes],{type:photo.type}),'portrait');
 let response;try{response=await fetcher('https://api.openai.com/v1/images/edits',{method:'POST',headers:{Authorization:`Bearer ${key}`},body:data,signal:AbortSignal.timeout(100000),redirect:'error',credentials:'omit',cache:'no-store'});}catch{throw new ProviderError('provider_unconfirmed');}
 if(!response.ok)throw new ProviderError([400,401,403,422,429].includes(response.status)?'provider_rejected':'provider_unconfirmed');
 let json;try{json=JSON.parse(new TextDecoder().decode(await readBytes(response,11500000)));}catch{throw new ProviderError('invalid_provider_result');}
 const base64=json.data?.[0]?.b64_json;if(json.data?.length!==1||typeof base64!=='string'||base64.length>10800000)throw new ProviderError('invalid_provider_result');
 let raw;try{raw=atob(base64);}catch{throw new ProviderError('invalid_provider_result');}
 const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));if(bytes.length<4||bytes.length>8000000||bytes[0]!==255||bytes[1]!==216||bytes[2]!==255)throw new ProviderError('invalid_provider_result');
 return{bytes,type:'image/jpeg',costMicros:usageMicros(json.usage),requestId:response.headers.get('x-request-id'),model:MODEL};
}

// The app prepares JPEGs with a bounded long edge. Enforce that on the server too;
// byte limits alone do not cap an image's dimensions or input-token exposure.
export function validatePreparedImage(data){
 const {bytes,type}=imageBytes(data);if(type!=='image/jpeg')throw new ProviderError('invalid_image');
 let at=2;
 while(at+4<=bytes.length){
  if(bytes[at]!==255)throw new ProviderError('invalid_image');while(bytes[at]===255)at++;
  const marker=bytes[at++];if(marker===0xda||marker===0xd9)break;
  if(marker===0x01||marker>=0xd0&&marker<=0xd7)continue;
  const len=(bytes[at]<<8)|bytes[at+1];if(len<2||at+len>bytes.length)throw new ProviderError('invalid_image');
  if([0xc0,0xc1,0xc2].includes(marker)){
   if(len<8)throw new ProviderError('invalid_image');const height=(bytes[at+3]<<8)|bytes[at+4],width=(bytes[at+5]<<8)|bytes[at+6];
   if(Math.min(width,height)<256||Math.max(width,height)>1536||width*height>2359296)throw new ProviderError('image_dimensions_exceeded');return{width,height};
  }at+=len;
 }throw new ProviderError('invalid_image');
}
