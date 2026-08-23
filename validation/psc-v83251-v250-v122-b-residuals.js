(function(global){
'use strict';
const parent=global.QCSemanticCoreV121;if(!parent)throw new Error('V122 requires V121');
const extractor=global.QCEvidenceExtractorV5AW;if(!extractor)throw new Error('V122 requires V5AW');
const VERSION='V8.3.251-V122-V250-B-RESIDUALS';
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function family(base,families,sequence,rule){const input_route=frame('input:self-lived',base.input_route);return{...base,version:VERSION,input_route,can_continue:true,must_stop:false,must_redirect:false,families:[...families],sequence:!!sequence,oscillation:!!sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V122',semantic_rule:rule,evidence_extractor:'V5AW'}};}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),s=extractor.extract(raw);
 if(s.v251_freeze_vi)return family(base,['freeze'],false,'v251-v250-b-freeze-vi');
 if(s.v251_ignore_vi)return family(base,['ignore'],false,'v251-v250-b-ignore-vi');
 if(s.v251_slow_vi)return family(base,['slow'],false,'v251-v250-b-slow-vi');
 return{...base,version:VERSION,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V122',semantic_rule:'v121-parent-preserved',evidence_extractor:'V5AW'}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'v8.3.251-v122-v250-b-residuals'})};
global.QCSemanticCoreV122=core;global.PSC_V83251=core;
})(typeof globalThis!=='undefined'?globalThis:this);
