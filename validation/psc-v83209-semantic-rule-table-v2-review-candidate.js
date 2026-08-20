(function(global){
'use strict';
const parent=global.QCSemanticCoreV78R;if(!parent)throw new Error('SemanticRuleTableV2 requires QCSemanticCoreV78R');
const extractor=global.QCEvidenceExtractorV1R;if(!extractor)throw new Error('SemanticRuleTableV2 requires QCEvidenceExtractorV1R');
const VERSION='V8.3.209-SEMANTIC-RULE-TABLE-V2-REVIEW-CANDIDATE';
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
const yes=(s,k)=>!!s[k];const count=(s,ks)=>ks.reduce((n,k)=>n+(yes(s,k)?1:0),0);
function routeRule(s){
 if(yes(s,'non_lived_explicit')&&(yes(s,'constructed_input')||yes(s,'test_or_practice_context')))return 'input:hypothetical-or-example';
 if(yes(s,'third_party_subject')&&yes(s,'hidden_internal_state')&&yes(s,'observable_evidence_absent'))return 'input:third-party-only';
 // Delegation must be explicit in both agency-transfer and delegated-choice evidence; incidental outcome language must not steal prediction.
 if(yes(s,'agency_transfer_explicit')&&yes(s,'delegated_decision'))return 'input:decision-request';
 if(yes(s,'self_owned_action')&&yes(s,'action_missing')&&(yes(s,'endpoint_present')||yes(s,'context_otherwise_complete')))return 'input:clarification-required';
 if(yes(s,'future_outcome_request')&&yes(s,'future_horizon_present'))return 'input:prediction';
 return null;
}
function familyRule(s){
 if(yes(s,'self_ownership_retained')&&yes(s,'execution_completed')&&yes(s,'closure_present'))return {families:[],sequence:false,rule:'neutral-completion-guard'};
 if(yes(s,'approach_action')&&yes(s,'retreat_action')&&count(s,['repeated_cycle','same_reasoning','no_new_information'])>=2)return {families:['slow'],sequence:true,rule:'repeated-review-sequence'};
 if(yes(s,'attention_diverted')&&yes(s,'response_omitted')&&(yes(s,'central_responsibility')||yes(s,'peripheral_activity')))return {families:['ignore'],sequence:false,rule:'attention-diversion'};
 if(yes(s,'reversible_action_available')&&yes(s,'non_start')&&yes(s,'option_expansion'))return {families:['freeze'],sequence:false,rule:'reversible-nonstart-optioning'};
 if(yes(s,'bounded_delay')&&yes(s,'single_review')&&yes(s,'closure_present'))return {families:['slow'],sequence:false,rule:'bounded-delay-single-review'};
 return null;
}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),slots=extractor.extract(raw),rid=routeRule(slots);
 if(rid){const input_route=frame(rid,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V2',semantic_rule:'route:'+rid}};}
 const fam=familyRule(slots);
 // Strong semantic family/neutral evidence may correct a false inherited route; this is explicit precedence, not code-order inheritance.
 if(fam){const input_route=frame('input:self-lived',base.input_route);return{...base,version:VERSION,input_route,can_continue:true,must_stop:false,must_redirect:false,families:[...fam.families],sequence:!!fam.sequence,oscillation:!!fam.sequence,response_known:fam.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V2',semantic_rule:fam.rule}};}
 return base;}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'review-candidate-semantic-rule-table-v2'})};
global.QCSemanticCoreV79RC2=core;global.PSC_V83209_RULE_TABLE_RC2=core;
})(typeof globalThis!=='undefined'?globalThis:this);
