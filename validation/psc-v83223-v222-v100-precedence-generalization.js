(function(global){
'use strict';
const parent=global.QCSemanticCoreV99;if(!parent)throw new Error('V100 requires V99');
const extractor=global.QCEvidenceExtractorV5AA;if(!extractor)throw new Error('V100 requires V5AA');
const VERSION='V8.3.223-V100-PRECEDENCE-GENERALIZATION';
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function route(base,id,rule){const input_route=frame(id,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V100',semantic_rule:rule,evidence_extractor:'V5AA'}};}
function family(base,families,sequence,rule){const input_route=frame('input:self-lived',base.input_route);return{...base,version:VERSION,input_route,can_continue:true,must_stop:false,must_redirect:false,families:[...families],sequence:!!sequence,oscillation:!!sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V100',semantic_rule:rule,evidence_extractor:'V5AA'}};}
function analyze(raw,domain='other',subtopic=null){const scoped=extractor.scopeRaw(raw),base=parent.analyze(scoped,domain,subtopic),s=extractor.extract(scoped);
 // Route precedence: invalid/non-self evidence before self-lived family interpretation.
 if(s.v223_hypothetical)return route(base,'input:hypothetical-or-example','v223-hypothetical');
 if(s.v223_decision)return route(base,'input:decision-request','v223-decision');
 if(s.v223_prediction)return route(base,'input:prediction','v223-prediction');
 if(s.v223_third)return route(base,'input:third-party-only','v223-third');
 if(s.v223_clarification)return route(base,'input:clarification-required','v223-clarification');
 // Self-lived precedence: completed self-owned action is neutral; cyclic sequence precedes bounded slow.
 if(s.v223_neutral)return family(base,[],false,'v223-neutral');
 if(s.v223_sequence)return family(base,['slow'],true,'v223-sequence');
 if(s.v223_ignore)return family(base,['ignore'],false,'v223-ignore');
 if(s.v223_slow)return family(base,['slow'],false,'v223-slow');
 if(s.v223_freeze)return family(base,['freeze'],false,'v223-freeze');
 return{...base,version:VERSION,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V100',semantic_rule:'v99-parent-preserved',evidence_extractor:'V5AA'}};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'v8.3.223-v100-precedence-generalization'})};
global.QCSemanticCoreV100=core;global.PSC_V83223=core;
})(typeof globalThis!=='undefined'?globalThis:this);
