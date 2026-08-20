(function(global){
'use strict';
const parent=global.QCSemanticCoreV90;if(!parent)throw new Error('V8.3.212 V91 requires V90');
const stable=global.QCSemanticCoreV86;if(!stable)throw new Error('V8.3.212 V91 requires V86 stable fallback');
const extractor=global.QCEvidenceExtractorV5R;if(!extractor)throw new Error('V8.3.212 V91 requires V5R');
const VERSION='V8.3.212-V91-DELEGATED-DECISION-PRESERVATION';
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
const yes=(s,k)=>!!s[k],count=(s,ks)=>ks.reduce((n,k)=>n+(yes(s,k)?1:0),0);
function routeRule(s){
 if(yes(s,'non_lived_explicit')&&(yes(s,'constructed_input')||yes(s,'test_or_practice_context')))return 'input:hypothetical-or-example';
 if(yes(s,'third_party_subject')&&yes(s,'hidden_internal_state')&&yes(s,'observable_evidence_absent'))return 'input:third-party-only';
 if(!yes(s,'delegation_negated')&&yes(s,'delegated_decision')&&yes(s,'agency_transfer_explicit')&&yes(s,'choice_object_present'))return 'input:decision-request';
 if(yes(s,'self_owned_action')&&yes(s,'action_missing')&&(yes(s,'endpoint_present')||yes(s,'context_otherwise_complete')))return 'input:clarification-required';
 if(yes(s,'future_outcome_request')&&yes(s,'future_horizon_present'))return 'input:prediction';
 return null;
}
function familyRule(s){
 if(yes(s,'self_ownership_retained')&&yes(s,'execution_completed')&&yes(s,'closure_present'))return{families:[],sequence:false,rule:'neutral-completion'};
 if(yes(s,'approach_action')&&yes(s,'retreat_action')&&count(s,['repeated_cycle','same_reasoning','no_new_information'])>=2)return{families:['slow'],sequence:true,rule:'sequence'};
 if(yes(s,'attention_diverted')&&yes(s,'response_omitted')&&(yes(s,'central_responsibility')||yes(s,'peripheral_activity')))return{families:['ignore'],sequence:false,rule:'ignore'};
 if(yes(s,'reversible_action_available')&&yes(s,'non_start')&&yes(s,'option_expansion'))return{families:['freeze'],sequence:false,rule:'freeze'};
 if(yes(s,'bounded_delay')&&yes(s,'single_review')&&yes(s,'closure_present'))return{families:['slow'],sequence:false,rule:'slow'};
 return null;
}
function applyRoute(base,id,rule){const input_route=frame(id,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V91',semantic_rule:rule,evidence_extractor:'V5R'}};}
function applyFamily(base,fam){const input_route=frame('input:self-lived',base.input_route);return{...base,version:VERSION,input_route,can_continue:true,must_stop:false,must_redirect:false,families:[...fam.families],sequence:!!fam.sequence,oscillation:!!fam.sequence,response_known:fam.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V91',semantic_rule:fam.rule,evidence_extractor:'V5R'}};}
function analyze(raw,domain='other',subtopic=null){
 const scoped=extractor.scopeRaw(raw),base=parent.analyze(scoped,domain,subtopic),s=extractor.extract(scoped),rid=routeRule(s);if(rid)return applyRoute(base,rid,'route:'+rid);
 const fam=familyRule(s);if(fam)return applyFamily(base,fam);
 if(base.input_route&&base.input_route.id==='input:prediction'&&!(s.future_outcome_request&&s.future_horizon_present)){const fb=stable.analyze(scoped,domain,subtopic);return{...fb,version:VERSION,canonical_shadow:{...(fb.canonical_shadow||{}),semantic_rule_table:'V91',semantic_rule:'contained-prediction-fallback',evidence_extractor:'V5R'}};}
 if(base.input_route&&base.input_route.id==='input:third-party-only'&&!(s.third_party_subject&&s.hidden_internal_state&&s.observable_evidence_absent)){const fb=stable.analyze(scoped,domain,subtopic);return{...fb,version:VERSION,canonical_shadow:{...(fb.canonical_shadow||{}),semantic_rule_table:'V91',semantic_rule:'contained-third-party-fallback',evidence_extractor:'V5R'}};}
 if(base.input_route&&base.input_route.id==='input:decision-request'&&!(s.delegated_decision&&s.agency_transfer_explicit&&s.choice_object_present&&!s.delegation_negated)){const fb=stable.analyze(scoped,domain,subtopic);return{...fb,version:VERSION,canonical_shadow:{...(fb.canonical_shadow||{}),semantic_rule_table:'V91',semantic_rule:'contained-decision-fallback',evidence_extractor:'V5R'}};}
 return{...base,version:VERSION,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V91',semantic_rule:'scoped-parent-preserved',evidence_extractor:'V5R'}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'v8.3.212-v91-delegated-decision-preservation'})};
global.QCSemanticCoreV91=core;global.PSC_V83212=core;
})(typeof globalThis!=='undefined'?globalThis:this);
