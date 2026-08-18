(function(global){
'use strict';
const parent=global.QCSemanticCoreV28;if(!parent)throw new Error('V8.3.160 requires V8.3.159');
const VERSION='V8.3.160-V159-V2-SEALED-A-BOUNDED-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function routeFrame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id);const clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function routeRepair(d){
 if(has(/(?:for training, suppose|chi de training, tuong tuong|training vignette|invented manager|imaginary applicant|applicant ao|khong phai personal evidence|khong phai situation cua toi)/,d))return'input:hypothetical-or-example';
 if(has(/(?:instruction yes-or-no|select action|accept hay decline|decide on my behalf|decide giup toi|replace my choice|action selection from you|khong muon check response cua toi|khong phai check response)/,d))return'input:decision-request';
 if(has(/(?:forecast whether next month's result|future outcome likely to go my way|forecast xem result thang sau|con bao lau nua.*ket qua tich cuc|predict whether this will be approved soon)/,d))return'input:prediction';
 if(has(/(?:what feelings are they hiding|how do they see me now|other person's mind|private intention cua ho|secretly nghi gi|internal state cua ho|target is their internal state|requested target is the other person's mind)/,d))return'input:third-party-only';
 if(has(/(?:chua chon mot lan co response rieng cua minh|chua incident nao gan ro voi mot hanh vi cua toi|one concrete action cua toi gan voi one event|actor who made the choice.*not established|chu the dua ra quyet dinh.*chua duoc xac lap)/,d))return'input:clarification-required';
 return null;
}
function familyRepair(d,base){
 if(base.input_route?.id!=='input:self-lived')return{families:[],sequence:false};
 if(has(/(?:van kiem du kien vua du roi xu ly theo nhip phu hop|khong ne va khong ep chot|check facts enough.*appropriate pace)/,d))return{families:[],sequence:false};
 if(has(/(?:du lieu hien co da du cho mot buoc thu.*van mo them nhieu tai lieu.*chua chon hanh dong|facts da du cho one testable step.*collect them comparison material.*postpone action)/,d))return{families:['freeze'],sequence:false};
 return{families:[...(base.families||[])],sequence:!!base.sequence};
}
function analyze(raw,domain='other',subtopic=null){
 const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeRepair(d);
 if(rid){const input_route=routeFrame(rid,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_160_V159_V2_SEALED_A_REPAIR',v160:{route:rid,families:[],sequence:false}}};}
 const r=familyRepair(d,base);return{...base,version:VERSION,families:r.families,sequence:r.sequence,oscillation:r.sequence,response_known:r.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_160_V159_V2_SEALED_A_REPAIR',v160:{route:base.input_route?.id,families:[...r.families],sequence:r.sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v9-v160-v159-v2-sealed-a-repair'})};
global.QCSemanticCoreV29=core;global.PSC_V83160=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.160:v159-v2-sealed-a-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
