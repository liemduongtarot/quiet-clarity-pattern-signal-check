(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5V;if(!parent)throw new Error('V5W requires V5V');
const VERSION='QCEvidenceExtractorV5W-V216-SEALED-RECALL';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function scopeRaw(raw){return parent.scopeRaw(raw);}
function extract(raw){
 const scoped=scopeRaw(raw),d=fold(scoped),o={...parent.extract(scoped)};
 // Decision EN: transfer wording used by frozen V215 S01-06.
 if(any(d,['transferring the choice itself','transfer the choice itself','instead of helping me decide'])){o.delegated_decision=true;o.agency_transfer_explicit=true;o.choice_object_present=true;}
 // Third-party VI: explicit third-party private/unspoken view + no outward basis.
 const third=any(d,['ben thu ba','nguoi thu ba']);
 const hidden=any(d,['quan diem rieng chua boc lo','quan diem chua boc lo','niem tin rieng chua boc lo']);
 const nobasis=any(d,['khong co dau hieu ben ngoai','khong co dau hieu ben ngoai chung minh','khong co dau hieu ben ngoai lam can cu']);
 if(third){o.third_party_subject=true;if(hidden)o.hidden_internal_state=true;if(nobasis)o.observable_evidence_absent=true;}
 // Prediction VI: concrete future point + final outcome favourable to self.
 const horizon=any(d,['moc tuong lai cu the','nhin toi mot moc tuong lai cu the']);
 const outcome=any(d,['outcome cuoi co giai quyet theo huong co loi','outcome cuoi','theo huong co loi cho toi']);
 if(horizon)o.future_horizon_present=true;if(horizon&&outcome&&(d.includes('?')||d.includes('co giai quyet')))o.future_outcome_request=true;
 // Freeze VI: easy-exit/reversible trial + added options + opening step not started.
 const reversible=any(d,['phep thu de thoat','co the dao nguoc']);
 const options=any(d,['them option','them lua chon']);
 const nonstart=any(d,['buoc mo dau chua khoi dong','de buoc mo dau chua khoi dong']);
 if(reversible)o.reversible_action_available=true;if(options)o.option_expansion=true;if(nonstart)o.non_start=true;
 // Slow VI: finite extra time + one check + review closure.
 const delay=any(d,['them mot khoang thoi gian co gioi han truoc phan hoi','khoang thoi gian co gioi han truoc phan hoi']);
 const one=any(d,['kiem mot lan','kiem dung mot lan']);
 const closed=any(d,['dong review','sau do dong review']);
 if(delay)o.bounded_delay=true;if(one)o.single_review=true;if(closed)o.closure_present=true;
 // Sequence VI: near execution -> back out -> old reasoning with unchanged facts.
 if(any(d,['den gan execution']))o.approach_action=true;
 if(any(d,['lui ra']))o.retreat_action=true;
 if(any(d,['xem lai reasoning cu'])){o.repeated_cycle=true;o.same_reasoning=true;}
 if(any(d,['du kien khong thay doi']))o.no_new_information=true;
 // Neutral VI: explicit retained final agency + completed move + issue not left open.
 if(any(d,['giu quyen quyet dinh cuoi']))o.self_ownership_retained=true;
 if(any(d,['lam xong nuoc di']))o.execution_completed=true;
 if(any(d,['khong tiep tuc de chuyen do mo','khong de chuyen do mo']))o.closure_present=true;
 return Object.freeze(o);
}
global.QCEvidenceExtractorV5W=Object.freeze({version:VERSION,scopeRaw,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
