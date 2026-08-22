(function(global){
'use strict';
const parent=global.QCSemanticCoreV113;if(!parent)throw new Error('V114 requires V113');
const extractor=global.QCEvidenceExtractorV5AO;if(!extractor)throw new Error('V114 requires V5AO');
const VERSION='V8.3.239-V114-V238-RESIDUALS';
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function route(base,id,rule){const input_route=frame(id,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V114',semantic_rule:rule,evidence_extractor:'V5AO'}};}
function family(base,families,sequence,rule){const input_route=frame('input:self-lived',base.input_route);return{...base,version:VERSION,input_route,can_continue:true,must_stop:false,must_redirect:false,families:[...families],sequence:!!sequence,oscillation:!!sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V114',semantic_rule:rule,evidence_extractor:'V5AO'}};}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),s=extractor.extract(raw);
 if(s.v239_hypothetical)return route(base,'input:hypothetical-or-example','v239-v238-hypothetical');
 if(s.v239_decision)return route(base,'input:decision-request','v239-v238-decision');
 if(s.v239_clarification)return route(base,'input:clarification-required','v239-v238-clarification');
 if(s.v239_neutral)return family(base,[],false,'v239-v238-neutral');
 if(s.v239_freeze)return family(base,['freeze'],false,'v239-v238-freeze');
 if(s.v239_ignore)return family(base,['ignore'],false,'v239-v238-ignore');
 if(s.v239_slow)return family(base,['slow'],false,'v239-v238-slow');
 return{...base,version:VERSION,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V114',semantic_rule:'v113-parent-preserved',evidence_extractor:'V5AO'}};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'v8.3.239-v114-v238-residuals'})};
global.QCSemanticCoreV114=core;global.PSC_V83239=core;
})(typeof globalThis!=='undefined'?globalThis:this);
