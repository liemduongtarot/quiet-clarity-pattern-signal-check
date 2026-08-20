(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV1R3;if(!parent)throw new Error('QCEvidenceExtractorV1R4 requires V1R3');
const VERSION='QCEvidenceExtractorV1R4-V210-RELATIONAL-PRESERVATION';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
function extract(raw){const d=fold(raw),o={...parent.extract(raw)};
 const relationalLate=(d.includes('answered')||d.includes('responded')||d.includes('replied'))&&d.includes('later than')&&(d.includes('normally would')||d.includes('usually would')||d.includes('normal'));
 const relationalLateVi=(d.includes('tra loi')||d.includes('phan hoi'))&&(d.includes('muon hon')||d.includes('cham hon'))&&(d.includes('binh thuong')||d.includes('thuong le'));
 if(relationalLate||relationalLateVi)o.bounded_delay=true;
 return Object.freeze(o);}
global.QCEvidenceExtractorV1R4=Object.freeze({version:VERSION,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
