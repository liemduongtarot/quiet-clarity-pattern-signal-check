(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5AE;if(!parent)throw new Error('V5AF requires V5AE');
const VERSION='QCEvidenceExtractorV5AF-V228-WITNESS-COMPLETION';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function scopeRaw(raw){return parent.scopeRaw(raw);}
function extract(raw){
 const scoped=scopeRaw(raw),o={...parent.extract(scoped)},d=fold(raw);
 const clarContext=any(d,['all relevant circumstances are known','chronology is known','everything material about the situation is present','episode happened to me and is otherwise described','surrounding facts are sufficiently clear','event itself is real']);
 const clarGap=any(d,['action i personally took immediately before closure','personal closing behaviour remains unspecified','final observable response is absent','own observable action at the end','concrete response that came from me','what i myself actually did at the endpoint']);
 if(clarContext&&clarGap){o.v228_clarification=true;o.context_otherwise_complete=true;o.action_missing=true;o.self_owned_action=true;}
 const decTransfer=any(d,['giving you the final choice','take ownership of the final selection','use your judgement to make the actual decision','choose the final course on my behalf','choice to stand as the final answer','decide the final option for me']);
 const decSubstitute=any(d,['select the route itself','rather than advising me how to choose','in my place','do not leave the decision with me','instead of my own','replaces the call i would otherwise make']);
 if(decTransfer&&decSubstitute){o.v228_decision=true;o.delegated_decision=true;o.agency_transfer_explicit=true;}
 const hypoNonLived=any(d,['nothing in this example happened to me','does not describe anything i experienced','no lived event behind it','not a report from my life','invented practice case','deliberately fictional']);
 const hypoPurpose=any(d,['solely for evaluation','validation material','synthetic test input','for testing','practice case','fictional']);
 if(hypoNonLived&&hypoPurpose){o.v228_hypothetical=true;o.hypothetical_only=true;o.not_self_lived=true;}
 const thirdTarget=any(d,['their mind','other person','someone else','private conclusion','concealed internal view','hidden belief']);
 const thirdNoBasis=any(d,['no action or statement from them supports','no observable basis','no behavioural evidence','nothing they said or did gives observable support','conduct provides no evidence','outward statement or behaviour']);
 const thirdAsk=any(d,['tell me','infer','work out','state','private thought','claim']);
 if(thirdTarget&&thirdNoBasis&&thirdAsk){o.v228_third=true;o.third_party_only=true;}
 const predFuture=any(d,['future boundary i named','future date i named','future checkpoint','future milestone','future cutoff','future marker']);
 const predOutcome=any(d,['will events end the way i want','will the outcome i want have happened','will this resolve in my favour','will i get the result','will the preferred outcome','will the desired result']);
 if(predFuture&&predOutcome){o.v228_prediction=true;o.future_prediction=true;}
 const rev=any(d,['easy-to-reverse starter action','low-commitment test step','contained move could have been tested safely','small first move was reversible','bounded action with a clear exit','opening step was reversible']);
 const expand=any(d,['option expansion','comparison expanded','kept comparing possibilities','adding alternatives','widened the option set','generated more choices']);
 const nostart=any(d,['prevented me from taking it','stayed inactive','remained still','did not begin','instead of starting','no action was initiated']);
 if(rev&&expand&&nostart){o.v228_freeze=true;o.reversible_action_available=true;o.option_expansion=true;o.non_start=true;}
 const central=any(d,['central issue','consequential issue','main responsibility','core matter','primary obligation','important issue']);
 const required=any(d,['still required my response','required my response','needed a response from me','waiting for action from me','action was still needed','remained unanswered','remained unresolved']);
 const divert=any(d,['shifted attention into side work','occupied myself with peripheral tasks','diverted effort into secondary activity','busied myself with less relevant work','redirected into side tasks','moved into peripheral activity']);
 const omission=any(d,['instead of answering it','instead of answering','could not resolve it','did not address it','remained unanswered','remained unresolved']);
 if(central&&required&&divert&&omission){o.v228_ignore=true;o.central_responsibility=true;o.response_omitted=true;o.attention_diverted=true;o.peripheral_activity=true;}
 const bounded=any(d,['one finite delay','one clearly bounded pause','fixed limit','one contained interval','one limited pause','one defined boundary']);
 const single=any(d,['single check','one check','checked once','reviewed once','single review','one review pass']);
 const responded=any(d,['before i responded','answered','replied','gave my response','before answering']);
 const closed=any(d,['stopped reviewing','closed the issue','did not reopen','process as complete','ended the review cycle','left it closed']);
 if(bounded&&single&&responded&&closed){o.v228_slow=true;o.bounded_delay=true;o.single_review=true;o.closure_present=true;}
 const approach=any(d,['approached execution','moved close to acting','advanced toward the action','nearly carried out the move','got close to execution','approached doing it']);
 const retreat=any(d,['withdrew','pulled back','stepped away','reversed course','retreated','backed out']);
 const repeat=any(d,['repeated my prior conclusion','returned to the same judgement','cycled back to identical reasoning','revisited the old assessment','came back to the same conclusion','repeated the same judgement']);
 const noNew=any(d,['facts stayed unchanged','without any new evidence','no new information','nothing new appeared','unchanged evidence','no new facts emerged']);
 if(approach&&retreat&&repeat&&noNew){o.v228_sequence=true;o.approach_action=true;o.retreat_action=true;o.repeated_cycle=true;o.same_reasoning=true;o.no_new_information=true;}
 const selfAgency=any(d,['made my own final call','kept the final decision with me','chose for myself','final agency remained mine','choice stayed mine','retained the decision']);
 const completed=any(d,['completed what i chose','completed the action','carried out the step','finished the action','until completion','executed it']);
 const neutralClosed=any(d,['treated the issue as closed','left the matter settled','did not revisit it once complete','moved on','did not reopen the matter','left the issue settled']);
 if(selfAgency&&completed&&neutralClosed){o.v228_neutral=true;o.self_owned_decision=true;o.completed_action=true;o.closure_present=true;}
 return Object.freeze(o);
}
global.QCEvidenceExtractorV5AF=Object.freeze({version:VERSION,scopeRaw,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
