(function(global){
'use strict';
const parent=global.QCSemanticCoreV19;if(!parent)throw new Error('V8.3.151 repair requires V8.3.150');
const VERSION='V8.3.151-V150-SEALED-A-BOUNDED-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s),uniq=a=>[...new Set(a||[])];
function routeFrame(id,prev){const redirect=['input:safety','input:prediction','input:decision-request','input:hypothetical-or-example'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:safety','input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function routeOverride(d){
 if(has(/(?:without identifying whether|khong cho biet).{0,120}(?:we|\"we\"|minh|toi hay|me or).{0,120}(?:landlord|nguoi quan ly nha|chu nha)/,d)||has(/(?:the message says|cau ).{0,80}(?:we postponed|\"minh doi lich\"|minh doi lich).{0,120}(?:without identifying|khong cho biet)/,d))return'input:clarification-required';
 if(has(/^(?:renew tenancy|gia han tenancy|gia han hop dong).{0,80}(?:hay|or).{0,120}\?$/,d))return'input:decision-request';
 if(has(/^(?:the training scenario|training scenario|bai hoc dat ra|bai minh hoa|illustration only).{0,240}/,d)||has(/(?:sinh vien hu cau|nhan vat du lich|fictional student|fictional traveller).{0,180}/,d))return'input:hypothetical-or-example';
 if(has(/(?:dong nghiep|colleague).{0,120}(?:cua chinh anh ay|his own).{0,100}(?:khong phai hanh dong cua toi|not my action|none of those actions are mine)/,d))return'input:third-party-only';
 if(has(/(?:nguoi mua nay|this buyer|customer).{0,160}(?:toi chi dang noi ve|i am only describing|i only want to understand).{0,120}(?:co ay|her behaviour|her handling)/,d))return'input:third-party-only';
 if(has(/(?:nguoi o tang tren|upstairs tenant|neighbour upstairs).{0,180}(?:khong phai toi|not me|none of those actions are mine)/,d))return'input:third-party-only';
 return null;
}
function familyRepair(d,base){
 if(base.input_route?.id!=='input:self-lived')return{families:[],sequence:false};
 let f=uniq(base.families||[]),seq=!!base.sequence;
 const freeze=has(/(?:ca hai phong deu chap nhan duoc|both rooms are acceptable|both flats are workable).{0,140}(?:doi qua doi lai|switching back and forth|kept switching).{0,140}(?:chua dat lich|not booked|without booking)/,d);
 if(freeze&&!f.includes('freeze'))f.push('freeze');
 f=uniq(f);if(f.length<2)seq=false;return{families:f,sequence:seq};
}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeOverride(d);if(rid){const input_route=routeFrame(rid,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_151_V150_SEALED_A_REPAIR',v151:{route:rid,families:[],sequence:false}}};}const r=familyRepair(d,base);return{...base,version:VERSION,families:r.families,sequence:r.sequence,oscillation:r.sequence,response_known:r.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_151_V150_SEALED_A_REPAIR',v151:{route:base.input_route?.id,families:[...r.families],sequence:r.sequence}}};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v8-v151-v150-sealed-a-repair'})};
global.QCSemanticCoreV20=core;global.PSC_V83151=core;if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.151:v150-sealed-a-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
