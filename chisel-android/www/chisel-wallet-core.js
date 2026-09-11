(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ChiselWalletCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
function createWallet({userId,load,products,purchase}){
 let epoch=0,busy=false,balance=null,salesReady=false,offers=[],message='',configuration=null;const listeners=new Set();
 const snapshot=()=>Object.freeze({balance,salesReady,offers:offers.slice(),busy,message,configuration});
 const emit=()=>{for(const f of listeners)f(snapshot());};
 async function refresh(){const ticket=epoch,owner=userId();const data=await load();if(ticket!==epoch||owner!==userId())return snapshot();configuration=data;salesReady=data.salesReady===true;const previousBalance=balance;balance=owner&&data.wallet?.userId===owner&&Number.isSafeInteger(data.wallet.balance)?data.wallet.balance:null;if(previousBalance!==null&&balance!==previousBalance)message='Balance updated.';emit();return snapshot();}
 async function loadProducts(){const ticket=epoch,owner=userId();if(!owner||!salesReady){offers=[];emit();return;}const data=await products(configuration);if(ticket!==epoch||owner!==userId())return;offers=data.filter(p=>typeof p.identifier==='string'&&typeof p.priceString==='string'&&p.priceString.length>0);emit();}
 async function buy(id){
  if(busy)throw Error('purchase_in_progress');const owner=userId(),ticket=epoch;
  if(!owner||!salesReady)throw Error('purchase_unavailable');const offer=offers.find(p=>p.identifier===id);if(!offer)throw Error('store_price_unavailable');
  busy=true;message='Opening the store…';emit();
  try{await purchase(offer,owner);if(ticket!==epoch||owner!==userId())return;message='Purchase sent for verification. Refresh your balance shortly.';await refresh();}
  catch(e){if(ticket===epoch){message=e?.userCancelled?'Purchase cancelled.':'Purchase not confirmed. Check your balance before trying again.';}}
  finally{if(ticket===epoch){busy=false;emit();}}
 }
 function reset(){epoch++;balance=null;offers=[];salesReady=false;message='';busy=false;emit();}
 return{snapshot,refresh,loadProducts,buy,reset,subscribe(f){listeners.add(f);f(snapshot());return()=>listeners.delete(f);}};
}
return{createWallet};});
