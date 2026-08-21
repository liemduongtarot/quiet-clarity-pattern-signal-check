(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5T;if(!parent)throw new Error('V5U requires V5T');
const VERSION='QCEvidenceExtractorV5U-V214-SEALED-RECALL';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function scopeRaw(raw){return parent.scopeRaw(raw);}
function extract(raw){
 const scoped=scopeRaw(raw),d=fold(scoped),o={...parent.extract(scoped)};
 const set=(k,v)=>{if(v)o[k]=true;};

 // Clarification: additive recall for ownership + omission constructions seen in the frozen V213 family.
 const action=any(d,['action','response','behaviour','behavior','move','step','hanh dong','phan ung','hanh vi','nuoc di','buoc']);
 const own=any(d,['action that was mine','action was mine','mine to make','personally observable response','my personally observable response','my own visible move','my own concrete behaviour','my own concrete behavior','nuoc di nhin thay duoc cua toi','hanh dong nao thuc su den tu toi','phan ung quan sat duoc do chinh toi','hanh vi cu the cua chinh toi','hanh dong thuoc ve toi']);
 const missing=any(d,['apart from the action','leaves out the observable response','remains unstated','has not been identified','never identifies the action','without specifying what i actually did','chua duoc xac dinh','khong xac dinh hanh dong','van chua duoc neu','con vang','van thieu']);
 const endpoint=any(d,['at the end','before closure','when it finished','stopping point','endpoint','closure','doan cuoi','truoc khi khep lai','luc chuyen ket thuc','diem dung','endpoint']);
 set('self_owned_action',action&&own); set('action_missing',action&&own&&missing); set('endpoint_present',endpoint);

 // Delegated decision: explicit selection on behalf + replacement of self agency.
 const selector=any(d,['you choose','you select','pick the option','choose the path','choose my next','ban chon','hay chon','chon con duong','chon phuong an','chot thay toi']);
 const choice=any(d,['path i should take','course i should adopt','option i should follow','my next move','my next step','con duong toi nen di','huong toi nen chon','phuong an toi phai theo','nuoc di ke tiep','buoc tiep theo']);
 const transfer=any(d,['replace the decision i would make myself','replace my decision','in my place','on my behalf','take over the choice','handing over the final selection','thay the quyet dinh toi tu dua ra','thay the quyet dinh cua toi','o vi tri cua toi','nhan danh toi','giao quyen chon cuoi','tiep quan lua chon']);
 if(selector&&choice&&transfer){o.delegated_decision=true;o.agency_transfer_explicit=true;o.choice_object_present=true;}

 // Third-party hidden state: require all three evidence dimensions; aliases remain relationally bounded.
 const third=any(d,['supervisor','manager','my manager','my supervisor','colleague','client','customer','quan ly','supervisor','dong nghiep','khach hang','nguoi kia']);
 const hidden=any(d,['hidden view','concealed opinion','privately thinks','privately believes','secretly believes','hidden belief','private conclusion','goc nhin an','quan diem an','tin tham','tin rieng','danh gia chua noi','phan doan noi tam']);
 const nobasis=any(d,['without behavioural evidence','without behavioral evidence','no behavioural evidence','no behavioral evidence','absence of behavioural evidence','absence of behavioral evidence','nothing observable in their words or actions','nothing they said or did','no outward sign','thieu cue hanh vi','khong co cue hanh vi','khong co bang chung hanh vi','khong co gi ho noi hay lam','khong co dau hieu ben ngoai','khong co can cu quan sat']);
 set('third_party_subject',third); set('hidden_internal_state',third&&hidden); set('observable_evidence_absent',third&&nobasis);

 // Prediction: explicit future horizon + prospective favourable/unfavourable result.
 const horizon=any(d,['next future horizon','next future point','upcoming horizon','coming deadline','next future checkpoint','moc tuong lai duoc neu tiep theo','moc tuong lai tiep theo','checkpoint tuong lai','deadline sap den','horizon sap toi']);
 const outcome=any(d,['finish in my favour','end in my favour','close positively for me','resolve positively for me','favourable to me','favorable to me','ket thuc co loi cho toi','khep lai co loi cho toi','giai quyet tich cuc cho toi','tro nen co loi cho toi','theo huong tot cho toi']);
 const prospective=d.includes('?')||any(d,['will this','will the matter','will the final','co ket thuc','co khep lai','co giai quyet','co tro nen']);
 set('future_horizon_present',horizon); set('future_outcome_request',horizon&&outcome&&prospective);

 // Freeze: bounded reversible + expanding alternatives + non-start.
 const reversible=any(d,['low-commitment','low commitment','reversible trial','reversible action','easy to reverse','clear route back','easy exit','would not lock me in','it cam ket','co the dao nguoc','de hoan tac','duong quay lai','duong lui','khong khoa toi']);
 const options=any(d,['widened the alternatives','widened alternatives','adding choices','broadening choices','expanded the option','increasing options','researching alternatives','mo rong phuong an','them lua chon','tang lua chon','nghien cuu them phuong an','mo rong option']);
 const nonstart=any(d,['instead of beginning','never got started','left it unstarted','did not take the opening step','never began','chua bat tay','khong bat dau','chua khoi dong','khong di buoc dau','thay vi khoi dong']);
 set('reversible_action_available',reversible); set('option_expansion',options); set('non_start',nonstart);

 // Ignore: central obligation still waiting + attention diverted to peripheral activity.
 const central=any(d,['central responsibility','main responsibility','primary responsibility','main obligation','core request','main issue','trach nhiem chinh','trach nhiem trung tam','nghia vu chinh','yeu cau cot loi','van de trung tam']);
 const pending=any(d,['waiting for my reply','waiting on me','still required my action','remained unanswered','remained open','dang cho toi','dang cho phan hoi','van can hanh dong cua toi','chua duoc tra loi','con mo']);
 const diversion=any(d,['focused on minor surrounding tasks','occupied myself with peripheral','redirected effort into secondary','attention moved to lower-impact','shifted into peripheral','tap trung vao viec nho xung quanh','lam minh ban voi task ben le','chuyen suc sang cong viec thu yeu','chuyen chu y sang cong viec kem quan trong','chuyen sang hoat dong ben le']);
 const peripheral=any(d,['minor surrounding','peripheral','secondary work','lower-impact','side activity','viec nho xung quanh','task ben le','cong viec thu yeu','hoat dong ben le','viec phu']);
 set('central_responsibility',central); set('response_omitted',central&&pending); set('attention_diverted',central&&diversion); set('peripheral_activity',peripheral);

 // Slow: bounded delay aliases only; single-review + closure gates remain unchanged in V94.
 const delay=any(d,['after a longer pause','responded after a longer pause','longer pause before replying','more time than normal before replying','bounded delay before my response','sau mot khoang dung dai hon','mat nhieu thoi gian hon binh thuong','khoang cham huu han','dung lau hon binh thuong']);
 set('bounded_delay',delay);

 // Sequence: broaden relational wording while preserving the V93 requirement of approach+retreat+>=2 repetition/no-new slots.
 const approach=any(d,['approached the practical step','advanced toward doing it','neared the step','near implementation','moved close to action','den gan trien khai','den sat buoc lam','tien ve phia thuc hien','tiep can buoc thuc te','tien gan hanh dong']);
 const retreat=any(d,['withdrew','retreated','backed off','pulled back','stepped away','buoc ra','rut ra','rut lui','lui lai','keo ra']);
 const repeat=any(d,['revisited the same conclusion','came back to the same assessment','returned to the same reasoning','repeated the same review','cycled through the same','lap lai cung luot review','quay lai cung reasoning','tro lai cung danh gia','xem lai cung ket luan','lap cung logic']);
 const same=any(d,['same conclusion','same assessment','same reasoning','same review','same logic','cung luot review','cung reasoning','cung danh gia','cung ket luan','cung logic']);
 const nonew=any(d,['nothing factual changed','no fresh facts','without new information','inputs had not changed','evidence stayed unchanged','evidence khong doi','facts khong doi','khong co thong tin moi','input khong thay doi','khong co facts moi']);
 set('approach_action',approach); set('retreat_action',retreat); set('repeated_cycle',repeat); set('same_reasoning',same); set('no_new_information',nonew);

 return Object.freeze(o);
}
global.QCEvidenceExtractorV5U=Object.freeze({version:VERSION,scopeRaw,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
