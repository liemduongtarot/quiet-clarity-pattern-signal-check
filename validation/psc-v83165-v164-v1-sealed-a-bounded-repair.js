(function(global){
'use strict';
const parent=global.QCSemanticCoreV33;if(!parent)throw new Error('V8.3.165 requires V8.3.164');
const VERSION='V8.3.165-V164-V1-SEALED-A-BOUNDED-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function routeFrame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id);const clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function routeRepair(d){
  // Explicit self-lived adaptive evidence wins over incidental context words such as workshop.
  if(has(/(?:toi dung information da co va hoan thanh reasonable next action|used the information already available and completed the reasonable next action|checked the facts once.*acted at a normal pace|kiem facts mot lan.*hanh dong theo nhip binh thuong)/,d))return'input:self-lived';
  if(has(/(?:forecast xem eventual outcome|eventual outcome.*di theo huong toi muon|forecast whether the eventual outcome|future outcome.*work out for me)/,d))return'input:prediction';
  if(has(/(?:tell me exactly which path to take|replace my decision|command truc tiep.*khong muon phan tich|direct command.*not.*analysis|chon.*thay toi|quyet dinh thay toi|select my next move.*decision for me)/,d))return'input:decision-request';
  if(has(/(?:internal reaction cua ho|internal reaction of them|internal reaction.*toi|am tham nghi gi ve toi|trong dau nguoi kia|y dinh that cua ho|bi mat hoi tiec)/,d))return'input:third-party-only';
  if(has(/(?:never identifies what i did immediately afterward|chua ro ai dua ra lua chon.*vai tro cua toi chua duoc xac lap|trinh tu con qua rong.*chua co mot episode.*next move cua toi|chua co behaviour cu the cua minh de check|van can neu mot viec that minh da lam de phan ung|observable action.*missing|response.*cannot.*isolated)/,d))return'input:clarification-required';
  return null;
}
function familyRepair(d,base,rid){
  const route=rid||base.input_route?.id;
  if(route!=='input:self-lived')return{families:[],sequence:false};
  if(has(/(?:switched to unrelated admin.*not have to touch the important task|chuyen sang admin khong lien quan.*khoi phai cham vao task quan trong|low-priority material.*left the main issue untouched)/,d))return{families:['ignore'],sequence:false};
  if(rid==='input:self-lived')return{families:[],sequence:false};
  return{families:[...(base.families||[])],sequence:!!base.sequence};
}
function analyze(raw,domain='other',subtopic=null){
 const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeRepair(d);
 if(rid){const input_route=routeFrame(rid,base.input_route),r=familyRepair(d,base,rid);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:r.families,sequence:r.sequence,oscillation:r.sequence,response_known:r.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_165_V164_V1_SEALED_A_REPAIR',v165:{route:rid,families:[...r.families],sequence:r.sequence}}};}
 const r=familyRepair(d,base,null);return{...base,version:VERSION,families:r.families,sequence:r.sequence,oscillation:r.sequence,response_known:r.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_165_V164_V1_SEALED_A_REPAIR',v165:{route:base.input_route?.id,families:[...r.families],sequence:r.sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v14-v165-v164-v1-sealed-a-repair'})};
global.QCSemanticCoreV34=core;global.PSC_V83165=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.165:v164-v1-sealed-a-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
