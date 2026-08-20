(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV2;if(!parent)throw new Error('QCEvidenceExtractorV2R requires V2');
const VERSION='QCEvidenceExtractorV2R-V210-MULTILINGUAL-RELATIONAL-ALIASES';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function extract(raw){const d=fold(raw),o={...parent.extract(raw)};
  if((any(d,['what i personally did','my own action','phan ung cua toi','hanh dong cua toi','toi da lam'])&&any(d,['chua duoc stated','not supplied','unstated','missing','absent'])))o.action_missing=true;
  const choice=any(d,['choice','decision','path','option','route','lua chon','quyet dinh','phuong an','huong']);
  const transfer=any(d,['instead of leaving the decision with me','own the final choice','take the choice out of my hands','on my behalf','thay toi','quyet dinh ho','chon ho']);
  if(choice&&transfer){o.delegated_decision=true;o.agency_transfer_explicit=true;}
  if(any(d,['did not happen to me','didn t happen to me','not happen to me','khong xay ra voi toi','khong phai chuyen xay ra voi toi'])&&any(d,['constructed','synthetic','stress-test','stress test','validation','practice','classifier','case']))o.non_lived_explicit=true;
  if(any(d,['khong phai dien giai tu dieu ho da noi hay lam','khong phai dien giai tu nhung gi ho da noi hay lam','not an interpretation of what they said or did','not an interpretation of anything they said or did']))o.observable_evidence_absent=true;
  if(any(d,['kept expanding options','expanding options','comparison them','comparison mode','so sanh them','so them','them lua chon','them phuong an']))o.option_expansion=true;
  if(any(d,['chua start','khong start','not begin','not started','did not begin','khong begin','chua begin','chua bat dau']))o.non_start=true;
  if(any(d,['can response','can phan hoi','need response','needs response','required response','requires response'])&&any(d,['main responsibility','core request','trach nhiem','yeu cau','viec chinh']))o.response_omitted=true;
  if(any(d,['xem viec do da xong','xem viec da xong','coi viec da xong','regarded it as finished','treated it as finished']))o.closure_present=true;
  if(any(d,['checked one thing','checked one point','kiem mot diem','kiem tra mot diem','xac minh mot diem']))o.single_review=true;
  if(any(d,['roi thoi','roi dung lai','sau do thoi','then stopped','then backed off'])&&any(d,['hanh dong','action','act','lam']))o.retreat_action=true;
  return Object.freeze(o);
}
global.QCEvidenceExtractorV2R=Object.freeze({version:VERSION,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
