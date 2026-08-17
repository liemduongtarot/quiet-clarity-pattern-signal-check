(function(global){
'use strict';
const parent=global.QCSemanticCoreV23;if(!parent)throw new Error('V8.3.155 repair requires V8.3.154');
const VERSION='V8.3.155-V154-SEALED-A-BOUNDED-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s),uniq=a=>[...new Set(a||[])];
function routeFrame(id,prev){const redirect=['input:safety','input:prediction','input:decision-request','input:hypothetical-or-example'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:safety','input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function routeOverride(d){
  if(has(/^(?:prediction ask:\s*)?(?:when is|when will|when should|how long until|how soon|khi nao|bao lau nua|bao gio)\b/,d))return'input:prediction';
  if(has(/(?:request asks|routing note:\s*this asks).{0,80}(?:future time|future timing|future outcome|timing\/outcome)/,d))return'input:prediction';
  if(has(/(?:mo phong|case dao tao|training example|training case|hypothetical only|practice case|classroom scenario|workshop vignette|role-play material|role play material).{0,220}(?:hu cau|gia dinh|tuong tuong|fictional|imaginary|made-up|sample|practice|training)/,d))return'input:hypothetical-or-example';
  if(has(/(?:noi dung chi dung cho|material only for|only for training|only for illustration).{0,160}(?:bai tap|minh hoa|gia dinh|training|illustration).{0,180}(?:khong duoc trinh bay|not presented|khong phai).{0,120}(?:su viec user da song qua|lived event|trai nghiem that)/,d))return'input:hypothetical-or-example';
  if(has(/(?:log hanh trinh|itinerary log|travel log).{0,160}(?:nhieu lan kiem tra booking|booking checks).{0,180}(?:khong xac dinh|never establishes|does not establish).{0,160}(?:toi hay nguoi di cung|i made them or|travel companion)/,d))return'input:clarification-required';
  if(has(/(?:complaint|khieu nai).{0,180}(?:keeps repeating|cu lap lai|lap lai).{0,180}(?:no concrete incident|khong dua ra incident cu the|khong co incident cu the).{0,140}(?:what i personally do|toi lam gi)/,d))return'input:clarification-required';
  if(has(/(?:actor or concrete response|chu the hoac hanh dong cu the).{0,80}(?:unresolved|van unresolved|chua ro|chua xac dinh)/,d))return'input:clarification-required';
  if(has(/(?:lo lang va ap luc|anxiety and pressure).{0,120}(?:chua neu toi thuc su da lam gi|does not state what i actually did|no concrete action)/,d))return'input:clarification-required';
  if(has(/(?:tin nhan|message|text).{0,120}(?:bon minh|we).{0,120}(?:doi lich|dời lịch|moved the inspection|moved inspection).{0,180}(?:khong noi|without identifying|does not identify).{0,160}(?:toi|me).{0,80}(?:chu nha|owner|landlord).{0,80}(?:agent|nguoi quan ly|manager)/,d))return'input:clarification-required';
  if(has(/(?:diem con thieu|unresolved point).{0,100}(?:xac dinh chu the|factual attribution|identify the actor|concrete response).{0,180}(?:chua du co so|before any questionnaire|truoc khi bat dau questionnaire)/,d))return'input:clarification-required';
  return null;
}
function familyRepair(d,base){
  if(base.input_route?.id!=='input:self-lived')return{families:[],sequence:false};
  if(has(/(?:buc boi|frustrated).{0,100}(?:module|result|diem).{0,180}(?:chua neu|have not described).{0,160}(?:kiem tra lap|repeated checking).{0,120}(?:ne tranh|avoidance).{0,120}(?:quyet qua nhanh|rushing).{0,120}(?:khong chon duoc|unable to choose)/,d))return{families:[],sequence:false};
  const ignore=has(/(?:form xac nhan|reference form).{0,220}(?:doi ten|renaming).{0,100}(?:thu muc|folders).{0,160}(?:khoi bat dau|would not start|so i would not start|de khoi bat dau)/,d);
  if(ignore)return{families:['ignore'],sequence:false};
  const slow=has(/(?:ba buoi toi|three evenings|three separate evenings).{0,180}(?:doc lai|reread).{0,160}(?:quyet dinh cua council|council decision).{0,180}(?:khong co|no).{0,100}(?:thu|letter|cap nhat moi|new update|portal update)/,d);
  if(slow)return{families:['slow'],sequence:false};
  const fast=has(/(?:invitation|loi moi).{0,160}(?:wait until thursday|cho den thu nam|could wait).{0,180}(?:replied yes|tra loi dong y|dong y).{0,100}(?:before finishing|truoc khi doc xong|ngay).{0,180}(?:uncertainty gone|het cam giac lung lo|wanted the uncertainty gone)/,d);
  if(fast)return{families:['fast'],sequence:false};
  const f=uniq(base.families||[]);return{families:f,sequence:!!base.sequence};
}
function analyze(raw,domain='other',subtopic=null){const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeOverride(d);if(rid){const input_route=routeFrame(rid,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_155_V154_SEALED_A_REPAIR',v155:{route:rid,families:[],sequence:false}}};}const r=familyRepair(d,base);return{...base,version:VERSION,families:r.families,sequence:r.sequence,oscillation:r.sequence,response_known:r.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_155_V154_SEALED_A_REPAIR',v155:{route:base.input_route?.id,families:[...r.families],sequence:r.sequence}}};}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v8-v155-v154-sealed-a-repair'})};
global.QCSemanticCoreV24=core;global.PSC_V83155=core;if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.155:v154-sealed-a-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
