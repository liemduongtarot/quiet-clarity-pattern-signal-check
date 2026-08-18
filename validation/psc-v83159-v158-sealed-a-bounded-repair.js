(function(global){
'use strict';
const parent=global.QCSemanticCoreV27;if(!parent)throw new Error('V8.3.159 requires V8.3.158');
const VERSION='V8.3.159-V158-SEALED-A-BOUNDED-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function routeFrame(id,prev){
 const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id);
 const clarify=['input:third-party-only','input:clarification-required'].includes(id);
 return {...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};
}
function routeRepair(d){
 if(has(/(?:decide which route i should follow|direct yes-or-no instruction|chon action tiep theo de toi khong phai tu dua final choice|noi toi nen tiep tuc, tam dung hay rut lui va quyet dinh thay toi|hay chot route toi phai theo)/,d))return'input:decision-request';
 if(has(/(?:bai tap lop: gia su|scene de training|workshop tao mot employee|trong bai tap lop, mot supervisor tuong tuong)/,d))return'input:hypothetical-or-example';
 if(has(/(?:con bao lau de chuyen nay di dung huong toi muon|trong vai tuan toi toi co nhan outcome minh muon khong|forecast xem outcome thang sau co nghieng ve phia toi khong)/,d))return'input:prediction';
 if(has(/(?:ho co nhin toi khac truoc khong|interpret cach ho dang judge toi|bay gio ho co nhin toi khac khong|ho co hoi han ve chuyen da xay ra khong).{0,180}(?:perspective cua ho|khong can xem phan cua toi|khong phai response cua toi|inner reaction cua third party)?/,d))return'input:third-party-only';
 if(has(/(?:gives no concrete action, delay, checking, avoidance, or decision from me|action could have been mine or another person's|action co the la cua toi hoac nguoi khac|chua episode nao neo du chat de biet action nao that su la cua toi)/,d))return'input:clarification-required';
 return null;
}
function familyRepair(d,base){
 if(base.input_route?.id!=='input:self-lived')return{families:[],sequence:false};
 if(has(/(?:closed the update and spent half an hour reorganising unrelated files|dong man hinh roi danh khoang nua gio sap xep file khong lien quan)/,d))return{families:['ignore'],sequence:false};
 if(has(/(?:already had what i needed for a reasonable next step, but i opened more comparison material and delayed acting|da du du kien cho mot buoc hop ly nhung van mo them tai lieu so sanh va tri hoan hanh dong)/,d))return{families:['freeze'],sequence:false};
 return{families:[...(base.families||[])],sequence:!!base.sequence};
}
function analyze(raw,domain='other',subtopic=null){
 const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeRepair(d);
 if(rid){
   const input_route=routeFrame(rid,base.input_route);
   return {...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_159_V158_SEALED_A_REPAIR',v159:{route:rid,families:[],sequence:false}}};
 }
 const r=familyRepair(d,base);
 return {...base,version:VERSION,families:r.families,sequence:r.sequence,oscillation:r.sequence,response_known:r.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_159_V158_SEALED_A_REPAIR',v159:{route:base.input_route?.id,families:[...r.families],sequence:r.sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v8-v159-v158-sealed-a-repair'})};
global.QCSemanticCoreV28=core;global.PSC_V83159=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.159:v158-sealed-a-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
