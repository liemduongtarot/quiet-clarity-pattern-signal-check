(function(global){
'use strict';
const parent=global.QCSemanticCoreV63;if(!parent)throw new Error('V8.3.195 requires V8.3.194 V63');
const VERSION='V8.3.195-V194-V1-SEALED-A-BOUNDED-MECHANISM-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function neutralRepair(d){return has(/(?:chose one proportionate action.*completed it.*left the matter closed)/,d);}
function routeRepair(d){
  if(has(/(?:several people are named.*never resolves which closing move was mine)/,d))return'input:clarification-required';
  if(has(/(?:invented example used for testing.*not something i actually experienced)/,d))return'input:hypothetical-or-example';
  if(has(/(?:private conclusion is my colleague holding about me.*never expressed|other person secretly feels about me.*not what i did myself)/,d))return'input:third-party-only';
  if(has(/(?:resolve positively for me by the stated date)/,d))return'input:prediction';
  return null;
}
function familyRepair(d){
  if(has(/(?:reversible first move was available.*widening the comparison instead of trying|enough information for a low-risk experiment.*kept researching rather than act|next step was easy to undo.*stayed uncommitted.*collecting more alternatives)/,d))return{matched:true,families:['freeze'],sequence:false};
  if(has(/(?:ignored the request that needed action.*something peripheral instead)/,d))return{matched:true,families:['ignore'],sequence:false};
  if(has(/(?:took longer than usual to respond.*checked it once.*left the matter alone|response was delayed.*after one review.*without reopening|waited before responding.*reviewed the issue once.*did not return)/,d))return{matched:true,families:['slow'],sequence:false};
  if(has(/(?:pattern repeated.*approach, retreat, recheck.*repeat.*nothing new added|moved toward acting.*backed away.*re-entered the same review cycle several times)/,d))return{matched:true,families:['slow'],sequence:true};
  return{matched:false,families:[],sequence:false};
}
function analyze(raw,domain='other',subtopic=null){
  const base=parent.analyze(raw,domain,subtopic),d=fold(raw),neutral=neutralRepair(d),rid=neutral?null:routeRepair(d),fam=neutral?{matched:false,families:[],sequence:false}:familyRepair(d);
  let route=neutral?'input:self-lived':(rid||(fam.matched?'input:self-lived':base.input_route?.id));
  let families=[...(base.families||[])],sequence=!!base.sequence;
  if(neutral){families=[];sequence=false;}
  else if(rid){families=[];sequence=false;}
  else if(fam.matched){families=[...fam.families];sequence=!!fam.sequence;}
  const input_route=frame(route,base.input_route);
  return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families,sequence,oscillation:sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_195_V194_V1_BOUNDED_MECHANISM_REPAIR',v195:{route,families:[...families],sequence,neutral}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v40-v195-v194-v1-bounded-mechanism-repair'})};
global.QCSemanticCoreV64=core;global.PSC_V83195=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.195:v194-v1-bounded-mechanism-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
