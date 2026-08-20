(function(global){
'use strict';
const parent=global.QCSemanticCoreV78;if(!parent)throw new Error('V8.3.209 V78R requires V78');
const VERSION='V8.3.209-V208-V1-PRESERVATION-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),d=fold(raw);let rid=null;
  const hypoAutobio=(d.includes('mang tinh tu truyen')||d.includes('autobiographical'))&&(d.includes('khong')||d.includes('nothing')||d.includes('not '));
  const hypoConstructed=(d.includes('toi tao')||d.includes('i created')||d.includes('input thuc hanh')||d.includes('practice input'));
  const thirdPerson=(d.includes('my colleague')||d.includes('dong nghiep')||d.includes('my manager')||d.includes('customer'));
  const hiddenOpinion=(d.includes('opinion')||d.includes('judgement')||d.includes('judgment')||d.includes('danh gia'))&&(d.includes('entirely internal')||d.includes('keeps entirely internal')||d.includes('internal')||d.includes('giu ben trong'));
  const noEvidence=d.includes('no evidence')||d.includes('no outward evidence')||d.includes('outward record gives me no evidence')||d.includes('khong co bang chung');
  if(hypoAutobio&&hypoConstructed)rid='input:hypothetical-or-example';
  else if(thirdPerson&&hiddenOpinion&&noEvidence)rid='input:third-party-only';
  if(!rid)return base;
  const input_route=frame(rid,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_209_V208_V1_PRESERVATION_REPAIR'}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v51r-v209-v208-preservation-repair'})};global.QCSemanticCoreV78R=core;global.PSC_V83209=core;
})(typeof globalThis!=='undefined'?globalThis:this);
