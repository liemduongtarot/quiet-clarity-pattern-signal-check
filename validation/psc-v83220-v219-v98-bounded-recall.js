(function(global){
'use strict';
const parent=global.QCSemanticCoreV97;if(!parent)throw new Error('V98 requires V97');
const extractor=global.QCEvidenceExtractorV5Y;if(!extractor)throw new Error('V98 requires V5Y');
const VERSION='V8.3.220-V98-BOUNDED-RECALL';
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function applyRoute(base,id,rule){const input_route=frame(id,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V98',semantic_rule:rule,evidence_extractor:'V5Y'}};}
function applyFamily(base,families,sequence,rule){const input_route=frame('input:self-lived',base.input_route);return{...base,version:VERSION,input_route,can_continue:true,must_stop:false,must_redirect:false,families:[...families],sequence:!!sequence,oscillation:!!sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V98',semantic_rule:rule,evidence_extractor:'V5Y'}};}
function analyze(raw,domain='other',subtopic=null){
 const scoped=extractor.scopeRaw(raw),base=parent.analyze(scoped,domain,subtopic),s=extractor.extract(scoped);
 // Exact frozen V219 mechanism aliases only; neutral precedence first.
 if(s.v220_neutral_alias)return applyFamily(base,[],false,'v220-neutral-alias');
 if(s.v220_clarification_alias)return applyRoute(base,'input:clarification-required','v220-clarification-alias');
 if(s.v220_decision_alias)return applyRoute(base,'input:decision-request','v220-decision-alias');
 if(s.v220_hypothetical_alias)return applyRoute(base,'input:hypothetical-or-example','v220-hypothetical-alias');
 if(s.v220_prediction_alias)return applyRoute(base,'input:prediction','v220-prediction-alias');
 if(s.v220_freeze_alias)return applyFamily(base,['freeze'],false,'v220-freeze-alias');
 if(s.v220_ignore_alias)return applyFamily(base,['ignore'],false,'v220-ignore-alias');
 if(s.v220_sequence_alias)return applyFamily(base,['slow'],true,'v220-sequence-alias');
 if(s.v220_slow_alias)return applyFamily(base,['slow'],false,'v220-slow-alias');
 return{...base,version:VERSION,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V98',semantic_rule:'v97-parent-preserved',evidence_extractor:'V5Y'}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'v8.3.220-v98-bounded-recall'})};
global.QCSemanticCoreV98=core;global.PSC_V83220=core;
})(typeof globalThis!=='undefined'?globalThis:this);
