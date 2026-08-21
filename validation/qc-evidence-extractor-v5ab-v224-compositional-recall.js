(function(global){
'use strict';
const parent=global.QCEvidenceExtractorV5AA;if(!parent)throw new Error('V5AB requires V5AA');
const VERSION='QCEvidenceExtractorV5AB-V224-COMPOSITIONAL-RECALL';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const any=(d,a)=>a.some(x=>d.includes(x));
function scopeRaw(raw){return parent.scopeRaw(raw);}
function extract(raw){
 const scoped=scopeRaw(raw),d=fold(scoped),o={...parent.extract(scoped)};
 // Route generalization: extend evidence phrases, not sealed sentence identity.
 const clarContext=any(d,['everything material about the episode is known','all material facts are known','mọi phần quan trọng của episode đều rõ','moi phan quan trong cua episode deu ro']);
 const clarMissing=any(d,['last action i myself took','my own final action','hanh dong cuoi do chinh toi lam','hanh dong cuoi do chinh toi thuc hien']);
 if(clarContext&&clarMissing){o.v224_clarification=true;o.action_missing=true;o.self_owned_action=true;o.context_otherwise_complete=true;}
 const decisionTake=any(d,['take over the final choice','give me the option that should become mine','nhan lay final choice','dua option se tro thanh lua chon cua toi']);
 const decisionAgency=any(d,['final choice','final selection','decision for me','chon thay toi','quyet dinh thay toi']);
 if(decisionTake&&decisionAgency){o.v224_decision=true;o.delegated_decision=true;o.agency_transfer_explicit=true;}
 const hypoReal=any(d,['nothing in this example is a real event of mine','not a real event of mine','khong dieu gi trong vi du nay la event that cua toi','khong phai event that cua toi']);
 const hypoConstruct=any(d,['example','validation','test','scenario','vi du','case']);
 if(hypoReal&&hypoConstruct){o.v224_hypothetical=true;o.non_lived_explicit=true;o.constructed_input=true;}
 const thirdHidden=any(d,['concealed thought','hidden thought','secret thought','concealed belief','concealed conclusion','concealed thought cua ho','hidden thought cua ho']);
 const thirdNoEvidence=any(d,['nothing they did or said supports the inference','no action or statement supports','khong dieu ho lam hay noi support inference','khong co action hay statement support']);
 if(thirdHidden&&thirdNoEvidence){o.v224_third=true;o.third_party_only=true;}
 // Self-lived mechanism generalization.
 const lowCommit=any(d,['opening action carried little commitment','low commitment','starter move had little commitment','opening action can it commitment','starter move it commitment']);
 const optExpand=any(d,['option expansion','expanding alternatives','widening alternatives','adding possibilities','mo rong alternative','noi option','tao them possibility']);
 const notInitiated=any(d,['stopped me from initiating','never initiated','did not initiate','khong initiate','khong bat dau','chua start']);
 if(lowCommit&&optExpand&&notInitiated){o.v224_freeze=true;o.reversible_action_available=true;o.option_expansion=true;o.non_start=true;}
 const important=any(d,['main issue','something important','core problem','primary responsibility','main matter','chuyen quan trong','van de chinh','core issue']);
 const stillNeed=any(d,['still needed my response','still required action from me','still needed action from me','van can response cua toi','van can action tu toi','van can action cua toi']);
 const elsewhere=any(d,['side tasks','side work','peripheral work','occupied myself elsewhere','busiest myself elsewhere','task phu','side task','ban o cho khac','bận ở chỗ khác','ban o cho khac']);
 if(important&&stillNeed&&elsewhere){o.v224_ignore=true;o.central_responsibility=true;o.response_omitted=true;o.attention_diverted=true;o.peripheral_activity=true;}
 const bounded=any(d,['one defined limit','finite delay','bounded pause','limited pause','fixed boundary','single limited delay','mot gioi han da dinh','finite delay','bounded pause','limited pause','boundary ro']);
 const reviewOnce=any(d,['reviewed once','review once','one review','checked once','one check','review mot lan','check mot lan']);
 const answeredClosed=any(d,['answered and then closed','responded and closed','answered and did not reopen','response roi dong','tra loi roi dong','response va khong mo lai']);
 const beforeAnswer=any(d,['before answering','before i answered','truoc khi tra loi','truoc khi toi tra loi']);
 const closedAfter=any(d,['then closed the issue','closed the issue','closed the matter','treated the matter as closed','roi dong issue','dong issue','dong matter','de matter dong']);
 if(bounded&&reviewOnce&&(answeredClosed||(beforeAnswer&&closedAfter))){o.v224_slow=true;o.bounded_delay=true;o.single_review=true;o.closure_present=true;}
 const approach=any(d,['moved close to acting','got near doing it','came close to acting','moved toward execution','tien gan action','toi gan viec lam no','gan act']);
 const retreat=any(d,['pulled back','stepped away','withdrew','retreated','pull back','buoc ra','withdraw']);
 const repeatSame=any(d,['returned to the same judgement','cycled back to the identical judgement','same conclusion','same judgement','quay lai cung judgement','cycle ve judgement giong het','cung conclusion']);
 const noNew=any(d,['without new facts','without new information','facts stayed the same','no new evidence','khong co fact moi','khong co information moi','facts giu nguyen']);
 if(approach&&retreat&&repeatSame&&noNew){o.v224_sequence=true;o.approach_action=true;o.retreat_action=true;o.repeated_cycle=true;o.same_reasoning=true;o.no_new_information=true;}
 const own=any(d,['ownership of the choice stayed with me','choice stayed with me','ownership remained with me','ownership cua choice o toi','choice van o toi']);
 const complete=any(d,['through completion','completed the action','carried it through','den completion','hoan thanh action']);
 const closed=any(d,['left it closed','left the matter closed','did not reopen','de no dong','khong mo lai']);
 if(own&&complete&&closed){o.v224_neutral=true;o.self_ownership_retained=true;o.execution_completed=true;o.closure_present=true;}
 return Object.freeze(o);
}
global.QCEvidenceExtractorV5AB=Object.freeze({version:VERSION,scopeRaw,extract});
})(typeof globalThis!=='undefined'?globalThis:this);
