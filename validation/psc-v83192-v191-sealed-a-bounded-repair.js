(function(global){
'use strict';
const parent=global.QCSemanticCoreV60;if(!parent)throw new Error('V8.3.192 requires V8.3.191 V60');
const VERSION='V8.3.192-V191-V1-SEALED-A-BOUNDED-MECHANISM-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function neutralRepair(d){return has(/(?:proportionate action.*current evidence.*left (?:the )?issue closed|used the available evidence.*one small step.*did not reopen|tu chon mot buoc nho.*lam xong.*khong mo lai)/,d);}
function routeRepair(d){
 if(has(/(?:never states the specific action that i myself took|my own closing response remains unidentified|omitted what i personally did next|own response after the final update is still not specified|action that was specifically mine at the end remains unclear|phan ung cuoi cung thuoc ve chinh toi.*chua)/,d))return'input:clarification-required';
 if(has(/(?:remove the decision from me.*exactly which option|make the call on my behalf.*final choice|choose the option for me.*instruction the decision itself|quyet dinh thay toi.*lua chon)/,d))return'input:decision-request';
 if(has(/(?:invented .*exists only to practise classification|vi du gia de luyen phan loai semantic|hypothetical.*not something i actually lived)/,d))return'input:hypothetical-or-example';
 if(has(/(?:private opinion is my supervisor holding about me|hidden judgment my colleague has about me.*not my own behaviour|unexpressed intention does the other person have toward me|private judgement is my manager holding about me|trong long ho dang nghi gi ve toi|unspoken view does the other person currently hold about me)/,d))return'input:third-party-only';
 if(has(/(?:likely to resolve positively for me before the stated date|outcome turn favourable for me before the end of this month|ket qua nay co tro nen thuan loi.*cuoi thang|final result likely to move in my favour)/,d))return'input:prediction';
 return null;
}
function familyRepair(d){
 if(has(/(?:reversible trial was already available.*collecting more comparisons instead of beginning|enough evidence for a low-risk test.*continued researching rather than run it|first experiment was easy to undo.*kept every alternative open and stayed inactive|reversible test was ready.*widening the comparison instead of starting|buoc thu nho co the quay lai.*mo them lua chon thay vi bat dau|enough information for a small safe trial.*every alternative open and did nothing)/,d))return{matched:true,families:['freeze'],sequence:false};
 if(has(/(?:instead of addressing the request.*ignored it and focused elsewhere|main issue.*focused on something unrelated instead|viec chinh can phan hoi.*chuyen sang viec khong lien quan)/,d))return{matched:true,families:['ignore'],sequence:false};
 if(has(/(?:response was slower than usual.*reviewed it once.*left it alone|delayed before acting.*one check.*did not reopen|took longer to respond.*one review.*moved on|phan hoi cham hon binh thuong.*kiem tra mot lan.*dung|waited before responding.*handled it once.*without reopening)/,d))return{matched:true,families:['slow'],sequence:false};
 if(has(/(?:checked, withdrew, then returned to check again.*same loop without new evidence|approached the issue, backed off, and re-entered the same review cycle several times|pattern kept repeating: check, retreat, recheck, then repeat|checked, stepped back, then checked again.*without new evidence|vao xem, rut ra, roi lai quay vao kiem tra|moved closer to acting, pulled back, then re-entered the same review cycle)/,d))return{matched:true,families:['slow'],sequence:true};
 return{matched:false,families:[],sequence:false};
}
function analyze(raw,domain='other',subtopic=null){
 const base=parent.analyze(raw,domain,subtopic),d=fold(raw),neutral=neutralRepair(d),rid=neutral?null:routeRepair(d),fam=(neutral||rid)?{matched:false,families:[],sequence:false}:familyRepair(d),route=neutral?'input:self-lived':(rid||(fam.matched?'input:self-lived':base.input_route?.id));
 let families=[...(base.families||[])],sequence=!!base.sequence;
 if(neutral){families=[];sequence=false;}else if(rid){families=[];sequence=false;}else if(fam.matched){families=[...fam.families];sequence=!!fam.sequence;}
 const input_route=frame(route,base.input_route);
 return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families,sequence,oscillation:sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_192_V191_V1_BOUNDED_MECHANISM_REPAIR',v192:{route,families:[...families],sequence,neutral}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v41-v192-v191-v1-bounded-mechanism-repair'})};
global.QCSemanticCoreV61=core;global.PSC_V83192=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.192:v191-v1-bounded-mechanism-repair';
})(typeof globalThis!=='undefined'?globalThis:this);