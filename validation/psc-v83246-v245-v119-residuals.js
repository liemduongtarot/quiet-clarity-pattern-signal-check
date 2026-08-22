(function(global){
'use strict';
const parent=global.QCSemanticCoreV118;if(!parent)throw new Error('V119 requires V118');
const extractor=global.QCEvidenceExtractorV5AT;if(!extractor)throw new Error('V119 requires V5AT');
const VERSION='V8.3.246-V119-V245-RESIDUALS';
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function route(base,id,rule){const input_route=frame(id,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V119',semantic_rule:rule,evidence_extractor:'V5AT'}};}
function family(base,families,sequence,rule){const input_route=frame('input:self-lived',base.input_route);return{...base,version:VERSION,input_route,can_continue:true,must_stop:false,must_redirect:false,families:[...families],sequence:!!sequence,oscillation:!!sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V119',semantic_rule:rule,evidence_extractor:'V5AT'}};}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),s=extractor.extract(raw);
 if(s.v246_decision_vi)return route(base,'input:decision-request','v246-v245-decision-vi');
 if(s.v246_sequence_vi)return family(base,['slow'],true,'v246-v245-sequence-vi');
 if(s.v246_slow_vi)return family(base,['slow'],false,'v246-v245-slow-vi');
 return{...base,version:VERSION,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V119',semantic_rule:'v118-parent-preserved',evidence_extractor:'V5AT'}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'v8.3.246-v119-v245-residuals'})};
global.QCSemanticCoreV119=core;global.PSC_V83246=core;
})(typeof globalThis!=='undefined'?globalThis:this);
