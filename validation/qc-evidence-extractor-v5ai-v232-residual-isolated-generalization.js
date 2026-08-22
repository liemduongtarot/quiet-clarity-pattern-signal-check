(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5AH;if(!parent)throw new Error('V5AI requires V5AH');
const VERSION='QCEvidenceExtractorV5AI-V232-RESIDUAL-ISOLATED-GENERALIZATION';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function scopeRaw(raw){return parent.scopeRaw(raw);}
function isolate(raw){return parent.isolate?parent.isolate(raw):String(raw||'');}
function extract(raw){
 const clean=isolate(raw),d=fold(clean),o={...parent.extract(raw)};
 // Clarification: situation/context is otherwise supplied, but the user's endpoint response is missing.
 const clarContext=any(d,['everything around the event is supplied','everything around the situation is supplied','surrounding facts are supplied','surrounding facts are known','context is supplied','context is known','chronology is clear','sequence is clear']);
 const clarSelf=any(d,['my own endpoint response','my endpoint response','my own closing response','my closing action','my final behaviour','my final behavior','last action i myself took','response that came from me']);
 const clarGap=any(d,['except','missing','absent','not stated','not supplied','not provided','have not said','have not stated']);
 if(clarContext&&clarSelf&&clarGap)o.v232_clarification=true;
 // Decision: explicit transfer of the decision/final call, never generic "for me" alone.
 const decObject=any(d,['decision itself','final call itself','final choice itself','selection itself','pick which option','make the actual choice','choose the route','deciding call']);
 const decTransfer=any(d,['handing you','i want you to take','take the final call','on my behalf','comes from you rather than me','take the selection out of my hands','replace the decision i would otherwise make','leaving ownership of the choice with me']);
 if(decObject&&decTransfer)o.v232_decision=true;
 // Hypothetical: explicit non-lived statement plus test/validation framing.
 const hypoNonLived=any(d,['nothing here happened to me','not something i experienced','not something i lived','no event from my life','not autobiographical','not lived evidence','unrelated to my history','no real experience behind it']);
 const hypoTest=any(d,['validation material','test input','testing','assessment text','practice case','artificial','fictional','fabricated','invented','constructed']);
 if(hypoNonLived&&hypoTest)o.v232_hypothetical=true;
 // Third-party: infer private mind state without observable support.
 const thirdTarget=any(d,['their mind','someone else','other person','internal belief','private belief','hidden view','hidden conclusion','concealed conclusion','privately thinks','privately believes']);
 const thirdInfer=any(d,['work out','give me','tell me','infer','state','describe']);
 const thirdNoEvidence=any(d,['no words or actions','no behavioural evidence','no behavioral evidence','no observable evidence','nothing they did or said','no outward behaviour','no outward behavior','without observable evidence','none of their words or actions']);
 if(thirdTarget&&thirdInfer&&thirdNoEvidence)o.v232_third=true;
 // Freeze: contained/reversible starter + expanding possibilities + no initiation.
 const freezeStarter=any(d,['contained starter action','contained first action','bounded starter action','bounded first action','reversible first step','reversible move','low-commitment trial move','low commitment trial move','easy exit']);
 const freezeExpand=any(d,['adding possibilities','adding options','option growth','comparison kept widening','comparison kept expanding','broadening choices','more alternatives','generated more alternatives']);
 const freezeNoStart=any(d,['remained still','stayed inactive','never started','no start','instead of beginning','made no start','did not start']);
 if(freezeStarter&&freezeExpand&&freezeNoStart)o.v232_freeze=true;
 // Slow: one bounded pause/review + response + closure.
 const slowBound=any(d,['paused inside a clear limit','clear limit','defined boundary','one defined boundary','bounded pause','finite delay','contained interval','time-limited pause','time limited pause']);
 const slowOnce=any(d,['single review pass','reviewed a single time','reviewed once','checked once','one check','one review']);
 const slowResponse=any(d,['responded','answered','replied','gave my response']);
 const slowClosed=any(d,['did not reopen','ended the review cycle','left the matter closed','moved on','stopped reviewing','treated the process as complete','issue closed']);
 if(slowBound&&slowOnce&&slowResponse&&slowClosed)o.v232_slow=true;
 // Sequence: approach + retreat + cycle/repeat + no new information.
 const seqApproach=any(d,['approached the practical move','approached the move','moved toward','came close','nearly acted','advanced toward','got close']);
 const seqRetreat=any(d,['retreated','withdrew','stepped back','pulled back','pulled away','reversed course','backed out']);
 const seqRepeat=any(d,['cycled back','same conclusion','same judgement','same judgment','same reasoning','earlier reasoning','revisited','returned to']);
 const seqNoNew=any(d,['without new facts','no new facts','without new evidence','no new evidence','no additional information','no new information','nothing changed','evidence stayed unchanged']);
 if(seqApproach&&seqRetreat&&seqRepeat&&seqNoNew)o.v232_sequence=true;
 // Neutral: retained self-owned choice + execution + closure; must beat parent false ignore.
 const neutralOwned=any(d,['retained the choice','kept the choice','choice stayed mine','made my own choice','final decision with me','decision ownership stayed with me','final agency remained mine','made the final call myself']);
 const neutralDone=any(d,['executed it','executed the action','carried it out','completed the action','finished the action','completed what i chose']);
 const neutralClosed=any(d,['left the issue resolved','left the matter closed','moved on','did not reopen','treated the situation as settled','did not revisit']);
 if(neutralOwned&&neutralDone&&neutralClosed)o.v232_neutral=true;
 return Object.freeze(o);
}
global.QCEvidenceExtractorV5AI=Object.freeze({version:VERSION,scopeRaw,isolate,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
