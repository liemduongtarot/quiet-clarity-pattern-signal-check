(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5AB;if(!parent)throw new Error('V5AC requires V5AB');
const VERSION='QCEvidenceExtractorV5AC-V225-RESIDUAL-COMPOSITION';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function scopeRaw(raw){return parent.scopeRaw(raw);}
function extract(raw){
 const scoped=scopeRaw(raw),d=fold(scoped),o={...parent.extract(scoped)};
 const clarReal=any(d,['case is real','this really happened','episode is real','case la that','chuyen nay la that','episode la that']);
 const clarComplete=any(d,['otherwise complete','setting and sequence','surrounding facts','cac phan khac da du','boi canh da du','setting va sequence']);
 const clarMissing=any(d,['what i did myself','observable action i personally took','my own closing action','viec chinh toi lam','hanh dong chinh toi','observable action cua toi']);
 const clarEnd=any(d,['immediately before the end','at the end','closing action','before the end','ngay truoc diem ket thuc','o cuoi','truoc diem ket thuc']);
 if(clarReal&&clarComplete&&clarMissing&&clarEnd){o.v225_clarification=true;o.context_otherwise_complete=true;o.action_missing=true;o.self_owned_action=true;}
 const decReplace=any(d,['replace my own final decision','replace my final decision','your choice to replace my own','choice cua ban thay cho final decision','choice cua ban thay final decision']);
 const decSecond=any(d,['your choice','your decision','choice cua ban','decision cua ban']);
 if(decReplace&&decSecond){o.v225_decision=true;o.delegated_decision=true;o.agency_transfer_explicit=true;}
 const hypoFabricated=any(d,['deliberately fabricated','solely as synthetic validation material','fabricated validation','co y fabricate','synthetic validation material']);
 const hypoNotLived=any(d,['not lived history','not something i lived through','not lived','khong phai lived history','khong phai dieu toi da trai qua']);
 if(hypoFabricated&&hypoNotLived){o.v225_hypothetical=true;o.non_lived_explicit=true;o.constructed_input=true;}
 const thirdHidden=any(d,['concealed conclusion','private belief','hidden conclusion','concealed thought','private conclusion']);
 const thirdNoObs=any(d,['no action or statement','no observable behaviour or statement','nothing they did or said','khong action hay statement','khong co hanh vi hay statement','khong dieu ho lam hay noi']);
 const thirdProof=any(d,['demonstrates it','establishes it','supports the inference','chung minh','xac lap','support inference']);
 if(thirdHidden&&thirdNoObs&&thirdProof){o.v225_third=true;o.third_party_only=true;}
 const freezeMove=any(d,['small reversible move','opening move was reversible','reversible move','opening move reversible','buoc nho reversible','move reversible']);
 const freezeExpand=any(d,['enlarging the set of alternatives','expanded the option set','option set','set of alternatives','noi option set','mo rong option set']);
 const freezeNoStart=any(d,['never initiated','remained inactive','still inactive','khong initiate','van inactive','khong bat dau']);
 if(freezeMove&&freezeExpand&&freezeNoStart){o.v225_freeze=true;o.reversible_action_available=true;o.option_expansion=true;o.non_start=true;}
 const slowBound=any(d,['bounded pause','clear boundary','inside a clear boundary','boundary ro','trong boundary ro','gioi han ro']);
 const slowOnce=any(d,['reviewed once','checked once','check mot lan','review mot lan']);
 const slowRespond=any(d,['after responding','responded','response roi','tra loi']);
 const slowStop=any(d,['closed the issue','stopped the review cycle','dung review cycle','dong issue','closed the matter']);
 if(slowBound&&slowOnce&&slowRespond&&slowStop){o.v225_slow=true;o.bounded_delay=true;o.single_review=true;o.closure_present=true;}
 const seqApproach=any(d,['moved toward execution','moved toward the action','toward execution','tien ve execution','tien ve action']);
 const seqRetreat=any(d,['pulled back','withdrew','pull back','withdraw']);
 const seqRepeat=any(d,['repeated my prior conclusion','returned to the same judgement','prior conclusion','same judgement','lap prior conclusion','quay lai cung judgement']);
 const seqNoNew=any(d,['without new evidence','no new facts','khong co evidence moi','khong co fact moi']);
 if(seqApproach&&seqRetreat&&seqRepeat&&seqNoNew){o.v225_sequence=true;o.approach_action=true;o.retreat_action=true;o.repeated_cycle=true;o.same_reasoning=true;o.no_new_information=true;}
 const neutralOwn=any(d,['kept the final decision with me','decided for myself','final decision with me','tu quyet','quyet dinh cuoi o toi']);
 const neutralDone=any(d,['completed the action','completed what i chose','hoan thanh action','hoan thanh dieu da chon']);
 const neutralClosed=any(d,['left the issue closed','did not revisit it','de issue dong','khong revisit']);
 if(neutralOwn&&neutralDone&&neutralClosed){o.v225_neutral=true;o.self_ownership_retained=true;o.execution_completed=true;o.closure_present=true;}
 return Object.freeze(o);
}
global.QCEvidenceExtractorV5AC=Object.freeze({version:VERSION,scopeRaw,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
