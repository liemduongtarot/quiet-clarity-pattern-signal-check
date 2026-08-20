(function(global){
'use strict';
const parent=global.QCSemanticCoreV77R;if(!parent)throw new Error('V8.3.209 requires V8.3.208 V77R');
const VERSION='V8.3.209-V208-V1-EVIDENCE-SLOT-COMPOSITION';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const has=(s,a)=>a.some(x=>s.includes(x));
const all=(s,groups)=>groups.every(g=>has(s,g));
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
const S={
 clarify:{complete:['surrounding facts','account contains','enough to understand','reaches the end','has an endpoint','diễn biến đã đủ','dien bien da du','tinh huong da co diem ket','cau chuyen da du','account is otherwise complete'],own:['came from me','i did','i performed','my action','my move','tu toi','toi da lam','do toi thuc hien','do toi lam','cua toi'],action:['action','move','response','behaviour','behavior','viec cu the','hanh dong','nuoc di','phan ung','hanh vi'],missing:['leaves blank','missing','not present','has not appeared','chua xuat hien','con thieu','bo trong','chua co trong record','chua duoc neu'],end:['at the end','end','closing','khep lai','ket thuc','diem do','doan cuoi']},
 decision:{delegate:['instead of me','in my place','on my behalf','replace my decision','replace my decision-making','chon trong cho cua toi','thay toi','thay quyet dinh cua toi','trong cho cua toi'],choose:['make the call','choose','select','pick','chon','quyet dinh'],object:['path','option','route','course','next step','phuong an','huong','buoc'],answer:['not decision support','as the answer','make that your answer','lam cau tra loi','dung chinh phuong an do lam cau tra loi','not a framework']},
 hypothetical:{constructed:['test material','test input','practice input','practice scenario','synthetic','constructed','fabricated','created this','i created','tao doan nay','toi tao','du lieu test','input thuc hanh','tinh huong chi ton tai de test','chi de test cong cu'],test:['test','testing','validation','practice','thuc hanh','kiem thu','cong cu'],nonlived:['not describe my real experience','not an experience','not lived','not autobiographical','nothing autobiographical','not be understood as an experience','khong mo ta trai nghiem that','khong mang tinh tu truyen','khong nen duoc hieu la trai nghiem','khong phai trai nghiem','trai nghiem da xay ra']},
 third:{person:['my colleague','my manager','customer','client','their','they','dong nghiep','quan ly','khach hang','nguoi kia'],hidden:['opinion','judgement','judgment','feeling','intention','keeps entirely internal','internal','secret','hidden','danh gia kin','cam thay bi mat','y dinh an','giu hoan toan ben trong'],about:['of me','about me','toward me','voi toi','ve toi'],noevidence:['no evidence','no outward evidence','beyond the available record','outward record gives me no evidence','beyond their behaviour','beyond their behavior','khong co bang chung','ngoai record hanh vi','vuot ngoai hanh vi']},
 freeze:{reversible:['reversible','can reverse','can undo','way back','little downside','low risk','small experiment','small trial','thu nghiem nho','co the dao nguoc','duong lui','it rui ro','de quay lai'],optioning:['more options','more possibilities','more alternatives','comparison','research','nghien cuu','so them kha nang','mo rong lua chon','lua chon khac'],nostart:['delay starting','delayed starting','not started','have not begun','rather than begin','chua bat dau','tri hoan bat dau','khong bat dau','van o che do']},
 ignore:{central:['central responsibility','central issue','main issue','main request','core request','consequential item','van de chinh','viec chinh','yeu cau chinh','trach nhiem chinh'],pending:['still open','needed action','awaiting my reply','waiting for my response','dang cho phan hoi','chua xu ly','van mo','can phan hoi'],divert:['turned toward','focused on','shifted attention','busied myself','don chu y','quay sang','chuyen sang','tap trung vao'],low:['less important','secondary','peripheral','side details','chi tiet phu','viec phu','thu yeu','ben le'],norespond:['rather than answer','did not respond','instead of responding','khong phan hoi','thay vi phan hoi']},
 slow:{delay:['longer than usual','paused longer than usual','not reply immediately','took longer','mat nhieu thoi gian hon','khong tra loi ngay','mat mot luc','cham hon'],once:['single check','checked once','one check','one verification','dung mot luot','mot lan','xac minh dung mot luot','kiem mot lan'],close:['left it alone','did not return','did not reopen','closed it','khong tro lai','khong mo lai','khep van de','di tiep']},
 sequence:{approach:['nearly acted','approached execution','moved toward action','tien ve buoc lam','tien toi hanh dong','gan nhu lam'],retreat:['stepped back','retreated','pulled back','lui ra','lui lai','rut lui'],repeat:['kept returning','re-entered','again and again','many times','nhieu lan','cu quay lai','lap lai','di qua cung mot danh gia nhieu lan'],same:['same review','same reasoning loop','same evaluation','cung mot danh gia','cung mot vong review','cung mot vong ly luan'],nonew:['information stayed unchanged','no additional input','no new information','du kien khong doi','thong tin khong doi','khong co dau vao moi']},
 neutral:{own:['i chose','i decided','kept ownership','independently chose','tu chon','tu quyet','tu lua chon','doc lap chon'],bounded:['bounded','limited','reasonable','proportionate','co gioi han','hop ly'],done:['completed','executed','carried it out','finished','lam toi noi','hoan tat','hoan thanh','thuc hien'],close:['moved on','stopped considering','did not reopen','did not review again','ngung can nhac','di tiep','khong mo lai','khong review lai','khi da xong']}
};
function clarify(d){return all(d,[S.clarify.own,S.clarify.action,S.clarify.missing,S.clarify.end]) && has(d,S.clarify.complete);}
function decision(d){return all(d,[S.decision.delegate,S.decision.choose,S.decision.object]) && (has(d,S.decision.answer)||d.includes('instead of me'));}
function hypothetical(d){return all(d,[S.hypothetical.constructed,S.hypothetical.test,S.hypothetical.nonlived]);}
function third(d){return all(d,[S.third.person,S.third.hidden,S.third.noevidence]) && (has(d,S.third.about)||d.includes('of me')||d.includes('ve toi'));}
function neutral(d){return all(d,[S.neutral.own,S.neutral.bounded,S.neutral.done,S.neutral.close]);}
function sequence(d){return all(d,[S.sequence.approach,S.sequence.retreat,S.sequence.repeat,S.sequence.same,S.sequence.nonew]);}
function freeze(d){return all(d,[S.freeze.reversible,S.freeze.optioning,S.freeze.nostart]);}
function slow(d){return all(d,[S.slow.delay,S.slow.once,S.slow.close]);}
function ignore(d){return all(d,[S.ignore.central,S.ignore.divert,S.ignore.low]) && (has(d,S.ignore.pending)||has(d,S.ignore.norespond));}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),d=fold(raw);let rid=null,fam=null;
  if(hypothetical(d))rid='input:hypothetical-or-example';
  else if(decision(d))rid='input:decision-request';
  else if(third(d))rid='input:third-party-only';
  else if(clarify(d))rid='input:clarification-required';
  else if(neutral(d))fam={families:[],sequence:false};
  else if(sequence(d))fam={families:['slow'],sequence:true};
  else if(freeze(d))fam={families:['freeze'],sequence:false};
  else if(slow(d))fam={families:['slow'],sequence:false};
  else if(ignore(d))fam={families:['ignore'],sequence:false};
  if(!rid&&!fam)return base;
  if(!rid&&base.input_route&&base.input_route.id!=='input:self-lived'){
    if(neutral(d)){}else return base;
  }
  const route=rid||'input:self-lived',input_route=frame(route,base.input_route),families=rid?[]:fam.families,seq=rid?false:fam.sequence;
  return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[...families],sequence:!!seq,oscillation:!!seq,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_209_V208_V1_EVIDENCE_SLOT_COMPOSITION'}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v51-v209-v208-evidence-slot-composition'})};global.QCSemanticCoreV78=core;global.PSC_V83209=core;
})(typeof globalThis!=='undefined'?globalThis:this);
