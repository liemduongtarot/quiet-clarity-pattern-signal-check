(function(global){
'use strict';
const parent=global.QCSemanticCoreV123;if(!parent)throw new Error('V124 requires V123');
const extractor=global.QCEvidenceExtractorV5AY;if(!extractor)throw new Error('V124 requires V5AY');
const VERSION='V8.3.253-V124-V252-RESIDUAL';
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function prediction(base){const input_route=frame('input:prediction',base.input_route);return{...base,version:VERSION,input_route,can_continue:false,must_stop:true,must_redirect:true,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V124',semantic_rule:'v253-v252-prediction',evidence_extractor:'V5AY'}};}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),s=extractor.extract(raw);if(s.v253_prediction)return prediction(base);return{...base,version:VERSION,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V124',semantic_rule:'v123-parent-preserved',evidence_extractor:'V5AY'}};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'v8.3.253-v124-v252-residual'})};
global.QCSemanticCoreV124=core;global.PSC_V83253=core;
})(typeof globalThis!=='undefined'?globalThis:this);
