(function(global){
'use strict';
const parent=global.QCSemanticCoreV106;if(!parent)throw new Error('V107 requires V106');
const extractor=global.QCEvidenceExtractorV5AH;if(!extractor)throw new Error('V107 requires V5AH');
const VERSION='V8.3.231-V107-ISOLATED-CONCEPTS';
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function route(base,id,rule){const input_route=frame(id,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V107',semantic_rule:rule,evidence_extractor:'V5AH'}};}
function family(base,families,sequence,rule){const input_route=frame('input:self-lived',base.input_route);return{...base,version:VERSION,input_route,can_continue:true,must_stop:false,must_redirect:false,families:[...families],sequence:!!sequence,oscillation:!!sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V107',semantic_rule:rule,evidence_extractor:'V5AH'}};}
function analyze(raw,domain='other',subtopic=null){const scoped=extractor.scopeRaw(raw),base=parent.analyze(scoped,domain,subtopic),s=extractor.extract(raw);
 if(s.v231_hypothetical)return route(base,'input:hypothetical-or-example','v231-isolated-hypothetical');
 if(s.v231_prediction)return route(base,'input:prediction','v231-isolated-prediction');
 if(s.v231_decision)return route(base,'input:decision-request','v231-isolated-decision');
 if(s.v231_third)return route(base,'input:third-party-only','v231-isolated-third');
 if(s.v231_clarification)return route(base,'input:clarification-required','v231-isolated-clarification');
 if(s.v231_neutral)return family(base,[],false,'v231-isolated-neutral');
 if(s.v231_sequence)return family(base,['slow'],true,'v231-isolated-sequence');
 if(s.v231_slow)return family(base,['slow'],false,'v231-isolated-slow');
 if(s.v231_ignore)return family(base,['ignore'],false,'v231-isolated-ignore');
 if(s.v231_freeze)return family(base,['freeze'],false,'v231-isolated-freeze');
 return{...base,version:VERSION,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V107',semantic_rule:'v106-parent-preserved',evidence_extractor:'V5AH'}};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'v8.3.231-v107-isolated-concepts'})};
global.QCSemanticCoreV107=core;global.PSC_V83231=core;
})(typeof globalThis!=='undefined'?globalThis:this);
