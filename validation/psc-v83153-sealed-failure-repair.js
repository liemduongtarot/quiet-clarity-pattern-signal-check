(function(global){
'use strict';
const parent=global.QCSemanticCoreV21;if(!parent)throw new Error('V8.3.153 repair requires V8.3.152');
const VERSION='V8.3.153-V152-SEALED-A-BOUNDED-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s),uniq=a=>[...new Set(a||[])];
function routeFrame(id,prev){const redirect=['input:safety','input:prediction','input:decision-request','input:hypothetical-or-example'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:safety','input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function routeOverride(d){
  if(has(/(?:message says|tin nhan|text says).{0,100}(?:we changed|we moved|we postponed|"we"|minh).{0,180}(?:without identifying|khong xac dinh|khong cho biet).{0,120}(?:me|toi|agent|owner|landlord|chu nha|nguoi quan ly)/,d))return'input:clarification-required';
  if(has(/(?:hr note|calendar audit|audit log|system log|record).{0,180}(?:i cancelled|toi huy|coordinator|dong nghiep|recruiter).{0,160}(?:ownership|actor|chu the).{0,100}(?:unresolved|chua resolve|chua ro|mau thuan)/,d))return'input:clarification-required';
  if(has(/(?:someone|mot nguoi|co nguoi).{0,120}(?:delays|tri hoan|do du).{0,120}(?:decision owner|nguoi quyet dinh|actor).{0,120}(?:not identified|chua duoc identify|chua xac dinh|chua ro)/,d))return'input:clarification-required';
  if(has(/(?:which option should i choose|which should i choose|toi nen chon|nen chon|take .* hay .*|.* hay .*\?)/,d)&&has(/(?:choose|chon|hay|or|take|remain|stay|move|appeal|pay|slot|waiting list|studio|term)/,d))return'input:decision-request';
  if(has(/(?:vignette|training vignette|vignette dao tao|tinh huong dao tao|bai tap dao tao).{0,180}(?:imaginary|tuong tuong|fictional|gia dinh|contractor|nguoi)/,d))return'input:hypothetical-or-example';
  if(has(/(?:em gai toi|chi ho toi|ban cua toi|nguoi mua kia|my sister|my cousin|my friend|that buyer|the buyer).{0,220}(?:cua em ay|cua chi ay|cua co ay|thuoc ve co ay|hanh dong cua chi ay|hanh vi cua co ay|decision.*hers|action.*hers|behaviour.*hers|not mine|khong phai cua toi)/,d))return'input:third-party-only';
  if(has(/(?:toi chi ke ve|toi chi dang mo ta|i am only describing|i only describe).{0,120}(?:hanh vi cua co ay|her behaviour|hanh dong cua co ay)/,d))return'input:third-party-only';
  return null;
}
function familyRepair(d,base){
  if(base.input_route?.id!=='input:self-lived')return{families:[],sequence:false};
  const freeze=has(/(?:both appointment windows|ca hai khung gio|ca hai lich).{0,160}(?:practical|acceptable|deu on|deu phu hop).{0,220}(?:switched|doi qua doi lai|chuyen qua lai).{0,160}(?:left both|both bookings unconfirmed|khong xac nhan cai nao|chua chot cai nao)/,d);
  const ignoreAdaptive=has(/(?:ignored|bo qua|de lai).{0,120}(?:physio|clinic|appointment|message|email).{0,120}(?:corrected|revised|da sua|dinh chinh).{0,160}(?:read|replied|rearranged|sap xep lai|dieu chinh)/,d);
  const fast=has(/(?:until friday|con den thu sau|deadline con|had until).{0,140}(?:answer yes|answered yes|dong y|chot).{0,100}(?:instantly|almost instantly|ngay lap tuc|rat nhanh).{0,140}(?:uncertainty|bat an|cang thang).{0,80}(?:bien mat|go away|het)/,d);
  const slow=has(/(?:ba buoi toi|three evenings|several evenings|nhieu buoi toi).{0,160}(?:same statement|cung mot bang sao ke|same page|cung mot trang).{0,180}(?:no new transaction|chua co giao dich moi|khong co update moi|no new update)/,d);
  if(freeze)return{families:['freeze'],sequence:false};
  if(ignoreAdaptive)return{families:['adaptive','ignore'],sequence:true};
  if(fast)return{families:['fast'],sequence:false};
  if(slow)return{families:['slow'],sequence:false};
  const f=uniq(base.families||[]);return{families:f,sequence:!!base.sequence};
}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeOverride(d);if(rid){const input_route=routeFrame(rid,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_153_V152_SEALED_A_REPAIR',v153:{route:rid,families:[],sequence:false}}};}const r=familyRepair(d,base);return{...base,version:VERSION,families:r.families,sequence:r.sequence,oscillation:r.sequence,response_known:r.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_153_V152_SEALED_A_REPAIR',v153:{route:base.input_route?.id,families:[...r.families],sequence:r.sequence}}};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v8-v153-v152-sealed-a-repair'})};
global.QCSemanticCoreV22=core;global.PSC_V83153=core;if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.153:v152-sealed-a-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
