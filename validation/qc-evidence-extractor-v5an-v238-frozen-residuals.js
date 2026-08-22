(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5AM;if(!parent)throw new Error('V5AN requires V5AM');
const VERSION='QCEvidenceExtractorV5AN-V238-FROZEN-RESIDUALS';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function scopeRaw(raw){return parent.scopeRaw(raw);}
function isolate(raw){return parent.isolate?parent.isolate(raw):String(raw||'');}
function extract(raw){const d=fold(isolate(raw)),o={...parent.extract(raw)};
 // Clarification: real context supplied, own endpoint action omitted.
 const clReal=any(d,['real context','real episode','actually happened','event is not hypothetical']);
 const clGap=any(d,['except for what i did immediately before the end','my own observable response at the endpoint','own closing response has not been supplied','what i did immediately before the end']);
 if(clReal&&clGap)o.v238_clarification=true;
 // Decision: explicit substitution of assistant decision for user's own decision.
 const deSub=any(d,['your decision to substitute for mine','decision to substitute for mine','take the final call out of my hands','actual final choice']);
 const deNotGuide=any(d,['not just guide it','not merely advise','choose the route','not merely advise me']);
 if(deSub&&deNotGuide)o.v238_decision=true;
 // Hypothetical: explicitly not lived + test-only origin.
 const hyNon=any(d,['nothing described here was lived by me','was not lived by me','unrelated to any real episode i experienced','no autobiographical event behind it']);
 const hyTest=any(d,['exists only as test input','test input','constructed practice case','fabricated assessment example']);
 if(hyNon&&hyTest)o.v238_hypothetical=true;
 // Third-party: concealed conclusion + no observable support.
 const thTarget=any(d,['their concealed conclusion','concealed conclusion','private conclusion','hidden mental position']);
 const thAsk=any(d,['describe','infer','work out','state']);
 const thNo=any(d,['nothing observable from them supports it','no outward evidence','without words or actions that support it','nothing they did or said']);
 if(thTarget&&thAsk&&thNo)o.v238_third=true;
 // Prediction: named future checkpoint/deadline + explicit future outcome question.
 const prTime=any(d,['named checkpoint','later deadline','future cutoff','future checkpoint']);
 const prAsk=any(d,['will this end the way i hope','will the situation resolve in my favour','will the result i want have occurred']);
 if(prTime&&prAsk)o.v238_prediction=true;
 // Freeze: reversible/low-commitment starter + widening/additional choices + no initiation.
 const frStart=any(d,['low-commitment opening action','safe reversible starter','reversible first move','opening action']);
 const frExpand=any(d,['comparison widened','kept adding choices','expanding alternatives','widened instead']);
 const frNo=any(d,['instead of action beginning','made no start','never started','no start']);
 if(frStart&&frExpand&&frNo)o.v238_freeze=true;
 // Ignore: primary/core matter requires action + diverted to secondary/non-settling work.
 const igCore=any(d,['action was still required on the primary issue','primary issue','core matter stayed unresolved','core matter']);
 const igDiv=any(d,['focused on secondary activity','diverted effort into work that could not settle it','secondary activity','could not settle it']);
 if(igCore&&igDiv)o.v238_ignore=true;
 // Slow: one contained interval/check followed by move-on/closure.
 const slBound=any(d,['one contained interval','contained interval','one defined delay']);
 const slOnce=any(d,['made one check','one check','one review']);
 const slClose=any(d,['then moved on','moved on','ended the review cycle']);
 if(slBound&&slOnce&&slClose)o.v238_slow=true;
 return Object.freeze(o);}
global.QCEvidenceExtractorV5AN=Object.freeze({version:VERSION,scopeRaw,isolate,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
