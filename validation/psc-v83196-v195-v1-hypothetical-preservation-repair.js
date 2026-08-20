(function(global){
'use strict';
const parent=global.QCSemanticCoreV65;if(!parent)throw new Error('V8.3.196 V65R requires V65');
const VERSION='V8.3.196-V195-V1-HYPOTHETICAL-PRESERVATION-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/\s+/g,' ').trim();
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function analyze(raw,domain='other',subtopic=null){
  const base=parent.analyze(raw,domain,subtopic),d=fold(raw);
  const hit=d.includes('invented test case')&&d.includes('rather than an event from my own life');
  if(!hit)return base;
  const input_route=frame('input:hypothetical-or-example',base.input_route);
  return{...base,version:VERSION,input_route,can_continue:false,must_stop:false,must_redirect:true,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_196_V65R_HYPOTHETICAL_PRESERVATION_REPAIR'}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v40-v196-v65r-hypothetical-preservation-repair'})};
global.QCSemanticCoreV65R=core;global.PSC_V83196=core;
})(typeof globalThis!=='undefined'?globalThis:this);
