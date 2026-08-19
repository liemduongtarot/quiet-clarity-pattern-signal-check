(function(global){
'use strict';
const parent=global.QCSemanticCoreV37;if(!parent)throw new Error('V8.3.169 requires V8.3.168');
const VERSION='V8.3.169-V168-V1-SEALED-A-MECHANISM-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function routeFrame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function explicitIntent(d){
  // Missing-own-response / unresolved-actor language must outrank incidental future/choice tokens.
  if(has(/(?:situation is clear.*personally did immediately afterward.*missing|tinh huong da ro.*viec toi that su lam ngay sau do.*con thieu|relevant actor remains uncertain.*choice.*actually mine|actor lien quan.*chua chac.*choice.*cua toi|listed.*reactions?.*never said which.*actually|liet ke.*reaction.*chua noi.*cai nao.*thuc su lam|background.*chua neu.*behaviour cu the.*chinh minh)/,d))return'input:clarification-required';
  return null;
}
function ownFamily(d){
  // Mechanism-level first-person behavioural evidence; tolerate mixed-language and no-diacritic wording.
  if(has(/(?:testable next step.*(?:keo dai|extend|kept).*comparison|biet.*testable next step.*comparison|enough.*(?:test|try).*step.*(?:comparison|research)|du.*(?:du kien|information).*test.*buoc.*(?:comparison|research))/,d))return{matched:true,families:['freeze'],sequence:false};
  if(has(/(?:housekeeping.*(?:uu tien thap|low.priority).*(?:task|viec).*(?:quan trong|important).*(?:nguyen|untouched)|(?:chuyen sang|switched to).*housekeeping.*(?:de|leave).*(?:task|viec).*(?:quan trong|important)|(?:peripheral|minor|low.priority).*(?:files?|admin).*(?:main issue|important task|task quan trong).*(?:untouched|nguyen|de lai))/,d))return{matched:true,families:['ignore'],sequence:false};
  return{matched:false,families:[],sequence:false};
}
function analyze(raw,domain='other',subtopic=null){
  const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=explicitIntent(d),own=ownFamily(d);
  const route=rid||(own.matched?'input:self-lived':base.input_route?.id);
  const fam=route==='input:self-lived'?(own.matched?own:{matched:false,families:[...(base.families||[])].filter(x=>x!=='adaptive'),sequence:!!base.sequence}):{families:[],sequence:false};
  const input_route=routeFrame(route,base.input_route);
  return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:fam.families,sequence:!!fam.sequence,oscillation:!!fam.sequence,response_known:fam.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_169_V168_V1_MECHANISM_REPAIR',v169:{route,families:[...fam.families],sequence:!!fam.sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v18-v169-v168-v1-mechanism-repair'})};
global.QCSemanticCoreV38=core;global.PSC_V83169=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.169:v168-v1-mechanism-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
