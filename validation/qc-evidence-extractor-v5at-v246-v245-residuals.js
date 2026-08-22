(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5AS;if(!parent)throw new Error('V5AT requires V5AS');
const VERSION='QCEvidenceExtractorV5AT-V246-V245-RESIDUALS';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s\'-]/g,' ').replace(/\s+/g,' ').trim();
function scopeRaw(raw){return parent.scopeRaw(raw);}
function isolate(raw){return parent.isolate?parent.isolate(raw):String(raw||'');}
function extract(raw){
 const o={...parent.extract(raw)};
 const d=fold(scopeRaw(raw));
 if(d.includes('cam quyen chon cuoi')&&d.includes('lua chon cua ban thay the lua chon cua toi'))o.v246_decision_vi=true;
 if(d.includes('pause gioi han')&&d.includes('mot review')&&d.includes('xem chuyen da settled'))o.v246_slow_vi=true;
 if(d.includes('gan hanh dong')&&d.includes('buoc lui')&&d.includes('quay lai reasoning truoc')&&d.includes('khong co information moi'))o.v246_sequence_vi=true;
 return Object.freeze(o);
}
global.QCEvidenceExtractorV5AT=Object.freeze({version:VERSION,scopeRaw,isolate,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
