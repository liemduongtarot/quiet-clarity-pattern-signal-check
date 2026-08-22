(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5AP;if(!parent)throw new Error('V5AQ requires V5AP');
const VERSION='QCEvidenceExtractorV5AQ-V242-V241-RESIDUALS';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s\'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function scopeRaw(raw){return parent.scopeRaw(raw);}
function isolate(raw){return parent.isolate?parent.isolate(raw):String(raw||'');}
function extract(raw){const d=fold(isolate(raw)),o={...parent.extract(raw)};
 const clReal=any(d,['real context','real situation','happened to me','lived context']);const clGap=any(d,['behavioural step that came from me at the close','endpoint behaviour remains unspecified','observable closing response','what i did at the close']);if(clReal&&clGap)o.v242_clarification=true;
 const deTake=any(d,['take the deciding act away from me','make the final selection yourself','final decision authority','decision ownership']);const deFinal=any(d,['final selection','option becomes final','pick the route that stands','choice should substitute for mine']);if(deTake&&deFinal)o.v242_decision=true;
 const hySynthetic=any(d,['synthetic validation text','manufactured test input','artificial assessment text','fabricated validation material']);const hyNoLife=any(d,['nothing described here is autobiographical','no lived event behind it','rather than personal evidence','did not happen in my life']);if(hySynthetic&&hyNoLife)o.v242_hypothetical=true;
 const thPrivate=any(d,['private conclusion','concealed thought','internal view','hidden belief']);const thNoObs=any(d,['no words or actions establish it','no behavioural basis','nothing outward confirms it','no observable conduct']);if(thPrivate&&thNoObs)o.v242_third=true;
 const prTime=any(d,['named cutoff','later boundary','future checkpoint','later deadline','future cutoff']);const prWant=any(d,['finish the way i hope','finish the way i want','result i want','resolve in my favour']);if(prTime&&prWant)o.v242_prediction=true;
 const frStart=any(d,['easy-to-undo opening action','low-commitment opening step','small reversible first move','reversible first move']);const frExpand=any(d,['kept comparing','generated alternatives','broadened the choices','widened the alternatives']);const frStop=any(d,['remained still','instead of starting','did not begin','never began']);if(frStart&&frExpand&&frStop)o.v242_freeze=true;
 const igNeed=any(d,['main obligation still needed me','main matter still required my action','central responsibility remained unanswered']);const igDiv=any(d,['diverted effort into tasks that could not settle it','redirected effort into secondary work','focused on peripheral tasks']);if(igNeed&&igDiv)o.v242_ignore=true;
 const slBound=any(d,['one contained interval','one defined pause','bounded pause']);const slCheck=any(d,['checked once','one review','reviewed once']);const slClose=any(d,['ended the review','did not reopen','moved on','closed the matter']);if(slBound&&slCheck&&slClose)o.v242_slow=true;
 const nOwn=any(d,['decision stayed mine through completion','kept the final decision with me','final agency remained mine']);const nDone=any(d,['through completion','carried it out','completed it','executed it']);const nClose=any(d,['did not reopen it','left it closed','did not return','moved on']);if(nOwn&&nDone&&nClose)o.v242_neutral=true;
 return Object.freeze(o);}
global.QCEvidenceExtractorV5AQ=Object.freeze({version:VERSION,scopeRaw,isolate,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
