(function(global){
'use strict';
const parent=global.QCSemanticCoreV20;if(!parent)throw new Error('V8.3.152 repair requires V8.3.151');
const VERSION='V8.3.152-V151-SEALED-A-BOUNDED-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s),uniq=a=>[...new Set(a||[])];
function routeFrame(id,prev){const redirect=['input:safety','input:prediction','input:decision-request','input:hypothetical-or-example'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:safety','input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function routeOverride(d){
 if(has(/(?:keeps recurring|keeps happening|cu lap lai|lap lai).{0,120}(?:no actual episode|no specific episode|khong co tinh huong cu the|khong dua ra lan cu the).{0,120}(?:what i personally do|toi da lam gi|hanh dong cua toi)/,d))return'input:clarification-required';
 if(has(/^(?:renew this room|renew .* room|request formal review|formal review).{0,120}(?:hay|or).{0,160}\?/,d)||has(/^(?:request formal review|renew this room).{0,160}(?:start fresh submission|move to smaller studio)/,d))return'input:decision-request';
 if(has(/^(?:scenario day hoc|training scenario|teaching scenario).{0,220}(?:patient tuong tuong|imaginary patient|fictional patient)/,d))return'input:hypothetical-or-example';
 if(has(/^(?:khi nao|bao gio|when).{0,100}(?:college|university|school).{0,100}(?:publish|release|cong bo).{0,100}(?:grade|result|diem)/,d))return'input:prediction';
 if(has(/^(?:teammate|colleague|coworker).{0,180}(?:his own|her own|cua chinh anh ay|cua chinh co ay).{0,120}(?:none of those delays are mine|not my action|khong phai cua toi)/,d))return'input:third-party-only';
 if(has(/^(?:friend|my friend|ban toi).{0,180}(?:his own|her own|cua anh ay|cua co ay).{0,120}(?:not my behaviour|not my behavior|khong phai behaviour cua toi|khong phai hanh vi cua toi)/,d))return'input:third-party-only';
 return null;
}
function familyRepair(d,base){
 if(base.input_route?.id!=='input:self-lived')return{families:[],sequence:false};
 let f=uniq(base.families||[]),seq=!!base.sequence;
 const freeze=has(/(?:lich xem nha|viewing).{0,80}(?:thu ba|tuesday).{0,80}(?:thu nam|thursday).{0,120}(?:deu phu hop|both work|both suitable).{0,120}(?:chuyen qua lai|switch back and forth|doi qua doi lai).{0,120}(?:chua xac nhan|not confirm|without confirming)/,d);
 if(freeze){f=f.filter(x=>x!=='slow');if(!f.includes('freeze'))f.push('freeze');}
 f=uniq(f);if(f.length<2)seq=false;return{families:f,sequence:seq};
}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeOverride(d);if(rid){const input_route=routeFrame(rid,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_152_V151_SEALED_A_REPAIR',v152:{route:rid,families:[],sequence:false}}};}const r=familyRepair(d,base);return{...base,version:VERSION,families:r.families,sequence:r.sequence,oscillation:r.sequence,response_known:r.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_152_V151_SEALED_A_REPAIR',v152:{route:base.input_route?.id,families:[...r.families],sequence:r.sequence}}};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v8-v152-v151-sealed-a-repair'})};
global.QCSemanticCoreV21=core;global.PSC_V83152=core;if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.152:v151-sealed-a-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
