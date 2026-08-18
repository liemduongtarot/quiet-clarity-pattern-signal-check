(function(global){
'use strict';
const parent=global.QCSemanticCoreV32;if(!parent)throw new Error('V8.3.164 requires V8.3.163');
const VERSION='V8.3.164-V163-V1-SEALED-A-BOUNDED-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function routeFrame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id);const clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function routeRepair(d){
  if(has(/(?:truoc ngay chot thang.*outcome|before month[- ]end.*outcome|outcome.*muc tieu cua toi|outcome.*go my way)/,d))return'input:prediction';
  if(has(/(?:canh minh hoa khong phai chuyen cua toi|illustrative scene.*not my situation|minh hoa.*khong phai chuyen cua toi)/,d))return'input:hypothetical-or-example';
  if(has(/(?:xac dinh hanh dong chu khong phai.*response cua toi|chon buoc tiep theo toi phai lam thay vi kiem|action command yes no de toi lam theo ngay|action command.*lam theo ngay|determine the action rather than.*my response)/,d))return'input:decision-request';
  if(has(/(?:how do they see me internally|real intention cua ben kia|ben trong nguoi kia dang perceive toi|perceive toi theo cach nao|intention cua ben kia doi voi toi)/,d))return'input:third-party-only';
  if(has(/(?:chua hanh dong nao duoc gan ro voi toi|can bo sung mot viec that minh da lam|trinh tu dang lan phan ung cua toi.*actor chua xac dinh|chua gan vao mot episode.*response quan sat duoc|behavioural response being checked.*unspecified|response being checked.*unspecified)/,d))return'input:clarification-required';
  return null;
}
function familyRepair(d,base){
  if(base.input_route?.id!=='input:self-lived')return{families:[],sequence:false};
  if(has(/(?:cleaning unrelated notes.*not have to touch the task that mattered|cleaned unrelated notes.*avoid.*task that mattered)/,d))return{families:['ignore'],sequence:false};
  if(has(/(?:du evidence cho one testable step.*van.*comparison.*chua start|enough evidence.*testable step.*more comparison.*not started|du evidence.*comparison pages.*chua start)/,d))return{families:['freeze'],sequence:false};
  return{families:[...(base.families||[])],sequence:!!base.sequence};
}
function analyze(raw,domain='other',subtopic=null){
 const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeRepair(d);
 if(rid){const input_route=routeFrame(rid,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_164_V163_V1_SEALED_A_REPAIR',v164:{route:rid,families:[],sequence:false}}};}
 const r=familyRepair(d,base);return{...base,version:VERSION,families:r.families,sequence:r.sequence,oscillation:r.sequence,response_known:r.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_164_V163_V1_SEALED_A_REPAIR',v164:{route:base.input_route?.id,families:[...r.families],sequence:r.sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v13-v164-v163-v1-sealed-a-repair'})};
global.QCSemanticCoreV33=core;global.PSC_V83164=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.164:v163-v1-sealed-a-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
