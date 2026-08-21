(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5AC;if(!parent)throw new Error('V5AD requires V5AC');
const VERSION='QCEvidenceExtractorV5AD-V226-FULL-INPUT-WITNESS';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function scopeRaw(raw){return parent.scopeRaw(raw);}
function extract(raw){
 const scoped=scopeRaw(raw),o={...parent.extract(scoped)},d=fold(raw);
 // Full-input witnesses are deliberately compositional and require multiple independent cues.
 const clarComplete=any(d,['all relevant context is present','surrounding sequence is clear','otherwise complete','context is present']);
 const clarGap=any(d,['except my own concrete endpoint behaviour','concrete thing i personally did','own observable closing response','final behaviour that came from me']);
 if(clarComplete&&clarGap){o.v226_clarification=true;o.context_otherwise_complete=true;o.action_missing=true;o.self_owned_action=true;}
 const decJudgement=any(d,['use your judgement','your judgement','your decision','your choice']);
 const decFinal=any(d,['final selection','final choice','final call','choice replaces','instead of leaving the choice with me','leaving the choice with me']);
 if(decJudgement&&decFinal){o.v226_decision=true;o.delegated_decision=true;o.agency_transfer_explicit=true;}
 const thirdTarget=any(d,['other person','someone else','their private','their concealed','secretly thinks','secretly in their mind','private conclusion']);
 const thirdNoObs=any(d,['no observable action or statement','no outward behaviour','no behavioural evidence','nothing they did or said','no observable basis']);
 const thirdInference=any(d,['establishes it','supports the inference','provides evidence','demonstrates it','infer','work out','tell me']);
 if(thirdTarget&&thirdNoObs&&thirdInference){o.v226_third=true;o.third_party_only=true;}
 const rev=any(d,['reversible opening move','reversible first step','reversible starter action','bounded reversible first step','easy exit','low-risk and reversible']);
 const expand=any(d,['enlarging the alternatives','generating alternatives','expanded the option set','widening choices','adding more possibilities','option expansion']);
 const nostart=any(d,['never initiated','stayed inactive','remained inactive','did not start','kept me from initiating','instead of beginning']);
 if(rev&&expand&&nostart){o.v226_freeze=true;o.reversible_action_available=true;o.option_expansion=true;o.non_start=true;}
 const central=any(d,['central responsibility','main issue','something consequential','primary obligation','core matter','important issue']);
 const required=any(d,['needed my action','waiting for my response','required action from me','still required action','needed my response','action was still required']);
 const diverted=any(d,['redirected effort into side work','peripheral tasks','diverted attention to secondary activity','busied myself elsewhere','shifted into less relevant tasks','side activity']);
 if(central&&required&&diverted){o.v226_ignore=true;o.central_responsibility=true;o.response_omitted=true;o.attention_diverted=true;o.peripheral_activity=true;}
 const bounded=any(d,['finite pause','defined limit','clear boundary','bounded delay','limited interval','contained pause']);
 const single=any(d,['single review pass','reviewed one time','reviewed once','one check','checked once','one review']);
 const responded=any(d,['gave my response','answered','responded']);
 const closed=any(d,['did not reopen','left it closed','closed the matter','stopped reviewing','ended the review cycle','process as complete']);
 if(bounded&&single&&responded&&closed){o.v226_slow=true;o.bounded_delay=true;o.single_review=true;o.closure_present=true;}
 const approach=any(d,['approached doing it','moved toward execution','approached the action','got close to acting','advanced toward the practical move','nearly executed']);
 const retreat=any(d,['backed out','pulled back','withdrew','stepped away','reversed course','retreated']);
 const repeat=any(d,['repeated the same judgement','returned to the same judgement','repeated my prior conclusion','cycled back to the identical reasoning','returned to the old assessment','came back to the same conclusion']);
 const noNew=any(d,['facts stayed the same','without new evidence','no new facts','without new information','nothing new appeared','unchanged evidence']);
 if(approach&&retreat&&repeat&&noNew){o.v226_sequence=true;o.approach_action=true;o.retreat_action=true;o.repeated_cycle=true;o.same_reasoning=true;o.no_new_information=true;}
 return Object.freeze(o);
}
global.QCEvidenceExtractorV5AD=Object.freeze({version:VERSION,scopeRaw,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
