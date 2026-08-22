(function(global){
'use strict';
const parent=global.QCSemanticCoreV107;if(!parent)throw new Error('V108 requires V107');
const extractor=global.QCEvidenceExtractorV5AI;if(!extractor)throw new Error('V108 requires V5AI');
const VERSION='V8.3.232-V108-RESIDUAL-ISOLATED-GENERALIZATION';
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function route(base,id,rule){const input_route=frame(id,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V108',semantic_rule:rule,evidence_extractor:'V5AI'}};}
function family(base,families,sequence,rule){const input_route=frame('input:self-lived',base.input_route);return{...base,version:VERSION,input_route,can_continue:true,must_stop:false,must_redirect:false,families:[...families],sequence:!!sequence,oscillation:!!sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V108',semantic_rule:rule,evidence_extractor:'V5AI'}};}
function analyze(raw,domain='other',subtopic=null){const scoped=extractor.scopeRaw(raw),base=parent.analyze(scoped,domain,subtopic),s=extractor.extract(raw);
 // Preserve strong invalid-input precedence; only explicit V232 witnesses override parent.
 if(s.v232_hypothetical)return route(base,'input:hypothetical-or-example','v232-residual-hypothetical');
 if(s.v232_decision)return route(base,'input:decision-request','v232-residual-decision');
 if(s.v232_third)return route(base,'input:third-party-only','v232-residual-third');
 if(s.v232_clarification)return route(base,'input:clarification-required','v232-residual-clarification');
 // Self-lived precedence: completed agency before repeated/avoidant families.
 if(s.v232_neutral)return family(base,[],false,'v232-residual-neutral');
 if(s.v232_sequence)return family(base,['slow'],true,'v232-residual-sequence');
 if(s.v232_slow)return family(base,['slow'],false,'v232-residual-slow');
 if(s.v232_freeze)return family(base,['freeze'],false,'v232-residual-freeze');
 return{...base,version:VERSION,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V108',semantic_rule:'v107-parent-preserved',evidence_extractor:'V5AI'}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'v8.3.232-v108-residual-isolated-generalization'})};
global.QCSemanticCoreV108=core;global.PSC_V83232=core;
})(typeof globalThis!=='undefined'?globalThis:this);
