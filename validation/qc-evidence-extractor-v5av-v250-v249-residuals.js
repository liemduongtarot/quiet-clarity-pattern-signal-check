(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5AU;if(!parent)throw new Error('V5AV requires V5AU');
const VERSION='QCEvidenceExtractorV5AV-V250-V249-RESIDUALS';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s\'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function scopeRaw(raw){return parent.scopeRaw(raw);}
function isolate(raw){return parent.isolate?parent.isolate(raw):String(raw||'');}
function extract(raw){
 const o={...parent.extract(raw)};
 const d=fold(scopeRaw(raw));
 const frStart=any(d,['low-commitment first move','bounded first action','first action co gioi han']);
 const frGrow=any(d,['generated more options','added routes','them route']);
 const frNo=any(d,['remained still','no action began','khong bat dau gi']);
 if(frStart&&frGrow&&frNo)o.v250_freeze=true;
 const igNeed=any(d,['core problem still needed me to act','core problem van can toi hanh dong']);
 const igSide=any(d,['kept busy elsewhere','giu minh ban o cho khac']);
 if(igNeed&&igSide)o.v250_ignore=true;
 const sqNear=any(d,['moved toward execution','tien toi execution']);
 const sqBack=any(d,['retreated','retreat']);
 const sqSame=any(d,['cycled back to the old conclusion','cycle ve ket luan cu']);
 const sqNoNew=any(d,['without added information','khong co information them']);
 if(sqNear&&sqBack&&sqSame&&sqNoNew)o.v250_sequence=true;
 const nOwn=any(d,['kept the deciding authority','retained deciding authority','giu deciding authority']);
 const nDone=any(d,['completed the action','completed action','hoan tat action']);
 const nClose=any(d,['left the issue closed','left issue closed','de issue dong lai']);
 if(nOwn&&nDone&&nClose)o.v250_neutral=true;
 return Object.freeze(o);
}
global.QCEvidenceExtractorV5AV=Object.freeze({version:VERSION,scopeRaw,isolate,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
