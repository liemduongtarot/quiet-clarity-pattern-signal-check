(function(global){
'use strict';
const parent=global.QCSemanticCoreV62;if(!parent)throw new Error('V8.3.194 requires V8.3.193 V62');
const VERSION='V8.3.194-V193-V1-SEALED-A-BOUNDED-MECHANISM-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function neutralRepair(d){return has(/(?:proportionate action.*available evidence.*left the matter closed|bounded choice myself.*carried it out.*stopped there|concrete step based on current information.*did not reopen the decision)/,d);}
function routeRepair(d){
 if(has(/(?:record covers each event.*omits the specific response i personally made|described what changed.*not the concrete thing i myself did next|story names several actors.*never resolves which final move belonged to me)/,d))return'input:clarification-required';
 if(has(/(?:take over the decision.*single option i am supposed to follow|make the choice on my behalf rather than help me decide|replace my judgement with one direct instruction)/,d))return'input:decision-request';
 if(has(/(?:invented interview example.*semantic practice.*not a real situation i experienced|hypothetical.*not something i actually lived|case gia lap.*khong phai trai nghiem that)/,d))return'input:hypothetical-or-example';
 if(has(/(?:private assessment is my supervisor holding about me|hidden intention does the other person currently have toward me|secretly think about me.*not what action i took myself)/,d))return'input:third-party-only';
 if(has(/(?:situation become favourable for me before the stated date|eventual result likely to move in my favour|final outcome resolve positively for me by the deadline)/,d))return'input:prediction';
 return null;
}
function familyRepair(d){
 if(has(/(?:reversible test was already available.*extending the comparison instead of starting|enough evidence for a safe experiment.*kept researching rather than run it|first move could easily be undone.*collecting more alternatives)/,d))return{matched:true,families:['freeze'],sequence:false};
 if(has(/(?:central issue needed a response.*ignored it and switched to an unrelated task|left the main matter unanswered.*distracted myself with something peripheral|focused elsewhere and left the main issue untouched)/,d))return{matched:true,families:['ignore'],sequence:false};
 if(has(/(?:answered later than usual.*reviewed it once.*left the matter alone|delayed before acting.*checked the issue once.*did not reopen it|response came late.*after one review.*moved on without returning)/,d))return{matched:true,families:['slow'],sequence:false};
 if(has(/(?:moved toward acting, pulled back, and re-entered the same review cycle several times|checked, backed away, then checked again.*without new evidence|pattern kept cycling: approach, retreat, recheck, then repeat)/,d))return{matched:true,families:['slow'],sequence:true};
 return{matched:false,families:[],sequence:false};
}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),d=fold(raw),neutral=neutralRepair(d),rid=neutral?null:routeRepair(d),fam=(neutral||rid)?{matched:false,families:[],sequence:false}:familyRepair(d),route=neutral?'input:self-lived':(rid||(fam.matched?'input:self-lived':base.input_route?.id));let families=[...(base.families||[])],sequence=!!base.sequence;if(neutral){families=[];sequence=false;}else if(rid){families=[];sequence=false;}else if(fam.matched){families=[...fam.families];sequence=!!fam.sequence;}const input_route=frame(route,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families,sequence,oscillation:sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_194_V193_V1_BOUNDED_MECHANISM_REPAIR'}};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v43-v194-v193-v1-bounded-mechanism-repair'})};global.QCSemanticCoreV63=core;global.PSC_V83194=core;})(typeof globalThis!=='undefined'?globalThis:this);