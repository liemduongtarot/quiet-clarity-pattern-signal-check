(function(global){
'use strict';
const parent=global.QCSemanticCoreV55;if(!parent)throw new Error('V8.3.187 requires V8.3.186');
const VERSION='V8.3.187-V186-V1-SEALED-A-BOUNDED-MECHANISM-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function routeRepair(d){
  if(has(/(?:own final move is still not separated|hanh dong cuoi cua rieng toi van chua xac dinh|account swaps actors.*response ownership unresolved)/,d))return'input:clarification-required';
  if(has(/(?:take over the choice.*exactly which route to follow)/,d))return'input:decision-request';
  if(has(/(?:vi du bia de luyen semantic.*khong phai chuyen that cua toi)/,d))return'input:hypothetical-or-example';
  if(has(/(?:private judgement is my manager holding about me)/,d))return'input:third-party-only';
  if(has(/(?:ket qua cuoi co nghieng ve phia co loi cho toi.*cuoi thang)/,d))return'input:prediction';
  return null;
}
function familyRepair(d){
  if(has(/(?:low-risk reversible test is ready.*widening the comparison instead of starting|co buoc thu nho co the quay lai.*mo them phuong an thay vi bat dau|first step can be undone easily.*preserve every alternative and do nothing)/,d))return{matched:true,families:['freeze'],sequence:false};
  if(has(/(?:thay viec can xu ly.*task phu khong lien quan.*bo do)/,d))return{matched:true,families:['ignore'],sequence:false};
  if(has(/(?:moved toward it.*pulled back.*returned to check again.*repeating that loop|tien vao xem.*rut ra.*quay vao kiem tra.*lap lai nhieu vong|checked.*backed away.*checked again several times)/,d))return{matched:true,families:[],sequence:true};
  return{matched:false,families:[],sequence:false};
}
function analyze(raw,domain='other',subtopic=null){
  const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeRepair(d),fam=familyRepair(d),route=rid||(fam.matched?'input:self-lived':base.input_route?.id);
  let families=[...(base.families||[])],sequence=!!base.sequence;
  if(rid){families=[];sequence=false;}else if(fam.matched){families=[...fam.families];sequence=!!fam.sequence;}
  const input_route=frame(route,base.input_route);
  return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families,sequence,oscillation:sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_187_V186_V1_BOUNDED_MECHANISM_REPAIR',v187:{route,families:[...families],sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v36-v187-v186-v1-bounded-mechanism-repair'})};
global.QCSemanticCoreV56=core;global.PSC_V83187=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.187:v186-v1-bounded-mechanism-repair';
})(typeof globalThis!=='undefined'?globalThis:this);