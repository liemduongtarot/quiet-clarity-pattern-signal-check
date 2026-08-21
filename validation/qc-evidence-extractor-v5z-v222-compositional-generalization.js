(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5Y;if(!parent)throw new Error('V5Z requires V5Y');
const VERSION='QCEvidenceExtractorV5Z-V222-COMPOSITIONAL-GENERALIZATION';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function scopeRaw(raw){return parent.scopeRaw(raw);}
function extract(raw){
 const scoped=scopeRaw(raw),d=fold(scoped),o={...parent.extract(scoped)};
 // Prediction = explicit future boundary + requested future outcome. Requires both components.
 const future=any(d,['future point','future milestone','future cutoff','future marker','future boundary','specified date','named future','stated future','diem tuong lai','future milestone','cutoff tuong lai','future marker','ngay da xac dinh','ranh gioi tuong lai']);
 const outcome=any(d,['result i want','outcome i want','way i hope','preferred direction','desired outcome','get the result','ket qua toi muon','outcome co di theo','huong toi muon','ket qua toi dang mong','desired outcome cua toi','result minh muon']);
 const predictiveQuestion=(d.includes('?')||any(d,['will this','will the','am i going to','co ket thuc','co di theo','co giai quyet','co xay ra','co khep lai','co nhan duoc']));
 if(future&&outcome&&predictiveQuestion){o.future_horizon_present=true;o.future_outcome_request=true;o.v222_prediction_compositional=true;}
 // Ignore = consequential/core obligation still needs self-response + attention diverted to side/peripheral work.
 const central=any(d,['core issue','main responsibility','consequential matter','central obligation','main problem','primary matter','trach nhiem chinh','consequential matter','nghia vu trung tam','van de chinh','primary matter']);
 const needed=any(d,['required my response','action was needed','still needed','waiting','needed something from me','can response cua toi','action cua toi can','cho response','can dieu gi do tu toi']);
 const diverted=any(d,['peripheral work','side tasks','secondary activity','less relevant work','occupied myself elsewhere','side activity','peripheral work','side task','hoat dong thu yeu','cong viec it lien quan','task khong xu ly','side activity']);
 if(central&&needed&&diverted){o.attention_diverted=true;o.response_omitted=true;o.central_responsibility=true;o.peripheral_activity=true;o.v222_ignore_compositional=true;}
 // Sequence = approach toward action + retreat/reversal + same judgement/reasoning + no new facts/evidence.
 const approach=any(d,['moved toward the action','approached execution','nearly acted','advanced toward the practical step','got close to doing it','approached the move','tien ve phia hanh dong','tiep can execution','gan hanh dong','tien toi practical step','toi gan viec lam','tiep can nuoc di']);
 const retreat=any(d,['backed away','withdrew','retreated','reversed course','pulled back','stepped away','lui lai','withdraw','retreat','doi huong','pull back','buoc ra']);
 const same=any(d,['same judgement','identical reasoning','same conclusion','old assessment','same judgement','same conclusion','cung judgement','reasoning cu','cung conclusion','assessment cu']);
 const noNew=any(d,['facts had not changed','without receiving new information','evidence stayed the same','no new facts','nothing new appeared','unchanged evidence','facts khong doi','khong co information moi','evidence van nhu cu','khong co fact moi','khong co gi moi','evidence khong doi']);
 if(approach&&retreat&&same&&noNew){o.approach_action=true;o.retreat_action=true;o.repeated_cycle=true;o.same_reasoning=true;o.no_new_information=true;o.v222_sequence_compositional=true;}
 // Slow = explicitly bounded pause/delay + single review/check + actual response/closure. Excludes sequence by precedence in V99.
 const bounded=any(d,['bounded interval','single defined delay','limited pause','fixed boundary','contained interval','finite pause','interval co gioi han','delay xac dinh','pause gioi han','fixed boundary','contained interval','pause huu han']);
 const single=any(d,['checked the point once','reviewed one time','one check','reviewed once','one pass','looked once','kiem dung mot lan','review mot lan','mot lan check','xem lai mot lan','lam mot pass','nhin lai mot lan']);
 const closed=any(d,['answered','responding','responded','treated the matter as complete','closed the review','did not reopen','stopped checking','gave my response','tra loi','response','matter da hoan tat','khong mo lai','ngung kiem','dua response','issue dong']);
 if(bounded&&single&&closed){o.bounded_delay=true;o.single_review=true;o.closure_present=true;o.v222_slow_compositional=true;}
 return Object.freeze(o);
}
global.QCEvidenceExtractorV5Z=Object.freeze({version:VERSION,scopeRaw,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
