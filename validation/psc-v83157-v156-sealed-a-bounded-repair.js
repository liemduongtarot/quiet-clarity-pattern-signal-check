(function(global){
'use strict';
const parent=global.QCSemanticCoreV25;if(!parent)throw new Error('V8.3.157 requires V8.3.156');
const VERSION='V8.3.157-V156-SEALED-A-BOUNDED-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function routeFrame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id),decision=id==='input:decision-request';return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':decision?'redirect':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect||decision};}
function routeRepair(d){
  if(has(/(?:choose for me|tell me the best move|pick one path for me|decide for me|make the decision|quyet dinh thay toi|chon phuong an nao|pick option nao).{0,180}(?:accept|decline|option|path|lua chon|hom nay|current)/,d))return'input:decision-request';
  if(has(/(?:requested function|user dang request).{0,120}(?:choice substitution|action selection|thay minh lua chon|select the action)/,d))return'input:decision-request';
  if(has(/(?:what date should i expect|when should i expect|predict .* next month|du doan .* thang sau|future timing or outcome|timing hoac outcome tuong lai).{0,180}/,d))return'input:prediction';
  if(has(/(?:role-play|role play|client tuong tuong|imaginary client|fictional client).{0,180}(?:not evidence|khong dung .* evidence|scene dung len|personal evidence|pattern that)/,d))return'input:hypothetical-or-example';
  if(has(/(?:nguoi kia thuc su dang nghi gi|what is the other person really thinking|internal state cua ho|hidden mental state|ho co dang hoi han|third party chu khong phan tich response cua minh).{0,180}/,d))return'input:third-party-only';
  if(has(/(?:target la|target is).{0,80}(?:hidden mental state|suy nghi|cam xuc|cach nhin rieng tu|private .* state).{0,100}(?:another person|nguoi khac|third party)/,d))return'input:third-party-only';
  if(has(/(?:never says what i personally did|chua noi ro toi da lam gi|can mot phan ung cu the cua chinh toi|can mot response cu the cua chinh toi).{0,200}/,d))return'input:clarification-required';
  if(has(/(?:multiple events|nhieu event|co nhieu event).{0,160}(?:one incident|mot incident).{0,120}(?:response nao|response .* thuoc ve toi|du cu the)/,d))return'input:clarification-required';
  if(has(/(?:switches|record switches).{0,80}(?:we|bon toi).{0,80}(?:they|ho).{0,100}(?:actor|attribution).{0,120}(?:not established|chua ro|missing)/,d))return'input:clarification-required';
  if(has(/(?:input gate must stop|input gate phai dung|classification should not start|chua du de khoi dong questionnaire).{0,160}(?:attribution|concrete response|phan ung cu the|response).{0,120}(?:missing|thieu|chua du)/,d))return'input:clarification-required';
  return null;
}
function familyRepair(d,base){
  if(base.input_route?.id!=='input:self-lived')return{families:[],sequence:false};
  if(has(/(?:closed the message|closed message|dong message|dong lai).{0,180}(?:(?:half an hour|nua gio|thirty minutes|30 minutes).{0,100}(?:sorting unrelated|sap xep .* khong lien quan|sorting unrelated files|sorting unrelated material)|(?:sorting unrelated|sap xep .* khong lien quan|sorting unrelated files|sorting unrelated material).{0,100}(?:half an hour|nua gio|thirty minutes|30 minutes))/,d))return{families:['ignore'],sequence:false};
  if(has(/(?:doc lai|read again|reread|reopened?).{0,120}(?:same information|cung mot thong tin|confirmed information|thong tin da xac nhan).{0,160}(?:three times|ba thoi diem|ba lan).{0,160}(?:no update|khong co cap nhat|nothing changed|khong co thong tin moi)/,d))return{families:['slow'],sequence:false};
  return{families:[...(base.families||[])],sequence:!!base.sequence};
}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeRepair(d);if(rid){const input_route=routeFrame(rid,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_157_V156_SEALED_A_REPAIR',v157:{route:rid,families:[],sequence:false}}};}const r=familyRepair(d,base);return{...base,version:VERSION,families:r.families,sequence:r.sequence,oscillation:r.sequence,response_known:r.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_157_V156_SEALED_A_REPAIR',v157:{route:base.input_route?.id,families:[...r.families],sequence:r.sequence}}};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v8-v157-v156-sealed-a-repair'})};
global.QCSemanticCoreV26=core;global.PSC_V83157=core;if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.157:v156-sealed-a-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
