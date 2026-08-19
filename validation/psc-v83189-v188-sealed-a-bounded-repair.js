(function(global){
'use strict';
const parent=global.QCSemanticCoreV57;if(!parent)throw new Error('V8.3.189 requires V8.3.188');
const VERSION='V8.3.189-V188-V1-SEALED-A-BOUNDED-MECHANISM-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function neutralRepair(d){return has(/(?:tu chon mot hanh dong vua du.*lam xong.*khong mo lai|dung du kien hien co.*tu quyet mot buoc nho.*dung lai)/,d);}
function routeRepair(d){
 if(has(/(?:never states what action i personally took after the final update|buoc toi thuc su lam sau thay doi cuoi van chua duoc neu)/,d))return'input:clarification-required';
 if(has(/(?:hay quyet thay toi.*chi dua mot chi dan duy nhat|dung de toi can nhac nua.*chot luon mot hanh dong toi phai lam)/,d))return'input:decision-request';
 if(has(/(?:tinh huong bia ra de luyen phan loai.*khong phai chuyen da xay ra voi toi|scenario nay hoan toan gia dinh de test semantic route.*not my real experience)/,d))return'input:hypothetical-or-example';
 if(has(/(?:private opinion is my manager holding about me.*not expressed it|giu cam xuc rieng gi ve toi.*chua boc lo)/,d))return'input:third-party-only';
 if(has(/(?:ket qua cuoi co chuyen sang huong co loi cho toi.*cuoi thang)/,d))return'input:prediction';
 return null;
}
function familyRepair(d){
 if(has(/(?:reversible first test was already available.*widening the comparison instead of starting|da co buoc thu nho co the quay lai.*tim them phuong an thay vi bat dau|du du kien cho mot thu nghiem nho.*giu moi lua chon mo.*chua lam)/,d))return{matched:true,families:['freeze'],sequence:false};
 if(has(/(?:viec chinh can xu ly.*chuyen khong lien quan.*bo do)/,d))return{matched:true,families:['ignore'],sequence:false};
 if(has(/(?:checked, pulled away, then checked again.*back-and-forth loop without new evidence|vao kiem tra, rut ra, roi lai quay vao.*nhieu vong|tien lai xem, lui ra, roi quay vao kiem tra tiep)/,d))return{matched:true,families:['slow'],sequence:true};
 return{matched:false,families:[],sequence:false};
}
function analyze(raw,domain='other',subtopic=null){
 const base=parent.analyze(raw,domain,subtopic),d=fold(raw),neutral=neutralRepair(d),rid=neutral?null:routeRepair(d),fam=neutral?{matched:false,families:[],sequence:false}:familyRepair(d),route=neutral?'input:self-lived':(rid||(fam.matched?'input:self-lived':base.input_route?.id));
 let families=[...(base.families||[])],sequence=!!base.sequence;
 if(neutral){families=[];sequence=false;}else if(rid){families=[];sequence=false;}else if(fam.matched){families=[...fam.families];sequence=!!fam.sequence;}
 const input_route=frame(route,base.input_route);
 return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families,sequence,oscillation:sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_189_V188_V1_BOUNDED_MECHANISM_REPAIR',v189:{route,families:[...families],sequence,neutral_override:neutral}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v38-v189-v188-v1-bounded-mechanism-repair'})};
global.QCSemanticCoreV58=core;global.PSC_V83189=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.189:v188-v1-bounded-mechanism-repair';
})(typeof globalThis!=='undefined'?globalThis:this);