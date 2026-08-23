(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5AW;if(!parent)throw new Error('V5AX requires V5AW');
const VERSION='QCEvidenceExtractorV5AX-V252-V251-RESIDUALS';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s\'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function scopeRaw(raw){return parent.scopeRaw(raw);}
function isolate(raw){return parent.isolate?parent.isolate(raw):String(raw||'');}
function extract(raw){
 const o={...parent.extract(raw)};
 const d=fold(scopeRaw(raw));
 const thirdHidden=any(d,['ket luan kin ben trong cua nguoi khac','hidden internal conclusion of another person','private conclusion of another person']);
 const thirdNoVerify=any(d,['khong co hanh vi ben ngoai de verify','without external behaviour to verify','no external behaviour to verify']);
 if(thirdHidden&&thirdNoVerify)o.v252_third=true;
 const nOwn=any(d,['kept the final deciding authority','retained the final deciding authority','giu final deciding authority']);
 const nDone=any(d,['completed the action','completed action','hoan tat action']);
 const nClose=any(d,['left the issue closed without reconsidering it','left issue closed without reconsidering','de issue dong lai ma khong reconsider']);
 if(nOwn&&nDone&&nClose)o.v252_neutral=true;
 return Object.freeze(o);
}
global.QCEvidenceExtractorV5AX=Object.freeze({version:VERSION,scopeRaw,isolate,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
