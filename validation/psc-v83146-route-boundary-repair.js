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
function routeFrame(prev){return{...(prev||{}),id:'input:clarification-required',action:'clarify',must_stop:false,must_redirect:false};}
function analyze(raw,domain='other',subtopic=null){
 const base=parent.analyze(raw,domain,subtopic),doc=fold(raw);
 if(!ambiguityOverride(doc))return{...base,version:VERSION};
 const input_route=routeFrame(base.input_route);
 return{...base,version:VERSION,input_route,can_continue:false,must_stop:false,must_redirect:false,families:[],sequence:false,oscillation:false,response_known:false};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route};
global.QCSemanticCoreV15R=core;global.PSC_V83146_ROUTE=core;
})(typeof globalThis!=='undefined'?globalThis:this);
