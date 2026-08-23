(function(global){
'use strict';
const parent=global.QCSemanticCoreV122;if(!parent)throw new Error('V123 requires V122');
const extractor=global.QCEvidenceExtractorV5AX;if(!extractor)throw new Error('V123 requires V5AX');
const VERSION='V8.3.252-V123-V251-RESIDUALS';
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function neutral(base,rule){const input_route=frame('input:self-lived',base.input_route);return{...base,version:VERSION,input_route,can_continue:true,must_stop:false,must_redirect:false,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V123',semantic_rule:rule,evidence_extractor:'V5AX'}};}
function third(base,rule){const input_route=frame('input:third-party-only',base.input_route);return{...base,version:VERSION,input_route,can_continue:false,must_stop:false,must_redirect:false,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V123',semantic_rule:rule,evidence_extractor:'V5AX'}};}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),s=extractor.extract(raw);
 if(s.v252_third)return third(base,'v252-v251-third');
 if(s.v252_neutral)return neutral(base,'v252-v251-neutral');
 return{...base,version:VERSION,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V123',semantic_rule:'v122-parent-preserved',evidence_extractor:'V5AX'}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'v8.3.252-v123-v251-residuals'})};
global.QCSemanticCoreV123=core;global.PSC_V83252=core;
})(typeof globalThis!=='undefined'?globalThis:this);
