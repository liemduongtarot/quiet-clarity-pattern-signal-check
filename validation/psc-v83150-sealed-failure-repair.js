(function(global){
'use strict';
const parent=global.QCSemanticCoreV18;if(!parent)throw new Error('V8.3.150 repair requires V8.3.149');
const VERSION='V8.3.150-V149-SEALED-A-BOUNDED-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s),uniq=a=>[...new Set(a||[])];
function routeFrame(id,prev){const redirect=['input:safety','input:prediction','input:decision-request','input:hypothetical-or-example'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:safety','input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function routeOverride(d){
  if(has(/(?:i feel overloaded|cam thay qua tai|toi dang lo|toi thay that vong).{0,120}(?:not said what i actually do|have not said what i actually do|chua neu hanh dong|chua mo ta viec|khong co bang chung hanh vi rieng|khong ro do la toi hay|khong ro .* toi hay)/,d))return'input:clarification-required';
  if(has(/(?:another paragraph|doan khac|mot doan khac).{0,100}(?:colleague|dong nghiep|nguoi khac).{0,120}(?:never resolves|khong giai quyet|khong ro|which account|which version|doan nao dung)/,d))return'input:clarification-required';
  if(has(/(?:khong co bang chung hanh vi rieng|no separate behavioural evidence|no separate behavioral evidence).{0,140}(?:khong ro|unclear).{0,90}(?:toi hay|me or|nguoi yeu|colleague|someone else)/,d))return'input:clarification-required';
  if(has(/(?:theo ban|theo may|tell me straight|should i|do i).{0,30}(?:nen|should|challenge|pay|khieu nai|tra).{0,130}(?:hay|or).{0,120}/,d))return'input:decision-request';
  if(has(/(?:case study|bai tap|role[- ]?play|simulation|gia su|for illustration|for example).{0,220}(?:nguoi mua|sinh vien|student|buyer|mot nguoi|someone).{0,160}/,d))return'input:hypothetical-or-example';
  if(has(/(?:khi nao|bao lau nua|bao lau|bao gio).{0,120}(?:se nhan lai|moi cho toi lich hen|moi co lich hen|will .* reply|hospital|benh vien|nguoi yeu).{0,100}/,d))return'input:prediction';
  if(has(/^(?:my brother|my sister|my cousin|a customer|mot khach hang|upstairs tenant|nguoi thue phong ben canh).{0,220}(?:his|her|cua anh ay|cua co ay|decision was entirely his|khong phai person|toi chi hoi ve hanh dong|toi chi hoi ve|not my action)/,d))return'input:third-party-only';
  if(has(/(?:decision was entirely his|decision was entirely hers|toi khong phai person delaying it|khong phai person delaying it|toi chi hoi ve hanh dong cua co ay|toi chi hoi ve hanh dong cua anh ay)/,d))return'input:third-party-only';
  return null;
}
function familyRepair(d,base){
  if(base.input_route?.id!=='input:self-lived')return{families:[],sequence:false};
  const explicitNoBehaviour=has(/(?:chua neu hanh dong lap lai|chua neu hanh dong|chua mo ta viec kiem tra lap|chua mo ta .* tri hoan|not said what i actually do|have not said what i actually do|no repeated action|khong co bang chung hanh vi rieng)/,d);
  if(explicitNoBehaviour)return{families:[],sequence:false};
  let f=uniq(base.families||[]),seq=!!base.sequence;
  const ignore=has(/(?:can goi ngan hang|need to call the bank|repair email|email sua chua).{0,140}(?:don anh cu|dọn ảnh cũ|old photos|de chua phai|avoid dealing|unanswered)/,d);
  const adaptive=has(/(?:revised tenancy date|ngay thue da sua|corrected tenancy date|revised date).{0,100}(?:replied|tra loi|reorganised|reorganized|sap xep lai|dieu chinh)/,d);
  if(ignore&&!f.includes('ignore'))f.push('ignore');
  if(adaptive&&!f.includes('adaptive'))f.push('adaptive');
  if(ignore&&adaptive)seq=true;
  f=uniq(f);
  if(f.length<2)seq=false;
  return{families:f,sequence:seq};
}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeOverride(d);if(rid){const input_route=routeFrame(rid,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_150_V149_SEALED_A_REPAIR',v150:{route:rid,families:[],sequence:false}}};}const r=familyRepair(d,base);return{...base,version:VERSION,families:r.families,sequence:r.sequence,oscillation:r.sequence,response_known:r.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_150_V149_SEALED_A_REPAIR',v150:{route:base.input_route?.id,families:[...r.families],sequence:r.sequence}}};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v8-v150-v149-sealed-a-repair'})};
global.QCSemanticCoreV19=core;global.PSC_V83150=core;if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.150:v149-sealed-a-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
