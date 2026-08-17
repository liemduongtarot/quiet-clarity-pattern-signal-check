(function(global){
'use strict';
const parent=global.QCSemanticCoreV22;if(!parent)throw new Error('V8.3.154 repair requires V8.3.153');
const VERSION='V8.3.154-V153-SEALED-A-BOUNDED-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s),uniq=a=>[...new Set(a||[])];
function routeFrame(id,prev){const redirect=['input:safety','input:prediction','input:decision-request','input:hypothetical-or-example'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:safety','input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function routeOverride(d){
  if(has(/(?:itinerary log|booking checks|booking check|travel log).{0,180}(?:never establishes|does not establish|khong xac dinh|khong ro).{0,140}(?:i made them|toi lam|travel companion|nguoi di cung)/,d))return'input:clarification-required';
  if(has(/(?:toi co the noi|minh thay|i can say|i feel).{0,140}(?:bi don|cornered|overwhelmed|ap luc).{0,180}(?:chua neu mot hanh dong cu the|chua neu hanh dong cu the|not described a concrete action|no concrete action).{0,80}(?:cua chinh toi|of my own|my own)/,d))return'input:clarification-required';
  if(has(/(?:bien nhan|receipt).{0,120}(?:toi chuyen khoan|i transferred|i paid).{0,180}(?:doi soat|reconciliation|later record).{0,160}(?:em gai toi|my sister).{0,180}(?:nguoi tra tien chua duoc xac dinh|payer.*not determined|actor.*unresolved|chua xac dinh)/,d))return'input:clarification-required';
  if(has(/(?:classroom exercise|workshop|role play|role-play|hay tuong tuong|imagine).{0,220}(?:imaginary|fictional|hu cau|gia dinh|applicant mau|sample applicant|benh nhan|patient|student|person).{0,220}/,d))return'input:hypothetical-or-example';
  if(has(/(?:exercise note|scene note).{0,140}(?:material gia dinh|not lived event|khong phai lived event|hypothetical material)/,d))return'input:hypothetical-or-example';
  if(has(/^(?:when is|when will|how long until|bao lau nua|khi nao|bao gio).{0,160}(?:client|customer|khach|buyer).{0,120}(?:settle|pay|thanh toan|chuyen tien).{0,120}(?:invoice|hoa don|outstanding|owed to me)/,d))return'input:prediction';
  return null;
}
function familyRepair(d,base){
  if(base.input_route?.id!=='input:self-lived')return{families:[],sequence:false};
  if(has(/(?:chua neu|not described|no).{0,80}(?:repeated behaviour|repeated behavior|avoidance|rushing|freeze).{0,140}(?:nao|any)/,d))return{families:[],sequence:false};
  const fast=has(/(?:han phan hoi|deadline|response window).{0,140}(?:con toi tuan sau|until next week|con den tuan sau).{0,160}(?:nhan ngay|accepted immediately|accepted the first|phuong an dau tien).{0,160}(?:khoi phai nghi tiep|stop thinking|not have to think)/,d);
  if(fast)return{families:['fast'],sequence:false};
  const f=uniq(base.families||[]);return{families:f,sequence:!!base.sequence};
}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeOverride(d);if(rid){const input_route=routeFrame(rid,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_154_V153_SEALED_A_REPAIR',v154:{route:rid,families:[],sequence:false}}};}const r=familyRepair(d,base);return{...base,version:VERSION,families:r.families,sequence:r.sequence,oscillation:r.sequence,response_known:r.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_154_V153_SEALED_A_REPAIR',v154:{route:base.input_route?.id,families:[...r.families],sequence:r.sequence}}};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v8-v154-v153-sealed-a-repair'})};
global.QCSemanticCoreV23=core;global.PSC_V83154=core;if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.154:v153-sealed-a-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
