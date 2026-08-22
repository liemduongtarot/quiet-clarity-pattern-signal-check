(function(global){
'use strict';
const parent=global.QCSemanticCoreV117;if(!parent)throw new Error('V118 requires V117');
const extractor=global.QCEvidenceExtractorV5AS;if(!extractor)throw new Error('V118 requires V5AS');
const VERSION='V8.3.245-V118-V244-RESIDUALS';
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function route(base,id,rule){const input_route=frame(id,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V118',semantic_rule:rule,evidence_extractor:'V5AS'}};}
function family(base,families,sequence,rule){const input_route=frame('input:self-lived',base.input_route);return{...base,version:VERSION,input_route,can_continue:true,must_stop:false,must_redirect:false,families:[...families],sequence:!!sequence,oscillation:!!sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V118',semantic_rule:rule,evidence_extractor:'V5AS'}};}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),s=extractor.extract(raw);
 if(s.v245_third)return route(base,'input:third-party-only','v245-v244-third');
 if(s.v245_clarification)return route(base,'input:clarification-required','v245-v244-clarification');
 if(s.v245_neutral)return family(base,[],false,'v245-v244-neutral');
 if(s.v245_sequence)return family(base,['slow'],true,'v245-v244-sequence');
 if(s.v245_slow)return family(base,['slow'],false,'v245-v244-slow');
 if(s.v245_freeze)return family(base,['freeze'],false,'v245-v244-freeze');
 if(s.v245_ignore)return family(base,['ignore'],false,'v245-v244-ignore');
 return{...base,version:VERSION,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V118',semantic_rule:'v117-parent-preserved',evidence_extractor:'V5AS'}};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'v8.3.245-v118-v244-residuals'})};
global.QCSemanticCoreV118=core;global.PSC_V83245=core;
})(typeof globalThis!=='undefined'?globalThis:this);
