(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5AV;if(!parent)throw new Error('V5AW requires V5AV');
const VERSION='QCEvidenceExtractorV5AW-V251-V250-B-RESIDUALS';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s\'-]/g,' ').replace(/\s+/g,' ').trim();
function scopeRaw(raw){return parent.scopeRaw(raw);}
function isolate(raw){return parent.isolate?parent.isolate(raw):String(raw||'');}
function extract(raw){
 const o={...parent.extract(raw)};
 const d=fold(scopeRaw(raw));
 if(d.includes('first move it cam ket')&&d.includes('tao them option')&&d.includes('dung yen'))o.v251_freeze_vi=true;
 if(d.includes('viec trung tam van can action cua toi')&&d.includes('dung effort cho cong viec thu yeu'))o.v251_ignore_vi=true;
 if(d.includes('pause gioi han')&&d.includes('mot review')&&d.includes('truoc khi toi tra loi')&&d.includes('ngung revisit'))o.v251_slow_vi=true;
 return Object.freeze(o);
}
global.QCEvidenceExtractorV5AW=Object.freeze({version:VERSION,scopeRaw,isolate,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
