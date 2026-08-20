(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5R;if(!parent)throw new Error('V5S requires V5R');
const VERSION='QCEvidenceExtractorV5S-V212-RELATIONAL-RECALL';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function scopeRaw(raw){
 const clauses=String(raw||'').split(/(?<=[.!?;])\s+/).filter(Boolean),keep=[];
 for(const c of clauses){const d=fold(c);
   const neutralEvidence=any(d,['no behavioural evidence','no behavioral evidence','no behavioural cue','no behavioral cue','no evidence about the response mechanism','not as behavioural evidence','not as behavioral evidence','khong cung cap bang chung hanh vi','khong them evidence ve co che phan ung','khong bo sung cue hanh vi','khong phai evidence hanh vi']);
   const unrelated=any(d,['unrelated background','unrelated admin','separate record'])&&any(d,['remained unchanged','stayed unchanged','no signal','khong lien quan','van khong doi','khong them signal']);
   if(neutralEvidence||unrelated)continue;keep.push(c);
 }
 return parent.scopeRaw(keep.join(' ').trim()||String(raw||''));
}
function extract(raw){
 const scoped=scopeRaw(raw),d=fold(scoped),o={...parent.extract(scoped)};const set=(k,v)=>{if(v)o[k]=true;};
 // Clarification: own observable response/action + endpoint + omission.
 const own=any(d,['my own','from me','i contributed','i did','attributable to me','chinh toi','tu phia toi','do toi','toi da lam']);
 const action=any(d,['action','response','behaviour','behavior','move','contribution','step','hanh dong','phan ung','hanh vi','nuoc di','dong gop','buoc']);
 const endpoint=any(d,['at closure','at its endpoint','when it ended','closing','final','luc khep lai','diem ket','khi ket thuc','chot']);
 const missing=any(d,['not recorded','unstated','unspecified','not identified','omitted','absent','missing','chua duoc ghi','chua duoc neu','chua xac dinh','bi bo thieu','van thieu']);
 set('self_owned_action',own&&action);set('endpoint_present',endpoint);set('context_otherwise_complete',any(d,['everything','all external','outside chronology','account reaches','moi du kien','toan bo facts','dien bien','record da']));set('action_missing',own&&action&&missing);
 // Delegated decision: other chooses/makes judgement for self + replacement of self agency.
 const selector=any(d,['you to choose','you to select','select the option','make the call','use your judgement','use your judgment','ban chon','hay chon','dua ra quyet dinh','dung phan doan cua ban']);
 const choice=any(d,['course i should take','path i should follow','option on my behalf','in my place','as my decision','huong toi nen di','phuong an thay toi','o vi tri cua toi','lam quyet dinh cho toi','duong toi can theo']);
 const transfer=any(d,['rather than merely support my decision','replaces the one i would make','in my place','instead of giving me a framework','thay vi chi ho tro toi tu quyet','the cho lua chon cua toi','o vi tri cua toi','thay vi dua khung de toi tu chon']);
 if(selector&&choice&&transfer){o.delegated_decision=true;o.agency_transfer_explicit=true;o.choice_object_present=true;}
 // Hypothetical / constructed non-lived input.
 const construct=any(d,['created this passage','constructed example','wrote the scenario','synthetic validation input','fabricated','invented','tao doan nay','vi du duoc dung','viet scenario','input validation tong hop','bia','hu cau']);
 const test=any(d,['evaluation','test material','exercise the classifier','validation','system testing','danh gia he thong','du lieu test','thu classifier','validation','system test']);
 const nonlive=any(d,['does not describe a real experience','rather than something that happened to me','not to report my lived history','not be read as autobiographical','not autobiographical','khong mo ta trai nghiem that','khong phai chuyen da xay ra voi toi','khong phai ke lich su song','khong nen hieu la tu truyen']);
 set('constructed_input',construct);set('test_or_practice_context',construct&&test);set('non_lived_explicit',nonlive);
 // Third-party hidden state with no observable basis.
 const third=any(d,['my colleague','the client','the other person','my supervisor','customer','dong nghiep','khach hang','nguoi kia','quan ly']);
 const hidden=any(d,['private conclusion','secretly intends','hidden judgement','hidden judgment','unspoken belief','private belief','ket luan rieng','bi mat dinh','danh gia an','niem tin chua noi','trang thai noi tam']);
 const nobasis=any(d,['nothing observable','no basis','absence of outward evidence','no observable sign','no outward evidence','nothing they said or did','khong co bang chung quan sat','khong tao can cu','thieu evidence ben ngoai','khong co dau hieu quan sat']);
 set('third_party_subject',third);set('hidden_internal_state',third&&hidden);set('observable_evidence_absent',third&&nobasis);
 // Prediction: explicit future horizon + outcome/result + prospective question.
 const horizon=any(d,['looking ahead','several weeks','next stated horizon','upcoming deadline','near future','nhin ve','vai tuan toi','moc sap toi','deadline ke tiep','tuong lai gan']);
 const outcome=any(d,['eventual outcome','final result','resolve in my favour','outcome i am hoping for','ket qua cuoi','outcome cuoi','giai quyet theo huong co loi','outcome toi dang mong']);
 const prospective=d.includes('?')||any(d,['will ','is the final','does the situation','co tro nen','co di dung','co giai quyet','co ket thuc']);
 set('future_horizon_present',horizon);set('future_outcome_request',horizon&&outcome&&prospective);
 // Freeze: reversible/low commitment + option expansion/comparison + non-start.
 const reversible=any(d,['low-commitment','low commitment','easy to reverse','retreat cheaply','would not lock me in','reversible experiment','it cam ket','de quay lai','rut voi chi phi thap','khong khoa toi','co the dao nguoc']);
 const options=any(d,['expanded alternatives','comparing possibilities','widened the option','researching choices','option set','mo rong phuong an','so them kha nang','mo rong lua chon','nghien cuu them option']);
 const nonstart=any(d,['rather than initiate','never began','instead of taking the first step','left it unstarted','thay vi bat dau','chua lam','thay vi thuc hien buoc dau','chua khoi dong']);
 set('reversible_action_available',reversible);set('option_expansion',options);set('non_start',nonstart);
 // Ignore: important central responsibility + diverted attention + unresolved/non-response.
 const central=any(d,['consequential item','central responsibility','main matter','core request','main issue','muc co he qua','trach nhiem trung tam','chuyen chinh','yeu cau cot loi','van de chinh']);
 const pending=any(d,['needed my reply','remained unanswered','waiting for my action','left the core request open','still waiting','can phan hoi cua toi','chua duoc tra loi','dang cho hanh dong','con mo','dang cho toi']);
 const diversion=any(d,['shifted effort','focused on peripheral','redirected attention','occupied myself','side work','minor side','chuyen suc','tap trung vao viec ben le','don chu y','lam minh ban','viec phu']);
 const peripheral=any(d,['minor','side work','peripheral','lower-impact','secondary','viec phu','ben le','it tac dong','thu yeu']);
 set('central_responsibility',central);set('response_omitted',central&&pending);set('attention_diverted',central&&diversion);set('peripheral_activity',peripheral);
 // Slow: bounded delay + exactly one check/review + closure/non-return.
 const delay=any(d,['later than normal','reply was delayed','longer than usual','response came slowly','after a pause','muon hon binh thuong','phan hoi bi cham','lau hon thuong le','cau tra loi den cham','sau mot khoang dung']);
 const once=any(d,['checked one point','single verification','reviewed it once','one check','one review','kiem mot diem','mot lan xac minh','review mot luot','mot lan kiem']);
 const closure=any(d,['left the matter closed','did not revisit','moved on','stopped reopening','ended the process','de van de dong lai','khong quay lai','di tiep','ngung mo lai','ket thuc']);
 set('bounded_delay',delay);set('single_review',once);set('closure_present',closure||o.closure_present);
 // Sequence: approach + retreat + return/repetition + unchanged/no-new evidence.
 const approach=any(d,['moved toward action','approached execution','nearly acted','advanced toward implementation','got close','tien ve hanh dong','toi gan thuc hien','gan nhu lam','tien toi trien khai','tien sat']);
 const retreat=any(d,['withdrew','backed away','stepped back','retreated','lui','rut lai','rut ra','buoc lui']);
 const repeat=any(d,['returned to the same','revisiting identical','came again to the same','cycling through the same','tro ve cung','xem lai cung','quay lai cung','quay vong cung']);
 const same=any(d,['same assessment','identical reasoning','same judgement','same judgment','same review','cung danh gia','cung reasoning','cung phan doan','cung luot review']);
 const nonew=any(d,['evidence stayed unchanged','without new facts','no fresh information','unchanged inputs','evidence van khong doi','khong co facts moi','khong co thong tin moi','input y nguyen']);
 set('approach_action',approach);set('retreat_action',retreat);set('repeated_cycle',repeat);set('same_reasoning',same);set('no_new_information',nonew);
 // Neutral: self-owned judgement + execution/completion + closure/non-reopening.
 const selfdecision=any(d,['judgement with me','decision remained mine','chose independently','owned the final call','phan doan o minh','quyet dinh van thuoc ve toi','toi tu chon','giu quyen chot']);
 const executed=any(d,['completed the chosen action','carried it through','executed the step','followed through fully','hoan thanh hanh dong','lam toi noi','thuc hien buoc','lam day du']);
 const done=any(d,['matter finished','did not reopen','moved on once','stopped reviewing','xem chuyen ket thuc','khong mo lai','di tiep','ngung review']);
 set('self_ownership_retained',selfdecision);set('execution_completed',selfdecision&&executed);set('closure_present',(selfdecision&&done)||o.closure_present);
 return Object.freeze(o);
}
global.QCEvidenceExtractorV5S=Object.freeze({version:VERSION,scopeRaw,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
