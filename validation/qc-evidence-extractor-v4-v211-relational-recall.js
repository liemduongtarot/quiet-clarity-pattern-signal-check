(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV3R;if(!parent)throw new Error('QCEvidenceExtractorV4 requires V3R');
const VERSION='QCEvidenceExtractorV4-V211-RELATIONAL-RECALL';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function extract(raw){const scoped=parent.scopeRaw(raw),d=fold(scoped),o={...parent.extract(raw)};
 const set=(k,v)=>{if(v)o[k]=true;};
 // Clarification: complete context + omitted self-owned response at an endpoint.
 const selfResp=any(d,['response attributable to me','response from me','my own final move','my final move','action that came from me','what i myself did','phan ung xuat phat tu chinh toi','phan ung cua toi','nuoc di cuoi cua toi','hanh dong den tu phia toi','chinh toi da lam']);
 const gap=any(d,['omitted','unstated','left out','leaves out','only unstated part','except for','except what','bo thieu','chua duoc neu','bo mat','bo sot','ngoai tru','chi nuoc di','phan con thieu']);
 const end=any(d,['closing point','endpoint','when it ended','when the event ended','at the end','final move','diem ket','khi no ket thuc','khi su viec ket thuc','luc chot','hoi cuoi']);
 const complete=any(d,['all external facts are accounted for','episode can be reconstructed','everything around the event is known','chronology reaches','moi du kien ben ngoai da du','co the dung lai toan bo','boi canh xung quanh deu ro','dien bien toi diem ket']);
 set('self_owned_action',selfResp);set('action_missing',selfResp&&gap);set('endpoint_present',end);set('context_otherwise_complete',complete);

 // Hypothetical: explicit construction/testing + rejection of lived/autobiographical status.
 const constructed=any(d,['wrote this scenario solely to test','fabricated validation prose','synthetic practice material','created this case for testing','test the classifier','validation prose','scenario nay chi de test','doan validation bia ra','du lieu thuc hanh tong hop','tao case nay de kiem thu','thu classifier']);
 const nonLived=any(d,['not part of my lived history','not an event that occurred to me','should not be read as autobiographical','rather than to describe my life','khong thuoc lich su song cua toi','khong phai su viec tung xay ra voi toi','khong nen hieu la tu truyen','khong mo ta doi song cua minh']);
 set('constructed_input',constructed);set('test_or_practice_context',constructed);set('non_lived_explicit',nonLived);

 // Third-party hidden state requires role/person + internal state + explicit absence of observable basis.
 const third=any(d,['my manager','my colleague','the other person','the client','the customer','quan ly','dong nghiep','nguoi kia','khach hang','nguoi do']);
 const hidden=any(d,['concealed judgement','concealed judgment','private conclusion','secretly thinks','unspoken intention','hidden opinion','internal judgement','internal judgment','danh gia kin','ket luan rieng','dang nghi tham','y dinh chua noi','quan diem an','danh gia noi tam']);
 const noBasis=any(d,['nothing observable supports','without any outward evidence','words and actions give no basis','no observable sign','no observable evidence','no outward evidence','khong co gi quan sat duoc lam can cu','ben ngoai khong co bang chung','loi noi va hanh dong khong cho can cu','khong co dau hieu quan sat','khong co bang chung quan sat']);
 set('third_party_subject',third);set('hidden_internal_state',third&&hidden);set('observable_evidence_absent',third&&noBasis);

 // Ignore: consequential/core item + attention shifted to minor/peripheral work + answer omitted.
 const central=any(d,['central item','main responsibility','consequential request','core matter','central responsibility','viec trung tam','trach nhiem chinh','yeu cau co he qua','viec cot loi','van de chinh']);
 const peripheral=any(d,['minor tasks','peripheral work','lower-priority details','side work','minor work','viec nho','cong viec ben le','chi tiet uu tien thap','viec phu','viec ben le']);
 const diverted=any(d,['occupied myself with','shifted attention to','diverted effort into','turned to','turned toward','lam minh ban voi','chuyen chu y sang','don suc vao','quay sang','chuyen sang']);
 const omitted=any(d,['did not respond','did not answer','stayed open','still needed a response','needed my answer','required action from me','khong phan hoi','khong tra loi','van mo','van can phan hoi','can hanh dong tu toi']);
 set('central_responsibility',central);set('peripheral_activity',peripheral);set('attention_diverted',peripheral&&diverted);set('response_omitted',omitted&&(central||peripheral));

 // Slow: bounded delay + exactly one review/check + explicit closure/non-return.
 const delay=any(d,['answered later than usual','response was delayed','paused longer than normal','replied slowly','later than usual','slower than usual','tra loi muon hon thuong le','phan hoi den cham','dung lau hon binh thuong','tra loi cham','phan hoi cham']);
 const once=any(d,['checked one point','one verification','reviewed it once','single check','made a single check','kiem mot diem','mot lan xac minh','xem lai mot lan','duy nhat mot luot','kiem mot luot']);
 const closure=any(d,['closed the matter','moved on','did not reopen','without returning','treated the issue as finished','left the matter closed','khep chuyen','di tiep','khong mo lai','khong quay lai','xem viec da xong','de chuyen khep lai']);
 set('bounded_delay',delay);set('single_review',once);set('closure_present',closure||o.closure_present);

 // Sequence: approach + retreat + repetition/same reasoning + no new information.
 const approach=any(d,['moved toward execution','nearly acted','approached the step','getting close to action','kept getting close to action','tien toi thuc hien','gan nhu hanh dong','tien ve buoc lam','den sat hanh dong','gan toi hanh dong']);
 const retreat=any(d,['pulled back','retreated','withdrew','backing away','backed away','rut lui','lui lai','rut ra','lui','thoi']);
 const repeat=any(d,['returned to the same','repeated the same','more than once','cycling through','cycled through','kept getting close','quay lai cung','lap cung','hon mot lan','quay vong cung','cu den sat']);
 const same=any(d,['same judgement','same judgment','same review','identical reasoning','same assessment','same reasoning','cung mot phan doan','cung luot xem xet','cung reasoning','cung mot danh gia','cung danh gia']);
 const noNew=any(d,['facts stayed unchanged','no new evidence','without fresh input','nothing new','no additional information','du kien giu nguyen','khong co evidence moi','khong co input moi','chang co gi moi','khong co thong tin moi']);
 set('approach_action',approach);set('retreat_action',retreat);set('repeated_cycle',repeat);set('same_reasoning',same);set('no_new_information',noNew);

 // Freeze wording variants.
 const reversible=any(d,['reversible low-risk','could undo the trial','would not lock me in','clear way back','de quay lai','co the hoan tac','khong khoa toi','duong lui ro']);
 const options=any(d,['expanding options','comparing alternatives','researching more possibilities','broadened the option set','mo rong lua chon','so them phuong an','nghien cuu them kha nang','tang lua chon']);
 const nonstart=any(d,['instead of starting','never began','rather than trying it','left the step untouched','thay vi bat dau','chua lam','thay vi thu','de nguyen buoc']);
 set('reversible_action_available',reversible);set('option_expansion',options);set('non_start',nonstart);
 return Object.freeze(o);
}
global.QCEvidenceExtractorV4=Object.freeze({version:VERSION,scopeRaw:parent.scopeRaw,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
