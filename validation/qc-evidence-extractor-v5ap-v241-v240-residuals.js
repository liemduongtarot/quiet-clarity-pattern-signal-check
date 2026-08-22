(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5AO;if(!parent)throw new Error('V5AP requires V5AO');
const VERSION='QCEvidenceExtractorV5AP-V241-V240-RESIDUALS';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s\'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function scopeRaw(raw){return parent.scopeRaw(raw);}
function isolate(raw){return parent.isolate?parent.isolate(raw):String(raw||'');}
function extract(raw){const d=fold(isolate(raw)),o={...parent.extract(raw)};
 const deAuth=any(d,['handing you final decision authority','take decision ownership','choice should substitute for mine','deciding call to come from you']);const dePick=any(d,['pick the route that stands','choose which option becomes final','not just influence it','not from my judgement']);if(deAuth&&dePick)o.v241_decision=true;
 const hyArt=any(d,['artificial assessment text','fabricated validation material','constructed evaluation input']);const hyNon=any(d,['rather than personal evidence','did not happen in my life','nothing here is autobiographical']);if(hyArt&&hyNon)o.v241_hypothetical=true;
 const thMind=any(d,['internal view','private belief','hidden conclusion','secretly thinks']);const thNo=any(d,['nothing outward confirms it','no observable conduct','without words or actions','no behavioural basis']);if(thMind&&thNo)o.v241_third=true;
 const prFuture=any(d,['later boundary','future checkpoint','later deadline','future cutoff','future milestone']);const prOutcome=any(d,['will the situation finish the way i want','will the result i want','resolve in my favour','preferred outcome']);if(prFuture&&prOutcome)o.v241_prediction=true;
 const frStart=any(d,['safe opening move','low-commitment opening action','reversible first move','bounded first step']);const frExpand=any(d,['kept comparing','added choices','widened the alternatives','option growth']);const frStop=any(d,['remained still','instead of starting','never began','replaced initiation']);if(frStart&&frExpand&&frStop)o.v241_freeze=true;
 const igNeed=any(d,['main matter still required my action','something consequential needed my response','central responsibility remained unanswered','primary issue stayed unresolved']);const igSide=any(d,['redirected effort into secondary work','busy with less relevant work','focused on peripheral tasks','shifted attention to side activity']);if(igNeed&&igSide)o.v241_ignore=true;
 return Object.freeze(o);}
global.QCEvidenceExtractorV5AP=Object.freeze({version:VERSION,scopeRaw,isolate,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
