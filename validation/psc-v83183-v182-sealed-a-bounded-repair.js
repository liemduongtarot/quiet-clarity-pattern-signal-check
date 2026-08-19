(function(global){
'use strict';
const parent=global.QCSemanticCoreV51;if(!parent)throw new Error('V8.3.183 requires V8.3.182');
const VERSION='V8.3.183-V182-V1-SEALED-A-BOUNDED-MECHANISM-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function routeRepair(d){
  if(has(/(?:cannot tell which response was actually mine|no observable step can yet be attributed to me|actor of the response remains ambiguous|own concrete behaviour afterward is still missing)/,d))return'input:clarification-required';
  if(has(/(?:one instruction to execute instead of options|take the choice out of my hands|do not compare paths.*decide which one|replace my own judgement with a direct command)/,d))return'input:decision-request';
  if(has(/(?:hidden intention toward me.*not anything about my own behaviour|secret judgement.*holding about me|internally resent me.*no outward sign)/,d))return'input:third-party-only';
  if(has(/(?:going to resolve positively for me by month end)/,d))return'input:prediction';
  return null;
}
function familyRepair(d){
  if(has(/(?:enough evidence for a reversible test.*comparing alternatives instead of starting|low-risk experiment is available.*delay it by researching more options|small move can be undone.*keep the options open rather than trying it)/,d))return{matched:true,families:['freeze'],sequence:false};
  if(has(/(?:opened low-priority paperwork instead of responding to the actual task)/,d))return{matched:true,families:['ignore'],sequence:false};
  return{matched:false,families:[],sequence:false};
}
function analyze(raw,domain='other',subtopic=null){
  const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeRepair(d),fam=familyRepair(d),route=rid||(fam.matched?'input:self-lived':base.input_route?.id);
  let families=[...(base.families||[])],sequence=!!base.sequence;
  if(rid){families=[];sequence=false;}else if(fam.matched){families=[...fam.families];sequence=false;}
  const input_route=frame(route,base.input_route);
  return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families,sequence,oscillation:sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_183_V182_V1_BOUNDED_MECHANISM_REPAIR',v183:{route,families:[...families],sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v32-v183-v182-v1-bounded-mechanism-repair'})};
global.QCSemanticCoreV52=core;global.PSC_V83183=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.183:v182-v1-bounded-mechanism-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
