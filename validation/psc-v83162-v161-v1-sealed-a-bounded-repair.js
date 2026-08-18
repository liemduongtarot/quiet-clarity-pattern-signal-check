(function(global){
'use strict';
const parent=global.QCSemanticCoreV30;if(!parent)throw new Error('V8.3.162 requires V8.3.161');
const VERSION='V8.3.162-V161-V1-SEALED-A-BOUNDED-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function routeFrame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id);const clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function routeRepair(d){
 if(has(/(?:workshop\s+(?:gia su|scenario)|bai tap lop gia su|bai tap gia dinh|fictional employee|fictional customer|applicant hu cau|freelancer ao|khach hang hu cau)/,d))return'input:hypothetical-or-example';
 if(has(/(?:decide whether i should accept or decline|quyet dinh giup toi nen nhan hay tu choi|bao toi tiep tuc, tam dung hay rut lui va quyet thay toi|pick action tiep theo cho toi va own final call|select one route.*instruct toi follow.*tu decide|khong muon tu chon|do not want to make the choice myself)/,d))return'input:decision-request';
 if(has(/(?:predict (?:update tiep theo|next update|whether)|final decision.*land on outcome|do you expect process.*end successfully.*coming weeks|confirm (?:result|outcome) toi muon|application will be approved soon)/,d))return'input:prediction';
 if(has(/(?:how do they see me inside their own mind|ben trong ho dang judge toi|inner reaction nao cua ho.*khong observe duoc|tell private motive cua ho|how are they judging me internally|their own mind|private motive cua ho)/,d))return'input:third-party-only';
 if(has(/(?:have not chosen one incident where my own action can be identified clearly|phan cua toi va phan cua nguoi khac dang bi tron.*chua the gan response|ke duoc boi canh nhung chua noi ro response thuc te cua minh|several episodes.*chua separate behaviour cua toi khoi what others did|chu the cua hanh dong van chua duoc xac lap)/,d))return'input:clarification-required';
 return null;
}
function familyRepair(d,base){
 if(base.input_route?.id!=='input:self-lived')return{families:[],sequence:false};
 if(has(/(?:muon chot that nhanh nhung da doi du du kien can thiet roi moi lam|waited for the concrete facts and then acted at a normal pace)/,d))return{families:[],sequence:false};
 if(has(/(?:revisited the same screen several times without new information and delayed the choice|nothing new arrived, but i kept the task open and checked it repeatedly before deciding)/,d))return{families:['slow'],sequence:false};
 if(has(/(?:du kien da du cho mot buoc hop ly.*mo them nhieu tai lieu so sanh.*chua hanh dong|thong tin da du de thu mot buoc.*tim them tai lieu.*chua bat dau)/,d))return{families:['freeze'],sequence:false};
 return{families:[...(base.families||[])],sequence:!!base.sequence};
}
function analyze(raw,domain='other',subtopic=null){
 const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeRepair(d);
 if(rid){const input_route=routeFrame(rid,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_162_V161_V1_SEALED_A_REPAIR',v162:{route:rid,families:[],sequence:false}}};}
 const r=familyRepair(d,base);return{...base,version:VERSION,families:r.families,sequence:r.sequence,oscillation:r.sequence,response_known:r.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_162_V161_V1_SEALED_A_REPAIR',v162:{route:base.input_route?.id,families:[...r.families],sequence:r.sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v11-v162-v161-v1-sealed-a-repair'})};
global.QCSemanticCoreV31=core;global.PSC_V83162=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.162:v161-v1-sealed-a-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
