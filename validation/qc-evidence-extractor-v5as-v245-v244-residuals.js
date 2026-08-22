(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5AR;if(!parent)throw new Error('V5AS requires V5AR');
const VERSION='QCEvidenceExtractorV5AS-V245-V244-RESIDUALS';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s\'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function scopeRaw(raw){return parent.scopeRaw(raw);}
function isolate(raw){return parent.isolate?parent.isolate(raw):String(raw||'');}
function extract(raw){
 const o={...parent.extract(raw)};
 const d=fold(scopeRaw(raw));
 const clGap=any(d,['everything is autobiographical except the response i made at closure','real context yet i have not stated what i actually did at the end','actual circumstances but i have not supplied my last behavioural move','chuyen nay that su da xay ra nhung toi van chua noi hanh dong cu the cuoi cung','phan toi da lam gi o cuoi van con thieu','response toi da lam o doan ket']);
 if(clGap)o.v245_clarification=true;
 const thMind=any(d,['someone else s internal conclusion','someone else’s internal conclusion','concealed belief','hidden thought','privately believes','private position','secret view','ket luan ben trong cua nguoi khac','concealed belief cua ho']);
 const thNo=any(d,['no behavioural support','no behavior to verify it','no behaviour to verify it','without observable evidence','nothing they did confirms it','no words or actions establish it','without outward evidence','khong co behavioural support','khong co behaviour de verify','khong co evidence quan sat']);
 if(thMind&&thNo)o.v245_third=true;
 const frStart=any(d,['bounded opening move','contained starter','reversible first step','low-risk start','easy-to-reverse first action','small safe start','opening move gioi han','starter co gioi han','buoc dau reversible','buoc low-risk','first action de dao nguoc']);
 const frGrow=any(d,['expanding options','compared more alternatives','generated extra possibilities','widened the choice set','kept adding routes','option growth','mo rong option','so them alternative','tao them possibility','mo rong choice set','them route']);
 const frNo=any(d,['did not begin','stayed still','rather than acting','made no move','replaced initiation','khong bat dau','dung yen','thay vi hanh dong','khong lam gi','thay cho initiation']);
 if(frStart&&frGrow&&frNo)o.v245_freeze=true;
 const igNeed=any(d,['main matter still needed my action','central responsibility remained open','important issue required my response','my action was still needed on the core problem','primary task remained unanswered','something important needed me to act','viec chinh van can toi hanh dong','trach nhiem trung tam van mo','chuyen quan trong can response cua toi','core problem van can hanh dong cua toi','primary task van chua duoc tra loi','viec quan trong can toi lam']);
 const igSide=any(d,['diverted effort into secondary tasks','busy with side work','peripheral activity','shifted attention elsewhere','worked on things that could not resolve it','doing less relevant work instead','chuyen effort sang task thu yeu','ban voi side work','hoat dong ben le','chuyen attention sang cho khac','lam nhung viec khong the giai quyet','lam viec it lien quan hon']);
 if(igNeed&&igSide)o.v245_ignore=true;
 const slPause=any(d,['one bounded pause','within a clear limit','one contained interval','inside a defined boundary','finite delay','one limited pause','pause gioi han','delay trong boundary ro','interval huu han','gioi han da dinh']);
 const slReview=any(d,['checked once','reviewed once','one check','one review','checked one time','check mot lan','review mot lan']);
 const slClose=any(d,['closed the issue','moved on','stopped revisiting it','closed it','did not reopen the matter','treated it as settled','dong chuyen lai','di tiep','khong quay lai nua','khong reopen','xem chuyen da settled']);
 if(slPause&&slReview&&slClose)o.v245_slow=true;
 const sqNear=any(d,['came near to acting','moved toward acting','nearly acted','approached the move','got close to execution','advanced toward action','tien gan toi hanh dong','gan lam','tien toi move','gan execute']);
 const sqBack=any(d,['stepped back','pulled back','withdrew','retreated','backed away','reversed course','lui lai','rut lai','retreat','doi chieu']);
 const sqSame=any(d,['returned to prior reasoning','returned to the same conclusion','repeated the old judgement','cycled back to the same reasoning','revisited the same assessment','repeated the same conclusion','quay lai reasoning truoc','quay ve cung ket luan','lap judgement cu','cycle ve cung reasoning','revisit cung assessment']);
 const sqNoNew=any(d,['no new information','without new facts','nothing changed','no new evidence','unchanged information','without added facts','khong co information moi','khong co fact moi','khong gi thay doi','khong co evidence moi']);
 if(sqNear&&sqBack&&sqSame&&sqNoNew)o.v245_sequence=true;
 const nOwn=any(d,['kept the final choice','made the decision myself','final call remained mine','chose for myself','retained deciding authority','choice stayed with me','giu quyen chon cuoi','tu quyet dinh','final call van la cua toi','tu chon','giu deciding authority','choice van o phia toi']);
 const nDone=any(d,['carried it out','completed it','through execution','finished the action','acted on it','executed it','thuc hien xong','hoan tat','qua execution','lam xong','hanh dong theo no','execute']);
 const nClose=any(d,['left the matter settled','did not reopen it','moved on','treated the issue as closed','left the matter resolved','did not revisit the decision','de chuyen ket thuc','khong reopen','di tiep','xem chuyen da closed','de chuyen resolved','khong revisit quyet dinh']);
 if(nOwn&&nDone&&nClose)o.v245_neutral=true;
 return Object.freeze(o);
}
global.QCEvidenceExtractorV5AS=Object.freeze({version:VERSION,scopeRaw,isolate,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
