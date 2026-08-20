(function(global){
'use strict';
const VERSION='QCEvidenceExtractorV1-REVIEW-CANDIDATE';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const has=(s,a)=>a.some(x=>s.includes(x));
const slot=(o,k,v)=>{if(v)o[k]=true;};
function extract(raw){
 const d=fold(raw),o={};
 // Ownership / action / closure
 slot(o,'self_owned_action',has(d,['i personally','i myself','my own','from me','by me','i actually did','i did','i performed','my action','my move','chinh toi','do toi','tu toi','toi da lam','toi thuc hien','cua toi','phia toi']));
 slot(o,'action_missing',has(d,['missing','unspecified','absent','not stated','not specified','has not been stated','not present','left blank','still blank','con thieu','chua duoc neu','chua noi','van chua','bo trong','chua xuat hien','chua co']));
 slot(o,'endpoint_present',has(d,['at the end','before it ended','when it ended','final','closing','endpoint','end of','ket thuc','doan cuoi','diem ket','khep lai','cuoi cung']));
 slot(o,'context_otherwise_complete',has(d,['otherwise understandable','everything around','whole situation','account reaches','context is clear','context da du','boi canh da du','dien bien da du','toan bo su viec da ro','co the theo doi tron','tinh huong da ro']));
 slot(o,'closure_present',has(d,['moved on','left the matter closed','did not reopen','did not return','stopped reconsidering','closed it','once it was done','afterwards','di tiep','khep lai','khong mo lai','khong quay lai','ngung can nhac','sau do']));
 slot(o,'self_ownership_retained',has(d,['i made the choice myself','kept ownership','independently chose','judgement stayed with me','decision stayed with me','i decided myself','tu dua ra lua chon','giu quyen quyet dinh','doc lap chon','phan doan van thuoc ve toi','tu chon','tu quyet']));
 slot(o,'execution_completed',has(d,['carried it out','completed the practical step','followed through','executed the action','finished it','completed','lam xong','hoan thanh','thuc hien den noi','thuc hien hanh dong','hoan tat']));

 // Delegated decision
 slot(o,'delegated_decision',has(d,['choose the option in my place','take over the choice','pick my next course of action for me','replace my own decision','on my behalf','decide for me','quyet dinh ho','chon phuong an thay toi','chon buoc tiep theo trong cho cua toi','thay the quyet dinh cua toi','chon thay toi']));
 slot(o,'choice_object_present',has(d,['option','course of action','next step','path','route','choice','phuong an','buoc tiep theo','huong','lua chon','con duong']));
 slot(o,'agency_transfer_explicit',has(d,['instead of me','in my place','on my behalf','for me','rather than help me evaluate','do not want to make the final call myself','khong muon tu dua ra quyet dinh','thay toi','trong cho cua toi','ho toi','khong chi giup toi can nhac']));

 // Hypothetical / non-lived
 slot(o,'constructed_input',has(d,['invented this scenario','constructed test case','made this example','synthetic practice input','created this','practice material','test case','dung tinh huong nay','du lieu kiem thu','tu tao vi du','input tong hop','toi tao','input thuc hanh']));
 slot(o,'non_lived_explicit',has(d,['does not describe anything that happened to me','not part of my lived history','none of it is autobiographical','rather than a real episode','not autobiographical','not lived experience','khong phai chuyen that toi da trai qua','khong thuoc lich su song cua toi','khong mang tinh tu truyen','khong phai mot su viec da xay ra','khong phai trai nghiem']));
 slot(o,'test_or_practice_context',has(d,['practice','test','probe the tool','synthetic','kiem thu','thuc hanh','thu cong cu','test','tong hop']));

 // Third party hidden state
 slot(o,'third_party_subject',has(d,['my colleague','my manager','the other person','client','customer','their','they','dong nghiep','quan ly','nguoi kia','khach hang','ho']));
 slot(o,'hidden_internal_state',has(d,['private view','hidden conclusion','secretly intends','internal judgement','internal opinion','in mind','entirely internal','hidden','secret','quan diem kin','ket luan noi tam','y dinh bi mat','danh gia ben trong','giu ben trong','noi tam']));
 slot(o,'observable_evidence_absent',has(d,['nothing observable','no outward evidence','visible behaviour gives no basis','never been expressed or shown','no evidence','outward record gives no evidence','khong co hanh vi quan sat','khong co bang chung','hanh vi nhin thay khong cung cap can cu','chua tung duoc noi hay bieu hien','khong co dau hieu']));

 // Prediction
 slot(o,'future_horizon_present',has(d,['next month','coming weeks','several weeks','before the deadline','over the next','within the next','thang toi','vai tuan sap toi','truoc han chot','vai tuan toi','tuong lai gan']));
 slot(o,'future_outcome_request',has(d,['will this situation end','will the outcome','is the eventual result likely','will the result','is this likely to produce','what will happen','co ket thuc','ket qua cuoi cung co','ket cuc co','co cho ra ket qua','se xay ra']));

 // Freeze
 slot(o,'reversible_action_available',has(d,['reversible trial','low-risk step','easy-to-reverse','little downside','did not lock me in','could undo','small experiment','thu nghiem nho de dao nguoc','rui ro thap','de quay lai','it mat trai','duong lui','khong khoa toi']));
 slot(o,'option_expansion',has(d,['widening the option set','comparison mode','collecting more alternatives','adding possibilities','more options','more alternatives','mo rong lua chon','so them phuong an','gom them kha nang','them lua chon','nhieu phuong an']));
 slot(o,'non_start',has(d,['instead of starting','did not begin','did not start','postponed it','delayed starting','rather than trying','thay vi bat dau','chua lam','chua bat dau','tri hoan','thay vi thu','khong bat dau']));

 // Ignore
 slot(o,'central_responsibility',has(d,['main responsibility','consequential item','core request','central required','something central','main issue','central issue','trach nhiem chinh','viec quan trong','yeu cau cot loi','chuyen trung tam','van de chinh']));
 slot(o,'attention_diverted',has(d,['redirected attention','kept myself busy','focused on peripheral','shifted into','turned toward','shifted attention','chuyen chu y','ban voi','tap trung vao viec phu','quay sang','chuyen sang']));
 slot(o,'peripheral_activity',has(d,['side details','lower-priority activity','peripheral tasks','minor surrounding work','less important','secondary','chi tiet ben le','hoat dong it he qua','viec phu','nhung thu nho hon','kem quan trong','thu yeu']));
 slot(o,'response_omitted',has(d,['still needed my response','remained open','left it unanswered','instead of responding','rather than answering','waiting on me','dang cho toi','can toi phan hoi','de no chua duoc phan hoi','thay vi tra loi','thay vi dap lai','khong phan hoi']));

 // Slow
 slot(o,'bounded_delay',has(d,['longer than usual','response was delayed','paused before answering','extra time to respond','took longer','mat lau hon binh thuong','phan hoi den cham','dung lai truoc khi tra loi','can them thoi gian','cham hon']));
 slot(o,'single_review',has(d,['checked the matter once','one verification','single time','after one check','reviewed it a single time','kiem tra dung mot lan','mot luot xac minh','xem lai mot lan','sau mot lan kiem','mot lan']));

 // Sequence
 slot(o,'approach_action',has(d,['moved toward acting','nearly took the step','approached execution','getting close to acting','moved toward action','tien gan toi hanh dong','gan nhu lam buoc do','tien toi thuc hien','den gan hanh dong','tien ve hanh dong']));
 slot(o,'retreat_action',has(d,['pulled back','retreated','withdrew','stepping away','stepped back','rut lai','lui ra','rut lui','buoc ra','lui lai']));
 slot(o,'repeated_cycle',has(d,['repeated the same review several times','again and again','repeatedly','many times','kept returning','cycled through','lap cung mot luot','het lan nay den lan khac','nhieu lan','lien tuc','cu quay lai']));
 slot(o,'same_reasoning',has(d,['same review','identical reasoning','same assessment','same logic','same reasoning','cung mot luot xem xet','cung mot ly luan','cung mot danh gia','cung mot logic','cung ly luan']));
 slot(o,'no_new_information',has(d,['no new information','without fresh evidence','facts stayed unchanged','receiving nothing new','no additional input','khong co thong tin moi','khong co bang chung moi','du kien khong doi','khong nhan them dau vao','chua co gi moi']));
 return Object.freeze({...o});
}
global.QCEvidenceExtractorV1=Object.freeze({version:VERSION,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
