(function(global){
'use strict';
const parent=global.QCSemanticCoreV120;if(!parent)throw new Error('V121 requires V120');
const extractor=global.QCEvidenceExtractorV5AV;if(!extractor)throw new Error('V121 requires V5AV');
const VERSION='V8.3.250-V121-V249-RESIDUALS';
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function family(base,families,sequence,rule){const input_route=frame('input:self-lived',base.input_route);return{...base,version:VERSION,input_route,can_continue:true,must_stop:false,must_redirect:false,families:[...families],sequence:!!sequence,oscillation:!!sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V121',semantic_rule:rule,evidence_extractor:'V5AV'}};}
function neutral(base,rule){const input_route=frame('input:self-lived',base.input_route);return{...base,version:VERSION,input_route,can_continue:true,must_stop:false,must_redirect:false,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V121',semantic_rule:rule,evidence_extractor:'V5AV'}};}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),s=extractor.extract(raw);
 if(s.v250_freeze)return family(base,['freeze'],false,'v250-v249-freeze');
 if(s.v250_ignore)return family(base,['ignore'],false,'v250-v249-ignore');
 if(s.v250_sequence)return family(base,['slow'],true,'v250-v249-sequence');
 if(s.v250_neutral)return neutral(base,'v250-v249-neutral');
 return{...base,version:VERSION,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V121',semantic_rule:'v120-parent-preserved',evidence_extractor:'V5AV'}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'v8.3.250-v121-v249-residuals'})};
global.QCSemanticCoreV121=core;global.PSC_V83250=core;
})(typeof globalThis!=='undefined'?globalThis:this);
