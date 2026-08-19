(function(global){
'use strict';
const parent=global.QCSemanticCoreV59R;if(!parent)throw new Error('V8.3.191 requires V8.3.190 V59R');
const VERSION='V8.3.191-V190-V1-SEALED-A-BOUNDED-MECHANISM-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function routeRepair(d){
  if(has(/(?:timeline is complete.*own final observable response.*absent|names several actors.*never assigns the closing action specifically to me|explained what changed.*not the concrete thing i personally did afterward)/,d))return'input:clarification-required';
  if(has(/(?:take the choice away from me.*which route i must follow)/,d))return'input:decision-request';
  if(has(/(?:hypothetical supplier story only as a classification exercise)/,d))return'input:hypothetical-or-example';
  if(has(/(?:unspoken judgment is my supervisor privately holding about me|colleague secretly thinks of me.*not what i did|private intention is the other person carrying toward me)/,d))return'input:third-party-only';
  if(has(/(?:resolve positively for me within the next few weeks)/,d))return'input:prediction';
  return null;
}
function neutralRepair(d){return has(/(?:took one bounded action based on current evidence and left the matter closed)/,d);}
function familyRepair(d){
  if(has(/(?:safe reversible trial was ready.*opening more comparisons instead of starting|enough evidence existed for a low-risk experiment.*continued researching rather than begin|first move was easy to undo.*preserved every alternative and stayed uncommitted)/,d))return{matched:true,families:['freeze'],sequence:false};
  if(has(/(?:rather than address the message.*ignored it and focused on a side task)/,d))return{matched:true,families:['ignore'],sequence:false};
  if(has(/(?:responded more slowly than usual.*reviewed it once.*stopped without reopening|response was delayed.*after one check.*left the issue alone)/,d))return{matched:true,families:['slow'],sequence:false};
  if(has(/(?:moved in to check.*backed away.*returned to check again.*without new evidence|checked, withdrew, and re-entered the same review cycle several times|pattern was approach, retreat, recheck, then repeat with nothing new added)/,d))return{matched:true,families:['slow'],sequence:true};
  return{matched:false,families:[],sequence:false};
}
function analyze(raw,domain='other',subtopic=null){
  const base=parent.analyze(raw,domain,subtopic),d=fold(raw),neutral=neutralRepair(d),rid=neutral?null:routeRepair(d),fam=neutral?{matched:true,families:[],sequence:false}:familyRepair(d),route=neutral?'input:self-lived':(rid||(fam.matched?'input:self-lived':base.input_route?.id));
  let families=[...(base.families||[])],sequence=!!base.sequence;
  if(neutral){families=[];sequence=false;}else if(rid){families=[];sequence=false;}else if(fam.matched){families=[...fam.families];sequence=!!fam.sequence;}
  const input_route=frame(route,base.input_route);
  return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families,sequence,oscillation:sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_191_V190_V1_BOUNDED_MECHANISM_REPAIR',v191:{route,families:[...families],sequence,neutral}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v40-v191-v190-v1-bounded-mechanism-repair'})};
global.QCSemanticCoreV60=core;global.PSC_V83191=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.191:v190-v1-bounded-mechanism-repair';
})(typeof globalThis!=='undefined'?globalThis:this);