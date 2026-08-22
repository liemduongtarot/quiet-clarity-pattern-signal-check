(function(global){
'use strict';
const parent=global.QCSemanticCoreV112;if(!parent)throw new Error('V113 requires V112');
const extractor=global.QCEvidenceExtractorV5AN;if(!extractor)throw new Error('V113 requires V5AN');
const VERSION='V8.3.238-V113-FROZEN-RESIDUALS';
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function route(base,id,rule){const input_route=frame(id,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V113',semantic_rule:rule,evidence_extractor:'V5AN'}};}
function family(base,families,sequence,rule){const input_route=frame('input:self-lived',base.input_route);return{...base,version:VERSION,input_route,can_continue:true,must_stop:false,must_redirect:false,families:[...families],sequence:!!sequence,oscillation:!!sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V113',semantic_rule:rule,evidence_extractor:'V5AN'}};}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),s=extractor.extract(raw);
 if(s.v238_hypothetical)return route(base,'input:hypothetical-or-example','v238-frozen-hypothetical');
 if(s.v238_prediction)return route(base,'input:prediction','v238-frozen-prediction');
 if(s.v238_decision)return route(base,'input:decision-request','v238-frozen-decision');
 if(s.v238_clarification)return route(base,'input:clarification-required','v238-frozen-clarification');
 if(s.v238_third)return route(base,'input:third-party-only','v238-frozen-third');
 if(s.v238_freeze)return family(base,['freeze'],false,'v238-frozen-freeze');
 if(s.v238_ignore)return family(base,['ignore'],false,'v238-frozen-ignore');
 if(s.v238_slow)return family(base,['slow'],false,'v238-frozen-slow');
 return{...base,version:VERSION,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V113',semantic_rule:'v112-parent-preserved',evidence_extractor:'V5AN'}};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'v8.3.238-v113-frozen-residuals'})};
global.QCSemanticCoreV113=core;global.PSC_V83238=core;
})(typeof globalThis!=='undefined'?globalThis:this);
