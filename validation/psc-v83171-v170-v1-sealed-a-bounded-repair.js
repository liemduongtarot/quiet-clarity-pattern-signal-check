(function(global){
'use strict';
const parent=global.QCSemanticCoreV39;if(!parent)throw new Error('V8.3.171 requires V8.3.170');
const VERSION='V8.3.171-V170-V1-SEALED-A-MECHANISM-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function routeFrame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function explicitIntent(d){
  if(has(/(?:still need to identify one real action i took|thoughts and feelings without naming one concrete action i performed|own immediate behaviour is missing|own immediate behaviour.*van thieu|viec quan sat duoc do chinh minh lam tiep theo|thoughts va feelings.*chua neu.*concrete action|observable behaviour cua minh)/,d))return'input:clarification-required';
  if(has(/(?:dua ra final choice thay toi.*action nao toi bat buoc phai lam|final choice thay toi.*bat buoc phai lam)/,d))return'input:decision-request';
  if(has(/(?:scenario exists only as an illustration.*did not occur in my life|scenario.*illustration.*did not occur in my life)/,d))return'input:hypothetical-or-example';
  if(has(/(?:trong mind cua nguoi kia.*dien ra dieu gi ve toi|mind cua nguoi kia.*dieu gi ve toi)/,d))return'input:third-party-only';
  return null;
}
function ownFamily(d){
  if(has(/(?:practical experiment (?:da ro|đã rõ).*(?:keo dai|kéo dài) research.*(?:commit|chot|chon).*(?:kho chiu|khó chịu)|practical experiment.*extended research.*(?:commit|choos).*(?:uncomfortable|discomfort))/,d))return{matched:true,families:['freeze'],sequence:false};
  return{matched:false,families:[],sequence:false};
}
function analyze(raw,domain='other',subtopic=null){
  const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=explicitIntent(d),own=ownFamily(d);
  const route=rid||(own.matched?'input:self-lived':base.input_route?.id);
  const fam=route==='input:self-lived'?(own.matched?own:{matched:false,families:[...(base.families||[])].filter(x=>x!=='adaptive'),sequence:!!base.sequence}):{families:[],sequence:false};
  const input_route=routeFrame(route,base.input_route);
  return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:fam.families,sequence:!!fam.sequence,oscillation:!!fam.sequence,response_known:fam.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_171_V170_V1_MECHANISM_REPAIR',v171:{route,families:[...fam.families],sequence:!!fam.sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v20-v171-v170-v1-mechanism-repair'})};
global.QCSemanticCoreV40=core;global.PSC_V83171=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.171:v170-v1-mechanism-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
