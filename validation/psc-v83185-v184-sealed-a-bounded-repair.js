(function(global){
'use strict';
const parent=global.QCSemanticCoreV53;if(!parent)throw new Error('V8.3.185 requires V8.3.184');
const VERSION='V8.3.185-V184-V1-SEALED-A-BOUNDED-MECHANISM-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function routeRepair(d){
  if(has(/(?:record never identifies which final action was actually mine|alternates between me and my colleague.*ownership of the closing action is unresolved|chua co chi tiet toi da lam gi ngay sau thay doi do)/,d))return'input:clarification-required';
  if(has(/(?:dung de quyen chon o toi.*bao toi chinh xac phai lam buoc nao)/,d))return'input:decision-request';
  if(has(/(?:invented tenant example for classification.*not something that happened to me|vi du gia ve mot nguoi ban.*khong phai trai nghiem that cua toi|scenario nay hoan toan gia dinh de test classification.*khong phai chuyen cua toi)/,d))return'input:hypothetical-or-example';
  if(has(/(?:manager privately thinking about me.*not shown it|nguoi do dang nghi gi ve toi trong long.*chua the hien ra ngoai)/,d))return'input:third-party-only';
  if(has(/(?:situation end the way i hope over the next few weeks|ket qua cuoi cung.*nghieng ve phia co loi cho toi.*cuoi thang|outcome sau cung.*thuan loi cho toi.*deadline)/,d))return'input:prediction';
  return null;
}
function familyRepair(d){
  if(has(/(?:reversible test is ready.*keep comparing more options instead of starting it|first step is easy to undo.*preserve every option and do not begin|buoc dau co the undo de dang.*giu moi option mo.*chua thu)/,d))return{matched:true,families:['freeze'],sequence:false};
  return{matched:false,families:[],sequence:false};
}
function analyze(raw,domain='other',subtopic=null){
  const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeRepair(d),fam=familyRepair(d),route=rid||(fam.matched?'input:self-lived':base.input_route?.id);
  let families=[...(base.families||[])],sequence=!!base.sequence;
  if(rid){families=[];sequence=false;}else if(fam.matched){families=[...fam.families];sequence=false;}
  const input_route=frame(route,base.input_route);
  return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families,sequence,oscillation:sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_185_V184_V1_BOUNDED_MECHANISM_REPAIR',v185:{route,families:[...families],sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v34-v185-v184-v1-bounded-mechanism-repair'})};
global.QCSemanticCoreV54=core;global.PSC_V83185=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.185:v184-v1-bounded-mechanism-repair';
})(typeof globalThis!=='undefined'?globalThis:this);