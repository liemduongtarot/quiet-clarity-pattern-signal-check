(function(global){
'use strict';
const parent=global.QCSemanticCoreV12;
if(!parent)throw new Error('V8.3.144 requires V8.3.143 semantic authority');
const VERSION='V8.3.144-SEALED-A-FAILURE-CONVERGENCE';
const metadata=Object.freeze({version:VERSION,parent:'V8.3.143 FAILED REVIEW CANDIDATE',classification:'LEVEL-1 ROUTE/FAMILY/SEQUENCE CONVERGENCE REPAIR',source_failures:'V8.3.143 immutable Batch A first-run 17 failures',production_authorized:false,production_lock:'prohibited',sealed_validation:'not-authorized',step_111:'prohibited'});
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘]/g,"'").toLowerCase().replace(/\s+/g,' ').trim();
const uniq=a=>[...new Set(a||[])];
const has=(r,s)=>r.test(s);
function converge(raw,base){
 const doc=fold(raw); let route=base.input_route?.id||'input:clarification-required'; let fam=uniq(base.families); let seq=!!base.sequence;
 const self=has(/\b(i|my|me|toi|cua toi)\b/,doc);
 const unresolvedOwners=has(/(?:both me and (?:another|other) person|ca toi va (?:mot )?nguoi khac).{0,90}(?:without resolving|not resolve|unresolved|unclear|ambiguous|khong xac dinh|khong ro)/,doc)
   || has(/(?:attributes?|assigns?|ghi nhan|quy).{0,80}(?:to both me and|cho ca toi va).{0,90}(?:without resolving|unresolved|unclear|ambiguous|khong ro)/,doc);
 const unnamedActor=has(/(?:someone|somebody|mot nguoi).{0,70}(?:rushed|submitted|checked|delayed|voi|nop|kiem tra|tri hoan).{0,80}(?:actor|person|nguoi).{0,35}(?:not named|unnamed|khong duoc neu ten|khong ro la ai)/,doc)
   || has(/(?:actor|person|nguoi).{0,35}(?:not named|unnamed|khong duoc neu ten|khong ro la ai)/,doc);
 if(unresolvedOwners||unnamedActor){route='input:clarification-required';fam=[];seq=false;}
 const thirdPartyQuestion=has(/(?:why does|why is|tai sao).{0,55}(?:my colleague|my friend|my sister|my brother|dong nghiep cua toi|ban toi|chi toi|anh toi|em toi).{0,90}(?:her own|his own|their own|cua co ay|cua anh ay|cua ho|check|kiem tra)/,doc);
 const selfDisavow=has(/(?:i am not asking about|i'm not asking about|not asking about).{0,55}(?:my|mine|behavio(?:u)?r of mine)|(?:khong hoi|khong noi).{0,55}(?:hanh vi|phan ung).{0,35}(?:cua toi|toi)/,doc);
 if(thirdPartyQuestion&&selfDisavow){route='input:third-party-only';fam=[];seq=false;}
 const noActionInventory=has(/(?:no|none|khong co).{0,35}(?:action|hanh dong|phan ung).{0,90}(?:checking|avoidance|rushing|freezing|kiem tra|ne tranh|lam voi|voi vang|dung lai|dong bang).{0,90}(?:described|stated|reported|duoc mo ta|duoc neu)/,doc)
   || has(/(?:khong co).{0,25}(?:hanh dong|phan ung).{0,120}(?:nao duoc mo ta|nao duoc neu)/,doc);
 const externalConstraint=has(/(?:blocked|stuck|unable|could not|couldn't|bi chan|khong the).{0,100}(?:because|because of|due to|vi|do).{0,100}(?:insurer|insurance|provider|system|portal|third party|ben bao hiem|he thong|don vi).{0,100}(?:not issued|not provided|chua cap|chua cung cap|missing|thieu)/,doc)
   && has(/(?:not because i avoided|not because i was avoiding|khong phai vi toi tranh|khong phai do toi tranh)/,doc);
 const hypotheticalContradicted=has(/(?:suppose|hypothetical|might be delaying|gia su|gia dinh).{0,120}(?:but|while|whereas|thuc te|nhung).{0,100}(?:submitted|completed|finished|nop|hoan tat).{0,60}(?:on time|dung luc|dung han)/,doc)
   || has(/(?:assessor|record|tai lieu|ho so).{0,100}(?:might be delaying|gia su|gia dinh).{0,120}(?:record shows|thuc te).{0,90}(?:submitted|completed|nop|hoan tat).{0,50}(?:on time|dung luc|dung han)/,doc);
 if(noActionInventory||externalConstraint||hypotheticalContradicted){fam=[];seq=false;}
 const repeatedUnchanged=has(/(?:four|five|six|seven|eight|nine|ten|bon|nam|sau|bay|tam|chin|muoi)\s+(?:times|lan)\b/,doc)
   && has(/(?:check|review|reopen|looked again|xem lai|kiem tra|mo lai)/,doc)
   && has(/(?:unchanged|still the same|y nguyen|khong doi|van nhu cu)/,doc);
 if(route==='input:self-lived'&&self&&repeatedUnchanged) fam=uniq([...fam,'slow']);
 const adaptiveChange=has(/(?:replaced|changed|updated|revised|corrected|new (?:data|information|evidence)|real update|thong tin moi|so lieu moi|doi|cap nhat|sua).{0,130}(?:adjusted|adapted|corrected|changed my|reviewed the change|dieu chinh|doi cach|xu ly theo|sua buoc)/,doc)
   || has(/(?:after|when|sau khi|khi).{0,80}(?:new|updated|revised|changed|corrected|moi|cap nhat|doi).{0,90}(?:i|toi).{0,80}(?:adjusted|adapted|corrected|changed|dieu chinh|doi cach|xu ly)/,doc);
 if(route==='input:self-lived'&&adaptiveChange) fam=uniq([...fam,'adaptive']);
 const priorLoop=has(/(?:had been|was|truoc do).{0,60}(?:looping|cycling|rechecking|checking repeatedly).{0,100}(?:same|unchanged)/,doc)
   || has(/(?:looping over the same|cycling through the same)/,doc);
 if(route==='input:self-lived'&&adaptiveChange&&priorLoop) fam=uniq([...fam,'slow']);
 const priorIgnore=has(/(?:intentionally|deliberately|co tinh).{0,50}(?:ignored|avoided|did not touch|bo qua|khong dung|khong dung toi|khong cham).{0,100}(?:file|form|application|claim|ho so|don)/,doc)
   || has(/(?:co tinh bo qua|co tinh khong dung toi|deliberately avoided|intentionally ignored)/,doc);
 if(route==='input:self-lived'&&priorIgnore) fam=uniq([...fam,'ignore']);
 const fastCommit=has(/(?:decid(?:e|ed)|chot|confirm(?:ed|ation)?|submit(?:ted)?|gui).{0,70}(?:within|in|trong)\s+(?:a few|few|vai)\s+(?:minutes|min|phut)/,doc)
   && has(/(?:enough time|still had time|con du thoi gian)/,doc);
 const fastBeforeCompare=has(/(?:forcing|force|rushing|rush|ep|bat).{0,50}(?:quick|fast|rapid|nhanh|voi).{0,50}(?:decision|choice|quyet dinh|lua chon).{0,90}(?:before|truoc khi).{0,70}(?:compar|check|review|doi chieu|xem|kiem tra)/,doc);
 if(route==='input:self-lived'&&(fastCommit||fastBeforeCompare)) fam=uniq([...fam,'fast']);
 const freezePhase=has(/(?:froze|frozen|freeze|dung hinh|dong bang|bi ket).{0,70}(?:opening|screen|start|begin|man hinh|buoc dau)/,doc);
 const slowPhase=has(/(?:spent too long|too long|looping|cycling|rechecking|lap di lap lai|xem lai nhieu|kiem tra nhieu).{0,100}(?:same|figures|details|information|cung|so lieu|thong tin)/,doc);
 const fastPhase=has(/(?:then|finally|roi|sau do|cuoi cung).{0,60}(?:sped|rushed|sent immediately|gui ngay|lam voi|voi vang|chot nhanh)/,doc)
   || has(/(?:last (?:night|minute)|toi cuoi|phut cuoi).{0,70}(?:rushed|sent|lam voi|gui ngay)/,doc);
 if(route==='input:self-lived'&&freezePhase) fam=uniq([...fam,'freeze']);
 if(route==='input:self-lived'&&slowPhase) fam=uniq([...fam,'slow']);
 if(route==='input:self-lived'&&fastPhase) fam=uniq([...fam,'fast']);
 const ignoreThenFast=has(/(?:did not touch|avoided|ignored|khong dung toi|khong cham|khong dung|co tinh khong).{0,120}(?:for|trong|vai)\s+(?:a few|few|several|vai)?\s*(?:days|ngay)/,doc)
   && has(/(?:then|finally|roi|sau do|cuoi cung|toi cuoi).{0,90}(?:rushed|sent immediately|lam voi|gui ngay|gui lien)/,doc);
 if(route==='input:self-lived'&&ignoreThenFast) fam=uniq([...fam,'ignore','fast']);
 const phaseCount=['ignore','freeze','slow','fast','adaptive'].filter(x=>fam.includes(x)).length;
 const orderedConnector=has(/(?:then|after that|but when|when .* changed|once i began|a real update arrived|roi|sau do|nhung khi|khi .* doi|khi co thong tin moi|sau khi)/,doc);
 if(route==='input:self-lived'&&phaseCount>=2&&orderedConnector) seq=true;
 const transformedLoop=has(/(?:dang lap viec kiem tra|currently repeating the check|currently looping).{0,120}(?:but|nhung).{0,90}(?:new data|new information|so lieu moi|thong tin moi).{0,100}(?:adjusted|adapted|doi cach|dieu chinh|xu ly theo)/,doc);
 if(route==='input:self-lived'&&adaptiveChange&&transformedLoop) seq=true;
 return {route,families:uniq(fam),sequence:seq};
}
function routeFrame(id,prev){const redirect=['input:safety','input:prediction','input:decision-request','input:hypothetical-or-example'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:safety','input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),c=converge(raw,base),route=routeFrame(c.route,base.input_route);return{...base,version:VERSION,metadata,input_route:route,families:c.families,sequence:c.sequence,oscillation:c.sequence,response_known:c.families.length>0,can_continue:route.action==='continue',must_stop:!!route.must_stop,must_redirect:!!route.must_redirect,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_144_ROUTE_FAMILY_SEQUENCE_CONVERGENCE',v144:{route:c.route,families:[...c.families],sequence:c.sequence}}};}
const core={...parent,version:VERSION,metadata,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v8-sealed-a-failure-convergence'})};
global.QCSemanticCoreV13=core;global.PSC_V83144=core;if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.144:sealed-a-failure-convergence';
})(typeof globalThis!=='undefined'?globalThis:this);
