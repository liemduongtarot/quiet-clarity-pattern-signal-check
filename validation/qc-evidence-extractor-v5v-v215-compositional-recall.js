(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5U2;if(!parent)throw new Error('V5V requires V5U2');
const VERSION='QCEvidenceExtractorV5V-V215-COMPOSITIONAL-RECALL';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function scopeRaw(raw){return parent.scopeRaw(raw);}
function extract(raw){
 const scoped=scopeRaw(raw),d=fold(scoped),o={...parent.extract(scoped)};
 const set=(k,v)=>{if(v)o[k]=true;};

 // Clarification: complete context + one missing self-owned observable action at closure.
 const clarOwn=any(d,['observable action that came from me','observable action was mine','action observable from me','hanh dong quan sat duoc do chinh toi dua ra','phan ung cu the cua toi','phan ung quan sat duoc cua toi']);
 const clarMissing=any(d,['only gap is','only missing piece','sole gap','still does not state','khoang trong duy nhat','van chua neu','chua neu']);
 const clarEnd=any(d,['before the story closed','before the story closes','before it closed','at the endpoint','truoc luc cau chuyen dong lai','tai diem cuoi','luc khep lai']);
 if(clarOwn&&clarMissing){o.self_owned_action=true;o.action_missing=true;} if(clarEnd)o.endpoint_present=true;

 // Decision delegation: selector + choice object + explicit transfer of final agency.
 const selector=any(d,['select my next course','select the course','choose the next step','choose my next step','determine the direction i must take','hay chon buoc tiep theo','xac dinh huong toi phai di','chon huong toi phai di']);
 const choice=any(d,['next course','next step','direction i must take','choice','buoc tiep theo','huong toi phai di','lua chon nay']);
 const transfer=any(d,['agency transferred','transfer the agency','handing over the decision','choice replace my final say','replace my final say','giao quyen quyet dinh','thay quyen chot cuoi cua toi','lua chon cua ban thay quyen chot','thay vi chi giup toi tu ket luan']);
 if(selector&&choice&&transfer){o.delegated_decision=true;o.agency_transfer_explicit=true;o.choice_object_present=true;}

 // Explicit synthetic/non-lived prose.
 const synthetic=any(d,['synthetic evaluation prose','invented for testing','made for testing','fabricated for testing','prose danh gia tong hop','bia de test','bia ra de test']);
 const nonlive=any(d,['not taken from my real experience','not from my lived experience','not taken from something i lived','khong lay tu chuyen toi da song qua','khong lay tu trai nghiem toi da song','khong phai chuyen toi da song']);
 if(synthetic){o.constructed_input=true;o.test_or_practice_context=true;} if(nonlive)o.non_lived_explicit=true;

 // Generic third-person hidden-state requests remain bounded by missing observable basis.
 const third=any(d,["another person's private mental state","another person s private mental state","someone else's unspoken belief","someone else s unspoken belief",'other person private mental state','nguoi khac','mot nguoi khac']);
 const hidden=any(d,['private mental state','unspoken belief','hidden view','internal conclusion','trang thai noi tam','niem tin chua noi','ket luan noi tam']);
 const nobasis=any(d,['no observable conduct or statement','nothing visible in their behaviour','nothing visible in their behavior','no visible behaviour','no visible behavior','khong co gi nhin thay trong hanh vi','khong co hanh vi hay phat bieu quan sat duoc']);
 if(third){o.third_party_subject=true;if(hidden)o.hidden_internal_state=true;if(nobasis)o.observable_evidence_absent=true;}

 // Prospective outcome: explicit horizon + requested eventual result.
 const horizon=any(d,['specified future horizon','next time boundary','future time boundary','looking ahead to the next time boundary','moc tuong lai da xac dinh','tai mot moc tuong lai da xac dinh','ranh gioi thoi gian tiep theo']);
 const outcome=any(d,['eventual result will resolve favourably','finish with the outcome i want','outcome i want','result resolve favourably','ket qua cuoi co giai quyet theo huong co loi','ket qua co loi cho toi','ket qua toi muon']);
 const prospective=d.includes('?')||any(d,['is this going to','will the eventual','toi muon biet','co giai quyet']);
 if(horizon)o.future_horizon_present=true;if(horizon&&outcome&&prospective)o.future_outcome_request=true;

 // Freeze: reversible low-cost trial + option expansion + non-start.
 const reversible=any(d,['small trial','easy exit','reversible first move','low-risk action','low risk action','phep thu nho','loi thoat de','buoc dau co the dao nguoc']);
 const options=any(d,['enlarging the set of alternatives','kept enlarging the set of alternatives','expanding the set of alternatives','mo rong tap lua chon','them tap lua chon']);
 const nonstart=any(d,['instead of initiating','instead of starting','did not initiate','chua bat dau','khong khoi dong']);
 if(reversible)o.reversible_action_available=true;if(options)o.option_expansion=true;if(nonstart)o.non_start=true;

 // Slow: bounded pause + exactly one review + explicit closure.
 const delay=any(d,['one bounded pause','bounded pause before i answered','finite pause before i answered','khoang dung huu han','mot khoang dung huu han']);
 const oneReview=any(d,['reviewed the point once','reviewed it once','one review','review diem do mot luot','kiem mot luot','review mot luot']);
 const closed=any(d,['treated the process as complete','process was complete','considered the process complete','xem qua trinh da hoan tat','xem qua trinh da ket thuc']);
 if(delay)o.bounded_delay=true;if(oneReview)o.single_review=true;if(closed)o.closure_present=true;

 // Sequence: approach + retreat + repeated same judgement/no-new-information.
 const approach=any(d,['came close to execution','close to execution','approached execution','advanced toward implementation','den sat execution','tien ve trien khai','den gan trien khai']);
 const retreat=any(d,['before retreating','retreating','withdrew from the step','backed away from the step','rut lui','lui khoi buoc do','lui khoi buoc']);
 const repeat=any(d,['revisited the same judgement','cycled through the same assessment','same judgement again','quay vong cung danh gia','xem lai cung phan doan','lap lai cung danh gia']);
 const same=any(d,['same judgement','same assessment','cung danh gia','cung phan doan']);
 const nonew=any(d,['no new information','receiving no new information','nothing changed in the evidence','evidence did not change','evidence khong thay doi','khong nhan them thong tin nao']);
 if(approach)o.approach_action=true;if(retreat)o.retreat_action=true;if(repeat)o.repeated_cycle=true;if(same)o.same_reasoning=true;if(nonew)o.no_new_information=true;

 // Explicit neutral completion must outrank inherited incidental family cues.
 const ownChoice=any(d,['made the choice independently','chose independently','decision remained mine','toi tu dua ra lua chon','toi tu chon']);
 const completed=any(d,['carried the practical move to completion','completed the practical move','followed the move through to completion','thuc hien nuoc di thuc te den hoan tat','hoan tat nuoc di']);
 const closure=any(d,['left the issue closed','left the matter closed','then moved on with it closed','de van de dong lai','de chuyen dong lai']);
 if(ownChoice)o.self_ownership_retained=true;if(completed)o.execution_completed=true;if(closure)o.closure_present=true;

 return Object.freeze(o);
}
global.QCEvidenceExtractorV5V=Object.freeze({version:VERSION,scopeRaw,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
