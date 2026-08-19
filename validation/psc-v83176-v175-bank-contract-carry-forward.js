(function(global){
'use strict';
const parent=global.QCSemanticCoreV44;if(!parent)throw new Error('V8.3.176 requires V8.3.175');
const VERSION='V8.3.176-V175-BANK-CONTRACT-CARRY-FORWARD';
function analyze(raw,domain='other',subtopic=null){
  const r=parent.analyze(raw,domain,subtopic);
  return {...r,version:VERSION,canonical_shadow:{...(r.canonical_shadow||{}),difference_classification:'V8_3_176_NO_SEMANTIC_DELTA_BANK_CONTRACT_REPAIR_ONLY'}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v25-v176-bank-contract-carry-forward'})};
global.QCSemanticCoreV45=core;global.PSC_V83176=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.176:v175-bank-contract-carry-forward';
})(typeof globalThis!=='undefined'?globalThis:this);
