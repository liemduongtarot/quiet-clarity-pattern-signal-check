(function(global){
'use strict';
const parent=global.QCSemanticCoreV34;if(!parent)throw new Error('V8.3.166 requires V8.3.165');
const VERSION='V8.3.166-V165-V1-SEALED-A-BOUNDED-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function routeFrame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id);const clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function intentRoute(d){
  // Highest precedence: explicit transfer of decision ownership. Incidental context nouns cannot steal this route.
  if(has(/(?:pick the option for me|choose the next move for me|make the final decision in my place|decide on my behalf|do not want to choose it myself|make the choice,? not reflect|select my action|own the final call for me|replace my decision|determine the action i should take|chon next move|final decision thay toi|quyet dinh thay toi|pick option thay toi|khong muon tu chon|make the choice|select action|final call thay toi|command cua ban thay cho decision|xac dinh action toi nen lam)/,d))return'input:decision-request';
  // Explicit future-outcome request outranks context references to people, training, decisions or episodes.
  if(has(/(?:will the eventual outcome|how long until.*approved|predict whether.*final decision|when will i receive.*result|forecast whether.*future outcome|do you expect.*approved soon|how many weeks.*resolve|will the result.*before the deadline|future result.*work out|eventual outcome.*co loi|con bao lau.*approved|du doan.*final decision|khi nao.*result|forecast xem future outcome|approved som.*ket thuc|bao nhieu tuan.*resolve|result.*truoc deadline|future result.*thanh cong)/,d))return'input:prediction';
  // Explicit third-party internal-state request outranks incidental first-person/context words.
  if(has(/(?:what are they privately thinking|their real intention.*feeling.*hiding|secretly regretting|judging me internally|other person.s mind|still want contact|motive.*hidden|privately feel|internal reaction.*me|am tham nghi gi ve toi|y dinh that.*giau cam xuc|bi mat hoi tiec|ben trong.*danh gia toi|trong dau nguoi kia|con muon contact|dong co nao ho.*giu kin|that su cam thay gi ve toi|internal reaction cua ho)/,d))return'input:third-party-only';
  // Explicit hypothetical framing; evaluated only after direct decision/prediction/third-party intents.
  if(has(/(?:workshop example.*fictional|for teaching purposes.*invented|made-up case study|role-play character|fabricated customer|hypothetical vignette.*imaginary|invented worker|scenario.*fictional|practice case.*made-up|workshop example.*hu cau|muc dich teaching.*bia ra|case study gia lap|role-play character|customer hu cau|hypothetical vignette.*tuong tuong|worker bia ra|scenario.*fictional|practice case.*bia ra)/,d))return'input:hypothetical-or-example';
  // Missing own observable response / actor / sequence.
  if(has(/(?:sequence is too broad.*personally did|have not named one concrete action|next behaviour unspecified|response is blended.*another person|without identifying.*observable move|unclear which choice.*actor|never said which one actually happened|no single episode.*next move|not one behaviour from me|need to state one real action|trinh tu con qua rong.*toi da lam gi|chua neu mot hanh dong cu the|behaviour.*chua duoc noi ro|response.*dang lan.*nguoi khac|chua xac dinh.*hanh dong quan sat|chua ro lua chon.*actor|chua noi cai nao.*xay ra|chua co mot episode.*next move|chua co behaviour cua minh|can noi mot hanh dong that)/,d))return'input:clarification-required';
  return null;
}
function selfFamily(d,base,route){
  if(route!=='input:self-lived')return{families:[],sequence:false};
  // Healthy/proportionate action should never surface as a signal family.
  if(has(/(?:checked the available facts.*proportionate next step.*acted|used the information already available.*completed the reasonable next action|kiem facts da co.*next step vua du.*hanh dong|dung information da co.*reasonable next action)/,d))return{families:[],sequence:false};
  // Freeze = enough information / known next move, but additional research/comparison delays action.
  if(has(/(?:enough information.*kept gathering alternatives.*did not begin|knew the practical next move.*kept researching|enough data.*postponed.*collecting more comparisons|du information.*gom alternatives.*chua bat dau|biet practical next move.*research them|du data.*tri hoan.*gom them comparison)/,d))return{families:['freeze'],sequence:false};
  // Ignore = displacement into low-priority/unrelated work.
  if(has(/(?:switched to unrelated admin.*important task|organised low-priority material.*main issue untouched|chuyen sang admin khong lien quan.*task quan trong|sap xep material uu tien thap.*main issue)/,d))return{families:['ignore'],sequence:false};
  // Slow = repeated rechecking with no new information.
  if(has(/(?:reopened the same information.*nothing new|reread the same message.*no new information|mo lai cung information.*khong co gi moi|doc lai cung message.*khong nhan information moi)/,d))return{families:['slow'],sequence:false};
  return{families:[...(base.families||[])].filter(x=>x!=='adaptive'),sequence:!!base.sequence};
}
function analyze(raw,domain='other',subtopic=null){
 const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=intentRoute(d),route=rid||base.input_route?.id;
 const fam=selfFamily(d,base,route);
 if(rid){const input_route=routeFrame(rid,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:fam.families,sequence:fam.sequence,oscillation:fam.sequence,response_known:fam.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_166_V165_V1_SEALED_A_REPAIR',v166:{route:rid,families:[...fam.families],sequence:fam.sequence}}};}
 return{...base,version:VERSION,families:fam.families,sequence:fam.sequence,oscillation:fam.sequence,response_known:fam.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_166_V165_V1_SEALED_A_REPAIR',v166:{route,families:[...fam.families],sequence:fam.sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v15-v166-v165-v1-sealed-a-repair'})};
global.QCSemanticCoreV35=core;global.PSC_V83166=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.166:v165-v1-sealed-a-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
