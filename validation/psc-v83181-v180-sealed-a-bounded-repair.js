(function(global){
'use strict';
const parent=global.QCSemanticCoreV49;if(!parent)throw new Error('V8.3.181 requires V8.3.180');
const VERSION='V8.3.181-V180-V1-SEALED-A-BOUNDED-MECHANISM-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function routeFrame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function routeRepair(d){
  if(has(/(?:no concrete action.*point to as mine|conduct with theirs.*cannot be isolated|observable step is still missing|chua co chi tiet nao.*toi da lam gi|own behaviour.*cannot be isolated|personal action.*still missing)/,d))return'input:clarification-required';
  if(has(/(?:do not want a comparison.*give me the command|give me the command i should follow|command.*rather than comparison)/,d))return'input:decision-request';
  if(has(/(?:nguoi bia ra.*khong phai chuyen cua toi|invented couple.*rather than my own relationship|fictional.*not my own relationship|gia dinh.*nguoi bia ra)/,d))return'input:hypothetical-or-example';
  if(has(/(?:manager'?s private thoughts about me|hidden intention.*person.*toward me|private thoughts.*right now|hidden intention.*currently hold toward me)/,d))return'input:third-party-only';
  if(has(/(?:chuyen nay sau cung.*nghieng ve phia toi|ket thuc thuan theo mong muon|ket cuc gan toi.*ky vong|eventual outcome.*in my favour|ending.*according to what i want)/,d))return'input:prediction';
  return null;
}
function familyRepair(d){
  const neutral=has(/(?:da thu mot buoc nho roi ket thuc.*khong tiep tuc mo them|already completed a small step.*did not keep opening alternatives)/,d);
  if(neutral)return{matched:true,families:[],sequence:false};
  const ready=has(/(?:small reversible move|buoc nho co the undo|test nho du an toan|reversible.*small|co the undo|small.*reversible|test nho.*an toan)/,d);
  const delay=has(/(?:weighing alternatives.*instead of beginning|tim them lua chon.*chua lam|giu option mo.*chua thu|compare.*instead of starting|options open.*not tried|can nhac them.*dung yen)/,d);
  if(ready&&delay)return{matched:true,families:['freeze'],sequence:false};
  return{matched:false,families:[],sequence:false};
}
function analyze(raw,domain='other',subtopic=null){
  const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeRepair(d),own=familyRepair(d),route=rid||(own.matched?'input:self-lived':base.input_route?.id);
  let families=[...(base.families||[])],sequence=!!base.sequence;
  if(rid){families=[];sequence=false;}else if(own.matched){families=[...(own.families||[])];sequence=false;}
  const input_route=routeFrame(route,base.input_route);
  return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families,sequence,oscillation:sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_181_V180_V1_BOUNDED_MECHANISM_REPAIR',v181:{route,families:[...families],sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v30-v181-v180-v1-bounded-mechanism-repair'})};
global.QCSemanticCoreV50=core;global.PSC_V83181=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.181:v180-v1-bounded-mechanism-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
