(function(global){
'use strict';
const parent=global.QCSemanticCoreV31;if(!parent)throw new Error('V8.3.163 requires V8.3.162');
const VERSION='V8.3.163-V162-V1-SEALED-A-BOUNDED-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim();
const has=(r,s)=>r.test(s);
function routeFrame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id);const clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function routeRepair(d){
  if(has(/(?:classroom|training|workshop|case[- ]study|role[- ]play|fictional|imaginary|made[- ]up|fabricated|bai tap|gia su|hu cau|tuong tuong|gia lap|vi du hoc tap|vi du training)/,d))return'input:hypothetical-or-example';
  if(has(/(?:choose|decide|pick|select|tell me|give me|instruct|hay chon|quyet dinh|chot|bao toi|noi toi|chi thi|menh lenh).{0,120}(?:for me|on my behalf|cho toi|thay toi|ho toi|khong muon tu|khong phai tu|khoi tu|must take|phai theo|final call|own the choice|accept|decline|refuse|tiep tuc|tam dung|rut lui|yes|no)/,d) || has(/(?:make yes-or-no decision|instruction truc tiep|determine action.*not check|chon mot huong cho toi)/,d))return'input:decision-request';
  if(has(/(?:will|when|how long|predict|forecast|expect|doan|du doan|bao lau|khi nao|thoi diem|lieu).{0,120}(?:outcome|result|decision|approved|approval|confirmation|ket qua|quyet dinh|xac nhan|thuan loi|tich cuc|future|coming weeks|cuoi thang|go my way|land in my favour|huong toi muon|duyet)/,d) || has(/(?:coming result.*go my way|approved soon|prediction ve tuong lai|future outcome|ket thuc.{0,60}huong toi muon.{0,60}(?:cuoi thang|truoc cuoi thang)|ket thuc.{0,60}dung huong.{0,60}muon)/,d))return'input:prediction';
  if(has(/(?:they|their|them|ho|nguoi kia).{0,120}(?:think|thinking|mind|feel|feeling|motive|intend|intention|judge|judging|regret|nghi|suy nghi|cam xuc|dong co|y dinh|danh gia|hoi tiec|noi tam)/,d) || has(/(?:trong dau ho|ben trong ho|mind cua ho|private motive|inner reaction|what feeling.*hide|suy nghi.{0,40}cua ho|cam xuc.{0,40}cua ho|y dinh.{0,40}cua ho|dong co.{0,40}cua ho)/,d))return'input:third-party-only';
  if(has(/(?:not said|have not said|not identified|not separated|unclear|missing|chua noi|chua neu|chua ro|chua duoc neu|thieu|chua xac dinh|chua tach|lan voi).{0,120}(?:what i did|did next|my action|my response|own action|own behaviour|own next move|response|behaviour|hanh dong|phan ung|chu the|actor|phan cua toi)/,d) || has(/(?:my part.*(?:mixed|lan)|phan cua toi.*(?:lan|tron)|response cua ban than.*chua|external change.*own next move)/,d))return'input:clarification-required';
  return null;
}
function familyRepair(d,base){
  if(base.input_route?.id!=='input:self-lived')return{families:[],sequence:false};
  if(has(/(?:urge to rush or avoid|rush hoac avoid|muon chot.*doi du|wanted.*immediate.*waited|used the concrete information|xu ly dung muc|responded proportionately|normal pace|du du kien.*moi lam)/,d))return{families:[],sequence:false};
  return{families:[...(base.families||[])],sequence:!!base.sequence};
}
function analyze(raw,domain='other',subtopic=null){
 const base=parent.analyze(raw,domain,subtopic),d=fold(raw),rid=routeRepair(d);
 if(rid){const input_route=routeFrame(rid,base.input_route);return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[],sequence:false,oscillation:false,response_known:false,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_163_V162_V1_SEALED_A_REPAIR',v163:{route:rid,families:[],sequence:false}}};}
 const r=familyRepair(d,base);return{...base,version:VERSION,families:r.families,sequence:r.sequence,oscillation:r.sequence,response_known:r.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_163_V162_V1_SEALED_A_REPAIR',v163:{route:base.input_route?.id,families:[...r.families],sequence:r.sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v12-v163-v162-v1-sealed-a-repair'})};
global.QCSemanticCoreV32=core;global.PSC_V83163=core;
if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.163:v162-v1-sealed-a-repair';
})(typeof globalThis!=='undefined'?globalThis:this);
