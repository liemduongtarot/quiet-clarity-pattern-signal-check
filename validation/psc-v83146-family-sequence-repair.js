(function(global){
'use strict';
const parent=global.QCSemanticCoreV15R;if(!parent)throw new Error('V8.3.146 family repair requires route repair');
const VERSION='V8.3.146-BOUNDED-FAMILY-SEQUENCE-REPAIR';
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[’‘]/g,"'").toLowerCase().replace(/\s+/g,' ').trim();
const uniq=a=>[...new Set(a||[])],has=(r,s)=>r.test(s);
function repair(raw,base){
 if(base.input_route?.id!=='input:self-lived')return{families:[],sequence:false};
 const doc=fold(raw);let families=uniq(base.families||[]),sequence=!!base.sequence;
 const inheritedV144=uniq(base.canonical_shadow?.v144?.families||[]);
 const inheritedV144Sequence=!!base.canonical_shadow?.v144?.sequence;
 const v145SuppressionState=
   has(/(?:last year|months ago|previously|used to|old issue|belonged to the past|thuoc ve giai doan truoc|giai doan truoc|truoc day|truoc do|da tung).{0,170}(?:stopped|ended|no longer|not happening now|ceased|has since ceased|khong con|da dung|da het|hien tai toi khong con|gio da dung hoan toan)/,doc)
   ||has(/(?:frustrated|disappointed|upset|unhappy|lo|buon|that vong|kho chiu).{0,140}(?:no .{0,25}(?:behavio(?:u)?ral response|action|checking|avoidance|rushing|freezing)|not a description of any|only an emotional reaction|khong co hanh dong|khong co phan ung)/,doc)
   ||has(/(?:no checking|no repeated review|no postponement|no rushing|no freezing|not a description of any checking or avoidance|no behavioural response at all|no action pattern is stated|khong co hanh dong kiem tra lap|khong co .{0,50}(?:tri hoan|voi|freeze))/,doc)
   ||has(/(?:hmrc|authority|provider|system|portal|third party|external|co quan|he thong|ben ngoai|don vi khac|ben thu ba).{0,120}(?:had not issued|had not supplied|had not provided|not issued|not supplied|not provided|missing|dependency|delayed|held the process up|chua cap|chua cung cap|thieu ma|thieu).{0,160}(?:not because i|not due to|was ready to continue|once .{0,35} arrived|completed my own step|delay was not caused by me|khong phai do toi|toi da san sang)/,doc)
   ||has(/(?:checked|reviewed).{0,40}(?:once).{0,100}(?:corrected one typo|corrected a typo|fixed one typo|submitted|sent|completed|finished)/,doc)
   ||has(/(?:normally|normal sequence|ordinary sequence|ordinary way|on schedule|on time|dung thoi gian|dung han|nhu thuong).{0,90}(?:submit|sent|completed|finished|xu ly|nop)/,doc);
 const explicitIgnore=has(/(?:\bavoided\b|\bavoiding\b|\bpostponed\b|\bpostpone\b|put(?:ting)? .{0,22}(?:off|aside|to one side)|deliberately ignored|intentionally ignored|\bne\b|\btri hoan\b(?!\s+bat dau)|\bbo qua\b|\bde lai\b)/,doc)
   ||has(/(?:instead of|rather than|thay vi).{0,150}(?:unrelated|low-priority|minor task|unimportant|old emails|spreadsheet|downloads folder|viec phu|thu muc).{0,150}(?:avoid|postpone|delay|chua phai|de ne|ne viec|xu ly viec chinh|deal with the main|start)/,doc);
 const explicitFast=has(/(?:within minutes|almost immediately|too quickly|qua nhanh|trong vai phut|gan nhu ngay lap tuc|voi vang|voi chot|voi xac nhan|sat cuoi|sat han|last minute).{0,130}(?:decid|select|choose|confirm|submit|send|booking|authoris|sign|finish|complete|quyet dinh|chon|xac nhan|gui|chot|booking)/,doc)
   ||has(/(?:decid|select|choose|confirm|submit|send|booking|authoris|sign|finish|finished|complete|completed|quyet dinh|chon|xac nhan|gui|chot).{0,90}(?:within minutes|almost immediately|too quickly|qua nhanh|trong vai phut|gan nhu ngay lap tuc|sat cuoi|sat han|last minute)/,doc);
 const explicitFreeze=has(/(?:froze|freeze|frozen|got stuck|became stuck|stuck at|could not start|couldn't start|could not begin|couldn't begin|bi ket|dung hinh|dung lai|khong the bat dau|khong bat dau duoc)/,doc)
   ||has(/(?:cannot choose|can't choose|unable to choose|khong chon duoc|khong the chon).{0,55}(?:first step|buoc dau tien|buoc dau).{0,90}(?:reasonable options|several reasonable options|vai lua chon hop ly|nhung lua chon hop ly)/,doc)
   ||has(/(?:gac viec|tri hoan viec|de lai viec).{0,35}(?:chon|quyet dinh).{0,45}(?:buoc tiep theo|phuong an).{0,120}(?:phuong an|lua chon).{0,70}(?:rui ro|risk)/,doc)
   ||has(/(?:put off|delay|defer).{0,35}(?:choosing|deciding).{0,55}(?:next step|option).{0,120}(?:every option|options).{0,70}(?:risky|risk)/,doc);
 const explicitAdaptive=has(/(?:new|updated|revised|corrected|genuine|real update|material update|thong tin moi|du kien moi|du lieu moi|so lieu moi|cap nhat|sua).{0,140}(?:adjust|adapt|changed|corrected|updated|doi cach|dieu chinh|xu ly theo)/,doc)
   ||has(/(?:adjust|adjusted|adapt|adapted|changed|corrected|updated|doi cach|dieu chinh).{0,130}(?:new|updated|revised|corrected|evidence|information|data|facts|thong tin|du kien|du lieu|so lieu)/,doc);
 const explicitSlow=has(/(?:reopen|recheck|kept checking|repeatedly check|repeatedly review|xem di xem lai|xem lai nhieu lan|kiem tra lap|kiem tra lai|quay lai).{0,120}(?:unchanged|same|nothing new|no new|not changed|y nguyen|khong doi|van khong co thong tin moi|same status|same page|same information)/,doc)
   ||has(/(?:unchanged|same|nothing new|no new|not changed|y nguyen|khong doi|van khong co thong tin moi).{0,120}(?:reopen|recheck|check|review|quay lai|kiem tra|xem lai)/,doc)
   ||has(/(?:xem di xem lai|xem lai nhieu lan|kiem tra lap|lap di lap lai|repeated review|repeatedly check|repeatedly review|kept checking|kept rechecking|kiem tra rat lau|check for a long time)/,doc)
   ||has(/(?:kiem tra them|check(?:ing)? more|keep checking).{0,100}(?:tri hoan bat dau|delay starting|delay getting started|delay the start)/,doc);
 const explicitSet=[];
 if(explicitSlow)explicitSet.push('slow');
 if(explicitFreeze)explicitSet.push('freeze');
 if(explicitIgnore)explicitSet.push('ignore');
 if(explicitFast)explicitSet.push('fast');
 if(explicitAdaptive)explicitSet.push('adaptive');
 if(v145SuppressionState)families=[];
 else if(explicitSet.length)families=uniq(explicitSet);
 else if(inheritedV144.length)families=uniq(inheritedV144);
 if(!v145SuppressionState&&!explicitSet.length&&inheritedV144Sequence&&families.length>=2)sequence=true;
 const comparisonOnly=has(/(?:doi chieu|so sanh|compare|cross-check)/,doc)
   && !has(/(?:new evidence|new information|new data|material update|genuine update|real update|updated facts|revised facts|thong tin moi|du kien moi|du lieu moi|so lieu moi|cap nhat that su|ban sua chinh thuc|quy trinh moi).{0,140}(?:adjust|adapt|changed approach|changed course|dieu chinh|doi cach|thich nghi)/,doc)
   && !has(/(?:adjust|adjusted|adapt|adapted|changed approach|changed course|dieu chinh|doi cach|thich nghi).{0,140}(?:new|updated|revised|evidence|information|data|facts|thong tin|du kien|du lieu|so lieu|cap nhat)/,doc);
 if(comparisonOnly&&families.includes('adaptive'))families=families.filter(x=>x!=='adaptive');
 const busyAvoidance=has(/(?:thay vi|instead of|rather than).{0,150}(?:ban minh|kept myself busy|stayed busy|organising old emails|organizing old emails|old emails|viec phu|unrelated work).{0,150}(?:chua phai|khong phai|avoid|not have to|defer|delay|xu ly viec chinh|deal with the main|touch the main)/,doc)
   || has(/(?:ban minh|kept myself busy|stayed busy).{0,120}(?:organising old emails|organizing old emails|old emails|viec phu|unrelated work).{0,120}(?:de chua phai|so i would not have to|so i didn't have to|avoid).{0,90}(?:xu ly|deal with|touch|start)/,doc)
   || has(/(?:kept putting|putting|put).{0,80}(?:aside|to one side).{0,120}(?:then|later|afterward|after that|eventually|finally)/,doc);
 const intentionalNonEngagement=has(/(?:i|toi|minh).{0,40}(?:leave|left|keep|kept|de|bo).{0,55}(?:message|email|notification|tin nhan|thu).{0,45}(?:unopened|unread|chua mo|khong mo).{0,45}(?:on purpose|deliberately|intentionally|co y)/,doc);
 const prematureDecisionBeforeReview=has(/(?:i|toi|minh).{0,35}(?:choose|chose|select|selected|decide|decided|commit|committed|chon|lua chon|quyet dinh|chot).{0,90}(?:before|truoc khi).{0,90}(?:review|reviewing|check|checking|compare|comparing|xem|kiem tra|doi chieu|so sanh).{0,90}(?:relevant details|details|relevant information|information|facts|thong tin lien quan|thong tin|du kien)/,doc);
 const sufficientInfoParalysis=has(/(?:i|toi|minh).{0,45}(?:remain|still|van|cu).{0,35}(?:unable to choose|unable to decide|cannot choose|can't choose|cannot decide|can't decide|khong the chon|khong chon duoc|khong the quyet dinh|khong quyet duoc).{0,90}(?:despite|even though|although|du|mac du).{0,45}(?:enough information|sufficient information|enough details|du thong tin|thong tin da du)/,doc);
 const reasonableOptionsParalysis=has(/(?:i|toi|minh).{0,35}(?:cannot choose|can't choose|unable to choose|khong chon duoc|khong the chon).{0,55}(?:first step|buoc dau tien|buoc dau).{0,90}(?:despite|even though|although|du|mac du).{0,55}(?:reasonable options|several reasonable options|vai lua chon hop ly|nhung lua chon hop ly)/,doc);
 if((busyAvoidance||intentionalNonEngagement)&&!families.includes('ignore'))families.push('ignore');
 if(prematureDecisionBeforeReview&&!families.includes('fast'))families.push('fast');
 if((sufficientInfoParalysis||reasonableOptionsParalysis)&&!families.includes('freeze'))families.unshift('freeze');
 families=uniq(families);
 const ordered=has(/(?:then|later|afterward|after that|eventually|finally|roi|sau do|roi sau do|cuoi cung)/,doc);
 if(families.length>=2&&ordered)sequence=true;
 const adaptiveOnlyTransition=families.length===1&&families[0]==='adaptive'&&!!base.sequence;
 if(families.length<2&&!adaptiveOnlyTransition)sequence=false;
 if(adaptiveOnlyTransition)sequence=true;
 return{families,sequence};
}
function analyze(raw,domain='other',subtopic=null){
 const base=parent.analyze(raw,domain,subtopic),r=repair(raw,base);
 return{...base,version:VERSION,families:r.families,sequence:r.sequence,oscillation:r.sequence,response_known:r.families.length>0,canonical_shadow:{...(base.canonical_shadow||{}),difference_classification:'V8_3_146_BOUNDED_REPAIR',v146:{route:base.input_route?.id,families:[...r.families],sequence:r.sequence}}};
}
const core={...parent,version:VERSION,analyze,inputRoute:raw=>analyze(raw).input_route,schema:Object.freeze({...parent.schema,canonicalSemanticState:'css-proposal-v8-v146-bounded-repair'})};
global.QCSemanticCoreV15=core;global.PSC_V83146=core;if(global.document&&global.document.documentElement)global.document.documentElement.dataset.pscSemanticAuthority='V8.3.146:bounded-repair';
})(typeof globalThis!=='undefined'?globalThis:this);