(function(global){
'use strict';
const parent=global.QCSemanticCoreV50;if(!parent)throw new Error('V8.3.181 precedence repair requires V50');
const VERSION='V8.3.181-V180-V1-HISTORICAL-CLARIFICATION-PRECEDENCE-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
function routeFrame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function missingOwnObservableResponse(d){
  const missing=/(?:chua co (?:mot )?(?:incident|su viec|chi tiet).*?(?:toi )?(?:phan ung|response)|chua (?:neu|co).*?(?:toi )?(?:phan ung|response).*?(?:tin nhan|message|su viec|incident)|khong co (?:incident|su viec|chi tiet).*?(?:phan ung|response) cua toi|no concrete (?:incident|event|detail).*?(?:my|i).*?(?:response|reaction)|my (?:response|reaction).*?(?:not|never).*?(?:shown|stated|identified)|own observable response.*?(?:missing|absent|not stated))/i.test(d);
  const latest=/(?:tin nhan moi nhat|message moi nhat|latest message|latest update|latest incident|incident cu the|su viec cu the|can them chi tiet|needs? more detail|before describing a pattern)/i.test(d);
  return missing&&latest;
}
function analyze(raw,domain='other',subtopic=null){
  const base=parent.analyze(raw,domain,subtopic),d=fold(raw);
  if(!missingOwnObservableResponse(d))return {...base,version:VERSION,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_181_HISTORICAL_PRECEDENCE_REPAIR_NO_OVERRIDE'}};
  const input_route=routeFrame('input:clarification-required',base.input_route);
  return {...base,version:VERSION,input_route,can_continue:false,must_stop:false,must_redirect:false,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_181_HISTORICAL_CLARIFICATION_PRECEDENCE_REPAIR',v181_precedence:{route:'input:clarification-required',reason:'missing-own-observable-response-before-third-party-context'}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v30r-v181-historical-clarification-precedence'})};
global.QCSemanticCoreV50R=core;global.PSC_V83181R=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.181:v180-v1-historical-clarification-precedence';
})(typeof globalThis!=='undefined'?globalThis:this);
