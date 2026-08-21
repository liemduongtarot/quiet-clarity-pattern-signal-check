(function(global){
'use strict';
const parent=global.QCSemanticCoreV100;if(!parent)throw new Error('V101 requires V100');
const extractor=global.QCEvidenceExtractorV5AB;if(!extractor)throw new Error('V101 requires V5AB');
const VERSION='V8.3.224-V101-COMPOSITIONAL-RECALL';
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function route(base,id,rule){const input_route=frame(id,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V101',semantic_rule:rule,evidence_extractor:'V5AB'}};}
function family(base,families,sequence,rule){const input_route=frame('input:self-lived',base.input_route);return{...base,version:VERSION,input_route,can_continue:true,must_stop:false,must_redirect:false,families:[...families],sequence:!!sequence,oscillation:!!sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V101',semantic_rule:rule,evidence_extractor:'V5AB'}};}
function analyze(raw,domain='other',subtopic=null){const scoped=extractor.scopeRaw(raw),base=parent.analyze(scoped,domain,subtopic),s=extractor.extract(scoped);
 if(s.v224_hypothetical)return route(base,'input:hypothetical-or-example','v224-hypothetical');
 if(s.v224_decision)return route(base,'input:decision-request','v224-decision');
 if(s.v224_third)return route(base,'input:third-party-only','v224-third');
 if(s.v224_clarification)return route(base,'input:clarification-required','v224-clarification');
 if(s.v224_neutral)return family(base,[],false,'v224-neutral');
 if(s.v224_sequence)return family(base,['slow'],true,'v224-sequence');
 if(s.v224_ignore)return family(base,['ignore'],false,'v224-ignore');
 if(s.v224_slow)return family(base,['slow'],false,'v224-slow');
 if(s.v224_freeze)return family(base,['freeze'],false,'v224-freeze');
 return{...base,version:VERSION,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V101',semantic_rule:'v100-parent-preserved',evidence_extractor:'V5AB'}};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'v8.3.224-v101-compositional-recall'})};
global.QCSemanticCoreV101=core;global.PSC_V83224=core;
})(typeof globalThis!=='undefined'?globalThis:this);
