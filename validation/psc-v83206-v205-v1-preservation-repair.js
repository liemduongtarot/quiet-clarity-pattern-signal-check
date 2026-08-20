(function(global){
'use strict';
const parent=global.QCSemanticCoreV75;if(!parent)throw new Error('V8.3.206 V75R requires V75');
const VERSION='V8.3.206-V205-V1-PRESERVATION-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),d=fold(raw);let rid=null;
if(d.includes('autobiographical')&&d.includes('classification'))rid='input:hypothetical-or-example';
else if(d.includes('ngoai tru')&&d.includes('hanh dong')&&d.includes('tu toi')&&(d.includes('khep lai')||d.includes('ket thuc')||d.includes('doan cuoi')))rid='input:clarification-required';
if(!rid)return base;const input_route=frame(rid,base.input_route);return{...base,version:VERSION,input_route,can_continue:false,must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_206_V205_V1_PRESERVATION_REPAIR'}};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v48r-v206-v205-preservation-repair'})};global.QCSemanticCoreV75R=core;global.PSC_V83206=core;
})(typeof globalThis!=='undefined'?globalThis:this);
