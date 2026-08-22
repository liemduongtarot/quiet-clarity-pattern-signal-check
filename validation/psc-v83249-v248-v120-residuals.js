(function(global){
'use strict';
const parent=global.QCSemanticCoreV119;if(!parent)throw new Error('V120 requires V119');
const extractor=global.QCEvidenceExtractorV5AU;if(!extractor)throw new Error('V120 requires V5AU');
const VERSION='V8.3.249-V120-V248-RESIDUALS';
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function family(base,families,sequence,rule){const input_route=frame('input:self-lived',base.input_route);return{...base,version:VERSION,input_route,can_continue:true,must_stop:false,must_redirect:false,families:[...families],sequence:!!sequence,oscillation:!!sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V120',semantic_rule:rule,evidence_extractor:'V5AU'}};}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),s=extractor.extract(raw);
 if(s.v249_neutral)return family(base,[],false,'v249-v248-neutral');
 if(s.v249_sequence)return family(base,['slow'],true,'v249-v248-sequence');
 if(s.v249_freeze)return family(base,['freeze'],false,'v249-v248-freeze');
 if(s.v249_ignore)return family(base,['ignore'],false,'v249-v248-ignore');
 return{...base,version:VERSION,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V120',semantic_rule:'v119-parent-preserved',evidence_extractor:'V5AU'}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'v8.3.249-v120-v248-residuals'})};
global.QCSemanticCoreV120=core;global.PSC_V83249=core;
})(typeof globalThis!=='undefined'?globalThis:this);
