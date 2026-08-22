(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5AI;if(!parent)throw new Error('V5AJ requires V5AI');
const VERSION='QCEvidenceExtractorV5AJ-V234-RESIDUAL-GENERALIZATION';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function scopeRaw(raw){return parent.scopeRaw(raw);}
function isolate(raw){return parent.isolate?parent.isolate(raw):String(raw||'');}
function extract(raw){
 const clean=isolate(raw),d=fold(clean),o={...parent.extract(raw)};
 const clarReal=any(d,['really occurred','real event','lived event','this happened','actually occurred']);
 const clarContext=any(d,['surrounding sequence is available','surrounding sequence','context is available','event is supplied','episode is supplied','everything around']);
 const clarSelf=any(d,['my own last observable response','my last observable response','my own endpoint response','my closing response','my own closing action']);
 const clarGap=any(d,['not included','missing','absent','not supplied','not stated','left out']);
 if(clarReal&&clarSelf&&clarGap&&(clarContext||d.includes('event')))o.v234_clarification=true;
 const decAct=any(d,['make the deciding choice','make the final choice','make the decision','choose the final option','take the deciding choice','pick which option becomes final']);
 const decContrast=any(d,['rather than merely helping me compare','rather than helping me compare','not just help me evaluate','not merely advise','instead of advising','decision comes from you']);
 if(decAct&&(decContrast||any(d,['on my behalf','from my hands','handing over','take the final call'])))o.v234_decision=true;
 const hypoTest=any(d,['artificial practice scenario','artificial scenario','practice scenario','validation material','synthetic evaluation','invented test input','fictional case']);
 const hypoNonLived=any(d,['not personal evidence','not something i experienced','nothing here happened to me','not an episode from my life','not autobiographical','no lived experience']);
 if(hypoTest&&hypoNonLived)o.v234_hypothetical=true;
 const thirdTarget=any(d,["someone else's concealed belief","someone else's private belief",'concealed belief','private belief','internal belief','hidden belief','hidden conclusion','their mind']);
 const thirdAsk=any(d,['give me','tell me','infer','work out','state','describe']);
 const thirdNoSupport=any(d,['behaviour provides no support','behavior provides no support','no behavioural support','no behavioral support','no behavioural evidence from them','no behavioral evidence from them','no observable support','no words or actions support','nothing they said or did']);
 if(thirdTarget&&thirdAsk&&thirdNoSupport)o.v234_third=true;
 const frStart=any(d,['bounded first move','first action was easy to reverse','easy to reverse','reversible starter','contained first move','contained starter']);
 const frExpand=any(d,['kept adding possibilities','adding possibilities','broadened alternatives','broaden alternatives','widened alternatives','option growth','more alternatives']);
 const frNoStart=any(d,['made no start','no start','instead of beginning','never began','stayed still','remained still','did not begin']);
 if(frStart&&frExpand&&frNoStart)o.v234_freeze=true;
 const igCore=any(d,['main matter','central obligation','core issue','important matter','primary obligation']);
 const igPending=any(d,['remained unresolved','stayed unanswered','remained unanswered','still required','needed my response']);
 const igDivert=any(d,['shifted attention to secondary activity','shifted attention','secondary activity','diverted into less relevant tasks','less relevant tasks','side work','peripheral work']);
 if(igCore&&igPending&&igDivert)o.v234_ignore=true;
 const slBound=any(d,['one finite pause','finite pause','one contained delay','fixed limit','bounded interval','clear boundary']);
 const slOnce=any(d,['checked once','one check','reviewed once','one review','single review']);
 const slResponse=any(d,['before responding','responded','answered','replied','gave my response']);
 const slClose=any(d,['closed the matter','stopped reviewing','did not reopen','moved on','left the issue closed']);
 if(slBound&&slOnce&&slResponse&&slClose)o.v234_slow=true;
 const sqApproach=any(d,['moved toward the action','moved toward','approached','came close','nearly acted','advanced toward']);
 const sqRetreat=any(d,['withdrew','retreated','backed away','stepped back','pulled away','reversed course']);
 const sqRepeat=any(d,['returned to the same conclusion','same conclusion','same judgement','same judgment','same reasoning','prior reasoning','cycled back']);
 const sqNoNew=any(d,['without any new evidence','without new evidence','no new evidence','without any new facts','no new facts','nothing changed']);
 if(sqApproach&&sqRetreat&&sqRepeat&&sqNoNew)o.v234_sequence=true;
 return Object.freeze(o);
}
global.QCEvidenceExtractorV5AJ=Object.freeze({version:VERSION,scopeRaw,isolate,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
