(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5S;if(!parent)throw new Error('V5T requires V5S');
const VERSION='QCEvidenceExtractorV5T-V213-RELATIONAL-PARAPHRASE-RECALL';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function scopeRaw(raw){return parent.scopeRaw(raw);}
function extract(raw){
 const scoped=scopeRaw(raw),d=fold(scoped),o={...parent.extract(scoped)};
 const set=(k,v)=>{if(v)o[k]=true;};

 // Delegated decision: preserve V92 gate, extend only the missing choice-object paraphrase family.
 const selector=any(d,['use your judgement','use your judgment','you choose','you select','dung phan doan cua ban','ban chon','ban chot']);
 const transfer=any(d,['rather than giving me a framework','instead of giving me a framework','rather than a framework for deciding','thay vi dua khung','thay vi cho toi khung','khong phai chi ho tro']);
 const nextChoice=any(d,['my next step','next step for me','my next move','next move for me','buoc tiep theo cho toi','buoc tiep theo cua toi','nuoc di tiep theo cho toi']);
 if(selector&&transfer&&nextChoice){o.delegated_decision=true;o.agency_transfer_explicit=true;o.choice_object_present=true;}

 // Constructed/non-lived input: add explicit disavowal-of-lived-history paraphrases.
 const nonlive=any(d,['unrelated to my lived history','unrelated to my life history','not related to my lived history','not part of my lived history','khong lien quan toi lich su song cua toi','khong lien quan den lich su song cua toi','khong lien quan toi trai nghiem song cua toi','khong lien quan den trai nghiem song cua toi']);
 set('non_lived_explicit',nonlive);

 // Third-party hidden state: extend subject + hidden-state + no-observable-basis paraphrase families.
 const third=any(d,['the supervisor','my supervisor','the manager','my manager','supervisor s','manager s','nguoi quan ly','quan ly cua toi']);
 const hidden=any(d,['concealed view','concealed opinion','hidden view','private view','privately believes','privately thinks','private belief','unspoken view','danh gia bi che giau','quan diem bi che giau','tin rieng']);
 const nobasis=any(d,['without any behavioural evidence','without any behavioral evidence','without behavioural evidence','without behavioral evidence','even though nothing observable','nothing observable in what they said or did','khong co bang chung hanh vi','khong co evidence hanh vi']);
 set('third_party_subject',third);set('hidden_internal_state',third&&hidden);set('observable_evidence_absent',third&&nobasis);

 // Prediction: extend horizon/outcome/prospective paraphrases without changing the V92 two-slot gate.
 const horizon=any(d,['next future point','next point in the future','next future horizon','moc tuong lai tiep theo','moc tuong lai ke tiep']);
 const outcome=any(d,['close positively for me','end positively for me','close in a positive direction for me','khep lai theo huong tich cuc cho toi','khep lai theo huong tich cuc','ket lai theo huong tich cuc cho toi']);
 const prospective=d.includes('?')||any(d,['will this','will it','co khep lai','co ket lai']);
 set('future_horizon_present',horizon);set('future_outcome_request',horizon&&outcome&&prospective);

 // Freeze: extend reversible-path, option-expansion and non-start paraphrases.
 const reversible=any(d,['clear way back','clear exit from the trial','clear route back','duong lui rat ro','co duong lui','duong quay lai rat ro']);
 const options=any(d,['increase options','increasing options','kept increasing options','expand options','tang option','tang them option','tang lua chon']);
 const nonstart=any(d,['did not get started','didn t get started','never got started','khong bat tay vao','chua bat tay vao']);
 set('reversible_action_available',reversible);set('option_expansion',options);set('non_start',nonstart);

 // Slow: extend bounded-delay phrasing only.
 const delay=any(d,['more time before responding','extra time before responding','more time before my response','co them thoi gian truoc phan hoi','them thoi gian truoc khi phan hoi']);
 set('bounded_delay',delay);

 // Sequence: extend approach/retreat/repetition/same-reasoning phrasing only.
 const approach=any(d,['nearing action','near action','getting near action','den gan buoc lam','den gan hanh dong','tien gan buoc lam']);
 const retreat=any(d,['backing off','backed off','pulling back','rut ra','rut lui']);
 const repeat=any(d,['returning to the same logic','returned to the same logic','xem lai dung reasoning cu','xem lai reasoning cu','quay lai dung reasoning cu']);
 const same=any(d,['same logic','same underlying logic','old reasoning','reasoning cu','dung reasoning cu']);
 set('approach_action',approach);set('retreat_action',retreat);set('repeated_cycle',repeat);set('same_reasoning',same);

 return Object.freeze(o);
}
global.QCEvidenceExtractorV5T=Object.freeze({version:VERSION,scopeRaw,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
