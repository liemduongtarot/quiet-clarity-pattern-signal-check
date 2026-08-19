(function(global){
'use strict';
const parent=global.QCSemanticCoreV50R2;if(!parent)throw new Error('V8.3.181 explicit intent precedence repair requires V50R2');
const VERSION='V8.3.181-V180-V1-EXPLICIT-INTENT-PRECEDENCE-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
function routeFrame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function explicitRoute(d){
  if(/(?:co roi ve phia co loi cho toi|roi ve phia co loi|turn out in my favour|land in my favour|outcome.*in my favour|result.*in my favour)/.test(d))return'input:prediction';
  if(/(?:chon cho toi hanh dong|chon.*outcome tot nhat|want action selection from you|action selection from you|choose the action for me|select the action for me)/.test(d))return'input:decision-request';
  if(/(?:actor who made the choice.*chua established|actor.*not established|chua selected one episode.*response rieng cua minh|chua.*mot episode.*response rieng|response rieng cua minh.*chua|who made the choice.*not established)/.test(d))return'input:clarification-required';
  if(/(?:tell me what they secretly think|they secretly think.*not asking about my response|khong hoi.*response cua toi.*(?:ho|nguoi kia)|not asking about my response.*they)/.test(d))return'input:third-party-only';
  return null;
}
function explicitIgnore(d){return /(?:moved sang mot unrelated admin task.*left the actual issue for later|moved to an unrelated admin task.*left the actual issue for later|unrelated admin task.*actual issue for later)/.test(d);}
function analyze(raw,domain='other',subtopic=null){
  const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=explicitRoute(d),ign=explicitIgnore(d);
  if(rid){const input_route=routeFrame(rid,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_181_EXPLICIT_INTENT_PRECEDENCE_REPAIR',v181_explicit_intent:{route:rid}}};}
  if(ign){const input_route=routeFrame('input:self-lived',base.input_route);return{...base,version:VERSION,input_route,can_continue:true,must_stop:false,must_redirect:false,families:['ignore'],sequence:false,oscillation:false,response_known:true,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_181_EXPLICIT_SELF_IGNORE_PRECEDENCE_REPAIR',v181_explicit_intent:{route:'input:self-lived',families:['ignore']}}};}
  return{...base,version:VERSION,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_181_EXPLICIT_INTENT_PRECEDENCE_NO_OVERRIDE'}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v30r3-v181-explicit-intent-precedence'})};
global.QCSemanticCoreV50R3=core;global.PSC_V83181R3=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.181:v180-v1-explicit-intent-precedence';
})(typeof globalThis!=='undefined'?globalThis:this);
