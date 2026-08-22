(function(global){
'use strict';
const parent=global.QCSemanticCoreV108;if(!parent)throw new Error('V109 requires V108');
const extractor=global.QCEvidenceExtractorV5AJ;if(!extractor)throw new Error('V109 requires V5AJ');
const VERSION='V8.3.234-V109-RESIDUAL-GENERALIZATION';
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function route(base,id,rule){const input_route=frame(id,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V109',semantic_rule:rule,evidence_extractor:'V5AJ'}};}
function family(base,families,sequence,rule){const input_route=frame('input:self-lived',base.input_route);return{...base,version:VERSION,input_route,can_continue:true,must_stop:false,must_redirect:false,families:[...families],sequence:!!sequence,oscillation:!!sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V109',semantic_rule:rule,evidence_extractor:'V5AJ'}};}
function analyze(raw,domain='other',subtopic=null){const scoped=extractor.scopeRaw(raw),base=parent.analyze(scoped,domain,subtopic),s=extractor.extract(raw);
 if(s.v234_hypothetical)return route(base,'input:hypothetical-or-example','v234-residual-hypothetical');
 if(s.v234_decision)return route(base,'input:decision-request','v234-residual-decision');
 if(s.v234_third)return route(base,'input:third-party-only','v234-residual-third');
 if(s.v234_clarification)return route(base,'input:clarification-required','v234-residual-clarification');
 if(s.v234_sequence)return family(base,['slow'],true,'v234-residual-sequence');
 if(s.v234_slow)return family(base,['slow'],false,'v234-residual-slow');
 if(s.v234_ignore)return family(base,['ignore'],false,'v234-residual-ignore');
 if(s.v234_freeze)return family(base,['freeze'],false,'v234-residual-freeze');
 return{...base,version:VERSION,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V109',semantic_rule:'v108-parent-preserved',evidence_extractor:'V5AJ'}};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'v8.3.234-v109-residual-generalization'})};
global.QCSemanticCoreV109=core;global.PSC_V83234=core;
})(typeof globalThis!=='undefined'?globalThis:this);
