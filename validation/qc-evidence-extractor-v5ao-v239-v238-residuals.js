(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5AN;if(!parent)throw new Error('V5AO requires V5AN');
const VERSION='QCEvidenceExtractorV5AO-V239-V238-RESIDUALS';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function scopeRaw(raw){return parent.scopeRaw(raw);}
function isolate(raw){return parent.isolate?parent.isolate(raw):String(raw||'');}
function extract(raw){const d=fold(isolate(raw)),o={...parent.extract(raw)};
 const clReal=any(d,['lived episode','real context','actually happened','actual event']);const clGap=any(d,['what remains unstated is what i personally did as it ended','personally did as it ended','closing behaviour itself has not been provided']);if(clReal&&clGap)o.v239_clarification=true;
 const deFinal=any(d,['final selection should come from you','selection should come from you','actual final call on my behalf','handing that authority to you']);const deOwn=any(d,['rather than from my own judgement','on my behalf','authority to you','instead of leaving the decision with me']);if(deFinal&&deOwn)o.v239_decision=true;
 const hyNon=any(d,['nothing in this example happened to me','unrelated to any episode from my own life','not based on anything i lived','not drawn from lived experience']);const hyFrame=any(d,['validation input','artificial test case','constructed only for testing','evaluation only']);if(hyNon&&hyFrame)o.v239_hypothetical=true;
 const frStart=any(d,['low-commitment starter i could undo','safe reversible opening step','one bounded first action with an easy exit','reversible starting move']);const frExpand=any(d,['comparison kept growing','broadened the option set','option expansion','widening the alternatives']);const frStop=any(d,['stayed still','made no start','replaced initiation','never began']);if(frStart&&frExpand&&frStop)o.v239_freeze=true;
 const igCore=any(d,['primary obligation was waiting for my action','primary obligation','main issue still required my action']);const igDiv=any(d,['shifted into secondary activity','secondary activity','moved my attention into secondary work']);if(igCore&&igDiv)o.v239_ignore=true;
 const slBound=any(d,['one defined pause','one contained interval','finite pause','bounded delay']);const slReview=any(d,['one review','checked once','single check']);const slDone=any(d,['ended the review cycle','then moved on','left the matter closed','did not reopen']);if(slBound&&slReview&&slDone)o.v239_slow=true;
 const nOwn=any(d,['kept the final decision with me','decision stayed mine','final agency remained mine','retained ownership of the choice']);const nDone=any(d,['executed it','completed it','carried it out','finished the action']);const nClose=any(d,['left the issue closed','did not return to the choice process','moved on','treated the situation as settled']);if(nOwn&&nDone&&nClose)o.v239_neutral=true;
 return Object.freeze(o);}
global.QCEvidenceExtractorV5AO=Object.freeze({version:VERSION,scopeRaw,isolate,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
