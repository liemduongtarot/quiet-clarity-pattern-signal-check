(function(global){
'use strict';
const parent=global.QCSemanticCoreV40;if(!parent)throw new Error('V8.3.172 requires V8.3.171');
const VERSION='V8.3.172-V171-V1-SEALED-A-MECHANISM-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function routeFrame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function explicitIntent(d){
  // Missing-own-response / unresolved-actor language outranks incidental choice or third-party tokens.
  if(has(/(?:does not state what i myself did immediately afterward|unresolved who made the relevant choice.*which action was mine|thoughts and feelings.*not one concrete act.*actually performed|chua neu viec cu the minh lam ngay sau do|behaviour cua toi.*tron voi action cua nguoi khac.*own response chua tach|giai thich thoughts va feelings.*chua neu.*act cu the.*that su da lam)/,d))return'input:clarification-required';
  // Explicit decision outsourcing.
  if(has(/(?:xac dinh next action cho toi.*lay decision ra khoi tay toi|give me a directive that replaces my own decision|directive.*replaces my own decision)/,d))return'input:decision-request';
  // Explicit non-lived / role-play framing.
  if(has(/(?:scenario nay chi de illustration.*khong xay ra voi toi|nhan vat dong vai.*khong phai ban than toi|role.?play character.*not my own|only for illustration.*did not happen to me)/,d))return'input:hypothetical-or-example';
  // Hidden regret / inner-state request about another person.
  if(has(/(?:ho co am tham hoi han ve chuyen da xay ra giua hai ben khong|secretly regret(?:ting)? what happened between us)/,d))return'input:third-party-only';
  return null;
}
function ownFamily(d){
  // Freeze: workable/reversible test is available, but more research/alternatives delay commitment.
  if(has(/(?:workable experiment.*delayed.*extending research.*committing felt uncomfortable|small reversible test.*postponed.*searching for more alternatives|experiment.*co the thu.*keo dai research|buoc thu.*dao nguoc.*tim them.*phuong an)/,d))return{matched:true,families:['freeze'],sequence:false};
  // Explicit measured completion is adaptive/healthy evidence, not ignore.
  if(has(/(?:used the evidence already available.*one measured action.*left it alone|dung evidence.*mot move vua du.*dung lai|thong tin da co.*buoc vua phai.*khong quay lai)/,d))return{matched:true,families:[],sequence:false,healthy:true};
  return{matched:false,families:[],sequence:false};
}
function analyze(raw,domain='other',subtopic=null){
  const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=explicitIntent(d),own=ownFamily(d);
  const route=rid||(own.matched?'input:self-lived':base.input_route?.id);
  let families=[],sequence=false;
  if(route==='input:self-lived'){
    if(own.matched){families=[...(own.families||[])];sequence=!!own.sequence;}
    else{families=[...(base.families||[])].filter(x=>x!=='adaptive');sequence=!!base.sequence;}
  }
  const input_route=routeFrame(route,base.input_route);
  return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families,sequence,oscillation:sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_172_V171_V1_MECHANISM_REPAIR',v172:{route,families:[...families],sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v21-v172-v171-v1-mechanism-repair'})};
global.QCSemanticCoreV41=core;global.PSC_V83172=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.172:v171-v1-mechanism-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
