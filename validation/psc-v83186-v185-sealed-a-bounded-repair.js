(function(global){
'use strict';
const parent=global.QCSemanticCoreV54;if(!parent)throw new Error('V8.3.186 requires V8.3.185');
const VERSION='V8.3.186-V185-V1-SEALED-A-BOUNDED-MECHANISM-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function routeRepair(d){
  if(has(/(?:never isolates my own last response|final observable action is still unidentified|phan ung cuoi cua rieng toi van chua duoc tach ra|van thieu hanh vi quan sat duoc cua chinh toi sau do)/,d))return'input:clarification-required';
  if(has(/(?:do the deciding for me.*only want the instruction i should follow)/,d))return'input:decision-request';
  if(has(/(?:chi la case bia.*de luyen phan loai|tinh huong nay duoc dung len de test semantic.*khong phai trai nghiem that)/,d))return'input:hypothetical-or-example';
  if(has(/(?:unspoken view does my manager hold about me|inner assessment of me.*not anything i did|trong long nguoi do dang nhin nhan toi the nao.*chua noi ra)/,d))return'input:third-party-only';
  if(has(/(?:ket qua cuoi co thuan loi cho toi.*truoc khi het thang)/,d))return'input:prediction';
  return null;
}
function familyRepair(d){
  if(has(/(?:reversible trial is available.*keep expanding the comparison instead of running it|first experiment is easy to reverse.*keep every alternative alive and do nothing|da co buoc thu co the quay lai.*van mo rong them phuong an thay vi lam)/,d))return{matched:true,families:['freeze'],sequence:false};
  if(has(/(?:thay vi phan hoi.*task phu chang lien quan)/,d))return{matched:true,families:['ignore'],sequence:false};
  return{matched:false,families:[],sequence:false};
}
function analyze(raw,domain='other',subtopic=null){
  const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeRepair(d),fam=familyRepair(d),route=rid||(fam.matched?'input:self-lived':base.input_route?.id);
  let families=[...(base.families||[])],sequence=!!base.sequence;
  if(rid){families=[];sequence=false;}else if(fam.matched){families=[...fam.families];sequence=false;}
  const input_route=frame(route,base.input_route);
  return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families,sequence,oscillation:sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_186_V185_V1_BOUNDED_MECHANISM_REPAIR',v186:{route,families:[...families],sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v35-v186-v185-v1-bounded-mechanism-repair'})};
global.QCSemanticCoreV55=core;global.PSC_V83186=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.186:v185-v1-bounded-mechanism-repair';
})(typeof globalThis!=='undefined'?globalThis:this);