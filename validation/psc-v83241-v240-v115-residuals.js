(function(global){
'use strict';
const parent=global.QCSemanticCoreV114;if(!parent)throw new Error('V115 requires V114');
const extractor=global.QCEvidenceExtractorV5AP;if(!extractor)throw new Error('V115 requires V5AP');
const VERSION='V8.3.241-V115-V240-RESIDUALS';
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function route(base,id,rule){const input_route=frame(id,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V115',semantic_rule:rule,evidence_extractor:'V5AP'}};}
function family(base,families,sequence,rule){const input_route=frame('input:self-lived',base.input_route);return{...base,version:VERSION,input_route,can_continue:true,must_stop:false,must_redirect:false,families:[...families],sequence:!!sequence,oscillation:!!sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V115',semantic_rule:rule,evidence_extractor:'V5AP'}};}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),s=extractor.extract(raw);
 if(s.v241_hypothetical)return route(base,'input:hypothetical-or-example','v241-v240-hypothetical');
 if(s.v241_prediction)return route(base,'input:prediction','v241-v240-prediction');
 if(s.v241_decision)return route(base,'input:decision-request','v241-v240-decision');
 if(s.v241_third)return route(base,'input:third-party-only','v241-v240-third');
 if(s.v241_freeze)return family(base,['freeze'],false,'v241-v240-freeze');
 if(s.v241_ignore)return family(base,['ignore'],false,'v241-v240-ignore');
 return{...base,version:VERSION,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V115',semantic_rule:'v114-parent-preserved',evidence_extractor:'V5AP'}};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'v8.3.241-v115-v240-residuals'})};
global.QCSemanticCoreV115=core;global.PSC_V83241=core;
})(typeof globalThis!=='undefined'?globalThis:this);
