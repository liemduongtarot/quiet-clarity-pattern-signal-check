(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5Z;if(!parent)throw new Error('V5AA requires V5Z');
const VERSION='QCEvidenceExtractorV5AA-V223-PRECEDENCE-GENERALIZATION';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function scopeRaw(raw){return parent.scopeRaw(raw);}
function extract(raw){
 const scoped=scopeRaw(raw),d=fold(scoped),o={...parent.extract(scoped)};
 const nonLived=any(d,['fabricated this case','synthetic test material','invented for evaluation','made-up practice case','nothing described here occurred to me','fictional validation input','dung case nay de validation','synthetic test material','scenario nay duoc bia','practice case bia','khong dieu gi o day that su xay ra voi toi','fictional validation input']);
 if(nonLived){o.v223_hypothetical=true;o.non_lived_explicit=true;o.constructed_input=true;}
 const delegated=any(d,['make the choice itself for me','transferring the final selection to you','choose on my behalf','decide which one i should take','take responsibility for the final choice','your decision for me','quyet dinh thay toi','giao final selection cho ban','chon thay toi','quyet dinh toi nen chon','nhan trach nhiem final choice','decision cua ban thay toi']);
 if(delegated){o.v223_decision=true;o.delegated_decision=true;o.agency_transfer_explicit=true;}
 const future=any(d,['future checkpoint','future date','future cutoff','future milestone','future boundary','future marker','checkpoint tuong lai','future date','future cutoff','future milestone','future boundary','future marker']);
 const desired=any(d,['outcome i want','preferred way','result i am hoping','desired result','outcome go in my favour','result i want','outcome minh muon','huong toi muon','result toi dang mong','desired result cua toi','co loi cho toi','result minh muon']);
 if(future&&desired&&(d.includes('?')||any(d,['will i','will this','will the','co nhan duoc','co resolve','co xay ra','co ket thuc','co di theo','co lay duoc']))){o.v223_prediction=true;o.future_horizon_present=true;o.future_outcome_request=true;}
 const other=any(d,['other person','someone else','they secretly','their private','nguoi kia','nguoi khac','ho']);
 const hidden=any(d,['private belief','hidden conclusion','secretly think','unspoken view','private internal belief','in the other person’s mind','belief rieng','hidden conclusion','nghi kin','unspoken view','private internal belief','trong dau nguoi kia']);
 const noObs=any(d,['no observable','nothing outward','without evidence','no basis','no outward evidence','khong co loi noi hay hanh vi quan sat','khong co outward evidence','khong co evidence','khong cho basis','khong co observable behaviour']);
 if(other&&hidden&&noObs){o.v223_third=true;o.third_party_only=true;}
 const lived=any(d,['episode happened','real context','lived event','situation is real','chuyen nay da xay ra that','context that','lived event','situation la that']);
 const missingOwn=any(d,['have not said what i personally did','missing piece is my own observable action','concrete response that came from me','my own last behaviour is unstated','action i myself took','personal endpoint response','chua noi hanh dong cuoi cung','observable action cua chinh toi','response cu the tu chinh toi','last behaviour cua toi chua duoc neu','action toi tu lam','endpoint response cua chinh toi']);
 if(lived&&missingOwn){o.v223_clarification=true;o.action_missing=true;o.self_owned_action=true;o.context_otherwise_complete=true;}
 const own=any(d,['decision as mine','chose for myself','final agency remained with me','made my own call','choice stayed mine','retained the final decision','quyet dinh la cua minh','tu chon','final agency van o toi','tu dua ra call','choice van thuoc toi','giu final decision']);
 const complete=any(d,['completed the action','carried out the concrete step','finished the action','executed it','through completion','completed what i chose','hoan thanh action','thuc hien concrete step','lam xong action','execute no','den luc completion','hoan thanh dieu da chon']);
 const closed=any(d,['left the matter closed','did not reopen','moved on','settled','did not revisit','left it closed','de matter dong','khong mo lai','tiep tuc','settled','khong revisit','de no dong']);
 if(own&&complete&&closed){o.v223_neutral=true;o.self_ownership_retained=true;o.execution_completed=true;o.closure_present=true;}
 const reversible=any(d,['reversible first move','test a small step and undo','easy-to-reverse opening action','contained starter move','reversible low-commitment action','first step had a clear exit','first move it rui ro va dao nguoc','buoc nho roi undo','opening action de dao nguoc','starter move co gioi han','action it cam ket va reversible','first step co exit ro']);
 const options=any(d,['adding alternatives','expanded the option list','comparing possibilities','generated more choices','option expansion','widening alternatives','them alternative','mo rong option list','so possibility','tao them choice','option expansion','noi alternative']);
 const noStart=any(d,['never initiated','instead of starting','did nothing','rather than taking it','kept me from beginning','left it untouched','khong bat dau','thay vi start','khong lam','thay vi thuc hien','chua bat dau','de no untouched']);
 if(reversible&&options&&noStart){o.v223_freeze=true;o.reversible_action_available=true;o.option_expansion=true;o.non_start=true;}
 const central=any(d,['central issue','main obligation','consequential matter','primary responsibility','core matter','something important','core issue','nghia vu chinh','consequential matter','primary responsibility','core matter','chuyen quan trong']);
 const needed=any(d,['required my answer','needed action from me','response was still required','unresolved','waiting for me','needed my action','can cau tra loi cua toi','can action cua toi','response cua toi van can','chua giai quyet','dang cho toi','can action cua toi']);
 const diversion=any(d,['side work','peripheral tasks','secondary activity','work that did not address','less relevant tasks','side activity','side work','peripheral task','secondary activity','viec khong xu ly','task it lien quan','side activity']);
 if(central&&needed&&diversion){o.v223_ignore=true;o.central_responsibility=true;o.response_omitted=true;o.attention_diverted=true;o.peripheral_activity=true;}
 const approach=any(d,['moved toward acting','approached the step','nearly executed','advanced toward the move','got close to acting','approached execution','tien ve phia hanh dong','tiep can buoc di','gan execute action','tien toi move','toi gan hanh dong','tiep can execution']);
 const retreat=any(d,['pulled back','withdrew','retreated','reversed course','stepped away','backed out','pull back','withdraw','retreat','doi huong','buoc ra','back out']);
 const same=any(d,['same judgement','identical reasoning','same conclusion','old assessment','same judgement','same conclusion','cung judgement','reasoning cu','cung conclusion','assessment cu']);
 const noNew=any(d,['no new facts','without new information','unchanged evidence','nothing new appeared','facts stayed the same','without new evidence','khong co fact moi','khong co information moi','evidence khong doi','khong co gi moi','facts giu nguyen','khong co evidence moi']);
 if(approach&&retreat&&same&&noNew){o.v223_sequence=true;o.approach_action=true;o.retreat_action=true;o.repeated_cycle=true;o.same_reasoning=true;o.no_new_information=true;}
 const bounded=any(d,['bounded pause','fixed limit','finite interval','clear boundary','contained delay','limited pause','pause co bien','fixed limit','interval huu han','boundary ro','delay co gioi han','pause gioi han']);
 const once=any(d,['checked once','single review pass','checked one time','reviewed the point once','one check','reviewed once','check dung mot lan','review mot pass','kiem mot lan','review mot lan','mot lan check','review mot lan']);
 const response=any(d,['answered','responded','gave my response','tra loi','response','dua response']);
 if(bounded&&once&&response){o.v223_slow=true;o.bounded_delay=true;o.single_review=true;o.closure_present=true;}
 return Object.freeze(o);
}
global.QCEvidenceExtractorV5AA=Object.freeze({version:VERSION,scopeRaw,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
