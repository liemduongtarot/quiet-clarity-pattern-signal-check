(function(global){
'use strict';
const parent=global.QCSemanticCoreV116;if(!parent)throw new Error('V117 requires V116');
const extractor=global.QCEvidenceExtractorV5AR;if(!extractor)throw new Error('V117 requires V5AR');
const VERSION='V8.3.243-V117-V242-RESIDUALS';
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function route(base,id,rule){const input_route=frame(id,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V117',semantic_rule:rule,evidence_extractor:'V5AR'}};}
function family(base,families,sequence,rule){const input_route=frame('input:self-lived',base.input_route);return{...base,version:VERSION,input_route,can_continue:true,must_stop:false,must_redirect:false,families:[...families],sequence:!!sequence,oscillation:!!sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V117',semantic_rule:rule,evidence_extractor:'V5AR'}};}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),s=extractor.extract(raw);
 if(s.v243_prediction)return route(base,'input:prediction','v243-v242-prediction');
 if(s.v243_decision)return route(base,'input:decision-request','v243-v242-decision');
 if(s.v243_third)return route(base,'input:third-party-only','v243-v242-third');
 if(s.v243_clarification)return route(base,'input:clarification-required','v243-v242-clarification');
 if(s.v243_neutral)return family(base,[],false,'v243-v242-neutral');
 if(s.v243_sequence)return family(base,['slow'],true,'v243-v242-sequence');
 if(s.v243_freeze)return family(base,['freeze'],false,'v243-v242-freeze');
 if(s.v243_ignore)return family(base,['ignore'],false,'v243-v242-ignore');
 return{...base,version:VERSION,canonical_shadow:{...(base.canonical_shadow||{}),semantic_rule_table:'V117',semantic_rule:'v116-parent-preserved',evidence_extractor:'V5AR'}};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'v8.3.243-v117-v242-residuals'})};
global.QCSemanticCoreV117=core;global.PSC_V83243=core;
})(typeof globalThis!=='undefined'?globalThis:this);
