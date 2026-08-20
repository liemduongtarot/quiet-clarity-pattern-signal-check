(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV2S;if(!parent)throw new Error('QCEvidenceExtractorV2T requires V2S');
const VERSION='QCEvidenceExtractorV2T-V210-CONTEXTUAL-RECALL';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function extract(raw){const d=fold(raw),o={...parent.extract(raw)};
  const explicitTransfer=any(d,['take the choice out of my hands','make this call on my behalf','substitute your decision for mine','own the final choice','own final call','quyet thay toi','choose thay toi','pick action','chon cho toi','quyet dinh thay toi','quyet dinh ho','chon ho']);
  const decisionAction=any(d,['choose','pick','select','choice','make this call','call on my behalf','decision','continue','pause','withdraw','tiep tuc','tam dung','rut lui','quyet','chon','hanh dong','action']);
  if(explicitTransfer&&decisionAction&&!o.delegation_negated){o.agency_transfer_explicit=true;o.delegated_decision=true;o.choice_object_present=true;}

  const constructedHyp=any(d,['bai tap gia dinh','gia dinh','workshop gia su','gia su','hu cau','fictional','hypothetical exercise','hypothetical case','invented exercise']);
  if(constructedHyp){o.constructed_input=true;o.test_or_practice_context=true;o.non_lived_explicit=true;}

  const strongThird=!!o.third_party_subject;
  if(strongThird&&any(d,['concealed opinion','secretly thinks','secretly think','hidden judgement','hidden judgment','private intention','danh gia noi tam','danh gia chua noi','ket luan kin','quan diem kin','y dinh rieng','y dinh bi mat']))o.hidden_internal_state=true;
  if(strongThird&&any(d,['not an interpretation of anything they have actually said or done','not an interpretation of anything they said or did','outward record khong co evidence','observable behaviour gives no basis','observable behavior gives no basis','chang co dau hieu quan sat','khong co dau hieu quan sat','hanh vi ben ngoai khong cho toi bang chung','record khong co bieu hien ben ngoai']))o.observable_evidence_absent=true;

  const forecast=any(d,['forecast','future','du doan','trong vai tuan toi','vai tuan toi','eventual']);
  const beneficial=any(d,['favour','favor','co loi','huong tot','tich cuc','outcome','ket qua','ket thuc']);
  if(forecast&&beneficial){o.future_horizon_present=true;o.future_outcome_request=true;}
  return Object.freeze(o);
}
global.QCEvidenceExtractorV2T=Object.freeze({version:VERSION,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
