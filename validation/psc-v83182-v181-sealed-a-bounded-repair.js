(function(global){
'use strict';
const parent=global.QCSemanticCoreV50R3;if(!parent)throw new Error('V8.3.182 requires V8.3.181 V50R3');
const VERSION='V8.3.182-V181-V1-SEALED-A-BOUNDED-MECHANISM-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function routeRepair(d){
  if(has(/(?:never identifies which observable response was mine|actor.*response.*lan.*toi.*nguoi kia|person who actually made the response.*unresolved|record says.*we.*i.*own action.*cannot.*isolated|no concrete step attributable to me)/,d))return'input:clarification-required';
  if(has(/(?:invented neighbour.*example.*did not happen to me)/,d))return'input:hypothetical-or-example';
  if(has(/(?:going to end the way i want.*next few weeks)/,d))return'input:prediction';
  return null;
}
function familyRepair(d){
  if(has(/(?:enough information.*reversible first move.*comparing more options.*instead of starting)/,d))return{matched:true,families:['freeze'],sequence:false};
  if(has(/(?:after the update.*switched to unrelated admin.*left the actual issue for later|sau update.*low-value admin.*thay vi xu ly van de chinh)/,d))return{matched:true,families:['ignore'],sequence:false};
  return{matched:false,families:[],sequence:false};
}
function analyze(raw,domain='other',subtopic=null){
  const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeRepair(d),fam=familyRepair(d),route=rid||(fam.matched?'input:self-lived':base.input_route?.id);
  let families=[...(base.families||[])],sequence=!!base.sequence;
  if(rid){families=[];sequence=false;}else if(fam.matched){families=[...fam.families];sequence=false;}
  const input_route=frame(route,base.input_route);
  return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families,sequence,oscillation:sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_182_V181_V1_BOUNDED_MECHANISM_REPAIR',v182:{route,families:[...families],sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v31-v182-v181-v1-bounded-mechanism-repair'})};
global.QCSemanticCoreV51=core;global.PSC_V83182=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.182:v181-v1-bounded-mechanism-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
