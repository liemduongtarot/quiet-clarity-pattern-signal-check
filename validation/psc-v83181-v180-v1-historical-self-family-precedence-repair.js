(function(global){
'use strict';
const parent=global.QCSemanticCoreV50R;if(!parent)throw new Error('V8.3.181 self-family precedence repair requires V50R');
const VERSION='V8.3.181-V180-V1-HISTORICAL-SELF-FAMILY-PRECEDENCE-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
function routeFrame(id,prev){return{...(prev||{}),id,action:'continue',must_stop:false,must_redirect:false};}
function explicitSelfFreeze(d){
  const enough=/(?:da co du du kien|co du du kien|had enough (?:information|evidence)|enough (?:information|evidence|data).*to (?:act|take|make)|du thong tin.*(?:lam|hanh dong))/i.test(d);
  const compare=/(?:mo them (?:nhieu )?(?:tai lieu|document).*so sanh|open(?:ed)? more .*comparison|kept opening.*compar|them .*so sanh|compare more|comparison material)/i.test(d);
  const noact=/(?:chua hanh dong|chua lam|did not act|had not acted|without acting|instead of acting|not taking the step)/i.test(d);
  return enough&&compare&&noact;
}
function analyze(raw,domain='other',subtopic=null){
  const base=parent.analyze(raw,domain,subtopic),d=fold(raw);
  if(!explicitSelfFreeze(d))return {...base,version:VERSION,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_181_HISTORICAL_SELF_FAMILY_PRECEDENCE_NO_OVERRIDE'}};
  const input_route=routeFrame('input:self-lived',base.input_route);
  return {...base,version:VERSION,input_route,can_continue:true,must_stop:false,must_redirect:false,families:['freeze'],sequence:false,oscillation:false,response_known:true,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_181_HISTORICAL_SELF_FREEZE_PRECEDENCE_REPAIR',v181_self_precedence:{route:'input:self-lived',families:['freeze'],reason:'explicit-self-comparison-delay'}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v30r2-v181-historical-self-family-precedence'})};
global.QCSemanticCoreV50R2=core;global.PSC_V83181R2=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.181:v180-v1-historical-self-family-precedence';
})(typeof globalThis!=='undefined'?globalThis:this);
