(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5AT;if(!parent)throw new Error('V5AU requires V5AT');
const VERSION='QCEvidenceExtractorV5AU-V249-V248-RESIDUALS';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s\'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function scopeRaw(raw){return parent.scopeRaw(raw);}
function isolate(raw){return parent.isolate?parent.isolate(raw):String(raw||'');}
function extract(raw){
 const o={...parent.extract(raw)};
 const d=fold(scopeRaw(raw));
 const frStart=any(d,['easy opening step','safe initial move','initial move an toan','opening step de lam','small opening action']);
 const frGrow=any(d,['additional comparison','option-building','option building','expanded the choice set','more comparison','so sanh them']);
 const frNo=any(d,['replaced beginning','displaced initiation','stayed put','van dung tai cho','thay cho bat dau']);
 if(frStart&&frGrow&&frNo)o.v249_freeze=true;
 const igNeed=any(d,['important obligation needed my response','primary responsibility open','primary responsibility remained open','central obligation still needed my response','obligation quan trong can response cua toi','primary responsibility mo']);
 const igSide=any(d,['kept busy with tasks that could not resolve it','working on less relevant things','busy with less relevant things','lam nhung viec it lien quan hon','ban voi task khong the giai quyet no']);
 if(igNeed&&igSide)o.v249_ignore=true;
 const sqNear=any(d,['gan hanh dong','near action','close to action']);
 const sqBack=any(d,['doi chieu','changed direction','reversed direction','pulled back']);
 const sqSame=any(d,['revisit cung assessment','revisited the same assessment','returned to the same assessment']);
 const sqNoNew=any(d,['evidence khong doi','evidence unchanged','unchanged evidence','same evidence']);
 if(sqNear&&sqBack&&sqSame&&sqNoNew)o.v249_sequence=true;
 const nOwn=any(d,['retained the final decision','giu final decision','kept the final decision','final decision stayed with me','tu dua final choice']);
 const nDone=any(d,['acted on it','hanh dong theo no','carried it through','thuc hien den cung']);
 const nClose=any(d,['did not return to reconsider it','khong quay lai reconsider','did not reconsider it','left it closed','khong reconsider','khong reopen quyet dinh']);
 if(nOwn&&nDone&&nClose)o.v249_neutral=true;
 return Object.freeze(o);
}
global.QCEvidenceExtractorV5AU=Object.freeze({version:VERSION,scopeRaw,isolate,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
