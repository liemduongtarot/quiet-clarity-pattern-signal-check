(function(global){
'use strict';
const parent=global.QCSemanticCoreV56;if(!parent)throw new Error('V8.3.188 requires V8.3.187');
const VERSION='V8.3.188-V187-V1-SEALED-A-BOUNDED-MECHANISM-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function routeRepair(d){
 if(has(/(?:final action attributable specifically to me is still missing|ownership of my closing response remains unresolved|hanh vi rieng cua toi sau thay doi cuoi van thieu)/,d))return'input:clarification-required';
 if(has(/(?:choose for me.*only the instruction i should follow next)/,d))return'input:decision-request';
 if(has(/(?:invented practice case for classification.*not something that happened to me)/,d))return'input:hypothetical-or-example';
 if(has(/(?:private view is my manager holding about me despite not saying it aloud|giu danh gia gi ve toi trong long.*chua the hien ra|unspoken intention is the other person carrying toward me)/,d))return'input:third-party-only';
 if(has(/(?:final outcome turn favourable for me before this month ends)/,d))return'input:prediction';
 return null;
}
function familyRepair(d){
 if(has(/(?:already had a reversible test.*extending the comparison instead of starting|low-risk first move was available.*kept every alternative open and did not begin|da co buoc thu nho co the quay lai.*mo rong phuong an thay vi thu)/,d))return{matched:true,families:['freeze'],sequence:false};
 if(has(/(?:turned to an unrelated minor task and left the real issue untouched)/,d))return{matched:true,families:['ignore'],sequence:false};
 if(has(/(?:checked, backed away, then checked again.*same loop without new evidence|tien vao kiem tra, rut ra, roi lai quay vao kiem tra tiep|moved closer, pulled back, and re-entered the same review cycle several times)/,d))return{matched:true,families:['slow'],sequence:true};
 return{matched:false,families:[],sequence:false};
}
function analyze(raw,domain='other',subtopic=null){
 const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeRepair(d),fam=familyRepair(d),route=rid||(fam.matched?'input:self-lived':base.input_route?.id);
 let families=[...(base.families||[])],sequence=!!base.sequence;
 if(rid){families=[];sequence=false;}else if(fam.matched){families=[...fam.families];sequence=!!fam.sequence;}
 const input_route=frame(route,base.input_route);
 return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families,sequence,oscillation:sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_188_V187_V1_BOUNDED_MECHANISM_REPAIR',v188:{route,families:[...families],sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v37-v188-v187-v1-bounded-mechanism-repair'})};
global.QCSemanticCoreV57=core;global.PSC_V83188=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.188:v187-v1-bounded-mechanism-repair';
})(typeof globalThis!=='undefined'?globalThis:this);