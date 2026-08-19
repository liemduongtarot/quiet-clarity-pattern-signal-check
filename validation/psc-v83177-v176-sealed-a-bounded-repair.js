(function(global){
'use strict';
const parent=global.QCSemanticCoreV45;if(!parent)throw new Error('V8.3.177 requires V8.3.176');
const VERSION='V8.3.177-V176-V1-SEALED-A-BOUNDED-MECHANISM-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function routeFrame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function routeRepair(d){
  if(has(/(?:never said what i myself actually did|hanh dong cua chinh toi.*bo trong|tron chu the.*chua biet action nao la cua toi|context.*reactions.*actually did.*missing)/,d))return'input:clarification-required';
  if(has(/(?:instruction.*choice.*hands|replace my judgement|dung dua tradeoff.*quyet ho toi|direct command.*judgement)/,d))return'input:decision-request';
  if(has(/(?:invented example.*toi khong tham gia|tinh huong sau.*invented example.*khong tham gia)/,d))return'input:hypothetical-or-example';
  if(has(/(?:cam xuc kin.*khong quan sat duoc|private feelings?.*ve toi.*hien tai|private feelings?.*about me.*right now)/,d))return'input:third-party-only';
  if(has(/(?:ket qua sap toi.*mong doi|turn out the way i hope|ket qua cuoi cung.*nghieng ve phia toi|final outcome.*in my favour)/,d))return'input:prediction';
  return null;
}
function familyRepair(d){
  const ready=has(/(?:reversible first step|thu nghiem nho.*dao nguoc|buoc thu nho.*an toan|buoc nho.*quay lai|modest experiment.*ready|small experiment.*reversible|small step.*reversible)/,d);
  const delay=has(/(?:comparing alternatives.*instead of starting|mo them option.*chua bat dau|tim them lua chon.*tri hoan|so sanh mai|postponed action.*keep more options open|keep more options open|comparing.*instead of starting|mo them.*lua chon.*chua bat dau)/,d);
  return ready&&delay?{matched:true,families:['freeze'],sequence:false}:{matched:false,families:[],sequence:false};
}
function analyze(raw,domain='other',subtopic=null){
  const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeRepair(d),own=familyRepair(d),route=rid||(own.matched?'input:self-lived':base.input_route?.id);
  let families=[...(base.families||[])],sequence=!!base.sequence;
  if(rid){families=[];sequence=false;}else if(own.matched){families=['freeze'];sequence=false;}
  const input_route=routeFrame(route,base.input_route);
  return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families,sequence,oscillation:sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_177_V176_V1_BOUNDED_MECHANISM_REPAIR',v177:{route,families:[...families],sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v26-v177-v176-v1-bounded-mechanism-repair'})};
global.QCSemanticCoreV46=core;global.PSC_V83177=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.177:v176-v1-bounded-mechanism-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
