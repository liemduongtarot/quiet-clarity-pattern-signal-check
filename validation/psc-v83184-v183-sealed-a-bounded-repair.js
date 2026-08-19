(function(global){
'use strict';
const parent=global.QCSemanticCoreV52;if(!parent)throw new Error('V8.3.184 requires V8.3.183');
const VERSION='V8.3.184-V183-V1-SEALED-A-BOUNDED-MECHANISM-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function routeRepair(d){
  if(has(/(?:final response cannot yet be assigned specifically to me|shifts actors.*ownership of the last observable step unresolved|my own behaviour after the latest change is absent|actor responsible for the response is not|not which concrete action belonged to me)/,d))return'input:clarification-required';
  if(has(/(?:single instruction i should obey rather than alternatives|do not leave the options with me.*tell me which path|make the call for me.*only the action)/,d))return'input:decision-request';
  if(has(/(?:private feeling are they holding toward me that i cannot observe|secret opinion does my manager have about me right now)/,d))return'input:third-party-only';
  if(has(/(?:process likely to resolve favourably for me by the end of the month)/,d))return'input:prediction';
  return null;
}
function familyRepair(d){
  if(has(/(?:reversible test ready.*keep comparing choices instead of trying it|safe experiment is available.*postpone it by researching more alternatives|small move is easy to undo.*preserve every option instead of starting)/,d))return{matched:true,families:['freeze'],sequence:false};
  if(has(/(?:opened unrelated paperwork rather than responding to the issue that needed action)/,d))return{matched:true,families:['ignore'],sequence:false};
  if(has(/(?:completed the practical action myself without asking anyone else to decide for me)/,d))return{matched:true,families:[],sequence:false};
  return{matched:false,families:[],sequence:false};
}
function analyze(raw,domain='other',subtopic=null){
  const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeRepair(d),fam=familyRepair(d),route=rid||(fam.matched?'input:self-lived':base.input_route?.id);
  let families=[...(base.families||[])],sequence=!!base.sequence;
  if(rid){families=[];sequence=false;}else if(fam.matched){families=[...fam.families];sequence=false;}
  const input_route=frame(route,base.input_route);
  return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families,sequence,oscillation:sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_184_V183_V1_BOUNDED_MECHANISM_REPAIR',v184:{route,families:[...families],sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v33-v184-v183-v1-bounded-mechanism-repair'})};
global.QCSemanticCoreV53=core;global.PSC_V83184=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.184:v183-v1-bounded-mechanism-repair';
})(typeof globalThis!=='undefined'?globalThis:this);