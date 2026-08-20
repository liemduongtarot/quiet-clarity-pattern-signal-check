(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV1R2;if(!parent)throw new Error('QCEvidenceExtractorV1R3 requires V1R2');
const VERSION='QCEvidenceExtractorV1R3-V210-CONCEPT-COVERAGE';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const has=(s,a)=>a.some(x=>s.includes(x));
function extract(raw){
 const d=fold(raw),o={...parent.extract(raw)};
 // Agency transfer concepts: user explicitly removes own decision authority.
 if(has(d,['take the choice out of my hands','take choice out of my hands','take the decision out of my hands','lay quyen lua chon khoi tay toi','lay quyen quyet dinh khoi tay toi','quyet dinh thay vi de phan phan doan lai cho toi','quyet dinh thay vi de phan doan lai cho toi'])){o.delegated_decision=true;o.agency_transfer_explicit=true;}
 if(has(d,['select the option i should follow','choose the option i should follow','chon phuong an toi phai theo','chon huong toi phai theo'])){o.delegated_decision=true;o.choice_object_present=true;}
 // Constructed/non-lived concepts.
 if(has(d,['invented practice input','invented test input','fabricated practice input','synthetic test data','synthetic test input','input thuc hanh duoc bia ra','du lieu kiem thu tong hop','du lieu test tong hop','tinh huong duoc bia ra'])){o.constructed_input=true;o.test_or_practice_context=true;}
 if(has(d,['rather than something i actually experienced','not something i actually experienced','not something i lived','not something that happened in my life','khong phai dieu toi that su da trai qua','khong phai su viec trong doi toi','khong phai chuyen trong doi toi','khong phai dieu da xay ra trong doi toi']))o.non_lived_explicit=true;
 // Third-party hidden-state concepts.
 if(has(d,['person involved','other party','other person involved','nguoi lien quan','nguoi con lai','ben con lai']))o.third_party_subject=true;
 if(has(d,['hidden intention','hidden intent','unspoken intention','private intention','silently thinks','silent view','y dinh kin','y dinh an','dang am tham nghi','suy nghi am tham']))o.hidden_internal_state=true;
 if(has(d,['no outward evidence from which to know','no external evidence to know','no external evidence','khong co bang chung ben ngoai de biet','khong co can cu ben ngoai de biet']))o.observable_evidence_absent=true;
 // Reversible/non-start concepts.
 if(has(d,['low-commitment experiment','low commitment experiment','low-commitment trial','clear way back','easy way back','reversible experiment','buoc thu it cam ket','thu nghiem it cam ket','duong quay lai ro','de quay lai']))o.reversible_action_available=true;
 if(has(d,['expanding the option list','expanded the option list','kept expanding options','continued expanding options','mo them danh sach lua chon','mo rong danh sach lua chon','cu mo them lua chon']))o.option_expansion=true;
 if(has(d,['instead of trying it','rather than trying it','without trying it','did not try it','thay vi thu no','khong thu no','chua bat dau thu']))o.non_start=true;
 // Consequential diversion / ignore concepts.
 if(has(d,['consequential item that needed action from me','important item that needed action from me','item that needed action from me','viec co he qua can toi xu ly','muc quan trong can toi hanh dong']))o.central_responsibility=true;
 if(has(d,['shifted attention to lower-priority','shifted attention into lower-priority','redirected effort to lower-priority','chuyen chu y sang viec uu tien thap','chuyen sang viec it quan trong'])){o.attention_diverted=true;o.peripheral_activity=true;}
 if(has(d,['did not address it','left it unaddressed','did not deal with it','khong xu ly no','de no chua xu ly']))o.response_omitted=true;
 // Bounded delay + one review + closure concepts.
 if(has(d,['answered later than i normally would','answered later than usual','paused longer before dealing','paused longer before handling','dung lau hon truoc khi xu ly','tra loi muon hon binh thuong','phan hoi muon hon binh thuong']))o.bounded_delay=true;
 if(has(d,['checked the matter once','checked it once','reviewed it a single time','xem lai mot lan duy nhat','kiem tra mot lan duy nhat']))o.single_review=true;
 if(has(d,['closed it without returning','closed the matter without returning','matter settled','with the matter settled','chuyen da duoc chot','viec da duoc chot','khi chuyen da chot','roi di tiep']))o.closure_present=true;
 // Repeated approach / retreat concepts.
 if(has(d,['got ready to take the step','prepared to take the step','got ready to act','prepared to act','chuan bi lam buoc do','chuan bi hanh dong','sap lam buoc do']))o.approach_action=true;
 if(has(d,['and then withdrew','then withdrew','then pulled out','roi lai rut ra','roi rut ra','sau do rut lai']))o.retreat_action=true;
 if(has(d,['revisiting identical logic','revisited identical logic','reviewing identical logic','xem lai cung mot logic','quay lai cung mot logic']))o.same_reasoning=true;
 if(has(d,['without any fresh input','without fresh input','no fresh input','khong co dau vao moi','khong co thong tin moi']))o.no_new_information=true;
 if(has(d,['repeatedly got ready','many times prepared','nhieu lan chuan bi','lap lai viec chuan bi']))o.repeated_cycle=true;
 return Object.freeze(o);
}
global.QCEvidenceExtractorV1R3=Object.freeze({version:VERSION,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
