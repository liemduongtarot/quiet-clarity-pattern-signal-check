(function(global){
'use strict';
const parent=global.QCSemanticCoreV102;if(!parent)throw new Error('V103 requires V102');
const extractor=global.QCEvidenceExtractorV5AD;if(!extractor)throw new Error('V103 requires V5AD');
const VERSION='V8.3.226-V103-FULL-INPUT-WITNESS';
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function route(base,id,rule){const input_route=frame(id,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V103',semantic_rule:rule,evidence_extractor:'V5AD'}};}
function family(base,families,sequence,rule){const input_route=frame('input:self-lived',base.input_route);return{...base,version:VERSION,input_route,can_continue:true,must_stop:false,must_redirect:false,families:[...families],sequence:!!sequence,oscillation:!!sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V103',semantic_rule:rule,evidence_extractor:'V5AD'}};}
function analyze(raw,domain='other',subtopic=null){const scoped=extractor.scopeRaw(raw),base=parent.analyze(scoped,domain,subtopic),s=extractor.extract(raw);
 if(s.v226_decision)return route(base,'input:decision-request','v226-full-input-decision');
 if(s.v226_third)return route(base,'input:third-party-only','v226-full-input-third');
 if(s.v226_clarification)return route(base,'input:clarification-required','v226-full-input-clarification');
 if(s.v226_sequence)return family(base,['slow'],true,'v226-full-input-sequence');
 if(s.v226_slow)return family(base,['slow'],false,'v226-full-input-slow');
 if(s.v226_ignore)return family(base,['ignore'],false,'v226-full-input-ignore');
 if(s.v226_freeze)return family(base,['freeze'],false,'v226-full-input-freeze');
 return{...base,version:VERSION,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V103',semantic_rule:'v102-parent-preserved',evidence_extractor:'V5AD'}};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'v8.3.226-v103-full-input-witness'})};
global.QCSemanticCoreV103=core;global.PSC_V83226=core;
})(typeof globalThis!=='undefined'?globalThis:this);
