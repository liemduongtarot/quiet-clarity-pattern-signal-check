(function(global){
'use strict';
const parent=global.QCSemanticCoreV35;if(!parent)throw new Error('V8.3.167 requires V8.3.166');
const VERSION='V8.3.167-V166-V1-SEALED-A-MECHANISM-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function routeFrame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id);const clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function intentRoute(d){
  // 1. Direct transfer of decision ownership / imperative choice request.
  if(has(/(?:make the decision for me|choose whether i continue|pick the route for me|which option i must take|tell me exactly which path|replace my decision|substitute your command|select the move|asking you to choose|determine what i should do next|option nao toi bat buoc|chon giup toi nen tiep tuc hay dung|khong muon giu decision|yeu cau ban choose|phan tich response cua toi|quyet dinh thay toi|pick route thay toi|command cua ban thay cho decision|xac dinh viec toi nen lam)/,d))return'input:decision-request';
  // 2. Explicit future outcome/timing request. This outranks incidental current/context language.
  if(has(/(?:will the eventual result|how long before.*approval|predict.*final outcome|when am i likely.*result|forecast.*future decision|favourable approval.*soon|do you think.*approval.*soon|how many weeks.*resolve|result.*before.*deadline|future outcome.*succeed|eventual result.*co loi|con bao lau.*approval|du doan.*final outcome|khi nao.*result|forecast.*future decision|favourable approval.*som|ban co nghi.*approval.*som|bao nhieu tuan.*resolve|result.*deadline|future outcome)/,d))return'input:prediction';
  // 3. Third-party internal state / hidden intention. Explicit internal-state wording outranks temporal/context nouns.
  if(has(/(?:thinking about me privately|real intention.*emotion.*concealing|secretly sorry|secretly regretting|evaluating me internally|judging me internally|other person.*mind|still want to reconnect|still want contact|hidden motive|privately feel|unspoken internal reaction|rieng trong dau.*nghi gi|y dinh that.*giau|bi mat.*tiec|am tham.*hoi tiec|ben trong.*evaluate|ben trong.*danh gia|mind rieng.*nghi gi|con muon reconnect|con muon contact|hidden motive|rieng tu cam thay|internal reaction)/,d))return'input:third-party-only';
  // 4. Explicit hypothetical/example framing.
  if(has(/(?:invented classroom example|training illustration|fabricated case|role-play character|made-up customer|hypothetical scenario|subject is fictional|scenario exists only as an example|practice material|classroom example.*bia|training.*tuong tuong|case.*gia lap|role-play character|customer.*bia|hypothetical scenario|chu the.*fictional|scenario.*example|practice material)/,d))return'input:hypothetical-or-example';
  // 5. Missing own observable response / actor / immediate next move.
  if(has(/(?:still need to identify one real thing i did|no specific action of mine|what i actually did next remains unstated|what i actually did next.*unstated|next behaviour unspecified|response is not identifiable|response.*blended.*another person|no observable act by me|actor is unclear|which choice was mine.*actor|without saying which one.*carried out|account covers too much time.*next move|sequence.*too broad.*next move|not a concrete behaviour from me|need to state one real action|can neu mot viec that|minh da lam|chua co mot action cu the|viec toi that su lam tiep.*chua|behaviour.*chua duoc noi|own response.*chua xac dinh|response.*lan.*nguoi khac|observable act.*chua|actor.*chua ro|choice nao.*cua toi|chua noi cai nao.*thuc su lam|mo ta.*qua nhieu thoi gian.*next move|chua tach duoc immediate next move|chua co concrete behaviour)/,d))return'input:clarification-required';
  return null;
}
function selfFamily(d,base,route){
  if(route!=='input:self-lived')return{families:[],sequence:false};
  if(has(/(?:reviewed the concrete facts once.*measured response.*carried it out|used what was already known.*proportionate move|xem concrete facts mot lan.*response vua muc.*thuc hien|dung dieu da biet.*move vua du.*ngung check)/,d))return{families:[],sequence:false};
  if(has(/(?:could already test one sensible step.*kept opening fresh comparisons|next practical move was clear.*looking for more alternatives|enough to try a small action.*extended research|da co the test mot buoc hop ly.*mo them comparison|practical next move da ro.*tim them alternatives|du du kien.*action nho.*keo dai research)/,d))return{families:['freeze'],sequence:false};
  if(has(/(?:tidying minor files.*central task untouched|polishing peripheral admin.*main issue|don file vun.*task chinh|polish admin phu.*main issue)/,d))return{families:['ignore'],sequence:false};
  // Slow = repeated re-checking/re-reading of the same information with no new evidence/detail.
  if(has(/(?:(?:checked|rechecked|reopened|returned to|reread|reviewed).{0,60}(?:same|identical).{0,80}(?:again|repeatedly|several times|many times).{0,120}(?:no new|nothing new|no additional|without new)|(?:same|identical).{0,60}(?:record|notification|message|information).{0,80}(?:again and again|repeatedly).{0,120}(?:no new|nothing new|no additional)|(?:kiem|kiem lai|mo lai|quay lai|doc lai).{0,60}(?:cung mot|cung).{0,80}(?:nhieu lan|lap lai).{0,120}(?:khong co.*moi|khong.*bo sung|khong nhan.*moi))/,d))return{families:['slow'],sequence:false};
  return{families:[...(base.families||[])].filter(x=>x!=='adaptive'),sequence:!!base.sequence};
}
function analyze(raw,domain='other',subtopic=null){
 const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=intentRoute(d),route=rid||base.input_route?.id;
 const fam=selfFamily(d,base,route);
 if(rid){const input_route=routeFrame(rid,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:fam.families,sequence:fam.sequence,oscillation:fam.sequence,response_known:fam.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_167_V166_V1_MECHANISM_REPAIR',v167:{route:rid,families:[...fam.families],sequence:fam.sequence}}};}
 return{...base,version:VERSION,families:fam.families,sequence:fam.sequence,oscillation:fam.sequence,response_known:fam.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_167_V166_V1_MECHANISM_REPAIR',v167:{route,families:[...fam.families],sequence:fam.sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v16-v167-v166-v1-mechanism-repair'})};
global.QCSemanticCoreV36=core;global.PSC_V83167=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.167:v166-v1-mechanism-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
