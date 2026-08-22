(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5AF;if(!parent)throw new Error('V5AG requires V5AF');
const VERSION='QCEvidenceExtractorV5AG-V230-CONCEPT-GENERALIZATION';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function scopeRaw(raw){return parent.scopeRaw(raw);}
function extract(raw){
 const scoped=scopeRaw(raw),o={...parent.extract(scoped)},d=fold(raw);
 const self=any(d,[' i ',' my ',' me ','toi ','cua toi','chinh toi']);
 const real=any(d,['real event','real situation','lived situation','lived episode','happened to me','this happened to me','event is not hypothetical','event itself is real','event that happened','chuyen nay xay ra','event that i lived']);
 const closing=any(d,['ending','endpoint','closing point','closure','concluded','conclude','completion','final response','last concrete','last observable','immediately before','ngay truoc','final point']);
 const missing=any(d,['not in the account','not been provided','not provided','not stated','remains absent','remains unspecified','except the','apart from','missing fact','have not stated','chua co','chua duoc','chua neu','con absent']);
 if(self&&closing&&missing&&(real||any(d,['circumstances are concrete','sequence is known','everything around','context is known','surrounding']))){o.v230_clarification=true;o.context_otherwise_complete=true;o.action_missing=true;o.self_owned_action=true;}
 const decide=any(d,['choose','decide','selection','select','pick','final call','final choice','judgement','judgment','route i should take','chon','quyet','final option']);
 const transfer=any(d,['for me','on my behalf','your call','your decision','your judgement','your judgment','substitutes for mine','rather than by me','instead of leaving decision ownership with me','take over','giao final call','thay toi','cua ban']);
 const finality=any(d,['final','become my decision','become my final option','actual decision','choice itself','route itself','outcome of the choice']);
 if(decide&&transfer&&finality){o.v230_decision=true;o.delegated_decision=true;o.agency_transfer_explicit=true;}
 const fictional=any(d,['made-up','made up','artificial test','constructed practice','constructed test','fictional','invented for validation','synthetic test','evaluation text','assessment material','practice case','test input','bịa','constructed']);
 const nonlived=any(d,['not autobiographical','unrelated to any event i lived','does not report something that happened to me','nothing here is a personal event','rather than evidence from my life','no real experience behind it','not a personal event','not from my life','khong co personal event','khong lien quan event']);
 if(fictional&&nonlived){o.v230_hypothetical=true;o.hypothetical_only=true;o.not_self_lived=true;}
 const other=any(d,['other person','someone else','their mind','their private','their internal','private thought','private belief','private conclusion','hidden view','concealed conclusion','secretly thinks','nguoi kia','nguoi khac']);
 const infer=any(d,['describe','tell me','infer','work out','state','give me','suy ra','xac dinh','noi ','mo ta']);
 const nobasis=any(d,['no observable','no outward evidence','no words or conduct','nothing they said or did','behaviour gives no basis','behavior gives no basis','without any observable','no action or statement','does not support','supporting it','justify the inference','khong observable','khong outward evidence','khong words hay conduct']);
 if(other&&infer&&nobasis){o.v230_third=true;o.third_party_only=true;}
 const future=any(d,['future point','future deadline','future milestone','future date','future checkpoint','future boundary','future cutoff','future marker','looking to the future','by the future','when the future','den future','tai future','khi future']);
 const will=any(d,[' will ','will i','will the','co ','outcome co','result co']);
 const outcome=any(d,['result','outcome','ended in my preferred way','resolve the way i want','in my favour','desired','preferred','hoping for','the way i want','cach toi muon','in my favour']);
 if(future&&outcome&&(will||d.includes('?'))){o.v230_prediction=true;o.future_prediction=true;}
 const reversible=any(d,['reverse','reversible','way back','clear exit','easy exit','low-cost trial','low cost trial','little commitment','low commitment','contained first move','bounded starter','small step','opening action','first action','first move','starter step','undo']);
 const expand=any(d,['broaden','broadening','widen','widening','option growth','choice set','more choices','more possibilities','generating possibilities','added more choices','comparison kept','comparison expanded','kept comparing','alternatives','possibilities','choice set','expand']);
 const noinit=any(d,['never began','did not start','instead of starting','stayed inactive','remained inactive','no move was made','no action was initiated','replaced initiation','prevented initiation','prevented me from taking it','khong start','khong move','inactive']);
 if(reversible&&expand&&noinit){o.v230_freeze=true;o.reversible_action_available=true;o.option_expansion=true;o.non_start=true;}
 const central=any(d,['issue that mattered','central responsibility','important matter','main issue','core obligation','consequential matter','important issue','main responsibility','central issue','core matter','primary obligation','issue consequential','important','central','core']);
 const needed=any(d,['required something from me','waiting for my response','still needed my response','response was still needed','required action from me','require action from me','remained unanswered','remained unresolved','needed on the main issue','required my response','needed my action']);
 const side=any(d,['side activity','side work','peripheral work','peripheral activity','secondary tasks','secondary activity','less relevant tasks','work that did not address','occupied with work','redirected attention','shifted attention','diverted','put my effort into','side task']);
 const unresolved=any(d,['could not answer it','could not resolve it','did not address it','instead of answering','remained unanswered','remained unresolved','avoid dealing with it','unanswered','unresolved']);
 if(central&&needed&&side&&(unresolved||any(d,['but i','yet i']))){o.v230_ignore=true;o.central_responsibility=true;o.response_omitted=true;o.attention_diverted=true;o.peripheral_activity=true;}
 const bounded=any(d,['time-limited pause','time limited pause','single boundary','contained interval','finite pause','bounded delay','defined limit','clearly bounded pause','one pause','one contained interval','single limit','defined boundary']);
 const onecheck=any(d,['one check','checked once','reviewed once','one review','single review','one review pass','a single time','check one','review one']);
 const response=any(d,['responded','answered','replied','gave my response','before my response','before answering','response']);
 const closure=any(d,['stopped reviewing','considered the issue closed','did not reopen','ended the review process','process as finished','left the matter closed','issue closed','treated the decision process as finished','closed']);
 if(bounded&&onecheck&&response&&closure){o.v230_slow=true;o.bounded_delay=true;o.single_review=true;o.closure_present=true;}
 const approach=any(d,['advanced toward','moved close to execution','moved close to acting','approached','nearly acted','nearly executed','nearly carried out','came close to execution','moved toward doing it','move toward execution','approach practical','advance toward']);
 const retreat=any(d,['withdrew','stepped back','stepped away','retreated','pulled away','pulled back','reversed course','backed out','reverse course','step back']);
 const repeat=any(d,['same judgement','same judgment','earlier reasoning','same conclusion','prior assessment','same reasoning','repeated','cycled back','revisited','returned','arrived back']);
 const unchanged=any(d,['no new facts','nothing had changed','no additional evidence','information stayed identical','absence of new information','no new information','no new evidence','unchanged evidence','facts stayed unchanged','nothing new']);
 if(approach&&retreat&&repeat&&unchanged){o.v230_sequence=true;o.approach_action=true;o.retreat_action=true;o.repeated_cycle=true;o.same_reasoning=true;o.no_new_information=true;}
 const owned=any(d,['made the final choice myself','decision ownership stayed with me','retained final agency','final call remained mine','chose for myself','kept ownership of the decision','kept the final decision with me','choice stayed mine','tu make final choice','decision ownership o toi']);
 const done=any(d,['carried it out','completed what i chose','executed the action','through completion','finished the action','completed it','completed the action','finish action','complete dieu da chon']);
 const settled=any(d,['left the matter closed','moved on','did not reopen','treated the situation as settled','did not return to the decision process','left the issue resolved','settled','resolved','closed afterward']);
 if(owned&&done&&settled){o.v230_neutral=true;o.self_owned_decision=true;o.completed_action=true;o.closure_present=true;}
 return Object.freeze(o);
}
global.QCEvidenceExtractorV5AG=Object.freeze({version:VERSION,scopeRaw,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
