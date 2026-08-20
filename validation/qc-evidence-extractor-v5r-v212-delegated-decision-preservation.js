(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5;if(!parent)throw new Error('QCEvidenceExtractorV5R requires V5');
const VERSION='QCEvidenceExtractorV5R-V212-DELEGATED-DECISION-PRESERVATION';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function extract(raw){
 const scoped=parent.scopeRaw(raw),d=fold(scoped),o={...parent.extract(scoped)};
 const secondPersonSelection=any(d,['i want you to select','i want you to choose','you select the path','you choose the path','choose the path for me','choose the action for me','select the path for me','select the action for me','chon duong cho toi','chon huong cho toi','chon hanh dong cho toi','toi muon ban chon','hay chon giup toi']);
 const selfChoiceObject=any(d,['path i should follow','action i should take','option for me','choice for me','duong toi nen di','huong toi nen theo','hanh dong toi nen lam','phuong an cho toi','lua chon cho toi']);
 const replaceSupport=any(d,['instead of helping me decide','rather than helping me decide','instead of leaving the choice with me','replace my choice','replace mine','thay vi giup toi tu quyet','thay vi de toi tu quyet','thay cho lua chon cua toi','thay lua chon cua toi']);
 const explicitOnBehalf=any(d,['on my behalf','in my place','for me','thay toi','cho toi','o vi tri cua toi']);
 const delegated=secondPersonSelection&&selfChoiceObject&&(replaceSupport||explicitOnBehalf);
 if(delegated){o.delegated_decision=true;o.agency_transfer_explicit=true;o.choice_object_present=true;}
 return Object.freeze(o);
}
global.QCEvidenceExtractorV5R=Object.freeze({version:VERSION,scopeRaw:parent.scopeRaw,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
