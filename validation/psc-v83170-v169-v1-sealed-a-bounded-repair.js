(function(global){
'use strict';
const parent=global.QCSemanticCoreV38;if(!parent)throw new Error('V8.3.170 requires V8.3.169');
const VERSION='V8.3.170-V169-V1-SEALED-A-MECHANISM-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function routeFrame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function explicitIntent(d){
  if(has(/(?:listed several possible reactions?.*(?:did not say|never said).*genuinely carried out|liet ke.*reaction.*chua noi.*(?:that su|thuc su).*(?:lam|thuc hien)|boi canh va cach hieu.*chua co hanh vi cu the.*(?:de kiem|de check))/,d))return'input:clarification-required';
  if(has(/(?:give me one directive.*replaces my own decision|cho toi mot (?:directive|chi thi).*(?:thay|thay the).*(?:own decision|quyet dinh))/,d))return'input:decision-request';
  if(has(/(?:scenario.*only.*illustration.*did not happen to me|tinh huong nay chi (?:ton tai )?de minh hoa.*khong xay ra voi toi)/,d))return'input:hypothetical-or-example';
  if(has(/(?:result.*match what i want.*deadline|ket qua.*(?:dung|khop).*dieu toi muon.*(?:han chot|deadline)|eventual result.*favour.*before.*month|ket qua sau cung.*(?:nghieng|co loi).*(?:het thang|cuoi thang))/,d))return'input:prediction';
  return null;
}
function ownFamily(d){
  if(has(/(?:practical next move.*(?:identifiable|clear|known).*(?:prolonged|extended|kept).*research.*(?:choosing|committing).*uncomfortable|buoc tiep theo.*(?:kha ro|da ro).*(?:tim them phuong an|keo dai research).*(?:chua thoai mai|kho chiu).*(?:chot|chon)|enough evidence.*low.risk test.*(?:them|adding).*comparison.*(?:left|de).*test|du evidence.*low.risk test.*(?:them|gom).*comparison)/,d))return{matched:true,families:['freeze'],sequence:false};
  return{matched:false,families:[],sequence:false};
}
function analyze(raw,domain='other',subtopic=null){
  const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=explicitIntent(d),own=ownFamily(d);
  const route=rid||(own.matched?'input:self-lived':base.input_route?.id);
  const fam=route==='input:self-lived'?(own.matched?own:{matched:false,families:[...(base.families||[])].filter(x=>x!=='adaptive'),sequence:!!base.sequence}):{families:[],sequence:false};
  const input_route=routeFrame(route,base.input_route);
  return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:fam.families,sequence:!!fam.sequence,oscillation:!!fam.sequence,response_known:fam.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_170_V169_V1_MECHANISM_REPAIR',v170:{route,families:[...fam.families],sequence:!!fam.sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v19-v170-v169-v1-mechanism-repair'})};
global.QCSemanticCoreV39=core;global.PSC_V83170=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.170:v169-v1-mechanism-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
