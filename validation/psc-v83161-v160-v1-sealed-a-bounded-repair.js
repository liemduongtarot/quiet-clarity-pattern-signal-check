(function(global){
'use strict';
const parent=global.QCSemanticCoreV29;if(!parent)throw new Error('V8.3.161 requires V8.3.160');
const VERSION='V8.3.161-V160-V1-SEALED-A-BOUNDED-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function routeFrame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id);const clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function routeRepair(d){
 if(has(/(?:fictional workshop vignette|fictional case study|behaviour illustrative, not mine|it is not my situation)/,d))return'input:hypothetical-or-example';
 if(has(/(?:select the option i should take and replace my own decision|ket luan giup toi nen nhan hay tu choi|pick the option and own the final call|give me the action command directly)/,d))return'input:decision-request';
 if(has(/(?:quyet dinh sau cung co roi ve phia co loi cho toi khong|vai tuan toi.*ket thuc theo huong tot cho toi|doan xem viec nay co duoc duyet som|resolve positively.*within coming weeks)/,d))return'input:prediction';
 if(has(/(?:what they secretly think|judging me internally|bay gio ho nhin toi khac truoc|bay gio ho nhin toi ra sao so voi truoc|cau hoi chi nham vao suy nghi cua nguoi kia)/,d))return'input:third-party-only';
 if(has(/(?:no single moment identifies what i did next|chua neu response toi thuc hien|chua tach duoc phan ung cua toi khoi phan cua nguoi khac|chua selected one episode.*response rieng cua minh|one actual behaviour cua toi linked to one concrete event)/,d))return'input:clarification-required';
 return null;
}
function familyRepair(d,base){
 if(base.input_route?.id!=='input:self-lived')return{families:[],sequence:false};
 if(has(/(?:paused before acting, used the current evidence, and adjusted the response|waited for the concrete facts and then acted at a normal pace)/,d))return{families:[],sequence:false};
 if(has(/(?:chuyen sang viec admin khong lien quan va de chuyen chinh lai sau|quay sang sap xep viec linh tinh de tam de van de chinh sang sau)/,d))return{families:['ignore'],sequence:false};
 if(has(/(?:khong co tin moi.*giu viec do mo.*kiem lai nhieu lan.*de quyet dinh tre them)/,d))return{families:['slow'],sequence:false};
 return{families:[...(base.families||[])],sequence:!!base.sequence};
}
function analyze(raw,domain='other',subtopic=null){
 const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeRepair(d);
 if(rid){const input_route=routeFrame(rid,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_161_V160_V1_SEALED_A_REPAIR',v161:{route:rid,families:[],sequence:false}}};}
 const r=familyRepair(d,base);return{...base,version:VERSION,families:r.families,sequence:r.sequence,oscillation:r.sequence,response_known:r.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_161_V160_V1_SEALED_A_REPAIR',v161:{route:base.input_route?.id,families:[...r.families],sequence:r.sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v10-v161-v160-v1-sealed-a-repair'})};
global.QCSemanticCoreV30=core;global.PSC_V83161=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.161:v160-v1-sealed-a-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
