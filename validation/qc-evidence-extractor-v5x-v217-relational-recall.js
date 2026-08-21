(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5W;if(!parent)throw new Error('V5X requires V5W');
const VERSION='QCEvidenceExtractorV5X-V217-RELATIONAL-RECALL';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function scopeRaw(raw){return parent.scopeRaw(raw);}
function extract(raw){
 const scoped=scopeRaw(raw),d=fold(scoped),o={...parent.extract(scoped)};
 // Clarification VI: complete real context + one remaining own concrete action at closure.
 const cComplete=any(d,['toan bo boi canh thuc te da co','boi canh thuc te da day du']);
 const cGap=any(d,['khoang trong con lai','phan con lai chua neu']);
 const cOwn=any(d,['hanh dong cu the cua toi','phan ung cu the cua toi']);
 const cEnd=any(d,['truoc khi su viec khep lai','truoc luc su viec khep lai']);
 if(cComplete)o.context_otherwise_complete=true;
 if(cGap&&cOwn){o.self_owned_action=true;o.action_missing=true;}
 if(cEnd)o.endpoint_present=true;
 // Third-party hidden state EN/VI: another person's secret belief with no outward-behaviour basis.
 const third=any(d,['someone else secretly believes','someone else believes secretly','what someone else secretly believes','nguoi khac am tham tin gi','nguoi khac dang am tham tin gi']);
 const hidden=any(d,['secretly believes','secret belief','am tham tin','tin gi trong dau']);
 const noBasis=any(d,['no outward behaviour that could establish it','without outward behaviour that could establish it','no outward behavior that could establish it','khong dua ra hanh vi ben ngoai nao co the lam can cu','khong co hanh vi ben ngoai nao lam can cu']);
 if(third){o.third_party_subject=true;if(hidden)o.hidden_internal_state=true;if(noBasis)o.observable_evidence_absent=true;}
 // Prediction VI: stated future boundary + desired closing result.
 const horizon=any(d,['ranh gioi tuong lai da neu','khi ranh gioi tuong lai da neu toi','moc tuong lai da neu']);
 const outcome=any(d,['khep lai bang ket qua toi muon','ket thuc bang ket qua toi muon','bang ket qua toi muon']);
 if(horizon)o.future_horizon_present=true;
 if(horizon&&outcome&&(d.includes('?')||d.includes('co khep lai')||d.includes('co ket thuc')))o.future_outcome_request=true;
 // Freeze EN: reversible low-stakes opening + expanding alternatives + never-started trial.
 const reversible=any(d,['reversible low-stakes opening move','reversible low stakes opening move','low-stakes reversible opening move']);
 const options=any(d,['kept expanding alternatives','expanding alternatives']);
 const nonstart=any(d,['never started the trial','did not start the trial']);
 if(reversible)o.reversible_action_available=true;if(options)o.option_expansion=true;if(nonstart)o.non_start=true;
 // Slow EN/VI: one limited interval + one review pass + finished process.
 const delay=any(d,['one limited interval before answering','used one limited interval before answering','mot khoang thoi gian gioi han truoc khi dap','khoang thoi gian gioi han truoc khi dap']);
 const one=any(d,['made one review pass','one review pass','review mot pass','review dung mot pass']);
 const closed=any(d,['treated the matter as finished','matter as finished','xem viec nay da ket thuc','xem viec nay da hoan tat']);
 if(delay)o.bounded_delay=true;if(one)o.single_review=true;if(closed)o.closure_present=true;
 // Sequence EN: near action -> backed away -> same judgement -> no new facts.
 if(any(d,['moved near taking action','near taking action']))o.approach_action=true;
 if(any(d,['backed away','backed away from action']))o.retreat_action=true;
 if(any(d,['returned to the same judgement','same judgement'])){o.repeated_cycle=true;o.same_reasoning=true;}
 if(any(d,['no new facts appeared','no new facts']))o.no_new_information=true;
 // Neutral VI: final agency retained + action completed + issue not reopened.
 if(any(d,['quyen chot cuoi van thuoc ve toi','quyen quyet dinh cuoi van thuoc ve toi']))o.self_ownership_retained=true;
 if(any(d,['lam xong hanh dong','hoan tat hanh dong']))o.execution_completed=true;
 if(any(d,['khong mo lai chuyen do sau do','khong mo lai van de sau do']))o.closure_present=true;
 return Object.freeze(o);
}
global.QCEvidenceExtractorV5X=Object.freeze({version:VERSION,scopeRaw,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
