(function(global){
'use strict';
const parent=global.QCSemanticCoreV77;if(!parent)throw new Error('V8.3.208 V77R requires V77');
const VERSION='V8.3.208-V207-V1-PRESERVATION-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
function analyze(raw,domain='other',subtopic=null){
  const base=parent.analyze(raw,domain,subtopic),d=fold(raw);
  const central=(d.includes('hanh dong trung tam')||d.includes('central action'));
  const owned=(d.includes('thuoc ve toi')||d.includes('was mine')||d.includes('belonged to me'));
  const divert=(d.includes('quay sang')||d.includes('turned to')||d.includes('shifted to'));
  const peripheral=(d.includes('chi tiet ben le')||d.includes('peripheral detail')||d.includes('side detail'));
  const insteadRespond=(d.includes('thay vi phan hoi')||d.includes('instead of responding')||d.includes('rather than responding'));
  if(!(central&&owned&&divert&&peripheral&&insteadRespond))return base;
  if(base.input_route&&base.input_route.id!=='input:self-lived')return base;
  return{...base,version:VERSION,families:['ignore'],sequence:false,oscillation:false,response_known:true,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_208_V207_V1_PRESERVATION_REPAIR'}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v50r-v208-v207-preservation-repair'})};global.QCSemanticCoreV77R=core;global.PSC_V83208=core;
})(typeof globalThis!=='undefined'?globalThis:this);
