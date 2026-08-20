(function(global){
'use strict';
const parent=global.QCSemanticCoreV76;if(!parent)throw new Error('V8.3.207 V76R requires V76');
const VERSION='V8.3.207-V206-V1-PRESERVATION-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),d=fold(raw);const explicitDelegation=(d.includes('chon cho toi')&&d.includes('hanh dong'))||(d.includes('pick action')&&d.includes('cho toi'));if(!explicitDelegation)return base;const input_route=frame('input:decision-request',base.input_route);return{...base,version:VERSION,input_route,can_continue:false,must_stop:true,must_redirect:true,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_207_V206_V1_PRESERVATION_REPAIR'}};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v49r-v207-v206-preservation-repair'})};global.QCSemanticCoreV76R=core;global.PSC_V83207=core;
})(typeof globalThis!=='undefined'?globalThis:this);
