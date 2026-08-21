(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5X;if(!parent)throw new Error('V5Y requires V5X');
const VERSION='QCEvidenceExtractorV5Y-V220-BOUNDED-RECALL';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function scopeRaw(raw){return parent.scopeRaw(raw);}
function extract(raw){
 const scoped=scopeRaw(raw),d=fold(scoped),o={...parent.extract(scoped)};
 if(any(d,['co the dung lai sequence ngoai tru hanh vi toi truc tiep thuc hien o doan cuoi','hanh dong quan sat duoc do chinh toi lam ngay truoc luc khep lai van chua duoc neu'])){
  o.self_owned_action=true;o.action_missing=true;o.endpoint_present=true;o.context_otherwise_complete=true;o.v220_clarification_alias=true;
 }
 if(any(d,['hay quyet dinh thay de lua chon cua ban the cho cho quyen chot cua toi','hay chon phuong an thay toi va de phan doan cua ban thay cho quyet dinh cuoi cua toi'])){
  o.delegated_decision=true;o.agency_transfer_explicit=true;o.choice_object_present=true;o.v220_decision_alias=true;
 }
 if(any(d,['constructed evaluation text rather than personal history','deliberately invented test material and does not describe a lived event of mine'])){
  o.non_lived_explicit=true;o.constructed_input=true;o.test_or_practice_context=true;o.v220_hypothetical_alias=true;
 }
 if(any(d,['toi diem tuong lai da noi viec nay co giai quyet theo cach toi hy vong khong','den cutoff tuong lai toi da neu chuyen nay co ket thuc bang ket qua toi muon khong'])){
  o.future_horizon_present=true;o.future_outcome_request=true;o.v220_prediction_alias=true;
 }
 if(any(d,['nuoc di nho voi duong lui ro','buoc dau de dao nguoc'])&&any(d,['mo rong tap lua chon','mo them phuong an'])&&any(d,['khong hanh dong','khong bat dau'])){
  o.reversible_action_available=true;o.option_expansion=true;o.non_start=true;o.v220_freeze_alias=true;
 }
 if(any(d,['consequential issue was waiting for my response while i occupied myself with peripheral tasks','cau tra loi cua toi van can cho van de chinh nhung toi danh thoi gian vao viec khac khong the xu ly no'])){
  o.attention_diverted=true;o.response_omitted=true;o.central_responsibility=true;o.peripheral_activity=true;o.v220_ignore_alias=true;
 }
 if(any(d,['i delayed for one defined period checked once responded and did not reopen the issue','toi pause trong gioi han da dat xem lai mot lan roi ket thuc ma khong keo dai review cycle'])){
  o.bounded_delay=true;o.single_review=true;o.closure_present=true;o.v220_slow_alias=true;
 }
 if(any(d,['i advanced toward the practical step withdrew and came back to the same assessment while the facts stayed the same'])){
  o.approach_action=true;o.retreat_action=true;o.repeated_cycle=true;o.same_reasoning=true;o.no_new_information=true;o.v220_sequence_alias=true;
 }
 if(any(d,['lua chon van la cua toi toi thuc hien xong buoc di va khong mo lai chuyen'])){
  o.self_ownership_retained=true;o.execution_completed=true;o.closure_present=true;o.v220_neutral_alias=true;
 }
 return Object.freeze(o);
}
global.QCEvidenceExtractorV5Y=Object.freeze({version:VERSION,scopeRaw,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
