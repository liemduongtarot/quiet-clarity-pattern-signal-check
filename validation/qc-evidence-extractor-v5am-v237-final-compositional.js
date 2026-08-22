(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5AL;if(!parent)throw new Error('V5AM requires V5AL');
const VERSION='QCEvidenceExtractorV5AM-V237-FINAL-COMPOSITIONAL';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function scopeRaw(raw){return parent.scopeRaw(raw);}
function isolate(raw){return parent.isolate?parent.isolate(raw):String(raw||'');}
function extract(raw){const d=fold(isolate(raw)),o={...parent.extract(raw)};
 const decOwn=any(d,['take ownership of the deciding act','ownership of the deciding act','deciding act']);
 const decPick=any(d,['choose the option that will stand','choose the option','option that will stand']);if(decOwn&&decPick)o.v237_decision=true;
 const hypoNon=any(d,['nothing here is autobiographical','not autobiographical','nothing here comes from my life','not from my life']);
 const hypoFrame=any(d,['constructed test input','test input','constructed assessment','validation material','synthetic material']);if(hypoNon&&hypoFrame)o.v237_hypothetical=true;
 const igPending=any(d,['something important stayed unanswered','important stayed unanswered','core obligation was waiting for my response','waiting for my response']);
 const igDivert=any(d,['redirected attention to less relevant activity','less relevant activity','diverted into side tasks','side tasks']);if(igPending&&igDivert)o.v237_ignore=true;
 const sqApproach=any(d,['came close to acting','came close to the action','approached acting']);
 const sqRetreat=any(d,['stepped away','pulled away','withdrew','retreated']);
 const sqCycle=any(d,['cycled back to the prior reasoning','cycled back','returned to prior reasoning','same reasoning']);
 const sqNoNew=any(d,['no new facts','without new facts','no new evidence','nothing changed']);if(sqApproach&&sqRetreat&&sqCycle&&sqNoNew)o.v237_sequence=true;
 const nOwn=any(d,['kept the final choice with me','final choice with me','choice stayed mine','retained the choice']);
 const nDone=any(d,['carried it out','executed it','completed the action','finished the action']);
 const nClosed=any(d,['left the matter closed','left the issue closed','did not reopen','moved on','left the matter resolved']);if(nOwn&&nDone&&nClosed)o.v237_neutral=true;
 return Object.freeze(o);}
global.QCEvidenceExtractorV5AM=Object.freeze({version:VERSION,scopeRaw,isolate,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
