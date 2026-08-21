(function(global){
'use strict';
const parent=global.QCSemanticCoreV101;if(!parent)throw new Error('V102 requires V101');
const extractor=global.QCEvidenceExtractorV5AC;if(!extractor)throw new Error('V102 requires V5AC');
const VERSION='V8.3.225-V102-RESIDUAL-COMPOSITION';
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function route(base,id,rule){const input_route=frame(id,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V102',semantic_rule:rule,evidence_extractor:'V5AC'}};}
function family(base,families,sequence,rule){const input_route=frame('input:self-lived',base.input_route);return{...base,version:VERSION,input_route,can_continue:true,must_stop:false,must_redirect:false,families:[...families],sequence:!!sequence,oscillation:!!sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V102',semantic_rule:rule,evidence_extractor:'V5AC'}};}
function analyze(raw,domain='other',subtopic=null){const scoped=extractor.scopeRaw(raw),base=parent.analyze(scoped,domain,subtopic),s=extractor.extract(scoped);
 if(s.v225_hypothetical)return route(base,'input:hypothetical-or-example','v225-hypothetical');
 if(s.v225_decision)return route(base,'input:decision-request','v225-decision');
 if(s.v225_third)return route(base,'input:third-party-only','v225-third');
 if(s.v225_clarification)return route(base,'input:clarification-required','v225-clarification');
 if(s.v225_neutral)return family(base,[],false,'v225-neutral');
 if(s.v225_sequence)return family(base,['slow'],true,'v225-sequence');
 if(s.v225_slow)return family(base,['slow'],false,'v225-slow');
 if(s.v225_freeze)return family(base,['freeze'],false,'v225-freeze');
 return{...base,version:VERSION,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V102',semantic_rule:'v101-parent-preserved',evidence_extractor:'V5AC'}};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'v8.3.225-v102-residual-composition'})};
global.QCSemanticCoreV102=core;global.PSC_V83225=core;
})(typeof globalThis!=='undefined'?globalThis:this);
