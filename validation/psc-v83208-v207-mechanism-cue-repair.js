(function(global){
'use strict';
const parent=global.QCSemanticCoreV76R;if(!parent)throw new Error('V8.3.208 requires V8.3.207 V76R');
const VERSION='V8.3.208-V207-V1-MECHANISM-CUE-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9?\s'-]/g,' ').replace(/\s+/g,' ').trim();
const has=(s,a)=>a.some(x=>s.includes(x));
const groups=(s,gs)=>gs.every(g=>has(s,g));
function frame(id,prev){const redirect=['input:prediction','input:hypothetical-or-example','input:decision-request'].includes(id),clarify=['input:third-party-only','input:clarification-required'].includes(id);return{...(prev||{}),id,action:redirect?'redirect':clarify?'clarify':'continue',must_stop:['input:prediction','input:decision-request'].includes(id),must_redirect:redirect};}
function clarification(d){
  const ending=['final moment','closing','reaches the end','end of the account','end','closing behaviour','closing behavior','doan ket','doan cuoi','chot','ket'];
  const own=['my own','my specific','from me','of mine','my observable','cua rieng toi','cua toi','tu toi'];
  const response=['response','behaviour','behavior','action','move','hanh vi','phan ung','hanh dong'];
  const absent=['not been supplied','absent from the description','absent','missing','not supplied','not described','bo trong','con bo trong','van con bo trong','chua duoc noi','chua duoc mo ta'];
  return groups(d,[ending,own,response,absent]);
}
function decision(d){
  const choose=['choose','pick','chon'];
  const object=['option','route','path','next step','phuong an','huong','buoc'];
  const replace=['replace my decision','replace my own decision','your decision replace','your choice replace','quyet dinh cua ban thay the quyet dinh cua toi','lua chon cua ban thay the lua chon cua toi','thay the quyet dinh cua toi'];
  return groups(d,[choose,object,replace]);
}
function hypothetical(d){
  const constructed=['synthetic','constructed','fabricated','invented','test material','test scenario','scenario was constructed','mau thu nghiem','du lieu tong hop','tinh huong duoc dung len','tinh huong duoc tao'];
  const testing=['test','testing','validation','classification','kiem thu','thu nghiem','phan loai'];
  const nonlived=['rather than an episode i actually experienced','not an episode i actually experienced','nothing here comes from my lived history','not from my lived history','not lived','not something i experienced','khong den tu lich su trai nghiem cua toi','khong phai trai nghiem toi da song qua','khong phai tinh huong toi da trai qua'];
  return groups(d,[constructed,testing,nonlived]);
}
function prediction(d){
  const horizon=['coming weeks','next weeks','weeks ahead','across the coming weeks','vai tuan toi','vai tuan sap toi','trong nhung tuan toi'];
  const future=['headed toward','heading toward','will i','am i headed','co huong toi','co dan den'];
  const outcome=['result','outcome','ket qua','ket cuc'];
  const benefit=['benefits me','benefit me','in my favour','in my favor','good for me','co loi cho toi','thuan loi cho toi'];
  return groups(d,[horizon,future,outcome,benefit]);
}
function neutralCompleted(d){
  const own=['i decided','i chose','my own decision','self-authored','tu dua ra mot quyet dinh','tu dua ra quyet dinh','tu chon','tu quyet'];
  const bounded=['limited','bounded','proportionate','reasonable','gioi han','hop ly'];
  const done=['completed','finished','carried it out','executed','hoan thanh','lam xong','thuc hien'];
  const close=['stopped there','did not review again','did not reopen','did not return','instead of reviewing again','dung o do','khong review lai','khong mo lai','khong quay lai'];
  return groups(d,[own,bounded,done,close]);
}
function sequence(d){
  const approach=['nearly made the move','nearly acted','moved toward action','moved toward acting','tien toi hanh dong','tien ve hanh dong','gan nhu hanh dong'];
  const retreat=['retreated','stepped back','pulled back','backed away','lui ra','lui lai','rut lui'];
  const repeat=['re-entered','reopened','opened again','kept reopening','repeated','several times','cu mo lai','lap lai','lap cung mot vong'];
  const same=['identical evaluation','same evaluation','same reasoning loop','same review','same loop','cung mot vong ly luan','cung mot vong review','cung vong review'];
  const noNew=['without fresh information','without new information','without fresh evidence','data stayed unchanged','facts stayed unchanged','du kien van y nguyen','thong tin khong thay doi','bang chung khong doi'];
  return groups(d,[approach,retreat,repeat,same,noNew]);
}
function freeze(d){
  const trial=['test one small step','small step','small trial','small experiment','mot buoc nho','thu mot buoc nho'];
  const low=['little downside','low downside','low risk','easy to undo','reversible','it mat trai','rui ro thap','de hoan tac'];
  const options=['more options','gathered more options','more alternatives','more possibilities','them phuong an','gom them phuong an','them lua chon'];
  const noStart=['rather than begin','instead of beginning','instead of starting','did not begin','thay vi bat dau','khong bat dau'];
  return groups(d,[trial,low,options,noStart]);
}
function ignore(d){
  const central=['core request','central request','central action','main request','main action','hanh dong trung tam','yeu cau trung tam','viec trung tam'];
  const pending=['remained unanswered','left unanswered','pending','needed my response','awaiting my response','chua phan hoi','van chua phan hoi','cho phan hoi'];
  const divert=['focused on','turned to','shifted to','quay sang','chuyen sang','tap trung vao'];
  const low=['secondary tasks','secondary task','peripheral detail','peripheral details','side detail','side tasks','chi tiet ben le','viec thu yeu','nhiem vu thu yeu'];
  return groups(d,[central,pending,divert,low]);
}
function slow(d){
  const delay=['took a while to respond','took a while before responding','responded after a while','mat mot luc moi phan hoi','mat mot luc de phan hoi'];
  const once=['single time','checked it once','checked once','one check','dung mot lan','kiem mot lan','mot lan'];
  const close=['did not return to the issue','did not return','did not revisit','khong quay lai van de','khong quay lai'];
  return groups(d,[delay,once,close]);
}
function analyze(raw,domain='other',subtopic=null){
  const base=parent.analyze(raw,domain,subtopic),d=fold(raw);let rid=null,fam=null;
  if(hypothetical(d))rid='input:hypothetical-or-example';
  else if(clarification(d))rid='input:clarification-required';
  else if(decision(d))rid='input:decision-request';
  else if(prediction(d))rid='input:prediction';
  else if(neutralCompleted(d))fam={families:[],sequence:false};
  else if(sequence(d))fam={families:['slow'],sequence:true};
  else if(freeze(d))fam={families:['freeze'],sequence:false};
  else if(ignore(d))fam={families:['ignore'],sequence:false};
  else if(slow(d))fam={families:['slow'],sequence:false};
  if(!rid&&!fam)return base;
  if(!rid&&base.input_route&&base.input_route.id!=='input:self-lived')return base;
  const route=rid||'input:self-lived',input_route=frame(route,base.input_route),families=rid?[]:fam.families,seq=rid?false:fam.sequence;
  return{...base,version:VERSION,input_route,can_continue:input_route.action==='continue',must_stop:!!input_route.must_stop,must_redirect:!!input_route.must_redirect,families:[...families],sequence:!!seq,oscillation:!!seq,response_known:families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_208_V207_V1_MECHANISM_CUE_REPAIR'}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v50-v208-v207-mechanism-cue-repair'})};global.QCSemanticCoreV77=core;global.PSC_V83208=core;
})(typeof globalThis!=='undefined'?globalThis:this);
