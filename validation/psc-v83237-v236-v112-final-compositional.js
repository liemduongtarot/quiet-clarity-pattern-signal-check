(function(global){
'use strict';
const parent=global.QCSemanticCoreV111;if(!parent)throw new Error('V112 requires V111');
const extractor=global.QCEvidenceExtractorV5AM;if(!extractor)throw new Error('V112 requires V5AM');
const VERSION='V8.3.237-V112-FINAL-COMPOSITIONAL';
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function route(base,id,rule){const input_route=frame(id,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V112',semantic_rule:rule,evidence_extractor:'V5AM'}};}
function family(base,families,sequence,rule){const input_route=frame('input:self-lived',base.input_route);return{...base,version:VERSION,input_route,can_continue:true,must_stop:false,must_redirect:false,families:[...families],sequence:!!sequence,oscillation:!!sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V112',semantic_rule:rule,evidence_extractor:'V5AM'}};}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),s=extractor.extract(raw);
 if(s.v237_hypothetical)return route(base,'input:hypothetical-or-example','v237-bounded-hypothetical');
 if(s.v237_decision)return route(base,'input:decision-request','v237-bounded-decision');
 if(s.v237_neutral)return family(base,[],false,'v237-bounded-neutral');
 if(s.v237_sequence)return family(base,['slow'],true,'v237-bounded-sequence');
 if(s.v237_ignore)return family(base,['ignore'],false,'v237-bounded-ignore');
 return{...base,version:VERSION,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V112',semantic_rule:'v111-parent-preserved',evidence_extractor:'V5AM'}};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'v8.3.237-v112-final-compositional'})};
global.QCSemanticCoreV112=core;global.PSC_V83237=core;
})(typeof globalThis!=='undefined'?globalThis:this);
