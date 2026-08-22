(function(global){
'use strict';
const parent=global.QCSemanticCoreV104;if(!parent)throw new Error('V105 requires V104');
const extractor=global.QCEvidenceExtractorV5AF;if(!extractor)throw new Error('V105 requires V5AF');
const VERSION='V8.3.228-V105-WITNESS-COMPLETION';
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function route(base,id,rule){const input_route=frame(id,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V105',semantic_rule:rule,evidence_extractor:'V5AF'}};}
function family(base,families,sequence,rule){const input_route=frame('input:self-lived',base.input_route);return{...base,version:VERSION,input_route,can_continue:true,must_stop:false,must_redirect:false,families:[...families],sequence:!!sequence,oscillation:!!sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V105',semantic_rule:rule,evidence_extractor:'V5AF'}};}
function analyze(raw,domain='other',subtopic=null){const scoped=extractor.scopeRaw(raw),base=parent.analyze(scoped,domain,subtopic),s=extractor.extract(raw);
 if(s.v228_hypothetical)return route(base,'input:hypothetical-or-example','v228-witness-hypothetical');
 if(s.v228_prediction)return route(base,'input:prediction','v228-witness-prediction');
 if(s.v228_decision)return route(base,'input:decision-request','v228-witness-decision');
 if(s.v228_third)return route(base,'input:third-party-only','v228-witness-third');
 if(s.v228_clarification)return route(base,'input:clarification-required','v228-witness-clarification');
 if(s.v228_neutral)return family(base,[],false,'v228-witness-neutral');
 if(s.v228_sequence)return family(base,['slow'],true,'v228-witness-sequence');
 if(s.v228_slow)return family(base,['slow'],false,'v228-witness-slow');
 if(s.v228_ignore)return family(base,['ignore'],false,'v228-witness-ignore');
 if(s.v228_freeze)return family(base,['freeze'],false,'v228-witness-freeze');
 return{...base,version:VERSION,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V105',semantic_rule:'v104-parent-preserved',evidence_extractor:'V5AF'}};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'v8.3.228-v105-witness-completion'})};
global.QCSemanticCoreV105=core;global.PSC_V83228=core;
})(typeof globalThis!=='undefined'?globalThis:this);
