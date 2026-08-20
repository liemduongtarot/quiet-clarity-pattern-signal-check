(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV2R;if(!parent)throw new Error('QCEvidenceExtractorV2S requires V2R');
const VERSION='QCEvidenceExtractorV2S-V210-CONTEXT-SANITIZER';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function extract(raw){const d=fold(raw),o={...parent.extract(raw)};
 const role=any(d,['supervisor','manager','customer','client','colleague','other person','coworker','boss','quan ly','khach hang','dong nghiep','nguoi kia','nguoi do']);
 const englishPron=/\b(they|their|them)\b/.test(d);
 const viPron=/\bho\b(?=.{0,80}\b(nghi|danh gia|quan diem|y dinh|cam thay|muon|giu|noi tam|bi mat|giau)\b)/.test(d);
 const strongThird=role||englishPron||viPron;
 const strongMental=any(d,['private view','private conclusion','hidden conclusion','internal judgement','internal judgment','internal opinion','secret intention','secretly intends','unspoken judgement','unspoken judgment','concealed opinion','concealed intention','keeps to themselves','what they think','what they want','quan diem kin','ket luan noi tam','danh gia ben trong','danh gia kin','y dinh bi mat','y dinh an','nghi gi','cam thay gi','giu rieng','giu ben trong','giau ben trong']);
 const strongNoBasis=any(d,['no evidence','nothing observable','no outward evidence','no outward sign','no behavioural basis','no behavioral basis','gives me no evidence','no basis for knowing','never been expressed or shown','not an interpretation of what they said or did','not an interpretation of anything they said or did','khong co bang chung','khong co dau hieu','khong co can cu hanh vi','khong co bieu hien ben ngoai','khong co hanh vi quan sat','khong phai dien giai tu dieu ho da noi hay lam','record hien co khong chua bieu hien']);
 // Replace inherited third-party slots with context-safe versions when a complete strong third-party relation is absent.
 o.third_party_subject=!!strongThird;
 o.hidden_internal_state=!!(strongThird&&strongMental);
 o.observable_evidence_absent=!!(strongThird&&strongNoBasis);

 const explicitTransfer=any(d,['on my behalf','instead of me','in my place','out of my hands','substitute your decision for mine','replace my decision','replace my own decision','take over the choice','take over my choice','own the final choice','own final call','make the call for me','make this call on my behalf','thay toi','quyet dinh ho','quyet dinh thay toi','chon ho','lua chon thay toi','lay quyen lua chon khoi toi','thay cho quyet dinh cua toi','nam phan quyet dinh cuoi']);
 const chooseForMe=(any(d,['choose','pick','select','chon'])&&any(d,['for me','cho toi']));
 const strongTransfer=explicitTransfer||chooseForMe;
 const decisionVerb=any(d,['choose','pick','select','make the call','own final call','quyet dinh','chon','lua chon']);
 const choiceObj=any(d,['option','path','route','course','action','next step','choice','alternative','phuong an','huong','con duong','hanh dong','buoc tiep theo','lua chon']);
 const delegationNeg=!!o.delegation_negated;
 o.agency_transfer_explicit=!!(strongTransfer&&!delegationNeg);
 o.delegated_decision=!!(strongTransfer&&decisionVerb&&!delegationNeg);
 if(choiceObj)o.choice_object_present=true;
 return Object.freeze(o);
}
global.QCEvidenceExtractorV2S=Object.freeze({version:VERSION,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
