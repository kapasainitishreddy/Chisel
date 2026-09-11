(function(root){
"use strict";
/* Shared pricing contract. Store prices are localized and authoritative at purchase.
   These US prices and cost envelopes are launch assumptions, not measured profit. */
const VERSION=1;
const PACKS=Object.freeze([
 Object.freeze({id:'chisel_credits_10',credits:10,usdCents:399,label:'Starter',recurring:false,expires:false}),
 Object.freeze({id:'chisel_credits_30',credits:30,usdCents:999,label:'Explore',recurring:false,expires:false}),
 Object.freeze({id:'chisel_credits_70',credits:70,usdCents:1999,label:'Collection',recurring:false,expires:false})
]);
const MODES=Object.freeze({standard:Object.freeze({credits:1,quality:'medium',label:'Standard',reserveMicros:130000}),detail:Object.freeze({credits:3,quality:'high',label:'Detail',reserveMicros:390000})});
const MODEL='gpt-image-2.5-sunburst';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function mode(name){if(!Object.hasOwn(MODES,name))throw Error('invalid_quality');return MODES[name];}
function contribution(pack,{storeFee=.15,otherReserve=.02,costPerCredit=.13}={}){
 for(const n of [storeFee,otherReserve])if(!Number.isFinite(n)||n<0||n>1)throw Error('invalid_fee');
 if(storeFee+otherReserve>=1||!Number.isFinite(costPerCredit)||costPerCredit<0)throw Error('invalid_cost');
 const gross=pack.usdCents/100,net=gross*(1-storeFee-otherReserve),cost=pack.credits*costPerCredit;
 return{grossUsd:gross,netAfterFeesUsd:net,assumedVariableCostUsd:cost,contributionUsd:net-cost,contributionMargin:(net-cost)/gross,costsAreAssumptions:true};
}
function purchaseEvent(e,{appId,environment}={}){
 if(!e||typeof e!=='object')throw Error('invalid_event');
 if(!['NON_RENEWING_PURCHASE','CANCELLATION'].includes(e.type))return null;
 if(!appId||!['PRODUCTION','SANDBOX'].includes(environment)||e.app_id!==appId||e.environment!==environment||e.store!=='PLAY_STORE')throw Error('wrong_purchase_scope');
 if(!UUID.test(e.app_user_id||'')||typeof e.id!=='string'||e.id.length<1||e.id.length>200||typeof e.transaction_id!=='string'||!e.transaction_id||e.transaction_id.length>256||!Number.isSafeInteger(e.event_timestamp_ms))throw Error('invalid_event');
 const pack=PACKS.find(p=>p.id===e.product_id);if(!pack)throw Error('unknown_product');
 return{eventId:e.id,transactionId:e.transaction_id,userId:e.app_user_id,environment,store:e.store,productId:pack.id,action:e.type==='NON_RENEWING_PURCHASE'?'grant':'revoke',timestamp:e.event_timestamp_ms};
}
function usageMicros(usage){
 const text=usage?.input_tokens_details?.text_tokens,image=usage?.input_tokens_details?.image_tokens,out=usage?.output_tokens;
 if(![text,image,out].every(n=>Number.isSafeInteger(n)&&n>=0))return null;
 return text*5+image*8+out*30; // USD micro-units. No cached discount assumed.
}

root.ChiselCreditPolicy={VERSION,PACKS,MODES,MODEL,UUID,mode,contribution,purchaseEvent,usageMicros};
})(globalThis);
