(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5AQ;if(!parent)throw new Error('V5AR requires V5AQ');
const VERSION='QCEvidenceExtractorV5AR-V243-V242-RESIDUALS';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s\'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function scopeRaw(raw){return parent.scopeRaw(raw);}
function isolate(raw){return parent.isolate?parent.isolate(raw):String(raw||'');}
function extract(raw){const d=fold(isolate(raw)),o={...parent.extract(raw)};
 const clReal=any(d,['lived context','real event','real episode','real situation']);const clGap=any(d,['last behavioural response','closing behaviour','endpoint behaviour','final observable move']);if(clReal&&clGap)o.v243_clarification=true;
 const deFinal=any(d,['binding selection yourself','final route in place of me','final selection for me','deciding authority moved to you']);const deOwn=any(d,['rather than helping me weigh it','in place of me making that choice','rather than only helping me compare choices','not advice from you']);if(deFinal&&deOwn)o.v243_decision=true;
 const thMind=any(d,['internal view','private thought','hidden conclusion','concealed belief']);const thNo=any(d,['nothing behavioural confirming it','no outward behaviour','no words or actions establish it','without observable evidence']);if(thMind&&thNo)o.v243_third=true;
 const prTime=any(d,['named milestone','later deadline','future checkpoint','future boundary','later cutoff']);const prWant=any(d,['finish as i hope','end in my favour','result i want','preferred result']);if(prTime&&prWant)o.v243_prediction=true;
 const frStart=any(d,['small bounded start','reversible starter','easy-to-undo first move','low-commitment start']);const frGrow=any(d,['generated more alternatives','widened the option set','kept comparing','expanded possibilities']);const frNo=any(d,['rather than acting','never began','stayed still','made no move']);if(frStart&&frGrow&&frNo)o.v243_freeze=true;
 const igNeed=any(d,['main issue still needed my action','something important required my response','my action was needed on the main matter','central obligation remained unanswered']);const igSide=any(d,['shifted effort into secondary work','busy with less relevant work','occupied myself elsewhere','peripheral tasks']);if(igNeed&&igSide)o.v243_ignore=true;
 const sqNear=any(d,['nearly acted','got close to acting','moved toward action','approached execution']);const sqBack=any(d,['reversed course','backed off','withdrew','retreated']);const sqSame=any(d,['revisited the same assessment','returned to prior reasoning','same conclusion','same reasoning']);const sqNoNew=any(d,['unchanged information','no new information','without new facts','no new evidence']);if(sqNear&&sqBack&&sqSame&&sqNoNew)o.v243_sequence=true;
 const nOwn=any(d,['kept the final choice','choice remained mine through completion','decision stayed mine through completion','final call stayed with me']);const nDone=any(d,['carried it out','through completion','executed it','completed the action']);const nClose=any(d,['left the matter settled','did not reopen it','did not revisit the decision','left it closed']);if(nOwn&&nDone&&nClose)o.v243_neutral=true;
 return Object.freeze(o);}
global.QCEvidenceExtractorV5AR=Object.freeze({version:VERSION,scopeRaw,isolate,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
