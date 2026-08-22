(function(global){
'use strict';
const parent=global.QCSemanticCoreV103;if(!parent)throw new Error('V104 requires V103');
const extractor=global.QCEvidenceExtractorV5AE;if(!extractor)throw new Error('V104 requires V5AE');
const VERSION='V8.3.227-V104-RESIDUAL-WITNESS';
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function route(base,id,rule){const input_route=frame(id,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V104',semantic_rule:rule,evidence_extractor:'V5AE'}};}
function family(base,families,sequence,rule){const input_route=frame('input:self-lived',base.input_route);return{...base,version:VERSION,input_route,can_continue:true,must_stop:false,must_redirect:false,families:[...families],sequence:!!sequence,oscillation:!!sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V104',semantic_rule:rule,evidence_extractor:'V5AE'}};}
function analyze(raw,domain='other',subtopic=null){const scoped=extractor.scopeRaw(raw),base=parent.analyze(scoped,domain,subtopic),s=extractor.extract(raw);
 if(s.v227_decision)return route(base,'input:decision-request','v227-residual-decision');
 if(s.v227_third)return route(base,'input:third-party-only','v227-residual-third');
 if(s.v227_clarification)return route(base,'input:clarification-required','v227-residual-clarification');
 if(s.v227_neutral)return family(base,[],false,'v227-residual-neutral');
 if(s.v227_sequence)return family(base,['slow'],true,'v227-residual-sequence');
 if(s.v227_slow)return family(base,['slow'],false,'v227-residual-slow');
 if(s.v227_ignore)return family(base,['ignore'],false,'v227-residual-ignore');
 if(s.v227_freeze)return family(base,['freeze'],false,'v227-residual-freeze');
 return{...base,version:VERSION,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V104',semantic_rule:'v103-parent-preserved',evidence_extractor:'V5AE'}};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'v8.3.227-v104-residual-witness'})};
global.QCSemanticCoreV104=core;global.PSC_V83227=core;
})(typeof globalThis!=='undefined'?globalThis:this);
