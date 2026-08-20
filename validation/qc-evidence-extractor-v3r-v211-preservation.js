(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV3;if(!parent)throw new Error('QCEvidenceExtractorV3R requires V3');
const VERSION='QCEvidenceExtractorV3R-V211-PRESERVATION';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function extract(raw){const scoped=parent.scopeRaw(raw),d=fold(scoped),o={...parent.extract(raw)};
 // Clarification: relational omission may be expressed as an "except for" gap rather than a missing/absent token.
 const ownResponse=any(d,['response that actually came from me','response that came from me','my own response','phan ung cua toi','phan hoi cua toi']);
 const exceptGap=any(d,['except for','except the','ngoai tru','chi thieu','con thieu']);
 const endpoint=any(d,['at the end','at the final','when it ended','khi ket thuc','luc cuoi','diem ket']);
 if(ownResponse){o.self_owned_action=true;if(exceptGap)o.action_missing=true;if(endpoint)o.endpoint_present=true;}
 if(any(d,['reconstruct the whole episode','reconstruct the whole','co the dung lai toan bo']))o.context_otherwise_complete=true;

 // Hypothetical: classifier/testing language plus explicit rejection of lived-history framing.
 const classifierTest=any(d,['try the classifier','test the classifier','thu classifier','de thu classifier','kiem classifier','scenario nay chi de thu','scenario only to test']);
 const nonHistory=any(d,['should not be understood as my lived history','should not be read as my lived history','not my lived history','khong nen duoc hieu la lich su song cua toi','khong nen hieu la lich su song cua toi','khong phai lich su song cua toi']);
 if(classifierTest){o.constructed_input=true;o.test_or_practice_context=true;}
 if(nonHistory)o.non_lived_explicit=true;

 // Ignore: central required action + self-diversion to minor tasks + explicit non-response.
 const central=any(d,['central item','central matter','main item','core item','viec trung tam','muc trung tam']);
 const minor=any(d,['minor tasks','minor work','side tasks','viec nho','viec phu']);
 const occupied=any(d,['occupied myself with','kept myself occupied with','distracted myself with','ban than minh voi','tu lam minh ban voi']);
 const noAnswer=any(d,['did not answer it','did not respond to it','never answered it','khong tra loi no','khong phan hoi no']);
 if(central)o.central_responsibility=true;
 if(minor)o.peripheral_activity=true;
 if(minor&&occupied)o.attention_diverted=true;
 if(noAnswer)o.response_omitted=true;

 // Sequence: approach + retreat + same judgement + unchanged facts can imply repetition even without an explicit "again" token.
 const approach=any(d,['tien toi thuc hien','tien den thuc hien','moved toward execution','moved toward acting']);
 const retreat=any(d,['rut lui','rut lai','pulled back','retreated']);
 const sameJudgement=any(d,['cung mot phan doan','same judgement','same judgment','same assessment']);
 const unchanged=any(d,['du kien giu nguyen','du kien khong doi','facts unchanged','evidence unchanged']);
 if(approach)o.approach_action=true;
 if(retreat)o.retreat_action=true;
 if(sameJudgement)o.same_reasoning=true;
 if(unchanged)o.no_new_information=true;
 if(approach&&retreat&&sameJudgement)o.repeated_cycle=true;
 return Object.freeze(o);
}
global.QCEvidenceExtractorV3R=Object.freeze({version:VERSION,scopeRaw:parent.scopeRaw,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
