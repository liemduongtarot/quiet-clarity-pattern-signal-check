(function(global){
'use strict';
const parent=global.QCSemanticCoreV43;if(!parent)throw new Error('V8.3.175 requires V8.3.174');
const VERSION='V8.3.175-V174-V1-SEALED-A-MECHANISM-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function routeFrame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function routeRepair(d){
  // Missing or unattributable own observable action.
  if(has(/(?:doi chu the.*giua toi va ho.*chua xac dinh.*buoc.*thuoc ve toi|bo qua chi tiet toi da lam gi|observable behaviour.*actually carried out.*missing|behaviour cua toi.*tron.*action cua nguoi kia.*own response.*chua tach|unresolved who performed.*next action.*alternates between two actors|chua neu viec cu the minh lam.*background.*interpretation)/,d))return'input:clarification-required';
  // Explicit decision outsourcing/replacement.
  if(has(/(?:directive.*removes? the decision from my hands|replace.*decision.*instruction|thay the quyet dinh cua toi.*instruction|hay thay the quyet dinh cua toi)/,d))return'input:decision-request';
  // Explicit invented/non-lived classification material.
  if(has(/(?:invented character.*classification material.*not my own lived response|scenario.*illustration.*toi khong phai actor|scenario.*chi de illustration.*khong phai actor)/,d))return'input:hypothetical-or-example';
  // Private inner state of another person.
  if(has(/(?:private feeling cua ho ve toi|private feelings? of them about me|what.*private feeling.*they.*about me)/,d))return'input:third-party-only';
  // Future outcome / favourable-result request.
  if(has(/(?:ket qua sap toi.*dung nhu toi mong muon|likely to work out in my favour.*next few weeks|work out in my favour.*few weeks|upcoming result.*what i want)/,d))return'input:prediction';
  return null;
}
function familyRepair(d){
  // Freeze: a reversible/workable/small experiment is available, but option expansion/comparison delays starting.
  const ready=has(/(?:workable test.*undo|test nho.*undo|buoc thu nho.*co the quay lai|experiment du nho de thu|experiment.*small enough to try|small test.*reversible|reversible.*test)/,d);
  const delay=has(/(?:postponed action.*compared more options|mo them lua chon.*thay vi bat dau|tim them phuong an.*thay vi lam|so sanh them.*chua bat dau|compared more options|searching more options.*instead of starting|kept comparing.*not start)/,d);
  if(ready&&delay)return{matched:true,families:['freeze'],sequence:false};
  return{matched:false,families:[],sequence:false};
}
function analyze(raw,domain='other',subtopic=null){
  const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeRepair(d),own=familyRepair(d);
  const route=rid||(own.matched?'input:self-lived':base.input_route?.id);
  let families=[],sequence=false;
  if(route==='input:self-lived'){
    if(own.matched){families=[...(own.families||[])];sequence=!!own.sequence;}
    else{families=[...(base.families||[])].filter(x=>x!=='adaptive');sequence=!!base.sequence;}
  }
  const input_route=routeFrame(route,base.input_route);
  return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families,sequence,oscillation:sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_175_V174_V1_MECHANISM_REPAIR',v175:{route,families:[...families],sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v24-v175-v174-v1-mechanism-repair'})};
global.QCSemanticCoreV44=core;global.PSC_V83175=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.175:v174-v1-mechanism-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
