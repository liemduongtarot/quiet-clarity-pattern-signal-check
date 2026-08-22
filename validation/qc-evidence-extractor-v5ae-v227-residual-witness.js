(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5AD;if(!parent)throw new Error('V5AE requires V5AD');
const VERSION='QCEvidenceExtractorV5AE-V227-RESIDUAL-WITNESS';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function scopeRaw(raw){return parent.scopeRaw(raw);}
function extract(raw){
 const scoped=scopeRaw(raw),o={...parent.extract(scoped)},d=fold(raw);
 const clarContext=any(d,['all material context is available','surrounding sequence is known','event is real and sufficiently described','lived situation is concrete','setting is otherwise complete','real episode is otherwise accounted for']);
 const clarMissing=any(d,['behaviour that came from me at the final point','last observable response has not been supplied','personal closing action is absent','what i myself actually did','own concrete response immediately before completion','only missing evidence is the action i personally took']);
 if(clarContext&&clarMissing){o.v227_clarification=true;o.context_otherwise_complete=true;o.action_missing=true;o.self_owned_action=true;}
 const decTransfer=any(d,['take over the decision','make the selection itself for me','choose the final option in my place','make the final selection on my behalf','use your decision as the final answer','your judgement to determine which route i take']);
 const decFinal=any(d,['option that becomes final for me','handing you the final call','decision substitutes for mine','rather than keeping the choice myself','instead of leaving me to choose','on my behalf']);
 if(decTransfer&&decFinal){o.v227_decision=true;o.delegated_decision=true;o.agency_transfer_explicit=true;}
 const thirdTarget=any(d,['other person','someone else','their hidden','their private','concealed thought','secretly concluded','secretly in their mind']);
 const thirdNoBasis=any(d,['without any observable basis','no observable statement or action','outward behaviour gives no evidence','no conduct or words','nothing they did or said','no behavioural evidence']);
 const thirdAsk=any(d,['infer','tell me','state','work out','private conclusion','concealed thought']);
 if(thirdTarget&&thirdNoBasis&&thirdAsk){o.v227_third=true;o.third_party_only=true;}
 const rev=any(d,['easy-to-reverse starter action','tested a small step and undone it','reversible low-commitment opening','contained first move with a clear exit','initial move was low risk and reversible','bounded reversible first action']);
 const expand=any(d,['comparison kept expanding','widening the option set','expanded alternatives','added possibilities','generated more choices','option expansion']);
 const nostart=any(d,['did not initiate','instead of starting','never began','remained inactive','left it untouched','prevented any start']);
 if(rev&&expand&&nostart){o.v227_freeze=true;o.reversible_action_available=true;o.option_expansion=true;o.non_start=true;}
 const central=any(d,['central matter','consequential issue','main responsibility','core obligation','important issue','primary responsibility']);
 const required=any(d,['response was still needed','required action from me','still needed my response','needed my response','required my action','waiting for me']);
 const divert=any(d,['diverted into less relevant work','busied myself with side tasks','redirected attention into peripheral work','shifted effort into secondary activity','occupied myself elsewhere','side activity']);
 if(central&&required&&divert){o.v227_ignore=true;o.central_responsibility=true;o.response_omitted=true;o.attention_diverted=true;o.peripheral_activity=true;}
 const bounded=any(d,['one contained interval','one finite delay','bounded pause','clear limit','defined boundary','limited pause']);
 const single=any(d,['one review','one check','reviewed once','single review pass','checked once','reviewed one time']);
 const response=any(d,['before i responded','before answering','answered','gave my response','replied','response']);
 const closed=any(d,['process as complete','stopped reviewing','closed the issue','did not reopen','ended the review cycle','left it closed']);
 if(bounded&&single&&response&&closed){o.v227_slow=true;o.bounded_delay=true;o.single_review=true;o.closure_present=true;}
 const approach=any(d,['moved toward execution','approached the action','got close to acting','advanced toward the move','nearly executed the step','approached doing it']);
 const retreat=any(d,['pulled back','withdrew','stepped away','reversed course','retreated','backed out']);
 const repeat=any(d,['repeated the same judgement','returned to my prior conclusion','cycled back to identical reasoning','revisited the old assessment','came back to the same conclusion','repeated the same judgement']);
 const noNew=any(d,['without new evidence','no new facts','without new information','nothing new appeared','unchanged evidence','facts stayed the same']);
 if(approach&&retreat&&repeat&&noNew){o.v227_sequence=true;o.approach_action=true;o.retreat_action=true;o.repeated_cycle=true;o.same_reasoning=true;o.no_new_information=true;}
 const selfAgency=any(d,['kept the final choice with me','decided for myself','final agency remained mine','made my own final call','ownership of the choice stayed with me','retained the decision']);
 const completed=any(d,['completed the action','carried out what i chose','finished the step','completed it','until completion','executed it']);
 const neutralClosed=any(d,['left the matter closed','did not revisit it afterward','moved on','treated the issue as settled','did not reopen','left the issue closed']);
 if(selfAgency&&completed&&neutralClosed){o.v227_neutral=true;o.self_owned_decision=true;o.completed_action=true;o.closure_present=true;}
 return Object.freeze(o);
}
global.QCEvidenceExtractorV5AE=Object.freeze({version:VERSION,scopeRaw,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
