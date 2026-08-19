(function(global){
'use strict';
const parent=global.QCSemanticCoreV48;if(!parent)throw new Error('V8.3.180 requires V8.3.179');
const VERSION='V8.3.180-V179-V2-SEALED-A-BOUNDED-MECHANISM-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function routeFrame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function routeRepair(d){
  if(has(/(?:did not say what action i personally took|own observable response is absent|behaviour is blended with what the other person did.*attribution.*unresolved|own action.*not stated|my own response.*missing)/,d))return'input:clarification-required';
  if(has(/(?:direct instruction.*replaces my own judgement|take the decision out of my hands|replace my judgement.*direct command|decision.*out of my hands.*answer)/,d))return'input:decision-request';
  if(has(/(?:colleague secretly thinks about me|ben trong nguoi kia.*cam thay gi ve toi|secretly thinks? about me right now|inside.*other person.*feeling.*about me)/,d))return'input:third-party-only';
  if(has(/(?:den cuoi thang.*nghieng ve phia toi|ket thuc theo huong toi muon|ket qua cuoi cung.*dung nhu.*ky vong|final outcome.*match what i.*hope|resolve the way i want.*near future)/,d))return'input:prediction';
  return null;
}
function familyRepair(d){
  // Explicit completion/closure neutralizes freeze cues: action was already tried and option expansion was not continued.
  if(has(/(?:da thu mot buoc nho roi dung lai.*khong tiep tuc mo them lua chon|already tried a small step.*did not keep opening more options|took the small test.*did not reopen alternatives)/,d))return{matched:true,families:[],sequence:false};
  const ready=has(/(?:test nho an toan de thu|thu truoc roi doi lai|experiment nho du an toan|small safe experiment|reversible first step|safe.*undo|co the thu.*quay lai)/,d);
  const delay=has(/(?:tim them phuong an.*tri hoan|so sanh mai.*khong bat dau|giu moi option mo.*thay vi thu|keep.*options open.*instead of trying|compare.*without starting|research.*more choices.*delay)/,d);
  if(ready&&delay)return{matched:true,families:['freeze'],sequence:false};
  return{matched:false,families:[],sequence:false};
}
function analyze(raw,domain='other',subtopic=null){
  const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeRepair(d),own=familyRepair(d),route=rid||(own.matched?'input:self-lived':base.input_route?.id);
  let families=[...(base.families||[])],sequence=!!base.sequence;
  if(rid){families=[];sequence=false;}else if(own.matched){families=[...(own.families||[])];sequence=false;}
  const input_route=routeFrame(route,base.input_route);
  return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families,sequence,oscillation:sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_180_V179_V2_BOUNDED_MECHANISM_REPAIR',v180:{route,families:[...families],sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v29-v180-v179-v2-bounded-mechanism-repair'})};
global.QCSemanticCoreV49=core;global.PSC_V83180=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.180:v179-v2-bounded-mechanism-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
