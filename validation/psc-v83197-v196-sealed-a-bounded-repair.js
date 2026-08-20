(function(global){
'use strict';
const parent=global.QCSemanticCoreV65R;if(!parent)throw new Error('V8.3.197 requires V8.3.196 V65R');
const VERSION='V8.3.197-V196-V1-COMPOSITIONAL-GAP-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/\s+/g,' ').trim();
const any=(s,a)=>a.some(x=>s.includes(x));
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function clarification(d){return any(d,['still unspecified','van chua xac dinh'])&&any(d,['thing i myself did','my own concrete closing move','hanh dong cua chinh toi','phan ung cuoi']);}
function prediction(d){const future=any(d,['likely to end','cuoi cung','trong vai tuan toi','before the deadline','truoc moc','truoc cuoi']);const favourable=any(d,['favourably','co loi cho toi','nghieng ve phia toi','the way i hope','thuan loi']);const outcome=any(d,['end','ket qua','chuyen nay','final result','outcome','resolve']);return future&&favourable&&outcome;}
function sequence(d){const repeat=any(d,['same review cycle','again and again','lap','lap lai','nhieu vong']);const approach=any(d,['moved toward','checked','tien vao','kiem tra']);const retreat=any(d,['backed off','backed away','rut ra','lui ra','stepped away']);const noNew=any(d,['without new evidence','nothing new added','khong co thong tin moi','khong co du kien moi']);return repeat&&approach&&retreat&&(noNew||any(d,['again and again','re-entered','quay lai']));}
function freeze(d){const reversible=any(d,['reversible','safe trial','low-risk','easy to undo','co the quay lai','co the dao nguoc','it rui ro']);const step=any(d,['first step','trial','experiment','thu nghiem','buoc thu','buoc nho','next move']);const excess=any(d,['widening the comparison','researching more alternatives','tiep tuc so sanh','kept comparing','more options','them lua chon','collecting more']);const notStart=any(d,['instead of starting','instead of acting','instead of beginning','chua lam','chua bat dau','stayed uncommitted']);return reversible&&step&&excess&&notStart;}
function ignore(d){const need=any(d,['main issue required','request needed','chuyen can xu ly','viec chinh can','can phan hoi','can xu ly']);const avoid=any(d,['ignored','unrelated task','redirected my attention','quay sang lam viec khac khong lien quan','bo qua','left it untouched']);return need&&avoid;}
function analyze(raw,domain='other',subtopic=null){
  const base=parent.analyze(raw,domain,subtopic),d=fold(raw);let rid=null,fam=null;
  if(clarification(d))rid='input:clarification-required';else if(prediction(d))rid='input:prediction';else if(sequence(d))fam={families:['slow'],sequence:true};else if(freeze(d))fam={families:['freeze'],sequence:false};else if(ignore(d))fam={families:['ignore'],sequence:false};
  if(!rid&&!fam)return base;
  const route=rid||'input:self-lived',input_route=frame(route,base.input_route),families=rid?[]:fam.families,seq=rid?false:fam.sequence;
  return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[...families],sequence:seq,oscillation:seq,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_197_V196_V1_COMPOSITIONAL_GAP_REPAIR'}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v40-v197-v196-compositional-gap-repair'})};global.QCSemanticCoreV66=core;global.PSC_V83197=core;
})(typeof globalThis!=='undefined'?globalThis:this);
