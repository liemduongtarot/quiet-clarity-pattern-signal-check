(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV1;if(!parent)throw new Error('QCEvidenceExtractorV1R requires V1');
const VERSION='QCEvidenceExtractorV1R-REVIEW-CANDIDATE';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
function extract(raw){const d=fold(raw),o={...parent.extract(raw)};
 if(d.includes('core responsibility'))o.central_responsibility=true;
 if(d.includes('peripheral work'))o.peripheral_activity=true;
 if(d.includes('dang cho response')||d.includes('cho response'))o.response_omitted=true;
 if(d.includes('den cham'))o.bounded_delay=true;
 if(d.includes('left the decision closed'))o.closure_present=true;
 if(d.includes('tu thuc hien buoc do'))o.execution_completed=true;
 return Object.freeze(o);
}
global.QCEvidenceExtractorV1R=Object.freeze({version:VERSION,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
