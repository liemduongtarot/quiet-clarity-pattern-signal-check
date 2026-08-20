(function(global){
'use strict';
const parent=global.QCSemanticCoreV78R;if(!parent)throw new Error('SemanticRuleTableV1 requires QCSemanticCoreV78R');
const extractor=global.QCEvidenceExtractorV1;if(!extractor)throw new Error('SemanticRuleTableV1 requires QCEvidenceExtractorV1 review candidate');
const VERSION='V8.3.209-SEMANTIC-RULE-TABLE-V1-REVIEW-CANDIDATE';
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
const yes=(s,k)=>!!s[k];
const count=(s,ks)=>ks.reduce((n,k)=>n+(yes(s,k)?1:0),0);
function routeRule(s){
  // Non-lived constructed material has highest invalid-input specificity.
  if(yes(s,'non_lived_explicit')&&(yes(s,'constructed_input')||yes(s,'test_or_practice_context')))return 'input:hypothetical-or-example';
  // Hidden third-party state with no observable basis must not be converted into generic clarification/decision/prediction.
  if(yes(s,'third_party_subject')&&yes(s,'hidden_internal_state')&&yes(s,'observable_evidence_absent'))return 'input:third-party-only';
  // Explicit agency transfer beats incidental future-benefit or outcome language.
  if(yes(s,'agency_transfer_explicit')&&(yes(s,'delegated_decision')||yes(s,'choice_object_present')))return 'input:decision-request';
  // Clarification requires own-action absence, with endpoint/context support.
  if(yes(s,'self_owned_action')&&yes(s,'action_missing')&&(yes(s,'endpoint_present')||yes(s,'context_otherwise_complete')))return 'input:clarification-required';
  // Prediction requires both a future horizon and an actual future-outcome request.
  if(yes(s,'future_outcome_request')&&yes(s,'future_horizon_present'))return 'input:prediction';
  return null;
}
function familyRule(s){
  // Completed self-owned action with closure is a neutral guard against slow/freeze/ignore false positives.
  if(yes(s,'self_ownership_retained')&&yes(s,'execution_completed')&&yes(s,'closure_present'))return {families:[],sequence:false,rule:'neutral-completion-guard'};
  // Repeated approach/retreat with the same loop and no new basis beats bounded slow.
  if(yes(s,'approach_action')&&yes(s,'retreat_action')&&count(s,['repeated_cycle','same_reasoning','no_new_information'])>=2)return {families:['slow'],sequence:true,rule:'repeated-review-sequence'};
  // Attention diversion: response omission + diversion + one materiality indicator.
  if(yes(s,'attention_diverted')&&yes(s,'response_omitted')&&(yes(s,'central_responsibility')||yes(s,'peripheral_activity')))return {families:['ignore'],sequence:false,rule:'attention-diversion'};
  // Freeze retains the reversible-test + non-start core, with option expansion as supporting evidence.
  if(yes(s,'reversible_action_available')&&yes(s,'non_start')&&yes(s,'option_expansion'))return {families:['freeze'],sequence:false,rule:'reversible-nonstart-optioning'};
  // Bounded delay: one review + delay + closure. Sequence already has precedence above.
  if(yes(s,'bounded_delay')&&yes(s,'single_review')&&yes(s,'closure_present'))return {families:['slow'],sequence:false,rule:'bounded-delay-single-review'};
  return null;
}
function analyze(raw,domain='other',subtopic=null){
 const base=parent.analyze(raw,domain,subtopic),slots=extractor.extract(raw),rid=routeRule(slots);
 if(rid){const input_route=frame(rid,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V1',semantic_rule:'route:'+rid}};}
 // Do not let a family rule override a non-self-lived route produced by the parent.
 if(base.input_route&&base.input_route.id!=='input:self-lived')return base;
 const fam=familyRule(slots);if(!fam)return base;
 return{...base,version:VERSION,input_route:frame('input:self-lived',base.input_route),can_continue:true,must_stop:false,must_redirect:false,families:[...fam.families],sequence:!!fam.sequence,oscillation:!!fam.sequence,response_known:fam.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V1',semantic_rule:fam.rule}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'review-candidate-semantic-rule-table-v1'})};
global.QCSemanticCoreV79RC=core;global.PSC_V83209_RULE_TABLE_RC=core;
})(typeof globalThis!=='undefined'?globalThis:this);
