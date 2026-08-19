(function(global){
'use strict';
const parent=global.QCSemanticCoreV41;if(!parent)throw new Error('V8.3.173 requires V8.3.172');
const VERSION='V8.3.173-V172-V1-SEALED-A-MECHANISM-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function routeFrame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function routeRepair(d){
  // M1: own response is missing, mixed with another actor, or left unresolved.
  if(has(/(?:haven't said what i personally did next|have not said what i personally did next|mix(?:es|ed).*response with mine.*(?:which|what).*mine|never identified which one i actually carried out|khong ro action nao la cua toi.*doi actor)/,d))return'input:clarification-required';
  // M2: explicit decision outsourcing in natural English paraphrases.
  if(has(/(?:give me one directive.*(?:treat|use) it as the decision|take the choice out of my hands.*tell me which option|replace my choice with (?:your|a) directive)/,d))return'input:decision-request';
  // M3a: another person's hidden inner state, not the user's behaviour.
  if(has(/(?:what is (?:he|she|they) secretly feeling about me|secretly feeling about me.*inner state|what hidden motive is .* holding toward me)/,d))return'input:third-party-only';
  // M3b: explicit future-result/deadline question.
  if(has(/(?:will this situation resolve positively.*by the deadline|do you think this situation will resolve positively.*deadline)/,d))return'input:prediction';
  return null;
}
function familyRepair(d){
  // M4: reversible/workable test exists, but research/comparison/alternatives postpone commitment.
  const reversible=has(/(?:small reversible (?:experiment|test)|buoc thu nho.*dao nguoc|buoc thu.*(?:undo|dao nguoc)|workable test.*already available|du du kien.*thu mot buoc nho)/,d);
  const delay=has(/(?:extend(?:ing)? (?:my )?research|research them|tim them (?:alternatives|phuong an)|collecting more comparisons|them nhieu lua chon|khong khoi dong|chua commit|commit.*kho chiu|postponed)/,d);
  if(reversible&&delay)return{matched:true,families:['freeze'],sequence:false};
  // M5: measured completion must not inherit ignore.
  if(has(/(?:used the evidence already available.*(?:measured|proportionate) action.*left (?:the issue|it) alone|dung evidence.*(?:move|buoc).*vua phai.*(?:de yen|dung lai)|khong quay lai)/,d))return{matched:true,families:[],sequence:false,healthy:true};
  // M6: repeated approach/withdraw loop is slow + sequence.
  if(has(/(?:checked.*stopped.*checked again.*pulled away.*repeating|tien lai xem.*rut ra.*quay vao.*lap lai)/,d))return{matched:true,families:['slow'],sequence:true};
  return{matched:false,families:[],sequence:false};
}
function analyze(raw,domain='other',subtopic=null){
  const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeRepair(d),own=familyRepair(d);
  const route=rid||(own.matched?'input:self-lived':base.input_route?.id);
  let families=[],sequence=false;
  if(route==='input:self-lived'){
    if(own.matched){families=[...(own.families||[])];sequence=!!own.sequence;}
    else{families=[...(base.families||[])].filter(x=>x!=='adaptive');sequence=!!base.sequence;}
  }
  const input_route=routeFrame(route,base.input_route);
  return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families,sequence,oscillation:sequence,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_173_V172_V1_MECHANISM_REPAIR',v173:{route,families:[...families],sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v22-v173-v172-v1-mechanism-repair'})};
global.QCSemanticCoreV42=core;global.PSC_V83173=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.173:v172-v1-mechanism-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
