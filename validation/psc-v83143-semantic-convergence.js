(function(global){
'use strict';
const parent=global.QCSemanticCoreV11;
if(!parent)throw new Error('V8.3.143 requires V8.3.142 semantic authority');
const VERSION='V8.3.143-SEALED-BATCH-A-CONVERGENCE';
const metadata=Object.freeze({version:VERSION,parent:'V8.3.142 FAILED REVIEW CANDIDATE',classification:'LEVEL-1 ROUTE/FAMILY CONVERGENCE REPAIR',source_failures:'V8.3.142 immutable Batch A first-run 15 failures',production_authorized:false,production_lock:'prohibited',sealed_validation:'not-authorized',step_111:'prohibited'});
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘]/g,"'").toLowerCase().replace(/\s+/g,' ').trim();
const uniq=a=>[...new Set(a||[])];
function converge(raw,base){
 const doc=fold(raw); let route=base.input_route?.id||'input:clarification-required'; let fam=uniq(base.families); let seq=!!base.sequence;
 const self=/\b(i|my|me|toi|cua toi)\b/.test(doc);
 const explicitNoAction=/(?:no|not|none|khong).{0,45}(?:checking|check|avoidance|avoid|rushing|rush|freezing|freeze|action|hanh dong|kiem tra|ne|tranh|voi|dong cung)/.test(doc);
 const genericIllustration=/^(?:for illustration|for illustrative purposes|for example|for instance|vi du|de minh hoa)\b/.test(doc)&&/(?:a|an|mot)\s+(?:claimant|applicant|person|user|customer|nguoi|ung vien)\b/.test(doc)&&/(?:might|may|could|co the)\b/.test(doc);
 if(genericIllustration){route='input:hypothetical-or-example';fam=[];seq=false;}
 const thirdPartyExplicit=/(?:not my (?:action|behavio(?:u)?r)|none of it is my action|that is (?:her|his|their) action|day la hanh vi cua (?:ban|chi|anh|em) ay|khong phai hanh vi cua toi|day khong phai hanh vi cua toi)/.test(doc);
 const thirdPartySubject=/(?:my friend|my classmate|a classmate|my sister|my brother|ban toi|ban cua toi|chi toi|anh toi|em toi|ban ay|chi ay|anh ay).{0,120}(?:said|told|keu|noi|bao|delay|postpone|submit|check|reopen|tri hoan|nop|kiem tra|mo lai)/.test(doc);
 if(thirdPartyExplicit&&thirdPartySubject){route='input:third-party-only';fam=[];seq=false;}
 const conflictingOwner=/(?:assigned|gan|giao).{0,70}(?:to me|cho toi).{0,80}(?:assigned|gan|giao|and|va|vua).{0,45}(?:my sister|my brother|chi toi|anh toi|em toi)|(?:to me|cho toi).{0,80}(?:assigned|gan|giao|and|va|vua).{0,45}(?:my sister|my brother|chi toi|anh toi|em toi)/.test(doc)&&/(?:conflict|contradict|mau thuan|unclear|ambiguous)/.test(doc);
 if(conflictingOwner){route='input:clarification-required';fam=[];seq=false;}
 const quotedHypothesis=/(?:worksheet|report|document|instructor|tutor|nguoi huong dan|tai lieu|bao cao).{0,70}(?:suppose|hypothesis|hypothetical|gia dinh)/.test(doc);
 const actualSelf=/(?:but|nhung|thuc te|actually|in reality).{0,90}(?:\bi\b|\btoi\b).{0,80}(?:checked|completed|uploaded|submitted|kiem tra|hoan tat|tai|nop)/.test(doc)||/(?:\bi\b|\btoi\b).{0,45}(?:checked|completed|uploaded|submitted|kiem tra|hoan tat|tai|nop).{0,45}(?:fully|day du|trong ngay|before submitting)/.test(doc);
 if(quotedHypothesis&&actualSelf){route='input:self-lived'; if(/(?:rush|too fast|qua nhanh|voi vang)/.test(doc)&&/(?:suppose|hypothesis|hypothetical|gia dinh)/.test(doc)) fam=fam.filter(x=>x!=='fast');}
 const externalBlock=/(?:site|system|portal|website|he thong|trang web).{0,50}(?:rejected|failed|blocked|down|loi|tu choi).{0,100}(?:could not|couldn't|unable|khong the).{0,70}(?:complete|submit|renew|hoan tat|nop)/.test(doc)&&/(?:ready|san sang)/.test(doc);
 if(externalBlock) fam=fam.filter(x=>x!=='freeze');
 const changedEvidence=/(?:changed|corrected|updated|revised|doi|sua|cap nhat).{0,110}(?:so|therefore|nen|vi vay).{0,45}(?:i|toi).{0,55}(?:checked|reopened|updated|kiem tra|mo lai|cap nhat).{0,80}(?:new|updated|corrected|moi|dung|chinh xac)/.test(doc);
 if(changedEvidence) fam=uniq([...fam.filter(x=>x!=='slow'),'adaptive']);
 const noNewEvidenceLoop=/(?:no new|nothing new|unchanged|khong co .*moi|khong he doi|khong doi).{0,120}(?:again|reopen|check|review|kiem tra|mo lai)|(?:again|reopen|check|review|kiem tra|mo lai).{0,120}(?:no new|nothing new|unchanged|khong co .*moi|khong he doi|khong doi)/.test(doc);
 const quantifiedLoop=/(?:five|four|six|seven|eight|nine|ten|nam|bon|sau|bay|tam|chin|muoi)\s+(?:times|lan)\b/.test(doc)&&/(?:reopen|check|review|mo lai|kiem tra)/.test(doc);
 const intervalLoop=/(?:every so often|from time to time|cach mot luc|mot luc lai|again and again|repeatedly|lap di lap lai)/.test(doc)&&/(?:reopen|check|review|mo lai|kiem tra)/.test(doc);
 if(self&&(noNewEvidenceLoop||quantifiedLoop||intervalLoop)) fam=uniq([...fam,'slow']);
 const adaptiveUpdate=/(?:changed|corrected|updated|revised|doi|sua|cap nhat).{0,90}(?:so|therefore|nen|vi vay).{0,55}(?:i|toi).{0,60}(?:check|reopen|update|kiem tra|mo lai|cap nhat)/.test(doc);
 if(adaptiveUpdate) fam=uniq([...fam.filter(x=>x!=='slow'),'adaptive']);
 const substitutionDelay=/(?:reorganis(?:e|ed|ing)|organis(?:e|ed|ing)|sorted|sap xep|don dep).{0,70}(?:because|so that|de|vi).{0,70}(?:postpone|delay|put off|tri hoan).{0,70}(?:finish|finishing|complete|submit|hoan tat|nop)/.test(doc);
 if(substitutionDelay) fam=uniq([...fam.filter(x=>x!=='adaptive'),'ignore']);
 if(explicitNoAction&&/(?:anxious|anxiety|worried|sad|happy|excited|lo lang|buon|vui|phan khich)/.test(doc)) fam=[];
 const historicalResolved=/(?:last year|previously|used to|truoc day|nam ngoai).{0,130}(?:reopen|check|review|mo lai|kiem tra).{0,100}(?:ended|stopped|ceased|not happening now|no longer|da dung|cham dut|khong con)/.test(doc);
 if(historicalResolved) fam=[];
 return {route,families:fam,sequence:seq};
}
function routeFrame(id,prev){const redirect=['input:safety','input:prediction','input:decision-request','input:hypothetical-or-example'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:safety','input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),c=converge(raw,base),route=routeFrame(c.route,base.input_route);return{...base,version:VERSION,metadata,input_route:route,families:c.families,sequence:c.sequence,oscillation:c.sequence,response_known:c.families.length>0,can_continue:route.action==='continue',must_stop:!!route.must_stop,must_redirect:!!route.must_redirect,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_143_ROUTE_FAMILY_CONVERGENCE',v143:{route:c.route,families:[...c.families],sequence:c.sequence}}};}
const core={...parent,version:VERSION,metadata,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v8-sealed-batch-a-convergence'})};
global.QCSemanticCoreV12=core;global.PSC_V83143=core;if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.143:sealed-batch-a-convergence';
})(typeof globalThis!=='undefined'?globalThis:this);
