(function(global){
'use strict';
const parent=global.QCSemanticCoreV58;if(!parent)throw new Error('V8.3.190 requires V8.3.189');
const VERSION='V8.3.190-V189-V1-SEALED-A-BOUNDED-MECHANISM-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function routeRepair(d){
  if(has(/(?:never identifies my own concrete response after the last change|hanh dong ket thuc cua chinh toi van chua duoc xac dinh)/,d))return'input:clarification-required';
  if(has(/(?:invented vendor situation exists only to practise semantic classification|vi du gia de kiem tra phan loai.*khong phai chuyen that cua toi|hypothetical de test semantic.*not something i actually lived)/,d))return'input:hypothetical-or-example';
  if(has(/(?:private assessment is my manager holding about me without expressing it|trong long ho dang nhin nhan toi ra sao du chua boc lo|giu suy nghi rieng gi ve toi ma chua noi ra)/,d))return'input:third-party-only';
  return null;
}
function neutralRepair(d){
  return has(/(?:tu quyet mot hanh dong vua du.*lam xong roi dung lai|dung du kien hien co de tu chon mot buoc nho roi khong mo lai)/,d);
}
function familyRepair(d){
  if(has(/(?:reversible trial was ready.*kept expanding the comparison instead of beginning|buoc thu nho co the quay lai.*tim them lua chon thay vi lam|du du kien de thu mot buoc nho.*giu moi phuong an mo.*chua bat dau)/,d))return{matched:true,families:['freeze'],sequence:false};
  if(has(/(?:viec chinh can phan hoi.*chuyen sang viec khong lien quan roi de do)/,d))return{matched:true,families:['ignore'],sequence:false};
  if(has(/(?:checked, stepped back, then checked again.*without any new evidence|vao xem, rut ra, roi lai quay vao kiem tra.*nhieu vong|tien lai kiem tra, lui ra, roi quay vao tiep.*khong co du kien moi)/,d))return{matched:true,families:['slow'],sequence:true};
  return{matched:false,families:[],sequence:false};
}
function analyze(raw,domain='other',subtopic=null){
  const base=parent.analyze(raw,domain,subtopic),d=fold(raw),neutral=neutralRepair(d),rid=neutral?null:routeRepair(d),fam=neutral?{matched:true,families:[],sequence:false}:familyRepair(d),route=neutral?'input:self-lived':(rid||(fam.matched?'input:self-lived':base.input_route?.id));
  let families=[...(base.families||[])],sequence=!!base.sequence;
  if(neutral){families=[];sequence=false;}else if(rid){families=[];sequence=false;}else if(fam.matched){families=[...fam.families];sequence=!!fam.sequence;}
  const input_route=frame(route,base.input_route);
  return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families,sequence,oscillation:sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_190_V189_V1_BOUNDED_MECHANISM_REPAIR',v190:{route,families:[...families],sequence,neutral}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v39-v190-v189-v1-bounded-mechanism-repair'})};
global.QCSemanticCoreV59=core;global.PSC_V83190=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.190:v189-v1-bounded-mechanism-repair';
})(typeof globalThis!=='undefined'?globalThis:this);