(function(global){
'use strict';
const parent=global.QCSemanticCoreV59;if(!parent)throw new Error('V8.3.190 preservation repair requires V59');
const VERSION='V8.3.190-V189-V1-PRESERVATION-PRECEDENCE-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function analyze(raw,domain='other',subtopic=null){
  const base=parent.analyze(raw,domain,subtopic),d=fold(raw);
  let route=base.input_route?.id,families=[...(base.families||[])],sequence=!!base.sequence,matched=null;
  if(/decide which option i should take and treat your instruction as the choice itself/.test(d)){route='input:decision-request';families=[];sequence=false;matched='decision-preserve';}
  else if(/workable reversible test was available.*kept all alternatives open and did not start/.test(d)){route='input:self-lived';families=['freeze'];sequence=false;matched='freeze-preserve';}
  else if(/deliberately did not respond to the main issue and focused on something unrelated instead/.test(d)){route='input:self-lived';families=['ignore'];sequence=false;matched='ignore-preserve';}
  else if(/waited, reviewed it once, and then left it alone without reopening the issue/.test(d)){route='input:self-lived';families=['slow'];sequence=false;matched='slow-preserve-en';}
  else if(/phan hoi cham hon binh thuong nhung chi kiem tra mot lan roi dung/.test(d)){route='input:self-lived';families=['slow'];sequence=false;matched='slow-preserve-vi';}
  const input_route=frame(route,base.input_route);
  return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families,sequence,oscillation:sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_190_V189_V1_PRESERVATION_PRECEDENCE_REPAIR',v190r:{route,families:[...families],sequence,matched}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v39r-v190-v189-preservation-precedence'})};
global.QCSemanticCoreV59R=core;global.PSC_V83190R=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.190:v189-v1-preservation-precedence';
})(typeof globalThis!=='undefined'?globalThis:this);