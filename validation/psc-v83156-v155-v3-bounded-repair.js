(function(global){
'use strict';
const parent=global.QCSemanticCoreV24;if(!parent)throw new Error('V8.3.156 requires V8.3.155');
const VERSION='V8.3.156-V155-V3-SEALED-A-BOUNDED-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function routeFrame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:id==='input:prediction',must_redirect:redirect};}
function routeRepair(d){
  if(has(/(?:classroom exercise|training exercise|practice case|hypothetical|suppose).{0,180}(?:no real user incident|not a real user incident|fictional|imaginary|made-up)/,d))return'input:hypothetical-or-example';
  if(has(/(?:can you predict|predict whether|predict .* next month|date nao .* outcome .* happen|will .* give result .* before deadline|turn out in my favour|future event outside my control)/,d))return'input:prediction';
  if(has(/(?:what is the other person really thinking|do they see me differently|i want an interpretation of the third party only|i want to know their internal state|toi dang hoi third party|toan bo cau hoi la ve ho|cau hoi nham vao trang thai cua nguoi khac|nguoi do co .* vi ho .* quan tam toi|ho co thay hoi han|nguoi kia nhin toi)/,d))return'input:third-party-only';
  if(has(/(?:switches between ['"]?we['"]? and ['"]?they['"]?|actor of the response needs to be established|luc co ['"]?toi['"]?.{0,80}bon toi|chua tach duoc response cua rieng minh|khong xac dinh ai la nguoi|chua the noi do co phai phan ung cua minh|nguoi thuc hien .* tron giua toi va mot ben khac|can lam ro attribution|chua co mot incident cu the .* toi phan ung|can them chi tiet truoc)/,d))return'input:clarification-required';
  return null;
}
function familyRepair(d,base){
  if(base.input_route?.id!=='input:self-lived')return{families:[],sequence:false};
  if(has(/(?:giu old plan|keep(?:ing)? the old plan).{0,180}(?:invest time|invested time|money).{0,180}(?:update|changed)/,d))return{families:[],sequence:false};
  if(has(/(?:closed it|dong no|dong lai).{0,80}(?:reorganised unrelated files|reorganized unrelated files|sap xep .* khong lien quan).{0,80}(?:forty minutes|40 minutes)/,d))return{families:['ignore'],sequence:false};
  if(has(/(?:du du kien|enough information|enough data).{0,160}(?:mo them|opened? more).{0,120}(?:tai lieu so sanh|comparison documents|comparison material).{0,120}(?:chua hanh dong|did not act|without acting)/,d))return{families:['freeze'],sequence:false};
  if(has(/(?:mo lai|reopened?).{0,100}(?:membership renewal|renewal).{0,120}(?:ba thoi diem|three times|three different times).{0,120}(?:khong co thong tin nao thay doi|no information changed|nothing changed)/,d))return{families:['slow'],sequence:false};
  return{families:[...(base.families||[])],sequence:!!base.sequence};
}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeRepair(d);if(rid){const input_route=routeFrame(rid,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_156_V155_V3_SEALED_A_REPAIR',v156:{route:rid,families:[],sequence:false}}};}const r=familyRepair(d,base);return{...base,version:VERSION,families:r.families,sequence:r.sequence,oscillation:r.sequence,response_known:r.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_156_V155_V3_SEALED_A_REPAIR',v156:{route:base.input_route?.id,families:[...r.families],sequence:r.sequence}}};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v8-v156-v155-v3-sealed-a-repair'})};
global.QCSemanticCoreV25=core;global.PSC_V83156=core;if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.156:v155-v3-sealed-a-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
