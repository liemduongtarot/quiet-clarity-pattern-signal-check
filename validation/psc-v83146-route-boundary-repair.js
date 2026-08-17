(function(global){
'use strict';
const parent=global.QCSemanticCoreV14;if(!parent)throw new Error('V8.3.146 route repair requires V8.3.145');
const VERSION='V8.3.146-ROUTE-BOUNDARY-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘]/g,"'").toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function ambiguityOverride(doc){
 return has(/(?:khong xac dinh|chua xac dinh|khong ro).{0,55}(?:ai la nguoi|ai da|nguoi nao).{0,90}(?:thuc hien|lam|doi|thay doi|hanh dong)/,doc)
 || has(/(?:unclear|not clear|remains unclear).{0,85}(?:whether|if).{0,55}(?:that action|the action|the behaviour|the behavior).{0,70}(?:was mine|was my action|belonged to me|was someone else's|someone else)/,doc)
 || has(/(?:alternates between|moves between).{0,70}(?:my action|an action of mine|me).{0,45}(?:and|with).{0,50}(?:another person's action|someone else's action|another person).{0,100}(?:khong ro|unclear|not clear|unresolved)/,doc)
 || has(/(?:khong ro|chua ro).{0,80}(?:hanh vi|hanh dong).{0,80}(?:cua toi|toi).{0,30}(?:hay|hoac|or).{0,60}(?:nguoi khac|someone else|another person)/,doc);
}
function disguisedPrediction(doc){
 return has(/^(?:toi|minh).{0,35}(?:cu|van).{0,25}(?:suy nghi|tu hoi|nghi).{0,35}(?:bao gio|khi nao).{0,70}(?:ho|nguoi do|anh ay|co ay).{0,35}(?:nhan|lien lac|quay lai)/,doc)
 || has(/^i .{0,35}(?:keep wondering|keep thinking|wondering|keep asking myself).{0,35}(?:when|how soon).{0,70}(?:they|he|she|that person).{0,35}(?:message|contact|reply|come back|return)/,doc);
}
function disguisedDecision(doc){
 return has(/^(?:toi|minh).{0,40}(?:mac|ket|khong biet).{0,55}(?:nen).{0,40}(?:o lai|roi di|nghi viec|chon|lua chon)/,doc)
 || has(/^i .{0,45}(?:am stuck|feel stuck|do not know|don't know).{0,55}(?:whether i should|if i should|should i).{0,55}(?:stay|leave|quit|choose)/,doc);
}
function thirdPartyOnly(doc){
 const actor=has(/^(?:sep toi|nguoi yeu toi|ban doi toi|my boss|my partner).{0,180}(?:kiem tra|tri hoan|ne|khong tra loi|checks?|delays?|avoids?|does not reply|doesn't reply)/,doc);
 const selfBehaviour=has(/(?:con toi|nhung toi|va toi|while i|but i|and i).{0,120}(?:kiem tra|tri hoan|ne|voi|dung lai|check|delay|avoid|rush|freeze|decide)/,doc);
 return actor&&!selfBehaviour;
}
function routeFrame(id,prev){
 const redirect=['input:safety','input:prediction','input:decision-request','input:hypothetical-or-example'].includes(id);
 const clarify=['input:third-party-only','input:clarification-required'].includes(id);
 return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:safety','input:prediction','input:decision-request'].includes(id),must_redirect:redirect};
}
function analyze(raw,domain='other',subtopic=null){
 const base=parent.analyze(raw,domain,subtopic),doc=fold(raw);
 let routeId=null;
 if(disguisedPrediction(doc))routeId='input:prediction';
 else if(disguisedDecision(doc))routeId='input:decision-request';
 else if(thirdPartyOnly(doc))routeId='input:third-party-only';
 else if(ambiguityOverride(doc))routeId='input:clarification-required';
 if(!routeId)return{...base,version:VERSION};
 const input_route=routeFrame(routeId,base.input_route);
 return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route};
global.QCSemanticCoreV15R=core;global.PSC_V83146_ROUTE=core;
})(typeof globalThis!=='undefined'?globalThis:this);
