(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV1R;if(!parent)throw new Error('QCEvidenceExtractorV1R2 requires V1R');
const VERSION='QCEvidenceExtractorV1R2-REVIEW-CANDIDATE';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
function extract(raw){const d=fold(raw),o={...parent.extract(raw)};
 if(d.includes('without asking anyone else to decide for me')||d.includes('without asking someone else to decide for me')||d.includes('did not ask anyone else to decide for me')||d.includes('did not ask anyone to decide for me')||d.includes('khong nho ai quyet dinh thay toi')||d.includes('khong yeu cau ai quyet dinh thay toi'))o.delegation_negated=true;
 return Object.freeze(o);
}
global.QCEvidenceExtractorV1R2=Object.freeze({version:VERSION,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
