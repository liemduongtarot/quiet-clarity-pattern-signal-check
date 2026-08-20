(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV4;if(!parent)throw new Error('QCEvidenceExtractorV5 requires V4');
const VERSION='QCEvidenceExtractorV5-V212-SCOPE-PROPAGATION';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function scopeRaw(raw){
 const initial=String(raw||'').split(/(?<=[.!?;])\s+/).filter(Boolean);
 const f=initial.map(fold),drop=new Set();
 const disclaimer=d=>any(d,['supplied no behavioural evidence','supplied no behavioral evidence','provided no behavioural evidence','provided no behavioral evidence','adds no behavioural evidence','adds no behavioral evidence','contributes no behavioural evidence','contributes no behavioral evidence','khong cung cap bang chung hanh vi','khong bo sung bang chung hanh vi','khong them bang chung hanh vi']);
 const unrelated=d=>any(d,['unrelated background remained unchanged','unrelated background stayed unchanged','background khong lien quan do van khong doi','background khong lien quan van khong doi']);
 for(let i=0;i<initial.length;i++){
   if(disclaimer(f[i])){drop.add(i);if(i>0&&(/^(separately|rieng mot)\b/.test(f[i-1])))drop.add(i-1);}
   if(unrelated(f[i]))drop.add(i);
 }
 const pre=initial.filter((_,i)=>!drop.has(i)).join(' ').trim()||String(raw||'');
 return parent.scopeRaw(pre);
}
function extract(raw){
 const scoped=scopeRaw(raw),d=fold(scoped),o={...parent.extract(scoped)};
 const set=(k,v)=>{if(v)o[k]=true;};
 // Critical V212 repair: parent extraction receives scoped text, not raw text.
 // Hypothetical: created/evaluation framing + explicit not-real-experience framing.
 const constructed=any(d,['created these details to evaluate the system','created these details for evaluation','wrote these details to evaluate the system','tao cac chi tiet nay de danh gia he thong','tao cac chi tiet nay chi de danh gia','tao noi dung nay de danh gia he thong']);
 const nonLived=any(d,['not to report a real experience','not to describe a real experience','not a real experience of mine','khong phai ke trai nghiem that','khong phai de ke trai nghiem that','khong mo ta trai nghiem that']);
 set('constructed_input',constructed);set('test_or_practice_context',constructed);set('non_lived_explicit',nonLived);
 // Third-party hidden state: private/hidden mental state + no observable basis.
 const third=any(d,['my colleague','the client','the customer','the other person','dong nghiep','khach hang','nguoi kia','nguoi do']);
 const hidden=any(d,['hidden opinion','privately intends','private intention','private belief','internal judgement','internal judgment','secretly believes','y kien an','y dinh rieng','y dinh an','danh gia noi tam','niem tin bi mat']);
 const noBasis=any(d,['no observable behaviour gives evidence','no observable behavior gives evidence','nothing they said or did reveals it','no observable basis','no outward evidence','khong co hanh vi quan sat nao lam bang chung','khong loi noi hay hanh dong nao boc lo','khong co can cu quan sat']);
 set('third_party_subject',third);set('hidden_internal_state',third&&hidden);set('observable_evidence_absent',third&&noBasis);
 // Prediction: explicit future orientation + outcome/result desired.
 const horizon=any(d,['looking ahead','near future','next few weeks','coming month','nhin ve phia truoc','tuong lai gan','vai tuan toi','thang sap toi']);
 const outcome=any(d,['eventual outcome','final outcome','final result','result i am hoping for','outcome cuoi','ket qua cuoi','ket qua toi dang mong','ket qua toi mong']);
 const ask=(d.includes('?')||any(d,['will ','is this going to','co ','lieu ']))&&horizon&&outcome;
 set('future_horizon_present',horizon);set('future_outcome_request',ask);
 // Freeze: low commitment / reversible test + option comparison/expansion + first action not started.
 const reversible=any(d,['little commitment','low commitment','not locked into it','without being locked in','could try','reversible','it cam ket','khong bi khoa vao no','co the thu','de dao nguoc','rui ro thap']);
 const options=any(d,['comparison mode','adding possibilities','expanding options','widened the choice set','kept adding possibilities','mode so sanh','them kha nang','mo rong lua chon','mo rong option','xay them lua chon']);
 const nonstart=any(d,['rather than initiate','first action undone','instead of starting','never started','instead of beginning','thay vi thuc hien buoc dau','de hanh dong dau chua lam','thay vi bat tay vao','chua bat dau']);
 set('reversible_action_available',reversible);set('option_expansion',options);set('non_start',nonstart);
 // Slow: bounded delay + single verification + closure/non-return.
 const delay=any(d,['replied later than usual','response was delayed','answered after a pause','later than usual','phan hoi sau mot khoang dung','tra loi muon hon thuong le','phan hoi bi cham','cham hon binh thuong']);
 const once=any(d,['checked the matter once','made one verification','verified it once','one check','one verification','xac minh mot lan','kiem mot lan','mot luot review']);
 const closure=any(d,['treated it as closed','did not revisit it afterwards','stopped reopening the matter','moved on','ngung mo lai van de','khong quay lai','xem chuyen da dong','di tiep']);
 set('bounded_delay',delay);set('single_review',once);set('closure_present',closure||o.closure_present);
 // Sequence: approach + retreat + return/cycle + unchanged/no-new evidence.
 const approach=any(d,['nearly acted','moved toward acting','approached execution','got close to action','tien sat buoc lam','tien ve hanh dong','gan nhu hanh dong']);
 const retreat=any(d,['withdrew','backed away','stepped back','retreated','lui ra','lui lai','rut lai','rut lui']);
 const repeat=any(d,['came back to the same','returned to the same','cycled through the same','quay vong cung','quay ve cung','tro lai cung']);
 const same=any(d,['same assessment','same review','same judgement','same judgment','cung phan doan','cung danh gia','cung luot review']);
 const noNew=any(d,['no change in evidence','no new information','no new facts','evidence unchanged','khong co thong tin moi','evidence khong thay doi','khong co du kien moi']);
 set('approach_action',approach);set('retreat_action',retreat);set('repeated_cycle',repeat);set('same_reasoning',same);set('no_new_information',noNew);
 return Object.freeze(o);
}
global.QCEvidenceExtractorV5=Object.freeze({version:VERSION,scopeRaw,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
