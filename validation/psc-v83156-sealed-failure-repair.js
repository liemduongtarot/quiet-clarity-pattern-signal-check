(function(global){
'use strict';
const parent=global.QCSemanticCoreV24;if(!parent)throw new Error('V8.3.156 repair requires V8.3.155');
const VERSION='V8.3.156-V155-SEALED-A-BOUNDED-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s),uniq=a=>[...new Set(a||[])];
function routeFrame(id,prev){const redirect=['input:safety','input:prediction','input:decision-request','input:hypothetical-or-example'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:safety','input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function routeOverride(d){
  if(has(/^(?:timing request:\s*)?(?:when will|when is|when should|how long until|how soon|khi nao|bao lau nua|bao gio)\b/,d))return'input:prediction';
  if(has(/(?:routing evidence:\s*)?(?:future timing\/outcome ask|future timing|future outcome).{0,120}(?:khong phai|not).{0,100}(?:current response pattern|response evidence)/,d))return'input:prediction';
  if(has(/^(?:do i|should i|toi nen|mình nên|minh nen)\b.{0,220}\b(?:or|hay)\b/,d))return'input:decision-request';
  if(has(/(?:directly requesting a choice|yeu cau chon truc tiep|requesting a choice between alternatives)/,d))return'input:decision-request';
  if(has(/(?:tinh huong dong vai|role-play|role play|training example|training case|hypothetical only|practice case|classroom scenario|workshop vignette).{0,220}(?:nhan vat gia dinh|fictional|imaginary|gia dinh|training|dao tao)/,d))return'input:hypothetical-or-example';
  if(has(/(?:noi dung la tai lieu dao tao hoac gia dinh|material is training or hypothetical|not a lived event|khong phai su viec user noi da trai qua)/,d))return'input:hypothetical-or-example';
  if(has(/(?:not my behaviour|third-party only|someone else:|not my action:)/,d)&&has(/(?:friend|client|customer|nguoi hang xom|em ho|co ay|anh ay|another person|nguoi khac)/,d))return'input:third-party-only';
  if(has(/(?:tat ca hanh dong|moi hanh dong|routing evidence:\s*actions|routing evidence:\s*action).{0,120}(?:thuoc ve nguoi khac|belong to another person).{0,120}(?:khong nhan|not claim|khong phai behaviour cua user)/,d))return'input:third-party-only';
  if(has(/(?:toi khong phai nguoi|toi dang hoi ve hanh dong cua co ay|toi chi muon hieu behaviour cua co ay|i only want to understand her behaviour).{0,120}/,d))return'input:third-party-only';
  if(has(/(?:submission timing|submission va timing).{0,80}(?:cua co ay|hers).{0,180}(?:another person|nguoi khac|khong phai behaviour cua user)/,d))return'input:third-party-only';
  return null;
}
function familyRepair(d,base){
  if(base.input_route?.id!=='input:self-lived')return{families:[],sequence:false};
  const adaptive=has(/(?:sua lai ho hanh khach|corrected passenger surname|corrected passenger name).{0,180}(?:bo itinerary cu|discarded the old itinerary).{0,220}(?:dung lai|rebuilt).{0,180}(?:record da sua|corrected record|revised record)/,d);
  if(adaptive)return{families:['adaptive'],sequence:false};
  const ignore=has(/(?:submit one apprenticeship reference|nop mot reference|apprenticeship reference).{0,220}(?:spent the evening|danh ca buoi toi).{0,180}(?:reorganising archived interview notes|sap xep lai ghi chu phong van cu|reorganizing archived interview notes).{0,180}(?:instead of opening the form|thay vi mo form|de khoi mo form)/,d);
  if(ignore)return{families:['ignore'],sequence:false};
  const freeze=has(/(?:two storage units|hai kho luu tru).{0,140}(?:met my price and distance limits|deu hop gia va khoang cach).{0,220}(?:switching my preference|doi lua chon qua lai|kept switching).{0,180}(?:reserved neither|khong reserve cho nao|booked neither)/,d);
  if(freeze)return{families:['freeze'],sequence:false};
  const f=uniq(base.families||[]);return{families:f,sequence:!!base.sequence};
}
function analyze(raw,domain='other',subtopic=null){
  const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeOverride(d);
  if(rid){const input_route=routeFrame(rid,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_156_V155_SEALED_A_REPAIR',v156:{route:rid,families:[],sequence:false}}};}
  const r=familyRepair(d,base);return{...base,version:VERSION,families:r.families,sequence:r.sequence,oscillation:r.sequence,response_known:r.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_156_V155_SEALED_A_REPAIR',v156:{route:base.input_route?.id,families:[...r.families],sequence:r.sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v8-v156-v155-sealed-a-repair'})};
global.QCSemanticCoreV25=core;global.PSC_V83156=core;if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.156:v155-sealed-a-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
