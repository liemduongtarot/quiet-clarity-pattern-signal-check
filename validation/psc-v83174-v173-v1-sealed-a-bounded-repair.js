(function(global){
'use strict';
const parent=global.QCSemanticCoreV42;if(!parent)throw new Error('V8.3.174 requires V8.3.173');
const VERSION='V8.3.174-V173-V1-SEALED-A-MECHANISM-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function routeFrame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function routeRepair(d){
  // Own action is absent or actor attribution is unresolved.
  if(has(/(?:leaves? out the action i personally took|no reliable way.*assign the next action to me|switches between my response and .*response|cannot tell.*which.*actions? belonged to me|actor changes.*description|chua co chi tiet.*toi that su da lam gi|phan ke.*tron viec toi lam.*viec cua.*chua biet.*cua ai|buoc tiep theo.*thuc su la cua ai)/,d))return'input:clarification-required';
  // Explicit decision replacement / outsourcing.
  if(has(/(?:chot luon toi phai lam gi.*thay the quyet dinh cua toi.*chi dan cua ban|thay the quyet dinh cua toi bang chi dan|quyet thay toi.*buoc nao)/,d))return'input:decision-request';
  // Explicitly fictional/practice material rather than lived experience.
  if(has(/(?:scenario gia.*practice.*not my own lived response|scenario gia.*khong phai.*lived response|practice semantic classification.*not my own)/,d))return'input:hypothetical-or-example';
  // Hidden/private evaluation or inner view of another person.
  if(has(/(?:dang danh gia toi the nao trong long.*chua the hien|danh gia toi.*trong long|privately evaluating me.*not shown)/,d))return'input:third-party-only';
  // Future favourable outcome / deadline framing.
  if(has(/(?:final outcome.*likely.*favourable.*next few weeks|outcome.*become favourable.*next few weeks|ket qua.*chuyen.*huong thuan loi.*truoc cuoi thang|ket qua.*thuan loi.*cuoi thang)/,d))return'input:prediction';
  return null;
}
function familyRepair(d){
  // Freeze: a sufficiently safe/low-risk/reversible trial is available, but research/comparison/option-expansion delays starting it.
  const testReady=has(/(?:low-risk trial|workable test.*undo|modest experiment.*safe enough|buoc thu nho.*co the quay lai|thu nghiem nho.*cho cau tra loi|experiment.*safe enough|test.*could undo)/,d);
  const avoidance=has(/(?:kept widening the research|postponed action.*comparisons|continuing to search for better options|mo them lua chon.*chua muon bat dau|tiep tuc tim hieu.*tri hoan.*thu|avoided committing.*search|instead of starting the experiment)/,d);
  if(testReady&&avoidance)return{matched:true,families:['freeze'],sequence:false};
  return{matched:false,families:[],sequence:false};
}
function analyze(raw,domain='other',subtopic=null){
  const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeRepair(d),own=familyRepair(d);
  const route=rid||(own.matched?'input:self-lived':base.input_route?.id);
  let families=[],sequence=false;
  if(route==='input:self-lived'){
    if(own.matched){families=[...(own.families||[])];sequence=!!own.sequence;}
    else{families=[...(base.families||[])].filter(x=>x!=='adaptive');sequence=!!base.sequence;}
  }
  const input_route=routeFrame(route,base.input_route);
  return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families,sequence,oscillation:sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_174_V173_V1_MECHANISM_REPAIR',v174:{route,families:[...families],sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v23-v174-v173-v1-mechanism-repair'})};
global.QCSemanticCoreV43=core;global.PSC_V83174=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.174:v173-v1-mechanism-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
