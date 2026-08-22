(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5AK;if(!parent)throw new Error('V5AL requires V5AK');
const VERSION='QCEvidenceExtractorV5AL-V236-CONTEXTUAL-MECHANISMS';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function scopeRaw(raw){return parent.scopeRaw(raw);}
function isolate(raw){return parent.isolate?parent.isolate(raw):String(raw||'');}
function extract(raw){
 const clean=isolate(raw),d=fold(clean),o={...parent.extract(raw)};
 // Clarification: real/described situation + user's endpoint behaviour + explicit knowledge gap.
 const cReal=any(d,['situation is real','event is real','real situation','real episode','lived account','happened to me']);
 const cEndpoint=any(d,['personal endpoint behaviour','personal endpoint behavior','endpoint behaviour','endpoint behavior','last observable response','closing action','final response']);
 const cGap=any(d,['remains unknown','still missing','is missing','is absent','not stated','not included','left out','unknown']);
 if(cReal&&cEndpoint&&cGap)o.v236_clarification=true;
 // Decision: final selection/choice itself + explicit replacement of user agency.
 const dObject=any(d,['final selection itself','final choice itself','decision itself','deciding call','actual route','actual choice']);
 const dTransfer=any(d,['comes from you instead of me','come from you instead of me','comes from you rather than me','from you rather than me','for me rather than','ownership to you','take ownership','replace mine']);
 if(dObject&&dTransfer)o.v236_decision=true;
 // Hypothetical: artificial/synthetic validation/evaluation + explicit non-personal source.
 const hFrame=any(d,['artificial validation text','artificial example','synthetic validation material','synthetic test material','validation text','validation material','evaluation material','only for evaluation']);
 const hNonLived=any(d,['rather than personal evidence','not personal evidence','does not come from my life','not from my life','not from lived experience','not something i experienced','nothing here happened to me']);
 if(hFrame&&hNonLived)o.v236_hypothetical=true;
 // Prediction: future boundary/deadline/checkpoint + asks whether desired outcome will occur.
 const pFuture=any(d,['stated deadline','future deadline','future date','future checkpoint','future milestone','future boundary','looking ahead']);
 const pOutcome=any(d,['will things end the way i want','will this end the way i want','will the outcome i want','will the result i want','will this resolve in my favour','will this resolve in my favor','will the preferred result']);
 if(pFuture&&pOutcome)o.v236_prediction=true;
 // Freeze: reversible/easy-to-reverse starter + option generation/expansion + inactivity/no start.
 const fStart=any(d,['easy-to-reverse first action','easy to reverse first action','reversible first action','reversible opening step','bounded starter action','contained first step','low-commitment move']);
 const fExpand=any(d,['kept generating options','generating options','expanded alternatives','expanding alternatives','broadened choices','more possibilities','option growth']);
 const fStill=any(d,['remained still','stayed still','stayed inactive','never started','made no start','did not begin','instead of beginning']);
 if(fStart&&fExpand&&fStill)o.v236_freeze=true;
 // Ignore: central/core obligation unresolved or awaiting response + attention diverted into secondary/side activity.
 const iCore=any(d,['central matter','core obligation','main issue','important matter','central obligation','main matter']);
 const iPending=any(d,['stayed unresolved','remained unresolved','was waiting for my response','waiting for my response','needed my response','remained unanswered','stayed unanswered']);
 const iDivert=any(d,['shifted effort to secondary activity','shifted effort','secondary activity','diverted into side tasks','side tasks','side work','peripheral tasks','less relevant work']);
 if(iCore&&iPending&&iDivert)o.v236_ignore=true;
 // Slow: exactly one finite/bounded delay/review + response + explicit no-reopen/stop revisiting.
 const sBound=any(d,['one finite delay','finite delay','one defined pause','one bounded pause','one contained interval','clear boundary']);
 const sOnce=any(d,['one review','reviewed once','one check','checked once','single review']);
 const sResponse=any(d,['before i answered','answered','responded','replied','gave my response']);
 const sClose=any(d,['stopped revisiting','stopped reviewing','did not reopen','moved on','closed the matter','left it closed']);
 if(sBound&&sOnce&&sResponse&&sClose)o.v236_slow=true;
 return Object.freeze(o);
}
global.QCEvidenceExtractorV5AL=Object.freeze({version:VERSION,scopeRaw,isolate,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
