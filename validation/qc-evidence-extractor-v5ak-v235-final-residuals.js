(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5AJ;if(!parent)throw new Error('V5AK requires V5AJ');
const VERSION='QCEvidenceExtractorV5AK-V235-FINAL-RESIDUALS';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function scopeRaw(raw){return parent.scopeRaw(raw);}
function isolate(raw){return parent.isolate?parent.isolate(raw):String(raw||'');}
function extract(raw){
 const clean=isolate(raw),d=fold(clean),o={...parent.extract(raw)};
 // Decision residual: explicit ownership handoff plus deciding call/selection.
 const decOwnership=any(d,['giving you ownership','give you ownership','handing over ownership','decision ownership to you']);
 const decCall=any(d,['deciding call','choose the option that stands','choose which option stands','make the deciding choice','selection comes from you']);
 if(decOwnership&&decCall)o.v235_decision=true;
 // Hypothetical residuals: explicit non-lived/non-personal origin plus synthetic/artificial evaluation framing.
 const hypoNonLived=any(d,['nothing here comes from my life','not from my life','not from something i experienced','not something i experienced','not personal evidence','nothing here happened to me']);
 const hypoTest=any(d,['synthetic validation material','validation material','artificial example','artificial practice','only for evaluation','for evaluation','synthetic material']);
 if(hypoNonLived&&hypoTest)o.v235_hypothetical=true;
 // Slow residual: one defined pause/review, response, then explicit closure/move-on.
 const slowBound=any(d,['one defined pause','defined pause','one finite pause','one bounded pause']);
 const slowOnce=any(d,['one review','reviewed once','one check','checked once']);
 const slowResponse=any(d,['gave my response','responded','answered','replied']);
 const slowClosed=any(d,['moved on','closed the matter','did not reopen','stopped reviewing','left it closed']);
 if(slowBound&&slowOnce&&slowResponse&&slowClosed)o.v235_slow=true;
 return Object.freeze(o);
}
global.QCEvidenceExtractorV5AK=Object.freeze({version:VERSION,scopeRaw,isolate,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
