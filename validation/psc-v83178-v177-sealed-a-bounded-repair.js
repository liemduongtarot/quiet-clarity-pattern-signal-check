(function(global){
'use strict';
const parent=global.QCSemanticCoreV46;if(!parent)throw new Error('V8.3.178 requires V8.3.177');
const VERSION='V8.3.178-V177-V1-SEALED-A-BOUNDED-MECHANISM-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function routeFrame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function routeRepair(d){
  // Clarification: narrative/context is present but own concrete action or actor ownership remains absent.
  if(has(/(?:left out.*concrete.*personally did|khong noi hanh dong nao la cua minh|switching between us.*step was mine|not what i actually carried out|what happened around me.*actually carried out)/,d))return'input:clarification-required';
  // Decision outsourcing: explicit request that another party select/settle the choice instead of the user.
  if(has(/(?:chon ho toi|chot giup toi.*lua chon|quyet ho toi|make the decision on my behalf|choose.*for me.*avoid.*making.*call)/,d))return'input:decision-request';
  // Hypothetical/example: invented/example material explicitly separated from the user's lived experience.
  if(has(/(?:(?:scenario|vi du).*(?:minh hoa|gia dinh|tuong tuong).*(?:bia ra|khong phai doi that|khong mo ta trai nghiem)|nhan vat gia dinh.*toi khong phai nhan vat|fictional.*not.*my own experience|made-up.*not.*my life)/,d))return'input:hypothetical-or-example';
  // Third-party-only: another person's private/inside mind or feeling is requested without observable evidence.
  if(has(/(?:nghi gi kin.*khong the quan sat|private thoughts.*(?:chua co hanh vi|khong.*the hien)|cam thay gi.*ben trong|going on in .* mind.*cannot directly observe|hidden emotional state.*toward me|secretly feeling.*not observable)/,d))return'input:third-party-only';
  // Prediction: future/final outcome is requested in terms of favourable alignment or desired result.
  if(has(/(?:ket cuc.*co loi cho toi|cuoi cung.*nghieng ve phia toi|ket qua tuong lai.*dung y|outcome.*go the way i want|result.*hoping for|resolve in my favour|ket qua sap toi.*hy vong)/,d))return'input:prediction';
  return null;
}
function familyRepair(d){
  // Freeze: a reversible/small/ready test exists while option comparison preserves delay instead of starting.
  const ready=has(/(?:reversible (?:trial|step|experiment)|thu nghiem nho.*an toan|buoc thu nho.*quay lai|thu truoc roi doi lai|small experiment.*ready|modest experiment.*ready)/,d);
  const delay=has(/(?:comparing more possibilities.*instead of beginning|so sanh them lua chon|tri hoan.*can them lua chon|mo them phuong an.*chua lam|preserve every option|searching for a better alternative|keep.*options.*open)/,d);
  return ready&&delay?{matched:true,families:['freeze'],sequence:false}:{matched:false,families:[],sequence:false};
}
function analyze(raw,domain='other',subtopic=null){
  const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeRepair(d),own=familyRepair(d),route=rid||(own.matched?'input:self-lived':base.input_route?.id);
  let families=[...(base.families||[])],sequence=!!base.sequence;
  if(rid){families=[];sequence=false;}else if(own.matched){families=['freeze'];sequence=false;}
  const input_route=routeFrame(route,base.input_route);
  return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families,sequence,oscillation:sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_178_V177_V1_BOUNDED_MECHANISM_REPAIR',v178:{route,families:[...families],sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v27-v178-v177-v1-bounded-mechanism-repair'})};
global.QCSemanticCoreV47=core;global.PSC_V83178=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.178:v177-v1-bounded-mechanism-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
