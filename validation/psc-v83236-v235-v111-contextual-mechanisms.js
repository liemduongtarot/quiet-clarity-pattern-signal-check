(function(global){
'use strict';
const parent=global.QCSemanticCoreV110;if(!parent)throw new Error('V111 requires V110');
const extractor=global.QCEvidenceExtractorV5AL;if(!extractor)throw new Error('V111 requires V5AL');
const VERSION='V8.3.236-V111-CONTEXTUAL-MECHANISMS';
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function route(base,id,rule){const input_route=frame(id,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V111',semantic_rule:rule,evidence_extractor:'V5AL'}};}
function family(base,families,sequence,rule){const input_route=frame('input:self-lived',base.input_route);return{...base,version:VERSION,input_route,can_continue:true,must_stop:false,must_redirect:false,families:[...families],sequence:!!sequence,oscillation:!!sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V111',semantic_rule:rule,evidence_extractor:'V5AL'}};}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),s=extractor.extract(raw);
 if(s.v236_hypothetical)return route(base,'input:hypothetical-or-example','v236-contextual-hypothetical');
 if(s.v236_prediction)return route(base,'input:prediction','v236-contextual-prediction');
 if(s.v236_decision)return route(base,'input:decision-request','v236-contextual-decision');
 if(s.v236_clarification)return route(base,'input:clarification-required','v236-contextual-clarification');
 if(s.v236_slow)return family(base,['slow'],false,'v236-contextual-slow');
 if(s.v236_ignore)return family(base,['ignore'],false,'v236-contextual-ignore');
 if(s.v236_freeze)return family(base,['freeze'],false,'v236-contextual-freeze');
 return{...base,version:VERSION,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V111',semantic_rule:'v110-parent-preserved',evidence_extractor:'V5AL'}};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'v8.3.236-v111-contextual-mechanisms'})};
global.QCSemanticCoreV111=core;global.PSC_V83236=core;
})(typeof globalThis!=='undefined'?globalThis:this);
