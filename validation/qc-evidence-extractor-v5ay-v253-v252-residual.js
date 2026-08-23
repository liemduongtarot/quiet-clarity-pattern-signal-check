(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5AX;if(!parent)throw new Error('V5AY requires V5AX');
const VERSION='QCEvidenceExtractorV5AY-V253-V252-RESIDUAL';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s\'-]/g,' ').replace(/\s+/g,' ').trim();
function scopeRaw(raw){return parent.scopeRaw(raw);}
function isolate(raw){return parent.isolate?parent.isolate(raw):String(raw||'');}
function extract(raw){
 const o={...parent.extract(raw)};
 const d=fold(scopeRaw(raw));
 const future=d.includes('tuong lai se xay ra gi');
 const outcome=d.includes('outcome nay co xay ra hay khong');
 if(future&&outcome)o.v253_prediction=true;
 return Object.freeze(o);
}
global.QCEvidenceExtractorV5AY=Object.freeze({version:VERSION,scopeRaw,isolate,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
