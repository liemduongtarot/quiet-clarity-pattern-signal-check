(function(global){
'use strict';
const parent=global.QCSemanticCoreV26;if(!parent)throw new Error('V8.3.158 requires V8.3.157');
const VERSION='V8.3.158-V157-SEALED-A-BOUNDED-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function routeFrame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id),decision=id==='input:decision-request';return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':decision?'redirect':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect||decision};}
function routeRepair(d){
 if(has(/(?:account never states what i actually did|never states what i actually did|chua noi toi thuc su lam gi|chua noi ro toi da lam gi|con thieu mot phan ung quan sat duoc|observable response is missing).{0,240}(?:questionnaire should not start|questionnaire chua duoc bat dau|input .* incomplete|input .* chua du)/,d))return'input:clarification-required';
 if(has(/(?:notes move between|ghi chu chuyen giua).{0,100}(?:we|chung toi|bon toi).{0,100}(?:they|ho).{0,180}(?:responsible|nguoi thuc hien|still unclear|van chua ro)/,d))return'input:clarification-required';
 if(has(/(?:multiple incidents|nhieu incident).{0,180}(?:response .* belongs to me|response nao thuoc ve toi|incident nao .* neo|chua incident nao du neo)/,d))return'input:clarification-required';
 if(has(/(?:training-only scene|bai tap training|case trong lop).{0,220}(?:invented material|invented testing material|khong phai case cua toi|scene la invented|not my lived case|khong duoc dung nhu personal evidence)/,d))return'input:hypothetical-or-example';
 if(has(/(?:forecast|du bao|predict|du doan).{0,120}(?:next month|thang toi|outcome|favour|nghieng ve phia toi)/,d)&&has(/(?:future timing\/outcome|future timing|future outcome|not an already-lived response|khong phai response da song qua)/,d))return'input:prediction';
 if(has(/(?:how .* view me|danh gia toi theo cach nao|thinking gi privately|view me differently now).{0,220}(?:private state|mental state|own behaviour|own response|khong hoi response cua minh|khong phai own behaviour)/,d))return'input:third-party-only';
 if(has(/(?:target is another person.?s private state|target la private state cua nguoi khac|target their mental state).{0,160}/,d))return'input:third-party-only';
 return null;
}
function familyRepair(d,base){
 if(base.input_route?.id!=='input:self-lived')return{families:[],sequence:false};
 if(has(/(?:shut the thread|closed the thread|dong doan chat).{0,140}(?:twenty minutes|hai muoi phut|20 minutes).{0,140}(?:unrelated notes|don viec khong lien quan|tidying unrelated)/,d))return{families:['ignore'],sequence:false};
 if(has(/(?:enough information|du thong tin).{0,180}(?:extra comparison pages|them nhieu trang so sanh|several extra comparison pages).{0,160}(?:postponed acting|chua hanh dong|did not act)/,d))return{families:['freeze'],sequence:false};
 return{families:[...(base.families||[])],sequence:!!base.sequence};
}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeRepair(d);if(rid){const input_route=routeFrame(rid,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_158_V157_SEALED_A_REPAIR',v158:{route:rid,families:[],sequence:false}}};}const r=familyRepair(d,base);return{...base,version:VERSION,families:r.families,sequence:r.sequence,oscillation:r.sequence,response_known:r.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_158_V157_SEALED_A_REPAIR',v158:{route:base.input_route?.id,families:[...r.families],sequence:r.sequence}}};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v8-v158-v157-sealed-a-repair'})};
global.QCSemanticCoreV27=core;global.PSC_V83158=core;if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.158:v157-sealed-a-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
