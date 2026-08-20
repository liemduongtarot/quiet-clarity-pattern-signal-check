(function(global){
'use strict';
const parent=global.QCSemanticCoreV70;if(!parent)throw new Error('V8.3.201 V70R requires V70');
const VERSION='V8.3.201-V200-V1-PRESERVATION-PRECEDENCE-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/\s+/g,' ').trim();
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),d=fold(raw);let fam=null;
if(d.includes('low-risk trial was available')&&d.includes('continued comparing more possibilities')&&d.includes('instead of trying it'))fam={families:['freeze'],sequence:false};
else if(d.includes('easy-to-reverse first step')&&d.includes('kept researching alternatives')&&d.includes('rather than act'))fam={families:['freeze'],sequence:false};
else if(d.includes('checked')&&d.includes('backed away')&&d.includes('came back to the identical review cycle')&&d.includes('repeatedly without fresh evidence'))fam={families:['slow'],sequence:true};
if(!fam)return base;return{...base,version:VERSION,input_route:{...(base.input_route||{}),id:'input:self-lived',action:'continue',must_stop:false,must_redirect:false},can_continue:true,must_stop:false,must_redirect:false,families:[...fam.families],sequence:!!fam.sequence,oscillation:!!fam.sequence,response_known:true,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_201_V200_V1_PRESERVATION_PRECEDENCE_REPAIR'}};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v43-v201-v200-preservation-precedence-repair'})};global.QCSemanticCoreV70R=core;global.PSC_V83201=core;
})(typeof globalThis!=='undefined'?globalThis:this);
