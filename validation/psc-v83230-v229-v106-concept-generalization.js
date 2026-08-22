(function(global){
'use strict';
const parent=global.QCSemanticCoreV105;if(!parent)throw new Error('V106 requires V105');
const extractor=global.QCEvidenceExtractorV5AG;if(!extractor)throw new Error('V106 requires V5AG');
const VERSION='V8.3.230-V106-CONCEPT-GENERALIZATION';
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function route(base,id,rule){const input_route=frame(id,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V106',semantic_rule:rule,evidence_extractor:'V5AG'}};}
function family(base,families,sequence,rule){const input_route=frame('input:self-lived',base.input_route);return{...base,version:VERSION,input_route,can_continue:true,must_stop:false,must_redirect:false,families:[...families],sequence:!!sequence,oscillation:!!sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V106',semantic_rule:rule,evidence_extractor:'V5AG'}};}
function analyze(raw,domain='other',subtopic=null){const scoped=extractor.scopeRaw(raw),base=parent.analyze(scoped,domain,subtopic),s=extractor.extract(raw);
 if(s.v230_hypothetical)return route(base,'input:hypothetical-or-example','v230-concept-hypothetical');
 if(s.v230_prediction)return route(base,'input:prediction','v230-concept-prediction');
 if(s.v230_decision)return route(base,'input:decision-request','v230-concept-decision');
 if(s.v230_third)return route(base,'input:third-party-only','v230-concept-third');
 if(s.v230_clarification)return route(base,'input:clarification-required','v230-concept-clarification');
 if(s.v230_neutral)return family(base,[],false,'v230-concept-neutral');
 if(s.v230_sequence)return family(base,['slow'],true,'v230-concept-sequence');
 if(s.v230_slow)return family(base,['slow'],false,'v230-concept-slow');
 if(s.v230_ignore)return family(base,['ignore'],false,'v230-concept-ignore');
 if(s.v230_freeze)return family(base,['freeze'],false,'v230-concept-freeze');
 return{...base,version:VERSION,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V106',semantic_rule:'v105-parent-preserved',evidence_extractor:'V5AG'}};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'v8.3.230-v106-concept-generalization'})};
global.QCSemanticCoreV106=core;global.PSC_V83230=core;
})(typeof globalThis!=='undefined'?globalThis:this);
