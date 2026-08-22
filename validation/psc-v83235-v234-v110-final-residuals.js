(function(global){
'use strict';
const parent=global.QCSemanticCoreV109;if(!parent)throw new Error('V110 requires V109');
const extractor=global.QCEvidenceExtractorV5AK;if(!extractor)throw new Error('V110 requires V5AK');
const VERSION='V8.3.235-V110-FINAL-RESIDUALS';
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function route(base,id,rule){const input_route=frame(id,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V110',semantic_rule:rule,evidence_extractor:'V5AK'}};}
function family(base,families,sequence,rule){const input_route=frame('input:self-lived',base.input_route);return{...base,version:VERSION,input_route,can_continue:true,must_stop:false,must_redirect:false,families:[...families],sequence:!!sequence,oscillation:!!sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V110',semantic_rule:rule,evidence_extractor:'V5AK'}};}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),s=extractor.extract(raw);
 if(s.v235_hypothetical)return route(base,'input:hypothetical-or-example','v235-final-hypothetical');
 if(s.v235_decision)return route(base,'input:decision-request','v235-final-decision');
 if(s.v235_slow)return family(base,['slow'],false,'v235-final-slow');
 return{...base,version:VERSION,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V110',semantic_rule:'v109-parent-preserved',evidence_extractor:'V5AK'}};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'v8.3.235-v110-final-residuals'})};
global.QCSemanticCoreV110=core;global.PSC_V83235=core;
})(typeof globalThis!=='undefined'?globalThis:this);
