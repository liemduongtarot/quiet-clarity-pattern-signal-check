(function(global){
'use strict';
const parent=global.QCSemanticCoreV64;if(!parent)throw new Error('V8.3.196 requires V8.3.195 V64');
const VERSION='V8.3.196-V195-V1-COMPOSITIONAL-MECHANISM-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const any=(s,arr)=>arr.some(x=>s.includes(x));
const re=(r,s)=>r.test(s);
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function neutral(d){
  const selfAction=any(d,['i chose one','i made one','i took one','toi tu chon','toi tu quyet','mot practical step','one proportionate action','one bounded decision']);
  const completion=any(d,['completed it','carried it out','stopped there','left the matter closed','did not reopen','lam xong roi dung','hoan tat']);
  return selfAction&&completion;
}
function clarification(d){
  const missing=any(d,['never states','still unspecified','never resolves','still missing','still blank','chua duoc xac dinh','bi bo trong','van chua co']);
  const own=any(d,['i personally','my own','what i myself did','which closing move was mine','own final','hanh dong cua chinh toi','phan ung cuoi']);
  const action=any(d,['action','response','move','did','reaction','hanh dong','phan ung']);
  return missing&&own&&action;
}
function decision(d){
  const outsource=any(d,['choose for me','make the decision for me','take the choice away from me','replace my judgement','decide for me','quyet thay toi','quyet ho toi','chon thay toi']);
  const command=any(d,['must follow','command i should obey','direct instruction','one option','single route','becomes the decision','phai lam','phai chon']);
  return outsource&&command;
}
function hypothetical(d){
  const invented=any(d,['invented','fabricated','made up','hypothetical','gia lap','dung len','vi du gia']);
  const test=any(d,['test case','testing','classification practice','analysis','semantic','practice','luyen phan loai']);
  const notLived=any(d,['not something i lived','not an event from my own life','never happened to me','not something i actually experienced','khong phai trai nghiem that','toi khong tham gia']);
  return invented&&(test||notLived)&&notLived;
}
function thirdParty(d){
  const privateCue=any(d,['private','secretly','hidden','unspoken','without ever showing','beyond anything observable','kin','am tham']);
  const other=any(d,['teammate','colleague','manager','supervisor','that person','they','other person','ho ','sep']);
  const aboutMe=any(d,['about me','toward me','ve toi']);
  const state=any(d,['belief','feels','feeling','intention','thinking','thinks','assessment','conclusion','cam nhan','suy nghi']);
  return privateCue&&other&&aboutMe&&state;
}
function prediction(d){
  const future=any(d,['will this','will the','is this situation likely','going to','before the','by the stated date','next few weeks','eventual','sap toi','trong vai tuan','truoc cuoi']);
  const outcome=any(d,['outcome','result','resolve','turn','end up','ket qua','chuyen']);
  const favorable=any(d,['in my favour','positively for me','way i hope','favourable','co loi cho toi','nghieng ve phia toi','thuan loi']);
  return future&&outcome&&favorable;
}
function freeze(d){
  const reversible=any(d,['reversible','safe trial','low-risk','easy to undo','easy to reverse','co the quay lai','it rui ro']);
  const step=any(d,['experiment','trial','first move','next move','step','buoc thu','buoc nho']);
  const excess=any(d,['broadening the comparison','researching','collecting more alternatives','kept comparing','opening more','more options','them lua chon','giu moi phuong an']);
  const notStart=any(d,['rather than start','instead of beginning','rather than act','stayed uncommitted','instead of trying','chua bat dau','thay vi lam']);
  return reversible&&step&&excess&&(notStart||any(d,['uncommitted','not start']));
}
function sequence(d){
  const repeat=any(d,['repeating','repeated','repeat','same loop','same review cycle','cycle','loop','nhieu vong','lap lai']);
  const approach=any(d,['checked','check','approach','moved toward','recheck','xem','kiem tra','tien vao']);
  const retreat=any(d,['stepped away','backed away','retreat','withdrew','lui ra','rut ra']);
  const noNew=any(d,['without new evidence','nothing new added','khong co du kien moi','khong co du kien moi']);
  return repeat&&approach&&retreat&&(noNew||re(/again|re-entered|quay lai/,d));
}
function slowOnce(d){
  const delay=any(d,['later than usual','response was delayed','responded late','waited before replying','waited before responding','cham hon binh thuong','mat nhieu thoi gian']);
  const once=any(d,['once','one check','one review','mot lan','dung mot lan']);
  const stop=any(d,['left the matter alone','without reopening','did not return','did not reopen','then stopped','roi dung','khong mo lai']);
  return delay&&once&&stop;
}
function ignore(d){
  const need=any(d,['needed action','required a response','needed a reply','needed response','can phan hoi','can xu ly']);
  const avoid=any(d,['ignored','switched to an unrelated','redirected my attention elsewhere','peripheral','unrelated task','left it untouched','left it pending','bo qua','chuyen sang viec khac']);
  return need&&avoid;
}
function analyze(raw,domain='other',subtopic=null){
  const base=parent.analyze(raw,domain,subtopic),d=fold(raw);
  const isNeutral=neutral(d);let rid=null,fam=null;
  if(!isNeutral){if(clarification(d))rid='input:clarification-required';else if(decision(d))rid='input:decision-request';else if(hypothetical(d))rid='input:hypothetical-or-example';else if(thirdParty(d))rid='input:third-party-only';else if(prediction(d))rid='input:prediction';else if(sequence(d))fam={families:['slow'],sequence:true};else if(freeze(d))fam={families:['freeze'],sequence:false};else if(slowOnce(d))fam={families:['slow'],sequence:false};else if(ignore(d))fam={families:['ignore'],sequence:false};}
  const route=isNeutral?'input:self-lived':(rid||(fam?'input:self-lived':base.input_route?.id));let families=[...(base.families||[])],seq=!!base.sequence;
  if(isNeutral||rid){families=[];seq=false;}else if(fam){families=[...fam.families];seq=!!fam.sequence;}
  const input_route=frame(route,base.input_route);
  return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families,sequence:seq,oscillation:seq,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_196_V195_V1_COMPOSITIONAL_MECHANISM_REPAIR',v196:{route,families:[...families],sequence:seq,neutral:isNeutral}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v40-v196-compositional-mechanism-repair'})};global.QCSemanticCoreV65=core;global.PSC_V83196=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.196:v195-v1-compositional-mechanism-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
