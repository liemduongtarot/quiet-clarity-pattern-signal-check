(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5AG;if(!parent)throw new Error('V5AH requires V5AG');
const VERSION='QCEvidenceExtractorV5AH-V231-ISOLATED-CONCEPTS';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
const contextOnly=s=>any(fold(s),['inventory note','inventory detail','storage detail','storage note','equipment record','equipment reference','filing reference','filing record','physical detail','physical marker','administrative note','administrative record','logged ','indexed ','tracked ','recorded ','catalogued ','catalog ','the storage','the filing','that inventory','that equipment','that physical','the administrative']);
function isolate(raw){const parts=String(raw||'').split(/(?<=[.!?])\s+/).filter(Boolean);const kept=parts.filter(s=>!contextOnly(s));return kept.join(' ').trim()||String(raw||'');}
function scopeRaw(raw){return parent.scopeRaw(raw);}
function extract(raw){
 const base={...parent.extract(raw)},clean=isolate(raw),p=parent.extract(clean),d=fold(clean),o={...base};
 // Promote only concept witnesses that survive context isolation.
 for(const k of ['clarification','decision','hypothetical','third','prediction','freeze','ignore','slow','sequence','neutral'])if(p['v230_'+k])o['v231_'+k]=true;
 // Residual concept completions from frozen V230 evidence; each remains conjunctive.
 const self=any(d,[' i ',' my ',' me ','toi ','cua toi','chinh toi']);
 const real=any(d,['real event','lived event','real situation','this actually happened','lived situation','real episode']);
 const closing=any(d,['ending','closure','closing','final moment','just before it ended','endpoint','last observable']);
 const missing=any(d,['have not said','has not been stated','still missing','not the action','apart from','except for','not the behaviour','not the behavior']);
 if(self&&real&&closing&&missing)o.v231_clarification=true;
 const decide=any(d,['choose','select','decision','choice','final selection','final call','pick']);
 const transfer=any(d,['for me','on my behalf','your call','your judgement','your judgment','rather than help me make it','replaces mine','instead of leaving','handing over decision ownership','take the choice out of my hands']);
 if(decide&&transfer)o.v231_decision=true;
 const fictional=any(d,['fictional','artificial','invented','constructed','testing','test example','validation material','not autobiographical']);
 const nonlived=any(d,['not autobiographical','not something i actually lived','not describe anything that happened','no real event behind','unrelated to any event i experienced','nothing in this scenario','not a personal experience']);
 if(fictional&&nonlived)o.v231_hypothetical=true;
 const other=any(d,['other person','someone else','their mind','their words','their actions','private view','hidden conclusion','secretly thinks','concealed belief']);
 const infer=any(d,['tell me','infer','work out','state','give me','describe']);
 const noEvidence=any(d,['no observable','no outward','none of their words or actions','nothing they said or did','without any behavioural evidence','without any behavioral evidence','supporting the claim','establishes it']);
 if(other&&infer&&noEvidence)o.v231_third=true;
 const reversible=any(d,['reversible','easy way back','clear exit','low-commitment','low commitment','contained step','bounded first action','tested and undone','low risk']);
 const expand=any(d,['adding options','widened the choice set','comparison kept expanding','more possibilities','option growth','generated alternatives']);
 const noStart=any(d,['never started','stayed inactive','no start happened','replaced initiation','did nothing','kept me from beginning']);
 if(reversible&&expand&&noStart)o.v231_freeze=true;
 const core=any(d,['main issue','central responsibility','important matter','core issue','primary obligation','consequential']);
 const needed=any(d,['needed my response','waiting for action from me','stayed unanswered','still required','remained unresolved','needed action from me']);
 const side=any(d,['side work','peripheral tasks','secondary work','less relevant activity','tasks that did not address','side activity']);
 if(core&&needed&&side)o.v231_ignore=true;
 const bounded=any(d,['bounded pause','finite delay','clear limit','contained interval','defined delay','fixed boundary']);
 const once=any(d,['checked once','reviewed once','single time','one check','one review','one review pass']);
 const response=any(d,['responded','answered','replied','gave my response']);
 const closed=any(d,['stopped reviewing','closed the matter','did not reopen','process as finished','left it closed','ended the review cycle']);
 if(bounded&&once&&response&&closed)o.v231_slow=true;
 const approach=any(d,['moved toward','got close','approached','nearly acted','advanced toward','came close']);
 const retreat=any(d,['pulled back','stepped away','retreated','reversed course','backed out','withdrew']);
 const repeat=any(d,['same judgement','same judgment','earlier reasoning','same conclusion','prior assessment','same reasoning','repeated']);
 const unchanged=any(d,['without new evidence','nothing changed','no new facts','evidence stayed unchanged','no additional information','no new information']);
 if(approach&&retreat&&repeat&&unchanged)o.v231_sequence=true;
 const owned=any(d,['made the final decision myself','choice stayed mine','kept final agency','made my own call','decision ownership remained with me','chose for myself']);
 const done=any(d,['completed the action','carried it out','executed what i chose','through completion','finished the action','completed what i decided']);
 const settled=any(d,['left the matter closed','moved on','did not reopen','treated the situation as settled','did not return','left the issue resolved']);
 if(owned&&done&&settled)o.v231_neutral=true;
 return Object.freeze(o);
}
global.QCEvidenceExtractorV5AH=Object.freeze({version:VERSION,scopeRaw,isolate,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
