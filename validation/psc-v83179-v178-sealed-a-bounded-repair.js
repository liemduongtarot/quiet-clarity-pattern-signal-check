(function(global){
'use strict';
const parent=global.QCSemanticCoreV47;if(!parent)throw new Error('V8.3.179 requires V8.3.178');
const VERSION='V8.3.179-V178-V1-SEALED-A-BOUNDED-MECHANISM-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function routeFrame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function routeRepair(d){
  if(has(/(?:never identified.*concrete action.*took myself|khong co hanh dong cu the cua minh|own behaviour.*chua tach.*nguoi kia|not an observable step attributable to me|background.*not.*observable step.*me)/,d))return'input:clarification-required';
  if(has(/(?:quyet giup toi lua chon|chon luon ho toi|chon thay toi|decide.*on my behalf|option.*decision.*no longer mine)/,d))return'input:decision-request';
  if(has(/(?:vi du bia ra.*khong phai chuyen cua toi|made-up case.*not something i lived|imaginary.*did not happen to me|fictional.*neither.*represents me)/,d))return'input:hypothetical-or-example';
  if(has(/(?:privately thinking.*observable behaviour|suy nghi bi mat.*khong quan sat|hidden thoughts.*(?:dau hieu|observable)|cam thay.*ben trong.*khong boc lo|private emotional state.*toward me|secretly holding.*behind what i can see)/,d))return'input:third-party-only';
  if(has(/(?:cuoi cung outcome.*co loi|chuyen sap toi.*ket thuc dung y|eventual result.*hoping for|ket qua cuoi cung.*thuan loi|end in my favour|ket cuc tuong lai.*hy vong)/,d))return'input:prediction';
  return null;
}
function familyRepair(d){
  const ready=has(/(?:reversible pilot|buoc thu nho.*quay lai|thu.*roi doi lai|san sang.*dao nguoc|reversible test|small.*safe to undo|reversed easily)/,d);
  const delay=has(/(?:comparing alternatives.*rather than starting|tim them phuong an.*tri hoan|so sanh them.*thay vi lam|can nhac them lua chon|preserving more options|search for a better choice|comparing more paths)/,d);
  if(ready&&delay)return{matched:true,families:['freeze'],sequence:false};
  if(has(/(?:switched to low-value admin.*not begin the main task|low-value admin.*main task|viec lat vat.*tranh.*phan quan trong|viec nho.*ne nhiem vu chinh)/,d))return{matched:true,families:['ignore'],sequence:false};
  return{matched:false,families:[],sequence:false};
}
function analyze(raw,domain='other',subtopic=null){
  const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeRepair(d),own=familyRepair(d),route=rid||(own.matched?'input:self-lived':base.input_route?.id);
  let families=[...(base.families||[])],sequence=!!base.sequence;
  if(rid){families=[];sequence=false;}else if(own.matched){families=[...(own.families||[])];sequence=false;}
  const input_route=routeFrame(route,base.input_route);
  return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families,sequence,oscillation:sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_179_V178_V1_BOUNDED_MECHANISM_REPAIR',v179:{route,families:[...families],sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v28-v179-v178-v1-bounded-mechanism-repair'})};
global.QCSemanticCoreV48=core;global.PSC_V83179=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.179:v178-v1-bounded-mechanism-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
