(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV2T;if(!parent)throw new Error('QCEvidenceExtractorV3 requires V2T');
const VERSION='QCEvidenceExtractorV3-V211-CONTEXT-SCOPED';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
const neutralMarkers=[
 'no extra signal about the mechanism','no additional behavioural evidence','no additional behavioral evidence','no additional behavioural cue','no additional behavioral cue','adds no hidden evidence','contributes no additional behavioural evidence','contributes no additional behavioral evidence','adds no new mechanism','no extra semantic signal','no additional semantic signal','contributes no extra signal','does not change the mechanism','does not identify the response mechanism',
 'khong them tin hieu co che','khong bo sung bang chung hanh vi','khong them cue hanh vi','khong them bang chung an','khong tao them co che','khong them tin hieu semantic','khong bo sung tin hieu','khong thay doi co che phan ung','khong xac dinh response mechanism'
];
function scopeRaw(raw){
 const parts=String(raw||'').split(/(?<=[.!?;])\s+/);
 const kept=parts.filter(p=>{const d=fold(p);return !neutralMarkers.some(m=>d.includes(m));});
 return kept.join(' ').trim()||String(raw||'');
}
function extract(raw){
 const scoped=scopeRaw(raw),d=fold(scoped),o={...parent.extract(scoped)};
 const self=any(d,['i ','my ','me ','myself','personally','came from me','attributable to me','chinh toi','toi ','cua toi','quy cho toi','xuat phat tu toi']);
 const action=any(d,['action','response','behaviour','behavior','move','contribution','did','hanh dong','phan ung','hanh vi','nuoc di','dong gop','da lam']);
 const omission=any(d,['left out','leaves out','omitted','omits','missing','absent','not supplied','never supplied','not identified','unspecified','left blank','luoc mat','bo sot','bo trong','con thieu','chua neu','khong ghi','chua cung cap']);
 const endpoint=any(d,['at the end','when the episode closed','when it closed','at closure','at the stopping point','final moment','final point','endpoint','khep lai','luc chot','diem dung','doan cuoi','hoi ket','diem ket']);
 if(self&&action)o.self_owned_action=true;
 if(action&&omission)o.action_missing=true;
 if(endpoint)o.endpoint_present=true;
 if(any(d,['reconstruct the whole','surrounding chronology is settled','outside facts are accounted','nothing external needs clarification','complete around the event','co the dung lai toan bo','du kien xung quanh da ro','khong con thieu thong tin ben ngoai','boi canh da du de hieu']))o.context_otherwise_complete=true;

 const constructed=any(d,['test prose','test text','validation prose','classification exercise','classifier exercise','synthetic text','practice prose','scenario i created','sample i created','prose i created','doan test','noi dung test','bai kiem classification','scenario toi tao','sample toi tao','van ban test']);
 const notLived=any(d,['not something that occurred to me','not something that happened to me','not an event from my life','not lived by me','did not occur to me','does not describe my life','khong phai chuyen xay ra voi toi','khong tung xay ra voi toi','khong phai su kien trong doi toi','khong mo ta doi song cua toi']);
 if(constructed)o.constructed_input=true;
 if(constructed)o.test_or_practice_context=true;
 if(notLived)o.non_lived_explicit=true;

 const third=any(d,['my manager','my supervisor','my colleague','the other person','the customer','the client','manager s','supervisor s','colleague s','nguoi kia','quan ly','dong nghiep','khach hang','nguoi do']);
 const hidden=any(d,['unspoken internal','unspoken view','internal view','internal judgement','internal judgment','hidden judgement','hidden judgment','concealed opinion','secret conclusion','secretly concluding','secretly thinks','private view','private conclusion','bi mat ket luan','ket luan bi mat','danh gia an','danh gia noi tam','quan diem chua noi','quan diem an','y dinh kin','nghi tham']);
 const noObs=any(d,['absence of observable evidence','no observable evidence','no outward evidence','no visible evidence','no sign in their behaviour','no sign in their behavior','no words actions or outward signs','nothing they said or did','record of behaviour has no sign','record of behavior has no sign','khong co bang chung quan sat','thieu bang chung quan sat','khong co dau hieu','khong loi noi hanh dong hay dau hieu','record hanh vi khong co dau hieu','khong co can cu ben ngoai']);
 if(third)o.third_party_subject=true;
 if(third&&hidden)o.hidden_internal_state=true;
 if(third&&noObs)o.observable_evidence_absent=true;

 const horizon=any(d,['near future','coming weeks','next few weeks','next several weeks','by next month','within the next month','before the deadline','tuong lai gan','vai tuan toi','vai tuan sap toi','thang toi','truoc deadline','truoc han']);
 const outcome=any(d,['end on the positive side','end positively','resolve positively','favour me','favor me','benefit me','final outcome','final result','result i want','ket thuc tich cuc','huong co loi','ket qua cuoi','outcome','ket qua toi muon']);
 const futureAsk=(d.includes('?')||any(d,['will ','is this going to','co ','lieu ']))&&horizon&&outcome;
 if(horizon)o.future_horizon_present=true;
 if(futureAsk)o.future_outcome_request=true;

 const reversible=any(d,['would not lock me in','does not lock me in','not lock me in','could reverse','reversed it easily','easy to reverse','clear way back','low-risk','low risk','reversible','khong khoa toi','de dao nguoc','co the dao nguoc','de quay lai','duong lui ro','rui ro thap']);
 const optioning=any(d,['broadening the option','broadened the option','expanding the option','expanded alternatives','researching alternatives','kept researching alternatives','comparing alternatives','adding alternatives','mo rong phuong an','mo rong lua chon','nghien cuu them phuong an','so sanh them','them lua chon']);
 const nostart=any(d,['left it untouched','not beginning','rather than beginning','never began','never started','did not begin','did not start','instead of starting','de nguyen','chua bat dau','khong bat dau','thay vi bat dau','chua dong vao']);
 if(reversible)o.reversible_action_available=true;
 if(optioning)o.option_expansion=true;
 if(nostart)o.non_start=true;

 const central=any(d,['important matter','consequential matter','consequential request','central responsibility','main issue','core matter','important issue','viec quan trong','chuyen quan trong','yeu cau co he qua','trach nhiem trung tam','van de chinh','viec cot loi']);
 const divert=any(d,['diverted effort','redirected effort','shifted effort','turned to side','turned toward side','focused on side','occupied myself with','chuyen suc','don suc sang','quay sang viec phu','tap trung vao viec phu']);
 const peripheral=any(d,['side details','side work','peripheral details','peripheral work','secondary tasks','lower-priority','chi tiet phu','viec phu','viec ben le','uu tien thap']);
 const omittedResponse=any(d,['instead of responding','instead of replying','stayed open','remained open','left unanswered','still needed my answer','thay vi phan hoi','thay vi tra loi','van mo','chua duoc tra loi','van can toi phan hoi']);
 if(central)o.central_responsibility=true;
 if(divert)o.attention_diverted=true;
 if(peripheral)o.peripheral_activity=true;
 if(omittedResponse)o.response_omitted=true;

 const delay=any(d,['paused longer than normal','later than normal','later than usual','responded late','response arrived slowly','reply arrived slowly','response came slowly','slower than normal','slower than usual','tra loi muon','phan hoi muon','phan hoi cham','dung lau hon binh thuong','cham hon thuong le']);
 const once=any(d,['verified one point','checked it once','checked once only','one check','single check','one verification','mot lan','dung mot lan','xac minh mot diem','kiem mot diem']);
 const closure=any(d,['stopped revisiting','stay closed','matter stay closed','no return to the issue','without returning','did not return','clean stop','closed it','khong quay lai','ngung xem lai','de chuyen khép lai','de chuyen khep lai','dung han','khong tro lai']);
 if(delay)o.bounded_delay=true;
 if(once)o.single_review=true;
 if(closure)o.closure_present=true;

 const approach=any(d,['nearly acted','almost acted','nearly took action','kept moving toward','moved toward execution','moved toward the step','prepared to act','got close to acting','gan nhu hanh dong','gan nhu lam','tien toi thuc hien','tien ve buoc lam','chuan bi hanh dong','den sat hanh dong']);
 const retreat=any(d,['pulled back','backed away','retreated','withdrew','pulled out','stepped back','rut ra','rut lui','lui lai','keo lai','thoi lai']);
 const repeat=any(d,['repeated','more than once','again and again','kept returning','cycled','re-entered','lap lai','hon mot lan','nhieu lan','cu quay ve','lien tuc']);
 const same=any(d,['same assessment','same evaluation','same reasoning','same logic','cung mot danh gia','cung danh gia','cung reasoning','cung logic','cung phan doan']);
 const noNew=any(d,['no new evidence','no new facts','nothing new','no fresh evidence','facts unchanged','evidence unchanged','khong co evidence moi','khong co du kien moi','chang co gi moi','du kien giu nguyen','evidence giu nguyen']);
 if(approach)o.approach_action=true;
 if(retreat)o.retreat_action=true;
 if(repeat)o.repeated_cycle=true;
 if(same)o.same_reasoning=true;
 if(noNew)o.no_new_information=true;
 return Object.freeze(o);
}
global.QCEvidenceExtractorV3=Object.freeze({version:VERSION,scopeRaw,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
