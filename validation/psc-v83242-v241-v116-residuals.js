(function(global){
'use strict';
const parent=global.QCSemanticCoreV115;if(!parent)throw new Error('V116 requires V115');
const extractor=global.QCEvidenceExtractorV5AQ;if(!extractor)throw new Error('V116 requires V5AQ');
const VERSION='V8.3.242-V116-V241-RESIDUALS';
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function route(base,id,rule){const input_route=frame(id,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V116',semantic_rule:rule,evidence_extractor:'V5AQ'}};}
function family(base,families,sequence,rule){const input_route=frame('input:self-lived',base.input_route);return{...base,version:VERSION,input_route,can_continue:true,must_stop:false,must_redirect:false,families:[...families],sequence:!!sequence,oscillation:!!sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V116',semantic_rule:rule,evidence_extractor:'V5AQ'}};}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),s=extractor.extract(raw);
 if(s.v242_hypothetical)return route(base,'input:hypothetical-or-example','v242-v241-hypothetical');
 if(s.v242_prediction)return route(base,'input:prediction','v242-v241-prediction');
 if(s.v242_decision)return route(base,'input:decision-request','v242-v241-decision');
 if(s.v242_third)return route(base,'input:third-party-only','v242-v241-third');
 if(s.v242_clarification)return route(base,'input:clarification-required','v242-v241-clarification');
 if(s.v242_neutral)return family(base,[],false,'v242-v241-neutral');
 if(s.v242_freeze)return family(base,['freeze'],false,'v242-v241-freeze');
 if(s.v242_ignore)return family(base,['ignore'],false,'v242-v241-ignore');
 if(s.v242_slow)return family(base,['slow'],false,'v242-v241-slow');
 return{...base,version:VERSION,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V116',semantic_rule:'v115-parent-preserved',evidence_extractor:'V5AQ'}};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'v8.3.242-v116-v241-residuals'})};
global.QCSemanticCoreV116=core;global.PSC_V83242=core;
})(typeof globalThis!=='undefined'?globalThis:this);
