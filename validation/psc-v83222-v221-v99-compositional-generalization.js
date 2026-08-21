(function(global){
'use strict';
const parent=global.QCSemanticCoreV98;if(!parent)throw new Error('V99 requires V98');
const extractor=global.QCEvidenceExtractorV5Z;if(!extractor)throw new Error('V99 requires V5Z');
const VERSION='V8.3.222-V99-COMPOSITIONAL-GENERALIZATION';
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function applyRoute(base,id,rule){const input_route=frame(id,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V99',semantic_rule:rule,evidence_extractor:'V5Z'}};}
function applyFamily(base,families,sequence,rule){const input_route=frame('input:self-lived',base.input_route);return{...base,version:VERSION,input_route,can_continue:true,must_stop:false,must_redirect:false,families:[...families],sequence:!!sequence,oscillation:!!sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V99',semantic_rule:rule,evidence_extractor:'V5Z'}};}
function analyze(raw,domain='other',subtopic=null){
 const scoped=extractor.scopeRaw(raw),base=parent.analyze(scoped,domain,subtopic),s=extractor.extract(scoped);
 // Fresh V221 failures show route/family precedence must be corrected before preserving parent fall-through.
 if(s.v222_prediction_compositional)return applyRoute(base,'input:prediction','v222-prediction-compositional');
 if(s.v222_sequence_compositional)return applyFamily(base,['slow'],true,'v222-sequence-compositional');
 if(s.v222_ignore_compositional)return applyFamily(base,['ignore'],false,'v222-ignore-compositional');
 if(s.v222_slow_compositional)return applyFamily(base,['slow'],false,'v222-slow-compositional');
 return{...base,version:VERSION,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V99',semantic_rule:'v98-parent-preserved',evidence_extractor:'V5Z'}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'v8.3.222-v99-compositional-generalization'})};
global.QCSemanticCoreV99=core;global.PSC_V83222=core;
})(typeof globalThis!=='undefined'?globalThis:this);
