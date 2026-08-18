(function(global){
'use strict';
const parent=global.QCSemanticCoreV36;if(!parent)throw new Error('V8.3.168 requires V8.3.167');
const VERSION='V8.3.168-V167-V1-SEALED-A-MECHANISM-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function routeFrame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function explicitIntent(d){
  if(has(/(?:make the decision for me|replace my own decision|replace my decision|choose whether i continue|pick the route for me|which option i must take|tell me exactly which path|substitute your command|select the move|asking you to choose|determine what i should do next|quyet dinh thay toi|pick route thay toi|command cua ban thay cho decision|xac dinh viec toi nen lam)/,d))return'input:decision-request';
  if(has(/(?:will the eventual result|how long before.*approval|predict.*final outcome|when am i likely.*result|forecast.*future decision|favourable approval.*soon|how many weeks.*resolve|result.*deadline|future outcome)/,d))return'input:prediction';
  // Explicit missing-own-response language outranks incidental words such as thoughts, feelings or third-party context nouns.
  if(has(/(?:supplied background and interpretation.*not a concrete behaviour of my own|described thoughts and feelings.*without naming one observable act by me|no specific action of mine|what i actually did next.*unstated|response.*not identifiable|no observable act by me|actor.*unclear|not a concrete behaviour from me|need to identify one real thing i did|chua co mot action cu the cua minh|viec toi that su lam tiep.*chua|own response.*chua xac dinh|chua co observable act cua minh|actor.*chua ro|chua co concrete behaviour cua minh|can neu mot viec that minh da lam)/,d))return'input:clarification-required';
  if(has(/(?:thinking about me privately|real intention.*emotion.*concealing|secretly sorry|secretly regretting|evaluating me internally|judging me internally|other person.*mind|still want to reconnect|still want contact|hidden motive|privately feel|unspoken internal reaction|rieng trong dau.*nghi gi|y dinh that.*giau|bi mat.*tiec|ben trong.*evaluate|ben trong.*danh gia|con muon reconnect|con muon contact|rieng tu cam thay|internal reaction)/,d))return'input:third-party-only';
  if(has(/(?:invented classroom example|training illustration|fabricated case|role-play character|made-up customer|hypothetical scenario|subject is fictional|scenario exists only as an example|practice material|classroom example.*bia|training.*tuong tuong|case.*gia lap|chu the.*fictional|scenario.*example)/,d))return'input:hypothetical-or-example';
  return null;
}
function ownFamily(d){
  if(has(/(?:had enough information to try something small.*kept researching.*did not start|da du du kien de test mot buoc nho.*so sanh them alternatives.*thay vi bat dau|could already test one sensible step.*fresh comparisons|next practical move.*clear.*more alternatives|enough.*small action.*extended research)/,d))return{matched:true,families:['freeze'],sequence:false};
  if(has(/(?:tidying minor files.*central task untouched|polishing peripheral admin.*main issue|don file vun.*task chinh|polish admin phu.*main issue)/,d))return{matched:true,families:['ignore'],sequence:false};
  if(has(/(?:returned to the same message repeatedly.*without any fresh information|checked.*same|rechecked.*same|reopened.*same|reread.*same|quay lai.*cung.*nhieu lan|kiem lai.*cung.*nhieu lan|doc lai.*cung.*nhieu lan)/,d))return{matched:true,families:['slow'],sequence:false};
  if(has(/(?:reviewed the concrete facts once.*carried it out|used what was already known.*proportionate move|xem concrete facts mot lan.*thuc hien|dung dieu da biet.*move vua du)/,d))return{matched:true,families:[],sequence:false};
  return{matched:false,families:[],sequence:false};
}
function analyze(raw,domain='other',subtopic=null){
  const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=explicitIntent(d),own=ownFamily(d);
  // Strong first-person behavioural evidence overrides incidental context-triggered parent routing when no explicit invalid intent is present.
  const route=rid||(own.matched?'input:self-lived':base.input_route?.id);
  const fam=route==='input:self-lived'?(own.matched?own:{matched:false,families:[...(base.families||[])].filter(x=>x!=='adaptive'),sequence:!!base.sequence}):{families:[],sequence:false};
  const input_route=routeFrame(route,base.input_route);
  return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:fam.families,sequence:!!fam.sequence,oscillation:!!fam.sequence,response_known:fam.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_168_V167_V1_MECHANISM_REPAIR',v168:{route,families:[...fam.families],sequence:!!fam.sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v17-v168-v167-v1-mechanism-repair'})};
global.QCSemanticCoreV37=core;global.PSC_V83168=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.168:v167-v1-mechanism-repair';
})(typeof globalThis!=='undefined'?globalThis:this);